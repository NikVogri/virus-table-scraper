const mysql = require('mysql');

module.exports = connection = mysql.createConnection({
  host     : 'database host',
  user     : 'database user',
  password : 'database password',
  database : 'database name'
});
