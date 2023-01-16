require("dotenv").config({ path: "sample.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("strictQuery", false);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userSchema = new Schema({
  username: { type: String, required: true },
});

const exercisesSchema = new Schema({
  username: { type: String, required: false },
  description: { type: String, required: true },
  duration: { type: String },
  date: { type: Date },
});

const logSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, required: true },
  log: { type: [Object], required: true },
});

const User = mongoose.model("User", userSchema);
const Exercises = mongoose.model("Exercises", exercisesSchema);
const Log = mongoose.model("Log", logSchema);

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  console.log(req.body.username);
  var createUser = function () {
    var someName = new User({ username: req.body.username });
    someName.save(function (err, data) {
      if (err) return console.error(err);

      console.log("checking");
    });
  };
  createUser();
  res.json("done");
});

app.post("/api/users/:id/exercises",  (req, res) => {
  let username,date
   User.findById(req.params.id, function (err, personFound) {
    if (err) return console.error(err);
    else {
      console.log(personFound.username)
      username=personFound.username
      let id = req.body.id;
      let description = req.body.description;
      let duration = req.body.description;
      if (req.body.date == "") {
         date = new Date().toLocaleDateString("en-CA");
      } else {
         date = new Date(req.body.date).toLocaleDateString("en-CA");
      }
      var createExercise = function(){
      var someExercises = new Exercises({
        _id:id,
        username:username,
        description:description,
        duration:duration,
        date:date
      }) 
  
      someExercises.save(function(err, data){
        if(err) return console.error(err)
        console.log("let's see if this works!")
      })
  
    }
    createExercise()
    }
  });

  res.json("this worked");
});

const listener = app.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
