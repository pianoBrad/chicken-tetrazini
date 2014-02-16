// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);



// The main game loop
var last_time;
function main() {
	var now = Date.now();
	var dt = ( now - last_time ) / 1000.0;

	update( dt );
	render();

	last_time = now;
	requestAnimFrame(main);
}

// Once images have loaded, time to start the game
function init() {
	//console.log('all resources loaded..');
    sky_pattern = ctx.createPattern(resources.get('images/background.png'), 'repeat');

    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });

    reset();
    lastTime = Date.now();
    main();
}


// Get the resources for the game
resources.load([
    'images/background.png',
    'images/bird-test.png',
    'images/pipe.png'
]);
resources.onReady(init);


// Game states
var chicken = {
    pos: [0, 0],
    height: 16,
	width: 16,
	color: 'white',
    is_touching: false,
    is_grounded: false,
    is_jumping: false,
    is_falling: false,
    is_flapping: false,
    jump_height: 100,
    sprite: new Sprite('images/bird-test.png', [0, 0], [16, 16], 16, [0])
    //sprite: new Sprite('images/bird-test.png', [0, 0], [16, 16], 16, [0, 1], 'horizontal')
};

var pipes = [];
var game_time = 0;
var pipe_interval = 4;
var is_game_over;
var is_game_running = false;
var is_game_reset = false;
var sky_pattern;

// The score
var score = 0;
var score_el = document.getElementById('score');



// Speed in pixels per second
var chicken_speed = 600;
var pipe_speed = 100;

var gravity = 1.2;
var velocity = 1.2;
var drop_rate = 0.1;



// Update the game objects
var c = 0;
function update(dt) {
	if ( isNaN( dt ) ) { dt = 0; }
    game_time += dt;

    handle_input(dt);
    update_entities(dt);

    // Add pipes at set rate (make if statement for that here)
    /**
    **/
    
    if ( Math.floor( game_time ) % pipe_interval === 0 && Math.floor( game_time ) > c && is_game_running ) {
    	//Every given pipe_interval (in secontds), produce a new pipe to travel the screen
    	c = game_time;
    	pipes.push({
    		height: 200, //Make this variable
            pos: [0,0],
            sprite: new Sprite('images/pipe.png', [0, 0], [100, 400])
        });
        pipes[(pipes.length - 1)].pos = [canvas.width, canvas.height - pipes[(pipes.length - 1)].height];
        //console.log( pipes.length );
    }


    check_collisions();

    score_el.innerHTML = score;
};



// Handle the player input
//var currently_pressed = false;
var currently_pressed = false;
function handle_input(dt) {

    if(input.isDown('*') &&
       !is_game_over &&
       currently_pressed == false ) {
    	//console.log('some button pressed..');
    	if (is_game_reset) { is_game_reset = false; is_game_running = true; chicken.is_flapping = true; chicken.sprite = new Sprite('images/bird-test.png', [0, 0], [16, 16], 16, [0, 1], 'horizontal'); }
    	currently_pressed = true;
    	// Trigger jump animation
    	if ( chicken.is_jumping == true ) {
    		//chicken.is_jumping = false;
    		velocity = gravity;
    	} else { chicken.is_jumping = true; }
    } else if ( !input.isDown('*') &&
       !is_game_over) {
    	//console.log('nothing pressed..');
    	currently_pressed = false;
    }
}


var chicken_initial_height;
var counter;
function update_entities( dt ) {
    // Update the chicken sprite animation
    if ( isNaN(dt) ) { dt = 0; }
    if ( chicken.is_jumping == true && is_game_running ) {
    	//alert('chicken jumping!');
    	chicken.pos[1] -= ( chicken_speed * velocity ) * dt;
    	velocity -= drop_rate;
    }

   	chicken.sprite.update( dt );

    // Update all the pipes
    for(var i=0; i<pipes.length; i++) {
        pipes[i].pos[0] -= pipe_speed * dt;
        pipes[i].sprite.update(dt);

        // Remove if offscreen
        if(pipes[i].pos[0] + pipes[i].sprite.size[0] < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

}



// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function box_collides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function check_collisions() {
    check_chicken_bounds();

    // Run collision detection for all pipes
    for(var i=0; i<pipes.length; i++) {
        var pos = pipes[i].pos;
        var size = pipes[i].sprite.size;

        if(box_collides(pos, size, chicken.pos, chicken.sprite.size)) {
            //game_over();
            is_game_over = true;
        }
    }
}

function check_chicken_bounds() {
    // Check bounds
    if(chicken.pos[0] < 0) {
        chicken.pos[0] = 0;
    }
    else if(chicken.pos[0] > canvas.width - chicken.sprite.size[0]) {
        chicken.pos[0] = canvas.width - chicken.sprite.size[0];
    }

    if(chicken.pos[1] < 0) {
        chicken.pos[1] = 0;
    }
    else if(chicken.pos[1] > canvas.height - chicken.sprite.size[1]) {
        chicken.pos[1] = canvas.height - chicken.sprite.size[1];
        //game_over();
        is_game_over = true;
    }
}



// Draw everything
function render() {

    // Render stuff if the game isn't over
    if(is_game_running || is_game_reset) {
    	ctx.fillStyle = sky_pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        render_entity( chicken );
        render_entities( pipes );
    } 
    
    if ( is_game_over ) { game_over(); }
};

function render_entities( list ) {
    for(var i=0; i<list.length; i++) {
    	//console.log( list[i].pos[0] );
        render_entity(list[i]);
    }    
}

function render_entity( entity ) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}



// Game over
function game_over() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    is_game_running = false;
    is_game_over = true;
    //alert(chicken.pos);
}



// Reset game to original state
function reset() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    is_game_reset = true;
    is_game_over = false;
    gameTime = 0;
    score = 0;

    pipes = [];

    var gravity = 1.2;
	var velocity = 1.2;
	var drop_rate = 0.1;

	chicken.is_flapping = false; 
	chicken.sprite = new Sprite('images/bird-test.png', [0, 0], [16, 16], 16, [0]);
    chicken.pos = [50, canvas.height / 2];
    //alert(chicken.pos);
};
