/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// LOCAL DB ADRESS
// mongoose.connect('mongodb://localhost:27017/cfDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

mongoose.connect( process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

const bodyParser = require('body-parser'),
    methodOverride = require('method-override');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const cors = require('cors');
app.use(cors());

const passport = require('passport');
require('./passport');

app.use(methodOverride());

// Error-handling Middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Create a write stream
// A 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
    flags: 'a',
});

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// CREATE - Allow new users to register;
/* 
We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}
*/

app.post('/users', 
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

    // Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashedPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })  // Search to see if a user requested username already exists
        .then((user) => {
            // If the user is found, send a response that it already exists
            if (user) { 
                return res
                    .status(400)
                    .send(`The user "${req.body.Username}" already exists`);
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                })
                    .then((user) => {
                        res.status(201).json(user);
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Error: ' + err);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// UPDATE - Allow users to update their user info (username);
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/

app.put('/users/:id', 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', { session: false }), (req, res) => {

    // Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true }
    )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// CREATE - Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/movies/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { FavoriteMovies: req.params.MovieId } },
        { new: true }
    )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE - Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed);
app.delete('/users/:id/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { _id: req.params.id },
        {
            $pull: { FavoriteMovies: req.params.MovieId },
        },
        { new: true }
    )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE - Allow existing users to deregister (showing only a text that a user email has been removed—more on this later)
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ _id: req.params.id })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.id + ' was not found.');
            } else {
                res.status(200).send(req.params.id + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// GET requests
app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('Welcome to MyFlix!');
});

// READ - Return a list of ALL movies to the user;
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ - Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ - Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.GenreName })
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ - Return data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.DirectorName })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use(express.static('public'));

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});
