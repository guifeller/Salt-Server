const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin = require('./models/admins');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

//The secretkey is to be written as is in the config.js file
exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey,
        {expiresIn: '24h'});
};

exports.local = passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

passport.use("owner-rule", new JwtStrategy(opts,
    (jwt_payload, done) => {
        Admin.findOne({_id: jwt_payload._id}, (err, admin) => {
            if (err) {
                return done(err, false);
            }
            else if (admin === null) {
                let err = new Error("Unauthorized");
                err.statusCode = 401;
                return done(err, false);
            }
            else if (admin.owner) {
                //Only an owner can add or remove extensions
                return done(null, admin);
            }
            else {
                return done(null, false);
            }
        });
    }));


passport.use("admin-rule", new JwtStrategy(opts,
    (jwt_payload, done) => {
        Admin.findOne({_id: jwt_payload._id}, (err, admin) => {
            if (err) {
                return done(err, false);
            }
            else if (admin) {
                //Any user can send requests to the server so we don't need to check whether the user is the owner of the server or not.
                return done(null, admin);
            }
            else {
                return done(null, false);
            }
        });
    }));


exports.verifyOwner = passport.authenticate('owner-rule', {session: false});
exports.verifyAdmin = passport.authenticate('admin-rule', {session: false});