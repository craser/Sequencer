function Sequencer(assertOk) {
    var self = this;
    var seq = 0;
    var checks = [];

    this.onCall = function(name, args) {};

    /**
     * Switch to "monitor" mode. Use this to capture the expected
     * sequence in the OLD implementation.
     */
    this.monitor = function() {
        seq = 0;
        this.onCall = function(name, args) {
            checks[seq] = formatCall(name, args);
            seq++;
        };
    };

    /**
     * Switch to "verify" mode. Use this to verify that the new
     * implementation calls dependencies in the same order, and with
     * the same arguments, as the old implementation.
     */
    this.verify = function() {
        seq = 0;
        this.onCall = function(name, args) {
            var expected = checks[seq];
            var actual = formatCall(name, args);
            assertOk(expected == actual, "expected: " + expected + ", actual: " + actual);
            seq++;
        }
    }

    /**
     * Confirms that we got through the entire sequence.
     */
    this.done = function() {
        assertOk(seq == checks.length, "Must complete entire sequence. Stopped at " + seq + "/" + checks.length);
    };
    
    this.mock = function(fname) {
        return wrapf(null, function() {}, fname);
    };

    this.wrap = function(o, fname) {
        var f = o[fname];
        o[fname] = wrapf(o, f, fname);
    };

    this.wrapConstructor = function(c) {
        var constructor = function() {
            self.onCall(c.name, arguments);
            var o = {};
            c.apply(o, arguments);
            for (var p in o) {
                if (typeof o[p] == 'function') {
                    o[p] = wrapf(o, o[p], p);
                }
                else {
                    self.wrapProperty(o, p, c[p]);
                }
            }

            return o;
        };
        for (var p in c) {
            if (typeof c[p] == 'function') {
                console.log("static: " + p);
                constructor[p] = wrapf(c, c[p], p);
            }
        }
        return constructor;
    };

    this.wrapProperty = function(o, p, v) {
        var onSet = self.mock("set: " + p);
        var value =  v || o[p];
        console.log("wrapping: " + p  + ": " + v);
        Object.defineProperty(o, p, {
            set: function(v) { onSet(v); value = v; },
            get: function() { return value; }
        });
    };

    this.wrapObject = function(o) {
        for (var p in o) {
            if (typeof o[p] == 'function') {
                o[p] = wrapf(o, o[p], p);
            }
            else {
                self.wrapProperty(o, p);
            }
        }
        return o;
    };

    /**
     * This is only HALF-smart. BEWARE circular object references.
     */
    this.deepWrapObject = function(o) {
        for (var p in o) {
            if (!p) continue;
            switch (typeof o[p]) {
            case 'function':
                o[p] = wrapf(o, o[p], p);
                break;
            case 'undefined':
                continue;
                break;
            default:
                self.wrapProperty(o, p, self.deepWrapObject(o[p]));
            }
        }
        return o;            
    };
        
    function wrapf(o, f, name) {
        name = name || f.name;
        return function() {
            self.onCall(name, arguments);
            return f.apply(o, arguments);
        };
    };

    function formatCall(name, args) {
        var msg = "(" + seq +") " + name + "(";
        for (var i = 0; i < args.length; i++) {
            msg += args[i];
        }
        msg += ")";
        return msg;
    }        
}
