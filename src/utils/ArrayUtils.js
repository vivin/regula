/**
 * ArrayUtils contains some convenience functions related to arrays.
 * @type {{explode: Function}}
 */
define(function () {

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
});