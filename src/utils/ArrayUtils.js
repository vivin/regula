/**
 * ArrayUtils contains some convenience functions related to arrays.
 * @type {{explode: Function}}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.ArrayUtils = factory();
    }
}(this, function () {
    function explode(array, delimeter) {
        var str = "";

        for (var i = 0; i < array.length; i++) {
            str += array[i] + delimeter;
        }

        return str.replace(new RegExp(delimeter + "$"), "");
    }

    return {
        explode: explode
    };
}));