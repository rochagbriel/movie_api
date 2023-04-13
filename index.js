/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express'),
    uuid = require('uuid'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const bodyParser = require('body-parser'),
    methodOverride = require('method-override');
const { constant, update } = require('lodash');
const { title } = require('process');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
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

let movies = [
    {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        genre: { 
            name:'Fantasy',
            description: 'Fantasy is a genre of speculative fiction involving magical elements.'
        },
        director: {
            name:'Chris Columbus',
            birth_date: '18_09_1978'
        }
    },
    {
        title: 'Lord of the Rings',
        genre: { 
            name:'Fantasy',
            description: 'Fantasy is a genre of speculative fiction involving magical elements.'
        }
    },
    {
        title: 'Twilight',
    },
    {
        title: 'Star Wars - Clone Wars',
    },
    {
        title: 'Inception',
    },
    {
        title: 'Toy Story 2',
    },
    {
        title: 'Despicable Me',
    },
    {
        title: 'Titanic',
    },
    {
        title: 'Eat, Pray and Love',
    },
    {
        title: 'The Lion King',
    },
];

let users = [
    {   
        name: 'User Hallo', 
        id: 1
    },
    {   
        name: 'User Bye', 
        id: 2
    }
];

// CREATE - Allow new users to register;
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Users need a name');
    }
});

// UPDATE - Allow users to update their user info (username);
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
});

// CREATE - Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful POST request adding a movie as a favorite');
    // const { id, movieTitle } = req.params;

    // let user = user.find(user.id == id);

    // if (user) {
    //     user.favoriteMovies.push(movieTitle);
    //     res.status(200).send(
    //         `${movieTitle} has been added to user ${id}'s array`
    //     );
    // } else {
    //     res.status(400).send('no such user');
    // }
});

// DELETE - Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed);
app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful DELETE request removing a movie from favorite list');
    // const { id, movieTitle } = req.params;

    // let user = user.find(user.id == id);

    // if (user) {
    //     user.favoriteMovies = user.favoriteMovies.filter(
    //         (title) => title !== movieTitle
    //     );
    //     res.status(200).send(
    //         `${movieTitle} has been removed from user ${id}'s array`
    //     );
    // } else {
    //     res.status(400).send('no such user');
    // }
});

// DELETE - Allow existing users to deregister (showing only a text that a user email has been removed—more on this later)
app.delete('/users/:id', (req, res) => {
    res.send('Successful DELETE request, a user has been removed')
    // const { id } = req.params;

    // let user = user.find(user.id == id);

    // if (user) {
    //     users = users.filter((user) => user.id != id);
    //     res.status(200).send(`user ${id} has been deleted`);
    // } else {
    //     res.status(400).send('no such user');
    // }
});

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to MyFlix!');
});

// READ - Return a list of ALL movies to the user;
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// READ - Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find((movie) => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }
});

// READ - Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find((movie) => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre');
    }
});

// READ - Return data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find((movie) => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director');
    }
});

app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
