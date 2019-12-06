const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Promotions = require("../models/promotions");

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route("/")

  .all((request, response, next) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    next();
  })

  .get((request, response, next) => {
    // response.end("Will send all the Promotions to you!");
    Promotions.find({})
    .then(
      promotion => {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.json(promotion);
      },
      err => next(err)
    )
    .catch(err => next(err));
})

  .post((request, response, next) => {
    Promotions.create(request.body)
    .then(
      promotion => {
        console.log("promotion Created ", promotion);

        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.json(promotion);
      },
      err => next(err)
    )
    .catch(err => next(err));
})

  .put((request, response, next) => {
    response.statusCode = 403;
    response.end("PUT operation not supported on /promotions");
  })

  .delete((request, response, next) => {
    Promotions.remove({})
    .then(
      resp => {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.json(resp);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

promoRouter
  .route("/:promotionId")
  // .route("/:promoId/recipe/:recipeId")

  // .all((request, response, next) => {
  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "text/plain");
  //   next();
  // })

  .get((request, response, next) => {
    Promotions.findById(request.params.promotionId)
      .then(
        promotion => {
          console.log("promotion found by id ", promotion);

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post((request, response, next) => {
    response.statusCode = 403;
    response.end(
      "POST operation not supported on /Promotions/" + request.params.promotionId
    );
  })

  .put((req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        promotion => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .delete((request, response, next) => {
    Promotions.findByIdAndRemove(request.params.promotionId)
      .then(
        resp => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });


module.exports = promoRouter;
