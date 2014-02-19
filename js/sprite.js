
(function() {
    function Sprite(url, pos, size, speed, frames, dir, resize, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
        this.resize = resize || [1,1];
    };

    Sprite.prototype = {
        update: function( dt ) {
            if ( isNaN( this._index ) ) { this._index = 0; }
            if ( isNaN( dt ) ) { dt = 0; }

            this._index += this.speed*dt;

        },

        render: function(ctx) {
            var frame;

            if(this.speed > 0) {
                var max = this.frames.length;
                var idx = Math.floor(this._index);
                frame = this.frames[idx % max];


                if(this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            }
            else {
                frame = 0;
            }


            var x = this.pos[0];
            var y = this.pos[1];

            
            if(this.dir == 'vertical') {
                y += frame * this.size[1];
            }
            else {
                x += frame * this.size[0];
            }

            //console.log('drawing image now..'+resources.get(this.url)+' '+frame+' '+x+' '+y);
            ctx.scale(this.resize[0],this.resize[1]);
            ctx.drawImage(resources.get(this.url),
                          x, y,
                          this.size[0], this.size[1],
                          0, 0,
                          this.size[0], this.size[1]);
            
        }
    };

    window.Sprite = Sprite;
})();