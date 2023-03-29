// set the dimensions and margins of the graph
var networkMargin = { top: 10, right: 30, bottom: 30, left: 100 },
  networkWidth = 600 - networkMargin.left - networkMargin.right,
  networkHeight = 300 - networkMargin.top - networkMargin.bottom;

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
networkSvg.append("defs").selectAll("marker")
  .data(["arrow"])
  .enter().append("marker")
  .attr("id", function (d) { return d; })
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 13)
  .attr("markerWidth", 18)
  .attr("markerHeight", 8)
  .attr("orient", "auto")
  .style("stroke", "blue")
  .style("opacity", 0.7)
  .append("path")
  .attr("d", "M10,-5L0,0L10,5");


d3.json("https://raw.githubusercontent.com/DS4200-S23-Class/project-dylan-parker-ethan-jaeson-ryan/master/cites_papers.json", function (data2) {
  // Initialize the links
  var link = networkSvg
    .selectAll("line")
    .data(data2.links)
    .enter()
    .append("line")
    .style("stroke-width", "2")
    .style("stroke", "black")
    .attr("marker-end", "url(#arrow)");


  var colors = d3.scaleLinear().domain([2, 12])
    .range(["white", "blue"])

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
    .style("fill", function (d) { return colors(data2.links.filter(function (l) { return l.source === d.id }).length + 3) })
    .on("mouseover", function (d) {
      // change the fill color to red on hover
      d3.select(this).style("stroke-opacity", 1);

      // create a tooltip div
      var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .text(d.name + "\n" + " (articles in network citing this: " + data2.links.filter(function (l) {
          return l.source === d;
        }).length + ")");

      // position the tooltip near the mouse
      tooltip.style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("stroke-opacity", 0);

      // change the fill color back to steelblue on mouseout
      //d3.select(this).style("fill", function (d) { return colors(data2.links.filter(function (l) { return l.source === d.id }).length + 3) });

      // remove the tooltip
      d3.select(".tooltip").remove();
    });


  // node.append("title")
  //   .text(function (d) { return d.name });

  console.log(node);

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
    .force("charge", d3.forceManyBody().strength(-200)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
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
});

//WE HAD VERSION COMPATIBILITY ISSUES, PLEASE IGNORE THIS FOR NOW
// const networkMargin = { top: 10, right: 30, bottom: 30, left: 170 },
//   networkWidth = 750 - networkMargin.left - networkMargin.right,
//   networkHeight = 500 - networkMargin.top - networkMargin.bottom;

// // append the networkSvg object to the body of the page
// const networkSvg = d3
//   .select("#graphencoding")
//   .append("svg")
//   .attr("width", networkWidth + networkMargin.left + networkMargin.right)
//   .attr("height", networkHeight + networkMargin.top + networkMargin.bottom)
//   .append("g")
//   .attr("transform", `translate(${networkMargin.left}, ${networkMargin.top})`);

// d3.json("cites_papers.json").then(function (data) {
//   // Initialize the links
//   const link = networkSvg
//     .selectAll("line")
//     .data(data.links)
//     .join("line")
//     .style("stroke", "#aaa");

//   // Initialize the nodes
//   const node = networkSvg
//     .selectAll("circle")
//     .data(data.nodes)
//     .join("circle")
//     .attr("r", 20)
//     .style("fill", "#69b3a2");

//   // Let's list the force we wanna apply on the network
//   const simulation = d3
//     .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
//     .force(
//       "link",
//       d3
//         .forceLink() // This force provides links between nodes
//         .id(function (d) {
//           return d.id;
//         }) // This provide  the id of a node
//         .links(data.links) // and this the list of links
//     )
//     .force("charge", d3.forceManyBody().strength(-400)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
//     .force("center", d3.forceCenter(networkWidth / 2, networkHeight / 2)) // This force attracts nodes to the center of the networkSvg area
//     .on("end", ticked);

//   // This function is run at each iteration of the force algorithm, updating the nodes position.
//   function ticked() {
//     link
//       .attr("x1", function (d) {
//         return d.source.x;
//       })
//       .attr("y1", function (d) {
//         return d.source.y;
//       })
//       .attr("x2", function (d) {
//         return d.target.x;
//       })
//       .attr("y2", function (d) {
//         return d.target.y;
//       });

//     node
//       .attr("cx", function (d) {
//         return d.x + 6;
//       })
//       .attr("cy", function (d) {
//         return d.y - 6;
//       });
//   }
// });