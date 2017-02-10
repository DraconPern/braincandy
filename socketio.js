var Server = require('socket.io');
var request = require('request');
var io = new Server();

io.on('connection', (socket) => {
  // they are a frontend
  socket.on('front_end', (data) => {
    console.log('frontend connected');

    socket.join('frontends');    
  });

});


module.exports = io;
