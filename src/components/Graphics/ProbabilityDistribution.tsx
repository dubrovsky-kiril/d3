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

    let blueTreshold = 0.15;
    const draggingRectangleHeight = 30;
    const draggingRectangleWidth = 5;
    const tresholdLineWidth = 1;

    // Treshold rectangle
    area
      .append("g")
      .attr("id", "treshold-rect")
      .append("rect")
      .attr("id", "blue-treshold-rect")
      .attr("height", dimensions.height)
      .attr("fill", "blue")
      .attr("width", xScale(blueTreshold))
      .style("opacity", "0.1");

    // Treshold line
    d3.select("#treshold-rect")
      .append("line")
      .attr("id", "treshold-line")
      .attr("x1", xScale(blueTreshold) + tresholdLineWidth / 2)
      .attr("y1", "0%")
      .attr("x2", xScale(blueTreshold) + tresholdLineWidth / 2)
      .attr("y2", dimensions.height)
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .style("opacity", 0.5);

    function redraw() {
      // Remove possability to drag rectan`gle to negative X coordinates
      d3.select("#dragging-rectangle")
        .attr("x", blueTreshold >= 0 ? blueTreshold : 0)
        .attr("transform", `translate(-2, 0)`);

      d3.select("#dragging-text")
        .text(
          +xScale.invert(blueTreshold).toFixed(3) > 0
            ? +xScale.invert(blueTreshold).toFixed(3)
            : "0.00"
        )
        .attr("x", () => {
          if (xScale.invert(blueTreshold).toFixed(3).length > 3) {
            return blueTreshold >= 0 ? blueTreshold - 41 : -41;
          } else {
            return blueTreshold >= 0 ? blueTreshold - 41 : -41;
          }
        });

      d3.select("#treshold-line")
        .attr(
          "x1",
          blueTreshold >= 0 ? blueTreshold + draggingRectangleWidth / 2 : 2.5
        )
        .attr(
          "x2",
          blueTreshold >= 0 ? blueTreshold + draggingRectangleWidth / 2 : 2.5
        )
        .attr("transform", `translate(-2, 0)`);

      d3.select("#blue-treshold-rect").attr(
        "width",
        blueTreshold >= 0 ? blueTreshold + tresholdLineWidth : 0
      );
    }

    function on_drag() {
      blueTreshold = d3.event.x;
      redraw();
    }

    // Dragging rectangle
    d3.select("#treshold-rect")
      .append("rect")
      .attr("id", "dragging-rectangle")
      .attr("fill", "blue")
      .attr("height", draggingRectangleHeight)
      .attr("width", draggingRectangleWidth)
      .attr("x", xScale(blueTreshold))
      .attr("transform", `translate(-2, 0)`)
      .attr("y", (dimensions.height - draggingRectangleHeight) / 2)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("cursor", "ew-resize")
      .call(d3.drag().on("drag", on_drag));

    // Dragging rectangle text
    d3.select("#treshold-rect")
      .append("text")
      .attr("id", "dragging-text")
      .text(blueTreshold)
      .attr("x", xScale(blueTreshold) - 40)
      .attr("y", (dimensions.height + draggingRectangleWidth) / 2)
      .style("font-size", "14px")
      .style("fill", "blue");
  };

  React.useEffect(() => {
    drawGraphic();
  }, []);

  return <div id={graphicId} />;
};

export default ProbabilityDistribution;
