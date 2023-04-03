// set the dimensions and margins of the graph
const sc_margin = { top: 10, right: 30, bottom: 30, left: 60 },
  sc_width = 460 - sc_margin.left - sc_margin.right,
  sc_height = 400 - sc_margin.top - sc_margin.bottom;

// append the svg object to the body of the page
const sc_svg = d3
  .select("#scatterplot")
  .append("svg")
  .attr("width", sc_width + sc_margin.left + sc_margin.right)
  .attr("height", sc_height + sc_margin.top + sc_margin.bottom)
  .append("g")
  .attr("transform", "translate(" + sc_margin.left + "," + sc_margin.top + ")");

const scatterdata = d3.csv(
  "https://raw.githubusercontent.com/DS4200-S23-Class/project-dylan-parker-ethan-jaeson-ryan/master/data/df_papers.csv",
  function (data) {
    // define possible options for axes (numerical columns from csv)
    const allGroup = [
      "num_authors",
      "pub_year",
      "num_citations",
      "cite_per_year",
      "page_length",
      "num_profiled_authors",
    ];

    // append options to dropdown
    d3.selectAll("#Xselect, #Yselect")
      .selectAll("myOptions")
      .data(allGroup)
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      }) // update dropdown text
      .attr("value", function (d) {
        return d;
      }); // assign values to options

    // set dropdown to initial values of interest
    d3.select("#Xselect").property("value", allGroup[2]);
    d3.select("#Yselect").property("value", allGroup[3]);

    // determine max value for each axis to determine axis range
    const Xmax = d3.max(data, function (d) {
      return +d[allGroup[2]];
    });
    const Ymax = d3.max(data, function (d) {
      return +d[allGroup[3]];
    });

    // set spinners to initial axis ranges
    d3.selectAll("#x_min, #y_min").property("value", 0);
    d3.select("#x_max").property("value", Math.round(Xmax * 1.25));
    d3.select("#y_max").property("value", Math.round(Ymax * 1.25));

    // x axis
    const x = d3
      .scaleLinear()
      .domain([0, Xmax * 1.25])
      .range([0, sc_width]);
    const xAxis = sc_svg
      .append("g")
      .attr("transform", "translate(0," + sc_height + ")")
      .call(d3.axisBottom(x));

    // y axis
    const y = d3
      .scaleLinear()
      .domain([0, Ymax * 1.25])
      .range([sc_height, 0]);
    const yAxis = sc_svg.append("g").call(d3.axisLeft(y));

    // points
    sc_svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "scatter")
      .attr("cx", function (d) {
        return x(d[allGroup[2]]);
      })
      .attr("cy", function (d) {
        return y(d[allGroup[3]]);
      })
      .attr("r", 6)
      .attr("fill-opacity", 0.5)
      .attr("fill", "coral");

    // update plot (when dropdown value is changed)
    function updatePlot(selectedX, selectedY) {
      // update title
      d3.select("#chart_title").text(selectedX + " vs " + selectedY);

      let xscale, yscale;
      if (selectedX === "pub_year") {
        xscale = 1.005;
      } else {
        xscale = 1.25;
      }
      if (selectedY === "pub_year") {
        yscale = 1.005;
      } else {
        yscale = 1.25;
      }

      // define the format for the year value
      const formatYear = d3.format(".0f");

      // update x axis
      const x_min = d3.min(data, function (d) {
        return +d[selectedX];
      });
      const x_max = d3.max(data, function (d) {
        return +d[selectedX];
      });
      x.domain([x_min / xscale, x_max * xscale]);
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickFormat(formatYear));

      // update y axis
      const y_min = d3.min(data, function (d) {
        return +d[selectedY];
      });
      const y_max = d3.max(data, function (d) {
        return +d[selectedY];
      });
      y.domain([y_min / yscale, y_max * yscale]);
      yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).tickFormat(formatYear));

      // set spinners to updated axis ranges
      d3.select("#x_min").property("value", Math.round(x_min / xscale));
      d3.select("#x_max").property("value", Math.round(x_max * xscale));
      d3.select("#y_min").property("value", Math.round(y_min / yscale));
      d3.select("#y_max").property("value", Math.round(y_max * yscale));

      // update points
      sc_svg
        .selectAll(".scatter")
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return x(d[selectedX]);
        })
        .attr("cy", function (d) {
          return y(d[selectedY]);
        });
    }

    // event listener for dropdowns
    d3.selectAll("#Xselect, #Yselect")
      // record values from select objects
      .on("change", function (d) {
        const selectedX = d3.select("#Xselect").property("value");
        const selectedY = d3.select("#Yselect").property("value");
        updatePlot(selectedX, selectedY);
      });

    // shift axis (when spinner value is changed)
    function shiftAxis(x_lower, x_upper, y_lower, y_upper) {
      // prevent flipping or overshrinking of axis
      if (x_lower >= x_upper) {
        x_upper = x_lower + 10;
        d3.select("#x_max").property("value", x_upper);
      }
      if (y_lower >= y_upper) {
        y_upper = y_lower + 10;
        d3.select("#y_max").property("value", y_upper);
      }

      // update x axis
      x.domain([x_lower, x_upper]);
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      // update y axis
      y.domain([y_lower, y_upper]);
      yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).tickFormat(d3.format("d")));

      const selectedX = d3.select("#Xselect").property("value");
      const selectedY = d3.select("#Yselect").property("value");

      // update points
      sc_svg
        .selectAll(".scatter")
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return x(d[selectedX]);
        })
        .attr("cy", function (d) {
          return y(d[selectedY]);
        });
    }

    // event listener for spinners
    d3.selectAll(".spinner")
      // record values from select objects
      .on("change", function (d) {
        const x_lower = Number(d3.select("#x_min").property("value"));
        const x_upper = Number(d3.select("#x_max").property("value"));
        const y_lower = Number(d3.select("#y_min").property("value"));
        const y_upper = Number(d3.select("#y_max").property("value"));
        shiftAxis(x_lower, x_upper, y_lower, y_upper);
      });

    // event listeners for points
    d3.selectAll(".scatter")
      // highlight point when hovered over
      .on("mouseenter", function (d) {
        const x_axis = d3.select("#Xselect").property("value");
        const y_axis = d3.select("#Yselect").property("value");
        d3.select(this)
          .attr("title", d.amount)
          .style("cursor", "pointer")
          .style("fill-opacity", 1)
          .style("fill", "crimson");
        // add tooltip with information on point
        d3.select("#tooltip")
          .style("max-width", "250px")
          .style("font-size", "12px")
          .style("left", d3.event.pageX + 12 + "px")
          .style("top", d3.event.pageY - 12 + "px")
          .style("position", "absolute")
          .style("background-color", "white")
          .html(
            '"' +
              d["title"].slice(0, 20) +
              '..."<br/>(' +
              d["venue"] +
              ")<br/>" +
              x_axis +
              ":<b> " +
              d[x_axis].substring(0, 5) +
              "</b><br/>" +
              y_axis +
              ":<b> " +
              d[y_axis].substring(0, 5) +
              "</b>"
          );
      })
      // remove highlight on mouseout
      .on("mouseout", function (d) {
        d3.select(this)
          .attr("title", d.amount)
          .style("cursor", "default")
          .style("fill-opacity", 0.5)
          .style("fill", "coral");
        d3.select("#tooltip").style("left", "-9999px").style("top", "-9999px");
      })
      .on("click", function (d) {
        d3.select("#tooltip").html(
          "<i>" +
            d["venue"] +
            "</i><br/>" +
            '<b>"' +
            d["title"] +
            '"</b><br/><b>Abstract:</b> ' +
            d["abstract"]
        );
      });
  }
);

