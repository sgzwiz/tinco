PE.Tinco.Action = {};

PE.Tinco.Action.SelectMove = function(config) {
    if (config) {
        this.interpreter = config.interpreter;
    }
};

PE.Tinco.Action.SelectMove.prototype = {
    interpreter: null,

    execute: function(point) {
        var thisNode = this.interpreter.node;
        var nextNodes = thisNode.next;
        for (var i = 0; i < nextNodes.length; i += 1) {
            if (this.interpreter.isMove(nextNodes[i])) {
                if (this.interpreter.movePoint(nextNodes[i], this.interpreter.getBoard()) === point) {
                    this.interpreter.nextNode(i);
                    return true;
                }
            }
        }
        return false;
    }
}

PE.Tinco.Action.Move = function(config) {
    if (config) {
        this.interpreter = config.interpreter;
    }
};

PE.Tinco.Action.Move.prototype = {
    interpreter: null,
    nextColor: null,

    execute: function(point) {
        if (PE.Tinco.Action.SelectMove.prototype.execute(point)) {
            this.nextColor = this.interpreter.getBoard().nextColor;
            return true;
        }
//        var newNode = this.interpreter.createNode();
//        this.interpreter.
    }
}