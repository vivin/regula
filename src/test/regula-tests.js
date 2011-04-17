
function createInputElement(id, definition, type) {
    var $input = (type != "select") ? jQuery("<input />") : jQuery("<select />");
    var _type = type || "hidden";

    if(type != "select") {
       $input.attr("type", _type);
    }

    $input.attr("id", id);
    $input.attr("class", "regula-validation");
    $input.attr("data-constraints", definition);
    $input.hide();

    jQuery("body").append($input);

    return $input;
}

function deleteInputElement(id) {
    jQuery("#" + id).remove();
}

/*
 The constraint-definition-parsing (success) tests make sure that no exceptions are raised. Since there is
 no return value from a successful bind(), I check to see that the return value is undefined. If there is
 any error during binding, an exception is raised.
 */
module("Constraint-definition parsing tests");

test('Test empty definition', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "");

    equals(regula.bind(), undefined, "Calling bind() on an element with no constraints must not return anything");

    deleteInputElement(inputElementId);
});

test('Test definition with one space', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, " ");

    equals(regula.bind(), undefined, "Calling bind() on an element where the constraint definition is just a space, must not return anything");

    deleteInputElement(inputElementId);
});

test('Test definition with only spaces', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "   ");

    equals(regula.bind(), undefined, "Calling bind() on an element where the constraint definition just has spaces, must not return anything");

    deleteInputElement(inputElementId);
});

test('Test definition without a name throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition that does not start with @ throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint. Constraint definitions need to start with '@'");
    raises(regula.bind, expectedExceptionMessage, "'ThisShouldFail' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with invalid starting-character 3 throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@3ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@3ThisShouldFail' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with invalid starting-character + throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@+ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@+ThisShouldFail' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition containing invalid character + throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@This+ShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid character in identifier. Can only include 0-9, A-Z, a-z, and _");
    raises(regula.bind, expectedExceptionMessage, "'@This+ShouldFail' should not be a valid definition");

    deleteInputElement(inputElementId);
});


//We use raises here because the constraint names we are using aren't defined. So we expect an exception.

test('Test definition with one starting character', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@_");

    var expectedExceptionMessage =  new RegExp(inputElementId + "._: I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it");
    raises(regula.bind, expectedExceptionMessage, "'@_' should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with valid characters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@_This3Isavalid__Constraint");

    var expectedExceptionMessage =  new RegExp(inputElementId + "._This3Isavalid__Constraint: I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it");
    raises(regula.bind, expectedExceptionMessage, "'@_This3Isavalid__' should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with no parentheses and no parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank");

    equals(regula.bind(), undefined, "@NotBlank should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition without closing parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                               inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                               inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition without opening parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank)");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".NotBlank: Unexpected character '\\)' after constraint definition");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank)' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with balanced parentheses and no parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank()");

    equals(regula.bind(), undefined, "@NotBlank() should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value expected");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (3)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=value)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value must be a number, quoted string, regular expression, or a boolean " +
                                              inputElementId + ".NotBlank: Not a valid group definition " +
                                              inputElementId + ".NotBlank: Not a boolean " +
                                              inputElementId + ".NotBlank: Not a regular expression " +
                                              inputElementId + ".NotBlank: Invalid quoted string " +
                                              inputElementId + ".NotBlank: Parameter value is not a number " +
                                              inputElementId + ".NotBlank: Not a positive number " +
                                              inputElementId + ".NotBlank: Not a valid integer " +
                                              inputElementId + ".NotBlank: Not a valid digit");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=value) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (4)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Parameter value is not a number");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12a) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (5)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-12a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Parameter value is not a number");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=-12a) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (6)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value must be a number, quoted string, regular expression, or a boolean " +
                                              inputElementId + ".NotBlank: Not a valid group definition " +
                                              inputElementId + ".NotBlank: Not a boolean " +
                                              inputElementId + ".NotBlank: Not a regular expression " +
                                              inputElementId + ".NotBlank: Invalid quoted string " +
                                              inputElementId + ".NotBlank: Parameter value is not a number " +
                                              inputElementId + ".NotBlank: Not a positive number " +
                                              inputElementId + ".NotBlank: Not a valid integer " +
                                              inputElementId + ".NotBlank: Not a valid digit");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=-a) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (7)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated string literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\") should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (8)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\\\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated string literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\"\\\") should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (9)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\\\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value must be a number, quoted string, regular expression, or a boolean " +
                                              inputElementId + ".NotBlank: Not a valid group definition " +
                                              inputElementId + ".NotBlank: Not a boolean " +
                                              inputElementId + ".NotBlank: Not a regular expression " +
                                              inputElementId + ".NotBlank: Invalid quoted string " +
                                              inputElementId + ".NotBlank: Parameter value is not a number " +
                                              inputElementId + ".NotBlank: Not a positive number " +
                                              inputElementId + ".NotBlank: Not a valid integer " +
                                              inputElementId + ".NotBlank: Not a valid digit");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\\\") should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (10)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=/)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated regex literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=/) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (11)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=/\\/)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated regex literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=/\\/) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (12)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\\/)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value must be a number, quoted string, regular expression, or a boolean " +
                                              inputElementId + ".NotBlank: Not a valid group definition " +
                                              inputElementId + ".NotBlank: Not a boolean " +
                                              inputElementId + ".NotBlank: Not a regular expression " +
                                              inputElementId + ".NotBlank: Invalid quoted string " +
                                              inputElementId + ".NotBlank: Parameter value is not a number " +
                                              inputElementId + ".NotBlank: Not a positive number " +
                                              inputElementId + ".NotBlank: Not a valid integer " +
                                              inputElementId + ".NotBlank: Not a valid digit");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\\/) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (13)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (14)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[0)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[0) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (15)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[G)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[G)' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (16)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group)' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (17)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,)' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (18)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,G)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,G)' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (19)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,Group)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,Group)' should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (20)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param,) should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with malformed parameters (21)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=10,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                              inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _ " +
                                              inputElementId + ".NotBlank: Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=10,) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (21)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=10,param2)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=10,param2) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (22)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(2)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                              inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _ " +
                                              inputElementId + ".NotBlank: Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(2) should not be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (23)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12.)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Not a valid fraction");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.) should not be a valid definition");
    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (24)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12.a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Not a valid fraction");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.a) should not be a valid definition");
    deleteInputElement(inputElementId);
});


