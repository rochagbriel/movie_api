/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');

/**
 * Defines the structure of the movie object
 * @param {string} Title - The title of the movie
 * @param {string} Description - The description of the movie
 * @param {object} Genre - The genre of the movie
 * @param {object} Director - The director of the movie
 * @param {array} Actors - The actors in the movie
 * @param {string} ImagePath - The path to the movie's image
 * @param {boolean} Featured - Whether the movie is featured or not
 * @constructor
 * @returns {object} - The movie object
 * @requires mongoose
 * @requires bcrypt
 * @requires passport
 * @exports Movie
 */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String,
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean,
});

/**
 * Defines the structure of the user object
 * @param {string} Username - The username of the user
 * @param {string} Password - The password of the user
 * @param {string} Email - The email of the user
 * @param {date} Birthday - The birthday of the user
 * @param {array} FavoriteMovies - The user's favorite movies
 * @constructor
 * @returns {object} - The user object
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
