function createInputElement(id, definition, type) {
    var $input = (type != "select" && type != "textarea") ? jQuery("<input />") : jQuery("<" + type + "/>");
    var _type = type || "hidden";

    if(type != "select" && type != "textarea") 
       $input.attr("type", _type);


    $input.attr("id", id);

    if(typeof definition != "undefined") {
       $input.attr("data-constraints", definition);
    }

    $input.hide();

    jQuery("body").append($input);

    return $input;
}

function createFormElement(id, definition) {
    var $form = jQuery("<form />");
    $form.attr("id", id);
    $form.attr("data-constraints", definition);
    $form.hide();

    jQuery("body").append($form);

    return $form;
}

function deleteElement(id) {
    jQuery("#" + id).remove();
    regula.unbind();
}

/*
 The constraint-definition-parsing (success) tests make sure that no exceptions are raised. Since there is
 no return value from a successful bind(), I check to see that the return value is undefined. If there is
 any error during binding, an exception is raised.
 */
module("Constraint-definition parsing tests");

test("Test regula('validate') after a bound element has been deleted", function() {
    var inputElementId = "myText";
    var $input = createInputElement(inputElementId, "@Required");

    $("#" + inputElementId).regula('bind');
    deleteElement(inputElementId);

    equals($("#" + inputElementId).regula('validate').length, 0, "Calling regula('validate') should succeed even if a bound element has been deleted");
});

test('Test empty definition', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "");

    equals($("#" + inputElementId).regula('bind'), undefined, "Calling bind() on an element with no constraints must not return anything");

    deleteElement(inputElementId);
});

test('Test definition without a name throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(function() {$("#" + inputElementId).regula('bind')}, expectedExceptionMessage, "'@' should not be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition that does not start with @ throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint. Constraint definitions need to start with '@'");
    raises(function() {$("#" + inputElementId).regula('bind')}, expectedExceptionMessage, "'ThisShouldFail' should not be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with group-definition (with one group) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup])");

    equals($("#" + inputElementId).regula('bind'), undefined, "@NotBlank(groups=[MyGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with group-definition (with more than one group) as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup])");

    equals($("#" + inputElementId).regula('bind'), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals($("#" + inputElementId).regula('bind'), undefined, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple constraints, with one malformed constraint', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @NotBlank(");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " + inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses hiddenInput.NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");

    raises(function() {$("#" + inputElementId).regula('bind')}, expectedExceptionMessage, "@NotBlank @NotBlank( is not a valid definition");

    deleteElement(inputElementId)
});

test('Test definition with multiple valid constraints (markup)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equals($("#" + inputElementId).regula('bind'), undefined, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid constraints (programmatic)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equals($("#" + inputElementId).regula('bind', {
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

    deleteElement(inputElementId);
});

module("Test binding pre-defined constraints to elements, via HTML");

test('Test binding @Checked through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Checked");

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");
    raises(function() {$("#" + formElementId).regula('bind')}, expectedExceptionMessage, "@Checked cannot be bound to a form element");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled to a non-form element through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CompletelyFilled");

    var expectedExceptionMessage = new RegExp(inputElementId + ".CompletelyFilled: @CompletelyFilled is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {$("#" + inputElementId).regula('bind')}, expectedExceptionMessage, "@CompletelyFilled cannot be bound to a non-form element");

    deleteElement(inputElementId);
});

test('Test binding @Checked through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
       $("#" + formElementId).regula('bind', {
           constraints: [
               {constraintType: regula.Constraint.Checked}
           ]
       });
    }, expectedExceptionMessage, "@Checked cannot be bound to a form element");

    deleteElement(formElementId);
});

