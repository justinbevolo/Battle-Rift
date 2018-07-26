//Server.js

/* GLOBAL VARIABLES */
var idCountSocket = 0;
var readyPlayers = 0;
var bulletCount = 0;
var bulletPowerCount = 0;
var Sockets = {};
var SpectatorsPlayers = {};	//Holds list of all spectators and players, so that people at main menu aren't sent to game over state when game ends.
var powerup;
var healthOne;
var healthTwo;
var playerIDStack = [3,2,1,0];
var allPlayers = new Map();
var allBullets = new Map();
var allBulletPowers = new Map();
//Times used to update cooldowns
var LOOP_TIME = 40;
var SHOOT_FRAME = 10;
var POWERUP_FRAME = 250;
var TELEPORT_FRAME = 10;
var countdown_time = 25;
var countdown = false;
var gameStart = false;
var gameOver = false;
var suddenDeath = false;
var winner = '';
var winnerID = -1;
var SONG_FRAME = 221000; //length of the game music
var music = 221000;

/* WEBSOCKET STUFF */
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(13381);
console.log("Server started. . .");

/* PLAYERS */
var Player = function(socketid, playerid, name){
	var player = {};
	player.id = socketid;
	player.player_id = playerid;
	//Get the correct spawn point based on the player's id
	player.position = getSpawnPoint(player.player_id);
	player.name = name;
	player.space = false;
	player.up = false;
	player.down = false;
	player.left = false;
	player.right = false;
	player.shootCooldown = SHOOT_FRAME;
	player.teleportCooldown = 10;
	player.attackSpeed = 1;
	player.click = 0;
	player.speed = 7.5;
	player.x_velocity = 0;
	player.y_velocity = 0;
	player.health = 10;
	player.damage = 1;
	player.fireType = 0;
	player.fireTypeCooldown = 5;
	//frame is 0 or 1, updated each second.
	player.frame = 0;
	player.remove = false;
	player.poweredUp = false;
	player.ready = false;
	
	//This function updates a players position on the map depending on the keys they are pressing
	player.updatePlayer = function(){
		if(player.right && player.position.x < (1000 - (75/2)) && !playerMapCollision(player.position.x, player.position.y, 'right'))
			player.x_velocity = player.speed;
		else if(player.left && player.position.x > (75/2) && !playerMapCollision(player.position.x, player.position.y, 'left'))
			player.x_velocity = -player.speed;
		else
			player.x_velocity = 0;
		
		if(player.up && player.position.y > (75/2) && !playerMapCollision(player.position.x, player.position.y, 'up'))
			player.y_velocity = -player.speed;
		else if(player.down && player.position.y < (600 - 75/2) && !playerMapCollision(player.position.x, player.position.y, 'down'))
			player.y_velocity = player.speed;
		else
			player.y_velocity = 0;
		
		//Only allow a player to teleport if the teleport is not on cooldown.
		if(player.space && player.teleportCooldown >= 10){
			console.log("Player " + name + ": teleported (" + timerVal + ').');
			player.teleportCooldown = 0;
			player.position = getTeleportPosition(Math.floor(Math.random() * 24));
			for(var i in SpectatorsPlayers){
				SpectatorsPlayers[i].emit('Teleport', true);
			}	
		}
			
		//After changing the state of the player update their x and y values.
		player.updatePosition();
		
		//Allow a player to shoot if they are clicking and their shoot is not on cooldown
		if(player.click.state !== undefined && player.click.state && player.shootCooldown >= SHOOT_FRAME){
			player.fireWeapon();
			for(var i in SpectatorsPlayers){
				SpectatorsPlayers[i].emit('Fire', true);
			}
		}
	}
	
	//Updates a players positin based on the x and y velocity created from pressing keys.
	player.updatePosition = function(){
		player.position.x += player.x_velocity;
		player.position.y += player.y_velocity;
	}
	
	//Creates a bullet fired in the direction of the mouse click
	player.fireWeapon = function(){
		//Create the bullets for fireType 1: bullets in 4 directions plus following mouse
		if(player.fireType == 1){	
			player.shootCooldown = 0;
			var direction1 = {
				x_bullet: player.click.x,
				y_bullet: player.click.y,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction2 = {
				x_bullet: player.position.x,
				y_bullet: player.position.y - 10,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction3 = {
				x_bullet: player.position.x,
				y_bullet: player.position.y + 10,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction4 = {
				x_bullet: player.position.x - 10,
				y_bullet: player.position.y,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction5 = {
				x_bullet: player.position.x + 10,
				y_bullet: player.position.y,
				y_player: player.position.y,
				x_player: player.position.x
			};
			//Bullet stores the player's id, the bulletcount, the socket id, and the direction it needs to travel.
			var bullet1 = Bullet(player.player_id, bulletCount, player.id, direction1);
			++bulletCount;
			var bullet2 = Bullet(player.player_id, bulletCount, player.id, direction2);
			++bulletCount;
			var bullet3 = Bullet(player.player_id, bulletCount, player.id, direction3);
			++bulletCount;
			var bullet4 = Bullet(player.player_id, bulletCount, player.id, direction4);
			++bulletCount;
			var bullet5 = Bullet(player.player_id, bulletCount, player.id, direction5);
			++bulletCount;
			bullet1.damage = player.damage;
			bullet1.position.x = player.position.x;
			bullet1.position.y = player.position.y;
			bullet2.damage = player.damage;
			bullet2.position.x = player.position.x;
			bullet2.position.y = player.position.y;
			bullet3.damage = player.damage;
			bullet3.position.x = player.position.x;
			bullet3.position.y = player.position.y;
			bullet4.damage = player.damage;
			bullet4.position.x = player.position.x;
			bullet4.position.y = player.position.y;
			bullet5.damage = player.damage;
			bullet5.position.x = player.position.x;
			bullet5.position.y = player.position.y;
		//Bullets for fireType 0: standard firing type
		}else if(player.fireType == 0){
			player.shootCooldown = 0;
			var direction = {
				x_bullet: player.click.x,
				y_bullet: player.click.y,
				y_player: player.position.y,
				x_player: player.position.x
			};
			
			var bullet = Bullet(player.player_id, bulletCount, player.id, direction);
			++bulletCount;
			bullet.damage = player.damage;
			bullet.position.x = player.position.x;
			bullet.position.y = player.position.y;
		//Bullets for fireType 2: 3 shot cone in towards cursor
		}else{
			player.shootCooldown = 0;
			var direction1 = {
				x_bullet: player.click.x - 50,
				y_bullet: player.click.y + 50,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction2 = {
				x_bullet: player.click.x + 50,
				y_bullet: player.click.y - 50,
				y_player: player.position.y,
				x_player: player.position.x
			};
			var direction3 = {
				x_bullet: player.click.x,
				y_bullet: player.click.y,
				y_player: player.position.y,
				x_player: player.position.x
			};
			//Bullet stores the player's id, the bulletcount, the socket id, and the direction it needs to travel.
			var bullet1 = Bullet(player.player_id, bulletCount, player.id, direction1);
			++bulletCount;
			var bullet2 = Bullet(player.player_id, bulletCount, player.id, direction2);
			++bulletCount;
			var bullet3 = Bullet(player.player_id, bulletCount, player.id, direction3);
			++bulletCount;
			bullet1.damage = player.damage;
			bullet1.position.x = player.position.x;
			bullet1.position.y = player.position.y;
			bullet2.damage = player.damage;
			bullet2.position.x = player.position.x;
			bullet2.position.y = player.position.y;
			bullet3.damage = player.damage;
			bullet3.position.x = player.position.x;
			bullet3.position.y = player.position.y;
		}
	}
	
	//Increment the shoot cooldown by player's attack speed. Attack speed can be changed by powerups
	player.incShootCooldown = function(){
		player.shootCooldown = player.shootCooldown + player.attackSpeed;
	}
	
	allPlayers.set(player.id, player);

	return player;
};

/* BULLETS */
var Bullet = function(id, bulletID, socketid, direction){
	var bullet = {};
	bullet.position = {
		x: 0,
		y: 0
	};
	bullet.owner = id;
	bullet.id = bulletID;
	bullet.socketid = socketid;
	bullet.direction = direction;
	bullet.x_velocity = 0;
	bullet.y_velocity = 0;
	bullet.bulletSpeed = 20;
	bullet.remove = false;
	bullet.damage = 0;
	
	allBullets.set(bullet.id, bullet);
	return bullet;
}

//Update the position of all bullets.
Bullet.updateBullets = function(){
	var arrayBullets = [];
	
	for(bullet of allBullets.values()){
		//Remove the bullet if its position is off of the map.
		if(bullet.position.x > 1000 || bullet.position.x < 0 || bullet.position.y < 0 || bullet.position.y > 600)
			bullet.remove = true;
		
		//Use maths to find magnitude of the bullet.
		var x_direction = (bullet.direction.x_bullet - bullet.direction.x_player);
		var y_direction = (bullet.direction.y_bullet - bullet.direction.y_player);
		var magnitude = Math.sqrt(x_direction*x_direction + y_direction*y_direction);
	
		bullet.x_velocity = (x_direction/magnitude)*bullet.bulletSpeed;
		bullet.y_velocity = (y_direction/magnitude)*bullet.bulletSpeed;
	
		bullet.position.x += bullet.x_velocity;
		bullet.position.y += bullet.y_velocity;
		
		arrayBullets.push({
			x: bullet.position.x,
			y: bullet.position.y,
			owner: bullet.owner
		});
	}
	
	//Return an array of all updated bullets.
	return arrayBullets;
}

//Call updatePlayers function, and return an array of all the necessary player states.
Player.updatePlayers = function(){
	var arrayPlayers = [];
	for(player of allPlayers.values()){
		player.updatePlayer();
		arrayPlayers.push({
			x: player.position.x,
			y: player.position.y,
			id: player.player_id,
			powered: player.poweredUp,
			bulletPower: player.fireTypeCooldown,
			health: player.health,
			teleport: player.teleportCooldown,
			name: player.name,
			frame: player.frame
		});
	}
	
	return arrayPlayers;
}

/* POWERUP */
var Powerup = function(){
	var powerup = {};
	powerup.position = {
		x: 500,
		y: 300
	};
	//Booleans to determine the type of power up.
	powerup.a_speed = false;
	powerup.m_speed = false;
	powerup.a_damage = false;
	powerup.god_mode = false;
	
	//display variable used to determine if a powerup should be on the map
	powerup.display = 10000;
	
	//Get a random number 0-9, if 0-2 power up is movement speed, 3-5 attack speed, 6-8 attack damage, 9 god mode
	var type = Math.floor(Math.random() * 10);
	console.log('Powerup type ' + type + ' spawned.');
	switch(type){
		case 0:
		case 1:
		case 2:
			powerup.m_speed = true;
			break;
		case 3:
		case 4:
		case 5:
			powerup.a_speed = true;
			break;
		case 6:
		case 7:
		case 8:
			powerup.a_damage = true;
			break;
		case 9:
			powerup.god_mode = true;
			break;
	}
	
	return powerup;
}

//Create the initial powerup
powerup = Powerup();

/* HEALTH */
//Health pack class, uses id to determine location on map
var Health = function(id){
	var health = {};
	health.position = {
		x: 0,
		y: 300
	};
	//Display used to determine if healthpack should be displayed on the screen
	health.display = 7;
	
	if(id === 1)
		health.position.x = 215;
	else
		health.position.x = 785;		

	return health;
}

//Create the two initial health packs
healthOne = Health(1);
healthTwo = Health(2);

/* BULLET POWERUPS */
var BulletPower = function(id){
	var power = {};
	power.id = id;
	power.position = getTeleportPosition(Math.floor(Math.random() * 23));
	power.type = Math.floor(Math.random() * 2) + 1;
	power.remove = false;
	
	return power;
}

//To be called on player creation.
playerConnect = function(socket, data, id){
	//Give the player a unique ID here.
	var player = Player(socket.id, id, data.name);
	console.log(player.id + ': ' + data.name + ' joined.');

	//Print to chat that a player has joined
	for(var i in Sockets){
		Sockets[i].emit('Server Message', 'Server: ' + player.name + ' has joined the game.');
	}
	
	//Print to chat that the player should ready up when ready
	socket.emit('Server Message', 'Server: ' + player.name + ' press READY UP when you are ready to begin!');
	
	//Only perform the following updates if the game has started.
	
	//Update state message received from client, update the appropriate state.
	socket.on('Update State', function(data){
		if(gameStart){
			if(data.direction === 'left')
				player.left = data.state;
			else if(data.direction === 'up')
				player.up = data.state;
			else if(data.direction === 'down')
				player.down = data.state;
			else if(data.direction === 'right')
				player.right = data.state;
			else if(data.direction === 'space'){
				player.space = data.state;
			}
		}
	});
	
	//Mouse message received from client, set click.
	socket.on('Mouse', function(data){
		if(gameStart){	
			player.click = data;
		}
	});
	
	//Mouse moved, set move.
	socket.on('Mouse Move', function(data){
		if(gameStart){
			player.click.x = data.x;
			player.click.y = data.y;
		}
	});
}

/* MESSAGES */
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	console.log('user ' + idCountSocket + ' has connected');
	//Keep track of the socket ID's
	socket.id = idCountSocket;
	++idCountSocket;
	Sockets[socket.id] = socket;
	
	//Message received that user pressed play.
	socket.on('Pressed Play', function(data){
		//Add user to game if player id count is less than 4, the game hasnt started, and countdown hasnt started.
		if(playerIDStack.length > 0 && !gameStart && !countdown){
			var id = playerIDStack.pop();
			SpectatorsPlayers[socket.id] = socket;
			playerConnect(socket, data, id);
			socket.emit('Signed In', {id: id});
		}else if(playerIDStack.length === 0){
			SpectatorsPlayers[socket.id] = socket;
			socket.emit('Not Signed In', 'game full');
		}else if(gameStart || countdown){
			SpectatorsPlayers[socket.id] = socket;
			socket.emit('Not Signed In', 'game in progress');
		}
	});
	
	//When a player presses spectate add them as a spectator.
	socket.on('Pressed Spectate', function(data){
		SpectatorsPlayers[socket.id] = socket;
		socket.emit('Not Signed In', 'spectator');
	});
	
	//When a player readys up increment total ready count, emit appropriate messages to the chat box
	socket.on('Ready Up', function(data){
		console.log("User " + socket.id + " is ready.");
		if(allPlayers.get(socket.id)){
			for(var i in Sockets){
				Sockets[i].emit('Server Message', 'Server: ' + allPlayers.get(socket.id).name + ' is ready to battle!');
				if(allPlayers.size === 1)
					Sockets[i].emit('Server Message', 'Server: Waiting for more players to enter the rift!');
						
			}
		}
		++readyPlayers;
		allPlayers.get(socket.id).ready = true;
		if(readyPlayers > 1 && readyPlayers === allPlayers.size){
			for(var i in Sockets){
				Sockets[i].emit('Server Message', 'Server: All players ready, prepare for battle!');
			}
			countdown = true;
		}else if(allPlayers.size > 1){
			for(var i in Sockets){
				Sockets[i].emit('Server Message', 'Server: Waiting for all players to READY UP!');
			}
		}
	});
	
	//When someone enters new message to chatbox, update the chat box.
	socket.on('Message', function(data){
		var message = data.name + ': ' + data.message;
		for(var i in SpectatorsPlayers){
			if(SpectatorsPlayers[i] !== SpectatorsPlayers[socket.id])
				SpectatorsPlayers[i].emit('Receive', true);
			
			if(allPlayers.get(socket.id) !== undefined)
				SpectatorsPlayers[i].emit('New Message', {message: message, id: allPlayers.get(socket.id).player_id});
			else
				SpectatorsPlayers[i].emit('New Message', {message: message, id: 10});
		}
	});
	
	socket.on('Menu from Game', function(data){
		var player = allPlayers.get(socket.id)
		if(player){
			if(player.ready){
				player.ready = false;
				--readyPlayers;
			}
			playerIDStack.push(player.player_id);
		}
		delete SpectatorsPlayers[socket.id];
		allPlayers.delete(socket.id);
	});
		
	socket.on('disconnect', function(){
		console.log("User " + socket.id + " disconnected.");
		var player = allPlayers.get(socket.id);
		if(player){
			if(player.ready){
				player.ready = false;
				--readyPlayers;
			}
			playerIDStack.push(player.player_id);
		}
		delete Sockets[socket.id];
		delete SpectatorsPlayers[socket.id];
		allPlayers.delete(socket.id);
	});
});

/* GAME FUNCTIONS */
//Countdown timer
var timer = 4;
//Main set interval, 25 frames per second.
setInterval(function(){
	var playerArray = [];
	var bulletArray = [];
		
	//If there only remains one player, the game is over. Store name of winner.
	if(allPlayers.size === 1 && gameStart){
		for(player of allPlayers.values()){
			winner = player.name;
			winnerID = player.id;
			console.log('Winner id: ' + winnerID);
			SpectatorsPlayers[player.id].emit('Winner Music', true);
		}
		gameOver = true;
	}
	
	//If gameOver is true, set up game over.
	if(gameOver){
		setUpGameOver();
	}
	
	//If countdown is true, decrement the countdown once every second.
	if(countdown){
		if(countdown_time < 25){
			++countdown_time;
		}else{
			countdown_time = 0;
			//If-else-if to determine which sound to play at different countdown times.
			if(timer <= 4 && timer >= 2){
				for(var i in SpectatorsPlayers){
					SpectatorsPlayers[i].emit('Countdown', true);
				}
			}else if(timer === 1){
				for(var i in SpectatorsPlayers){
					SpectatorsPlayers[i].emit('Fight', true);
				}
			}
			--timer;
			//Once timer reaches -1 set countdown to false and game start to true.
			if(timer === -1){
				countdown = false;
				gameStart = true;
			}
		}
	}
	
	if(gameStart && !countdown){
		if(music < SONG_FRAME){
			music += .04;
		}else{
			music = 0;
			for(var i in SpectatorsPlayers){
				SpectatorsPlayers[i].emit('Play Music', true);
			}
		}
	}
	
	//If the game timer reaches 0 and game hasnt ended then set up sudden death.
	if(timerVal === 0){
		setUpSuddenDeath();
	}
	
	//Increment all player shoot cooldowns and teleport cooldowns.
	for(player of allPlayers.values()){
		if(player.shootCooldown < SHOOT_FRAME){
			player.incShootCooldown();
		}
	}
	
	//Check collisions of bullet with map and players.
	checkBulletCollisions();
	
	if(gameStart && !countdown && !suddenDeath){
		generateBulletPower(Math.floor(Math.random() * 250));
		checkBulletPowerCollisions();
		removeBulletPowers();
	}
	
	//Check states of allplayers firetype, if they  have had buff for 5 seconds remove buff.
	for(player of allPlayers.values()){
		if(player.fireTypeCooldown < 5){
			player.fireTypeCooldown += .04;
		}else{
			player.fireType = 0;
			player.fireTypeCooldown = 5;
		}
	}
		
	//Check if any players have collided with pickups
	powerupCollisions();
	
	//Update power up cooldowns.
	if(powerup.display < POWERUP_FRAME && powerup.display !== 10000){
		++powerup.display;
		if(powerup.display === POWERUP_FRAME){
			console.log('Powerup displayed on screen (' + timerVal + ').');
			displayNewPowerup();
		}
	}
	
	//Remove all bullets where remove is set to true.
	removeBullets();
	
	//Remove all players with remove set to true.
	removePlayer();
	
	//Update all the players and all the bullets that have not been removed.
	playerArray = Player.updatePlayers();
	bulletArray = Bullet.updateBullets();
	bulletPowerArray = getBulletPowerArray();
	
	//create dictionary of all the necessary states to properly update game in browser.
	var states = {
		players: playerArray,
		bullets: bulletArray,
		powers: bulletPowerArray,
		powerup,
		healthOne,
		healthTwo,
		timer,
		gameclock: timerVal
	};
	
	//If the game is not over emit the states to all users connected.
	if(!gameOver){
		for(var i in Sockets){
			var socket = Sockets[i];
			socket.emit('States', states);
		}
	}
}, LOOP_TIME);

var firstPowerup = Math.floor(Math.random() * 6) + 1;
//In-game Timer, starts at 60 goes to 0 once a second
var timerVal = 60;
var spawnTime = timerVal - firstPowerup;
setInterval(function(){
	if(gameStart){
		--timerVal;
	}
	
	if(healthOne.display < 7 && healthOne.display !== 10000){
		++healthOne.display;
	}
	
	if(healthTwo.display < 7 && healthTwo.display !== 10000){
		++healthTwo.display;
	}
	
	if(timerVal === spawnTime){
		console.log('Powerup displayed on screen (' + timerVal + ').');
		powerup.display = POWERUP_FRAME;
	}
	
	if(timerVal === 10 || timerVal === 5){
		for(var i in SpectatorsPlayers){
			SpectatorsPlayers[i].emit('Countdown2', true);
		}
	}
	
	if(readyPlayers > 1 && !gameStart && readyPlayers === allPlayers.size && !countdown){
		if(readyPlayers > 1 && readyPlayers === allPlayers.size){
			for(var i in Sockets){
				Sockets[i].emit('Server Message', 'Server: All players ready, prepare for battle!');
			}
			countdown = true;
		}else if(allPlayers.size > 1){
			for(var i in Sockets){
				Sockets[i].emit('Server Message', 'Server: Waiting for all players to READY UP!');
			}
		}
	}
	
	for(player of allPlayers.values()){
		if(player.teleportCooldown < 10)
			player.teleportCooldown += 1;
		if(player.frame === 0)
			player.frame = 1;
		else
			player.frame = 0;
	}
}, 1000);

//Check if a bullets remove is set to true (collision with map or player), if so delete.
function removeBullets(){
	for(bullet of allBullets.values()){
		if(bullet.remove){
			allBullets.delete(bullet.id);
		}
	}	
}

//Check if a player remove is set to true (health is less than or equal to 0), if so delete.
function removePlayer(){
	for(player of allPlayers.values()){
		if(player.remove){
			allPlayers.delete(player.id);
		}
	}
}

//Return true or false if distance between player and an object is less than 50
function distanceBetween(player, object){
	var player_x = player.position.x;
	var	player_y = player.position.y;
	var object_x = object.position.x;
	var object_y = object.position.y;
	var dx = player_x - object_x;
	var dy = player_y - object_y;
	
	return (Math.sqrt(dx*dx + dy*dy) <= 50);
}

//Check bullet and player collisions
function checkBulletCollisions(){
	for(bullet of allBullets.values()){
		//first check if a bullet has collided with the map, if yes set remove to true.
		if(mapCollision(bullet.position.x, bullet.position.y)){
			bullet.remove = true;
		}else{
			//For every player check to see if bullet owner and player id are equal (bullet belongs to that player)
			//If so continue to next iteration.
			for(player of allPlayers.values()){
				if(player.player_id === bullet.owner)
					continue;
				
				var collision = false;
				//If distanceBetween player and bullet is less than 50 set collision to true.
				if(distanceBetween(player, bullet)){
					collision = true;
				}else{
					collision = false;
				}
				//When collision is true, emit appropriate sounds to the two users involved.
				//Decrement players health by 1, set remove to true if they are <= 0 health. Set bullet remove to true.
				if(collision){
					SpectatorsPlayers[player.id].emit('Hit', true);
					SpectatorsPlayers[bullet.socketid].emit('Hit', true);
					player.health -= bullet.damage;
					if(player.health <= 0){
						player.remove = true;
						for(var i in SpectatorsPlayers){
							SpectatorsPlayers[i].emit('Death', true);
						}
					}
					bullet.remove = true;
				}		
			}
		}
	}
}

//Takes a random number between 0-124, if the number is 124 generate a powerup for the map. (Happens ~1 time every 5 seconds)
function generateBulletPower(num){
	if(num == 249 && allBulletPowers.size < 3){
		var power = BulletPower(bulletPowerCount);
		++bulletPowerCount;
		allBulletPowers.set(power.id, power);
	}
}

//Check if a player collides with a bullet powerup, if a player does collide with powerup
//Make state changes to the player, remove bullet powerup
function checkBulletPowerCollisions(){
	for(player of allPlayers.values()){
		for(power of allBulletPowers.values()){
			if(distanceBetween(player, power)){
				power.remove = true;
				player.fireType = power.type;
				console.log(power.type);
				player.fireTypeCooldown = 0;
				for(var i in SpectatorsPlayers){
					SpectatorsPlayers[i].emit('Bullet Power Up', true);
				}
			}
		}
	}
}

//Remove all bullet powerups that a player has collided with.
function removeBulletPowers(){
	for(power of allBulletPowers.values()){
		if(power.remove){
			allBulletPowers.delete(power.id);
		}
	}
}

//Get an array of data that clients need
function getBulletPowerArray(){
	var bulletPowers = [];
	for(power of allBulletPowers.values()){
		bulletPowers.push({
			x: power.position.x,
			y: power.position.y,
			type: power.type
		});
	}
	
	return bulletPowers;
}
			
//Check if an object collided with a map obstacle, x and y are the pixels of obstacles on the map.
//Return true if collision false if no collision
function mapCollision(x, y){
	if((x >= 490 && x <= 510) && ((y >= 490 && y <= 600) || (y >= 0 && y <= 110)))
		return true;
	else if((x >= 110 && x <= 320) && ((y >= 140 && y <= 160) || (y >= 440 && y <= 460)))
		return true;
	else if((x >= 680 && x <= 890) && ((y >= 440 && y <= 460) || (y >= 140 && y <= 160)))
		return true;
	else if((y >= 290 && y <= 310) && ((x >= 590 && x <= 680) || (x >= 320 && x <= 410)))
		return true;
	else if((y >= 290 && y <= 310) && ((x >= 0 && x <= 110) || (x >= 890 && x <= 1000)))
		return true;
	else if((y >= 250 && y <= 350) && ((x >= 410 && x <= 430) || (x >= 570 && x <= 590)))
		return true;
	else
		return false;
}

//Check if a player is colliding with an obstacle. Check collisions based on direction
//The character is moving. Return true if collision false if no collision
//Compares players (x,y) with obstacles (x,y)'s
function playerMapCollision(x, y, direction){
	switch(direction){
		case 'right':
			if((y >= 117 && y <= 183) && ((x >= 77 && x <= 87) || (x >= 647 && x <= 657))){
				return true;
			}else if((y >= 0 && y <= 133) && (x >= 457 && x <= 467)){
				return true;
			}else if((y >= 417 && y <= 483) && ((x >= 77 && x <= 87) || (x >= 647 && x <= 657))){
				return true;
			}else if((y >= 267 && y <= 333) && ((x >= 857 && x <= 867) || (x >= 287 && x <= 297))){
				return true;
			}else if((y >= 227 && y <= 373) && ((x >= 377 && x <= 387) || (x >= 537 && x <= 547))){
				return true;
			}else if((y >= 467 && y <= 600) && (x >= 457 && x <= 467)){
				return true;
			}else{
				return false;
			}
			break;
		case 'down':
			if(((x >= 0 && x <= 133) || (x >= 867 && x <= 1000) || (x >= 297 && x <= 433) || (x >= 590 && x <= 703)) && (y >= 257 && y <= 267)){
				return true;
			}else if(((x >= 87 && x <= 343) || (x >= 657 && x <= 913)) && (y >= 107 && y <= 117)){
				return true;
			}else if(((x >= 87 && x <= 343) || (x >= 657 && x <= 913)) && (y >= 407 && y <= 417)){
				return true;
			}else if(((x >= 397 && x <= 453) || (x >= 547 && x <= 613)) && (y >= 217 && y <= 227)){
				return true;
			}else if((y >= 457 && y <= 467) && (x >= 467 && x <= 533)){
				return true;
			}else{
				return false;
			}
			break;
		case 'up':
			if(((x >= 0 && x <= 133) || (x >= 867 && x <= 1000) || (x >= 297 && x <= 433) || (x >= 590 && x <= 703)) && (y >= 333 && y <= 343)){
				return true;
			}else if(((x >= 87 && x <= 343) || (x >= 657 && x <= 913)) && (y >= 183 && y <= 193)){
				return true;
			}else if(((x >= 87 && x <= 343) || (x >= 657 && x <= 913)) && (y >= 483 && y <= 493)){
				return true;
			}else if(((x >= 397 && x <= 453) || (x >= 547 && x <= 613)) && (y >= 373 && y <= 383)){
				return true;
			}else if((y >= 133 && y <= 143) && (x >= 467 && x <= 533)){
				return true;
			}else{
				return false;
			}
			break;
		case 'left':
			if((y >= 117 && y <= 183) && ((x >= 343 && x <= 353) || (x >=913 && x <= 923))){
				return true;
			}else if((y >= 0 && y <= 133) && (x >= 533 && x <= 543)){
				return true;
			}else if((y >= 417 && y <= 483) && ((x >= 343 && x <= 353) || (x >= 913 && x <= 923))){
				return true;
			}else if((y >= 267 && y <= 333) && ((x >= 703 && x <= 713) || (x >= 133 && x <= 143))){
				return true;
			}else if((y >= 227 && y <= 373) && ((x >= 453 && x <= 463) || (x >= 613 && x <= 623))){
				return true;
			}else if((y >= 467 && y <= 600) && (x >= 533 && x <= 543)){
				return true;
			}else{
				return false;
			}
			break;
	}
}

//check player and powerup/health collisions
function powerupCollisions(){
	for(player of allPlayers.values()){
		//For all players check distance between player and health pack.
		if(distanceBetween(player, healthOne)){
			//If distance is less than 50, player health is <= 9 and the healthpack display is 250
			//Increment player health by 2, and if that puts the player over 10 health then put them back to 10 health.
			if(player.health <= 9){
				if(healthOne.display === 7){
					for(var i in SpectatorsPlayers){
						SpectatorsPlayers[i].emit('Health', true);
					}
					player.health += 2;
					if(player.health >= 10)
						player.health = 10;
				}
				//Set healthpack cooldown to 0
				healthOne.display = 0;
			}
		}
		//Same thing as previous health pack
		if(distanceBetween(player, healthTwo)){
			if(player.health <= 9){
				if(healthTwo.display === 7){
					for(var i in SpectatorsPlayers){
						SpectatorsPlayers[i].emit('Health', true);
					}
					player.health += 2;
					if(player.health >= 10)
						player.health = 10;
				}
				healthTwo.display = 0;
			}
		}
		//Check distance between player and powerup.
		//If less than 50 and powerup is displayed, then powerup player, set powerup display back to 0
		if(powerup != undefined && distanceBetween(player, powerup) && !player.poweredUp){
			if(powerup.display === 250)
				powerupPlayer(player, powerup);
			powerup.display = 0;
		}
	}
}

//Apply a powerup to a player
//Depending on the powerup make the appropriate state changees to the player.
function powerupPlayer(player, powerup){
	if(powerup.a_damage){
		player.poweredUp = true;
		player.damage = 2;
	}else if(powerup.m_speed){
		player.poweredUp = true;
		player.speed = 10;
	}else if(powerup.a_speed){
		player.poweredUp = true;
		player.attackSpeed = 2;
	}else if(powerup.god_mode){
		player.poweredUp = true;
		player.damage = 2;
		player.speed = 8.5;
		player.attackSpeed = 1.33;
	}
	console.log('Player ' + player.name + ': powered up (' + timerVal + ').');
	//Emit a sound effect to spectators and players.
	for(var i in SpectatorsPlayers){
		SpectatorsPlayers[i].emit('Power Up', true);
	}
}

//reset state of powered up player, display a new powerup
function displayNewPowerup(){
	//Set the state of the powered up player back to normal.
	for(player of allPlayers.values()){
		if(player.poweredUp){
			player.poweredUp = false;
			if(powerup.a_damage)
				player.damage = 1;
			else if(powerup.a_speed)
				player.attackSpeed = 1;
			else if(powerup.m_speed)
				player.speed = 7.5;
			else{
				player.damage = 1;
				player.attackSpeed = 1;
				player.speed = 7.5;
			}
			break;
		}
	}
	//Delete the powerup and spawn a new one.
	delete powerup;
	powerup = Powerup();
	powerup.display = POWERUP_FRAME;
	if(suddenDeath){
		powerup.position.x = 1500;
	}
}

//Get a players spawn point based on their player id;
function getSpawnPoint(id){
	var x;
	var y;
	switch(id){
		case 0:
			x = 40;
			y = 40;
			break;
		case 1:
			x = 960;
			y = 560;
			break;
		case 2:
			x = 40;
			y = 560;
			break;
		case 3:
			x = 960;
			y = 40;
			break;
		default:
			x = 40;
			y = 40;
			break;
	}
	var position = {
		x: x,
		y: y
	}
	return position;
}

//Set up sudden death, no powerups/healthpacks, bullets do 10 damage each.
function setUpSuddenDeath(){
	//Set all player states back to their original state.
	//Increase bullet damage from 1 to 10.
	for(player of allPlayers.values()){
		player.position = getSpawnPoint(player.player_id);
		player.shootCooldown = SHOOT_FRAME;
		player.teleportCooldown = 10;
		player.attackSpeed = 1;
		player.click = 0;
		player.speed = 7.5;
		player.x_velocity = 0;
		player.y_velocity = 0;
		player.health = 10;
		player.damage = 10;
		player.space = false;
		player.up = false;
		player.down = false;
		player.left = false;
		player.right = false;
		player.poweredUp = false;
		player.fireTypeCooldown = 5;
		player.fireType = 0;
		
		player.updatePlayer();
	}
	//Delete all the bullets and powers on the map.
	for(bullet of allBullets.values()){
		allBullets.delete(bullet.id);
	}
	
	for(power of allBulletPowers.values()){
		allBulletPowers.delete(power.id);
	}
	
	//Set powerup and health display to 10000 so that they can not be used in sudden death.
	powerup.position.x = 1500;
	healthOne.position.x = 1500;
	healthTwo.position.x = 1500;
	//restart the countdown time and set gamestart to false.
	countdown = true;
	gameStart = false;
	suddenDeath = true;
	//Set timerval to -1 so there is no timer display.
	timerVal = -1;
	//Restart the game countdown clock
	timer = 4;
	countdown_time = 0;
	console.log('Sudden death is set.');
}

//Set game over state of game
function setUpGameOver(){
	//Delete all players and bullets and powers
	for(player of allPlayers.values()){
		allPlayers.delete(player.id);
	}
	for(bullet of allBullets.values()){
		allBullets.delete(bullet.id);
	}
	
	for(power of allBulletPowers.values()){
		allBulletPowers.delete(power.id);
	}
	//Return all gamestates to false, set timer and countdown timer to original values.
	countdown = false;
	gameStart = false;
	gameOver = false;
	suddenDeath = false;
	timerVal = 60;
	timer = 4;
	
	//Restore all states so players can start a new game.
	countdown_time = 0;
	playerIDStack = [3,2,1,0];
	readyPlayers = 0;
	bulletCount = 0;
	powerup.position.x = 500;
	powerup.a_speed = false;
	powerup.m_speed = false;
	powerup.a_damage = false;
	powerup.god_mode = false;
	var type = Math.floor(Math.random() * 10);
	switch(type){
		case 0:
		case 1:
		case 2:
			powerup.m_speed = true;
			break;
		case 3:
		case 4:
		case 5:
			powerup.a_speed = true;
			break;
		case 6:
		case 7:
		case 8:
			powerup.a_damage = true;
			break;
		case 9:
			powerup.god_mode = true;
			break;
	}
	healthOne.position.x = 215;
	healthTwo.position.x = 785;
	powerup.display = 10000;
	healthOne.display = 7;
	healthTwo.display = 7;
	music = 221000;
	
	//Display the game over screen to all spectators and players.
	for(var i in SpectatorsPlayers){
		var socket = SpectatorsPlayers[i];
		socket.emit('Game Over', {name: winner});
		SpectatorsPlayers[i].emit('Stop Music', true);
		console.log('i: ' + i + ', winner id: ' + winnerID);
		if(i != winnerID){
			socket.emit('Loser Music', true);
		}
	}
	
	//Delete all spectators and players.
	for(var i in SpectatorsPlayers){
		delete SpectatorsPlayers[i];
	}
}

//Function for getting teleport location, just takes a random number and returns x, y values.
function getTeleportPosition(num){
	var x = 0;
	var y = 0;
	switch(num){
		case 0: x = 56; y = 554; break;
		case 1: x = 264; y = 541; break;
		case 2: x = 377; y = 503; break;
		case 3: x = 423; y = 411; break;
		case 4: x = 502; y = 354; break;
		case 5: x = 605; y = 434; break;
		case 6: x = 726; y = 367; break;
		case 7: x = 679; y = 539; break;
		case 8: x = 873; y = 529; break;
		case 9: x = 805; y = 244; break;
		case 10: x = 497; y = 160; break;
		case 11: x = 250; y = 300; break;
		case 12: x = 750; y = 300; break;
		case 13: x = 379; y = 61; break;
		case 14: x = 633; y = 53; break;
		case 15: x = 786; y = 79; break;
		case 16: x = 938; y = 44; break;
		case 17: x = 60; y = 61; break;
		case 18: x = 81; y = 222; break;
		case 19: x = 72; y = 376; break;
		case 20: x = 207; y = 205; break;
		case 21: x = 425; y = 158; break;
		case 22: x = 497; y = 432; break;
		case 23: x = 500; y = 300; break;
		default: x = 264; y = 541; break;
	}
	var position = {
		x: x,
		y: y
	}
	return position;
}
