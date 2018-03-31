var mongoose = require('mongoose');

var AdminSchema = mongoose.Schema({
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String,
        unique : true,
        required : true
    }
});

module.exports = mongoose.model('Admin', AdminSchema);