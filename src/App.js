import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image as SImage, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown, Message, Divider } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import Slider from 'rc-slider';
import ReactTags from 'react-tag-autocomplete'
import { DateTime } from 'luxon'

import { Day, Time } from './TimeUtility'

import Meal from './View/Meal'
import Note from './View/Note'
import MessageHandler from './View/MessageHandler'



import './App.css';
import 'rc-slider/assets/index.css';




const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};


////// List items for meals and notes
  
function MealItem(props) {
  var d = props.d;
  
  return (
    <List.Item onClick={d({ type: 'view', etype: 'meal', id: props.meal._id })}>
      <List.Icon name='food' size='large' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{props.meal.name}</List.Header>
        <List.Description as='a'>
          {props.meal.time.h.toString().padStart(2, '0')}:{props.meal.time.m.toString().padStart(2, '0')}
        </List.Description>
      </List.Content>
    </List.Item>
  );
}

function NoteItem(props) {
  var d = props.d;
  
  return (
    <List.Item onClick={d({ type: 'view', etype: 'note', id: props.note._id })}>
      <List.Icon name='clipboard' size='large' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{props.note.time.h.toString().padStart(2, '0')}:{props.note.time.m.toString().padStart(2, '0')}</List.Header>
        <List.Description as='a'>Itching Level: {props.note.itch}</List.Description>
      </List.Content>
    </List.Item>
  );
}




class APIKeyInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: ''
    }
  }
  
  setKey(e, data) {
    this.setState({ key: data.value });
  }
  
  render() {
    var d = this.props.d;
    
    if (this.props.apikey !== null) {
      return null;
    } else {
      return (
        <Modal open={true} style={inlineStyle.modal}>
          <Modal.Header>Please enter your key</Modal.Header>
          <Modal.Content>
            <MessageHandler message={this.props.message} d={d} />      
            <Input fluid value={this.state.key} onChange={this.setKey.bind(this)} />
          </Modal.Content>
          <Modal.Actions>
            <Button icon='check' content='OK' onClick={d({ type: 'set_key', value: this.state.key })} />
          </Modal.Actions>
        </Modal>
      );
    }
  }
}

function DirtyIndicator(props) {
  if (props.dirty) {
    return (<Icon color='yellow' name='circle' />);
  } else {
    return (<Icon color='green' name='circle' />);
  }
}


////// Main app view

class App extends Component {
  constructor(props) {
    super(props);
  }
    
  render() {
    var d = (action) => {
      return () => this.props.d(action);
    }
    var model = this.props.model;
        
    // Sorted lists of MealItems and NoteItems
    var mealItems = model.currentDay.meals.map((meal) => 
      <MealItem meal={meal}
                key={meal._id}
                d={d} />);
    var noteItems = model.currentDay.notes.map((note) => 
      <NoteItem note={note} 
                key={note._id}
                d={d} />);
                
    return (
      <Container>
        { model.currentMeal !== null &&
          <Meal meal={model.currentMeal} 
                model={model}
                allIngredients={model.allIngredients} 
                message={model.message}
                d={d} /> }
        { model.currentNote !== null &&
          <Note note={model.currentNote} 
                message={model.message}
                d={d} /> }
        
        <MessageHandler message={model.message} d={d} />  
        <APIKeyInput apikey={model.apikey} message={model.message} d={d} />
    
      
    
        <Button icon="angle left" 
          onClick={d({ type: 'view_previous_day' })} />
        <Button
          onClick={d({ type: 'view_today' })}>Today</Button>
        <Button icon="angle right"
          onClick={d({ type: 'view_next_day' })} />
        
        
        <Header as='h1'>
          { 
            DateTime.fromISO(model.currentDay._id).toLocaleString({weekday: 'short', month: 'short', day: '2-digit'}) 
          }
        </Header>
        
        <Header as='h2'>Repas</Header>
        <List relaxed>
          {mealItems}
        </List>
        <Button icon labelPosition='right'
                onClick={d({ type: 'new', etype: 'meal' })}>
          Ajouter un Repas
          <Icon name='plus' />
        </Button>

        <Header as='h2'>{"Notes d'Allergie"}</Header>
        <List relaxed>
          {noteItems}
        </List>
        <Button icon labelPosition='right'
                onClick={d({ type: 'new', etype: 'note' })}>
          Ajouter une Note
          <Icon name='plus' />
        </Button>
        
        <Divider />
        
        <p>
        <DirtyIndicator dirty={model.dirty} />
        {model.lastSynced !== null &&
         <span>Last synced: {DateTime.fromISO(model.lastSynced).setZone('Europe/Paris').toLocaleString({weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}. </span>}Version 10.
        </p> 
      </Container>
    );
  }
}

export default App;
