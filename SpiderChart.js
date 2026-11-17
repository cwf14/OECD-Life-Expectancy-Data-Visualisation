// Configuration settings for the spider chart
    var labelDistance = 1.12; // Distance factor for axis labels
    var dotRadius = 3; // Radius for data point dots
    var lineWidth = 2; // Line width for data connections
    var margin = 24; // Margin around the chart
    var height = 480; // Height of the SVG container
    var width = 1000; // Width of the SVG container
    var sectorGap = 1000; // Define the range for each sector as 1000
    var defaultYear, defaultRegion = "allRegion";
    var colors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF1", "#FFA533", 
        "#8D33FF", "#FF5733", "#33A8FF", "#FF3399", "#33FF7F", "#FF8A33"
    ]; // Array of colors for data series

// Country Abbreviation Mapping
    var countryFullNames = {
        "AUS": "Australia",
        "AUT": "Austria",
        "BEL": "Belgium",
        "CAN": "Canada",
        "CHE": "Switzerland",
        "CHL": "Chile",
        "COL": "Colombia",
        "CRI": "Costa Rica",
        "CZE": "Czechia",
        "DEU": "Germany",
        "DNK": "Denmark",
        "ESP": "Spain",
        "EST": "Estonia",
        "FIN": "Finland",
        "FRA": "France",
        "GBR": "United Kingdom",
        "GRC": "Greece",
        "HUN": "Hungary",
        "IRL": "Ireland",
        "ISL": "Iceland",
        "ISR": "Israel",
        "ITA": "Italy",
        "JPN": "Japan",
        "KOR": "Korea",
        "LTU": "Lithuania",
        "LUX": "Luxembourg",
        "LVA": "Latvia",
        "MEX": "Mexico",
        "NLD": "Netherlands",
        "NOR": "Norway",
        "NZL": "New Zealand",
        "POL": "Poland",
        "PRT": "Portugal",
        "SVK": "Slovak Republic",
        "SVN": "Slovenia",
        "SWE": "Sweden",
        "TUR": "Turkey",
        "USA": "United States"
    };
    
    var countryRegions = {
        "CAN": "northAmerica",
        "MEX": "northAmerica",
        "USA": "northAmerica",
        
        "CHL": "southAmerica",
        "COL": "southAmerica",
        "CRI": "southAmerica",
        
        "AUT": "europe",
        "BEL": "europe",
        "CZE": "europe",
        "DNK": "europe",
        "EST": "europe",
        "FIN": "europe",
        "FRA": "europe",
        "DEU": "europe",
        "GRC": "europe",
        "HUN": "europe",
        "ISL": "europe",
        "IRL": "europe",
        "ITA": "europe",
        "LVA": "europe",
        "LTU": "europe",
        "LUX": "europe",
        "NLD": "europe",
        "NOR": "europe",
        "POL": "europe",
        "PRT": "europe",
        "SVK": "europe",
        "SVN": "europe",
        "ESP": "europe",
        "SWE": "europe",
        "CHE": "europe",
        "TUR": "europe",
        "GBR": "europe",
        
        "AUS": "asiaPacific",
        "JPN": "asiaPacific",
        "KOR": "asiaPacific",
        "NZL": "asiaPacific",
        
        "ISR": "middleEast"
    };

