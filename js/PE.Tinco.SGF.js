
PE.Tinco.SGF = function(str) {
    this.trees = [];
    if (str) {
        this.str = str;
        this.index = 0;
        this.parseCollection();
        delete this.str;
        delete this.index;
    }
    return this;
}

PE.Tinco.SGF.prototype = {
    trees: null,

    parseCollection: function() {
        while (this.index < this.str.length) {
            if (this.str[this.index] == '(') {
                this.trees.push(this.parseTree(this.trees.length + ''));
            } else {
                this.index++;
            }
        }
    },

    parseTree: function(parentID) {
        this.index++; // skip '('
        var root = null;
        var node = root;
        while (this.index < this.str.length) {
            var c = this.str[this.index];
            switch (c) {
                case '(' : 
                    var n = this.parseTree(node.id + '.' + node.next.length);
                    n.prev = node;
                    node.next.push(n);
                    break;
                case ';' :
                    var n = this.parseNode();
                    if (root == null) {
                        root = n;
                        root.id = parentID + '.0';
                    } else {
                        node.next.push(n);
                        n.prev = node;
                        var prevID = node.id.split('.');
                        prevID[prevID.length - 1] = parseInt(prevID[prevID.length - 1]) + 1 + '';
                        n.id = prevID.join('.');
                    }
                    node = n;
                    break;
                case ')' : 
                    this.index++;
                    return root;
                default: 
                    this.index++;
                    break;
            }
        }
        return root;
    },

    parseNode: function() {
        this.index++; // skip ';'
        var node = new PE.Tinco.SGF.Node();
        while (this.index < this.str.length) {
            var c = this.str[this.index];
            if (c == ';' || c == '(' || c == ')') {
                break;
            }
            var prop = this.parseProperty();
            node.properties[prop.key] = prop.values;
        }
        return node;
    },

    parseProperty: function() {
        var prop = { key : '', values : [] };
        while (this.index < this.str.length) {
            var c = this.str[this.index];
            if (c >= 'A' && c <= 'Z') {
                prop.key += c;
            } else if (c == '[') {
                break;
            }
            this.index++;
        }
        while (this.index < this.str.length) {
            var c = this.str[this.index];
            if (c == '[') {
                prop.values.push(this.parseValue())
            } else if (c == ';' || c == '(' || c == ')' || c >= 'A' && c <= 'Z') {
                break;
            } else {
                this.index++;
            }
        }
        return prop;
    },

    parseValue: function() {
        this.index++; // skip '['
        var value = '';
        var escape = false;
        while (this.index < this.str.length) {
            var c = this.str[this.index];
            if (escape) {
                if (c !== '\n' && c !== '\r') {
                    value += c;
                } else if (this.index < this.str.length - 1) {
                    if (c === '\n' && this.str[this.index + 1] === '\r'
                            || c === '\r' && this.str[this.index + 1] === '\n') {
                        this.index += 1;
                    }
                }
                escape = false;
            } else {
                if (c === '\\') {
                    escape = true;
                } else if (c === ']') {
                    this.index++;
                    return value;
                } else {
                    value += c;
                }
            }
            this.index++;
        }
        return value;
    }
}

PE.Tinco.SGF.Node = function() {
    this.properties = {};
    this.next = [];
    return this;
}

PE.Tinco.SGF.Node.prototype = {
    id: null,
    properties: null,
    next: null,
    prev: null,

    toString: function() {
        var s = ';';
        for (var key in this.properties) {
            s += key;
            if (this.properties[key].length == 0) {
                s += '[]';
            } else {
                var values = this.properties[key];
                for (var i = 0; i < values.length; i++) {
                    s += '[' + values[i] + ']';
                }
            }
        }
        if (this.next.length == 1) {
            s += this.next[0].toString();
        } else {
            for (var i = 0; i < this.next.length; i++) {
                s += '(' + this.next[i].toString() + ')';
            }
        }
        return s;
    }
}
