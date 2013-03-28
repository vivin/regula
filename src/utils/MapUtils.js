/**
 * MapUtils contains some convenience functions related to Maps.
 * @type {{iterateOverMap: Function, exists: Function, put: Function, isEmpty: Function}}
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

        root.regulaModules.MapUtils = factory();
    }
}(this, function () {
    return {
        iterateOverMap: function (map, callback) {
            var index = 0;
            for (var property in map) if (map.hasOwnProperty(property) && property !== "__size__") {

                //the callback receives as arguments key, value, index. this is set to
                //the map that you are iterating over
                callback.call(map, property, map[property], index);
                index++;
            }
        },

        exists: function (array, value) {
            var found = false;
            var i = 0;

            while (!found && i < array.length) {
                found = value == array[i];
                i++;
            }

            return found;
        },

        put: function (map, key, value) {
            if (!map.__size__) {
                map.__size__ = 0;
            }

            if (!map[key]) {
                map.__size__++;
            }

            map[key] = value;
        },

        isEmpty: function (map) {
            for (var key in map) if (map.hasOwnProperty(key)) {
                return false;
            }

            return true;
        }
    };
}));