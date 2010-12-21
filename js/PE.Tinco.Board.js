
PE.Tinco.Board = function(config) {
    this.stones = {};
    this.inheritedMarkup = [];
    this.captured = [0, 0];
    this.dimmed = [];
    this.visible = [];
    this.gameInfo = {};

    this.markup = [];
    this.variations = [];
    if (config) {
        if (config.xsize && config.ysize) {
            this.setSize(config.xsize, config.ysize);
        }
        this.captured = PE.apply(this.captured, config.captured);
        this.nextColor = config.nextColor || this.nextColor;
        if (config.stones) {
            this.stones = PE.apply(this.stones, config.stones);
        } else if (config.game) {
            this.stones = PE.apply(this.stones, config.game.getStones());
        }
        this.moveNo = config.moveNo || this.moveNo;
        this.dimmed = PE.apply(this.dimmed, config.dimmed);
        this.visible = PE.apply(this.visible, config.visible);
        this.gameInfo = PE.apply(this.gameInfo, config.gameInfo);
    }
    return this;
}

PE.Tinco.Board.prototype = {
    xsize: null,
    ysize: null,
    starpoints: null,
    game: null,
    stones: null,
    captured: null,
    nextColor: 1,
    moveNo: 0,
    dimmed: null,
    visible: null,
    gameInfo: null,

    markup: null,
    comment: '',
    name: '',
    moveAnnotation: '',
    posAnnotation: null,
    variations: null,
    lastMove: null,
    lastColor: null,
    
    move: function(where, color) {
        if (where !== '') {
            if (this.getColor(where)) {
                this.removeStone(where);
            }
        }
        this.switchToGame();
        if (typeof color !== 'undefined') {
            this.game.nextColor = color;
        }
        this.lastColor = this.game.nextColor;
        this.lastMove = where;
        this.game.move(where, false);
        this.moveNo += 1;
    },
    
    placeStone: function(where, color) {
        this.switchToStones();
        PE.each(where, function(pt) {
            if (color === 0) {
                delete this.stones[pt];
            } else {
                this.stones[pt] = color;
            }
        }, this);
    },
    
    removeStone: function(where) {
        this.switchToStones();
        PE.each(where, function(pt) {
            delete this.stones[pt];
        }, this);
    },

    setNextColor: function(color) {
        this.nextColor = color;
        if (this.game !== null) {
            this.game.nextColor = color;
        }
    },

    setSize: function(x, y) {
        if (this.xsize !== x || this.ysize !== y) {
            this.switchToStones();
            this.xsize = x;
            this.ysize = y;
            if (x === y && x > 8) {
                if (x < 12) {
                    this.starPoints = [PE.Tinco.point(3, 3), PE.Tinco.point(3, y - 2), PE.Tinco.point(x - 2, 3), PE.Tinco.point(x - 2, y - 2)];
                } else {
                    this.starPoints = [PE.Tinco.point(4, 4), PE.Tinco.point(4, y - 3), PE.Tinco.point(x - 3, 4), PE.Tinco.point(x - 3, y - 3)];
                }
                if (x % 2 === 1) {
                    if (x === 9) {
                        this.starPoints.push(PE.Tinco.point(5, 5));
                    } else if (x === 11) {
                        this.starPoints.push(PE.Tinco.point(6, 6));
                        this.starPoints.push(PE.Tinco.point(6, 3));
                        this.starPoints.push(PE.Tinco.point(9, 6));
                        this.starPoints.push(PE.Tinco.point(6, 9));
                        this.starPoints.push(PE.Tinco.point(3, 6));
                    } else {
                        this.starPoints.push(PE.Tinco.point(Math.ceil(x / 2), Math.ceil(y / 2)));
                        this.starPoints.push(PE.Tinco.point(Math.ceil(x / 2), 4));
                        this.starPoints.push(PE.Tinco.point(x - 3, Math.ceil(y / 2)));
                        this.starPoints.push(PE.Tinco.point(Math.ceil(x / 2), y - 3));
                        this.starPoints.push(PE.Tinco.point(4, Math.ceil(y / 2)));
                    }
                }
            }
        }
    },
    
    getColor: function(where) {
        if (this.game !== null) {
            return this.game.getColor(where);
        } else if (this.stones !== null) {
            return this.stones[where];
        } else {
            return null;
        }
    },

    getCaptured: function() {
        if (this.game !== null) {
            return this.game.captured;
        } else if (this.stones !== null) {
            return this.captured;
        } else {
            return null;
        }
    },

    switchToStones: function() {
        if (this.stones !== null) {
            return;
        }
        this.stones = this.game.getStones();
        this.captured = this.game.captured;
        this.nextColor = this.game.nextColor;
        this.game = null;
    },

    switchToGame: function() {
        if (this.game !== null) {
            return;
        }
        this.game = new PE.Tinco.Game({ xsize: this.xsize, ysize: this.ysize, captured: this.captured });
        this.game.setStones(this.stones);
        this.game.nextColor = this.nextColor;
        this.stones = null;
    },

    toString: function() {
        if (this.game !== null) {
            return this.game.toString();
        } else {
            var charColors = ['.', 'X', 'O'];
            var result = '';
            for (var j = 1; j <= this.ysize; j++) {
                for (var i = 1; i <= this.xsize; i++) {
                    var color = this.stones[PE.Tinco.point(i, j)];
                    if (color) {
                        result += charColors[color];
                    } else {
                        result += '.';
                    }
                    result += ' ';
                }
                result += '\r\n';
            }
            return result;
        }
    }
}