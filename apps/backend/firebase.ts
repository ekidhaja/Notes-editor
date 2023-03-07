import admin from "firebase-admin";
import { config } from "dotenv";

config();

const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: "https://editor-project99261.firebaseio.com",
});

export default admin.firestore();
