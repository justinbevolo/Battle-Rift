//Client.js

/* GLOBAL VARIABLES */
var playerID;
var playerName;
var isReady = false;
var title = document.getElementById('title');
var powerupType = '';
var draw2 = false;
var atMenu = true;
var musicTime = 0;
var musicPlay = false;
var mainPlay = true;
var mainTime = 181;
var displayWinner = false;
var winner = '';
var x = 500;
var y = 300;

//Main Menu State
var enter = document.getElementById('enter');
var spectate = document.getElementById('spectBtn');
var menu = document.getElementById('main-menu');
var playername = document.getElementById('playername');
var toRules = document.getElementById('rulesBtn');
var toControls = document.getElementById('controlsBtn');

//Game State
//ChatBox
var chatBox = document.getElementById('textbox');
var chatForm = document.getElementById('chat');
var chatInput = document.getElementById('input');

var readyUp = document.getElementById('ready');
var game = document.getElementById('game');
var canvas = document.getElementById('gameCanvas');
var screen = document.getElementById('gameCanvas').getContext('2d');
var tomenu3 = document.getElementById('toMenu3');

//Game Over State
var gameover = document.getElementById('gameover');
var rtn = document.getElementById('return');
var gameoverCanvas = document.getElementById('gameoverCanvas').getContext('2d');

//Rules State
var rules = document.getElementById('rules');
var tomenu = document.getElementById('toMenu');
var rulescanvas = document.getElementById('rulesCanvas').getContext('2d');

//Controls State
var controls = document.getElementById('controls');
var tomenu2 = document.getElementById('toMenu2');
var controlsCanvas = document.getElementById('controlsCanvas').getContext('2d');

var socket = io();

//Ready Up Functions
function playerReady(){
	buttonSnd.play();
	isReady = true;
	socket.emit('Ready Up', {id: playerID});
	readyUp.style.display = 'none';
	tomenu3.style.display = 'none';
}

//Main Menu Functions
enter.onclick = function(){
	if(playername.value.length !== 0){
		playerName = playername.value;
		socket.emit('Pressed Play', {name: playerName});
		enterSnd.play();
	}
}

spectate.onclick = function(){
	if(playername.value.length !== 0){
		playerName = playername.value;
		socket.emit('Pressed Spectate', {name: playerName});
		enterSnd.play();
	}else{
		playerName = 'Spectator';
		socket.emit('Pressed Spectate', {name: playerName});
		enterSnd.play();
	}
	if(mainPlay){
		mainPlay = false;
		menuMusic.currentTime = 0;
		menuMusic.pause();
		mainTime = 181;
	}		
}

