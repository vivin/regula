/*
 Regula: An annotation-based form-validation framework in Javascript
 Written By Vivin Paliath (http://vivin.net)
 License: BSD License
 Copyright (C) 2010-2011
 Version 1.2.3-SNAPSHOT
 */

/* for code completion */
var regula = {
    configure:function (options) {},
    bind:function (options) {},
    unbind:function (options) {},
    custom:function (options) {},
    compound:function (options) {},
    override:function (options) {},
    validate:function (options) {},
    Constraint:{},
    Group:{},
    DateFormat:{}
};

regula = (function () {

    /*
     Copyright Robert Nyman, http://www.robertnyman.com
     Free to use if this text is included
     */
    var getElementsByAttribute = function (oElm, strTagName, strAttributeName, strAttributeValue) {
        var arrElements = (strTagName == "*" && oElm.all) ? oElm.all : oElm.getElementsByTagName(strTagName);
        var arrReturnElements = new Array();
        var oAttributeValue = (typeof strAttributeValue !== "undefined") ? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)") : null;
        var oCurrent;
        var oAttribute;
        for (var i = 0; i < arrElements.length; i++) {
            oCurrent = arrElements[i];
            oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
            if (typeof oAttribute == "string" && oAttribute.length > 0) {
                if (typeof strAttributeValue == "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))) {
                    arrReturnElements.push(oCurrent);
                }
            }
        }
        return arrReturnElements;
    };

    /* regula code starts here */

    /*
     Configuration options
     */
    var config = {
        validateEmptyFields:true,
        debug:false
    };

    var Group = {
        Default:0
    };

    var ReverseGroup = {
        0:"Default"
    };

    /* New groups are added to our 'enum' sequentially with the help of an explicit index that is maintained separately
     (see firstCustomGroupIndex). When groups are deleted, we need to remove them from the Group 'enum'. Simply
     removing them would be fine. But what we end up with are "gaps" in the indices. For example, assume that we added
     a new group called "New". Then regula.Group.New is mapped to 1 in regula.ReverseGroup, and 1 is mapped back to "New".
     Assume that we add another group called "Newer". So now what you have Newer -> 2 -> "Newer". Let's say we delete
     the "New" group. The existing indices are 0 and 2. As you can see, there is a gap. Now although the indices
     themselves don't mean anything (and we don't rely on their actual numerical values in anyway) when you now add
     another group, the index for that group will be 3. So repeated additions and deletions of groups will keep
     incrementing the index. I am uncomfortable with this (what if it increments past MAX_INT? Unlikely, but possible
     -- it doesn't hurt to be paranoid) and so I'd like to reuse deleted indices. For this reason I'm going to maintain
     a stack of deleted-group indices. When I go to add a new group, I'll first check this stack to see if there are
     any indices there. If there are, I'll use one. Conversely, when I delete a group, I'll add its index to this stack
     */
    var deletedGroupIndices = [];

    /*
     !!!!
     Make sure you change the value of firstCustomConstraintIndex when you add new constraints!!
     !!!!
     */

    var Constraint = {
        Checked:0,
        Selected:1,
        Max:2,
        Min:3,
        Range:4,
        Between:4,
        NotBlank:5,
        NotEmpty:5,
        Blank:6,
        Empty:6,
        Pattern:7,
        Matches:7,
        Email:8,
        Alpha:9,
        IsAlpha:9,
        Numeric:10,
        IsNumeric:12,
        AlphaNumeric:11,
        IsAlphaNumeric:11,
        Integer:12,
        Real:13,
        CompletelyFilled:14,
        PasswordsMatch:15,
        Required:16,
        Length:17,
        Digits:18,
        Past:19,
        Future:20
    };

    var ReverseConstraint = {
        0:"Checked",
        1:"Selected",
        2:"Max",
        3:"Min",
        4:"Range",
        5:"NotBlank",
        6:"Blank",
        7:"Pattern",
        8:"Email",
        9:"Alpha",
        10:"Numeric",
        11:"AlphaNumeric",
        12:"Integer",
        13:"Real",
        14:"CompletelyFilled",
        15:"PasswordsMatch",
        16:"Required",
        17:"Length",
        18:"Digits",
        19:"Past",
        20:"Future"
    };

    var DateFormat = {
        DMY:"DMY",
        MDY:"MDY",
        YMD:"YMD"
    };

    var friendlyInputNames = {
        form:"The form",
        select:"The select box",
        textarea:"The text area",
        checkbox:"The checkbox",
        radio:"The radio button",
        text:"The text field",
        password:"The password"
    };

    var firstCustomConstraintIndex = 21;
    var firstCustomGroupIndex = 1;

    var constraintsMap = {
        Checked:{
            formSpecific:false,
            validator:checked,
            constraintType:Constraint.Checked,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} needs to be checked."
        },

        Selected:{
            formSpecific:false,
            validator:selected,
            constraintType:Constraint.Selected,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} needs to be selected."
        },

        Max:{
            formSpecific:false,
            validator:max,
            constraintType:Constraint.Max,
            custom:false,
            compound:false,
            params:["value"],
            defaultMessage:"{label} needs to be lesser than or equal to {value}."
        },

        Min:{
            formSpecific:false,
            validator:min,
            constraintType:Constraint.Min,
            custom:false,
            compound:false,
            params:["value"],
            defaultMessage:"{label} needs to be greater than or equal to {value}."
        },

        Range:{
            formSpecific:false,
            validator:range,
            constraintType:Constraint.Range,
            custom:false,
            compound:false,
            params:["min", "max"],
            defaultMessage:"{label} needs to be between {min} and {max}."
        },

        NotBlank:{
            formSpecific:false,
            validator:notBlank,
            constraintType:Constraint.NotBlank,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} cannot be blank."
        },

        Blank:{
            formSpecific:false,
            validator:blank,
            constraintType:Constraint.Blank,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} needs to be blank."
        },

        Pattern:{
            formSpecific:false,
            validator:matches,
            constraintType:Constraint.Pattern,
            custom:false,
            compound:false,
            params:["regex"],
            defaultMessage:"{label} needs to match {regex}{flags}."
        },

        Email:{
            formSpecific:false,
            validator:email,
            constraintType:Constraint.Email,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} is not a valid email."
        },

        Alpha:{
            formSpecific:false,
            validator:alpha,
            constraintType:Constraint.Alpha,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} can only contain letters."
        },

        Numeric:{
            formSpecific:false,
            validator:numeric,
            constraintType:Constraint.Numeric,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} can only contain numbers."
        },

        AlphaNumeric:{
            formSpecific:false,
            validator:alphaNumeric,
            constraintType:Constraint.AlphaNumeric,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} can only contain numbers and letters."
        },

        Integer:{
            formSpecific:false,
            validator:integer,
            constraintType:Constraint.Integer,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} must be an integer."
        },

        Real:{
            formSpecific:false,
            validator:real,
            constraintType:Constraint.Real,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} must be a real number."
        },

        CompletelyFilled:{
            formSpecific:true,
            validator:completelyFilled,
            constraintType:Constraint.CompletelyFilled,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} must be completely filled."
        },

        PasswordsMatch:{
            formSpecific:true,
            validator:passwordsMatch,
            constraintType:Constraint.PasswordsMatch,
            custom:false,
            compound:false,
            params:["field1", "field2"],
            defaultMessage:"Passwords do not match."
        },

        Required:{
            formSpecific:false,
            validator:required,
            constraintType:Constraint.Required,
            custom:false,
            compound:false,
            params:[],
            defaultMessage:"{label} is required."
        },

        Length:{
            formSpecific:false,
            validator:length,
            constraintType:Constraint.Length,
            custom:false,
            compound:false,
            params:["min", "max"],
            defaultMessage:"{label} length must be between {min} and {max}."
        },

        Digits:{
            formSpecific:false,
            validator:digits,
            constraintType:Constraint.Digits,
            custom:false,
            compound:false,
            params:["integer", "fraction"],
            defaultMessage:"{label} must have up to {integer} digits and {fraction} fractional digits."
        },

        Past:{
            formSpecific:false,
            validator:past,
            constraintType:Constraint.Past,
            custom:false,
            compound:false,
            params:["format"],
            defaultMessage:"{label} must be in the past."
        },

        Future:{
            formSpecific:false,
            validator:future,
            constraintType:Constraint.Future,
            custom:false,
            compound:false,
            params:["format"],
            defaultMessage:"{label} must be in the future."
        }
    };

    /*
     compositionGraph is an internal data structure that I use to keep track of composing constraints and the
     relationships between them (composing constraints can contain other composing constraints). The main use of this
     data structure is to identify cycles during composition. This can only happen during calls to regula.override.
     Since cycles in the constraint-composition graph will lead to infinite loops, I need to detect them and throw
     an exception
     */

    var compositionGraph = {
        addNode:function (type, parent) {},
        getNodeByType:function (type) {},
        cycleExists:function (startNode) {},
        getRoot:function () {},
        setRoot:function (root) {},
        clone: function () {}
    };

    compositionGraph = (function () {
        var typeToNodeMap = {};

        /* root is a special node that serves as the root of the composition tree/graph (works either way because a tree
         is a special case of a graph)
         */

        var root = {
            visited:false,
            name:"RootNode",
            type:-1,
            children:[]
        };

        function addNode(type, parent) {
            var newNode = typeToNodeMap[type] == null ? {
                visited:false,
                name:ReverseConstraint[type],
                type:type,
                children:[]
            } : typeToNodeMap[type];

            if (parent == null) {
                root.children[root.children.length] = newNode;
            }

            else {
                parent.children[parent.children.length] = newNode;
            }

            typeToNodeMap[type] = newNode;
        }

        function clone() {
            return _clone(root);
        }

        function _clone(node) {
            var cloned = {
                visited: node.visited,
                name: node.name,
                type: node.type,
                children: []
            };

            for(var i = 0; i < node.children.length; i++) {
                cloned.children[cloned.children.length] = _clone(node.children[i]);
            }

            return cloned;
        }

        function getNodeByType(type) {
            return typeToNodeMap[type];
        }

        function cycleExists(startNode) {
            var result = (function (node, path) {

                var result = {cycleExists:false, path:path};

                if (node.visited) {
                    result = {cycleExists:true, path:path};
                }

                else {
                    node.visited = true;

                    var i = 0;
                    while (i < node.children.length && !result.cycleExists) {
                        result = arguments.callee(node.children[i], path + "." + node.children[i].name);
                        i++;
                    }
                }

                return result;
            }(startNode, startNode.name));

            if (!result.cycleExists) {
                clearVisited();
            }

            return result;
        }

        function removeChildren(node) {
            node.children = [];
        }

        function clearVisited() {
            (function (node) {
                node.visited = false;
                for (var i = 0; i < node.children.length; i++) {
                    arguments.callee(node.children[i]);
                }
            }(root));
        }

        function getRoot() {
            return root;
        }

        function setRoot(newRoot) {
            root = newRoot;
        }

        return {
            addNode:addNode,
            removeChildren:removeChildren,
            getNodeByType:getNodeByType,
            cycleExists:cycleExists,
            getRoot:getRoot,
            setRoot:setRoot,
            clone:clone
        };
    })();

    var boundConstraints = null; //Keeps track of all bound constraints. Keyed by Group -> Element Id -> Constraint Name
    var validatedConstraints = {}; //Keeps track of constraints that have already been validated for a validation run. Cleared out each time validation is run.

    function initializeBoundConstraints() {
        boundConstraints = {Default:{}};
    }

    function shouldValidate(element, params) {
        var validateEmptyFields = config.validateEmptyFields;

        if(typeof params["ignoreEmpty"] !== "undefined") {
            validateEmptyFields = !params["ignoreEmpty"];
        }

        return !(blank.call(element) && !validateEmptyFields);
    }

    function checked() {
        return this.checked;
    }

    function selected() {
        return this.selectedIndex > 0;
    }

    function max(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = (parseFloat(this.value) <= parseFloat(params["value"]));
        }

        return  result;
    }

    function min(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = (parseFloat(this.value) >= parseFloat(params["value"]));
        }

        return result;
    }

    function range(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = (this.value.replace(/\s/g, "") != "" && parseFloat(this.value) <= parseFloat(params["max"]) && parseFloat(this.value) >= parseFloat(params["min"]));
        }

        return result;
    }

    function notBlank() {
        return this.value.replace(/\s/g, "") != "";
    }

    function blank() {
        return this.value.replace(/\s/g, "") === "";
    }

    function matches(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            var re;

            var regex;
            if(typeof params["regex"] === "string") {
                regex = params["regex"].replace(/^\//, "").replace(/\/$/, "")
            } else {
                regex = params["regex"];
            }

            if (typeof params["flags"] !== "undefined") {
                re = new RegExp(regex.toString().replace(/^\//, "").replace(/\/[^\/]*$/, ""), params["flags"]);
            }

            else {
                re = new RegExp(regex);
            }

            result = re.test(this.value);
        }

        return result;
    }

    function email(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(this.value);
        }

        return result;
    }

    function alpha(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /^[A-Za-z]+$/.test(this.value);
        }

        return result;
    }

    function numeric(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /^[0-9]+$/.test(this.value);
        }

        return result;
    }

    function integer(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /^-?[0-9]+$/.test(this.value);
        }

        return result;
    }

    function real(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /^-?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/.test(this.value);
        }

        return result;
    }

    function alphaNumeric(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            result = /^[0-9A-Za-z]+$/.test(this.value);
        }

        return result;
    }

    function completelyFilled() {
        var unfilledElements = [];

        for (var i = 0; i < this.elements.length; i++) {
            var element = this.elements[i];

            if (!required.call(element)) {
                unfilledElements.push(element);
            }
        }

        return unfilledElements;
    }

    function passwordsMatch(params) {
        var failingElements = [];

        var passwordField1 = document.getElementById(params["field1"]);
        var passwordField2 = document.getElementById(params["field2"]);

        if (passwordField1.value != passwordField2.value) {
            failingElements = [passwordField1, passwordField2];
        }

        return failingElements;
    }

    function required() {
        var result = true;

        if (this.tagName) {
            if (this.tagName.toLowerCase() == "select") {
                result = selected.call(this);
            }

            else if (this.type.toLowerCase() == "checkbox" || this.type.toLowerCase() == "radio") {
                result = checked.call(this);
            }

            else if (this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "textarea") {
                if (this.type.toLowerCase() != "button") {
                    result = notBlank.call(this);
                }
            }
        }

        return result;
    }

    function length(params) {
        return (this.value.length >= params["min"] && this.value.length <= params["max"]);
    }

    function digits(params) {
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
                }

                else {
                    result = true; //we don't care about the number of digits in the integer part
                }

                if (params["fraction"] > 0) {
                    result = result && parts[1].length <= params["fraction"];
                }
            }

        }

        return result;
    }

    function parseDates(params) {
        var DateFormatIndices = {
            YMD:{Year:0, Month:1, Day:2},
            MDY:{Month:0, Day:1, Year:2},
            DMY:{Day:0, Month:1, Year:2}
        };

        var dateFormatIndices = DateFormatIndices[params["format"]];

        var separator = params["separator"];
        if (typeof params["separator"] === "undefined") {
            separator = /\//.test(this.value) ? "/" :
                /\./.test(this.value) ? "." :
                    / /.test(this.value) ? " " : /[^0-9]+/;
        }

        var parts = this.value.split(separator);
        var dateToValidate = new Date(parts[dateFormatIndices.Year], parts[dateFormatIndices.Month] - 1, parts[dateFormatIndices.Day]);

        var dateToTestAgainst = new Date();
        if (typeof params["date"] !== "undefined") {
            parts = params["date"].split(separator);
            dateToTestAgainst = new Date(parts[dateFormatIndices.Year], parts[dateFormatIndices.Month] - 1, parts[dateFormatIndices.Day]);
        }

        return {dateToValidate:dateToValidate, dateToTestAgainst:dateToTestAgainst};
    }

    function past(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            var dates = parseDates.call(this, params);
            result = (dates.dateToValidate < dates.dateToTestAgainst);
        }

        return result;
    }

    function future(params) {
        var result = true;

        if (shouldValidate(this, params)) {
            var dates = parseDates.call(this, params);
            result = (dates.dateToValidate > dates.dateToTestAgainst);
        }

        return result;
    }

    function iterateOverMap(map, callback) {
        var index = 0;
        for (var property in map) if (map.hasOwnProperty(property) && property !== "__size__") {

            //the callback receives as arguments key, value, index. this is set to
            //the map that you are iterating over
            callback.call(map, property, map[property], index);
            index++;
        }
    }

    /* a meta-validator that validates member constraints of a composing constraint */

    function compoundValidator(params, currentGroup, compoundConstraint) {
        var composingConstraints = compoundConstraint.composingConstraints;
        var constraintViolations = [];

        for (var i = 0; i < composingConstraints.length; i++) {
            var composingConstraint = composingConstraints[i];
            var composingConstraintName = ReverseConstraint[composingConstraint.constraintType];

            /*
             Now we'll merge the parameters in the child constraints with the parameters from the parent
             constraint
             */

            var mergedParams = {};

            for (var paramName in composingConstraint.params) if (composingConstraint.params.hasOwnProperty(paramName) && paramName != "__size__") {
                put(mergedParams, paramName, composingConstraint.params[paramName]);
            }

            /* we're only going to override if the compound constraint was defined with required params */
            if (compoundConstraint.params.length > 0) {
                for (var paramName in params) if (params.hasOwnProperty(paramName) && paramName != "__size__") {
                    put(mergedParams, paramName, params[paramName]);
                }
            }

            var validationResult = runValidatorFor(currentGroup, this.id, composingConstraintName, mergedParams);

            if (!validationResult.constraintPassed) {
                var errorMessage = interpolateErrorMessage(this.id, composingConstraintName, mergedParams);
                var constraintViolation = {
                    group:currentGroup,
                    constraintName:composingConstraintName,
                    custom:constraintsMap[composingConstraintName].custom,
                    compound:constraintsMap[composingConstraintName].compound,
                    constraintParameters:composingConstraint.params,
                    failingElements:validationResult.failingElements,
                    message:errorMessage
                };

                if (!compoundConstraint.reportAsSingleViolation) {
                    constraintViolation.composingConstraintViolations = validationResult.composingConstraintViolations || [];
                }

                constraintViolations.push(constraintViolation);
            }
        }

        return constraintViolations;
    }

    /* this function validates a constraint definition to ensure that parameters match up */

    function validateConstraintDefinition(element, constraintName, definedParameters) {
        var result = {
            successful:true,
            message:"",
            data:null
        };

        if (element.tagName.toLowerCase() == "form" && !constraintsMap[constraintName].formSpecific) {
            result = {
                successful:false,
                message:generateErrorMessage(element, constraintName, "@" + constraintName + " is not a form constraint, but you are trying to bind it to a form"),
                data:null
            };
        }

        else if (element.tagName.toLowerCase() != "form" && constraintsMap[constraintName].formSpecific) {
            result = {
                successful:false,
                message:generateErrorMessage(element, constraintName, "@" + constraintName + " is a form constraint, but you are trying to bind it to a non-form element"),
                data:null
            };
        }

        else if ((typeof element.type == "undefined" || (element.type.toLowerCase() != "checkbox" && element.type.toLowerCase() != "radio")) && constraintName == "Checked") {
            result = {
                successful:false,
                message:generateErrorMessage(element, constraintName, "@" + constraintName + " is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button."),
                data:null
            };
        }

        else if (element.tagName.toLowerCase() != "select" && constraintName == "Selected") {
            result = {
                successful:false,
                message:generateErrorMessage(element, constraintName, "@" + constraintName + " is only applicable to select boxes. You are trying to bind it to an input element that is not a select box."),
                data:null
            };
        }

        else {
            var parameterResult = ensureAllRequiredParametersPresent(element, constraintsMap[constraintName], definedParameters);

            if (parameterResult.error) {
                result = {
                    successful:false,
                    message:parameterResult.message,
                    data:null
                };
            }

            else {
                result.data = definedParameters;
            }
        }

        return result;
    }

    function ensureAllRequiredParametersPresent(element, constraint, receivedParameters) {
        var result = {
            error:false,
            message:""
        };

        if (receivedParameters.__size__ < constraint.params.length) {
            result = {
                error:true,
                message:generateErrorMessage(element, ReverseConstraint[constraint.constraintType], "@" + ReverseConstraint[constraint.constraintType] + " expects at least " + constraint.params.length +
                    " parameter(s). However, you have provided only " + receivedParameters.__size__),
                data:null
            };
        }

        var missingParams = [];
        for (var j = 0; j < constraint.params.length; j++) {
            var param = constraint.params[j];

            if (typeof receivedParameters[param] == "undefined") {
                missingParams.push(param);
            }
        }

        if (missingParams.length > 0) {
            result = {
                error:true,
                message:generateErrorMessage(element, ReverseConstraint[constraint.constraintType], "You seem to have provided some optional or required parameters for @" + ReverseConstraint[constraint.constraintType] +
                    ", but you are still missing the following " + missingParams.length + " required parameter(s): " + explode(missingParams, ", ")),
                data:null
            };
        }

        return result;
    }

    /* this function creates a constraint and binds it to the element specified using the constraint name and defined parameters */

    function createConstraintFromDefinition(element, constraintName, definedParameters) {
        var groupParamValue = "";

        //Regex that checks to see if Default is explicitly defined in the groups parameter
        var re = new RegExp("^" + ReverseGroup[Group.Default] + "$|" + "^" + ReverseGroup[Group.Default] + ",|," + ReverseGroup[Group.Default] + ",|," + ReverseGroup[Group.Default] + "$");

        var result = {
            successful:true,
            message:"",
            data:null
        };

        //If a "groups" parameter has not been specified, we'll create one and add "Default" to it since all elements
        //belong to the "Default" group implicitly
        if (!definedParameters["groups"]) {
            put(definedParameters, "groups", ReverseGroup[Group.Default]);
        }

        groupParamValue = definedParameters["groups"].replace(/\s/g, "");

        //If a "groups" parameter was defined, but it doesn't contain the "Default" group, we add it to groupParamValue
        //explicitly and also update the "groups" parameter for this constraint
        if (!re.test(groupParamValue)) {
            groupParamValue = ReverseGroup[Group.Default] + "," + groupParamValue;
            definedParameters["groups"] = groupParamValue;
        }

        var groups = groupParamValue.split(/,/);

        for (var i = 0; i < groups.length; i++) {

            var group = groups[i];

            if (!boundConstraints[group]) {

                var newIndex = -1;

                if (deletedGroupIndices.length > 0) {
                    newIndex = deletedGroupIndices.pop();
                }

                else {
                    newIndex = firstCustomGroupIndex++;
                }

                Group[group] = newIndex;
                ReverseGroup[newIndex] = group;
                boundConstraints[group] = {};
            }

            if (!boundConstraints[group][element.id]) {
                boundConstraints[group][element.id] = {};
            }

            boundConstraints[group][element.id][constraintName] = definedParameters;
        }
    }

    /* a few basic utility functions */

    function exists(array, value) {
        var found = false;
        var i = 0;

        while (!found && i < array.length) {
            found = value == array[i];
            i++;
        }

        return found;
    }

    function explode(array, delimeter) {
        var str = "";

        for (var i = 0; i < array.length; i++) {
            str += array[i] + delimeter;
        }

        return str.replace(new RegExp(delimeter + "$"), "");
    }

    function put(map, key, value) {
        if (!map.__size__) {
            map.__size__ = 0;
        }

        if (!map[key]) {
            map.__size__++;
        }

        map[key] = value;
    }

    function isMapEmpty(map) {
        for (var key in map) if (map.hasOwnProperty(key)) {
            return false;
        }

        return true;
    }

    function explodeParameters(options) {
        var str = "Function received: {";
        for (var argument in options) if (options.hasOwnProperty(argument)) {

            if (typeof options[argument] == "string") {
                str += argument + ": " + options[argument] + ", ";
            }

            else if (options[argument].length) { //we need this to be an array
                str += argument + ": [" + explode(options[argument], ", ") + "], "
            }
        }

        str = str.replace(/, $/, "") + "}";
        return str;
    }

    function generateErrorMessage(element, constraintName, message) {
        var errorMessage = "";

        if (element != null) {
            errorMessage = element.id;

            if (constraintName == "" || constraintName == null || constraintName == undefined) {
                errorMessage += ": ";
            }

            else {
                errorMessage += "." + constraintName + ": ";
            }
        }

        else {
            if (constraintName != "" && constraintName != null && constraintName != undefined) {
                errorMessage = "@" + constraintName + ": "
            }
        }

        return errorMessage + message;
    }

    function removeElementAndGroupFromConstraintsIfEmpty(id, group) {
        if (isMapEmpty(boundConstraints[group][id])) {
            delete boundConstraints[group][id];

            if (isMapEmpty(boundConstraints[group])) {
                delete boundConstraints[group];

                var groupIndex = Group[group];
                delete Group[group];
                delete ReverseGroup[groupIndex];

                deletedGroupIndices.push(groupIndex);
            }
        }
    }

    /*
     * This is the parser that parses constraint definitions. The recursive-descent parser is actually defined inside
     * the 'parse' function (I've used inner functions to encapsulate the parsing logic).
     *
     * The parse function also contains a few other utility functions that are only related to parsing
     */

    function parse(element, constraintDefinitionString) {
        var currentConstraintName = "";
        var tokens = tokenize({
            str:trim(constraintDefinitionString.replace(/\s*\n\s*/g, "")),
            delimiters:"@()[]=,\"\\/-\\.",
            returnDelimiters:true,
            returnEmptyTokens:false
        });

        return constraints(tokens);

        /** utility functions. i.e., functions not directly related to parsing start here **/

        function trim(str) {
            return str ? str.replace(/^\s+/, "").replace(/\s+$/, "") : "";
        }

        function peek(arr) {
            return arr[0];
        }

        function tokenize(options) {
            var str = options.str;
            var delimiters = options.delimiters.split("");
            var returnDelimiters = options.returnDelimiters || false;
            var returnEmptyTokens = options.returnEmptyTokens || false;
            var tokens = [];
            var lastTokenIndex = 0;

            for (var i = 0; i < str.length; i++) {
                if (exists(delimiters, str.charAt(i))) {
                    var token = str.substring(lastTokenIndex, i);

                    if (token.length == 0) {
                        if (returnEmptyTokens) {
                            tokens.push(token);
                        }
                    }

                    else {
                        tokens.push(token);
                    }

                    if (returnDelimiters) {
                        tokens.push(str.charAt(i));
                    }

                    lastTokenIndex = i + 1;
                }
            }

            if (lastTokenIndex < str.length) {
                var token = str.substring(lastTokenIndex, str.length);

                if (token.length == 0) {
                    if (returnEmptyTokens) {
                        tokens.push(token);
                    }
                }

                else {
                    tokens.push(token);
                }
            }

            return tokens;
        }

        /** the recursive-descent parser starts here **/
        /** it parses according to the following EBNF **/

        /*
         constraints            ::= { constraint }
         constraint             ::= "@", constraint-def
         constraint-def         ::= constraint-name, param-def
         constraint-name        ::= valid-starting-char { valid-char }
         valid-starting-char    ::= [A-Za-z_]
         valid-char             ::= [0-9A-Za-z_]
         param-def              ::= [ "(", [ param { ",", param } ], ")" ]
         param                  ::= param-name, "=", param-value
         param-name             ::= valid-starting-char { valid-char }
         param-value            ::= number | quoted-string | regular-expression | boolean | group-definition
         number                 ::= positive | negative
         negative               ::= "-", positive
         positive               ::= integer, [ fractional ] | fractional
         integer                ::= digit { digit }
         fractional             ::= ".", integer
         quoted-string          ::= "\"", { char }, "\""
         boolean                ::= true | false
         char                   ::= .
         regular-expression     ::= "/", { char }, "/"
         group-definition       ::= "[", [ group { ",", group } ] "]"
         group                  ::= valid-starting-char { valid-char }

         */

        function constraints(tokens) {
            var result = {
                successful:true,
                message:"",
                data:null
            };

            while (tokens.length > 0 && result.successful) {
                result = constraint(tokens);
            }

            return result;
        }

        function constraint(tokens) {
            var result = {
                successful:true,
                message:"",
                data:null
            };

            var token = tokens.shift();

            //get rid of spaces if any
            if (trim(token).length == 0) {
                token = tokens.shift();
            }

            if (token == "@") {
                result = constraintDef(tokens)
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid constraint. Constraint definitions need to start with '@'") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function constraintDef(tokens) {
            var alias = {
                Between:"Range",
                Matches:"Pattern",
                Empty:"Blank",
                NotEmpty:"NotBlank",
                IsAlpha:"Alpha",
                IsNumeric:"Integer",
                IsAlphaNumeric:"AlphaNumeric"
            };

            var result = constraintName(tokens);

            if (result.successful) {
                currentConstraintName = result.data;

                currentConstraintName = alias[currentConstraintName] ? alias[currentConstraintName] : currentConstraintName;

                if (constraintsMap[currentConstraintName]) {
                    result = paramDef(tokens);

                    if (result.successful) {
                        result = validateConstraintDefinition(element, currentConstraintName, result.data);

                        if (result.successful) {
                            createConstraintFromDefinition(element, currentConstraintName, result.data);
                        }
                    }
                }

                else {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it") + " " + result.message,
                        data:null
                    };
                }
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid constraint name in constraint definition") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function constraintName(tokens) {
            var token = trim(tokens.shift());
            var result = validStartingCharacter(token.charAt(0));

            if (result.successful) {
                var i = 1;
                while (i < token.length && result.successful) {
                    result = validCharacter(token.charAt(i));
                    i++;
                }

                if (result.successful) {
                    result.data = token;
                }
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid starting character for constraint name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data:null
                };
            }


            return result;
        }

        function validStartingCharacter(character) {
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (!/[A-Za-z_]/.test(character) || typeof character === "undefined" || character == null) {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid starting character"),
                    data:null
                };
            }

            return result;
        }

        function validCharacter(character) {
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (!/[0-9A-Za-z_]/.test(character)) {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid character in identifier. Can only include 0-9, A-Z, a-z, and _") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function paramDef(tokens) {
            var result = {
                successful:true,
                message:"",
                data:{}
            };

            if (peek(tokens) == "(") {
                tokens.shift(); // get rid of the (

                var data = {};

                if (peek(tokens) == ")") {
                    tokens.shift(); //get rid of the )
                }

                else {
                    result = param(tokens);

                    if (result.successful) {
                        put(data, result.data.name, result.data.value);

                        //get rid of spaces
                        if (trim(peek(tokens)).length == 0) {
                            tokens.shift();
                        }

                        while (tokens.length > 0 && peek(tokens) == "," && result.successful) {

                            tokens.shift();
                            result = param(tokens);

                            if (result.successful) {
                                put(data, result.data.name, result.data.value);

                                //get rid of spaces;
                                if (trim(peek(tokens)).length == 0) {
                                    tokens.shift();
                                }
                            }
                        }

                        if (result.successful) {
                            var token = tokens.shift();

                            //get rid of spaces
                            if (trim(token).length == 0) {
                                token = tokens.shift();
                            }

                            if (token != ")") {
                                result = {
                                    successful:false,
                                    message:generateErrorMessage(element, currentConstraintName, "Cannot find matching closing ) in parameter list") + " " + result.message,
                                    data:null
                                };
                            }

                            else {
                                result.data = data;
                            }
                        }
                    }

                    else {
                        result = {
                            successful:false,
                            message:generateErrorMessage(element, currentConstraintName, "Invalid parameter definition") + " " + result.message,
                            data:null
                        };
                    }
                }
            }

            else if (peek(tokens) !== undefined && peek(tokens) != "@") {
                //The next token MUST be a @ if we are expecting further constraints
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Unexpected character '" + peek(tokens) + "'" + " after constraint definition") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function param(tokens) {
            var result = paramName(tokens);

            if (result.successful) {
                var parameterName = result.data;
                var token = tokens.shift();

                if (token == "=") {
                    result = paramValue(tokens);

                    if (result.successful) {
                        result.data = {
                            name:parameterName,
                            value:result.data
                        };
                    }

                    else {
                        result = {
                            successful:false,
                            message:generateErrorMessage(element, currentConstraintName, "Invalid parameter value") + " " + result.message,
                            data:null
                        };
                    }
                }

                else {
                    tokens.unshift(token);
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "'=' expected after parameter name" + " " + result.message),
                        data:null
                    };
                }
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid parameter name. You might have unmatched parentheses") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function paramName(tokens) {
            var token = trim(tokens.shift());

            //get rid of space
            if (token.length == 0) {
                token = tokens.shift();
            }

            var result = {
                successful:false,
                message:generateErrorMessage(element, currentConstraintName, "Invalid starting character for parameter name. Can only include A-Z, a-z, and _"),
                data:null
            };

            if (typeof token !== "undefined") {
                result = validStartingCharacter(token.charAt(0));

                if (result.successful) {
                    var i = 1;
                    while (i < token.length && result.successful) {
                        result = validCharacter(token.charAt(i));
                        i++;
                    }

                    if (result.successful) {
                        result.data = token;
                    }
                }

                else {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "Invalid starting character for parameter name. Can only include A-Z, a-z, and _") + " " + result.message,
                        data:null
                    };
                }
            }

            return result;
        }

        function paramValue(tokens) {

            //get rid of spaces
            if (trim(peek(tokens)).length == 0) {
                tokens.shift();
            }

            var result = {
                successful:true,
                message:"",
                data:[]
            };

            if (peek(tokens) == ")") {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Parameter value expected") + " " + result.message,
                    data:null
                };
            }

            else {
                result = number(tokens);

                var message = result.message;

                if (!result.successful) {
                    result = quotedString(tokens);

                    result.message = result.message + " " + message;
                    message = result.message;

                    if (!result.successful) {
                        result = regularExpression(tokens);

                        result.message = result.message + " " + message;
                        message = result.message;

                        if (!result.successful) {
                            result = booleanValue(tokens);

                            result.message = result.message + " " + message;
                            message = result.message;

                            if (!result.successful) {
                                result = groupDefinition(tokens);

                                result.message = result.message + " " + message;
                                message = result.message;

                                if (!result.successful) {
                                    result = {
                                        successful:false,
                                        message:generateErrorMessage(element, currentConstraintName, "Parameter value must be a number, quoted string, regular expression, or a boolean") + " " + message,
                                        data:null
                                    };
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        function number(tokens) {
            var result = negative(tokens);

            if (!result.successful) {
                result = positive(tokens);

                if (!result.successful) {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "Parameter value is not a number") + " " + result.message,
                        data:null
                    };
                }
            }

            return result;
        }

        function negative(tokens) {
            var token = tokens.shift();
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (token == "-") {
                result = positive(tokens);
                if (result.successful) {
                    result.data = token + result.data;
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a negative number"),
                    data:null
                };
            }

            return result;
        }

        function positive(tokens) {

            var result = null;

            if (peek(tokens) != ".") {
                result = integer(tokens);

                if (peek(tokens) == ".") {
                    var integerPart = result.data;

                    result = fractional(tokens);

                    if (result.successful) {
                        result.data = integerPart + result.data;
                    }

                }
            }

            else {
                result = fractional(tokens);
            }

            if (!result.successful) {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a positive number") + " " + result.message,
                    data:null
                };
            }

            return result;
        }

        function fractional(tokens) {

            var token = tokens.shift(); //get rid of the .
            var result = integer(tokens);

            if (result.successful) {
                result.data = token + result.data;
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a valid fraction"),
                    data:null
                };
            }

            return result;
        }

        function integer(tokens) {
            var token = trim(tokens.shift());
            var result = digit(token.charAt(0));

            if (result.successful) {
                var i = 1;
                while (i < token.length && result.successful) {
                    result = digit(token.charAt(i));
                    i++;
                }

                if (result.successful) {
                    result.data = token;
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a valid integer") + " " + result.message,
                    data:[]
                };
            }

            return result;
        }

        function digit(character) {
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (!/[0-9]/.test(character)) {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a valid digit"),
                    data:null
                };
            }

            return result;
        }

        function quotedString(tokens) {
            var token = tokens.shift();
            var data = "";
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (token == "\"") {
                var done = false;

                while (tokens.length > 0 && result.successful && !done) {

                    if (peek(tokens) == "\"") {
                        done = true;
                        tokens.shift(); //get rid of "
                    }

                    else {
                        result = character(tokens);
                        data += result.data;
                    }
                }

                if (!done) {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "Unterminated string literal"),
                        data:null
                    };
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid quoted string"),
                    data:null
                };
            }

            // This boolean expression is the result of the simplification of the following truth table:
            // S | D | R
            // 1 | 0 | 0
            // 1 | 1 | 1 << what we need
            // 0 | 0 | 0
            // 0 | 1 | 0

            result.successful = result.successful && done;
            result.data = data;
            return result;
        }

        function character(tokens) {
            var data = "";
            var token = tokens.shift();

            if (token == "\\") {
                data = tokens.shift();
            }

            return {
                successful:true,
                message:"",
                data:token + data
            }; //match any old character
        }

        function regularExpression(tokens) {
            var data = "";
            var token = tokens.shift();
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (token == "/") {
                data = token;
                var done = false;

                while (tokens.length > 0 && result.successful && !done) {

                    if (peek(tokens) == "/") {
                        data += tokens.shift();
                        done = true;
                    }

                    else {
                        result = character(tokens);
                        data += result.data;
                    }
                }

                if (!done) {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "Unterminated regex literal"),
                        data:null
                    };
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a regular expression"),
                    data:null
                };
            }

            result.successful = result.successful && done;
            result.data = data;
            return result;
        }

        function booleanValue(tokens) {
            var token = tokens.shift();
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (trim(token) == "true" || trim(token) == "false") {
                result = {
                    successful:true,
                    message:"",
                    data:!!(token === "true")
                };
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a boolean"),
                    data:null
                };
            }

            return result;
        }

        function groupDefinition(tokens) {
            var data = "";
            var token = tokens.shift();
            var result = {
                successful:true,
                message:"",
                data:null
            };

            if (token == "[") {

                //get rid of spaces
                if (trim(peek(tokens)).length == 0) {
                    tokens.shift();
                }

                if (peek(tokens) == "]") {
                    result = {
                        successful:true,
                        message:"",
                        data:""
                    };
                }

                else {
                    result = group(tokens);
                }

                if (result.successful) {
                    data = result.data;

                    //get rid of spaces
                    if (trim(peek(tokens)).length == 0) {
                        tokens.shift();
                    }

                    while (tokens.length > 0 && peek(tokens) == "," && result.successful) {
                        tokens.shift();
                        result = group(tokens);

                        data += "," + result.data;

                        if (trim(peek(tokens)).length == 0) {
                            tokens.shift();
                        }
                    }

                    result.data = data;

                    token = tokens.shift();

                    //get rid of spaces
                    if (trim(token).length == 0) {
                        tokens.shift();
                    }

                    if (token != "]") {
                        result = {
                            successful:false,
                            message:generateErrorMessage(element, currentConstraintName, "Cannot find matching closing ] in group definition") + " " + result.message,
                            data:null
                        };
                    }
                }

                else {
                    result = {
                        successful:false,
                        message:generateErrorMessage(element, currentConstraintName, "Invalid group definition") + " " + result.message,
                        data:null
                    };
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Not a valid group definition"),
                    data:null
                };
            }

            return result;
        }

        function group(tokens) {
            var result = {
                successful:true,
                message:"",
                data:""
            };

            var token = trim(tokens.shift());

            //get rid of space
            if (token.length == 0) {
                token = tokens.shift();
            }

            result = validStartingCharacter(token.charAt(0));

            if (result.successful) {
                var i = 1;
                while (i < token.length && result.successful) {
                    result = validCharacter(token.charAt(i));
                    i++;
                }

                if (result.successful) {
                    result.data = token;
                }
            }

            else {
                result = {
                    successful:false,
                    message:generateErrorMessage(element, currentConstraintName, "Invalid starting character for group name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data:null
                };
            }

            return result;
        }
    }

    function custom(options) {

        if (!options) {
            throw "regula.custom expects options";
        }

        var name = options.name;
        var formSpecific = options.formSpecific || false;
        var validator = options.validator;
        var params = options.params || [];
        var defaultMessage = options.defaultMessage || "";

        /* handle attributes. throw exceptions if they are not sane */

        /* name attribute*/
        if (!name) {
            throw "regula.custom expects a name attribute in the options argument";
        }

        else if (typeof name != "string") {
            throw "regula.custom expects the name attribute in the options argument to be a string";
        }

        else if (name.replace(/\s/g, "").length == 0) {
            throw "regula.custom cannot accept an empty string for the name attribute in the options argument";
        }

        /* formSpecific attribute */
        if (typeof formSpecific != "boolean") {
            throw "regula.custom expects the formSpecific attribute in the options argument to be a boolean";
        }

        /* validator attribute */
        if (!validator) {
            throw "regula.custom expects a validator attribute in the options argument";
        }

        else if (typeof validator != "function") {
            throw "regula.custom expects the validator attribute in the options argument to be a function";
        }

        /* params attribute */
        if (params.constructor.toString().indexOf("Array") < 0) {
            throw "regula.custom expects the params attribute in the options argument to be an array";
        }

        /* defaultMessage attribute */
        if (typeof defaultMessage != "string") {
            throw "regula.custom expects the defaultMessage attribute in the options argument to be a string";
        }

        if (constraintsMap[name]) {
            throw "There is already a constraint called " + name + ". If you wish to override this constraint, use regula.override";
        }

        else {
            Constraint[name] = firstCustomConstraintIndex;
            ReverseConstraint[firstCustomConstraintIndex++] = name;
            constraintsMap[name] = {
                formSpecific:formSpecific,
                validator:validator,
                constraintType:Constraint[name],
                custom:true,
                compound:false,
                params:params,
                defaultMessage:defaultMessage
            };
        }
    }

    function compound(options) {

        if (!options) {
            throw "regula.compound expects options";
        }

        var name = options.name;
        var constraints = options.constraints || [];
        var formSpecific = options.formSpecific || false;
        var defaultMessage = options.defaultMessage || "";
        var params = options.params || [];
        var reportAsSingleViolation = typeof options.reportAsSingleViolation == "undefined" ? false : options.reportAsSingleViolation;

        if (!name) {
            throw "regula.compound expects a name attribute in the options argument";
        }

        if (typeof name != "string") {
            throw "regula.compound expects name to be a string parameter";
        }

        /* params attribute */
        if (params.constructor.toString().indexOf("Array") < 0) {
            throw "regula.compound expects the params attribute in the options argument to be an array";
        }

        if (constraints.length == 0) {
            throw "regula.compound expects an array of composing constraints under a constraints attribute in the options argument";
        }

        if (constraintsMap[name]) {
            throw "regula.compound: There is already a constraint called " + name + ". If you wish to override this constraint, use regula.override";
        }

        checkComposingConstraints(name, constraints, params);

        Constraint[name] = firstCustomConstraintIndex;
        ReverseConstraint[firstCustomConstraintIndex++] = name;
        constraintsMap[name] = {
            formSpecific:formSpecific,
            constraintType:Constraint[name],
            custom:true,
            compound:true,
            params:params,
            reportAsSingleViolation:reportAsSingleViolation,
            composingConstraints:constraints,
            defaultMessage:defaultMessage,
            validator:compoundValidator
        };

        /* now let's update our graph */
        updateCompositionGraph(name, constraints);
    }

    function updateCompositionGraph(constraintName, composingConstraints) {
        var graphNode = compositionGraph.getNodeByType(Constraint[constraintName]);

        if (graphNode == null) {
            compositionGraph.addNode(Constraint[constraintName], null);
            graphNode = compositionGraph.getNodeByType(Constraint[constraintName]);
        }

        //First we have to remove the existing children
        compositionGraph.removeChildren(graphNode);
        for (var i = 0; i < composingConstraints.length; i++) {
            var composingConstraintName = ReverseConstraint[composingConstraints[i].constraintType];
            var composingConstraint = constraintsMap[composingConstraintName];

            if (composingConstraint.compound) {
                compositionGraph.addNode(composingConstraint.constraintType, graphNode);
            }
        }
    }

    function checkComposingConstraints(name, constraints, params) {
        var constraintList = [];

        for (var i = 0; i < constraints.length; i++) {
            if (typeof constraints[i].constraintType === "undefined") {
                throw "In compound constraint " + name + ": A composing constraint has no constraint type specified."
            }

            else {
                constraintList.push(constraintsMap[ReverseConstraint[constraints[i].constraintType]]);
            }
        }

        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            var constraintName = ReverseConstraint[constraint.constraintType];
            var definedParameters = {__size__:0};

            constraint.params = constraint.params || {};

            for (var paramName in constraint.params) if (constraint.params.hasOwnProperty(paramName)) {
                put(definedParameters, paramName, constraint.params[paramName]);
            }

            /* We need a __size__ property for the params object in constraint, so let's add it */
            var size = 0;
            for(var param in constraint.params) if(constraint.params.hasOwnProperty(param)) {
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
                put(definedParameters, params[j], null);
            }

            var result = ensureAllRequiredParametersPresent(null, constraintsMap[constraintName], definedParameters);

            if (result.error) {
                throw "In compound constraint " + name + ": " + result.message;
            }
        }
    }

    function override(options) {

        if (!options) {
            throw "regula.override expects options";
        }

        if (typeof options.constraintType == "undefined") {
            throw "regula.override expects a valid constraintType attribute in the options argument";
        }

        var name = ReverseConstraint[options.constraintType];
        if (typeof name === "undefined") {
            throw "regula.override: I could not find the specified constraint. Perhaps it has not been defined? Function received: " + explodeParameters(options);
        }

        else {
            /* for custom constraints, you can override anything. for built-in constraints however, you can only override the default message */
            var formSpecific = constraintsMap[name].formSpecific;
            if(constraintsMap[name].custom) {
                formSpecific = (typeof options.formSpecific === "undefined") ? constraintsMap[name].formSpecific : options.formSpecific;
            }

            var validator = constraintsMap[name].custom && !constraintsMap[name].compound ? options.validator || constraintsMap[name].validator : constraintsMap[name].validator;
            var params = constraintsMap[name].custom ? options.params || constraintsMap[name].params : constraintsMap[name].params;
            var defaultMessage = options.defaultMessage || constraintsMap[name].defaultMessage;
            var compound = constraintsMap[name].compound;
            var composingConstraints = options.constraints || constraintsMap[name].constraints;

            if (typeof formSpecific != "boolean") {
                throw "regula.override expects the formSpecific attribute in the options argument to be a boolean";
            }

            if (typeof validator != "function") {
                throw "regula.override expects the validator attribute in the options argument to be a function";
            }

            if (!(params instanceof Array)) {
                throw "regula.override expects the params attribute in the options argument to be an array";
            }

            if (typeof defaultMessage != "string") {
                throw "regula.override expects the defaultMessage attribute in the options argument to be a string";
            }

            if (compound) {
                checkComposingConstraints(name, composingConstraints, params);

                /* Typically a user should fix their code when they see a cyclical-composition error from regula.override().
                 * If the error is ignored and validation is carried out however, we can get into an infinite loop because we
                 * modified the graph to contain a cycle. A more robust solution would be to clone the composition graph and
                 * restore it if we find out that it contains a cycle
                 */
                var root = compositionGraph.clone();

                /* now let's update our graph */
                updateCompositionGraph(name, composingConstraints);

                /* we need to see if a cycle exists in our graph */
                var result = compositionGraph.cycleExists(compositionGraph.getNodeByType(options.constraintType));

                if (result.cycleExists) {
                    compositionGraph.setRoot(root);
                    throw "regula.override: The overriding composing-constraints you have specified have created a cyclic composition: " + result.path;
                }
            }

            constraintsMap[name] = {
                formSpecific:formSpecific,
                constraintType:Constraint[name],
                custom:true,
                compound:compound,
                params:params,
                composingConstraints:composingConstraints,
                defaultMessage:defaultMessage,
                validator:validator
            };
        }
    }

    function unbind(options) {

        if (typeof options == "undefined" || !options) {
            initializeBoundConstraints();
        }

        else {
            if (typeof options.elementId == "undefined") {
                throw "regula.unbind requires an id if options are provided";
            }

            var id = options.elementId;
            var constraints = options.constraints || [];

            if (constraints.length == 0) {
                for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

                    if(typeof boundConstraints[group][id] !== "undefined") {
                        delete boundConstraints[group][id];

                        if(group !== "Default") {
                            removeElementAndGroupFromConstraintsIfEmpty(id, group);
                        }
                    } else {
                        throw "Element with id " + id + " does not have any constraints bound to it. " + explodeParameters(options);
                    }

                }
            }

            else {
                for (var i = 0; i < constraints.length; i++) {
                    var constraint = constraints[i];

                    for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

                        if(typeof boundConstraints[group][id] !== "undefined") {
                            delete boundConstraints[group][id][ReverseConstraint[constraint]];

                            if(group !== "Default") {
                                removeElementAndGroupFromConstraintsIfEmpty(id, group);
                            }

                        } else {
                            throw "Element with id " + id + " does not have any constraints bound to it. " + explodeParameters(options);
                        }
                    }
                }
            }
        }
    }

    function configure(options) {
        iterateOverMap(options, function (key, value, index) {
            if (typeof config[key] !== "undefined") {
                config[key] = value;
            }
        });
    }

    function bind(options) {

        if (!boundConstraints) {
            initializeBoundConstraints();
        }

        var result = {
            successful:true,
            message:"",
            data:null
        };

        if (typeof options == "undefined" || !options) {
            initializeBoundConstraints();
            result = bindAfterParsing();
        }

        else {
            var elements = options.elements;

            if (typeof elements === "undefined" || !elements) {
                result = bindFromOptions(options);
            }

            else {
                result = bindFromOptionsWithElements(options, elements);
            }
        }

        if (!result.successful) {
            throw result.message;
        }
    }

    function bindFromOptionsWithElements(options, elements) {

        var result = {
            successful:true
        };

        var i = 0;
        while (result.successful && i < elements.length) {

            options.element = elements[i];
            result = bindFromOptions(options);

            if (!result.successful) {
                result.message = "regula.bind: Element " + (i + 1) + " of " + elements.length + " failed: " + result.message;
            }

            i++;
        }

        return result;
    }


    function bindAfterParsing(element) {
        var elementsWithRegulaValidation;

        if (typeof element === "undefined") {
            elementsWithRegulaValidation = getElementsByAttribute(document.body, "*", "data-constraints");
        }

        else {
            elementsWithRegulaValidation = [element];
        }

        var result = {
            successful:true,
            message:"",
            data:null
        };

        var i = 0;
        while (i < elementsWithRegulaValidation.length && result.successful) {
            var element = elementsWithRegulaValidation[i];
            var tagName = element.tagName.toLowerCase();

            if (tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
                result = {
                    successful:false,
                    message:tagName + "#" + element.id + " is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements.",
                    data:null
                };
            } else {
                // automatically assign an id if the element does not have one
                if (!element.id) {
                    element.id = "regula-generated-" + Math.floor(Math.random() * 1000000);
                }

                var dataConstraintsAttribute = element.getAttribute("data-constraints");
                result = parse(element, dataConstraintsAttribute);

                i++;
            }
        }

        return result;
    }

    function bindFromOptions(options) {

        var result = {
            successful:true,
            message:"",
            data:null
        };

        var element = options.element;
        var constraints = options.constraints || [];
        var tagName = (element && element.tagName) ? element.tagName.toLowerCase() : null;

        if (!element) {
            result = {
                successful:false,
                message:"regula.bind expects a non-null element attribute in the options argument. " + explodeParameters(options),
                data:null
            };
        }

        else if (element.nodeType !== 1) { //Must be an HTMLElement
            result = {
                successful:false,
                message:"regula.bind: element attribute is expected to be an HTMLElement, but was of unexpected type: " + typeof element + ". " + explodeParameters(options),
                data:null
            };
        }

        else if (tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
            result = {
                successful:false,
                message:tagName + "#" + element.id + " is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements. " + explodeParameters(options),
                data:null
            };
        }

        else {
            if (constraints.length > 0) {
                var i = 0;
                while (i < constraints.length && result.successful) {
                    result = bindFromConstraintDefinition(constraints[i], options);
                    i++;
                }
            }

            else {
                result = bindAfterParsing(element);
            }
        }

        return result;
    }

    function bindFromConstraintDefinition(constraint, options) {

        //a few inner utility-functions

        //returns union of first and second set
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

        //subtract second set from first
        function subtract(second, first) {
            var difference = [];

            for (var i = 0; i < first.length; i++) {
                if (!exists(second, first[i])) {
                    difference.push(first[i]);
                }
            }

            return difference;
        }

        //handles the overwriting of groups which needs some special logic
        function overwriteGroups(element, constraintType, definedParameters) {
            var oldGroups = boundConstraints[ReverseGroup[Group.Default]][element.id][ReverseConstraint[constraintType]]["groups"].split(/,/);

            var newGroups = [];

            if (definedParameters["groups"]) {
                newGroups = definedParameters["groups"].split(/,/);
            }

            else {
                newGroups.push(ReverseGroup[Group.Default]);
            }

            /* If the list of groups does not contain the "Default" group, let's add it because we don't want to delete it if
             the user did not specify it
             */
            if (!exists(newGroups, ReverseGroup[Group.Default])) {
                newGroups.push(ReverseGroup[Group.Default]);
            }

            var groupsToRemoveConstraintFrom = subtract(newGroups, union(oldGroups, newGroups));

            for (var i = 0; i < groupsToRemoveConstraintFrom.length; i++) {
                var group = groupsToRemoveConstraintFrom[i];

                delete boundConstraints[group][element.id][ReverseConstraint[constraintType]];
                removeElementAndGroupFromConstraintsIfEmpty(element.id, group);
            }
        }

        var result = {
            successful:true,
            message:"",
            data:null
        };

        var element = options.element;
        var overwriteConstraint = constraint.overwriteConstraint || false;
        var overwriteParameters = constraint.overwriteParameters || false;
        var constraintType = constraint.constraintType;
        var definedParameters = constraint.params || {};
        var newParameters = {__size__:0};

        /* We check to see if this was a valid/defined constraint. It wasn't so we need to return an error message */
        if (typeof constraintType == "undefined") {
            result = {
                successful:false,
                message:"regula.bind expects a valid constraint type for each constraint in constraints attribute of the options argument. " + explodeParameters(options),
                data:null
            };
        }

        /* we also need to make sure groups make sense (if we got any) */
        else if (definedParameters && definedParameters["groups"]) {

            if (definedParameters["groups"] instanceof Array) {

                /* We need to normalize the "groups" parameter that the user sends in. The user sends in the groups parameter as an array of 'enum'
                 values, or if it is a new constraint, a string. We need to normalize this into a string of comma-separated values. While we're
                 doing this, we'll also check to see if we have any invalid groups
                 */
                var definedGroups = "";
                var j = 0;

                while (j < definedParameters["groups"].length && result.successful) {

                    if (typeof definedParameters["groups"][j] == "string") {
                        definedGroups += definedParameters["groups"][j] + ","
                    }

                    else if (typeof ReverseGroup[definedParameters["groups"][j]] !== "undefined") {
                        definedGroups += ReverseGroup[definedParameters["groups"][j]] + ","
                    }

                    else {
                        result = {
                            successful:false,
                            message:"Invalid group: " + definedParameters["groups"][j] + ". " + explodeParameters(options),
                            data:null
                        };
                    }

                    j++;
                }

                if (result.successful) {
                    definedGroups = definedGroups.replace(/,$/, "");
                    definedParameters["groups"] = definedGroups;
                }
            }

            else {
                result = {
                    successful:false,
                    message:"The groups parameter must be an array of enums or strings " + explodeParameters(options),
                    data:null
                };
            }
        }

        if (result.successful) {
            /*
             We check to see if this element-constraint combination does NOT exist. We can say that the combination does NOT exist if
             o The element's id does not exist as a key within the Default group (every element is added to the default group regardless)
             OR IF
             o The element's id exists within the Default group, but this particular constraint has not been bound to it
             If either of these conditions were met, we can simply proceed to validate the constraint definition and then add it if it is valid

             We also have to do one more thing. definedParameters has no '__size__' property. So we need to essentially copy that information
             into newParameters using the put function so that can have a '__size__' property (we will need it when we validate this constraint
             definition)
             */

            if (!boundConstraints[ReverseGroup[Group.Default]][element.id] || !boundConstraints[ReverseGroup[Group.Default]][element.id][ReverseConstraint[constraintType]]) {
                for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                    put(newParameters, param, definedParameters[param]);
                }

                result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);
            }

            else {

                if (overwriteConstraint) {
                    /* We are sure that this element-constraint combination exists, and we are sure that we ARE overwriting it. */

                    for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                        put(newParameters, param, definedParameters[param]);
                    }

                    result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);

                    if (result.successful) {
                        /* We could delete this element-constraint combination out of all the old groups. But let's be smart about it
                         and only delete it from the groups it no longer exists in (according to the new groups parameter). Since
                         this is a destructive operation we only want to do this if the validation was successful
                         */

                        overwriteGroups(element, constraintType, definedParameters);
                    }
                }

                else {
                    /* We are sure that this element-constraint combination exists, and we are sure that we ARE NOT overwriting it.
                     BUT, we need to check if the overwriteParameter flag is set as well. If that is the case, and the user has
                     specified a parameter that already exists within the parameter list for the constraint, we will overwrite its
                     value with the new one. Otherwise, we will NOT overwrite it and we will maintain the old value
                     */

                    //Let's get the existing parameters for this constraint
                    var oldParameters = boundConstraints[ReverseGroup[Group.Default]][element.id][ReverseConstraint[constraintType]];

                    /* Let's copy our existing parameters into the new parameter map. We'll decide later if we're going to overwrite
                     the existing values or not, based on the overwriteParameter flag
                     */

                    for (var param in oldParameters) if (oldParameters.hasOwnProperty(param)) {
                        put(newParameters, param, oldParameters[param]);
                    }

                    if (overwriteParameters) {
                        //Since overwriteParameter is true, if we find a parameter in definedParameters that already
                        //exists in oldParameters, we'll overwrite the old value with the new one. All this really
                        //entails is iterating over definedParameters and inserting the values into newParameters

                        for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                            put(newParameters, param, definedParameters[param]);
                        }

                        result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);

                        if (result.successful) {
                            /* Because we're overwriting, we need to take groups into account. We basically need to see if
                             we need to remove this constraint-element combination from any group(s). For example, assume
                             that we originally had the groups "First" and "Second" and then the user sent in "Second"
                             and "Third". This means that we have to remove this constraint from the "First" group.
                             So basically, the groups we need to remove the element-constraint combination from can be
                             found by performing (Go union Gn) - Gn where Go is the old group set and Gn is the new group
                             set. Since this is a destructive operation, we only want to do it if the constraint definition
                             validated successfully.
                             */
                            overwriteGroups(element, constraintType, newParameters);
                        }
                    }

                    else {
                        //Since overwriteParameter is false, we will only insert a parameter from definedParameters
                        //if it doesn't exist in oldParameters

                        for (var param in definedParameters) if (definedParameters.hasOwnProperty(param)) {
                            if (!oldParameters[param]) {
                                put(newParameters, param, definedParameters[param]);
                            }
                        }
                    }
                }
            }

            if (result.successful) {
                createConstraintFromDefinition(element, ReverseConstraint[constraintType], newParameters);
            }
        }

        return result;
    }

    function validate(options) {

        var result = null;

        if(typeof options !== "undefined" && typeof options.groups !== "undefined" && !(options.groups instanceof Array)) {
            throw "regula.validate: If a groups attribute is provided, it must be an array.";
        }

        if (typeof options !== "undefined" && typeof options.elements !== "undefined") {

            if (options.elements instanceof Array) {

                result = [];
                for (var i = 0; i < options.elements.length; i++) {
                    options.elementId = options.elements[i].id;
                    result = result.concat(_validate(options));
                }
            }

            else {
                throw "regula.validate: If an elements attribute is provided, it must be an array.";
            }
        }

        else {
            result = _validate(options);
        }

        return result;
    }

    function _validate(options) {

        //generates a key that can be used with the function table to call the correct auxiliary validator function
        //(see below for more details)
        function generateKey(options) {
            var groups = options.groups || null;
            var elementId = options.elementId || null;
            var constraintType = options.constraintType || null;
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
            "000":validateAll,
            "001":validateConstraint,
            "010":validateElement,
            "011":validateElementWithConstraint,
            "100":validateGroups,
            "101":validateGroupsWithConstraint,
            "110":validateGroupsWithElement,
            "111":validateGroupsElementWithConstraint
        };

        validatedConstraints = {}; //clear this out on every run

        //if no arguments were passed in, we initialize options to an empty map
        if (!options || typeof options == "undefined") {
            options = {};
        }

        /* default to independent validation for groups i.e., groups are validated independent of each other and will not
         fail early
         */
        if (options.independent == undefined) {
            options.independent = true;
        }

        //Get the actual constraint name
        if (options.constraintType) {
            options.constraintType = ReverseConstraint[options.constraintType];
        }

        //Get the actual group name
        if (options.groups) {
            for (var i = 0; i < options.groups.length; i++) {
                options.groups[i] = ReverseGroup[options.groups[i]];
            }
        }

        return functionTable[generateKey(options)](options);
    }

    function validateAll() {
        var constraintViolations = [];

        for (var group in boundConstraints) if (boundConstraints.hasOwnProperty(group)) {

            var groupElements = boundConstraints[group];

            for (var elementId in groupElements) if (groupElements.hasOwnProperty(elementId)) {

                if (!document.getElementById(elementId)) {
                    //if the element no longer exists, remove it from the bindings and continue
                    delete groupElements[elementId];
                }

                else {
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
            throw "Constraint " + ReverseConstraint[options.constraintType] + " has not been bound to any element. " + explodeParameters(options);
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
            throw "No constraints have been bound to element with id " + options.elementId + ". " + explodeParameters(options);
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
            throw "No element with id " + options.elementId + " was found with the constraint " + options.constraintType + " bound to it. " + explodeParameters(options);
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
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
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
                    throw "Constraint " + options.constraintType + " has not been bound to any element under group " + group + ". " + explodeParameters(options);
                }
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
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
                }

                else {
                    notFound.push(group);
                }
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
            }

            i++;
            successful = (constraintViolations.length == 0) || (options.independent && constraintViolations.length != 0);
        }

        if (notFound.length > 0) {
            throw "No element with id " + options.elementId + " was found in the following group(s): [" + explode(notFound, ",").replace(/,/g, ", ") + "]. " + explodeParameters(options);
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
        var constraintViolation;
        var groupElements = boundConstraints[group];

        if (!groupElements) {
            throw "Undefined group in group list";
        }

        var elementConstraints = groupElements[elementId];

        if (!validatedConstraints[elementId]) {
            validatedConstraints[elementId] = {};
        }

        //Validate this constraint only if we haven't already validated it during this validation run
        if (!validatedConstraints[elementId][elementConstraint]) {
            if (!elementConstraints) {
                throw "No constraints have been defined for the element with id: " + elementId + " in group " + group;
            }

            else {
                var params = elementConstraints[elementConstraint];

                if (!params) {
                    throw elementConstraint + " in group " + group + " hasn't been bound to the element with id " + elementId;
                }

                else {
                    var validationResult = runValidatorFor(group, elementId, elementConstraint, params);

                    if (!validationResult.constraintPassed) {
                        var errorMessage = interpolateErrorMessage(elementId, elementConstraint, params);

                        constraintViolation = {
                            group:group,
                            constraintName:elementConstraint,
                            formSpecific:constraintsMap[elementConstraint].formSpecific,
                            custom:constraintsMap[elementConstraint].custom,
                            compound:constraintsMap[elementConstraint].compound,
                            composingConstraintViolations:validationResult.composingConstraintViolations || [],
                            constraintParameters:params,
                            failingElements:validationResult.failingElements,
                            message:errorMessage
                        };
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

        if (constraintsMap[elementConstraint].formSpecific) {
            failingElements = constraintsMap[elementConstraint].validator.call(element, params);
            constraintPassed = failingElements.length == 0;
        }

        else if (constraintsMap[elementConstraint].compound) {
            composingConstraintViolations = constraintsMap[elementConstraint].validator.call(element, params, currentGroup, constraintsMap[elementConstraint]);
            constraintPassed = composingConstraintViolations.length == 0;

            if (!constraintPassed) {
                failingElements.push(element);
            }
        }

        else {
            constraintPassed = constraintsMap[elementConstraint].validator.call(element, params);

            if (!constraintPassed) {
                failingElements.push(element)
            }
        }

        validatedConstraints[elementId][elementConstraint] = true; //mark this element constraint as validated

        var validationResult = {
            constraintPassed:constraintPassed,
            failingElements:failingElements
        };

        if (!constraintsMap[elementConstraint].reportAsSingleViolation) {
            validationResult.composingConstraintViolations = composingConstraintViolations;
        }

        return validationResult;
    }

    function interpolateErrorMessage(elementId, elementConstraint, params) {
        var element = document.getElementById(elementId);
        var errorMessage = "";

        if (params["message"]) {
            errorMessage = params["message"];
        }

        else if (params["msg"]) {
            errorMessage = params["msg"];
        }

        else {
            errorMessage = constraintsMap[elementConstraint].defaultMessage;
        }

        for (var param in params) if (params.hasOwnProperty(param)) {

            var re = new RegExp("{" + param + "}", "g");
            errorMessage = errorMessage.replace(re, params[param]);
        }

        //If this is a compound constraint, we need to look at the parameters on each composing constraint so that we can interpolate their values
        if(constraintsMap[elementConstraint].compound && typeof constraintsMap[elementConstraint].composingConstraints !== "undefined") {
            for(var i = 0; i < constraintsMap[elementConstraint].composingConstraints.length; i++) {
                var composingConstraint = constraintsMap[elementConstraint].composingConstraints[i];

                for(var param in composingConstraint.params) if (composingConstraint.params.hasOwnProperty(param)) {

                    var re = new RegExp("{" + param + "}", "g");
                    errorMessage = errorMessage.replace(re, composingConstraint.params[param]);
                }
            }
        }

        if (/{label}/.test(errorMessage)) {
            var friendlyInputName = friendlyInputNames[element.tagName.toLowerCase()];

            if (!friendlyInputName) {
                friendlyInputName = friendlyInputNames[element.type.toLowerCase()];
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
        configure:configure,
        bind:bind,
        unbind:unbind,
        validate:validate,
        custom:custom,
        compound:compound,
        override:override,
        Constraint:Constraint,
        Group:Group,
        DateFormat:DateFormat
    };
})();
