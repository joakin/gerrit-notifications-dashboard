import React, { Component } from "react";

import {
  createUser,
  justUpdated,
  setChange,
  setCommentsFromGerrit
} from "../firebase";
import { fromGerritDate } from "../date";

const proxy = url => `https://cors-proxy-mhwanfbyyu.now.sh/${url}`;
const gerritURL = "https://gerrit.wikimedia.org/r/changes/";
const changesURL = email =>
  proxy(
    `${gerritURL}?q=owner:${encodeURIComponent(
      email
    )}+OR+reviewer:${encodeURIComponent(
      email
    )}&limit=10&o=MESSAGES&o=DETAILED_ACCOUNTS&o=REVIEWER_UPDATES`
  );

async function fetchGerrit(url) {
  const txt = await (await fetch(url)).text();
  const json = JSON.parse(txt.slice(4).trim());
  return json;
}

function getChanges(email) {
  return fetchGerrit(changesURL(email));
}

const commentsURL = id => proxy(`${gerritURL}${id}/comments`);

function getComments(id) {
  return fetchGerrit(commentsURL(id));
}

export default class Gerrit extends Component {
  state = { changes: null };

  componentDidMount() {
    this.getChanges(this.props.email);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.email !== this.props.email) this.getChanges(nextProps.email);
  }

  async getChanges(email) {
    if (email) {
      const user = (await createUser(email)).data();
      const lastUpdate = user.lastUpdate ? new Date(user.lastUpdate) : null;
      const changes = await getChanges(email);
      console.log("FETCHED CHANGES", changes);
      const updatedChanges = changes.filter(
        ({ updated }) => !lastUpdate || fromGerritDate(updated) > lastUpdate
      );
      console.log("UPDATED CHANGES", updatedChanges);
      const updatedDocs = await Promise.all(
        updatedChanges.map(change => setChange(email, change.id, change))
      );
      await justUpdated(email);

      await Promise.all(
        updatedDocs.map(doc => doc.data()).map(async change => {
          const comments = await getComments(change.id);
          await setCommentsFromGerrit(email, change.id, comments);
        })
      );
    }
  }

  render() {
    const { changes } = this.state;
    return (
      <div>
        <h2>Changes</h2>
        <ul>
          {changes &&
            changes.map(({ project, subject, id }) => (
              <li key={id}>
                {project} - {subject}
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