test('Test binding @Checked through regula.bind to a non-checkbox/non-radio-button element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Checked: @Checked is only applicable to checkboxes and radio buttons. You are trying to bind it to an input element that is neither a checkbox nor a radio button");

    raises(function() {
       $("#" + inputElementId).regula('bind', {
           constraints: [
               {constraintType: regula.Constraint.Checked}
           ]
       });
    }, expectedExceptionMessage, "@Checked should not be bound to a non-checkbox/non-radio-button element");

    deleteElement(inputElementId);
});

test('Test binding @Required through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Required: @Required is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        $("#" + formElementId).regula('bind', {
            constraints: [
                {constraintType: regula.Constraint.Required}
            ]
        })
    }, expectedExceptionMessage, "@Required cannot be bound to a form element");

    deleteElement(formElementId);
});

test('Test binding @Max (with required parameter and optional groups, label and message parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals($("#" + inputElementId).regula('bind', {
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

    deleteElement(inputElementId);
});




//TODO: Continue picking through the rest of the tests to choose which we want to keep.  Convert the tests to use the jquery plugin for binding and validation.














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

    deleteElement(formElementId);
});

test('Test binding @Min (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameters\\(s\\): value");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Min}
            ]
        });
    }, expectedExceptionMessage, "@Min cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Min (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameters\\(s\\): value");
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

    deleteElement(inputElementId);
});

test('Test binding @Min (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameters\\(s\\): value");
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

    deleteElement(inputElementId);
});

test('Test binding @Min (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameters\\(s\\): value");
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

    deleteElement(inputElementId);
});

test('Test binding @Min (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Min: You seem to have provided some optional or required parameters for @Min, but you are still missing the following 1 required parameters\\(s\\): value");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Range (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Range}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Range (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Range (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Range (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Range (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Range (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameters\\(s\\): min");
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

    deleteElement(inputElementId);
});

test('Test binding @Range (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameters\\(s\\): max");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Between (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Between}
            ]
        });
    }, expectedExceptionMessage, "@Range cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Between (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Between (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Between (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Between (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Between (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameters\\(s\\): min");
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

    deleteElement(inputElementId);
});

test('Test binding @Between (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Range: You seem to have provided some optional or required parameters for @Range, but you are still missing the following 1 required parameters\\(s\\): max");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Pattern (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Pattern}
            ]
        });
    }, expectedExceptionMessage, "@Pattern cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Matches (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Matches}
            ]
        });
    }, expectedExceptionMessage, "@Matches cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional flags and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional flags and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional flags and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
});

test('Test binding @Matches (with optional flags, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Length (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameters\\(s\\): min, max");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Length}
            ]
        });
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Length (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameters\\(s\\): min, max");
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

    deleteElement(inputElementId);
});

test('Test binding @Length (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameters\\(s\\): min, max");
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
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElement(inputElementId);

    deleteElement(inputElementId);
});

test('Test binding @Length (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Length(groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameters\\(s\\): min, max");
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
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElement(inputElementId);

    deleteElement(inputElementId);
});

test('Test binding @Length (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 2 required parameters\\(s\\): min, max");
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
    }, expectedExceptionMessage, "@Length cannot be bound without its required parameter");    deleteElement(inputElementId);

    deleteElement(inputElementId);
});

test('Test binding @Length (with one required parameter) through regula.bind (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameters\\(s\\): min");
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

    deleteElement(inputElementId);
});

test('Test binding @Length (with one required parameter) through regula.bind (2)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Length: You seem to have provided some optional or required parameters for @Length, but you are still missing the following 1 required parameters\\(s\\): max");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Digits (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameters\\(s\\): integer, fraction");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Digits}
            ]
        });
    }, expectedExceptionMessage, "@Digits cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Digits (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameters\\(s\\): integer, fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameters\\(s\\): integer, fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameters\\(s\\): integer, fraction");
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


    deleteElement(inputElementId);
});

test('Test binding @Digits (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 2 required parameters\\(s\\): integer, fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with integer parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with integer and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with integer and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with integer and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with integer and optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): fraction");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with fraction parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): integer");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with fraction and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): integer");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with fraction and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): integer");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with fraction and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): integer");
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

    deleteElement(inputElementId);
});

