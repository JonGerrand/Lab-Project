// Generate a Timestamp for data
var getTimeStamp = function(){
  var d = new Date();
  return d.getDate() + ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
};
