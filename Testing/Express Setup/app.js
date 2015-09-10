//------------------------------------------------------------------------------
//  FILENAME: DVM_v_01.js
//  AUTHOR:   J.Gerrand 349361
//  COMMENTS: Fufills the role of the DVM within the Pedestrian Viz System
// -----------------------------------------------------------------------------

// Load dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var socket_io = require('socket.io');
var tcpSock = require('net');

//Routing Config for express
var routes = require('./routes/index');
//var users = require('./routes/users');

//Bind express object to App object
var app = express();

//SARM connection configuration
var tcp_PORT = 4040;
var tcp_HOST = '192.168.1.3';

//----------Socket.io-------------------
var webSock = socket_io();
app.io = webSock;

//Websocket connection handling
webSock.sockets.on("connection", function(socket)
{
  console.log("A socket connected!");

  // TCP Client creattion
  var tcpClient = new tcpSock.Socket();
  tcpClient.setEncoding("ascii");
  tcpClient.setKeepAlive(true);

  // TCP connection
  tcpClient.connect(tcp_PORT, tcp_HOST, function(){
    tcpClient.write("SINK");
    console.info("HTTP Server connected to: " + tcp_HOST);

    // Emit data to Websockets
    tcpClient.on('data', function(data){
      console.log("Recieved Server Data: " + data);
      socket.emit("httpServer_ord", data);
    });

    tcpClient.on('end', function(data){
      console.log("End data: " + data);
    });
  });

  socket.emit("httpServer_msg", "Initial Data");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

//Testing with MongoDB
// mongoose.connect('mongodb://127.0.0.1/NodeDatabase');
// console.log("Connected to MongoDB");

// mongoose.model('users', {name: String});

// app.get('/users', function(req, res){
//   mongoose.model('users').find(function(err, users){
//     res.send(users[1]["name"])
//   });
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
