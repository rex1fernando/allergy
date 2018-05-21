import { Day, Time } from './TimeUtility'
import { Data, State, Model } from './Model'
import { DateTime } from 'luxon'
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find'
PouchDB.plugin(PouchFind);

var rels = [
  { 
    type: 'has_many', 
    parent: 'day', 
    child: 'meal', 
    plural: 'meals',
    sortBy: ['time']
  },
  { 
    type: 'has_many', 
    parent: 'day', 
    child: 'note',
    plural: 'notes',
    sortBy: ['time']
  }
]
var defaultEntities = {
  meal: () => { return {
    name: "Nouveau Repas",
    time: Time.now(),
    ingredients: [],
    notes: "",
    type: "meal"
  }},
  note: () => { return {
    time: Time.now(),
    itch: 0,
    text: "",
    type: "note"
  }}
}
var stateFields = {
  "message": "val",
  "current_day": "val",
  "current_meal": "rel",
  "current_note": "rel",
  "last_synced": "val",
  "dirty": "val",
  "apikey": "val"
}

var flatten = function(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export class AllergyModel extends Model {
  constructor(db) {
    super(db, rels, defaultEntities, stateFields);
    this.db.createIndex({
      index: 
        {fields: ['type']}
    });   
  }
  
  async initializeStateIfUndefined() {
    var currentDay = await this.state.get('current_day');
    var currentMeal = await this.state.get('current_meal');
    var currentNote = await this.state.get('current_note');
    var message = await this.state.get('message');
    var lastSynced = await this.state.get('last_synced');
    var dirty = await this.state.get('dirty');
    var apikey = await this.state.get('apikey');
    
    if (currentDay === undefined || currentDay === null) {
      await this.state.set('current_day', { _id: Day.today() });
    }
    if (currentMeal === undefined) {
      await this.state.set('current_meal', null);
    }
    if (currentNote === undefined) {
      await this.state.set('current_note', null);
    }
    if (message === undefined) {
      await this.state.set('message', null);
    }
    if (lastSynced === undefined) {
      await this.state.set('last_synced', null);
    }
    if (dirty === undefined) {
      await this.state.set('dirty', false);
    }
    if (apikey === undefined) {
      await this.state.set('apikey', null);
    }
  }
  
  async allIngredients() {
    var result = await this.db.find({
      selector: { 
        type: 'meal'
      }
    });
    var meals = result.docs;
    var a = meals.map(m => m.ingredients);
    return Array.from(new Set(flatten(a)));
  }
  
  async snapshot(action) {  
    if (this.snapshotC === undefined) { this.snapshotC = {}; }
    
    this.snapshotC.currentDay = await this.state.get('current_day');
    this.snapshotC.currentMeal = await this.state.get('current_meal');
    this.snapshotC.currentNote = await this.state.get('current_note');
    this.snapshotC.message = await this.state.get('message');
    this.snapshotC.lastSynced = await this.state.get('last_synced');
    this.snapshotC.dirty = await this.state.get('dirty');
    this.snapshotC.apikey = await this.state.get('apikey');
    
    if ((action !== undefined && action.type !== 'update')
    || this.snapshotC.meals === undefined
    || this.snapshotC.notes === undefined
    || action === undefined) {
      this.snapshotC.meals = await this.data.getRel(this.snapshotC.currentDay, 'meals');
      this.snapshotC.notes = await this.data.getRel(this.snapshotC.currentDay, 'notes');

    }
    if ((action !== undefined && (action.type === 'update' && action.field === 'ingredients'))
    || this.snapshotC.allIngredients === undefined
    || action === undefined) {
      this.snapshotC.allIngredients = await this.allIngredients();
    }  
    
    //var photo = this.data.getRel(currentMeal, 'photo');
    
    this.snapshotC.currentDay.meals = this.snapshotC.meals;
    this.snapshotC.currentDay.notes = this.snapshotC.notes;
    
    return {
      currentDay: this.snapshotC.currentDay,
      // currentMeal: u({
      //   photo: photo
      // }, currentMeal),
      currentMeal: this.snapshotC.currentMeal,
      currentNote: this.snapshotC.currentNote,
      message: this.snapshotC.message,
      allIngredients: this.snapshotC.allIngredients,
      lastSynced: this.snapshotC.lastSynced,
      dirty: this.snapshotC.dirty,
      apikey: this.snapshotC.apikey
    };
  }
}