test('Test binding @Digits (with fraction and optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Digits: You seem to have provided some optional or required parameters for @Digits, but you are still missing the following 1 required parameters\\(s\\): integer");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Past (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Past}
            ]
        });
    }, expectedExceptionMessage, "@Past cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Past (with optional date, separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Past(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Past: You seem to have provided some optional or required parameters for @Past, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
});

test('Test binding @Future (without parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
    raises(function() {
        regula.bind({
            element: $input.get(0),
            constraints: [
                {constraintType: regula.Constraint.Future}
            ]
        });
    }, expectedExceptionMessage, "@Future cannot be bound without its required parameter");

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional separator parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional separator and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional separator and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional separator and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\")");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
});

test('Test binding @Future (with optional date, separator, groups, label and message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@Future(separator=\"/\", date=\"07/03/1984\", label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(inputElementId + ".Future: You seem to have provided some optional or required parameters for @Future, but you are still missing the following 1 required parameters\\(s\\): format");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(inputElementId);
});

test('Test binding @PasswordsMatch (without parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
    raises(function() {
        regula.bind({
            element: $form.get(0),
            constraints: [
                {constraintType: regula.Constraint.PasswordsMatch}
            ]
        });
    }, expectedExceptionMessage, "@PasswordsMatch cannot be bound without its required parameter");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with optional label, message, and groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@PasswordsMatch(label=\"test\", message=\"this is a test\", groups=[Test])");

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with one required parameter) through regula.bind (1)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameters\\(s\\): field2");
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

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with one required parameter) through regula.bind (2)', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameters\\(s\\): field1");
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
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

    deleteElement(formElementId);
});

module("Test regula.custom (definition only)");

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
            validator: false
        });
    }, /regula\.custom expects a validator attribute in the options argument/, "validator must be a function");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and valid params attribute', function() {
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

/*TODO: Test custom label, message, groups, and interpolation when you test regula.validate() */

module("Test validation with @Checked");

function testConstraintViolationsForDefaultConstraints(constraintViolation, params) {
    equals(constraintViolation.composingConstraintViolations.length, 0, "There must not be any composing-constraint violations");
    equals(constraintViolation.compound, false, "@" + params.constraintName + " is not a compound constraint");
    equals(constraintViolation.constraintParameters.groups, params.groups, "Must belong to the following group(s): " + params.groups);
    equals(constraintViolation.constraintName, params.constraintName, "@" + params.constraintName + " must be the failing constraint");
    equals(constraintViolation.custom, false, "@" + params.constraintName + " is not a custom constraint");
    equals(constraintViolation.failingElements.length, 1, "There must be one failing element");
    equals(constraintViolation.failingElements[0].id, params.elementId, params.elementId + " must be the id of the failing element");
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Checked against checked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Checked", "radio");
    $radio.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked radio button");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Checked against checked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Checked", "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Checked constraint must not fail against a checked checkbox");

    deleteElement(inputElementId)
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

    deleteElement(inputElementId);
});

module("Test validation with @Selected");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Required");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Required against checked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Required", "radio");
    $radio.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked radio button");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Required against checked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Required", "checkbox");
    $checkbox.attr("checked", "true");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a checked checkbox");

    deleteElement(inputElementId)
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Required against a non-empty text field (markup)', function() {
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

    deleteElement(inputElementId);
});

test('Test @Required against a non-empty text field (regula.bind)', function() {
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

    deleteElement(inputElementId);
});

test('Test @Required against non-empty text field (markup)', function() {
    var inputElementId = "myCheckbox";
    var $text = createInputElement(inputElementId, "@Required", "text");
    $text.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty text field");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test @Required against a non-empty textarea (markup)', function() {
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

    deleteElement(inputElementId);
});

