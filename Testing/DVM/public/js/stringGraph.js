// String graph
// Created by: Jonathan Gerrand 349361
// Dependancies: -D3.js
//               -jQuery > v2.0
// Comments:  Used within the Pedestrian movement Visualisation Framework

var createStringGraph = function(inData){

  // Reordering function
  // Referenced from: http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
  d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
    });
  };

  // Variable declaration
  var deviceClass = ["dev1","dev2"];
  var minDate = d3.min(inData[0], function(d){return d.date;}); //Initial estimate
  var maxDate = d3.max(inData[0], function(d){return d.date;}); //Initial estimate
  var margin = {top: 0, right: 0, bottom: 0, left: 0}
    , width = $('#stringVis').width() - margin.left - margin.right
    , height = $('#stringVis').height() - margin.top - margin.bottom
    , brushHeight = height * 0.1
    , mainHeight = height - brushHeight;
  // Max-min values
  for (var i = 0; i < inData.length; i++) {
    var currentMinDate = d3.min(inData[i], function(d){return d.date;});
    var currentMaxDate = d3.max(inData[i], function(d){return d.date;});
    if(currentMinDate < minDate) minDate = currentMinDate;
    if(currentMaxDate > maxDate) maxDate = currentMaxDate;
  }

  // Scale configuration
  var x = d3.time.scale()
    .domain([d3.time.second(minDate), d3.time.second(maxDate)])
    .range([0,width]);
  var xCoordScale = d3.scale.linear()
    .domain([-5,10])
    .range([0,width]);
  var yCoordScale = d3.scale.linear()
    .domain([-5,10])
    .range([0,mainHeight]);

  // Create Legend div
  var tooltip = d3.select("#stringVis").append("div")
      .attr("class", "StringTooltip")
      .style("opacity", 0)
      .attr("x", 10)
      .attr("y", 10);

 //The Main SVG Container
 var svgContainer = d3.select("#stringVis")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

//The Brush SVG Container
var brushContainer = d3.select("#stringBrush")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", brushHeight);


 // Create filter element for string graph
 var defs = svgContainer.append("defs");

 var filter = defs.append("filter")
      .attr("id","lineBlur");

 filter.append("feGaussianBlur")
     .attr("stdDeviation", 2.5)
     .attr("result","coloredBlur");

 var feMerge = filter.append("feMerge");

 feMerge.append("feMergeNode")
     .attr("in","coloredBlur");

 feMerge.append("feMergeNode")
     .attr("in","SourceGraphic");

  // Tick spacing calculation
  var upSpacing = getUpTickSpacing();
  var lowSpacing = getLowTickSpacing();

 // Create Upper x axis
 var upxDateAxis = d3.svg.axis()
     .scale(x)
     .orient("top")
     .ticks(d3.time.minutes, upSpacing)
     .tickFormat(d3.time.format("%a %e - %H:%M"))
     .tickSize(6, 0, 0);

 // Create Lower x axis
 var lowxDateAxis = d3.svg.axis()
     .scale(x)
     .orient("bottom")
     .ticks(d3.time.minutes, lowSpacing)
     .tickFormat(d3.time.format("%H:%M"))
     .tickSize(6, 0, 0);

 // Line creation
 var lineFunction = d3.svg.line()
      .x(function(d) { return xCoordScale(d.x); })
      .y(function(d) { return yCoordScale(d.y); })
      .interpolate("basis");

// Legend Line creation
var legendlineFunction = d3.svg.line()
     .x(function(d) { return d.x; })
     .y(function(d) { return d.y; })
     .interpolate("linear");

 //create data brush
 var brushArea = brushContainer.append("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .attr("width", (width + margin.left + margin.right) )
      .attr("height", brushHeight);

 //Append Upper x-axis
 var upperTicks = brushArea.append("g")
      .attr("transform", "translate(0," + (brushHeight - 30) + ")")
      .attr("class", "axis date")
      .call(upxDateAxis);

 upperTicks.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (width + margin.left + margin.right))
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
     .attr("x2", (width + margin.left + margin.right))
     .attr("y2", 0)
     .attr("class", "axis date")

 brushArea.append("rect")
      .attr("pointer-events", "painted")
      .attr("width", (width + margin.left + margin.right))
      .attr("height", brushHeight)
      .attr("visibility", "hidden");

  var brush = d3.svg.brush()
      .x(x)
      .extent([d3.time.second(minDate),d3.time.second(maxDate)])
      .on("brush", displayLines);

  brushArea.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y",1)
      .attr("height", brushHeight - 1);

  // Draw lines
  for (var i = 0; i < inData.length; i++) {

    drawLines(inData[i],i);

    // Format tooltip
    var legendElement = tooltip.append("div");

    var legendSVG =  legendElement.append("svg")
      .attr("width",150)
      .attr("height", (inData.length*10));

    legendSVG.append("path")
      .attr("d", legendlineFunction([{"x":1,"y":6},{"x":50,"y":6}]))
      .attr("class", deviceClass[i])
      .attr("stroke-width", 3)
      .attr("fill", "none");

    legendSVG.append("text")
      .attr("x", 55)
      .attr("y", 10)
      .attr("fill","white")
      .text(inData[i][0].id);
  }

  var LegendRect = svgContainer.append("g")
      .attr("transform", "translate(0," + 0 + ")");

  displayLines();

 function displayLines(){
   var minExtent = d3.time.second(brush.extent()[0]);
   var maxExtent = d3.time.second(brush.extent()[1]);
  //  console.log("Min val: " + minExtent);
  //  console.log("Max val: " + maxExtent);
   // Remove previous graphs
   svgContainer.selectAll("path").remove();

   for (var i = 0; i < inData.length; i++) {
     // Filter data
     var visDat = inData[i].filter(function(d){
       return d.date < maxExtent && d.date > minExtent
     });
      // Redraw graphs
      drawLines(visDat,i)
    } //for
  } //displayLines

  function drawLines(drawData,i){

    svgContainer.append("path")
      .attr("d", lineFunction(drawData))
      .attr("class", deviceClass[i])
      .attr("stroke-width", 5)
      .attr("fill", "none")
      .on("mouseover", function(){
        d3.select(this)
        .classed("active", true)
        .attr("filter","url(#lineBlur)")
        .moveToFront();
        tooltip.transition()
        .duration(100)
        .style("opacity", 9);
        })
      .on("mouseout", function(){
        d3.select(this)
        .classed("active", false)
        .attr("filter","");
        tooltip.transition()
        .duration(2000)
        .style("opacity", 0);
      });
    }

  function getUpTickSpacing(){
    if(x.domain()[1] - x.domain()[0] > 10010000){
      return 40;
    }
    if(x.domain()[1] - x.domain()[0] > 786000){
      return 20;
    }
    if(x.domain()[1] - x.domain()[0] > 550000){
      return 10;
    }
    else return 1;
  }//getUpTickSpacing

    function getLowTickSpacing(){
      if(x.domain()[1] - x.domain()[0] > 10010000){
        return 10;
      }
      if(x.domain()[1] - x.domain()[0] > 786000){
        return 5;
      }
      if(x.domain()[1] - x.domain()[0] > 550000){
        return 2;
      }
      else return 0.1;
    }//getLowTickSpacing

} //createStringGraph
