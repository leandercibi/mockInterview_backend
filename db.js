const Pool = require("pg").Pool;

const pool = new Pool({
  host: "database-1.cuemg1gdusk5.ap-south-1.rds.amazonaws.com",
  user: "postgres",
  password: "Pushkar08",
  port: 5432,
  database: "postgres"
});

module.exports = pool;
