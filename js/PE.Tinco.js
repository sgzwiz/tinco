if (!PE["Tinco"]) {
    PE["Tinco"] = {};
}

PE.Tinco.PointSet = function() {
    this.items = {};
};

PE.Tinco.point = function(x, y) {
    if (x !== null && y !== null) {
        return String.fromCharCode(64 + x) + String.fromCharCode(64 + y);
    }
    return '';
};

PE.Tinco.coordinates = function(point) {
    if (point !== '') {
        return { x: point.charCodeAt(0) - 64, y: point.charCodeAt(1) - 64 };
    }
    return { x: null, y: null };
};

PE.Tinco.uiTextY = function(y, ysize) {
    if (y !== null) {
        return '' + (ysize - y + 1);
    }
    return '';
};

PE.Tinco.uiTextX = function(x, xsize) {
    if (x !== null) {
        var xp = x;
        if (x <= 8) {
            xp = x;
        } else if (x <= 25) {
            xp = x + 1;
        } else if (x <= 25 + 8) {
            xp = x - 25;
        } else if (x <= 25 + 25) {
            xp = x - 25 + 1;
        } else {
            return '';
        }
        var c = String.fromCharCode(64 + xp);
        if (x <= 25) {
            return c;
        } else {
            return c + c;
        }
    }
    return '';
};

PE.Tinco.uiText = function(x, y, xsize, ysize) {
    if (x !== null && y !== null) {
        return PE.Tinco.uiTextX(x, xsize) + PE.Tinco.uiTextY(y, ysize);
    }
    return 'Pass';
};

PE.Tinco.PointSet.prototype = {
    size: 0,
    items: {},
    add: function(v) {
        if (!this.items[v]) {
            this.size += 1;
        }
        this.items[v] = true;
    },
    remove: function(v) {
        if (this.items[v]) {
            this.size -= 1;
        }
        delete this.items[v];
    },
    contains: function(v) {
        return !!this.items[v];
    },
    get: function() {
        for (var v in this.items) {
            if (this.items.hasOwnProperty(v)) {
                return v;
            }
        }
    },
    each: function(fn, scope) {
        for (var v in this.items) {
            if (this.items.hasOwnProperty(v)) {
                if (fn.call(scope || v, v, this) === false) {
                    break;
                }
            }
        }
    },

    toString: function() {
        var s = '{ ';
        this.each(function(v) {
            s += v + ' ';
        }, this);
        return s + '}';
    }
};

