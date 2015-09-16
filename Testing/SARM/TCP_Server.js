//------------------------------------------------------------------------------
//  FILENAME: SARM_v_01.js
//  AUTHOR:   J.Gerrand 349361
//  COMMENTS: Fufills the role of the SARM within the Pedestrian System
// -----------------------------------------------------------------------------

//Load dependencies
var net = require('net');
var mongoose = require('mongoose');

//Set SARM Parameters
var HOST = '192.168.1.3';
var PORT = 4040;
sinkList = [];
var replicated = 0;

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

//----====DSM Agent definition====------
// Exception Defenition
function DSMAgentException(message){
  this.message = message;
  this.type = "DSMAgentException";
}
// DSM Agent Constructor
function DSMAgent(MongoModel){
  // Data members
  this.channelThreshhold = 40;
  this.MongoModel = MongoModel;
  this.agentChannel = [];
  // Data functions
  this.channelCapacity = function(){
    return (this.channelThreshhold - this.agentChannel.length);
  };
  this.sourcePush = function(dataPoint){
    if(this.channelCapacity() > 0){
      this.agentChannel.push(dataPoint)
    } else{
      throw new DSMAgentException('DSMAgent full');
    }
  };
  this.sinkPull = function(){
    // Callback function
    function bulkInsertValidation(err,inseredtDataPoints){
      if(err){
        return next(err);
      } else{
        console.log("Datapoints pushed to DB");
        return true;
      }
    }
    // Perform bulk insert. This is facillitated as an atomic opperation
    try{
      this.MongoModel.collection.insert(this.agentChannel,bulkInsertValidation);
    } catch(e){
      console.error(e);
    } finally{
          this.agentChannel.length = 0;
    }
  };
}// end DSMAgent constructor
//--------------------------------------

//----====SARM Aggregator definition====------
// DSMAggregator Constructor
function DSMAggregator(MongoModel){
  this.loadAgent1 = new DSMAgent(MongoModel);
  this.loadAgent2 = new DSMAgent(MongoModel);
  this.toggleDirection = 0;
  this.pushDataPoint = function(dataPoint){
    if(this.toggleDirection === 0){
      try{
        this.loadAgent1.sourcePush(dataPoint);
      } catch(e){
        if(e instanceof DSMAgentException){
          console.log("Start sink pull");
          this.loadAgent1.sinkPull();
          this.toggleDirection = 1;
        }//if
      }//catch
    }//toggle === 0
    if(this.toggleDirection === 1){
      try{
        this.loadAgent2.sourcePush(dataPoint);
      } catch(e){
        if(e instanceof DSMAgentException){
          console.log("Start sink pull");
          this.loadAgent2.sinkPull();
          this.toggleDirection = 0;
        }//if
      }//catch
    }//toggle === 1
  };//pushDataPoint
}//SARM Aggregator
//--------------------------------------------

//-==Establish MongoBD connection==-
mongoose.connect('mongodb://192.168.1.3/PedestrianTestingDB');
var PedDB = mongoose.connection;
PedDB.on('error', console.error.bind(console, 'connection error:'));
// Define Schema
var mPointSchema = mongoose.Schema({
  deviceID: String,
  xPos: Number,
  yPos: Number,
  timeStamp: {type:Date, default: Date.now}
})
// Define Schema methods Ref: http://mongoosejs.com/docs/index.html
mPointSchema.methods.streamString = function(){
  var resp = "{" + this.deviceID + "," + this.xPos + "," + this.yPos +
                  this.timeStamp +"}";
  return resp;
}
// Define Model
var mPoint = mongoose.model('mPoint', mPointSchema);
// Define SARM Aggregator
var dsmAggregator = new DSMAggregator(mPoint);
//----------------------------------

// Testing
// var point1 =  new mPoint({
//                           deviceID:"12DDRW223",
//                           xPos:4,
//                           yPos:5});

//Initilise the SARM and Set "Waiting" configuration
var TCPserver = net.createServer();
TCPserver.listen(PORT, HOST);
console.log("SARM waiting on: " + HOST + ":" + PORT);

//Main SARM Event Defenitions
TCPserver.on('connection', function(sock){

  //-==Connection Handling==-
  //Register connection
  console.log("Connected " + sock.remoteAddress);
  //Socket formatting
  sock.setEncoding("ascii");
  sock.setNoDelay(true);

  // Testing variable
  var counter = 0;
  //-==I/O Handling==-
  sock.on('data', function(data){
    // Output data to Sinks
    if(data != "SINK"){
      // Stream handling
      var splitString = data.split(",");
      counter = counter + 1;
      console.log("Received data: " + );
      for (var i = 0; i < sinkList.length; i++) {
        sinkList[i].write(data);
        dsmAggregator.pushDataPoint({"name": "Sally", "Gender":"Female"});
      }
    }
    // Agent type-definition
    if(data === "SINK"){
      var replicated = 0;
      // Verify new connection
      for (var i = 0; i < sinkList.length; i++) {
        if(sinkList[i].remoteAddress === sock.remoteAddress){
          replicated = 1;
        }
      }
      if(replicated != 1){
        //Confirm incoming connection
        sock.write("SARM CONNECTION ESTABLISHED");
        //Add to Sink list
        sinkList.push(sock);
      }
    } //Agent type-definition
    //TODO Aggregation functions
  }); //IO Handling

  //-==Error and Exit Handling==-
  sock.on('error', function(error){
    // Determine if Sink was disconnected
    var remove = 0;
    for (var i = 0; i < sinkList.length; i++) {
      if(sinkList[i].remoteAddress === sock.remoteAddress){
        remove = 1;
      }
    }
    if(remove != 0){
      sinkList.pop(); // This is simplified under the assumption that only 1 DVM module is connected at one time
      console.log("A Sink has been disconnected");
    }
  });//Error Handling
  sock.on('close', function(error){
    // Determine if Sink was disconnected
    var remove = 0;
    for (var i = 0; i < sinkList.length; i++) {
      if(sinkList[i].remoteAddress === sock.remoteAddress){
        remove = 1;
      }
    }
    if(remove != 0){
      sinkList.pop(); // This is simplified under the assumption that only 1 DVM module is connected at one time
      console.log("A Sink has been disconnected");
    }
  });//Exit Handling

}).listen(PORT, HOST); //SARM event definitions
