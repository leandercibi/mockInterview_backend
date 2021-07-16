const pool = require("../db");

module.exports = async (req,res,next) => {
    console.log('entered query');
    const {company,role,domain} = req.body;
        if (company!='null' && role!='null' && domain!='null') {
            const mentor_list =  await pool.query('SELECT * FROM "user" WHERE curr_organisation = $1 AND curr_designation = $2 AND domain = $3',[company,role,domain])
            return res.json(mentor_list.rows)
        } else if (company!='null' && role!='null' && domain=='null') {
            const mentor_list = await pool.query('SELECT * FROM "user" WHERE curr_organisation = $1 AND curr_designation = $2',[company,role])
            return res.json(mentor_list.rows)
        } else if (company!='null' && role=='null' && domain!='null') {
            const mentor_list = await pool.query('SELECT * FROM "user" WHERE curr_organisation = $1 AND domain = $2',[company,domain])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role!='null' && domain!='null') {
            const mentor_list = await pool.query('SELECT * FROM "user" WHERE curr_designation = $1 AND domain = $2',[role,domain])
            return res.json(mentor_list.rows)
        } else if (company!='null' && role=='null' && domain=='null') {
            const mentor_list =await pool.query('SELECT * FROM "user" WHERE curr_organisation = $1',[company])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role!='null' && domain=='null') {
            const mentor_list =await pool.query('SELECT * FROM "user" WHERE curr_designation = $1',[role])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role=='null' && domain!='null') {
            const mentor_list = await pool.query('SELECT * FROM "user" WHERE domain = $1',[domain])
            return res.json(mentor_list.rows)
        }
        next();
};