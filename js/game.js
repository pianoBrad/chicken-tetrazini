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

// Function to get a random number between a given range
function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 320;//512;
canvas.height = 568;//480;
// Set styles of hud elements, based on canvas size
// document.getElementById('score').style.width=canvas.width+"px";
// document.getElementById('score').style.margin=(canvas.height/20)+"px 0px";
document.getElementById('game').appendChild(canvas);



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
    dead_background= ctx.createPattern(resources.get('images/dead-black.png'), 'repeat');
    sky_pattern = ctx.createPattern(resources.get('images/background-tile-54px.png'), 'repeat');

    document.getElementById('play-again').addEventListener('mousedown', function() {
        reset();
    });

    reset();
    lastTime = Date.now();
    main();
}


// Get the resources for the game
resources.load([
    'images/background-tile-54px.png',
    'images/chicken-sprite-sheet-54px.png',
    'images/chicken-dead-sprite-sheet-63px.png',
    'images/fork.png',
    'images/steam.png',
    'images/flame-foreground-70px.png',
    'images/flame-background-1-70px.png',
    'images/dead-black.png'
]);
resources.onReady(init);


// Game states
var chicken_width = 54;
var chicken_height = 49;
var chicken_dead_width = 72;
var chicken_dead_height = 63;
var chicken_scale_x = 1;
var chicken_scale_y = 1;
var chicken_url = 'images/chicken-sprite-sheet-54px.png';
var chicken_dead_url = 'images/chicken-dead-sprite-sheet-63px.png';
var chicken = {
    pos: [0, 0],
    height: chicken_height,//24,
	width: chicken_width,//24,
	color: 'white',
    is_touching: false,
    is_grounded: false,
    is_jumping: false,
    is_falling: false,
    is_flapping: false,
    is_dead: false,
    jump_height: 100,
    sprite: new Sprite(chicken_url, [0, 0], [chicken_width, chicken_height], 10, [0])
    //sprite: new Sprite('images/chicken-sprite-sheet.png', [0, 0], [16, 16], 16, [0, 1], 'horizontal')
};

/**
var pipes = [];
var pipe_width = 84;
var pipe_height = 319;
**/
var forks = [];
var fork_width = 57;
var fork_height= 633;
var flames_front = [];
var flames_back = [];
var flame_front_width = 70;
var flame_front_height = 140;
var flame_back_width = 70;
var flame_back_height = 140;
var game_time = 0;
//var pipe_interval = 3;
var fork_interval = 2.5;
var is_game_over;
var is_game_running = false;
var is_game_reset = false;
var sky_pattern;

// Background/Foreground elements
var num_flame = 0;
for ( f = 0; f < (canvas.width + flame_front_width); f+=flame_front_width) {
	//Make flame
   	flames_front.push({
   		width: flame_front_width,
    	height: flame_front_height, //Make this variable
        pos: [0,0],
        sprite: new Sprite('images/flame-foreground-70px.png', [0, 0], [flame_front_width, flame_front_height])
    });
    //Make background flame
   	flames_back.push({
   		width: flame_back_width,
    	height: flame_back_height, //Make this variable
        pos: [0,0],
        sprite: new Sprite('images/flame-background-1-70px.png', [0, 0], [flame_back_width, flame_back_height])
    });

    flames_back[num_flame].pos = [f, ( canvas.height - ( canvas.height / 5) )];
    flames_front[num_flame].pos = [f, ( canvas.height - ( canvas.height / 8) )];
    num_flame++;
}

var steam = {
	pos: [0, 0],
	sprite: new Sprite('images/steam.png', [0, 0], [canvas.width, canvas.height])	
};

// The score
var score = 0;
//var score_el = document.getElementById('score');
var score_el = document.getElementsByClassName('score');


