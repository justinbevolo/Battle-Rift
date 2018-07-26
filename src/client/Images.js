var Images = {};

//Map
Images.map = new Image();
Images.map.src = '/client/img/MapPhoto2.png';
Images.walls = new Image();
Images.walls.src = '/client/img/walls.png';

//GameOver
Images.gameover = new Image();
Images.gameover.src = '/client/img/GameOver.png';

//Rules
Images.rules = new Image();
Images.rules.src = '/client/img/Rules.png';

//Controls
Images.controls = new Image();
Images.controls.src = '/client/img/Controls.png';

//Standard Character Models
Images.modelOne = new Image();
Images.modelOne.src = '/client/img/RedUFO2.png';
Images.modelOne2 = new Image();
Images.modelOne2.src = '/client/img/RedUFO3.png';
Images.modelTwo = new Image();
Images.modelTwo.src = '/client/img/BlueUFO2.png';
Images.modelTwo2 = new Image();
Images.modelTwo2.src = '/client/img/BlueUFO3.png';
Images.modelThree = new Image();
Images.modelThree.src = '/client/img/GreenUFO2.png';
Images.modelThree2 = new Image();
Images.modelThree2.src = '/client/img/GreenUFO3.png';
Images.modelFour = new Image();
Images.modelFour.src = '/client/img/PurpleUFO2.png';
Images.modelFour2 = new Image();
Images.modelFour2.src = '/client/img/PurpleUFO3.png';

//Powered up character models
Images.modelOneP = new Image();
Images.modelOneP.src = '/client/img/RedPower.png';
Images.modelTwoP = new Image();
Images.modelTwoP.src = '/client/img/BluePower.png';
Images.modelThreeP = new Image();
Images.modelThreeP.src = '/client/img/GreenPower.png';
Images.modelFourP = new Image();
Images.modelFourP.src = '/client/img/PurplePower.png';

Images.modelOneP2 = new Image();
Images.modelOneP2.src = '/client/img/RedPower3.png';
Images.modelTwoP2 = new Image();
Images.modelTwoP2.src = '/client/img/BluePower3.png';
Images.modelThreeP2 = new Image();
Images.modelThreeP2.src = '/client/img/GreenPower3.png';
Images.modelFourP2 = new Image();
Images.modelFourP2.src = '/client/img/PurplePower3.png';

//Powerup up backgrounds
Images.a_speed = new Image();
Images.a_speed.src = '/client/img/AttackBG.png';
Images.m_speed = new Image();
Images.m_speed.src = '/client/img/MovementBG.png';
Images.a_damage = new Image();
Images.a_damage.src = '/client/img/DamageBG.png';
Images.god_mode = new Image();
Images.god_mode.src = '/client/img/GodModeBG.png';

//Bullet models
Images.bulletOne = new Image();
Images.bulletOne.src = '/client/img/RedBullet.png';
Images.bulletTwo = new Image();
Images.bulletTwo.src = '/client/img/BlueBullet.png';
Images.bulletThree = new Image();
Images.bulletThree.src = '/client/img/GreenBullet.png';
Images.bulletFour = new Image();
Images.bulletFour.src = '/client/img/PurpleBullet.png';

//Bullet power models
Images.triShot = new Image();
Images.triShot.src = '/client/img/TriShot.png';
Images.quadShot = new Image();
Images.quadShot.src = '/client/img/QuadShot.png';

Images.bulletPowerRed = new Image();
Images.bulletPowerRed.src = '/client/img/RedBulletPower.png';
Images.bulletPowerBlue = new Image();
Images.bulletPowerBlue.src = '/client/img/BlueBulletPower.png';
Images.bulletPowerGreen = new Image();
Images.bulletPowerGreen.src = '/client/img/GreenBulletPower.png';
Images.bulletPowerPurple = new Image();
Images.bulletPowerPurple.src = '/client/img/PurpleBulletPower.png';

//Power up models
Images.powerupOne = new Image();
Images.powerupOne.src = '/client/img/Movement.png';
Images.powerupTwo = new Image();
Images.powerupTwo.src = '/client/img/Attack.png';
Images.powerupThree = new Image();
Images.powerupThree.src = '/client/img/Damage.png';
Images.powerupFour = new Image();
Images.powerupFour.src = '/client/img/GodMode.png';

//Health packs
Images.healthPack = new Image();
Images.healthPack.src = '/client/img/HealthPack.png';

//Health Bars
Images.health10 = new Image();
Images.health10.src = '/client/img/health10.png';
Images.health9 = new Image();
Images.health9.src = '/client/img/health9.png';
Images.health8 = new Image();
Images.health8.src = '/client/img/health8.png';
Images.health7 = new Image();
Images.health7.src = '/client/img/health7.png';
Images.health6 = new Image();
Images.health6.src = '/client/img/health6.png';
Images.health5 = new Image();
Images.health5.src = '/client/img/health5.png';
Images.health4 = new Image();
Images.health4.src = '/client/img/health4.png';
Images.health3 = new Image();
Images.health3.src = '/client/img/health3.png';
Images.health2 = new Image();
Images.health2.src = '/client/img/health2.png';
Images.health1 = new Image();
Images.health1.src = '/client/img/health1.png';

//Teleport Bars
Images.teleport10 = new Image();
Images.teleport10.src = '/client/img/teleport10.png';
Images.teleport9 = new Image();
Images.teleport9.src = '/client/img/teleport9.png';
Images.teleport8 = new Image();
Images.teleport8.src = '/client/img/teleport8.png';
Images.teleport7 = new Image();
Images.teleport7.src = '/client/img/teleport7.png';
Images.teleport6 = new Image();
Images.teleport6.src = '/client/img/teleport6.png';
Images.teleport5 = new Image();
Images.teleport5.src = '/client/img/teleport5.png';
Images.teleport4 = new Image();
Images.teleport4.src = '/client/img/teleport4.png';
Images.teleport3 = new Image();
Images.teleport3.src = '/client/img/teleport3.png';
Images.teleport2 = new Image();
Images.teleport2.src = '/client/img/teleport2.png';
Images.teleport1 = new Image();
Images.teleport1.src = '/client/img/teleport1.png';
Images.teleport0 = new Image();
Images.teleport0.src = '/client/img/teleport1.png';

//Audios
var powerupSnd = new Audio('/client/audio/powerup.wav');
var bulletPowerupSnd = new Audio('/client/audio/bulletpowerup.wav');
var countdownSnd = new Audio('/client/audio/countdown.wav');
var countdown2Snd = new Audio('/client/audio/countdown2.wav');
var startSnd = new Audio('/client/audio/start.wav');
var fireSnd = new Audio('/client/audio/fire.wav');
var hitSnd = new Audio('/client/audio/hit.wav');
var healthSnd = new Audio('/client/audio/health.wav');
var deathSnd = new Audio('/client/audio/dead.wav');
var buttonSnd = new Audio('/client/audio/button.wav');
var teleportSnd = new Audio('/client/audio/teleport.wav');
var enterSnd = new Audio('/client/audio/entergame.wav');
var sendSnd = new Audio('/client/audio/send.wav');
var receiveSnd = new Audio('/client/audio/receive.wav');
var gameMusic = new Audio('/client/audio/music.mp3');
var winMusic = new Audio('/client/audio/winner.mp3');
var loseMusic = new Audio('/client/audio/loser.mp3');
var menuMusic = new Audio('/client/audio/menu.mp3');