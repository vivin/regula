/**
 * Defines the actual constraints that regula supports, and also maintains reverse-mapping between numeric constraint-values
 * and their String equivalents (for example, Checked can be mapped to 0, and 0 is reverse-mapped to Checked).
 *
 * This module also contains a few functions related to the validation of constraint definitions and constraint parameters.
 *
 * @type {{Constraint: {}, ReverseConstraint: {}, firstCustomConstraintIndex: number, constraintDefinitions: {}, verifyConstraintDefinition: Function, verifyParameterCountMatch: Function}}
 */
define(
    [
        "service/ValidationService",
        "domain/CompositionGraph",
        "service/ExceptionService",
        "utils/MapUtils",
        "utils/ArrayUtils"
    ], function (ValidationService, CompositionGraph, ExceptionService, MapUtils, ArrayUtils) {

        var Constraint = {};
        var ReverseConstraint = {};
        var firstCustomConstraintIndex = 0;

        /**
         * The Constraint and ReverseConstraint "enums" are generated here. This is a self-invoked function that iterates
         * over an array of strings that correspond to constraint names. Using these values, it creates entries in the
         * Constraint and ReverseConstraint maps. In addition, it also sets the value for firstCustomConstraintIndex.
         */
        (function (constraints) {
            for (var i = 0; i < constraints.length; i++) {
                Constraint[constraints[i]] = i;
                ReverseConstraint[i] = constraints[i];
            }

            firstCustomConstraintIndex = i;

            /*
             Set up aliases
             */

            Constraint["Between"] = Constraint.Range;
            Constraint["Matches"] = Constraint.Pattern;
            Constraint["Empty"] = Constraint.Blank;
            Constraint["NotEmpty"] = Constraint.NotBlank;
            Constraint["IsAlpha"] = Constraint.Alpha;
            Constraint["IsNumeric"] = Constraint.Numeric;
            Constraint["IsAlphaNumeric"] = Constraint.AlphaNumeric;
        })([
                "Checked",
                "Selected",
                "Max",
                "Min",
                "Range",
                "Between",
                "NotBlank",
                "NotEmpty",
                "Blank",
                "Empty",
                "Pattern",
                "Matches",
                "Email",
                "Alpha",
                "IsAlpha",
                "Numeric",
                "IsNumeric",
                "AlphaNumeric",
                "IsAlphaNumeric",
                "Integer",
                "Real",
                "CompletelyFilled",
                "PasswordsMatch",
                "Required",
                "Length",
                "Digits",
                "Past",
                "Future",
                "Step",
                "URL",
                "HTML5Required",
                "HTML5Email",
                "HTML5URL",
                "HTML5Number",
                "HTML5DateTime",
                "HTML5DateTimeLocal",
                "HTML5Date",
                "HTML5Month",
                "HTML5Time",
                "HTML5Week",
                "HTML5Range",
                "HTML5Tel",
                "HTML5Color",
                "HTML5Pattern",
                "HTML5MaxLength",
                "HTML5Min",
                "HTML5Max",
                "HTML5Step"
            ]);

        var constraintDefinitions = {
            Checked: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.checked,
                constraintType: Constraint.Checked,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} needs to be checked."
            },

            Selected: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.selected,
                constraintType: Constraint.Selected,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} needs to be selected."
            },

            Max: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.max,
                constraintType: Constraint.Max,
                custom: false,
                compound: false,
                params: ["value"],
                defaultMessage: "{label} needs to be lesser than or equal to {value}."
            },

            Min: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.min,
                constraintType: Constraint.Min,
                custom: false,
                compound: false,
                params: ["value"],
                defaultMessage: "{label} needs to be greater than or equal to {value}."
            },

            Range: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.range,
                constraintType: Constraint.Range,
                custom: false,
                compound: false,
                params: ["min", "max"],
                defaultMessage: "{label} needs to be between {min} and {max}."
            },

            NotBlank: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.notBlank,
                constraintType: Constraint.NotBlank,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} cannot be blank."
            },

            Blank: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.blank,
                constraintType: Constraint.Blank,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} needs to be blank."
            },

            Pattern: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.matches,
                constraintType: Constraint.Pattern,
                custom: false,
                compound: false,
                params: ["regex"],
                defaultMessage: "{label} needs to match {regex}{flags}."
            },

            Email: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.email,
                constraintType: Constraint.Email,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid email."
            },

            Alpha: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.alpha,
                constraintType: Constraint.Alpha,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} can only contain letters."
            },

            Numeric: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.numeric,
                constraintType: Constraint.Numeric,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} can only contain numbers."
            },

            AlphaNumeric: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.alphaNumeric,
                constraintType: Constraint.AlphaNumeric,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} can only contain numbers and letters."
            },

            Integer: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.integer,
                constraintType: Constraint.Integer,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} must be an integer."
            },

            Real: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.real,
                constraintType: Constraint.Real,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} must be a real number."
            },

            CompletelyFilled: {
                html5: false,
                formSpecific: true,
                validator: ValidationService.Validator.completelyFilled,
                constraintType: Constraint.CompletelyFilled,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} must be completely filled."
            },

            PasswordsMatch: {
                html5: false,
                formSpecific: true,
                validator: ValidationService.Validator.passwordsMatch,
                constraintType: Constraint.PasswordsMatch,
                custom: false,
                compound: false,
                params: ["field1", "field2"],
                defaultMessage: "Passwords do not match."
            },

            Required: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.required,
                constraintType: Constraint.Required,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is required."
            },

            Length: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.length,
                constraintType: Constraint.Length,
                custom: false,
                compound: false,
                params: ["min", "max"],
                defaultMessage: "{label} length must be between {min} and {max}."
            },

            Digits: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.digits,
                constraintType: Constraint.Digits,
                custom: false,
                compound: false,
                params: ["integer", "fraction"],
                defaultMessage: "{label} must have up to {integer} digits and {fraction} fractional digits."
            },

            Past: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.past,
                constraintType: Constraint.Past,
                custom: false,
                compound: false,
                params: ["format"],
                defaultMessage: "{label} must be in the past."
            },

            Future: {
                html5: false,
                formSpecific: false,
                validator: ValidationService.Validator.future,
                constraintType: Constraint.Future,
                custom: false,
                compound: false,
                params: ["format"],
                defaultMessage: "{label} must be in the future."
            },

            Step: {
                /* TODO:  implement */
                html5: false,
                formSpecific: false,
                constraintType: Constraint.Step,
                custom: false,
                compound: false,
                params: ["min", "value"],
                defaultMessage: "{label} must be equal to {min} or greater at increments of {value}."
            },

            URL: {
                /* TODO: implement */
                html5: false,
                formSpecific: false,
                constraintType: Constraint.URL,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} must be a valid URL."
            },

            HTML5Required: {
                html5: true,
                inputType: null,
                attribute: "required",
                formSpecific: false,
                validator: ValidationService.Validator.html5Required,
                constraintType: Constraint.HTML5Required,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is required."
            },

            HTML5Email: {
                html5: true,
                inputType: "email",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Email,
                constraintType: Constraint.HTML5Email,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid email."
            },

            HTML5Pattern: {
                html5: true,
                inputType: null,
                attribute: "pattern",
                formSpecific: false,
                validator: ValidationService.Validator.html5Pattern,
                constraintType: Constraint.HTML5Pattern,
                custom: false,
                compound: false,
                params: ["pattern"],
                defaultMessage: "{label} needs to match {pattern}."
            },

            HTML5URL: {
                html5: true,
                inputType: "url",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5URL,
                constraintType: Constraint.HTML5URL,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid URL."
            },

            HTML5Number: {
                html5: true,
                inputType: "number",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Number,
                constraintType: Constraint.HTML5Number,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid number."
            },

            HTML5DateTime: {
                html5: true,
                inputType: "datetime",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5DateTime,
                constraintType: Constraint.HTML5DateTime,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid date-time."
            },

            HTML5DateTimeLocal: {
                html5: true,
                inputType: "datetime-local",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5DateTimeLocal,
                constraintType: Constraint.HTML5DateTimeLocal,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid local date-time."
            },

            HTML5Date: {
                html5: true,
                inputType: "date",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Date,
                constraintType: Constraint.HTML5Date,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid date."
            },

            HTML5Month: {
                html5: true,
                inputType: "month",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Month,
                constraintType: Constraint.HTML5Month,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid month."
            },

            HTML5Time: {
                html5: true,
                inputType: "time",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Time,
                constraintType: Constraint.HTML5Time,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid time."
            },

            HTML5Week: {
                html5: true,
                inputType: "week",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Week,
                constraintType: Constraint.HTML5Week,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid week."
            },

            HTML5Range: {
                html5: true,
                inputType: "range",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Range,
                constraintType: Constraint.HTML5Range,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid range."
            },

            HTML5Tel: {
                html5: true,
                inputType: "tel",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Tel,
                constraintType: Constraint.HTML5Tel,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid telephone number."
            },

            HTML5Color: {
                html5: true,
                inputType: "color",
                attribute: null,
                formSpecific: false,
                validator: ValidationService.Validator.html5Color,
                constraintType: Constraint.HTML5Color,
                custom: false,
                compound: false,
                params: [],
                defaultMessage: "{label} is not a valid color."
            },

            HTML5MaxLength: {
                html5: true,
                inputType: null,
                attribute: "maxlength",
                formSpecific: false,
                validator: ValidationService.Validator.html5MaxLength,
                constraintType: Constraint.HTML5MaxLength,
                custom: false,
                compound: false,
                params: ["maxlength"],
                defaultMessage: "{label} must be less than {maxlength} characters."
            },

            HTML5Min: {
                html5: true,
                inputType: null,
                attribute: "min",
                formSpecific: false,
                validator: ValidationService.Validator.html5Min,
                constraintType: Constraint.HTML5Min,
                custom: false,
                compound: false,
                params: ["min"],
                defaultMessage: "{label} needs to be greater than or equal to {min}."
            },

            HTML5Max: {
                html5: true,
                inputType: null,
                attribute: "max",
                formSpecific: false,
                validator: ValidationService.Validator.html5Max,
                constraintType: Constraint.HTML5Max,
                custom: false,
                compound: false,
                params: ["max"],
                defaultMessage: "{label} must be greater than or equal to {max}."
            },

            HTML5Step: {
                html5: true,
                inputType: null,
                attribute: "step",
                formSpecific: false,
                validator: ValidationService.Validator.html5Step,
                constraintType: Constraint.HTML5Step,
                custom: false,
                compound: false,
                params: ["step"],
                defaultMessage: "{label} must be equal to {min} or greater at increments of {value}."
            }
        };

        /**
         * Overrides the definition of a constraint. If the constraint is a compound constraint, then this function also
         * checks to make sure that there are no cycles in the composition graph.
         * @param options
         */
        function override(options) {
            if (options.compound) {
                verifyComposingConstraints(options.name, options.composingConstraints, options.params);

                /* Typically a user should fix their code when they see a cyclical-composition error from regula.override().
                 * If the error is ignored and validation is carried out however, we can get into an infinite loop because we
                 * modified the graph to contain a cycle. A more robust solution would be to clone the composition graph and
                 * restore it if we find out that it contains a cycle
                 */
                var root = CompositionGraph.clone();

                /* now let's update our graph */
                updateCompositionGraph(options.name, options.composingConstraints);

                /* we need to see if a cycle exists in our graph */
                var result = CompositionGraph.cycleExists(CompositionGraph.getNodeByType(options.constraintType));
                if (result.cycleExists) {
                    CompositionGraph.setRoot(root);
                    throw new ExceptionService.Exception.ConstraintDefinitionException("regula.override: The overriding composing-constraints you have specified have created a cyclic composition: " + result.path);
                }
            }

            constraintDefinitions[options.name] = {
                formSpecific: options.formSpecific,
                constraintType: Constraint[options.name],
                custom: true,
                compound: options.compound,
                params: options.params,
                composingConstraints: options.composingConstraints,
                defaultMessage: options.defaultMessage,
                validator: options.validator
            };
        }

        /**
         * Adds a custom constraint
         * @param options
         */
        function custom(options) {
            //console.log("custom got", options);
            Constraint[options.name] = firstCustomConstraintIndex;
            ReverseConstraint[firstCustomConstraintIndex++] = options.name;
            constraintDefinitions[options.name] = {
                formSpecific: options.formSpecific,
                validator: options.validator,
                constraintType: Constraint[options.name],
                custom: true,
                compound: false,
                params: options.params,
                defaultMessage: options.defaultMessage
            };
            //console.log(Constraint);
        }

        /**
         * Adds a compound constraint
         * @param options
         */
        function compound(options) {
            verifyComposingConstraints(options.name, options.constraints, options.params);

            Constraint[options.name] = firstCustomConstraintIndex;
            ReverseConstraint[firstCustomConstraintIndex++] = options.name;
            constraintDefinitions[options.name] = {
                formSpecific: options.formSpecific,
                constraintType: Constraint[options.name],
                custom: true,
                compound: true,
                params: options.params,
                reportAsSingleViolation: options.reportAsSingleViolation,
                composingConstraints: options.constraints,
                defaultMessage: options.defaultMessage,
                validator: ValidationService.compoundValidator
            };

            /* now let's update our graph */
            updateCompositionGraph(options.name, options.constraints);
        }

        /**
         * Verifies a constraint definition. Ensures the following:
         *
         *  o Constraint is bound to an element that supports it.
         *  o Ensures that all parameters are present (by calling an auxiliary function)
         *
         * @param element - The element on which the constraint has been defined.
         * @param constraintName - The constraint in question.
         * @param definedParameters - The parameters that this constraint has received.
         * @returns {{successful: boolean, message: string, data: null}}
         */
        function verifyConstraintDefinition(element, constraintName, definedParameters) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if (element.tagName.toLowerCase() == "form" && !constraintDefinitions[constraintName].formSpecific) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, constraintName, "@" + constraintName + " is not a form constraint, but you are trying to bind it to a form"),
                    data: null
                };
            } else if (element.tagName.toLowerCase() != "form" && constraintDefinitions[constraintName].formSpecific) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, constraintName, "@" + constraintName + " is a form constraint, but you are trying to bind it to a non-form element"),
                    data: null
                };
            } else if ((typeof element.type === "undefined" || (element.type.toLowerCase() != "checkbox" && element.type.toLowerCase() != "radio")) && constraintName == "Checked") {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, constraintName, "@" + constraintName + " is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button."),
                    data: null
                };
            } else if (element.tagName.toLowerCase() != "select" && constraintName == "Selected") {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, constraintName, "@" + constraintName + " is only applicable to select boxes. You are trying to bind it to an input element that is not a select box."),
                    data: null
                };
            } else {
                var parameterResult = verifyParameterCountMatches(element, constraintDefinitions[constraintName], definedParameters);

                if (parameterResult.error) {
                    result = {
                        successful: false,
                        message: parameterResult.message,
                        data: null
                    };
                } else {
                    result.data = definedParameters;
                }
            }

            return result;
        }

        /**
         * Ensures that all required parameters are present
         * @param element - The element that this constraint is defined on
         * @param constraint - The constraint in question
         * @param receivedParameters - The parameters that this constraint has received
         * @returns {{error: boolean, message: string}}
         */
        function verifyParameterCountMatches(element, constraint, receivedParameters) {

            var result = {
                error: false,
                message: ""
            };

            if (receivedParameters.__size__ < constraint.params.length) {
                result = {
                    error: true,
                    message: ExceptionService.generateExceptionMessage(element, ReverseConstraint[constraint.constraintType], "@" + ReverseConstraint[constraint.constraintType] + " expects at least " + constraint.params.length + " parameter(s). However, you have provided only " + receivedParameters.__size__),
                    data: null
                };
            }

            var missingParams = [];
            for (var j = 0; j < constraint.params.length; j++) {
                var param = constraint.params[j];

                if (typeof receivedParameters[param] === "undefined") {
                    missingParams.push(param);
                }
            }

            //console.log("missing params", missingParams);

            if (missingParams.length > 0) {
                result = {
                    error: true,
                    message: ExceptionService.generateExceptionMessage(element, ReverseConstraint[constraint.constraintType], "You seem to have provided some optional or required parameters for @" + ReverseConstraint[constraint.constraintType] + ", but you are still missing the following " + missingParams.length + " required parameter(s): " + ArrayUtils.explode(missingParams, ", ")),
                    data: null
                };
            }

            return result;
        }

        /**
         * Updates the constraint composition-graph using the provided constraint name and its composing constraints.
         * @param constraintName
         * @param composingConstraints
         */
        function updateCompositionGraph(constraintName, composingConstraints) {
            var graphNode = CompositionGraph.getNodeByType(Constraint[constraintName]);

            if (graphNode == null) {
                CompositionGraph.addNode(Constraint[constraintName], constraintName, null);
                graphNode = CompositionGraph.getNodeByType(Constraint[constraintName]);
            }

            //First we have to remove the existing children
            CompositionGraph.removeChildren(graphNode);
            for (var i = 0; i < composingConstraints.length; i++) {
                var composingConstraintName = ReverseConstraint[composingConstraints[i].constraintType];
                var composingConstraint = constraintDefinitions[composingConstraintName];

                if (composingConstraint.compound) {
                    CompositionGraph.addNode(composingConstraint.constraintType, ReverseConstraint[composingConstraint.constraintType], graphNode);
                }
            }
        }

        /**
         * Verifies that the compound constraint that has been defined supplies the correct number of parameters for its
         * composing constraints
         * @param name
         * @param constraints
         * @param params
         */
        function verifyComposingConstraints(name, constraints, params) {
            var constraintList = [];

            for (var i = 0; i < constraints.length; i++) {
                if (typeof constraints[i].constraintType === "undefined") {
                    throw new ExceptionService.Exception.ConstraintDefinitionException("In compound constraint " + name + ": A composing constraint has no constraint type specified.")
                } else {
                    constraintList.push(constraintDefinitions[ReverseConstraint[constraints[i].constraintType]]);
                }
            }

            for (var i = 0; i < constraints.length; i++) {
                var constraint = constraints[i];
                var constraintName = ReverseConstraint[constraint.constraintType];
                var definedParameters = {
                    __size__: 0
                };

                constraint.params = constraint.params || {};

                for (var paramName in constraint.params) if (constraint.params.hasOwnProperty(paramName)) {
                    MapUtils.put(definedParameters, paramName, constraint.params[paramName]);
                }

                /* We need a __size__ property for the params object in constraint, so let's add it */
                var size = 0;
                for (var param in constraint.params) if (constraint.params.hasOwnProperty(param)) {
                    size++;
                }

                constraint.params["__size__"] = size;

                /*
                 Now we will combine the parameters from the compound-constraint parameter-definition into the params map
                 for the composing constraint. Of course, these parameters won't have any values; we just want to make sure
                 that we copy them over so that we can be sure that the composing-constraint contains all the required
                 parameters. The actual values for any parameters inherited from the compound constraint won't be filled in
                 until we evaluate the constraints (i.e., during validation)
                 */

                for (var j = 0; j < params.length; j++) {
                    MapUtils.put(definedParameters, params[j], null);
                }

                var result = verifyParameterCountMatches(null, constraintDefinitions[constraintName], definedParameters);

                if (result.error) {
                    throw new ExceptionService.Exception.ConstraintDefinitionException("In compound constraint " + name + ": " + result.message);
                }
            }
        }

        return {
            Constraint: Constraint,
            ReverseConstraint: ReverseConstraint,
            firstCustomConstraintIndex: firstCustomConstraintIndex,
            constraintDefinitions: constraintDefinitions,
            override: override,
            custom: custom,
            compound: compound,
            verifyConstraintDefinition: verifyConstraintDefinition,
            verifyParameterCountMatches: verifyParameterCountMatches
        };
    });