// Create websocket connection
var Websocket = io();

// Configure Date-time Picker
// Code referenced from: https://eonasdan.github.io/bootstrap-datetimepicker/
$(function () {
       $('#datetimepicker1').datetimepicker();
       $('#datetimepicker2').datetimepicker({
           useCurrent: false
       });
       $("#datetimepicker1").on("dp.change", function (e) {
           $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
       });
       $("#datetimepicker2").on("dp.change", function (e) {
           $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
       });
   });

   // ---===Helper functions===---
   var getType = function(element){
      return ({}).toString.call(element).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
   };
   // Validate date values
   function isValidDate(date){
     if(getType(date) !== "date") return false;
     return !isNaN(date.getTime());
   }
  //  --------------------------


// Query button
// Data request via websocket
$('#TrialButton').click(function(){
  var date1 = $("#datetimepicker1").data();
  date1 = new Date(date1.date);
  var date2 = $("#datetimepicker2").data();
  date2 = new Date(date2.date);
  if(isValidDate(date1) === false || isValidDate(date2) ===false){
    window.alert("Invalid date-range selected. Ensure both date ranges are logical");
  } else {
    $('#TrialButton').get(0).lastChild.nodeValue = " Loading...";
    $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
    Websocket.emit('Temporal_query',{min: date1, max: date2});

  }
});

// Receive Temporal data from query
Websocket.on('httpServer_histOrd',function(histOrds){
  var dev1Name = "Kathy";
  var dev2Name = "Noel";
  var dev1Data = [];
  var dev2Data = [];
  var stringGraphData = [];
  for (var i = 0; i < histOrds.length; i++) {
    var point = {x:histOrds[i]._id.x, y:histOrds[i]._id.y, date:new Date(histOrds[i]._id.date), id:histOrds[i]._id.id};
    // var point = {x:histOrds[i].value.x, y:histOrds[i].value.y, date:new Date(histOrds[i]._id), id:histOrds[i].value.id};
    if(point.id === dev1Name){
      dev1Data.push(point);
    }
    if(point.id === dev2Name){
      dev2Data.push(point);
    }
  }
  // Sort received data
  dev1Data.sort(function(a,b){
    return new Date(a.date) - new Date(b.date);
  });
  dev2Data.sort(function(a,b){
    return new Date(a.date) - new Date(b.date);
  });
  // Push resultant data to vis object
  stringGraphData.push(dev1Data);
  stringGraphData.push(dev2Data);
  $('#TrialButton').get(0).lastChild.nodeValue = "Submit Date Range";
  $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
  d3.select("#stringVis").html("");
  d3.select("#stringBrush").html("");
  createStringGraph(stringGraphData);
});
