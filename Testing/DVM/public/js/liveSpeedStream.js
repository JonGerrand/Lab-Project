(function() {

// Live stream data
var dev1Data = {prevX:0, prevY:0, currX:0, currY:0, prevDate: 0,
                currDate: 0, xVel:0, yVel:0, vel: 0};
var dev2Data = {prevX:0, prevY:0, currX:0, currY:0, prevDate: 0,
                currDate: 0, xVel:0, yVel:0, vel: 0};

Websocket.on('httpServer_vel',function(data){
  if(deviceNameArray[0] === data.ID) {
    dev1Data.prevX = dev1Data.currX;
    dev1Data.prevY = dev1Data.currY;
    dev1Data.prevDate = dev1Data.currDate;
    dev1Data.currX = data.x;
    dev1Data.currY = data.y;
    dev1Data.currDate = data.date;
    dev1Data.xVel = (dev1Data.currX - dev1Data.prevX)/((dev1Data.currDate - dev1Data.prevDate)*1e-3);
    dev1Data.yVel = (dev1Data.currY - dev1Data.prevY)/((dev1Data.currDate - dev1Data.prevDate)*1e-3);
    dev1Data.vel = Math.sqrt(Math.pow(dev1Data.xVel,2) + Math.pow(dev1Data.yVel,2));
  }
  if(deviceNameArray[1] === data.ID){
    dev2Data.prevX = dev2Data.currX;
    dev2Data.prevY = dev2Data.currY;
    dev2Data.prevDate = dev2Data.currDate;
    dev2Data.currX = data.x;
    dev2Data.currY = data.y;
    dev2Data.currDate = data.date;
    dev2Data.xVel = (dev2Data.currX - dev2Data.prevX)/((dev2Data.currDate - dev2Data.prevDate)*1e-3);
    dev2Data.yVel = (dev2Data.currY - dev2Data.prevY)/((dev2Data.currDate - dev2Data.prevDate)*1e-3);
    dev2Data.vel = Math.sqrt(Math.pow(dev2Data.xVel,2) + Math.pow(dev2Data.yVel,2));
  }
});

var n = 200,
    duration = 100,
    now = new Date(Date.now() - duration),
    count = 0,
    data1 = d3.range(n).map(function() { return 0; });
    data2 = d3.range(n).map(function() { return 0; });

var margin = {top: 6, right: 10, bottom: 40, left: 50},
    width = $("#liveSpeedStream").width() - margin.right - margin.left,
    height = 300 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain([now - (n - 2) * duration, now - duration])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0,data1[0]])
    .range([height, 0]);

var line1 = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
    .y(function(d, i) { return y(d); });

var line2 = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
    .y(function(d, i) { return y(d); });

var svg = d3.select("#liveSpeedStream").append("p").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var axisX = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

svg.append("text")
    .attr("y", height + margin.bottom -2)
    .attr("x", width/2)
    .attr("class", "axisText")
    .text("Current Time (H:m) / (:s)");

var axisY = svg.append("g")
    .attr("class", "y axis")
    .call(y.axis = d3.svg.axis().scale(y).orient("left"));

svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("y",0-margin.left/1.5)
    .attr("x", 0-(height/2))
    .attr("class", "axisText")
    .text("Velocity (m/s)")

var path1 = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(data1)
    .attr("class", "line1");

var path2 = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(data2)
    .attr("class", "line2");

var transition = d3.select({}).transition()
    .duration(duration)
    .ease("linear");

(function tick() {
  transition = transition.each(function() {

    // update the domains
    now = new Date();
    x.domain([now - (n - 2) * duration, now - duration]);
    var largestVal = [d3.max(data1),d3.max(data2)]
    y.domain([0, d3.max(largestVal)]);

    // push the accumulated count onto the back, and reset the count
    data1.push(dev1Data.vel);
    data2.push(dev2Data.vel);
    dev1Data.vel = 0;
    dev2Data.vel = 0;

    // redraw the line
    svg.select(".line1")
        .attr("d", line1)
        .attr("transform", null);
    svg.select(".line2")
        .attr("d", line2)
        .attr("transform", null);

    // slide the x-axis left
    axisX.call(x.axis);
    axisY.call(y.axis);

    // slide the line left
    path1.transition()
        .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");
    path2.transition()
        .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");

    // pop the old data1 point off the front
    data1.shift();
    data2.shift();

  }).transition().each("start", tick);
})();

})()
