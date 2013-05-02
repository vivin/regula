/**
 * Contains logic that deals with binding constraints to elements
 * @type {{initializeBoundConstraints: Function, resetBoundConstraints: Function, getBoundConstraints: Function,
 *         removeElementAndGroupFromBoundConstraintsIfEmpty: Function, bindAfterParsing: Function, bindHTML5ValidationConstraints: Function,
 *         bindFromOptions: Function, unbind: Function}}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "utils/MapUtils",
            "service/GroupService",
            "utils/DOMUtils",
            "parser/Parser",
            "service/ConstraintService",
            "service/ExceptionService"
        ], factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.BindingService = factory(
            root.regulaModules.MapUtils,
            root.regulaModules.GroupService,
            root.regulaModules.DOMUtils,
            root.regulaModules.Parser,
            root.regulaModules.ConstraintService,
            root.regulaModules.ExceptionService
        );
    }
}(this, function (MapUtils, GroupService, DOMUtils, Parser, ConstraintService, ExceptionService) {

    /**
     * Keeps track of bound constraints. Keyed by Group -> Element Id -> Constraint Name
     * @type {}
     */
    var boundConstraints = null;

    /**
     * Initializes bound constraints to their initial state only if they have not been initialized (i.e., they are null).
     */
    function initializeBoundConstraints() {
        if (boundConstraints === null) {
            resetBoundConstraints();
        }
    }

    /**
     * Resets bound constraints to their initial state. This has the effect of pretty much unbinding everything.
     */
    function resetBoundConstraints() {
        boundConstraints = {
            Default: {}
        };
    }

    /**
     * Returns bound constraints
     * @returns {}
     */
    function getBoundConstraints() {
        return boundConstraints;
    }

    /**
     * Removes the element and/or group entry from the boundConstraints map if neither of those have any constraints
     * bound to them.
     * @param id
     * @param group
     */
    function removeElementAndGroupFromBoundConstraintsIfEmpty(id, group) {
        if (MapUtils.isEmpty(boundConstraints[group][id])) {
            delete boundConstraints[group][id];

            if (MapUtils.isEmpty(boundConstraints[group])) {
                delete boundConstraints[group];

                var groupIndex = GroupService.Group[group];
                delete GroupService.Group[group];
                delete GroupService.ReverseGroup[groupIndex];

                GroupService.deletedGroupIndices.push(groupIndex);
            }
        }
    }

    /**
     * This function will attempt to bind constraints to an element by parsing its "data-constraints" attribute. If
     * the "element" attribute has not been provided, then this function will attempt to parse the "data-constraints"
     * attribute of any element that has it.
     *
     * @param options
     * @returns {{successful: boolean, message: string, data: null}}
     */
    function bindAfterParsing(options) {
//            console.log("bAP:", options);
        var element = options.element;
        var elementsWithRegulaValidation;

        if (element === null) {
            elementsWithRegulaValidation = DOMUtils.getElementsByAttribute(document.body, "*", "data-constraints");
        } else {
            elementsWithRegulaValidation = [element];
        }

        var result = {
            successful: true,
            message: "",
            data: null
        };

        var i = 0;
        while (i < elementsWithRegulaValidation.length && result.successful) {
            element = elementsWithRegulaValidation[i];
            var tagName = element.tagName.toLowerCase();

            if (tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
                result = {
                    successful: false,
                    message: tagName + "#" + element.id + " is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements.",
                    data: null
                };
            } else {
                // automatically assign an id if the element does not have one
                if (!element.id) {
                    element.id = DOMUtils.generateRandomId();
                }

                var dataConstraintsAttribute = element.getAttribute("data-constraints");
                result = Parser.parse(element, dataConstraintsAttribute);

                if (result.successful && result.data !== null) {
                    var constraintsToAttach = result.data;
                    var j = 0;

                    while (result.successful && j < constraintsToAttach.length) {
                        var constraintToAttach = constraintsToAttach[j];
                        result = attachConstraintDefinitionToElement(constraintToAttach.element, constraintToAttach.constraintName, constraintToAttach.definedParameters);
                        j++;
                    }
                }

                i++;
            }
        }

        return result;
    }

    /*
     TODO: Figure out how to handle programmatic binding of HTML5 Validation constraints. Do we create the attributes?
     TODO: Figure out how HTML5 validation binding works with bindFromOptions() and bindFromOptionsWithElements()
     */

    /**
     * This function will attempt to bind html5 constraints to the specified element. If the "element" attribute has
     * not been provided, it will attempt to find any elements in the DOM with any html5 constraints, and then try to
     * bind those constraints to their respective elements. Internally, the html5 validation constraints are
     * translated to their Regula "HTML5" equivalents (i.e., "required" is converted to "HTML5Required", etc.).
     *
     * @param options
     * @returns {{successful: boolean, message: string, data: null}}
     */

    function bindHTML5ValidationConstraints(options) {
        var element = options.element;

        var result = {
            successful: true,
            message: "",
            data: null
        };

        /**
         * A list of HTML5 constraints. This list essentially helps us match up HTML5 validation constraints with their
         * regula equivalents. The "attribute" property essentially describes the HTML attribute used to describe the
         * HTML5 validation constraint. For example, the "required" constraint is described by the "required" attribute.
         * The "value" property describes what the expected value is for a specific attribute. For example, for the
         * email-validation constraint, the HTML attribute is "type" and the associated value is "email".
         *
         */
        var html5Constraints = [
            {
                attribute: "required",
                value: null,
                constraint: ConstraintService.Constraint.HTML5Required
            },
            {
                attribute: "type",
                value: "email",
                constraint: ConstraintService.Constraint.HTML5Email
            },
            {
                attribute: "type",
                value: "url",
                constraint: ConstraintService.Constraint.HTML5URL
            },
            {
                attribute: "type",
                value: "number",
                constraint: ConstraintService.Constraint.HTML5Number
            },
            {
                attribute: "type",
                value: "datetime",
                constraint: ConstraintService.Constraint.HTML5DateTime
            },
            {
                attribute: "type",
                value: "datetime-local",
                constraint: ConstraintService.Constraint.HTML5DateTimeLocal
            },
            {
                attribute: "type",
                value: "date",
                constraint: ConstraintService.Constraint.HTML5Date
            },
            {
                attribute: "type",
                value: "month",
                constraint: ConstraintService.Constraint.HTML5Month
            },
            {
                attribute: "type",
                value: "time",
                constraint: ConstraintService.Constraint.HTML5Time
            },
            {
                attribute: "type",
                value: "week",
                constraint: ConstraintService.Constraint.HTML5Week
            },
            {
                attribute: "type",
                value: "range",
                constraint: ConstraintService.Constraint.HTML5Range
            },
            {
                attribute: "type",
                value: "tel",
                constraint: ConstraintService.Constraint.HTML5Tel
            },
            {
                attribute: "type",
                value: "color",
                constraint: ConstraintService.Constraint.HTML5Color
            },
            {
                attribute: "pattern",
                value: null,
                constraint: ConstraintService.Constraint.HTML5Pattern
            },
            {
                attribute: "maxlength",
                value: null,
                constraint: ConstraintService.Constraint.HTML5MaxLength
            },
            {
                attribute: "min",
                value: null,
                constraint: ConstraintService.Constraint.HTML5Min
            },
            {
                attribute: "max",
                value: null,
                constraint: ConstraintService.Constraint.HTML5Max
            },
            {
                attribute: "step",
                value: null,
                constraint: ConstraintService.Constraint.HTML5Step
            }
        ];

        /**
         * Maps the value of the HTML "type" attribute to the equivalent Regula HTML5 constraint.
         */
        var typeToRegulaConstraint = {
            email: ConstraintService.Constraint.HTML5Email,
            url: ConstraintService.Constraint.HTML5URL,
            number: ConstraintService.Constraint.HTML5Number,
            datetime: ConstraintService.Constraint.HTML5DateTime,
            "datetime-local": ConstraintService.Constraint.HTML5DateTimeLocal,
            date: ConstraintService.Constraint.HTML5Date,
            month: ConstraintService.Constraint.HTML5Month,
            time: ConstraintService.Constraint.HTML5Time,
            week: ConstraintService.Constraint.HTML5Week,
            range: ConstraintService.Constraint.HTML5Range,
            tel: ConstraintService.Constraint.HTML5Tel,
            color: ConstraintService.Constraint.HTML5Color
        };

        /**
         * This function iterates over the list of elements that have a specific HTML5 constraint, and converts that
         * information over the Regula equivalent. Once the information has been converted, it is added to the
         * (in/out) "elementMap" parameter.
         *
         * For example, say that all elements have the "required" attribute. This will be converted into HTML5Required.
         *
         * @param elementMap - An in/out parameter. Keeps track of elements and their associated constraints (regula equivalents of HTML5 constraints)
         * @param elements - List of elements that have the constraint specified by "html5Constraint"
         * @param html5Constraint - The HTML5 constraint that every member of "elements" has.
         */
        function addConstraintToElementMap(elementMap, elements, html5Constraint) {
            for (var i = 0; i < elements.length; i++) {

                var element = elements[i];
                if (!element.id) {
                    element.id = DOMUtils.generateRandomId();
                }

                if (!elementMap[element.id]) {
                    elementMap[element.id] = [];
                }

                var constraintDefinition = {
                    constraint: html5Constraint.constraint,
                    params: {}
                };

                /**
                 * Type-validation constraints don't take in any parameters. So we don't need to look at the "value" parameter here.
                 */
                if (html5Constraint.value === null) {
                    constraintDefinition.params[html5Constraint.attribute] = DOMUtils.getAttributeValueForElement(element, html5Constraint.attribute);
                }

                elementMap[element.id].push(constraintDefinition);
            }
        }

        var elementsWithHTML5Validation = {};

        /**
         * If "element" is null, it means that we need to go through our list of HTML5 constraints and check to see which
         * elements in the document have them. Otherwise, we need to go through our list of HTML5 constraints and see if the
         * supplied element has any of them.
         */
        if (element === null) {
            for (var i = 0; i < html5Constraints.length; i++) {
                var html5Constraint = html5Constraints[i];

                var elements = null;
                if (html5Constraint.value == null) {
                    elements = DOMUtils.getElementsByAttribute(document.body, "*", html5Constraint.attribute);
                } else {
                    elements = DOMUtils.getElementsByAttribute(document.body, "*", html5Constraint.attribute, html5Constraint.value);
                }

                addConstraintToElementMap(elementsWithHTML5Validation, elements, html5Constraint);
            }
        } else {
            if (!element.id) {
                element.id = DOMUtils.generateRandomId();
            }

            elementsWithHTML5Validation[element.id] = [];

            for (var i = 0; i < html5Constraints.length; i++) {
                var html5Constraint = html5Constraints[i];

                /**
                 * If we don't care about the HTML5 validation attribute's value, then it means that we just have to see if
                 * that specific attribute exists on the element. If it does, we can add it to our map. Otherwise it means
                 * that we have a type-validation constraint and so we will need to look at the value of the attribute to
                 * figure out the appropriate constraint.
                 */
                if (html5Constraint.value == null) {
                    if (DOMUtils.getAttributeValueForElement(element, html5Constraint.attribute) != null) {
                        var constraintDefinition = {
                            constraint: html5Constraint.constraint,
                            params: {}
                        };

                        constraintDefinition.params[html5Constraint.attribute] = DOMUtils.getAttributeValueForElement(element, html5Constraint.attribute);
                        elementsWithHTML5Validation[element.id].push(constraintDefinition);
                    }
                } else {
                    var value = DOMUtils.getAttributeValueForElement(element, html5Constraint.attribute);

                    if (value != null) {
                        elementsWithHTML5Validation[element.id].push({
                            constraint: typeToRegulaConstraint[value],
                            params: {}
                        });
                    }
                }
            }

        }

        MapUtils.iterateOverMap(elementsWithHTML5Validation, function (elementId, constraintDefinitions, index) {
            var element = document.getElementById(elementId);

            for (var i = 0; i < constraintDefinitions.length; i++) {
                var constraintDefinition = constraintDefinitions[i];
                result = attachConstraintDefinitionToElement(element, ConstraintService.ReverseConstraint[constraintDefinition.constraint], constraintDefinition.params);
            }
        });

        return result;
    }

    /**
     * This function basically supports the "explicit" programmatic-binding of constraints to elements. A call to just regula.bind() will end up
     * performing binding on any element that has constraints. By providing options to regula.bind(), one can target specific elements or just
     * a single element. This particular function operates on a single element. If multiple elements have been provided, bind() within the regula
     * module will iterate over those elements and then call this function. This function can performing binding in one of two ways: if constraint
     * definitions haven't been specified explicitly (i.e., programmatic specification of constraints to bind to the element), then the function
     * will call the bindAfterParsing() function. If the constraints have been specified programmatically, this function will call the
     * bindUsingConstraintDefinitions() function.
     *
     * @param options
     * @returns {{successful: boolean, message: string, data: null}}
     */
    function bindFromOptions(options) {
        //console.log("bFO");

        var result = {
            successful: true,
            message: "",
            data: null
        };

        var element = options.element;
        var constraints = options.constraints || [];
        var tagName = (element && element.tagName) ? element.tagName.toLowerCase() : null;

        if (!element) {
            result = {
                successful: false,
                message: "regula.bind expects a non-null element attribute in the options argument. " + ExceptionService.explodeParameters(options),
                data: null
            };
        } else if (element.nodeType !== 1) { //Must be an HTMLElement
            result = {
                successful: false,
                message: "regula.bind: element attribute is expected to be an HTMLElement, but was of unexpected type: " + typeof element + ". " + ExceptionService.explodeParameters(options),
                data: null
            };
        } else if (tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
            result = {
                successful: false,
                message: tagName + "#" + element.id + " is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements. " + ExceptionService.explodeParameters(options),
                data: null
            };
        } else {
            if (constraints.length > 0) {

                var i = 0;
                while (i < constraints.length && result.successful) {
                    result = bindUsingConstraintDefinition(constraints[i], options);
                    i++;
                }
            } else {
                result = bindAfterParsing({
                    element: element
                });
            }
        }

        return result;
    }

    function bindUsingConstraintDefinition(constraint, options) {

        /** A few inner utility-functions **/

        /**
         * Returns the union of the first and second set
         * @param first
         * @param second
         * @returns {Array}
         */
        function union(first, second) {
            var inserted = {};
            var union = [];

            for (var i = 0; i < first.length; i++) {
                union.push(first[i]);
                inserted[first[i]] = true;
            }

            for (var j = 0; j < second.length; j++) {
                if (!inserted[second[j]]) {
                    union.push(second[j]);
                }
            }

            return union;
        }

        /**
         * Subtracts the second set from the first
         * @param second
         * @param first
         * @returns {Array}
         */
        function subtract(second, first) {
            var difference = [];

            for (var i = 0; i < first.length; i++) {
                if (!MapUtils.exists(second, first[i])) {
                    difference.push(first[i]);
                }
            }

            return difference;
        }

        /**
         * Special logic to handle group-overwriting logic.
         * We need to see if we need to remove this constraint-element combination from any group(s). For example,
         * assume that we originally had the groups "First" and "Second" and then the user sent in "Second" and
         * "Third". This means that we have to remove this constraint from the "First" group. So basically, the
         * groups we need to remove the element-constraint combination from can be found by performing the following
         * operation:
         *
         * (Go union Gn) - Gn
         *
         * Where:
         *
         * o Go is the old group set
         * o Gn is the new group set
         *
         * @param element
         * @param constraintType
         * @param definedParameters
         */
        function overwriteGroups(element, constraintType, definedParameters) {
            var oldGroups = boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][element.id][ConstraintService.ReverseConstraint[constraintType]]["groups"];

            var newGroups = [];

            if (definedParameters["groups"]) {
                newGroups = definedParameters["groups"];
            } else {
                newGroups.push(GroupService.ReverseGroup[GroupService.Group.Default]);
            }

            /**
             * If the list of groups does not contain the "Default" group, let's add it because we don't want to delete it if
             * the user did not specify it
             */
            if (!MapUtils.exists(newGroups, GroupService.ReverseGroup[GroupService.Group.Default])) {
                newGroups.push(GroupService.ReverseGroup[GroupService.Group.Default]);
            }

            /**
             * groupsToRemoveConstraintFrom = (oldGroups union newGroups) - newGroups
             */
            var groupsToRemoveConstraintFrom = subtract(newGroups, union(oldGroups, newGroups));

            for (var i = 0; i < groupsToRemoveConstraintFrom.length; i++) {
                var group = groupsToRemoveConstraintFrom[i];

                delete boundConstraints[group][element.id][ConstraintService.ReverseConstraint[constraintType]];
                removeElementAndGroupFromBoundConstraintsIfEmpty(element.id, group);
            }
        }

        var result = {
            successful: true,
            message: "",
            data: null
        };

        var element = options.element;
        var overwriteConstraint = constraint.overwriteConstraint || false;
        var overwriteParameters = constraint.overwriteParameters || false;
        var constraintType = constraint.constraintType;
        var definedParameters = constraint.params || {};
        var newParameters = {
            __size__: 0
        };

        /**
         * ########
         * ########
         * We kind of muck around with the groups parameter a lot by adding the Default group into it (if it doesn't exist)
         * and also normalizing enum integers into actual strings. Now we have a use-case where we can use the same constraint
         * definition for multiple elements. Obviously this can wreak havoc because we've changed the group parameter. So it's
         * better that we preserve the original value and then restore it when we are done. This is the only parameter that we
         * really play around with; all other parameters are copied as-is. If we end up getting more parameters that we end up
         * messing around with, we might need to rethink how we do this processing. I don't like the fact that I have group
         * processing interleaved with all other kinds of processing. Might have to refactor and split this out at some point.
         * #######
         * #######
         */
        var originalGroups = definedParameters["groups"];

        /** We check to see if this was a valid/defined constraint. It wasn't so we need to return an error message **/
        if (typeof constraintType === "undefined") {
            result = {
                successful: false,
                message: "regula.bind expects a valid constraint type for each constraint in constraints attribute of the options argument. " + ExceptionService.explodeParameters(options),
                data: null
            };
        }

        /** we also need to make sure groups make sense (if we got any) **/
        else if (definedParameters && definedParameters["groups"]) {

            if (definedParameters["groups"] instanceof Array) {

                /** We need to normalize the "groups" parameter that the user sends in. The user sends in the groups parameter as an array of 'enum'
                 * values, or if it is a new constraint, a string. We need to normalize this into an array of just strings. While we're doing this,
                 * we'll also check to see if we have any invalid groups
                 */
                var normalizedGroups = [];
                var j = 0;

                while (j < definedParameters["groups"].length && result.successful) {

                    if (typeof definedParameters["groups"][j] == "string") {
                        normalizedGroups.push(definedParameters["groups"][j]); //If it's a string that push it in directly
                    } else if (typeof GroupService.ReverseGroup[definedParameters["groups"][j]] !== "undefined") {
                        normalizedGroups.push(GroupService.ReverseGroup[definedParameters["groups"][j]]); //Otherwise it's an enum, so push in the string value
                    } else {
                        result = {
                            successful: false,
                            message: "Invalid group: " + definedParameters["groups"][j] + ". " + ExceptionService.explodeParameters(options),
                            data: null
                        };
                    }

                    j++;
                }

                if (result.successful) {
                    definedParameters["groups"] = normalizedGroups;
                }
            } else {
                result = {
                    successful: false,
                    message: "The groups parameter must be an array of enums or strings " + ExceptionService.explodeParameters(options),
                    data: null
                };
            }
        }

        /** If everything is fine at this point, let's go ahead and do the actual binding **/
        if (result.successful) {
            /**
             * Here (in the first if statement) we have logic to see if we this constraint has previously been bound and if so, if we need to
             * overwrite it with new parameters or constraint definitions.
             *
             * We check to see if this element-constraint combination does NOT exist. We can say that the combination does NOT exist
             *
             * o If the element's id does not exist as a key within the Default group (every element is added to the default group regardless). If so,
             *   we do not need to perform any sort of overwriting behavior. We can simply verify that our parameters are good, and then attach
             *   the constraints to the element.
             *
             * OR
             *
             * o If the element's id exists within the Default group, but this particular constraint has not been bound to it. If so, we do not need to
             *   perform any sort of overwriting behavior. We can simply verify that our parameters are good, and then attach the constraints to the
             *   element.
             */

            if (!boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][element.id] || !boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][element.id][ConstraintService.ReverseConstraint[constraintType]]) {

                /**
                 * definedParameters has no '__size__' property. So we need to copy all the parameters from definedParameters into another map, so that
                 * we can have a '__size__' property. The reason we need this is because we use this property to verify that this constraint definition is
                 * valid, inside the ConstraintService#verifyConstraintDefinition() function.
                 */
                for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                    MapUtils.put(newParameters, param, definedParameters[param]);
                }

                result = ConstraintService.verifyConstraintDefinition(element, ConstraintService.ReverseConstraint[constraintType], newParameters);

            } else if (overwriteConstraint) {
                /**
                 * We are sure at this point that this element-constraint combination exists, and we are also sure that we are overwriting it. In this
                 * case we first need to copy all the parameters over and then verify that the definition is valid. In this case, we're simply going to
                 * overwrite the existing map of parameters with this new map. However, we will need additional logic to handle groups.
                 */

                for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                    MapUtils.put(newParameters, param, definedParameters[param]);
                }

                result = ConstraintService.verifyConstraintDefinition(element, ConstraintService.ReverseConstraint[constraintType], newParameters);

                if (result.successful) {
                    /**
                     * Now we need to handle the overwriting of groups. We could delete this element-constraint combination out of
                     * all the old groups. But let's be smart about it and only delete it from the groups it no longer exists in
                     * (according to the new groups parameter). Since this is a destructive operation we only want to do this if
                     * the constraint-definition verification was successful.
                     */

                    overwriteGroups(element, constraintType, definedParameters);
                }

            } else {
                /**
                 * At this point, we know the following:
                 *
                 * o This constraint has previously been bound to the element because this element-constraint combination exists.
                 * o We are NOT overwriting (i.e., re-binding after getting rid of previous bindings) previously-bound constraints.
                 *
                 * Now we need to check to see if we need to overwrite previously-specified parameters. We can do one of two things
                 * next:
                 *
                 * o If the overwriteParameter flag has been set, we will need to overwrite the value of a parameter with the value
                 *   in the provided parameter map IF that parameter exists inside the existing (i.e., previously bound) parameter
                 *   map.
                 *
                 * o If the overwriteParameter flag has not been set, we will simply copy over new parameters into the existing
                 *   parameter maps and IGNORE any new parameters that conflict with existing parameters. This means that we will
                 *   maintain the old value of those parameters.
                 */

                /** Let's get the existing parameters for this constraint **/
                var oldParameters = boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][element.id][ConstraintService.ReverseConstraint[constraintType]];

                /**
                 *  Let's copy our existing parameters into the new parameter map. We'll decide later if we're going to overwrite
                 * the existing values or not, based on the overwriteParameter flag
                 */

                for (var param in oldParameters) if (oldParameters.hasOwnProperty(param)) {
                    MapUtils.put(newParameters, param, oldParameters[param]);
                }

                if (overwriteParameters) {
                    /**
                     * Since overwriteParameter is true, if we find a parameter in definedParameters that already
                     * exists in oldParameters, we'll overwrite the old value with the new one. All this really
                     * entails is iterating over definedParameters and inserting the values into newParameters
                     */

                    for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                        MapUtils.put(newParameters, param, definedParameters[param]);
                    }

                    result = ConstraintService.verifyConstraintDefinition(element, ConstraintService.ReverseConstraint[constraintType], newParameters);

                    if (result.successful) {
                        /**
                         * Now we need to handle the overwriting of groups. We could delete this element-constraint combination out of
                         * all the old groups. But let's be smart about it and only delete it from the groups it no longer exists in
                         * (according to the new groups parameter). Since this is a destructive operation we only want to do this if
                         * the constraint-definition verification was successful.
                         */
                        overwriteGroups(element, constraintType, newParameters);
                    }
                } else {
                    /**
                     * Since overwriteParameter is false, we will only insert a parameter from definedParameters if it doesn't exist
                     * in oldParameters
                     */
                    for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                        if (!oldParameters[param]) {
                            MapUtils.put(newParameters, param, definedParameters[param]);
                        }
                    }
                }
            }


            if (result.successful) {
                result = attachConstraintDefinitionToElement(element, ConstraintService.ReverseConstraint[constraintType], newParameters);
            }
        }

        /**
         * ######
         * Restore the original groups definition
         * ######
         */
        definedParameters["groups"] = originalGroups;

        return result;
    }

    /**
     * Attaches the provided constraint along with supplied parameters, to the provided element.
     * @param element - The element that we want to constraint attached to
     * @param constraintName - The name of the constraint
     * @param definedParameters - The parameters that have been provided to the constraint
     * @returns {{successful: boolean, message: string, data: null}}
     */
    function attachConstraintDefinitionToElement(element, constraintName, definedParameters) {

        var result = {
            successful: true,
            message: "",
            data: null
        };

        //If a "groups" parameter has not been specified, we'll create one and add "Default" to it since all elements
        //belong to the "Default" group implicitly
        if (!definedParameters["groups"]) {
            MapUtils.put(definedParameters, "groups", [GroupService.ReverseGroup[GroupService.Group.Default]]);
        }

        var groups = definedParameters["groups"];

        //If a "groups" parameter was defined, but it doesn't contain the "Default" group, we add it to groupParamValue
        //explicitly and also update the "groups" parameter for this constraint
        if (groups.indexOf(GroupService.ReverseGroup[GroupService.Group.Default]) === -1) {
            groups.push(GroupService.ReverseGroup[GroupService.Group.Default]);
            definedParameters["groups"] = groups; //Not really necessary since we're going to reset this anyway
        }

        for (var i = 0; i < groups.length; i++) {

            var group = groups[i];

            if (!boundConstraints[group]) {

                var newIndex = -1;

                if (GroupService.deletedGroupIndices.length > 0) {
                    newIndex = GroupService.deletedGroupIndices.pop();
                } else {
                    newIndex = GroupService.firstCustomGroupIndex++;
                }

                GroupService.Group[group] = newIndex;
                GroupService.ReverseGroup[newIndex] = group;
                boundConstraints[group] = {};
            }

            if (!boundConstraints[group][element.id]) {
                boundConstraints[group][element.id] = {};
            }

            boundConstraints[group][element.id][constraintName] = definedParameters;
        }

        //If this is an HTML5 type constraint, let's make sure that the constraint doesn't conflict with the element's type
        //(if one has been specified) and let's attach the appropriate HTML5 attributes to the element
        if (ConstraintService.constraintDefinitions[constraintName].html5) {
            if (element.getAttribute("type") !== null && ConstraintService.constraintDefinitions[constraintName].inputType !== null && element.getAttribute("type") !== ConstraintService.constraintDefinitions[constraintName].inputType) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, constraintName, "Element type of " + element.getAttribute("type") + " conflicts with type of constraint @" + constraintName + ": " + ConstraintService.constraintDefinitions[constraintName].inputType),
                    data: null
                };
            } else {
                //We will attach HTML5 attributes ONLY if the element doesn't have them
                var attribute = ConstraintService.constraintDefinitions[constraintName].attribute;
                var inputType = ConstraintService.constraintDefinitions[constraintName].inputType;

                if ((attribute !== null && element.getAttribute(attribute) === null) ||
                    (inputType !== null && element.getAttribute("type") === null)) {
                    attachHTML5Attributes(element, constraintName, definedParameters);
                }
            }
        }

        return result;
    }

    /**
     * This function attaches HTML5 validation attributes to elements. For example, if an element has a data-constraints
     * attribute with the value "@HTML5Required @HTML5Max(value=5)", then this function will attach 'required="true"' and
     * 'max="5"' to the element. This is necessary because we delegate to the browser to perform HTML5 validation.
     *
     * @param element
     * @param constraintName
     * @param definedParameters
     */
    function attachHTML5Attributes(element, constraintName, definedParameters) {
        if (constraintName === ConstraintService.ReverseConstraint[ConstraintService.Constraint.HTML5Required]) {
            element.setAttribute("required", "true");
        } else {
            var constraint = ConstraintService.constraintDefinitions[constraintName];
            for (var i = 0; i < constraint.params.length; i++) {
                element.setAttribute(constraint.params[i], definedParameters[constraint.params[i]]);
            }

            if (ConstraintService.constraintDefinitions[constraintName].inputType !== null) {
                element.setAttribute("type", ConstraintService.constraintDefinitions[constraintName].inputType);
            }
        }

        var classes = element.getAttribute("class");

        if (!/regula-modified/.test(classes)) {
            element.setAttribute("class", classes + " regula-modified");
        }

    }

    /**
     * Performs unbinding. This is essentially the reverse of binding. Unbinding stops an element from being validated
     * (at all) or just being validated against a specific constraint. Unbinding behavior depends on the options provided.
     *
     * @param options
     */
    function unbind(options) {
        for (var i = 0; i < options.elements.length; i++) {
            var id = options.elements[i].id;

            var constraints = options.constraints || [];

            if (constraints.length == 0) {
                for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

                    if (typeof boundConstraints[group][id] !== "undefined") {
                        delete boundConstraints[group][id];

                        if (group !== "Default") {
                            removeElementAndGroupFromBoundConstraintsIfEmpty(id, group);
                        }
                    } else {
                        throw new ExceptionService.Exception.IllegalArgumentException("Element with id " + id + " does not have any constraints bound to it. " + ExceptionService.explodeParameters(options));
                    }

                }
            } else {
                for (var j = 0; j < constraints.length; j++) {
                    var constraint = constraints[j];

                    for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

                        if (typeof boundConstraints[group][id] !== "undefined") {
                            delete boundConstraints[group][id][ConstraintService.ReverseConstraint[constraint]];

                            if (group !== "Default") {
                                removeElementAndGroupFromBoundConstraintsIfEmpty(id, group);
                            }

                        } else {
                            throw new ExceptionService.Exception.IllegalArgumentException("Element with id " + id + " does not have any constraints bound to it. " + ExceptionService.explodeParameters(options));
                        }
                    }
                }
            }
        }
    }

    /**
     * Checks to see if the specified element is bound. You can further refine the check by providing groups and/or
     * constraint names.
     * @param options
     */
    function isBound(options) {

        var elementId = options.elementId;
        var group = options.group;
        var constraint = options.constraint;

        //Let's see if this element is bound at all, because if it isn't we don't even need to care about the other checks
        var bound = typeof boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][elementId] !== "undefined";

        if(bound && typeof group !== "undefined" && typeof constraint === "undefined") {
            //Let's see if the element is bound to this specific group

            var groupString = GroupService.ReverseGroup[group];
            bound = typeof groupString !== "undefined" && typeof boundConstraints[groupString][elementId] !== "undefined";

        } else if(bound && typeof group === "undefined" && typeof constraint !== "undefined") {
            //Let's see if this element is bound to this specific constraint

            var constraintString = ConstraintService.ReverseConstraint[constraint];
            bound = typeof constraintString !== "undefined" && typeof boundConstraints[GroupService.ReverseGroup[GroupService.Group.Default]][elementId][constraintString] !== "undefined";

        } else if(bound && typeof group !== "undefined" && typeof constraint !== "undefined") {
            //Let's see if this element is bound to this specific constraint in this specific group

            var groupString = GroupService.ReverseGroup[group];
            var constraintString = ConstraintService.ReverseConstraint[constraint];
            bound = typeof groupString !== "undefined" && typeof constraintString !== "undefined" && typeof boundConstraints[groupString][elementId] !== "undefined" && typeof boundConstraints[groupString][elementId][constraintString] !== "undefined";

        }

        return bound;
    }

    return {
        initializeBoundConstraints: initializeBoundConstraints,
        resetBoundConstraints: resetBoundConstraints,
        getBoundConstraints: getBoundConstraints,
        removeElementAndGroupFromBoundConstraintsIfEmpty: removeElementAndGroupFromBoundConstraintsIfEmpty,
        bindAfterParsing: bindAfterParsing,
        bindHTML5ValidationConstraints: bindHTML5ValidationConstraints,
        bindFromOptions: bindFromOptions,
        unbind: unbind,
        isBound: isBound
    };
}));