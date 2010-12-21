if (!window["PE"]) {
    window["PE"] = {};
}

PE.each = function(array, fn, scope) {
    if (typeof array === 'undefined' || array === null) {
        return null;
    }
    if (array.toString() !== '[object Array]' && !array.callee && typeof array.length !== 'number') {
        array = [array];
    }
    for (var i = 0, len = array.length; i < len; i += 1) {
        if (fn.call(scope || array[i], array[i], i, array) === false) {
            return i;
        }
    }
    return -1;
};

PE.enumerate = function(obj, fn, scope) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            if (fn.call(scope || obj[p], obj[p], p, obj) === false) {
                return p;
            }
        }
    }
};

PE.apply = function(o, c) {
    if (o && c && typeof c == 'object') {
        for (var p in c) {
            o[p] = c[p];
        }
    }
    return o;
};

