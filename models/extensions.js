const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const extensionSchema = new Schema({
    fileName: {
        type: String,
        required: true
    },
    
    commandWord: {
        type: String,
        required: true
    },

    parameters: [{
        type: String,
        required: false
    }],

    options: [{
        type: String,
        required: false
    }]
});

let Extensions = mongoose.model('Extension', extensionSchema);

module.exports = Extensions;