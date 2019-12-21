const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Leaders = require("../models/leaders");

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  // .all((request, response, next) => {
  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "text/plain");
  //   next();
  // })

  .get(cors.cors, (request, response, next) => {
    // response.end("Will send all the leaders to you!");
    Leaders.find({})
      .then(
        leader => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(leader);
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
      Leaders.create(request.body)
        .then(
          leader => {
            console.log("Leader Created ", leader);

            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(leader);
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
      response.end("PUT operation not supported on /leader");
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Leaders.remove({})
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

leaderRouter
  .route("/:leaderId")
  // .route("/:leaderId/recipe/:recipeId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  // .all((request, response, next) => {
  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "text/plain");
  //   next();
  // })

  .get(cors.cors, (request, response, next) => {
    Leaders.findById(request.params.leaderId)
      .then(
        leader => {
          console.log("leader found by id ", leader);

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(leader);
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
        "POST operation not supported on /leaders" + request.params.leaderId
      );
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndUpdate(
        req.params.leaderId,
        {
          $set: req.body
        },
        { new: true }
      )
        .then(
          leader => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
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
      Leaders.findByIdAndRemove(request.params.leaderId)
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

module.exports = leaderRouter;
