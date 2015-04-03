new OneBanana({ name: "Sequence Testing" }).test(
    function findSequence(test) {
        var seq = new Sequencer(test.ok);
        var bag = {
            kick: function() {},
            pocket: {
                pick: function() {}
            }                
        };

        DepA = seq.wrapConstructor(DepA);
        DepB = seq.wrapConstructor(DepB);
        seq.deepWrapAll(bag);

        var box = new Box(bag);
        seq.monitor();    // Capture the sequence of dependency calls from the old version.

        box.foo("the");
        box.foo("way");
        box.foo("that");
        box.foo("can");
        box.foo("be");
        box.foo("spoken");
        box.foo("of");
        box.foo("is");
        box.foo("not");
        box.foo("the");
        box.foo("true");
        box.foo("way");

        DepA.reset();
        box = new ReplacementBox(bag);
        seq.verify(); // Verify that the new implementation matches the old.

        box.foo("the");
        box.foo("way");
        box.foo("that");
        box.foo("can");
        box.foo("be");
        box.foo("spoken");
        box.foo("of");
        box.foo("is");
        box.foo("not");
        box.foo("the");
        box.foo("true");
        box.foo("way");

        DepA.reset();
        seq.done();
    }
);

