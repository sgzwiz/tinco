PE.Tinco.Render = {};

PE.Tinco.Render.BoardRenderer = function() {
    return this;
};

PE.Tinco.Render.BoardRenderer.prototype = {

    padding: 10,
    border: 2,
    showCoordinates: { left: true, top: true, right: true, bottom: true },
    showVariations: true,
    showLastMove: true,
    
    pos: function(i, j, params) {
        return { 
            x: Math.floor(params.basex + (i - 1 + 0.5) * params.psize),
            y: Math.floor(params.basey + (j - 1 + 0.5) * params.psize)
        };
    },

    ppos: function(point, params) {
        var p = PE.Tinco.coordinates(point);
        return this.pos(p.x, p.y, params);
    },

    pointFromPos: function(x, y, board, width, height) {
        var params = this.initParams(null, board, width, height);
        x -= this.padding + this.border + params.coordL * params.psize;
        y -= this.padding + this.border + params.coordT * params.psize;
        var i = Math.floor(x / params.psize) + 1;
        var j = Math.floor(y / params.psize) + 1;
        if (i >= 1 && i <= board.xsize && j >= 1 && j <= board.ysize) {
            return PE.Tinco.point(i, j);
        } else {
            return null;
        }
    },

    draw: function(ctx, board, width, height) {
        var params = this.initParams(ctx, board, width, height);
        this.board(params);
    },

    initParams: function(ctx, board, width, height) {
        var coordL = 0;
        var coordT = 0;
        var coordR = 0;
        var coordB = 0;
        if (this.showCoordinates) {
            if (this.showCoordinates.left) {
                coordL = 1;
            }
            if (this.showCoordinates.top) {
                coordT = 1;
            }
            if (this.showCoordinates.right) {
                coordR = 1;
            }
            if (this.showCoordinates.bottom) {
                coordB = 1;
            }
        }
        var xppp = Math.floor((width - 2 * (this.padding + this.border)) / (board.xsize + coordL + coordR));
        var yppp = Math.floor((height - 2 * (this.padding + this.border)) / (board.ysize + coordT + coordB));
        var psize = Math.min(xppp, yppp);
        var params = { 
            ctx: ctx,
            board: board,
            psize: psize,
            basex: this.padding,
            basey: this.padding,
            coordL: coordL,
            coordT: coordT,
            coordR: coordR,
            coordB: coordB,
        }
        return params;
    },

    board: function(params) {
        params.ctx.fillStyle = "rgb(255,200,80)";
        params.ctx.fillRect(params.basex, params.basey, 
            (params.board.xsize + params.coordL + params.coordR) * params.psize + 2 * this.border, 
            (params.board.ysize + params.coordT + params.coordB) * params.psize + 2 * this.border);
        params.basex += this.border;
        params.basey += this.border;
        if (params.coordL > 0) {
            params.basex += params.psize;
        }
        if (params.coordT > 0) {
            params.basey += params.psize;
        }
        this.coordinates(params);
        this.grid(params);
        this.boardContent(params);
        this.markup(params);
        if (this.showVariations) {
            this.variations(params);
        }
        if (this.showLastMove && params.board.lastMove) {
            this.circle(params.board.lastMove, params);
        }
        this.dim(params);
        this.clear(params);
    },
    
    coordinates: function(params) {
        var i, j;
        if (this.showCoordinates) {
            if (this.showCoordinates.left) {
                for (j = 1; j <= params.board.ysize; j++) {
                    this.text(PE.Tinco.point(0, j), PE.Tinco.uiTextY(j, params.board.ysize), params);
                }
            }
            if (this.showCoordinates.top) {
                for (i = 1; i <= params.board.xsize; i++) {
                    this.text(PE.Tinco.point(i, 0), PE.Tinco.uiTextX(i, params.board.xsize), params);
                }
            }
            if (this.showCoordinates.right) {
                for (j = 1; j <= params.board.ysize; j++) {
                    this.text(PE.Tinco.point(params.board.xsize + 1, j), PE.Tinco.uiTextY(j, params.board.xsize), params);
                }
            }
            if (this.showCoordinates.bottom) {
                for (i = 1; i <= params.board.xsize; i++) {
                    this.text(PE.Tinco.point(i, params.board.ysize + 1), PE.Tinco.uiTextX(i, params.board.xsize), params);
                }
            }
        }
    },

    grid: function(params) {
        params.ctx.strokeStyle = 'rgb(0, 0, 0)';
        params.ctx.lineWidth = 2;
        params.ctx.beginPath();
        var lt = this.pos(1, 1, params);
        params.ctx.moveTo(lt.x, lt.y);
        var rt = this.pos(params.board.xsize, 1, params);
        params.ctx.lineTo(rt.x, rt.y);
        var rb = this.pos(params.board.xsize, params.board.ysize, params);
        params.ctx.lineTo(rb.x, rb.y);
        var lb = this.pos(1, params.board.ysize, params);
        params.ctx.lineTo(lb.x, lb.y);
        params.ctx.lineTo(lt.x, lt.y);
        params.ctx.stroke();

        params.ctx.lineWidth = 1;
        for (var i = 2; i <= params.board.xsize - 1; i++) {
            var l = this.pos(i, 1, params);
            params.ctx.moveTo(l.x + 0.5, l.y);
            var r = this.pos(i, params.board.ysize, params);
            params.ctx.lineTo(r.x + 0.5, r.y);
        }
        for (var j = 1; j <= params.board.ysize - 1; j++) {
            var t = this.pos(1, j, params);
            params.ctx.moveTo(t.x, t.y + 0.5);
            var b = this.pos(params.board.xsize, j, params);
            params.ctx.lineTo(b.x, b.y + 0.5);
        }
        params.ctx.stroke();
        params.ctx.fillStyle = 'rgb(0, 0, 0)';
        PE.each(params.board.starPoints, function(point) {
            params.ctx.beginPath();
            var p = this.ppos(point, params);
            params.ctx.arc(p.x, p.y, Math.min(3, params.psize * 0.1), 0, 2 * Math.PI, false);
            params.ctx.fill();
        }, this);
    },

    boardContent: function(params) {
        var hsize = Math.floor(params.psize / 2);
        for (var i = 1; i <= params.board.xsize; i += 1) {
            for (var j = 1; j <= params.board.ysize; j += 1) {
                var point = PE.Tinco.point(i, j);
                var color = params.board.getColor(point);
                var p = this.pos(i, j, params);
                if (color === 1) {
                    this.blackStone(params.ctx, p.x, p.y, hsize - 0.5);
                } else if (color === 2) {
                    this.whiteStone(params.ctx, p.x, p.y, hsize - 0.6);
                }
            }
        }
    },

    markup: function(params) {
        PE.each(params.board.markup, function(markup) {
            if (markup.type === 'label') {
                this.text(markup.point, markup.text, params);
            } else if (markup.type === 'circle') {
                this.pointMarkup(markup.points, this.circle, params);
            } else if (markup.type === 'square') {
                this.pointMarkup(markup.points, this.square, params);
            } else if (markup.type === 'cross') {
                this.pointMarkup(markup.points, this.cross, params);
            } else if (markup.type === 'triangle') {
                this.pointMarkup(markup.points, this.triangle, params);
            } else if (markup.type === 'select') {
                this.pointMarkup(markup.points, this.select, params);
            } else if (markup.type === 'blackterritory') {
                this.pointMarkup(markup.points, this.blackTerritory, params);
            } else if (markup.type === 'whiteterritory') {
                this.pointMarkup(markup.points, this.whiteTerritory, params);
            } else if (markup.type === 'line') {
                this.line(markup.from, markup.to, params);
            } else if (markup.type === 'arrow') {
                this.arrow(markup.from, markup.to, params);
            }
        }, this);
    },

    pointMarkup: function(points, f, params) {
        PE.each(points, function(point) {
            f.call(this, point, params);
        }, this);
    },

    variations: function(params) {
        if (params.board.variations.length > 1) {
            var c = 0;
            PE.each(params.board.variations, function(point) {
                var lb = PE.each(params.board.markup, function(markup) {
                    if (markup.type === 'label' && markup.point === point) {
                        return false;
                    }
                });
                if (lb < 0) {
                    this.text(point, String.fromCharCode(97 + c), params, 'rgb(50,50,255)');
                    c += 1;
                    if (c > 26) {
                        return false;
                    }
                }
            }, this);
        }
    },

    dim: function(params) {
        var hsize = Math.floor(params.psize / 2);
        PE.each(params.board.dimmed, function(point) {
            var p = this.ppos(point, params);
            params.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            params.ctx.fillRect(p.x - hsize, p.y - hsize, params.psize, params.psize);
        }, this);
    },

    clear: function(params) {
        if (!params.board.visible || params.board.visible.length === 0) {
            return;
        }
        var hsize = Math.floor(params.psize / 2);
        for (var i = 1; i <= params.board.xsize; i += 1) {
            for (var j = 1; j <= params.board.ysize; j += 1) {
                var point = PE.Tinco.point(i, j);
                if (params.board.visible.indexOf(point) < 0) {
                    var w = 0;
                    var xo = 0;
                    if (i === 1) {
                        w = this.border + params.psize * params.coordR;
                        xo = w;
                    } else if (i === params.board.xsize) {
                        w = this.border + params.psize * params.coordR;
                    }
                    var h = 0;
                    var yo = 0;
                    if (j === 1) {
                        h = this.border + params.psize * params.coordT;
                        yo = h;
                    } else if (j === params.board.ysize) {
                        h = this.border + params.psize * params.coordB;
                    }
                    var p = this.ppos(point, params);
                    params.ctx.clearRect(p.x - hsize - xo, p.y - hsize - yo, params.psize + w, params.psize + h);
                }
            }
        }
    },

    blackStone: function(ctx, x, y, rad) {
        var curveShadow = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.1, x, y, rad); 
        curveShadow.addColorStop(0, "rgb(90, 90, 90)"); 
        curveShadow.addColorStop(0.3, "rgb(50, 50, 50)"); 
        curveShadow.addColorStop(1, "rgb(0, 0, 0)"); 
        ctx.fillStyle = curveShadow;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
        ctx.fill();
    },

    whiteStone: function(ctx, x, y, rad) {
        var curveShadow = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.1, x, y, rad); 
        curveShadow.addColorStop(0, "rgb(255, 255, 255)"); 
        curveShadow.addColorStop(0.5, "rgb(235, 235, 235)"); 
        curveShadow.addColorStop(1, "rgb(180, 180, 180)");
        ctx.fillStyle = curveShadow;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
        ctx.fill();

        var edgeShadow = ctx.createRadialGradient(x, y, 0, x, y, rad); 
        edgeShadow.addColorStop(0, "rgba(0, 0, 0, 0)"); 
        edgeShadow.addColorStop(0.8, "rgba(240, 240, 240, 0)"); 
        edgeShadow.addColorStop(0.9, "rgba(160, 160, 160, 0.25)"); 
        edgeShadow.addColorStop(1, "rgba(140, 140, 140, 0.75)");
        ctx.fillStyle = edgeShadow;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
        ctx.fill();
    },

    text: function(point, s, params, color) {
        var p = this.ppos(point, params);
        var height = params.psize * 0.7;
        if (!color) {
            params.ctx.fillStyle = this.markupColor(point, params);
        } else {
            params.ctx.fillStyle = color;
        }
        this.putText(params.ctx, p.x, p.y, height, s)
    },
    
    putText: function(ctx, x, y, height, s) {
        ctx.font = height + 'px';
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.fillText(s, x, y + height * 0.36);
    },
    
    markupColor: function(point, params) {
        if (params.board.getColor(point) === 1) {
            return "rgb(255,255,255)";
        } else {
            return "rgb(0,0,0)";
        }
    },
    
    circle: function(point, params, color) {
        var p = this.ppos(point, params);
        if (color) {
            params.ctx.strokeStyle = color;
        } else {
            params.ctx.strokeStyle = this.markupColor(point, params);
        }
        params.ctx.lineWidth = 1;
        params.ctx.beginPath();
        params.ctx.arc(p.x, p.y, params.psize * 0.3, 0, Math.PI * 2, false);
        params.ctx.stroke();
    },

    square: function(point, params) {
        var p = this.ppos(point, params);
        params.ctx.strokeStyle = this.markupColor(point, params);
        params.ctx.lineWidth = 1;
        var sz = Math.floor(params.psize * 0.25);
        params.ctx.strokeRect(p.x - sz + 0.5, p.y - sz + 0.5, sz * 2, sz * 2);
    },

    cross: function(point, params) {
        var p = this.ppos(point, params);
        params.ctx.strokeStyle = this.markupColor(point, params);
        params.ctx.lineWidth = 1;
        var sz = Math.floor(params.psize * 0.3);
        params.ctx.beginPath();
        params.ctx.moveTo(p.x - sz, p.y - sz);
        params.ctx.lineTo(p.x + sz, p.y + sz);
        params.ctx.moveTo(p.x + sz, p.y - sz);
        params.ctx.lineTo(p.x - sz, p.y + sz);
        params.ctx.stroke();
    },

    triangle: function(point, params) {
        var p = this.ppos(point, params);
        params.ctx.strokeStyle = this.markupColor(point, params);
        params.ctx.lineWidth = 1;
        var sz = Math.floor(params.psize * 0.4);
        params.ctx.beginPath();
        params.ctx.moveTo(p.x, p.y - sz);
        params.ctx.lineTo(p.x + sz * 0.866, p.y + sz / 2);
        params.ctx.lineTo(p.x - sz * 0.866, p.y + sz / 2);
        params.ctx.lineTo(p.x, p.y - sz);
        params.ctx.stroke();
    },

    select: function(point, params) {
        var p = this.ppos(point, params);
        params.ctx.fillStyle = 'rgb(50,50,255)';
        var sz = Math.floor(params.psize * 0.2);
        params.ctx.fillRect(p.x - sz, p.y - sz, sz * 2, sz * 2);
    },

    blackTerritory: function(point, params) {
        this.territory(point, params, 'rgb(0,0,0)');
    },

    whiteTerritory: function(point, params) {
        this.territory(point, params, 'rgb(255,255,255)');
    },

    territory: function(point, params, color) {
        var p = this.ppos(point, params);
        params.ctx.fillStyle = color;
        params.ctx.beginPath();
        params.ctx.arc(p.x, p.y, params.psize * 0.2, 0, Math.PI * 2, false);
        params.ctx.fill();
    },

    line: function(from, to, params) {
        var f = this.ppos(from, params);
        var t = this.ppos(to, params);
        params.ctx.strokeStyle = 'rgb(50,50,255)';
        params.ctx.lineWidth = Math.min(4, params.psize * 0.1);
        params.ctx.beginPath();
        params.ctx.moveTo(f.x, f.y);
        params.ctx.lineTo(t.x, t.y);
        params.ctx.stroke();
    },

    arrow: function(from, to, params) {
        this.line(from, to, params);
        if (from !== to) {
            var f = this.ppos(from, params);
            var t = this.ppos(to, params);
            var a = Math.atan2(t.x - f.x, t.y - f.y);
            var spread = Math.PI / 16;
            var len = params.psize * 0.5;
            params.ctx.beginPath();
            params.ctx.moveTo(t.x, t.y);
            params.ctx.lineTo(t.x + Math.sin(a - Math.PI + spread) * len, t.y + Math.cos(a - Math.PI + spread) * len);
            params.ctx.moveTo(t.x, t.y);
            params.ctx.lineTo(t.x + Math.sin(a - Math.PI - spread) * len, t.y + Math.cos(a - Math.PI - spread) * len);
            params.ctx.stroke();
        }
    }

};