// Load data from CSV and initialize chart with default year selection
    d3.csv("latestGovernmentPPP.csv").then((data) => {
        var years = [...new Set(data.map(d => d.Year))]; // Get unique years
        defaultYear = years[0]; // Set the default year
        populateYearDropdown(years);

// Default display for the initial year and region
        var defaultYear = years[0];
        var defaultRegion = "allRegion"; // Default to show all regions
        var formattedData = filterDataByYearAndRegion(data, defaultYear, defaultRegion);
        
        if (formattedData[0].length > 0) { // Only clear and update chart if there's data
            d3.select("#chart5").html("");
            updateChart(formattedData);
        }
// Set initial dropdown values
    d3.select("#governmentyearDropdown").property("value", defaultYear);
    d3.select("#regionDropdown").property("value", defaultRegion);

    var formattedData = filterDataByYearAndRegion(data, defaultYear, defaultRegion);
    
    if (formattedData[0].length > 0) {
        d3.select("#chart5").html("");
        updateChart(formattedData);
    }

// Add event listener for reset button
    d3.select("#resetButton").on("click", function() {
// Reset dropdown values to defaults
        d3.select("#governmentyearDropdown").property("value", defaultYear);
        d3.select("#regionDropdown").property("value", defaultRegion);

// Filter data based on default values
        filterAndUpdateChart(defaultYear, defaultRegion);
    });

// Function to filter data and update the chart
    function filterAndUpdateChart(year, region) {
        var resetData = filterDataByYearAndRegion(data, year, region);
        
// Clear chart and update with new data
        d3.select("#chart5").html(""); 
        if (resetData[0].length > 0) {
            updateChart(resetData);
        } else {
            d3.select("#chart5").html("<p>No data available for the selected criteria.</p>");
        }
    }

// Update chart when year dropdown changes
        d3.select("#governmentyearDropdown").on("change", function() {
            var selectedYear = this.value;
            var selectedRegion = d3.select("#regionDropdown").property("value");
            var updatedData = filterDataByYearAndRegion(data, selectedYear, selectedRegion);
            d3.select("#chart5").html("");
            updateChart(updatedData);
        });
    });

// Populate year dropdown
    function populateYearDropdown(years) {
        var dropdown = d3.select("#governmentyearDropdown");
        years.forEach(year => {
            dropdown.append("option")
                .attr("value", year)
                .text(year);
        });
    }

// Filter data by year and region
    function filterDataByYearAndRegion(data, year, region) {
        var filteredData = data.filter(d => d.Year == year);
        console.log("Filtered Data for Year:", year, "Region:", region, filteredData); // Debugging 

// If "all" regions, map all data for that year
        if (region === "allRegion") {
            return [mapSkillData(filteredData)];
        } else {
            filteredData = filteredData.filter(d => countryRegions[d.CountryCode] === region);
        }
    
// Only return data if there are results; otherwise, default to empty
        return filteredData.length > 0 ? [mapSkillData(filteredData)] : [[]];
    }

// Map and summarize data by country code for the given year
    function mapSkillData(data) {
        var summary = d3.nest()
            .key(d => d.CountryCode)
            .rollup(values => ({
                axis: values[0].CountryCode,
                value: d3.mean(values, d => +d.Value), 
                year: values[0].Year
            }))
            .entries(data)
            .map(d => d.value);
            
            console.log("Mapped Skill Data:", summary); // Debugging 
        return summary;
    }

    d3.select("#regionDropdown").on("change", function() {
        var selectedRegion = this.value;
        var selectedYear = d3.select("#governmentyearDropdown").property("value");
        d3.csv("latestGovernmentPPP.csv").then(data => {
            var filteredData = filterDataByYearAndRegion(data, selectedYear, selectedRegion);
            
// Clear and update the chart only if there's data
            if (filteredData[0].length === 0) {
                d3.select("#chart5").html("<p>No data available for the selected criteria.</p>");
            } else {
                d3.select("#chart5").html("");
                updateChart(filteredData);
            }
        });
    });

