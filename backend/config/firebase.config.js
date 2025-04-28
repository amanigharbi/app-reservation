const admin = require("firebase-admin");
const serviceAccount = require("../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://console.firebase.google.com/u/0/project/app-reservation-2/firestore/databases/-default-/data",
});

const db = admin.firestore();
module.exports = { admin, db };
