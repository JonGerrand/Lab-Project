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
var tcp_PORT = 7000;
var tcp_HOST = '192.168.1.11';

//Routing Config for express
var routes = require('./routes/index');

//Bind express object to App object
var app = express();

//----====Helper Functions====------------------
var getTimeStamp = function(dateInfo){
  if(dateInfo === 0){
    var d = new Date();
  } else{
     var d = new Date(dateInfo);
  }
  return d;
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
var StreamDataUnpacker = function(trackDevice){
  this.trackDevice = trackDevice;
  this.prevXPos = 0;
  this.prevYPos = 0;
  this.xPos = 0;
  this.yPos = 0;
  this.deviceID = "";
  this.radius1 = 0;
  this.radius2 = 0;
  this.radius3 = 0;
  this.prevTimeStamp = new Date();
  this.timeStamp = new Date();
  this.unpackData = function(dataPoint){
    var unpackedString = dataPoint.split(",");
    if(unpackedString[0] === this.trackDevice){
        if(getType(unpackedString[0]) === 'string'){
          this.deviceID = unpackedString[0];
        }
        if(getType(unpackedString[1]) === 'string'){
          this.prevXPos = this.xPos;
          this.xPos = unpackedString[1];
        }
        if(getType(unpackedString[2]) === 'string'){
          this.prevYPos = this.yPos;
          this.yPos = unpackedString[2];
        }
        if(getType(unpackedString[3]) === 'string'){
          this.timeStamp = parseFloat(unpackedString[3]);
        }
        if(getType(unpackedString[4]) === 'string'){
          this.radius1 = unpackedString[4];
        }
        if(getType(unpackedString[5]) === 'string'){
          this.radius2 = unpackedString[5];
        }
        if(getType(unpackedString[5]) === 'string'){
          this.radius3 = unpackedString[5];
        }
        return true;
      } else {
        return false;
      }
    }
  this.getXPos = function(){
    return parseFloat(this.xPos);
  }
  this.getYPos = function(){
    return parseFloat(this.yPos);
  }
  this.getDeviceID = function(){
    return this.deviceID;
  }
  this.getTimeStamp = function(){
    return this.timeStamp;
  }
  this.getVelocity = function(){
    var xVel = 0;
    var yVel = 0;
    xVel = (this.xPos-this.prevXPos)/((this.timeStamp-this.prevTimeStamp)*1e-3);
    yVel = (this.yPos-this.prevYPos)/((this.timeStamp-this.prevTimeStamp)*1e-3);
    return Math.sqrt(Math.pow(xVel,2) + Math.pow(yVel,2));
  }
  this.getRadii = function(){
    return [parseFloat(this.radius1),parseFloat(this.radius2),parseFloat(this.radius3)];
  }
}
var DataUnpackerArray = [];
var DataUnpacker_devOne = new StreamDataUnpacker("iPhone");
var DataUnpacker_devTwo = new StreamDataUnpacker("iPad");
DataUnpackerArray.push(DataUnpacker_devOne);
DataUnpackerArray.push(DataUnpacker_devTwo);
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
  this.getPosition = function(xPosMin,xPosMax,yPosMin,yPosMax,socket){
    var queryObject = {};
    queryObject.map = function(){
      emit(this.DeviceID, this.xPos);
    };
    queryObject.reduce = function(key,vals){
      return vals[0];
    };
    queryObject.query = {xPos:{$gt: xPosMin, $lt: xPosMax}};
    queryObject.verbose = true;
    this.model.mapReduce(queryObject,function(err,results,stats){
      if(err) return console.error(err);
      socket.emit('httpServer_histOrd',results);
    }); //mapReduce
  } //getPosition
} //MovementRecord
//-------------------------------------------------

//------------====Mongoose Setup====------------
//-==Establish MongoBD connection==-
// mongoose.connect('mongodb://192.168.1.11/EndToEnd_Atrium_1');
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

// Define models
var mPoint = mongoose.model('mPoint', mPointSchema);
// Create MovementRecord
var movementHistory = new MovementRecord(mPoint);
//----------------------------------------------

//----------Socket.io-------------------
var webSock = socket_io();
app.io = webSock;
//--------------------------------------

//----------Socket handling variables--------------
//-------------------------------------------------

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
      // console.log("Received Data: " + data);
      if(data.search("SARM") === -1){
        // Assign data to correct device aggregator
        console.log("Sink");
        for (var i = 0; i < DataUnpackerArray.length; i++) {
          if(DataUnpackerArray[i].unpackData(data) === true){
            // Packet format: [x,y,DevName]
            socket.emit("httpServer_ord", {x:DataUnpackerArray[i].getXPos(),
                                           y:DataUnpackerArray[i].getYPos(),
                                           ID:DataUnpackerArray[i].getDeviceID()});
            // Packet format: [ID, vel]
            socket.emit("httpServer_vel", {ID:DataUnpackerArray[i].getDeviceID(),
                                           x:DataUnpackerArray[i].getXPos(),
                                           y:DataUnpackerArray[i].getYPos(),
                                           date: DataUnpackerArray[i].getTimeStamp()});

            // Packet format: [ID, x, y]
            socket.emit("httpServer_stats", {ID:DataUnpackerArray[i].getDeviceID(),
                                             x:DataUnpackerArray[i].getXPos(),
                                             y:DataUnpackerArray[i].getYPos()});
            // Packet format : [x,y, Devname, [r1,r2,r3]]
            socket.emit("httpServer_radii", {x:DataUnpackerArray[i].getXPos(),
                                             y:DataUnpackerArray[i].getYPos(),
                                             ID:DataUnpackerArray[i].getDeviceID(),
                                             radii:DataUnpackerArray[i].getRadii()})
            }
          }
        }
      });
    // Web socket closed
    socket.on('disconnect',function(){
      clearInterval();
      tcpClient.destroy();
      });
    // Data handling from browser
    socket.on('Temporal_query',function(data){
      movementHistory.getDateRange(data.min,data.max,socket);
      // movementHistory.getPosition(data.min,data.max,data.min,data.max,socket);
      }); //Websocket received data
    }); //tcpClient connection
  }); //Websocket connection

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
