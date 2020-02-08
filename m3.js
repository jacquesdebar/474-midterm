"use strict";

(function() {
  let data = "";
  let svgContainer = "";

  const legendary = ["All", "True", "False"];
  const generations = ["All", 1, 2, 3, 4, 5, 6];

  const colors = {
    Bug: "#4E79A7",
    Dark: "#A0CBE8",
    Dragon: "#FF0000",
    Electric: "#F28E2B",
    Fairy: "#FFBE7D",
    Fighting: "#59A14F",
    Fire: "#8CD17D",
    Flying: "#FFFF00",
    Ghost: "#B6992D",
    Grass: "#499894",
    Ground: "#86BCB6",
    Ice: "#FABFD2",
    Normal: "#E15759",
    Poison: "#FF9D9A",
    Psychic: "#79706E",
    Rock: "#333333",
    Steel: "#BAB0AC",
    Water: "#D37295"
  };

  window.onload = function() {
    svgContainer = d3
      .select("body")
      .append("svg")
      .attr("width", 1200)
      .attr("height", 500);

    d3.csv("pokemon.csv").then(pData => {
      data = pData;
      makeScatterPlot();
    });
  };

  function makeScatterPlot() {
    let def_data = data.map(row => parseInt(row["Sp. Def"]));
    let total_data = data.map(row => parseFloat(row["Total"]));

    let axesLimits = findMinMax(def_data, total_data);

    let xScale = d3
      .scaleLinear()
      .domain([axesLimits.xMin - 5, axesLimits.xMax + 5]) // give domain buffer room
      .range([50, 950]);

    let yScale = d3
      .scaleLinear()
      .domain([axesLimits.yMax + 20, axesLimits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    drawAxes(xScale, yScale);

    plotData(xScale, yScale);
  }

  function plotData(xScale, yScale) {
    const xMap = function(d) {
      return xScale(+d["Sp. Def"]);
    };
    const yMap = function(d) {
      return yScale(+d["Total"]);
    };

    // make tooltip
    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("padding", "2px");

    svgContainer
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("class", "point")
      .attr("r", 4)
      .attr("fill", function(d) {
        return colors[d["Type 1"]];
      })

      .on("mouseover", d => {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html(d.Name + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", d => {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    filter();

    makeLegend();
  }

  function filter() {
    d3.select("#legMenu")
      .append("select")
      .selectAll("option")
      .data(legendary)
      .enter()
      .append("option")
      .attr("value", function(d) {
        return d;
      })
      .html(function(d) {
        return d;
      });

    d3.select("#genMenu")
      .append("select")
      .selectAll("option")
      .data(generations)
      .enter()
      .append("option")
      .html(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    document
      .getElementById("legMenu")
      .addEventListener("change", filterPokemon);

    document
      .getElementById("genMenu")
      .addEventListener("change", filterPokemon);
  }

  function filterPokemon() {
    let fil = document.getElementById("legMenu").querySelector("select");
    let selected = fil.value;
    let fil2 = document.getElementById("genMenu").querySelector("select");
    let selected2 = fil2.value;

    svgContainer.selectAll(".point").attr("display", "none");

    svgContainer
      .selectAll(".point")
      .filter(function(d) {
        return (
          (selected == d["Legendary"] || selected == "All") &&
          (selected2 == d["Generation"] || selected2 == "All")
        );
      })
      .attr("display", "");
  }

  function makeLegend() {
    let legendColors = [];
    for (let color in colors) {
      legendColors.push(
        JSON.parse('{"' + color + '":"' + colors[color] + '"}')
      );
    }

    svgContainer
      .selectAll(".rect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("x", 1000)
      .attr("y", function(d, i) {
        return i * 20;
      })
      .attr("fill", function(d) {
        for (let breed in d) {
          return colors[breed];
        }
      });

    svgContainer
      .selectAll(".rect")
      .data(legendColors)
      .enter()
      .append("text")
      .attr("x", 1000)
      .attr("x", 1018)
      .attr("y", function(d, i) {
        return 10 + i * 20;
      })
      .text(function(d) {
        for (let breed in d) {
          return breed;
        }
      });
  }

  function drawAxes(xScale, yScale) {
    let xAxis = d3.axisBottom().scale(xScale);

    svgContainer
      .append("g")
      .attr("transform", "translate(0, 450)")
      .call(xAxis);

    svgContainer
      .append("text")
      .attr("x", 450)
      .attr("y", 490)
      .style("font-size", "14pt")
      .text("Sp. Def");

    let yAxis = d3.axisLeft().scale(yScale);

    svgContainer
      .append("g")
      .attr("transform", "translate(50, 0)")
      .call(yAxis);

    svgContainer
      .append("text")
      .attr("transform", "translate(20, 290)rotate(-90)")
      .style("font-size", "14pt")
      .text("Total");
  }

  function findMinMax(x, y) {
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    let yMin = d3.min(y);
    let yMax = d3.max(y);

    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    };
  }
})();
