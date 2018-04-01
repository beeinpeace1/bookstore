var express = require('express');
var router = express.Router();
var API = require('./../models/dbapis');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Admin = require('./admin/index');

/* GET home page. */
router.get('/', ensureAuth, function(req, res, next) {
  API.getAllBooks((books)=>{
    res.render('index', { path: 'home', title: 'Book Store', books: books});
  })
});

// GET Sign up page
router.get('/signup', function(req, res, next) {
  res.render('includes/signup/signup', { path: 'signup', title: 'Book Store'});
});

// POST /signup
router.post('/signup', function(req, resEx, next) {
  const username = req.body.username || '';
  const email = req.body.email || '';
  const password = req.body.password || '';
  const profile_picture = req.body.profile_picture || '';

  const UserDetails = {
      username: username,
      email: email,
      password: password,
      name: username,
      isAdmin: false
  }

  API.saveUserToDB(UserDetails, (err, res) => {
    if(err) {
        console.log(err);
        resEx.render('includes/misc/intermediate.ejs', {title: 'Error', path: 'intermediate', class: 
        "fas fa-times-circle fa-5x", message: "Failed"})
    }

    if(!err && res) {
        resEx.render('includes/misc/intermediate.ejs', {title: 'Success', path: 'intermediate', class: 
        "fas fa-check-circle fa-5x", message: "Sucess"})
    }
});
});

