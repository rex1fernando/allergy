import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image as SImage, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown, Message, Divider } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import Slider from 'rc-slider';
import ReactTags from 'react-tag-autocomplete'
import { currentDay, sortedMeals,
         currentMeal, allIngredients,
         currentNote, sortedNotes,
         dateFromTime, time, photo } from './Model'
import { format } from 'date-fns'
import { DateTime } from 'luxon'


import './App.css';
import 'rc-slider/assets/index.css';




const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

// Resize images for efficiency
function resize(img, preferredWidth){
  /////////  3-3 manipulate image
  var ratio = preferredWidth / img.width;
  var canvas = document.createElement('canvas');
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //////////4. export as dataUrl
  return canvas.toDataURL();
}


////// Modal boxes for meal and note

class Meal extends Component {
  constructor(props) {
    super(props);
    this.state = {modalOpen: false};
  }
  
  ingredientChoices() {
    function f(v) {
      return {
        key: v,
        value: v,
        text: v
      };
    }
    return this.props.allIngredients.map(f);
  }
  
  setModalOpen() {
    this.setState({modalOpen: true});
  }
  setModalClosed() {
    this.setState({modalOpen: false});
  }
  
  render() {
    var d = this.props.d;
    var updateName = (e, data) => {
      d({ type: 'update_meal_name', value: data.value })();
    }
    var updateTime = (date) => {
      d({ type: 'update_meal_time', value: time(date[0]) })();
    }
    var updateIngredients = (e, data) => {
      d({ type: 'update_meal_ingredients', value: data.value })();
    }
    var updatePhoto = (e) => {
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
          var image = new Image();
          image.addEventListener('load', function() {
            var img = resize(image, 750)
            d({ type: 'update_meal_photo', id: this.props.meal.id, value: img })();
          }.bind(this));
          image.src = e.target.result;
        }.bind(this);
              
        reader.readAsDataURL(e.target.files[0]);
      }
    }
    var updateNotes = (e, data) => {
      d({ type: 'update_meal_notes', value: data.value})();
    }
    this.photo = photo;
    return (
        <Modal open={true}  style={inlineStyle.modal}>
          <Modal.Header>
            <Input value={this.props.meal.name} onChange={updateName} /> 
            <Header.Subheader>
              <Flatpickr data-enable-time data-no-calendar data-time_24hr
                value={dateFromTime(this.props.meal.time)} onChange={updateTime}/>
            </Header.Subheader>
          </Modal.Header>
          <Modal.Content image>
            <SImage wrapped size='medium' src={photo(this.props.model, this.props.meal.id)} />

            <Modal.Description>
              <MessageHandler message={this.props.message} d={d} />        
              <Header>Ingrédients:</Header>
                <Dropdown 
                  selection
                  placeholder='Enter Ingredients'
                  search
                  multiple
                  fluid
                  allowAdditions  
                  onChange={updateIngredients}
                  options={this.ingredientChoices()}
                  value={this.props.meal.ingredients} />
              <Form>
              
                <Header>Photo:</Header>
                <input type="file" name="fileToUpload" id="fileToUpload" accept="image/*" 
                  capture="camera"
                  onChange={updatePhoto}/>
                <Header>Autres Notes:</Header>
                <TextArea 
                  autoHeight 
                  placeholder='Other notes...' 
                  rows={2}
                  value={this.props.meal.notes}
                  onChange={updateNotes}
                  />
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='red' onClick={this.setModalOpen.bind(this)}>
              <Icon name='trash' /> Effacer
            </Button>
            <Modal 
              open={this.state.modalOpen}
              basic size='small'
              style={inlineStyle.modal}>
              <Header icon='archive' content='Confirm' />
              <Modal.Content>
                <p>Are you sure you want to delete?</p>
              </Modal.Content>
              <Modal.Actions>
                <Button basic color='grey' inverted onClick={this.setModalClosed.bind(this)}>
                  <Icon name='remove' /> No
                </Button>
                <Button color='red' inverted onClick={d({ type: 'delete_meal'})}>
                  <Icon name='checkmark' /> Yes
                </Button>
              </Modal.Actions>
            </Modal>
            <Button color='green' onClick={d({ type: 'finish_meal' })}>
              <Icon name='check' /> Terminer
            </Button>
          </Modal.Actions>
        </Modal>
      );
    }
}

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {modalOpen: false};
  }
  
  setModalOpen() {
    this.setState({modalOpen: true});
  }
  setModalClosed() {
    this.setState({modalOpen: false});
  }
  
  render() {
    var d = this.props.d;
  
    var updateTime = (date) => {
      d({ type: 'update_note_time', value: time(date[0]) })();
    }
    var updateItch = (value) => {
      d({ type: 'update_note_itch', value: value})();
    }
    var updateText = (e, data) => {
      d({ type: 'update_note_text', value: data.value})();
    }
    
    return (
      <Modal open={true}  style={inlineStyle.modal}>
        <Modal.Header>Décrivez Tes Symptômes
          <Header.Subheader>
            <Flatpickr data-enable-time data-no-calendar data-time_24hr
              value={dateFromTime(this.props.note.time)}
              onChange={updateTime}/>
          </Header.Subheader>
        </Modal.Header>
        <Modal.Content image>
          <SImage wrapped size='medium' src='' />
          
          <Modal.Description>
            <MessageHandler message={this.props.message} d={d} />        
            <Header>Itching Level:</Header>
            <Slider 
              min={0}
              max={10}
              value={this.props.note.itch}
              onChange={updateItch} />
            <Label color="blue">{this.props.note.itch}</Label>
            <Header>Notes:</Header>
            <Form>
              <TextArea autoHeight placeholder='Notes here' rows={2} 
                value={this.props.note.text}
                onChange={updateText} />
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
        <Button color='red' onClick={this.setModalOpen.bind(this)}>
          <Icon name='trash' /> Effacer
        </Button>
        <Modal 
          open={this.state.modalOpen}
          basic size='small'
          style={inlineStyle.modal}>
          <Header icon='archive' content='Confirm' />
          <Modal.Content>
            <p>Are you sure you want to delete?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='grey' inverted onClick={this.setModalClosed.bind(this)}>
              <Icon name='remove' /> No
            </Button>
            <Button color='red' inverted onClick={d({ type: 'delete_note'})}>
              <Icon name='checkmark' /> Yes
            </Button>
          </Modal.Actions>
        </Modal>
        <Button color='green' onClick={d({ type: 'finish_note' })}>
          <Icon name='check' /> Terminer
        </Button>
      </Modal.Actions>
    </Modal>
      );
    }
  }
  

