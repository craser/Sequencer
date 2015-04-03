var DepA = (function() {
    var blim = true;
    function DepA() {
        this.bim = function() {
            blim = !blim;
            this.gub(blim);
            return blim;
        };
        this.gub = function(blim) {};
        this.apathy = "whatever";
    };
    DepA.reset = function() {
        blim = true;
    };
    return DepA;
}());

function DepB() {
    this.p = function() {};
    this.q = function() {};
}

function Box(bag) {
    this.foo = function(x) {
        var a = new DepA("new DepA:" + x);
        a.apathy = "nothing";
        var bim = a.bim("a.bim");
        if (bim) {
            var b = new DepB("new DepB:" + x);
            b.q("b.q" + x);
        }
        bag.kick("bag.kick:" + x);
        bag.pocket.pick("bag.pocket.pick:" + x);
    };
}

function ReplacementBox(bag) {
    this.foo = function(x) {
        var a = this.getA(x);
        a.apathy = "nothing";
        checkBim(a, x);
        bag.kick("bag.kick:" + x);
        mopUp(bag, x);        
    };

    this.getA = function(x) {
        return new DepA("new DepA:" + x);
    };

    function mopUp(bag, x) {
        bag.pocket.pick("bag.pocket.pick:" + x);
    }
    
    function checkBim(a, x) {
        var bim = a.bim("a.bim");
        var b = null;
        if (bim) {
            b = new DepB("new DepB:" + x);
            b.q("b.q" + x);
        }
    }
}




