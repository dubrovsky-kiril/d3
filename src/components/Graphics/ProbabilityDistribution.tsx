import * as React from "react";
import * as d3 from "d3";
import styles from "./ProbabilityDistribution.scss";
import { on } from "cluster";

interface IProbabilityDistribution {
  coordinates: Array<{
    x: number;
    y: number;
  }>;
  dimensions: {
    height: number;
    width: number;
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

const ProbabilityDistribution: React.FC<IProbabilityDistribution> = ({
  dimensions,
  coordinates
}) => {
  const [goodClientsTreshold, changGoodClientsTreshold] = React.useState(0.15);

  const graphicId: string = "probability-distribution-grpahic";

  const drawGraphic = (): void => {
    const area = d3
      .select(`#${graphicId}`)
      .append("svg")
      .attr(
        "height",
        dimensions.height + dimensions.margin.top + dimensions.margin.bottom
      )
      .attr(
        "width",
        dimensions.width + dimensions.margin.left + dimensions.margin.right
      )
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
      );

    const xScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, dimensions.width]);

    // Flat all y values
    const yValues = coordinates.reduce((acc, curr: any) => {
      const yCoordinates = curr.map(coordinate => coordinate.y);
      acc.push(...yCoordinates);

      return acc;
    }, []);

    const yScale = d3
      .scaleLinear()
      .domain([0, Number(d3.max(yValues))])
      .range([dimensions.height, 0]);

    // Format xAxis
    const xAxis = area
      .append("g")
      .attr("class", styles.xAxis)
      .attr("transform", `translate(0, ${dimensions.height})`)
      .call(d3.axisBottom(xScale).tickSize(-dimensions.height));

    // Add vertical grid
    xAxis
      .attr("stroke-dasharray", "6")
      .select(".domain")
      .remove();

    // Make identation between grid and text
    d3.selectAll(".tick")
      .select("text")
      .attr("transform", `translate(0, 6)`);

    // Format yAxis
    const yAxis = area
      .append("g")
      .attr("class", styles.yAxis)
      .call(d3.axisLeft(yScale).tickSize(0));

    // Remove y axis
    yAxis.select(".domain").remove();

    // Line generator
    const line = d3
      .line()
      .x((d: any) => xScale(d.x))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw lines
    area
      .selectAll(".line")
      .data(coordinates)
      .enter()
      .append("path")
      .attr("d", (d: any) => line(d))
      .style("stroke", (_, i) => ["blue", "red"][i])
      .style("stroke-width", 3)
      .attr("class", (d: any, i) =>
        i === 0 ? styles.areaBlue : styles.areaRed
      )
      .append("linearGradient");

    // Prepare gradient tags
    area
      .selectAll(".gradient")
      .data(coordinates)
      .enter()
      .append("linearGradient")
      .attr("id", (d, i) => (i === 0 ? "blue-gradient" : "red-gradient"))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .selectAll("stop");

    // Format first gradient
    d3.select("#blue-gradient")
      .selectAll("stop")
      .data([{ offset: "0", color: "blue" }, { offset: "85%", color: "white" }])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Format second gradient
    d3.select("#red-gradient")
      .selectAll("stop")
      .data([{ offset: "0", color: "red" }, { offset: "85%", color: "white" }])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    area
      .append("rect")
      .attr("id", "blue-treshold")
      .attr("x", 0)
      .attr("width", dimensions.width * goodClientsTreshold)
      .attr("height", dimensions.height)
      .attr("fill", "blue")
      .attr("opacity", "0.1");

    area
      .append("line")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", 30)
      .attr("stroke", "blue")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .attr(
        "transform",
        `translate(${dimensions.width *
          goodClientsTreshold}, ${(dimensions.height - 30) / 2})`
      )
      .on("mousemove", () => {
        d3.select("#blue-treshold").attr(
          "width",
          dimensions.width * (goodClientsTreshold + 0.15)
        );
      });
  };

  React.useEffect(() => {
    drawGraphic();
  }, []);

  console.log(goodClientsTreshold);

  return <div id={graphicId} />;
};

export default ProbabilityDistribution;
