Ext.namespace('PE.Tinco.UI');

PE.Tinco.UI.Viewer = function() {
    if (!Ext.util.CSS.getRule('player-bstone')) {
        Ext.util.CSS.createStyleSheet('.player-bstone { background-image: url(images/b.svg) !important; background-size: 32px 32px; background-repeat:no-repeat; }');
    }
    if (!Ext.util.CSS.getRule('player-wstone')) {
        Ext.util.CSS.createStyleSheet('.player-wstone { background-image: url(images/w.svg) !important; background-size: 32px 32px; background-repeat:no-repeat; }');
    }
    if (!Ext.util.CSS.getRule('header-bstone')) {
        Ext.util.CSS.createStyleSheet('.header-bstone { background-image: url(images/b.svg) !important; background-size: 14px 14px; background-repeat:no-repeat; }');
    }
    if (!Ext.util.CSS.getRule('header-wstone')) {
        Ext.util.CSS.createStyleSheet('.header-wstone { background-image: url(images/w.svg) !important; background-size: 14px 14px; background-repeat:no-repeat; }');
    }
    var BoardView = Ext.extend(Ext.ux.Canvas, { 
        draw: function(board) {
            if (board) {
                this.board = board;
            } else if (!this.board) {
                return;
            }
            if (!this.ctx) {
                return;
            }
            this.renderer.draw(this.ctx, this.board, this.canvas.width, this.canvas.height);
        }
    });
    var TreeView = Ext.extend(Ext.ux.Canvas, { 
        draw: function(root, node, currentVariation) {
            if (root) {
                this.root = root;
            } else if (!this.root) {
                return;
            }
            if (!this.canvas) {
                return;
            }
            var size = this.renderer.measure(this.root);
            this.canvas.width = size.width;
            this.canvas.height = size.height;
            if (this.root && this.ctx) {
                this.renderer.draw(this.ctx, this.root, node, currentVariation);
            }
        }
    });
    return {
        init: function(sgfString) {
            var sgf = new PE.Tinco.SGF(sgfString);

            var moveInfoRenderer = new PE.Tinco.Render.MoveInfoRenderer();
            var commentRenderer = new PE.Tinco.Render.CommentRenderer();
            var boardRenderer = new PE.Tinco.Render.BoardRenderer();
            var playerRenderer = new PE.Tinco.Render.PlayerRenderer();

            var interpreter = new PE.Tinco.Interpreter({ sgf: sgf });
            var moveTool = new PE.Tinco.Action.SelectMove({ interpreter: interpreter });
            var treeRenderer = new PE.Tinco.Render.TreeRenderer({ interpreter: interpreter });

            var boardCanvas = new BoardView({ renderer: boardRenderer });
            var treeCanvas = new TreeView({ renderer: treeRenderer });
            var comments = new Ext.Panel({ flex: 1, header: true, autoScroll: true });
            var blackName = new Ext.Toolbar.TextItem();
            var blackCaptured = new Ext.Toolbar.TextItem();
            var blackIcon = new Ext.Button({ iconCls: 'player-bstone', disabledClass: 'x-btn-text', disabled: true, scale: 'large' });
            var blackInfo = new Ext.Toolbar({ items: [blackIcon, ' ', ' ', blackName, '->', blackCaptured] });
            var whiteName = new Ext.Toolbar.TextItem();
            var whiteCaptured = new Ext.Toolbar.TextItem();
            var whiteIcon = new Ext.Button({ iconCls: 'player-wstone', disabledClass: 'x-btn-text', disabled: true, scale: 'large' });
            var whiteInfo = new Ext.Toolbar({ items: [whiteIcon, ' ', ' ', whiteName, '->', whiteCaptured] });

            var firstButton = new Ext.Button({ icon: 'images/Backward_01.png', scale: 'large', });
            var prevButton = new Ext.Button({ icon: 'images/Backward.png', scale: 'large', });
            var nextButton = new Ext.Button({ icon: 'images/Forward.png', scale: 'large', });
            var lastButton = new Ext.Button({ icon: 'images/Forward_01.png', scale: 'large', });
            var prevGameButton = new Ext.Button({ icon: 'images/object_08.png', scale: 'large', });
            var nextGameButton = new Ext.Button({ icon: 'images/object_09.png', scale: 'large', });
            var navToolbar = new Ext.Toolbar({
                items: [firstButton, prevButton, nextButton, lastButton]
            });
            if (sgf.trees.length > 1) {
                navToolbar.add('->');
                navToolbar.add(prevGameButton);
                navToolbar.add(nextGameButton);
            }

            interpreter.addListener(function(board) {
                boardCanvas.draw(board);
            });
            interpreter.addListener(function updateTree(board, node, tree) {
                treeCanvas.draw(tree, node);
            });
            interpreter.addListener(function updateComments(board, node, tree, interpreter) {
                if (!comments.rendered) {
                    comments.on('render', updateComments.createDelegate(this, [board, node, tree, interpreter]), this, { single: true });
                    return;
                }
                comments.update({ html: commentRenderer.html(board) });
                var iconClass = ' ';
                if (interpreter.isMove(node)) {
                    iconClass = board.lastColor === 1 ? 'header-bstone' : 'header-wstone';
                }
                comments.setTitle(moveInfoRenderer.text(board, node, interpreter), iconClass);
            });
            interpreter.addListener(function updateBlack(board) {
                if (!blackInfo.rendered) {
                    blackInfo.on('render', updateBlack.createDelegate(this, [board]), this, { single: true });
                    return;
                }
                blackName.setText('<h1>' + playerRenderer.name(board, 1) + '</h1>');
                blackCaptured.setText('<b>' + playerRenderer.captured(board, 1) + '</b>');
                if (board.nextColor === 1) {
                    blackIcon.toggle(true);
                    whiteIcon.toggle(false);
                }
            });
            interpreter.addListener(function updateWhite(board) {
                if (!whiteInfo.rendered) {
                    whiteInfo.on('render', updateWhite.createDelegate(this, [board]), this, { single: true });
                    return;
                }
                whiteName.setText('<h1>' + playerRenderer.name(board, 2) + '</h1>');
                whiteCaptured.setText('<b>' + playerRenderer.captured(board, 2) + '</b>');
                if (board.nextColor === 2) {
                    blackIcon.toggle(false);
                    whiteIcon.toggle(true);
                }
            });
            interpreter.addListener(function(board, node, tree, interpreter) {
                firstButton.setDisabled(!node.prev);
                prevButton.setDisabled(!node.prev);
                nextButton.setDisabled(node.next.length === 0);
                lastButton.setDisabled(node.next.length === 0);
                prevGameButton.setDisabled(interpreter.tree === 0);
                nextGameButton.setDisabled(interpreter.tree >= interpreter.trees.length - 1);
            });

            firstButton.on('click', function() {
                interpreter.firstNode();
            });
            prevButton.on('click', function() {
                interpreter.prevNode();
            });
            nextButton.on('click', function() {
                interpreter.nextNode();
            });
            lastButton.on('click', function() {
                interpreter.lastNode();
            });
            nextGameButton.on('click', function() {
                interpreter.nextTree();
            });
            prevGameButton.on('click', function() {
                interpreter.prevTree();
            });
            var map = new Ext.KeyMap(document, [{
                key: Ext.EventObject.LEFT,
                fn: function() { interpreter.prevNode(); }
            }, {
                key: Ext.EventObject.RIGHT,
                fn: function() { interpreter.nextNode(); }
            }, {
                key: Ext.EventObject.HOME,
                fn: function() { interpreter.firstNode(); }
            }, {
                key: Ext.EventObject.END,
                fn: function() { interpreter.lastNode(); }
            }, {
                key: Ext.EventObject.UP,
                fn: function() { 
                    var v = interpreter.getVariation(); 
                    if (v > 0) {
                        interpreter.endNode = interpreter.descend(interpreter.node.next[v - 1]);
                        interpreter.nodeChanged();
                    }
                }
            }, {
                key: Ext.EventObject.DOWN,
                fn: function() { 
                    var v = interpreter.getVariation(); 
                    if (v < interpreter.node.next.length - 1) {
                        interpreter.endNode = interpreter.descend(interpreter.node.next[v + 1]);
                        interpreter.nodeChanged();
                    }
                }
            }], "keypress");

            boardCanvas.on('afterrender', function() { 
                this.el.on('click', function(e, t) { 
                    var clientX = e.getPageX() - Ext.lib.Dom.getX(t);
                    var clientY = e.getPageY() - Ext.lib.Dom.getY(t);
                    var point = boardCanvas.renderer.pointFromPos(clientX, clientY, boardCanvas.board, boardCanvas.canvas.width, boardCanvas.canvas.height);
                    if (point !== null) {
                        moveTool.execute(point);
                    }
                }); 
            });

            treeCanvas.on('afterrender', function() { 
                this.el.on('click', function(e, t) { 
                    var clientX = e.getPageX() - Ext.lib.Dom.getX(t);
                    var clientY = e.getPageY() - Ext.lib.Dom.getY(t);
                    var node = treeCanvas.renderer.nodeFromPos(clientX, clientY, treeCanvas.root);
                    if (node !== null) {
                        interpreter.goToNode(node);
                    }
                }); 
            });

            var viewport = new Ext.Viewport({
                layout: 'border',
                items: [{
                    region: 'north',
                    html: '<h1 class="x-panel-header">Board Viewer</h1>',
                    autoHeight: true,
                    border: false,
                    margins: '0 0 5 0'
                }, {
                    region: 'east',
                    collapsible: true,
                    width: 300,
                    title: 'Tools',

                    layout:'vbox',
                    layoutConfig: {
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [blackInfo, whiteInfo, comments, navToolbar]
                },
                new Ext.Panel({
                    region: 'south',
                    title: 'Tree',
                    collapsible: true,
                    split: true,
                    height: 250,
                    minHeight: 100,
                    autoScroll: true,
                    items: [treeCanvas]
                }),
                Ext.apply(boardCanvas, { region: 'center' })]
            });
        }
    };
}();
