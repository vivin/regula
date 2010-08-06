/*
 Regula: An annotation-based form-validation framework in Javascript
 Written By Vivin Paliath (http://vivin.net)
 License: BSD License
 Copyright (C) 2010
 */

/* for code completion */
var regula = {
    bind: function(options) {},
    custom: function(options) {},
    override: function(options) {},
    validate: function(options) {},
    Constraint: {},
    Group: {}
};


regula = (function() {
    /*
        getElementsByClassName
        Developed by Robert Nyman, http://www.robertnyman.com
        Code/licensing: http://code.google.com/p/getelementsbyclassname/
    */
    var getElementsByClassName = function (className, tag, elm){
        if (document.getElementsByClassName) {
            getElementsByClassName = function (className, tag, elm) {
                elm = elm || document;
                var elements = elm.getElementsByClassName(className),
                    nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                    returnElements = [],
                    current;
                for(var i=0, il=elements.length; i<il; i+=1){
                    current = elements[i];
                    if(!nodeName || nodeName.test(current.nodeName)) {
                        returnElements.push(current);
                    }
                }
                return returnElements;
            };
        }
        else if (document.evaluate) {
            getElementsByClassName = function (className, tag, elm) {
                tag = tag || "*";
                elm = elm || document;
                var classes = className.split(" "),
                    classesToCheck = "",
                    xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                    namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                    returnElements = [],
                    elements,
                    node;
                for(var j=0, jl=classes.length; j<jl; j+=1){
                    classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
                }
                try	{
                    elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
                }
                catch (e) {
                    elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
                }
                while ((node = elements.iterateNext())) {
                    returnElements.push(node);
                }
                return returnElements;
            };
        }
        else {
            getElementsByClassName = function (className, tag, elm) {
                tag = tag || "*";
                elm = elm || document;
                var classes = className.split(" "),
                    classesToCheck = [],
                    elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                    current,
                    returnElements = [],
                    match;
                for(var k=0, kl=classes.length; k<kl; k+=1){
                    classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
                }
                for(var l=0, ll=elements.length; l<ll; l+=1){
                    current = elements[l];
                    match = false;
                    for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                        match = classesToCheck[m].test(current.className);
                        if (!match) {
                            break;
                        }
                    }
                    if (match) {
                        returnElements.push(current);
                    }
                }
                return returnElements;
            };
        }
        return getElementsByClassName(className, tag, elm);
    };

    /* regula code starts here */

    var Group = {
        Default: 0
    };

    var ReverseGroup = {
        0: "Default"
    };

    var Constraint = {
        Checked: 0,
        Selected: 1,
        Max: 2,
        Min: 3,
        Range: 4,
        Between: 4,
        NotEmpty: 5,
        Empty: 6,
        Pattern: 7,
        Matches: 7,
        Email: 8,
        IsAlpha: 9,
        IsNumeric: 10,
        IsAlphaNumeric: 11,
        CompletelyFilled: 12,
        PasswordsMatch: 13,
        Required: 14
    };

    var ReverseConstraint = {
        0: "Checked",
        1: "Selected",
        2: "Max",
        3: "Min",
        4: "Range",
        5: "NotEmpty",
        6: "Empty",
        7: "Pattern",
        8: "Email",
        9: "IsAlpha",
        10: "IsNumeric",
        11: "IsAlphaNumeric",
        12: "CompletelyFilled",
        13: "PasswordsMatch",
        14: "Required"
    };

    var friendlyInputNames = {
        form: "The form",
        select: "The select box",
        textarea: "The text area",
        checkbox: "The checkbox",
        radio: "The radio button",
        text: "The text field",
        password: "The password"
    };

    var firstCustomIndex = 15;
    var firstCustomGroupIndex = 1;

    var constraintsMap = {
        Checked: {
            formSpecific: false,
            validator: checked,
            type: Constraint.Checked,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be checked."
        },

        Selected: {
            formSpecific: false,
            validator: selected,
            type: Constraint.Selected,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be selected."
        },

        Max: {
            formSpecific: false,
            validator: max,
            type: Constraint.Max,
            custom: false,
            params: ["value"],
            defaultMessage: "{label} needs to be lesser than or equal to {value}."
        },

        Min: {
            formSpecific: false,
            validator: min,
            type: Constraint.Min,
            custom: false,
            params: ["value"],
            defaultMessage: "{label} needs to be greater than or equal to {value}."
        },

        Range: {
            formSpecific: false,
            validator: range,
            type: Constraint.Range,
            custom: false,
            params: ["max", "min"],
            defaultMessage: "{label} needs to be between {max} and {min}."
        },

        NotEmpty: {
            formSpecific: false,
            validator: notEmpty,
            type: Constraint.NotEmpty,
            custom: false,
            params: [],
            defaultMessage: "{label} cannot be empty."
        },

        Empty: {
            formSpecific: false,
            validator: empty,
            type: Constraint.Empty,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be empty."
        },

        Pattern: {
            formSpecific: false,
            validator: matches,
            type: Constraint.Pattern,
            custom: false,
            params: ["regexp"],
            defaultMessage: "{label} needs to match {regexp}{flags}."
        },

        Email: {
            formSpecific: false,
            validator: email,
            type: Constraint.Email,
            custom: false,
            params: [],
            defaultMessage: "{label} is not a valid email."
        },

        IsAlpha: {
            formSpecific: false,
            validator: isAlpha,
            type: Constraint.IsAlpha,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain letters."
        },

        IsNumeric: {
            formSpecific: false,
            validator: isNumeric,
            type: Constraint.IsNumeric,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain numbers."
        },

        IsAlphaNumeric: {
            formSpecific: false,
            validator: isAlphaNumeric,
            type: Constraint.IsAlphaNumeric,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain numbers and letters."
        },

        CompletelyFilled: {
            formSpecific: true,
            validator: completelyFilled,
            type : Constraint.CompletelyFilled,
            custom: false,
            params: [],
            defaultMessage: "{label} must be completely filled."
        },

        PasswordsMatch: {
            formSpecific: true,
            validator: passwordsMatch,
            type: Constraint.PasswordsMatch,
            custom: false,
            params: ["field1", "field2"],
            defaultMessage: "Passwords do not match."
        },

        Required: {
            formSpecific: false,
            validator: required,
            type: Constraint.Required,
            custom: false,
            params: [],
            defaultMessage: "{label} is required."
        }
    };

    var boundConstraints = {Default: {}}; //Keeps track of all bound constraints. Keyed by Group -> Element Id -> Constraint Name
    var validatedConstraints = {}; //Keeps track of constraints that have already been validated for a validation run. Cleared out each time validation is run.

    function checked() {
        return this.checked;
    }

    function selected() {
        return this.selectedIndex > 0;
    }

    function max(params) {
        return this.value <= params["value"];
    }

    function min(params) {
        return this.value >= params["value"];
    }

    function range(params) {
        return this.value <= params["max"] && this.value >= params["min"];
    }

    function notEmpty() {
        return this.value.replace(/\s/g, "") != "";
    }

    function empty() {
        return this.value.replace(/\s/g, "") == "";
    }

    function matches(params) {
        var re;

        if(typeof params["flags"] != undefined) {
            re = new RegExp(params["regexp"].replace(/^\//, "").replace(/\/$/, ""), params["flags"]);
        }

        else {
            re = new RegExp(params["regexp"].replace(/^\//, "").replace(/\/$/, ""));
        }

        return re.test(this.value);
    }

    function email() {
        return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(this.value);
    }

    function isAlpha() {
        return /[A-Za-z]+/.test(this.value);
    }

    function isNumeric() {
        return /-?[0-9]+/.test(this.value);
    }

    function isAlphaNumeric() {
        return /-?[0-9]+|[0-9A-Za-z]+/.test(this.value);
    }

    function completelyFilled() {
        var unfilledElements = [];

        for(var i = 0; i < this.elements.length; i++) {
            var element = this.elements[i];

            if(!required.call(element)) {
                unfilledElements.push(element);
            }
        }

        return unfilledElements;
    }

    function passwordsMatch(params) {
        var failingElements = [];

        var passwordField1 = document.getElementById(params["field1"]);
        var passwordField2 = document.getElementById(params["field2"]);

        if(passwordField1.value != passwordField2.value) {
            failingElements = [passwordField1, passwordField2];
        }

        return failingElements;
    }

    function required() {
        var result = true;

        if(this.tagName) {
            if(this.tagName.toLowerCase() == "select") {
                result = selected.call(this);
            }

            else if(this.type.toLowerCase() == "checkbox" || this.type.toLowerCase() == "radio") {
                result = checked.call(this);
            }

            else if(this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "textarea") {
                if(this.type.toLowerCase() != "button") {
                    result = notEmpty.call(this);
                }
            }
        }

        return result;
    }


    /* this function validates a constraint definition to ensure that parameters match up */

    function validateConstraintDefinition(element, constraintName, definedParameters) {
        var result = {
            successful: true,
            message: "",
            data: null
        };

        if(element.tagName.toLowerCase() == "form" && !constraintsMap[constraintName].formSpecific) {
            result = {
                successful : false,
                message: constraintName + " is not a form constraint, but you are trying to bind it to a form",
                data: null
            };
        }

        else if(element.tagName.toLowerCase() != "form" && constraintsMap[constraintName].formSpecific) {
            result = {
                successful: false,
                message: constraintName + " is a form constraint, but you are trying to bind it to a non-form element",
                data: null
            };
        }

        else if(definedParameters.size < constraintsMap[constraintName].params.length) {
            result = {
                successful: false,
                message: constraintName + " expects at least " + constraintsMap[constraintName].params.length +
                         " parameter(s). However, you have provided only " + definedParameters.size,
                data: null
            };
        }

        else {
            var matchingParams = 0;

            for(var i = 0; i < constraintsMap[constraintName].params; i++) {
                var param = constraintsMap[constraintName].params[i];

                if(definedParameters[param]) {
                    matchingParams++;
                }
            }

            /*for(var i = 0; i < constraintDefinition.length; i++) {
                if(exists(constraintsMap[constraintName].params, constraintDefinition[i].name)) {
                    matchingParams++;
                }
            }*/

            if(matchingParams < constraintsMap[constraintName].params.length) {
                var missingParams = constraintsMap[constraintName].params.length - matchingParams;

                result = {
                    successful: false,
                    message: constraintName + " has " + constraintsMap[constraintName].params.length +
                             " required parameter(s). You seem to have provided some optional or required parameters, but you are still missing " + missingParams + " parameter(s).",
                    data: null
                };
            }

            else {
                result.data = definedParameters;
            }
        }

        return result;
    }

    /* this function creates a constraint and binds it to the element specified using the constraint name and defined parameters */

    function createConstraintFromDefinition(element, constraintName, definedParameters) {
        var groupParamValue = "";

        var result = {
            successful: true,
            message: "",
            data: null
        };

        if(definedParameters["groups"]) {
            groupParamValue = definedParameters["groups"].replace(/\s/g, "");
        }
/*
        while(i < constraintDefinition.length && !found) {
            if(constraintDefinition[i].name == "groups") {
                groupParamValue = constraintDefinition[i].value.replace(/\s/g, "");
                found = true;
            }

            i++;
        } */

        if(groupParamValue == "") {
            groupParamValue = "Default";
        }

        else if(!/^Default,|,Default|,Default$/.test(groupParamValue)) {
            groupParamValue = "Default," + groupParamValue;
        }

        var groups = groupParamValue.split(/,/);

        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];

            if (!boundConstraints[group]) {
                Group[group] = firstCustomIndex;
                ReverseGroup[firstCustomIndex++] = group;
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

        while(!found && i < array.length) {
            found = value == array[i];
            i++;
        }

        return found;
    }

    function explode(array, delimeter) {
        var str = "";

        for(var i = 0; i < array.length; i++) {
            str += array[i] + delimeter;
        }

        return str.replace(new RegExp(delimeter + "$"), "");
    }

    function put(map, key, value) {
        if(!map.size) {
           map.size = 0;
        }

        if(!map[key]) {
           map.size++;
        }

        map[key] = value;
    }

    function isMapEmpty(map) {
        for(var key in map) {
            if(map.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    function explodeParameters(options) {
        var str = "function received: {";
        for(var argument in options) {
            if(options.hasOwnProperty(argument)) {
                if(typeof options[argument] == "string") {
                    str += argument + ": " + options[argument] + ", ";
                }

                else if(options[argument].length) { //we need this to be an array
                    str += argument + ": [" + explode(options[argument], ", ") + "], "
                }
            }
        }

        str = str.replace(/, $/, "") + "}";
        return str;
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
            str: trim(constraintDefinitionString.replace(/\s*\n\s*/g, "")),
            delimiters: "@()[]=,\"\\/-",
            returnDelimiters: true,
            returnEmptyTokens: false
        });

        return constraints(tokens);

        /** utility functions. i.e., functions not directly related to parsing start here **/

        function trim(str) {
            return str ? str.replace(/^\s+/, "").replace(/\s+$/, "") : "";
        }

        function peek(arr) {
            return arr[0];
        }

        function generateErrorMessage(element, constraintName, message) {
            var errorMessage = "";

            if(constraintName == "" || constraintName == null || constraintName == undefined) {
                errorMessage = element.id + ": ";
            }

            else {
                errorMessage = element.id + "." + constraintName + ": "
            }

            return errorMessage + message;
        }

        function tokenize(options) {
            var str = options.str;
            var delimiters = options.delimiters.split("");
            var returnDelimiters = options.returnDelimiters || false;
            var returnEmptyTokens = options.returnEmptyTokens || false;
            var tokens = new Array();
            var lastTokenIndex = 0;

            for(var i = 0; i < str.length; i++) {
                if(exists(delimiters, str[i])) {
                    var token = str.substring(lastTokenIndex, i);
                    //token = token.replace(/^\s+/, "").replace(/\s+$/, "");

                    if(token.length == 0) {
                        if(returnEmptyTokens) {
                            tokens.push(token);
                        }
                    }

                    else {
                        tokens.push(token);
                    }

                    if(returnDelimiters) {
                        tokens.push(str[i]);
                    }

                    lastTokenIndex = i + 1;
                }
            }

            if(lastTokenIndex < str.length) {
                var token = str.substring(lastTokenIndex, str.length);
                //token = token.replace(/^\s+/, "").replace(/\s+$/, "");

                if(token.length == 0) {
                    if(returnEmptyTokens) {
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
            positive               ::= digit { digit }
            quoted-string          ::= "\"", { char }, "\""
            boolean                ::= true | false
            char                   ::= .
            regular-expression     ::= "/", { char }, "/"
            group-definition       ::= "[", group { ",", group } "]"
            group                  ::= valid-starting-char { valid-char }
            
         */

        function constraints(tokens) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            while(tokens.length > 0 && result.successful) {
                result = constraint(tokens);
            }

            return result;
        }

        function constraint(tokens) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            var token = tokens.shift();

            //get rid of spaces if any
            if(trim(token).length == 0) {
                token = tokens.shift();
            }

            if(token == "@") {
                result = constraintDef(tokens)
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid constraint. Constraint definitions need to start with '@'") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function constraintDef(tokens) {
            var result = constraintName(tokens);

            if(result.successful) {
                currentConstraintName = result.data;
                currentConstraintName = currentConstraintName == "Between" ?
                                                                 "Range"
                                                                 :
                                                                 currentConstraintName == "Matches" ?
                                                                                          "Pattern"
                                                                                          :
                                                                                          currentConstraintName;
                if(constraintsMap[currentConstraintName]) {
                    result = paramDef(tokens);

                    if(result.successful) {
                        result = validateConstraintDefinition(element, currentConstraintName, result.data);

                        if(result.successful) {
                            createConstraintFromDefinition(element, currentConstraintName, result.data);
                        }
                    }
                }

                else {
                    result = {
                        successful: false,
                        message: generateErrorMessage(element, currentConstraintName, "I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it") + " " + result.message,
                        data: null
                    };
                }
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid constraintName in constraint definition") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function constraintName(tokens) {
            var token = trim(tokens.shift());
            var result = validStartingCharacter(token[0]);

            if(result.successful) {
                var i = 1;
                while(i < token.length && result.successful) {
                    result = validCharacter(token[i]);
                    i++;
                }

                if(result.successful) {
                    result.data = token;
                }
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, constraintName, "Invalid starting character for constraint name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data: null
                };
            }


            return result;
        }

        function validStartingCharacter(character) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(!/[A-Za-z_]/.test(character)) {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid starting character"),
                    data: null
                };
            }

            return result;
        }

        function validCharacter(character) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(!/[0-9A-Za-z_]/.test(character)) {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid character in identifier. Can only include 0-9, A-Z, a-z, and _") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function paramDef(tokens) {
            var result = {
                successful: true,
                message: "",
                data: new Array() 
            };

            if(peek(tokens) == "(") {
                tokens.shift(); // get rid of the (

                var data = {};
                //var data = new Array();

                result = param(tokens);
                put(data, result.data.name, result.data.value);
                //data.push(result.data);

                if(result.successful) {
                    //get rid of spaces
                    if(trim(peek(tokens)).length == 0) {
                        tokens.shift();
                    }

                    while(tokens.length > 0 && peek(tokens) == "," && result.successful) {

                        tokens.shift();
                        result = param(tokens);
                        put(data, result.data.name, result.data.value);
                        //data.push(result.data);

                        //get rid of spaces;
                        if(trim(peek(tokens)).length == 0) {
                            tokens.shift();
                        }
                    }

                    var token = tokens.shift();

                    //get rid of spaces
                    if(trim(token).length == 0) {
                        token = tokens.shift();
                    }

                    if(token != ")") {
                        result = {
                            successful: false,
                            message: generateErrorMessage(element, currentConstraintName, "Cannot find matching closing ) in parameter list") + " " + result.message,
                            data: null
                        };
                    }

                    else {
                        result.data = data;
                    }
                }

                else {
                    result = {
                        successful: false,
                        message: generateErrorMessage(element, currentConstraintName, "Invalid parameter definition") + " " + result.message,
                        data: null
                    };
                }

            }

            return result;
        }

        function param(tokens) {
            var result = paramName(tokens);

            if(result.successful) {
                var parameterName = result.data;
                var token = tokens.shift();

                if(token == "=") {
                    result = paramValue(tokens);

                    if(result.successful) {
                        var param = {
                            name: parameterName,
                            value: result.data
                        };

                        result.data = param;
                    }

                    else {
                        result = {
                            successful: false,
                            message: generateErrorMessage(element, currentConstraintName, "Invalid parameter value") + " " + result.message,
                            data: null
                        };
                    }
                }

                else {
                    tokens.unshift(token);
                    result = {
                        successful: false,
                        message: generateErrorMessage(element, currentConstraintName, "'=' expected after parameter name" + " " + result.message),
                        data: null
                    };
                }
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid parameter name") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function paramName(tokens) {
            var token = trim(tokens.shift());

            //get rid of space
            if(token.length == 0) {
                token = tokens.shift();
            }

            var result = validStartingCharacter(token[0]);

            if(result.successful) {
                var i = 1;
                while(i < token.length && result.successful) {
                    result = validCharacter(token[i]);
                    i++;
                }

                if(result.successful) {
                    result.data = token;
                }
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid starting character for parameter name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function paramValue(tokens) {

            //get rid of spaces
            if(trim(peek(tokens)).length == 0) {
                tokens.shift();
            }

            var result = number(tokens);

            if(!result.successful) {
                result = quotedString(tokens);

                if(!result.successful) {
                    result = regularExpression(tokens);

                    if(!result.successful) {
                        result = booleanValue(tokens);

                        if(!result.successful) {
                            result = groupDefinition(tokens);

                            if(!result.successful) {
                                result = {
                                    successful: false,
                                    message: generateErrorMessage(element, currentConstraintName, "Parameter value must be a number, quoted string, regular expression, or a boolean") + " " + result.message,
                                    data: null
                                };
                            }
                        }
                    }
                }
            }

            return result;
        }

        function number(tokens) {
            var result = negative(tokens);

            if(!result.successful) {
                result = positive(tokens);

                if(!result.successful) {
                    result = {
                        successful: false,
                        message: generateErrorMessage(element, currentConstraintName, "Parameter value is not a number") + " " + result.message,
                        data: null
                    };
                }
            }

            return result;
        }

        function negative(tokens) {
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(token == "-") {
                result = positive(tokens);
                if(result.successful) {
                    result.data = token + result.data;
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a negative number") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function positive(tokens) {
            var token = trim(tokens.shift());
            var result = digit(token[0]);

            if(result.successful) {
                var i = 1;
                while(i < token.length && result.successful) {
                    result = digit(token[i]);
                    i++;
                }

                if(result.successful) {
                    result.data = token;
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a positive number") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function digit(character) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(!/[0-9]/.test(character)) {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a valid digit") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function quotedString(tokens) {
            var token = tokens.shift();
            var data = "";
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(token == "\"") {
                var done = false;

                while(tokens.length > 0 && result.successful && !done) {
                    if(peek(tokens) == "\"") {
                        done = true;
                        tokens.shift(); //get rid of "
                    }

                    else {
                        result = character(tokens);
                        data += result.data;
                    }
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid quoted string") + " " + result.message,
                    data: null
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

            if(token == "\\") {
                data = tokens.shift();
            }

            return {
                successful: true,
                message: "",
                data: token + data
            }; //match any old character
        }

        function regularExpression(tokens) {
            var data = "";
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(token == "/") {
                data = token;
                var done = false;

                while(tokens.length > 0 && result.successful && !done) {
                    if(peek(tokens) == "/") {
                        data += tokens.shift();
                        done = true;
                    }

                    else {
                        result = character(tokens);
                        data += result.data;
                    }
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a regular expression") + " " + result.message,
                    data: null
                };
            }

            result.successful = result.successful && done;
            result.data = data;
            return result;
        }
       
        function booleanValue(tokens) {
            var data = "";
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(trim(token) == "true" || trim(token) == "false") {
                result = {
                    successful: true,
                    message: "",
                    data: token
                };
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a boolean") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function groupDefinition(tokens) {
            var data = "";
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if(token == "[") {
                result = group(tokens);

                if(result.successful) {
                    data = result.data;

                    //get rid of spaces
                    if(trim(peek(tokens)).length == 0) {
                        tokens.shift();
                    }

                    while(tokens.length > 0 && peek(tokens) == "," && result.successful) {
                        tokens.shift();
                        result = group(tokens);

                        data += "," + result.data;

                        if(trim(peek(tokens)).length == 0) {
                            tokens.shift();
                        }
                    }

                    result.data = data;

                    token = tokens.shift();
                    
                    //get rid of spaces
                    if(trim(token).length == 0) {
                        tokens.shift();
                    }

                    if(token != "]") {
                        result = {
                            successful: false,
                            message: generateErrorMessage(element, currentConstraintName, "Cannot find matching closing ] in group definition") + " " + result.message,
                            data: null
                        };
                    }
                }

                else {
                    result = {
                        successful: false,
                        message: generateErrorMessage(element, currentConstraintName, "Invalid group definition") + " " + result.message,
                        data: null
                    };
                }
            }

            else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Not a valid group definition") + " " + result. message,
                    data: null
                }
            }

            return result;
        }

        function group(tokens) {
            var token = trim(tokens.shift());

            //get rid of space
            if(token.length == 0) {
                token = tokens.shift();
            }

            var result = validStartingCharacter(token[0]);

            if(result.successful) {
                var i = 1;
                while(i < token.length && result.successful) {
                    result = validCharacter(token[i]);
                    i++;
                }

                if(result.successful) {
                    result.data = token;
                }
            }

            else {
                result = {
                    successful: false,
                    message: generateErrorMessage(element, currentConstraintName, "Invalid starting character for group name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data: null
                }
            }

            return result;
        }
    }

    function custom(options) {
        var name = options.name;
        var formSpecific = options.formSpecific || false;
        var validator = options.validator;
        var params = options.params || [];
        var defaultMessage = options.defaultMessage || "";

        /* handle attributes. throw exceptions if they are not sane */

        /* name attribute*/
        if(!name) {
            throw "regula.custom expects a name attribute in the options argument";
        }

        else if(typeof name != "string") {
            throw "regula.custom expects the name attribute in the options argument to be a string";
        }

        else if(name.replace(/\s/g, "").length == 0) {
            throw "regula.custom cannot accept an empty string for the name attribute in the options argument";
        }

        /* formSpecific attribute */
        if(typeof formSpecific != "boolean") {
            throw "regula.custom expects the formSpecific attribute in the options argument to be a boolean";
        }

        /* validator attribute */
        if(!validator) {
            throw "regula.custom expects a validator attribute in the options argument";
        }

        else if(typeof validator != "function") {
            throw "regula.custom expects the validator attribute in the options argument to be a function";
        }

        /* params attribute */
        if(params.constructor.toString().indexOf("Array") < 0) {
            throw "regula.custom expects the params attribute in the options argument to be an array";
        }

        /* defaultMessage attribute */
        if(typeof defaultMessage != "string") {
            throw "regula.custom expects the defaultMessage attribute in the options argument to be a string";
        }

        if(constraintsMap[name]) {
            throw "There is already a constraint called " + name + ". If you wish to override this constraint, use regula.override";
        }

        else {
            Constraint[name] = firstCustomIndex;
            ReverseConstraint[firstCustomIndex++] = name;
            constraintsMap[name] = {
                formSpecific: formSpecific,
                validator: validator,
                type: Constraint[name],
                custom: true,
                params: params,
                defaultMessage: defaultMessage
            };           
        }
    }

    function override(options) {
        var name = options.name;

        if(!name) {
            throw "regula.override() expects a name attribute in the options argument";
        }

        if(!Constraint[name]) {
            throw "A constraint called " + name + " has not been defined, so I cannot override it";
        }

        else {
            /* for custom constraints, you can override anything. for built-in constraints however, you can only override the default message */
            var formSpecific = constraintsMap[name].custom ? options.formSpecific || constraintsMap[name].formSpecific : constraintsMap[name].formSpecific;
            var validator = constraintsMap[name].custom ? options.validator || constraintsMap[name].validator : constraintsMap[name].validator;
            var params = constraintsMap[name].custom ? options.params || constraintsMap[name].params : constraintsMap[name].params;
            var defaultMessage = options.defaultMessage || constraintsMap[name].defaultMessage;

            if(typeof formSpecific != "boolean") {
                throw "regula.override() expects the formSpecific attribute in the options argument to be a boolean";
            }

            if(typeof validator != "function") {
                throw "regula.override() expects the validator attribute in the options argument to be a function";
            }

            if(params.constructor.toString().indexOf("Array") < 0) {
                throw "regula.override() expects the params attribute in the options argument to be an array";
            }

            if(typeof defaultMessage != "string") {
                throw "regula.override() expects the defaultMessage attribute in the options argument to be a string";
            }

            constraintsMap[name] = {
                formSpecific: formSpecific,
                validator: validator,
                type: Constraint[name],
                custom: true,
                params: params,
                defaultMessage: defaultMessage
            };
        }
    }

    function bind(options) {
        var result = {
            successful: true,
            message: "",
            data: null
        };

        if(typeof options == undefined || !options) {
            result = bindAfterParsing();
        }

        else {
            result = bindFromOptions(options);
        }

        if(!result.successful) {
            throw result.message;
        }
    }

    function bindAfterParsing() {
        var elementsWithRegulaValidation = getElementsByClassName("regula-validation");
        var result = {
            successful: true,
            message: "",
            data: null
        };

        var i = 0;
        while(i < elementsWithRegulaValidation.length && result.successful) {
            var element = elementsWithRegulaValidation[i];
            var tagName = element.tagName.toLowerCase();

            if(tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
                result = {
                    successful: false,
                    message: tagName + "#" + element.id + " is not an input, select, or form element! Validation constraints can only be attached to input, select, or form elements.",
                    data: null
                };
            }

            var dataConstraintsAttribute = element.getAttribute("data-constraints");
            result = parse(element, dataConstraintsAttribute);
        }

        return result;
    }

    function bindFromOptions(options) {

        //returns union of first and second array
        function union(first, second) {
            var inserted  = {};
            var union = new Array();

            for(var i = 0; i < first.length; i++) {
                union.push(first[i]);
                inserted[first[i]] =  true;
            }

            for(var j = 0; j < second.length; j++) {
                if(!inserted[second[j]]) {
                    union.push(second[j]);
                }
            }

            return union;
        }

        //substract second from first
        function subtract(second, first) {
            var difference = new Array();

            for(var i = 0; i < first; i++) {
                if(!exists(second, first[i])) {
                    difference.push(first[i]);
                }
            }

            return difference;
        }

        //handles the overwriting of groups which needs some special logic
        function overwriteGroups(element, constraintType, definedParameters) {
            var oldGroups = boundConstraints[ReverseGroup[Group.Default]][element.id][ReverseConstraint[constraintType]]["groups"];

            /* Since the new groups are passed in as an array of 'enum' values, we have to translate them to actual strings */
            var newGroups = [];

            for(var j = 0; j < definedParameters["groups"].length; j++) {
                newGroups[j] = ReverseGroup[definedParameters["groups"][j]];
            }

            /* If the list of groups does not contain the "Default" group, let's add it because we don't want to delete it if
               the user did not specify it
             */
            if(!exists(newGroups, ReverseGroup[Group.Default])) {
                newGroups.push(ReverseGroup[Group.Default]);
            }

            var groupsToRemoveConstraintFrom = subtract(newGroups, union(oldGroups, newGroups));

            for(var group in groupsToRemoveConstraintFrom) {
                delete boundConstraints[group][element.id][ReverseConstraint[constraintType]];

                if(isMapEmpty(boundConstraints[group][element.id])) {
                    delete boundConstraints[group][element.id];

                    if(isMapEmpty(boundConstraints[group])) {
                        delete boundConstraints[group];
                    }
                }
            }
        }

        var result = {
            successful: true,
            message: "",
            data: null
        };

        var element = options.element;
        var overwriteConstraint = options.overwriteConstraint || false;
        var overwriteParameter = options.overwriteParameter || false;
        var constraints = options.constraints || [];
        var tagName = (element) ? element.tagName.toLowerCase() : null;

        if(!element) {
            result = {
                successful: false,
                message: "regula.bind(options) expects a non-null element attribute in the options argument " + explodeParameters(options),
                data: null
            };
        }

        else if(typeof element != "object") {
            result = {
                successful: false,
                message: "regula.bind(options): element attribute is of unexpected type: " + typeof element + " " + explodeParameters(options),
                data: null
            };
        }

        else if(constraints.length == 0) {
            result = {
                successful: false,
                message: "regula.bind(options) expects the constraint attribute in the options argument to be a non-empty array of constraint definitions " + explodeParameters(options),
                data: null
            };
        }

        else if(tagName != "form" && tagName != "select" && tagName !="textArea" && tagName !="input") {
            result = {
                successful: false,
                message: tagName + "#" + element.id + " is not an input, select, or form element! Validation constraints can only be attached to input, select, or form elements " + explodeParameters(options),
                data: null
            };
        }

        else {
            var i = 0;
            while(i < constraints.length && result.successful) {
                var constraint = constraints[i];
                var constraintType = constraint.constraintType;
                var definedParameters = constraint.params || {};
                var newParameters = {size: 0};

                /* We check to see if this was a valid/defined constraint. It wasn't so we need to return an error message */
                if(!constraintType) {
                    result = {
                        successful:false,
                        message: "regula.bind(options) expects a valid constraint type for each constraint in constraints attribute of the options argument. " + explodeParameters(options),
                        data:null
                    };
                }

                else {
                     /*
                      We check and see if this element-constraint combination does NOT exist. We can say that the combination does NOT exist if
                        o The element's id does not exist as a key within the Default group (every element is added to the default group regardless)
                          OR IF
                        o The element's id exists within the Default group, but this particular constraint has not been bound to it
                      If either of these conditions were met, we can simply proceed to validate the constraint definition and then add it if it is valid

                      We also have to do one more thing. definedParameters has no 'size' property. So we need to essentially copy that information
                      into newParameters using the put function so that can have a 'size' property (we will need it when we validate this constraint
                      definition)
                    */

                    if(!boundConstraints[ReverseGroup[Group.Default]][element.id] || !boundConstraints[ReverseGroup[Group.Default]][element.id][ReverseConstraint[constraintType]]) {
                        for(var param in definedParameters) {
                            put(newParameters, param, definedParameters[param]);
                        }

                        result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);
                    }

                    else {


                        if(overwriteConstraint) {
                            /* We are sure that this element-constraint combination exists, and we are sure that we ARE overwriting it. */

                            for(var param in definedParameters) {
                                put(newParameters, param, definedParameters[param]);
                            }

                            result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);

                            if(result.successful) {
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

                            for(var param in oldParameters) {
                                put(newParameters, param, oldParameters[param]);
                            }

                            if(overwriteParameter) {
                                //Since overwriteParameter is true, if we find a parameter in definedParameters that already
                                //exists in oldParameters, we'll overwrite the old value with the new one. All this really
                                //entails is iterating over definedParameters and inserting the values into newParameters

                                for(var param in definedParameters) {
                                    put(newParameters, param, definedParameters[param]);
                                }

                                result = validateConstraintDefinition(element, ReverseConstraint[constraintType], newParameters);

                                if(result.successful) {
                                    /* Because we're overwriting, we need to take groups into account. We basically need to see if
                                       we need to remove this constraint-element combination from any group(s). For example, assume
                                       that we originally had the groups "First" and "Second" and then the user sent in "Second"
                                       and "Third". This means that we have to remove this constraint from the "First" group.
                                       So basically, the groups we need to remove the element-constraint combination from can be
                                       found by performing (Go union Gn) - Gn where Go is the old group set and Gn is the new group
                                       set. Since this is a destructive operation, we only want to do it if the constraint definition
                                       validated successfully.
                                     */
                                    overwriteGroups(element, constraintType, definedParameters);
                                }
                            }

                            else {
                                //Since overwriteParameter is false, we will only insert a parameter from definedParameters
                                //if it doesn't exist in oldParameters

                                for(var param in definedParameters) {
                                    if(!oldParameters[param]) {
                                        put(newParameters, param, definedParameters[param]);
                                    }
                                }
                            }
                        }
                    }

                    if(result.successful) {
                        createConstraintFromDefinition(element, ReverseConstraint[constraintType], newParameters);
                    }
                }
            }
        }

        return result;
    }

    function validate(options) {
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
            "000": validateAll,
            "001": validateConstraint,
            "010": validateElement,
            "011": validateElementWithConstraint,
            "100": validateGroups,
            "101": validateGroupsWithConstraint,
            "110": validateGroupsWithElement,
            "111": validateGroupsElementWithConstraint
        };

        validatedConstraints = {}; //clear this out on every run

        //if no arguments were passed in, we initialize options to an empty map
        if(!options) {
            options = {};
        }

        /* default to independent validation for groups i.e., groups are validated independent of each other and will not
           fail early
         */
        if(typeof options.independent == undefined) {
            options.independent = true;
        }

        //Get the actual constraint name
        if(options.constraintType) {
            options.constraintType = ReverseConstraint[options.constraintType];
        }

        //Get the actual group name
        if(options.groups) {
            for(var i = 0; i < options.groups.length; i++) {
                options.groups[i] = ReverseGroup[options.groups[i]];
            }
        }

        return functionTable[generateKey(options)](options);
    }

    function validateAll() {
        var validationResults = new Array();

        for(var group in boundConstraints) {
            if(boundConstraints.hasOwnProperty(group)) {

                var groupElements = boundConstraints[group];

                for(var elementId in groupElements) {
                    if(groupElements.hasOwnProperty(elementId)) {

                        var elementConstraints = groupElements[elementId];

                        for(var elementConstraint in elementConstraints) {
                            if(elementConstraints.hasOwnProperty(elementConstraint)) {

                                var validationResult = validateGroupElementConstraintCombination(group, elementId, elementConstraint);

                                if(validationResult) {
                                    validationResults.push(validationResult);
                                }
                            }
                        }
                    }
                }
            }
        }

        return validationResults;
    }

    function validateConstraint(options) {
        var validationResults = new Array();
        var constraintFound = false;

        for(var group in boundConstraints) {
            if(boundConstraints.hasOwnProperty(group)) {

                var groupElements = boundConstraints[group];

                for(var elementId in groupElements) {
                    if(groupElements.hasOwnProperty(elementId)) {

                        var elementConstraints = groupElements[elementId];

                        if(elementConstraints[options.elementConstraint]) {
                            constraintFound = true;
                            var validationResult = validateGroupElementConstraintCombination(group, elementId, options.elementConstraint);

                            if(validationResult) {
                                validationResults.push(validationResult);
                            }
                        }
                    }
                }
            }
        }

        //We want to let the user know if they used a constraint that has not been defined anywhere. Otherwise, this
        //function returns zero validation results, which can be (incorrectly) interpreted as a successful validation

        if(!constraintFound) {
            throw "Constraint " + elementConstraint + " has not been bound to any element. " + explodeParameters(options);
        }

        return validationResults;
    }

    function validateElement(options) {
        var validationResults = new Array();
        var elementFound = false;

        for(var group in boundConstraints) {
            if(boundConstraints.hasOwnProperty(group)) {

                var groupElements = boundConstraints[group];

                if(groupElements[options.elementId]) {
                    elementFound = true;
                    var elementConstraints = groupElements[options.elementId];

                    for(var elementConstraint in elementConstraints) {
                        if(elementConstraints.hasOwnProperty(elementConstraint)) {

                            var validationResult = validateGroupElementConstraintCombination(group, options.elementId, elementConstraint);

                            if(validationResult) {
                                validationResults.push(validationResult);
                            }
                        }
                    }
                }
            }
        }

        //We want to let the user know if they use an element that does not have any element bound to it. Otherwise, this
        //function returns zero results, which can be (incorrectly) interpreted as a successful validation

        if(!elementFound) {
            throw "No constraints have been bound to element with id " + options.elementId + ". " + explodeParameters(options);
        }

        return validationResults;
    }

    function validateElementWithConstraint(options) {
        var validationResults = new Array();
        var elementFound = false;
        var constraintFound = false;

        for(var group in boundConstraints) {
            if(boundConstraints.hasOwnProperty(group)) {

                var groupElements = boundConstraints[group];
                var elementConstraints = groupElements[options.elementId];

                if(elementConstraints) {
                    elementFound = true;

                    if(elementConstraints[options.elementConstraint]) {
                        constraintFound = true;

                        var validationResult = validateGroupElementConstraintCombination(group, options.elementId, options.elementConstraint);

                        if(validationResult) {
                            validationResults.push(validationResult);
                        }
                    }
                }
            }
        }

        if(!elementFound || !constraintFound) {
            throw "No element with id " + options.elementId + " was found with the constraint " + options.elementConstraint + ". " + explodeParameters(options);
        }

        return validationResults;
    }

    function validateGroups(options) {
        var validationResults = new Array();

        var i = 0;
        var failed = false;
        while(i < options.groups.length && !failed) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if(groupElements) {

                for(var elementId in groupElements) {
                    if(groupElements.hasOwnProperty(elementId)) {

                        var elementConstraints = groupElements[elementId];

                        for(var elementConstraint in elementConstraints) {
                            if(elementConstraints.hasOwnProperty(elementConstraint)) {

                                var validationResult = validateGroupElementConstraintCombination(group, elementId, elementConstraint);

                                if(validationResult) {
                                    validationResults.push(validationResult);
                                }
                            }
                        }
                    }
                }
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
            }

            i++;
            failed = (!option.independent && validationResults.length > 0);
        }

        return validationResults;
    }

    function validateGroupsWithConstraint(options) {
        var validationResults = new Array();

        var i = 0;
        var failed = false;
        while(i < options.groups.length && !failed) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if(groupElements) {
                var constraintFound = false;

                for(var elementId in groupElements) {
                    if(groupElements.hasOwnProperty(elementId)) {

                        var elementConstraints = groupElements[elementId];

                        if(elementConstraints[options.elementConstraint]) {
                            constraintFound = true;
                            var validationResult = validateGroupElementConstraintCombination(group, elementId, options.elementConstraint);

                            if(validationResult) {
                                validationResults.push(validationResult);
                            }
                        }
                    }
                }

                //We want to let the user know if they used a constraint that has not been defined anywhere. Otherwise, this
                //function can return zero validation results, which can be (incorrectly) interpreted as a successful validation

                if(!constraintFound) {
                    throw "Constraint " + options.elementConstraint + " has not been bound to any element under group " + group + ". " + explodeParameters(options);
                }
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
            }

            i++;
            failed = (!option.independent && validationResults.length > 0);
        }

        return validationResults;
    }

    function validateGroupsWithElement(options) {
        var validationResults = new Array();
        var elementFound = false;

        var i = 0;
        var failed = false;
        while(i < options.groups.length && !failed) {
            var group = options.groups[i];

            var groupElements = boundConstraints[group];
            if(groupElements) {

                var elementConstraints = groupElements[options.elementId];
                if(elementConstraints) {
                    elementFound = true;

                    for(var elementConstraint in elementConstraints) {
                        if(elementConstraints.hasOwnProperty(elementConstraint)) {

                            var validationResult = validateGroupElementConstraintCombination(group, options.elementId, elementConstraint);

                            if(validationResult) {
                                validationResults.push(validationResult);
                            }
                        }
                    }
                }
            }

            else {
                throw "Undefined group in group list. " + explodeParameters(options);
            }

            i++;
            failed = (!option.independent && validationResults.length > 0);
        }

        if(!elementFound) {
            throw "No element with id " + options.elementId + " was found in any of the groups in: [" + explode(options.groups, ",").replace(/,/g, ", ") + "]. " + explodeParameters(options);
        }

        return validationResults;
    }

    function validateGroupsElementWithConstraint(options) {
        var validationResults = new Array();

        var i = 0;
        var failed = false;
        while(i < options.groups.length && !failed) {
            var group = options.groups[i];
            var validationResult = validateGroupElementConstraintCombination(group, options.elementId, options.elementConstraint);

            if(validationResult) {
                validationResults.push(validationResult);
            }

            i++;
            failed = (!option.independent && validationResults.length > 0);
        }

        return validationResults;
    }

    function validateGroupElementConstraintCombination(group, elementId, elementConstraint) {
        var validationResult;
        var groupElements = boundConstraints[group];

        if(!groupElements) {
            throw "Undefined group in group list";
        }

        var elementConstraints = groupElements[elementId];

        if(!validatedConstraints[elementId]) {
            validatedConstraints[elementId] = {};
        }

        //Validate this constraint only if we haven't already validated it during this validation run
        if(!validatedConstraints[elementId][elementConstraint]) {
            if(!elementConstraints) {
                throw "No constraints have been defined for the element with id: " + elementId;
            }

            else {
                var params = elementConstraints[elementConstraint];

                if(!params) {
                    throw elementConstraint + " hasn't been bound to the element with id " + elementId;
                }

                else {
                    //var validatorParams = {};
                    var constraintPassed = false;
                    var failingElements = new Array();
                    var element = document.getElementById(elementId);

                    /*for(var i = 0; i < params.length; i++) {
                        validatorParams[params[i].name] = params[i].value;
                    }*/

                    if(constraintsMap[elementConstraint].formSpecific) {
                        failingElements = constraintsMap[elementConstraint].validator.call(element, params);
                        constraintPassed = failingElements.length == 0;
                    }

                    else {
                        constraintPassed = constraintsMap[elementConstraint].validator.call(element, params);

                        if(!constraintPassed) {
                            failingElements.push(element)
                        }
                    }

                    if(!constraintPassed) {
                        var errorMessage = "";

                        if(params["message"]) {
                            errorMessage = params["message"];
                        }

                        else if(params["msg"]) {
                            errorMessage = params["msg"];
                        }

                        else {
                            errorMessage = constraintsMap[elementConstraint].defaultMessage;
                        }

                        for(var param in params) {
                            if(params.hasOwnProperty(param)) {
                                var re = new RegExp("{" + param + "}", "g");
                                errorMessage = errorMessage.replace(re, params[param]);
                            }
                        }

                        if(/{label}/.test(errorMessage)) {
                            var friendlyInputName = friendlyInputNames[element.tagName.toLowerCase()];

                            if(!friendlyInputName) {
                                friendlyInputName = friendlyInputNames[element.type.toLowerCase()];
                            }

                            errorMessage = errorMessage.replace(/{label}/, friendlyInputName);
                        }

                        //not sure if this is just a hack or not. But I'm trying to replace doubly-escaped quotes. This
                        //usually happens if the data-constraints attribute is surrounded by double quotes instead of
                        //single quotes
                        errorMessage = errorMessage.replace(/\\\"/g, "\"");

                        validationResult = {
                            group: group,
                            constraintName: elementConstraint,
                            custom: constraintsMap[elementConstraint].custom,
                            constraintParameters: params,
                            definedParameterValueMap: params,
                            failingElements: failingElements,
                            message: errorMessage
                        };
                    }

                    validatedConstraints[elementId][elementConstraint] = true; //mark this element constraint as validated
                }
            }
        }

        return validationResult;
    }

    return {
        bind: bind,
        validate: validate,
        custom: custom,
        override: override,
        Constraint: Constraint,
        Group: Group
    };
})();
