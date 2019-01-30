// Function Declarations Are Hoisted
/*
Function declarations are hoisted - moved in their entirety to the beginning of the current scope. That allows you to refer to functions that are declared later:
*/
test("Function declarations are hoisted", () => {
    const barVal = bar(); // OK, bar is hoisted
    function bar() {
        return "bar";
    }

    expect(barVal).toBe("bar");
});

/*
Note that while var declarations are also hoisted (see Variables Are Hoisted), assignments performed by them are not:

function foo() {
    bar();  // Not OK, bar is still undefined
    var bar = function () {
        // ...
    };
}
*/

// The Special Variable arguments
/*
You can call any function in JavaScript with an arbitrary amount of arguments; the language will never complain. It will, however, make all parameters available via the special variable arguments. arguments looks like an array, but has none of the array methods:
 */
test("Special variable arguments", () => {
    function f() {
        return arguments
    }
    var args = f('a', 'b', 'c');

    expect(args.length).toBe(3);
    expect(args[0]).toBe('a');
});

// Too Many or Too Few Arguments
/*
Additional parameters will be ignored (except by arguments):
*/
test("Too many or too few arguments", () => {
    function f(x, y) {
        console.log(x, y);
        return Array.prototype.slice.call(arguments);
    }
    const args = f('a', 'b', 'c');

    expect(args.length).toBe(3);
});

/*
Missing parameters will get the value undefined:

> f('a')
a undefined
[ 'a' ]
> f()
undefined undefined
[]
 */

// Optional Parameters
/*
The following is a common pattern for assigning default values to parameters:
*/
test("Optional parameters", () => {
    function pair(x, y) {
        x = x || 0; // (1)
        y = y || 0;
        return [x, y];
    }

    expect(pair()).toEqual([0, 0]);
    expect(pair(1)).toEqual([1, 0]);
    expect(pair(null, 1)).toEqual([0, 1]);
});

// Enforcing an Arity
/*
If you want to enforce an arity (a specific number of parameters), you can check arguments.length:
*/
test("Enforcing an arity", () => {
    function pair(x, y) {
        if (arguments.length !== 2) {
            throw new Error('Need exactly 2 arguments');
        }
    }

    expect(() => pair(1)).toThrow(Error);
});

// Exception Handling
/*
The most common way to handle exceptions (see Chapter 14) is as follows:

function getPerson(id) {
    if (id < 0) {
        throw new Error('ID must not be negative: '+id);
    }
    return { id: id }; // normally: retrieved from database
}

function getPersons(ids) {
    var result = [];
    ids.forEach(function (id) {
        try {
            var person = getPerson(id);
            result.push(person);
        } catch (exception) {
            console.log(exception);
        }
    });
    return result;
}
*/

// Strict Mode
/*
Strict mode (see Strict Mode) enables more warnings and makes JavaScript a cleaner language (nonstrict mode is sometimes called “sloppy mode”). To switch it on, type the following line first in a JavaScript file or a <script> tag:

'use strict';

You can also enable strict mode per function:

function functionInStrictMode() {
    'use strict';
}
*/

// Variable Scoping and Closures

// Closures
/*
Each function stays connected to the variables of the functions that surround it, even after it leaves the scope in which it was created. For example:
*/
test("Closures", () => {
    function createIncrementor(start) {
        return function() { // (1)
            start++;
            return start;
        }
    }
    const inc = createIncrementor(5);

    expect(inc()).toBe(6);
    expect(inc()).toBe(7);
});

/*
The function starting in line (1) leaves the context in which it was created, but stays connected to a live version of start.

A closure is a function plus the connection to the variables of its surrounding scopes. Thus, what createIncrementor() returns is a closure.
*/

// The IIFE Pattern: Introducing a New Scope
/*
Sometimes you want to introduce a new variable scope - for example, to prevent a variable from becoming global. In JavaScript, you can’t use a block to do so; you must use a function. But there is a pattern for using a function in a block-like manner. It is called IIFE (immediately invoked function expression, pronounced “iffy”):

(function () {  // open IIFE
    var tmp = ...;  // not a global variable
}());  // close IIFE

An IIFE is a function expression that is called immediately after you define it. Inside the function, a new scope exists, preventing tmp from becoming global. Consult Introducing a New Scope via an IIFE for details on IIFEs.

IIFE use case: inadvertent sharing via closures
Closures keep their connections to outer variables, which is sometimes not what you want:
*/
test("IIFE use case (does not work)", () => {
    var result = [];
    for (var i = 0; i < 5; i++) {
        result.push(function() {
            return i
        }); // (1)
    }

    expect(result[0]()).toBe(5); // not 0
    expect(result[3]()).not.toBe(3);
});

