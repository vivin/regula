// Let's test this function
/*function isEven(val) {
 return val % 2 === 0;
 }

 test('isEven()', function() {
 ok(isEven(0), 'Zero is an even number');
 ok(isEven(2), 'So is two');
 ok(isEven(-4), 'So is negative four');
 ok(!isEven(1), 'One is not an even number');
 ok(!isEven(-7), 'Neither is negative seven');
 })*/


function createInputElement(id, definition) {
    var $input = jQuery("<input />");

    $input.attr("id", id);
    $input.attr("type", "hidden");
    $input.attr("class", "regula-validation");
    $input.attr("data-constraints", definition);

    jQuery("body").append($input);

    return $input;
}

function deleteInputElement(id) {
    jQuery("#" + id).remove();
}

function invalidNameExceptionMessage(id) {

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

/*
We use raises here because the constraint names we are using aren't defined. So we expect an exception.
 */
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

test('Test definition without closing parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range(");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".Range: Invalid parameter definition " +
                                               inputElementId + ".Range: Invalid parameter name. You might have unmatched parentheses " +
                                               inputElementId + ".Range: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");
    raises(regula.bind, expectedExceptionMessage, "'@Range(' should not be a valid definition");

    deleteInputElement(inputElementId);
});

test('Test definition without opening parenthesis', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Range)");

    var expectedExceptionMessage =  new RegExp(inputElementId + ".Range: Unexpected character '\\)' after constraint definition");
    raises(regula.bind, expectedExceptionMessage, "'@Range)' should not be a valid definition");

    deleteInputElement(inputElementId);
})
