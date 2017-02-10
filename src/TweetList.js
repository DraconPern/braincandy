import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

class TweetListItem extends Component {
  constructor(props) {
    super(props);


  }

  render() {
    return (
    <div className="tweetcontainer">
    <div className={ "tweet" + isHighlight(this.props.annotations) }>
      <div className="userinfo clearfix">
        <a href={ "https://twitter.com/" + this.props.user.screen_name} target='_blank'>{this.props.user.screen_name}</a>
      </div>
      <div className="tweettext">
        <span dangerouslySetInnerHTML={ {__html: this.props.text}} />
      </div>
      <div className="imagecontainer">
        {
        this.props.extended_entities.media ?
          this.props.extended_entities.media.map(item => {
            return <a key={item.media_url} href={ "https://twitter.com/" + this.props.user.screen_name + "/status/" + this.props.id_str } target='_blank'><img src={item.media_url}/></a>
          }) : ''
        }
        <div className="annotations">{ this.props.annotations.map(item => { return <span key={item}>{item}{' '}</span> })}</div>
      </div>
    </div>
    </div>
    )
  }
};

function isHighlight(labels) {
  if(labels && labels.includes('anime') && labels.includes('costume'))
    return ' highlighttweet';

  return '';
}

function fixdate(date, formatstring = 'lll') {
  var d = moment(date);
  return d.format(formatstring);
}

class TweetList extends Component {
  render() {
    return (
      <div>
          {
            this.props.tweetlist ?
              this.props.tweetlist.map(item => {
                return <TweetListItem {...item} key={item.id_str} />
              }) : ''
          }
      </div>
    );
  }
};

// Function passed in to `connect` to subscribe to Redux store updates.
// Any time it updates, mapStateToProps is called.
function mapStateToProps(state) {
  return {
    tweetlist: state.tweetlist
  };
}

// Connects React component to the redux store
// It does not modify the component class passed to it
// Instead, it returns a new, connected component class, for you to use.
export default connect(mapStateToProps)(TweetList);
