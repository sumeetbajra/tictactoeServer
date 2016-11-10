var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
	var rooms = {};
	var room = Date.now();
	socket.join(room);

	socket.on('createRoom', function() {
		room = Date.now();
		socket.join(room)
		io.in(room).emit('roomId', room);
		rooms[room] = socket.id;
	})

	socket.on('joinRoom', function(room){
		socket.join(room);
		var roomUsers = io.sockets.adapter.rooms[room];
		socket.emit('newUserCount', roomUsers['length']);
		io.in(room).emit('userCount', roomUsers['length']);
		rooms[room] = socket.id;
	});	

	socket.on('disconnect', function() {
    	Object.keys(rooms).filter(function(room) {
    		if(rooms[room] === socket.id) {
    			var roomUsers = io.sockets.adapter.rooms[room];
    			if(roomUsers) {
    				io.in(room).emit('userCount', roomUsers['length']);
    			}
    		}
    	})
	})

	socket.on('restartGame', function(room) {
		socket.broadcast.to(room).emit('restartGame');
	})

	socket.on('mark', function(data){
		socket.broadcast.to(data.room).emit('marked', data.data);
	})
});

http.listen(process.env.PORT || 3001, function(){
  console.log('listening on *:3001');
});
