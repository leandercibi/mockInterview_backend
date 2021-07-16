const Pool = require("pg").Pool;

const pool = new Pool({
  host: "postgresql-38450-0.cloudclusters.net",
  user: "user",
  password: "Pushkar@2020",
  port: 38450,
  database: "mock_int"
});

module.exports = pool;
