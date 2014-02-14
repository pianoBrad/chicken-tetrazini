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

// Restart Button 
var restart_btn_ready = false;
var restart_btn = new Image();
restart_btn.onload = function () {
	restart_btn_ready = true;
}
restart_btn.src = 'images/restart-btn.png';


// Game objects

var bird = {
	height: 16,
	speed: 1.2, // movement in pixels per second
	jump_height: 56,
	is_jumping: false,
	is_grounded: false,
	x: canvas.width * 0.25,
	y: canvas.height - ( canvas.height * 0.45 ),
};
var now;
var then;
var delta;
var gravity = 1.2;
var jump_int;
var blocks_cleared = 0;
var mouse_location = [];


// Handle keyboard controls

var keysDown = {};
var currently_pressed = false;

addEventListener( "keydown", function(e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener( "keyup", function(e) {
	delete keysDown[e.keyCode];
	currently_pressed = false;
}, false);

document.addEventListener("DOMContentLoaded", init, false);
canvas.addEventListener("mousedown", get_mouse_position, false);
canvas.addEventListener("mouseup", function(){ currently_pressed = false; animate_bird( delta /1000 ); }, false);

function init() {
    canvas.addEventListener("mousedown", get_mouse_position, false);
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
}

var get_object_coordinates = function() {

}

// Reset the game when the player clicks play button

var reset = function () {

}

var game_over = function() {
	//alert('game over!');
	console.log('game over..');
	clearInterval(game);

	if ( restart_btn_ready ) {
		ctx.drawImage(restart_btn, 0, 0);
	} 

}


// Update game objects
var animate_bird = function( modifier ) {
	console.log('animate bird called..');

	var top_of_jump = bird.jump_height;
	top_of_jump = bird.y - bird.jump_height;
	if ( top_of_jump < 0 ) { top_of_jump = 0 };

	//console.log('animating..'+bird.y+' '+top_of_jump);

	clearInterval(jump_int);

	var i = ( gravity * 10 );
	jump_int = setInterval(function() { 
		//console.log(modifier+' '+ modifier * 10);
		bird.is_jumping == true;
		bird.y -= bird.speed * i;
		if ( bird.y <= 0 ) { bird.y = 0; };
		i = i-gravity;
	}, 20);

	//bird.is_jumping == false;
	//console.log('bird stopped jumping..'+bird.y+' '+bird.jump_height);
}

var update = function ( modifier ) {
	if ( 32 in keysDown && currently_pressed == false ) { // Player just pressed spacebar
		currently_pressed = true;
		animate_bird(modifier);
	} 

	// Are they touching?

};


// Draw everything
var render = function () {
	if ( bgReady ) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if ( birdReady ) {
		if ( bird.y >= ( canvas.height - bird.height )  ) { 
			clearInterval(jump_int);
			bird.y = canvas.height - bird.height; 
			bird.is_grounded = true;
			ctx.drawImage( birdImage, bird.x, bird.y );
			game_over();
		} else { 
			bird.is_grounded = false; 
			ctx.drawImage( birdImage, bird.x, bird.y );
		}
	}

	// Score
	ctx.fillStyle = "rgb(250,250,250)";
	ctx.font = "24px monospace";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(blocks_cleared, 32, 32);
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
reset();
var then = Date.now();
var game = setInterval(main, 1); // Execute as fast as possible



