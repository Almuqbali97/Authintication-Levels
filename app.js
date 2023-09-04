// there are some notes at the bottom
// 09 / 02 / 2023 => by Musaab almuqbali
import 'dotenv/config' // good practice to put it at the top
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import encrypt from 'mongoose-encryption';
// import md5 from 'md5'; we use bcrypt instead
// import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';


// consts
// const saltRounds = 10; // how many salt round we need to do to our password hashing
const app = express();
const PORT = process.env.PORT;
const dbURL = 'mongodb://localhost:27017/';
const dbName = 'userDB';
const encrytionSecret = process.env.SECRET_KEY;

//midllewares
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));
// using express-session module and setting our options
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
// using the passport module
app.use(passport.initialize());
// setting the session with passport
app.use(passport.session());

//connecting to the db
try {
    await mongoose.connect( dbURL + dbName, {family:4});
} catch (error) {
    console.error(message.error);
}

// creating schema for the users data
const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});
//plugging the passport-local to our data schema, we cloul do this without the passport local mongoose useing the passport module, see docs
UserSchema.plugin(passportLocalMongoose);

// crerating data model
const User = mongoose.model('users', UserSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// before creating the model its important to use the encrytion plugin before the model
// UserSchema.plugin(encrypt, {secret: encrytionSecret, encryptedFields: ['password']}); now this is commented to use hash only

// routing
// home
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// login
app.get('/login', (req, res) => {
    res.render('login.ejs');
});


// logging out and going back home
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } 
    res.redirect('/');
            
        
    });
});

// registration page (get)
app.get('/register', (req, res) => {    
    res.render('register.ejs');
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets.ejs');
    } else {
        res.redirect('/login');
    }
})

// exisitng user loggign page
app.post('/login', async (req, res) => {
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })
});

// register new user (post)
app.post('/register', (req, res) => {
    //regestring user name and password usign passport local mongooses package, this will make the hash and salt for us
    User.register({username: req.body.username}, req.body.password, (err, newUser) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
});



//server port
app.listen(PORT, () => {
   console.log(`server is running on port ${PORT}`); 
});




// important note, for each security level step i add, the previous one wont work in some cases,
// for example when i added the encrytipn to the password, the basic auth method dosnt work with same code
// because the previous password doesnt have encrytion tobe decrypted
// security levels

// level 1 : basic auth creating a username and a passowrd and store them in our db adn compare the to user inputs 
// user: user@basic, pass: basic123

// level 2 : encrypting the password, i used mongoose-encryption np
// user : user@encrypt, pass: encrypt123

// level 3 : hashing the password using md5 package 
// user: user@hash, password hash123

// level 4 : salting the has using bcrypt
// user user@salt pass: salt123