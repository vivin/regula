/*
 Regula: An annotation-based form-validation framework in Javascript
 Written By Vivin Paliath (http://vivin.net)
 License: BSD License
 Copyright (C) 2010
 */

/* for code completion */
var regula = {
    bind: function() {},
    custom: function(options) {},
    override: function(options) {},
    validate: function() {},
    ConstraintType: {}
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

    var ConstraintType = {
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

    var ReverseConstraintType = {
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

    var constraintsMap = {
        Checked: {
            formSpecific: false,
            validator: checked,
            type: ConstraintType.Checked,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be checked."
        },

        Selected: {
            formSpecific: false,
            validator: selected,
            type: ConstraintType.Selected,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be selected."
        },

        Max: {
            formSpecific: false,
            validator: max,
            type: ConstraintType.Max,
            custom: false,
            params: ["value"],
            defaultMessage: "{label} needs to be lesser than or equal to {value}."
        },

        Min: {
            formSpecific: false,
            validator: min,
            type: ConstraintType.Min,
            custom: false,
            params: ["value"],
            defaultMessage: "{label} needs to be greater than or equal to {value}."
        },

        Range: {
            formSpecific: false,
            validator: range,
            type: ConstraintType.Range,
            custom: false,
            params: ["max", "min"],
            defaultMessage: "{label} needs to be between {max} and {min}."
        },

        NotEmpty: {
            formSpecific: false,
            validator: notEmpty,
            type: ConstraintType.NotEmpty,
            custom: false,
            params: [],
            defaultMessage: "{label} cannot be empty."
        },

        Empty: {
            formSpecific: false,
            validator: empty,
            type: ConstraintType.Empty,
            custom: false,
            params: [],
            defaultMessage: "{label} needs to be empty."
        },

        Pattern: {
            formSpecific: false,
            validator: matches,
            type: ConstraintType.Pattern,
            custom: false,
            params: ["regexp"],
            defaultMessage: "{label} needs to match {regexp}{flags}."
        },

        Email: {
            formSpecific: false,
            validator: email,
            type: ConstraintType.Email,
            custom: false,
            params: [],
            defaultMessage: "{label} is not a valid email."
        },

        IsAlpha: {
            formSpecific: false,
            validator: isAlpha,
            type: ConstraintType.IsAlpha,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain letters."
        },

        IsNumeric: {
            formSpecific: false,
            validator: isNumeric,
            type: ConstraintType.IsNumeric,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain numbers."
        },

        IsAlphaNumeric: {
            formSpecific: false,
            validator: isAlphaNumeric,
            type: ConstraintType.IsAlphaNumeric,
            custom: false,
            params: [],
            defaultMessage: "{label} can only contain numbers and letters."
        },

        CompletelyFilled: {
            formSpecific: true,
            validator: completelyFilled,
            type : ConstraintType.CompletelyFilled,
            custom: false,
            params: [],
            defaultMessage: "{label} must be completely filled."
        },

        PasswordsMatch: {
            formSpecific: true,
            validator: passwordsMatch,
            type: ConstraintType.PasswordsMatch,
            custom: false,
            params: ["field1", "field2"],
            defaultMessage: "Passwords do not match."
        },

        Required: {
            formSpecific: false,
            validator: required,
            type: ConstraintType.Required,
            custom: false,
            params: [],
            defaultMessage: "{label} is required."
        }
    };

    var elementsWithTheirConstraints = {};

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
            delimiters: "@()=,\"\\/-",
            returnDelimiters: true,
            returnEmptyTokens: false
        });

        elementsWithTheirConstraints[element.id] = {};

        return constraints(tokens);

        /** utility functions. i.e., functions not directly related to parsing start here **/

        function trim(str) {
            return str.replace(/^\s+/, "").replace(/\s+$/, "");
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

        function exists(array, value) {
            var found = false;
            var i = 0;

            while(!found && i < array.length) {
                found = value == array[i];
                i++;
            }

            return found;
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

        function validateConstraintDefinition(element, constraintName, constraintDefinition) {
            var matchingParams = 0;
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

            else if(constraintDefinition.length < constraintsMap[constraintName].params.length) {
                result = {
                    successful: false,
                    message: constraintName + " expects at least " + constraintsMap[constraintName].params.length +
                             " parameter(s). However, you have provided only " + constraintDefinition.length,
                    data: null
                };
            }

            else {
                for(var i = 0; i < constraintDefinition.length; i++) {
                    if(exists(constraintsMap[constraintName].params, constraintDefinition[i].name)) {
                        matchingParams++;
                    }
                }

                if(matchingParams < constraintsMap[constraintName].params.length) {
                    var missingParams = constraintsMap[constraintName].params.length - matchingParams;

                    result = {
                        successful: false,
                        message: constraintName + " has " + constraintsMap[constraintName].params.length +
                                 " required parameter(s). You seem to have provided some optional or required parameters, but you are still missing " + missingParams + " parameter(s).",
                        data: null
                    };
                }
            }

            return result;
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
            param-def              ::= [ "(", [ param | { ",", param } ], ")" ]
            param                  ::= param-name, "=", param-value
            param-name             ::= valid-starting-char { valid-char }
            param-value            ::= number | quoted-string | regular-expression | boolean
            number                 ::= positive | negative
            negative               ::= "-", positive
            positive               ::= digit { digit }
            quoted-string          ::= "\"", { char }, "\""
            boolean                ::= true | false
            char                   ::= .
            regular-expression     ::= "/", { char }, "/"
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
                    elementsWithTheirConstraints[element.id][currentConstraintName] = new Array();
                    result = paramDef(tokens);

                    if(result.successful) {
                        result = validateConstraintDefinition(element, currentConstraintName, elementsWithTheirConstraints[element.id][currentConstraintName]);
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
                data: null
            };

            if(peek(tokens) == "(") {
                tokens.shift(); // get rid of the (

                result = param(tokens);

                //get rid of spaces
                if(trim(peek(tokens)).length == 0) {
                    tokens.shift();
                }

                while(tokens.length > 0 && peek(tokens) == "," && result.successful) {

                    tokens.shift();
                    result = param(tokens);

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

                        elementsWithTheirConstraints[element.id][currentConstraintName].push(param);
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
                            result = {
                                successful: false,
                                message: generateErrorMessage(element, currentConstraintName, "Invalid parameter value. Must be a number, quoted string, regular expression, or a boolean") + " " + result.message,
                                data: null
                            };
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
            ConstraintType[name] = firstCustomIndex;
            ReverseConstraintType[firstCustomIndex++] = name;
            constraintsMap[name] = {
                formSpecific: formSpecific,
                validator: validator,
                type: ConstraintType[name],
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

        if(!ConstraintType[name]) {
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
                type: ConstraintType[name],
                custom: true,
                params: params,
                defaultMessage: defaultMessage
            };
        }
    }

    function bind() {
        var elementsWithConstraints = getElementsByClassName("regula-validation");

        for(var i = 0; i < elementsWithConstraints.length; i++) {
            var element = elementsWithConstraints[i];
            var tagName = element.tagName.toLowerCase();

            if(tagName != "form" && tagName != "select" && tagName != "textarea" && tagName != "input") {
                throw tagName + "#" + element.id + " is not an input, select, or form element! Validation constraints can only be attached to input, select, or form elements.";
            }

            else {
                var dataConstraintsAttribute = element.getAttribute("data-constraints");
                var result = parse(element, dataConstraintsAttribute);

                if(!result.successful) {
                    throw result.message;
                }
            }
        }
    }

    function validate() {
        var validationResults;

        if(arguments.length == 0) {
            validationResults = validateAll();
        }

        else if(arguments.length == 1) {
            validationResults = validateElement(arguments[0]);
        }

        else if(arguments.length == 2) {
            validationResults = validateElementWithConstraint(arguments[0], ReverseConstraintType[arguments[1]]);
        }

        else {
            throw "regula.validate() called with wrong number of arguments. Valid number of arguments are 0, 1, and 2"
        }

        return validationResults;
    }

    function validateAll() {
        var validationResults = new Array();

        for(var elementId in elementsWithTheirConstraints) {

            if(elementsWithTheirConstraints.hasOwnProperty(elementId)) {

                var elementConstraints = elementsWithTheirConstraints[elementId];

                for(var elementConstraint in elementConstraints) {
                    if(elementConstraints.hasOwnProperty(elementConstraint)) {
                        var validationResult = validateElementWithConstraint(elementId, elementConstraint);

                        if(validationResult) {
                            validationResults.push(validationResult);
                        }
                    }
                }
            }
        }

        return validationResults;
    }

    function validateElement(elementId) {
        var validationResults = new Array();
        var elementConstraints = elementsWithTheirConstraints[elementId];

        if(!elementConstraints) {
            throw "No constraints have been defined for the element with id: " + elementId;
        }

        else {
            for(var elementConstraint in elementConstraints) {
                if(elementConstraints.hasOwnProperty(elementConstraint)) {
                    var validationResult = validateElementWithConstraint(elementId, elementConstraint);

                    if(validationResult) {
                        validationResults.push(validationResult);
                    }
                }
            }
        }

        return validationResults;
    }

    function validateElementWithConstraint(elementId, elementConstraint) {
        var validationResult;
        var elementConstraints = elementsWithTheirConstraints[elementId];

        if(!elementConstraints) {
            throw "No constraints have been defined for the element with id: " + elementId;
        }

        else {
            var params = elementConstraints[elementConstraint];

            if(!params) {
                throw elementConstraint + " hasn't been bound to the element with id " + elementId;
            }

            else {
                var validatorParams = {};
                var constraintPassed = false;
                var failingElements = new Array();
                var element = document.getElementById(elementId);

                for(var i = 0; i < params.length; i++) {
                    validatorParams[params[i].name] = params[i].value;
                }

                if(constraintsMap[elementConstraint].formSpecific) {
                    failingElements = constraintsMap[elementConstraint].validator.call(element, validatorParams);
                    constraintPassed = failingElements.length == 0;
                }

                else {
                    constraintPassed = constraintsMap[elementConstraint].validator.call(element, validatorParams);

                    if(!constraintPassed) {
                        failingElements.push(element)
                    }
                }

                if(!constraintPassed) {
                    var errorMessage = "";

                    if(validatorParams["message"]) {
                        errorMessage = validatorParams["message"];
                    }

                    else if(validatorParams["msg"]) {
                        errorMessage = validatorParams["msg"];
                    }

                    else {
                        errorMessage = constraintsMap[elementConstraint].defaultMessage;
                    }

                    for(var param in validatorParams) {
                        if(validatorParams.hasOwnProperty(param)) {
                            var re = new RegExp("{" + param + "}", "g");
                            errorMessage = errorMessage.replace(re, validatorParams[param]);
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
                        constraintName: elementConstraint,
                        custom: constraintsMap[elementConstraint].custom,
                        constraintParameters: params,
                        receivedParameters: validatorParams,
                        failingElements: failingElements,
                        message: errorMessage
                    };
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
        ConstraintType: ConstraintType
    };
})();
