(function() {

// Live stream data
var dev1Data = 0;
var dev2Data = 0;

Websocket.on('httpServer_vel',function(vel){
  dev1Data = vel[0];
  dev2Data = vel[1];
});

var n = 243,
    duration = 200,
    now = new Date(Date.now() - duration),
    count = 0,
    data1 = d3.range(n).map(function() { return 0; });
    data2 = d3.range(n).map(function() { return 0; });

var margin = {top: 6, right: 60, bottom: 20, left: 30},
    width = $("#liveSpeedStream").width() - margin.right,
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
    .style("margin-left", margin.left + "px")
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

var axisY = svg.append("g")
    .attr("class", "y axis")
    .call(y.axis = d3.svg.axis().scale(y).orient("left"));

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
    y.domain([0, d3.max(data1)]);

    // push the accumulated count onto the back, and reset the count
    data1.push(dev1Data);
    data2.push(dev2Data);
    dev1Data = 0;
    dev2Data = 0;

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
