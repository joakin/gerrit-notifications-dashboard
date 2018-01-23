import React, { Component } from "react";
import WithUser from "./WithUser";
import Gerrit from "./Gerrit";
import "./App.css";

import Login from "./Login";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Gerrit notifications dashboard</h1>
          <Login />
        </header>
        <WithUser>
          {user => <Gerrit email={(user && user.email) || null} />}
        </WithUser>
      </div>
    );
  }
}

export default App;
