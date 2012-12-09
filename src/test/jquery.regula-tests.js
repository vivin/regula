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
module("jQuery Regula Bind Tests");

test("Test regula('validate') after a bound element has been deleted", function() {
    var inputElementId = "myText";
    var $input = createInputElement(inputElementId, "@Required");

    $("#" + inputElementId).regula('bind');
    deleteElement(inputElementId);

    equal($("#" + inputElementId).regula('validate').length, 0, "Calling regula('validate') should succeed even if a bound element has been deleted");
});

test('Test empty definition', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "");

    equal($input.regula('bind'), $input, "Calling bind() on an element with no constraints must not return anything");

    deleteElement(inputElementId);
});

test('Test definition without a name throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint name in constraint definition " +
                                               inputElementId + ": Invalid starting character for constraint name. Can only include A-Z, a-z, and _ " +
                                               inputElementId + ": Invalid starting character");
    raises(function() {$input.regula('bind')}, expectedExceptionMessage, "'@' should not be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition that does not start with @ throws an exception', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "ThisShouldFail");

    var expectedExceptionMessage =  new RegExp(inputElementId + ": Invalid constraint. Constraint definitions need to start with '@'");
    raises(function() {$input.regula('bind')}, expectedExceptionMessage, "'ThisShouldFail' should not be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with group-definition (with one group) as a parameter', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup])");

    equal($input.regula('bind'), $input, "@NotBlank(groups=[MyGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with group-definition (with more than one group) as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup])");

    equal($input.regula('bind'), $input, "@NotBlank(groups=[MyGroup, MyOtherGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equal($input.regula('bind'), $input, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple constraints, with one malformed constraint', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @NotBlank(");

    var expectedExceptionMessage = new RegExp(inputElementId + ".NotBlank: Invalid parameter definition " + inputElementId + ".NotBlank: Invalid parameter name. You might have unmatched parentheses hiddenInput.NotBlank: Invalid starting character for parameter name. Can only include A-Z, a-z, and _");

    raises(function() {$input.regula('bind')}, expectedExceptionMessage, "@NotBlank @NotBlank( is not a valid definition");

    deleteElement(inputElementId)
});

test('Test definition with multiple valid constraints (markup)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equal($input.regula('bind'), $input, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid constraints (programmatic)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equal($input.regula('bind', {
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
    }), $input, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Checked through markup to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId, "@Checked");

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");
    raises(function() {$form.regula('bind')}, expectedExceptionMessage, "@Checked cannot be bound to a form element");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled to a non-form element through markup', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CompletelyFilled");

    var expectedExceptionMessage = new RegExp(inputElementId + ".CompletelyFilled: @CompletelyFilled is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {$input.regula('bind')}, expectedExceptionMessage, "@CompletelyFilled cannot be bound to a non-form element");

    deleteElement(inputElementId);
});

