import * as React from "react";

import Button from "./atoms/Button";
import VideoComponent from "./VideoComponent";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header"></header>
      <VideoComponent />
    </div>
  );
};

export default App;
