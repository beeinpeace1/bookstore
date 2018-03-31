var express = require('express');
var router = express.Router();
var API = require('./../../models/dbapis');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('admin/login.ejs', {title: "Admin Page", path: 'admin'})
});

module.exports = router;