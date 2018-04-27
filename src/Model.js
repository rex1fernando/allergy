import isSameDay from 'date-fns/is_same_day'
import u from 'updeep'
import { DateTime } from 'luxon'


var flatten = function(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export function time(h, m) {
  if (arguments.length === 1) { 
    return {h: h.hour, m: h.minute};
  } else {
    return {h: h, m: m};
  }
}

export function dateFromTime(t) {
  var d = new Date();
  d.setHours(t.h);
  d.setMinutes(t.m);
  return d;
}

function timeLT(t1, t2) {
  if (t1.h < t2.h) {return true; }
  else if (t1.h === t2.h && t1.m < t2.m) {
    return true;
  } else {
    return false;
  }
}
function timeGT(t1, t2) {
  if (t1.h > t2.h) {return true; }
  else if (t1.h === t2.h && t1.m > t2.m) {
    return true;
  } else {
    return false;
  }
}
function timeEQ(t1, t2) {
  return t1.h === t2.h && t1.m === t2.m;
}





function defaultDay() {
  return { 
    date: new Date(),
    meals: {},
    notes: {},
  }
}

export function defaultModel() {
  return {
    data: {
      days: [{
        date: new Date(2018, 3, 25, 0, 0, 0),
        meals: {},
        notes: {},
      }],
      mealsCounter: 0,
      notesCounter: 0,
      timestamp: new Date(2000, 0, 0, 0, 0, 0)
    },
    state: {
      currentDay: 0,
      currentMeal: null,
      currentNote: null,
      message: null
    },
    photos: {},
    apikey: null
  }  
}

export function updateTimestamp(model) {
  return u.updateIn('data.timestamp', new Date(), model);
}

export function setAPIKey(model, key) {
  return u({ apikey: key }, model);
}

export function setLastSynced(model, date) {
  return u.updateIn('state.lastSynced', date, model);
}

export function setData(model, data) {
  return u({ data: data}, model);
}

export function syncState(model, data) {
  return u(
    { state:
      { 
        currentMeal: null,
        currentNote: null
      }
    }, model
  );
}

export function currentDay(model) {
  var days = model.data.days;
  if (model.state.currentDay === days.length) {
    return defaultDay();
  } else {
    return days[model.state.currentDay];
  }
}

function increment(i) { return i + 1; }
function decrement(i) { return i - 1; }

export function currentDayModified(model) {
  var days = model.data.days;

  if (days.length === 0) {
    return false;
  } else if (model.state.currentDay === days.length) {
    var today = new Date();
    return isSameDay(days[days.length - 1].date, today);
  } else {
    return true;
  }
}

export function todayModified(model) {
  var days = model.data.days;
  
  if (days.length === 0) {
    return false;
  } else {
    return DateTime
      .fromJSDate(days[days.length - 1].date)
      .setZone('Europe/Paris')
      .hasSame(
        DateTime.local().setZone('Europe/Paris'),
        'day'
      );
  }
}

export function decrementCurrentDay(model) {
  if (model.state.currentDay === 0) {
    return model;
  } else {
    return u({ state: {currentDay: decrement} }, model);
  }
}

export function incrementCurrentDay(model) {
  if (model.state.currentDay 
        >= model.data.days.length) {
    return model;
  } else if (model.state.currentDay 
             === model.data.days.length-1
             && todayModified(model)){
    return model;
  } else {
    return u({ state: {currentDay: increment} }, model);
  }
}

export function gotoFirstDay(model) {
    return u({ state: {currentDay: 0} }, model);
}

export function gotoLastDay(model) {
  if (todayModified(model)) {
    return u({ state: {currentDay: model.data.days.length-1} }, model);
  } else {
    return u({ state: {currentDay: model.data.days.length} }, model);
  }
}

function updateCurrentDay(model, updatedDay) {
  var currentDayIndex = model.state.currentDay;
  if (currentDayModified(model)) {
    var step =  u.updateIn('data.days.'+currentDayIndex, null, model);
    return u.updateIn('data.days.'+currentDayIndex, updatedDay, step);
  } else {
    var addDay = (days) => [].concat(days, [updatedDay]);
    return u.updateIn('data.days', addDay, model);
  }
}

export function reportError(model, title, text) {
  return u.updateIn('state.message', { type: 'error', title: title, text: text}, model);
}

export function setMessage(model, m) {
  return u.updateIn('state.message', m, model);
}


//////// Meals

export function currentDayMeals(model) {
  return Object.values(currentDay(model).meals);
}

export function sortedMeals(model) {
  return currentDayMeals(model).slice().sort(
    (m1, m2) => {
      if (timeLT(m1.time, m2.time)) return -1;
      else if (timeGT(m1.time, m2.time)) return 1;
      else return 0;
    }
  );
}

export function newMeal(model) {
  var meal = {
    id: model.data.mealsCounter,
    name: intelligentName(model),
    time: time(DateTime.local().setZone('Europe/Paris')),
    ingredients: [],
    photo: null,
    notes: ''
  };
  
  var dayWithNewMeal = u.updateIn('meals.'+model.data.mealsCounter, meal, currentDay(model));
  var newModel = updateCurrentDay(model, dayWithNewMeal);
  return u.updateIn('data.mealsCounter', increment, newModel);
}

export function currentMeal(model) {
  if (model.state.currentMeal !== null) {
    return currentDay(model).meals[model.state.currentMeal];
  } else {
    return null;
  }
}

export function setCurrentMeal(model, index) {
  return u({ state: {currentMeal: index } }, model);
}

export function deleteCurrentMeal(model) {
  var dayWithoutMeal = u({ meals: u.omit(model.state.currentMeal.toString()) }, currentDay(model));
  var newModel = updateCurrentDay(model, dayWithoutMeal);
  return setCurrentMeal(newModel, null);
}

function updateCurrentMeal(model, updatedMeal) {
  var dayWithUpdatedMeal = u.updateIn('meals.'+model.state.currentMeal, updatedMeal, currentDay(model));
  return updateCurrentDay(model, dayWithUpdatedMeal);
}

export function setCurrentMealField(model, field, value) {
  return updateCurrentMeal(model, u.updateIn(field, value, currentMeal(model)));
}

export function setMealField(model, day_id, id, field, value) {
  var newModel = u.updateIn('data.days.'+day_id+'.meals.'+id+'.'+field, value, model);
  return newModel;
}

export function setMealPhoto(model, mealID, value) {
  var newModel = u({ photos: { [mealID]: value }}, model);
  return newModel;
}

export function photo(model, mealID) {
  if (model.photos === undefined) {
    return null;
  } else if (model.photos[mealID] === undefined) {
    return null;
  } else {
    return model.photos[mealID];
  }
}

export function allIngredients(model) {
  var a = model.data.days.map(
    (day) => Object.values(day.meals).map(
      (meal) => meal.ingredients
    )
  );
  return Array.from(new Set(flatten(a)));
  
}


//////// Notes

export function currentDayNotes(model) {
  return Object.values(currentDay(model).notes);
}

export function sortedNotes(model) {
  return currentDayNotes(model).slice().sort(
    (m1, m2) => {
      if (timeLT(m1.time,m2.time)) return -1;
      else if (timeGT(m1.time,m2.time)) return 1;
      else return 0;
    }
  );
}

export function newNote(model) {
  var note = {
    id: model.data.notesCounter,
    time: time(DateTime.local().setZone('Europe/Paris')),
    itch: 0,
    text: ''
  };
  
  var dayWithNewNote = u.updateIn('notes.'+model.data.notesCounter, note, currentDay(model));
  var newModel = updateCurrentDay(model, dayWithNewNote);
  return u.updateIn('data.notesCounter', increment, newModel);
}

export function currentNote(model) {
  if (model.state.currentNote !== null) {
    return currentDay(model).notes[model.state.currentNote];
  } else {
    return null;
  }
}

export function setCurrentNote(model, index) {
  return u({ state: {currentNote: index } }, model);
}

export function deleteCurrentNote(model) {
  var dayWithoutNote = u({ notes: u.omit(model.state.currentNote.toString()) }, currentDay(model));
  var newModel = updateCurrentDay(model, dayWithoutNote);
  return setCurrentNote(newModel, null);
}

function updateCurrentNote(model, updatedNote) {
  var dayWithUpdatedNote = u.updateIn('notes.'+model.state.currentNote, updatedNote, currentDay(model));
  return updateCurrentDay(model, dayWithUpdatedNote);
}

export function setCurrentNoteField(model, field, value) {
  return updateCurrentNote(model, u.updateIn(field, value, currentNote(model)));
}

function intelligentName(model) {
  var mealTitles = currentDayMeals(model).map((meal) => meal.name);
  var hour = new Date().getHours();
  if (hour <= 4 && !mealTitles.includes('Snack de Minuit')) {
    return 'Snack de Minuit';
  } else if (hour > 4 && hour <= 10 && !mealTitles.includes('Petit-Déjeuner')) {
    return 'Petit-Déjeuner';
  } else if (hour > 10 && hour <= 13 && !mealTitles.includes('Déjeuner')) {
    return 'Déjeuner';
  } else if (hour > 13 && hour <= 17 && !mealTitles.includes("Goûter de l'Après-Midi")) {
    return "Goûter de l'Après-Midi";
  } else if (hour > 17 && !mealTitles.includes('Dîner')) {
    return 'Dîner';
  } else {
    return 'Nouveau Repas';
  }
}
