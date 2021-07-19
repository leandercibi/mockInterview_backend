const pool = require("../db");

module.exports = async (req,res,next) => {
    console.log('entered query');
    const {company,role,domain} = req.body;
    console.log(company, role, domain);
        if (company!='null' && role!='null' && domain!='null') {
            const mentor_list =  await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id WHERE curr_organisation = $1 AND curr_designation = $2 AND domain = $3',[company,role,domain])
            console.log(mentor_list)
            return res.json(mentor_list.rows)
        } else if (company!='null' && role!='null' && domain=='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE curr_organisation = $1 AND curr_designation = $2',[company,role])
            return res.json(mentor_list.rows)
        } else if (company!='null' && role=='null' && domain!='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE curr_organisation = $1 AND domain = $2',[company,domain])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role!='null' && domain!='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE curr_designation = $1 AND domain = $2',[role,domain])
            return res.json(mentor_list.rows)
        } else if (company!='null' && role=='null' && domain=='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE curr_organisation = $1',[company])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role!='null' && domain=='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE curr_designation = $1',[role])
            return res.json(mentor_list.rows)
        } else if (company=='null' && role=='null' && domain!='null') {
            const mentor_list = await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id  WHERE domain = $1',[domain])
            return res.json(mentor_list.rows)
        }
        next();
};