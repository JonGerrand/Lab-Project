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
  var dev1Data = inData.dev1;
  var dev2Data = inData.dev2;
  var minDate = {};
  var maxDate = {};
  var margin = {top: 10, right: 20, bottom: 10, left: 20}
    , width = $('#stringVis').width() - margin.left - margin.right
    , height = 600 - margin.top - margin.bottom
    , brushHeight = height * 0.1
    , mainHeight = height - brushHeight;
  // Max-min values
  var mindate1 = d3.min(dev1Data, function(d){return d.date;});
  var mindate2 = d3.min(dev2Data, function(d){return d.date;});
  if(mindate1 > mindate2){
    minDate = mindate2;
  } else {
    minDate = mindate1
  }
  var maxdate1 = d3.max(dev1Data, function(d){return d.date;});
  var maxdate2 = d3.max(dev2Data, function(d){return d.date;});
  if(maxdate1 > maxdate2){
    maxDate = maxdate2;
  } else {
    maxDate = mindate1;
  }

  // Scale configuration
  var x = d3.time.scale()
    .domain([d3.time.second(minDate), d3.time.second(maxDate)])
    .range([0,width]);
  var xCoordScale = d3.scale.linear()
    .domain([0,5])
    .range([0,width]);
  var yCoordScale = d3.scale.linear()
    .domain([0,4])
    .range([0,mainHeight]);

 //The SVG Container
 var svgContainer = d3.select("#stringVis")
     .append("svg")
     .attr("width", width + margin.right + margin.left)
     .attr("height", height + margin.top + margin.bottom);

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

 // Create Upper x axis
 var upxDateAxis = d3.svg.axis()
     .scale(x)
     .orient("top")
     .ticks(d3.time.minutes, (x.domain()[1] - x.domain()[0]) > 3010000 ? 40 : 20)
     .tickFormat(d3.time.format("%a %e - %H:%M"))
     .tickSize(6, 0, 0);

     console.log((x.domain()[1] - x.domain()[0]));

 // Create Lower x axis
 var lowxDateAxis = d3.svg.axis()
     .scale(x)
     .orient("bottom")
     .ticks(d3.time.minutes, (x.domain()[1] - x.domain()[0]) > 3010000 ? 10 : 5)
     .tickFormat(d3.time.format("%H:%M"))
     .tickSize(6, 0, 0);

 // Line creation
 var lineFunction = d3.svg.line()
      .x(function(d) { return xCoordScale(d.x); })
      .y(function(d) { return yCoordScale(d.y); })
      .interpolate("basis");

 //create data brush
 var brushArea = svgContainer.append("g")
      .attr("transform", "translate(" + margin.left + "," + mainHeight + ")")
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
     .attr("x2", width)
     .attr("y2", 0)
     .attr("class", "axis date")

 brushArea.append("rect")
      .attr("pointer-events", "painted")
      .attr("width", width)
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
  var lineGraph1 = svgContainer.append("path")
        .attr("d", lineFunction(dev1Data))
        .attr("class", "redline")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .on("mouseover", function(){
          var sel = d3.select(this);
          sel.classed("greenline", true)
          .attr("filter","url(#lineBlur)");
          sel.moveToFront();})
         .on("mouseout", function(){
           d3.select(this)
          .classed("greenline", false)
          .attr("filter","");});

 var lineGraph2 = svgContainer.append("path")
       .attr("d", lineFunction(dev2Data))
       .attr("class", "blueline")
       .attr("stroke-width", 2)
       .attr("fill", "none")
       .on("mouseover", function(){
         var sel = d3.select(this);
         sel.classed("greenline", true)
         .attr("filter","url(#lineBlur)");
         sel.moveToFront();})
        .on("mouseout", function(){
          d3.select(this)
         .classed("greenline", false)
         .attr("filter","");
        });

  displayLines();

 function displayLines(){
   var minExtent = d3.time.second(brush.extent()[0]);
   var maxExtent = d3.time.second(brush.extent()[1]);
   var visDev1 = dev1Data.filter(function(d){
     return d.date < maxExtent && d.date > minExtent
   });
   var visDev2 = dev2Data.filter(function(d){
     return d.date < maxExtent && d.date > minExtent
   });
  // Remove previous graphs
  svgContainer.selectAll("path").remove();
  // Redraw graphs
  var lineGraph1 = svgContainer.append("path")
        .attr("d", lineFunction(visDev1))
        .attr("class", "redline")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .on("mouseover", function(){
          var sel = d3.select(this);
          sel.classed("greenline", true)
          .attr("filter","url(#lineBlur)");
          sel.moveToFront();})
        .on("mouseout", function(){
           d3.select(this)
          .classed("greenline", false)
          .attr("filter","");});

 var lineGraph2 = svgContainer.append("path")
       .attr("d", lineFunction(visDev2))
       .attr("class", "blueline")
       .attr("stroke-width", 2)
       .attr("fill", "none")
       .on("mouseover", function(){
         var sel = d3.select(this);
         sel.classed("greenline", true)
         .attr("filter","url(#lineBlur)");
         sel.moveToFront();})
       .on("mouseout", function(){
         d3.select(this)
         .classed("greenline", false)
         .attr("filter","");});
 }
}
