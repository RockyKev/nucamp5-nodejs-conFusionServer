const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorites");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//GET the user/dishes -- populate
//POST -- use array.forEach, array.indexOf, array.push
//DELETE - favorite.remove

favoriteRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, authenticate.verifyUser, (request, response, next) => {
    //When the user does a GET operation on '/favorites', you will populate the user information and the dishes information before returning the favorites to the user.

    Favorites.findOne({ users: request.user._id })
      .populate("users")
      .populate("dishes")
      .then(
        favorites => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      Favorites.findOne({ users: request.user._id })
        .populate("users")
        .populate("dishes")
        .then(
          favorite => {
            if (favorite != null) {
              console.log("inside if statement -", favorite);

              let favArray = [];
              favorite.dishes.forEach(favElements => {
                favArray.push(favElements._id);
              });

              console.log("favArray:", favArray);
              console.log("request.body.dishes:", request.body.dishes);

              //right now, all array items are object.
              //covert array items into strings
              let favArrayToString = favArray.toString();
              let FavArrayAgain = favArrayToString.split(",");

              if (!FavArrayAgain.includes(request.body.dishes)) {
                favorite.dishes.push(request.body.dishes);
                console.log("OBJECT pushed into array!");
              } else {
                console.log("OBJECT ignored because...");
              }

              console.log("passed if statement");

              favorite
                .save()

                .then(favorite => {
                  console.log("OBJECT is now displaying json");

                  Favorites.findOne({ users: request.user._id })
                    .populate("users")
                    .populate("dishes")
                    .then(favorite => {
                      response.statusCode = 200;
                      response.setHeader("Content-Type", "application/json");
                      response.json(favorite);
                    });
                }),
                err => next(err);
            } else {
              Favorites.create(request.body).then(favorite => {
                console.log("OBJECT Created!");
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
                response.json(favorite);
              }),
                err => next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end("PUT operation not supported on /favorites/");
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      // When the user performs a DELETE operation on '/favorites', you will delete the list of favorites corresponding to the user, by deleting the favorite document corresponding to this user from the collection.
      Favorites.findOneAndDelete({ users: request.user._id })
        .populate("users")
        .populate("dishes")
        .then(
          resp => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

favoriteRouter
  .route("/:favoriteId")
  // .route("/:favoriteId/recipe/:recipeId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (request, response, next) => {
    response.statusCode = 403;
    response.end(
      "PUT operation not supported on /favorites/" +
        request.params.favoriteId +
        "/"
    );
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      // When the user performs a POST operation on '/favorites/:dishId', then you will add the specified dish to the list of the user's list of favorite dishes, if the dish is not already in the list of favorite dishes.
      Favorites.findOne({ users: request.user._id })
        .populate("users")
        .populate("dishes")
        .then(
          favorite => {
            if (favorite != null) {
              let favArray = [];
              favorite.dishes.forEach(favElements => {
                favArray.push(favElements._id);
              });

              console.log("favArray:", favArray);
              console.log(
                "request.params.favoriteId:",
                request.params.favoriteId
              );

              //right now, all array items are object.
              //covert array items into strings
              let favArrayToString = favArray.toString();
              let FavArrayAgain = favArrayToString.split(",");

              if (!FavArrayAgain.includes(request.params.favoriteId)) {
                favorite.dishes.push(request.params.favoriteId);
                console.log("OBJECT pushed into array!");
              } else {
                console.log("OBJECT ignored because...");
              }

              console.log("passed if statement");

              favorite
                .save()

                .then(favorite => {
                  console.log("OBJECT is now displaying json");

                  Favorites.findOne({ users: request.user._id })
                    .populate("users")
                    .populate("dishes")
                    .then(favorite => {
                      response.statusCode = 200;
                      response.setHeader("Content-Type", "application/json");
                      response.json(favorite);
                    });
                }),
                err => next(err);
            } else {
              Favorites.create({
                users: request.user,
                dishes: [request.params.favoriteId]
              }).then(favorite => {
                // Favorites.create(request.params).then(favorite => {
                console.log("request.user", request.user);

                console.log("OBJECT Created!");
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
                response.json(favorite);
              }),
                err => next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      response.statusCode = 403;
      response.end(
        "PUT operation not supported on /favorites/" + request.params.favoriteId
      );
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      // When the user performs a DELETE operation on '/favorites/:dishId', then you will remove the specified dish from the list of the user's list of favorite dishes.
      Favorites.findOne({ users: request.user._id })
        .populate("users")
        .populate("dishes")
        .then(
          favorite => {
            if (favorite != null) {
              let favArray = [];
              favorite.dishes.forEach(favElements => {
                favArray.push(favElements._id);
              });

              console.log("favArray:", favArray);
              console.log(
                "request.params.favoriteId:",
                request.params.favoriteId
              );

              //right now, all array items are object.
              //covert array items into strings
              let favArrayToString = favArray.toString();
              let FavArrayAgain = favArrayToString.split(",");

              if (FavArrayAgain.includes(request.params.favoriteId)) {
                favorite.dishes.splice(
                  favorite.dishes.indexOf(request.params.favoriteId),
                  1
                );
                console.log("OBJECT deleted from array!");
              } else {
                console.log("OBJECT ignored because...");
              }

              console.log("passed if statement");

              favorite
                .save()

                .then(favorite => {
                  console.log("OBJECT is now displaying json");

                  Favorites.findOne({ users: request.user._id })
                    .populate("users")
                    .populate("dishes")
                    .then(favorite => {
                      response.statusCode = 200;
                      response.setHeader("Content-Type", "application/json");
                      response.json(favorite);
                    });
                }),
                err => next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

module.exports = favoriteRouter;
