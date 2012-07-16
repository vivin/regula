function createInputElement(id, definition, type) {
    var $input = (type != "select" && type != "textarea") ? jQuery("<input />") : jQuery("<" + type + "/>");
    var _type = type || "hidden";

    if(type != "select" && type != "textarea") {
        $input.attr("type", _type);
        $input.val("");
    }

    $input.attr("id", id);

    if(typeof definition != "undefined") {
       $input.attr("data-constraints", definition);
    }

    $input.attr("class", "regula-test-element");

    $input.hide();

    jQuery("body").append($input);

    return $input;
}

function createFormElement(id, definition) {
    var $form = jQuery("<form />");
    $form.attr("id", id);
    $form.attr("data-constraints", definition);
    $form.attr("class", "regula-test-element");
    $form.hide();

    jQuery("body").append($form);

    return $form;
}

function deleteElements() {
    jQuery(".regula-test-element").remove();
    regula.unbind();
}

/*
 The constraint-definition-parsing (success) tests make sure that no exceptions are raised. Since there is
 no return value from a successful bind(), I check to see that the return value is undefined. If there is
 any error during binding, an exception is raised.
 */

module('Constraint-definition parsing tests');



test('Test empty definition', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "");

    equals(regula.bind(), undefined, "Calling bind() on an element with no constraints must not return anything");

    deleteElements();
});

test('Test definition with one space', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, " ");

    equals(regula.bind(), undefined, "Calling bind() on an element where the constraint definition is just a space, must not return anything");

    deleteElements();
});

test('Test definition with only spaces', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "   ");

    equals(regula.bind(), undefined, "Calling bind() on an element where the constraint definition just has spaces, must not return anything");

    deleteElements();
});

test('Test definition without a name throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@' should not be a valid definition");

    deleteElements();
});

test('Test definition that does not start with @ throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint. Constraint definitions need to start with '@'");
    raises(regula.bind, expectedExceptionMessage, "'ThisShouldFail' should not be a valid definition");

    deleteElements();
});

test('Test definition with invalid starting-character 3 throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@3ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@3ThisShouldFail' should not be a valid definition");

    deleteElements();
});

test('Test definition with invalid starting-character + throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@+ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@+ThisShouldFail' should not be a valid definition");

    deleteElements();
});

test('Test definition containing invalid character + throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@This+ShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid character in identifier. Can only include 0-9, A-Z, a-z, and _");
    raises(regula.bind, expectedExceptionMessage, "'@This+ShouldFail' should not be a valid definition");

    deleteElements();
});


//We use raises here because the constraint names we are using aren't defined. So we expect an exception.

test('Test definition with one starting character', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@_");

    var expectedExceptionMessage =  new RegExp(inputElementId + "._: I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it");
    raises(regula.bind, expectedExceptionMessage, "'@_' should be a valid definition");

    deleteElements();
});

test('Test definition with valid characters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@_This3Isavalid__Constraint");

    var expectedExceptionMessage =  new RegExp(inputElementId + "._This3Isavalid__Constraint: I cannot find the specified constraint name. If this is a custom constraint, you need to define it before you bind to it");
    raises(regula.bind, expectedExceptionMessage, "'@_This3Isavalid__' should be a valid definition");

    deleteElements();
});

test('Test definition with no parentheses and no parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank");

    equals(regula.bind(), undefined, "@NotBlank should be a valid definition");

    deleteElements();
});

test('Test definition without closing parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                               inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                               inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(' should not be a valid definition");

    deleteElements();
});

test('Test definition without opening parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank)");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".NotBlank: Unexpected character '\\)' after constraint definition");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank)' should not be a valid definition");

    deleteElements();
});

test('Test definition with balanced parentheses and no parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank()");

    equals(regula.bind(), undefined, "@NotBlank() should be a valid definition");

    deleteElements();
});

test('Test definition with unbalanced parentheses and a valid parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing \\) in parameter list");
    raises(regula.bind, expectedExceptionMessage, "'@NotBLank(param=2' should not be a valid definition");

    deleteElements();
});

test('Test definition with valid parameter and spaces after that parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2             )");

    equals(regula.bind(), undefined, "'@NotBlank(param=2             )' should be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param) should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter value " +
                                              inputElementId + ".NotBlank: Parameter value expected");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=) should not be a valid definition");

    deleteElements();
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

    deleteElements();
});

test('Test definition with malformed parameters (4)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Parameter value is not a number");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12a) should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (5)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-12a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Parameter value is not a number");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=-12a) should not be a valid definition");

    deleteElements();
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

    deleteElements();
});

test('Test definition with malformed parameters (7)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated string literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\") should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (8)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\\\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated string literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=\"\\\") should not be a valid definition");

    deleteElements();
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

    deleteElements();
});

test('Test definition with malformed parameters (10)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=/)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated regex literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=/) should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (11)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=/\\/)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Unterminated regex literal");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=/\\/) should not be a valid definition");

    deleteElements();
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

    deleteElements();
});


test('Test definition with malformed parameters (13)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[) should not be a valid definition");

    deleteElements();
});


test('Test definition with malformed parameters (14)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[0)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[0) should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (15)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[G)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[G)' should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (16)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group)' should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (17)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,)' should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (18)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,G)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,G)' should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (19)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=[Group,Group)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Cannot find matching closing ] in group definition ");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=[Group,Group)' should not be a valid definition");

    deleteElements();
});


test('Test definition with malformed parameters (20)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param,) should not be a valid definition");

    deleteElements();
});

test('Test definition with malformed parameters (21)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=10,)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                              inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _ " +
                                              inputElementId + ".NotBlank: Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=10,) should not be a valid definition");

    deleteElements();
});


test('Test definition with malformed parameters (21)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=10,param2)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: '=' expected after parameter name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=10,param2) should not be a valid definition");

    deleteElements();
});


test('Test definition with malformed parameters (22)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(2)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " +
                                              inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses " +
                                              inputElementId + ".NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _ " +
                                              inputElementId + ".NotBlank: Invalid starting character");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(2) should not be a valid definition");

    deleteElements();
});


test('Test definition with malformed parameters (23)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12.)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Not a valid fraction");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.) should not be a valid definition");
    deleteElements();
});


test('Test definition with malformed parameters (24)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=12.a)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Not a valid fraction");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.a) should not be a valid definition");
    deleteElements();
});

test('Test definition with malformed parameters (25)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[10])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid starting character for group name");
    raises(regula.bind, expectedExceptionMessage, "'@NotBlank(param=12.a) should not be a valid definition");
    deleteElements();
});

test('Test definition with valid boolean parameter-value (true)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=true)");

    equals(regula.bind(), undefined, "@NotBlank(param=true) should be a valid definition");

    deleteElements();
});

test('Test definition with valid boolean parameter-value (false)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=false)");

    equals(regula.bind(), undefined, "@NotBlank(param=false) should be a valid definition");

    deleteElements();
});

test('Test definition with positive integer as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2)");

    equals(regula.bind(), undefined, "@NotBlank(param=2) should be a valid definition");

    deleteElements();
});

test('Test definition with negative integer as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-2)");

    equals(regula.bind(), undefined, "@NotBlank(param=-2) should be a valid definition");

    deleteElements();
});

test('Test definition with positive real number as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=2.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=2.5) should be a valid definition");

    deleteElements();
});

test('Test definition with negative real number as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-2.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=-2.5) should be a valid definition");

    deleteElements();
});

test('Test definition with positive real number (with only fractional part) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=.5) should be a valid definition");

    deleteElements();
});

test('Test definition with negative real number (with only fractional part) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=-.5)");

    equals(regula.bind(), undefined, "@NotBlank(param=-.5) should be a valid definition");

    deleteElements();
});

test('Test definition with empty string as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"\") should be a valid definition");

    deleteElements();
});

test('Test definition with non-empty string as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"some text here\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"some text here\") should be a valid definition");

    deleteElements();
});

test('Test definition with string containing escaped quotes as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"\\\"\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"\\\"\") should be a valid definition");

    deleteElements();
});

test('Test definition with string containing escaped quotes as a parameter (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param=\"this is a\\\"test\")");

    equals(regula.bind(), undefined, "@NotBlank(param=\"this is a\\\"test\") should be a valid definition");

    deleteElements();
});

test('Test definition with empty group-definition as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[]) should be a valid definition");

    deleteElements();
});


test('Test definition with group-definition (with one group) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup]) should be a valid definition");

    deleteElements();
});

test('Test definition with group-definition (with more than one group) as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup]) should be a valid definition");

    deleteElements();
});

test('Test definition with group-definition (with more than one group) as a parameter (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteElements();
});

test('Test definition with multiple valid parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals(regula.bind(), undefined, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteElements();
});

test('Test definition with multiple constraints, with one malformed constraint', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @NotBlank(");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " + inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses hiddenInput.NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");

    raises(regula.bind, expectedExceptionMessage, "@NotBlank @NotBlank( is not a valid definition");

    deleteElements()
});

test('Test definition with multiple valid constraints (markup)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equals(regula.bind(), undefined, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test definition with multiple valid constraints (programmatic)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Required},
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    }), undefined, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test definition with multiple valid constraints being bound to multiple elements', function() {
    var $input0 = createInputElement("input0", null, "text");
    var $input1 = createInputElement("input1", null, "text");
    var $input2 = createInputElement("input2", null, "text");

    equals(regula.bind({
        elements: [$input0.get(0), $input1.get(0), $input2.get(0)],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Required},
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    }), undefined, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test definition with multiple valid constraints, and one invalid constraint being bound to multiple elements', function() {
    var $input0 = createInputElement("input0", "@NotBlank @Required @Range(min=5, max=10)");
    var $input1 = createInputElement("input1", "@NotBlank @Required @Range(min=5)");
    var $input2 = createInputElement("input2", "@NotBlank @Required @Range(min=5, max=10)");

    raises(function() {
        regula.bind({
            elements: [$input0.get(0), $input1.get(0), $input2.get(0)]
        });
    }, new RegExp("regula.bind: Element 2 of 3 failed: input1.Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): max"), "regula.bind must fail if one of the elements has an invalid constraint definition");

    deleteElements();
});

module('Test binding pre-defined constraints to elements, via HTML');

test('Test binding @Checked through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Checked");

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Checked cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Checked through markup to a non-checkbox/non-radio-button element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Checked: @Checked is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button");
    raises(regula.bind, expectedExceptionMessage, "@Checked should not be bound to a non-checkbox/non-radio-button element");

    deleteElements();
});

test('Test binding @Checked (without parameters) through markup to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked", "checkbox");

    equals(regula.bind(), undefined, "@Checked should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (without parameters) through markup to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked", "radio");

    equals(regula.bind(), undefined, "@Checked should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(label=\"test\")", "checkbox");

    equals(regula.bind(), undefined, "@Checked(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(message=\"This is a test\")", "checkbox");

    equals(regula.bind(), undefined, "@Checkbox(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(groups=[Test])", "checkbox");

    equals(regula.bind(), undefined, "@Checkbox(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with groups, message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Checked(label=\"test\", message=\"This is a test\", groups=[Test])", "checkbox");

    equals(regula.bind(), undefined, "@Checkbox(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Selected through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Selected");

    var expectedExceptionMessage = new RegExp(formElementId + ".Selected: @Selected is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Selected cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Selected through markup to a non-select element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Selected: @Selected is only applicable to select boxes. You are trying to bind it to an input element that is not a select box");
    raises(regula.bind, expectedExceptionMessage, "@Selected should not be bound to a non-select-box element");

    deleteElements();
});

test('Test binding @Selected (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected", "select");

    equals(regula.bind(), undefined, "@Selected should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(label=\"test\")", "select");

    equals(regula.bind(), undefined, "@Selected(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(message=\"This is a test\")", "select");

    equals(regula.bind(), undefined, "@Selected(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(groups=[Test])", "select");

    equals(regula.bind(), undefined, "@Selected(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with groups, message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Selected(label=\"test\", message=\"This is a test\", groups=[Test])", "select");

    equals(regula.bind(), undefined, "@Selected(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Required through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Required");

    var expectedExceptionMessage = new RegExp(formElementId + ".Required: @Required is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Required cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Required (without parameters) through markup to an input element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through markup to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "checkbox");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through markup to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "radio");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through markup to a select', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required", "select");

    equals(regula.bind(), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required(label=\"test\")");

    equals(regula.bind(), undefined, "@Required(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required(message=\"This is a test\")");

    equals(regula.bind(), undefined, "@Required(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required(groups=[Test])");

    equals(regula.bind(), undefined, "@Required(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with groups, message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Required(label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Required(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Max through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Max");

    var expectedExceptionMessage = new RegExp(formElementId + ".Max: @Max is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Max (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10)");

    equals(regula.bind(), undefined, "@Max(value=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Max(value=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Max(value=10, message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, groups=[Test])");

    equals(regula.bind(), undefined, "@Max(value=10, groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional groups, label and message parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Max(value=10, label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Max(value=10, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Min through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Min");

    var expectedExceptionMessage = new RegExp(formElementId + ".Min: @Min is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Min (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(regula.bind, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(value=10)");

    equals(regula.bind(), undefined, "@Min(value=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(value=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Min(value=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(value=10, message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Min(value=10, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(value=10, groups=[Test])");

    equals(regula.bind(), undefined, "@Min(value=10, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Min(value=10, label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Min(value=10, label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Range through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Range");

    var expectedExceptionMessage = new RegExp(formElementId + ".Range: @Range is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Range (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with one required parameter) through markup (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(max=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with one required parameter) through markup (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(regula.bind, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with both required parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5, max=10)");

    equals(regula.bind(), undefined, "@Range(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5, max=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Range(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5, max=10, message=\"test message\")");

    equals(regula.bind(), undefined, "@Range(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5, max=10, groups=[Test])");

    equals(regula.bind(), undefined, "@Range(min=5, max=10, message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional message, label, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test])");

    equals(regula.bind(), undefined, "@Range(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Between through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Between");

    var expectedExceptionMessage = new RegExp(formElementId + ".Range: @Range is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Between (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with one required parameter) through markup (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(max=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});


test('Test binding @Between (with one required parameter) through markup (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(min=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(regula.bind, expectedExceptionMessage, "@Between cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with both required parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(min=5, max=10)");

    equals(regula.bind(), undefined, "@Between(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(min=5, max=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Between(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(min=5, max=10, message=\"test message\")");

    equals(regula.bind(), undefined, "@Between(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional message, label, group parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Between(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test])");

    equals(regula.bind(), undefined, "@Between(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@NotBlank");

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@NotBlank cannot be bound to a form element");

    deleteElements();
});

test('Test binding @NotBlank (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank");

    equals(regula.bind(), undefined, "@NotBlank should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(label=\"test\")");

    equals(regula.bind(), undefined, "@NotBlank(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@NotBlank(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[Test])");

    equals(regula.bind(), undefined, "@NotBlank(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@NotBlank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@NotEmpty");

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@NotEmpty cannot be bound to a form element");

    deleteElements();
});

test('Test binding @NotEmpty (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotEmpty");

    equals(regula.bind(), undefined, "@NotEmpty should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotEmpty(label=\"test\")");

    equals(regula.bind(), undefined, "@NotEmpty(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotEmpty(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@NotEmpty(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotEmpty(groups=[Test])");

    equals(regula.bind(), undefined, "@NotEmpty(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional label, message, groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotEmpty(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@NotEmpty(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Empty through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Empty");

    var expectedExceptionMessage = new RegExp(formElementId + ".Blank: @Blank is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Empty cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Empty (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Empty");

    equals(regula.bind(), undefined, "@Empty should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Empty(label=\"test\")");

    equals(regula.bind(), undefined, "@Empty(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Empty(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Empty(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Empty(groups=[Test])");

    equals(regula.bind(), undefined, "@Empty(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Empty(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Empty(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Blank through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Blank");

    var expectedExceptionMessage = new RegExp(formElementId + ".Blank: @Blank is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Blank cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Blank (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Blank");

    equals(regula.bind(), undefined, "@Blank should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Blank(label=\"test\")");

    equals(regula.bind(), undefined, "@Blank(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Blank(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Blank(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Blank(groups=[Test])");

    equals(regula.bind(), undefined, "@Blank(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Blank(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Blank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Pattern");

    var expectedExceptionMessage = new RegExp(formElementId + ".Pattern: @Pattern is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Pattern (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/)");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, label=\"test\")");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, groups=[Test])");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with optional flags parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(flags=\"ig\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(flags=\"ig\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(flags=\"ig\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(flags=\"ig\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(flags=\"ig\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, flags=\"ig\")");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\")");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, flags=\"ig\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, flags=\"ig\", groups=[Test])");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Matches");

    var expectedExceptionMessage = new RegExp(formElementId + ".Pattern: @Pattern is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Matches (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/)");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, label=\"test\")");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, groups=[Test])");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with optional flags parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(flags=\"ig\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(flags=\"ig\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(flags=\"ig\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(flags=\"ig\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(flags=\"ig\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(regula.bind, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, flags=\"ig\")");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\")");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, flags=\"ig\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, flags=\"ig\", groups=[Test])");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Email through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Email");

    var expectedExceptionMessage = new RegExp(formElementId + ".Email: @Email is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Email cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Email (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email");

    equals(regula.bind(), undefined, "@Email should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email(label=\"test\")");

    equals(regula.bind(), undefined, "@Email(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Email(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email(groups=[Test])");

    equals(regula.bind(), undefined, "@Email(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Email(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Alpha");

    var expectedExceptionMessage = new RegExp(formElementId + ".Alpha: @Alpha is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Alpha cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Alpha (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Alpha");

    equals(regula.bind(), undefined, "@Alpha should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Alpha(label=\"test\")");

    equals(regula.bind(), undefined, "@Alpha(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Alpha(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Alpha(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Alpha(groups=[Test])");

    equals(regula.bind(), undefined, "@Alpha(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Alpha(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Alpha(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Numeric");

    var expectedExceptionMessage = new RegExp(formElementId + ".Numeric: @Numeric is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Numeric cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Numeric (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Numeric");

    equals(regula.bind(), undefined, "@Numeric should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Numeric(label=\"test\")");

    equals(regula.bind(), undefined, "@Numeric(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Numeric(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Numeric(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Numeric(groups=[Test])");

    equals(regula.bind(), undefined, "@Numeric(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Numeric(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Numeric(label=\"test\", message=\"this is a test\", groups=[Test])");

    deleteElements();
});

