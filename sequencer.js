function Sequencer(assertOk, log) {
    log = log || function() { console.log.apply(console, arguments); };
    var self = this;
    var sequence = [];
    var properties = [];     // { name: "", get: f() }
    var postConditions = []; // { name: "", check: f() }
    var depth = 0;
    var onCall = function(name, args) {};

    /**
     * Switch to "monitor" mode. Use this to capture the expected
     * sequence in the OLD implementation.
     */
    this.monitor = function(f) {
        sequence = [];
        onCall = function(name, args) {
            sequence.push(captureCall(name, args, depth));
        };
        f();
        onCall = function() {};
        capturePostConditions();
    };

    function verifyPostConditions() {
        postConditions.map(function(condition) {
            condition.check();
        });
    };

    function capturePostConditions() {
        properties.map(function(prop) {
            var expected = prop.get();
            postConditions.push({
                name: prop.name,
                check: function() {
                    var actual = prop.get();
                    var msg = "Post condition: " + prop.name + ". Expected: " + expected + " Actual: " + actual;
                    if (expected && expected.equals) {
                        assertOk(expected.equals(actual), msg);
                    }
                    else {
                        assertOk(expected == actual, msg);
                    }
                }
            })
        });
    }


    /**
     * Switch to "verify" mode. Use this to verify that the new
     * implementation calls dependencies in the same order, and with
     * the same arguments, as the old implementation.
     */
    this.verify = function(f) {
        onCall = function(name, args, depth) {
            var expected = sequence.shift();
            var actual = captureCall(name, args, depth);
            assertOk(expected.equals(actual), "expected: " + expected + ", actual: " + actual);
        }
        f();
        assertOk(sequence.length == 0, "Must complete entire sequence.");
        if (sequence.length > 0) {
            assertOk(false, "First uncalled: " + sequence[0]);
        }
        verifyPostConditions();
        onCall = function() {};
    }

    /**
     * Dumps a record of all the calls captured during monitor. Note
     * that this will 
     */
    this.dump = function() {
        sequence.map(function(check) {
            var line = new Array(check.depth + 1).join("    ");
            line += check.name + "(" + check.args.join(",") + ")"
            log(line);
        });        
    };

    /**
     * Creates a dummy function that monitors calls.
     */
    this.mock = function(fname, value) {
        return wrapf(null, function() { return value; }, fname);
    };

    /**
     * Create a new constructor that returns instances that monitor
     * mutations and function calls.
     */
    this.wrapConstructor = function(c) {
        // Create new constructor.
        var constructor = function() {
            onCall(c.name, arguments);
            depth++
            var o = {};
            c.apply(o, arguments);
            self.wrapAll(o);
            depth--;
            return o;
        };

        // Copy 'static' methods/properties to new constructor.
        for (var p in c) {
            if (typeof c[p] == 'function') {
                constructor[p] = wrapf(c, c[p], p);
            }
        }
        return constructor;
    };

    /**
     * Wraps an object property such that mutations and calls are
     * monitored.
     */
    this.wrap = function(o, p, v) {
        switch (typeof o[p]) {
        case 'function':
            o[p] = wrapf(o, o[p], p);
            break;
        default:
            wrapp(o, p, v);
            break;
        }
    };

    /**
     * Wrap all properties of the given object.
     */
    this.wrapAll = function() {
        var args = Array.prototype.slice.call(arguments);
        var o = args.shift();
        var exceptions = args;
        for (var p in o) {
            if (exceptions.indexOf(p) == -1) {
                self.wrap(o, p);
            }
        }
        return o;
    };

    /**
     * Recursively wrap all properties of the given object.
     */
    this.deepWrapAll = function(o) {
        for (var p in o) {
            self.wrap(o, p, self.deepWrapAll(o[p]));
        }
        return o;            
    };

    /**
     * NOT INTENDED FOR USE BY CLIENT CODE.
     * Expose the sequence for testing. 
     */
    this.getSequence = function() {
        return sequence;
    };

    /* Redefines the given object & property such that mutations are
     * modified.
     */
    function wrapp(o, p, v) {
        properties.push({
            name: p,
            get: function() { return o[p]; }
        });
    }        

    /* Returns a wrapped function that monitors calls and parameters.
     */
    function wrapf(o, f, name) {
        name = name || f.name;
        return function() {
            onCall(name, arguments);
            depth++;
            var v = f.apply(o, arguments);
            depth--;
            return v;
        };
    };

    /* Formats a function call or data mutation for verification.
     */
    function captureCall(name, args, depth) {
        args = Array.prototype.slice.call(args); // Convert to array.
        depth = depth || 0;
        return {
            depth: depth,
            name: name,
            args: args.map(function(arg) { return "" + arg; }),
            toString: function() {
                var msg = this.name + "(" + this.args.join(",") + ")";
                return msg;
            },
            equals: function(call) {
                return this.toString() == call.toString();
            }
        };            
    }        
}