socket.on('Signed In', function(data){
	playerID = data.id;
	menu.style.display = 'none';
	title.style.display = 'none';
	game.style.display = 'inline-block';
	switch(playerID){
		case 0:
			gameCanvas.style.borderColor = '#c95050';
			chatBox.style.borderColor = '#c95050';
			chatInput.style.borderColor = '#c95050';
			break;
		case 1:
			gameCanvas.style.borderColor = '#2c70f7';
			chatBox.style.borderColor = '#2c70f7';
			chatInput.style.borderColor = '#2c70f7';
			break;
		case 2:
			gameCanvas.style.borderColor = '#25915b';
			chatBox.style.borderColor = '#25915b';
			chatInput.style.borderColor = '#25915b';
			break;
		case 3:
			gameCanvas.style.borderColor = '#6823a8';
			chatBox.style.borderColor = '#6823a8';
			chatInput.style.borderColor = '#6823a8';
			break;
		default:
			gameCanvas.style.borderColor = 'gray';
			chatBox.style.borderColor = 'gray';
			chatInput.style.borderColor = 'gray';
			break;
	}
	isReady = false;
	readyUp.style.display = 'inline-block';
	tomenu3.style.display = 'inline-block';
	chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('Not Signed In', function(data){
	if(data === 'game full')
		alert('The game is full!\n Entering as a spectator!');
	else if(data === 'game in progress')
		alert('A game is already underway!\n Entering as a spectator!');
	
	menu.style.display = 'none';
	title.style.display = 'none';
	game.style.display = 'inline-block';
	isReady = true;
	readyUp.style.display = 'none';
	tomenu3.style.display = 'none';
	chatBox.scrollTop = chatBox.scrollHeight;
});

toRules.onclick = function(){
	buttonSnd.play();
	menu.style.display = 'none';
	rules.style.display = 'inline-block';
	rulescanvas.drawImage(Images.rules, 0, 0, Images.rules.width, Images.rules.height, 0, 0, 
			Images.rules.width, Images.rules.height);	
}

toControls.onclick = function(){
	buttonSnd.play();
	menu.style.display = 'none';
	controls.style.display = 'inline-block';
	controlsCanvas.drawImage(Images.controls, 0, 0, Images.controls.width, Images.controls.height, 0, 0, 
			Images.controls.width, Images.controls.height);	
}

//Rules Functions
function toMenu(){
	menu.style.display = 'inline-block';
	rules.style.display = 'none';
	buttonSnd.play();
}	

//Controls Functions
function toMenu2(){
	menu.style.display = 'inline-block';
	controls.style.display = 'none';
	buttonSnd.play();
}

//Game Functions
socket.on('States', function(data){
	screen.clearRect(0,0,1000,600);
	
	screen.drawImage(Images.map, 0, 0, Images.map.width, Images.map.height, 0, 0, 
			Images.map.width, Images.map.height);	

	if(!isReady){
		screen.fillStyle = 'black';
		screen.textAlign = 'center';
		screen.font = '100 17px buttons';
		screen.fontWeight = 'bold';
		screen.fillText('WASD: Move Character, SPACEBAR: Teleport, MOUSE CLICK: Shoot, MOUSE: Aim', 500, 390);
	}
	
	// Health packs
	if(data.healthOne.display == 7){
		screen.drawImage(Images.healthPack, 0, 0, Images.healthPack.width, 
			Images.healthPack.height, data.healthOne.position.x - 15, data.healthOne.position.y - 15, 
			Images.healthPack.width, Images.healthPack.height);	
	}
	if(data.healthTwo.display == 7){
		screen.drawImage(Images.healthPack, 0, 0, Images.healthPack.width, 
			Images.healthPack.height, data.healthTwo.position.x - 15, data.healthTwo.position.y - 15, 
			Images.healthPack.width, Images.healthPack.height);	
	}

	// Powerups
	if(data.powerup.display === 250){
		if(data.powerup.m_speed){
			screen.drawImage(Images.powerupOne, 0, 0, Images.powerupOne.width, 
				Images.powerupOne.height, data.powerup.position.x - 25, data.powerup.position.y - 25, 
				Images.powerupOne.width, Images.powerupOne.height);
			powerupType = 'm_speed';
		}else if(data.powerup.a_speed){
			screen.drawImage(Images.powerupTwo, 0, 0, Images.powerupTwo.width, 
				Images.powerupTwo.height, data.powerup.position.x - 25, data.powerup.position.y - 25, 
				Images.powerupTwo.width, Images.powerupTwo.height);
			powerupType = 'a_speed';
		}else if(data.powerup.a_damage){
			screen.drawImage(Images.powerupThree, 0, 0, Images.powerupThree.width, 
				Images.powerupThree.height, data.powerup.position.x - 25, data.powerup.position.y - 25, 
				Images.powerupThree.width, Images.powerupThree.height);
			powerupType = 'a_damage';
		}else{
			screen.drawImage(Images.powerupFour, 0, 0, Images.powerupFour.width, 
				Images.powerupFour.height, data.powerup.position.x - 25, data.powerup.position.y - 25, 
				Images.powerupFour.width, Images.powerupFour.height);
			powerupType = 'god_mode';
		}
	}
	
	// Players
	for(var i = 0; i < data.players.length; ++i){
		var player = data.players[i];
		switch(player.id){
			case 0:
				if(playerID == 0){
					screen.strokeStyle = 'red';
					screen.beginPath();
					screen.moveTo(player.x, player.y);
					screen.lineTo(x, y);
					screen.stroke();
				}
				
				if(player.powered){
					if(powerupType === 'a_speed')
						screen.drawImage(Images.a_speed, 0, 0, Images.a_speed.width, Images.a_speed.height, 
							player.x - (Images.a_speed.width/2), player.y - (Images.a_speed.height/2), 
							Images.a_speed.width, Images.a_speed.height);
					else if(powerupType === 'a_damage')
						screen.drawImage(Images.a_damage, 0, 0, Images.a_damage.width, Images.a_damage.height, 
							player.x - (Images.a_damage.width/2), player.y - (Images.a_damage.height/2), 
							Images.a_damage.width, Images.a_damage.height);
					else if(powerupType === 'm_speed')
						screen.drawImage(Images.m_speed, 0, 0, Images.m_speed.width, Images.m_speed.height, 
							player.x - (Images.m_speed.width/2), player.y - (Images.m_speed.height/2), 
							Images.m_speed.width, Images.m_speed.height);
					else if(powerupType === 'god_mode')
						screen.drawImage(Images.god_mode, 0, 0, Images.god_mode.width, Images.god_mode.height, 
							player.x - (Images.god_mode.width/2), player.y - (Images.god_mode.height/2), 
							Images.god_mode.width, Images.god_mode.height);
							
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerRed, 0, 0, Images.bulletPowerRed.width, Images.bulletPowerRed.height, 
								player.x - (Images.bulletPowerRed.width/2), player.y - (Images.bulletPowerRed.height/2), 
								Images.bulletPowerRed.width, Images.bulletPowerRed.height);
					
					if(player.frame === 0)
						screen.drawImage(Images.modelOneP, 0, 0, Images.modelOneP.width, Images.modelOneP.height, 
							player.x - (Images.modelOneP.width/2), player.y - (Images.modelOneP.height/2), 
							Images.modelOneP.width, Images.modelOneP.height);
					else
						screen.drawImage(Images.modelOneP2, 0, 0, Images.modelOneP2.width, Images.modelOneP2.height, 
							player.x - (Images.modelOneP2.width/2), player.y - (Images.modelOneP2.height/2), 
							Images.modelOneP2.width, Images.modelOneP2.height);	
				}else{
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerRed, 0, 0, Images.bulletPowerRed.width, Images.bulletPowerRed.height, 
								player.x - (Images.bulletPowerRed.width/2), player.y - (Images.bulletPowerRed.height/2), 
								Images.bulletPowerRed.width, Images.bulletPowerRed.height);
								
					if(player.frame === 0)
						screen.drawImage(Images.modelOne, 0, 0, Images.modelOne.width, Images.modelOne.height, 
							player.x - (Images.modelOne.width/2), player.y - (Images.modelOne.height/2), 
							Images.modelOne.width, Images.modelOne.height);
					else
						screen.drawImage(Images.modelOne2, 0, 0, Images.modelOne2.width, Images.modelOne2.height, 
							player.x - (Images.modelOne2.width/2), player.y - (Images.modelOne2.height/2), 
							Images.modelOne2.width, Images.modelOne2.height);
				}
				break;
			case 1:
				if(playerID == 1){
					screen.strokeStyle = 'blue';
					screen.beginPath();
					screen.moveTo(player.x, player.y);
					screen.lineTo(x, y);
					screen.stroke();
				}
							
				if(player.powered){
					if(powerupType === 'a_speed')
						screen.drawImage(Images.a_speed, 0, 0, Images.a_speed.width, Images.a_speed.height, 
							player.x - (Images.a_speed.width/2), player.y - (Images.a_speed.height/2), 
							Images.a_speed.width, Images.a_speed.height);
					else if(powerupType === 'a_damage')
						screen.drawImage(Images.a_damage, 0, 0, Images.a_damage.width, Images.a_damage.height, 
							player.x - (Images.a_damage.width/2), player.y - (Images.a_damage.height/2), 
							Images.a_damage.width, Images.a_damage.height);
					else if(powerupType === 'm_speed')
						screen.drawImage(Images.m_speed, 0, 0, Images.m_speed.width, Images.m_speed.height, 
							player.x - (Images.m_speed.width/2), player.y - (Images.m_speed.height/2), 
							Images.m_speed.width, Images.m_speed.height);
					else if(powerupType === 'god_mode')
						screen.drawImage(Images.god_mode, 0, 0, Images.god_mode.width, Images.god_mode.height, 
							player.x - (Images.god_mode.width/2), player.y - (Images.god_mode.height/2), 
							Images.god_mode.width, Images.god_mode.height);
							
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerBlue, 0, 0, Images.bulletPowerBlue.width, Images.bulletPowerBlue.height, 
								player.x - (Images.bulletPowerBlue.width/2), player.y - (Images.bulletPowerBlue.height/2), 
								Images.bulletPowerBlue.width, Images.bulletPowerBlue.height);
							
					if(player.frame === 0)
						screen.drawImage(Images.modelTwoP, 0, 0, Images.modelTwoP.width, Images.modelTwoP.height, 
							player.x - (Images.modelTwoP.width/2), player.y - (Images.modelTwoP.height/2), 
							Images.modelTwoP.width, Images.modelTwoP.height);
					else
						screen.drawImage(Images.modelTwoP2, 0, 0, Images.modelTwoP2.width, Images.modelTwoP2.height, 
							player.x - (Images.modelTwoP2.width/2), player.y - (Images.modelTwoP2.height/2), 
							Images.modelTwoP2.width, Images.modelTwoP2.height);	
				}else{
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerBlue, 0, 0, Images.bulletPowerBlue.width, Images.bulletPowerBlue.height, 
								player.x - (Images.bulletPowerBlue.width/2), player.y - (Images.bulletPowerBlue.height/2), 
								Images.bulletPowerBlue.width, Images.bulletPowerBlue.height);
								
					if(player.frame === 0)
						screen.drawImage(Images.modelTwo, 0, 0, Images.modelTwo.width, Images.modelTwo.height, 
							player.x - (Images.modelTwo.width/2), player.y - (Images.modelTwo.height/2), 
							Images.modelTwo.width, Images.modelTwo.height);
					else
						screen.drawImage(Images.modelTwo2, 0, 0, Images.modelTwo2.width, Images.modelTwo2.height, 
							player.x - (Images.modelTwo2.width/2), player.y - (Images.modelTwo2.height/2), 
							Images.modelTwo2.width, Images.modelTwo2.height);
				}	
				break;
			case 2:
				if(playerID == 2){
					screen.strokeStyle = 'green';
					screen.beginPath();
					screen.moveTo(player.x, player.y);
					screen.lineTo(x, y);
					screen.stroke();
				}
							
				if(player.powered){
					if(powerupType === 'a_speed')
						screen.drawImage(Images.a_speed, 0, 0, Images.a_speed.width, Images.a_speed.height, 
							player.x - (Images.a_speed.width/2), player.y - (Images.a_speed.height/2), 
							Images.a_speed.width, Images.a_speed.height);
					else if(powerupType === 'a_damage')
						screen.drawImage(Images.a_damage, 0, 0, Images.a_damage.width, Images.a_damage.height, 
							player.x - (Images.a_damage.width/2), player.y - (Images.a_damage.height/2), 
							Images.a_damage.width, Images.a_damage.height);
					else if(powerupType === 'm_speed')
						screen.drawImage(Images.m_speed, 0, 0, Images.m_speed.width, Images.m_speed.height, 
							player.x - (Images.m_speed.width/2), player.y - (Images.m_speed.height/2), 
							Images.m_speed.width, Images.m_speed.height);
					else if(powerupType === 'god_mode')
						screen.drawImage(Images.god_mode, 0, 0, Images.god_mode.width, Images.god_mode.height, 
							player.x - (Images.god_mode.width/2), player.y - (Images.god_mode.height/2), 
							Images.god_mode.width, Images.god_mode.height);
							
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerGreen, 0, 0, Images.bulletPowerGreen.width, Images.bulletPowerGreen.height, 
							player.x - (Images.bulletPowerGreen.width/2), player.y - (Images.bulletPowerGreen.height/2), 
							Images.bulletPowerGreen.width, Images.bulletPowerGreen.height);
							
					if(player.frame === 0)
						screen.drawImage(Images.modelThreeP, 0, 0, Images.modelThreeP.width, Images.modelThreeP.height, 
							player.x - (Images.modelThreeP.width/2), player.y - (Images.modelThreeP.height/2), 
							Images.modelThreeP.width, Images.modelThreeP.height);
					else
						screen.drawImage(Images.modelThreeP2, 0, 0, Images.modelThreeP2.width, Images.modelThreeP2.height, 
							player.x - (Images.modelThreeP2.width/2), player.y - (Images.modelThreeP2.height/2), 
							Images.modelThreeP2.width, Images.modelThreeP2.height);	
				}else{
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerGreen, 0, 0, Images.bulletPowerGreen.width, Images.bulletPowerGreen.height, 
							player.x - (Images.bulletPowerGreen.width/2), player.y - (Images.bulletPowerGreen.height/2), 
							Images.bulletPowerGreen.width, Images.bulletPowerGreen.height);
							
					if(player.frame === 0)
						screen.drawImage(Images.modelThree, 0, 0, Images.modelThree.width, Images.modelThree.height, 
							player.x - (Images.modelThree.width/2), player.y - (Images.modelThree.height/2), 
							Images.modelThree.width, Images.modelThree.height);
					else
						screen.drawImage(Images.modelThree2, 0, 0, Images.modelThree2.width, Images.modelThree2.height, 
							player.x - (Images.modelThree2.width/2), player.y - (Images.modelThree2.height/2), 
							Images.modelThree2.width, Images.modelThree2.height);
				}
				break;
			case 3:
				if(playerID == 3){
					screen.strokeStyle = 'purple';
					screen.beginPath();
					screen.moveTo(player.x, player.y);
					screen.lineTo(x, y);
					screen.stroke();
				}
							
				if(player.powered){
					if(powerupType === 'a_speed')
						screen.drawImage(Images.a_speed, 0, 0, Images.a_speed.width, Images.a_speed.height, 
							player.x - (Images.a_speed.width/2), player.y - (Images.a_speed.height/2), 
							Images.a_speed.width, Images.a_speed.height);
					else if(powerupType === 'a_damage')
						screen.drawImage(Images.a_damage, 0, 0, Images.a_damage.width, Images.a_damage.height, 
							player.x - (Images.a_damage.width/2), player.y - (Images.a_damage.height/2), 
							Images.a_damage.width, Images.a_damage.height);
					else if(powerupType === 'm_speed')
						screen.drawImage(Images.m_speed, 0, 0, Images.m_speed.width, Images.m_speed.height, 
							player.x - (Images.m_speed.width/2), player.y - (Images.m_speed.height/2), 
							Images.m_speed.width, Images.m_speed.height);
					else if(powerupType === 'god_mode')
						screen.drawImage(Images.god_mode, 0, 0, Images.god_mode.width, Images.god_mode.height, 
							player.x - (Images.god_mode.width/2), player.y - (Images.god_mode.height/2), 
							Images.god_mode.width, Images.god_mode.height);
					
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerPurple, 0, 0, Images.bulletPowerPurple.width, Images.bulletPowerPurple.height, 
								player.x - (Images.bulletPowerPurple.width/2), player.y - (Images.bulletPowerPurple.height/2), 
								Images.bulletPowerPurple.width, Images.bulletPowerPurple.height);
							
					if(player.frame === 0)
						screen.drawImage(Images.modelFourP, 0, 0, Images.modelFourP.width, Images.modelFourP.height, 
							player.x - (Images.modelFourP.width/2), player.y - (Images.modelFourP.height/2), 
							Images.modelFourP.width, Images.modelFourP.height);
					else
						screen.drawImage(Images.modelFourP2, 0, 0, Images.modelFourP2.width, Images.modelFourP2.height, 
							player.x - (Images.modelFourP2.width/2), player.y - (Images.modelFourP2.height/2), 
							Images.modelFourP2.width, Images.modelFourP2.height);	
				}else{
					if(player.bulletPower < 5)
						screen.drawImage(Images.bulletPowerPurple, 0, 0, Images.bulletPowerPurple.width, Images.bulletPowerPurple.height, 
								player.x - (Images.bulletPowerPurple.width/2), player.y - (Images.bulletPowerPurple.height/2), 
								Images.bulletPowerPurple.width, Images.bulletPowerPurple.height);
				
					if(player.frame === 0)
						screen.drawImage(Images.modelFour, 0, 0, Images.modelFour.width, Images.modelFour.height, 
							player.x - (Images.modelFour.width/2), player.y - (Images.modelFour.height/2), 
							Images.modelFour.width, Images.modelFour.height);
					else
						screen.drawImage(Images.modelFour2, 0, 0, Images.modelFour2.width, Images.modelFour2.height, 
							player.x - (Images.modelFour2.width/2), player.y - (Images.modelFour2.height/2), 
							Images.modelFour2.width, Images.modelFour2.height);
				}	
				break;
		}
		
		// HP bar
		switch(player.health){
			case 10:
				screen.drawImage(Images.health10, 0, 0, Images.health10.width, Images.health10.height, 
							player.x - (Images.health10.width/2), player.y - (Images.health10.height/2) - 41, 
							Images.health10.width, Images.health10.height);
				break;
			case 9:
				screen.drawImage(Images.health9, 0, 0, Images.health9.width, Images.health9.height, 
							player.x - (Images.health9.width/2), player.y - (Images.health9.height/2) - 41, 
							Images.health9.width, Images.health9.height);
				break;
			case 8:
				screen.drawImage(Images.health8, 0, 0, Images.health8.width, Images.health8.height, 
							player.x - (Images.health8.width/2), player.y - (Images.health8.height/2) - 41, 
							Images.health8.width, Images.health8.height);
				break;
			case 7:
				screen.drawImage(Images.health7, 0, 0, Images.health7.width, Images.health7.height, 
							player.x - (Images.health7.width/2), player.y - (Images.health7.height/2) - 41, 
							Images.health7.width, Images.health7.height);
				break;
			case 6:
				screen.drawImage(Images.health6, 0, 0, Images.health6.width, Images.health6.height, 
							player.x - (Images.health6.width/2), player.y - (Images.health6.height/2) - 41, 
							Images.health6.width, Images.health6.height);
				break;
			case 5:
				screen.drawImage(Images.health5, 0, 0, Images.health5.width, Images.health5.height, 
							player.x - (Images.health5.width/2), player.y - (Images.health5.height/2) - 41, 
							Images.health5.width, Images.health5.height);
				break;
			case 4:
				screen.drawImage(Images.health4, 0, 0, Images.health4.width, Images.health4.height, 
							player.x - (Images.health4.width/2), player.y - (Images.health4.height/2) - 41, 
							Images.health4.width, Images.health4.height);
				break;
			case 3:
				screen.drawImage(Images.health3, 0, 0, Images.health3.width, Images.health3.height, 
							player.x - (Images.health3.width/2), player.y - (Images.health3.height/2) - 41, 
							Images.health3.width, Images.health3.height);
				break;
			case 2:
				screen.drawImage(Images.health2, 0, 0, Images.health2.width, Images.health2.height, 
							player.x - (Images.health2.width/2), player.y - (Images.health2.height/2) - 41, 
							Images.health2.width, Images.health2.height);
				break;
			case 1:
				screen.drawImage(Images.health1, 0, 0, Images.health1.width, Images.health1.height, 
							player.x - (Images.health1.width/2), player.y - (Images.health1.height/2) - 41, 
							Images.health1.width, Images.health1.height);
				break;
		}
			
		// TP bar
		switch(player.teleport){
			case 10:
				screen.drawImage(Images.teleport10, 0, 0, Images.teleport10.width, Images.teleport10.height, 
							player.x - (Images.teleport10.width/2), player.y - (Images.teleport10.height/2) - 35, 
							Images.teleport10.width, Images.teleport10.height);
				break;
			case 9:
				screen.drawImage(Images.teleport9, 0, 0, Images.teleport9.width, Images.teleport9.height, 
							player.x - (Images.teleport9.width/2), player.y - (Images.teleport9.height/2) - 35, 
							Images.teleport9.width, Images.teleport9.height);
				break;
			case 8:
				screen.drawImage(Images.teleport8, 0, 0, Images.teleport8.width, Images.teleport8.height, 
							player.x - (Images.teleport8.width/2), player.y - (Images.teleport8.height/2) - 35, 
							Images.teleport8.width, Images.teleport8.height);
				break;
			case 7:
				screen.drawImage(Images.teleport7, 0, 0, Images.teleport7.width, Images.teleport7.height, 
							player.x - (Images.teleport7.width/2), player.y - (Images.teleport7.height/2) - 35, 
							Images.teleport7.width, Images.teleport7.height);
				break;
			case 6:
				screen.drawImage(Images.teleport6, 0, 0, Images.teleport6.width, Images.teleport6.height, 
							player.x - (Images.teleport6.width/2), player.y - (Images.teleport6.height/2) - 35, 
							Images.teleport6.width, Images.teleport6.height);
				break;
			case 5:
				screen.drawImage(Images.teleport5, 0, 0, Images.teleport5.width, Images.teleport5.height, 
							player.x - (Images.teleport5.width/2), player.y - (Images.teleport5.height/2) - 35, 
							Images.teleport5.width, Images.teleport5.height);
				break;
			case 4:
				screen.drawImage(Images.teleport4, 0, 0, Images.teleport4.width, Images.teleport4.height, 
							player.x - (Images.teleport4.width/2), player.y - (Images.teleport4.height/2) - 35, 
							Images.teleport4.width, Images.teleport4.height);
				break;
			case 3:
				screen.drawImage(Images.teleport3, 0, 0, Images.teleport3.width, Images.teleport3.height, 
							player.x - (Images.teleport3.width/2), player.y - (Images.teleport3.height/2) - 35, 
							Images.teleport3.width, Images.teleport3.height);
				break;
			case 2:
				screen.drawImage(Images.teleport2, 0, 0, Images.teleport2.width, Images.teleport2.height, 
							player.x - (Images.teleport2.width/2), player.y - (Images.teleport2.height/2) - 35, 
							Images.teleport2.width, Images.teleport2.height);
				break;
			case 1:
				screen.drawImage(Images.teleport1, 0, 0, Images.teleport1.width, Images.teleport1.height, 
							player.x - (Images.teleport1.width/2), player.y - (Images.teleport1.height/2) - 35, 
							Images.teleport1.width, Images.teleport1.height);
				break;
			case 0:
				screen.drawImage(Images.teleport0, 0, 0, Images.teleport0.width, Images.teleport0.height, 
							player.x - (Images.teleport0.width/2), player.y - (Images.teleport0.height/2) - 35, 
							Images.teleport0.width, Images.teleport0.height);
				break;
		}
		
		
		//Display player name under their player.
		screen.fillStyle = 'black';
		screen.textAlign = 'center';
		screen.font = '12.5px arcade';
		screen.fillText(player.name, player.x, player.y + (75/2));
	}	
	
	// Bullets
	for(var i = 0; i < data.bullets.length; ++i){
		var bullet = data.bullets[i];
		switch(bullet.owner){
			case 0:
				screen.drawImage(Images.bulletOne, 0, 0, Images.bulletOne.width, Images.bulletOne.height, 
					bullet.x - (Images.bulletOne.width/2), bullet.y - (Images.bulletOne.height/2), Images.bulletOne.width, 
					Images.bulletOne.height);
					break;
			case 1:
				screen.drawImage(Images.bulletTwo, 0, 0, Images.bulletTwo.width, Images.bulletTwo.height, 
					bullet.x - (Images.bulletTwo.width/2), bullet.y - (Images.bulletTwo.height/2), Images.bulletTwo.width, 
					Images.bulletTwo.height);
					break;
			case 2:
				screen.drawImage(Images.bulletThree, 0, 0, Images.bulletThree.width, Images.bulletThree.height, 
					bullet.x - (Images.bulletThree.width/2), bullet.y - (Images.bulletThree.height/2), Images.bulletThree.width, 
					Images.bulletThree.height);
					break;
			case 3:
				screen.drawImage(Images.bulletFour, 0, 0, Images.bulletFour.width, Images.bulletFour.height, 
					bullet.x - (Images.bulletFour.width/2), bullet.y - (Images.bulletFour.height/2), Images.bulletFour.width, 
					Images.bulletFour.height);
					break;
			default:
				screen.drawImage(Images.bulletOne, 0, 0, Images.bulletOne.width, Images.bulletOne.height, 
					bullet.x - (Images.bulletOne.width/2), bullet.y - (Images.bulletOne.height/2), Images.bulletOne.width, 
					Images.bulletOne.height);
					break;
		}		
	}
	
	for(var i = 0; i < data.powers.length; ++i){
		if(data.powers[i].type == 1)
			screen.drawImage(Images.quadShot, 0, 0, Images.quadShot.width, Images.quadShot.height, 
					data.powers[i].x - (Images.quadShot.width/2), data.powers[i].y - (Images.quadShot.height/2), Images.quadShot.width, 
					Images.quadShot.height);
		else
			screen.drawImage(Images.triShot, 0, 0, Images.triShot.width, Images.triShot.height, 
					data.powers[i].x - (Images.triShot.width/2), data.powers[i].y - (Images.triShot.height/2), Images.triShot.width, 
					Images.triShot.height);
	}
	
	screen.drawImage(Images.walls, 0, 0, Images.walls.width, Images.walls.height, 0, 0, 
			Images.walls.width, Images.walls.height);
	
	//Draw the countdown timer
	if(data.timer > -1){
		screen.font="800 100px arcade";
		screen.textAlign = "center";
		if(data.timer === 3){
			if(mainPlay){
				mainPlay = false;
				menuMusic.currentTime = 0;
				menuMusic.pause();
				mainTime = 181;
			}
			screen.fillText('3', 500, 340);
		}else if(data.timer === 2)
			screen.fillText('2', 500, 340);
		else if(data.timer === 1)
			screen.fillText('1', 500, 340);
		else if(data.timer === 0)
			screen.fillText('Fight', 500, 340);
	}
	
	//Draw the game timer
	screen.fillStyle = "#000000";
	screen.font = "50px arcade, Fallback, sans-serif";
	screen.textAlign = 'left';
	if(data.gameclock === 60)
		screen.fillText("Timer: 1'00", 293, 55);
	else if(data.gameclock >= 10)
		screen.fillText("Timer: 0'" + data.gameclock, 293, 55);
	else if(data.gameclock >= 0)
		screen.fillText("Timer: 0'0" + data.gameclock, 293, 55);
	else if(data.timer === 4){
		screen.fillStyle = 'red';
		screen.font="800 100px arcade";
		screen.textAlign = "center";
		screen.fillText('Sudden Death', 500, 340);
	}
});

