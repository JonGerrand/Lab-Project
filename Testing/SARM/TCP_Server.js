//------------------------------------------------------------------------------
//  FILENAME: SARM_v_01.js
//  AUTHOR:   J.Gerrand 349361
//  COMMENTS: Fufills the role of the SARM within the Pedestrian System
// -----------------------------------------------------------------------------

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

//Load dependencies
var net = require('net');
var mongoose = require('mongoose');

//Set SARM Parameters
var HOST = '192.168.1.2';
var PORT = 4040;
sinkList = [];
var replicated = 0;

//-==Establish MongoBD connection==-
// mongoose.connect('mongodb://192.168.1.4/PedestrianTestingDB');
// var PedDB = mongoose.connection;
// PedDB.on('error', console.error.bind(console, 'connection error:'));
// // Define Schema
// var mPointSchema = mongoose.Schema({
//   deviceID: String,
//   xPos: Number,
//   yPos: Number,
//   timeStamp: {type:Date, default: Date.now}
// })
// // Define Schema methods Ref: http://mongoosejs.com/docs/index.html
// mPointSchema.methods.streamString = function(){
//   var resp = "{" + this.deviceID + "," + this.xPos + "," + this.yPos +
//                   this.timeStamp +"}";
//   return resp;
// }
// // Define Model
// var mPoint = mongoose.model('mPoint', mPointSchema);
// //----------------------------------
//
// // Testing
// var point1 =  new mPoint({
//                             deviceID:"12DDRW223",
//                             xPos:4,
//                             yPos:5});
//
// console.log(point1.streamString());
//
// point1.save(function(err){
//   if(err) return console.error(err);
// })
//
// mPoint.find(function(err,res){
//   if (err) return console.error(err);
//   console.log(res);
// })

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

  //-==I/O Handling==-
  sock.on('data', function(data){
    // Output data to Sinks
    if(data != "SINK"){
      // Testing
      var Gateway = convertMsToTimestamp(data);
      var Sarm = getTimeStamp(0);
      console.log("Gateway:" + Gateway + ",SARM: " + Sarm);
      for (var i = 0; i < sinkList.length; i++) {
        sinkList[i].write("Gateway:" + Gateway + ", SARM: " + Sarm);
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

  //-==Error Handling==-
  sock.on('error', function(error){
    sinkList.pop(); // This is simplified under the assumption that only 1 DVM module is connected at one time
    console.log("A Sink has been disconnected");
  });//Error Handling

}).listen(PORT, HOST); //SARM event definitions
