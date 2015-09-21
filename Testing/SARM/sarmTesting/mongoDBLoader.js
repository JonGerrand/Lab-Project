// File:          mongoDBLoader.js
// Author:        Jonathan Gerrand 349361
// Description:   Basic file for loading an arbritary number of entries into mongoDBLoader

var mongoose = require('mongoose');

// Helper functions
var genRandomNum = function(min,max){
  return Math.floor(Math.random() * max) + min;
}
function bulkInsertValidation(err,inseredtDataPoints){
  if(err){
    return next(err);
  } else{
    console.log("Datapoints pushed to DB");
    console.timeEnd("dbsave");
    return true;
  }
}

// Setup Mongo client
mongoose.connect('mongodb://192.168.1.3/PedestrianTestingDB');
var PedDB = mongoose.connection;
PedDB.on('error', console.error.bind(console, 'connection error:'));
// Define Schema
var mPointSchema = new mongoose.Schema({
  DeviceID: String,
  xPos: Number,
  yPos: Number,
  TimeStamp: {type:Date, default: Date.now}
})
var mPoint = mongoose.model('mPoint', mPointSchema);
// Perform a bulk upload
console.log("Starting Document creation");
var numEntry = 3;
var numDevice = 10000;
var insertionArray = [];
for(var j = 0; j < numEntry; j++ ){
  for (var i = 0; i < numDevice; i++) {
    insertionArray.push({"DeviceID":"Device" + j.toString(),"xPos":genRandomNum(1,900), "yPos":genRandomNum(1,500),
            "TimeStamp":new Date(1442404311781+(i*30000))});
  }
  console.log("Completed Device" + j.toString());
}

// Perform bulk insertion and get execution time
console.log("Start document push: " + (numEntry * numDevice));
console.time("dbsave");
try{
  mPoint.collection.insert(insertionArray,bulkInsertValidation);
} catch(e){
  console.error(e);
}
// var end = performance.now();
// console.log("Process took: " + (end-start) + " ms");