// GET Log in page
router.get('/login', function(req, res, next) {
  req.session.isAdmin = false;
  res.render('includes/login/login', { path: 'login', title: 'Book Store'});
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  API.getUserByID(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
  function( username, password, done) {
    API.getUserByName(username, function(err, user) {
      if(user.isAdmin) {
        console.log("Admin Cant log in to user section");
        return done(null, false, {message: "Admin User!"});
      }
      if(err){
        console.log(err.message);
      }
      if(!user) {
        console.log("unknown user");
        return done(null, false, {message: "Unknown User!"});
      }

      API.comparePassword(password, user.password, function(err, flag) {
        if(err) {
          console.log(err.message);
        }
        if(flag) {
          console.log("authenticated!");
          return done(null, user);
        } else {
          console.log("Invalid password!");
          return done(null, false, {message: "Invalid password!"});
        }
      })
    })
  }
))

function ensureAuth(req, res, next) {
  if(req.isAuthenticated() && req.session.isAdmin == false){
    return next();
  } else {
    res.redirect('/login');
  }
}

// post for user searchterms 
router.post('/user/search', ensureAuth, function(reqEx, resEx, nexy){
  API.getAllBooks((books)=>{
    var newbooks = books.filter(o=> o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('index', { path: 'home', title: 'Book Store', books: newbooks});
  })
})

// post for admin searchterms 
router.post('/admin/search', Admin.ensureAdminCheck, function(reqEx, resEx, nexy){
  API.getAllBooks((books)=>{
    var newbooks = books.filter(o=> o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('admin/listbooks.ejs', {path: 'admin', title: 'Admin Dashboard', books: newbooks})
  })
})

// post for user searchterms 
router.post('/guest/search', function(reqEx, resEx, nexy){
  API.getAllBooks((books)=>{
    var newbooks = books.filter(o=> o.title.toLowerCase().indexOf(reqEx.body.searchdata.toLowerCase()) >= 0);
    resEx.render('includes/guests/guest.ejs', { path: 'guest', title: 'Book Store', books: newbooks});
  })
})

// POST /login
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res, next) {
  req.session.isAdmin = false;
  res.redirect('/');
});

// GET logout
router.get('/logout', ensureAuth, function(req, res, next) {
  req.logout();
  res.redirect('/login');
  req.session.cart = [];
});

// GET logout
router.get('/guest', function(req, res, next) {
  API.getAllBooks((books)=>{
    res.render('includes/guests/guest.ejs', {title: 'Book Store', path: 'guest', books: books});
  })
});

router.get('/guest/show/:id', function(req, res, next) {
  var id = req.params.id;
  if(id){
    API.getBookById(id, (err, book) => {
      if(book)
        res.render('includes/guests/guest_show.ejs', {title: 'Book Store', path: 'guest', book: book});
    })
  }
});

// GET book show
router.get('/book/show/:id', ensureAuth, function(req, res, next) {
  var id = req.params.id;
  if(id){
    API.getBookById(id, (err, book) => {
      if(book)
        res.render('includes/books/show.ejs', {title: 'Book Store', path: '', book: book});
      else
      res.render('includes/books/not_found.ejs', {title: 'Book Store', path: '', book: []});
    })
  }
});

// GET remove book from cart
router.get('/cart/remove/:id', ensureAuth, function(req, res, next) {
  var id = req.params.id;
  var cart = req.session.cart || 0;
  if(cart.length){
      var index = cart.findIndex(o => o._id == id);
      req.session.cart.splice(index, 1);
  }
  res.redirect('/cart')
});

// GET logout
router.get('/cart', ensureAuth, function(req, res, next) {
  const cart = req.session.cart || [];
  res.render('includes/books/cart.ejs', {title: 'Book Store', path: '', books: cart});
});

router.post('/cart/add/:id', ensureAuth, (req, res, next) => {
  req.session.cart = req.session.cart || [];
  const id = req.params.id;
  if(id){
    API.getBookById(id, (err, book) => {
      if(book){
        req.session.cart.push(book)
      }
      res.json({total: req.session.cart.length || 0})
    })
  }
})


//  admin part

router.get('/admin', function (req, res, next) {
  res.render('admin/login.ejs', { title: "Admin Page", path: 'admin' })
});

router.get('/admin/logout', function (req, res, next) {
  if(req.session.isAdmin){
    req.session.isAdmin = false;
  }
  res.redirect('/admin');
});

router.post('/admin/login', Admin.ensureAdmin, function (req, res, next) {
  res.redirect('/admin/listbooks')
});

router.get('/admin/listbooks', Admin.ensureAdminCheck, function (req, res, next) {
  API.getAllBooks(function(books){
    res.render('admin/listbooks.ejs', {path: 'admin', title: 'Admin Dashboard', books: books})
  })
});

router.get('/admin/edit/:id', Admin.ensureAdminCheck, function (req, res, next) {
  var id = req.params.id;
  if(id){
    API.getBookById(id, (err, book) => {
      if(book)
        res.render('admin/editbook.ejs', {title: 'Book Store', path: 'admin', book: book});
    })
  }
});

router.get('/admin/add/', Admin.ensureAdminCheck, function (req, res, next) {
      res.render('admin/addbook.ejs', {title: 'Book Store', path: 'admin'});
});

router.post('/admin/add/', Admin.ensureAdminCheck, function (req, res, next) {
  const title = req.body.title || "no title available";
  const desc = req.body.descBook || "no desc available";
  const price = req.body.price || 0;
  const author = req.body.author || "no author found";
  const bookid = req.body.bookid || null;
  const mime = req.files[0] ? req.files[0].mimetype.split('/')[1] : 'png';
  const filename = req.files.length ? "/images/" + req.files[0].filename : '/images/defaultImage';

  const updateBookDetails = {
    title: title,
    desc: desc,
    price: price,
    author: author,
    image_path: filename
  };

  API.saveBookToDB(updateBookDetails, (updatedBook) => {
    if(updatedBook){
      res.redirect('/admin/listbooks');
    }
  })
});

router.post('/admin/delete', Admin.ensureAdminCheck, function (req, res, next) {
  const bookid = req.body.bookid;
  if(bookid){
    API.removeBook(bookid, (book) => {
      if(book)
        res.redirect('/admin/listbooks')
    })
  }
});

router.post('/admin/edit/', Admin.ensureAdminCheck, function (req, res, next) {

  const title = req.body.title || "no title available";
  const desc = req.body.descBook || "no desc available";
  const price = req.body.price || 0;
  const author = req.body.author || "no author found";
  const bookid = req.body.bookid || null;
  const mime = req.files[0] ? req.files[0].mimetype.split('/')[1] : 'png';
  var currentBook = {};
  API.getBookById(bookid, (err, book) => {
    if(book){
      currentBook = book;

      const filename = req.files.length ? "/images/" + req.files[0].filename : ( currentBook.image_path ? currentBook.image_path: '/images/defaultImage');
  
      const updateBookDetails = {
        title: title,
        desc: desc,
        price: price,
        author: author,
        image_path: filename
      };
    
      API.updateBook(bookid, updateBookDetails, (updatedBook) => {
        res.render('admin/showbook.ejs', {title: 'Book Store', path: 'admin', book: updatedBook});
      })  
    }
  })
});

module.exports = router;
