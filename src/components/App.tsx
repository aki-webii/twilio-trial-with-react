import * as React from "react";

import Button from "./atoms/Button";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>React boilerplate with TypeScript.</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button>Styled Button</Button>
        <Button primary>Styled Button</Button>
      </header>
    </div>
  );
};

export default App;
