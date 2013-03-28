/**
 * Defines exceptions that regula throws. Also contains a utility method that makes it easy to generate exception messages.
 * @type {{Exception: {}, generateExceptionMessage: Function, explodeParameters: Function}}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["utils/ArrayUtils"], factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.ExceptionService = factory(root.regulaModules.ArrayUtils);
    }
}(this, function (ArrayUtils) {
    var Exception = {
        IllegalArgumentException: function (message) {
            this.name = "IllegalArgumentException";
            this.message = message;
        },
        ConstraintDefinitionException: function (message) {
            this.name = "ConstraintDefinitionException";
            this.message = message;
        },
        BindException: function (message) {
            this.name = "BindException";
            this.message = message;
        },
        MissingFeatureException: function (message) {
            this.name = "MissingFeatureException";
            this.message = message;
        }
    };

    //Make sure our errors extend the native Exception object
    for (var errorType in Exception) if (Exception.hasOwnProperty(errorType)) {
        var error = Exception[errorType];
        error.prototype = new Error();
        error.prototype.constructor = error;
    }

    function generateExceptionMessage(element, constraintName, message) {
        var errorMessage = "";

        if (element != null) {
            errorMessage = element.id;

            if (constraintName == "" || constraintName == null || constraintName == undefined) {
                errorMessage += ": ";
            } else {
                errorMessage += "." + constraintName + ": ";
            }
        } else {
            if (constraintName != "" && constraintName != null && constraintName != undefined) {
                errorMessage = "@" + constraintName + ": "
            }
        }

        return errorMessage + message;
    }

    /**
     * TODO: I am not entirely convinced that this is the right place for this
     * @param options
     * @return {String}
     */
    function explodeParameters(options) {
        var str = "Function received: {";
        for (var argument in options) if (options.hasOwnProperty(argument)) {

            if (typeof options[argument] == "string") {
                str += argument + ": " + options[argument] + ", ";
            } else if (options[argument] instanceof Array) { //we need this to be an array
                str += argument + ": [" + ArrayUtils.explode(options[argument], ", ") + "], "
            }
        }

        str = str.replace(/, $/, "") + "}";
        return str;
    }

    return {
        Exception: Exception,
        generateExceptionMessage: generateExceptionMessage,
        explodeParameters: explodeParameters
    }
}));