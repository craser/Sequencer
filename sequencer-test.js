var fs = require('fs');
eval(fs.read("onebanana.js"));
eval(fs.read("sequencer.js"));

new OneBanana({ name: "Testing Sequencer" }).test(
    function test_mock(test) {
        var seq = new Sequencer(function() {});
        seq.monitor();                                      // Must turn monitoring on.

        var m = seq.mock("mock_function", 42);
        test.ok(typeof m == "function", "Mock function should be a function.");
        var v = m(1, 2, 3);
        test.ok(v == 42, "Mock function should return given value. (Found: " + v + ")");
        var checks = seq.getChecks();
        test.ok(checks != null, "Checks should exist. (Found: ['" + checks.join("', '") + "'])");
        test.ok(checks.length == 1, "Checks should have one item. (Found: " + checks.length + ")");
        var check = checks[0];
        test.ok(check.seq == 0, "Call should be at depth 0. (Found: " + check.seq + ")");
        test.ok(check.name == "mock_function", "Name should be mock_function. (Found: " + check.name + ")");
        test.ok(check.args.join(",") == "1,2,3", "Args should be (1,2,3). (Found: " + check.args.join(",") + ")");
    }    
);

phantom.exit();