test('Test binding @Checked through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Checked: @Checked is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
       $form.regula('bind', {
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
       $input.regula('bind', {
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
        $form.regula('bind', {
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

    equal($input.regula('bind', {
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
    }), $input, "@Max(value=10, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Between (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind', {
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
    }), $input, "@Between(min=5, max=10, label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".NotBlank: @NotBlank is not a form constraint, but you are trying to bind it to a form");

    raises(function() {
        $form.regula('bind', {
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
        $form.regula('bind',{
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

    equal($input.regula('bind', {
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    }), $input, "@NotBlank should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    length: "test"
                }
            }
        ]
    }), $input, "@NotBlank(label=\"test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), $input, "@NotBlank(message=\"this is a test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.NotBlank,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), $input, "@NotBlank(groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
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
    }), $input, "@NotBlank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Blank: @Blank is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        $form.regula('bind',{
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

    equal($input.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    }), $input, "@Blank should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    label: "test"
                }
            }
        ]
    }), $input, "@Blank(label=\"test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank (with optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), $input, "@Blank(message=\"this is a test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank (with optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Blank,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), $input, "@Blank(groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank (with optional label, message, and groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
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
    }), $input, "@Blank(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern through regula.bind to a form element', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    var expectedExceptionMessage = new RegExp(formElementId + ".Pattern: @Pattern is not a form constraint, but you are trying to bind it to a form");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/
                }
            }
        ]
    }), $input, "@Pattern(regex=/[a-z]/) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with required parameter and optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    label: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), $input, "@Pattern(regex=/[a-z]/, label=\"test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with required parameter and optional message parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    message: "test",
                    regex: /[a-z]/
                }
            }
        ]
    }), $input, "@Pattern(regex=/[a-z]/, message=\"test\") should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with required parameter and optional groups parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: /[a-z]/,
                    groups: ["Test"]
                }
            }
        ]
    }), $input, "@Pattern(regex=/[a-z]/, groups=[\"Test\"]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with required parameter and optional label, message, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equal($input.regula('bind',{
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
    }), $input, "@Pattern(regex=/[a-z]/, label=\"test\", message=\"This is a test\", groups=[Test]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Pattern (with optional flags parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameter\\(s\\): regex");
    raises(function() {
        $input.regula('bind',{
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

test('Test binding @CompletelyFilled to a non-form element through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".CompletelyFilled: @CompletelyFilled is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {
        $input.regula('bind',{
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

    equal($form.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.CompletelyFilled}
        ]
    }), $form, "@CompletelyFilled should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled (with optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    label: "test"
                }
            }
        ]
    }), $form, "@CompletelyFilled(label=\"test\") should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled (with optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    message: "this is a test"
                }
            }
        ]
    }), $form, "@CompletelyFilled(message=\"this is a test\") should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled (with optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.CompletelyFilled,
                params: {
                    groups: ["Test"]
                }
            }
        ]
    }), $form, "@CompletelyFilled(groups=[Test]) should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled (with optional label, message, and groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
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
    }), $form, "@CompletelyFilled(label=\"test\", message=\"this is a test\", groups=[Test]) should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch through regula.bind to a non-form element', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    var expectedExceptionMessage = new RegExp(inputElementId + ".PasswordsMatch: @PasswordsMatch is a form constraint, but you are trying to bind it to a non-form element");
    raises(function() {
        $input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameter\\(s\\): field1, field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field2");
    raises(function() {
        $form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameter\\(s\\): field1");
    raises(function() {
        $form.regula('bind',{
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

    equal($form.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.PasswordsMatch,
                params: {
                    field1: "field1",
                    field2: "field2"
                }
            }
        ]
    }), $form, "@PasswordsMatch(field2=\"field2\", field1=\"field1\") should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with both required parameters and optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
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
    }), $form, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\") should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with both required parameters and optional message parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
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
    }), $form, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", message=\"test message\") should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with both required parameters and optional groups parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
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
    }), $form, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", groups=[Test]) should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @PasswordsMatch (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equal($form.regula('bind',{
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
    }), $form, "@PasswordsMatch(field2=\"field2\", field1=\"field1\", label=\"test\", message=\"test message\", groups=[Test]) should be a valid definition");

    deleteElement(formElementId);
});

module("jQuery Regula Validate Tests");

function testConstraintViolationsForDefaultConstraints(constraintViolation, params) {
    equal(constraintViolation.composingConstraintViolations.length, 0, "There must not be any composing-constraint violations");
    equal(constraintViolation.compound, false, "@" + params.constraintName + " is not a compound constraint");
    equal(constraintViolation.constraintParameters.groups, params.groups, "Must belong to the following group(s): " + params.groups);
    equal(constraintViolation.constraintName, params.constraintName, "@" + params.constraintName + " must be the failing constraint");
    equal(constraintViolation.custom, false, "@" + params.constraintName + " is not a custom constraint");
    equal(constraintViolation.failingElements.length, 1, "There must be one failing element");
    equal(constraintViolation.failingElements[0].id, params.elementId, params.elementId + " must be the id of the failing element");
    equal(constraintViolation.group, params.validatedGroups, "The following groups must have been validated: " + params.validatedGroups);
    equal(constraintViolation.message, params.errorMessage, "Wrong error message");
}

