import localForage from "localforage";
import u from 'updeep';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/storage';

import { currentMeal, defaultModel, reportError,
         setCurrentMealField, currentDay, setCurrentMeal } from './Model';

 //**dataURL to blob**
 function dataURLtoBlob(dataurl) {
     var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
     while(n--){
         u8arr[n] = bstr.charCodeAt(n);
     }
     return new Blob([u8arr], {type:mime});
 }

 //**blob to dataURL**
 function blobToDataURL(blob, callback) {
     var a = new FileReader();
     a.onload = function(e) {callback(e.target.result);}
     a.readAsDataURL(blob);
 }

export class Persist {
  
  startFirebase(key) {
    // Initialize Firebase
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
    
    firebase.auth().signInWithEmailAndPassword('email@email.com', key).then(function() {
      this.db.collection("store").doc("store")
      .onSnapshot(function(doc) {
        var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        if (!doc.metadata.hasPendingWrites) {
          // not a local change
          
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  }
  
  firebaseTryGet(model) {
    var docRef = this.db.collection("store").doc("store");
    
    return docRef.get().then(function(doc) {
      if (doc.exists) {
        return doc.data();
      } else {
        return model;
      }
    }).catch(function(err) {
      console.log(err);
      return reportError(model, "Error getting from Firebase", 'Talk to Rex. Sorry!');
    });
  }
  
  firebaseTryPut(model) {
    var docRef = this.db.collection("store2").doc("store2");
    var user = firebase.auth().currentUser;
    console.log(user.uid);
    
    return docRef.set(model).then(function() {
      return model;
    }).catch(function(err) {
      console.log(err);
      return reportError(model, "Error putting to Firebase", 'Talk to Rex. Sorry!');
    });
  }
  
  retrieveModel() {
    return localForage.getItem('store').then(function(value) {
      if (value === null || value === undefined) {
        return defaultModel();
      } else {
        if (value.apikey !== null && value.apikey !== undefined) {
          this.startFirebase(value.apikey);
        }
        return value;
      }
    }.bind(this)).catch(function(err) {
      console.log(err);
      return reportError(defaultModel(), 'retrieveModel failed', 'Talk to Rex. Sorry!');
    });
  }
  
  modelUpdated(oldModel, model, action) {    
    if (action.type === 'set_key') {
      this.startFirebase(action.value);
      return this.tryPersist(model);
    } else if (action.type === 'view_meal') {
      return this.linkToPhoto(model, action.id).then(this.tryPersist.bind(this));
    } else if (action.type === 'finish_meal') {
      return this.photoToLink(model, currentMeal(oldModel).id).then(this.tryPersist.bind(this), true);
    } else if (   action.type === 'update_meal_name' || action.type === 'update_meal_notes' ||
                  action.type === 'update_note_text'){
      this.tryPersist(model);
      return Promise.resolve(model);
    } else if (action.type === 'new_meal' || action.type === 'new_note' ||
                  action.type === 'delete_meal' || action.type == 'delete_note') {
      return this.tryPersist(model, true);            
    } else {
    
      return this.tryPersist(model);
    }
  }
  
  tryPersist(model, toFirebase) {
    if (toFirebase) this.firebaseTryPut(model);
    return localForage.setItem('store', model).catch(function(err) {
      console.log(err);
      return reportError(model, 'tryPersist failed', 'Talk to Rex. Sorry!');
    })
  }
  
  linkToPhoto(model, mealID) {
    if (currentMeal(model).photo !== 'link') 
      return Promise.resolve(model);
    return localForage.getItem(mealID).then(function(value) {
      return setCurrentMealField(model, 'photo', value)
    }).catch(function(err) {
      console.log(err);
      return reportError(model, 'linkToPhoto failed', 'Talk to Rex. Sorry!');
    });
  }
  
  photoToLink(model, mealID) {
    var meal = currentDay(model).meals[mealID];
    model = setCurrentMeal(model, mealID);
    if (meal.photo === null) {
      return Promise.resolve(setCurrentMeal(model, null));
    }
    return localForage.setItem(mealID, meal.photo).then(function (value) {
      this.photoToFirebase(mealID, meal.photo);
      model = setCurrentMealField(model, 'photo', 'link');
      return setCurrentMeal(model, null);
    }.bind(this)).catch(function(err) {
      console.log(err);
      return reportError(model, 'photoToLink failed', 'Talk to Rex. Sorry!');
    });
  }
  
  photoToFirebase(mealID, photo) {
    var ref = this.storage.ref().child('images/'+mealID);
    ref.putString(photo).catch(function(err) {
      console.log(err);
    });
  }
}
