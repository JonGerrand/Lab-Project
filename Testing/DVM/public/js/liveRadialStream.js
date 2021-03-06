(function () {

  // Define Websocket
  var Websocket = io();

  // Define chart Variables
  var margin = {top: 0, right: 0, bottom: 0, left: 0}
    , width = $('#radialChart').width() - margin.left - margin.right
    , height = $('#radialChart').width() - margin.top - margin.bottom;

  // Initilise Radial scales
  var radialxScale  = d3.scale.linear()
        .domain([-5,10])
        .range([0,width]);

  var radialyScale = d3.scale.linear()
        .domain([-5,10])
        .range([0,height]);

  var radialScale  = d3.scale.linear()
        .domain([0,15])
        .range([0,width]);

  // Define used devices
  var deviceNameArray = ['',''];

  var node1Pos = {x:radialxScale(0),y:radialyScale(0)}
    , node2Pos = {x:radialxScale(5),y:radialyScale(0)}
    , node3Pos = {x:radialxScale(2.5),y:radialyScale(4.33)}
    , node4Pos = {x:radialxScale(2.5),y:radialyScale(2.165)}
    , node5Pos = {x:radialxScale(-2.5),y:radialyScale(2.165)}
    , node6Pos = {x:radialxScale(7.5),y:radialyScale(2.165)};

  // Testing Data
  var receivedData1 = [
    {"x": node1Pos.x, "y": node1Pos.y , "radius": radialScale(0.1), "color": "blue"},
    {"x": node2Pos.x, "y": node2Pos.y , "radius": radialScale(0.1), "color": "blue"},
    {"x": node3Pos.x, "y": node3Pos.y , "radius": radialScale(0.1), "color": "blue"},
    {"x": node4Pos.x, "y": node4Pos.y , "radius": radialScale(0.1), "color": "red"},
    {"x": node5Pos.x, "y": node5Pos.y , "radius": radialScale(0.1), "color": "red"},
    {"x": node6Pos.x, "y": node6Pos.y , "radius": radialScale(0.1), "color": "red"}
    // {"x": node7Pos.x, "y": node7Pos.y , "radius": radialScale(0.1), "color": "red"},
    // {"x": node8Pos.x, "y": node8Pos.y , "radius": radialScale(0.1), "color": "red"},
    // {"x": node9Pos.x, "y": node9Pos.y , "radius": radialScale(0.1), "color": "red"},
    // {"x": node10Pos.x, "y": node10Pos.y , "radius": radialScale(0.1), "color": "red"},
    // {"x": node11Pos.x, "y": node11Pos.y , "radius": radialScale(0.1), "color": "red"},
    // {"x": node12Pos.x, "y": node12Pos.y , "radius": radialScale(0.1), "color": "red"}
  ];
  var receivedData2 = [
    {"x": node1Pos.x, "y": node1Pos.y , "radius": radialScale(0.1), "color": "green"},
    {"x": node2Pos.x, "y": node2Pos.y , "radius": radialScale(0.1), "color": "green"},
    {"x": node3Pos.x, "y": node3Pos.y , "radius": radialScale(0.1), "color": "green"},
    {"x": node4Pos.x, "y": node4Pos.y , "radius": radialScale(0.1), "color": "red"}
  ];

  // Create chart body
  // Perhaps add translation here
  var svgContainer = d3.select('#radialChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

  // Create circles
  drawCircles([receivedData1,receivedData2])


    Websocket.on("httpServer_radii", function(data){
      // Update tracked devices
      if($.inArray(data.ID , deviceNameArray) === -1 ){
        if(deviceNameArray[0] === ''){
          deviceNameArray[0] = data.ID;
        }
        else if(deviceNameArray[1] === ''){
          deviceNameArray[1] = data.ID;
        }
      }//if $.inArray(data.ID , deviceNameArray) === -1
      // Format data to be passed
      if(data.ID === deviceNameArray[0]){
         receivedData1 = [
          {"x": node1Pos.x, "y": node1Pos.y , "radius": radialScale(data.radii[0]), "color": "blue"},
          {"x": node2Pos.x, "y": node2Pos.y , "radius": radialScale(data.radii[1]), "color": "blue"},
          {"x": node3Pos.x, "y": node3Pos.y , "radius": radialScale(data.radii[2]), "color": "blue"},
          {"x": node4Pos.x, "y": node4Pos.y , "radius": radialScale(0.1), "color": "red"},
          {"x": node4Pos.x, "y": node4Pos.y , "radius": radialScale(0.1), "color": "red"},
          {"x": node5Pos.x, "y": node5Pos.y , "radius": radialScale(0.1), "color": "red"},
          {"x": node6Pos.x, "y": node6Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node7Pos.x, "y": node7Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node8Pos.x, "y": node8Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node9Pos.x, "y": node9Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node10Pos.x, "y": node10Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node11Pos.x, "y": node11Pos.y , "radius": radialScale(0.1), "color": "red"},
          // {"x": node12Pos.x, "y": node12Pos.y , "radius": radialScale(0.1), "color": "red"},
          {"x": radialxScale(data.x), "y": radialyScale(data.y) , "radius": 20, "color": "black"}

        ];
      }
      if(data.ID === deviceNameArray[1]){
         receivedData2 = [
          {"x": node1Pos.x, "y": node1Pos.y , "radius": radialScale(data.radii[0]), "color": "green"},
          {"x": node2Pos.x, "y": node2Pos.y , "radius": radialScale(data.radii[1]), "color": "green"},
          {"x": node3Pos.x, "y": node3Pos.y , "radius": radialScale(data.radii[2]), "color": "green"},
          {"x": node4Pos.x, "y": node4Pos.y , "radius": radialScale(0.1), "color": "red"},
          {"x": radialxScale(data.x), "y": radialyScale(data.y) , "radius": 20, "color": "black"}
        ];
      }
      // Clear previous circles
      svgContainer.selectAll("g").remove();
      // Render new circles
      var indata = [receivedData1,receivedData2];
      drawCircles(indata);
      // Append device labels
      svgContainer.append("g")
        .append("text")
        .attr("x", radialxScale(data.x) + 20)
        .attr("y", radialyScale(data.y) + 20)
        .text(data.ID);
    })

    function drawCircles(data){
      // Draw a circle set for each value
      for (var i = 0; i < data.length; i++) {
        svgContainer.append("g")
              .selectAll("circle")
              .data(data[i])
              .enter()
              .append("circle")
              .attr("cx", function(d){ return d.x;})
              .attr("cy", function(d){ return d.y;})
              .attr("r", function(d){ return d.radius;})
              .attr("fill", function(d){ return d.color;})
              .attr("fill-opacity", 0.2)
              .attr("stroke",function(d){return d.color;})
              .attr("stroke-width", 2);
      }//for
    }//drawCircles
}
)()
