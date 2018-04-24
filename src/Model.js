import isSameDay from 'date-fns/is_same_day'
import u from 'updeep'

var flatten = function(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function time(h, m) {
  var date = new Date();
  date.setHours(h);
  date.setMinutes(m);
  return date;
}

function defaultDay() {
  return { 
    date: new Date(),
    meals: [
      {
        id: 0,
        name: 'Breakfast',
        time: time(7, 15),
        ingredients: [],
        photo: null,
        notes: ''
      },
      {
        id: 1,
        name: 'Lunch',
        time: time(12, 15),
        ingredients: [],
        photo: null,
        notes: ''
      }
    ],
    notes: []
  }
}

export function initializeModel() {
  return {
    data: {
      days: [
        { 
          date: new Date(2018,3,21,0,0,0),
          meals: [
            {
              id: 0,
              name: 'Breakfast',
              time: time(7, 15),
              ingredients: ['oats'],
              photo: null,
              notes: ''
            },
          ],
          notes: [
            {
              id: 0,
              time: time(1, 15),
              notes: ''
            }
          ]
        },
        { 
          date: new Date(2018,3,22,0,0,0),
          meals: [
            {
              id: 0,
              name: 'Breakfast',
              time: time(7, 16),
              ingredients: ['oats'],
              photo: null,
              notes: ''
            },
          ],
          notes: [
            {
              id: 0,
              time: time(1, 15),
              itch: 5,
              text: ''
            }
          ]
        }
      ]
    },
    state: {
      currentDay: 0,
      currentMeal: null,
      currentNote: null
    }
  }
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
    return u.updateIn('data.days.'+currentDayIndex, updatedDay, model);
  } else {
    var addDay = (days) => [].concat(days, [updatedDay]);
    return u.updateIn('data.days', addDay, model);
  }
}

export function sortedMeals(model) {
  return currentDay(model).meals.slice().sort(
    (m1, m2) => {
      if (m1 < m2) return -1;
      else if (m1 > m2) return 1;
      else return 0;
    }
  );
}

export function newMeal(model) {
  var meal = {
    id: currentDay(model).meals.length,
    name: 'New Meal',
    time: new Date(),
    ingredients: [],
    picture: null,
    notes: ''
  };
  
  var addMeal = (meals) => [].concat(meals, [meal]);
  var dayWithNewMeal = u.updateIn('meals', addMeal, currentDay(model));
  return updateCurrentDay(model, dayWithNewMeal);
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

function updateCurrentMeal(model, updatedMeal) {
  var dayWithUpdatedMeal = u.updateIn('meals.'+model.state.currentMeal, updatedMeal, currentDay(model));
  return updateCurrentDay(model, dayWithUpdatedMeal);
}

export function setCurrentMealField(model, field, value) {
  return updateCurrentMeal(model, u.updateIn(field, value, currentMeal(model)));
}

export function allIngredients(model) {
  var a = model.data.days.map(
    (day) => day.meals.map(
      (meal) => meal.ingredients
    )
  );
  return Array.from(new Set(flatten(a)));
  
}