test('Test @Required against a non-empty textarea (regula.bind)', function() {
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

    deleteElement(inputElementId);
});

test('Test @Required against non-empty textarea (markup)', function() {
    var inputElementId = "myTextarea";
    var $textarea = createInputElement(inputElementId, "@Required", "textarea");
    $textarea.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "The @Required constraint must not fail against a non-empty textarea");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Max");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Max against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Max(value=5)", "text");
    $text.val(5);

    regula.bind();
    equals(regula.validate().length, 0, "@Max must not fail when value=5 and textbox value is 5");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Min");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Min against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Min(value=5)", "text");
    $text.val(5);

    regula.bind();
    equals(regula.validate().length, 0, "@Min must not fail when value=5 and textbox value is 5");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Range");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Range against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Range(min=0, max=5)", "text");
    $text.val(0);

    regula.bind();
    equals(regula.validate().length, 0, "@Range(min=0, max=5) must not fail with value=0");

    deleteElement(inputElementId);
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


    deleteElement(inputElementId);
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


    deleteElement(inputElementId);
});

module("Test validation with @NotBlank");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @NotBlank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@NotBlank", "text");
    $text.val("test");

    regula.bind();
    equals(regula.validate().length, 0, "@NotBlank should not fail on a non-empty text field");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Blank");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Blank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Blank", "text");

    regula.bind();
    equals(regula.validate().length, 0, "@Blank should not fail on an empty text field");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Pattern");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/)", "text");
    $text.val("NCC-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/, flags=\"i\")", "text");
    $text.val("ncc-1701-D");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on ncc-1701");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"g\")", "text");
    $text.val("NCC-1701-D NCC-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"ig\")", "text");
    $text.val("Ncc-1701-d ncc-1701");

    regula.bind();
    equals(regula.validate().length, 0, "@Pattern should not fail on Ncc-1701-d ncc-1701");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Email");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Email against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Email", "text");
    $text.val("abc@example.com");

    regula.bind();
    equals(regula.validate().length, 0, "@Email should not fail on abc@example.com");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Alpha");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test padding @Alpha against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Alpha", "text");
    $text.val("abc");

    regula.bind();
    equals(regula.validate().length, 0, "@Alpha should not fail on 'abc'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Numeric");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Numeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Numeric", "text");
    $text.val("123");

    regula.bind();
    equals(regula.validate().length, 0, "@Numeric should not fail on '123'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @AlphaNumeric");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @AlphaNumeric against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@AlphaNumeric", "text");
    $text.val("1a2b3c");

    regula.bind();
    equals(regula.validate().length, 0, "@AlphaNumeric should not fail on '1a2b3c'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Integer");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Integer against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Integer", "text");
    $text.val("0");

    regula.bind();
    equals(regula.validate().length, 0, "@Integer should not fail on '0'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Real");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("0");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '0'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val("0.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '0.1'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Real against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Real", "text");
    $text.val(".1");

    regula.bind();
    equals(regula.validate().length, 0, "@Real should not fail on '.1'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Length");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcde");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcdefgh");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Length against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Length(min=5, max=10)", "text");
    $text.val("abcdefghij");

    regula.bind();
    equals(regula.validate().length, 0, "@Length(min=5, max=10) should not fail on 'abcde'");

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

module("Test validation with @Digits");

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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("1.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.1'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("1.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '1.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12.1");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.1'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val("12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=2) must not fail on '.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2.0");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.0'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("2.013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '2.013'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val("22.013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '22.013'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=2, fraction=0)", "text");
    $text.val(".013");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=2, fraction=0) must not fail on '.013'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val(".12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val("1.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '1.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});

test('Test passing @Digits against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Digits(integer=0, fraction=2)", "text");
    $text.val("123.12");

    regula.bind();
    equals(regula.validate().length, 0, "@Digits(integer=0, fraction=2) must not fail on '123.12'");

    deleteElement(inputElementId);

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

    deleteElement(inputElementId);
});


