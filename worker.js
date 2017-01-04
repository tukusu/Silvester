var count=0;
document.onkeydown=function(){
	count++;
}

window.onfocus=function(){
	self.postMessage(count);
}

onmessage = function(e){
  postMessage(count);
};

worker.addEventListener('message', function(e) {
	count+=10;
	self.postMessage(count);
});

