var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
	var room = Date.now();
	socket.join(room)

	socket.on('createRoom', function() {
		room = Date.now();
		socket.join(room)
		io.in(room).emit('roomId', room);
	})

	socket.on('joinRoom', function(room){
		socket.join(room)
	});	

	socket.on('restartGame', function(room) {
		console.log(room);
		socket.broadcast.to(room).emit('restartGame');
	})

	socket.on('mark', function(data){
		socket.broadcast.to(data.room).emit('marked', data.data);
	})
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});
