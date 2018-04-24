import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import { Slider } from 'react-semantic-ui-range'
import ReactTags from 'react-tag-autocomplete'
import { currentDay, sortedMeals,
         currentMeal, allIngredients } from './Model'
import { format } from 'date-fns'




import './App.css';

const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};


class Meal extends Component {
  constructor(props) {
    super(props);
  }
  
  readURL(input) {
    if (input.files && input.files[0]) {
      console.log(input.files[0]);
      var reader = new FileReader();
      
      reader.onload = function(e) {
        this.setState({ image: e.target.result });
      }.bind(this);
      
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  addIngredient(e, data) {
    this.state.ingredients.push({
      key: data.value,
      value: data.value,
      text: data.value
    });
    this.state.ingredientsC.push(data.value);
    this.setState({ 
      ingredients: this.state.ingredients,
      ingredientsC: this.state.ingredientsC
    });
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
  
  changeTitle(e, data) {
    console.log(data.value);
    this.setState({ title: data.value });
  }
  
  render() {
    var d = this.props.d;
    var updateName = (e, data) => {
      d({ type: 'update_meal_name', value: data.value})();
    }
    var updateTime = (date) => {
      d({ type: 'update_meal_time', value: date})();
    }
    var updateIngredients = (e, data) => {
      d({ type: 'update_meal_ingredients', value: data.value})();
    }
    var updatePhoto = (e) {
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
          d({ type: 'update_meal_photo', value: e.target.result })();
        }.bind(this);
        
        reader.readAsDataURL(e.target.files[0]);
      }
    }
    
    return (
        <Modal open={true}  style={inlineStyle.modal}>
          <Modal.Header>
            <Input value={this.props.meal.name} onChange={updateName} /> 
            <Header.Subheader>
              <Flatpickr data-enable-time data-no-calendar data-time_24hr
                value={this.props.meal.time} onChange={updateTime}/>
            </Header.Subheader>
          </Modal.Header>
          <Modal.Content image>
            <Image wrapped size='medium' src={this.props.meal.image} />

            <Modal.Description>
              <Header>Ingredients:</Header>
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
                <Input type="file" name="fileToUpload" id="fileToUpload" accept="image/*" onChange={ (e) => this.readURL(e.target) }/>
                <Header>Other Notes:</Header>
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
            <Button color='green' onClick={d({ type: 'finish_meal' })}>
              <Icon name='check' /> Finish
            </Button>
          </Modal.Actions>
        </Modal>
      );
    }
}

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null
    };
  }
  
  render() {
    return (
      <Modal open={this.props.open}  style={inlineStyle.modal}>
        <Modal.Header>Record Your Symptoms
          <Header.Subheader>
            <Flatpickr data-enable-time data-no-calendar data-time_24hr
              value={new Date().setHours(13)}/>
          </Header.Subheader>
        </Modal.Header>
        <Modal.Content image>
          <Image wrapped size='medium' src='/assets/images/wireframe/image.png' />
          
          <Modal.Description>
            <Header>Itching Level:</Header>
            <Slider inverted={false} 
              settings={{
                start: this.props.itch,
                min:0,
                max:10,
                step:1,
                onChange: this.props.changeItch
              }} />
            <Label color="red">{this.props.itch}</Label>
            <Header>Notes:</Header>
            <Form>
              <TextArea autoHeight placeholder='Try adding multiple lines' rows={2} />
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={this.props.handleFinish}>
            <Icon name='check' /> Finish
            </Button>
          </Modal.Actions>
        </Modal>
      );
    }
  }
  
function MealItem(props) {
  var d = props.d;
  
  return (
    <List.Item onClick={d({ type: 'view_meal', id: props.meal.id })}>
      <List.Icon name='utensils' size='large' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{props.meal.name}</List.Header>
        <List.Description as='a'>
          {format(props.meal.time, 'HH:mm')}
        </List.Description>
      </List.Content>
    </List.Item>
  );
}

function NoteItem(props) {
  var d = (action) => {
    return () => props.d(action);
  }
  
  return (
    <List.Item>
      <List.Icon name='clipboard' size='large' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{format(props.note.time, 'HH:mm')}</List.Header>
        <List.Description as='a'>Itching Level: {props.note.itch}</List.Description>
      </List.Content>
    </List.Item>
  );
}


class App extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    var d = (action) => {
      return () => this.props.d(action);
    }
    
    var mealItems = sortedMeals(this.props.model).map((meal) => 
      <MealItem meal={meal}
                key={meal.id.toString()}
                d={d} />);
    var noteItems = currentDay(this.props.model).notes.map((note) => 
      <NoteItem note={note} 
                key={note.id.toString()}
                d={d} />);

    return (
      <Container>
        { currentMeal(this.props.model) !== null &&
          <Meal meal={currentMeal(this.props.model)} 
                allIngredients={allIngredients(this.props.model)} 
                d={d} /> }

        
        <Button icon="left arrow" 
          onClick={d({ type: 'view_previous_day' })} />
        <Button icon="right arrow"
          onClick={d({ type: 'view_next_day' })} />
        
        <Header as='h1'>
          { format(currentDay(this.props.model).date, 'ddd, MMM DD') }
        </Header>
        
        <Header as='h2'>Meals</Header>
        <List relaxed>
          {mealItems}
        </List>
        <Button icon labelPosition='right'
                onClick={d({ type: 'new_meal' })}>
          Add Meal
          <Icon name='plus' />
        </Button>

        <Header as='h2'>Allergy Notes</Header>
        <List relaxed>
          {noteItems}
        </List>
        <Button icon labelPosition='right'>
          Add Note
          <Icon name='plus' />
        </Button>

      </Container>
    );
  }
}

export default App;