test('Test binding @AlphaNumeric through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@AlphaNumeric");

    var expectedExceptionMessage = new RegExp(formElementId + ".AlphaNumeric: @AlphaNumeric is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@AlphaNumeric cannot be bound to a form element");

    deleteElements();
});

test('Test binding @AlphaNumeric (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@AlphaNumeric");

    equals(regula.bind(), undefined, "@AlphaNumeric should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@AlphaNumeric(label=\"test\")");

    equals(regula.bind(), undefined, "@AlphaNumeric(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@AlphaNumeric(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@AlphaNumeric(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@AlphaNumeric(groups=[Test])");

    equals(regula.bind(), undefined, "@AlphaNumeric(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@AlphaNumeric(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@AlphaNumeric(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Length through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Length");

    var expectedExceptionMessage = new RegExp(formElementId + ".Length: @Length is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Integer through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Integer");

    var expectedExceptionMessage = new RegExp(formElementId + ".Integer: @Integer is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Integer cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Integer (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Integer");

    equals(regula.bind(), undefined, "@Integer should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Integer(label=\"test\")");

    equals(regula.bind(), undefined, "@Integer(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Integer(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Integer(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Integer(groups=[Test])");

    equals(regula.bind(), undefined, "@Integer(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Integer(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Integer(label=\"test\", message=\"this is a test\", groups=[Test])");

    deleteElements();
});

test('Test binding @Real through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Real");

    var expectedExceptionMessage = new RegExp(formElementId + ".Real: @Real is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Real cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Real (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Real");

    equals(regula.bind(), undefined, "@Real should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Real(label=\"test\")");

    equals(regula.bind(), undefined, "@Real(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Real(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Real(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Real(groups=[Test])");

    equals(regula.bind(), undefined, "@Real(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Real(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Real(label=\"test\", message=\"this is a test\", groups=[Test])");

    deleteElements();
});

test('Test binding @Length (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional label, message, and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with one required parameter) through markup (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(max=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with one required parameter) through markup (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(regula.bind, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with both required parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5, max=10)");

    equals(regula.bind(), undefined, "@Length(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5, max=10, label=\"test\")");

    equals(regula.bind(), undefined, "@Length(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5, max=10, message=\"test message\")");

    equals(regula.bind(), undefined, "@Length(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5, max=10, groups=[Test])");

    equals(regula.bind(), undefined, "@Length(min=5, max=10, groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional message, label, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test])");

    equals(regula.bind(), undefined, "@Length(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Digits through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Digits");

    var expectedExceptionMessage = new RegExp(formElementId + ".Digits: @Digits is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Digits (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameters");

    deleteElements();
});

test('Test binding @Digits (with fraction parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(fraction=5)");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameters");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(fraction=5, label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(fraction=5, message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(fraction=5, groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(fraction=5, label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(regula.bind, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, fraction=5)");

    equals(regula.bind(), undefined, "@Digits(integer=5, fraction=5) must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, fraction=5, label=\"test\")");

    equals(regula.bind(), undefined, "@Digits(integer=5, fraction=5, label=\"test\") must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, fraction=5, message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Digits(integer=5, fraction=5, message=\"this is a test\") must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, fraction=5, groups=[Test])");

    equals(regula.bind(), undefined, "@Digits(integer=5, fraction=5, groups=[Test]) must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Digits(integer=5, fraction=5, label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Digits(integer=5, fraction=5, label=\"test\", message=\"this is a test\", groups=[Test]) must be a valid definition");

    deleteElements();
});

test('Test binding @Past through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Past");

    var expectedExceptionMessage = new RegExp(formElementId + ".Past: @Past is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Past (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", label=\"test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional separator parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", label=\"test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(date=\"07/03/1984\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(date=\"07/03/1984\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", date=\"07/03/1984\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", date=\"07/03/1984\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", date=\"07/03/1984\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date, separator, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date, separator, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Future");

    var expectedExceptionMessage = new RegExp(formElementId + ".Future: @Future is not a form constraint, but you are trying to bind it to a form");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Future (without parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", label=\"test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional separator parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", label=\"test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(date=\"07/03/1984\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(date=\"07/03/1984\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", date=\"07/03/1984\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", date=\"07/03/1984\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", date=\"07/03/1984\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date, separator, groups, label and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(regula.bind, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"this is a test\")");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date, separator, label, message, and groups parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled to a non-form element through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CompletelyFilled");

    var expectedExceptionMessage = new RegExp(inputElementId + ".CompletelyFilled: @CompletelyFilled is a form constraint, but you are trying to bind it to a non-form element");
    raises(regula.bind, expectedExceptionMessage, "@CompletelyFilled cannot be bound to a non-form element");

    deleteElements();
});

test('Test binding @CompletelyFilled (without parameters) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@CompletelyFilled");

    equals(regula.bind(), undefined, "@CompletelyFilled should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional label parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@CompletelyFilled(label=\"test\")");

    equals(regula.bind(), undefined, "@CompletelyFilled(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional message parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@CompletelyFilled(message=\"this is a test\")");

    equals(regula.bind(), undefined, "@CompletelyFilled(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional groups parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@CompletelyFilled(groups=[Test])");

    equals(regula.bind(), undefined, "@CompletelyFilled(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional label, message, and groups parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@CompletelyFilled(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind(), undefined, "@CompletelyFilled(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch through markup to a non-form element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@PasswordsMatch");

    var expectedExceptionMessage = new RegExp(inputElementId + ".PasswordsMatch: @PasswordsMatch is a form constraint, but you are trying to bind it to a non-form element");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound to a input element");

    deleteElements();
});

test('Test binding @PasswordsMatch (without parameters) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional label parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(label=\"test\")");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional message parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(message=\"this is a test\")");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional groups parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional label, message, and groups parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with one required parameter) through markup (1)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field1=\"field1\")");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field2");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with one required parameter) through markup (2)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\")");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field1");
    raises(regula.bind, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\", field1=\"field1\")");

    equals(regula.bind(), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional label parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\")");

    equals(regula.bind(), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional message parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", message=\"test message\")");

    equals(regula.bind(), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional groups parameter) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", groups=[Test])");

    equals(regula.bind(), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional message, label, and groups parameters) through markup', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\", message=\"test message\", groups=[Test])");

    equals(regula.bind(), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

module("Test binding pre-defined constraints to elements, via regula.bind");

test('Test binding @Checked through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
       regula.bind({
           element: $form.get(0),
           constraints: [
               {constraintType: regula.Constraint.Checked}
           ]
       });
    }, expectedExceptionMessage, "@Checked cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Checked through regula.bind to a non-checkbox/non-radio-button element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Checked: @Checked is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button");

    raises(function() {
       regula.bind({
           element: $input.get(0),
           constraints: [
               {constraintType: regula.Constraint.Checked}
           ]
       });
    }, expectedExceptionMessage, "@Checked should not be bound to a non-checkbox/non-radio-button element");

    deleteElements();
});

test('Test binding @Checked (without parameters) through regula.bind to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    }), undefined, "@Checked should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (without parameters) through regula.bind to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "radio");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    }), undefined, "@Checked should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Checked,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Checked(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Checked,
                params: {
                    message: "This is a test"
                }
            }
        ]
    }), undefined, "@Checkbox(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Checked,
                params: {
                    groups:["Test"]
                }
            }
        ]
    }), undefined, "@Checkbox(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Checked (with groups, message and label parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Checked,
                params: {
                    label: "test",
                    message: "This is a test",
                    groups:["Test"]
                }
            }
        ]
    }), undefined, "@Checkbox(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Selected through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Selected: @Selected is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Selected}
            ]
        });
    }, expectedExceptionMessage, "@Selected cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Selected through regula.bind to a non-select element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Selected: @Selected is only applicable to select boxes. You are trying to bind it to an input element that is not a select box");

    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Selected}
            ]
        });
    }, expectedExceptionMessage, "@Selected should not be bound to a non-select-box element");

    deleteElements();
});

test('Test binding @Selected (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Selected}
        ]
    }), undefined, "@Selected should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Selected,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Selected(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Selected,
                params: {
                    message: "This is a test"
                }
            }
        ]
    }), undefined, "@Selected(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Selected,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Selected(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Selected (with groups, message and label parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Selected,
                params: {
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Selected(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Required through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Required: @Required is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Required}
            ]
        })
    }, expectedExceptionMessage, "@Required cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Required (without parameters) through regula.bind to an input element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    }), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through regula.bind to a checkbox', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "checkbox");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    }), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through regula.bind to a radio', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "radio");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    }), undefined, "@Required should be a valid definition");

    deleteElements();
});

test('Test binding @Required (without parameters) through regula.bind to a select', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, undefined, "select");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    }), undefined, "@Required should be a valid definition");

    deleteElements();
});


test('Test binding @Required (with label parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Required,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Required(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with message parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Required,
                params: {
                    message: "This is a test"
                }
            }
        ]
    }), undefined, "@Required(message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with groups parameter) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Required,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Required(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Required (with groups, message and label parameters) through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Required,
                params: {
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Required(label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Max through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Max: @Max is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Max}
            ]
        });
    }, expectedExceptionMessage, "@Max cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Max (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Max}
            ]
        });
    }, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Max,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Max,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Max,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Max cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Max (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Max: You seem to have provided some optional or required parameters for @Max, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Max,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    });

    deleteElements();
});

test('Test binding @Max (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: 10
                }
            }
        ]
    }), undefined, "@Max(value=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: 10,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Max(value=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: 10,
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Max(value=10, message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: 10,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Max(value=10, groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Max (with required parameter and optional groups, label and message parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: 10,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Max(value=10, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Min through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Min: @Min is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Min}
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Min (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Min}
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Min,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Min,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Min,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Min (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameter\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Min,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    });

    deleteElements();
});

test('Test binding @Min (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10
                }
            }
        ]
    }), undefined, "@Min(value=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Min(value=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10,
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Min(value=10, message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Min(value=10, groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Min (with required parameter and optional groups, label and message parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Min(value=10, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Range through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Range: @Range is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Range (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        })
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        label: "test",
                        message: "This is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        max: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        min: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Range (with both required parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    }), undefined, "@Range(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max:10,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Range(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max:10,
                    message: "test message"
                }
            }
        ]
    }), undefined, "@Range(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max:10,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Range(min=5, max=10, message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Range (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max:10,
                    label: "test",
                    message: "test message",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Range(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Between through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Range: @Range is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Between}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Between (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Between}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        })
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        label: "test",
                        message: "This is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        max: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Between,
                    params: {
                        min: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Between (with both required parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Between,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    }), undefined, "@Between(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Between,
                params: {
                    min: 5,
                    max:10,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Between(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Between,
                params: {
                    min: 5,
                    max:10,
                    message: "test message"
                }
            }
        ]
    }), undefined, "@Between(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Between,
                params: {
                    min: 5,
                    max:10,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Between(min=5, max=10, message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Between (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Between,
                params: {
                    min: 5,
                    max:10,
                    label: "test",
                    message: "test message",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Between(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.NotBlank}
            ]
        });
    }, expectedExceptionMessage, "@NotBlank cannot be bound to a form element");

    deleteElements();
});

test('Test binding @NotBlank through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.NotBlank}
            ]
        });
    }, expectedExceptionMessage, "@NotBlank cannot be bound to a form element");

    deleteElements();
});

test('Test binding @NotBlank (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    }), undefined, "@NotBlank should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    length: "test"
                }
            }
        ]
    }), undefined, "@NotBlank(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@NotBlank(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@NotBlank(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotBlank (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@NotBlank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});



test('Test binding @NotEmpty through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.NotBlank}
            ]
        });
    }, expectedExceptionMessage, "@NotEmpty cannot be bound to a form element");

    deleteElements();
});

test('Test binding @NotEmpty (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotEmpty}
        ]
    }), undefined, "@NotEmpty should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotEmpty,
                params: {
                    length: "test"
                }
            }
        ]
    }), undefined, "@NotEmpty(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotEmpty,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@NotEmpty(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotEmpty,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@NotEmpty(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @NotEmpty (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotEmpty,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@NotEmpty(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Empty through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Blank: @Blank is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Empty}
            ]
        });
    });

    deleteElements();
});

test('Test binding @Empty (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Empty}
        ]
    }), undefined, "@Empty should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Empty,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Empty(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Empty,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Empty(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Empty,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Empty(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Empty (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Empty,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Empty(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Blank through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Blank: @Blank is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Blank}
            ]
        });
    });

    deleteElements();
});

test('Test binding @Blank (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    }), undefined, "@Blank should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Blank(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Blank(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Blank(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Blank (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Blank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Pattern: @Pattern is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Pattern}
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Pattern (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Pattern}
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        message: "This is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        })
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    label: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    message: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, groups=[\"Test\"]) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/,
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        flags: "ig"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        flags: "ig",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        flags: "ig",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        flags: "ig",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with optional flags, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        flags: "ig",
                        label: "test",
                        message: "This is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    flags: "ig",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    message: "test"
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Pattern (with required parameter and optional flags, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Pattern(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Pattern: @Pattern is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Matches}
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Matches (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Matches}
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        message: "This is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        })
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    label: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    message: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    regex: /[a-z]/,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, groups=[\"Test\"]) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    regex: /[a-z]/,
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        flags: "ig"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        flags: "ig",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        flags: "ig",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        flags: "ig",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with optional flags, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Matches,
                    params: {
                        flags: "ig",
                        label: "test",
                        message: "This is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    flags: "ig",
                    regex: /[a-z]/
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    message: "test"
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Matches (with required parameter and optional flags, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Matches,
                params: {
                    flags: "ig",
                    regex: /[a-z]/,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Matches(regex=/[a-z]/, flags=\"ig\", label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Email through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Email: @Email is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Email}
            ]
        });
    }, expectedExceptionMessage, "@Email cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Email (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Email}
        ]
    }), undefined, "@Email should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Email(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email,
                message: "this is a test"
            }
        ]
    }), undefined, "@Email(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email,
                groups: ["Test"]
            }
        ]
    }), undefined, "@Email(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Email (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Email(label=\"test\", message=\"this is a test\", groups=[Test])");

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email,
                label: "test",
                message: "this is a test",
                groups: ["Test"]
            }
        ]
    }), undefined, "@Email(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Alpha: @Alpha is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Alpha}
            ]
        });
    }, expectedExceptionMessage, "@Alpha cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Alpha (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Alpha}
        ]
    }), undefined, "@Alpha should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Alpha(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Alpha(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Alpha(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Alpha (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Alpha(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Numeric: @Numeric is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Numeric}
            ]
        });
    }, expectedExceptionMessage, "@Numeric cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Numeric (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Numeric}
        ]
    }), undefined, "@Numeric should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Numeric(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Numeric(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Numeric(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Numeric (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Numeric(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".AlphaNumeric: @AlphaNumeric is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.AlphaNumeric}
            ]
        });
    }, expectedExceptionMessage, "@AlphaNumeric cannot be bound to a form element");

    deleteElements();
});

test('Test binding @AlphaNumeric (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.AlphaNumeric}
        ]
    }), undefined, "@AlphaNumeric should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@AlphaNumeric(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@AlphaNumeric(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@AlphaNumeric(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @AlphaNumeric (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@AlphaNumeric(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Integer through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Integer: @Integer is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Integer}
            ]
        });
    }, expectedExceptionMessage, "@Integer cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Integer (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Integer}
        ]
    }), undefined, "@Integer should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Integer(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Integer(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Integer(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Integer (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Integer(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Real through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Real: @Real is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Real}
            ]
        });
    }, expectedExceptionMessage, "@Real cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Real (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {constraintType: regula.Constraint.Real}
        ]
    }), undefined, "@Real should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@Real(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Real(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Real(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Real (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Real(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Length through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Length: @Length is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Length}
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Length (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Length}
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        message: "This is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElements();

    deleteElements();
});

test('Test binding @Length (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        groups:["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElements();

    deleteElements();
});

test('Test binding @Length (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameter\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        label: "test",
                        message: "This is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElements();

    deleteElements();
});

test('Test binding @Length (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameter\\(s\\): min");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        max: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameter\\(s\\): max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Length,
                    params: {
                        min: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Length (with both required parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    }), undefined, "@Length(min=5, max=10) should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Length(min=5, max=10, label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10,
                    message: "test message"
                }
            }
        ]
    }), undefined, "@Length(min=5, max=10, message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Length(min=5, max=10, groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Length (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10,
                    label: "test",
                    message: "test message",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Length(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Digits through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Digits: @Digits is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Digits}
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Digits (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Digits}
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        groups:["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");


    deleteElements();
});

test('Test binding @Digits (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameter\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    });

    deleteElements();
});

