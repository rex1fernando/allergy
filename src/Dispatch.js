import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { initializeModel } from './Model'
import { update } from './Actions'

export default class Dispatch {
  constructor() {
    this.model = initializeModel();
    ReactDOM.render(
      <App model={this.model}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));
  }
  
  dispatch(action) {
    this.model = update(this.model, action);
    ReactDOM.render(
      <App model={this.model}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));
  }
}
