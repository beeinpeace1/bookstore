var express = require('express');
var router = express.Router();
var login = require('./users/login');
var signup = require('./users/signup');
var API = require('./../models/dbapis');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

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
router.post('/signup', function(req, res, next) {
  signup(req, res, next);
});

// POST OTP verification
router.post('/verify', function(reqEx, resEx, next) {
  const fromMail = global.users.otp;
  const entered = reqEx.body.otp;
  UserDetails = global.users.data;

  if(fromMail == entered){
    API.saveUserToDB(UserDetails, (err, res) => {
        if(err) {
            console.log(err);
            if(err.code == 11000){
              resEx.redirect('/signup');
            }
        }

        if(!err && res) {
            resEx.redirect('/');
        }
    });
  } else {
    resEx.redirect('/signup');
  }
});

// GET Log in page
router.get('/login', function(req, res, next) {
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
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

// POST /login
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res, next) {
  res.redirect('/');
});

// GET logout
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/login');
  req.session.cart = [];
});

// GET logout
router.get('/guest', function(req, res, next) {
  API.getAllBooks((books)=>{
    res.render('includes/guests/guest.ejs', {title: 'Book Store', path: '', books: books});
  })
});

router.get('/guest/show/:id', function(req, res, next) {
  var id = req.params.id;
  if(id){
    API.getBookById(id, (err, book) => {
      if(book)
        res.render('includes/guests/guest_show.ejs', {title: 'Book Store', path: '', book: book});
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
module.exports = router;
