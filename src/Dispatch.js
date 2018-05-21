import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { Persist } from './Persist';
import { update } from './Actions';
import { AllergyModel } from './AllergyModel'


export default class Dispatch {
  constructor() {
    this.persist = new Persist(
      this.dbChanged.bind(this), 
      this.connectionOffline.bind(this),
      this.connectionOnline.bind(this),
      this.dbError.bind(this)
    );

    this.model = new AllergyModel(this.persist.localDB);
    
    this.model.data.indicesPromise
      .then(this.model.initializeStateIfUndefined.bind(this.model))
      .then(this.firstRender.bind(this))
      .catch(err => {
        console.log(err);
      });
  }
  
  async firstRender() {
    var snapshot = await this.model.snapshot();
    return this.render(snapshot);
  }
  
  async dbChanged(change) {
    await this.model.state.set('last_synced', new Date());
    if (change.direction === 'pull') {
      await this.model.state.set('current_meal', null);
      await this.model.state.set('current_note', null);

      var snapshot = await this.model.snapshot();
      return this.render(snapshot);
    } else if (change.direction === 'push') {
      await this.model.state.set('dirty', false);
      var snapshot = await this.model.snapshot();
      return this.render(snapshot);
    }
  }
  connectionOffline(info) {
  }
  connectionOnline(info) {
  }
  dbError(err) {
    console.log("db error:" + err);
  }
  
  async dispatch(action) {
    try {
      await update(this.model, action);
      var snapshot = await this.model.snapshot(action);
      return this.render(snapshot);
    } catch (err) {
      console.log(err);
    }
  }
  
  async render(snapshot) {
    ReactDOM.render(
      <App model={snapshot}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));

  }
}
