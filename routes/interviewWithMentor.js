const router = require("express").Router();
const db_query = require("../middleware/db_query");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const config = require('../config');
const rp = require('request-promise');
const pool = require("../db");

const payload = {
    iss: config.APIKey,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, config.APISecret);


router.get("/",async(req,res) => {
    const mentor_list =  await pool.query('select user_id as id,name,curr_organisation as company,experience,rating,time1,time2,time3,curr_designation as role,domain,charge_per_session as price from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id');    return res.send(mentor_list.rows);
})


router.post("/query",db_query, async(req,res) => {
  
})

router.post("/generatemeetlink", async(req,res) => {
    const {user_id,mentor_id,date,time} = req.body
    let newUser = await pool.query(
        'INSERT INTO public.book_interview (time_slot,user_id,mentor_id,booked_on) VALUES ($1, $2, $3, $4) RETURNING *',
        [time,user_id,mentor_id,date]
      );
    const user_email = await pool.query('SELECT email FROM "user" WHERE user_id = $1',[user_id]);
    const mentor_email = await pool.query('SELECT email FROM "user" WHERE user_id = $1',[mentor_id]);
    const u_email = user_email.rows[0].email;
    const m_email = mentor_email.rows[0].email;
    const start_time = date.concat('T',time,'Z');
    console.log(u_email,m_email,start_time);
    const options = {
        //You can use a different uri if you're making an API call to a different Zoom endpoint.
        uri: "https://api.zoom.us/v2/users/me/meetings", 
        auth: {
            'bearer': token
        },
        headers: {
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        },
        body: {
            "topic": "test zoom",
            "type":2,
            "start_time": start_time,
            "duration":2,
            "settings":{
                "host_video":true,
                "participant_video":true,
                "join_before_host":true,
                "mute_upon_entry":true,
                "watermark": true,
                "audio": "both",
                "auto_recording": "none"
                }  
        },
        json: true
    };
    let url;
    rp(options)
        .then(function (response) {
        //printing the response on the console
            console.log('User has', response);
        //console.log(typeof response);
            resp = response['meetings'][0]
            url = resp.join_url
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'heypm2020@gmail.com',
                    pass: 'usermentor123'
                }
                });
                
            const mailOptions = {
                from: 'heypm2020@gmail.com',
                to: u_email,
                subject: 'Meeting link with Mentor',
                text: 'here is the meeting url  ' + (String(url))
                };
        
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                    return res.status(500).send(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).send('Success');        
                }
                });
        }) .catch(function (err) {
            // API call failed...
            console.log('API call failed, reason ', err);
            return res.status(500).send('api error');
        });

    
});


router.post("/get_timing", async(req,res) => {
    const {date, mentor_id} = req.body; 
    let time = await pool.query('SELECT time1,time2,time3 FROM public.mentor WHERE mentor_id = $1',[mentor_id]);
    const booked_slot = await pool.query('SELECT time_slot FROM public.book_interview WHERE mentor_id = $1 and booked_on = $2 ',[mentor_id,date]);
    console.log('entered')
    time1 = time.rows[0].time1
    time2 = time.rows[0].time2
    time3 = time.rows[0].time3
    console.log(booked_slot)
    for (let i = 0; i < booked_slot.rows.length; i++) {
        console.log('entered loop')
        let time_temp = String(booked_slot.rows[i].time_slot);
        console.log(time_temp,time1,time2,time3);
        if(time1==time_temp){
            time1= null;
        }
        if(time2==time_temp){
            time2= null;
        }
        if(time3==time_temp){
            time3= null;
        }

    };
    return res.json({time1,time2,time3});
})



module.exports = router;
