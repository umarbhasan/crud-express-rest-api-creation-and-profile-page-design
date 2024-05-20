let mysql = require("mysql");
const express = require("express");
const app = express();
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "hr",
});
connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("success");
  }
});
module.exports = connection;