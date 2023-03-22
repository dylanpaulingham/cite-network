// set the dimensions and margins of the graph
const sc_margin = {top: 10, right: 30, bottom: 30, left: 60},
    sc_width = 460 - sc_margin.left - sc_margin.right,
    sc_height = 400 - sc_margin.top - sc_margin.bottom;

// append the svg object to the body of the page
const sc_svg = d3.select("#scatterplot")
  .append("svg")
    .attr("width", sc_width + sc_margin.left + sc_margin.right)
    .attr("height", sc_height + sc_margin.top + sc_margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + sc_margin.left + "," + sc_margin.top + ")");

d3.csv("https://raw.githubusercontent.com/DS4200-S23-Class/project-dylan-parker-ethan-jaeson-ryan/master/data/30papers.csv", function(data) {

    // define possible options for axes (numerical columns from csv)
    const allGroup = ["num_authors", "pub_year", "num_citations", "cite_per_year", "page_length", "num_profiled_authors"]
  
    // append options to dropdown
    d3.selectAll("#Xselect, #Yselect")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // update dropdown text
      .attr("value", function (d) { return d; }) // assign values to options

    // set second dropdown to different value from first
    d3.select('#Yselect').property('value', allGroup[1]);

    // determine max value for each axis to determine axis range
    const Xmax = d3.max(data, function(d) { return d[allGroup[0]]; });
    const Ymax = d3.max(data, function(d) { return d[allGroup[1]]; });

    // x axis
    const x = d3.scaleLinear()
      .domain([0, (Xmax * 1.25)])
      .range([ 0, sc_width ]);
    const xAxis = sc_svg.append("g")
      .attr("transform", "translate(0," + sc_height + ")")
      .call(d3.axisBottom(x));

  // y axis
    const y = d3.scaleLinear()
      .domain([0, (Ymax * 1.25)])
      .range([ sc_height, 0]);
    const yAxis = sc_svg.append("g")
      .call(d3.axisLeft(y));

  // points
    sc_svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d[allGroup[0]]); } )
        .attr("cy", function (d) { return y(d[allGroup[1]]); } )
        .attr("r", 5)
        .attr("fill-opacity", 0.5)
        .attr("fill", "coral")

    // update plot (when dropdown value is changed)
    function updatePlot(selectedX, selectedY) {

      // update title
      d3.select("#chart_title").text(selectedX + " vs " + selectedY);

      // update x axis
      const x_min = d3.min(data, function(d) { return +d[selectedX]; });
      const x_max = d3.max(data, function(d) { return +d[selectedX]; });
      x.domain([(x_min / 1.25), (x_max * 1.25)])
      xAxis.transition().duration(1000).call(d3.axisBottom(x))

      // update y axis
      const y_min = d3.min(data, function(d) { return +d[selectedY]; });
      const y_max = d3.max(data, function(d) { return +d[selectedY]; });
      y.domain([(y_min / 1.25), (y_max * 1.25)])
      yAxis.transition().duration(1000).call(d3.axisLeft(y))

      // update points
      sc_svg.selectAll("circle")
         .data(data)
         .transition()
         .duration(1000)
         .attr("cx", function (d) { return x(d[selectedX]); } )
         .attr("cy", function (d) { return y(d[selectedY]); } )
    }


    // event listener for dropdowns
    d3.selectAll("#Xselect, #Yselect")
    // record values from select objects
    .on("change", function(d) {
        const selectedX = d3.select("#Xselect").property("value")
        const selectedY = d3.select("#Yselect").property("value")
        updatePlot(selectedX, selectedY)
    })

    // event listeners for points
    d3.selectAll("circle")
    // highlight point when hovered over
    .on("mouseenter", function(d) {
      const x_axis = d3.select("#Xselect").property("value")
      const y_axis = d3.select("#Yselect").property("value")
      d3.select(this)
          .attr("title", d.amount)
          .style("cursor", "pointer")
          .style("fill-opacity", 1)
          .style("fill", "crimson");
    // add tooltip with information on point
      d3.select("#tooltip")
          .style("max-width", "250px")
          .style("font-size", "12px")
          .style("left", (d3.event.pageX + 12) + "px")
          .style("top", (d3.event.pageY - 12) + "px")
          .style("position", "absolute")
          .style("background-color", "white")
          .html('"' + d["title"].slice(0,20) + '..."<br/>(' + d["venue"] + ")<br/>" 
                + x_axis + ": " + d[x_axis] + "<br/>" + y_axis + ": " + d[y_axis]);
    })
    // remove highlight on mouseout
    .on("mouseout", function(d) {
      d3.select(this)
        .attr("title", d.amount)
        .style("cursor", "default")
        .style("fill-opacity", 0.5)
        .style("fill", "coral")
      d3.select("#tooltip")
        .style("left", "-9999px")
        .style("top", "-9999px");
    })
    .on("click", function(d) {
      d3.select("#tooltip")
        .html("Abstract: " + d["abstract"])

    });

});