////// List items for meals and notes
  
function MealItem(props) {
  var d = props.d;
  
  return (
    <List.Item onClick={d({ type: 'view_meal', id: props.meal.id })}>
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
    <List.Item onClick={d({ type: 'view_note', id: props.note.id })}>
      <List.Icon name='clipboard' size='large' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{props.note.time.h.toString().padStart(2, '0')}:{props.note.time.m.toString().padStart(2, '0')}</List.Header>
        <List.Description as='a'>Itching Level: {props.note.itch}</List.Description>
      </List.Content>
    </List.Item>
  );
}


////// Message popup

function MessageHandler(props) {
  var d = props.d;
  
  if (props.message === null) {
    return null;
  } else if (props.message.type==='error') {
    return (
      <Message negative
               onDismiss={d({ type: 'reset_message' })}>
        <Message.Header>{props.message.title}</Message.Header>
        <p>{props.message.text}</p>
      </Message>);
  }
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
    
    if (this.props.apikey !== null && this.props.apikey !== undefined) {
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


////// Main app view

class App extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    var d = (action) => {
      return () => this.props.d(action);
    }
    
    // Sorted lists of MealItems and NoteItems
    var mealItems = sortedMeals(this.props.model).map((meal) => 
      <MealItem meal={meal}
                key={meal.id.toString()}
                d={d} />);
    var noteItems = sortedNotes(this.props.model).map((note) => 
      <NoteItem note={note} 
                key={note.id.toString()}
                d={d} />);

    return (
      <Container>
        { currentMeal(this.props.model) !== null &&
          <Meal meal={currentMeal(this.props.model)} 
                model={this.props.model}
                allIngredients={allIngredients(this.props.model)} 
                message={this.props.model.state.message}
                d={d} /> }
        { currentNote(this.props.model) !== null &&
          <Note note={currentNote(this.props.model)} 
                message={this.props.model.state.message}
                d={d} /> }
        
        <MessageHandler message={this.props.model.state.message} d={d} />      
        <APIKeyInput apikey={this.props.model.apikey} message={this.props.model.state.message} d={d} />
      
        <Button icon="double angle left" 
          onClick={d({ type: 'view_first_day' })} />
        <Button icon="angle left" 
          onClick={d({ type: 'view_previous_day' })} />
        <Button icon="angle right"
          onClick={d({ type: 'view_next_day' })} />
        <Button icon="double angle right"
          onClick={d({ type: 'view_last_day' })} />
        
        <Header as='h1'>
          { 
            DateTime.fromJSDate(currentDay(this.props.model).date).setZone('Europe/Paris').toLocaleString({weekday: 'short', month: 'short', day: '2-digit'}) 
          }
        </Header>
        
        <Header as='h2'>Repas</Header>
        <List relaxed>
          {mealItems}
        </List>
        <Button icon labelPosition='right'
                onClick={d({ type: 'new_meal' })}>
          Ajouter un Repas
          <Icon name='plus' />
        </Button>

        <Header as='h2'>{"Notes d'Allergie"}</Header>
        <List relaxed>
          {noteItems}
        </List>
        <Button icon labelPosition='right'
                onClick={d({ type: 'new_note' })}>
          Ajouter une Note
          <Icon name='plus' />
        </Button>
        
        <Divider />
        
        <p>{this.props.model.state.lastSynced &&
         <span>Last synced: {DateTime.fromJSDate(this.props.model.state.lastSynced).setZone('Europe/Paris').toLocaleString({weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}. </span>}Version 4.</p> 
      </Container>
    );
  }
}

export default App;
