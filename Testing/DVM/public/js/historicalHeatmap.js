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
// Scaling variables
var x_pixle = $('#heatmapContainerWrapper').width();
var y_pixel = $('#heatmapContainerWrapper').height();
// Scale received values
var ords = {};
function scaleOrds(x,y){
  var x_fixed = 5;
  var y_fixed = 4;
  var x_scaled = x/x_fixed;
  var y_scaled = y/y_fixed;
  var x_mapped = (x_scaled*x_pixle);
  var y_mapped = (y_scaled*y_pixel);
  return {x:x_mapped, y:y_mapped};
}
// -----------------------
// ----------------------------

// Historical data retrieval
// create a heatmap instance
var heatmap = h337.create({
  container: document.getElementById('heatmapContainer'),
  maxOpacity: .6,
  radius: 10,
  blur: .90,
  // backgroundColor with alpha so you can see through it
  backgroundColor: 'rgba(19, 122, 154, 0.12)'
});
var heatmapContainer = document.getElementById('heatmapContainerWrapper');

// Data request via websocket
$('#TrialButton').click(function(){
  var date1 = $("#datetimepicker1").data();
  date1 = new Date(date1.date);
  var date2 = $("#datetimepicker2").data();
  date2 = new Date(date2.date);
  if(isValidDate(date1) === false || isValidDate(date2) ===false){
    window.alert("Invalid date-range selected. Ensure both date ranges are logical.");
  } else {
    $('#TrialButton').get(0).lastChild.nodeValue = " Loading...";
    $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
    Websocket.emit('Temporal_query',{min: date1, max: date2});
  }
});

// Receive Temporal data from query
Websocket.on('httpServer_histOrd',function(histOrds){
  var histPoints = [];
  for (var i = 0; i < histOrds.length; i++) {
    ords = scaleOrds(histOrds[i].value.x,histOrds[i].value.y)
    var point = {x:ords.x, y:ords.y, value:0.1};
    histPoints.push(point);
  }
  $('#TrialButton').get(0).lastChild.nodeValue = "Submit Date Range";
  $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
  if(histPoints.length === 0){
    histPoints.push({x:-10, y:-10, value:0});
  }
  // Note - Do not insert data values of 0 this will crash the entire webpage!
  data = {max:1, min:0, data:histPoints};
  heatmap.setData(data);
});
