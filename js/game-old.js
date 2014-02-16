/*************************************************************
				   		  TO DO

	* Look at pixi.js to optimize all of this later on..
	* Super-clear tutorial: http://jlongster.com/Making-Sprite-based-Games-with-Canvas
	
*************************************************************/

// Create the canvas

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);


// Include the images
// Background image

var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Bird Image
var birdReady = false;
var birdImage = new Image();
birdImage.onload = function () {
	birdReady = true;
}
birdImage.src = 'images/bird-test.png';

var pipes = [];
var pipeReady = false;
function Pipe (pX, pY, pW, pH, color, image_url) {
	//console.log('Pipe function called..');
	var pipeReady = false;
	this.color = color;
	this.width = pW;
	this.height = pH;
	this.pX = pX;
	this.pY = pY;
	this.is_passed = false;

	var that = this;

	this.pipe_image = new Image();
	this.pipe_image.onload=function() {
    	try {
    		pipes.push(that);
    		//console.log('tester..'+that.pipe_image+that.pX+that.pY);
        	//ctx.drawImage(that.pipe_image, that.pX, that.pY, that.width, that.height);
    	} catch(err) {
        	console.log('Onload: could not draw image '+that.url);
        	console.log(err);
    	}
	};
	this.pipe_image.src = image_url;
}

// Restart Button 
var restart_btn_width = 200;
var restart_btn_height = 100;
var restart_btn_position_x = 0;
var restart_btn_position_y = 0;
var restart_btn_ready = false;
var restart_btn = new Image();
restart_btn.onload = function () {
	restart_btn_ready = true;
}
restart_btn.src = 'images/restart-btn.png';


// Game objects

var bird = {
	height: 16,
	width: 16,
	speed: 1.2, // movement in pixels per second
	jump_height: 56,
	is_jumping: false,
	is_touching: false,
	is_grounded: false,
	x: canvas.width * 0.25,
	y: canvas.height - ( canvas.height * 0.45 ),
};
var now;
var then;
var delta;
var gravity = 1.2;
var jump_int;
var make_pipe;
var pipe_width = 100;
var pipe_height = 200;
var pipe_int = 4000;
var pipe_speed = 50;
var best_score = 0;
var blocks_cleared = 0;
var mouse_location = [];
//Variables for the state/scene of the game
var scene_game_over = false;
var scene_game_intro = true;
var scene_game_running = false;


// Handle keyboard controls

var keysDown = {};
var currently_pressed = false;
var mouse_currently_pressed = false;

addEventListener( "keydown", function(e) {
	keysDown[e.keyCode] = true;
	if ( scene_game_over == true ) { reset_game(); }
}, false);

addEventListener( "keyup", function(e) {
	delete keysDown[e.keyCode];
	currently_pressed = false;
}, false);

document.addEventListener("DOMContentLoaded", init, false);
canvas.addEventListener("mousedown", get_mouse_position, false);
canvas.addEventListener("mouseup", function(){ mouse_currently_pressed = true; }, false);

