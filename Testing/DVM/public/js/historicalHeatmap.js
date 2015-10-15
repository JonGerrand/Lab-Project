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
console.log(x_pixle);

// Define heatmap scales
var heatXscale = d3.scale.linear()
    .domain([-5,10])
    .range([0, x_pixle]);

var heatYscale = d3.scale.linear()
    .domain([-5,10])
    .range([0, y_pixel]);

// Scale received values
var ords = {};
// Scale received values
function scaleOrds(x,y){
  var x_mapped = heatXscale(x);
  var y_mapped = heatYscale(y);
  return {x:x_mapped, y:y_mapped};
}
// -----------------------

// --------D3 brush-------
// Brush is to take data pushed historically and retun all data points between
// given brush values.
function createTimeBrush(inData){
  // Function variables
  var brushHeight = 80;
  var width = $('#heatmapBrush').width();
  // Determine the min/max values of indata
  var minDate = d3.min(inData, function(d){return d.date;}); //Initial estimate
  var maxDate = d3.max(inData, function(d){return d.date;}); //Initial estimate
  for (var i = 0; i < inData.length; i++) {
    var currentMinDate = d3.min(inData[i], function(d){return d.date;});
    var currentMaxDate = d3.max(inData[i], function(d){return d.date;});
    if(currentMinDate < minDate) minDate = currentMinDate;
    if(currentMaxDate > maxDate) maxDate = currentMaxDate;
  }
  // Configure Timescale
  var timescale = d3.time.scale()
    .domain([d3.time.second(minDate), d3.time.second(maxDate)])
    .range([0,width]);

  // Append brush area
  var brushContainer = d3.select("#heatmapBrush")
      .append("svg")
      .attr("width", width)
      .attr("height", brushHeight);

  // Tick spacing calculation
  var upSpacing = getUpTickSpacing();
  var lowSpacing = getLowTickSpacing();

 // Create Upper x axis
 var upxDateAxis = d3.svg.axis()
     .scale(timescale)
     .orient("top")
     .ticks(d3.time.minutes, upSpacing)
     .tickFormat(d3.time.format("%a %e - %H:%M"))
     .tickSize(6, 0, 0);

 // Create Lower x axis
 var lowxDateAxis = d3.svg.axis()
     .scale(timescale)
     .orient("bottom")
     .ticks(d3.time.minutes, lowSpacing)
     .tickFormat(d3.time.format("%H:%M"))
     .tickSize(6, 0, 0);

 //create data brush
 var brushArea = brushContainer.append("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .attr("width", width)
      .attr("height", brushHeight);

  //Append Upper x-axis
  var upperTicks = brushArea.append("g")
       .attr("transform", "translate(0," + (brushHeight - 30) + ")")
       .attr("class", "axis date")
       .call(upxDateAxis);

  upperTicks.append("line")
       .attr("x1", 0)
       .attr("y1", 0)
       .attr("x2", width)
       .attr("y2", 0)
       .attr("class", "axis date")

 //Append Upper x-axis
 var lowwerTicks = brushArea.append("g")
      .attr("transform", "translate(0," + (brushHeight - 25) + ")")
      .attr("class", "axis date")
      .call(lowxDateAxis);

 lowwerTicks.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (width))
      .attr("y2", 0)
      .attr("class", "axis date")

  brushArea.append("rect")
       .attr("pointer-events", "painted")
       .attr("width", (width))
       .attr("height", brushHeight)
       .attr("visibility", "hidden");

   var brush = d3.svg.brush()
       .x(timescale)
       .extent([d3.time.second(minDate),d3.time.second(maxDate)])
       .on("brush", displayHeatmap);

   brushArea.append("g")
       .attr("class", "x brush")
       .call(brush)
       .selectAll("rect")
       .attr("y",1)
       .attr("height", brushHeight - 1);

  displayHeatmap();

   function displayHeatmap(){
     var minExtent = d3.time.second(brush.extent()[0]);
     var maxExtent = d3.time.second(brush.extent()[1]);
     console.log("Min val: " + minExtent);
     console.log("Max val: " + maxExtent);
       // Filter data
       var visDat = inData.filter(function(d){
         return d.date < maxExtent && d.date > minExtent
       });
        // Redraw graphs
        if(visDat.length === 0){
          visDat.push({x:-30, y:-30, value:0});
        }
        data = {max:1, min:0, data:visDat};
        heatmap.setData(data);
    } //displayHeatmap

   function getUpTickSpacing(){
     if(timescale.domain()[1] - timescale.domain()[0] > 3010000){
       return 40;
     }
     if(timescale.domain()[1] - timescale.domain()[0] > 786000){
       return 20;
     }
     if(timescale.domain()[1] - timescale.domain()[0] > 550000){
       return 10;
     }
     else return 5;
   }//getUpTickSpacing

   function getLowTickSpacing(){
     if(timescale.domain()[1] - timescale.domain()[0] > 3010000){
       return 10;
     }
     if(timescale.domain()[1] - timescale.domain()[0] > 786000){
       return 5;
     }
     if(timescale.domain()[1] - timescale.domain()[0] > 550000){
       return 2;
     }
     else return 1;
   }//getLowTickSpacing
}
// -----------------------

// ----------------------------

// Historical data retrieval
// create a heatmap instance
var heatmap = h337.create({
  container: document.getElementById('heatmapContainer'),
  maxOpacity: .6,
  radius: 20,
  blur: .90,
  // backgroundColor with alpha so you can see through it
  backgroundColor: 'rgba(251, 252, 252, 0.12)'
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
    ords = scaleOrds(histOrds[i]._id.x,histOrds[i]._id.y)
    var point = {x:ords.x, y:ords.y, value:0.1, date:new Date(histOrds[i]._id.date)};
    histPoints.push(point);
  }
  $('#TrialButton').get(0).lastChild.nodeValue = "Submit Date Range";
  $("#mapRedLoading").toggleClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
  if(histPoints.length === 0){
    console.log("No points");
    histPoints.push({x:-10, y:-10, value:0});
  } else {
    // Populate the heatmap and append a slidable time navigator
    createTimeBrush(histPoints);
    displayHeatmap();
  }
});

Websocket.on('httpServer_avgX',function(avgData){
  console.log(avgData);
});
