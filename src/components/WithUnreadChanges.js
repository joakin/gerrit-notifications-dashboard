import React, { Component } from "react";

import { getUnreadChanges, onUnreadChanges } from "../firebase";

export default class WithUnreadChanges extends Component {
  state = { changes: null };

  async componentDidMount() {
    const email = this.props.email;

    this.unsubscribe = onUnreadChanges(email, querySnapshot => {
      this.setChanges(querySnapshot);
    });
  }

  setChanges(querySnapshot) {
    const changes = querySnapshot.docs.map(s => s.data());
    this.setState({ changes });
    console.log("DB CHANGES", changes);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return this.props.children(this.state.changes);
  }
}
