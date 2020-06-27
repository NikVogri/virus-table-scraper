const mysql = require('mysql');

module.exports = connection = mysql.createConnection({
  host: 'fdb22.awardspace.net',
  user: '3490672_scraper',
  password: 'escape123',
  database: '3490672_scraper',
  port: 3306
});
