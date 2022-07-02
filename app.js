require('dotenv').config();

const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

// ---------------------------------------------------------------

// JSON.stringify turns a JavaScript object into JSON text and stores that JSON text in a string
// JSON.parse turns a string of JSON text into a JavaScript object

// by using the bodyparser we are able to parse http request that we get
// by using urlencoded we can get form data
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("static"));

// -------------------------------------------------------------------------------------------------------------------


app.use(session({
    secret: 'This is our secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

api_id = process.env.API_KEY

mongoose.connect('mongodb+srv://itzm416:' + api_id + '@atlascluster.lzcliin.mongodb.net/userDB', { useNewUrlParser: true })


// -----------------------------------------------------------

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    secret: String
});

// it is used to hash and salt the password
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('user_collection', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------------------------------------------------------------------------------------

app.get("/", function (req, res) {
    
    res.render('home');
    
});

app.get("/register", function (req, res) {
    
    if (!req.isAuthenticated()){
        res.render('register');
    } else {
        res.redirect('secrets');
    }
    
});

app.get("/secrets", function (req, res) {
    
    if (req.isAuthenticated()){

        User.find( {'secret':{$ne:null}}, function(err, founduser){
            if(err){
                console.log();
            } else {
                if (founduser){
                    res.render('secrets', {s:founduser})
                }
            }
        })

    } else {
        res.redirect('login')
    }
    
});

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()){
        res.render('submit');
    } else {
        res.redirect('login')
    }
});

app.get("/login", function (req, res) {
    
    if (!req.isAuthenticated()){
        res.render('login');
    } else {
        res.redirect('secrets');
    }
    
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

app.post("/submit", function (req, res) {

    User.findById(req.user.id, function(err, founduser){
        if(err){
            console.log(err);
        } else {
            if(founduser){
                founduser.secret = req.body.secret;
                founduser.save()
                res.redirect('/secrets')
            }
        }
    })
    
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('secrets');
});

app.post("/register", function (req, res) {

    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log('user already exist');
            res.render('register');
         } else {
            console.log('created');
            res.redirect('login');
         }
      
      });
   
  });

// ---------------------------------------

app.listen(process.env.PORT || 3000, function () {
    console.log("server is on 3000 port");
});
