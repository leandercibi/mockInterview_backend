const express = require("express");
const app = express();
const cors = require("cors");

//middleware

app.use(cors());
app.use(express.json());

//routes

app.use("/authentication", require("./routes/jwtAuth"));

app.use("/dashboard", require("./routes/dashboard"));

app.use("/interviewWithMentor", require("./routes/interviewWithMentor"));

app.get("/",(req,res)=> {
  res.json({message: "Welcome to HeyPM"})
});


app.listen(8080, () => {
  console.log(`Server is starting on port 5000`);
});

