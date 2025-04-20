import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Notification from './Notification';

// Get the parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message') || 'You are distracted';
const nudge = urlParams.get('nudge') || '';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

ReactDOM.render(
  <React.StrictMode>
    <Notification message={message} nudge={nudge} />
  </React.StrictMode>,
  rootElement
);
