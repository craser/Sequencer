new OneBanana({ name: "Testing Sequencer" }).test(
    function test_mock(test) {
        var seq = new Sequencer(function() {});
        var m = seq.mock("mock_function", 42);
        test.ok(typeof m == "function", "Mock function should be a function.");
        var v = m(1, 2, 3);
        test.ok(v == 42, "Mock function should return given value. (Found: " + v + ")");

        seq.monitor(function() {
            m(1, 2, 3);
        });

        var checks = seq.getSequence();
        test.ok(checks != null, "Checks should exist. (Found: ['" + checks.join("', '") + "'])");
        test.ok(checks.length == 1, "Checks should have one item. (Found: " + checks.length + ")");
        var check = checks[0];
        test.ok(check.name == "mock_function", "Name should be mock_function. (Found: " + check.name + ")");
        test.ok(check.args.join(",") == "1,2,3", "Args should be (1,2,3). (Found: " + check.args.join(",") + ")");
    },
    function test_postConditions(test) {
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