test('Test binding @Digits (with integer parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        integer: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        integer: 5,
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        integer: 5,
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(function () {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        integer: 5,
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        integer: 5,
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameters");

    deleteElements();
});

test('Test binding @Digits (with fraction parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        fraction: 5
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameters");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        fraction: 5,
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        fraction: 5,
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        fraction: 5,
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with fraction and optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameter\\(s\\): integer");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Digits,
                    params: {
                        fraction: 5,
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 5,
                    fraction: 5
                }
            }
        ]
    }), undefined, "@Digits(integer=5, fraction=5) must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 5,
                    fraction: 5,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Digits(integer=5, fraction=5, label=\"test\") must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 5,
                    fraction: 5,
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Digits(integer=5, fraction=5, message=\"this is a test\") must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 5,
                    fraction: 5,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Digits(integer=5, fraction=5, groups=[Test]) must be a valid definition");

    deleteElements();
});

test('Test binding @Digits (with integer and fraction and optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 5,
                    fraction: 5,
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Digits(integer=5, fraction=5, label=\"test\", message=\"this is a test\", groups=[Test]) must be a valid definition");

    deleteElements();
});

test('Test binding @Past through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Past: @Past is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Past}
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Past (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Past}
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    label: "test",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    message: "test",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    groups: ["Test"],
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"],
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        label: "test",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        message: "this is a test",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        groups: ["Test"],
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"],
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    label: "test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    message: "test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional separator, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with optional date, separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Past,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    label: "test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    message: "test"
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Past (with required parameter and optional date, separator, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Past(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Future: @Future is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.Future}
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound to a form element");

    deleteElements();
});

test('Test binding @Future (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Future}
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    label: "test",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    message: "test",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    groups: ["Test"],
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"],
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        label: "test",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        message: "this is a test",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        groups: ["Test"],
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"],
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    label: "test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    message: "test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional separator, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    label: "test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    date: "07/03/1984",
                    format: regula.DateFormat.MDY,
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        separator: "/"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with optional date, separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameter\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.Future,
                    params: {
                        date: "07/03/1984",
                        separator: "/",
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    label: "test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    message: "test"
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", message=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @Future (with required parameter and optional date, separator, label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals(regula.bind({
        element: $input.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY,
                    separator: "/",
                    date: "07/03/1984",
                    label: "test",
                    message: "This is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@Future(format=\"MDY\", separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"This is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled to a non-form element through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".CompletelyFilled: @CompletelyFilled is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.CompletelyFilled}
            ]
        });
    }, expectedExceptionMessage, "@CompletelyFilled cannot be bound to a non-form element");

    deleteElements();
});

test('Test binding @CompletelyFilled (without parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {constraintType: regula.Constraint.CompletelyFilled}
        ]
    }), undefined, "@CompletelyFilled should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    label: "test"
                }
            }
        ]
    }), undefined, "@CompletelyFilled(label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), undefined, "@CompletelyFilled(message=\"this is a test\") should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@CompletelyFilled(groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @CompletelyFilled (with optional label, message, and groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    label: "test",
                    message: "this is a test",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@CompletelyFilled(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch through regula.bind to a non-form element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".PasswordsMatch: @PasswordsMatch is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.PasswordsMatch}
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound to a input element");

    deleteElements();
});

test('Test binding @PasswordsMatch (without parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.PasswordsMatch}
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        label: "test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        message: "this is a test"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with optional label, message, and groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        label: "test",
                        message: "this is a test",
                        groups: ["Test"]
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with one required parameter) through regula.bind (1)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        field1: "field1"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with one required parameter) through regula.bind (2)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field1");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.PasswordsMatch,
                    params: {
                        field2: "field2"
                    }
                }
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2"
                }
            }
        ]
    }), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2",
                    label: "test"
                }
            }
        ]
    }), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2",
                    message: "test message"
                }
            }
        ]
    }), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", message=\"test message\") should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", groups=[Test]) should be a valid definition");

    deleteElements();
});

test('Test binding @PasswordsMatch (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals(regula.bind({
        element: $form.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2",
                    label: "test",
                    message: "test message",
                    groups: ["Test"]
                }
            }
        ]
    }), undefined, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElements();
});

module('Test regula.custom');

test('Call regula.custom without any arguments', function() {
    raises(regula.custom, /regula\.custom expects options/, "regula.custom requires options");
});

test('Call regula.custom with empty object-literal', function() {
    raises(function() {
        regula.custom({});
    }, /regula\.custom expects a name attribute in the options argument/, "regula.custom requires options");
});

test('Call regula.custom with null name', function() {
    raises(function() {
        regula.custom({
            name: null
        });
    }, /regula\.custom expects a name attribute in the options argument/, "name attribute cannot be null");
});

test('Call regula.custom with undefined name', function() {
    raises(function() {
        regula.custom({
            name: undefined
        });
    }, /regula\.custom expects a name attribute in the options argument/, "name attribute cannot be undefined");
});

test('Call regula.custom with empty string as name', function() {
    raises(function() {
        regula.custom({
            name: ""
        });
    }, /regula\.custom expects a name attribute in the options argument/, "name attribute cannot be an empty string");
});

test('Call regula.custom with only spaces as name', function() {
    raises(function() {
        regula.custom({
            name: "       "
        });
    }, /regula\.custom cannot accept an empty string for the name attribute in the options argument/, "name attribute cannot be string that only consists of spaces");
});

test('Call regula.custom with non-string as value for name', function() {
    raises(function() {
        regula.custom({
            name: true
        });
    }, /regula\.custom expects the name attribute in the options argument to be a string/, "name attribute must be a string");
});

test('Call regula.custom with valid name and no validator', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime()
        });
    }, /regula\.custom expects a validator attribute in the options argument/, "validator must be provided");
});

test('Call regula.custom with valid name and null validator', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime(),
            validator: null
        });
    }, /regula\.custom expects a validator attribute in the options argument/, "validator cannot be null");
});

test('Call regula.custom with valid name and undefined validator', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime(),
            validator: undefined
        });
    }, /regula\.custom expects a validator attribute in the options argument/, "validator cannot be undefined");
});

test('Call regula.custom with valid name and non-function validator', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime(),
            validator: "string"
        });
    }, /regula\.custom expects the validator attribute in the options argument to be a function/, "validator must be a function");
});

test('Call regula.custom with valid name and non-string defaultMessage', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime(),
            validator: function() {
            },
            defaultMessage: 5
        });
    }, /regula\.custom expects the defaultMessage attribute in the options argument to be a string/, "defaultMessage must be a string");
});

test('Call regula.custom with an existing constraint name', function() {
    raises(function() {
        regula.custom({
            name: "Required",
            validator: function() {
                return false;
            }
        });
    }, /There is already a constraint called Required. If you wish to override this constraint, use regula.override/, "regula.custom with an existing constraint-name must throw an error.");
});

test('Call regula.custom with valid name and validator', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        validator: function() {
            return false;
        }
    }), undefined, "regula.custom with valid name and validator must not return any errors.");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();
    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.formSpecific, false, "formSpecific attribute must be false");
    equals(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equals(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");
    equals(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElements();
});

test('Call regula.custom with required parameters and formSpecific attribute of non-boolean type', function() {
    raises(function() {
       regula.custom({
           name: "CustomConstraint" + new Date().getTime(),
           formSpecific: "true",
           validator: function() {
           }
       });
    }, /regula\.custom expects the formSpecific attribute in the options argument to be a boolean/, "formSpecific attribute must be a boolean")
});

test('Call regula.custom with required parameters and null formSpecific attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        formSpecific: null,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and null formSpecific attribute must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();
    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.formSpecific, false, "formSpecific attribute must be false");

    deleteElements();
});

test('Call regula.custom with required parameters and undefined formSpecific attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        formSpecific: undefined,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and undefined formSpecific attribute must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();
    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.formSpecific, false, "formSpecific attribute must be false");

    deleteElements();
});

test('Call regula.custom with required parameters and valid formSpecific attribute', function() {
    equals(regula.custom({
        name: "CustomConstraint" + new Date().getTime(),
        formSpecific: true,
        validator: function() {
        }
    }, undefined, "regula.custom called with required parameters and valid formSpecific attribute must not generate any errors"));
});

test('Call regula.custom with required parameters and null params attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        params: [],
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and undefined params attribute must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equals(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElements();
});

test('Call regula.custom with required parameters and undefined params attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        params: null,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and null params attribute must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equals(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElements();
});

test('Call regula.custom with required parameters and params attribute of non-array type', function() {
    raises(function() {
        regula.custom({
            name: "CustomConstraint" + new Date().getTime(),
            params: "params",
            validator: function() {
            }
        });
    }, /regula.custom expects the params attribute in the options argument to be an array/, "params attribute must be an array");
});

test('Call regula.custom with required parameters and empty params attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        params: [],
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and an empty params array must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equals(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElements();
});

test('Call regula.custom with required parameters and valid params attribute (1)', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        params: ["myParam"],
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and an valid params array must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time + "(myParam=9)");

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.__size__, 2, "parameters must contain __size__ element that equals 1");
    equals(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");
    equals(constraintViolation.constraintParameters.myParam, 9, "parameters must contain myParam element that equals 9");

    deleteElements();
});

test('Call regula.custom with required parameters and valid params attribute (2)', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        params: ["myParam"],
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and an valid params array must not generate any errors"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    raises(function() {
        regula.bind();
    }, new RegExp("You seem to have provided some optional or required parameters for @CustomConstraint" + time + ", but you are still missing the following 1 required parameter\\(s\\): myParam"));

    deleteElements();
});

test('Call regula.custom with required parameters and null defaultMessage attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: null,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and null defaultMessage attribute must not generate any errors`"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElements();
});

test('Call regula.custom with required parameters and undefined defaultMessage attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: undefined,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and undefined defaultMessage attribute must not generate any errors`"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElements();
});

test('Call regula.custom with required parameters and undefined defaultMessage attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: undefined,
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and undefined defaultMessage attribute must not generate any errors`"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElements();
});

test('Call regula.custom with required parameters and valid defaultMessage attribute', function() {
    var time = new Date().getTime();

    equals(regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        validator: function() {
            return false;
        }
    }, undefined, "regula.custom called with required parameters and valid defaultMessage attribute must not generate any errors`"));

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.message, "This is a test", "defaultMessage must be \"This is a test\"");

    deleteElements();
});

test('Create form-specific constraint with regula.custom() and ensure that it binds correctly', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        validator: function() {
            return false;
        },
        formSpecific: true
    });

    var $form = createFormElement("myForm", "@CustomConstraint" + time);
    equals(regula.bind(), undefined, "Binding a custom form-specific constraint to a form must not fail");

    deleteElements();
});

test('Create form-specific constraint with regula.custom() and try to bind it to a non-form element', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        validator: function() {
            return false;
        },
        formSpecific: true
    });

    var $text = createInputElement("myText", "@CustomConstraint" + time, "text");

    raises(function() {
        regula.bind();
    }, new RegExp("myText.CustomConstraint" + time + ": @CustomConstraint" + time + " is a form constraint, but you are trying to bind it to a non-form element"), "Binding a custom form-specific element to a non-form element must fail");

    deleteElements();
});

test('Test that there is an error when not supplying enough parameters when binding to a custom constraint (1)', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        params: ["param1", "param2"],
        validator: function() {
            return false;
        },
        formSpecific: false
    });

    var $text = createInputElement("myText", "@CustomConstraint" + time, "text");

    raises(function() {
        regula.bind();
    }, new RegExp("myText.CustomConstraint" + time + ": You seem to have provided some optional or required parameters for @CustomConstraint" + time + ", but you are still missing the following 2 required parameter\\(s\\): param1, param2"), "Not supplying enough parameters to a custom constraint must result in an error");

    deleteElements();
});

test('Test that there is an error when not supplying enough parameters when binding to a custom constraint (2)', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        params: ["param1", "param2"],
        validator: function() {
            return false;
        },
        formSpecific: false
    });

    var $text = createInputElement("myText", "@CustomConstraint" + time + "(param1=5)", "text");

    raises(function() {
        regula.bind();
    }, new RegExp("myText.CustomConstraint" + time + ": You seem to have provided some optional or required parameters for @CustomConstraint" + time + ", but you are still missing the following 1 required parameter\\(s\\): param2"), "Binding a custom form-specific element to a non-form element must fail");

    deleteElements();
});

module('Test validation with @Checked');

function testConstraintViolationsForDefaultConstraints(constraintViolation, params) {
    var numFailingElements = 1;
    if(typeof params.numFailingElements !== "undefined") {
        numFailingElements = params.numFailingElements;
    }

    equals(constraintViolation.composingConstraintViolations.length, 0, "There must not be any composing-constraint violations");
    equals(constraintViolation.compound, false, "@" + params.constraintName + " is not a compound constraint");
    equals(constraintViolation.constraintParameters.groups, params.groups, "Must belong to the following group(s): " + params.groups);
    equals(constraintViolation.constraintName, params.constraintName, "@" + params.constraintName + " must be the failing constraint");
    equals(constraintViolation.custom, false, "@" + params.constraintName + " is not a custom constraint");
    equals(constraintViolation.failingElements.length, numFailingElements, "There must be one failing element");
    equals(constraintViolation.failingElements[0].id, params.elementId, params.elementId + " must be the id of the failing element");

    if(typeof params.elementId2 !== "undefined") {
        equals(constraintViolation.failingElements[1].id, params.elementId2, params.elementId2 + " must be the id of the second failing element");
    }

    equals(constraintViolation.group, params.validatedGroups, "The following groups must have been validated: " + params.validatedGroups);
    equals(constraintViolation.message, params.errorMessage, "Wrong error message");
}

test('Test @Checked against unchecked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Checked", "radio");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Checked",
        groups: "Default",
        elementId: "myRadio",
        validatedGroups: "Default",
        errorMessage: "The radio button needs to be checked."
    });

    deleteElements();
});

test('Test @Checked against unchecked radio button (regula.bind)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, undefined, "radio");

    regula.bind({
        element: $radio.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Checked",
        groups: "Default",
        elementId: "myRadio",
        validatedGroups: "Default",
        errorMessage: "The radio button needs to be checked."
    });

    deleteElements();
});

test('Test @Checked against checked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Checked", "radio");
    $radio.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked radio button");

    deleteElements();
});

test('Test @Checked against checked radio button (regula.bind)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, undefined, "radio");
    $radio.attr("checked", "true");

    regula.bind({
        element: $radio.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked radio button");

    deleteElements();
});

test('Test @Checked against unchecked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Checked", "checkbox");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Checked",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The checkbox needs to be checked."
    });

    deleteElements();
});

test('Test @Checked against unchecked checkbox (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, undefined, "checkbox");

    regula.bind({
        element: $checkbox.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Checked",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The checkbox needs to be checked."
    });

    deleteElements();
});

test('Test @Checked against checked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Checked", "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked checkbox");

    deleteElements()
});

test('Test @Checked against checked checkbox (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, undefined, "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind({
        element: $checkbox.get(0),
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked checkbox");

    deleteElements();
});

module('Test validation with @Selected');

test('Test @Selected against unselected dropdown (markup)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Selected", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(0);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Selected",
        groups: "Default",
        elementId: "mySelect",
        validatedGroups: "Default",
        errorMessage: "The select box needs to be selected."
    });

    deleteElements();
});

test('Test @Selected against unselected dropdown (regula.bind)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, undefined, "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(0);

    regula.bind({
        element: $select.get(0),
        constraints: [
            {constraintType: regula.Constraint.Selected}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Selected",
        groups: "Default",
        elementId: "mySelect",
        validatedGroups: "Default",
        errorMessage: "The select box needs to be selected."
    });

    deleteElements();
});

test('Test @Selected against selected dropdown (markup)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Selected", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(1);

    regula.bind();
    equals(regula.validate().length, 0, "The @Selected constraint must not fail against a selected dropdown");

    deleteElements();
});

test('Test @Selected against selected dropdown (regula.bind)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Selected", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(1);

    regula.bind({
        element: $select.get(0),
        constraints: [
            {constraintType: regula.Constraint.Selected}
        ]
    });
    equals(regula.validate().length, 0, "The @Selected constraint must not fail against a selected dropdown");

    deleteElements();
});

module('Test validation with @Required');

test('Test @Required against unchecked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Required", "radio");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myRadio",
        validatedGroups: "Default",
        errorMessage: "The radio button is required."
    });

    deleteElements();
});

test('Test @Required against unchecked radio button (regula.bind)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, undefined, "radio");

    regula.bind({
        element: $radio.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myRadio",
        validatedGroups: "Default",
        errorMessage: "The radio button is required."
    });

    deleteElements();
});

test('Test @Required against checked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Required", "radio");
    $radio.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked radio button");

    deleteElements();
});

test('Test @Required against checked radio button (regula.bind)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, undefined, "radio");
    $radio.attr("checked", "true");

    regula.bind({
        element: $radio.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked radio button");

    deleteElements();
});

test('Test @Required against unchecked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Required", "checkbox");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The checkbox is required."
    });

    deleteElements();
});

test('Test @Required against unchecked checkbox (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, undefined, "checkbox");

    regula.bind({
        element: $checkbox.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The checkbox is required."
    });

    deleteElements();
});

test('Test @Required against checked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Required", "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked checkbox");

    deleteElements()
});

test('Test @Required against checked checkbox (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, undefined, "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind({
        element: $checkbox.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked checkbox");

    deleteElements();
});

test('Test @Required against unselected dropdown (markup)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Required", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(0);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "mySelect",
        validatedGroups: "Default",
        errorMessage: "The select box is required."
    });

    deleteElements();
});

test('Test @Required against unselected dropdown (regula.bind)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, undefined, "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(0);

    regula.bind({
        element: $select.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "mySelect",
        validatedGroups: "Default",
        errorMessage: "The select box is required."
    });

    deleteElements();
});

