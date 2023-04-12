const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const bodyParser = require('body-parser'),
    methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(methodOverride());


// Error-handling Middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
});

// Create a write stream
// A 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

let top10Films = [
    {
        title: 'Harry Potter and the Sorcerer\'s Stone'
    },
    {
        title: 'Lord of the Rings'
    },
    {
        title: 'Twilight'
    },
    {
        title: 'Star Wars - Clone Wars'
    },
    {
        title: 'Inception'
    },
    {
        title: 'Toy Story 2'
    },
    {
        title: 'Despicable Me'
    },
    {
        title: 'Titanic'
    },
    {
        title: 'Eat, Pray and Love'
    },
    {
        title: 'The Lion King'
    }
];

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to MyFlix!');
});

app.get('/movies', (req, res) => {
    res.json(top10Films);
});

app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