test('Test @Checked against unchecked radio button (markup)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, "@Checked", "radio");

    $radio.regula('bind');
    var constraintViolation = $radio.regula('validate')[0];

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

    $radio.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    var constraintViolation = $radio.regula('validate')[0];

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

    $radio.regula('bind');
    equal($radio.regula('validate').length, 0, "The @Checked constraint must not fail against a checked radio button");

    deleteElement(inputElementId);
});

test('Test @Checked against checked radio button (regula.bind)', function() {
    var inputElementId = "myRadio";
    var $radio = createInputElement(inputElementId, undefined, "radio");
    $radio.attr("checked", "true");

    $radio.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    equal($radio.regula('validate').length, 0, "The @Checked constraint must not fail against a checked radio button");

    deleteElement(inputElementId);
});

test('Test @Checked against unchecked checkbox (markup)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, "@Checked", "checkbox");

    $checkbox.regula('bind');
    var constraintViolation = $checkbox.regula('validate')[0];

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

    $checkbox.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    var constraintViolation = $checkbox.regula('validate')[0];

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

    $checkbox.regula('bind');
    equal($checkbox.regula('validate').length, 0, "The @Checked constraint must not fail against a checked checkbox");

    deleteElement(inputElementId)
});

test('Test @Checked against checked checkbox (regula.bind)', function() {
    var inputElementId = "myCheckbox";
    var $checkbox = createInputElement(inputElementId, undefined, "checkbox");
    $checkbox.attr("checked", "true");

    $checkbox.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Checked}
        ]
    });
    equal($checkbox.regula('validate').length, 0, "The @Checked constraint must not fail against a checked checkbox");

    deleteElement(inputElementId);
});

test('Test failing @NotBlank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@NotBlank", "text");

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    });
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@NotBlank should not fail on a non-empty text field");

    deleteElement(inputElementId);
});

test('Test passing @NotBlank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("test");

    $text.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    });
    equal($text.regula('validate').length, 0, "@NotBlank should not fail on a non-empty text field");

    deleteElement(inputElementId);
});

test('Test failing @Blank against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Blank", "text");
    $text.val("test");

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    });
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@Blank should not fail on an empty text field");

    deleteElement(inputElementId);
});

test('Test passing @Blank against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");

    $text.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    });
    equal($text.regula('validate').length, 0, "@Blank should not fail on an empty text field");

    deleteElement(inputElementId);
});


test('Test failing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Za-z]+$/)", "text");
    $text.val("42");

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Za-z]+$/"
                }
            }
        ]
    });
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
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
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
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
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind',{
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
    var constraintViolation = $text.regula('validate')[0];

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

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("NCC-1701");

    $text.regula('bind',{
        constraints: [
            {
                constraintType: regula.Constraint.Pattern,
                params: {
                    regex: "/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/"
                }
            }
        ]
    });
    equal($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/, flags=\"i\")", "text");
    $text.val("ncc-1701-D");

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@Pattern should not fail on ncc-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("ncc-1701-D");

    $text.regula('bind',{
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
    equal($text.regula('validate').length, 0, "@Pattern should not fail on ncc-1701-D");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"g\")", "text");
    $text.val("NCC-1701-D NCC-1701");

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("NCC-1701-D NCC-1701");

    $text.regula('bind',{
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
    equal($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"ig\")", "text");
    $text.val("Ncc-1701-d ncc-1701");

    $text.regula('bind');
    equal($text.regula('validate').length, 0, "@Pattern should not fail on Ncc-1701-d ncc-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (regula.bind)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, undefined, "text");
    $text.val("Ncc-1701-D Ncc-1701");

    $text.regula('bind',{
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
    equal($text.regula('validate').length, 0, "@Pattern should not fail on Ncc-1701-D Ncc-1701");

    deleteElement(inputElementId);
});

module("jQuery Regula Custom Tests");

test('Call regula.custom without any arguments', function() {
    raises(function() { $.regula('custom') }, /regula\.custom expects options/, "regula.custom requires options");
});

test('Call regula.custom with empty object-literal', function() {
    raises(function() {
        $.regula('custom', {});
    }, /regula\.custom expects a name attribute in the options argument/, "regula.custom requires options");
});

test('Call regula.custom with valid name and validator', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        validator: function() {
            return false;
        }
    }), $, "regula.custom with valid name and validator must not return any errors.");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');
    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.formSpecific, false, "formSpecific attribute must be false");
    equal(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equal(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");
    equal(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and formSpecific attribute of non-boolean type', function() {
    raises(function() {
       $.regula('custom',{
           name: "CustomConstraint" + new Date().getTime(),
           formSpecific: "true",
           validator: function() {
           }
       });
    }, /regula\.custom expects the formSpecific attribute in the options argument to be a boolean/, "formSpecific attribute must be a boolean")
});

test('Call regula.custom with required parameters and null formSpecific attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        formSpecific: null,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and null formSpecific attribute must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');
    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.formSpecific, false, "formSpecific attribute must be false");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and undefined formSpecific attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        formSpecific: undefined,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and undefined formSpecific attribute must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');
    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.formSpecific, false, "formSpecific attribute must be false");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and valid formSpecific attribute', function() {
    equal($.regula('custom',{
        name: "CustomConstraint" + new Date().getTime(),
        formSpecific: true,
        validator: function() {
        }
    }), $, "regula.custom called with required parameters and valid formSpecific attribute must not generate any errors");
});

