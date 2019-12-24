const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//favorites - users/dishes

//GET the user/dishes -- populate
//Post -- use array.forEach, array.indexOf, array.push

//delte - favorite.remove

const FavoritesSchema = new Schema(
  {
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish"
      }
    ]
  },
  {
    timestamps: true
  }
);

var Favorites = mongoose.model("Favorites", FavoritesSchema);

module.exports = Favorites;
