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


router.post("/query",db_query, async(req,res) => {
  
})

router.post("/generatemeetlink", async(req,res) => {
    const {user_id,mentor_id,date,time} = req.body
    const user_email = await (await pool.query('SELECT email FROM "user" WHERE user_id = $1',[user_id]));
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
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });
        }) .catch(function (err) {
            // API call failed...
            console.log('API call failed, reason ', err);
        });

  
});

module.exports = router;
