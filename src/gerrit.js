const proxy = url => `https://cors-proxy-mhwanfbyyu.now.sh/${url}`;
const gerritURL = "https://gerrit.wikimedia.org/r/changes/";
const changesURL = (email, justNewer = false) =>
  proxy(
    `${gerritURL}?q=owner:${encodeURIComponent(
      email
    )}+OR+reviewer:${encodeURIComponent(email)}${
      justNewer ? "+-age:1month" : ""
    }&o=MESSAGES&o=DETAILED_ACCOUNTS&o=REVIEWER_UPDATES`
  );

async function fetchGerrit(url) {
  const txt = await (await fetch(url)).text();
  const json = JSON.parse(txt.slice(4).trim());
  return json;
}

export function getChanges(email, onlyNewer) {
  return fetchGerrit(changesURL(email, onlyNewer));
}

const commentsURL = id => proxy(`${gerritURL}${id}/comments`);

export function getComments(id) {
  return fetchGerrit(commentsURL(id));
}
