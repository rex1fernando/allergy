import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { Persist } from './Persist';
import { update } from './Actions';
import { handleError } from './Errors';

import u from 'updeep';

export default class Dispatch {
  constructor() {
    this.persist = new Persist();
    this.persist.retrieveModel().then((model) => {
      this.model = model;
      ReactDOM.render(
        <App model={this.model}
                 d={this.dispatch.bind(this)} />,
        document.getElementById('root'));
      
      if (this.model.apikey !== null && this.model.apikey !== undefined) {
        this.dispatch({ type: 'set_key', value: this.model.apikey });
      }
      
      var phProxy = function(firebaseData) {
        this.persistDispatch(this.persist.handleFirebasePush(this.model.data, firebaseData));
      }.bind(this);
      this.persist.startFirebaseHandler(phProxy);
    }).catch(function(err) {
      return;
    });    
  }
  
  dispatch(action) {
    // update and rerender immediately
    var oldModel = this.model;
    this.model = update(this.model, action);
    var newModel = this.model;
    
    ReactDOM.render(
      <App model={this.model}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));
      
    // notify Persist that we updated
    this.persist.handleUpdate(
      { oldModel: oldModel, newModel: newModel, action: action }
    ).then(function(params) {
      // handle the actions that Persist returned
      return this.persistDispatch(params.actions);
    }.bind(this)).catch(function(err) {
      return this.persistDispatch(handleError(err));
    }.bind(this));
  }
  
  persistDispatch(actions) {
    // apply all actions
    this.model = actions.reduce((model, action) => {
      return update(model, action);
    }, this.model);
    
    ReactDOM.render(
      <App model={this.model}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));
  }
  

}
