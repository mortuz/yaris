//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
        nativeReduceRight = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.5.2';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function(value, index, list) {
            index = keys ? keys[--length] : --length;
            if (!initial) {
                memo = obj[index];
                initial = true;
            } else {
                memo = iterator.call(context, memo, obj[index], index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function(obj, iterator, context) {
        return _.filter(obj, function(value, index, list) {
            return !iterator.call(context, value, index, list);
        }, context);
    };

    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `include`.
    _.contains = _.include = function(obj, target) {
        if (obj == null) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        return any(obj, function(value) {
            return value === target;
        });
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            return (isFunc ? method : value[method]).apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function(obj, key) {
        return _.map(obj, function(value) { return value[key]; });
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    _.where = function(obj, attrs, first) {
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        return _[first ? 'find' : 'filter'](obj, function(value) {
            for (var key in attrs) {
                if (attrs[key] !== value[key]) return false;
            }
            return true;
        });
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    _.findWhere = function(obj, attrs) {
        return _.where(obj, attrs, true);
    };

    // Return the maximum element or (element-based computation).
    // Can't optimize arrays of integers longer than 65,535 elements.
    // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = { computed: -Infinity, value: -Infinity };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed > result.computed && (result = { value: value, computed: computed });
        });
        return result.value;
    };

    // Return the minimum element (or element-based computation).
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = { computed: Infinity, value: Infinity };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = { value: value, computed: computed });
        });
        return result.value;
    };

    // Shuffle an array, using the modern version of the 
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
    _.shuffle = function(obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function(value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };

    // Sample **n** random values from an array.
    // If **n** is not specified, returns a single random element from the array.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function(obj, n, guard) {
        if (arguments.length < 2 || guard) {
            return obj[_.random(obj.length - 1)];
        }
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };

    // An internal function to generate lookup iterators.
    var lookupIterator = function(value) {
        return _.isFunction(value) ? value : function(obj) { return obj[value]; };
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function(obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    var group = function(behavior) {
        return function(obj, value, context) {
            var result = {};
            var iterator = value == null ? _.identity : lookupIterator(value);
            each(obj, function(value, index) {
                var key = iterator.call(context, value, index, obj);
                behavior(result, key, value);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = group(function(result, key, value) {
        (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    _.indexBy = group(function(result, key, value) {
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    _.countBy = group(function(result, key) {
        _.has(result, key) ? result[key]++ : result[key] = 1;
    });

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iterator, context) {
        iterator = iterator == null ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0,
            high = array.length;
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };

    // Safely create a real, live array from anything iterable.
    _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function(array, n, guard) {
        if (array == null) return void 0;
        return (n == null) || guard ? array[0] : slice.call(array, 0, n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    _.initial = function(array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function(array, n, guard) {
        if (array == null) return void 0;
        if ((n == null) || guard) {
            return array[array.length - 1];
        } else {
            return slice.call(array, Math.max(array.length - n, 0));
        }
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array. The **guard**
    // check allows it to work with `_.map`.
    _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    _.compact = function(array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function(input, shallow, output) {
        if (shallow && _.every(input, _.isArray)) {
            return concat.apply(output, input);
        }
        each(input, function(value) {
            if (_.isArray(value) || _.isArguments(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, []);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function(array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function(value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function() {
        return _.uniq(_.flatten(arguments, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function(array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function(value) { return !_.contains(rest, value); });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function() {
        var length = _.max(_.pluck(arguments, "length").concat(0));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
            results[i] = _.pluck(arguments, '' + i);
        }
        return results;
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function(list, values) {
        if (list == null) return {};
        var result = {};
        for (var i = 0, length = list.length; i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function(array, item, isSorted) {
        if (array == null) return -1;
        var i = 0,
            length = array.length;
        if (isSorted) {
            if (typeof isSorted == 'number') {
                i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
            } else {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (; i < length; i++)
            if (array[i] === item) return i;
        return -1;
    };

    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    _.lastIndexOf = function(array, item, from) {
        if (array == null) return -1;
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--)
            if (array[i] === item) return i;
        return -1;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(length);

        while (idx < length) {
            range[idx++] = start;
            start += step;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    var ctor = function() {};

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function(func, context) {
        var args, bound;
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function() {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context.
    _.partial = function(func) {
        var args = slice.call(arguments, 1);
        return function() {
            return func.apply(this, args.concat(slice.call(arguments)));
        };
    };

    // Bind all of an object's methods to that object. Useful for ensuring that
    // all callbacks defined on an object belong to it.
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length === 0) throw new Error("bindAll must be passed function names");
        each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() { return func.apply(null, args); }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function() {
            previous = options.leading === false ? 0 : new Date;
            timeout = null;
            result = func.apply(context, args);
        };
        return function() {
            var now = new Date;
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        return function() {
            context = this;
            args = arguments;
            timestamp = new Date();
            var later = function() {
                var last = (new Date()) - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function(func) {
        var ran = false,
            memo;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function() {
        var funcs = arguments;
        return function() {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };

    // Returns a function that will only be executed after being called N times.
    _.after = function(times, func) {
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Object Functions
    // ----------------

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj)
            if (_.has(obj, key)) keys.push(key);
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = new Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = new Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function(obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function(key) {
            if (key in obj) copy[key] = obj[key];
        });
        return copy;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) copy[key] = obj[key];
        }
        return copy;
    };

    // Fill in a given object with default properties.
    _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Internal recursive comparison function for `isEqual`.
    var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
                // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] == a) return bStack[length] == b;
        }
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor,
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
            return false;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0,
            result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                }
            }
        } else {
            // Deep compare objects.
            for (var key in a) {
                if (_.has(a, key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) break;
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
        return eq(a, b, [], []);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj)
            if (_.has(obj, key)) return false;
        return true;
    };

    // Is a given value a DOM element?
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) == '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function(obj) {
        return obj === Object(obj);
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // Optimize `isFunction` if appropriate.
    if (typeof(/./) !== 'function') {
        _.isFunction = function(obj) {
            return typeof obj === 'function';
        };
    }

    // Is a given object a finite number?
    _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj != +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function(obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function(obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iterators.
    _.identity = function(value) {
        return value;
    };

    // Run a function **n** times.
    _.times = function(n, iterator, context) {
        var accum = Array(Math.max(0, n));
        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // List of HTML entities for escaping.
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);

    // Regexes containing the keys and values listed immediately above.
    var entityRegexes = {
        escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    };

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    _.each(['escape', 'unescape'], function(method) {
        _[method] = function(string) {
            if (string == null) return '';
            return ('' + string).replace(entityRegexes[method], function(match) {
                return entityMap[method][match];
            });
        };
    });

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function(object, property) {
        if (object == null) return void 0;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function(obj) {
        each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function(text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function(match) { return '\\' + escapes[match]; });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data, _);
        var template = function(data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function, which will delegate to the wrapper.
    _.chain = function(obj) {
        return _(obj).chain();
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function(obj) {
        return this._chain ? _(obj).chain() : obj;
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
            return result.call(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });

    _.extend(_.prototype, {

        // Start chaining a wrapped Underscore object.
        chain: function() {
            this._chain = true;
            return this;
        },

        // Extracts the result from a wrapped and chained object.
        value: function() {
            return this._wrapped;
        }

    });

}).call(this);
/* requestAnimationFrame Polyfill */
'use strict';

// Adapted from https://gist.github.com/paulirish/1579671 which derived from 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] ||
            window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        ||
        !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

function assert(condition, message) {
    if (!!condition === false) {
        throw message || "Assertion failed";
    }
}

/* polyfill for classList */
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {
    (function(j) { if (!("HTMLElement" in j) && !("Element" in j)) { return } var a = "classList",
            f = "prototype",
            m = (j.HTMLElement || j.Element)[f],
            b = Object,
            k = String[f].trim || function() { return this.replace(/^\s+|\s+$/g, "") },
            c = Array[f].indexOf || function(q) { var p = 0,
                    o = this.length; for (; p < o; p++) { if (p in this && this[p] === q) { return p } } return -1 },
            n = function(o, p) { this.name = o;
                this.code = DOMException[o];
                this.message = p },
            g = function(p, o) { if (o === "") { throw new n("SYNTAX_ERR", "An invalid or illegal string was specified") } if (/\s/.test(o)) { throw new n("INVALID_CHARACTER_ERR", "String contains an invalid character") } return c.call(p, o) },
            d = function(s) { var r = k.call(s.className),
                    q = r ? r.split(/\s+/) : [],
                    p = 0,
                    o = q.length; for (; p < o; p++) { this.push(q[p]) }
                this._updateClassName = function() { s.className = this.toString() } },
            e = d[f] = [],
            i = function() { return new d(this) };
        n[f] = Error[f];
        e.item = function(o) { return this[o] || null };
        e.contains = function(o) { o += ""; return g(this, o) !== -1 };
        e.add = function() { var s = arguments,
                r = 0,
                p = s.length,
                q, o = false;
            do { q = s[r] + ""; if (g(this, q) === -1) { this.push(q);
                    o = true } } while (++r < p); if (o) { this._updateClassName() } };
        e.remove = function() { var t = arguments,
                s = 0,
                p = t.length,
                r, o = false;
            do { r = t[s] + ""; var q = g(this, r); if (q !== -1) { this.splice(q, 1);
                    o = true } } while (++s < p); if (o) { this._updateClassName() } };
        e.toggle = function(p, q) { p += ""; var o = this.contains(p),
                r = o ? q !== true && "remove" : q !== false && "add"; if (r) { this[r](p) } return !o };
        e.toString = function() { return this.join(" ") }; if (b.defineProperty) { var l = { get: i, enumerable: true, configurable: true }; try { b.defineProperty(m, a, l) } catch (h) { if (h.number === -2146823252) { l.enumerable = false;
                    b.defineProperty(m, a, l) } } } else { if (b[f].__defineGetter__) { m.__defineGetter__(a, i) } } }(self)) };
(function() {

    /* 
     * requires: dataset, classlist, getElementsByClassName
     */

    window.CHARLIE = {};
    var CHARLIE = window.CHARLIE;


    /************************************************************************
     * Constants
     */
    var KEYFRAMES_RULE = window.CSSRule.KEYFRAMES_RULE ||
        window.CSSRule.WEBKIT_KEYFRAMES_RULE ||
        window.CSSRule.MOZ_KEYFRAMES_RULE ||
        window.CSSRule.O_KEYFRAMES_RULE ||
        window.CSSRule.MS_KEYFRAMES_RULE,

        PREFIXES = ["webkit", "moz", "o", "ms"];


    /************************************************************************
     * Helper Functions
     */
    var scrapeAnimationData = function() {

            /* Grab the data from the DOM. */
            var data = {};
            _.forEach(
                //loop through every element that should be animated
                document.getElementsByClassName("charlie"),

                //for each element, pull off the info from the dataset
                function(element) {

                    /*
                     * Creates an object of animation name: time, e.g.
                     * 
                     * { swoopy: [ 
                     *    { element: domElement,
                     *      time: 6522 },
                     *    { element: anotherElement,
                     *      time: 7834 }]
                     * }
                     */

                    //
                    var names = element.dataset.animations.split(/\s*,\s*/),
                        times = element.dataset.times.split(/\s*,\s*/),

                        // creates an array of arrays, each one called a 'tuple'
                        // basically ties the time to the 
                        // animation name, so it looks like:
                        //[["zippy", 1], ["fade", 2] ... ]
                        tuples = _.zip(names, times);

                    /*
                     * turn the tuples into an object, 
                     * which is just a little easier to work with.
                     * We end up with an object that looks like:
                     * {
                     *  fade: [ {element: domElement, time: "1.2s"}, ... ],
                     *  fling: [ {element: domelement, time: "2.4s"}, ... ]
                     * }
                     * So we can reuse an animation on different elements
                     * at different times.
                     */

                    _.forEach(tuples, function(tuple) {
                        var name = tuple[0],
                            time = tuple[1];
                        data[name] = data[name] || [];
                        data[name].push({
                            element: element,
                            time: time
                        })
                    });
                });
            return data;
        },


        /* 
           iterate through every stylesheet and create a list of rules
           that matches the passed in matcher function
        */
        findRules = function(matches) {
            var styleSheets = _.toArray(document.styleSheets),
                rules = [];

            _.forEach(styleSheets, function(sheet) {
                var cssRules = [];
                try {
                    cssRules = _.toArray(sheet.cssRules);
                } catch (e) {
                    //cross domain exception
                }
                _.forEach(cssRules, function(rule) {
                    if (matches(rule)) {
                        rules.push(rule);
                    }
                });
            });
            return rules;
        },

        roundTime = function(time) {
            //round a time to one tenth of a second
            //return time.toFixed(1);
            return Math.round(time * 10) / 10;
        },

        animationName = (function() {
            var name = "";
            return function(style) {
                if (name) {
                    return name;
                } else {
                    if (style.animationName) {
                        name = "animationName";
                    } else if (style.webkitAnimationName) {
                        name = "webkitAnimationName";
                    } else if (style.mozAnimationName) {
                        name = "mozAnimationName";
                    } else if (style.oAnimationName) {
                        name = "oAnimationName";
                    } else if (style.msAnimationName) {
                        name = "msAnimationName";
                    } else {
                        name = "";
                    }
                    return name;
                }
            }
        })(),

        prefixed = function(prop) {

            var props = _.map(PREFIXES, function(prefix) {
                return prefix + prop.substring(0, 1).toUpperCase() + prop.substring(1);
            });
            props.push(prop);
            return props;
        },

        animationDuration = (function() {

            var durationName = "",
                props = prefixed("animationDuration");

            return function(style) {
                if (!durationName) {
                    for (var i = 0; i < props.length; i++) {
                        var prop = props[i];
                        if (style[prop]) {
                            durationName = prop;
                            break;
                        }
                    }
                }
                return style[durationName];
            };
        })(),

        calculatedDuration = function(style) {
            /* NOTE: could support multiple iterations, but 
             * only the same duration for each iteration.
             * TODO: support iterations
             */
            var duration = animationDuration(style);
            duration = Number(duration.substring(0, duration.length - 1));

            return duration || 0;
        },

        onAnimationEnd = function(element, callback) {
            element.addEventListener("webkitAnimationEnd", callback, false);
            element.addEventListener("mozAnimationEnd", callback, false);
            element.addEventListener("msAnimationEnd", callback, false);
            element.addEventListener("oAnimationEnd", callback, false);
            element.addEventListener("animationend", callback, false);
        },

        setDelay = function(animation, seconds) {
            var delay = -(seconds - animation.startsAt),
                delay = delay < 0 ? delay : 0,
                milliseconds = Math.floor(delay * 1000) + "ms";

            animation.element.style.webkitAnimationDelay = milliseconds;
            animation.element.style.mozAnimationDelay = milliseconds;
            animation.element.style.oAnimationDelay = milliseconds;
            animation.element.style.msAnimationDelay = milliseconds;
            animation.element.style.animationDelay = milliseconds;
        };






    /************************************************************************
     * CSSAnimations
     * 
     * Basically a bucket for holding keyframes and stylesheet rules
     * for animations.
     */

    var CSSAnimations = function(keyframes, cssRules) {
        this.keyframes = keyframes;
        this.cssRules = cssRules;
    };

    CSSAnimations.create = function() {
        /* create keyframe lookup */
        var keyframeRules = findRules(function(rule) {
                return KEYFRAMES_RULE === rule.type;
            }),
            keyframes =
            _.object(
                _.map(
                    keyframeRules,
                    function(rule) { return [rule.name, rule]; }));

        /* create animation styles lookup */
        var animationStyleRules = findRules(function(rule) {
                return rule.style && rule.style[animationName(rule.style)];
            }),
            cssRules =
            _.object(
                _.map(
                    animationStyleRules,
                    function(style) { return [style.selectorText.substring(1), style]; }));

        return new CSSAnimations(keyframes, cssRules);
    };

    CSSAnimations.prototype = {
        keyframes: {},
        cssRules: {},
    };
    CHARLIE.CSSAnimations = CSSAnimations;


    /************************************************************************
     * Animation Controller 
     */

    var AnimationController = function(animations, bySeconds, timeModel, callbacks) {
        this.animations = animations || {};
        this.bySeconds = bySeconds || {};
        this.running = [];
        this.paused = [];
        this.timeModel = timeModel || {};
        this.callbacks = callbacks || {};
    };

    AnimationController.prototype = {

        animations: {},
        bySeconds: {},
        running: [],
        paused: [],
        timeModel: {},
        callbacks: {},

        startAnimations: function(time, videoTime) {

            // allow precision to one tenth of a second
            var seconds = roundTime(videoTime),
                me = this;

            //resume any paused animations
            me.resumeAnimations();

            /* start up any animations that should be running at this second.
             * Don't start any that are already running
             */
            if (me.bySeconds[seconds]) {
                var animations = me.bySeconds[seconds],
                    notRunning = _.filter(animations, function(animation) {
                        return !_.contains(me.running, animation);
                    });

                /* requestAnimationFrame happens more than 
                 *  every tenth of a second, so this code will run
                 *  multiple times for each animation starting time
                 */
                _.forEach(notRunning, function(animation) {
                    animation.start();
                    me.running.push(animation);
                });
            }
        },

        executeCallbacks: (function() {

            var currentTime = 0;

            return function(time, videoTime) {

                // allow precision to one tenth of a second
                var seconds = roundTime(videoTime),
                    me = this;

                if (seconds > currentTime || seconds < currentTime) {
                    currentTime = seconds;
                    var callbacks = me.callbacks[seconds] || [];
                    _.forEach(callbacks, function(cb) {
                        cb();
                    });
                }
            }
        })(),

        seek: (function() {

            var animationsToStart = function(me, seconds) {

                var toStart = [];

                for (var i = 0; i < me.timeModel.length; i++) {

                    var animation = me.timeModel[i];

                    //stop looking, nothing else is running
                    if (animation.startsAt > seconds) {
                        break;
                    }

                    if (animation.endsAt > seconds) {
                        toStart.push(animation);
                    }
                }
                return toStart;
            };

            /* seek function */
            return function(videoTime, playNow) {

                // 1. go through each to start
                //2. set the animation delay so it starts at the right place
                //3. start 'em up.

                var me = this,
                    seconds = roundTime(videoTime),
                    toStart = animationsToStart(me, seconds);

                // go through each animation to start
                _.forEach(toStart, function(animation) {

                    //set the delay to start the animation at the right place
                    setDelay(animation, seconds);

                    //start it up
                    animation.start();

                    /* if the move is playing right now, then let the animation
                     * keep playing, otherwise pause the animation to wait
                     * until the video resumes.
                     */

                    if (playNow) {
                        me.running.push(animation);

                    } else {
                        me.paused.push(animation);
                        animation.pause();
                    }
                });
            }
        })(),

        pauseAnimations: function() {

            var me = this,
                animation;

            while (animation = me.running.pop()) {
                animation.pause();
                //keep track of paused animations so we can resume them later ...
                me.paused.push(animation);
            }
        },

        clearAnimations: function() {

            var me = this,
                animation;

            /* Need to be playing in order 
             * to cause a reflow, otherwise 
             * the offset fix in the reset method
             * of the animation class has no effect.
             */
            me.resumeAnimations();

            while (animation = me.running.pop()) {
                animation.reset();
            }
            while (animation = me.paused.pop()) {
                animation.reset();
            }

        },

        resumeAnimations: function() {

            var me = this,
                animation;

            while (animation = me.paused.pop()) {
                animation.resume();
                me.running.push(animation);
            }
        },

        bind: (function() {

            var createAnimations = function(me, cssAnimations, startTimes, callbacks) {

                    _.forEach(_.keys(startTimes),
                        function(name) {

                            var keyframe = cssAnimations.keyframes[name],
                                cssRule = cssAnimations.cssRules[name];

                            _.forEach(startTimes[name], function(startTime) {
                                var animation = new Animation(
                                    name,
                                    cssRule,
                                    keyframe,
                                    startTime.element,
                                    startTime.time);

                                me.animations[name] = me.animations[name] || [];
                                me.bySeconds[animation.startsAt] =
                                    me.bySeconds[animation.startsAt] || [];

                                me.animations[name].push(animation);
                                me.bySeconds[animation.startsAt].push(animation);
                            });
                        });
                },

                createTimeModel = function(me, animations) {
                    me.timeModel = _.sortBy(animations, "endsAt");
                };

            /* The AnimationController bind method */
            return function(cssAnimations, startTimes) {

                var me = this;
                createAnimations(me, cssAnimations, startTimes);

                var animations = _.flatten(_.values(me.animations));
                createTimeModel(me, animations);

                me.callbacks = callbacks;
            }
        })() /* returns the bind method*/
    }
    CHARLIE.AnimationController = AnimationController;


    /************************************************************************
     * Animation
     */
    var Animation = function(name, cssRule, keyframe, element, startsAt) {

        assert(name, "You can't create an animation without a name");
        assert(cssRule, "No CSS rule defined for animation " + name);
        assert(keyframe, "No keyframe defined for animation " + name);
        assert(element, "No element found. Animations must be bound to a DOM element.");
        assert(startsAt, "No start time provided for the animation");

        this.name = name;
        this.element = element;
        this.cssRule = cssRule;
        this.keyframe = keyframe;
        this.startsAt = roundTime(Number(startsAt));
        this.duration = calculatedDuration(cssRule.style);
        this.endsAt = this.startsAt + this.duration;
    };

    Animation.prototype = {

        name: "",
        element: null,
        cssRule: null,
        keyframe: null,
        startsAt: -1,
        duration: -1,
        endsAt: -1,
        ios: !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform),

        start: function() {
            var me = this;
            this.animated = 'animated';
            //The name of the animation is the same as the class name by convention.
            me.element.classList.add(me.name);
            me.element.classList.add(me.animated);
            onAnimationEnd(me.element, function() {
                me.reset();
            });
        },

        reset: function() {
            this.element.classList.remove(this.name);
            this.element.classList.remove(this.animated);
            // cause a reflow, otherwise the animation isn't fully 
            // removed. (let's call this a browser bug).
            this.element.offsetWidth = this.element.offsetWidth;

            //reset any calculated animation delays.
            setDelay(this, 0);
        },

        pause: function() {
            this.element.style.webkitAnimationPlayState = "paused";
            this.element.style.mozAnimationPlayState = "paused";
            this.element.style.oAnimationPlayState = "paused";
            this.element.style.animationPlayState = "paused";
            if ( this.ios ) {
                if (video || document.querySelector('video')) {
                    var myCurrentTime = video.currentTime || document.querySelector('video').currentTime;
                    setDelay(this, myCurrentTime);
                }
                this.element.classList.add('js-pause-animation');
            }
        },

        resume: function() {
            this.element.style.webkitAnimationPlayState = "running";
            this.element.style.mozAnimationPlayState = "running";
            this.element.style.oAnimationPlayState = "running";
            this.element.style.animationPlayState = "running";
            if ( this.ios ) {
                this.element.classList.remove('js-pause-animation');
            }
        }

    }
    CHARLIE.Animation = Animation;


    /************************************************************************
     * BigLoop
     */
    var BigLoop = function(controller) {
        assert(controller, "Can't create a BigLoop without an AnimationController");
        this.controller = controller;
    };

    BigLoop.prototype = {

        controller: null,
        video: null,
        running: false,
        frameID: -1,

        bind: function(video) {
            //start and stop the loop when the video
            //starts and stops
            this.video = video;
            video.addEventListener("play", this.start.bind(this), false);
            video.addEventListener("ended", this.ended.bind(this), false);
            video.addEventListener("pause", this.stop.bind(this), false);
            video.addEventListener("seeked", this.seeked.bind(this), false);
        },

        ended: function() {
            this.controller.clearAnimations();
        },

        seeked: function() {
            this.controller.clearAnimations();
            this.controller.seek(this.video.currentTime, !this.video.paused);
        },

        tick: function(time) {
            if (this.running) {
                this.frameID = requestAnimationFrame(this.tick.bind(this));
                this.controller.startAnimations(time, this.video.currentTime);
                this.controller.executeCallbacks(time, this.video.currentTime);
            }
        },

        start: function() {
            this.running = true;
            this.tick();
        },

        stop: function() {
            if (this.frameID) {
                cancelAnimationFrame(this.frameID);
                this.frameID = -1;
            }
            this.running = false;
            this.controller.pauseAnimations();
        }
    }

    var callbacks = {};
    CHARLIE.setup = function(video) {
        var cssAnimations = CSSAnimations.create(),
            animationData = scrapeAnimationData(),
            controller = new AnimationController(),
            loop = new BigLoop(controller);
        controller.bind(cssAnimations, animationData, callbacks);
        loop.bind(video);
    }

    CHARLIE.addCallback = function(callback, time) {
        time = roundTime(time);
        var cbs = callbacks[time] || [];
        cbs.push(callback);
        callbacks[time] = cbs;
    }

})();
/**
 * setImmediate polyfill v1.0.1, supports IE9+
 * © 2014–2015 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/setImmediate
 */
window.setImmediate || function () {'use strict';

  var uid = 0;
  var storage = {};
  var firstCall = true;
  var slice = Array.prototype.slice;
  var message = 'setImmediatePolyfillMessage';

  function fastApply(args) {
    var func = args[0];
    switch (args.length) {
      case 1:
        return func();
      case 2:
        return func(args[1]);
      case 3:
        return func(args[1], args[2]);
    }
    return func.apply(window, slice.call(args, 1));
  }

  function callback(event) {
    var key = event.data;
    var data;
    if (typeof key == 'string' && key.indexOf(message) == 0) {
      data = storage[key];
      if (data) {
        delete storage[key];
        fastApply(data);
      }
    }
  }

  window.setImmediate = function setImmediate() {
    var id = uid++;
    var key = message + id;
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    storage[key] = args;
    if (firstCall) {
      firstCall = false;
      window.addEventListener('message', callback);
    }
    window.postMessage(key, '*');
    return id;
  };

  window.clearImmediate = function clearImmediate(id) {
    delete storage[message + id];
  };

}();

/**
 * Promise polyfill v1.0.10
 * requires setImmediate
 *
 * © 2014–2015 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/Promise
 */
(function (global) {'use strict';

  var STATUS = '[[PromiseStatus]]';
  var VALUE = '[[PromiseValue]]';
  var ON_FUlFILLED = '[[OnFulfilled]]';
  var ON_REJECTED = '[[OnRejected]]';
  var ORIGINAL_ERROR = '[[OriginalError]]';
  var PENDING = 'pending';
  var INTERNAL_PENDING = 'internal pending';
  var FULFILLED = 'fulfilled';
  var REJECTED = 'rejected';
  var NOT_ARRAY = 'not an array.';
  var REQUIRES_NEW = 'constructor Promise requires "new".';
  var CHAINING_CYCLE = 'then() cannot return same Promise that it resolves.';

  var setImmediate = global.setImmediate || require('timers').setImmediate;
  var isArray = Array.isArray || function (anything) {
      return Object.prototype.toString.call(anything) == '[object Array]';
    };

  function InternalError(originalError) {
    this[ORIGINAL_ERROR] = originalError;
  }

  function isInternalError(anything) {
    return anything instanceof InternalError;
  }

  function isObject(anything) {
    //Object.create(null) instanceof Object → false
    return Object(anything) === anything;
  }

  function isCallable(anything) {
    return typeof anything == 'function';
  }

  function isPromise(anything) {
    return anything instanceof Promise;
  }

  function identity(value) {
    return value;
  }

  function thrower(reason) {
    throw reason;
  }

  function enqueue(promise, onFulfilled, onRejected) {
    if (!promise[ON_FUlFILLED]) {
      promise[ON_FUlFILLED] = [];
      promise[ON_REJECTED] = [];
    }
    promise[ON_FUlFILLED].push(onFulfilled);
    promise[ON_REJECTED].push(onRejected);
  }

  function clearAllQueues(promise) {
    delete promise[ON_FUlFILLED];
    delete promise[ON_REJECTED];
  }

  function callEach(queue) {
    var i;
    var length = queue.length;
    for (i = 0; i < length; i++) {
      queue[i]();
    }
  }

  function call(resolve, reject, value) {
    var anything = toPromise(value);
    if (isPromise(anything)) {
      anything.then(resolve, reject);
    } else if (isInternalError(anything)) {
      reject(anything[ORIGINAL_ERROR]);
    } else {
      resolve(value);
    }
  }

  function toPromise(anything) {
    var then;
    if (isPromise(anything)) {
      return anything;
    }
    if(isObject(anything)) {
      try {
        then = anything.then;
      } catch (error) {
        return new InternalError(error);
      }
      if (isCallable(then)) {
        return new Promise(function (resolve, reject) {
          setImmediate(function () {
            try {
              then.call(anything, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    }
    return null;
  }

  function resolvePromise(promise, resolver) {
    function resolve(value) {
      if (promise[STATUS] == PENDING) {
        fulfillPromise(promise, value);
      }
    }
    function reject(reason) {
      if (promise[STATUS] == PENDING) {
        rejectPromise(promise, reason);
      }
    }
    try {
      resolver(resolve, reject);
    } catch(error) {
      reject(error);
    }
  }

  function fulfillPromise(promise, value) {
    var queue;
    var anything = toPromise(value);
    if (isPromise(anything)) {
      promise[STATUS] = INTERNAL_PENDING;
      anything.then(
        function (value) {
          fulfillPromise(promise, value);
        },
        function (reason) {
          rejectPromise(promise, reason);
        }
      );
    } else if (isInternalError(anything)) {
      rejectPromise(promise, anything[ORIGINAL_ERROR]);
    } else {
      promise[STATUS] = FULFILLED;
      promise[VALUE] = value;
      queue = promise[ON_FUlFILLED];
      if (queue && queue.length) {
        clearAllQueues(promise);
        callEach(queue);
      }
    }
  }

  function rejectPromise(promise, reason) {
    var queue = promise[ON_REJECTED];
    promise[STATUS] = REJECTED;
    promise[VALUE] = reason;
    if (queue && queue.length) {
      clearAllQueues(promise);
      callEach(queue);
    }
  }

  function Promise(resolver) {
    var promise = this;
    if (!isPromise(promise)) {
      throw new TypeError(REQUIRES_NEW);
    }
    promise[STATUS] = PENDING;
    promise[VALUE] = undefined;
    resolvePromise(promise, resolver);
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var promise = this;
    var nextPromise;
    onFulfilled = isCallable(onFulfilled) ? onFulfilled : identity;
    onRejected = isCallable(onRejected) ? onRejected : thrower;
    nextPromise = new Promise(function (resolve, reject) {
      function tryCall(func) {
        var value;
        try {
          value = func(promise[VALUE]);
        } catch (error) {
          reject(error);
          return;
        }
        if (value === nextPromise) {
          reject(new TypeError(CHAINING_CYCLE));
        } else {
          call(resolve, reject, value);
        }
      }
      function asyncOnFulfilled() {
        setImmediate(tryCall, onFulfilled);
      }
      function asyncOnRejected() {
        setImmediate(tryCall, onRejected);
      }
      switch (promise[STATUS]) {
        case FULFILLED:
          asyncOnFulfilled();
          break;
        case REJECTED:
          asyncOnRejected();
          break;
        default:
          enqueue(promise, asyncOnFulfilled, asyncOnRejected);
      }
    });
    return nextPromise;
  };

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(identity, onRejected);
  };

  Promise.resolve = function (value) {
    var anything = toPromise(value);
    if (isPromise(anything)) {
      return anything;
    }
    return new Promise(function (resolve, reject) {
      if (isInternalError(anything)) {
        reject(anything[ORIGINAL_ERROR]);
      } else {
        resolve(value);
      }
    });
  };

  Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
      reject(reason);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      var i;
      var length;
      if (isArray(values)) {
        length = values.length;
        for (i = 0; i < length; i++) {
          call(resolve, reject, values[i]);
        }
      } else {
        reject(new TypeError(NOT_ARRAY));
      }
    });
  };

  Promise.all = function (values) {
    return new Promise(function (resolve, reject) {
      var fulfilledCount = 0;
      var promiseCount = 0;
      var anything;
      var length;
      var value;
      var i;
      if (isArray(values)) {
        values = values.slice(0);
        length = values.length;
        for (i = 0; i < length; i++) {
          value = values[i];
          anything = toPromise(value);
          if (isPromise(anything)) {
            promiseCount++;
            anything.then(
              function (index) {
                return function (value) {
                  values[index] = value;
                  fulfilledCount++;
                  if (fulfilledCount == promiseCount) {
                    resolve(values);
                  }
                };
              }(i),
              reject
            );
          } else if (isInternalError(anything)) {
            reject(anything[ORIGINAL_ERROR]);
          } else {
            //[1, , 3] → [1, undefined, 3]
            values[i] = value;
          }
        }
        if (!promiseCount) {
          resolve(values);
        }
      } else {
        reject(new TypeError(NOT_ARRAY));
      }
    });
  };

  if (typeof module != 'undefined' && module.exports) {
    module.exports = global.Promise || Promise;
  } else if (!global.Promise) {
    global.Promise = Promise;
  }

}(this));
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

'use strict';
var voiceAvailable = false;
var pausetime = 1;
var voiceId;

HTMLElement.prototype.requestFullscreen = HTMLElement.prototype.requestFullscreen || HTMLElement.prototype.webkitRequestFullscreen;
HTMLDocument.prototype.exitFullscreen = HTMLDocument.prototype.exitFullscreen || HTMLDocument.prototype.webkitExitFullscreen;

if (!('fullscreenElement' in document)) {
    Object.defineProperty(document, 'fullscreenElement', {
        get: function() {
            return document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement;
        }
    });
}

for (var prefixedFullscreenChangeEvent of['webkitfullscreenchange']) {
    document.addEventListener(prefixedFullscreenChangeEvent, function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();




        var fullscreenChange = document.createEvent('Event');
        fullscreenChange.initEvent('fullscreenchange', true /*bubbles */ , false /* cancelable */ );
        event.target.dispatchEvent(fullscreenChange);

        //   toggle class vjs-fullscreen
        // full screen issue fix
        var videoElem = document.getElementById('js--video-player');
        if (document.fullscreenElement)
            videoElem.classList.add('vjs-fullscreen');
        else
            videoElem.classList.remove('vjs-fullscreen');
    });
}

window.HELP_IMPROVE_VIDEOJS = false;

function Pictor(config) {
    var videoElem = document.createElement('video');
    if (config) {
        this.config = config;
        videoElem.setAttribute('src', config.videoUrl);
        videoElem.setAttribute('class', 'video-js vjs-fluid');
        videoElem.setAttribute('webkit-playsinline', '');
        videoElem.setAttribute('playsinline', '');
        videoElem.setAttribute('id', 'js--video-player');
        videoElem.setAttribute("data-matomo-title", 'HDFC Toyota Yaris');
        if (config.posterUrl) {
            videoElem.setAttribute("poster", config.posterUrl);
        }
        video = videoElem;
    }

    this.video = videoElem;
}

Pictor.prototype.animationStart = (function(el) {
    var animations = {
        animation: 'animationstart',
        OAnimation: 'oAnimationStart',
        MozAnimation: 'mozAnimationStart',
        WebkitAnimation: 'webkitAnimationStart',
    };

    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
})(document.createElement('div'));

Pictor.prototype.animationEnd = (function(el) {
    var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
    };
    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
    animateFinish();
})(document.createElement('div'));

Pictor.prototype.fetchData = function(uri, callback) {
    var self = this;
    console.log('fetch', uri)
    fetch(uri)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            // self.data = myJson[0];
            self.data = myJson;
            callback();
        });
};


Pictor.prototype.init = function() {
    var self = this,
        config = self.config;
    // var video = self.video;
    var pathArray = window.location.pathname.split('/');
    var id = pathArray[pathArray.length - 1]
    this.fetchData('data.json', function callback() {
        voiceId = id;

        new Promise(function(resolve, reject) {
            self._handleRules(config.rules);
            resolve('done');
        }).then(function() {
            // retargeting video element 
            var firstName = self.data['text1'].split(" ");
            firstName = firstName[0];
            var payload = {
                id: id,
                message: "Hello " + firstName
            };

            $.ajax({
                url: '/voice/' + id,
                type: 'get',
                dataType: 'json',
                success: function(data) {
                    console.log("Got: " + data.success);
                    if (data.success == "failed") {
                        voiceAvailable = false;
                    } else {
                        voiceAvailable = true;

                    }
                    //alert("Data: " + data.success); 
                },
                data: payload
            });
            var v = document.getElementsByClassName('vjs-tech')[0];
            CHARLIE.setup(v);

            $('.charlie').on(self.animationStart, function(el) {
                var $number = $(this).find('.number');
                // console.log('animate start', $number)
                if ($number.hasClass('shuffle') && !$number.hasClass('shuffled')) {
                    $number.addClass('shuffled');
                    self.numberAnimation(parseFloat($number.text()), this);
                }
            });
        });
    });

    $('#videoPlayerWrapper').append(self.video);
    self.myPlayer = videojs('js--video-player', {
        controls: true,
        autoplay: false,
        preload: false,
    });

    // create restart button
    $('#js--video-player').append('<button class="vjs-icon-replay vjs-replay-button"></button>');

    if (self.isiOS()) {
        $('.vjs-fullscreen-control').hide();
    }

    $('.vjs-fluid').prepend(textAnimationBlock);
    textAnimationBlock.classList.add('is-ready');

    var currentTime = 0;
    self.myPlayer.el_.addEventListener('webkitfullscreenchange', function() {
        self.handleFullScreen.call(this, event);
    });

    self.controlbarAtBottom();
    self.iOSHotFix();
    //This example allows users to seek backwards but not forwards. 
    //To disable all seeking replace the if statements from the next 
    //two functions with myPlayer.currentTime(currentTime); 

    //Sound vars
    var timeout
    var assetsPath = "/sounds/";
    var sounds;

    function soundLoaded(event) {
        //examples.hideDistractor(); 
        // var div = document.getElementById(event.id); 
        // div.style.backgroundImage = "url('../_assets/art/audioButtonSheet.png')"; 
    }

    //This example allows users to seek backwards but not forwards.
    //To disable all seeking replace the if statements from the next
    //two functions with myPlayer.currentTime(currentTime);
    var timeout;
    self.myPlayer.on('waiting', function() {
        if (!shouldWait) return;
        if (self.myPlayer.currentTime() < 1) return;
        self.myPlayer.pause();
        if (timeout) return;
        timeout = setTimeout(function() {
            self.myPlayer.play();
            timeout = '';
        }, 5000)
    })


    self.myPlayer.on('seeking', function(event) {
        if (currentTime < self.myPlayer.currentTime()) {
            self.myPlayer.currentTime(currentTime);
        }
    });

    self.myPlayer.on('seeked', function(event) {
        if (currentTime < self.myPlayer.currentTime()) {
            self.myPlayer.currentTime(currentTime);
        }
    });
    self.myPlayer.on('ended', function() {
        $(".button").addClass("button-opacity");
        self.myPlayer.posterImage.show();
        $(this.posterImage.contentEl()).show();
        self.myPlayer.currentTime(0);
        self.myPlayer.controlBar.hide();
        self.myPlayer.bigPlayButton.removeClass('video-paused');
        self.myPlayer.bigPlayButton.hide();
        // self.myPlayer.cancelFullScreen();
        $('.vjs-replay-button').removeClass('video-paused').show();

    });
    self.myPlayer.on('play', function() {
        $(".button").removeClass('button-opacity');
        shouldWait = false;
        self.myPlayer.posterImage.hide();
        self.myPlayer.controlBar.show();
        self.myPlayer.bigPlayButton.hide();
        if (self.myPlayer.bigPlayButton.hasClass('video-paused')) {
            self.myPlayer.bigPlayButton.removeClass('video-paused');
        }
        if ($('.vjs-replay-button').hasClass('video-paused')) {
            $('.vjs-replay-button').removeClass('video-paused');
        }
        $('.vjs-replay-button').hide();
        if ($('.shuffle').hasClass('shuffled')) {
            $('.shuffle').removeClass('shuffled');
        }
        //Sound init
        if (voiceAvailable == true) {
            sounds = [{
                    src: voiceId + ".mp3",
                    id: 1
                } //OJR would prefer a new sound rather than a copy 
            ];
            createjs.Sound.alternateExtensions = ["mp3"]; // add other extensions to try loading if the src file extension is not supported 
            createjs.Sound.addEventListener("fileload", createjs.proxy(soundLoaded, this)); // add an event listener for when load is completed 
            createjs.Sound.registerSounds(sounds, assetsPath);
        }


    });

    self.myPlayer.on('timeupdate', function() {
        if (self.myPlayer.currentTime() > 0) {
            shouldWait = true;
        }
        if (Math.floor(self.myPlayer.currentTime()) == pausetime && self.myPlayer.currentTime() < 1.3) {

            if (voiceAvailable == true) {
                console.log("Speaking now" + Math.floor(self.myPlayer.currentTime()));
                var instance = createjs.Sound.play(1);
            }
        }
    });

    $('.vjs-replay-button').on('click', function() {
        shouldWait = false;
        self.myPlayer.currentTime(0);
        $(this).hide();
        self.myPlayer.play();
    });

    self.myPlayer.on('pause', function() {
        // console.log('video pause');
        // console.log(self.video.currentTime);
        self.myPlayer.bigPlayButton.addClass('video-paused');
        $('.vjs-replay-button').addClass('video-paused').show();
    });

};
var video,
    shouldWait = false,
    textAnimationBlock = document.getElementById('textAnimationBlock');
console.log(video, textAnimationBlock)

Pictor.prototype.handleFullScreen = function(event) {
    var self = this;
    // console.log('handleFullScreen', event);
    /* Fullscreen */
    lockScreenInLandscape();
    // console.log(video, textAnimationBlock)


    function requestFullscreenVideo() {
        if (videoPlayerWrapper.requestFullscreen) {
            videoPlayerWrapper.requestFullscreen();
        } else {
            video.webkitEnterFullscreen();
        }
    }

    if ('orientation' in screen) {
        screen.orientation.addEventListener('change', function() {
            // Let's automatically request fullscreen if user switches device in landscape mode.
            if (screen.orientation.type.startsWith('landscape')) {
                console.log('orientation change')
                    // Note: It may silently fail in browsers that don't allow requesting
                    // fullscreen from the orientation change event.
                    // https://github.com/whatwg/fullscreen/commit/e5e96a9da944babf0e246980559cd80a46a300ca
                    // requestFullscreenVideo();
            } else if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        });
    }

    function lockScreenInLandscape() {
        if (!('orientation' in screen)) {
            return;
        }

        // Let's force landscape mode only if device is in portrait mode and can be held in one hand.
        if (
            matchMedia('(orientation: portrait) and (max-device-width: 768px)')
            .matches
        ) {
            screen.orientation.lock('landscape').then(function() {
                // When screen is locked in landscape while user holds device in
                // portrait, let's use the Device Orientation API to unlock screen only
                // when it is appropriate to create a perfect and seamless experience.
                listenToDeviceOrientationChanges();
            });
        }
    }

    function listenToDeviceOrientationChanges() {
        if (!('DeviceOrientationEvent' in window)) {
            return;
        }

        var previousDeviceOrientation, currentDeviceOrientation;
        window.addEventListener(
            'deviceorientation',
            function onDeviceOrientationChange(event) {
                // event.beta represents a front to back motion of the device and
                // event.gamma a left to right motion.
                if (Math.abs(event.gamma) > 10 || Math.abs(event.beta) < 10) {
                    previousDeviceOrientation = currentDeviceOrientation;
                    currentDeviceOrientation = 'landscape';
                    return;
                }
                if (Math.abs(event.gamma) < 10 || Math.abs(event.beta) > 10) {
                    previousDeviceOrientation = currentDeviceOrientation;
                    // When device is rotated back to portrait, let's unlock screen orientation.
                    if (previousDeviceOrientation == 'landscape') {
                        screen.orientation.unlock();
                        window.removeEventListener(
                            'deviceorientation',
                            onDeviceOrientationChange
                        );
                    }
                }
            }
        );
    }
};

Pictor.prototype._handleRules = function(rules) {

    var self = this;
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        self._createElem(rule);
    }
}

Pictor.prototype._createElem = function(elem) {
    var element;
    var self = this;
    if (elem.tag) {
        element = document.createElement(elem.tag);
    } else {
        element = document.createElement('div');
    }

    var textContainer = document.getElementById('textAnimationBlock');

    if (elem.id) {
        element.setAttribute('id', elem.id);
    }

    if (elem.href) {
        element.setAttribute('href', elem.href);
    }

    if (elem.hrefTarget) {
        element.setAttribute('href', self.data[elem.hrefTarget]);
    }

    if (elem.newWindow) {
        element.setAttribute('target', '_blank');
    }

    if (elem.animations) {
        element.setAttribute('data-animations', elem.animations);
    }

    if (elem.times) {
        element.setAttribute('data-times', elem.times);
    }

    if (elem.class) {
        element.setAttribute('class', elem.class);
    }

    if (elem.target && !elem.split) {
        var text = document.createTextNode(self.data[elem.target]);
        element.appendChild(text);
    }

    if (elem.text) {
        var text = document.createTextNode(elem.text);
        element.appendChild(text);
    }

    if (elem.bgImg) {
        element.style.background = "url(" + self.data[elem.bgImg] + ") center no-repeat";
        element.style.backgroundSize = "contain";
    }



    if (elem.parent) {
        // append to parent
        $(elem.parent).append(element);
    } else {
        $('#textAnimationBlock').append(element);
    }
    if (elem.split) {
        self.splitUp(self.data[elem.target], '#' + elem.id, elem.split.separator, elem.split.time)
    }
}

Pictor.prototype._handleOrientationChange = function() {
    var self = this;
    // var portrait = (window.orientation % 180 == 0);
    // if( window.orientation % 180 == 0) {
    //   // $("body").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");

    // }
    switch (window.orientation) {
        case 90 || -90:
            break;
        default:
            console.log('Portrait');
            // alert('Portrait');
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (fullscreenElement) {
                fullscreenElement.exitFullscreen();
            }
    }

}

Pictor.prototype.isiOS = function() {
    return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

Pictor.prototype.isAndroid = function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
}

Pictor.prototype.controlbarAtBottom = function() {
    var self = this;
    var height = $('.vjs-control-bar').height();
    $('.vjs-control-bar').css('bottom', '-' + height + 'px');

    window.addEventListener('resize', self.controlbarAtBottom);
    window.addEventListener('orientationchange', self.controlbarAtBottom);
    window.addEventListener('orientationchange', self._handleOrientationChange);
}

Pictor.prototype.iOSHotFix = function() {
    var self = this;

    self.myPlayer.on('pause', function() {

        if (self.isiOS()) {
            $('.charlie').each(function() {
                if ($(this).hasClass('animated')) {
                    $(this).css('-webkit-transform', $(this).css('-webkit-transform'));
                }
            })
        }
    })
}
'use strict'
Pictor.prototype.splitUp = function (word, id, separator, time) {
  console.log(id)
  var arr = word.split(" ");
  time = parseFloat(time)

  var i = 0;
  $.each(arr, function (index) {
    // идем по массиву
    if (i === 9) {
      time += 1;
      i = 0;
      time = +time.toFixed(2);
    } else {
      time += 0.1;
      i = 0;
      time = +time.toFixed(2);
    }

    $(id).append(
      '<span class="charlie" data-animations="textAnimateLetter" data-times=" ' + time +
      '">' +
      (this == ' ' ? '&nbsp;' : this) +
      '</span>' + '&nbsp;'
    );

    i++;
  });
};

Pictor.prototype.numberAnimation = function (amount, parent) {
  var options = {
    amount: amount,
    delay: 0,
    duration: 50,
  };
  var amount = options.amount;
  var time = amount / options.duration;
  var number = 0;
  var fixed = 0;
  if (amount.toString().split('.')[1]) {
    fixed = amount.toString().split('.')[1].length;
  }
  requestAnimationFrame(function interval() {
    number += time;
    parent.querySelector('.number').innerHTML =
      // Math.round(number * 100) / 100;
      number.toFixed(fixed);
    if (number >= amount) {
      document.querySelector('.number').innerHTML = amount;
      cancelAnimationFrame(interval);
    } else {
      requestAnimationFrame(interval);
    }
  });
};
var config = {
  // config here
  videoUrl:
    'https://storage.googleapis.com/pictor-demo-videos/hdfc-yaris/yaris_empty.mp4',
  // posterUrl: './app/img/yaris_poster.png',
  textUrl: 'data.json',
  rules: [
    {
      id: 'animate1',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '1,5.4',
      target: 'text1'
    },
    {
      id: 'fon-animate1',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '1,5.4',
      target: 'text1'
    },
    {
      id: 'animate2',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '11.2,16',
      text: '₹ '
    },
    {
      tag: 'span',
      class: 'number shuffle',
      parent: '#animate2',
      target: 'text2'
    },
    {
      tag: 'span',
      text: ' Lacs',
      parent: '#animate2'
    },
    {
      id: 'animate3',
      tag: 'a',
      hrefTarget: 'urlButton',
      class: 'charlie',
      animations: 'animate-start2, animate-finish',
      times: '12.3, 32',
      newWindow: true,
      target: 'text3'
    },
    {
      id: 'animate4',
      class: 'charlie',
      animations: 'animate-start',
      times: '32.5',
      target: 'text4'
    },
    {
      tag: 'a',
      id: 'animate5',
      class: 'charlie',
      animations: 'animate-start',
      times: '32.5',
      newWindow: true,
      hrefTarget: 'urlButton'
    }
  ]
};
var pictor = new Pictor(config);

pictor.init();

// Only for this project
pictor.myPlayer.on('ended', function() {
  pictor.myPlayer.poster('./app/img/yaris_poster.png');
  $('#animate4').css('opacity', 1);
});

pictor.myPlayer.on('play', function () {
  // console.log()
  $('#animate1').css('opacity', 0);
  $('#animate4').css('opacity', 0);
});

pictor.myPlayer.on('pause', function() {
  if ($('#animate1').hasClass('animated') ) {
    $('#animate1').css('opacity', $('#animate1').css('opacity'));

    $('#animate1').on(pictor.animationEnd, function () {
      // console.log('animation end');
      $('#animate1').css('opacity', 0);
    })

    pictor.myPlayer.on('seeked', function() {
      $('#animate1').css('opacity', 0);
    });
  }
});