test('Test @Required against selected dropdown (markup)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Required", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(1);

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a selected dropdown");

    deleteElements();
});

test('Test @Required against selected dropdown (regula.bind)', function() {
    var inputElementId = "mySelect";
    var $select = createInputElement(inputElementId, "@Required", "select");

    var $option1 = jQuery("<option value = 0>Please select an option</option>");
    var $option2 = jQuery("<option value =1>One</option>");

    $select.append($option1);
    $select.append($option2);
    $select.val(1);

    regula.bind({
        element: $select.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a selected dropdown");

    deleteElements();
});

test('Test @Required against an empty text field (markup)', function() {
    var inputElementId = "myCheckbox";
    var $text = createInputElement(inputElementId, "@Required", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The text field is required."
    });

    deleteElements();
});

test('Test @Required against an empty text field (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myCheckbox",
        validatedGroups: "Default",
        errorMessage: "The text field is required."
    });

    deleteElements();
});

test('Test @Required against non-empty text field (markup)', function() {
    var inputElementId = "myCheckbox";
    var $text = createInputElement(inputElementId, "@Required", "text");
    $text.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty text field");

    deleteElements();
});

test('Test @Required against non-empty text field (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("test");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty text field");

    deleteElements();
});

test('Test @Required against an empty textarea (markup)', function() {
    var inputElementId = "myTextarea";
    var $textarea = createInputElement(inputElementId, "@Required", "textarea");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myTextarea",
        validatedGroups: "Default",
        errorMessage: "The text area is required."
    });

    deleteElements();
});

test('Test @Required against an empty textarea (regula.bind)', function() {
    var inputElementId = "myTextarea";
    var $textarea = createInputElement(inputElementId, undefined, "textarea");

    regula.bind({
        element: $textarea.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Required",
        groups: "Default",
        elementId: "myTextarea",
        validatedGroups: "Default",
        errorMessage: "The text area is required."
    });

    deleteElements();
});

test('Test @Required against non-empty textarea (markup)', function() {
    var inputElementId = "myTextarea";
    var $textarea = createInputElement(inputElementId, "@Required", "textarea");
    $textarea.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty textarea");

    deleteElements();
});

test('Test @Required against non-empty textarea (regula.bind)', function() {
    var inputElementId = "myTextarea";
    var $textarea = createInputElement(inputElementId, undefined, "textarea");
    $textarea.val("test");

    regula.bind({
        element: $textarea.get(0),
        constraints: [
            {constraintType: regula.Constraint.Required}
        ]
    });
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty textarea");

    deleteElements();
});

module('Test validation with @Max');

test('Test failing @Max against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5)", "text");
    $text.val(10);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Max",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be lesser than or equal to 5."
    });

    deleteElements();
});

test('Test failing @Max against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(0);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: -2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Max",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be lesser than or equal to -2."
    });

    deleteElements();
});

test('Test passing @Max against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5)", "text");
    $text.val(5);

    regula.bind();
    equals(regula.validate().length, 0, "@Max must not fail when value=5 and textbox value is 5");

    deleteElements();
});

test('Test passing @Max against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(-5);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Max,
                params: {
                    value: -2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];
    equals(regula.validate().length, 0, "@Max must not fail when value=-2 and textbox value is -5");

    deleteElements();
});

module('Test validation with @Min');

test('Test failing @Min against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5)", "text");
    $text.val(4);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Min",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be greater than or equal to 5."
    });

    deleteElements();
});

test('Test failing @Min against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(-1);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 0
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Min",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be greater than or equal to 0."
    });

    deleteElements();
});

test('Test passing @Min against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5)", "text");
    $text.val(5);

    regula.bind();
    equals(regula.validate().length, 0, "@Min must not fail when value=5 and textbox value is 5");

    deleteElements();
});

test('Test passing @Min against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(0);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: -2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];
    equals(regula.validate().length, 0, "@Min must not fail when value=-2 and textbox value is 0");

    deleteElements();
});

module('Test validation with @Range');

test('Test failing @Range against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=0, max=5)", "text");
    $text.val(-1);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Range",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be between 0 and 5."
    });

    deleteElements();
});

test('Test failing @Range against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(6);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 0,
                    max: 5
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Range",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be between 0 and 5."
    });

    deleteElements();
});

test('Test passing @Range against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=0, max=5)", "text");
    $text.val(0);

    regula.bind();
    equals(regula.validate().length, 0, "@Range(min=0, max=5) must not fail with value=0");

    deleteElements();
});

test('Test failing @Range against text field (regula.bind)(1)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(5);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 0,
                    max: 5
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Range(min=0, max=5) must not fail with value=5");


    deleteElements();
});

test('Test failing @Range against text field (regula.bind)(2)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(3);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 0,
                    max: 5
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Range(min=0, max=5) must not fail with value=3");


    deleteElements();
});

module('Test validation with @NotBlank');

test('Test failing @NotBlank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@NotBlank", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "NotBlank",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field cannot be blank."
    });

    deleteElements();
});

test('Test failing @NotBlank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "NotBlank",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field cannot be blank."
    });

    deleteElements();
});

test('Test passing @NotBlank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@NotBlank", "text");
    $text.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "@NotBlank should not fail on a non-empty text field");

    deleteElements();
});

test('Test passing @NotBlank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("test");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    });
    equals(regula.validate().length, 0, "@NotBlank should not fail on a non-empty text field");

    deleteElements();
});

module('Test validation with @Blank');

test('Test failing @Blank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Blank", "text");
    $text.val("test");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Blank",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be blank."
    });

    deleteElements();
});

test('Test failing @Blank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("test");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Blank",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be blank."
    });

    deleteElements();
});

test('Test passing @Blank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Blank", "text");

    regula.bind();
    equals(regula.validate().length, 0, "@Blank should not fail on an empty text field");

    deleteElements();
});

test('Test passing @Blank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    });
    equals(regula.validate().length, 0, "@Blank should not fail on an empty text field");

    deleteElements();
});

module('Test validation with @Pattern');

test('Test failing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Za-z]+$/)", "text");
    $text.val("42");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/."
    });

    deleteElements();
});

test('Test failing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("42");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Za-z]+$/"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/."
    });

    deleteElements();
});

test('Test failing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Za-z]+$/, flags=\"i\")", "text");
    $text.val("42");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/i."
    });

    deleteElements();
});



test('Test failing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("42");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Za-z]+$/",
                    flags: "i"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/i."
    });

    deleteElements();
});


test('Test failing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Za-z]+$/, flags=\"g\")", "text");
    $text.val("42");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/g."
    });

    deleteElements();
});

test('Test failing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("42");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Za-z]+$/",
                    flags: "g"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/g."
    });

    deleteElements();
});

test('Test failing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Za-z]+$/, flags=\"ig\")", "text");
    $text.val("42");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/ig."
    });

    deleteElements();
});

test('Test failing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("42");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Za-z]+$/",
                    flags: "ig"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /^[A-Za-z]+$/ig."
    });

    deleteElements();
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/)", "text");
    $text.val("NCC-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("NCC-1701");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/"
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/, flags=\"i\")", "text");
    $text.val("ncc-1701-D");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on ncc-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("ncc-1701-D");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/",
                    flags: "i"
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Pattern should not fail on ncc-1701-D");

    deleteElements();
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"g\")", "text");
    $text.val("NCC-1701-D NCC-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("NCC-1701-D NCC-1701");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/[A-Z]{3}-[0-9]{4}(-[A-Z])?/",
                    flags: "g"
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"ig\")", "text");
    $text.val("Ncc-1701-d ncc-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on Ncc-1701-d ncc-1701");

    deleteElements();
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("Ncc-1701-D Ncc-1701");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/[A-Z]{3}-[0-9]{4}(-[A-Z])?/",
                    flags: "ig"
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Pattern should not fail on Ncc-1701-D Ncc-1701");

    deleteElements();
});

module('Test validation with @Email');

test('Test failing @Email against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test failing @Email against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test failing @Email against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("abc");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test failing @Email against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abc");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test failing @Email against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("abc@example");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test failing @Email against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abc@example");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test passing @Email against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("abc@example.com");

    regula.bind();
    equals(regula.validate().length, 0, "@Email should not fail on abc@example.com");

    deleteElements();
});

test('Test passing @Email against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abc@example.com");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Email
            }
        ]
    });
    equals(regula.validate().length, 0, "@Email should not fail on abc@example.com");

    deleteElements();
});

module('Test validation with @Alpha');

test('Test failing @Alpha against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Alpha",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain letters."
    });

    deleteElements();
});

test('Test failing @Alpha against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Alpha",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain letters."
    });

    deleteElements();
});

test('Test failing @Alpha against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");
    $text.val("123a45");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Alpha",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain letters."
    });

    deleteElements();
});

test('Test failing @Alpha against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("123a45");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Alpha",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain letters."
    });

    deleteElements();
});

test('Test padding @Alpha against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");
    $text.val("abc");

    regula.bind();
    equals(regula.validate().length, 0, "@Alpha should not fail on 'abc'");

    deleteElements();
});

test('Test passing @Alpha against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abc");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Alpha
            }
        ]
    });
    equals(regula.validate().length, 0, "@Alpha should not fail 'abc'");

    deleteElements();
});

module('Test validation with @Numeric');

test('Test failing @Numeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Numeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers."
    });

    deleteElements();
});

test('Test failing @Numeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Numeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers."
    });

    deleteElements();
});

test('Test failing @Numeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");
    $text.val("123a45");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Numeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers."
    });

    deleteElements();
});

test('Test failing @Numeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("123a45");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Numeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers."
    });

    deleteElements();
});

test('Test passing @Numeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");
    $text.val("123");

    regula.bind();
    equals(regula.validate().length, 0, "@Numeric should not fail on '123'");

    deleteElements();
});

test('Test passing @Numeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("123");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Numeric
            }
        ]
    });
    equals(regula.validate().length, 0, "@Numeric should not fail on '123'");

    deleteElements();
});

module('Test validation with @AlphaNumeric');

test('Test failing @AlphaNumeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "AlphaNumeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers and letters."
    });

    deleteElements();
});

test('Test failing @AlphaNumeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "AlphaNumeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers and letters."
    });

    deleteElements();
});

test('Test failing @AlphaNumeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");
    $text.val("+ab-d");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "AlphaNumeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers and letters."
    });

    deleteElements();
});

test('Test failing @AlphaNumeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("+ab-d");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "AlphaNumeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers and letters."
    });

    deleteElements();
});

test('Test passing @AlphaNumeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");
    $text.val("1a2b3c");

    regula.bind();
    equals(regula.validate().length, 0, "@AlphaNumeric should not fail on '1a2b3c'");

    deleteElements();
});

test('Test passing @AlphaNumeric against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1a2b3c");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.AlphaNumeric
            }
        ]
    });
    equals(regula.validate().length, 0, "@AlphaNumeric should not fail on '1a2b3c'");

    deleteElements();
});

module('Test validation with @Integer');

test('Test failing @Integer against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test failing @Integer against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test failing @Integer against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");
    $text.val("a");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test failing @Integer against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-d");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test failing @Integer against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1.5");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test passing @Integer against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");
    $text.val("0");

    regula.bind();
    equals(regula.validate().length, 0, "@Integer should not fail on '0'");

    deleteElements();
});

test('Test passing @Integer against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-1");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer
            }
        ]
    });
    equals(regula.validate().length, 0, "@Integer should not fail on '-1'");

    deleteElements();
});

test('Test passing @Integer against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Integer
            }
        ]
    });
    equals(regula.validate().length, 0, "@Integer should not fail on '100'");

    deleteElements();
});

module('Test validation with @Real');

test('Test failing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Real",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be a real number."
    });

    deleteElements();
});

test('Test failing @Real against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Real",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be a real number."
    });

    deleteElements();
});

test('Test failing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("a");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Real",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be a real number."
    });

    deleteElements();
});

test('Test failing @Real against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-a");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Real",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be a real number."
    });

    deleteElements();
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("0");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '0'");

    deleteElements();
});

test('Test passing @Real against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-1");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real
            }
        ]
    });
    equals(regula.validate().length, 0, "@Real should not fail on '-1'");

    deleteElements();
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("0.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '0.1'");

    deleteElements();
});

test('Test passing @Real against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-1.34");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real
            }
        ]
    });
    equals(regula.validate().length, 0, "@Real should not fail on '-1.34'");

    deleteElements();
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val(".1");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '.1'");

    deleteElements();
});

test('Test passing @Real against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("-.34");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Real
            }
        ]
    });
    equals(regula.validate().length, 0, "@Real should not fail on '-.34'");

    deleteElements();
});

module('Test validation with @Length');

test('Test failing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test failing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test failing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcd");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test failing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abcd");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test failing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcdefghijk");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test failing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abcdefghijk");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Length",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field length must be between 5 and 10."
    });

    deleteElements();
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcde");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

test('Test passing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abcde");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcdefgh");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

test('Test passing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abcdefgh");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcdefghij");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

test('Test passing @Length against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("abcdefghij");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Length,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElements();
});

module('Test validation with @Digits');

test('Test failing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=3, fraction=2)", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 3 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1234.123");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 3,
                    fraction: 2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 3 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=3, fraction=2)", "text");
    $text.val("2434.12");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 3 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("231.122");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 3,
                    fraction: 2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 3 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val("25.123");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 0 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(".102");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 0,
                    fraction: 2
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 0 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("123.123");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 2 digits and 0 fractional digits."
    });

    deleteElements();
});

test('Test failing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("255.12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 2 digits and 0 fractional digits."
    });

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("1.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.1'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1.1");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.1'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("1.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1.12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.1'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("12.1");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.1'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("12.12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(".12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(".12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2.0");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.0'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2.0");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.0'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2.013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.013'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2.013");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.013'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("22.013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '22.013'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("22.013");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '22.013'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val(".013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '.013'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(".013");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 2,
                    fraction: 0
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '.013'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val(".12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 0,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val("1.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '1.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("1.12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 0,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '1.12'");

    deleteElements();
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val("123.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '123.12'");

    deleteElements();

});

test('Test passing @Digits against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("123.12");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Digits,
                params: {
                    integer: 0,
                    fraction: 2
                }
            }
        ]
    });
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '123.12'");

    deleteElements();
});

module('Test validation with @Past');

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="MDY")', "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="MDY")', "text");
    $text.val("07/03/2100");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("07/03/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="MDY")', "text");
    $text.val("7/3/2100");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("7/3/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="DMY")', "text");
    $text.val("03/07/2100");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("03/07/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="DMY")', "text");
    $text.val("3/7/2100");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("3/7/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2100/07/03");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/07/03");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2100/7/3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2100-7-3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100-7-3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2100 7 3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100 7 3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD", separator=":")', "text");
    $text.val("2100:7:3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100:7:3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD,
                    separator: ":"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD", date="2011/9/5")', "text");
    $text.val("2100/7/3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test failing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD,
                    date: "2011/9/5"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="MDY")', "text");
    $text.val("07/03/2009");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="MDY") must not fail on 07/03/2009');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("07/03/2009");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="MDY") must not fail on 07/03/2009');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="MDY")', "text");
    $text.val("7/3/2009");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="MDY") must not fail on 7/3/2009');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("7/3/2009");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="MDY") must not fail on 7/3/2009');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="DMY")', "text");
    $text.val("03/07/2009");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="DMY") must not fail on 03/07/2009');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("03/07/2009");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="DMY") must not fail on 03/07/2009');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="DMY")', "text");
    $text.val("3/7/2009");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="DMY") must not fail on 3/7/2009');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("3/7/2009");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="DMY") must not fail on 3/7/2009');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2009/07/03");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009/07/03');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009/07/03");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009/07/03');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2009/7/3");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009/7/3');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009/7/3');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2009-7-3");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009-7-3');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009-7-3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009-7-3');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD")', "text");
    $text.val("2009 7 3");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009 7 3');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009 7 3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, '@Past(format="YMD") must not fail on 2009 7 3');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD", separator=":")', "text");
    $text.val("2009:7:3");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD", separator=":") must not fail on 2009:7:3');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009:7:3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD,
                    separator: ":"
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="YMD", separator=":") must not fail on 2009:7:3');

    deleteElements();
});

test('Test passing @Past against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Past(format="YMD", date="2011/9/5")', "text");
    $text.val("2009/7/3");

    regula.bind();

    equals(regula.validate().length, 0, '@Past(format="YMD", date="20011/9/5") must not fail on 2009/7/3');

    deleteElements();
});

test('Test passing @Past against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2009/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Past,
                params: {
                    format: regula.DateFormat.YMD,
                    date: "2011/9/5"
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Past(format="YMD", date="20011/9/5") must not fail on 2009/7/3');

    deleteElements();
});

module('Test validation with @Future');

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="MDY")', "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="MDY")', "text");
    $text.val("07/03/2001");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("07/03/2001");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="MDY")', "text");
    $text.val("7/3/2001");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("7/3/2001");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="DMY")', "text");
    $text.val("03/07/2001");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("03/07/2001");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="DMY")', "text");
    $text.val("3/7/2001");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("3/7/2001");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2001/07/03");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001/07/03");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2001/7/3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2001-7-3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001-7-3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2001 7 3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001 7 3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD", separator=":")', "text");
    $text.val("2001:7:3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001:7:3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD,
                    separator: ":"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD", date="2011/9/5")', "text");
    $text.val("2001/7/3");

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test failing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2001/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD,
                    date: "2011/9/5"
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="MDY")', "text");
    $text.val("07/03/2100");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="MDY") must not fail on 07/03/2100');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("07/03/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="MDY") must not fail on 07/03/2100');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="MDY")', "text");
    $text.val("7/3/2100");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="MDY") must not fail on 7/3/2100');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("7/3/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.MDY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="MDY") must not fail on 7/3/2100');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="DMY")', "text");
    $text.val("03/07/2100");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="DMY") must not fail on 03/07/2100');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("03/07/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="DMY") must not fail on 03/07/2100');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="DMY")', "text");
    $text.val("3/7/2100");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="DMY") must not fail on 3/7/2100');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("3/7/2100");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.DMY
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="DMY") must not fail on 3/7/2100');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2100/07/03");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100/07/03');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/07/03");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100/07/03');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2100/7/3");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100/7/3');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100/7/3');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2100-7-3");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100-7-3');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100-7-3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100-7-3');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD")', "text");
    $text.val("2100 7 3");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100 7 3');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100 7 3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD
                }
            }
        ]
    });
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, '@Future(format="YMD") must not fail on 2100 7 3');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD", separator=":")', "text");
    $text.val("2100:7:3");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD", separator=":") must not fail on 2100:7:3');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100:7:3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD,
                    separator: ":"
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="YMD", separator=":") must not fail on 2100:7:3');

    deleteElements();
});

