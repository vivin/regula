/**
 * @preserve
 * Regula: An annotation-based form-validation framework in Javascript
 * Version 1.2.4-SNAPSHOT
 *
 * Written By Vivin Paliath (http://vivin.net)
 * License: BSD License
 * Copyright (C) 2010-2013
 *
 * Other licenses:
 *
 * DOMUtils#getElementsByAttribute
 * Author: Robert Nyman
 * Copyright Robert Nyman, http://www.robertnyman.com
 * Free to use if this text is included
 */

// TODO: Add step validation to regula (like html5 step validation)
// TODO: Add URL validation to regula (like html5 url validation)

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "utils/MapUtils",
            "utils/DOMUtils",
            "service/BindingService",
            "service/ExceptionService",
            "service/ConstraintService",
            "service/ValidationService",
            "service/GroupService"
        ], factory);
    } else {
        // Browser globals

        root.regula = factory(
            root.regulaModules.MapUtils,
            root.regulaModules.DOMUtils,
            root.regulaModules.BindingService,
            root.regulaModules.ExceptionService,
            root.regulaModules.ConstraintService,
            root.regulaModules.ValidationService,
            root.regulaModules.GroupService
        );

        //I don't want to pollute the global namespace with two regula-specific objects so I'm moving the modules
        //under a _modules object inside the main regula object.
        root.regula._modules = root.regulaModules;
        root.regulaModules = undefined;
    }
}(this, function (MapUtils, DOMUtils, BindingService, ExceptionService, ConstraintService, ValidationService, GroupService) {

    /**
     * Configuration options that govern regula's behavior
     * @type {{validateEmptyFields: boolean, enableHTML5Validation: boolean, debug: boolean}}
     */
    var config = {
        validateEmptyFields: true,
        enableHTML5Validation: true,
        debug: false
    };

    /**
     * A simple "enum" for date formats
     * @type {{DMY: string, MDY: string, YMD: string}}
     */
    var DateFormat = {
        DMY: "DMY",
        MDY: "MDY",
        YMD: "YMD"
    };

    //Make sure we initialize bound constraints
    BindingService.initializeBoundConstraints();

    /**
     * Function that helps configure regula's behavior
     * @param options
     */
    function configure(options) {
        MapUtils.iterateOverMap(options, function (key, value, index) {
            if (typeof config[key] !== "undefined") {
                config[key] = value;
            }
        });
    }

    /**
     * Function that performs binding. Delegates to BindingService
     * @param options
     */
    function bind(options) {
        //console.log("in bind");

        var result = {
            successful: true,
            message: "",
            data: null
        };

        if (typeof options === "undefined" || !options) {
            BindingService.resetBoundConstraints();

            //We will bind HTML5 constraints first. The main reason we do this, is because the regula-equivalents of
            //HTML5 constraints (like @HTML5Max) supersede the native HTML5 definitions. We do this because, the
            //regula equivalents provide greater flexibility through custom error messages, labels, and groups.
            if (config.enableHTML5Validation && DOMUtils.supportsHTML5Validation()) {
                result = BindingService.bindHTML5ValidationConstraints({element: null});
            }

            //If HTML5 binding was successful, let's look at constraints specified by the data-constraints attribute
            if(result.successful) {
                result = BindingService.bindAfterParsing({element: null});
            }

        } else {
            var elements = options.elements;

            //If "elements" has not been provided, let's assume that "element" has been provided, and call "bindFromOptions"
            if (typeof elements === "undefined" || !elements) {
                result = BindingService.bindFromOptions(options);
            } else {
                //console.log("OHO we have elements!!!!!");
                //If "elements" has been provided, let's iterate over it and call bindFromOptions with each of those elements
                var i = 0;
                while (result.successful && i < elements.length) {

                    options.element = elements[i];
                    result = BindingService.bindFromOptions(options);

                    if (!result.successful) {
                        result.message = "regula.bind: Element " + (i + 1) + " of " + elements.length + " failed: " + result.message;
                    }

                    i++;
                }
            }
        }

        if (!result.successful) {
            throw new ExceptionService.Exception.BindException(result.message);
        }
    }

    /**
     * Function that performs unbinding. Delegates to BindingService.
     * @param options
     */
    function unbind(options) {
        if (typeof options === "undefined" || !options) {
            BindingService.resetBoundConstraints();
        } else {
            if (typeof options.elementId === "undefined" && typeof options.elements === "undefined") {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.unbind requires an elementId attribute, or an elements attribute if options are provided");
            }

            if (typeof options.elements !== "undefined" && !(options.elements instanceof Array)) {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.unbind expects the elements attribute to be an array, if it is provided");
            }

            if (typeof options.elements === "undefined") {
                options.elements = [document.getElementById(options.elementId)];

                //This can happen when they pass in an id that doesn't belong to any element
                if (options.elements[0] === null) {
                    throw new ExceptionService.Exception.IllegalArgumentException("Element with id " + options.elementId + " does not have any constraints bound to it. " + ExceptionService.explodeParameters(options));
                }
            }

            BindingService.unbind(options);
        }
    }

    /**
     * Function that lets you know if a specific element has been bound. You can check to see if the element has been bound
     * to a specific group and/or constraint as well.
     * @param options
     */
    function isBound(options) {
        if(typeof options === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.isBound expects options");
        }

        var element = options.element;
        var elementId = options.elementId;

        if(typeof element === "undefined" && typeof elementId === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.isBound expects at the very least, either an element or elementId attribute");
        }

        if(options.hasOwnProperty("constraint") && typeof options.constraint === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("Undefined constraint was supplied as a parameter")
        }

        if(options.hasOwnProperty("group") && typeof options.group === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("Undefined group was supplied as a parameter");
        }

        if(typeof element !== "undefined") {
            elementId = element.id;
        }

        return BindingService.isBound({
            elementId: elementId,
            group: options.group,
            constraint: options.constraint
        });
    }

    /**
     * Function that lets you override a previously-defined constraint. Delegates to ConstraintService.
     * @param options
     */
    function override(options) {
        if (!options) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects options");
        }

        if (typeof options.constraintType == "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects a valid constraintType attribute in the options argument");
        }

        var name = ConstraintService.ReverseConstraint[options.constraintType];
        if (typeof name === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.override: I could not find the specified constraint. Perhaps it has not been defined? Function received: " + ExceptionService.explodeParameters(options));
        } else {
            /* for custom constraints, you can override anything. for built-in constraints however, you can only override the default message */
            var formSpecific = ConstraintService.constraintDefinitions[name].formSpecific;
            if (ConstraintService.constraintDefinitions[name].custom) {
                formSpecific = (typeof options.formSpecific === "undefined") ? ConstraintService.constraintDefinitions[name].formSpecific : options.formSpecific;
            }

            var validator = ConstraintService.constraintDefinitions[name].custom && !ConstraintService.constraintDefinitions[name].compound ? options.validator || ConstraintService.constraintDefinitions[name].validator : ConstraintService.constraintDefinitions[name].validator;
            var params = ConstraintService.constraintDefinitions[name].custom ? options.params || ConstraintService.constraintDefinitions[name].params : ConstraintService.constraintDefinitions[name].params;
            var defaultMessage = options.defaultMessage || ConstraintService.constraintDefinitions[name].defaultMessage;
            var compound = ConstraintService.constraintDefinitions[name].compound;
            var composingConstraints = options.constraints || ConstraintService.constraintDefinitions[name].constraints;

            if (typeof formSpecific != "boolean") {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects the formSpecific attribute in the options argument to be a boolean");
            }

            if (typeof validator != "function") {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects the validator attribute in the options argument to be a function");
            }

            if (!(params instanceof Array)) {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects the params attribute in the options argument to be an array");
            }

            if (typeof defaultMessage != "string") {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.override expects the defaultMessage attribute in the options argument to be a string");
            }

            ConstraintService.override({
                formSpecific: formSpecific,
                name: name,
                constraintType: options.constraintType,
                compound: compound,
                params: params,
                composingConstraints: composingConstraints,
                defaultMessage: defaultMessage,
                validator: validator
            });
        }
    }

    /**
     * Function that helps you define a custom constraint. Delegates to ConstraintService.
     * @param options
     */
    function custom(options) {
        if (!options) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects options");
        }

        var name = options.name;
        var formSpecific = options.formSpecific || false;
        var validator = options.validator;
        var params = options.params || [];
        var defaultMessage = options.defaultMessage || "";

        /* handle attributes. throw exceptions if they are not sane */

        /* name attribute*/
        if (!name) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects a name attribute in the options argument");
        } else if (typeof name != "string") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects the name attribute in the options argument to be a string");
        } else if (name.replace(/\s/g, "").length == 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom cannot accept an empty string for the name attribute in the options argument");
        }

        /* formSpecific attribute */
        if (typeof formSpecific != "boolean") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects the formSpecific attribute in the options argument to be a boolean");
        }

        /* validator attribute */
        if (!validator) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects a validator attribute in the options argument");
        } else if (typeof validator != "function") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects the validator attribute in the options argument to be a function");
        }

        /* params attribute */
        if (params.constructor.toString().indexOf("Array") < 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects the params attribute in the options argument to be an array");
        }

        /* defaultMessage attribute */
        if (typeof defaultMessage != "string") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.custom expects the defaultMessage attribute in the options argument to be a string");
        }

        if (ConstraintService.constraintDefinitions[name]) {
            throw new ExceptionService.Exception.IllegalArgumentException("There is already a constraint called " + name + ". If you wish to override this constraint, use regula.override");
        } else {
            ConstraintService.custom({
                name: name,
                formSpecific: formSpecific,
                validator: validator,
                custom: true,
                compound: false,
                params: params,
                defaultMessage: defaultMessage
            });
        }
    }

    /**
     * Function that helps you define a compound constraint. Delegates to ConstraintService.
     * @param options
     */
    function compound(options) {
        if (!options) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound expects options");
        }

        var name = options.name;
        var constraints = options.constraints || [];
        var formSpecific = options.formSpecific || false;
        var defaultMessage = options.defaultMessage || "";
        var params = options.params || [];
        var reportAsSingleViolation = typeof options.reportAsSingleViolation === "undefined" ? false : options.reportAsSingleViolation;

        if (!name) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound expects a name attribute in the options argument");
        }

        if (typeof name != "string") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound expects name to be a string parameter");
        }

        /* params attribute */
        if (params.constructor.toString().indexOf("Array") < 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound expects the params attribute in the options argument to be an array");
        }

        if (constraints.length == 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound expects an array of composing constraints under a constraints attribute in the options argument");
        }

        if (ConstraintService.constraintDefinitions[name]) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.compound: There is already a constraint called " + name + ". If you wish to override this constraint, use regula.override");
        }

        ConstraintService.compound({
            name: name,
            formSpecific: formSpecific,
            params: params,
            reportAsSingleViolation: reportAsSingleViolation,
            constraints: constraints,
            defaultMessage: defaultMessage
        });
    }

    /**
     * Function that performs constraint validation on bound elements.
     * @param options
     * @returns {Array} of constraint violations.
     */
    function validate(options) {

        //Initialize the validation service
        ValidationService.init({
            config: config,
            ReverseConstraint: ConstraintService.ReverseConstraint,
            constraintDefinitions: ConstraintService.constraintDefinitions,
            boundConstraints: BindingService.getBoundConstraints()
        });

        var result = [];

        if (typeof options !== "undefined" && typeof options.groups !== "undefined" && !(options.groups instanceof Array)) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.validate: If a groups attribute is provided, it must be an array.");
        }

        if (typeof options !== "undefined" && typeof options.groups !== "undefined" && options.groups.length == 0) {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.validate: If a groups attribute is provided, it must not be empty.");
        }

        if (typeof options !== "undefined" && options.hasOwnProperty("constraintType") && typeof options.constraintType === "undefined") {
            throw new ExceptionService.Exception.IllegalArgumentException("regula.validate: If a constraintType attribute is provided, it cannot be undefined.");
        }

        if (typeof options !== "undefined" && typeof options.elements !== "undefined") {

            if (options.elements instanceof Array) {

                if (options.elements.length == 0) {
                    throw new ExceptionService.Exception.IllegalArgumentException("regula.validate: If an elements attribute is provided, it must not be empty.");
                }

                /*
                 Since we redefine options.constraintType and options.groups in ValidationService.validate(), we need to preserve their original values so that
                 we can use them on each run
                 */

                var originalConstraintType = options.constraintType;
                var originalGroups = options.groups;

                result = [];
                for (var i = 0; i < options.elements.length; i++) {
                    options.elementId = options.elements[i].id;

                    result = result.concat(ValidationService.validate(options));

                    options.constraintType = originalConstraintType;
                    options.groups = originalGroups;
                }
            } else {
                throw new ExceptionService.Exception.IllegalArgumentException("regula.validate: If an elements attribute is provided, it must be an array.");
            }
        } else {
            result = ValidationService.validate(options);
        }

        return result;
    }

    return {
        configure: configure,
        bind: bind,
        unbind: unbind,
        isBound: isBound,
        validate: validate,
        custom: custom,
        compound: compound,
        override: override,
        Constraint: ConstraintService.Constraint,
        Group: GroupService.Group,
        DateFormat: DateFormat,
        Exception: ExceptionService.Exception
    };
}));
