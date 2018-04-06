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
    },
    no_of_views:{
        type: Number
    },
    fav_count:{
        type: Number
    },
    edition: {
        type: String,
    },
    isbn: {
        type: String,
    },
    category: {
        type: String,
    },
    total_number_of_books: {
        type: Number,
    }
});

module.exports = mongoose.model('Book', BookSchema);