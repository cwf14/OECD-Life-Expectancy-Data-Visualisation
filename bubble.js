// Set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height =480 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#Chart4")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Initialize the tooltip
var tooltip = d3.select("#tooltip");

// Read the data and initialize the chart
d3.csv("https://raw.githubusercontent.com/chaiyenthung/COS30045/refs/heads/main/Healthcare_Coverage.csv", function(data) {

  // Parse data and filter by UNIT_MEASURE
  data = data.filter(function(d) {
    return d.UNIT_MEASURE === 'PS';
  }).map(function(d) {
    d.OBS_VALUE = +d.OBS_VALUE;  // Convert OBS_VALUE to a number
    return d;
  });

  // Get unique time periods for the slider
  var timePeriods = Array.from(new Set(data.map(d => d.TIME_PERIOD)));

  // Set up slider properties
  var timeSlider = d3.select("#timeSlider")
    .attr("min", 0)
    .attr("max", timePeriods.length - 1)
    .attr("step", 1)
    .attr("value", 0);  // Default to the first time period

  // Display the current time period value
  d3.select("#sliderValue").text(timePeriods[0]);

  // Initial chart setup for the first time period
  updateChart(data.filter(d => d.TIME_PERIOD === timePeriods[0]));

  // Update the chart when a new time period is selected using the slider
  timeSlider.on("input", function() {
    var selectedIndex = +this.value;
    var selectedTime = timePeriods[selectedIndex];
    d3.select("#sliderValue").text(selectedTime);
    updateChart(data.filter(d => d.TIME_PERIOD === selectedTime));
  });

  // Function to update the bubble chart based on selected data
  function updateChart(filteredData) {
    svg.selectAll("*").remove();  // Clear previous bubbles

    // Find min and max of OBS_VALUE to set bubble size scale
    var obsMin = d3.min(filteredData, d => d.OBS_VALUE);
    var obsMax = d3.max(filteredData, d => d.OBS_VALUE);

    // Add a scale for bubble size
    var z = d3.scaleLinear()
      .domain([obsMin, obsMax])
      .range([10, 80]);

    // Add a scale for bubble color
    var myColor = d3.scaleOrdinal()
      .domain(filteredData.map(d => d.area))
      .range(d3.schemeSet2);

    // Define the simulation for the force layout
    var simulation = d3.forceSimulation(filteredData)
    .force("x", d3.forceX().strength(0.1).x(width / 2)) // Horizontal centering force
    .force("y", d3.forceY().strength(0.1).y(height / 2)) // Vertical centering force
    .force("charge", d3.forceManyBody().strength(-10))
    .force("collide", d3.forceCollide().radius(d => z(d.OBS_VALUE) + 1))
    .on("tick", ticked);

    // Add dots (bubbles)
    var bubbles = svg.append('g')
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
        .attr("r", d => z(d.OBS_VALUE))
        .style("fill", d => myColor(d.area))
        .style("opacity", "0.7")
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        // Add mouseover and mouseout events for the tooltip
        .on("mouseover", function(d) {
          tooltip
            .style("opacity", 1)
            .html(`<strong>Country:</strong> ${d.area || 'N/A'}<br><strong>Value (per thousand person): </strong> ${d.OBS_VALUE || 'N/A'}`);
        })
        .on("mousemove", function(d) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          tooltip.style("opacity", 0);
        });

    // Update positions of the circles on each simulation tick
    function ticked() {
      bubbles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  }
});
