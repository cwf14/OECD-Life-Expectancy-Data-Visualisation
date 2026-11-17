function init() {
    var width = 978;
    var height = 550;

    const oecdCountries = [
        "Australia", "Austria", "Belgium", "Canada", "Chile", "Colombia", "Costa Rica", "Czechia",
        "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland",
        "Ireland", "Israel", "Italy", "Japan", "Korea", "Latvia", "Lithuania", "Luxembourg",
        "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal", "Slovak Republic",
        "Slovenia", "Spain", "Sweden", "Switzerland", "Türkiye", "United Kingdom", "United States"
    ]; 

    var zoomLevel = 1;
    var initialTransform = d3.zoomIdentity;
    
    // Get all elements with the class 'description'
    var descriptions = document.querySelectorAll('.description');

    // Loop through each description and set the font size
    descriptions.forEach(function(description) {
        description.style.fontSize = '20px'; // Adjust the size as needed
    });

    // Define age groups with descriptions
    var ageGroups = [
        { code: 'Y0', description: 'Newborn (0 years old)' },
        { code: 'Y40', description: '40 years old' },
        { code: 'Y60', description: '60 years old' },
        { code: 'Y65', description: '65 years old' },
        { code: 'Y80', description: '80 years old' }
    ];

    

    const countryNameMapping = {
        "United States of America" : "United States",
        "Czech Republic" : "Czechia",
        "South Korea" : "Korea",
        "Slovakia" : "Slovak Republic",
        "Turkey" : "Türkiye",
        "China" : "China (People’s Republic of)",
        "Ukraine" : "Ukraine"

        // Add other mappings as necessary
    };
    console.log("Country Name Mapping:", countryNameMapping);

    var svg = d3.select("#chart1")
                .append("svg")
                .attr("viewBox", "0 0 " + width + " " + height)
                .attr("style", "max-width: 80%; height: auto; display: block; margin: 2em 0em 1em 6em;") // Set SVG to center
                .attr("preserveAspectRatio", "xMinYMin meet"); // Keep aspect ratio
 
    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    var g = svg.append("g");

    // Define the tooltip for hover globally in init function
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px");



    var projection = d3.geoNaturalEarth1()
        .scale(175)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    // Load data
    Promise.all([
        d3.csv("LifeExpectancyMap.csv").then(data => {
            console.log("CSV loaded:", data);
            return data;
        }),
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
            console.log("GeoJSON loaded:", world);
            return world;
        })]).then(function([data, world]) {
        var countries = topojson.feature(world, world.objects.countries).features; 
        
 
    data.forEach(d => {
        d.OBS_VALUE = +d.OBS_VALUE || 0; // Convert to number, default to 0 if undefined
        console.log(`Processed Entry:`, d);         // Log the processed entry for debugging
        
    });
        const uniqueCountries = Array.from(new Set(data.map(d => d['Reference area'])));

        // Log the unique countries
        console.log("Unique CSV Countries:", uniqueCountries);
        console.log("GeoJSON Countries:", countries.map(c => c.properties.name)); // Log GeoJSON country names

        // Populate age group selector
        d3.select("#age-select")
        .attr("for", "age-group-select")
        .text("Select Age Group:");

        var ageGroupDropdown = d3.select("#age-group-select");

        ageGroupDropdown.selectAll("option")
        .data(ageGroups)
        .enter()
        .append("option")
        .attr("value", d => d.code)
        .attr("title", d => d.description) // Add tooltip
        .text(d => d.code);

        // Calculate average life expectancy per country per year for each age group
        var avgLifeExpectancy = d3.rollup(
            data,
            v => d3.mean(v, d => +d.OBS_VALUE),
            d => d['Reference area'],
            d => d.TIME_PERIOD,
            d => d.AGE     // group by age group
        );
        console.log('success', avgLifeExpectancy);


        // Populate the slider with years
        var years = Array.from(new Set(data.map(d => d.TIME_PERIOD))).sort();
        var yearSlider = d3.select("#year-slider")
            .attr("min", d3.min(years))
            .attr("max", d3.max(years))
            .attr("value", years[0]);

        // Display initial year value
        d3.select("#year-value").text(years[0]);

        // Add event listener for slider
        yearSlider.on("input", function() {
            // Update the displayed year value
            var selectedYear = this.value;
            d3.select("#year-value").text(selectedYear);
            // Update map when slider changes
            var selectedAgeGroup = d3.select("#age-group-select").property("value");
            var selectedCountryGroup = d3.select("#country-select").property("value");
            updateMap(selectedYear, selectedAgeGroup, selectedCountryGroup);
        });

        // Add event listener for country group dropdown
        d3.select("#country-select").on("change", function() {
            var selectedYear = d3.select("#year-slider").property("value");
            var selectedAgeGroup = d3.select("#age-group-select").property("value");
            var selectedCountryGroup = this.value;
            updateMap(selectedYear, selectedAgeGroup, selectedCountryGroup);
        });

        // Add event listener for age group dropdown
        d3.select("#age-group-select").on("change", function() {
            var selectedYear = d3.select("#year-slider").property("value");
            var selectedAgeGroup = this.value;
            var selectedCountryGroup = d3.select("#country-select").property("value");
            updateMap(selectedYear, selectedAgeGroup, selectedCountryGroup);
        });

        // Add event listener to the Reset Filter button
        d3.select("#reset-filter-button").on("click", resetFilters);

        // Define the reset function
        function resetFilters() {
            var initialYear = years[0];
            var initialAgeGroup = ageGroups[0].code;
            var initialCountryGroup = "all";

            // Update the UI to reflect the initial state
            d3.select("#year-slider").property("value", initialYear);
            d3.select("#year-value").text(initialYear);
            d3.select("#age-group-select").property("value", initialAgeGroup);
            d3.select("#country-select").property("value", initialCountryGroup);

            // Reset the map view
            updateMap(initialYear, initialAgeGroup, initialCountryGroup);
        }


        // Create color scale
        const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([d3.min(data, d => d.OBS_VALUE), d3.max(data, d => d.OBS_VALUE)])
        .range(["#ABBFDC", "#08306b"]);    

        // Create the legend
        const legendWidth = 300;
        const legendHeight = 10;

        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

        const legendScale = d3.scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

        // Draw color legend
        legend.selectAll("rect")
            .data(d3.range(d3.min(data, d => d.OBS_VALUE), d3.max(data, d => d.OBS_VALUE) + 1)) // Adjust the range based on your data
            .enter()
            .append("rect")
            .attr("x", d => legendScale(d))
            .attr("y", 0)
            .attr("width", legendWidth / (d3.max(data, d => d.OBS_VALUE) - d3.min(data, d => d.OBS_VALUE))) // Adjust to fit
            .attr("height", legendHeight)
            .attr("fill", d => color(d));

        // Append legend axis
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(d3.axisBottom(legendScale)
                .ticks(6)
                .tickSize(-legendHeight)
            )
            .select(".domain").remove(); // Remove domain line
            
        function updateInfoBoard(selectedYear, selectedAgeGroup, selectedCountryGroup) {
                // Update the year on the board
                d3.select("#board-year").text(selectedYear);
            
                // Filter data for the selected year and age group
                let filteredData = data.filter(d => d.TIME_PERIOD == selectedYear && 
                    (selectedAgeGroup == "All" || d.AGE == selectedAgeGroup));

                // Further filter based on selected country group
                if (selectedCountryGroup === "oecd") {
                        filteredData = filteredData.filter(d => oecdCountries.includes(d['Reference area']));
                    } else if (selectedCountryGroup === "non-oecd") {
                        filteredData = filteredData.filter(d => !oecdCountries.includes(d['Reference area']));
                }
                // If no data available, display "N/A"
                if (filteredData.length === 0) {
                    d3.select("#highest-country").text("N/A");
                    d3.select("#highest-value").text("N/A");
                    d3.select("#lowest-country").text("N/A");
                    d3.select("#lowest-value").text("N/A");
                    return;
                }
            
                // Find highest and lowest life expectancy
                let sortedData = filteredData.sort((a, b) => b.OBS_VALUE - a.OBS_VALUE);
                let highest = sortedData[0];
                let lowest = sortedData[sortedData.length - 1];
            
                // Update the board with highest and lowest values
                d3.select("#highest-country").text(highest['Reference area']);
                d3.select("#highest-value").text(highest.OBS_VALUE.toFixed(2));
                d3.select("#lowest-country").text(lowest['Reference area']);
                d3.select("#lowest-value").text(lowest.OBS_VALUE.toFixed(2));
            }
        function updateMap(selectedYear, selectedAgeGroup, selectedCountryGroup) {
            g.selectAll("path").remove();  // Clear previous paths
  
            g.append("path")
                .datum({type: "Sphere"})
                .attr("fill", "lightgray")
                .attr("stroke", "black")
                .attr("d", path);
        
                g.selectAll("path.country")
                .data(countries)
                .enter()
                .append("path")
                .attr("class", d => oecdCountries.includes(countryNameMapping[d.properties.name] || d.properties.name) ? "oecd-country" : "non-oecd-country")
                .attr("d", path)
                .attr("fill", function(d) {
                    const normalizedCountryName = countryNameMapping[d.properties.name] || d.properties.name;
                    const isOECD = oecdCountries.includes(normalizedCountryName);
        
                    // Filter based on selected country group
                    if ((selectedCountryGroup === "oecd" && !isOECD) ||
                        (selectedCountryGroup === "non-oecd" && isOECD)) {
                        return "#ccc";  // Gray out countries not in selected group
                    }
        
                    const countryData = avgLifeExpectancy.get(normalizedCountryName);
                    if (countryData && countryData.has(selectedYear)) {
                        const ageGroups = countryData.get(selectedYear);
                        let lifeExp;
        
                        if (selectedAgeGroup === "All") {
                            lifeExp = d3.mean(Array.from(ageGroups.values()));
                        } else {
                            lifeExp = ageGroups.get(selectedAgeGroup);
                        }
        
                        return lifeExp ? color(lifeExp) : "#ccc";   
                    }
                    return "#ccc";    //for OECD countries with non data
                })
                .attr("stroke", "black")
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("stroke", "darkblue");

                    const normalizedCountryName = countryNameMapping[d.properties.name] || d.properties.name;
                    const countryData = avgLifeExpectancy.get(normalizedCountryName);
                    let tooltipContent;
                
                    if (countryData && countryData.has(selectedYear)) {
                        const ageGroups = countryData.get(selectedYear);
                        let lifeExp;
                
                        if (selectedAgeGroup === "All") {
                            lifeExp = d3.mean(Array.from(ageGroups.values()));
                        } else {
                            lifeExp = ageGroups.get(selectedAgeGroup);
                        }
                
                        if (lifeExp !== undefined && lifeExp !== null) {
                            tooltipContent = `${normalizedCountryName}<br>Life Expectancy: ${lifeExp.toFixed(2)}`;
                        } else {
                            tooltipContent = `${normalizedCountryName}<br>No data available`;
                        }
                    } else {
                        tooltipContent = `${normalizedCountryName}<br>No data available`;
                    }
                
                    tooltip.html(tooltipContent)
                        .style("visibility", "visible");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke", "black");
                    tooltip.style("visibility", "hidden");
                });
                updateInfoBoard(selectedYear, selectedAgeGroup, selectedCountryGroup);
        }

        // Add these lines instead:
        var initialYear = years[0];
        var initialAgeGroup = ageGroups[0].code;
        var initialCountryGroup = "all";
        updateMap(initialYear, initialAgeGroup, initialCountryGroup);
        console.log("can2", updateMap);
    });

    function zoomed(event) {
        g.attr("transform", event.transform);
    }

 
