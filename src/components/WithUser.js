import { Component } from "react";
import { onAuthChange } from "../firebase";

export default class WithUser extends Component {
  state = {
    user: null
  };

  componentDidMount() {
    this.unsubscribe = onAuthChange(user => {
      this.setState({ user });
      console.log("AUTH CHANGE", user);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return this.props.children(this.state.user);
  }
}
