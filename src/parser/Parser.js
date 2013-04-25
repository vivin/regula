/**
 * Contains the logic for the recursive-descent parser that parses constraint-definition strings
 * @type {{parse: Function}}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "utils/MapUtils",
            "service/ExceptionService",
            "service/ConstraintService"
        ], factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.Parser = factory(
            root.regulaModules.MapUtils,
            root.regulaModules.ExceptionService,
            root.regulaModules.ConstraintService
        );
    }
}(this, function (MapUtils, ExceptionService, ConstraintService) {


    /** A few utility functions that are used by the parser, but are not directly related to parsing **/

    /**
     * Removes leading and trailing whitespaces from a string
     * @param str
     * @returns {string}
     */
    function trim(str) {
        return str ? str.replace(/^\s+/, "").replace(/\s+$/, "") : "";
    }

    /**
     * Returns the first element of an array. Does not modify the array.
     * @param arr
     * @returns {*}
     */
    function peek(arr) {
        return arr[0];
    }

    /**
     * Tokenizes a string into tokens based on the options provided
     * @param options
     * @returns {Array}
     */
    function tokenize(options) {
        var str = options.str;
        var delimiters = options.delimiters.split("");
        var returnDelimiters = options.returnDelimiters || false;
        var returnEmptyTokens = options.returnEmptyTokens || false;
        var tokens = [];
        var lastTokenIndex = 0;

        for (var i = 0; i < str.length; i++) {
            if (MapUtils.exists(delimiters, str.charAt(i))) {
                var token = str.substring(lastTokenIndex, i);

                if (token.length == 0) {
                    if (returnEmptyTokens) {
                        tokens.push(token);
                    }
                } else {
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
            } else {
                tokens.push(token);
            }
        }

        return tokens;
    }

    /**
     * This is the parser that parses constraint definitions. The recursive-descent parser is actually defined inside
     * the 'parse' function (I've used inner functions to encapsulate the parsing logic).
     *
     * This function parses the constraint-definition string on an element. If errors are encountered during parsing,
     * exceptions are thrown. If parsing is successful, then the constraint-definition string is reified into actual
     * constraints along with their parameters and their values. This information is then returned to the calling
     * function.
     *
     * @param element
     * @param constraintDefinitionString
     * @returns {{successful: boolean, message: string, data: null}}
     */

    function parse(element, constraintDefinitionString) {

        var currentConstraintName = "";
        var tokens = tokenize({
            str: trim(constraintDefinitionString.replace(/\s*\n\s*/g, "")),
            delimiters: "@()[]=,\"\\/-\\.",
            returnDelimiters: true,
            returnEmptyTokens: false
        });

        return constraints(tokens);


        /** the recursive-descent parser starts here **/
        /** it parses according to the following EBNF **/

        /**
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

         **/

        function constraints(tokens) {
            var result = {
                successful: true,
                message: "",
                data: null
            };

            var constraintsToAttach = [];

            while (tokens.length > 0 && result.successful) {
                result = constraint(tokens);
                constraintsToAttach.push(result.data);
            }

            result.data = constraintsToAttach;

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
            if (trim(token).length == 0) {
                token = tokens.shift();
            }

            if (token == "@") {
                result = constraintDef(tokens)
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid constraint. Constraint definitions need to start with '@'") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function constraintDef(tokens) {
            var alias = {
                Between: "Range",
                Matches: "Pattern",
                Empty: "Blank",
                NotEmpty: "NotBlank",
                IsAlpha: "Alpha",
                IsNumeric: "Integer",
                IsAlphaNumeric: "AlphaNumeric"
            };

            var result = constraintName(tokens);

            if (result.successful) {
                currentConstraintName = result.data;

                currentConstraintName = alias[currentConstraintName] ? alias[currentConstraintName] : currentConstraintName;

                if (ConstraintService.constraintDefinitions[currentConstraintName]) {
                    result = paramDef(tokens);

                    if (result.successful) {
                        result = ConstraintService.verifyConstraintDefinition(element, currentConstraintName, result.data);

                        if (result.successful) {
                            var definedParameters = result.data;
                            result.data = {
                                element: element,
                                constraintName: currentConstraintName,
                                definedParameters: definedParameters
                            };
                        }
                    }
                } else {
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it") + " " + result.message,
                        data: null
                    };
                }
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid constraint name in constraint definition") + " " + result.message,
                    data: null
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
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid starting character for constraint name. Can only include A-Z, a-z, and _") + " " + result.message,
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

            if (!/[A-Za-z_]/.test(character) || typeof character === "undefined" || character == null) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid starting character"),
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

            if (!/[0-9A-Za-z_]/.test(character)) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid character in identifier. Can only include 0-9, A-Z, a-z, and _") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function paramDef(tokens) {
            var result = {
                successful: true,
                message: "",
                data: {}
            };

            if (peek(tokens) == "(") {
                tokens.shift(); // get rid of the (

                var data = {};

                if (peek(tokens) == ")") {
                    tokens.shift(); //get rid of the )
                } else {
                    result = param(tokens);

                    if (result.successful) {
                        MapUtils.put(data, result.data.name, result.data.value);

                        //get rid of spaces
                        if (trim(peek(tokens)).length == 0) {
                            tokens.shift();
                        }

                        while (tokens.length > 0 && peek(tokens) == "," && result.successful) {

                            tokens.shift();
                            result = param(tokens);

                            if (result.successful) {
                                MapUtils.put(data, result.data.name, result.data.value);

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
                                    successful: false,
                                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Cannot find matching closing ) in parameter list") + " " + result.message,
                                    data: null
                                };
                            } else {
                                result.data = data;
                            }
                        }
                    } else {
                        result = {
                            successful: false,
                            message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid parameter definition") + " " + result.message,
                            data: null
                        };
                    }
                }
            } else if (peek(tokens) !== undefined && peek(tokens) != "@") {
                //The next token MUST be a @ if we are expecting further constraints
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Unexpected character '" + peek(tokens) + "'" + " after constraint definition") + " " + result.message,
                    data: null
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
                            name: parameterName,
                            value: result.data
                        };
                    } else {
                        result = {
                            successful: false,
                            message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid parameter value") + " " + result.message,
                            data: null
                        };
                    }
                } else {
                    tokens.unshift(token);
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "'=' expected after parameter name" + " " + result.message),
                        data: null
                    };
                }
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid parameter name. You might have unmatched parentheses") + " " + result.message,
                    data: null
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
                successful: false,
                message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid starting character for parameter name. Can only include A-Z, a-z, and _"),
                data: null
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
                } else {
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid starting character for parameter name. Can only include A-Z, a-z, and _") + " " + result.message,
                        data: null
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
                successful: true,
                message: "",
                data: []
            };

            if (peek(tokens) == ")") {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Parameter value expected") + " " + result.message,
                    data: null
                };
            } else {
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
                                        successful: false,
                                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Parameter value must be a number, quoted string, regular expression, or a boolean") + " " + message,
                                        data: null
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
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Parameter value is not a number") + " " + result.message,
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

            if (token == "-") {
                result = positive(tokens);
                if (result.successful) {
                    result.data = token + result.data;
                }
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a negative number"),
                    data: null
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
            } else {
                result = fractional(tokens);
            }

            if (!result.successful) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a positive number") + " " + result.message,
                    data: null
                };
            }

            return result;
        }

        function fractional(tokens) {

            var token = tokens.shift(); //get rid of the .
            var result = integer(tokens);

            if (result.successful) {
                result.data = token + result.data;
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a valid fraction"),
                    data: null
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
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a valid integer") + " " + result.message,
                    data: []
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

            if (!/[0-9]/.test(character)) {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a valid digit"),
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

            if (token == "\"") {
                var done = false;

                while (tokens.length > 0 && result.successful && !done) {

                    if (peek(tokens) == "\"") {
                        done = true;
                        tokens.shift(); //get rid of "
                    } else {
                        result = character(tokens);
                        data += result.data;
                    }
                }

                if (!done) {
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Unterminated string literal"),
                        data: null
                    };
                }
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid quoted string"),
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

            if (token == "\\") {
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

            if (token == "/") {
                data = token;
                var done = false;

                while (tokens.length > 0 && result.successful && !done) {

                    if (peek(tokens) == "/") {
                        data += tokens.shift();
                        done = true;
                    } else {
                        result = character(tokens);
                        data += result.data;
                    }
                }

                if (!done) {
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Unterminated regex literal"),
                        data: null
                    };
                }
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a regular expression"),
                    data: null
                };
            }

            result.successful = result.successful && done;
            result.data = data;
            return result;
        }

        function booleanValue(tokens) {
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if (trim(token) == "true" || trim(token) == "false") {
                result = {
                    successful: true,
                    message: "",
                    data: !!(token === "true")
                };
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a boolean"),
                    data: null
                };
            }

            return result;
        }

        function groupDefinition(tokens) {
            var data = [];
            var token = tokens.shift();
            var result = {
                successful: true,
                message: "",
                data: null
            };

            if (token == "[") {

                //get rid of spaces
                if (trim(peek(tokens)).length == 0) {
                    tokens.shift();
                }

                if (peek(tokens) == "]") {
                    result = {
                        successful: true,
                        message: "",
                        data: ""
                    };
                } else {
                    result = group(tokens);
                }

                if (result.successful) {
                    data.push(result.data);

                    //get rid of spaces
                    if (trim(peek(tokens)).length == 0) {
                        tokens.shift();
                    }

                    while (tokens.length > 0 && peek(tokens) == "," && result.successful) {
                        tokens.shift();
                        result = group(tokens);

                        data.push(result.data);

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
                            successful: false,
                            message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Cannot find matching closing ] in group definition") + " " + result.message,
                            data: null
                        };
                    }
                } else {
                    result = {
                        successful: false,
                        message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid group definition") + " " + result.message,
                        data: null
                    };
                }
            } else {
                tokens.unshift(token);
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Not a valid group definition"),
                    data: null
                };
            }

            return result;
        }

        function group(tokens) {
            var result = {
                successful: true,
                message: "",
                data: ""
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
            } else {
                result = {
                    successful: false,
                    message: ExceptionService.generateExceptionMessage(element, currentConstraintName, "Invalid starting character for group name. Can only include A-Z, a-z, and _") + " " + result.message,
                    data: null
                };
            }

            return result;
        }
    }

    return {
        parse: parse
    };
}));