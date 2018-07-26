//Orients the mouse position with respect to the canvas.
function getXY(canvas, event) {
    var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;
	
    return {
        x: x,
        y: y
    }
}

//All the keyHandle functions.
document.onkeydown = function(event){
	if(event.keyCode === 68) //d
		socket.emit('Update State',{direction:'right',state: true});
	else if(event.keyCode === 83) //s			
		socket.emit('Update State',{direction:'down',state: true});
	else if(event.keyCode === 65) //a		
		socket.emit('Update State',{direction:'left',state: true});
	else if(event.keyCode === 87) //w			
		socket.emit('Update State',{direction:'up',state: true});
	else if(event.keyCode === 32){ //spacebar
		socket.emit('Update State',{direction:'space',state: true});
	}
}

document.onkeyup = function(event){
	if(event.keyCode === 68) //d
		socket.emit('Update State',{direction:'right',state: false});
	else if(event.keyCode === 83) //s			
		socket.emit('Update State',{direction:'down',state: false});
	else if(event.keyCode === 65) //a		
		socket.emit('Update State',{direction:'left',state: false});
	else if(event.keyCode === 87) //w			
		socket.emit('Update State',{direction:'up',state: false});
	else if(event.keyCode === 32){ //spacebar
		socket.emit('Update State',{direction:'space',state: false});
	}
}

canvas.onmousedown = function(event){
	var mousePosition = getXY(canvas, event);
	socket.emit('Mouse', {x: mousePosition.x, y: mousePosition.y, state: true});
}

canvas.onmouseup = function(event){
	var mousePosition = getXY(canvas, event);
	socket.emit('Mouse', {x: mousePosition.x, y: mousePosition.y, state: false});
}

canvas.onmousemove = function(event){		
	var mousePosition = getXY(canvas, event);
	socket.emit('Mouse Move', {x: mousePosition.x, y: mousePosition.y});
}

