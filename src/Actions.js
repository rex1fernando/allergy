import {incrementCurrentDay, decrementCurrentDay } from './Model'

var possibleActions = [
  // main screen
  { type: 'view_previous_day' },
  { type: 'view_next_day' },
  { type: 'view_meal', id: 0 },
  { type: 'view_note', id: 0 },
  { type: 'new_meal' },
  { type: 'new_note' },

  // meal screen
  { type: 'update_meal_name' },
  { type: 'update_meal_time' },
  { type: 'update_meal_notes' },
  
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
  }
}
