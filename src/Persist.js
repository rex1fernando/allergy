import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find'
import PouchDBMemory from 'pouchdb-adapter-memory'
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchDBMemory);


var dbURL = 'https://41d87167-f57e-4704-b6d6-578f25290607-bluemix.cloudant.com/allergy';
var dbUsername = '41d87167-f57e-4704-b6d6-578f25290607-bluemix';
var dbPass = 'ae414466227757862fc77eb195c8aa49d01928d076774548b9caf41337693da1';

export class Persist {
  constructor(changeHandler, pausedHandler, activeHandler, errorHandler) {
    this.localDB = new PouchDB('allergy', {adapter: 'websql'});
    this.remoteDB = new PouchDB(dbURL, {auth: 
    {username: dbUsername,
    password: dbPass}});
    
    this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true
    }).on('change', function (change) {
      changeHandler(change);
    }).on('paused', function (info) {
      pausedHandler(info);
    }).on('active', function (info) {
      activeHandler(info);
    }).on('error', function (err) {
      errorHandler(err);
    });
  }
}
