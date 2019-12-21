const express = require("express");
const cors = require("cors");
const app = express();

const whitelist = ["http://localhost:3000", "https://localhost:3443"];
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  console.log(req.header("Origin"));
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);

// const express = require("express");
// const cors = require("cors");
// const app = express();

// //remember - my host is +1. So 3443 is in the video.
// const whitelist = ["http://localhost:3000", "https://localhost:3444"];

// var corsOptionsDelegate = (req, callback) => {
//   var corsOptions;

//   if (whitelist.indexOf(req.header("Origin")) !== -1) {
//     corsOptions = { origin: true };
//   } else {
//     corsOptions = { origin: false };
//   }

//   callback(null, corsOptions);
// };

// exports.cors = cors();
// exports.corsWithOptions = cors(corsOptionsDelegate);
