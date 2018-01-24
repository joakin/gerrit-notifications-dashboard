import React, { Component } from "react";

import {
  createUser,
  justUpdated,
  setChange,
  setCommentsFromGerrit,
  markChangeRead
} from "../firebase";
import { fromGerritDate } from "../date";
import { getChanges, getComments } from "../gerrit";
import WithUnreadChanges from "./WithUnreadChanges";

export default class Gerrit extends Component {
  componentDidMount() {
    this.getChanges(this.props.email);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.email !== this.props.email) this.getChanges(nextProps.email);
  }

  async getChanges(email) {
    if (email) {
      // Get DB user
      const user = (await createUser(email)).data();

      const lastUpdate = user.lastUpdate ? new Date(user.lastUpdate) : null;

      // Get gerrit changes
      const changes = await getChanges(email);
      console.log("FETCHED CHANGES", changes);

      // Select the changes that have been updated since our last fetch
      const updatedChanges = changes.filter(
        ({ updated }) => !lastUpdate || fromGerritDate(updated) > lastUpdate
      );
      console.log("UPDATED CHANGES", updatedChanges);

      // Update the changed changes in the DB
      const updatedDocs = await Promise.all(
        updatedChanges.map(change => setChange(email, change.id, change))
      );

      // Update the comments for updated changes
      await Promise.all(
        updatedDocs.map(doc => doc.data()).map(async change => {
          const comments = await getComments(change.id);
          await setCommentsFromGerrit(email, change.id, comments);
        })
      );

      // Update the last fetch update date
      await justUpdated(email);
    }
  }

  render() {
    const { email } = this.props;
    return (
      <div>
        <h2>Changes</h2>
        <p>
          <button onClick={() => this.getChanges(email)}>Refresh</button>
        </p>
        {email ? (
          <WithUnreadChanges email={email}>
            {changes => (changes ? this.renderChanges(changes) : <p>...</p>)}
          </WithUnreadChanges>
        ) : (
          <p>Log in to see messages</p>
        )}
      </div>
    );
  }

  renderChanges(changes) {
    const byProject = changes.reduce((map, change) => {
      map[change.project] = (map[change.project] || []).concat(change);
      return map;
    }, {});
    return (
      <ul>
        {Object.entries(byProject).map(([project, changes]) => (
          <li key={project}>
            {project}
            <ul>
              {changes.map(({ id, subject }) => (
                <li key={id}>
                  {subject}{" "}
                  <a
                    href={"#" + id}
                    onClick={e => this.markChangeRead(id) || e.preventDefault()}
                  >
                    [read]
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  markChangeRead(id) {
    markChangeRead(this.props.email, id);
  }
}
