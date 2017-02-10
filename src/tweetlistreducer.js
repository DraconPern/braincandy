import { combineReducers } from 'redux';

const tweetlistReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_TWEETITEM':
      var found = state.findIndex((element, index, array) => { return (action.item.id_str == element.id_str) });
      if(found != -1) {
        state[found].annotations = action.item.annotations;
        //state[found].status = action.item.status;
        return [ ...state];
      }
      else {
        var item = action.item;
        var state = state.slice(0, 100);
        return [ item,
          ...state];
      }
    case 'SET_TWEETS':
      return action.tweetlist;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  tweetlist: tweetlistReducer
});

export default rootReducer;
