import { Day } from './TimeUtility'
import { AllergyModel } from './AllergyModel'

export async function update(model, action) {
  // should move all non-data actions here
  // if (action.type === 'set_key') {
  //   return setAPIKey(session, action.value);
  // } else if (action.type === 'notify_firebase_connected') {
  //   return setMessage(model, null);
  // }
  
  switch (action.type) {    
   case 'reset_message':
     return model.state.set('message', null);
    case 'view_previous_day':
      var currentDay = await model.state.get('current_day'); 
      return model.state.set('current_day', { _id : Day.previousDay(currentDay._id) });
    case 'view_next_day':
      var currentDay = await model.state.get('current_day'); 
      return model.state.set('current_day', { _id: Day.nextDay(currentDay._id) });
    case 'view_today':
      return model.state.set('current_day', { _id: Day.today() });
    case 'new':
      await model.state.set('dirty', true);
      var currentDay = await model.state.get('current_day');
      return model.data.add(currentDay, action.etype);
    case 'view':
      return model.state.set('current_'+action.etype, action.id);
    case 'finish':
      model.db.compact();
      return model.state.set('current_'+action.etype, null);
    case 'delete':
      model.db.compact();
      await model.state.set('dirty', true);
      var current = await model.state.get('current_'+action.etype);
      await model.data.remove(current);
      return model.state.set('current_'+action.etype, null);
    case 'update':
      await model.state.set('dirty', true);
      var current = await model.state.get('current_'+action.etype);
      current[action.field] = action.value;
      return model.data.save(current);
    // case 'update_meal_photo':
    //   // TODO
    //   var currentMeal = await model.currentMeal();
    //   return currentMeal.setPhoto(action.value);
      
    
    
    case 'report_error':
      return model.state.set('message', { 
        type: 'error', title: action.title, text: action.text
      });
      
    default:
      return model.state.set('message', { 
        type: 'error', 
        title: 'Unkown Action: '+action.type, 
        text: 'Talk to Rex, sorry!'
      });
  }
}