test('Test passing @Future against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, '@Future(format="YMD", date="2011/9/5")', "text");
    $text.val("2100/7/3");

    regula.bind();

    equals(regula.validate().length, 0, '@Future(format="YMD", date="20011/9/5") must not fail on 2009/7/3');

    deleteElements();
});

test('Test passing @Future against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("2100/7/3");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Future,
                params: {
                    format: regula.DateFormat.YMD,
                    date: "2011/9/5"
                }
            }
        ]
    });

    equals(regula.validate().length, 0, '@Future(format="YMD", date="20011/9/5") must not fail on 2009/7/3');

    deleteElements();
});

/**
 * The following tests will test the behavior of validation when using the validateEmptyFields configuration option
 */

module('Test validation behavior against the validateEmptyFields configuration option');

test('Test failing @Max against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Max",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be lesser than or equal to 5."
    });

    deleteElements();
});

test('Test passing @Max against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Max must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Max against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5, ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Max must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Min against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Min",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be greater than or equal to 5."
    });

    deleteElements();
});

test('Test passing @Min against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();

    equals(regula.validate().length, 0, "@Min must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Min against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5, ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();

    equals(regula.validate().length, 0, "@Min must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Range against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=5, max=10)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Range",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to be between 5 and 10."
    });

    deleteElements();
});

test('Test passing @Range against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=5, max=10)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Range must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Range against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=5, max=10, ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Range must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Pattern against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[a-z]+/)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Pattern",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field needs to match /[a-z]+/."
    });

    deleteElements();
});

test('Test passing @Pattern against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[a-z]+/)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Pattern must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Pattern against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[a-z]+/, ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Pattern must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Email against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Email",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field is not a valid email."
    });

    deleteElements();
});

test('Test passing @Email against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Email must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Email against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Email must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Alpha against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Alpha",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain letters."
    });

    deleteElements();
});

test('Test passing @Alpha against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Alpha must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Alpha against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Alpha must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Numeric against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Numeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers."
    });

    deleteElements();
});

test('Test passing @Numeric against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Numeric must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Numeric against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Numeric must not fail against empty field when validateEmptyFields is set to true, ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @AlphaNumeric against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "AlphaNumeric",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field can only contain numbers and letters."
    });

    deleteElements();
});

test('Test passing @AlphaNumeric against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@AlphaNumeric must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @AlphaNumeric against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@AlphaNumeric must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Integer against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Integer",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be an integer."
    });

    deleteElements();
});

test('Test passing @Integer against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Integer must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Integer against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Integer must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Real against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Real",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be a real number."
    });

    deleteElements();
});

test('Test passing @Real against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Real must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Real against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real(ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Real must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Digits against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Digits",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must have up to 2 digits and 2 fractional digits."
    });

    deleteElements();
});

test('Test passing @Digits against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Digits must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Digits against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2, ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Digits must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Past against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Past(format=\"MDY\")", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Past",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the past."
    });

    deleteElements();
});

test('Test passing @Past against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Past(format=\"MDY\")", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Past must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Past against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Past(format=\"MDY\", ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Past must not fail against empty field when validateEmptyFields is set to true and ignoreEmpty is set to true");
    deleteElements();
});

test('Test failing @Future against empty field', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Future(format=\"MDY\")", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });
    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "Future",
        groups: "Default",
        elementId: "myText",
        validatedGroups: "Default",
        errorMessage: "The text field must be in the future."
    });

    deleteElements();
});

test('Test passing @Future against empty field (validateEmptyFields set to false)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Future(format=\"MDY\")", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: false
    });

    regula.bind();
    var constraintViolation = regula.validate()[0];

    equals(regula.validate().length, 0, "@Future must not fail against empty field when validateEmptyFields is set to false");
    deleteElements();
});

test('Test passing @Future against empty field (validateEmptyFields set to true, ignoreEmpty set to true)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Future(format=\"MDY\", ignoreEmpty=true)", "text");
    $text.val("");

    regula.configure({
        validateEmptyFields: true
    });

    regula.bind();
    equals(regula.validate().length, 0, "@Future must not fail against empty field when validateEmptyFields is set to false and ignoreEmpty is set to true");
    deleteElements();
});

module('Test validation with @Future');

test('Test failing @PasswordsMatch', function() {
    var $form = createFormElement("myForm", '@PasswordsMatch(field1="password1", field2="password2")');
    var $password1 = createInputElement("password1", null, "password");
    $password1.val("mypassword");
    var $password2 = createInputElement("password2", null, "password");

    $form.append($password1);
    $form.append($password2);

    regula.bind();
    var constraintViolation = regula.validate()[0];

    testConstraintViolationsForDefaultConstraints(constraintViolation, {
        constraintName: "PasswordsMatch",
        groups: "Default",
        numFailingElements: 2,
        elementId: "password1",
        elementId2: "password2",
        validatedGroups: "Default",
        errorMessage: "Passwords do not match."
    });

    deleteElements();
});

test('Test passing @PasswordsMatch', function() {
    var $form = createFormElement("myForm", '@PasswordsMatch(field1="password1", field2="password2")');
    var $password1 = createInputElement("password1", null, "password");
    $password1.val("mypassword");
    var $password2 = createInputElement("password2", null, "password");
    $password2.val("mypassword");

    $form.append($password1);
    $form.append($password2);

    regula.bind();
    equals(regula.validate().length, 0, "@PasswordsMatch must not fail when both password fields match");

    deleteElements();
});

test('Test failing @CompletelyFilled', function() {
    var $form = createFormElement("myForm", "@CompletelyFilled");

    var $text = createInputElement("myText", null, "text");
    var $checkbox = createInputElement("myCheckbox", null, "checkbox");
    var $radio = createInputElement("myRadio", null, "radio");
    var $textarea = createInputElement("myTextarea", null, "textarea");
    var $select = createInputElement("mySelect", null, "select");

    $form.append($text);
    $form.append($checkbox);
    $form.append($radio);
    $form.append($textarea);
    $form.append($select);

    regula.bind();

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.composingConstraintViolations.length, 0, "There must not be any composing-constraint violations");
    equals(constraintViolation.compound, false, "@CompletelyFilled is not a compound constraint");
    equals(constraintViolation.constraintName, "CompletelyFilled", "@CompletelyFilled must be the failing constraint");
    equals(constraintViolation.constraintParameters.groups, "Default", "Must belong to the following group(s): Default");
    equals(constraintViolation.custom, false, "@CompleteleFilled is not a custom constraint");
    equals(constraintViolation.failingElements.length, 5, "There must be five failing elements");
    equals(constraintViolation.failingElements[0].id, "myText", "myText must be the id of the failing element");
    equals(constraintViolation.failingElements[1].id, "myCheckbox", "myCheckbox must be the id of the failing element");
    equals(constraintViolation.failingElements[2].id, "myRadio", "myRadio must be the id of the failing element");
    equals(constraintViolation.failingElements[3].id, "myTextarea", "myTextarea must be the id of the failing element");
    equals(constraintViolation.failingElements[4].id, "mySelect", "mySelect must be the id of the failing element");
    equals(constraintViolation.group, "Default", "The following groups must have been validated: Default");
    equals(constraintViolation.message, "The form must be completely filled.", "Wrong error message");

    deleteElements();
});

test('Test passing @CompletelyFilled', function() {
    var $form = createFormElement("myForm", "@CompletelyFilled");

    var $text = createInputElement("myText", null, "text");
    $text.val("text");

    var $checkbox = createInputElement("myCheckbox", null, "checkbox");
    $checkbox.attr("checked", "checked");

    var $radio = createInputElement("myRadio", null, "radio");
    $radio.attr("checked", "checked");

    var $textarea = createInputElement("myTextarea", null, "textarea");
    $textarea.val("test");

    var $select = createInputElement("mySelect", null, "select");
    $select.append(jQuery("<option></option>").attr("value", "default").text("default"));
    $select.append(jQuery("<option></option>").attr("value", "test").text("text"));
    $select.val("test");

    $form.append($text);
    $form.append($checkbox);
    $form.append($radio);
    $form.append($textarea);
    $form.append($select);

    regula.bind();
    equals(regula.validate().length, 0, "@CompleteleFilled must not fail when all elements are filled");

    deleteElements();
});

/** The following tests test regula.bind() when we call it with options. You can bind constraints to specific elements or groups of elements. These tests make sure that
 *  the calls error out if proper options haven't been supplied, and also ensures that some of the more complex binding-behaviors also happen.
 *  Ensuring that we get proper constraint violations from regula.validate() can be checked in the tests for regula.validate()
 */

module("Test regula.bind() to make sure it returns the expected errors and that it binds properly");

test('Test calling regula.bind() with an empty object-literal', function() {
    raises(function() {
        regula.bind({});
    }, new RegExp("regula.bind expects a non-null element attribute in the options argument. Function received: {}"), "regula.bind({}) must error out.");
});

test('Test calling regula.bind() with element attribute set to non-HTMLElement type', function() {
    raises(function() {
        regula.bind({
            element: "I swear I am an HTML element"
        });
    }, new RegExp("regula.bind: element attribute is expected to be an HTMLElement, but was of unexpected type: string. Function received: {element: I swear I am an HTML element}"), "regula.bind() with element set to non-HTMLElement must error out.");
});

test('Test calling regula.bind() with HTMLElement of wrong type (1)', function() {
    var div = jQuery("<div />").get(0);

    raises(function() {
        regula.bind({
            element: div
        });
    }, new RegExp("div# is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements. Function received: {}"), "regula.bind() with element sent to invalid HTMLElement must error out");
});

test('Test calling regula.bind() with HTMLElement of wrong type (2)', function() {
    var $div = jQuery("<div />").attr("data-constraints", "@Required");
    jQuery("body").append($div);

    raises(function() {
        regula.bind();
    }, new RegExp("div# is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements."), "regula.bind() with element sent to invalid HTMLElement must error out");
    $div.remove();
});

test('Test calling regula.bind() with valid input element and an HTMLElement of wrong type', function() {
    var div = jQuery("<div />").get(0);
    var $input = createInputElement("myInput", "@NotBlank", "text");

    raises(function() {
        regula.bind({
            elements: [$input.get(0), div]
        });
    }, new RegExp("regula.bind: Element 2 of 2 failed: div# is not an input, select, textarea, or form element! Validation constraints can only be attached to input, select, textarea, or form elements. Function received: {elements: \\[\\[object HTMLInputElement\\], \\[object HTMLDivElement\\]\\]}"), "Calling regula.bind() when one of the elements an invalid HTMLElement must error out");

    deleteElements();
});

test('Test calling regula.bind() with invalid constraint type', function() {
    var $input = createInputElement("myInput", null, "text");

    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Bogus}
            ]
        });
    }, new RegExp("regula.bind expects a valid constraint type for each constraint in constraints attribute of the options argument. Function received: {constraints: \\[\\[object Object\\]\\]}"), "Calling regula.bind() with an invalid constraint type must result in an error");

    deleteElements();
});

test('Test calling regula.bind() with an invalid group', function() {
    var $input = createInputElement("myInput", null, "text");

    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.NotBlank,
                    params: {
                        groups: [regula.Group.Bogus]
                    }
                }
            ]
        });
    }, new RegExp("Invalid group: undefined. Function received: {constraints: \\[\\[object Object\\]\\]}"), "Calling regula.bind() with an invalid constraint type must result in an error");

    deleteElements();
});

test('Test calling regula.bind() with an group attribute in the constraint set to a non-Array', function() {
    var $input = createInputElement("myInput", null, "text");

    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {
                    constraintType: regula.Constraint.NotBlank,
                    params: {
                        groups: "string"
                    }
                }
            ]
        });
    }, new RegExp("The groups parameter must be an array of enums or strings Function received: {constraints: \\[\\[object Object\\]\\]}"), "Calling regula.bind() with an invalid constraint type must result in an error");

    deleteElements();
});

test('Test calling regula.bind() with an element that does not have an id. id must be automatically generated', function() {
    var $input = createInputElement("", "@NotBlank", "text");

    regula.bind();
    var constraintViolation = regula.validate()[0];
    ok(/^regula-generated/.test(constraintViolation.failingElements[0].id), "element must have an id that starts with regula-generated");

    deleteElements();
});

test('Test that element has been bound to the groups specified (markup)', function() {
    var $text = createInputElement("myText", "@NotBlank(groups=[First, Second, Third])", "text");
    $text.val("");

    regula.bind();

    var constraintViolation = regula.validate({groups: [regula.Group.First]})[0];
    equals(constraintViolation.group, "First", "Constraint is expected to be bound to regula.Group.First");

    constraintViolation = regula.validate({groups: [regula.Group.Second]})[0];
    equals(constraintViolation.group, "Second", "Constraint is expected to be bound to regula.Group.Second");

    constraintViolation = regula.validate({groups: [regula.Group.Third]})[0];
    equals(constraintViolation.group, "Third", "Constraint is expected to be bound to regula.Group.Third");

    deleteElements();
});

test('Test that element has been bound to the groups specified (programmatic)', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {constraintType: regula.Constraint.NotBlank,
             params: {groups: ["First", "Second", "Third"]}
            }
        ]
    });

    var constraintViolation = regula.validate({groups: [regula.Group.First]})[0];
    equals(constraintViolation.group, "First", "Constraint is expected to be bound to regula.Group.First");

    constraintViolation = regula.validate({groups: [regula.Group.Second]})[0];
    equals(constraintViolation.group, "Second", "Constraint is expected to be bound to regula.Group.Second");

    constraintViolation = regula.validate({groups: [regula.Group.Third]})[0];
    equals(constraintViolation.group, "Third", "Constraint is expected to be bound to regula.Group.Third");

    deleteElements();
});

test('Test that original constraints do not get overwritten when binding to element again', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val(0);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 5
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Range,
                params: {
                    min: 5,
                    max: 10
                }
            }
        ]
    });

    var constraintViolations = regula.validate();
    equals(constraintViolations.length, 2, "There must be two constraints bound to this element");
    equals(constraintViolations[0].constraintName, "Min", "Min must be bound to this element");
    equals(constraintViolations[1].constraintName, "Range", "Range must be bound to this element");

    deleteElements();
});

test('Test that original constraint gets completely overwritten (overwriteConstraint set to true)', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val(0);

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Min,
                params: {
                    value: 5
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteConstraint: true,
                constraintType: regula.Constraint.Min,
                params: {
                    value: 10,
                    message: "unicorns rule"
                }
            }
        ]
    });

    var constraintViolations = regula.validate();
    equals(constraintViolations[0].constraintName, "Min", "Min must be bound to this element");
    equals(constraintViolations[0].constraintParameters.value, 10, "The value parameter must be equal to 10");
    equals(constraintViolations[0].constraintParameters.message, "unicorns rule", "The value of the message parameter does not match");

    deleteElements();
});

test('Test that the original constraint\'s parameters are constructively overwritten', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintName, "Pattern", "Pattern must be bound to this element");
    equals(constraintViolation.constraintParameters.regex.toString(), "/[a-z]/", "regex parameter must be /[a-z]/");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]+/,
                    flags: "ig"
                }
            }
        ]
    });

    constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintName, "Pattern", "Pattern must be bound to this element");
    equals(constraintViolation.constraintParameters.regex.toString(), "/[a-z]/", "regex parameter must remain /[a-z]/");
    equals(constraintViolation.constraintParameters.flags, "ig", "flags parameter must be ig");


    deleteElements();
});

test('Test that the original constraint\'s parameters are destructively overwritten (overwriteParameters set to true)', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintName, "Pattern", "Pattern must be bound to this element");
    equals(constraintViolation.constraintParameters.regex.toString(), "/[a-z]/", "regex parameter must be /[a-z]/");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteParameters: true,
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]+/,
                    flags: "ig"
                }
            }
        ]
    });

    constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintName, "Pattern", "Pattern must be bound to this element");
    equals(constraintViolation.constraintParameters.regex.toString(), "/[a-z]+/", "regex parameter must remain /[a-z]/+");
    equals(constraintViolation.constraintParameters.flags, "ig", "flags parameter must be ig");

    deleteElements();
});

test('Test group-overwriting behavior when overwriteConstraint is set to true (1)', function() {
    var $text = createInputElement("myText", null, "text");
    $text.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Second", "Third"]
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteConstraint: true,
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Fourth", "Fifth"]
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.groups, "Default,First,Fourth,Fifth", "Constraint must belong to the groups Default, First, Fourth, and Fifth");
    equals(regula.validate({groups: [regula.Group.First]}).length, 1, "Constraint must belong to the group First");
    equals(regula.Group.Second, undefined, "Group Second must not exist");
    equals(regula.Group.Third, undefined, "Group Third must not exist");
    equals(regula.validate({groups: [regula.Group.Fourth]}).length, 1, "Constraint must belong to the group Fourth");
    equals(regula.validate({groups: [regula.Group.Fifth]}).length, 1, "Constraint must belong to the group Fifth");

    deleteElements();
});

