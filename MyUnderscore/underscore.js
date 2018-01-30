(function () {

    //window
    var root = this;


    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    var
        slice            = ArrayProto.slice,
        toString         = ObjProto.toString,
        hasOwnProperty   = ObjProto.hasOwnProperty;


    var
        nativeKeys         = Object.keys


    var _ = function (obj) {

    }

    //执行环境判断
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // 当前 underscore 版本号
    _.VERSION = '1.8.3';

    //optimizeCb => optimizeCallback
    var optimizeCb = function(func, context, argCount) {
        // 如果没有指定 this 指向，则返回原函数
        if (context === void 0)
            return func;

        switch (argCount == null ? 3 : argCount) {
            case 1: return function(value) {
                return func.call(context, value);
            };
            case 2: return function(value, other) {
                return func.call(context, value, other);
            };

            // 如果有指定 this，但没有传入 argCount 参数
            // 则执行以下 case
            // _.each、_.map、_.findIndex传了context参数时
            case 3: return function(value, index, collection) {
                return func.call(context, value, index, collection);
            };

            // _.reduce、_.reduceRight
            case 4: return function(accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
        }

        // 其实不用上面的 switch-case 语句
        // 直接执行下面的 return 函数就行了
        // 不这样做的原因是 call 比 apply 快很多
        // .apply 在运行前要对作为参数的数组进行一系列检验和深拷贝，.call 则没有这些步骤
        // 具体可以参考：
        // https://segmentfault.com/q/1010000007894513
        // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.3
        // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.4
        return function() {
            return func.apply(context, arguments);
        };
    };


    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var property = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key]
        }
    }


    var getLength = property('length')

    //判断类数组
    var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    // IE < 9 下 不能用 for key in ... 来枚举对象的某些 key
    // 比如重写了对象的 `toString` 方法，这个 key 值就不能在 IE < 9 下用 for in 枚举到
    // IE < 9，{toString: null}.propertyIsEnumerable('toString') 返回 false
    // IE < 9，重写的 `toString` 属性被认为不可枚举
    // 据此可以判断是否在 IE < 9 浏览器环境中

    // 需要注意的是在平时使用中{toString: null}.propertyIsEnumerable('toString')会报错。{toString: null}必须要有一个expression的位置才能进行属性访问
    // 而!后面可以跟expression，这样进行属性访问就是合法的
    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');

    // IE < 9 下不能用 for in 来枚举的 key 值集合
    // 其实还有个 `constructor` 属性
    // 个人觉得可能是 `constructor` 和其他属性不属于一类
    // nonEnumerableProps[] 中都是方法
    // 而 constructor 表示的是对象的构造函数
    // 所以区分开来了
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

    // obj 为需要遍历键值对的对象
    // keys 为键数组
    // 利用 JavaScript 按值传递的特点
    // 传入数组作为参数，能直接改变数组的值
    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;

        // 获取对象的原型
        // 如果 obj 的 constructor 被重写
        // 则 proto 变量为 Object.prototype
        // 如果没有被重写
        // 则为 obj.constructor.prototype
        var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

        // Constructor is a special case.
        // `constructor` 属性需要特殊处理 (是否有必要？)
        // see https://github.com/hanzichi/underscore-analysis/issues/3
        // 如果 obj 有 `constructor` 这个 key
        // 并且该 key 没有在 keys 数组中
        // 存入 keys 数组
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        // 遍历 nonEnumerableProps 数组中的 keys
        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            // prop in obj 应该肯定返回 true 吧？是否有判断必要？
            // obj[prop] !== proto[prop] 判断该 key 是否来自于原型链
            // 即是否重写了原型链上的属性
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    }

    _.each = _.forEach = function (obj, iteratee, context) {

    }

    /**
     *  为Object.keys做兼容
     * @param obj
     * @returns {array}
     */
    _.keys = function(obj) {
        // 容错
        // 如果传入的参数不是对象，则返回空数组
        if (!_.isObject(obj)) return [];

        // 如果浏览器支持 ES5 Object.key() 方法
        // 则优先使用该方法
        if (nativeKeys) return nativeKeys(obj);

        var keys = [];

        // own enumerable properties
        for (var key in obj)
            // hasOwnProperty
            if (_.has(obj, key)) keys.push(key);

        // Ahem, IE < 9.
        // IE < 9 下不能用 for in 来枚举某些 key 值
        // 传入 keys 数组为参数
        // 因为 JavaScript 下函数参数按值传递
        // 所以 keys 当做参数传入后会在 `collectNonEnumProps` 方法中改变值
        if (hasEnumBug) collectNonEnumProps(obj, keys);

        return keys;
    };

    /**
     *  返回一个对象里所有的方法名, 而且是已经排序的 — 也就是说, 对象里每个方法的名称.
     _.functions(_);
     => ["all", "any", "bind", "bindAll", "clone", "compact", "compose" ...
     * @type {methods}
     */
    _.functions = _.methods = function (obj) {
        var names =[]
        for(var key in obj){
            if(_.isFunction(obj[key])) names.push(key)
        }
        return names.sort()
    }

    /**
     *  判断对象中是否有指定 key
     * @param obj
     * @param key
     * @returns {boolean|*}
     */
    _.has = function (obj,key) {
        return obj != null && hasOwnProperty.call(obj,key)
    }

    _.mixin = function (obj) {

    }

    /**
     *  将一个对象的所有 values 值放入数组中，不包括原型属性
     * @param obj
     * @returns {array|*}
     */
    _.values = function (obj) {
        // 仅包括 own properties
        var keys = _.keys(obj);
        var length = keys.length;
        // 定长初始化,提前分配内存空间,为了效率？？
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    }

    //暂时不清楚guard是用来干嘛的，代码中只要guard不为false就设fromIndex为0
    _.contains = _.includes = _.include = function (obj,item,fromIndex,guard) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        if(typeof fromIndex != 'number' || guard) fromIndex = 0
        return _.indexOf(obj, item, fromIndex) >= 0;
    }

    _.identity = function(value) {
        return value;
    };
    _.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    var cb = function(value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };

    function createIndexFinder(dir, predicateFind, sortedIndex) {
        // API 调用形式
        // _.indexOf(array, value, [isSorted])
        // _.indexOf(array, value, [fromIndex])
        // _.lastIndexOf(array, value, [fromIndex])
        return function(array, item, idx) {
            var i = 0, length = getLength(array);

            // 如果 idx 为 Number 类型
            // 则规定查找位置的起始点
            // 那么第三个参数不是 [isSorted]
            // 所以不能用二分查找优化了
            // 只能遍历查找
            if (typeof idx == 'number') {
                if (dir > 0) { // 正向查找
                    // 重置查找的起始位置
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else { // 反向查找
                    // 如果是反向查找，重置 length 属性值
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                // 能用二分查找加速的条件
                // 有序 & idx !== 0 && length !== 0

                // 用 _.sortIndex 找到有序数组中 item 正好插入的位置
                idx = sortedIndex(array, item);

                // 如果正好插入的位置的值和 item 刚好相等
                // 说明该位置就是 item 第一次出现的位置
                // 返回下标
                // 否则即是没找到，返回 -1
                return array[idx] === item ? idx : -1;
            }

            // 特判，如果要查找的元素是 NaN 类型
            // 如果 item !== item
            // 那么 item => NaN
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }

            // O(n) 遍历数组
            // 寻找和 item 相同的元素
            // 特判排除了 item 为 NaN 的情况
            // 可以放心地用 `===` 来判断是否相等了
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
            }

            return -1;
        };
    }

    function createPredicateIndexFinder(dir) {
        // 经典闭包
        return function(array, predicate, context) {
            predicate = cb(predicate, context);

            var length = getLength(array);

            // 根据 dir 变量来确定数组遍历的起始位置
            var index = dir > 0 ? 0 : length - 1;

            for (; index >= 0 && index < length; index += dir) {
                // 找到第一个符合条件的元素
                // 并返回下标值
                if (predicate(array[index], index, array))
                    return index;
            }

            return -1;
        };
    }
    var createAssigner = function(keysFunc, undefinedOnly) {
        // 返回函数
        // 经典闭包（undefinedOnly 参数在返回的函数中被引用）
        // 返回的函数参数个数 >= 1
        // 将第二个开始的对象参数的键值对 "继承" 给第一个参数
        return function(obj) {
            var length = arguments.length;
            // 只传入了一个参数（或者 0 个？）
            // 或者传入的第一个参数是 null
            if (length < 2 || obj == null) return obj;

            // 枚举第一个参数除外的对象参数
            // 即 arguments[1], arguments[2] ...
            for (var index = 1; index < length; index++) {
                // source 即为对象参数
                var source = arguments[index],
                    // 提取对象参数的 keys 值
                    // keysFunc 参数表示 _.keys
                    // 或者 _.allKeys
                    keys = keysFunc(source),
                    l = keys.length;

                // 遍历该对象的键值对
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    // _.extend 和 _.extendOwn 方法
                    // 没有传入 undefinedOnly 参数，即 !undefinedOnly 为 true
                    // 即肯定会执行 obj[key] = source[key]
                    // 后面对象的键值对直接覆盖 obj
                    // ==========================================
                    // _.defaults 方法，undefinedOnly 参数为 true
                    // 即 !undefinedOnly 为 false
                    // 那么当且仅当 obj[key] 为 undefined 时才覆盖
                    // 即如果有相同的 key 值，取最早出现的 value 值
                    // *defaults 中有相同 key 的也是一样取首次出现的
                    if (!undefinedOnly || obj[key] === void 0)
                        obj[key] = source[key];
                }
            }

            // 返回已经继承后面对象参数属性的第一个参数对象
            return obj;
        };
    };

    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);
    _.extendOwn = _.assign = createAssigner(_.keys);

    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);

    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj !== +obj;
    };

    _.isMatch = function(object, attrs) {
        // 提取 attrs 对象的所有 keys
        var keys = _.keys(attrs), length = keys.length;

        // 如果 object 为空
        // 根据 attrs 的键值对数量返回布尔值
        if (object == null) return !length;

        // 这一步有必要？
        var obj = Object(object);

        // 遍历 attrs 对象键值对
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            // 如果 obj 对象没有 attrs 对象的某个 key
            // 或者对于某个 key，它们的 value 值不同
            // 则证明 object 并不拥有 attrs 的所有键值对
            // 则返回 false
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }

        return true;
    };

    _.property = property;

    _.matcher = _.matches = function(attrs) {
        attrs = _.extendOwn({}, attrs);
        return function(obj) {
            return _.isMatch(obj, attrs);
        };
    };

    // 将前面定义的 underscore 方法添加给包装过的对象
    // 即添加到 _.prototype 中
    // 使 underscore 支持面向对象形式的调用
    _.mixin(_);


    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
    // 其他类型判断
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    //typeof /./ 判断正则是不是函数
    if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        //上面_.each(['Arguments', 'Function',.... 已经声音过isFunction，这里有可能覆盖上面的声名
        _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }

}.call(this))
//(function{}())()在严格模式下this为undefined，用call的方式是最好的

//0._isFunction
//1._.functions
//has
//values
//2._.each
//3.