test('Test definition with malformed parameters (25)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[10])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid starting character for group name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.a) should not be a valid definition");
    deleteInputElement(inputElementId);
});

test('Test definition with valid boolean parameter-value (true)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=true)");

    equals(regula.bind(), undefined, "@NotBlank(param=true) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with valid boolean parameter-value (false)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=false)");

    equals(regula.bind(), undefined, "@NotBlank(param=false) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with positive integer as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2)");

    equals(regula.bind(), undefined, "@NotBlank(param=2) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with negative integer as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-2)");

    equals(regula.bind(), undefined, "@NotBlank(param=-2) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with positive real number as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=2.5) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with negative real number as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-2.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=-2.5) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with positive real number (with only fractional part) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=.5) should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with negative real number (with only fractional part) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=-.5) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with empty string as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with non-empty string as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"some text here\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"some text here\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with string containing escaped quotes as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\\\"\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"\\\"\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with string containing escaped quotes as a parameter (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"this is a\\\"test\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"this is a\\\"test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with empty group-definition as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[]) should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test definition with group-definition (with one group) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup]) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with group-definition (with more than one group) as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup]) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with group-definition (with more than one group) as a parameter (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition with multiple valid parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteInputElement(inputElementId);
});

module("Test binding constraints to elements, via HTML");

test('Test binding @Checked through markup to a non-checkbox/non-radio-button element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Checked: @Checked is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button");
    raises(regula.bind, expectedExceptionMessage, "@Checked should not be bound to a non-checkbox/non-radio-button element");

    deleteInputElement(inputElementId);
});

test('Test binding @Checked (without parameters) through markup to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked", "checkbox");

    equals(regula.bind(), undefined, "@Checked should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Checked (without parameters) through markup to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked", "radio");

    equals(regula.bind(), undefined, "@Checked should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Checked (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(label=\"test\")", "checkbox");

    equals(regula.bind(), undefined, "@Checked(label=\"test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Checked (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(message=\"This is a test\")", "checkbox");

    equals(regula.bind(), undefined, "@Checkbox(message=\"This is a test\") should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test binding @Checked (with message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(label=\"test\", message=\"This is a test\")", "checkbox");

    equals(regula.bind(), undefined, "@Checkbox(label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Selected through markup to a non-select element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Selected: @Selected is only applicable to select boxes. You are trying to bind it to an input element that is not a select box");
    raises(regula.bind, expectedExceptionMessage, "@Selected should not be bound to a non-select-box element");

    deleteInputElement(inputElementId);
});

test('Test binding @Selected (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected", "select");

    equals(regula.bind(), undefined, "@Selected should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Selected (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(label=\"test\")", "select");

    equals(regula.bind(), undefined, "@Selected(label=\"test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Selected (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(message=\"This is a test\")", "select");

    equals(regula.bind(), undefined, "@Selected(message=\"This is a test\") should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test binding @Selected (with message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(label=\"test\", message=\"This is a test\")", "select");

    equals(regula.bind(), undefined, "@Selected(label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Required (without parameters) through markup to an input element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Required (without parameters) through markup to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "checkbox");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Required (without parameters) through markup to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "checkbox");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Required (without parameters) through markup to a select', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "select");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameters\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameters\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameters\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (with optional label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(label=\"test\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameters\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10)");

    equals(regula.bind(), undefined, "@Max(value=10) should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test binding @Max (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Max(value=10, label=\"test\") should be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test binding @Max (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Max(value=10, label=\"test\") should be a valid definition");

    deleteInputElement(inputElementId);
});


test('Test binding @Max (with required parameter and optional label and message parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, label=\"test\", message=\"This is a test\")");

    equals(regula.bind(), undefined, "@Max(value=10, label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteInputElement(inputElementId);
});
