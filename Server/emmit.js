socket=io.connect("http://133.27.5.14:8000/",function(){
	socket.emit('message',arr);
});