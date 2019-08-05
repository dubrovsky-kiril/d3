import * as React from "react";
import * as d3 from "d3";
import Header from "components/Header/Header.container";
import Main from "components/Main/Main.container";
import Footer from "components/Footer/Footer";
import data from "./data.json";
import styles from "./App.scss";

interface IProbabilityDistribution {
  lines: any;
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
  lines
}) => {
  console.log(lines);
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

    const yValues = data.reduce((acc, curr) => {
      const descutredYValues = curr.metrics.map(s => s.y);
      acc.push(...descutredYValues);

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
      .x((d: any, i) => {
        return xScale(d.x);
      })
      .y((d: any) => {
        return yScale(d.y);
      })
      .curve(d3.curveMonotoneX);

    area
      .selectAll(".line")
      .data(lines)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", (d: any) => {
        return line(d.metrics);
      })
      .style("stroke", (_, i) => ["blue", "red"][i])
      .style("stroke-width", 2)
      .style("fill", "none");
  };

  React.useEffect(() => {
    drawGraphic();
  }, []);

  return <div id={graphicId} />;
};

const App: React.FC = () => {
  const dimensions = {
    height: 300,
    width: 800,
    margin: {
      top: 15,
      right: 15,
      bottom: 30,
      left: 15
    }
  };

  const formatedData = data.reduce((acc, curr) => {
    acc.push(curr.metrics);

    return acc;
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <ProbabilityDistribution dimensions={dimensions} lines={data} />
    </div>
  );
};

export default App;
