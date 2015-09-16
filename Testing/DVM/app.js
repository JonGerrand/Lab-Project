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

//SARM connection configuration
var tcp_PORT = 4040;
var tcp_HOST = '192.168.43.192';

//Routing Config for express
var routes = require('./routes/index');
//var users = require('./routes/users');

//Bind express object to App object
var app = express();

//----====Helper Functions====------
var getTimeStamp = function(dateInfo){
  if(dateInfo === 0){
    var d = new Date();
  } else{
     var d = new Date(dateInfo);
  }
  return d.getYear() + ":" + d.getMonth() + ":" + d.getDate() + ":" + d.getHours() +
          ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
};

var convertMsToTimestamp = function(msString){
  var recvTime = parseFloat(msString);
  recvTime = recvTime*1000;
  return getTimeStamp(recvTime);
};
//----------------------------------

// Testing variables
var pi_old = 0;
var gateway_old = 0;
var sarm_old = 0;
var dvm_old = 0;
var pi_new = 0;
var gateway_new = 0;
var sarm_new = 0;
var dvm_new = 0;
var dataCount = 0;

//----------Socket.io-------------------
var webSock = socket_io();
app.io = webSock;

//Websocket connection handling
webSock.sockets.on("connection", function(socket){
  console.log("A socket connected!");
  // TCP Client creattion
  var tcpClient = new tcpSock.Socket();
  tcpClient.setEncoding("ascii");
  tcpClient.setKeepAlive(true);
  tcpClient.setNoDelay(true);
  // TCP connection
  tcpClient.connect(tcp_PORT, tcp_HOST, function(){
    tcpClient.write("SINK");
    console.info("HTTP Server connected to: " + tcp_HOST);
    // Connection message to browser
    socket.emit("httpServer_msg", "Connected to HTTP Server");
    // Emit data to Websockets
    tcpClient.on('data', function(data){
      console.log("Received Data");
      // Delta calculations
      var timeStamps = data.split(",")
      pi_old = pi_new;
      gateway_old = gateway_new;
      sarm_old = sarm_new;
      dvm_old = dvm_new;
      dvm_new = new Date();
      pi_new = new Date(parseFloat(timeStamps[1]));
      gateway_new = new Date(parseFloat(timeStamps[2]));
      sarm_new = new Date(parseFloat(timeStamps[3]));
      var delta_pi = pi_new - pi_old;
      var delta_gateway = gateway_new - gateway_old;
      var delta_sarm = sarm_new - sarm_old;
      var delta_dvm = dvm_new - dvm_old;
      console.log("Pi: " + delta_pi + " Gate: " + delta_gateway + " SARM: " + delta_sarm + " DVM: " + delta_dvm);
      socket.emit("httpServer_ord", data + ", DVM: " + delta_dvm);
      // socket.emit("httpServer_alert", data);
      socket.emit("httpServer_msg",  data + ", DVM: " + delta_dvm)
      });
    // Web socket closed
    socket.on('disconnect',function(){
      clearInterval();
      tcpClient.destroy();
      });
    });
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
