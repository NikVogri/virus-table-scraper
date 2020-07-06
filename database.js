const mysql = require("mysql");

module.exports = connection = mysql.createConnection({
  host: "host",
  user: "user",
  password: "password",
  database: "database",
  port: 3306,
});
