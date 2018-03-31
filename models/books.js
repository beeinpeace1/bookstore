var mongoose = require('mongoose');

var BookSchema = mongoose.Schema({
    title: {
        type: String,
        index: true
    },
    author: {
        type: String,
    },
    desc: {
        type: String,
    },
    price: {
        type: String,
    },
    image_path: {
        type: String
    }
});

module.exports = mongoose.model('Book', BookSchema);