//_______________________________

// set the dimensions and margins of the graph
var networkMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  networkWidth = 1000 - networkMargin.left - networkMargin.right,
  networkHeight = 1000 - networkMargin.top - networkMargin.bottom;

// append the svg object to the body of the page
var networkSvg = d3
  .select("#graphencoding")
  .append("svg")
  .attr("width", networkWidth + networkMargin.left + networkMargin.right)
  .attr("height", networkHeight + networkMargin.top + networkMargin.bottom)
  .append("g")
  .attr(
    "transform",
    "translate(" + networkMargin.left + "," + networkMargin.top + ")"
  );

// Define the arrowhead marker
networkSvg
  .append("defs")
  .selectAll("marker")
  .data(["arrow"])
  .enter()
  .append("marker")
  .attr("id", function (d) {
    return d;
  })
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 13)
  .attr("markerWidth", 18)
  .attr("markerHeight", 8)
  .attr("orient", "auto")
  .style("stroke", "blue")
  .style("opacity", 0.7)
  .append("path")
  .attr("d", "M10,-5L0,0L10,5");

const graphdata = d3.json(
  "https://raw.githubusercontent.com/DS4200-S23-Class/project-dylan-parker-ethan-jaeson-ryan/master/data_205.json",
  function (data2) {
    // Initialize the links
    var link = networkSvg
      .selectAll("line")
      .data(data2.links)
      .enter()
      .append("line")
      .style("stroke-width", "2")
      .style("stroke", "black")
      .attr("marker-end", "url(#arrow)")
      .on("mouseover", function (d) {
        // change the fill color to red on hover
        d3.select(this).style("stroke-width", 4);
      })
      .on("mouseout", function (d) {
        d3.select(this).style("stroke-width", 2);
      });

    var colors = d3.scaleLinear().domain([2, 12]).range(["white", "blue"]);

    // Initialize the nodes
    var node = networkSvg
      .selectAll("circle")
      .data(data2.nodes)
      .enter()
      .append("circle")
      .attr("class", "graph")
      .attr("stroke", "black")
      .attr("stroke-opacity", 0)
      .attr("stroke-width", 2)
      .attr("r", 10)
      //.attr("r", function (d) { return data2.links.filter(function (l) { return l.source === d.id }).length + 5 })
      .style("fill", function (d) {
        return colors(
          Math.log(
            data2.links.filter(function (l) {
              return l.source === d.id;
            }).length + 2
          ) * 5
        );
      })
      .on("mouseover", function (d) {
        // change the fill color to red on hover
        d3.select(this).style("stroke-opacity", 1);

        // create a tooltip div
        var tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .text(
            d.title +
              "\n" +
              " (articles in network citing this: " +
              data2.links.filter(function (l) {
                return l.source === d;
              }).length +
              ")"
          );

        // position the tooltip near the mouse
        tooltip
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 10 + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).style("stroke-opacity", 0);

        // change the fill color back to steelblue on mouseout
        //d3.select(this).style("fill", function (d) { return colors(data2.links.filter(function (l) { return l.source === d.id }).length + 3) });

        // remove the tooltip
        d3.select(".tooltip").remove();
      });

    // node.append("title")
    //   .text(function (d) { return d.title });

    // Let's list the force we wanna apply on the network
    var simulation = d3
      .forceSimulation(data2.nodes) // Force algorithm is applied to data.nodes
      .force(
        "link",
        d3
          .forceLink() // This force provides links between nodes
          .id(function (d) {
            return d.id;
          }) // This provide  the id of a node
          .links(data2.links) // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-100)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(networkWidth / 2, networkHeight / 2)) // This force attracts nodes to the center of the svg area
      .on("end", ticked);

    // console.log(d3.selectAll(".graph"));
    d3.selectAll(".graph")
      .on("mouseover", function (d) {
        // get the corresponding paper in the scatterplot visualization
        const scatterData = d3.selectAll(".scatter").filter(function (p) {
          console.log(d);
          return p.id === d.id;
        });

        // highlight the corresponding circle in the scatterplot
        scatterData.attr("stroke", "green").attr("stroke-width", 10);
      })
      .on("mouseout", function (d) {
        // get the corresponding paper in the scatterplot visualization
        const scatterData = d3.selectAll("circle").filter(function (p) {
          return p.id === d.id;
        });

        // remove the highlight from the corresponding circle in the scatterplot
        scatterData.attr("stroke", null).attr("stroke-width", null);
      });

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    }
  }
);
