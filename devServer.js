'use strict';

var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');
var session = require('express-session');
var cors = require('cors');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var app = express();
var compiler = webpack(config);

var passport = require('passport');
require('./config/passport')(passport);

var User = require('./server/models/User');
//set env vars
process.env.MONGOLAB_URI = process.env.MONGOLAB_URI || 'mongodb://localhost/chat_dev';
process.env.PORT = process.env.PORT || 3000;

console.log("pass")
// connect our DB
mongoose.connect(process.env.MONGOLAB_URI);
process.on('uncaughtException', function (err) {
  console.log(err);
});

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

app.use(cors());
app.use(session({
  secret: 'keyboard kitty',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000000 }
}));
console.log("pass")
app.use(passport.initialize());
app.use(passport.session());
console.log("pass")
//load routers
var messageRouter = express.Router();
var usersRouter = express.Router();
var channelRouter = express.Router();
console.log("passbb")
require('./server/routes/message_routes')(messageRouter);
console.log("passba")
require('./server/routes/channel_routes')(channelRouter);
console.log("passbb")
require('./server/routes/user_routes')(usersRouter, passport);
console.log("passbc")
app.use('/api', messageRouter);
app.use('/api', usersRouter);
app.use('/api', channelRouter);
console.log("passcc")
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});
console.log("passaaa")
var webpackServer = app.listen(process.env.PORT, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('server listening on port: %s', process.env.PORT);
});

// attach socket.io onto our development server
var io = require('socket.io')(webpackServer);
var socketEvents = require('./socketEvents')(io);
