import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { fromGerritDate } from "./date";

// Initialize Firebase
const config = {
  apiKey: "AIzaSyBQeH5Munfx5XFRvhvdkpT7kNawEtawuQU",
  authDomain: "gerrit-notifications-dashboard.firebaseapp.com",
  databaseURL: "https://gerrit-notifications-dashboard.firebaseio.com",
  projectId: "gerrit-notifications-dashboard",
  storageBucket: "",
  messagingSenderId: "233379105641"
};
firebase.initializeApp(config);

const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().useDeviceLanguage();
provider.setCustomParameters({
  login_hint: "jdoe@wikimedia.org"
});

export const login = _ => firebase.auth().signInWithPopup(provider);

export const onAuthChange = cb => firebase.auth().onAuthStateChanged(cb);

const db = firebase.firestore();

export async function createUser(email) {
  const usersRef = db.collection("users");
  const userRef = usersRef.doc(email);
  let doc = await userRef.get();
  if (!doc.exists) {
    await userRef.set({ email, lastUpdate: null });
    doc = await userRef.get();
  }
  return doc;
}

export function justUpdated(email) {
  const usersRef = db.collection("users");
  const userRef = usersRef.doc(email);
  return userRef.update({ lastUpdate: new Date().toISOString() });
}

export async function setChange(email, id, payload) {
  const changeRef = db
    .collection("users")
    .doc(email)
    .collection("changes")
    .doc(id);
  let doc = await changeRef.get();
  if (!doc.exists) {
    await changeRef.set({ ...payload, lastMessageSeen: null, read: false });
    doc = await changeRef.get();
  } else {
    const data = doc.data();
    if (fromGerritDate(data.updated) < fromGerritDate(payload.updated)) {
      await changeRef.set({
        ...payload,
        lastMessageSeen: data.lastMessageSeen,
        read: data.read
      });
      doc = await changeRef.get();
    }
  }
  return doc;
}

async function setComments(email, id, comments) {
  if (!comments || !comments.length) return;

  console.log("updating comments", id, comments);
  const commentsRef = db
    .collection("users")
    .doc(email)
    .collection("changes")
    .doc(id)
    .collection("comments");

  const batch = db.batch();

  await Promise.all(
    comments.map(async comment => {
      const commentRef = commentsRef.doc(comment.id);
      let doc = await commentRef.get();
      console.log("checking comment", comment.id);
      if (!doc.exists) {
        console.log("updating comment", comment.id);
        batch.set(commentRef, { ...comment, read: false });
      }
    })
  );

  return batch.commit();
}

export function setCommentsFromGerrit(email, id, gerritComments) {
  const comments = Object.entries(gerritComments).reduce(
    (allComments, [file, comments]) =>
      allComments.concat(comments.map(comment => ({ ...comment, file }))),
    []
  );
  return setComments(email, id, comments);
}
