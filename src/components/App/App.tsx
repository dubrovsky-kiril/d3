import * as React from "react";
import ProbabilityDistribution from "../../components/Graphics/ProbabilityDistribution";
import data from "./data.json";

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

  type formatedDataType = Array<{
    x: number;
    y: number;
  }>;
  const formatedData = data.reduce((acc, curr): formatedDataType => {
    acc.push(curr.metrics);

    return acc;
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <ProbabilityDistribution
        dimensions={dimensions}
        coordinates={formatedData}
      />
      {/* <GradientGraphic /> */}
    </div>
  );
};

export default App;
