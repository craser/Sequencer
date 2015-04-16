var fs = require('fs');
eval(fs.read("onebanana.js"));
eval(fs.read("sequencer.js"));
eval(fs.read("sequencer-test.js"));
phantom.exit();

