// set the dimensions and margins of the graph
var margin = {top: 10, right: 150, bottom: 50, left: 60},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object for the chart
var svg = d3.select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create a tooltip
var tooltip = d3.select("#scatterPlot")
    .append("div")
    .style("opacity", 0) //initial hide tooltip
    .attr("class", "tooltip")  //apply css class
    .style("background-color", "#5c8f91")
    .style("border", "solid")
    .style("color", "white")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("transition", "opacity 0.3s"); // Fade effect;

// Mouseover functions for the tooltip
var mouseover = function(d) {
    tooltip.style("opacity", 1);
};

var mousemove = function(d) {
    tooltip
        .html("Country: "+d.area + "<br>" +"Sex: "+d.Sex + "<br>" + "Age: "+d.Age + "<br>"+"Year: "+ d.TIME_PERIOD + "<br>"+"Value: "+"" + d.OBS_VALUE + "</b>")
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY) + "px");
};

var mouseleave = function(d) {
    tooltip.transition().duration(200).style("opacity", 0);
};
var backgroundGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "bg-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");

backgroundGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#f0f0f0");

backgroundGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#C5C7C4");

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#bg-gradient)");


// Read the data
d3.csv("https://raw.githubusercontent.com/chaiyenthung/COS30045/refs/heads/main/LifeExpectancy.csv", function(data) {

    // Filter for females and males
    var femaleData = data.filter(function(d) {
        return d.TIME_PERIOD >= 2000 && d.TIME_PERIOD <= 2023 && d.MEASURE === 'LFEXP' && d.Sex === "Female" ;
    });
    var maleData = data.filter(function(d) {
        return d.TIME_PERIOD >= 2000 && d.TIME_PERIOD <= 2023 && d.MEASURE === 'LFEXP' && d.Sex === "Male" ;
    });
    var totalData = data.filter(function(d) {
        return d.TIME_PERIOD >= 2000 && d.TIME_PERIOD <= 2023 && d.MEASURE === 'LFEXP' && d.Sex === "Total" ;
    });
    var difData = data.filter(function(d) {
        return d.TIME_PERIOD >= 2000 && d.TIME_PERIOD <= 2023 && d.MEASURE === 'LFEXPDFM' ;
    });
    // List of groups
    var allGroup = d3.map(femaleData, function(d){ return d.area; }).keys();
    allGroup.sort();
    // Add options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d) { return d; })
        .attr("value", function(d) { return d; });

    var ageOptions = d3.map(data, function(d) { return d.Age; }).keys();
        ageOptions = Array.from(new Set(ageOptions));  // Ensure age options are unique
      ageOptions.sort();  
        // Add options to the age button
        d3.select("#ageButton")
            .selectAll('myOptions')
            .data(ageOptions)
            .enter()
            .append('option')
            .text(function(d) { return d; })
            .attr("value", function(d) { return d; });

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(femaleData, function(d) { return d.TIME_PERIOD; }))
        .range([0, width]);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")))
        .selectAll("path, line")
        .style("stroke", "#4A4A4A") // Darker stroke for axis
        .style("stroke-width", "3px");

       
        // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width + margin.left - 350)
        .attr("y", height + margin.top + 30)
        .text("Year")
        .style("font-size", "20px")
        .style("fill", "#333"); // Darker text color
        

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(femaleData, function(d) { return +d.OBS_VALUE; })])
        .range([height, 0]);
    
    svg.append("g").call(d3.axisLeft(y))
    .selectAll("path, line")
    .style("stroke", "#4A4A4A") // Darker stroke for axis
    .style("stroke-width", "3px");

    // Add grid lines
    svg.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")); // Remove the tick labels

    svg.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")); // Remove the tick labels

    // Style for the grid lines
    svg.selectAll(".grid line")
        .style("stroke", "#B3BCB1") // Light gray color for grid lines
        .style("stroke-width", "1px"); // Width of the grid lines

    svg.selectAll(".grid path")
        .style("display", "none"); // Hide the axis path to avoid overlap

    // Function to draw grid lines for the X axis
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(10);
    }

    // Function to draw grid lines for the Y axis
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(10);
    }
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top - 200)
        .text("Life Expectancy")
        .style("font-size", "20px")
        .style("fill", "#333"); // Darker text color

    // Initialize lines for females and males
    var lineFemale = svg.append("path")
        .datum(femaleData.filter(function(d){ return d.area == allGroup[0]; }))
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }))
        .attr("stroke", "#E8909E")  // Color for female line
        .style("stroke-width", 2)
        .style("fill", "none");

    var lineMale = svg.append("path")
        .datum(maleData.filter(function(d){ return d.area == allGroup[0]; }))
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }))
        .attr("stroke", "#3765A7")  // Color for male line
        .style("stroke-width", 2)
        .style("fill", "none");

    var lineTotal = svg.append("path")
        .datum(totalData.filter(function(d){ return d.area == allGroup[0]; }))
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }))
        .attr("stroke", "#68BE46")  // Color for total line
        .style("stroke-width", 2)
        .style("fill", "none");

    var lineDif = svg.append("path")
        .datum(difData.filter(function(d){ return d.area == allGroup[0]; }))
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }))
        .attr("stroke", "#AF96EA")  // Color for total line
        .style("stroke-width", 2)
        .style("fill", "none");
    
    // Add circles for females and males and set tooltip events
    svg.selectAll(".circleFemale")
        .data(femaleData.filter(function(d) { return d.area == allGroup[0]; }))
        .enter()
        .append("circle")
        .attr("class", "circleFemale")
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); })
        .attr("r", 4)
        .attr("fill", "red")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.selectAll(".circleMale")
        .data(maleData.filter(function(d) { return d.area == allGroup[0]; }))
        .enter()
        .append("circle")
        .attr("class", "circleMale")
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); })
        .attr("r", 4)
        .attr("fill", "blue")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.selectAll(".circleTotal")
        .data(totalData.filter(function(d) { return d.area == allGroup[0]; }))
        .enter()
        .append("circle")
        .attr("class", "circleTotal")
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); })
        .attr("r", 4)
        .attr("fill", "green")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.selectAll(".circleDif")
        .data(difData.filter(function(d) { return d.area == allGroup[0]; }))
        .enter()
        .append("circle")
        .attr("class", "circleDif")
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); })
        .attr("r", 4)
        .attr("fill", "purple")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

        var defaultGroup = allGroup[0];  // First area as default
        var defaultAge = ageOptions[0];  // First age option as default 
    // Function to update the chart
    function update(selectedGroup,selectedAge) {
        
      // Update female line
    var dataFilterFemale = femaleData.filter(function(d) { return d.area == selectedGroup&& d.Age == selectedAge;; });
    lineFemale
        .datum(dataFilterFemale)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }));

    // Update female circles
    var circlesFemale = svg.selectAll(".circleFemale")
        .data(dataFilterFemale);

    // Remove circles that no longer have data (for example, if no data for 2023)
    circlesFemale.exit().remove();

    // Create new circles if needed and update existing ones
    circlesFemale.enter()
        .append("circle")
        .attr("class", "circleFemale")
        .attr("r", 4)
        .attr("fill", "red")
        .merge(circlesFemale)  // Merge the enter and update selections
        .on("mouseover", mouseover) // Add tooltip events
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); });


    // Update male line
    var dataFilterMale = maleData.filter(function(d) { return d.area == selectedGroup&& d.Age == selectedAge;; });
    lineMale
        .datum(dataFilterMale)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }));

    // Update male circles
    var circlesMale = svg.selectAll(".circleMale")
        .data(dataFilterMale);

    // Remove circles that no longer have data
    circlesMale.exit().remove();

    // Create new circles if needed and update existing ones
    circlesMale.enter()
        .append("circle")
        .attr("class", "circleMale")
        .attr("r", 4)
        .attr("fill", "blue")
        .merge(circlesMale)
        .on("mouseover", mouseover) // Add tooltip events
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); });

     // Update total line
    var dataFilterTotal = totalData.filter(function(d) { return d.area == selectedGroup && d.Age == selectedAge;; });
    lineTotal
        .datum(dataFilterTotal)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }));

    // Update total circles
    var circlesTotal = svg.selectAll(".circleTotal")
        .data(dataFilterTotal);

    // Remove circles that no longer have data
    circlesTotal.exit().remove();

    // Create new circles if needed and update existing ones
    circlesTotal.enter()
        .append("circle")
        .attr("class", "circleTotal")
        .attr("r", 4)
        .attr("fill", "green")
        .merge(circlesTotal)
        .on("mouseover", mouseover) // Add tooltip events
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); });

         // Update total line
    var dataFilterDif = difData.filter(function(d) { return d.area == selectedGroup&& d.Age == selectedAge;; });
    lineDif
        .datum(dataFilterDif)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function(d) { return x(d.TIME_PERIOD); })
            .y(function(d) { return y(+d.OBS_VALUE); }));

    // Update total circles
    var circlesDif = svg.selectAll(".circleDif")
        .data(dataFilterDif);

    // Remove circles that no longer have data
    circlesDif.exit().remove();

    // Create new circles if needed and update existing ones
    circlesDif.enter()
        .append("circle")
        .attr("class", "circleDif")
        .attr("r", 4)
        .attr("fill", "purple")
        .merge(circlesDif)
        .on("mouseover", mouseover) // Add tooltip events
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(d.TIME_PERIOD); })
        .attr("cy", function(d) { return y(+d.OBS_VALUE); });

}


    // When the button is changed, run the update function
   // When the age button is changed, run the update function
