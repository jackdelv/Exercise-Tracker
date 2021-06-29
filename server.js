const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var mongoose = require('mongoose');
var bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  log: [{date: String, duration: Number, description: String}]
});

var User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users').get(function(req, res, done) {
  User.find({}, '_id username __v', function(err, data) {
    if (err) return console.error(err);
    res.json(data);
    done(null, data);
  })}).post(function(req, res, done){
    var uname = req.body.username;
    var user = new User({username: uname});
    user.save(function(err, data){
      if (err) return console.error(err);
      res.json({username: uname, _id: data._id});
      done(null, data);
    });
});

app.post('/api/users/:_id/exercises', function(req, res, done) {
  var date;
  if (req.body.date == "") {
    var date = new Date().toString();
  } else {date = new Date(req.body.date).toString();}
  
  date = date.substring(0, date.indexOf(':') - 3);
  
  User.findOneAndUpdate({_id: req.params._id}, {$push: {log: [{date: date, duration: req.body.duration, description: req.body.description}]}}, function(err, data){
      if(err) return console.log(err);
      res.json({_id: data.id, username: data.username, date: date, duration: req.body.duration, description: req.body.description});
      done(err, data);
    });
});

app.get('/api/users/:_id/logs', function(req, res, done) {
  var from = new Date(req.query.from);
  var to =  new Date(req.query.to);
  var limit = req.query.limit;

  function dateMap(x) {
    var y = new Date(x.date);
    if (y.getTime() > from.getTime() && y.getTime() < to.getTime()) return true;
    return false;
    }
  
  User.findById(req.params._id, function(err, data) {
    if (err) return console.log(err);
    res.json({_id: data.id, username: data.username, count: data.log.length, log: data.log.filter(dateMap).slice(0, limit)});
    done(err, data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
