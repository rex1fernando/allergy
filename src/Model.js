import u from 'updeep'
import { DateTime } from 'luxon'
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find'
PouchDB.plugin(PouchFind);
 
function getRandomInt() {
  var max = Number.MAX_SAFE_INTEGER;
  return Math.floor(Math.random() * Math.floor(max));
}
 
export class Data {
  constructor(db, rels, defaults) {
    // rels: [ { type: 'has_many', parent: 'day', child: 'meal', plural: 'meals', sortBy: ['time.h', 'time.m']}]
    this.db = db;
    this.defaults = defaults;
    this.rels = rels;
    this.relsByChild = {};
    this.relsByPlural = {};
    for (var i = 0; i < rels.length; i++) {
      var rel = rels[i];
      this.relsByChild[rel.child] = rel;
      this.relsByPlural[rel.plural] = rel;

    }
    
    var initializeIndices = async () => {   
      for (var i = 0; i < rels.length; i++) {
        var rel = rels[i];
        if (rel.type === 'has_one') {
          await this.db.createIndex({
            index: 
            {fields: ['type', rel.parent + '_id']}
          });
        }
      }
      for (var i = 0; i < rels.length; i++) {
        var rel = rels[i];
        if (rel.type === 'has_many') {          
          await this.db.createIndex({
            index: 
            {fields: ['type', rel.parent + '_id'].concat(rel.sortBy)}
          });
        }
      }   
    }
    
    this.indicesPromise = initializeIndices.bind(this)();    
  }
  
  default(type) {
    return this.defaults[type]();
  }
  
  async getAndIncCounter(type) {
    try { 
      var currentCounter = await this.db.get('counters/'+type);
      currentCounter.value++;
      await this.db.put(currentCounter);
      return currentCounter.value-1;
    } catch (err) {
      if (err.name === 'not_found') {
        await this.db.put({ _id: 'counters/'+type, value: 0 });
        return 0;
      } else { throw err; }
    }
  }
  
  // session.add(currentDay, 'meal');
  async add(obj, rel) {
    var relDesc = this.relsByChild[rel];
    var counter = await this.getAndIncCounter(relDesc.child);
    var randomPadding = getRandomInt();
    await this.db.put(u({
      _id: relDesc.child+'-'+counter+'-'+randomPadding,
      [relDesc.parent + '_id'] : obj._id
    }, this.default(relDesc.child)));
  }

  // session.get(currentDay, 'meals');
  async getRel(obj, rel) {
    if (this.relsByPlural[rel] !== undefined) {
      var relDesc = this.relsByPlural[rel];
      var selector = { 
        type: relDesc.child,
        [relDesc.parent+'_id']: obj._id
      };
      var result = await this.db.find({
        selector: selector,
        sort: ['type', relDesc.parent+'_id'].concat(relDesc.sortBy)
      });
      return result.docs;
    } else {
      var relDesc = this.relsByChild[rel];
      var result = await this.db.find({
        selector: { 
          type: relDesc.child,
          [relDesc.parent+'_id']: obj._id
        }
      });
      return result.docs[0]!=undefined ? result.docs[0] : null;
    }
  }
  
  // session.save(currentMeal)
  async save(obj) {
    obj.timestamp = new Date();
    return this.db.put(obj);
  }
  // session.remove(currentMeal)
  async remove(obj) {
    return this.db.remove(obj);
  }
}

export class State {
  constructor(db, fields) {
    this.db = db;
    this.fields = fields;
  }
  
  async getOrUndefined(id) {
    try {
      var value = await this.db.get(id);
      return value;
    } catch (err) {
      if (err.name === 'not_found') {
        return undefined;
      } else {
        throw err;
      }
    }
  }
  
  
  async get(field) {
    var stateDoc = await this.getOrUndefined('_local/state/'+field);
    if (stateDoc === undefined) {
      return undefined;
    }
    
    if (this.fields[field] == 'rel') {
      if (stateDoc.value === null) {
        return null;
      } else {
        var ret = await this.db.get(stateDoc.value);
        return ret;
      }
    } else if (this.fields[field] === 'val') {
      return stateDoc.value;
    } else throw Error("Tried to get a state value that wasn't declared");
  }
  async set(field, value) {
    if (this.fields[field] === undefined) {
      throw Error("Tried to set a state value that wasn't declared");
    }
    var stateDoc = await this.getOrUndefined('_local/state/'+field);
    if (stateDoc !== undefined) {
      stateDoc.value = value;
      await this.db.put(stateDoc);
    } else {
      await this.db.put({
        _id: '_local/state/'+field,
        value: value
      });
    }
  }
}

export class Model {
  constructor(db, rels, defaultEntities, stateFields) {
    this.db = db;
    this.data = new Data(db, rels, defaultEntities);
    this.state = new State(db, stateFields);
  }
}
