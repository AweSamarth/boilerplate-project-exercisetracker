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
  userid: { type: String },
  username: { type: String, required: false },
  description: { type: String, required: true },
  duration: { type: Number },
  date: { type: Number },
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
      const theresponse = User.findOne(
        { username: req.body.username },
        function (err, foundit) {
          res.send(foundit);
        }
      );

      // console.log("checking");
    });
  };
  createUser();
});

app.post("/api/users/:id/exercises", (req, res) => {
  let username, date;
  User.findById(req.params.id, function (err, personFound) {
    if (err) return console.error("mila hi nahi");
    else {
      console.log(req.params.id);
      // console.log(personFound);
      username = personFound.username;
      let id = req.params.id;
      let description = req.body.description;
      let duration = req.body.duration;

      if (!req.body.date) {
        date = Date.parse(new Date());
        console.log(date)
      } else {
        console.log(date)
        date = Date.parse(new Date(req.body.date));
      }
      var createExercise = function () {
        var someExercises = new Exercises({
          userid: id,
          username: username,
          description: description,
          duration: duration,
          date: date,
        });
        // console.log(someExercises);
        someExercises.save(function (err, data) {
          if (err) return console.error(err);
          // console.log("let's see if this works!");
          const exeresponse = Exercises.findOne(
            {
              username: username,
              description: description,
              duration: duration,
              date: date,
            },
            function (err, foundit) {
              if (err) {res.send("couldn't post") 
              return "error"}
              console.log(foundit.date);
              // console.log(foundit.date);
              let properdate = new Date((foundit.date)).toDateString();
              console.log(properdate)
              res.json({
                _id: id,
                username: foundit.username,
                description: foundit.description,
                duration: foundit.duration,
                date: properdate,
              });
            }
          );
        });
      };
      createExercise();
    }
  });
});
//

app.get("/api/testing", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;
  res.json({ first: first, second: second });
});
app.get("/api/users", (req, res) => {
  User.find(function (err, hereitis) {
    if (err) return console.error(err);
    else {
      // console.log(hereitis);
      res.send(hereitis);
    }
  });
});

app.get("/api/users/:id/logs", (req, res) => {
  let id = req.params.id;
  let from = 0 //
  let to = Infinity
  let limit = Infinity
  // console.log(from)
  // console.log(to)
  if (req.query.from){ 
    from = Date.parse(new Date(req.query.from))
  }
  if(req.query.to){
    to = Date.parse(new Date(req.query.to))
  }
  if (req.query.limit){
    limit = Number(req.query.limit)
  }
  // console.log(from)
  // console.log(limit)
  const logger = Exercises.find({ userid: id, date:{"$gt":from, "$lt":to} }, function (err, loggedit) {
    if (loggedit.length==0) {
      res.send("no matching entries found")
       return ("no such records found")}
    // console.log(loggedit);
    // console.log(loggedit.length);
    let username = loggedit[0].username;
    // console.log(username);
    let newarray = loggedit.map((ele)=>{
      let some= new Date(ele.date).toDateString()
    return (
      {
        description:ele.description,
        duration: ele.duration,
        date:some
      }
    
    )
    }

    )
    // console.log(newarray)
    if (limit<newarray.length){
      newarray.length=limit
    }
    res.json({
      username: username,
      count: loggedit.length,
      id: req.params.id,
      log: newarray,
    });
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
//
