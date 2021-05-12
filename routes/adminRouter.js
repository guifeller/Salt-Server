const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authenticate = require('../authenticate');
const Admin = require('../models/admins');

const adminRouter = express.Router();
adminRouter.use(bodyParser.json());


adminRouter.post('/login', passport.authenticate('local'), (req, res) => {
    let token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You successfully logged in'});
});

adminRouter.post('/registerAnalyzer', authenticate.verifyOwner, (req, res, next) => {

    // Registers Analyzers

    Admin.find({analyzer: true})
    .then((analyzer) => {
        if(analyzer.length > 0) {
            let err = new Error('An analyzer has already been registered.');
            err.statusCode = 403;
            throw err;
        }
    })
    .then(() => {
        Admin.register(new Admin({username: req.body.username}), req.body.password, (err, analyzer) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else {
                analyzer.analyzer = true;
                analyzer.save((err, analyzer) => {
                    if(err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: "Analyzer succesfully registered"});
                    }
                });
            }
        });
    })
    .catch((err) => next(err));
});


adminRouter.post('/registerOwner', (req, res, next) => {

    // Registration of the first user of the database. By default, it is the owner of the database.    
    
    Admin.find({analyzer: false})
    .then((ans) => {
        
        // We make sure that this account is the first to be created on the database. If not, an error is returned 

        if(ans.length > 0) {
            let err = new Error('An owner has already been registered');
            err.statusCode = 403;
            throw err;
        }
    })
    .then(() => {
        Admin.register(new Admin({username: req.body.username}), req.body.password, (err, admin) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else {
                admin.owner = true; // This administrator is made the owner of the database
                admin.save((err, user) => {
                    if(err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: "Account succesfully registered"});
                    }
                });
            }
        });
    })
    .catch((err) => next(err));
});

adminRouter.post('/registerUser', authenticate.verifyOwner, (req, res, next) => {

    // Registers normal users

    Admin.register(new Admin({username: req.body.username}), req.body.password, (err, admin) => {
        if(err) {
            let err = new Error('Impossible to register this user');
            err.statusCode = 403;
            res.json(err)
            throw err;
        }
        else {
            //We make sure that this user is not accidentally registered as an owner of the database.
            admin.owner = false;
            admin.save((err, user) => {
                if(err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: "Account succesfully registered"});
                }
            });
        }
    });
});

adminRouter.get('/userList', authenticate.verifyAdmin, (req, res) => {

    // Returns the list of available users

    Admin.find({analyzer: false})
    .then((results) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(results);
    })
    .catch((err) => next(err));
});

adminRouter.get('/analyzer', authenticate.verifyAdmin, (req, res) => {
    // Returns the Analyzer
    Admin.find({analyzer: true})
    .then((result) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(result);
    })
    .catch((err) => next(err));
});

adminRouter.delete('/delete/:accountId', authenticate.verifyOwner, (req, res, next) => {

    // Deletes an account

    Admin.findById(req.params.accountId)
    .then((user) => {
        // We make sure that the user is not trying to delete itself
        if(user.owner == true) {
            let err = new Error('Cannot delete the owner');
            err.statusCode = 400;
            throw err;
        }
    })
    .then(() => {
        Admin.findByIdAndDelete(req.params.accountId)
        .then((del) => {
            console.log(req.params.accountId + ' removed from the database');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.send('User number ' + req.params.accountId + ' successfully removed from the database');
        }) 
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

adminRouter.delete('/analyzer/:accountId', authenticate.verifyOwner, (req, res, next) => {

    // Deletes an analyzer
    Admin.findByIdAndDelete(req.params.accountId)
    .then((del) => {
        console.log(req.params.accountId + ' removed from the database');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.send('Analyzer number ' + req.params.accountId + ' successfully removed from the database');
    }) 
    .catch((err) => next(err));
});

module.exports = adminRouter;