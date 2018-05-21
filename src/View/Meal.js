import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image as SImage, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown, Message, Divider } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import Slider from 'rc-slider';
import ReactTags from 'react-tag-autocomplete'
import { DateTime } from 'luxon'
import blobUtil from 'blob-util'

import { Day, Time } from '../TimeUtility'
import MessageHandler from './MessageHandler'


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

export default class Meal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      allIngredients: [],
      name: "",
      time: {},
      ingredients: [],
      notes: ""
    };
  }
  
  componentDidMount() {
    this.setState({
      name: this.props.meal.name,
      time: this.props.meal.time,
      ingredients: this.props.meal.ingredients,
      notes: this.props.meal.notes,
      allIngredients: this.props.allIngredients
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
    return this.state.allIngredients.map(f);
  }
  
  setModalOpen() {
    this.setState({modalOpen: true});
  }
  setModalClosed() {
    this.setState({modalOpen: false});
  }
  
  render() {
    var d = this.props.d;
    var updateName = ((e, data) => {
      this.setState({ name: data.value });
      d({ type: 'update', etype: 'meal', field: 'name', value: data.value })();
    }).bind(this);
    var updateTime = ((date) => {
      this.setState({ time: Time.from(DateTime.fromJSDate(date[0])) });
      d({ type: 'update', etype: 'meal', field: 'time', value: Time.from(DateTime.fromJSDate(date[0])) })();
    }).bind(this);
    var updateIngredients = ((e, data) => {
      this.setState({ ingredients: data.value })
      d({ type: 'update', etype: 'meal', field: 'ingredients', value: data.value })();
    }).bind(this);
    var updateAllIngredients = ((e, data) => {
      this.setState({ allIngredients: this.state.allIngredients.concat(data.value) });
    }).bind(this);
    var updateNotes = ((e, data) => {
      this.setState({ notes: data.value });
      d({ type: 'update', etype: 'meal', field: 'notes', value: data.value})();
    }).bind(this);
    
    var updatePhoto = (e) => {
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
          var image = new Image();
          image.addEventListener('load', function() {
            var img = resize(image, 750);
            blobUtil.dataURLToBlob(img)
            .then(blobUtil.blobToBinaryString)
            .then(function (str) {
            }).catch(function (err) {
              console.log(err);
            });
          }.bind(this));
          image.src = e.target.result;
        }.bind(this);
              
        reader.readAsDataURL(e.target.files[0]);
      }
    }

    return (
        <Modal open={true}  style={inlineStyle.modal}>
          <Modal.Header>
            <Input value={this.state.name} onChange={updateName} /> 
            <Header.Subheader>
              <Flatpickr data-enable-time data-no-calendar data-time_24hr
                value={Time.dateFromTime(this.state.time)} onChange={updateTime}/>
            </Header.Subheader>
          </Modal.Header>
          <Modal.Content image>
            <SImage wrapped size='medium' src={null} />

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
                  onAddItem={updateAllIngredients}
                  options={this.ingredientChoices()}
                  value={this.state.ingredients} />
              <Form>
              
                
                <Header>Autres Notes:</Header>
                <TextArea 
                  autoHeight 
                  placeholder='Other notes...' 
                  rows={2}
                  value={this.state.notes}
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
                <Button color='red' inverted onClick={d({ type: 'delete', etype: 'meal' })}>
                  <Icon name='checkmark' /> Yes
                </Button>
              </Modal.Actions>
            </Modal>
            <Button color='green' onClick={d({ type: 'finish', etype: 'meal' })}>
              <Icon name='check' /> Terminer
            </Button>
          </Modal.Actions>
        </Modal>
      );
    }
}
