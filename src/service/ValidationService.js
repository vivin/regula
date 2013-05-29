/**
 * Encapsulates the logic that performs constraint validation.
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

    var validatedConstraints = {}; //Keeps track of constraints that have already been validated for a validation run. Cleared out each time validation is run.
    var validatedRadioGroups = {}; //Keeps track of constraints that have already been validated for a validation run, on radio groups. Cleared out each time validation is run.

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
     *         digits: Function, past: Function, future: Function, html5Required: Function, html5Email: Function, html5URL: Function, html5Number: Function, html5DateTime: Function,
     *         html5DateTimeLocal: Function, html5Date: Function, html5Month: Function, html5Time: Function, html5Week: Function, html5Range: Function, html5Tel: Function,
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
                result = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(this.value);
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
     * This is a meta-validator that validates constraints inside a compound constraint.
     * @param params - parameters for the constraint
     * @param currentGroup - the group that is currently being validated
     * @param compoundConstraint - the constraint that is currently being validated
     * @return {Array} - an array of constraint violations
     */
    function compoundValidator(params, currentGroup, compoundConstraint) {
        //        console.log(params, currentGroup, compoundConstraint);
        var composingConstraints = compoundConstraint.composingConstraints;
        var constraintViolations = [];
        //        console.log("composing constraints", composingConstraints);
        for (var i = 0; i < composingConstraints.length; i++) {
            var composingConstraint = composingConstraints[i];
            var composingConstraintName = ReverseConstraint[composingConstraint.constraintType];

            /*
             Now we'll merge the parameters in the child constraints with the parameters from the parent
             constraint
             */

            var mergedParams = {};

            for (var paramName in composingConstraint.params) if (composingConstraint.params.hasOwnProperty(paramName) && paramName != "__size__") {
                MapUtils.put(mergedParams, paramName, composingConstraint.params[paramName]);
            }

            /* we're only going to override if the compound constraint was defined with required params */
            if (compoundConstraint.params.length > 0) {
                for (var paramName in params) if (params.hasOwnProperty(paramName) && paramName != "__size__") {
                    MapUtils.put(mergedParams, paramName, params[paramName]);
                }
            }

            var validationResult = runValidatorFor(currentGroup, this.id, composingConstraintName, mergedParams);

            var errorMessage = "";
            if (!validationResult.constraintPassed) {
                errorMessage = interpolateConstraintDefaultMessage(this.id, composingConstraintName, mergedParams);
                var constraintViolation = {
                    group: currentGroup,
                    constraintName: composingConstraintName,
                    custom: constraintDefinitions[composingConstraintName].custom,
                    compound: constraintDefinitions[composingConstraintName].compound,
                    constraintParameters: composingConstraint.params,
                    failingElements: validationResult.failingElements,
                    message: errorMessage
                };

                if (!compoundConstraint.reportAsSingleViolation) {
                    constraintViolation.composingConstraintViolations = validationResult.composingConstraintViolations || [];
                }

                constraintViolations.push(constraintViolation);
            }
            //            console.log("finish validation");
            if (config.enableHTML5Validation) {
                for (var j = 0; j < validationResult.failingElements.length; j++) {
                    validationResult.failingElements[j].setCustomValidity(errorMessage);
                }
            }
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
     * This specific function is used by HTML5 constraints that essentially perform type-validation (e.g., type="url", type="email", etc.).
     * Individual entries within Validator that perform type-specific validation (like HTML5Email) will point to this function.
     * @return {Boolean}
     */
    function html5TypeValidator() {
        return !this.validity.typeMismatch;
    }

    function validate(options) {

        validatedConstraints = {}; //clear these out on every run
        validatedRadioGroups = {}; //clear these out on every run

        //generates a key that can be used with the function table to call the correct auxiliary validator function
        //(see below for more details)
        function generateKey(options) {
            var groups = options.groups || null;
            var elementId = options.elementId || null;
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
            "010": validateElement,
            "011": validateElementWithConstraint,
            "100": validateGroups,
            "101": validateGroupsWithConstraint,
            "110": validateGroupsWithElement,
            "111": validateGroupsElementWithConstraint
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
        if (options.groups) {

            //We're going to create a new array and assign that to options.groups. This array will contain the actual group
            //names of the groups. The reason we do this is because in validate() we store a reference to the original groups
            //array. If we didn't copy this over, we would be modifying that original array.
            var groups = options.groups;
            options.groups = [];

            for (var i = 0; i < groups.length; i++) {
                options.groups.push(GroupService.ReverseGroup[groups[i]]);
            }
        }

        return functionTable[generateKey(options)](options);
    }

    function validateAll() {
        var constraintViolations = [];

        //console.log("BoundConstraints", boundConstraints);

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                if (!document.getElementById(elementId)) {
                    //if the element no longer exists, remove it from the bindings and continue
                    delete groupElements[elementId];
                } else {
                    var elementConstraints = groupElements[elementId];

                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {

                        var constraintViolation = validateGroupElementConstraintCombination(group, elementId, elementConstraint);

                        if (constraintViolation) {
                            constraintViolations.push(constraintViolation);
                        }
                    }
                }
            }
        }

        return constraintViolations;
    }

    function validateConstraint(options) {
        var constraintViolations = [];
        var constraintFound = false;

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                var elementConstraints = groupElements[elementId];

                if (elementConstraints[options.constraintType]) {
                    constraintFound = true;
                    var constraintViolation = validateGroupElementConstraintCombination(group, elementId, options.constraintType);

                    if (constraintViolation) {
                        constraintViolations.push(constraintViolation);
                    }
                }
            }
        }

        //We want to let the user know if they used a constraint that has not been defined anywhere. Otherwise, this
        //function returns zero validation results, which can be (incorrectly) interpreted as a successful validation
        if (!constraintFound) {
            throw new ExceptionService.Exception.IllegalArgumentException("Constraint " + options.constraintType + " has not been bound to any element. " + ExceptionService.explodeParameters(options));
        }

        return constraintViolations;
    }

    function validateElement(options) {
        var constraintViolations = [];
        var elementFound = false;

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            if (groupElements[options.elementId]) {
                elementFound = true;
                var elementConstraints = groupElements[options.elementId];

                for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {

                    var constraintViolation = validateGroupElementConstraintCombination(group, options.elementId, elementConstraint);

                    if (constraintViolation) {
                        constraintViolations.push(constraintViolation);
                    }
                }
            }
        }

        //We want to let the user know if they use an element that does not have any element bound to it. Otherwise, this
        //function returns zero results, which can be (incorrectly) interpreted as a successful validation

        if (!elementFound) {
            throw new ExceptionService.Exception.IllegalArgumentException("No constraints have been bound to element with id " + options.elementId + ". " + ExceptionService.explodeParameters(options));
        }

        return constraintViolations;
    }

    function validateElementWithConstraint(options) {
        var constraintViolations = [];
        var elementFound = false;
        var constraintFound = false;

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];
            var elementConstraints = groupElements[options.elementId];

            if (elementConstraints) {
                elementFound = true;

                if (elementConstraints[options.constraintType]) {
                    constraintFound = true;

                    var constraintViolation = validateGroupElementConstraintCombination(group, options.elementId, options.constraintType);

                    if (constraintViolation) {
                        constraintViolations.push(constraintViolation);
                    }
                }
            }
        }

        if (!elementFound || !constraintFound) {
            throw new ExceptionService.Exception.IllegalArgumentException("No element with id " + options.elementId + " was found with the constraint " + options.constraintType + " bound to it. " + ExceptionService.explodeParameters(options));
        }

        return constraintViolations;
    }

    function validateGroups(options) {
        var constraintViolations = [];

        var i = 0;
        var successful = true;
        while (i < options.groups.length && successful) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if (groupElements) {

                for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                    var elementConstraints = groupElements[elementId];

                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {

                        var constraintViolation = validateGroupElementConstraintCombination(group, elementId, elementConstraint);

                        if (constraintViolation) {
                            constraintViolations.push(constraintViolation);
                        }
                    }
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list. " + ExceptionService.explodeParameters(options));
            }

            i++;
            successful = (constraintViolations.length == 0) || (options.independent && constraintViolations.length != 0);
        }

        return constraintViolations;
    }

    function validateGroupsWithConstraint(options) {
        var constraintViolations = [];

        var i = 0;
        var successful = true;
        while (i < options.groups.length && successful) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if (groupElements) {
                var constraintFound = false;

                for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                    var elementConstraints = groupElements[elementId];

                    if (elementConstraints[options.constraintType]) {
                        constraintFound = true;
                        var constraintViolation = validateGroupElementConstraintCombination(group, elementId, options.constraintType);

                        if (constraintViolation) {
                            constraintViolations.push(constraintViolation);
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
            successful = (constraintViolations.length == 0) || (options.independent && constraintViolations.length != 0);
        }

        return constraintViolations;
    }

    function validateGroupsWithElement(options) {
        var constraintViolations = [];
        var notFound = [];

        var i = 0;
        var successful = true;
        while (i < options.groups.length && successful) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if (groupElements) {

                var elementConstraints = groupElements[options.elementId];

                if (elementConstraints) {
                    for (var elementConstraint in elementConstraints) if (elementConstraints.hasOwnProperty(elementConstraint)) {

                        var constraintViolation = validateGroupElementConstraintCombination(group, options.elementId, elementConstraint);

                        if (constraintViolation) {
                            constraintViolations.push(constraintViolation);
                        }
                    }
                } else {
                    notFound.push(group);
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list. " + ExceptionService.explodeParameters(options));
            }

            i++;
            successful = (constraintViolations.length == 0) || (options.independent && constraintViolations.length != 0);
        }

        if (notFound.length > 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("No element with id " + options.elementId + " was found in the following group(s): )[" + ArrayUtils.explode(notFound, ",").replace(/,/g, ", ") + "]. " + ExceptionService.explodeParameters(options));
        }

        return constraintViolations;
    }

    function validateGroupsElementWithConstraint(options) {
        var constraintViolations = [];

        var i = 0;
        var successful = true;
        while (i < options.groups.length && successful) {
            var group = options.groups[i];
            var constraintViolation = validateGroupElementConstraintCombination(group, options.elementId, options.constraintType);

            if (constraintViolation) {
                constraintViolations.push(constraintViolation);
            }

            i++;
            successful = (constraintViolations.length == 0) || (options.independent && constraintViolations.length != 0);
        }

        return constraintViolations;
    }

    function validateGroupElementConstraintCombination(group, elementId, elementConstraint) {
        //console.log(group, elementId, elementConstraint);
        var constraintViolation;
        var groupElements = boundConstraints[group];

        if (!groupElements) {
            throw new ExceptionService.Exception.IllegalArgumentException("Undefined group in group list (group: " + group + ", elementId: " + elementId + ", constraint: " + elementConstraint + ")");
        }

        var elementConstraints = groupElements[elementId];

        if (!validatedConstraints[elementId]) {
            validatedConstraints[elementId] = {};
        }

        var element = document.getElementById(elementId);
        var name = element.name.replace(/\s/g, "");

        if (typeof element.type !== "undefined" && element.type.toLowerCase() === "radio" && name !== "") {
            if (!validatedRadioGroups[name]) {
                validatedRadioGroups[name] = {};
            }
        } else {
            name = "__dontcare__";
            validatedRadioGroups[name] = {}; //we really don't care about this if what we're looking at is not a radio button
        }

        //Validate this constraint only if we haven't already validated it during this validation run
        if (!validatedConstraints[elementId][elementConstraint] && !validatedRadioGroups[name][elementConstraint]) {
            if (!elementConstraints) {
                throw new ExceptionService.Exception.IllegalArgumentException("No constraints have been defined for the element with id: " + elementId + " in group " + group);
            } else {
                var params = elementConstraints[elementConstraint];

                if (!params) {
                    throw new ExceptionService.Exception.IllegalArgumentException(elementConstraint + " in group " + group + " hasn't been bound to the element with id " + elementId);
                } else {
                    //console.log("Going to run validator for:", group, elementId, elementConstraint, params);
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
                }
            }
        }

        return constraintViolation;
    }

    function runValidatorFor(currentGroup, elementId, elementConstraint, params) {
        var constraintPassed = false;
        var failingElements = [];
        var element = document.getElementById(elementId);
        var composingConstraintViolations = [];

        if (constraintDefinitions[elementConstraint].formSpecific) {
            failingElements = constraintDefinitions[elementConstraint].validator.call(element, params);
            constraintPassed = failingElements.length == 0;
        } else if (constraintDefinitions[elementConstraint].compound) {
            //            console.log("is compound");
            composingConstraintViolations = constraintDefinitions[elementConstraint].validator.call(element, params, currentGroup, constraintDefinitions[elementConstraint]);
            constraintPassed = composingConstraintViolations.length == 0;

            if (!constraintPassed) {
                failingElements.push(element);
            }
        } else {
            constraintPassed = constraintDefinitions[elementConstraint].validator.call(element, params);

            if (!constraintPassed) {
                failingElements.push(element)
            }
        }

        validatedConstraints[elementId][elementConstraint] = true; //mark this element constraint as validated

        var name = element.name.replace(/\s/g, "");
        if (typeof element.type !== "undefined" && element.type.toLowerCase() === "radio" && name !== "") {
            validatedRadioGroups[name][elementConstraint] = true; //mark this radio group as validated
            failingElements = DOMUtils.getElementsByAttribute(document.body, "input", "name", name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")); //let's set failing elements to all elements of the radio group
        }

        var validationResult = {
            constraintPassed: constraintPassed,
            failingElements: failingElements
        };

        if (!constraintDefinitions[elementConstraint].reportAsSingleViolation) {
            validationResult.composingConstraintViolations = composingConstraintViolations;
        }

        return validationResult;
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
            var friendlyInputName = DOMUtils.friendlyInputNames[element.tagName.toLowerCase()];

            if (!friendlyInputName) {
                friendlyInputName = DOMUtils.friendlyInputNames[element.type.toLowerCase()];
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
        compoundValidator: compoundValidator,
        validate: validate,
        runValidatorFor: runValidatorFor,
        interpolateConstraintDefaultMessage: interpolateConstraintDefaultMessage
    };
}));
