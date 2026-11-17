// Set dimensions and margins for the chart
    var w = 1050, h = 500;
    var margin = { top: 20, right: 30, bottom: 40, left: 250 };
    var showTotal = false; // Toggle to show/hide the total value
    var currentSortOption = "default";  // Track current sort option
    var currentRegion = "default"; // Track current region filter

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

// Load the CSV data
    d3.csv("DatasetCauseOfMortality.csv").then(data => {

// Parse and map data for easier use
        data = data.map(d => ({
            REF_AREA: d.REF_AREA,
            cause_of_death: d["Cause of death"],
            OBS_VALUE: +d.OBS_VALUE,
            year: +d.TIME_PERIOD
        }));

// Filter data to include only even years and get unique years
        var filteredYears = data.filter(d => d.year % 2 === 0);
        var years = [...new Set(filteredYears.map(d => d.year))].sort((a, b) => a - b);

// Populate year dropdown menu
        var dropdown = d3.select("#yearDropdown");
            dropdown.selectAll("option")
                .data(years)
                .join("option")
                .attr("value", d => d)
                .text(d => d);

// Event listener to toggle 'Total' values
        d3.select("#toggleTotal")
            .on("click", function () {
                showTotal = !showTotal;
                this.textContent = showTotal ? "Hide Total" : "Show Total";
                updateChart(); // Refresh chart on toggle
            });

// Default update with the first year
        updateChart();

// Update chart when sort options change
        dropdown.on("change", updateChart);

// Update chart when sort options change
        d3.select("#sortOptions").on("change", function () {
            currentSortOption = d3.select("#sortOptions").property("value");
            updateChart();
        });

// Reset to default sorting when button is clicked
        d3.select("#defaultButton").on("click", function () {
            currentSortOption = "default";
            currentRegion = "default";
            updateChart();
        });

// Update chart when sort region change
        d3.select("#sortRegions").on("change", function () {
            currentRegion = d3.select("#sortRegions").property("value");
            updateChart();
        });

        d3.select("#resetButton").on("click", function () {
// Reset all filters and sorting options
            currentSortOption = "default"; // Reset to default sorting
            currentRegion = "default"; // Reset region filter
            showTotal = false; // Hide total values by default
            
// Update button text
            d3.select("#toggleTotal").text("Show Total");
        
// Update the year dropdown to its first option
            dropdown.property("value", years[0]);
        
// Reset sort options dropdown to "default"
            d3.select("#sortOptions").property("value", "default");

// Reset region dropdown to its default value
            d3.select("#sortRegions").property("value", "default"); // Add this line
        
// Call updateChart to refresh the chart
            updateChart();
        });
// Declare it globally
            var filteredData; 

// Function to update and render the chart
        function updateChart() {
            var selectedYear = +dropdown.node().value;
            filteredData = filteredYears.filter(d => d.year === selectedYear);
        
// Filter based on 'Total' toggle
            if (showTotal) {
// Only include 'Total' data
                filteredData = filteredData.filter(d => d.cause_of_death === "Total");
            } else {
// Exclude 'Total' data
                filteredData = filteredData.filter(d => d.cause_of_death !== "Total");
            }
        
            filteredData = filteredData.filter(d => !isNaN(d.OBS_VALUE));
        
// Apply region filter if selected
            if (currentRegion !== "default") {
                filteredData = filteredData.filter(d => countryRegions[d.REF_AREA] === currentRegion);
            }
        
// Calculate totals for each country
            var totals = d3.rollup(
                filteredData,
                group => d3.sum(group, d => d.OBS_VALUE),
                d => d.REF_AREA
            );
        
// Sort data based on selected sort option or region
            switch (currentSortOption) {
                case "desc":
                    filteredData.sort((a, b) => totals.get(b.REF_AREA) - totals.get(a.REF_AREA));
                    break;
                case "asc":
                    filteredData.sort((a, b) => totals.get(a.REF_AREA) - totals.get(b.REF_AREA));
                    break;
                case "a-z":
                    filteredData.sort((a, b) => a.REF_AREA.localeCompare(b.REF_AREA));
                    break;
                case "z-a":
                    filteredData.sort((a, b) => b.REF_AREA.localeCompare(a.REF_AREA));
                    break;
            }
        
            renderChart(filteredData);
        }
// Function to render the chart with D3.js
function renderChart(data) {
    // Clear previous chart elements
    d3.select("#chart3").selectAll("*").remove();
    d3.select("#legend3").selectAll("*").remove();

// Nested data by country and prepare it for stacked bar chart
    var nestedData = d3.groups(data, d => d.REF_AREA).map(([REF_AREA, values]) => {
        var result = { REF_AREA: REF_AREA };
        values.forEach(d => result[d.cause_of_death] = d.OBS_VALUE);
        return result;
    });

// Get unique causes of death
    var causesOfDeath = d3.union(data.map(d => d.cause_of_death));
    var series = d3.stack()
        .keys(causesOfDeath)
        (nestedData);

// Define scales
    var x = d3.scaleBand()
        .domain(nestedData.map(d => d.REF_AREA))
        .range([margin.left, w - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .range([h - margin.bottom, margin.top]);

    var color = d3.scaleOrdinal(d3.schemePaired);        

// Create SVG container
    var svg = d3.select("#chart3").append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("viewBox", [0, 0, w, h])
        .attr("viewBox", `0 0 ${w} ${h}`)
        .style("display", "block")
        .style("min-width", "100%");


// Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "mortalitytooltip")
        .style("visibility", "hidden");

// Render bars for the stacked chart
    svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d.map((e, i) => ({ ...e, key: d.key, index: i }))) // Add index for staggered effect
        .join("rect")
        .attr("x", d => x(d.data.REF_AREA))
        .attr("y", y(0)) // Start from y=0 for animation effect
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .transition()
        .delay((d, i) => i * 50) // Delay based on index
        .duration(500)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .on("end", function() {
            d3.select(this)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.7);
                var countryFullName = countryFullNames[d.data.REF_AREA] || d.data.REF_AREA;
                tooltip.style("visibility", "visible")
                    .html(`Country: ${countryFullName}<br>Cause: ${d.key}<br>Value: ${d3.format(",")(d[1] - d[0])}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                tooltip.style("visibility", "hidden");
            });
        });

// Add X-axis and Y-axis
    svg.append("g")
        .attr("class", "x-axis") // Add class for selection
        .attr("transform", `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickSize(-w + margin.left + margin.right)
        )
        .call(g => g.selectAll(".tick line")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "2,2")
            .filter(d => d === 0)
            .remove()
        )
        .call(g => g.select(".domain")
            .attr("stroke", "#000")
        );

// Y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -(h / 2))
        .attr("y", 210)
        .attr("transform", "rotate(-90)")
        .text("Death Rate (per 100,000 inhabitants)");

// X-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", w / 1.75)
        .attr("y", h - 5)
        .text("OECD Country");

// Create Legend
    var legend = d3.select("#legend3").append("svg")
        .attr("width", 300)
        .attr("height", causesOfDeath.size * 25);

    var legendItem = legend.selectAll(".legend-item")
        .data(causesOfDeath)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color(d));

    legendItem.append("text")
        .attr("x", 17)
        .attr("y", 12)
        .style("font-size", "11.5px")
        .text(d => d);
}
// Ensure the x-scale domain always covers all countries
        var allCountries = Array.from(new Set(filteredYears.map(d => d.REF_AREA)));
        
        var x = d3.scaleBand()
            .domain(allCountries)  // Use all countries to prevent shifting
            .range([margin.left, w - margin.right])
            .padding(0.1);

        renderChart(filteredData);


    });