PE.Tinco.Render.TreeRenderer = function(config) {
    if (config) {
        this.interpreter = config.interpreter;
    }
    return this;
};

PE.Tinco.Render.TreeRenderer.prototype = {
    stoneSize: 25,
    spacing: 15,
    padding: 10,

    interpreter: null,

    draw: function(ctx, root, selected) {
        var endNode = this.interpreter.endNode;
        var vertBottom = null;  // highlighted vertical line bottom 
                                // (drawn with parent because the last child will overwrite the vertical line)
        this.traverse(root, function(node, level, h, height) {
            var p = this.pos(level, h);

            ctx.lineWidth = 3;
            if (node === endNode) { // highlighted path
                ctx.strokeStyle = 'rgb(100,100,255)';
                if (vertBottom) { // there is defered vertical line
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    var p2 = this.pos(level, vertBottom);
                    ctx.lineTo(p2.x, p2.y); // vertical line from parent if needed
                    ctx.stroke();
                }
            } else { // regular path
                ctx.strokeStyle = 'rgb(0,0,0)';
            }
            if (level > 0) {
                var h2 = height[level - 1] + 1;
                var p2 = this.pos(level - 1, Math.max(h - 1, h2));
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y); // line to parent or line at 45 degrees
                if (node === endNode) { // highlighted path
                    endNode = endNode.prev;
                    if (h > h2) { // vertical line to parent if needed
                        vertBottom = h - 1; // defer to when the parent is drawn
                    } else {
                        vertBottom = null;
                    }
                } else { // regular path
                    if (h > h2) { // vertical line to parent if needed
                        p2 = this.pos(level - 1, h2);
                        ctx.lineTo(p2.x, p2.y);
                    }
                }
                ctx.stroke();
            }

            if (node === selected) {
                ctx.fillStyle = 'rgb(100,100,255)';
                var sz = this.stoneSize + this.spacing - 2;
                ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
            }

            if (this.interpreter.isBlackMove(node)) {
                PE.Tinco.Render.BoardRenderer.prototype.blackStone(ctx, p.x, p.y, this.stoneSize / 2);
                ctx.fillStyle = 'rgb(255,255,255)';
                var moveNo = this.interpreter.buildBoard(node).moveNo;
                PE.Tinco.Render.BoardRenderer.prototype.putText(ctx, p.x, p.y, this.stoneSize / 2, moveNo);
            } else if (this.interpreter.isWhiteMove(node)) {
                PE.Tinco.Render.BoardRenderer.prototype.whiteStone(ctx, p.x, p.y, this.stoneSize / 2);
                ctx.fillStyle = 'rgb(0,0,0)';
                var moveNo = this.interpreter.buildBoard(node).moveNo;
                PE.Tinco.Render.BoardRenderer.prototype.putText(ctx, p.x, p.y, this.stoneSize / 2, moveNo);
            } else {
                ctx.strokeStyle = 'rgb(0,0,0)';
                ctx.lineWidth = 1;
                var sz = this.stoneSize / 2;
                ctx.strokeRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
            }
        });
    },
    
    traverse: function(root, f, thisObj) {
        var height = [0];
        this.walkBottomUpDepthFirst(root, function(node, level) {
            while (height.length <= level) {
                var h = height[height.length - 1];
                height.push(h);
            }
            var h = height[level] + 1;
            for (var i = level; i < height.length; i += 1) {
                height[i] = Math.max(height[i], h);
            }
            
            var h = height[level];
            if (level < height.length - 1 && height[level + 1] - 1 > height[level]) {
                height[level] = height[level + 1] - 1;
            }

            if (f.call(this, node, level, h, height) === false) {
                return false;
            }
        }, this);
    },

    pos: function(l, h) {
        return {
            x: this.padding + l * (this.stoneSize + this.spacing) + this.stoneSize / 2,
            y: this.padding + (h - 1) * (this.stoneSize + this.spacing) + this.stoneSize / 2
        }
    },

    nodeFromPos: function(x, y, root) {
        var node = null;
        this.traverse(root, function(n, level, h) {
            var p = this.pos(level, h);
            if (Math.abs(p.x - x) <= this.stoneSize / 2 && Math.abs(p.y - y) <= this.stoneSize / 2) {
                node = n;
                return false;
            }
        });
        return node;
    },

    measure: function(root) {
        var maxLevel = 0;
        var maxBreadth = 0;
        this.traverse(root, function(node, level, h) {
            if (level > maxLevel) {
                maxLevel = level;
            }
            if (h > maxBreadth) {
                maxBreadth = h;
            }
        });
        return { 
            width: this.padding * 2 + (maxLevel + 1) * this.stoneSize + maxLevel * this.spacing,
            height: this.padding * 2 + maxBreadth * this.stoneSize + (maxBreadth - 1) * this.spacing
        };
    },

    walkBottomUpDepthFirst: function(root, f, thisObj, level) {
        level = level || 0;
        var r = PE.each(root.next, function(child) {
            if (this.walkBottomUpDepthFirst(child, f, thisObj, level + 1) === false) {
                return false;
            }
        }, this);
        if (r >= 0) {
            return false;
        }
        if (f.call(thisObj || root, root, level) === false) {
            return false;
        }
    }
};