// Main function to create and update the spider chart
    function updateChart(data) {
        var radius = (height - margin * 2) / 2;
        var maxValue = d3.max(data[0].map(d => d.value));
        var sectorCount = Math.ceil(maxValue / sectorGap);
        var angleSlice = (Math.PI * 2) / data[0].length;
        var sectorColors = d3.scaleSequential()
            .domain([0, sectorCount - 1])
            .interpolator(d3.interpolateBlues);
        
        var svg = d3.select("#chart5").append("svg")
            .attr("width", width)
            .attr("height", height + margin * 2);
    
        var container = svg.append("g")
            .attr("width", width - margin * 2)
            .attr("height", height - margin * 2)
            .attr("transform", `translate(${width / 2 + margin}, ${height / 2 + margin})`);
    
         // Filter the data to include only countries with actual data
        var filteredData = data[0].filter(d => d.value !== undefined && d.value !== null);

        var axisGrid = container.append("g").attr("class", "axisWrapper");
        axisGrid.selectAll(".levels")
            .data(d3.range(1, sectorCount + 1).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", (d, i) => (radius / sectorCount) * d)
            .style("fill", (d, i) => sectorColors(d))
            .style("stroke", "#B0C4DE")
            .style("fill-opacity", 0.4);

// Create a legend
        var legendContainer = svg.append("g")
            .attr("transform", `translate(${width - margin - 100}, ${margin})`); // Adjust position as needed

        legendContainer.selectAll(".legendItem")
            .data(d3.range(0, sectorCount))
            .enter()
            .append("g")
            .attr("class", "legendItem")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`); // Vertical spacing

// Add rectangles for the legend
        legendContainer.selectAll(".legendRect")
            .data(d3.range(0, sectorCount))
            .enter()
            .append("rect")
            .attr("class", "legendRect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d) => sectorColors(d)); // Use the same color scale

// Add text labels for the legend
        legendContainer.selectAll(".legendText")
            .data(d3.range(0, sectorCount).map(d => {
                var lowerBound = d * 1000;
                var upperBound = lowerBound + 999;
                return `${lowerBound}-${upperBound}`;
            }))
            .enter()
            .append("text")
            .attr("class", "legendText")
            .attr("x", 25) // Offset to the right of the rectangle
            .attr("y", (d, i) => i * 20 + 15) // Center the text vertically
            .text(d => d)
            .style("font-size", "10px")
            .style("fill", "#000"); // Optional: change the color of labels

    
        var axesDomain = data[0].map(d => d.axis);
        var rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);
        
        var axis = axisGrid.selectAll(".axis")
            .data(axesDomain)
            .enter()
            .append("g")
            .attr("class", "axis");
    
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue * 1.02) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(maxValue * 1.02) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("class", "line")
            .style("stroke", "#fff")
            .style("stroke-width", "2px");
    

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d, i) => rScale(maxValue * labelDistance) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(maxValue * labelDistance) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("transform", (d, i) => {
                const angle = (angleSlice * i * 180 / Math.PI) - 90;
                const rotation = angle > 90 && angle < 270 ? angle + 180 : angle;
                return `rotate(${rotation} ${rScale(maxValue * labelDistance) * Math.cos(angleSlice * i - Math.PI / 2)}, ${rScale(maxValue * labelDistance) * Math.sin(angleSlice * i - Math.PI / 2)})`;
            })
            .style("opacity", 0) // Initial opacity
            .transition() 
            .duration(1000) 
            .style("opacity", 1) // Target opacity
            .text(d => d);

        var radarLine = d3.lineRadial()
            .curve(d3.curveCardinalClosed)
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice);
    
        container.selectAll(".radarLine")
            .data([filteredData])
            .enter()
            .append("path")
            .attr("class", "radarLine")
            .transition() 
            .duration(1000)
            .attr("d", radarLine)
            .style("stroke-width", lineWidth + "px")
            .style("stroke", (d, i) => colors[i % colors.length])
            .style("fill", (d, i) => colors[i % colors.length])
            .style("fill-opacity", 0.35);
    
       // var tooltip = d3.select("#chart5").append("div")
       var tooltip = d3.select("#tooltip5")
            .attr("class", "spidertooltip")
            .style("opacity", 0)
    
        container.selectAll(".radarDots")
            .data(data[0].filter(d => d.value !== null && !isNaN(d.value)))
            .enter()
            .append("circle")
            .attr("class", "radarDots")
            .attr("r", dotRadius)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("fill", "black")
            .style("fill-opacity", 0.8)
            .on("mouseover", function(d) {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(
                    `Country: ${countryFullNames[d.axis]}<br>Year: ${d.year}<br>Value: ${d.value}`
                )
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }
