new OneBanana({ name: "Testing Sequencer" }).test(
    function test_mock(test) {
        var passed = true;
        var ok = function(p) { passed = passed && p; };
        var seq = new Sequencer(ok);
        var box = {
            foo: seq.mock("foo", 7),
            bar: seq.mock("bar", 9)
        };

        // Mock must return the correct value.
        var foo = box.foo();
        var bar = box.bar();
        test.ok(foo == 7, "Mock must return specified value. (Found: " + foo + ")");
        test.ok(bar == 9, "Mock must return specified value. (Found: " + bar + ")");

        // Mock must detect differences in sequence.
        passed = true;
        seq.monitor(function() {
            box.foo(1, 2, 3);
            box.bar(1, 2, 3);
        });
        passed = true;
        seq.verify(function() {
            box.bar(1, 2, 3);
            box.foo(1, 2, 3);
        });
        test.ok(!passed, "Mock functions must detect changes in sequence.");

        // Mock must detect differences in arguments.
        passed = true;
        seq.monitor(function() {
            box.foo(1, 2, 3);
            box.bar(1, 2, 3);
        });
        passed = true;
        seq.verify(function() {
            box.foo(1, 2, 3);
            box.bar(1, 2, 4);
        });
        test.ok(!passed, "Mock functions must detect changes in arguments.");

    },
    function test_postConditionsSequence(test) {
        var passed = true;
        seq = new Sequencer(function(ok, msg) {
            passed = passed && ok;
            // console.log(ok + ": " + msg);
        });
        var box = {
            value: 0,
            set: function(x) { this.value = x; },
            get: function() { return this.value; }
        };
        seq.wrap(box, "value");

        box.set(0);
        seq.monitor(function() {
            box.set(1);
            box.set(2);
            box.set(3);
            box.set(23);
        });
        box.set(0);
        seq.verify(function() {
            box.set(23);
        });
        test.ok(passed, "passed should be true.");

        passed = true;
        box.set(0);
        seq.monitor(function() {
            box.set(1);
        });
        box.set(0);
        box.set = function(x) { this.value += x; };
        seq.verify(function() {
            box.set(1);
            box.set(2);
            box.set(3);
        });
        test.ok(!passed, "passed should be false.");
    },
    function test_postConditionsOnly(test) {
        var passed = true;
        seq = new Sequencer(function(ok, msg) {
            passed = passed && ok;
            // console.log(ok + ": " + msg);
        });
        var box = {
            value: 0,
            set: function(x) { this.value = x; },
            get: function() { return this.value; }
        };
        seq.wrapAll(box);                  // Wrap value, get and set.

        // Should ignore different sequence, see that box.value has
        // same value after code is executed.
        box.set(0);
        seq.monitor(function() {
            box.set(1);
            box.set(23);
        });
        box.set(0);
        seq.verifyPostConditions(function() {
            box.set(23);
        });
        test.ok(passed, "passed should be true.");

        // Should see that even when the sequence is the same,
        // box.value has a different value.
        passed = true;
        box.set(0);
        seq.monitor(function() {
            box.set(1);
        });
        box.set(0);
        box.set = function(x) { this.value = x*2; };
        seq.verifyPostConditions(function() {
            box.set(1);
        });
        test.ok(!passed, "passed should be false.");
    },
    function test_captureCall(test) {
        var passed = true;
        var ok = function(x) { passed = passed && x; };
        var box = {
            set: function(x) {}
        };

        var seq = new Sequencer(ok);
        seq.wrap(box, "set");

        // Call the same method twice. Should pass.
        passed = true;
        seq.monitor(function() {
            box.set(5);
        });
        seq.verify(function() {
            box.set(5);
        });
        test.ok(passed, "Should be fine with the same method called twice.");

        // Call a DIFFERENT method the second time. Should be fine..
        passed = true;
        seq.monitor(function() {
            box.set(5);
        });
        box.set = seq.mock("set");
        seq.verify(function() {
            debugger;
            box.set(5);
        });

        // Allows for subbing out different methods during refactoring.
        test.ok(passed, "Should be fine with same name & args, even for different methods.");
    }
);