test('Call regula.custom with required parameters and null params attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        params: [],
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and undefined params attribute must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equal(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and undefined params attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        params: null,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and null params attribute must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equal(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and params attribute of non-array type', function() {
    raises(function() {
        $.regula('custom',{
            name: "CustomConstraint" + new Date().getTime(),
            params: "params",
            validator: function() {
            }
        });
    }, /regula.custom expects the params attribute in the options argument to be an array/, "params attribute must be an array");
});

test('Call regula.custom with required parameters and empty params attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        params: [],
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and an empty params array must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.constraintParameters.__size__, 1, "parameters must contain __size__ element that equals 1");
    equal(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and valid params attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        params: ["myParam"],
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and an valid params array must not generate any errors");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time + "(myParam=9)");

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.constraintParameters.__size__, 2, "parameters must contain __size__ element that equals 1");
    equal(constraintViolation.constraintParameters.groups, "Default", "parameters must contain groups element that equals \"Default\"");
    equal(constraintViolation.constraintParameters.myParam, 9, "parameters must contain myParam element that equals 9");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and null defaultMessage attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        defaultMessage: null,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and null defaultMessage attribute must not generate any errors`");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and undefined defaultMessage attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        defaultMessage: undefined,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and undefined defaultMessage attribute must not generate any errors`");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and undefined defaultMessage attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        defaultMessage: undefined,
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and undefined defaultMessage attribute must not generate any errors`");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.message, "", "defaultMessage must be an empty string");

    deleteElement(inputElementId);
});

test('Call regula.custom with required parameters and valid defaultMessage attribute', function() {
    var time = new Date().getTime();

    equal($.regula('custom',{
        name: "CustomConstraint" + time,
        defaultMessage: "This is a test",
        validator: function() {
            return false;
        }
    }), $, "regula.custom called with required parameters and valid defaultMessage attribute must not generate any errors`");

    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    $.regula('bind');

    var constraintViolation = $.regula('validate')[0];
    equal(constraintViolation.message, "This is a test", "defaultMessage must be \"This is a test\"");

    deleteElement(inputElementId);
});

module("jQuery Regula Chainable Tests");

test("Call $.regula('custom').regula('bind').regula('validate')  and valid defaultMessage attribute", function() {
    var time = new Date().getTime();
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@CustomConstraint" + time);

    var constraintViolation = 
        $.regula('custom',{
            name: "CustomConstraint" + time,
            defaultMessage: "This is a test",
            validator: function() {
                return false;}})
        .regula('bind')
        .regula('validate')[0];

    equal(constraintViolation.message, "This is a test", "defaultMessage must be \"This is a test\"");

    deleteElement(inputElementId);
});

test("Call $(selector).regula('bind').regula('validate'); with a @Pattern text field (markup)", function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"ig\")", "text");
    $text.val("Ncc-1701-d ncc-1701");

    var result = $text.regula('bind').regula('validate');
    equal(result.length, 0, "@Pattern should not fail on Ncc-1701-d ncc-1701");

    deleteElement(inputElementId);
});
