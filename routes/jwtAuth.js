const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");



//authorizeentication

router.post("/register", validInfo,async (req, res) => {
  const { name,email,educational_qualification,curr_designation,curr_organisation,domain,skills,experience,password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email
    ]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      'INSERT INTO "user" (name,email,education,curr_designation,curr_organisation,domain,skills,experience,password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, email,educational_qualification,curr_designation,curr_organisation,domain,skills,experience,bcryptPassword]
    );
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    //console.log('first step');
    const user =  await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    //console.log('tried first step',user);

    if (user.rows.length === 0) {
      //console.log('cant find');
      return res.status(401).json("We cannot find an account with that Email address");
      
    }
    //console.log('tried second step');
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    //console.log('tried 3 step');
    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    //console.log('tried 4 step');
    const jwtToken = jwtGenerator(user.rows[0].user_id);
    console.log(jwtToken);
    return res.json({ jwtToken });
  } 
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
  console.log('tried all step');
});

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
