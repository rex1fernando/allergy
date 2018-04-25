import isSameDay from 'date-fns/is_same_day'
import u from 'updeep'
import localforage from "localforage";
import { jsonDateParser } from "json-date-parser"


var flatten = function(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export function time(h, m) {
  if (arguments.length === 1) { 
    return {h: h.getHours(), m: h.getMinutes()};
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
  return t1.h < t2.h ? true : t1.m < t2.m;
}
function timeGT(t1, t2) {
  return t1.h > t2.h ? true : t1.m > t2.m;
}
function timeEQ(t1, t2) {
  return t1.h === t2.h && t1.m === t2.m;
}





function defaultDay() {
  return { 
    date: new Date(),
    meals: [],
    mealsCounter: 0,
    notes: [],
    notesCounter: 0
  }
}

export function defaultModel() {
  return {
    data: {
      days: [
        { 
          date: new Date(2018,3,21,0,0,0),
          meals: {
            0: {
              id: 0,
              name: 'Breakfast',
              time: time(7, 15),
              ingredients: ['oats'],
              photo: null,
              notes: ''
            },
          },
          notes: {
            0: {
              id: 0,
              time: time(1, 15),
              itch: 0,
              text: ''
            }
          },
        },
        { 
          date: new Date(2018,3,22,0,0,0),
          meals: {
            0: {
              id: 1,
              name: 'Breakfast',
              time: time(7, 16),
              ingredients: ['oats'],
              photo: null,
              notes: ''
            },
          },
          notes: {
            0: {
              id: 1,
              time: time(1, 15),
              itch: 5,
              text: ''
            }
          },
        }
      ],
      mealsCounter: 2,
      notesCounter: 2
    },
    state: {
      currentDay: 0,
      currentMeal: null,
      currentNote: null,
      message: null
    },
    apikey: null
  }  
}

export function setAPIKey(model, key) {
  return u({ apikey: key }, model);
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
  if (model.state.currentDay === days.length) {
    var today = new Date();
    return isSameDay(days[days.length - 1].date, today);
  } else {
    return true;
  }
}

export function todayModified(model) {
  var days = model.data.days;
  var today = new Date();
  return isSameDay(days[days.length - 1].date, today);
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
    name: 'New Meal',
    time: time(new Date()),
    ingredients: [],
    picture: null,
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
    time: time(new Date()),
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
