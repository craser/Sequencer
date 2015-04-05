# Sequencer: Rinky-Dink JavaScript Refactoring Tool

We've all been there: we're working on a function (or collection of functions) are are a rat's nest of if/else & switch statements, repeated calls, side effects, and obscure dependencies. There are no unit tests, the original requirements have been lost in the mists of time, and it's unclear whether the code behaves correctly to begin with.

**Sequencer** lets you isolate what you're working on, and verify that your **new** implementation, at the very least, calls all deligate methods, external objects & methods, etc, in the same order, with the same parameters, as the **old** implementation.

## Where to Start

  * The "business end" of this is **sequencer.js**. 
  * **test.js** contains an example of how to **use** sequencer.js

## Reality Check

This is something I cooked up to help me get my arms around some code I was working on. It is **not** built to be exhaustive or exceptionally robust.

And I've checked in **everything** I used to get this rolling, including **onebanana.js**, from my [OneBanana JavaScript testing framework](https://github.com/craser/OneBanana). This is entirely a quick & dirty solution that I'd like to build out into something more useful later.

## Drawbacks

Since this works by first capturing data on how the old function(s) behave, then verifying that the new function(s) reproduce that behavior, the old & new function(s) will have to **both** exist in the code simultaneously.

Obviously, if you're clever, you can use the captured data to produce a unit test that can then be run on the code as you work. Good for you. 

And, it records parameter values as **strings**, so Objects present difficulties. In what I'm using this for, this dosn't hamper me... much. YMMV.


