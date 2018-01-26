# snake

> Snake, a Progressive Web App written in Vue.

## Prerequisites
In order to run Snake, you need to have a firebase account, and your config to hand.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
FIREBASE_API_KEY=YourFirebaseKey FIREBASE_AUTH_DOMAIN=https://your.firebase.domain FIREBASE_DATABASE_URL=https://your.firebase.database.url FIREBASE_PROJECT_ID=12341234 FIREBASE_STORAGE_BUCKET=https://you.get.the.idea FIREBASE_MESSAGING_SENDER_ID=12341234 npm run dev

# build for production with minification
FIREBASE_API_KEY=YourFirebaseKey FIREBASE_AUTH_DOMAIN=https://your.firebase.domain FIREBASE_DATABASE_URL=https://your.firebase.database.url FIREBASE_PROJECT_ID=12341234 FIREBASE_STORAGE_BUCKET=https://you.get.the.idea FIREBASE_MESSAGING_SENDER_ID=12341234 npm run build

# build for production and view the bundle analyzer report
FIREBASE_API_KEY=YourFirebaseKey FIREBASE_AUTH_DOMAIN=https://your.firebase.domain FIREBASE_DATABASE_URL=https://your.firebase.database.url FIREBASE_PROJECT_ID=12341234 FIREBASE_STORAGE_BUCKET=https://you.get.the.idea FIREBASE_MESSAGING_SENDER_ID=12341234 npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
