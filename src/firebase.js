import firebase from "firebase/app";
import "firebase/auth";

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
