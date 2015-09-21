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
var tcp_HOST = '192.168.1.11';

//Routing Config for express
var routes = require('./routes/index');
//var users = require('./routes/users');

//Bind express object to App object
var app = express();

//----====Helper Functions====------------------
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

var getType = function(element){
  return ({}).toString.call(element).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};
//----------------------------------------------

//------------====StreamExtractor====------------
var StreamDataUnpacker = function(){
  this.xPos = 0;
  this.yPos = 0;
  this.deviceID = "";
  this.timeStamp = "";
  this.unpackData = function(dataPoint){
    var unpackedString = dataPoint.split(",");
    if(getType(unpackedString[0]) === 'string'){
      this.deviceID = unpackedString[0];
    }
    if(getType(unpackedString[1]) === 'string'){
      this.xPos = unpackedString[1];
    }
    if(getType(unpackedString[2]) === 'string'){
      this.yPos = unpackedString[2];
    }
    if(getType(unpackedString[3]) === 'string'){
      this.timeStamp = unpackedString[3];
    }
  }
  this.getXPos = function(){
    return this.xPos;
  }
  this.getYPos = function(){
    return this.yPos;
  }
  this.getDeviceID = function(){
    return this.deviceID;
  }
  this.getTimeStamp = function(){
    return this.timeStamp;
  }
}
var DVMDataUnpacker = new StreamDataUnpacker();
//-----------------------------------------------

//------------====HistoricalQueries====------------
var MovementRecord = function(model){
  this.model = model;
  this.getDateRange = function(min,max,socket){
    var queryObject = {};
    queryObject.map = function(){
      emit(this.TimeStamp,{id:this.DeviceID,x:this.xPos, y:this.yPos});
    };
    queryObject.reduce = function(key,vals){
      return vals[0];
    };
    queryObject.query = {TimeStamp:{$gt: min, $lt: max}};
    queryObject.verbose = true;
    queryObject.out = {inline:1};
    this.model.mapReduce(queryObject,function(err,results,stats){
      if(err) return console.error(err);
      console.log(stats);
      socket.emit('httpServer_histOrd',results);
    }); //mapReduce
  }; //getDateRange
} //MovementRecord
//-------------------------------------------------

//------------====Mongoose Setup====------------
//-==Establish MongoBD connection==-
mongoose.connect('mongodb://192.168.1.11/PedestrianTestingDB');
var PedDB = mongoose.connection;
PedDB.on('error', console.error.bind(console, 'connection error:'));
// Define Schema
var mPointSchema = new mongoose.Schema({
  DeviceID: String,
  xPos: Number,
  yPos: Number,
  TimeStamp: Date
});

var historicalMPointSchema = new mongoose.Schema({
  _id: Date,
  value: {id:String, x:Number, y:Number}
});
// Define models
var mPoint = mongoose.model('mPoint', mPointSchema);
var mPointMapRed = mongoose.model('mPointMRresult',historicalMPointSchema);
// Create MovementRecord
var movementHistory = new MovementRecord(mPoint);
//----------------------------------------------

//----------Socket.io-------------------
var webSock = socket_io();
app.io = webSock;
//--------------------------------------

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
      console.log("Received Data: " + data);
      if(data.search("SARM") === -1){
          DVMDataUnpacker.unpackData(data);
          socket.emit("httpServer_ord", DVMDataUnpacker.getXPos() + "," + DVMDataUnpacker.getYPos());
          //socket.emit("httpServer_alert", data);
          // socket.emit("httpServer_msg",DVMDataUnpacker.getXPos() + "," + DVMDataUnpacker.getYPos());
        }
      });
    // Web socket closed
    socket.on('disconnect',function(){
      clearInterval();
      tcpClient.destroy();
      });
    // Data handling from browser
    socket.on('histHeatmap_query',function(data){
      movementHistory.getDateRange(data.min,data.max,socket);
      }); //Websocket received data
    }); //tcpClient connection
  }); //Websocket connection

  // console.log(data);
  // mPoint.find({xPos:158},function(err,mpoints){
  //     if(err) return console.error(err);
  //     console.log(mpoints);


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
