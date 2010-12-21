
PE.Tinco.Interpreter = function(config) {
    this.listeners = [];
    this.trees = [];
    this.boards = {};
    if (config) {
        this.listeners = PE.apply([], config.listeners);
        this.trees = config.sgf.trees;
        if (this.trees.length > 0) {
            this.tree = 0;
            this.node = this.trees[this.tree];
            this.endNode = this.descend(this.node);
            this.nodeChanged();
        }
    }
    return this;
}

PE.Tinco.Interpreter.prototype = {
    trees: null,
    tree: null,
    node: null,
    endNode: null,
    listeners: null,
    boards: null,

    nextTree: function() {
        if (this.tree < this.trees.length - 1) {
            this.tree += 1;
            this.node = this.trees[this.tree];
            this.endNode = this.descend(this.node);
            boards = {};
            this.nodeChanged();
            return true;
        }
        return false;
    },

    prevTree: function() {
        if (this.tree > 0) {
            this.tree -= 1;
            this.node = this.trees[this.tree];
            this.endNode = this.descend(this.node);
            boards = {};
            this.nodeChanged();
            return true;
        }
        return false;
    },

    firstNode: function() {
        if (this.node !== this.trees[this.tree]) {
            this.node = this.trees[this.tree];
            this.nodeChanged();
            return true;
        }
        return false;
    },
    
    lastNode: function() {
        if (this.endNode !== this.node) {
            this.node = this.endNode;
            this.nodeChanged();
            return true;
        }
        return false;
    },
    
    nextNode: function(variation) {
        if (typeof variation === 'undefined') {
            variation = this.getVariation();
        }
        if (this.node.next.length > variation) {
            this.node = this.node.next[variation];
            this.nodeChanged();
            return true;
        }
        return false;
    },

    prevNode: function() {
        if (this.node.prev !== null) {
            this.node = this.node.prev;
            this.nodeChanged();
            return true;
        }
        return false;
    },

    goToNode: function(node) {
        if (node === this.node) {
            return true;
        }
        var root = node;
        while (root.prev !== null) {
            root = root.prev;
        }
        if (root === this.trees[this.tree]) {
            this.node = node;
            var variation = this.endNode;
            while (variation && variation !== this.node) {
                variation = variation.prev;
            }
            if (!variation) {
                this.endNode = this.descend(this.node);
            }
            this.nodeChanged();
            return true;
        }
        for (var i = 0; i < trees.length; i += 1) {
            if (trees[i] === root) {
                this.tree = i;
                this.node = node;
                this.endNode = this.descend(this.node);
                this.nodeChanged();
                return true;
            }
        }
        return false;
    },
    
    getVariation: function() {
        var child = this.endNode;
        while (child.prev && child.prev !== this.node) {
            child = child.prev;
        }
        variation = 0;
        for (var i = 0; i < this.node.next.length; i += 1) {
            if (this.node.next[i] === child) {
                variation = i;
                break;
            }
        }
        return variation;
    },

    descend: function(node) {
        while (node.next.length > 0) {
            node = node.next[0];
        }
        return node;
    },

    buildBoard: function(node) {
        if (this.boards[node.id]) {
            return this.boards[node.id];
        }
        var nodes = [];
        var parentBoard;
        while (node !== null) {
            parentBoard = this.boards[node.id];
            if (parentBoard) {
                break;
            }
            nodes.push(node);
            node = node.prev;
        }
        var board;
        if (!parentBoard) {
            board = new PE.Tinco.Board();
        } else {
            board = new PE.Tinco.Board(parentBoard);
        }
        for (var i = nodes.length - 1; i >= 0; i -= 1) {
            this.applySetup(nodes[i], board);
        }
        this.applyMarkup(nodes[0], board);
        this.addVariations(nodes[0], board);
        return board;
    },

    getBoard: function() {
        var board = this.boards[this.node.id];
        if (!board) {
            board = this.buildBoard(this.node);
            this.boards[this.node.id] = board;
        }
        return board;
    },
    
    applySetup: function(node, board) { // persistent (between subsequent nodes) setup ('game-info', 'move', 'setup' and 'inherit' properties)
        if (node.properties['SZ']) {
            var val = node.properties['SZ'][0];
            var c = val.indexOf(':');
            var x, y;
            if (c !== -1) {
                x = parseInt(val.substring(0, c));
                y = parseInt(val.substring(c + 1));
            } else {
                x = y = parseInt(val);
            }
            board.setSize(x, y);
        }

        if (this.isMove(node)) {
            if (node.properties['B']) {
                board.move(this.movePoint(node, board, 'B'), 1);
                board.nextColor = 2;
            } else if (node.properties['W']) {
                board.move(this.movePoint(node, board, 'W'), 2);
                board.nextColor = 1;
            }
        } else {
            if (node.properties['AB']) {
                board.placeStone(this.expandPoints(node.properties['AB']), 1);
            }
            if (node.properties['AW']) {
                board.placeStone(this.expandPoints(node.properties['AW']), 2);
            }
            if (node.properties['AE']) {
                board.placeStone(this.expandPoints(node.properties['AE']), 0);
            }
            if (node.properties['PL']) {
                var val = node.properties['PL'][0];
                var color = val === 'B' ? 1 : val === 'W' ? 2 : 0;
                if (color > 0) {
                    board.setNextColor(color);
                }
            }
        }
        PE.enumerate(node.properties, function(values, prop) {
            if (prop === 'MN') {
                board.moveNo = parseInt(values[0]);
            } else if (prop === 'DD') {
                board.dimmed = this.expandPoints(values);
            } else if (prop === 'VW') {
                board.visible = this.expandPoints(values);
            } else if (prop === 'PB') {
                board.gameInfo.black = PE.apply({}, board.gameInfo.black);
                board.gameInfo.black.name = values[0];
            } else if (prop === 'PW') {
                board.gameInfo.white = PE.apply({}, board.gameInfo.white);
                board.gameInfo.white.name = values[0];
            } else if (prop === 'BR') {
                board.gameInfo.black = PE.apply({}, board.gameInfo.black);
                board.gameInfo.black.rank = values[0];
            } else if (prop === 'WR') {
                board.gameInfo.white = PE.apply({}, board.gameInfo.white);
                board.gameInfo.white.rank = values[0];
            } else if (prop === 'DT') {
                board.gameInfo.date = values[0];
            } else if (prop === 'EV') {
                board.gameInfo.event = values[0];
            } else if (prop === 'RE') {
                board.gameInfo.result = values[0];
            } else if (prop === 'RU') {
                board.gameInfo.rules = values[0];
            } else if (prop === 'TM') {
                board.gameInfo.timeLimits = parseFloat(values[0]);
            } else if (prop === 'OT') {
                board.gameInfo.overtime = values[0];
            }
        }, this);
    },

    applyMarkup: function(node, board) { // per node setup (visible only for the current node)
        PE.enumerate(node.properties, function(values, prop) {
            if (prop === 'C') {
                board.comment = values[0];
            } else if (prop === 'N') {
                board.name = values[0];
            } else if (prop === 'DM') {
                board.posAnnotation = { pos: 'even' };
            } else if (prop === 'GB') {
                board.posAnnotation = { pos: 'black', value: parseInt(values[0]) };
            } else if (prop === 'GW') {
                board.posAnnotation = { pos: 'white', value: parseInt(values[0]) };
            } else if (prop === 'UC') {
                board.posAnnotation = { pos: 'unclear' };
            } else if (prop === 'BM') {
                board.moveAnnotation = values[0] === '2' ? '??' : '?';
            } else if (prop === 'DO') {
                board.moveAnnotation = '?!';
            } else if (prop === 'IT') {
                board.moveAnnotation = '!?';
            } else if (prop === 'TE') {
                board.moveAnnotation = values[0] === '2' ? '!!' : '!';
            } else if (prop === 'AR') {
                this.lineMarkup(board, values, 'arrow');
            } else if (prop === 'LN') {
                this.lineMarkup(board, values, 'line');
            } else if (prop === 'CR') {
                board.markup.push(this.pointMarkup(values, 'circle'));
            } else if (prop === 'MA' || prop === 'M') {
                board.markup.push(this.pointMarkup(values, 'cross'));
            } else if (prop === 'SL') {
                board.markup.push(this.pointMarkup(values, 'select'));
            } else if (prop === 'SQ') {
                board.markup.push(this.pointMarkup(values, 'square'));
            } else if (prop === 'TR') {
                board.markup.push(this.pointMarkup(values, 'triangle'));
            } else if (prop === 'TB') {
                board.markup.push(this.pointMarkup(values, 'blackterritory'));
            } else if (prop === 'TW') {
                board.markup.push(this.pointMarkup(values, 'whiteterritory'));
            } else if (prop === 'LB') {
                PE.each(values, function(value) {
                    var c = value.indexOf(':');
                    if (c !== -1) {
                        board.markup.push({ 
                            type: 'label', 
                            point: this.convertPoint(value.substring(0, c)),
                            text: value.substring(c + 1).trim()
                        });
                    }
                }, this);
            }
        }, this);
    },

    pointMarkup: function(values, type) {
        return { type: type, points: this.expandPoints(values) };
    },

    lineMarkup: function(board, values, type) {
        PE.each(values, function(value) {
            var c = value.indexOf(':');
            if (c !== -1) {
                var from = this.convertPoint(value.substring(0, c));
                var to = this.convertPoint(value.substring(c + 1));
                if (from !== to) {
                    board.markup.push({ type: type, from: from, to: to });
                }
            }
        }, this);
    },

    addVariations: function(node, board) {
        PE.each(node.next, function(nextnode) {
            if (this.isMove(nextnode)) {
                var p = this.movePoint(nextnode, board);
                if (p !== '') { // ignore pass moves
                    board.variations.push(p);
                }
            }
        }, this);
    },

    movePoint: function(node, board, prop) {
        var values;
        if (!prop) {
            values = node.properties['B'] || node.properties['W'];
        } else {
            values = node.properties[prop];
        }
        var sgfMove = values[0];
        if (sgfMove === '' || sgfMove === 'tt' && board.xsize <= 19 && board.ysize <= 19) {
            return '';
        } else {
            return this.convertPoint(sgfMove);
        }
    },

    convertPoint: function(sgfPoint) {
        var p = this.coordinates(sgfPoint);
        return PE.Tinco.point(p.x, p.y);
    },

    point: function(x, y) {
        var sx, sy;
        if (x <= 26) {
            sx = String.fromCharCode(96 + x);
        } else {
            sx = String.fromCharCode(64 + x);
        }
        if (y <= 26) {
            sy = String.fromCharCode(96 + y);
        } else {
            sy = String.fromCharCode(64 + y);
        }
        return sx + sy;
    },

    coordinates: function(point) {
        var sx = point.charCodeAt(0)
        var sy = point.charCodeAt(1)
        var x, y;
        if (sx > 96) {
            x = sx - 96;
        } else {
            x = sx - 64;
        }
        if (sy > 96) {
            y = sy - 96;
        } else {
            y = sy - 64;
        }
        return { x: x, y: y };
    },

    expandPoints: function(points) {
        var result = [];
        PE.each(points, function(point) {
            var c = point.indexOf(':');
            if (c !== -1) {
                var lt = this.coordinates(point.substring(0, c));
                var rb = this.coordinates(point.substring(c + 1));
                for (var i = lt.x; i <= rb.x; i += 1) {
                    for (var j = lt.y; j <= rb.y; j += 1) {
                        result.push(PE.Tinco.point(i, j))
                    }
                }
            } else {
                result.push(this.convertPoint(point));
            }
        }, this);
        return result;
    },

    isMove: function(node) {
        return !!node.properties['B'] || !!node.properties['W'];
    },

    isBlackMove: function(node) {
        return !!node.properties['B'];
    },

    isWhiteMove: function(node) {
        return !!node.properties['W'];
    },

    isSetup: function(node) {
        return !!node.properties['AB'] || !!node.properties['AW'] || !!node.properties['AE'] || !!node.properties['PL'];
    },

    nodeChanged: function() {
        var board = this.getBoard();
        PE.each(this.listeners, function(l) {
            l(board, this.node, this.trees[this.tree], this);
        }, this);
    },

    addListener: function(l) {
        this.listeners.push(l);
        l(this.getBoard(), this.node, this.trees[this.tree], this);
    }
}
