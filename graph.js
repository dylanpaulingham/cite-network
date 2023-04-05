// set the dimensions and margins of the graph
var networkMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  networkWidth = 500 - networkMargin.left - networkMargin.right,
  networkHeight = 500 - networkMargin.top - networkMargin.bottom;

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

d3.json(
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

        // change the fill color back to steelblue on mouseout
        //d3.select(this).style("fill", function (d) { return colors(data2.links.filter(function (l) { return l.source === d.id }).length + 3) });

        // remove the tooltip
        d3.select(".tooltip").remove();
      });

    // node.append("title")
    //   .text(function (d) { return d.title });

    console.log("hey");

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

  const svg = d3.select("#graphencoding");
  const zoomBehavior = d3.zoom()
  .scaleExtent([0.1, 10])
    .on("zoom", () => {
    // call a function to update the network graph with the new zoom transform
      updateNetworkGraph(d3.event.transform);
  });
  svg.call(zoomBehavior);

  function updateNetworkGraph(transform) {
    const networkGraphElements = document.querySelectorAll("$graphencoding");
    networkGraphElements.forEach((element) => {
      element.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
    });
  }

  const zoomInBtn = document.getElementById("zoomInBtn");
  zoomInBtn.addEventListener("click", () => {
    zoomBehavior.scaleBy(svg.transition().duration(500), 1.2);
});

  const zoomOutBtn = document.getElementById("zoomOutBtn");
  zoomOutBtn.addEventListener("click", () => {
    zoomBehavior.scaleBy(svg.transition().duration(500), 0.8);
});

    // var brush = d3
    //   .brush()
    //   .extent([
    //     [0, 0],
    //     [networkWidth + networkMargin.left, networkHeight],
    //   ])
    //   .on("end", brushended);

    // // Initialize the brush
    // networkSvg.append("g").attr("class", "brush").call(brush);

    // // Function to handle the brush end event
    // function brushended() {
    //   // Get the selected nodes
    //   var selectedNodes = node.filter(function (d) {
    //     return d3.brushSelection(this);
    //   });

    //   // Remove the highlight from previously selected nodes
    //   node.classed("selected", false).style("fill", function (d) {
    //     return colors(
    //       data2.links.filter(function (l) {
    //         return l.source === d.id;
    //       }).length + 3
    //     );
    //   });

    //   // Highlight the selected nodes
    //   selectedNodes.classed("selected", true).style("fill", "red");
    // }
  }
);