// Create a group for the zoom buttons at the top right of the map
var zoomGroup = svg.append("g")
    .attr("id", "zoom-buttons")
    .attr("transform", "translate(" + (width - 970) + ", 400)"); // Adjust as needed

// Define button labels and actions
const buttons = [
    { id: "zoom-in", label: "+", action: () => {
        zoomLevel = Math.min(zoomLevel * 1.5, 8);
        svg.transition().duration(750).call(zoom.scaleTo, zoomLevel);
    }},
    { id: "zoom-out", label: "-", action: () => {
        zoomLevel = Math.max(zoomLevel / 1.5, 1);
        svg.transition().duration(750).call(zoom.scaleTo, zoomLevel);
    }},
    { id: "reset-zoom", label: "Reset", action: () => {
        zoomLevel = 1;
        svg.transition().duration(750).call(zoom.transform, initialTransform);
    }}
];

// Append buttons to the zoom group
buttons.forEach((btn, index) => {
    zoomGroup.append("foreignObject")
        .attr("width", 60)
        .attr("height", 30)
        .attr("y", index * 35) // Space buttons vertically
        .append("xhtml:div")
        .html(`<button id="${btn.id}">${btn.label}</button>`)
        .select("button")
        .on("click", btn.action); // Attach action
});

    setupInfoBoardControls();
}
    function setupInfoBoardControls() {
        const infoBoard = document.getElementById('info-board');
        const closeInfoBtn = document.getElementById('close-info');
        const openInfoBtn = document.getElementById('open-info');

        closeInfoBtn.addEventListener('click', function() {
            infoBoard.style.display = 'none';
            openInfoBtn.style.display = 'block';
        });

        openInfoBtn.addEventListener('click', function() {
            infoBoard.style.display = 'block';
            openInfoBtn.style.display = 'none';
        });
    }
    
init();
