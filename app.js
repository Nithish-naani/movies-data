const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("The Server is running in http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//All Movies
app.get("/movies/", async (request, response) => {
  const movieQuery = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(movieQuery);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Create New Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `INSERT INTO 
  movie(director_id, movie_name, lead_actor)
  VALUES('${directorId}', '${movieName}', '${leadActor}');`;
  const createMovie = await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//Return Movie With MovieId
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `SELECT * FROM 
    movie
    WHERE movie_id = ${movieId};`;
  const newMovie = await db.get(movieQuery);
  response.send(convertDbObjectToResponseObject(newMovie));
});

//Update Movies
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
  const updateMovie = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DeleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.run(DeleteQuery);
  response.send("Movie Removed");
});

//Return All Directors
app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT * FROM director;`;
  const directorList = await db.all(directorQuery);
  response.send(
    directorList.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//All Movies By Director
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const moviesQuery = `SELECT movie_name FROM movie
    WHERE director_id = '${directorId}';`;
  const movies = await db.all(moviesQuery);
  response.send(
    movies.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});
module.exports = app;
