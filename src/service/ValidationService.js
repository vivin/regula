/**
 * Encapsulates the logic that performs constraint validation.
 * The init method needs to be called prior to invoking the validate method or the createPublicValidator method. It's...
 * less than ideal, but I wanted to inject values instead of having cyclical dependencies on other modules.
 * @type {{Validator: {}, compoundValidator: Function, validate: Function, runValidatorFor: Function, interpolateConstraintDefaultMessage: Function}}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "utils/DOMUtils",
            "utils/MapUtils",
            "service/GroupService",
            "service/ExceptionService",
            "utils/ArrayUtils"
        ], factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.ValidationService = factory(
            root.regulaModules.DOMUtils,
            root.regulaModules.MapUtils,
            root.regulaModules.GroupService,
            root.regulaModules.ExceptionService,
            root.regulaModules.ArrayUtils
        );
    }
}(this, function (DOMUtils, MapUtils, GroupService, ExceptionService, ArrayUtils) {

    var config = {}; //Regula configuration options. Injected from the regula module.
    var ReverseConstraint = {}; //Reverse-lookup using constraint names. Injected from the regula module.
    var constraintDefinitions = {}; //Constraints that have been defined. Injected from the regula module.
    var boundConstraints = {}; //Elements and constraints that have been bound to them

    var processedConstraints = {}; //Keeps track of constraints that have already been processed into contexts for a validation run. Cleared out each time validation is run.
    var processedRadioGroups = {}; //Keeps track of constraints that have already been processed into contexts for a validation run, on radio groups. Cleared out each time validation is run.

     /**
     * Public-facing validators. Provides a convenient way for developers to directly call validator functions that
     * belong to constraints. The actual validators are not exposed. Initially set to null, it will be initialized
     * and populated in the initializePublicValidators method
     * @type {{}}
     */
    var publicValidator = {};
    function initializePublicValidators(constraintDefinitions) {
        for(var constraintName in constraintDefinitions) if(constraintDefinitions.hasOwnProperty(constraintName)) {
            createPublicValidator(constraintName, constraintDefinitions);
        }
    }

    function init(options) {
        config = options.config;
        ReverseConstraint = options.ReverseConstraint;
        constraintDefinitions = options.constraintDefinitions;
        boundConstraints = options.boundConstraints;
    }

    /**
     * Validators that are used by regula to perform the actual validation. Will also contain references to custom and
     * compound constraints defined by the user.
     *
     * @type {{checked: Function, selected: Function, max: Function, min: Function, range: Function, notBlank: Function, blank: Function, matches: Function, email: Function, alpha: Function,
     *         numeric: Function, integer: Function, real: Function, alphaNumeric: Function, completelyFilled: Function, passwordsMatch: Function, required: Function, length: Function,
     *         digits: Function, past: Function, future: Function, url: Function, step: Function, html5Required: Function, html5Email: Function, html5URL: Function, html5Number: Function,
     *         html5DateTime: Function, html5DateTimeLocal: Function, html5Date: Function, html5Month: Function, html5Time: Function, html5Week: Function, html5Range: Function, html5Tel: Function,
     *         html5Color: Function, html5Pattern: Function, html5MaxLength: Function, html5Min: Function, html5Max: Function, html5Step: Function}}
     */
    var Validator = {
        checked: function (params) {
            var result = false;

            if (this.type.toLowerCase() === "radio" && this.name.replace(/\s/g, "") !== "") {
                var elements = DOMUtils.getElementsByAttribute(document.body, "input", "name", this.name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));

                var i = 0;
                while (i < elements.length && !result) {
                    result = elements[i].checked;
                    i++;
                }

            } else {
                result = this.checked;
            }

            return result;
        },

        selected: function (params) {
            return this.selectedIndex > 0;
        },

        max: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = (parseFloat(this.value) <= parseFloat(params["value"]));
            }

            return result;
        },

        min: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = (parseFloat(this.value) >= parseFloat(params["value"]));
            }

            return result;
        },

        range: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = (this.value.replace(/\s/g, "") != "" && parseFloat(this.value) <= parseFloat(params["max"]) && parseFloat(this.value) >= parseFloat(params["min"]));
            }

            return result;
        },

        notBlank: function (params) {
            return this.value.replace(/\s/g, "") != "";
        },

        blank: function (params) {
            return this.value.replace(/\s/g, "") === "";
        },

        matches: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                var re;

                var regex;
                if (typeof params["regex"] === "string") {
                    regex = params["regex"].replace(/^\//, "").replace(/\/$/, "")
                } else {
                    regex = params["regex"];
                }

                if (typeof params["flags"] !== "undefined") {
                    re = new RegExp(regex.toString().replace(/^\//, "").replace(/\/[^\/]*$/, ""), params["flags"]);
                } else {
                    re = new RegExp(regex);
                }

                result = re.test(this.value);
            }

            return result;
        },

        email: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(this.value);
            }

            return result;
        },

        alpha: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^[A-Za-z]+$/.test(this.value);
            }

            return result;
        },

        numeric: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^[0-9]+$/.test(this.value);
            }

            return result;
        },

        integer: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^-?[0-9]+$/.test(this.value);
            }

            return result;
        },

        real: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^-?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/.test(this.value);
            }

            return result;
        },

        alphaNumeric: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^[0-9A-Za-z]+$/.test(this.value);
            }

            return result;
        },

        completelyFilled: function (params) {
            var unfilledElements = [];

            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];

                if (!Validator.required.call(element)) {
                    unfilledElements.push(element);
                }
            }

            return unfilledElements;
        },

        passwordsMatch: function (params) {
            var failingElements = [];

            var passwordField1 = document.getElementById(params["field1"]);
            var passwordField2 = document.getElementById(params["field2"]);

            if (passwordField1.value != passwordField2.value) {
                failingElements = [passwordField1, passwordField2];
            }

            return failingElements;
        },

        required: function (params) {
            var result = true;

            if (this.tagName) {
                if (this.tagName.toLowerCase() === "select") {
                    result = Validator.selected.call(this);
                } else if (this.type.toLowerCase() === "checkbox" || this.type.toLowerCase() === "radio") {
                    result = Validator.checked.call(this);
                } else if (this.tagName.toLowerCase() === "input" || this.tagName.toLowerCase() === "textarea") {
                    if (this.type.toLowerCase() != "button") {
                        result = Validator.notBlank.call(this);
                    }
                }
            }

            return result;
        },

        length: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = (this.value.length >= params["min"] && this.value.length <= params["max"]);
            }

            return result;
        },

        digits: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                var value = this.value.replace(/\s/g, "");
                var parts = value.split(/\./);
                result = false;

                if (value.length > 0) {

                    if (parts.length == 1) {
                        parts[1] = "";
                    }

                    if (params["integer"] > 0) {
                        result = parts[0].length <= params["integer"];
                    } else {
                        result = true; //we don't care about the number of digits in the integer part
                    }

                    if (params["fraction"] > 0) {
                        result = result && parts[1].length <= params["fraction"];
                    }
                }

            }

            return result;
        },

        past: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                var dates = parseDates.call(this, params);
                result = (dates.dateToValidate < dates.dateToTestAgainst);
            }

            return result;
        },

        future: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                var dates = parseDates.call(this, params);
                result = (dates.dateToValidate > dates.dateToTestAgainst);
            }

            return result;
        },

        url: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(this.value);
            }

            return result;
        },

        step: function (params) {
            var result = true;

            if (shouldValidate(this, params)) {
                var value = parseFloat(this.value);
                var max = parseFloat(params["max"]);
                var min = parseFloat(params["min"]);
                var step = parseFloat(params["value"]);

                result = (value <= max && value >= min) && (value % step === 0);
            }

            return result;
        },

        html5Required: function (params) {
            return !this.validity.valueMissing;
        },
        html5Email: html5TypeValidator,
        html5URL: html5TypeValidator,
        html5Number: html5TypeValidator,
        html5DateTime: html5TypeValidator,
        html5DateTimeLocal: html5TypeValidator,
        html5Date: html5TypeValidator,
        html5Month: html5TypeValidator,
        html5Time: html5TypeValidator,
        html5Week: html5TypeValidator,
        html5Range: html5TypeValidator,
        html5Tel: html5TypeValidator,
        html5Color: html5TypeValidator,
        html5Pattern: function (params) {
            return !this.validity.patternMismatch;
        },

        html5MaxLength: function (params) {
            return !this.validity.tooLong;
        },

        html5Min: function (params) {
            return !this.validity.rangeUnderflow;
        },

        html5Max: function (params) {
            return !this.validity.rangeOverflow;
        },

        html5Step: function (params) {
            return !this.validity.stepMismatch;
        }
    };

    /**
     * Creates a public-facing validator for the specified constraint.
     * @param constraintName
     * @param constraintDefinitions
     */
    function createPublicValidator(constraintName, constraintDefinitions) {
        var constraintDefinition = constraintDefinitions[constraintName];

        var lowerCasedConstraintName = constraintName.replace(/(^[A-Z]+)/, function(group) {
            return group.toLowerCase();
        });

        if (constraintDefinition.async) {
            publicValidator[lowerCasedConstraintName] = function (element, params, callback) {
                if (typeof callback === "undefined") {
                    throw new ExceptionService.Exception.IllegalArgumentException(constraintName + " is an asynchronous constraint, but you have not provided a callback.");
                }

                return constraintDefinition.validator.call(element, params, publicValidator, callback);
            }
        } else {
            publicValidator[lowerCasedConstraintName] = function (element, params) {
                return constraintDefinition.validator.call(element, params, publicValidator);
            }
        }
    }

    /**
     * This is a meta-validator that validates constraints inside a compound constraint.
     * @param params - parameters for the constraint
     * @param currentGroup - the group that is currently being validated
     * @param compoundConstraint - the constraint that is currently being validated
     * @param callback - optional parameter that is sent in if the compound constraint is asynchronous.
     * @return {Array} - an array of constraint violations
     */
    function compoundValidator(params, currentGroup, compoundConstraint, callback) {

        function mergeParams(composingConstraintParams, compoundConstraintParams) {
            var mergedParams = {};

            for (var paramName in composingConstraintParams) if (composingConstraintParams.hasOwnProperty(paramName) && paramName != "__size__") {
                MapUtils.put(mergedParams, paramName, composingConstraintParams[paramName]);
            }

            /* we're only going to override if the compound constraint was defined with required params */
            if (compoundConstraintParams.length > 0) {
                for (var paramName in params) if (params.hasOwnProperty(paramName) && paramName != "__size__") {
                    MapUtils.put(mergedParams, paramName, params[paramName]);
                }
            }

            return mergedParams;
        }

        function processValidationResult(validationResult, id, currentGroup, mergedParams) {
            var constraintName = ReverseConstraint[composingConstraint.constraintType];

            var errorMessage = interpolateConstraintDefaultMessage(id, constraintName, mergedParams);
            var constraintViolation = {
                group: currentGroup,
                constraintName: validationResult.constraintName,
                custom: constraintDefinitions[constraintName].custom,
                compound: constraintDefinitions[constraintName].compound,
                async: constraintDefinitions[constraintName].async,
                constraintParameters: composingConstraint.params,
                failingElements: validationResult.failingElements,
                message: errorMessage
            };

            if (!compoundConstraint.reportAsSingleViolation) {
                constraintViolation.composingConstraintViolations = validationResult.composingConstraintViolations || [];
            }

            return constraintViolation;
        }

        var synchronousComposingConstraints = [];
        var asynchronousComposingConstraints = [];

        for(var i = 0; i < compoundConstraint.composingConstraints.length; i++) {
            var constraint = compoundConstraint.composingConstraints[i];
            var constraintName = ReverseConstraint[constraint.constraintType];

            if(constraintDefinitions[constraintName].async) {
                asynchronousComposingConstraints.push(constraint);
            } else {
                synchronousComposingConstraints.push(constraint);
            }

        }

        var constraintViolations = null;
        var _this = this;

        if(shouldValidate(this, params)) {

            if(synchronousComposingConstraints.length > 0) {
                constraintViolations = [];

                for (var i = 0; i < synchronousComposingConstraints.length; i++) {
                    var composingConstraint = synchronousComposingConstraints[i];
                    var composingConstraintName = ReverseConstraint[composingConstraint.constraintType];

                    /*
                     Now we'll merge the parameters in the child constraints with the parameters from the parent
                     constraint
                     */
                    var mergedParams = mergeParams(composingConstraint.params, compoundConstraint.params);
                    var validationResult = runValidatorFor(currentGroup, _this.id, composingConstraintName, mergedParams);

                    if(!validationResult.constraintPassed) {
                        var constraintViolation = processValidationResult(validationResult, _this.id, currentGroup, mergedParams);

                        if (config.enableHTML5Validation) {
                            for (var j = 0; j < validationResult.failingElements.length; j++) {
                                validationResult.failingElements[j].setCustomValidity(constraintViolation.message);
                            }
                        }

                        constraintViolations.push(constraintViolation);
                    }
                }
            }

            if(asynchronousComposingConstraints.length > 0) {
                if(constraintViolations === null) {
                    constraintViolations = [];
                }

                var numberConstraintsValidated = 0;

                for(var i = 0; i < asynchronousComposingConstraints.length; i++) {
                    var composingConstraint = asynchronousComposingConstraints[i];
                    var composingConstraintName = ReverseConstraint[composingConstraint.constraintType];
                    var mergedParams = mergeParams(composingConstraint.params, compoundConstraint.params);

                    asynchronouslyRunValidatorFor(currentGroup, _this.id, composingConstraintName, mergedParams, validationHandler);
                }

                function validationHandler(validationResult) {
                    if(!validationResult.constraintPassed) {

                        //We need to know which constraint was validated.
                        var constraintViolation = processValidationResult(validationResult, _this.id, currentGroup, mergedParams);

                        if (config.enableHTML5Validation) {
                            for (var j = 0; j < validationResult.failingElements.length; j++) {
                                validationResult.failingElements[j].setCustomValidity(constraintViolation.message);
                            }
                        }

                        constraintViolations.push(constraintViolation);
                    }

                    numberConstraintsValidated++;

                    if(numberConstraintsValidated === asynchronousComposingConstraints.length) {
                        callback(constraintViolations);
                    }
                }
            }
        } else {
            constraintViolations = [];
        }

        return constraintViolations;
    }

    function shouldValidate(element, params) {
        var validateEmptyFields = config.validateEmptyFields;

        if (typeof params["ignoreEmpty"] !== "undefined") {
            validateEmptyFields = !params["ignoreEmpty"];
        }

        return !(Validator.blank.call(element) && !validateEmptyFields);
    }

    function parseDates(params) {
        var DateFormatIndices = {
            YMD: {
                Year: 0,
                Month: 1,
                Day: 2
            },
            MDY: {
                Month: 0,
                Day: 1,
                Year: 2
            },
            DMY: {
                Day: 0,
                Month: 1,
                Year: 2
            }
        };

        var dateFormatIndices = DateFormatIndices[params["format"]];

        var separator = params["separator"];
        if (typeof params["separator"] === "undefined") {
            separator = /\//.test(this.value) ? "/" : /\./.test(this.value) ? "." : / /.test(this.value) ? " " : /[^0-9]+/;
        }

        var parts = this.value.split(separator);
        var dateToValidate = new Date(parts[dateFormatIndices.Year], parts[dateFormatIndices.Month] - 1, parts[dateFormatIndices.Day]);

        var dateToTestAgainst = new Date();
        if (typeof params["date"] !== "undefined") {
            parts = params["date"].split(separator);
            dateToTestAgainst = new Date(parts[dateFormatIndices.Year], parts[dateFormatIndices.Month] - 1, parts[dateFormatIndices.Day]);
        }

        return {
            dateToValidate: dateToValidate,
            dateToTestAgainst: dateToTestAgainst
        };
    }

    /**
     * This function wraps a supplied validator (a function) with an empty check. This makes custom validators have the same behavior
     * as inbuilt constraints, with respect to the "ignoreEmpty" and "validateEmptyFields" properties.
     * @param validatorFunction
     * @returns {Function}
     */
    function wrapValidatorWithEmptyCheck(validatorFunction) {
        return function(params, validator, callback) {
            var result = true;

            if (shouldValidate(this, params)) {
                result = validatorFunction.call(this, params, validator, callback);
            }

            return result;
        };
    }

    /**
     * This specific function is used by HTML5 constraints that essentially perform type-validation (e.g., type="url", type="email", etc.).
     * Individual entries within Validator that perform type-specific validation (like HTML5Email) will point to this function.
     * @return {Boolean}
     */
    function html5TypeValidator() {
        return !this.validity.typeMismatch;
    }

    /**
     * TODO: comment this better, especially the individual combination of validations. It's not immediately straightfoward and a description
     * of the logical flow of the code would be very helpful.
     * @param options
     * @returns {*}
     */
    function validate(options) {

        processedConstraints = {}; //clear these out on every run
        processedRadioGroups = {}; //clear these out on every run

        //generates a key that can be used with the function table to call the correct auxiliary validator function
        //(see below for more details)
        function generateKey(options) {
            var groups = options.groups || null;
            var elementId = options.elementIds || null;
            var constraintType = (typeof options.constraintType === "undefined" ? null : options.constraintType) || null;
            var key = "";
            key += (groups == null) ? "0" : "1";
            key += (elementId == null) ? "0" : "1";
            key += (constraintType == null) ? "0" : "1";
            return key;
        }

        //Instead of having a bunch of if-elses, I'm creating a function table that maps the combination of parameters
        //that this function can receive (in its options parameters) to the auxiliary (helper) functions. The key consists
        //of three "bits". The first bit represents whether the options.groups parameter is null (0 for null 1 for not null).
        //The second bit represents whether the options.elementId parameter is null, and the third bit represents whether the
        //options.constraintType parameter is null.
        var functionTable = {
            "000": validateAll,
            "001": validateConstraint,
            "010": validateElements,
            "011": validateElementsWithConstraint,
            "100": validateGroups,
            "101": validateGroupsWithConstraint,
            "110": validateGroupsWithElements,
            "111": validateGroupsElementsWithConstraint
        };

        //if no arguments were passed in, we initialize options to an empty map
        if (!options || typeof options === "undefined") {
            options = {};
        }

        /* default to independent validation for groups i.e., groups are validated independent of each other and will not
         fail early
         */
        if (typeof options.independent === "undefined") {
            options.independent = true;
        }

        //Get the actual constraint name
        if (typeof options.constraintType !== "undefined") {
            options.constraintType = ReverseConstraint[options.constraintType];
        }

        //Get the actual group name
        if (typeof options.groups !== "undefined") {

            //We're going to create a new array and assign that to options.groups. This array will contain the actual group
            //names of the groups. The reason we do this is because in validate() we store a reference to the original groups
            //array. If we didn't copy this over, we would be modifying that original array.
            var groups = options.groups;
            options.groups = [];

            for (var i = 0; i < groups.length; i++) {
                options.groups.push(GroupService.ReverseGroup[groups[i]]);
            }
        }

        if (typeof options.elements !== "undefined") {
            options.elementIds = [];
            for(var i = 0; i < options.elements.length; i++) {
                options.elementIds.push(options.elements[i].id);
            }

        } else if(typeof options.elementId !== "undefined") {
            options.elementIds = [options.elementId];
        }

        return functionTable[generateKey(options)](options);
    }

    function validateAll(options) {
        var constraintsToValidate = {
            asyncContexts: [],
            syncContexts: []
        };

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                if (!document.getElementById(elementId)) {
                    //if the element no longer exists, remove it from the bindings and continue
                    delete groupElements[elementId];
                } else {
                    var elementConstraints = groupElements[elementId];

                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {
                        var context = createConstraintValidationContext(group, elementId, elementConstraint);

                        if(context.async) {
                            constraintsToValidate.asyncContexts.push(context);
                        } else {
                            constraintsToValidate.syncContexts.push(context);
                        }
                    }
                }
            }
        }

        constraintsToValidate = removeDuplicateContexts(constraintsToValidate);
        return processConstraintsToValidate(constraintsToValidate, options);
    }

    function validateConstraint(options) {
        var constraintsToValidate = {
            asyncContexts: [],
            syncContexts: []
        };

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                var elementConstraints = groupElements[elementId];

                if (elementConstraints[options.constraintType]) {
                    var context = createConstraintValidationContext(group, elementId, options.constraintType);

                    if(context.async) {
                        constraintsToValidate.asyncContexts.push(context);
                    } else {
                        constraintsToValidate.syncContexts.push(context);
                    }
                }
            }
        }

        constraintsToValidate = removeDuplicateContexts(constraintsToValidate);
        return processConstraintsToValidate(constraintsToValidate, options);
    }

    function validateElements(options) {
        var elementGroupCount = {};

        var constraintsToValidate = {
            asyncContexts: [],
            syncContexts: []
        };

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for(var i = 0; i < options.elementIds.length; i++) {

                var elementId = options.elementIds[i];
                if(typeof elementGroupCount[elementId] === "undefined") {
                    elementGroupCount[elementId] = 0;
                }

                var elementConstraints = groupElements[elementId];
                if (typeof elementConstraints !== "undefined") {

                    elementGroupCount[elementId]++;

                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {
                        var context = createConstraintValidationContext(group, elementId, elementConstraint);

                        if(context.async) {
                            constraintsToValidate.asyncContexts.push(context);
                        } else {
                            constraintsToValidate.syncContexts.push(context);
                        }
                    }
                }
            }
        }

        var unboundElements = [];
        for(var elementId in elementGroupCount) if(elementGroupCount.hasOwnProperty(elementId)) {
            if(elementGroupCount[elementId] === 0) {
                unboundElements.push(elementId);
            }
        }

        //We want to let the user know if they use an element that does not have any constraints bound to it. Otherwise, this
        //function returns zero results, which can be (incorrectly) interpreted as a successful validation
        if (unboundElements.length > 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("No constraints have been bound to the specified elements: " + ArrayUtils.explode(unboundElements) + ". " + ExceptionService.explodeParameters(options));
        }

        constraintsToValidate = removeDuplicateContexts(constraintsToValidate);
        return processConstraintsToValidate(constraintsToValidate, options);
    }

    function validateElementsWithConstraint(options) {
        var unboundElements = [];
        var constraintsToValidate = {
            asyncContexts: [],
            syncContexts: []
        };

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for(var i = 0; i < options.elementIds.length; i++) {
                var elementId = options.elementIds[i];

                var elementConstraints = groupElements[elementId];

                if (typeof elementConstraints !== "undefined") {

                    var context = createConstraintValidationContext(group, elementId, options.constraintType);

                    if(context.async) {
                        constraintsToValidate.asyncContexts.push(context);
                    } else {
                        constraintsToValidate.syncContexts.push(context);
                    }
                } else {
                    unboundElements.push(elementId);
                }
            }
        }

        //We want to let the user know if they use an element that does not have any constraints bound to it. Otherwise, this
        //function returns zero results, which can be (incorrectly) interpreted as a successful validation
        if (unboundElements.length > 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("No constraints have been bound to the specified elements: " + ArrayUtils.explode(unboundElements) + ". " + ExceptionService.explodeParameters(options));
        }

        constraintsToValidate = removeDuplicateContexts(constraintsToValidate);
        return processConstraintsToValidate(constraintsToValidate, options);
    }

    function validateGroups(options) {
        var async = false;

        //Because we have groups, here we key the constraints we have to validate by group so that we can take into account
        //independent or dependent group-validation.
        var constraintsToValidate = {
            groupedContexts: {}
        };

        var i = 0;
        while (i < options.groups.length) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];

            if (typeof groupElements !== "undefined") {

                for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                    var elementConstraints = groupElements[elementId];

                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {
                        var context = createConstraintValidationContext(group, elementId, elementConstraint);

                        if(!constraintsToValidate.groupedContexts[group]) {
                            constraintsToValidate.groupedContexts[group] = {
                                asyncContexts: [],
                                syncContexts: []
                            };
                        }

                        if(context.async) {
                            async = true;
                            constraintsToValidate.groupedContexts[group].asyncContexts.push(context);
                        } else {
                            constraintsToValidate.groupedContexts[group].syncContexts.push(context);
                        }
                    }
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list. " + ExceptionService.explodeParameters(options));
            }

            i++;
        }

        var result = removeDuplicateGroupedContexts(constraintsToValidate);
        options.groups = result.groups;
        constraintsToValidate = result.uniqueConstraintsToValidate;

        return processGroupedConstraintsToValidate(options, constraintsToValidate, async);
    }

    function validateGroupsWithConstraint(options) {
        var async = false;

        //Because we have groups, here we key the constraints we have to validate by group so that we can take into account
        //independent or dependent group-validation.
        var constraintsToValidate = {
            groupedContexts: {}
        };

        var i = 0;
        while (i < options.groups.length) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if (typeof groupElements !== "undefined") {
                var constraintFound = false;

                for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                    var elementConstraints = groupElements[elementId];

                    if (elementConstraints[options.constraintType]) {
                        constraintFound = true;

                        var context = createConstraintValidationContext(group, elementId, options.constraintType);

                        if(!constraintsToValidate.groupedContexts[group]) {
                            constraintsToValidate.groupedContexts[group] = {
                                asyncContexts: [],
                                syncContexts: []
                            };
                        }

                        if(context.async) {
                            async = true;
                            constraintsToValidate.groupedContexts[group].asyncContexts.push(context);
                        } else {
                            constraintsToValidate.groupedContexts[group].syncContexts.push(context);
                        }
                    }
                }

                //We want to let the user know if they used a constraint that has not been defined anywhere. Otherwise, this
                //function can return zero validation results, which can be (incorrectly) interpreted as a successful validation

                if (!constraintFound) {
                    throw new ExceptionService.Exception.IllegalArgumentException("Constraint " + options.constraintType + " has not been bound to any element under group " + group + ". " + ExceptionService.explodeParameters(options));
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list. " + ExceptionService.explodeParameters(options));
            }

            i++;
        }

        var result = removeDuplicateGroupedContexts(constraintsToValidate);
        options.groups = result.groups;
        constraintsToValidate = result.uniqueConstraintsToValidate;

        return processGroupedConstraintsToValidate(options, constraintsToValidate, async);
    }

    function validateGroupsWithElements(options) {
        var notFound = [];
        var unboundElements = [];
        var async = false;

        //Because we have groups, here we key the constraints we have to validate by group so that we can take into account
        //independent or dependent group-validation.
        var constraintsToValidate = {
            groupedContexts: {}
        };

        var i = 0;
        while (i < options.groups.length) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if (groupElements) {

                for(var j = 0; j < options.elementIds.length; j++) {
                    var elementId = options.elementIds[j];

                    var elementConstraints = groupElements[elementId];

                    if (elementConstraints) {
                        for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {

                            var context = createConstraintValidationContext(group, elementId, elementConstraint);

                            if(!constraintsToValidate.groupedContexts[group]) {
                                constraintsToValidate.groupedContexts[group] = {
                                    asyncContexts: [],
                                    syncContexts: []
                                };
                            }

                            if(context.async) {
                                async = true;
                                constraintsToValidate.groupedContexts[group].asyncContexts.push(context);
                            } else {
                                constraintsToValidate.groupedContexts[group].syncContexts.push(context);
                            }
                        }
                    } else {
                        notFound.push(group);
                        unboundElements.push(elementId);
                    }
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list. " + ExceptionService.explodeParameters(options));
            }

            i++;
        }

        if (notFound.length > 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("The following elements: " + ArrayUtils.explode(unboundElements) + " were not found in one or more of the following group(s): [" + ArrayUtils.explode(notFound, ",").replace(/,/g, ", ") + "]. " + ExceptionService.explodeParameters(options));
        }

        var result = removeDuplicateGroupedContexts(constraintsToValidate);
        options.groups = result.groups;
        constraintsToValidate = result.uniqueConstraintsToValidate;

        return processGroupedConstraintsToValidate(options, constraintsToValidate, async);
    }

    function validateGroupsElementsWithConstraint(options) {
        var async = false;

        //Because we have groups, here we key the constraints we have to validate by group so that we can take into account
        //independent or dependent group-validation.
        var constraintsToValidate = {
            groupedContexts: {}
        };

        var i = 0;
        while (i < options.groups.length) {
            var group = options.groups[i];

            for(var j = 0; j < options.elementIds.length; j++) {
                var elementId = options.elementIds[j];

                var context = createConstraintValidationContext(group, elementId, options.constraintType);

                if(!constraintsToValidate.groupedContexts[group]) {
                    constraintsToValidate.groupedContexts[group] = {
                        asyncContexts: [],
                        syncContexts: []
                    };
                }

                if(context.async) {
                    async = true;
                    constraintsToValidate.groupedContexts[group].asyncContexts.push(context);
                } else {
                    constraintsToValidate.groupedContexts[group].syncContexts.push(context);
                }
            }

            i++;
        }

        var result = removeDuplicateGroupedContexts(constraintsToValidate);
        options.groups = result.groups;
        constraintsToValidate = result.uniqueConstraintsToValidate;

        return processGroupedConstraintsToValidate(options, constraintsToValidate, async);
    }

    function hasConstraintBeenValidated(context) {
        var validated = true;

        if (!processedConstraints[context.elementId]) {
            processedConstraints[context.elementId] = {};
        }

        //We clone the element because input elements in a form can sometimes have the same name as a native
        //form property, which overrides that property.
        var element = document.getElementById(context.elementId).cloneNode(false);
        var name = element.name.replace(/\s/g, "");

        if (typeof element.type !== "undefined" && element.type.toLowerCase() === "radio" && name !== "") {
            if (!processedRadioGroups[name]) {
                processedRadioGroups[name] = {};
            }
        } else {
            processedRadioGroups[name] = {}; //we don't really care about this if what we're looking at is not a radio button
        }

        if (!processedConstraints[context.elementId][context.elementConstraint] && !processedRadioGroups[name][context.elementConstraint]) {
            validated = false;

            processedConstraints[context.elementId][context.elementConstraint] = true; //mark this element constraint as validated
            if (typeof element.type !== "undefined" && element.type.toLowerCase() === "radio" && name !== "") {
                processedRadioGroups[name][context.elementConstraint] = true; //mark this radio group as validated
            }
        }

        return validated;
    }

    function removeDuplicateContexts(constraintsToValidate) {
        var uniqueConstraintsToValidate = {
            asyncContexts: [],
            syncContexts: []
        };

        for(var i = 0; i < constraintsToValidate.syncContexts.length; i++) {
            var context = constraintsToValidate.syncContexts[i];
            if(!hasConstraintBeenValidated(context)) {
                uniqueConstraintsToValidate.syncContexts.push(context);
            }
        }

        for(var i = 0; i < constraintsToValidate.asyncContexts.length; i++) {
            var context = constraintsToValidate.asyncContexts[i];
            if(!hasConstraintBeenValidated(context)) {
                uniqueConstraintsToValidate.asyncContexts.push(context);
            }
        }

        return uniqueConstraintsToValidate;
    }

    function removeDuplicateGroupedContexts(constraintsToValidate) {

        //We keep track of groups here because we need to tell the calling function which groups we encountered. This is
        //because it is possible that some groups may end up being not validated at all because those elements and
        //and constraints that are part of the group may have already shown up in a previous group. Hence, if we do not
        //redefine the "groups" property in options, in the calling function, we will end up trying to validate groups
        //that do not have any constraint contexts associated with them, and this will lead to errors (i.e., the
        //syncContexts and asyncContexts will not exist and will be "undefined").

        var groups = [];
        var uniqueConstraintsToValidate = {
            groupedContexts: {}
        };

        for(var group in constraintsToValidate.groupedContexts) if(constraintsToValidate.groupedContexts.hasOwnProperty(group)) {

            for(var i = 0; i < constraintsToValidate.groupedContexts[group].syncContexts.length; i++) {
                var context = constraintsToValidate.groupedContexts[group].syncContexts[i];
                if(!hasConstraintBeenValidated(context)) {
                    if(!uniqueConstraintsToValidate.groupedContexts[group]) {
                        uniqueConstraintsToValidate.groupedContexts[group] = {
                            asyncContexts: [],
                            syncContexts: []
                        };
                    }

                    uniqueConstraintsToValidate.groupedContexts[group].syncContexts.push(context);

                    if(groups.indexOf(group) == -1) {
                        groups.push(group);
                    }
                }
            }

            for(var i = 0; i < constraintsToValidate.groupedContexts[group].asyncContexts.length; i++) {
                var context = constraintsToValidate.groupedContexts[group].asyncContexts[i];
                if(!hasConstraintBeenValidated(context)) {
                    if(!uniqueConstraintsToValidate.groupedContexts[group]) {
                        uniqueConstraintsToValidate.groupedContexts[group] = {
                            asyncContexts: [],
                            syncContexts: []
                        };
                    }

                    uniqueConstraintsToValidate.groupedContexts[group].asyncContexts.push(context);

                    if(groups.indexOf(group) == -1) {
                        groups.push(group);
                    }
                }
            }
        }

        return {
            groups: groups,
            uniqueConstraintsToValidate: uniqueConstraintsToValidate
        };
    }

    function processConstraintsToValidate(constraintsToValidate, options) {
        var constraintViolations = [];

        if (constraintsToValidate.syncContexts.length > 0) {
            constraintViolations = validateConstraintContexts(constraintsToValidate);
        }

        if (constraintsToValidate.asyncContexts.length > 0) {
            if (!options.callback) {
                throw new ExceptionService.Exception.IllegalArgumentException("One or more constraints to be validated are asynchronous, but a callback has not been provided.")
            }

            asynchronouslyValidateConstraintContexts(constraintsToValidate, function (asynchronousConstraintViolations) {
                if (constraintViolations.length > 0) {
                    constraintViolations = constraintViolations.concat(asynchronousConstraintViolations);
                } else {
                    constraintViolations = asynchronousConstraintViolations;
                }

                options.callback(constraintViolations);
            });
        } else if (options.callback) {
            //We're going to call the callback even in the case of synchronous constraints. This is in place mainly to take
            //into account cases where the user may not know if they have an asynchronous constraint in the set of constraints
            //to be validated. If they are unsure, they cannot know which form of invocation to use (with or without callback).
            //So we will always call the callback (if one is supplied) in addition to returning the constraint violations.
            options.callback(constraintViolations);
        }

        return constraintViolations;
    }

    function processGroupedConstraintsToValidate(options, constraintsToValidate, async) {
        var constraintViolations = validateGroupedConstraintContexts(options.groups, options.independent, constraintsToValidate);

        if (async) {
            if (!options.callback) {
                throw new ExceptionService.Exception.IllegalArgumentException("One or more constraints to be validated are asynchronous, but a callback has not been provided.")
            }

            /**
             * If the validation is dependent, it means that if one of the provided groups failed validation, then the
             * other groups will not be validated. Since we have segmented our validation so that we validate synchronous
             * constraints first, we can check to see what group (if any) failed. This means that we don't really need
             * to validate any of the other groups asynchronously either; we only need to asynchronously validate the group
             * that failed. To do this, we modify the "constraintsToValidate" structure so that it only contains those
             * constraints that belong to the failed group.
             */
            if (!options.independent) {
                if (constraintViolations.length > 0) {
                    var failedGroup = constraintViolations[0].group;
                    var failedGroupContexts = constraintsToValidate.groupedContexts[failedGroup];

                    constraintsToValidate.groupedContexts = {};
                    constraintsToValidate.groupedContexts[failedGroup] = failedGroupContexts;
                }
            }

            asynchronouslyValidateGroupedConstraintContexts(options.groups, options.independent, constraintsToValidate, function (asynchronousConstraintViolations) {
                if (constraintViolations.length > 0) {
                    constraintViolations = constraintViolations.concat(asynchronousConstraintViolations);
                } else {
                    constraintViolations = asynchronousConstraintViolations;
                }

                options.callback(constraintViolations);
            });
        } else if (options.callback) {
            //We're going to call the callback even in the case of synchronous constraints. This is in place mainly to take
            //into account cases where the user may not know if they have an asynchronous constraint in the set of constraints
            //to be validated. If they are unsure, they cannot know which form of invocation to use (with or without callback).
            //So we will always call the callback (if one is supplied) in addition to returning the constraint violations.
            options.callback(constraintViolations);
        }

        return constraintViolations;
    }

    function createConstraintValidationContext(group, elementId, elementConstraint) {
        var groupElements = boundConstraints[group];
        if(!groupElements) {
            throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list (group: " + group + ", elementId: " + elementId + ", constraint: " + elementConstraint + ")");
        }

        var elementConstraints = groupElements[elementId];
        if(!elementConstraints) {
             throw new ExceptionService.Exception.IllegalArgumentException("No constraints have been defined for the element with id: " + elementId + " in group " + group);
        }

        var params = elementConstraints[elementConstraint];
        if(!params) {
             throw new ExceptionService.Exception.IllegalArgumentException("Constraint " + elementConstraint + " in group " + group + " hasn't been bound to the element with id " + elementId);
        }

        return {
            group: group,
            elementId: elementId,
            elementConstraint: elementConstraint,
            params: params,
            async: constraintDefinitions[elementConstraint].async
        };
    }

    function validateConstraintContexts(constraintsToValidate) {
        var constraintViolations = [];

        var i = 0;
        while (i < constraintsToValidate.syncContexts.length) {
            var context = constraintsToValidate.syncContexts[i];
            var constraintViolation = validateGroupElementConstraintCombination(context.group, context.elementId, context.elementConstraint, context.params);

            if (constraintViolation) {
                constraintViolations.push(constraintViolation);
            }

            i++;
        }

        return constraintViolations;
    }

    //Need to account for async constraints in compound constraints as well. here's an idea: have the cycleExists function also return a flag that says
    //whether any of the compounds are async. If so, the entire compound constraint is async. one way to validate async constraints mixed with sync constraints
    //is to use the same strategy as validateContext below. However, check to see if the composing constraint is async or not. if it is sync, validate as usual
    //and increment the counter. if not, use the callback.

    function asynchronouslyValidateConstraintContexts(constraintsToValidate, callback) {
        var constraintViolations = [];
        var numContextsProcessed = 0;

        for(var i = 0; i < constraintsToValidate.asyncContexts.length; i++) {
            var context = constraintsToValidate.asyncContexts[i];
            asynchronouslyValidateGroupElementConstraintCombination(context.group, context.elementId, context.elementConstraint, context.params, validationHandler);
        }

        function validationHandler(constraintViolation) {
            numContextsProcessed++;

            if(constraintViolation) {
                constraintViolations.push(constraintViolation);
            }

            if(numContextsProcessed === constraintsToValidate.asyncContexts.length) {
                callback(constraintViolations);
            }
        }
    }

    function validateGroupedConstraintContexts(groups, independent, constraintsToValidate) {
        var constraintViolations = [];
        var i = 0;
        var successful = true;

        while (i < groups.length && successful) {

            var group = groups[i];
            var contexts = constraintsToValidate.groupedContexts[group].syncContexts;

            for (var j = 0; j < contexts.length; j++) {
                var context = contexts[j];
                var constraintViolation = validateGroupElementConstraintCombination(context.group, context.elementId, context.elementConstraint, context.params);

                if (constraintViolation) {
                    constraintViolations.push(constraintViolation);
                }
            }

            i++;
            successful = (constraintViolations.length == 0) || (independent && constraintViolations.length != 0);
        }

        return constraintViolations;
    }

    function asynchronouslyValidateGroupedConstraintContexts(groups, independent, constraintsToValidate, callback) {
        var constraintViolations = [];
        var successful = true;

        (function validateGroupedContexts(i) {
            if(i < groups.length && successful) {
                var group = groups[i];
                var contexts = constraintsToValidate.groupedContexts[group].asyncContexts;
                var numContextsProcessed = 0;

                for(var j = 0; j < contexts.length; j++) {
                    var context = contexts[j];
                    asynchronouslyValidateGroupElementConstraintCombination(context.group, context.elementId, context.elementConstraint, context.params, validationHandler);
                }

                function validationHandler(constraintViolation) {
                    numContextsProcessed++;

                    if(constraintViolation) {
                        constraintViolations.push(constraintViolation);
                    }

                    if(numContextsProcessed === contexts.length) {
                        successful = (constraintViolations.length === 0) || (independent && constraintViolations.length != 0);
                        validateGroupedContexts(++i);
                    }
                }
            } else {
                callback(constraintViolations);
            }
        })(0);
    }

    function validateGroupElementConstraintCombination(group, elementId, elementConstraint, params) {
        var constraintViolation;

        var validationResult = runValidatorFor(group, elementId, elementConstraint, params);

        var errorMessage = "";
        if (!validationResult.constraintPassed) {
            errorMessage = interpolateConstraintDefaultMessage(elementId, elementConstraint, params);

            constraintViolation = {
                group: group,
                constraintName: elementConstraint,
                formSpecific: constraintDefinitions[elementConstraint].formSpecific,
                custom: constraintDefinitions[elementConstraint].custom,
                compound: constraintDefinitions[elementConstraint].compound,
                async: constraintDefinitions[elementConstraint].async,
                composingConstraintViolations: validationResult.composingConstraintViolations || [],
                constraintParameters: params,
                failingElements: validationResult.failingElements,
                message: errorMessage
            };
        }

        if (config.enableHTML5Validation) {
            for (var i = 0; i < validationResult.failingElements.length; i++) {
                validationResult.failingElements[i].setCustomValidity("");
            }
        }

        return constraintViolation;
    }

    function asynchronouslyValidateGroupElementConstraintCombination(group, elementId, elementConstraint, params, callback) {
        var constraintViolation;

        asynchronouslyRunValidatorFor(group, elementId, elementConstraint, params, function(validationResult) {
            var errorMessage = "";
            if (!validationResult.constraintPassed) {
                errorMessage = interpolateConstraintDefaultMessage(elementId, elementConstraint, params);

                constraintViolation = {
                    group: group,
                    constraintName: elementConstraint,
                    formSpecific: constraintDefinitions[elementConstraint].formSpecific,
                    custom: constraintDefinitions[elementConstraint].custom,
                    compound: constraintDefinitions[elementConstraint].compound,
                    async: constraintDefinitions[elementConstraint].async,
                    composingConstraintViolations: validationResult.composingConstraintViolations || [],
                    constraintParameters: params,
                    failingElements: validationResult.failingElements,
                    message: errorMessage
                };
            }

            if (config.enableHTML5Validation) {
                for (var i = 0; i < validationResult.failingElements.length; i++) {
                    validationResult.failingElements[i].setCustomValidity("");
                }
            }

            callback(constraintViolation);
        });
    }

    function runValidatorFor(currentGroup, elementId, elementConstraint, params) {
        var constraintPassed = false;
        var failingElements = [];

        //Element is cloned here because forms can have input elements that have the same name as a native
        //form property, which overrides that property
        var element = document.getElementById(elementId);
        var composingConstraintViolations = [];

        if (constraintDefinitions[elementConstraint].formSpecific) {
            failingElements = constraintDefinitions[elementConstraint].validator.call(element, params, publicValidator);
            constraintPassed = failingElements.length == 0;
        } else if (constraintDefinitions[elementConstraint].compound) {
            composingConstraintViolations = constraintDefinitions[elementConstraint].validator.call(element, params, currentGroup, constraintDefinitions[elementConstraint], null);
            constraintPassed = composingConstraintViolations.length == 0;

            if (!constraintPassed) {
                failingElements.push(element);
            }
        } else {
            constraintPassed = constraintDefinitions[elementConstraint].validator.call(element, params, publicValidator);

            if (!constraintPassed) {
                failingElements.push(element)
            }
        }

        var name = element.cloneNode(false).name.replace(/\s/g, "");
        var type = element.cloneNode(false).type;
        if (typeof type !== "undefined" && type.toLowerCase() === "radio" && name !== "") {
            failingElements = DOMUtils.getElementsByAttribute(document.body, "input", "name", name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")); //let's set failing elements to all elements of the radio group
        }

        var validationResult = {
            constraintName: elementConstraint,
            constraintPassed: constraintPassed,
            failingElements: failingElements
        };

        if (!constraintDefinitions[elementConstraint].reportAsSingleViolation) {
            validationResult.composingConstraintViolations = composingConstraintViolations;
        }

        return validationResult;
    }

    function asynchronouslyRunValidatorFor(currentGroup, elementId, elementConstraint, params, callback) {
        //Element is cloned here because forms can have input elements that have the same name as a native
        //form property, which overrides that property
        var element = document.getElementById(elementId);

        if (constraintDefinitions[elementConstraint].formSpecific) {
            constraintDefinitions[elementConstraint].validator.call(element, params, publicValidator, function(failingElements) {
                processValidationResult(failingElements.length === 0, null, failingElements, callback);
            });

        } else if (constraintDefinitions[elementConstraint].compound) {
            constraintDefinitions[elementConstraint].validator.call(element, params, currentGroup, constraintDefinitions[elementConstraint], function(composingConstraintViolations) {
                var failingElements = [];
                var constraintPassed = composingConstraintViolations.length === 0;
                if(!constraintPassed) {
                    failingElements.push(element);
                }

                processValidationResult(constraintPassed, composingConstraintViolations, failingElements, callback);
            });

        } else {
            constraintDefinitions[elementConstraint].validator.call(element, params, publicValidator, function(constraintPassed) {
                var failingElements = [];
                if(!constraintPassed) {
                    failingElements.push(element);
                }

                processValidationResult(constraintPassed, null, failingElements, callback);
            });
        }

        function processValidationResult(constraintPassed, composingConstraintViolations, failingElements, callback) {
            var name = element.cloneNode(false).name.replace(/\s/g, "");
            var type = element.cloneNode(false).type;
            if (typeof type !== "undefined" && type.toLowerCase() === "radio" && name !== "") {
                failingElements = DOMUtils.getElementsByAttribute(document.body, "input", "name", name); //let's set failing elements to all elements of the radio group
            }

            var validationResult = {
                constraintName: elementConstraint,
                constraintPassed: constraintPassed,
                failingElements: failingElements
            };

            if (!constraintDefinitions[elementConstraint].reportAsSingleViolation) {
                validationResult.composingConstraintViolations = composingConstraintViolations;
            }

            callback(validationResult);
        }
    }

    function interpolateConstraintDefaultMessage(elementId, elementConstraint, params) {
        var element = document.getElementById(elementId);
        var errorMessage = "";

        if (params["message"]) {
            errorMessage = params["message"];
        } else if (params["msg"]) {
            errorMessage = params["msg"];
        } else {
            errorMessage = constraintDefinitions[elementConstraint].defaultMessage;
        }

        for (var param in params) if (params.hasOwnProperty(param)) {
            var re = new RegExp("{" + param + "}", "g");
            errorMessage = errorMessage.replace(re, params[param]);
        }

        //If this is a compound constraint, we need to look at the parameters on each composing constraint so that we can interpolate their values
        if (constraintDefinitions[elementConstraint].compound && typeof constraintDefinitions[elementConstraint].composingConstraints !== "undefined") {
            for (var i = 0; i < constraintDefinitions[elementConstraint].composingConstraints.length; i++) {
                var composingConstraint = constraintDefinitions[elementConstraint].composingConstraints[i];

                for (var param in composingConstraint.params) if (composingConstraint.params.hasOwnProperty(param)) {

                    var re = new RegExp("{" + param + "}", "g");
                    errorMessage = errorMessage.replace(re, composingConstraint.params[param]);
                }
            }
        }

        if (/{label}/.test(errorMessage)) {
            var friendlyInputName = DOMUtils.friendlyInputNames[element.cloneNode(false).tagName.toLowerCase()];

            if (!friendlyInputName) {
                friendlyInputName = DOMUtils.friendlyInputNames[element.cloneNode(false).type.toLowerCase()];
            }

            errorMessage = errorMessage.replace(/{label}/, friendlyInputName);

            //Some optional parameters appear in the error messages of default constraints. These need to be replaced
            errorMessage = errorMessage.replace(/{flags}/g, "");
        }

        //not sure if this is just a hack or not. But I'm trying to replace doubly-escaped quotes. This
        //usually happens if the data-constraints attribute is surrounded by double quotes instead of
        //single quotes
        errorMessage = errorMessage.replace(/\\\"/g, "\"");

        return errorMessage;
    }

    return {
        Validator: Validator,
        init: init,
        wrapValidatorWithEmptyCheck: wrapValidatorWithEmptyCheck,
        initializePublicValidators: initializePublicValidators,
        compoundValidator: compoundValidator,
        validate: validate,
        runValidatorFor: runValidatorFor,
        interpolateConstraintDefaultMessage: interpolateConstraintDefaultMessage,
        createPublicValidator: createPublicValidator
    };
}));
