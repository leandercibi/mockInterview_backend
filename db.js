const Pool = require("pg").Pool;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "123456",
  port: 5432,
  database: "mock_interview"
});

module.exports = pool;
