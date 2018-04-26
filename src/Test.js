var config = {
  apiKey: 'AIzaSyAA4F74AVVT_XUPkGCZwluAJSHTmaR0xV8',
  authDomain: "elodie-allergy.firebaseapp.com",
  databaseURL: "https://elodie-allergy.firebaseio.com",
  projectId: "elodie-allergy",
  storageBucket: "gs://elodie-allergy.appspot.com/",
  messagingSenderId: "237809204557"
};
firebase.initializeApp(config);
this.db = firebase.firestore();
this.storage = firebase.storage();

firebase.auth().signInWithEmailAndPassword('email@email.com', key).catch(function(err) {
  console.log(err);
});

var docRef = this.db.collection("store2").doc("store2");
var user = firebase.auth().currentUser;
console.log(user.uid);

return docRef.set(model).then(function() {
  return model;
}).catch(function(err) {
  console.log(err);
  return reportError(model, "Error putting to Firebase", 'Talk to Rex. Sorry!');
});
