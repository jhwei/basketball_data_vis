var margin = {top: 10, right: 10, bottom: 20, left: 80}, width = 750,
    height = 400;

var svg_line = d3.select("#line-chart")
                   .append("svg")
                   .attr("class", "line_svg")
                   .attr("width", width)
                   .attr("height", height + margin.top + margin.bottom)
                   .append("g");

var xScale = d3.scale.linear().range([0, width - margin.left - margin.right]);

var yScale = d3.scale.linear().range([height - margin.top - margin.bottom, 0]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(function(d){return d+"%"});

var line = d3.svg.line().x(function(d) { return xScale(d.x); }).y(function(d) {
  return yScale(d.y);
});

var tool_tip =
    d3.tip().attr("class", "d3-tip").attr("id","line-tip").offset([-10, 0]).html(function(d) {
      return "<prop>Distance: </prop><num_prop>" + d.x +
          " ft</num_prop><prop>Frequency: </prop><num_prop>" + d.y.toFixed(1) +
          "%</num_prop>";
    });

function initLine(shot_data) {
  var maxdata;  // y轴最大值

  maxdata = getMaxData(shot_data);

  xScale.domain([
    d3.min(shot_data, function(d) { return d.x; }),
    d3.max(shot_data, function(d) { return d.x; })
  ]);

  yScale.domain([0, 40]);

  svg_line.append("g")
      .attr("class", "x-axis")
      .attr(
          "transform",
          "translate(" + margin.left + "," + (height - margin.bottom) + ")")
      .call(xAxis)
      .append('text')
      .text("Distance ft")
      .attr('transform', 'translate(' + (width / 2 - margin.left) + ', 40)');

  svg_line.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
      .call(yAxis);

  svg_line.select(".y-axis")
      .append('text')
      .attr("class", "y_axis_text")
      .text("Frequency %")
      .attr(
          "transform", "translate(" + (-50) + "," +
              ((height) / 2 + margin.top) + ")rotate(-90)");

  svg_line.append("path")
      .datum(shot_data)
      .attr("d", line)
      .style("stroke", "#aaa")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "line");

  svg_line.append("g")
      .append("line")
      .attr("x1", xScale(23.75))
      .attr("x2", xScale(23.75))
      .attr("y1", yScale(0))
      .attr("y2", yScale(40))
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("fill", "black")
      .attr("stroke-dasharray", 10 + "," + 10)
      .attr("stroke-width", 2)
      .attr("stroke", "#ccc");

  svg_line.append("text")
      .text("3 Point")
      .attr("x", xScale(25))
      .attr("y", yScale(35))
      .attr("fill", "#bbb");

  svg_line.call(tool_tip);

  svg_line.append('g')
      .selectAll('circle')
      .data(shot_data)
      .enter()
      .append('circle')
      .on('mouseover',
          function(d) {
            d3.select(this).transition().duration(30).attr('r', 7);

            tool_tip.show(d);

            var court_svg = d3.select('#shot-chart-container');

            var arc = d3.svg.arc()
                          .innerRadius(d.x)
                          .outerRadius(d.x + 1)
                          .startAngle(0)
                          .endAngle(2 * Math.PI);
            court_svg.select("svg")
                .append("g")
                .append("path")
                .attr("d", arc)
                .attr("transform", "translate(25,42.25)")
                .attr("fill", "#ccc")
                .attr("opacity", 0.7)
                .attr("id", "court_dis");
          })
      .on('mouseout',
          function(d) {
            d3.select(this).transition().duration(30).attr('r', 4);
            tool_tip.hide(d);
            d3.select("#court_dis").remove();
          })
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr('cx', line.x())
      .attr('cy', line.y())
      .attr('r', 4)
      .attr("fill", "#777")
      .attr("class", 'circles');
}

function updateLine(shot_data, ylength) {
  var maxdata;  // y轴最大值
  var margin = {top: 20, right: 20, bottom: 30, left: 50}, width = 600,
      height = 450;

  maxdata = getMaxData(shot_data);
  xScale.domain([
    d3.min(shot_data, function(d) { return d.x; }),
    d3.max(shot_data, function(d) { return d.x; })
  ]);

  yScale.domain([0, ylength]);

  yAxis.scale(yScale);

  var svg_line = d3.select("#line-chart");

  svg_line.transition()
      .select(".line")  // change the line
      .duration(700)
      .attr("d", line(shot_data));

  svg_line.transition()
      .select(".y-axis")  // change the y axis
      .duration(700)
      .call(yAxis);

  svg_circle = svg_line.select("g").selectAll("circle").data(shot_data);

  svg_circle.exit().remove();  // remove unneeded circles
  svg_circle.enter().append("circle").attr(
      "r", 0);  // create any new circles needed

  // update all circles to new positions
  svg_circle.transition()
      .duration(500)
      .attr("cx", line.x())
      .attr("cy", line.y())
      .attr("r", 4);
}


function getMaxData(arr) {
  var maxdata = 0;

  arr.forEach(function(d) {
    d.x = +d.x;
    d.y = +d.y;
  });
  maxdata = d3.max([maxdata, d3.max(arr, function(d) { return d.y; })]);

  return maxdata;
}

function shotPercentage() {
  tool_tip.html(function(d) {
    return "<prop>Distance: </prop><num_prop>" + d.x +
        " ft</num_prop><prop>Field Goal %: </prop><num_prop>" + d.y.toFixed(1) +
        "%</num_prop>";
  });

  d3.select(".y_axis_text").remove();
  svg_line.select(".y-axis")
      .append("text")
      .attr("class", "y_axis_text")
      .text("Field Goal %")
      .attr(
          "transform", "translate(" + (-50) + "," +
              ((height) / 2 + margin.top) + ")rotate(-90)");

  updateLine(shot_percentage, 100);
  freq_flag = false;
}

function shotFreq() {
  tool_tip.html(function(d) {
    return "<prop>Distance: </prop><num_prop>" + d.x +
        " ft</num_prop><prop>Frequency: </prop><num_prop>" + d.y.toFixed(1) +
        "%</num_prop>";
  });

  d3.select(".y_axis_text").remove();
  svg_line.select(".y-axis")
      .append("text")
      .attr("class", "y_axis_text")
      .text("Frequency %")
      .attr(
          "transform", "translate(" + (-50) + "," +
              ((height) / 2 + margin.top) + ")rotate(-90)");

  updateLine(shot_freq, 40);
  freq_flag = true;
}

function getData(shot_stat) {
  shot_freq = [];
  shot_percentage = [];
  for (var i = 0, l = shot_stat.length; i < l; i++) {
    shot_freq.push({'x': shot_stat[i].dis, 'y': shot_stat[i].freq * 100});
    shot_percentage.push(
        {'x': shot_stat[i].dis, 'y': shot_stat[i].percentage * 100});
  }
}