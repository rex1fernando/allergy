import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find'
import PouchDBMemory from 'pouchdb-adapter-memory'
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchDBMemory);
PouchDB.debug.disable();


var dbURL = 'https://41d87167-f57e-4704-b6d6-578f25290607-bluemix.cloudant.com/allergy';
var dbUsername = '41d87167-f57e-4704-b6d6-578f25290607-bluemix';

export class Persist {
  constructor(changeHandler, pausedHandler, activeHandler, errorHandler) {
    this.localDB = new PouchDB('allergy', {adapter: 'websql'});
    this.changeHandler = changeHandler;
    this.pausedHandler = pausedHandler;
    this.activeHandler = activeHandler;
    this.errorHandler = errorHandler;
  }
  
  async initializeRemote(password) {
    this.remoteDB = new PouchDB(dbURL, {auth: 
    {username: dbUsername,
    password: password}});
    
    try {
      await this.remoteDB.put({ _id: "test_auth" });
    } catch (err) {
      if (err.name === 'unauthorized') {
        return false;
      } else if (err.name !== 'conflict'){
        throw err;
      }
    }
    
    this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true
    }).on('change', (change) => {
      this.changeHandler(change);
    }).on('paused', (info) => {
      this.pausedHandler(info);
    }).on('active', (info) => {
      this.activeHandler(info);
    }).on('error', (err) => {
      this.errorHandler(err);
    });
    return true;
  }
}