PE.Tinco.Render.MoveInfoRenderer = function() {
    return this;
};

PE.Tinco.Render.MoveInfoRenderer.prototype = {
    text: function(board, node, interpreter) {
        if (interpreter.isMove(node)) {
            var p = PE.Tinco.coordinates(board.lastMove);
            return 'Move ' + board.moveNo + ': ' + PE.Tinco.uiText(p.x, p.y, board.xsize, board.ysize) + board.moveAnnotation;
        }
        return '';
    }
};

PE.Tinco.Render.CommentRenderer = function() {
    return this;
};

PE.Tinco.Render.CommentRenderer.prototype = {
    html: function(board, node) {
        var s = '';
        if (board.name) {
            s += '<span style="color:#3232FF; font-weight:bold;">' + board.name + '</span><br/>';
        }
        if (board.posAnnotation) {
            s += '<span style="color:#3232FF;">';
            switch (board.posAnnotation.pos) {
                case 'even' : s += 'Even position'; break;
                case 'black' : s += board.posAnnotation.value === 2 ? 'Very good for Black' : 'Good for Black'; break;
                case 'white' : s += board.posAnnotation.value === 2 ? 'Very good for White' : 'Good for White'; break;
                case 'unclear' : s += 'Unclear position'; break;
            }
            s += '</span><br/>';
        }
        var bc = board.comment.replace(/\n\r/g, "<br/>").replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/\r/g, "<br/>");
        return s + bc;
    },
};

PE.Tinco.Render.PlayerRenderer = function() {
    return this;
};

PE.Tinco.Render.PlayerRenderer.prototype = {
    name: function(board, color) {
        var player = color === 1 ? board.gameInfo.black : board.gameInfo.white;
        var s = '';
        if (player) {
            if (player.name) {
                s += player.name;
            } else {
                s += 'Unknown';
            }
            if (player.rank) {
                s += ' [' + player.rank + ']';
            }
        } else {
            s += 'Unknown';
        }
        return s;
    },
    captured: function(board, color) {
        return 'captured: ' + board.getCaptured()[2 - color];
    }
};
