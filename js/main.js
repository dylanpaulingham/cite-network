// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#scatterplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

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
      .range([ 0, width ]);
    const xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // y axis
    const y = d3.scaleLinear()
      .domain([0, (Ymax * 1.25)])
      .range([ height, 0]);
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y));

  // points
    svg.append('g')
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
      const x_max = d3.max(data, function(d) { return d[selectedX]; });
      x.domain([0, (x_max * 1.25)])
      xAxis.transition().duration(1000).call(d3.axisBottom(x))

      // update y axis
      const y_max = d3.max(data, function(d) { return d[selectedY]; });
      y.domain([0, (y_max * 1.25)])
      yAxis.transition().duration(1000).call(d3.axisLeft(y))

      // update points
      svg.selectAll("circle")
         .data(data)
         .transition()
         .duration(1000)
         .attr("cx", function (d) { return x(d[selectedX]); } )
         .attr("cy", function (d) { return y(d[selectedY]); } )
    }


    // event listener for dropdowns
    d3.selectAll("#Xselect, #Yselect").on("change", function(d) {
        // take values from select object
        const selectedX = d3.select("#Xselect").property("value")
        const selectedY = d3.select("#Yselect").property("value")
        updatePlot(selectedX, selectedY)
    })

});