test('Test group-overwriting behavior when overwriteConstraint is set to true (2)', function() {
    var $text = createInputElement("myText", null, "text");
    var $anotherText = createInputElement("myOtherText", null, "text");
    $text.val("");
    $anotherText.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Second", "Third"]
                }
            }
        ]
    });

    regula.bind({
        element: $anotherText.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Second", "Third"]
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteConstraint: true,
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Fourth", "Fifth"]
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.groups, "Default,First,Fourth,Fifth", "Constraint must belong to the groups Default, First, Fourth, and Fifth");
    equals(regula.validate({elementId: "myText", groups: [regula.Group.First]}).length, 1, "Constraint must belong to the group First");
    raises(function() {
        regula.validate({elementId: "myText", groups: [regula.Group.Second]})
    }, /No element with id myText was found in the following group\(s\): \[Second\]. Function received: {elementId: myText, groups: \[Second\]}/, "Constraint must not belong to group Second");
    raises(function() {
        regula.validate({elementId: "myText", groups: [regula.Group.Third]})
    }, /No element with id myText was found in the following group\(s\): \[Third\]. Function received: {elementId: myText, groups: \[Third\]}/, "Constraint must not belong to group Third");
    equals(regula.validate({groups: [regula.Group.Fourth]}).length, 1, "Constraint must belong to the group Fourth");
    equals(regula.validate({groups: [regula.Group.Fifth]}).length, 1, "Constraint must belong to the group Fifth");

    deleteElements();
});

test('Test group-overwriting behavior when overwriteParameters is set to true (1)', function() {
   var $text = createInputElement("myText", null, "text");
    $text.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Second", "Third"]
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteParameters: true,
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Fourth", "Fifth"]
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.groups, "Default,First,Fourth,Fifth", "Constraint must belong to the groups Default, First, Fourth, and Fifth");
    equals(regula.validate({groups: [regula.Group.First]}).length, 1, "Constraint must belong to the group First");
    equals(regula.Group.Second, undefined, "Group Second must not exist");
    equals(regula.Group.Third, undefined, "Group Third must not exist");
    equals(regula.validate({groups: [regula.Group.Fourth]}).length, 1, "Constraint must belong to the group Fourth");
    equals(regula.validate({groups: [regula.Group.Fifth]}).length, 1, "Constraint must belong to the group Fifth");

    deleteElements();
});

test('Test group-overwriting behavior when overwriteParameters is set to true (2)', function() {
    var $text = createInputElement("myText", null, "text");
    var $anotherText = createInputElement("myOtherText", null, "text");
    $text.val("");
    $anotherText.val("");

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["First", "Second", "Third"]
                }
            }
        ]
    });

    regula.bind({
        element: $anotherText.get(0),
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: [regula.Group.First, regula.Group.Second, regula.Group.Third]
                }
            }
        ]
    });

    regula.bind({
        element: $text.get(0),
        constraints: [
            {
                overwriteParameters: true,
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: [regula.Group.First, "Fourth", "Fifth"]
                }
            }
        ]
    });

    var constraintViolation = regula.validate()[0];
    equals(constraintViolation.constraintParameters.groups, "Default,First,Fourth,Fifth", "Constraint must belong to the groups Default, First, Fourth, and Fifth");
    equals(regula.validate({elementId: "myText", groups: [regula.Group.First]}).length, 1, "Constraint must belong to the group First");
    raises(function() {
        regula.validate({elementId: "myText", groups: [regula.Group.Second]})
    }, /No element with id myText was found in the following group\(s\): \[Second\]. Function received: {elementId: myText, groups: \[Second\]}/, "Constraint must not belong to group Second");
    raises(function() {
        regula.validate({elementId: "myText", groups: [regula.Group.Third]})
    }, /No element with id myText was found in the following group\(s\): \[Third\]. Function received: {elementId: myText, groups: \[Third\]}/, "Constraint must not belong to group Third");
    equals(regula.validate({groups: [regula.Group.Fourth]}).length, 1, "Constraint must belong to the group Fourth");
    equals(regula.validate({groups: [regula.Group.Fifth]}).length, 1, "Constraint must belong to the group Fifth");

    deleteElements();
});

module('Test regula.unbind() to make sure it returns the expected errors and that it unbinds properly');

test('Test regula.unbind() without any parameters unbinds everything', function() {
    var $text0 = createInputElement("myText0", "@NotBlank", "text");
    $text0.val("");

    var $text1 = createInputElement("myText1", "@Max(value=5)", "text");
    $text1.val(10);

    var $text2 = createInputElement("myText2", "@Min(value=5)", "text");
    $text2.val(0);

    regula.bind();
    regula.unbind();

    equals(regula.validate().length, 0, "There must not be any constraint violations since all bound constraints should have been unbound");

    deleteElements();
});

test('Test regula.unbind() with empty options parameter', function() {
    raises(function() {
        regula.unbind({});
    }, /regula.unbind requires an id if options are provided/, "Calling regula.unbind() with empty options parameter must error out");
});

test('Test regula.unbind() with id parameter (1)', function() {
    var $text = createInputElement("myText", "@NotBlank @Max(value=5) @Min(value=10)", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText"
    });

    equals(regula.validate().length, 0, "There must not be any constraint violations since all constraints bound to this element have been removed");
    deleteElements();
});

test('Test regula.unbind() with id parameter (2)', function() {
    var $text0 = createInputElement("myText0", "@NotBlank @Max(value=5) @Min(value=10)", "text");
    var $text1 = createInputElement("myText1", "@NotBlank @Max(value=5) @Min(value=10)", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText0"
    });

    equals(regula.validate().length, 3, "Other bound elements must not have been unbound");
    raises(function() {
        regula.validate({elementId: "myText0"})
    }, /No constraints have been bound to element with id myText0. Function received: {elementId: myText0}/, "Calling regula.validate with an unbound element's id must result in an error");

    deleteElements();
});

test('Test regula.unbind() with id parameter (3)', function() {
    var $text0 = createInputElement("myText0", "@NotBlank(groups=[Zeroth]) @Max(value=5, groups=[First]) @Min(value=10, groups=[Second])", "text");
    var $text1 = createInputElement("myText1", "@NotBlank @Max(value=5, groups=[First]) @Min(value=10)", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText0"
    });

    equals(regula.validate().length, 3, "Other bound elements must not have been unbound");
    raises(function() {
        regula.validate({groups : [regula.Group.Zeroth]});
    }, /Undefined group in group list. Function received: {groups: \[undefined\]}/, "Since element has been unbound, all associated empty groups must have been removed");
    equals(regula.validate({groups: [regula.Group.First]}).length, 1, "Even though element associated with this group has been unbound, there are still other elements associated with this group");
    raises(function() {
        regula.validate({groups : [regula.Group.Second]});
    }, /Undefined group in group list. Function received: {groups: \[undefined\]}/, "Since element has been unbound, all associated empty groups must have been removed");

    deleteElements();
});

test('Test regula.unbind() with id and constraints parameter (1)', function() {
    var $text = createInputElement("myText", "@NotBlank @Max(value=5) @Min(value=10)", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText",
        constraints: [regula.Constraint.NotBlank]
    });

    equals(regula.validate().length, 2, "There should only be two constraints bound to this element");

    deleteElements();
});

test('Test regula.unbind() with id and constraints parameter (2)', function() {
    var $text = createInputElement("myText", "@NotBlank @Max(value=5) @Min(value=10)", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText",
        constraints: [regula.Constraint.NotBlank, regula.Constraint.Min]
    });

    equals(regula.validate().length, 1, "There should only be one constraint bound to this element");

    deleteElements();
});

test('Test regula.unbind() with id and constraints parameter (3)', function() {
    var $text = createInputElement("myText", "@NotBlank(groups=[Zeroth]) @Max(value=5, groups=[First]) @Min(value=10, groups=[Second])", "text");

    regula.bind();
    regula.unbind({
        elementId: "myText",
        constraints: [regula.Constraint.NotBlank]
    });

    equals(regula.validate().length, 2, "There should only be two constraints bound to this element");
    raises(function() {
        regula.validate({groups : [regula.Group.Zeroth]});
    }, /Undefined group in group list. Function received: {groups: \[undefined\]}/, "Since element has been unbound, all associated empty groups must have been removed");

    deleteElements();
});

test('Test regula.unbind() with unbound id', function() {
    raises(function() {
        regula.unbind({
            elementId: "myText"
        });
    }, /Element with id myText does not have any constraints bound to it. Function received: {elementId: myText}/, "regula.unbind() must fail if provided an unbound element's id");
});

test('Test regula.unbind() with unbound id and specified constraint', function() {
    raises(function() {
        regula.unbind({
            elementId: "myText",
            constraints: [regula.Constraint.NotBlank]
        });
    }, /Element with id myText does not have any constraints bound to it. Function received: {elementId: myText, constraints: \[5\]}/, "regula.unbind() must fail if provided an unbound element's id");
});

module('Test regula.compound() to make sure that it returns proper error messages and creates compound constraints properly');

test('Test calling regula.compound() without options', function() {
    raises(function() {
        regula.compound();
    }, /regula.compound expects options/, "regula.compound() must fail if no options are provided");
});

test('Test calling regula.compound() with empty options', function() {
    raises(function() {
        regula.compound({});
    }, /regula.compound expects a name attribute in the options argument/, "regula.compound() called with an empty options argument must throw an error");
});

test('Test calling regula.compound() with non-string name attribute', function() {
    raises(function() {
        regula.compound({
            name: true
        });
    }, /regula.compound expects name to be a string parameter/, "regula.compound() called with name set to a non-string value must throw an error");
});

test('Test calling regula.compound() with incomplete options (1)', function() {
    raises(function() {
        regula.compound({
            name: "MyCompoundConstraint"
        });
    }, /regula.compound expects an array of composing constraints under a constraints attribute in the options argument/, "regula.compound() must fail if no constraints attribute is provided");
});

test('Test calling regula.compound() with params attribute set to non-array type', function() {
    raises(function() {
        regula.compound({
            name: "MyCompoundConstraint",
            params: true
        });
    }, /regula.compound expects the params attribute in the options argument to be an array/, "regula.compound() called with params set to a non-array type must throw an error");
});

test('Test calling regula.compound() with previously-defined constraint name', function() {
    regula.compound({
        name: "MyCompoundConstraint",
        constraints: [
            {constraintType: regula.Constraint.Numeric},
            {constraintType: regula.Constraint.Checked}
        ]
    });

    raises(function() {
        regula.compound({
            name: "MyCompoundConstraint",
            constraints: [
                {constraintType: regula.Constraint.Numeric},
                {constraintType: regula.Constraint.Checked}
            ]
        });
    }, /regula.compound: There is already a constraint called MyCompoundConstraint. If you wish to override this constraint, use regula.override/, "Trying to define a previously-defined constraint should result in an error");
});

test('Test calling regula.compound() where a composing-constraint does not have a constraint type', function() {
    raises(function() {
        regula.compound({
            name: "AnotherCompoundConstraint",
            constraints: [
                {constraintType: regula.Constraint.Checked},
                {}
            ]
        });
    }, /In compound constraint AnotherCompoundConstraint: A composing constraint has no constraint type specified./, "Trying to define a compound constraint with a composing constraint without a constraint type must result in an error");
});

test('Test calling regula.compound() with definitions that involve parameter merging (1)', function() {
    raises(function() {
        regula.compound({
            name: "AnotherCompoundConstraint",
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        });
    }, new RegExp("In compound constraint AnotherCompoundConstraint: @Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameter\\(s\\): min, max"), "regula.compound() must throw an error when using a composing constraint with insufficient parameters");
});

test('Test calling regula.compound() with definitions that involve parameter merging (2)', function() {
    raises(function() {
        regula.compound({
            name: "AnotherCompoundConstraint",
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        max: 10
                    }
                }
            ]
        });
    }, new RegExp("In compound constraint AnotherCompoundConstraint: @Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min"), "regula.compound() must throw an error when using a composing constraint with insufficient parameters");
});

test('Test calling regula.compound() with definitions that involve parameter merging (3)', function() {
    raises(function() {
        regula.compound({
            name: "AnotherCompoundConstraint",
            params: ["max"],
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        });
    }, new RegExp("In compound constraint AnotherCompoundConstraint: @Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameter\\(s\\): min"), "regula.compound() must throw an error when using a composing constraint with insufficient parameters");
});

test('Test calling regula.compound() with definitions that involve parameter merging (4)', function() {
    equals(
        regula.compound({
            name: "CompoundConstraint0",
            params: ["max", "min"],
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        }), undefined, 'Calling regula.compound() with all parameters defined for all composing constraints must not fail'
    );
});

test('Test calling regula.compound() with definitions that involve parameter merging (5)', function() {
    equals(
        regula.compound({
            name: "CompoundConstraint1",
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        min: 5,
                        max: 10
                    }
                }
            ]
        }), undefined, 'Calling regula.compound() with all parameters defined for all composing constraints must not fail'
    );
});

test('Test calling regula.compound() with definitions that involve parameter merging (6)', function() {
    equals(
        regula.compound({
            name: "CompoundConstraint2",
            params: ["max", "min", "regex"],
            constraints: [
                {constraintType: regula.Constraint.Range},
                {constraintType: regula.Constraint.Pattern}
            ]
        }), undefined, 'Calling regula.compound() with all parameters defined for all composing constraints must not fail'
    );
});

test('Test calling regula.compound() with definitions that involve parameter merging (7)', function() {
    equals(
        regula.compound({
            name: "CompoundConstraint3",
            constraints: [
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        min: 5,
                        max: 10
                    }
                },
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        regex: /[a-z]+/
                    }
                }
            ]
        }), undefined, 'Calling regula.compound() with all parameters defined for all composing constraints must not fail'
    );
});

test('Test calling regula.compound() with definitions that involve a custom constraint', function() {
    regula.custom({
        name: "MyCustomConstraint",
        params: ["a", "b"],
        validator: function() {
            return false;
        }
    });

    equals(
        regula.compound({
            name: "CompoundConstraint4",
            params: ["a", "b"],
            constraints: [
                {constraintType: regula.Constraint.NotBlank},
                {constraintType: regula.Constraint.MyCustomConstraint}
            ]
        }), undefined, 'Calling regula.compound() with a custom constraint must not fail'
    );
});

