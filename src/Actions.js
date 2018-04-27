import { incrementCurrentDay, decrementCurrentDay,
         newMeal, setCurrentMeal,
         setCurrentMealField, deleteCurrentMeal,
         newNote, deleteCurrentNote,
         setCurrentNote, setCurrentNoteField, reportError,
         setAPIKey, setMessage, gotoFirstDay, gotoLastDay, setLastSynced,
         setMealField, updateTimestamp, setMealPhoto, setData, syncState } from './Model'

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
  { type: 'update_note_itch' },
  { type: 'update_note_text' }
]


export function update(model, action) {
  // should move all non-data actions here
  if (action.type === 'set_key') {
    return setAPIKey(model, action.value);
  }
  
  model = updateTimestamp(model);

  
  switch (action.type) {    
    case 'reset_message':
      return setMessage(model, null);
    case 'view_previous_day':
      return decrementCurrentDay(model);    
    case 'view_next_day':
      return incrementCurrentDay(model);
    case 'view_first_day':
      return gotoFirstDay(model);    
    case 'view_last_day':
      return gotoLastDay(model);
    case 'new_meal':
      return newMeal(model);
    case 'view_meal':
      return setCurrentMeal(model, action.id);
    case 'finish_meal':
      return setCurrentMeal(model, null);
    case 'delete_meal':
      return deleteCurrentMeal(model);
    case 'update_meal_name':
      return setCurrentMealField(model, 'name', action.value);
    case 'update_meal_time':
      return setCurrentMealField(model, 'time', action.value);
    case 'update_meal_ingredients':
      return setCurrentMealField(model, 'ingredients', action.value);
    case 'update_meal_photo':
      return setMealPhoto(model, action.id, action.value);
    case 'update_meal_notes':
      return setCurrentMealField(model, 'notes', action.value);
      
    case 'new_note':
      return newNote(model);
    case 'view_note':
      return setCurrentNote(model, action.id);
    case 'finish_note':
      return setCurrentNote(model, null);
    case 'delete_note':
      return deleteCurrentNote(model);
    case 'update_note_time':
      return setCurrentNoteField(model, 'time', action.value);
    case 'update_note_itch':
      return setCurrentNoteField(model, 'itch', action.value);
    case 'update_note_text':
      return setCurrentNoteField(model, 'text', action.value);
    
    case 'report_error':
      return reportError(model, action.title, action.text);
    case 'set_last_synced':
      return setLastSynced(model, action.value);
    case 'notify_firebase_connected':
      return setMessage(model, null);
      
    case 'replace_data':
      return setData(model, action.value);
    case 'synchronize_state':
      return syncState(model);
      
    default:
      return reportError(model, 'Unkown Action: '+action.type, 'Talk to Rex. Sorry!');
  }
}