// Speed in pixels per second
var chicken_speed = 450;
//var pipe_speed = 100;
var fork_speed = 100;

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

    // Add forks at set rate (make if statement for that here)
    
    if ( ( ( Math.round( game_time * 10 ) / 10 ) - c ) == fork_interval && Math.round( game_time ) > c && is_game_running ) {
    	//Every given fork_interval (in secontds), produce a new fork to travel the screen
    	//c = game_time;
        c = Math.round( game_time );

    	var opening = ( canvas.height ) * .3 ;
		var random_height = ( canvas.height ) * getRandomArbitary(0.45, 0.85);

    	//Make 1st fork
    	forks.push({
            is_passed: false,
    		height: random_height, //Make this variable
            pos: [0,0],
            sprite: new Sprite('images/fork.png', [0, 0], [fork_width, fork_height])
        });
        forks[(forks.length - 1)].pos = [canvas.width, forks[(forks.length - 1)].height];
        
        //Make 2nd fork
        forks.push({
            is_passed: false,
    		height: random_height, //Make this variable
            pos: [0,0],
            sprite: new Sprite('images/fork.png', [0, 0], [fork_width, fork_height])
        });
        forks[(forks.length - 1)].pos = [canvas.width, forks[(forks.length - 1)].height - ( opening + fork_height ) ];

    }


    check_collisions();

    for ( s = 0; s < score_el.length; s++ ) {
        score_el[s].innerHTML = Math.round( score );
    }
};



// Handle the player input
//var currently_pressed = false;
var currently_pressed = false;
function handle_input(dt) {

    if(input.isDown('*') &&
       !is_game_over &&
       currently_pressed == false ) {
    	//console.log('some button pressed..');
    	if (is_game_reset) { 
            is_game_reset = false; 
            is_game_running = true; 
            chicken.is_flapping = true; 
            chicken.sprite = new Sprite(chicken_url, [0, 0], [chicken_width, chicken_height], 10, [5, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0], 'horizontal', [chicken_scale_x,chicken_scale_y]); 
            document.getElementById('game-intro').style.display = 'none';
            document.getElementById('score').style.display = 'block';
            game_time = 0;
        }
    	currently_pressed = true;
    	//console.log('flap.');
    	// Trigger jump animation
    	if ( chicken.is_jumping == true ) {
    		//chicken.is_jumping = false;
    		velocity = gravity;
    	} else { chicken.is_jumping = true; chicken.sprite = new Sprite(chicken_url, [0, 0], [chicken_width, chicken_height], 10, [5, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0], 'horizontal', [chicken_scale_x,chicken_scale_y]); }
    } else if ( !input.isDown('*') &&
       !is_game_over) {
    	//console.log('nothing pressed..');
    	currently_pressed = false;
    }
}


