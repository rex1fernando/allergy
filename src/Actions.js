import { incrementCurrentDay, decrementCurrentDay,
         newMeal, setCurrentMeal,
         setCurrentMealField } from './Model'

var possibleActions = [
  // main screen
  { type: 'view_previous_day' },
  { type: 'view_next_day' },
  { type: 'view_meal', id: 0 },
  { type: 'view_note', id: 0 },
  { type: 'new_meal' },
  { type: 'new_note' },

  // meal screen
  { type: 'update_meal_name', value: '' },
  { type: 'update_meal_time', value: new Date()},
  { type: 'update_meal_photo', value: 'photo' },
  { type: 'update_meal_ingredients', value: [] },
  { type: 'update_meal_notes', value: '' },
  { type: 'finish_meal' },
  
  // note screen
  { type: 'update_note_time' },
  { type: 'update_note_itch_level' },
  { type: 'update_note_text' }
]


export function update(model, action) {
  switch (action.type) {    
    case 'view_previous_day':
      return decrementCurrentDay(model);    
    case 'view_next_day':
      return incrementCurrentDay(model);
    case 'new_meal':
      return newMeal(model);
    case 'view_meal':
      return setCurrentMeal(model, action.id);
    case 'finish_meal':
      return setCurrentMeal(model, null);
    case 'update_meal_name':
      return setCurrentMealField(model, 'name', action.value);
    case 'update_meal_time':
      return setCurrentMealField(model, 'time', action.value);
    case 'update_meal_ingredients':
      return setCurrentMealField(model, 'ingredients', action.value);
    case 'update_meal_photo':
      return setCurrentMealField(model, 'photo', action.value);
    case 'update_meal_notes':
      return setCurrentMealField(model, 'notes', action.value);
    case 'default':
      throw Error('Unknown action.');
  }
}
