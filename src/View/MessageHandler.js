import React, { Component } from 'react';
import { Message } from 'semantic-ui-react'

////// Message popup

export default function MessageHandler(props) {
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