/*
The value returned in line(1) is always the current value of i, not the value it had when the function was created. After the loop is finished, i has the value 5, which is why all functions in the array return that value. If you want the function in line(1) to receive a snapshot of the current value of i, you can use an IIFE:
*/
test("IIFE use case (works)", () => {
    var result = [];
    for (var i = 0; i < 5; i++) {
        (function() {
            var i2 = i; // copy current i
            result.push(function() {
                return i2
            });
        }());
    }

    expect(result[0]()).toBe(0);
    expect(result[3]()).toBe(3);
});

// Objects and Constructors

// Extracting Methods
/*
If you extract a method, it loses its connection with the object. On its own, the function is not a method anymore, and this has the value undefined (in strict mode).
*/
test("Extracting methods (undefined)", () => {
    'use strict';
    var jane = {
        name: 'Jane',
        describe: function() {
            return 'Person named ' + this.name;
        }
    };
    var func = jane.describe;

    expect(() => func()).toThrow(TypeError);
    expect(() => func()).toThrow(/Cannot read property 'name' of undefined/);
});

/*
We want to extract the method describe from jane, put it into a variable func, and call it. However, that doesn’t work.

The solution is to use the method bind() that all functions have. It creates a new function whose this always has the given value:
*/
test("Extracting methods (works)", () => {
    'use strict';
    var jane = {
        name: 'Jane',
        describe: function() {
            return 'Person named ' + this.name;
        }
    };
    var func = jane.describe.bind(jane);

    expect(func()).toBe("Person named Jane");
});

// Functions Inside a Method
/*
Every function has its own special variable this. This is inconvenient if you nest a function inside a method, because you can’t access the method’s this from the function. The following is an example where we call forEach with a function to iterate over an array:
*/
test("Functions inside a method (error)", () => {
    var jane = {
        name: 'Jane',
        friends: ['Tarzan', 'Cheeta'],
        logHiToFriends: function() {
            'use strict';
            const logs = [];
            this.friends.forEach(function(friend) {
                // `this` is undefined here
                logs.push(this.name + ' says hi to ' + friend);
            });
            return logs;
        }
    }

    expect(() => (jane.logHiToFriends())).toThrow(TypeError);
    expect(() => (jane.logHiToFriends())).toThrow(/Cannot read property 'name' of undefined/);
});

/*
Calling logHiToFriends produces an error.

Let’s look at two ways of fixing this. First, we could store this in a different variable:
*/
test("Functions inside a method (fix 1)", () => {
    var jane = {
        name: 'Jane',
        friends: ['Tarzan', 'Cheeta'],
        logHiToFriends: function() {
            'use strict';
            var that = this;
            const logs = [];
            this.friends.forEach(function(friend) {
                // `this` is undefined here
                logs.push(that.name + ' says hi to ' + friend);
            });
            return logs;
        }
    }

    expect(jane.logHiToFriends().length).toBe(2);
});

/*
Or, forEach has a second parameter that allows you to provide a value for this:
*/
test("Functions inside a method (fix 2)", () => {
    var jane = {
        name: 'Jane',
        friends: ['Tarzan', 'Cheeta'],
        logHiToFriends: function() {
            'use strict';
            const logs = [];
            this.friends.forEach(function(friend) {
                // `this` is undefined here
                logs.push(this.name + ' says hi to ' + friend);
            }, this);
            return logs;
        }
    }

    expect(jane.logHiToFriends().length).toBe(2);
});

// Constructors: Factories for Objects
/*
In addition to being “real” functions and methods, functions play another role in JavaScript: they become constructors - factories for objects - if invoked via the new operator. By convention, the names of constructors start with capital letters. For example:
*/
test("Constructors", () => {
    // Set up instance data
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    // Methods
    Point.prototype.dist = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    const p = new Point(3, 5);

    expect(p.x).toBe(3);
    expect(p.dist()).toBeCloseTo(5.83095, 5);
    expect(p instanceof Point).toBeTruthy();
});

/*
To use Point, we invoke it via the new operator.

p is an instance of Point.
 */
