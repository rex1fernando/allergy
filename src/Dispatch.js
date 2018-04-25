import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { initializeModel, setCurrentMealField, reportError } from './Model';
import { Persist } from './Persist';
import { update } from './Actions';
import u from 'updeep';

export default class Dispatch {
  

  constructor() {
    this.persist = new Persist();
    console.log(this.persist);
    this.persist.retrieveModel().then((model) => {
      this.model = model;
      ReactDOM.render(
        <App model={this.model}
                 d={this.dispatch.bind(this)} />,
        document.getElementById('root'));
    });    
  }
  
  dispatch(action) {
    var oldModel = this.model;
    this.model = update(this.model, action);
    ReactDOM.render(
      <App model={this.model}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));
    this.persist.modelUpdated(oldModel, this.model, action).then((newModel) => {
      this.model = newModel;
      console.log(this.model);
      ReactDOM.render(
        <App model={this.model}
                 d={this.dispatch.bind(this)} />,
        document.getElementById('root'));
    }).catch((err) => {
      console.log(err);
      this.model = reportError(this.model, 'Error in dispatch.', 'Talk to Rex. Sorry!')
      console.log(this.model);
      ReactDOM.render(
        <App model={this.model}
                 d={this.dispatch.bind(this)} />,
        document.getElementById('root'));
    });    
  }
}
