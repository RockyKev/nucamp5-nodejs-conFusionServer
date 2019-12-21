const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/************************************
 *
 * MODIFYING THE /dishes
 *
 * *********************************/

dishRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (request, response, next) => {
    // response.end("Will send all the dishes to you!");

    Dishes.find({})
      .populate("comments.author")
      .then(
        dishes => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      // response.end(
      //   "Will add the dish: " +
      //     request.body.name +
      //     " with details: " +
      //     request.body.description

      Dishes.create(request.body)
        .then(
          dish => {
            console.log("Dish Created ", dish);

            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(dish);
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
      response.end("PUT operation not supported on /DISHES");
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      // response.end("Deleting all the dishes!");

      Dishes.remove({})
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

/************************************
 * MODIFYING THE DISH with IDS
 * *********************************/
// .route("/:dishId/recipe/:recipeId")

dishRouter
  .route("/:dishId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (request, response, next) => {
    // "Will send details of the dish: " + request.params.dishId + " to you! "
    // + request.params.recipeId

    Dishes.findById(request.params.dishId)
      .populate("comments.author")
      .then(
        dish => {
          console.log("Dish found by id ", dish);

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end(
        "POST operation not supported on /dishes/" + request.params.dishId
      );
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        {
          $set: req.body
        },
        { new: true }
      )
        .then(
          dish => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
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
      Dishes.findByIdAndRemove(request.params.dishId)
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

/************************************
 *
 * MODIFYING THE COMMENTS ENDPOINTS
 *
 * *********************************/
dishRouter
  .route("/:dishId/comments/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (request, response, next) => {
    // response.end("Will send all the dishes to you!");

    Dishes.findById(request.params.dishId)
      .populate("comments.author")
      .then(
        dish => {
          if (dish != null) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(dish.comments);
          } else {
            err = new Error("Dish " + request.params.dishId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (request, response, next) => {
      Dishes.findById(request.params.dishId)
        .then(
          dish => {
            if (dish != null) {
              request.body.author = request.user._id;
              dish.comments.push(request.body);

              dish
                .save()

                .then(dish => {
                  Dishes.findById(dish._id)
                    .populate("comments.author")
                    .then(dish => {
                      response.statusCode = 200;
                      response.setHeader("Content-Type", "application/json");
                      response.json(dish);
                    });
                }),
                err => next(err);
            } else {
              err = new Error("Dish " + request.params.dishId + " not found");
              err.status = 404;
              return next(err);
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
        "PUT operation not supported on /dishes/" +
          request.params.dishId +
          "/comments"
      );
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Dishes.findById(request.params.dishId)
        .then(
          dish => {
            if (dish != null) {
              for (var i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
              }

              dish.save().then(dish => {
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
                response.json(dish);
              }),
                err => next(err);
            } else {
              err = new Error("Dish " + request.params.dishId + " not found");
              err.status = 404;
              return next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

/************************************
 * MODIFYING THE COMMENT ID ITSELF
 * *********************************/

dishRouter
  .route("/:dishId/comments/:commentId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            //testing to see if the values work
            console.log(JSON.stringify(req.user._id));
            console.log("CHECK PARAMS");
            console.log(
              JSON.stringify(dish.comments.id(req.params.commentId).author)
            );

            //simplify dish comments
            let dishComment = dish.comments.id(req.params.commentId);

            console.log("MODIFIED: " + dishComment.author);

            // if (req.user._id === dishComment.author) {
            if (
              // JSON.stringify(req.user._id) !==
              // JSON.stringify(dish.comments.id(req.params.commentId).author)

              !dish.comments
                .id(req.params.commentId)
                .author._id.equals(req.user._id)
            ) {
              console.log("id mismatch");
              err = new Error("You are not the father!");
              err.status = 404;
              return next(err);
            }

            if (req.body.rating) {
              dishComment.rating = req.body.rating;
            }

            if (req.body.comment) {
              dishComment.comment = req.body.comment;
            }
            dish
              .save() //save the changes
              .then(
                dish => {
                  Dishes.findById(dish._id)
                    .populate("comments.author")
                    .then(dish => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(dish);
                    });
                },
                err => next(err)
              );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              dish => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