d3.select("#ageButton").on("change", function(d) {
    var selectedAge = d3.select(this).property("value");
    var selectedGroup = d3.select("#selectButton").property("value"); // Get currently selected area
    update(selectedGroup, selectedAge);
});

// Modify the existing change event for the area button
d3.select("#selectButton").on("change", function(d) {
    var selectedGroup = d3.select(this).property("value");
    var selectedAge = d3.select("#ageButton").property("value"); // Get currently selected age
    update(selectedGroup, selectedAge);
    
});
update(defaultGroup, defaultAge);

    var legend = svg.append("g")
        .attr("transform", "translate(" + (width + 40) + "," + 150 + ")");

    var legendData = [
        { label: "Female", color: "red" },
        { label: "Male", color: "blue" },
        { label: "Total", color: "green" },
        { label: "Difference", color: "purple" }
        ];

    // Create a border rectangle for the legend
    legend.append("rect")
        .attr("x", -10) // Adjust the x position to center the border
        .attr("y", -10) // Adjust the y position to center the border
        .attr("width", 120) // Set the width of the border
        .attr("height", legendData.length * 30 + 10) // Set height based on number of items
        .style("fill", "#dbdbdb")
        .style("stroke", "#0b1617") // Border color
        .style("stroke-width", "4px") // Border width
        .style("rx", "5") // Optional: rounded corners
        .style("ry", "5"); // Optional: rounded corners

    legend.selectAll("mydots")
            .data(legendData)
            .enter()
            .append("circle")
            .attr("cx", 10)
            .attr("cy", function (d, i) { return 10 + i * 30; })  // Increase vertical space between dots
            .attr("r", 8)  // Make the legend circles larger
            .style("fill", function (d) { return d.color; })
            .style("pointer-events", "none") // Disable pointer events for circles
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(d.label)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(200).style("opacity", 0);
            });

    legend.selectAll("mylabels")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 20)  // Move the text further from the circles
            .attr("y", function (d, i) { return 10 + i * 30; })  // Match the vertical positioning of the text with the circles
            .style("fill", function (d) { return d.color; })
            .text(function (d) { return d.label; })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-weight", "bold") // Make the font bold
            .style("font-family", "'Roboto', sans-serif") // Apply the font family
            .style("font-size", "14px")
            .style("pointer-events", "none"); // Prevent hover effects on text labels
            });
