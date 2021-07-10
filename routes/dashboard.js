const router = require("express").Router();
const authorize = require("../middleware/authorize");
const db_query = require("../middleware/db_query")
const pool = require("../db");

router.post("/", authorize, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT name FROM users WHERE user_id = $1",
      [req.user.id] 
    ); 
    
  //if would be req.user if you change your payload to this:
    
  //   function jwtGenerator(user_id) {
  //   const payload = {
  //     user: user_id
  //   };
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/query",db_query, async(req,res) => {
  
})
module.exports = router;
