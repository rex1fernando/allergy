import isSameDay from 'date-fns/is_same_day'
import u from 'updeep'

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
        name: 'Breakfast',
        time: time(7, 15),
        ingredients: ['oats'],
        picture: null,
        notes: ''
      },
      {
        name: 'Lunch',
        time: time(12, 15),
        ingredients: ['banh mi'],
        picture: null,
        notes: ''
      }
    ],
    notes: [
      {
        time: time(1, 15),
        notes: ''
      }
    ]
  }
}

export function initializeModel() {
  return {
    data: {
      days: [
        { 
          date: new Date(),
          meals: [
            {
              name: 'Breakfast',
              time: time(7, 15),
              ingredients: ['oats'],
              picture: null,
              notes: ''
            },
            {
              name: 'Lunch',
              time: time(12, 15),
              ingredients: ['banh mi'],
              picture: null,
              notes: ''
            }
          ],
          notes: [
            {
              time: time(1, 15),
              notes: ''
            }
          ]
        }
      ],
      ingredients: ['banana', 'oats', 'eggs', 'banh mi']
    },
    state: {
      currentDay: 0,
      currentMeal: null,
      currentNote: null
    }
  }
}

export function currentDay(model) {
  var days = model.state.days;
  if (model.state.currentDay === days.length) {
    return defaultDay();
  } else {
    return days[model.state.currentDay];
  }
}

function increment(i) { return i + 1; }
function decrement(i) { return i - 1; }

export function currentDayModified(model) {
  var days = model.state.days;
  var today = new Date();
  return isSameDay(days[days.length - 1].date, today);
}

export function incrementCurrentDay(model) {
  if (model.state.currentDay === 0) {
    return model;
  } else {
    return u({ state: {currentDay: decrement} }, model);
  }
}

export function decrementCurrentDay(model) {
  if (model.state.currentDay 
        > model.data.days.length) {
    return model;
  } else if (model.state.currentDay 
             === model.data.days.length
             && currentDayModified(model)){
    return model;
  } else {
    return u({ state: {currentDay: increment} }, model);
  }
}
