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
      .then(this.loginIfReady.bind(this))
      .catch(err => {
        console.log(err);
      })
      .then(this.firstRender.bind(this));
  }
  
  async firstRender() {
    var snapshot = await this.model.snapshot();
    return this.render(snapshot);
  }
  
  async dbChanged(change) {
    try {
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
    } catch (err) {
      console.log(err);
    }
  }
  connectionOffline(info) {
    console.log(info);
  }
  connectionOnline(info) {
    console.log(info);
  }
  dbError(err) {
    console.log(err);
  }
  
  async dispatch(action) {
    try {
      await update(this.model, action);
      if (action.type === 'set_key') {
        try {
          await this.loginIfReady();
        } catch (err) {
          if (err.name === 'remote_initialization_error') {
            console.log("remote failed to initialize.");
          } else { throw err; }
        }
      }
      var snapshot = await this.model.snapshot(action);
      return this.render(snapshot);
    } catch (err) {
      console.log(err);
      alert("Something bad happened. Talk to Rex, sorry!");
    }
  }
  
  async loginIfReady() {
    var password = await this.model.state.get('apikey');
    if (password !== null) {
      try {
        var result = await this.persist.initializeRemote(password);
      } catch (err) {
        var ourErr = new Error("Error initializing remote.");
        ourErr.name = "remote_initialization_error";
        throw ourErr;
      }
      if (!result) {
        this.dispatch({
          type: 'report_error',
          title: 'Wrong password',
          text: ''
        });
        await this.model.state.set('apikey', null);
      } else {
        this.dispatch({ type: 'reset_message' });
      }
    }
  }
  
  async render(snapshot) {
    ReactDOM.render(
      <App model={snapshot}
               d={this.dispatch.bind(this)} />,
      document.getElementById('root'));

  }
}
