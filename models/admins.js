const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema = new Schema({

    owner: {
        type: Boolean,
        default: false
    },

    analyzer: {
        type: Boolean,
        default: false,
        required: true
    }

});

adminSchema.plugin(passportLocalMongoose);


let Admins = mongoose.model('Admin', adminSchema);

module.exports = Admins;