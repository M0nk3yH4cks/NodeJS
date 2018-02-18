// Setup basic express server
'use strict';
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var os = require('os');
var ifaces = os.networkInterfaces();

server.listen(port, function () {
  console.log('Server in ascolto sulla porta %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;
var userid;

io.on('connection', function (socket) {
  var addedUser = false;
	userid=socket.id;

	var clientIp = socket.request.connection.remoteAddress;
    	socket.emit('eventName',{ip : clientIp});
	console.log('Nuovo/Refresh Client > ' + clientIp);
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {

	//Algoritmo di Ban per gli utenti
	console.log("Utente: " + socket.username + ">>" +userid+">>>"+ clientIp);
	var Nome=socket.username;
	var Ban='++';
	var IPlist=["0.00", "0.00", "0.00"];
	  var i=0;
	  var flag=1;
	  for (i=0; IPlist[i]!=null;i++)
		  if (clientIp.indexOf(IPlist[i])==-1)
			  flag=0;
		  else{
			  flag=1;
			  break;
		  }

	if(flag==1){
		console.log("	<<<<User Banned By IPv4 :D>>>>");
		socket.disconnect();}else{}
	if(Ban==Nome){
	console.log("		<<<<Banned Nickname>>>>");
	socket.disconnect();}else{}

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    if(username == "Admin") return;

    // we store the username in the socket session for this client
    if(username == "Aaaa1234"){
      socket.username = "Admin";
    }else{
      socket.username = username;
    }
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });


Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
      console.log('Connessione Base > '+ userid + '.');
    }
    ++alias;
  });
});

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
