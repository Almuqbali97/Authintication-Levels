// there are some notes at the bottom
// 09 / 02 / 2023 => by Musaab almuqbali
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import 'dotenv/config'
import encrypt from 'mongoose-encryption';

// consts
const app = express();
const PORT = process.env.PORT;
const dbURL = 'mongodb://localhost:27017/';
const dbName = 'userDB';
const encrytionSecret = process.env.secretKey;

//midllewares
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}));

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

// before creating the model its important to use the encrytion plugin before the model
UserSchema.plugin(encrypt, {secret: encrytionSecret, encryptedFields: ['password']});

// crerating data model
const User = mongoose.model('users', UserSchema);

// routing
// home
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// login
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// exisitng user loggign page
app.post('/login', async (req, res) => {
    // getting the user infor form the body request
    const username = req.body.username;
    const password = req.body.password;

    // now we check this info against our db
    try {
        const foundUser = await User.findOne({email:username}); // thie will search 
        // console.log(foundUser.email);
        // console.log(foundUser.password);
        if((foundUser.email === username) && (foundUser.password === password) ) {
            res.render('secrets.ejs')
        }else {
            res.send('user not found or passowrd not correct')
        }
    } catch (error) {
        console.log(message.error);
        res.send(error)
    }
});


// registration page (get)
app.get('/register', (req, res) => {    
    res.render('register.ejs');
});

// register new user (post)
app.post('/register', (req, res) => {
    // to register a user with email and password, first we got those from the form
    const username = req.body.username; // this will get the email
    const password = req.body.password; // this will get the password

    // now we save the user info to the db
    const newUser = new User({
        email: username,
        password: password
    });
    // saving the user info
    try {
        newUser.save();
        // so if there is no registration error the secret page will be shown
        res.render('secrets.ejs');
    } catch (error) {
        console.error(message.error);
        res.send(error);        
    }
});

// logging out and going back home
app.get('/logout', (req, res) => {
    res.redirect('/');
});


//server port
app.listen(PORT, () => {
   console.log(`server is running on port ${PORT}`); 
});



// security levels

// level 1 :  creating a username and a passowrd and store them in our db adn compare the to user inputs 