var User = require('./../../models/users');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'resistancet9@gmail.com',
      pass: 'pe@cheS9122'
    }
});

module.exports = function(reqEx, resEx, next) {
    const username = reqEx.body.username || '';
    const email = reqEx.body.email || '';
    const password = reqEx.body.password || '';
    const profile_picture = reqEx.body.profile_picture || '';

    // profile picture details 
    if(reqEx.files.length){
        var originalFilename = reqEx.files[0].originalname || 'of.png';
        var mime = reqEx.files[0].mime || 'png';
        var filename = reqEx.files[0].filename || 'filename';
        var path = reqEx.files[0].path || 'path';
    }

    const UserDetails = {
        username: username,
        email: email,
        password: password,
        name: username,
        profile_image: path || 'uploads/default.png'
    }

    global.users = {};
    global.users.email = email;
    global.users.otp = Math.floor(100000 + Math.random() * 900000);
    global.users.data = UserDetails;

    var mailOptions = {
        from: 'resistancet9@gmail.com',
        to: global.users.email,
        subject: 'Book Store: E-mail verification!',
        text: `Name: ${username} \n` + `Code: ` + global.users.otp
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          resEx.render('includes/users/email_verify', { path: '', title: 'Book Store'});
        }
    });
}