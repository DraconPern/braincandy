require("babel-polyfill");
import React from 'react';
import { render } from 'react-dom';
import TweetList from './TweetList';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import io from 'socket.io-client';
import rootReducer from './tweetlistreducer';


const initialState = window.__INITIAL_STATE__;

let store = createStore(rootReducer, initialState, window.devToolsExtension && window.devToolsExtension());

const socket = io(`${location.protocol}//${location.host}`);
socket.on('addtweet', data =>
  store.dispatch({type: 'UPDATE_TWEETITEM', item: data})
);

socket.on('settweets', data =>
  store.dispatch({type: 'SET_TWEETS', tweetlist: data})
);

// tell the server we are a front end
socket.on('connect', () =>
  socket.emit('front_end', ''));

render(
  <Provider store={store}>
    <TweetList />
  </Provider>
  ,
  document.getElementById('mount')
)
