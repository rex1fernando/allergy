import localForage from "localforage";
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/storage';

import { LocalPersistError, FirebasePutError, 
  FirebaseInitializationError, PhotoCacheError } from './Errors'
import { defaultModel, currentMeal } from './Model';



export class Persist {
  constructor() {
    this.persistLocally = this.createPersistAction(this.persistLocallyR);
    this.writeToFirebase = this.createPersistAction(this.writeToFirebaseR);
    this.cacheInPhoto = this.createPersistAction(this.cacheInPhotoR);
    this.cacheOutPhoto = this.createPersistAction(this.cacheOutPhotoR);
    this.initializeFirebase = this.createPersistAction(this.initializeFirebaseR)

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
  }
  
  createPersistAction(f) {
    var fb = f.bind(this);
    return function(params) {
      return fb(params.update).then(function(newActions) {
        return { update: params.update, actions: params.actions.concat(newActions) };
      });
    }
  }
  
  savePhotoToFirebase(mealID, photo) {
    if (!window.navigator.onLine) {
      return Promise.resolve();
    }
    var ref = this.storage.ref().child('images/'+mealID);
    return ref.putString(photo);
  }
  loadPhotoFromFirebase(mealID, photo) {
    throw Error("loading photos from firebase not supported");
  }
  
  initializeFirebaseR(update) {
    if (!window.navigator.onLine) {
      return Promise.resolve([]);
    }
    
    var key = update.action.value;
    return firebase.auth().signInWithEmailAndPassword('email@email.com', key).then(function() {
      
      ////// temporary
      // this.db.collection("store").doc("26").get().then(function(val) {
      //   var docRef = this.db.collection("store").doc("store3");      
      //   docRef.set(val.data()).catch(function(err) {
      //     throw new Error("fuck");
      //   });
      // }.bind(this));
      ////// temporary
      
      return [{ type: 'notify_firebase_connected' }];

    
    }.bind(this)).catch(function(err) {
      if (err.code === 'auth/wrong-password') {
        return [{ type: 'report_error', title: 'Please try again', text: 'Your key was incorrect.' },
                { type: 'set_key', value: null }];
      } else { 
        throw new FirebaseInitializationError(err);
      }
    });
  }
  
  retrieveModel() {
    return localForage.getItem('store').then(function(value) {
      if (value===null || value===undefined) {
        return defaultModel();
      } else {
        return value;
      }    
    }.bind(this)).catch(function(err) {
      alert("Something serious went wrong. Talk to Rex.");
      throw new Error();
    });
  }
  
  
  ////// logic
  
  startFirebaseHandler(pushHandlerProxy) {
    this.db.collection("store").doc("store3")
    .onSnapshot(function(doc) {
      console.log(doc.data());
      pushHandlerProxy(doc.data());
    });
  }
  
  handleFirebasePush(currentData, firebaseData) {
    this.firebaseTimestamp = firebaseData.timestamp;
    
    if (currentData.timestamp < firebaseData.timestamp) {
      return [{ type: 'replace_data', value: firebaseData },
              { type: 'set_last_synced', value: new Date() },
              { type: 'synchronize_state' }];
    } else {
      return [];
    }
  }

  handleUpdate(update) {
    // update = { oldModel:, newModel:, action: }
    var action = update.action;
    
    var params = {update: update, actions: [] }
    
    if (action.type === 'set_key') {
      return this.persistLocally(params).then(this.initializeFirebase);
    }
    // default case: persist locally
    else if (action.type !== 'new_meal'    && action.type !== 'new_note' && 
        action.type !== 'delete_meal' && action.type !== 'delete_note' && 
        action.type !== 'finish_meal' && action.type !== 'finish_note' &&
        action.type !== 'view_meal') {
      return this.persistLocally(params);
    }
    
    // "important" cases (new meal/note, delete meal/note, view meal, finish meal/note):
    //      - persist locally, then write to firebase
    //      - for view/finish meal, cache photo
    else if (action.type !== 'view_meal' && action.type !== 'finish_meal') {
      return this.persistLocally(params).then(this.writeToFirebase);
    } else if (action.type === 'view_meal') {
      return this.cacheInPhoto(params).then(this.persistLocally);
    } else if (action.type === 'finish_meal') {
      return this.cacheOutPhoto(params).then(this.persistLocally).then(this.writeToFirebase);
    }
  }
  
  persistLocallyR(update) {
    return localForage.setItem('store', update.newModel).then(function() {
      return [];
    }).catch(function(err) {
      throw new LocalPersistError(err);
    });
  }
  
  writeToFirebaseR(update) {
    if (!window.navigator.onLine) {
      return Promise.resolve([]);
    }
    // get latest firebase version date (store when receiving push)
    // if our update is a later version, push data section to firebase
    // else, do nothing
    //   - Handle photo cache in/out
    if (update.newModel.data.timestamp <= this.firebaseTimestamp) {
      return Promise.resolve([]);
    } else {
      var docRef = this.db.collection("store").doc("store3");      
      return docRef.set(update.newModel.data).then(function() {
        
        // backup
        var day = new Date().getDate();
        this.db.collection("backups").doc(day.toString()).set(update.newModel.data);      
        
        return [{ type: 'set_last_synced', value: update.newModel.data.timestamp }];        
      }.bind(this)).catch(function(err) {
        throw new FirebasePutError(err);
      });
    }
  }
  
  cacheInPhotoR(update) {
      return Promise.resolve([]);
  }
  
  cacheOutPhotoR(update) {
    var photos = update.oldModel.photos;
    var meal = currentMeal(update.oldModel);
    if (photos === undefined) {
      return Promise.resolve([]);
    } else if (photos[meal.id] === null || photos[meal.id] === undefined) {
      return Promise.resolve([]);
    } else {
      return this.savePhotoToFirebase(meal.id, meal.photo).then(function () {
        return [];
      }).catch(function(err) {
        throw new PhotoCacheError(err);
      });
    }
  }
}