function init() {
    canvas.addEventListener("mousedown", get_mouse_position, false);
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

var get_mouse_position = function(event) {
	var x = new Number();
    var y = new Number();

    if (event.x != undefined && event.y != undefined) {
        x = event.x;
    	y = event.y;
    }
    else { // Firefox method to get the position
    	x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    mouse_location = [x, y];

    //console.log(mouse_location[0])

    //Determine if a button is clicked
    if ( scene_game_over == true ) {
    	//if mouse coordinates are within range of button display, restart the game
    	if ( 
    		mouse_location[0] > restart_btn_position_x 
    		&& mouse_location[0] < ( restart_btn_position_x + restart_btn_width )
    		&& mouse_location[1] > restart_btn_position_y
    		&& mouse_location[1] < ( restart_btn_position_y + restart_btn_height )
    	) {
    		reset_game();
    	} else { console.log('false'); }
    } 
}

var get_object_coordinates = function() {

}

// Reset the game when the player clicks play button

var reset_game = function () {
	console.log('reset game');
	scene_game_running = false;
	scene_game_over = false;
	scene_game_intro = true;
	blocks_cleared = 0;
	bird.is_touching = false;

	bird.x = canvas.width * 0.25,
	bird.y = canvas.height - ( canvas.height * 0.45 );

	game = setInterval(main, 1); // Execute as fast as possible
	scene_game_running = true;

	pipes = [];

	make_pipes();
}

var game_over = function() {
	scene_game_running = false;
	scene_game_over = true;

	// alert('game over!');
	console.log('game over..');
	clearInterval( make_pipe );
	clearInterval( game );

	// Display the restart button
	if ( restart_btn_ready ) {
		console.log( 'draw restart button..' );
		restart_btn_position_x = ( canvas.width / 2 ) - ( restart_btn_width / 2 );
		restart_btn_position_y = ( canvas.height / 2 ) - ( restart_btn_height / 2 );
		ctx.drawImage(restart_btn, restart_btn_position_x, restart_btn_position_y);
	} 

}

var make_pipes = function() {
	make_pipe = setInterval(function() {
		//produce new pipe at a set rate
		var opening = ( canvas.height ) * .3 ;
		var random_height = ( canvas.height ) * getRandomArbitary(0.45, 0.85);
		console.log(random_height);

		var pipe = new Pipe( (canvas.width), ( random_height - ( opening + pipe_height ) ), pipe_width, pipe_height, 'yellow', 'images/pipe.png');
		var pipe = new Pipe( (canvas.width), random_height, pipe_width, pipe_height, 'yellow', 'images/pipe.png');
	}, pipe_int);
}


// Update game objects
var animate_bird = function( modifier ) {
	// Start the bird jump animation

	var top_of_jump = bird.jump_height;
	top_of_jump = bird.y - bird.jump_height;
	if ( top_of_jump < 0 ) { top_of_jump = 0 };

	//console.log('animating..'+bird.y+' '+top_of_jump);

	clearInterval(jump_int);

	var i = ( gravity * 10 );
	jump_int = setInterval(function() { 
		//console.log(modifier+' '+ modifier * 10);
		bird.is_jumping == true;
		bird.y -= ( bird.speed * i );
		if ( bird.y <= 0 ) { bird.y = 0; };
		i = i-gravity;
	}, 30);

	//bird.is_jumping == false;
	//console.log('bird stopped jumping..'+bird.y+' '+bird.jump_height);
}

var update = function ( modifier ) {
	if ( isEmpty(keysDown) == false && currently_pressed == false || mouse_currently_pressed == true ) { // Player just pressed spacebar
		mouse_currently_pressed = false;
		currently_pressed = true;
		animate_bird(modifier);
	} 

	// Update position of Pipes

	if ( pipes.length > 0 ) {
		var p = 0;
		while ( p < pipes.length ) {
			//console.log(pipes[p]);
			pipes[p].pX -= pipe_speed * modifier;

			// Did the chicken pass a pipe?
			if ( bird.x > ( pipes[p].pX + pipes[p].width ) && pipes[p].is_passed == false ) {
				//The pipe has just been cleared, add 1 to score
				pipes[p].is_passed = true;
				blocks_cleared+=0.5;
			}

			// Are they touching?
			if ( bird.x > ( pipes[p].pX )
				 && bird.x < ( pipes[p].pX + pipes[p].width )
				 && bird.y > ( pipes[p].pY )
				 && bird.y < ( pipes[p].pY + pipes[p].height ) ) {
				//bird is touching, kill the game
				bird.is_touching = true;
			} 

			// If pipe has been passed & moved off screen right
			// It's useless to keep rendering it, so remove that
			if ( pipes[p].pX <= ( 0 - pipes[p].width ) ) {
				pipes.splice( p, 1 );
			}

			p++;
		}
	}


};


// Draw everything
var render = function () {
	if ( bgReady ) {
		ctx.drawImage(bgImage, 0, 0);
	}

	//Pipes

	if ( pipes.length > 0 ) {
		var p = 0;
		while ( p < pipes.length ) {
			//console.log(pipes[p]);
			ctx.drawImage(pipes[p].pipe_image, pipes[p].pX, pipes[p].pY, pipes[p].width, pipes[p].height);
			p++;
		}
	}

	if ( birdReady ) {
		if ( bird.y >= ( canvas.height - bird.height )  ) { 
			clearInterval(jump_int);
			bird.y = canvas.height - bird.height; 
			bird.is_grounded = true;
			ctx.drawImage( birdImage, bird.x, bird.y );
			game_over();
		} else if ( bird.is_touching == true ) {
			ctx.drawImage( birdImage, bird.x, bird.y );
			game_over();
		} else { 
			bird.is_grounded = false; 
			console.log(bird.x, bird.y);
			//ctx.drawImage( birdImage, bird.x, bird.y );
			ctx.drawImage( birdImage, bird.x, bird.y, bird.width, bird.height, 0, 0, bird.width, bird.height );
		}
	}

	// Score
	ctx.fillStyle = "rgb(250,250,250)";
	ctx.font = "24px monospace";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText( Math.floor(blocks_cleared), 32, 32);
}


// The main game loop
var main = function () {
	now = Date.now();
	delta = now - then;

	update(delta /1000);
	render();

	then = now;
}


// Let's play this game!
reset_game();
var then = Date.now();



