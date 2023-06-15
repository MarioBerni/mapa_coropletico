document.addEventListener("DOMContentLoaded", function() {
  const urlEducation = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
  const urlUS = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

  Promise.all([d3.json(urlUS), d3.json(urlEducation)]).then(function([us, education]) {

      const width = 960;
      const height = 600;

      const path = d3.geoPath();

      const color = d3.scaleThreshold()
          .domain([10, 20, 30, 40, 50, 60, 70, 80])
          .range(d3.schemeBlues[9]);

      const educationMap = {};
      education.forEach(d => educationMap[d.fips] = d);

      const svg = d3.select("#map")
          .attr("width", width)
          .attr("height", height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet');

      svg.append("g")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.counties).features)
          .enter().append("path")
          .attr("class", "county")
          .attr("data-fips", d => d.id)
          .attr("data-education", d => educationMap[d.id].bachelorsOrHigher)
          .attr("fill", d => color(educationMap[d.id].bachelorsOrHigher))
          .attr("d", path)
          .on("mouseover", function(d) {
              d3.select("#tooltip")
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 50) + "px")
                  .style("opacity", .9)
                  .attr("data-education", educationMap[d.id].bachelorsOrHigher)
                  .html(`
                      ${educationMap[d.id].area_name}, ${educationMap[d.id].state}: ${educationMap[d.id].bachelorsOrHigher}%
                  `);
          })
          .on("mouseout", function() {
              d3.select("#tooltip").style("opacity", 0);
          });

      const legend = svg.append("g")
          .attr("id", "legend")
          .attr("transform", "translate(" + (width - 260) + ",20)");

      const x = d3.scaleLinear()
          .domain([10, 80])
          .rangeRound([0, 240]);

      legend.selectAll("rect")
          .data(color.range().map(function(d) {
              d = color.invertExtent(d);
              if (d[0] == null) d[0] = x.domain()[0];
              if (d[1] == null) d[1] = x.domain()[1];
              return d;
          }))
          .enter().append("rect")
          .attr("height", 8)
          .attr("x", d => x(d[0]))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("fill", d => color(d[0]));

      legend.append("text")
          .attr("class", "caption")
          .attr("x", x.range()[0])
          .attr("y", -6)
          .attr("fill", "#000")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Education rate (%)");

      legend.call(d3.axisBottom(x)
          .tickSize(13)
          .tickValues(color.domain()))
          .select(".domain")
          .remove();

  });
});
