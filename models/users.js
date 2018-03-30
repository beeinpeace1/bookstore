var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bookstore');

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String,
        unique : true,
        required : true
    },
    name: {
        type: String
    },
    profile_image: {
        type: String
    }
});

module.exports = mongoose.model('User', UserSchema);