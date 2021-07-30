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
    const mentor_list =  await pool.query('select user_id as id,name,curr_organisation as company,experience,curr_designation as role,domain,charge_per_session as price,linkedin from public."user" inner join public.mentor On public."user".user_id=public.mentor.mentor_id');    return res.send(mentor_list.rows);
})


router.post("/query",db_query, async(req,res) => {
  
})

router.post("/generatemeetlink", async(req,res) => {
    const {user_email,mentor_id,date,time} = req.body
    const response = await pool.query('SELECT user_id FROM "user" WHERE email = $1',[user_email]);
    const user_id = response.rows[0].user_id;

    let newUser = await pool.query(
        'INSERT INTO public.book_interview (time_slot,user_id,mentor_id,booked_on) VALUES ($1, $2, $3, $4) RETURNING *',
        [time,user_id,mentor_id,date]
      );
    //const user_email = await pool.query('SELECT email FROM "user" WHERE user_id = $1',[user_id]);
    const mentor_email = await pool.query('SELECT email FROM "user" WHERE user_id = $1',[mentor_id]);
    const mr_name = await pool.query('SELECT name FROM "user" WHERE user_id = $1',[mentor_id]);
    const mt_details = await pool.query('SELECT name,curr_organisation,curr_designation FROM "user" WHERE user_id = $1',[user_id]);
    const mentor_name = mr_name.rows[0].name;
    const mentee_name = mt_details.rows[0].name;
    const mentee_company = mt_details.rows[0].curr_organisation;
    const mentee_role = mt_details.rows[0].curr_designation;
    const u_email = user_email;
    const m_email = mentor_email.rows[0].email;
    const start_time = date.concat('T',time,'Z');
    const options = {
        //You can use a different uri if you're making an API call to a different Zoom endpoint.
        uri: "https://api.zoom.us/v2/users/me/meetings", 
        method: "POST",
        auth: {
            'bearer': token
        },
        headers: {
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json',
        },  
        body: {
            "topic": "Meeting",
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
            url = response['join_url']
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'heypm2020@gmail.com',
                    pass: 'mentormentee2020'
                }
                });
        
        
            
            const mailOptionsmentee = {
                from: 'heypm2020@gmail.com',
                to: u_email,
                subject: 'You have scheduled a mock interview with prep4PM',
                text: 'Hi mentee,\
\nYou have scheduled a mock interview session with '+mentor_name+' mentor on prep4PM on '+String(date)+' at '+String(time)+'.\
\n\
\nHere is the Zoom link for that meeting: '+String(url) +' .\
\n\
\nWe are continuously developing our website. Your mentor will contact you shortly with a calendar invite.\
\n\
\nHave a great session,\
\nprep4PM team'
};
            const mailOptionsmentor = {
                from: 'heypm2020@gmail.com',
                to: m_email,
                subject: 'New Mock Interview Schedule from prep4PM',
                text: 'Hi prep4PM mentor,\
\n'+mentee_name+' has scheduled a mock interview session with you on '+String(date)+' at '+String(time)+'.\
\nHere is the Zoom link for that meeting: '+String(url) +' .\
\n\
\nDetails of the mentee \
\nEmail: '+u_email+'\
\nCompany: '+mentee_company+'\
\nDesignation : '+mentee_role+'\
\n\
\nWe are continuously developing our website. To avoid confusion, please send a calendar invite to the mentee at email ID of the mentee.\
\nHave a great session,\
\nprep4PM team'
                };
        
                transporter.sendMail(mailOptionsmentee, function(error, info){
                if (error) {
                    console.log(error);
                    return res.status(500).send(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).send('Success');        
                }
                });
                transporter.sendMail(mailOptionsmentor, function(error, info){
                    if (error) {
                        console.log(error);
                        return res.status(500).send(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200).send('Success');        
                    }
                    });

                
        }) .catch(function (err) {
            console.log('API call failed, reason ', err);
            return res.status(500).send('api error');
        });

    
});


router.post("/get_timing", async(req,res) => {
    const {date, mentor_id} = req.body; 
    let time = await pool.query('SELECT time1,time2,time3 FROM public.mentor WHERE mentor_id = $1',[mentor_id]);
    const booked_slot = await pool.query('SELECT time_slot FROM public.book_interview WHERE mentor_id = $1 and booked_on = $2 ',[mentor_id,date]);
    time1 = time.rows[0].time1
    time2 = time.rows[0].time2
    time3 = time.rows[0].time3
    for (let i = 0; i < booked_slot.rows.length; i++) {
        let time_temp = String(booked_slot.rows[i].time_slot);
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
    if (time1==null && time2==null && time3==null){
        return res.json({})
    }
    if (time1==null && time2==null && time3!=null){
        return res.json({time3})
    }
    if (time1==null && time2!=null && time3==null){
        return res.json({time2})
    }
    if (time1!=null && time2==null && time3==null){
        return res.json({time1})
    }
    if (time1!=null && time2!=null && time3==null){
        return res.json({time1,time2})
    }
    if (time1==null && time2!=null && time3!=null){
        return res.json({time2,time3})
    }
    if (time1!=null && time2==null && time3!=null){
        return res.json({time1,time3})
    }

    return res.json({time1,time2,time3});
})



module.exports = router;
