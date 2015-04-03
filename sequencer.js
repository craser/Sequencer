function Sequencer(assertOk) {
    var self = this;
    var seq = 0;
    var checks = [];
    var onCall = function(name, args) {};

    /**
     * Switch to "monitor" mode. Use this to capture the expected
     * sequence in the OLD implementation.
     */
    this.monitor = function() {
        seq = 0;
        onCall = function(name, args) {
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
        onCall = function(name, args) {
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
            var o = {};
            c.apply(o, arguments);
            self.wrapAll(o);
            return o;
        };

        // Copy 'static' methods/properties to new constructor.
        for (var p in c) {
            if (typeof c[p] == 'function') {
                console.log("static: " + p);
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
    this.wrapAll = function(o) {
        for (var p in o) {
            self.wrap(o, p);
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

    /* Redefines the given object & property such that mutations are
     * modified.
     */
    function wrapp(o, p, v) {
        var onSet = self.mock("set: " + p);
        var value =  v || o[p];
        Object.defineProperty(o, p, {
            set: function(v) { onSet(v); value = v; },
            get: function() { return value; }
        });
    }        

    /* Returns a wrapped function that monitors calls and parameters.
     */
    function wrapf(o, f, name) {
        name = name || f.name;
        return function() {
            onCall(name, arguments);
            return f.apply(o, arguments);
        };
    };

    /* Formats a function call for verification.
     */
    function formatCall(name, args) {
        var msg = "(" + seq +") " + name + "(";
        for (var i = 0; i < args.length; i++) {
            msg += args[i];
        }
        msg += ")";
        return msg;
    }        
}
