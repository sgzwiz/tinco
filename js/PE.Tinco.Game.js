
PE.Tinco.Worm = function(color) {
    this.color = color;
    this.stones = new PE.Tinco.PointSet();
    this.liberties = new PE.Tinco.PointSet();
};

PE.Tinco.Worm.prototype = {
    color: 0,
    stones: null,
    liberties: null,
    toString: function() {
        return '{ color: ' + this.color + ', stones: ' + this.stones.toString() + ', liberties: ' + this.liberties.toString() + ' }';
    }
};

PE.Tinco.Game = function(config) {
    this.borderWorm = new PE.Tinco.Worm(-1);
    this.worms = {};
    this.captured = [0, 0];
    if (config) {
        this.xsize = config.xsize || this.xsize;
        this.ysize = config.ysize || this.ysize;
        if (config.captured) {
            this.captured = config.captured;
        }
    }
    for (var x = 0; x < this.xsize + 2; x++) {
        var top = PE.Tinco.point(x, 0);
        this.worms[top] = this.borderWorm;
        this.borderWorm.stones.add(top);
        var bottom = PE.Tinco.point(x, this.xsize + 1);
        this.worms[bottom] = this.borderWorm;
        this.borderWorm.stones.add(bottom);
    }
    for (var y = 0; y < this.ysize + 2; y++) {
        var left = PE.Tinco.point(0, y);
        this.worms[left] = this.borderWorm;
        this.borderWorm.stones.add(left);
        var right = PE.Tinco.point(this.xsize + 1, y);
        this.worms[right] = this.borderWorm;
        this.borderWorm.stones.add(right);
    }
    return this;
};

PE.Tinco.Game.prototype = {

    xsize: 19,
    ysize: 19,
    nextColor: 1,
    koMove: null,
    borderWorm: null,
    worms: null,
    captured: null,

    move: function(where, checkLegal) {
        if (where !== '') {
            if (typeof checkLegal === 'undefined') {
                checkLegal = true;
            }
            if (checkLegal && this.moveStatus(where, this.nextColor) !== 'Legal') {
                return false;
            }
            this.place(where, this.nextColor);
            this.capture(where);
        } else {
            this.koMove = null;
        }
        this.nextColor = (this.nextColor + 2) % 2 + 1;
        return true;
    },

    place: function(where, color) {
        var here = null;
        PE.each(this.adjacentPoints(where), function(point) {
            var adjacent = this.worms[point];
            if (adjacent && adjacent !== this.borderWorm) {
                adjacent.liberties.remove(where);
                if (adjacent.color === color) { // merge adjacent worms
                    if (here !== null) {
                        this.merge(here, adjacent);
                    } else {
                        here = adjacent;
                        adjacent.stones.add(where);
                    }
                }
            }
        }, this);
        // if new worm
        if (here === null) {
            here = new PE.Tinco.Worm(color);
            here.stones.add(where);
        }
        this.worms[where] = here;
        PE.each(this.adjacentPoints(where), function(point) {
            if (!this.worms[point]) {
                here.liberties.add(point);
            }
        }, this);
    },
    
    capture: function(where) {
        var here = this.worms[where];
        var singleStoneCapture = false;
        PE.each(this.adjacentPoints(where), function(point) {
            var adjacent = this.worms[point];
            if (adjacent && adjacent !== this.borderWorm && adjacent.color !== here.color && adjacent.liberties.size === 0) {
                singleStoneCapture = adjacent.stones.size === 1;
                this.captured[adjacent.color - 1] += adjacent.stones.size;
                this.remove(adjacent);
            }
        }, this);
        if (here.liberties.size === 0) {
            this.captured[here.color - 1] += here.stones.size;
            this.remove(here);
        } else {
            var isKoCapture = singleStoneCapture && here.liberties.size === 1 && here.stones.size === 1;
            if (isKoCapture) {
                this.koMove = here.liberties.get();
            } else {
                this.koMove = null;
            }
        }
    },
    
    moveStatus: function(where, color) {
        if (typeof color === 'undefined') {
            color = this.nextColor;
        }
        if (this.worms[where]) {
            return 'NotEmpty';
        }
        if (where === this.koMove) {
            return 'Ko';
        }
        var isCapture = false;
        var lastOwnLib = true;
        PE.each(this.adjacentPoints(where), function(point) {
            var adjacent = this.worms[point];
            if (!adjacent) {
                lastOwnLib = false;
            } else if (adjacent !== this.borderWorm) {
                if (adjacent.color === color && adjacent.liberties.size > 1) {
                    lastOwnLib = false;
                }
                if (adjacent.color !== color && adjacent.liberties.size === 1) {
                    isCapture = true;
                }
            }
        }, this);
        if (lastOwnLib && !isCapture) {
            return 'Suicide';
        }
        return 'Legal';
    },

    remove: function(worm) {
        worm.stones.each(function(point) {
            delete this.worms[point];
            PE.each(this.adjacentPoints(point), function(adjPoint) {
                var adjWorm = this.worms[adjPoint];
                if (adjWorm && adjWorm !== this.borderWorm) {
                    adjWorm.liberties.add(point);
                }
            }, this);
        }, this);
    },

    merge: function(worm1, worm2) {
        if (worm1 === worm2) {
            return;
        }
        worm2.stones.each(function(point) {
            this.worms[point] = worm1;
        }, this);
        worm2.stones.each(function(point) {
            worm1.stones.add(point);
        });
        worm2.liberties.each(function(point) {
            worm1.liberties.add(point);
        });
    },
    
    getStones: function() {
        var stones = {};
        for (var p in this.worms) {
            if (this.worms.hasOwnProperty(p) && this.worms[p] !== this.borderWorm) {
                stones[p] = this.worms[p].color;
            }
        }
        return stones;
    },
    
    setStones: function(stones) {
        for (var p in this.worms) {
            if (this.worms.hasOwnProperty(p) && this.worms[p] !== this.borderWorm) {
                delete this.worms[p];
            }
        }
        for (var p in stones) {
            if (stones.hasOwnProperty(p)) {
                this.place(p, stones[p]);
            }
        }
    },
    
    getColor: function(where) {
        var w = this.worms[where];
        if (!w || w === this.borderWorm) {
            return 0;
        }
        return w.color;
    },
    
    adjacentPoints: function(point) {
        var p = PE.Tinco.coordinates(point);
        return [PE.Tinco.point(p.x - 1, p.y), PE.Tinco.point(p.x, p.y - 1), PE.Tinco.point(p.x + 1, p.y), PE.Tinco.point(p.x, p.y + 1)];
    },
    
    toString: function() {
        var charColors = ['.', 'X', 'O'];
        var result = '';
        for (var j = 1; j <= this.ysize; j++) {
            for (var i = 1; i <= this.xsize; i++) {
                var worm = this.worms[PE.Tinco.point(i, j)];
                if (worm) {
                    result += charColors[worm.color];
                } else {
                    result += '.';
                }
                result += ' ';
            }
            result += '\r\n';
        }
        return result;
    }
};