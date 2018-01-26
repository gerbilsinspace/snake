import firebase from 'firebase'

const apiKey = process.env.FIREBASE_API_KEY || ''
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || ''
const databaseURL = process.env.FIREBASE_DATABASE_URL || ''
const projectId = process.env.FIREBASE_PROJECT_ID || ''
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || ''
const messagingSenderId = process.env.MESSAGING_SENDER_ID || ''
const firebaseApp = firebase.initializeApp({
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId
})

export const db = firebaseApp.database()