test('Test calling regula.compound() with definitions that involve compound constraints', function() {
    regula.compound({
        name: "CompoundConstraint5",
        params: ["c", "d"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    regula.compound({
        name: "CompoundConstraint6",
        params: ["e", "f"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    equals(
        regula.compound({
            name: "CompoundConstraint7",
            params: ["c", "d", "e", "f"],
            constraints: [
                {constraintType: regula.Constraint.CompoundConstraint5},
                {constraintType: regula.Constraint.CompoundConstraint6}
            ]
        }), undefined, 'Calling regula.compound() with other compound constraints must not fail'
    );
});

test('Test calling regula.compound() with a mix of regular, custom, and compound constraints', function() {
    regula.custom({
        name: "AnotherCustomConstraint",
        params: ["a", "b"],
        validator: function() {
            return false;
        }
    });

    regula.compound({
        name: "CompoundConstraint8",
        params: ["c", "d"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    regula.compound({
        name: "CompoundConstraint9",
        params: ["e", "f"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    equals(
        regula.compound({
            name: "CompoundConstraint10",
            params: ["a", "b", "c", "d", "e", "f"],
            constraints: [
                {constraintType: regula.Constraint.CompoundConstraint8},
                {constraintType: regula.Constraint.CompoundConstraint9},
                {constraintType: regula.Constraint.AnotherCustomConstraint},
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        regex: /[a-z]+/
                    }
                }
            ]
        }), undefined, 'Calling regula.compound() with other compound constraints must not fail'
    );
});

test('Test binding a compound constraint with insufficient parameters', function() {
    regula.compound({
        name: "CompoundConstraint11",
        params: ["e", "f"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    var $text = createInputElement("myText", "@CompoundConstraint11", "text");
    raises(function() {
        regula.bind();
    }, new RegExp("myText.CompoundConstraint11: You seem to have provided some optional or required parameters for @CompoundConstraint11, but you are still missing the following 2 required parameter\\(s\\): e, f"), 'Binding to a compound constraint without sufficient parameters must result in an error');

    deleteElements();
});

test('Test that composing constraints and parameters have been properly bound to a compound constraint', function() {
     regula.custom({
        name: "OneMoreCustomConstraint",
        params: ["a", "b"],
        validator: function() {
            return false;
        }
    });

    regula.compound({
        name: "CompoundConstraint12",
        params: ["c", "d"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    regula.compound({
        name: "CompoundConstraint13",
        params: ["e", "f"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    equals(
        regula.compound({
            name: "CompoundConstraint14",
            params: ["c", "d", "f", "max"],
            constraints: [
                {constraintType: regula.Constraint.CompoundConstraint12},
                {
                    constraintType: regula.Constraint.CompoundConstraint13,
                    params: {
                        e: 10
                    }
                },
                {
                    constraintType: regula.Constraint.OneMoreCustomConstraint,
                    params: {
                        a: 11,
                        b: 12
                    }
                },
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        regex: /[a-z]+/
                    }
                },
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        min: 13
                    }
                }
            ]
        }), undefined, 'Calling regula.compound() with other compound constraints must not fail'
    );

    var $text = createInputElement("myText", "@CompoundConstraint14(c=14, d=15, f=16, max=17, message=\"This is {label} {a} {b} {c} {d} {e} {f} {max} {min} {regex}\", label=\"compound\")", "text");
    regula.bind();

    var constraintViolation = regula.validate()[0];

    equals(constraintViolation.compound, true, "Constraint must be a compound constraint");
    equals(constraintViolation.constraintName, "CompoundConstraint14", "The constraint name must match");
    equals(constraintViolation.constraintParameters.__size__, 7, "There must be seven parameters");
    equals(constraintViolation.constraintParameters.c, "14", "The value of the parameter 'c' must equal 14");
    equals(constraintViolation.constraintParameters.d, "15", "The value of the parameter 'd' must equal 15");
    equals(constraintViolation.constraintParameters.f, "16", "The value of the parameter 'f' must equal 16");
    equals(constraintViolation.composingConstraintViolations.length, 5, "There must be 5 composing-constraint violations");
    equals(constraintViolation.composingConstraintViolations[0].constraintName, "CompoundConstraint12", "The first composing-constraint violation must be the CompoundConstraint12 constraint");
    equals(constraintViolation.composingConstraintViolations[0].constraintParameters.__size__, 0, "CompoundConstraint12 must have zero parameters");
    equals(constraintViolation.composingConstraintViolations[0].composingConstraintViolations.length, 2, "CompoundConstraint12 must have two composing constraints");
    equals(constraintViolation.composingConstraintViolations[0].composingConstraintViolations[0].constraintName, "NotBlank", "CompoundConstraint12 must have the composing constraint NotBlank");
    equals(constraintViolation.composingConstraintViolations[0].composingConstraintViolations[1].constraintName, "Numeric", "CompoundConstraint12 must have the composing constraint Numeric");
    equals(constraintViolation.composingConstraintViolations[1].constraintName, "CompoundConstraint13", "The second composing-constraint violation must be the CompoundConstraint13 constraint");
    equals(constraintViolation.composingConstraintViolations[1].constraintParameters.__size__, 1, "CompoundConstraint13 must have 1 parameter");
    equals(constraintViolation.composingConstraintViolations[1].constraintParameters.e, 10, "The value of the parameter 'e' must equal 10");
    equals(constraintViolation.composingConstraintViolations[1].composingConstraintViolations.length, 2, "CompoundConstraint12 must have two composing constraints");
    equals(constraintViolation.composingConstraintViolations[1].composingConstraintViolations[0].constraintName, "NotBlank", "CompoundConstraint12 must have the composing constraint NotBlank");
    equals(constraintViolation.composingConstraintViolations[1].composingConstraintViolations[1].constraintName, "Numeric", "CompoundConstraint12 must have the composing constraint Numeric");
    equals(constraintViolation.composingConstraintViolations[2].constraintName, "OneMoreCustomConstraint", "The third composing-constraint violation must be the OneMoreCustomConstraint constraint");
    equals(constraintViolation.composingConstraintViolations[2].constraintParameters.__size__, 2, "OneMoreCustomConstraint must have 2 parameters");
    equals(constraintViolation.composingConstraintViolations[2].constraintParameters.a, 11, "The value of the parameter 'a' must equal 11");
    equals(constraintViolation.composingConstraintViolations[2].constraintParameters.b, 12, "The value of the parameter 'b' must equal 11");
    equals(constraintViolation.composingConstraintViolations[3].constraintName, "Pattern", "The fourth composing-constraint violation must be the Pattern constraint");
    equals(constraintViolation.composingConstraintViolations[3].constraintParameters.__size__, 1, "Pattern must have 1 parameter");
    equals(constraintViolation.composingConstraintViolations[3].constraintParameters.regex.toString(), "/[a-z]+/", "The value of the parameter 'regex' must equal /[a-z]+/");
    equals(constraintViolation.composingConstraintViolations[4].constraintName, "Range", "The fifth composing-constraint violation must be the Range constraint");
    equals(constraintViolation.composingConstraintViolations[4].constraintParameters.__size__, 1, "Range must have 1 parameter");
    equals(constraintViolation.composingConstraintViolations[4].constraintParameters.min, 13, "The value of the parameter 'min' must equal 13");
    equals(constraintViolation.message, "This is compound 11 12 14 15 10 16 17 13 /[a-z]+/", "The failure message must match");

    deleteElements();
});

test('Test that composing constraints and parameters have been properly bound to a compound constraint (reportAsSingleViolation set to true)', function() {
     regula.custom({
        name: "OneMoreCustomConstraint99",
        params: ["a", "b"],
        validator: function() {
            return false;
        }
    });

    regula.compound({
        name: "CompoundConstraint99",
        params: ["c", "d"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    regula.compound({
        name: "CompoundConstraint100",
        params: ["e", "f"],
        constraints: [
            {constraintType: regula.Constraint.NotBlank},
            {constraintType: regula.Constraint.Numeric}
        ]
    });

    equals(
        regula.compound({
            name: "CompoundConstraint101",
            params: ["c", "d", "f", "max"],
            reportAsSingleViolation: true,
            constraints: [
                {constraintType: regula.Constraint.CompoundConstraint99},
                {
                    constraintType: regula.Constraint.CompoundConstraint100,
                    params: {
                        e: 10
                    }
                },
                {
                    constraintType: regula.Constraint.OneMoreCustomConstraint99,
                    params: {
                        a: 11,
                        b: 12
                    }
                },
                {
                    constraintType: regula.Constraint.Pattern,
                    params: {
                        regex: /[a-z]+/
                    }
                },
                {
                    constraintType: regula.Constraint.Range,
                    params: {
                        min: 13
                    }
                }
            ]
        }), undefined, 'Calling regula.compound() with other compound constraints must not fail'
    );

    var $text = createInputElement("myText", "@CompoundConstraint101(c=14, d=15, f=16, max=17, message=\"This is {label} {a} {b} {c} {d} {e} {f} {max} {min} {regex}\", label=\"compound\")", "text");
    regula.bind();

    var constraintViolation = regula.validate()[0];

    equals(constraintViolation.compound, true, "Constraint must be a compound constraint");
    equals(constraintViolation.constraintName, "CompoundConstraint101", "The constraint name must match");
    equals(constraintViolation.constraintParameters.__size__, 7, "There must be seven parameters");
    equals(constraintViolation.constraintParameters.c, "14", "The value of the parameter 'c' must equal 14");
    equals(constraintViolation.constraintParameters.d, "15", "The value of the parameter 'd' must equal 15");
    equals(constraintViolation.constraintParameters.f, "16", "The value of the parameter 'f' must equal 16");
    equals(constraintViolation.composingConstraintViolations.length, 0, "There must not be any composing-constraint violations when reportAsSingleViolation is true");
    equals(constraintViolation.message, "This is compound 11 12 14 15 10 16 17 13 /[a-z]+/", "The failure message must match");

    deleteElements();
});

module('Test regula.override() to make sure that it returns proper error messages and creates compound constraints properly');

test('Test calling regula.override() without any options', function() {
    raises(function() {
        regula.override();
    }, /regula.override expects options/, "regula.override() when called without options must error out");
});

test('Test calling regula.override() with empty options', function() {
    raises(function() {
        regula.override({});
    }, /regula.override expects a valid constraintType attribute in the options argument/, "regula.override() when called with an empty options parameter must error out");
});

test('Test calling regula.override() with an undefined constraint type', function() {
    raises(function() {
        regula.override({
            constraintType: regula.Constraint.Bogus
        });
    }, /regula.override expects a valid constraintType attribute in the options argument/, "regula.override() when called with an undefined constraint type must error out");
});

test('Test calling regula.override() with an invalid constraint type', function() {
    raises(function() {
        regula.override({
            constraintType: "a"
        });
    }, new RegExp("regula.override: I could not find the specified constraint. Perhaps it has not been defined\\? Function received: Function received: {constraintType: a}"), "regula.override() when called with an invalid constraint type must error out");
});

test('Test calling regula.override() with non-boolean formSpecific attribute', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        validator: function() {
        }
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CustomConstraint" + time],
            formSpecific: "a"
        });
    }, /regula.override expects the formSpecific attribute in the options argument to be a boolean/, "regula.override() called with the formSpecific attribute set to a non-boolean value must error out");
});

test('Test calling regula.override() with non-function validator attribute', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        validator: function() {
        }
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CustomConstraint" + time],
            validator: "a"
        });
    }, /regula.override expects the validator attribute in the options argument to be a function/, "regula.override() called with the validator attribute set to a non-function value must error out");
});

test('Test calling regula.override() with non-array params attribute', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        validator: function() {
        }
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CustomConstraint" + time],
            params: "a"
        });
    }, /regula.override expects the params attribute in the options argument to be an array/, "regula.override() called with the params attribute set to a non-array value must error out");
});

test('Test calling regula.override() with non-string defaultMessage attribute', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        validator: function() {
        }
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CustomConstraint" + time],
            defaultMessage: 6
        });
    }, /regula.override expects the defaultMessage attribute in the options argument to be a string/, "regula.override() called with the defaultMessage attribute set to a non-string value must error out");
});

//NOTE: These tests takes care of the case where you can override constraints on a compound constraint

test('Test calling regula.override() to create a cyclic composition (1)', function() {
    var time = new Date().getTime();

    regula.compound({
        name: "CompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }]
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CompoundConstraint" + time],
            constraints: [{
                constraintType: regula.Constraint.NotBlank
            }, {
                constraintType: regula.Constraint.Numeric
            }, {
                constraintType: regula.Constraint["CompoundConstraint" + time]
            }]
        });
    }, new RegExp("regula.override: The overriding composing-constraints you have specified have created a cyclic composition: CompoundConstraint" + time + ".CompoundConstraint" + time), "regula.override() must not create a cyclic composition");
});

test('Test calling regula.override() to create a cyclic composition (2)', function() {
    var time = new Date().getTime();

    regula.compound({
        name: "CompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }]
    });

    regula.compound({
        name: "AwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["CompoundConstraint" + time]
        }]
    });


    raises(function() {
        regula.override({
            constraintType: regula.Constraint["CompoundConstraint" + time],
            constraints: [{
                constraintType: regula.Constraint.NotBlank
            }, {
                constraintType: regula.Constraint.Numeric
            }, {
                constraintType: regula.Constraint["AwesomeCompoundConstraint" + time]
            }]
        });
    }, new RegExp("regula.override: The overriding composing-constraints you have specified have created a cyclic composition: CompoundConstraint" + time + ".AwesomeCompoundConstraint" + time + ".CompoundConstraint" + time), "regula.override() must not create a cyclic composition");
});

test('Test calling regula.override() to create a cyclic composition (3)', function() {
    var time = new Date().getTime();

    regula.compound({
        name: "CompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }]
    });

    regula.compound({
        name: "AwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["CompoundConstraint" + time]
        }]
    });

    regula.compound({
        name: "SuperAwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["AwesomeCompoundConstraint" + time]
        }]
    });

    regula.compound({
        name: "SuperMegaAwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["SuperAwesomeCompoundConstraint" + time]
        }]
    });

    raises(function() {
        regula.override({
            constraintType: regula.Constraint["AwesomeCompoundConstraint" + time],
            constraints: [{
                constraintType: regula.Constraint.NotBlank
            }, {
                constraintType: regula.Constraint.Numeric
            }, {
                constraintType: regula.Constraint["SuperMegaAwesomeCompoundConstraint" + time]
            }]
        });
    }, new RegExp("regula.override: The overriding composing-constraints you have specified have created a cyclic composition: AwesomeCompoundConstraint" + time + ".SuperMegaAwesomeCompoundConstraint" + time + ".SuperAwesomeCompoundConstraint" + time + ".AwesomeCompoundConstraint" + time), "regula.override() must not create a cyclic composition");
});

test('Test successful regula.override() on a compound constraint', function() {
    var time = new Date().getTime();

    regula.compound({
        name: "CompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }]
    });

    regula.compound({
        name: "AwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["CompoundConstraint" + time]
        }]
    });

    regula.compound({
        name: "SuperAwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["AwesomeCompoundConstraint" + time]
        }]
    });

    regula.compound({
        name: "SuperMegaAwesomeCompoundConstraint" + time,
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }, {
            constraintType: regula.Constraint["SuperAwesomeCompoundConstraint" + time]
        }]
    });

    regula.override({
        constraintType: regula.Constraint["AwesomeCompoundConstraint" + time],
        constraints: [{
            constraintType: regula.Constraint.NotBlank
        }, {
            constraintType: regula.Constraint.Numeric
        }]
    });
});

test('Test that calling regula.override() on a built-in constraint only results in overriding the default message', function() {
    regula.override({
        constraintType: regula.Constraint.Range,
        params: ["a", "b"],
        formSpecific: true,
        validator: function() {
            return true;
        },
        defaultMessage: "The default message has changed"
    });

    var $text = createInputElement("myText", "@Range(min=0, max=5)", "text");
    regula.bind();

    var constraintViolations = regula.validate();
    var constraintViolation = constraintViolations[0];

    equals(constraintViolations.length, 1, "There must be a constraint violation because the validator must not have been overridden");
    equals(constraintViolation.constraintParameters.max, 5, "The max parameter must exist and it must be set to 5");
    equals(constraintViolation.constraintParameters.min, 0, "The min parameter must exist and it must be set to 0");
    ok(typeof constraintViolation.constraintParameters.a === "undefined", "The a parameter must not exist in params");
    ok(typeof constraintViolation.constraintParameters.b === "undefined", "The b parameter must not exist in params");
    equals(constraintViolation.formSpecific, false, "formSpecific must remain false");
    equals(constraintViolation.message, "The default message has changed", "The default message must have been changed");

    //reset Range to how it used to be
    regula.override({
        constraintType: regula.Constraint.Range,
        defaultMessage: "{label} needs to be between {min} and {max}"
    });

    deleteElements();
});

test('Test that calling regula.override() on a custom constraint without any new parameters, preserves the old values', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        params: ["a", "b"],
        formSpecific: false,
        validator: function() {
            return false;
        },
        defaultMessage: "a is {a} and b is {b}"
    });

    regula.override({
        constraintType: regula.Constraint["CustomConstraint" + time]
    });

    var $text = createInputElement("myText", "@CustomConstraint" + time + "(a=0, b=5)", "text");
    regula.bind();

    var constraintViolations = regula.validate();
    var constraintViolation = constraintViolations[0];

    equals(constraintViolations.length, 1, "There must be a constraint violation because the validator must not have been overridden");
    equals(constraintViolation.constraintParameters.a, "0", "The a parameter must exist and it must be set to 0");
    equals(constraintViolation.constraintParameters.b, "5", "The b parameter must exist and it must be set to 5");
    equals(constraintViolation.formSpecific, false, "formSpecific must remain false");
    equals(constraintViolation.message, "a is 0 and b is 5", "The default message must not have changed");

    deleteElements();
});

test('Test that you can override everything on a custom constraint', function() {
    var time = new Date().getTime();

    regula.custom({
        name: "CustomConstraint" + time,
        params: ["a", "b"],
        formSpecific: false,
        validator: function() {
            return true;
        },
        defaultMessage: "a is {a} and b is {b}"
    });

    regula.override({
        constraintType: regula.Constraint["CustomConstraint" + time],
        params: ["c", "d"],
        formSpecific: true,
        validator: function() {
            return false;
        },
        defaultMessage: "c is {c} and d is {d}"
    });

    var $form = createFormElement("myText", "@CustomConstraint" + time + "(c=0, d=5)");
    regula.bind();

    var constraintViolations = regula.validate();
    var constraintViolation = constraintViolations[0];

    equals(constraintViolations.length, 1, "There must be a constraint violation because the validator must have been overridden");
    equals(constraintViolation.constraintParameters.c, "0", "The c parameter must exist and it must be set to 0");
    equals(constraintViolation.constraintParameters.d, "5", "The d parameter must exist and it must be set to 5");
    equals(constraintViolation.formSpecific, true, "formSpecific must be true");
    equals(constraintViolation.message, "c is 0 and d is 5", "The default message must have changed");

    deleteElements();
});

/*
 * TODO: Test regula.validate(): custom label, message, groups, and interpolation. Test in conjunction with regula.custom() and regula.compound() and regula.override(). This will be kind of an integration test.
 * TODO: You want to make sure that things like parameter interpolation, parameters, etc. all work. Some of these have already been done. You just have to do the others.
 * */

module('Test regula.validate()');

test('Test that regula.validate() doesn\'t error out after a bound element has been deleted', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Required");

    regula.bind();
    deleteElements();

    equals(regula.validate().length, 0, "Calling validate() should succeed (i.e., not error out) even if a bound element has been deleted");
});

test('Test calling regula.validate() without any arguments', function() {
    equals(regula.validate().length, 0, "Calling regula.validate() without any arguments should succeed");
});

test('Test calling regula.validate() with an empty options parameter', function() {
    equals(regula.validate({}).length, 0, "Calling regula.validate() with an empty options argument should succeed");
});

test('Test calling regula.validate() with non-array groups attribute', function() {
    raises(function() {
        regula.validate({groups: "test"});
    }, /regula.validate: If a groups attribute is provided, it must be an array./, "Calling regula.validate() with the groups attribute set to a non-array should error out");
});

test('Test calling regula.validate() with empty groups attribute', function() {
    raises(function() {
        regula.validate({groups: []});
    }, /regula.validate: If a groups attribute is provided, it must not be empty./, "Calling regula.validate() with an empty groups attribute should error out");
});

