// import required modules
const readline = require('readline');
const fs = require('fs');
const fetch = require('node-fetch');

// define file paths and URLs
const MOVIE_FILE = 'movies.json';
const MOVIE_API_URL = 'http://www.omdbapi.com/?i=tt3896198&apikey=2af677b2';

// define class for Movie object
class Movie {
    constructor(title, director, release_year, genre) {
        this.title = title;
        this.director = director;
        this.release_year = release_year;
        this.genre = genre;
    }
}

// define functions for handling movie catalog
function readMovies() {
    return new Promise((resolve, reject) => {
        fs.readFile(MOVIE_FILE, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

function writeMovies(movies) {
    return new Promise((resolve, reject) => {
        fs.writeFile(MOVIE_FILE, JSON.stringify(movies), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function addMovie(movies, movie) {
    movies.push(movie);
    return writeMovies(movies);
}

function updateMovie(movies, index, movie) {
    movies[index] = movie;
    return writeMovies(movies);
}

function deleteMovie(movies, index) {
    movies.splice(index, 1);
    return writeMovies(movies);
}

function searchMovies(movies, keyword) {
    return movies.filter((movie) => {
        return (
            // movie.title.toLowerCase().includes(keyword.toLowerCase() ) ||
            movie.title.includes(keyword) ||
            movie.director.toLowerCase().includes(keyword.toLowerCase()) ||
            movie.genre.toLowerCase().includes(keyword.toLowerCase())
        );
    });
}

function filterMovies(movies, filter) {
    return movies.filter((movie) => {
        return (
            (filter.genre === '' || movie.genre ? movie.genre.toLowerCase() : "" === filter.genre ? filter.genre.toLowerCase() : "") &&
            (filter.release_year === '' || movie.release_year === filter.release_year)
        );
    });
}

function fetchMovieData(title) {
    const url = `${MOVIE_API_URL}&t=${encodeURIComponent(title)}`;
    return fetch(url).then((response) => response.json());
}

// define function for user input
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// define main function for running application
async function main() {
    try {
        // read movie data from file
        let movies = await readMovies();

        // define menu options
        const menu = {
            '1': 'Display Movie Catalog',
            '2': 'Add New Movie',
            '3': 'Update Movie Details',
            '4': 'Delete Movie',
            '5': 'Search and Filter',
            '6': 'Exit',
        };

        // run application loop
        let choice = '';
        while (choice !== '6') {
            // display menu options
            console.log('\nMovie Catalog Manager\n');
            for (const key in menu) {
                console.log(`${key}. ${menu[key]}`);
            }

            // get user choice
            choice = await prompt('\nEnter your choice: ');

            // handle user choice
            switch (choice) {
                case '1': // Display Movie Catalog
                    console.log('\nMovie Catalog:\n');
                    console.log(movies);
                    break;

                case '2': // Add New Movie
                    console.log('\nAdd New Movie:\n');
                    const title = await prompt('Title: ');
                    const director = await prompt('Director: ');
                    const release_year = await prompt('Release Year: ');
                    const genre = await prompt('Genre: ');
                    const movie = new Movie(title, director, release_year, genre);
                    await addMovie(movies, movie);
                    console.log('\nMovie added successfully!');
                    break;

                case '3': // Update Movie Details
                    console.log('\nUpdate Movie Details:\n');
                    const index = await prompt('Enter the index of the movie to update: ');
                    const selectedMovie = movies[index];
                    const titleUpdate = await prompt(`Title (${selectedMovie.title}): `);
                    const directorUpdate = await prompt(`Director (${selectedMovie.director}): `);
                    const releaseYearUpdate = await prompt(`Release Year (${selectedMovie.release_year}): `);
                    const genreUpdate = await prompt(`Genre (${selectedMovie.genre}): `);
                    const updatedMovie = new Movie(
                        titleUpdate || selectedMovie.title,
                        directorUpdate || selectedMovie.director,
                        releaseYearUpdate || selectedMovie.release_year,
                        genreUpdate || selectedMovie.genre
                    );
                    await updateMovie(movies, index, updatedMovie);
                    console.log('\nMovie details updated successfully!');
                    break;

                case '4': // Delete Movie
                    console.log('\nDelete Movie:\n');
                    const deleteIndex = await prompt('Enter the index of the movie to delete: ');
                    await deleteMovie(movies, deleteIndex);
                    console.log('\nMovie deleted successfully!');
                    break;

                case '5': // Search and Filter
                    console.log('\nSearch and Filter:\n');
                    const keyword = await prompt('Enter keyword to search: ');
                    const filter = {
                        genre: await prompt('Enter genre to filter (leave blank for no filter): '),
                        release_year: await prompt('Enter release year to filter (leave blank for no filter): '),
                    };
                    const results = filterMovies(searchMovies(movies, keyword), filter);
                    console.log('\nSearch results:\n');
                    console.log(results);
                    break;

                case '6': // Exit
                    console.log('\nGoodbye!');
                    break;

                default:
                    console.log('\nInvalid choice, please try again.');
                    break;
            }
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
}

// start
main();