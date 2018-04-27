import u from 'updeep';

function defaultMeal() { return {
  name: '',
  time: { h: 0, m: 0},
  photo: null,
  notes: null
}}


class Day { 
  constructor(context, id) {
    this.context = context;
    this.id = id;
  }
  model() {
    return this.context.model;
  }
  innerState() {
    return this.model.innerState.days[this.id];
  }
  meals() {
    return this.innerState().mealIDs.map((id) => model.meal(id));
  }
  addMeal() {
    var meal = this.model().addMeal();
    this.model().setDayState('meals', (a) => a.concat(update.meal.id);
    return meal;
  }
  notes() {
    return this.innerState().noteIDs.map((id) => model.note(id));
  }
  date() {
    return this.innerState().date;
  }
}

class Meal {
  
}

class Note {
  
}

class Model {
  constructor(context, innerState) {
    this.innerState = {
      days: { 0: { date: date, mealIDs, noteIDs}}
    }
  }
  
  days() {
    
  }
  day(id) {
    
  }
  meals() {
    
  }
  meal(id) {
    
  }
  addMeal() {
    newInnerState = u.updateIn('meals.'+this.innerState.mealCounter, defaultMeal(), this.innerState);
    this.context.model = new Model(this.context, newInnerState);
  }
  
  setDayState(field, newValue) {
    
  }
  
  state() {
    
  }
}