test('Test calling regula.validate() with groups attribute (1)', function() {
    var $groupAtext0 = createInputElement("groupAtext0", "@NotBlank(groups=[GroupA])", "text");
    var $groupAtext1 = createInputElement("groupAtext1", "@Numeric(groups=[GroupA])", "text");
    var $groupAtext2 = createInputElement("groupAtext2", "@Past(format=\"YMD\", groups=[GroupA])", "text");

    var $groupBtext0 = createInputElement("groupBtext0", "@NotBlank(groups=[GroupB])", "text");
    var $groupBtext1 = createInputElement("groupBtext1", "@Numeric(groups=[GroupB])", "text");
    var $groupBtext2 = createInputElement("groupBtext2", "@Past(format=\"YMD\", groups=[GroupB])", "text");

    var $groupCtext0 = createInputElement("groupCtext0", "@NotBlank(groups=[GroupC])", "text");
    var $groupCtext1 = createInputElement("groupCtext1", "@Numeric(groups=[GroupC])", "text");
    var $groupCtext2 = createInputElement("groupCtext2", "@Past(format=\"YMD\", groups=[GroupC])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.GroupA, regula.Group.GroupB]
    });

    equals(constraintViolations.length, 6, "There must be six constraint violations");
    equals(constraintViolations[0].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[1].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[2].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[3].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[4].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[5].group, "GroupB", "Constraint must be part of Group B");

    deleteElements();
});

test('Test calling regula.validate() with groups attribute (2)', function() {
    var $groupAtext0 = createInputElement("groupAtext0", "@NotBlank(groups=[GroupA])", "text");
    var $groupAtext1 = createInputElement("groupAtext1", "@Numeric(groups=[GroupA])", "text");
    var $groupAtext2 = createInputElement("groupAtext2", "@Past(format=\"YMD\", groups=[GroupA])", "text");

    var $groupBtext0 = createInputElement("groupBtext0", "@NotBlank(groups=[GroupB])", "text");
    var $groupBtext1 = createInputElement("groupBtext1", "@Numeric(groups=[GroupB])", "text");
    var $groupBtext2 = createInputElement("groupBtext2", "@Past(format=\"YMD\", groups=[GroupB])", "text");

    var $groupBCtext0 = createInputElement("groupBCtext0", "@NotBlank(groups=[GroupB, GroupC])", "text");
    var $groupBCtext1 = createInputElement("groupBCtext1", "@Numeric(groups=[GroupB, GroupC])", "text");
    var $groupBCtext2 = createInputElement("groupBCtext2", "@Past(format=\"YMD\", groups=[GroupB, GroupC])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.GroupA, regula.Group.GroupB]
    });

    equals(constraintViolations.length, 9, "There must be nine constraint violations");
    equals(constraintViolations[0].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[1].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[2].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[3].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[4].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[5].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[6].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[7].group, "GroupB", "Constraint must be part of Group B");
    equals(constraintViolations[8].group, "GroupB", "Constraint must be part of Group B");

    constraintViolations = regula.validate({
        groups: [regula.Group.GroupC]
    });

    equals(constraintViolations.length, 3, "There must be three constraint violations");
    equals(constraintViolations[0].group, "GroupC", "Constraint must be part of Group C");
    equals(constraintViolations[1].group, "GroupC", "Constraint must be part of Group C");
    equals(constraintViolations[2].group, "GroupC", "Constraint must be part of Group C");

    deleteElements();
});

test('Test calling regula.validate() with groups attribute (independent set to false)', function() {
    var $groupAtext0 = createInputElement("groupAtext0", "@NotBlank(groups=[GroupA])", "text");
    var $groupAtext1 = createInputElement("groupAtext1", "@Numeric(groups=[GroupA])", "text");
    var $groupAtext2 = createInputElement("groupAtext2", "@Past(format=\"YMD\", groups=[GroupA])", "text");

    var $groupBtext0 = createInputElement("groupBtext0", "@NotBlank(groups=[GroupB])", "text");
    var $groupBtext1 = createInputElement("groupBtext1", "@Numeric(groups=[GroupB])", "text");
    var $groupBtext2 = createInputElement("groupBtext2", "@Past(format=\"YMD\", groups=[GroupB])", "text");

    var $groupBCtext0 = createInputElement("groupBCtext0", "@NotBlank(groups=[GroupB, GroupC])", "text");
    var $groupBCtext1 = createInputElement("groupBCtext1", "@Numeric(groups=[GroupB, GroupC])", "text");
    var $groupBCtext2 = createInputElement("groupBCtext2", "@Past(format=\"YMD\", groups=[GroupB, GroupC])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.GroupA, regula.Group.GroupB],
        independent: false
    });

    equals(constraintViolations.length, 3, "There must be three constraint violations");
    equals(constraintViolations[0].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[1].group, "GroupA", "Constraint must be part of Group A");
    equals(constraintViolations[2].group, "GroupA", "Constraint must be part of Group A");

    deleteElements();
});

test('Test calling regula.validate() with non-array elements attribute', function() {
    raises(function() {
        regula.validate({elements: "test"});
    }, /regula.validate: If an elements attribute is provided, it must be an array./, "Calling regula.validate() with elements attribute set to non-array should error out");
});

test('Test calling regula.validate() with empty elements attribute', function() {
    raises(function() {
        regula.validate({elements: []});
    }, /regula.validate: If an elements attribute is provided, it must not be empty./, "Calling regula.validate() with ane mpty elements attribute should error out");
});

test('Test calling regula.validate() with array of elements (constraints passing)', function() {
    var $text0 = createInputElement("text0", "@NotBlank", "text");
    $text0.val("Not blank hahaha");

    var $text1 = createInputElement("text1", "@Numeric", "text");
    $text1.val("3");

    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");
    $text2.val("123qwe");

    regula.bind();
    equals(regula.validate({elements: [$text0.get(0), $text1.get(0), $text2.get(0)]}).length, 0, "Calling regula.validate() with elements attributes shouldn't error out");

    deleteElements();
});

test('Test calling regula.validate() with array of elements (constraints failing)', function() {
    var $text0 = createInputElement("text0", "@NotBlank", "text");
    var $text1 = createInputElement("text1", "@Numeric", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    equals(regula.validate({elements: [$text0.get(0), $text1.get(0), $text2.get(0)]}).length, 3, "Calling regula.validate() with elements attributes shouldn't error out");

    deleteElements();
});

test('Test calling regula.validate() after having deleted an element', function() {
    var $text0 = createInputElement("text0", "@NotBlank", "text");
    var $text1 = createInputElement("text1", "@Numeric", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    $text1.remove();
    equals(regula.validate().length, 2, "Calling regula.validate() after having removed one element shouldn't error out");

    deleteElements();
});

test('Test calling regula.validate() with a constraint type', function() {
    var $text0 = createInputElement("text0", "@Numeric", "text");
    var $text1 = createInputElement("text1", "@Numeric", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        constraintType: regula.Constraint.Numeric
    });

    equals(constraintViolations.length, 2, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Numeric", "@Numeric should be the first constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[1].constraintName, "Numeric", "@Numeric should be the second constraint");
    equals(constraintViolations[1].failingElements[0].id, "text1", "The id of the failing element does not match");

    deleteElements();
});

test('Test calling regula.validate() with an invalid constraint type', function() {
    raises(function() {
        regula.validate({
            constraintType: regula.Constraint.FakeConstraint
        });
    }, /regula.validate: If a constraintType attribute is provided, it cannot be undefined./, "Calling validate with an undefined constraint-type should error out");
});

test('Test calling regula.validate() with a constraint that hasn\'t been bound to any element', function() {
    regula.unbind();

    raises(function() {
        regula.validate({
            constraintType: regula.Constraint.AlphaNumeric
        });
    }, /Constraint AlphaNumeric has not been bound to any element. Function received: {constraintType: AlphaNumeric}/, "Calling validate with a constraint type that hasn't been bound to any element should error out");
});

test('Test calling requla.validate() with elementId', function() {
    var $text0 = createInputElement("text0", "@Numeric", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elementId: "text0"
    });

    equals(constraintViolations.length, 1, "There should only be one constraint-violation");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].constraintName, "Numeric", "@Numeric should be the failing constraint");

    deleteElements();
});

test('Test calling regula.validate() with elementId and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric @AlphaNumeric @NotBlank", "text");
    var $text1 = createInputElement("text1", "@NotBlank", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elementId: "text0",
        constraintType: regula.Constraint.AlphaNumeric
    });

    equals(constraintViolations.length, 1, "There should only be one constraint-violation");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].constraintName, "AlphaNumeric", "@AlphaNumeric should be the failing constraint");

    deleteElements();
});

test('Test calling regula.validate() with elementId and unbound constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric @AlphaNumeric @NotBlank", "text");
    var $text1 = createInputElement("text1", "@NotBlank", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            elementId: "text0",
            constraintType: regula.Constraint.Email
        });
    }, /No element with id text0 was found with the constraint Email bound to it. Function received: {elementId: text0, constraintType: Email}/, "Calling regula.validate() with element id and unbound constraint should error out.");

    deleteElements();
});

test('Test calling regula.validate() with elements and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric @Email", "text");
    var $text1 = createInputElement("text1", "@Numeric", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elements: [$text0.get(0), $text1.get(0)],
        constraintType: regula.Constraint.Numeric
    });

    equals(constraintViolations.length, 2, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Numeric", "@Numeric should be the first constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[1].constraintName, "Numeric", "@Numeric should be the second constraint");
    equals(constraintViolations[1].failingElements[0].id, "text1", "The id of the failing element does not match");

    deleteElements();
});

test('Test calling regula.validate() with elements and unbound constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric @Email", "text");
    var $text1 = createInputElement("text1", "@Numeric", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            elements: [$text0.get(0), $text1.get(0)],
            constraintType: regula.Constraint.Email
        });
    }, new RegExp("No element with id text1 was found with the constraint Email bound to it. Function received: {elements: \\[\\[object HTMLInputElement\\], \\[object HTMLInputElement\\]\\], constraintType: Email, elementId: text1}"), "Calling regula.validate() with elements and unbound constraint should error out");

    deleteElements();
});

test('Test calling regula.validate() with groups and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.FirstGroup, regula.Group.SecondGroup],
        constraintType: regula.Constraint.Numeric
    });

    equals(constraintViolations.length, 2, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Numeric", "@Numeric should be the first constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "FirstGroup", "The group attribute of the constraint violation does not match");
    equals(constraintViolations[1].constraintName, "Numeric", "@Numeric should be the second constraint");
    equals(constraintViolations[1].failingElements[0].id, "text1", "The id of the failing element does not match");
    equals(constraintViolations[1].group, "SecondGroup", "The group attribute of the constraint violation does not match");

    deleteElements();
});

test('Test calling regula.validate() with undefined and unbound constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            groups: [regula.Group.FirstGroup, regula.Group.SecondGroup, regula.Group.FakeGroup],
            constraintType: regula.Constraint.Numeric
        });
    }, new RegExp("Undefined group in group list. Function received: {groups: \\[FirstGroup, SecondGroup, undefined\\], constraintType: Numeric}"), "Calling regula.validate() with undefined group and constraint should error out");

    deleteElements();
});

test('Test calling regula.validate() with groups and unbound constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");
    var $text2 = createInputElement("text2", "@AlphaNumeric", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            groups: [regula.Group.FirstGroup, regula.Group.SecondGroup],
            constraintType: regula.Constraint.AlphaNumeric
        });
    }, new RegExp("Constraint AlphaNumeric has not been bound to any element under group FirstGroup. Function received: {groups: \\[FirstGroup, SecondGroup\\], constraintType: AlphaNumeric}"), "Calling regula.validate() with group and unbound constraint should error out");

    deleteElements();
});

test('Test calling regula.validate() with groups and elementId', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.SecondGroup],
        elementId: "text0"
    });

    equals(constraintViolations.length, 1, "There should only be one constraint-violation");
    equals(constraintViolations[0].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "SecondGroup", "The group of the failing constraint does not match");

    deleteElements();
});

test('Test calling regula.validate() with groups and elements', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        groups: [regula.Group.SecondGroup],
        elements: [$text0.get(0), $text1.get(0)]
    });


    equals(constraintViolations.length, 2, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "SecondGroup", "The group of the failing constraint does not match");
    equals(constraintViolations[1].constraintName, "Numeric", "@Numeric should be the second constraint");
    equals(constraintViolations[1].failingElements[0].id, "text1", "The id of the failing element does not match");
    equals(constraintViolations[1].group, "SecondGroup", "The group attribute of the constraint violation does not match");

    deleteElements();
});

test('Test calling regula.validate() with undefined group and elements', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[SecondGroup])", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            groups: [regula.Group.SecondGroup, regula.Group.FakeGroup],
            elements: [$text0.get(0), $text1.get(0)]
        });
    }, new RegExp("Undefined group in group list. Function received: {groups: \\[SecondGroup, undefined\\], elements: \\[\\[object HTMLInputElement\\], \\[object HTMLInputElement\\]\\], elementId: text0}"), "Calling regula.validate() with undefined group and elements should error out");;

    deleteElements();
});

test('Test calling regula.validate() with groups and unbound element', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[FirstGroup])", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            groups: [regula.Group.SecondGroup],
            elements: [$text0.get(0), $text1.get(0)]
        });
    }, new RegExp("No element with id text1 was found in the following group\\(s\\): \\[SecondGroup\\]. Function received: {groups: \\[SecondGroup\\], elements: \\[\\[object HTMLInputElement\\], \\[object HTMLInputElement\\]\\], elementId: text1}"), "Calling regula.validate() with groups and unbound element should error out");

    deleteElements();
});

test('Test calling regula.validate() with elementId, group, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[FirstGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[FirstGroup])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elementId: "text0",
        constraintType: regula.Constraint.Email,
        groups: [regula.Group.SecondGroup]
    });

    equals(constraintViolations.length, 1, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "SecondGroup", "The group of the failing constraint does not match");
});

test('Test calling regula.validate() with elements, group, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Numeric(groups=[FirstGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[SecondGroup])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elements: [$text0.get(0), $text2.get(0)],
        constraintType: regula.Constraint.Email,
        groups: [regula.Group.SecondGroup]
    });

    equals(constraintViolations.length, 2, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "SecondGroup", "The group of the failing constraint does not match");
    equals(constraintViolations[1].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[1].failingElements[0].id, "text2", "The id of the failing element does not match");
    equals(constraintViolations[1].group, "SecondGroup", "The group of the failing constraint does not match");
});

test('Test calling regula.validate() with elements not bound to group, group, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Email(groups=[FirstGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[SecondGroup])", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            elements: [$text0.get(0), $text2.get(0), $text1.get(0)],
            constraintType: regula.Constraint.Email,
            groups: [regula.Group.SecondGroup, regula.Group.FirstGroup]
        });
    }, /No constraints have been defined for the element with id: text1 in group SecondGroup/, "Calling regula.validate() with elements not bound to group, group, and constraint should error out");
});

test('Test calling regula.validate() with elements, undefined group, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Email(groups=[FirstGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[SecondGroup])", "text");

    raises(function() {
        regula.validate({
            elements: [$text0.get(0), $text2.get(0)],
            constraintType: regula.Constraint.Email,
            groups: [regula.Group.SecondGroup, regula.Group.FakeGroup]
        });
    }, new RegExp("Undefined group in group list \\(group: undefined, elementId: text0, constraint: Email\\)"), "Calling regula.validate() with elements, unbound group, and constraint should error out");
});

test('Test calling regula.validate() with elements, groups, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Email(groups=[FirstGroup, SecondGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[FirstGroup, SecondGroup])", "text");

    regula.bind();
    var constraintViolations = regula.validate({
        elements: [$text0.get(0), $text2.get(0), $text1.get(0)],
        constraintType: regula.Constraint.Email,
        groups: [regula.Group.SecondGroup, regula.Group.FirstGroup]
    });

    equals(constraintViolations.length, 3, "There should only be two constraint-violations");
    equals(constraintViolations[0].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[0].failingElements[0].id, "text0", "The id of the failing element does not match");
    equals(constraintViolations[0].group, "SecondGroup", "The group of the failing constraint does not match");
    equals(constraintViolations[1].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[1].failingElements[0].id, "text2", "The id of the failing element does not match");
    equals(constraintViolations[1].group, "SecondGroup", "The group of the failing constraint does not match");
    equals(constraintViolations[2].constraintName, "Email", "@Email should be the failing constraint");
    equals(constraintViolations[2].failingElements[0].id, "text1", "The id of the failing element does not match");
    equals(constraintViolations[2].group, "SecondGroup", "The group of the failing constraint does not match");
});

test('Test calling regula.validate() with elements not bound to constraint, groups, and constraint', function() {
    var $text0 = createInputElement("text0", "@Numeric(groups=[FirstGroup]) @Email(groups=[SecondGroup])", "text");
    var $text1 = createInputElement("text1", "@Email(groups=[FirstGroup, SecondGroup])", "text");
    var $text2 = createInputElement("text2", "@Email(groups=[FirstGroup, SecondGroup])", "text");

    regula.bind();
    raises(function() {
        regula.validate({
            elements: [$text0.get(0), $text2.get(0), $text1.get(0)],
            constraintType: regula.Constraint.Numeric,
            groups: [regula.Group.SecondGroup, regula.Group.FirstGroup]
        });
    }, /Numeric in group SecondGroup hasn't been bound to the element with id text0/, "Calling regula.validate() with elements not bound to constraint, groups, and constraint should error out");
});

test('Test label and message interpolation when calling regula.validate() (1)', function() {
    var $text0 = createInputElement("text0", '@Numeric(label="monkey", message="{label} is awesome")', "text");

    regula.bind();
    var constraintViolations = regula.validate();
    equals(constraintViolations[0].message, "monkey is awesome", "Interpolated message must match");
});

test('Test label and message interpolation when calling regula.validate() (2)', function() {
    var $text0 = createInputElement("text0", '@Numeric(label="monkey", msg="{label} is awesome")', "text");

    regula.bind();
    var constraintViolations = regula.validate();
    equals(constraintViolations[0].message, "monkey is awesome", "Interpolated message must match");
});