function toMenu3(){
	buttonSnd.play();
	socket.emit('Menu from Game', true);
	menu.style.display = 'inline-block';
	title.style.display = 'block';
	game.style.display = 'none';
	isReady = false;
	readyUp.style.display = 'none';
	toMenu3.style.display = 'none';
}

//Chat
chatForm.onsubmit = function(e){
	e.preventDefault();
	sendSnd.play();
	socket.emit('Message', {message: chatInput.value, name: playerName});
	chatInput.value = '';
}

socket.on('New Message', function(data){
	switch(data.id){
		case 0:
			chatBox.innerHTML += "<div style = 'color:red'>" + data.message + '</div>';
			break;
		case 1:
			chatBox.innerHTML += "<div style = 'color:blue'>" + data.message + '</div>';
			break;
		case 2:
			chatBox.innerHTML += "<div style = 'color:green'>" + data.message + '</div>';
			break;
		case 3:
			chatBox.innerHTML += "<div style = 'color:purple'>" + data.message + '</div>';
			break;
		default:
			chatBox.innerHTML += "<div style = 'color:black'>" + data.message + '</div>';
			break;
	}
	chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('Server Message', function(data){
	chatBox.innerHTML += "<div style = 'font-weight:bold'>" + data + '</div>';
	chatBox.scrollTop = chatBox.scrollHeight;
});

//Game Over State
socket.on('Game Over', function(data){
	menu.style.display = 'none';
	game.style.display = 'none';
	title.style.display = 'block';
	gameover.style.display = 'inline-block';
	
	displayWinner = true;
	winner = data.name;
	
	gameoverCanvas.drawImage(Images.gameover, 0, 0, Images.gameover.width, Images.gameover.height, 0, 0, 
			Images.gameover.width, Images.gameover.height);
	
	for(var i = 0; i < 8; ++i){
		chatBox.innerHTML += '<br>';
	}
});

function mainMenu(){
	menu.style.display = 'inline-block';
	game.style.display = 'none';
	gameover.style.display = 'none';
	buttonSnd.play();
	winMusic.pause();
	winMusic.currentTime = 0;
	loseMusic.pause();
	loseMusic.currentTime = 0;
	musicPlay = false;
	mainPlay = true;
	displayWinner = false;
	musicTime = 0;
}

//Audio messages
socket.on('Power Up', function(data){
	powerupSnd.play();
});

socket.on('Bullet Power Up', function(data){
	bulletPowerupSnd.play();
});

socket.on('Countdown', function(data){
	countdownSnd.play();
});

socket.on('Countdown2', function(data){
	countdown2Snd.play();
});

socket.on('Fight', function(data){
	startSnd.play();
});

socket.on('Fire', function(data){
	fireSnd.play();
});

socket.on('Hit', function(data){
	hitSnd.play();
});

socket.on('Health', function(data){
	healthSnd.play();
});

socket.on('Death', function(data){
	deathSnd.play();
});

socket.on('Teleport', function(data){
	teleportSnd.play();
});

socket.on('Receive', function(data){
	receiveSnd.play();
});

socket.on('Play Music', function(data){
	gameMusic.play();
});

socket.on('Stop Music', function(data){
	gameMusic.pause();
	gameMusic.currentTime = 0;
});

socket.on('Winner Music', function(data){
	musicPlay = true;
	winMusic.play();
});

socket.on('Loser Music', function(data){
	musicPlay = true;
	loseMusic.play();
});

//Set interval in charge of playing the game over and main menu music.
var displayNow = true;
setInterval(function(){
	if(musicPlay){
		if(musicTime < 150){
			++musicTime;
		}else{
			loseMusic.pause();
			loseMusic.currentTime = 0;
			winMusic.pause();
			winMusic.currentTime = 0;
		}
	}
	
	if(mainPlay){
		if(mainTime < 181){
			++mainTime;
		}else{
			menuMusic.currentTime = 0;
			menuMusic.play();
			mainTime = 0;
		}
	}
}, 1000);

//Set interval that animates different screens, such as game over screen and battle rift title flash.
setInterval(function(){
	if(atMenu){
		title.style.color = '#c123de';
		atMenu = false;
	}else{
		title.style.color = '#ffffff';
		atMenu = true;
	}
	
	if(displayWinner && displayNow){
		gameoverCanvas.drawImage(Images.gameover, 0, 0, Images.gameover.width, Images.gameover.height, 0, 0, 
			Images.gameover.width, Images.gameover.height);	
			
		gameoverCanvas.font="800 90px arcade";
		gameoverCanvas.textAlign = "center";
		gameoverCanvas.fillStyle = 'black';
		gameoverCanvas.fillText(winner, 500, 300);
		gameoverCanvas.fillText('wins!', 500, 450);
		displayNow = false;
	}else if(displayWinner && !displayNow){
		gameoverCanvas.drawImage(Images.gameover, 0, 0, Images.gameover.width, Images.gameover.height, 0, 0, 
			Images.gameover.width, Images.gameover.height);
		displayNow = true;
	}
}, 500);