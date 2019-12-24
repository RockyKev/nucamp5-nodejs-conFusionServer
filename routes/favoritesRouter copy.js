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
      /* When the user does a POST operation on '/favorites' by including [{"_id":"dish ObjectId"}, . . ., {"_id":"dish ObjectId"}] in the body of the message. */

      //compare to see if the user exists in favorites, else create user.
      Favorites.findOne({ users: request.user._id })
        .populate("users")
        .populate("dishes")
        .exec(function(err, userFavs) {
          if (err) {
            err = new Error("Failed at the favoriting.");
            err.status = 404;
            return next();
          }

          //Check to see if the dish exists already. If it does, ignore it. Otherwise, add it.
          let usersFav_Array = [];

          userFavs.dishes.forEach(userFavsDish => {
            usersFav_Array.push(userFavsDish._id);
          });

          //right now, all array items are object.
          //covert array items into strings
          let usersFav_ArrayToString = usersFav_Array.toString();
          let UsersFav_FromStringToArray = usersFav_ArrayToString.split(",");

          //compare the dishes in the doc/array VS param dish. If it's there - give error.
          if (UsersFav_FromStringToArray.includes(request.body.dishes)) {
            err = new Error(
              "Already favorited. Guessing we are supposed to remove from favs? Instructions unclear."
            );
            err.status = 404;
            return next(err);
          }

          //No error -- so add the item into the new array
          userFavs.dishes.push(request.body.dishes);

          // Mongoose sends a `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })`
          // to MongoDB.
          userFavs.save();
        });

      //   creates a NEW Item
      //   Favorites.create(request.body)
      //     .then(
      //       favorite => {
      //         console.log("OBJECT Created ", favorite);

      //         response.statusCode = 200;
      //         response.setHeader("Content-Type", "application/json");
      //         response.json(favorite);
      //       },
      //       err => next(err)
      //     )
      //     .catch(err => next(err));
      // });
    }
  )

  //   console.log("Moving onto displaying response");

  //   console.log("--1---");
  //   console.log(userFavs.dishes[1].name); //this is valid
  //   console.log("--2---req");
  //   console.log(request.body.dishes);

  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "application/json");
  //   response.json(userFavs.dishes);
  //         .then(
  //           favorites => {
  //             console.log("--1---");
  //             console.log(request.body); //see what's in favorites
  //             console.log("--2---req");
  //             console.log(request.user); //  this value to compare if this user has any dishes
  //             console.log("--3---res");
  //             console.log(response); // this value to compare if this user has any dishes

  //             response.statusCode = 200;
  //             response.setHeader("Content-Type", "application/json");
  //             response.json(favorites);
  //           },
  //           err => {
  //             //creates a NEW Item
  //             Favorites.create(request.body)
  //               .then(
  //                 favorite => {
  //                   console.log("OBJECT Created ", favorite);

  //                   response.statusCode = 200;
  //                   response.setHeader("Content-Type", "application/json");
  //                   response.json(dish);
  //                 },
  //                 err => next(err)
  //               )
  //               .catch(err => next(err));
  //           }
  //         )
  //         .catch(err => next(err));
  //     }
  //   )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {}
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      // When the user performs a DELETE operation on '/favorites', you will delete the list of favorites corresponding to the user, by deleting the favorite document corresponding to this user from the collection.
    }
  );

favoriteRouter
  .route("/:favoriteId")
  // .route("/:favoriteId/recipe/:recipeId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (request, response, next) => {
    //When the user does a GET operation on '/favorites', you will populate the user information and the dishes information before returning the favorites to the user.
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      // When the user performs a POST operation on '/favorites/:dishId', then you will add the specified dish to the list of the user's list of favorite dishes, if the dish is not already in the list of favorite dishes.
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findByIdAndUpdate(
        req.params.favoriteId,
        {
          $set: req.body
        },
        { new: true }
      )
        .then(
          favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      // When the user performs a DELETE operation on '/favorites/:dishId', then you will remove the specified dish from the list of the user's list of favorite dishes.
    }
  );

module.exports = favoriteRouter;

/*******************************
 *
 * below is to leave the document but make the array blank.
 *
 ********************************/
//       Favorites.findOne({ users: request.user._id })
//         .populate("users")
//         .populate("dishes")
//         .then(
//           favorite => {
//             if (favorite != null) {
//               console.log("make blank");
//               favorite.dishes = [];
//               console.log(favorite);

//               favorite.save().then(dish => {
//                 response.statusCode = 200;
//                 response.setHeader("Content-Type", "application/json");
//                 response.json(favorite);
//               }),
//                 err => next(err);
//             } else {
//               err = new Error(
//                 "favorites " + request.params.favoriteId + " not found"
//               );
//               err.status = 404;
//               return next(err);
//             }
//           },
//           err => next(err)
//         )
//         .catch(err => next(err));
//     }
//   );
