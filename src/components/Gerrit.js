import React, { Component } from "react";

const proxy = url => `https://cors-proxy-mhwanfbyyu.now.sh/${url}`;

export default class Gerrit extends Component {
  state = { patches: null };

  componentDidMount() {
    this.getPatches(this.props.email);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.email !== this.props.email) this.getPatches(nextProps.email);
  }

  getPatches(email) {
    if (email)
      fetch(
        proxy(
          `https://gerrit.wikimedia.org/r/changes/?q=owner:${encodeURIComponent(
            email
          )}+OR+reviewer:${encodeURIComponent(
            email
          )}&limit=10&o=MESSAGES&o=DETAILED_ACCOUNTS&o=REVIEWER_UPDATES`
        )
      )
        .then(resp => resp.text())
        .then(txt => {
          const json = JSON.parse(txt.slice(4).trim());
          this.setState({ patches: json });
          console.log("FETCHED PATCHES", json);
        })
        .catch(console.log);
  }

  render() {
    const { patches } = this.state;
    return (
      <div>
        <h2>Patches</h2>
        <ul>
          {patches &&
            patches.map(({ project, subject, id }) => (
              <li key={id}>
                {project} - {subject}
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
