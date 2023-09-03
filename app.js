// there are some notes at the bottom
// 09 / 02 / 2023 => by Musaab almuqbali
import 'dotenv/config' // good practice to put it at the top
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import encrypt from 'mongoose-encryption';
// import md5 from 'md5'; we use bcrypt instead
import bcrypt from 'bcrypt';
const saltRounds = 10; // how many salt round we need to do to our password hashing
// consts
const app = express();
const PORT = process.env.PORT;
const dbURL = 'mongodb://localhost:27017/';
const dbName = 'userDB';
const encrytionSecret = process.env.SECRET_KEY;

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
// UserSchema.plugin(encrypt, {secret: encrytionSecret, encryptedFields: ['password']}); now this is commented to use hash only

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
    // const password = md5(req.body.password); // md5 is the hash function

    // useing bcrypt.comare to see if the salted hash password exists in our db
    // see bcrypt docs for more info
    
        // now we check this info against our db
        try {
            const foundUser = await User.findOne({email:username}); // thie will search 
            bcrypt.compare(req.body.password, foundUser.password, async (err,compareResult) => {
                 
                if((foundUser.email === username) && (compareResult === true) ) {
                    res.render('secrets.ejs')
                } else {
                    res.render('login.ejs', {
                        warning: 'user or password are inncorrect'
                    });
                }
            });
        } catch (error) {
            // console.log(error);
            res.render('login.ejs', {
                warning: 'couldnt find username'
            });
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
    // const password = md5(req.body.password); // this will get the password, usign md5 hash encryption

    // this functio, first arrg takes our password, second takes our salt rounds, then call back function to make get the hash results
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        // now we save the user info to the db
        const newUser = new User({
        email: username,
        password: hash
    });
      // saving the user info
      try {
        newUser.save();
        // so if there is no registration error the secret page will be shown
        res.render('secrets.ejs');
    } catch (error) {
        console.error(error);
        res.redirect('/registerj');        
    }       
    });
});

// logging out and going back home
app.get('/logout', (req, res) => {
    res.redirect('/');
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