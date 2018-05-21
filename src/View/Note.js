import React, { Component } from 'react';
import { Button, Header, List, Modal,
         Image as SImage, Form, TextArea, Icon,
         Input, Container, Label, 
         Dropdown, Message, Divider } from 'semantic-ui-react'
import Flatpickr from 'react-flatpickr'
import Slider from 'rc-slider';
import ReactTags from 'react-tag-autocomplete'
import { DateTime } from 'luxon'

import { Day, Time } from '../TimeUtility'
import MessageHandler from './MessageHandler'


const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

export default class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      time: {},
      itch: 0,
      text: ""
    };
  }
  
  componentDidMount() {
    this.setState({
      time: this.props.note.time,
      itch: this.props.note.itch,
      text: this.props.note.text
    });
  }
  
  setModalOpen() {
    this.setState({modalOpen: true});
  }
  setModalClosed() {
    this.setState({modalOpen: false});
  }
  
  render() {
    var d = this.props.d;
  
    var updateTime = ((date) => {
      this.setState({ time: Time.from(DateTime.fromJSDate(date[0])) });
      d({ type: 'update', etype: 'note', field: 'time', value: Time.from(DateTime.fromJSDate(date[0])) })();
    }).bind(this);
    var updateItch = ((value) => {
      this.setState({ itch: value });
      d({ type: 'update', etype: 'note', field: 'itch', value: value })();
    }).bind(this);
    var updateText = ((e, data) => {
      this.setState({ text: data.value });
      d({ type: 'update', etype: 'note', field: 'text', value: data.value })();
    }).bind(this);
    
    return (
      <Modal open={true}  style={inlineStyle.modal}>
        <Modal.Header>Décrivez Tes Symptômes
          <Header.Subheader>
            <Flatpickr data-enable-time data-no-calendar data-time_24hr
              value={Time.dateFromTime(this.state.time)}
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
              value={this.state.itch}
              onChange={updateItch} />
            <Label color="blue">{this.state.itch}</Label>
            <Header>Notes:</Header>
            <Form>
              <TextArea autoHeight placeholder='Notes here' rows={2} 
                value={this.state.text}
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
            <Button color='red' inverted onClick={d({ type: 'delete', etype: 'note'})}>
              <Icon name='checkmark' /> Yes
            </Button>
          </Modal.Actions>
        </Modal>
        <Button color='green' onClick={d({ type: 'finish', etype: 'note' })}>
          <Icon name='check' /> Terminer
        </Button>
      </Modal.Actions>
    </Modal>
      );
    }
  }
