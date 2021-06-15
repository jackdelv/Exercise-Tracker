const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
  date: String,
  duration: String,
  description: String
});

const userSchema = new mongoose.Schema({
  _id: String,
  username: String,
  log: [logSchema]
});

var User = mongoose.model('User', userSchema);
var Log = mongoose.model('Log', logSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users').get(function(req, res, done) {
  User.find({}, function(err, data) {
    if (err) return console.error(err);
    res.json(data);
    done(null, data);
  })}).post(function(req, res, done){
  var uname = req.body.username;
  var uid = Math.floor(Math.random() * 100000000000000000).toString(16);
  var user = new User({_id: uid, username: uname});
  user.save(function(err, data){
    if (err) return console.error(err);
    res.json({_id: uid, username: uname});
    done(null, data);
  });
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
