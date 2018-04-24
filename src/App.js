import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import { Slider } from 'react-semantic-ui-range'
import ReactTags from 'react-tag-autocomplete'
import Model from './Model'
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
    this.state = {
      title: 'Breakfast',
      image: null,
      ingredients: [
        {key: 'banana', value: 'banana', text: 'banana'}
      ],
      ingredientsC: [
        
      ]
    };
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
  
  changeTitle(e, data) {
    console.log(data.value);
    this.setState({ title: data.value });
  }
  
  render() {
  return (
      <Modal open={this.props.open}  style={inlineStyle.modal}>
        <Modal.Header>
          <Input value={this.state.title} onChange={this.changeTitle.bind(this)} /> 
          <Header.Subheader>
            <Flatpickr data-enable-time data-no-calendar data-time_24hr
              value={new Date().setHours(7)}/>
          </Header.Subheader>
        </Modal.Header>
        <Modal.Content image>
          <Image wrapped size='medium' src={this.state.image} />

          <Modal.Description>
            <Header>Ingredients:</Header>
              <Dropdown 
                selection
                placeholder='Enter Ingredients'
                search
                multiple
                fluid
                allowAdditions  
                onAddItem={this.addIngredient.bind(this)}
                options={this.state.ingredients} />
            <Form>
            
              <Header>Picture:</Header>
              <Input type="file" name="fileToUpload" id="fileToUpload" accept="image/*" onChange={ (e) => this.readURL(e.target) }/>
              <Header>Other Notes:</Header>
              <TextArea autoHeight placeholder='Other notes...' rows={2} />
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

class App extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    var d = this.props.d;
    
    return (
      <Container>
        <Button icon="left arrow" 
          onClick={d({ type: 'view_previous_day' })} />
        <Button icon="right arrow"
          onClick={d({ type: 'view_next_day' })} />
        
        <Header as='h1'>
          format(currentDay(this.props.model).date, 'ddd, MMM DD')
        </Header>
        
        
        <Header as='h2'>Meals</Header>
        <List relaxed>
          <List.Item onClick={this.openMeal.bind(this) }>
            <List.Icon name='utensils' size='large' verticalAlign='middle' />
            <List.Content>
              <List.Header as='a'>Breakfast</List.Header>
              <List.Description as='a'>07:15</List.Description>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='utensils' size='large' verticalAlign='middle' />
            <List.Content>
              <List.Header as='a'>Lunch</List.Header>
              <List.Description as='a'>13:15</List.Description>
            </List.Content>
          </List.Item>
        </List>
        <Button icon labelPosition='right'>
          Add Meal
          <Icon name='plus' />
        </Button>
        
        
        <Header as='h2'>Allergy Notes</Header>
          <List relaxed>
            <List.Item onClick={() => this.setState({ noteOpen: true})}>
              <List.Icon name='clipboard' size='large' verticalAlign='middle' />
              <List.Content>
                <List.Header as='a'>13:15</List.Header>
                <List.Description as='a'>Itching Level: {this.state.itch}</List.Description>
              </List.Content>
            </List.Item>
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