var chicken_initial_height;
var counter;
function update_entities( dt ) {
    if ( is_game_running && chicken.is_flapping ) {
        var flame_front_speed = 2.5;
        var flame_back_speed = 0.5;
        var fork_speed = 100;
    } else if ( is_game_over ) {
        var flame_front_speed = 0;
        var flame_back_speed = 0;
        var fork_speed = 0;
    }

    // Update the chicken sprite animation
    if ( isNaN(dt) ) { dt = 0; }
    if ( chicken.is_jumping == true && is_game_running ) {
    	//alert('chicken jumping!');
    	chicken.pos[1] -= ( chicken_speed * velocity ) * dt;
    	velocity -= 0.075;
    }
    
    if ( chicken.is_dead == true && chicken.is_falling == true ) {
        chicken.pos[1] += 3;
    }
    

   	chicken.sprite.update( dt );

    // Update all the forks
    for(var i=0; i<forks.length; i++) {
        forks[i].pos[0] -= fork_speed * dt;
        forks[i].sprite.update(dt);

        // Remove if offscreen
        if(forks[i].pos[0] + forks[i].sprite.size[0] < 0) {
            forks.splice(i, 1);
            i--;
        }
    }

    // Update the flames

    if ( is_game_running && chicken.is_flapping ) {
    	for ( var f = 0; f < flames_front.length; f++) {
    		if( flames_front[f].pos[0] <= ( 0 - flame_front_width ) ) {
    			if ( f != 0 ) {
    				flames_front[f].pos[0] = (flames_front[(f - 1)].pos[0] + flame_front_width);
    			} else {
    				flames_front[f].pos[0] = (flames_front[(flames_front.length - 1)].pos[0] + flame_front_width);
    			}

    		}
    		flames_front[f].pos[0] -= flame_front_speed;
    	}

    	for ( var f = 0; f < flames_back.length; f++) {
    		if( flames_back[f].pos[0] <= ( 0 - flame_back_width ) ) {
    			if ( f != 0 ) {
    				flames_back[f].pos[0] = (flames_back[(f - 1)].pos[0] + flame_back_width);
    			} else {
    				flames_back[f].pos[0] = (flames_back[(flames_back.length - 1)].pos[0] + flame_back_width);
    			}

    		}
    	
    		flames_back[f].pos[0] -= flame_back_speed;
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

    // Run collision detection for all forks, if they're in same x range as chicken
    for(var i=0; i<forks.length; i++) {
        var pos = forks[i].pos;
        var size = forks[i].sprite.size;

        if ( forks[i].pos[0] <= ( chicken.pos[0] + chicken_width ) && forks[i].is_passed == false ) {
        	//alert('check collisions now!');
            //console.log('checking collisions now..');
        	if(box_collides(pos, size, chicken.pos, chicken.sprite.size)) {
            	//game_over();
            	is_game_over = true;
        	} else if ( ( forks[i].pos[0] + fork_width ) < chicken.pos[0] && forks[i].is_passed == false ) {
                forks[i].is_passed = true;
                score += 0.5;
            }
        } 
    } 
}

function check_chicken_bounds() {
    // Check bounds
    if( is_game_running && chicken.pos[0] < 0) {
        chicken.pos[0] = 0;
    }
    else if( is_game_running && chicken.pos[0] > canvas.width - chicken.sprite.size[0]) {
        chicken.pos[0] = canvas.width - chicken.sprite.size[0];
    }

    if( is_game_running && chicken.pos[1] < 0) {
        chicken.pos[1] = 0;
    }
    else if( is_game_running && chicken.pos[1] > canvas.height - chicken.sprite.size[1]) {
        chicken.pos[1] = canvas.height - chicken.sprite.size[1];
        //game_over();
        is_game_over = true;
    } else if ( !is_game_running && chicken.pos[1] > canvas.height ) {
        chicken.pos[1] = canvas.height;
    }
}



// Draw everything
function render() {

    // Render stuff if the game isn't over
    if(is_game_running || is_game_reset) {
    	// Render background elements
    	ctx.fillStyle = sky_pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        render_entity( steam );

        render_entities( flames_back );

        // Render blocks and chicken
        render_entities( forks );
    	render_entity( chicken );

    	// Render foreground flames
    	render_entities( flames_front );
    
        if ( is_game_over ) { 
            game_over(); 
        }
    } else {
        // Render background elements
        ctx.fillStyle = sky_pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        render_entity( steam );

        render_entities( flames_back );

        // Render blocks and chicken
        render_entities( forks );

        // Render background
        if ( is_game_over ) {
            ctx.fillStyle = dead_background;
            ctx.fillRect(0,0,canvas.width, canvas.height);
        }
        

        if ( chicken.sprite.done && chicken.is_falling == false ) {
            //dead freeze has completed, time to drop the bird into the lava!
            chicken.is_dead = true;
            chicken.is_falling = true;
            //chicken.sprite = new Sprite(chicken_dead_url, [0, 0], [chicken_dead_width, chicken_dead_height], 10, [1,2,3,4,5,6], 'horizontal', [chicken_scale_x,chicken_scale_y]);
            chicken.sprite.once = false;
            chicken.sprite.frames = [1,2,3,4,5,6];
        }
        //console.log(chicken.sprite.done);
        render_entity( chicken )

        // Render foreground flames
        render_entities( flames_front );
    }
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
    document.getElementById('score').style.display = 'none';
    document.getElementById('final-score').style.display = 'block';
    is_game_running = false;
    is_game_over = true;
    //alert(chicken.pos);
    chicken.is_falling = false;
    chicken.sprite = new Sprite(chicken_dead_url, [0, 0], [chicken_dead_width, chicken_dead_height], 10, [0,0,0,0,0,0,0,0,0,0], 'horizontal', [chicken_scale_x,chicken_scale_y], true);
}



// Reset game to original state
function reset() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('game-intro').style.display = 'block';
    is_game_reset = true;
    is_game_over = false;
    game_time = 0;
    score = 0;

    forks = [];

    var gravity = 1.2;
	var velocity = 1.2;
	var drop_rate = 0.1;
	c = 0;

	chicken.is_flapping = false; 
    chicken.is_dead = false;
	chicken.sprite = new Sprite(chicken_url, [0, 0], [chicken_width, chicken_height], 10, [0], 'horizontal', [chicken_scale_x,chicken_scale_y]);
    chicken.pos = [50, canvas.height / 2];
    //alert(chicken.pos);

    //reset the flames to original positions
};
