import React, { Component } from "react";
import WithUser from "./WithUser";
import { login } from "../firebase";

export default class Login extends Component {
  login = () => {
    login().catch(console.log);
  };

  render() {
    return (
      <div className="Login">
        <WithUser>
          {user =>
            user ? (
              <span>{user.displayName}</span>
            ) : (
              <button onClick={this.login}>Login</button>
            )
          }
        </WithUser>
      </div>
    );
  }
}
