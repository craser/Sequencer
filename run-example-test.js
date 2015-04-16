var fs = require('fs');
eval(fs.read("onebanana.js"));
eval(fs.read("sequencer.js"));
eval(fs.read("example-code.js"));
eval(fs.read("example-test.js"));

phantom.exit();
     