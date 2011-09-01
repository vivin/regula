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

    equals($("#" + inputElementId).regula('validate').length, 0, "Calling regula('validate') should succeed even if a bound element has been deleted");
});

test('Test empty definition', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "");

    equals($input.regula('bind'), undefined, "Calling bind() on an element with no constraints must not return anything");

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

    equals($input.regula('bind'), undefined, "@NotBlank(groups=[MyGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with group-definition (with more than one group) as a parameter (1)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(groups=[MyGroup, MyOtherGroup])");

    equals($input.regula('bind'), undefined, "@NotBlank(groups=[MyGroup, MyOtherGroup]) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid parameters', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup])");

    equals($input.regula('bind'), undefined, "@NotBlank(param1=10, param2=\"text\\\"\", regex=/[a-b]\\//, param3=false, groups=[MyGroup, MyOtherGroup, AndAnotherGroup]) should be a valid definition");

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

    equals($input.regula('bind'), undefined, "@NotBlank @Required @Range(min=5, max=10) should be a valid definition");

    deleteElement(inputElementId);
});

test('Test definition with multiple valid constraints (programmatic)', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId, "@NotBlank @Required @Range(min=5, max=10)");

    equals($input.regula('bind', {
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

    equals($input.regula('bind', {
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

test('Test binding @Between (with both required parameters and optional message, label, and groups parameters) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals($input.regula('bind', {
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

    equals($input.regula('bind', {
        constraints: [
            {constraintType: regula.Constraint.NotBlank}
        ]
    }), undefined, "@NotBlank should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @NotBlank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.Blank}
        ]
    }), undefined, "@Blank should be a valid definition");

    deleteElement(inputElementId);
});

test('Test binding @Blank (with optional label parameter) through regula.bind', function() {
    var inputElementId = "hiddenInput";
    var $input = createInputElement(inputElementId);

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    equals($input.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(inputElementId + ".Pattern: You seem to have provided some optional or required parameters for @Pattern, but you are still missing the following 1 required parameters\\(s\\): regex");
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

    equals($form.regula('bind',{
        constraints: [
            {constraintType: regula.Constraint.CompletelyFilled}
        ]
    }), undefined, "@CompletelyFilled should be a valid definition");

    deleteElement(formElementId);
});

test('Test binding @CompletelyFilled (with optional label parameter) through regula.bind', function() {
    var formElementId = "hiddenForm";
    var $form = createFormElement(formElementId);

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 2 required parameters\\(s\\): field1, field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameters\\(s\\): field2");
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

    var expectedExceptionMessage = new RegExp(formElementId + ".PasswordsMatch: You seem to have provided some optional or required parameters for @PasswordsMatch, but you are still missing the following 1 required parameters\\(s\\): field1");
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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

    equals($form.regula('bind',{
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





module("jQuery Regula Validate Tests");

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
    equals($radio.regula('validate').length, 0, "The @Checked constraint must not fail against a checked radio button");

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
    equals($radio.regula('validate').length, 0, "The @Checked constraint must not fail against a checked radio button");

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
    equals($checkbox.regula('validate').length, 0, "The @Checked constraint must not fail against a checked checkbox");

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
    equals($checkbox.regula('validate').length, 0, "The @Checked constraint must not fail against a checked checkbox");

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
    equals($text.regula('validate').length, 0, "@NotBlank should not fail on a non-empty text field");

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
    equals($text.regula('validate').length, 0, "@NotBlank should not fail on a non-empty text field");

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
    equals($text.regula('validate').length, 0, "@Blank should not fail on an empty text field");

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
    equals($text.regula('validate').length, 0, "@Blank should not fail on an empty text field");

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
    equals($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701");

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
    equals($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/^[A-Z]{3}-[0-9]{4}(-[A-Z])?$/, flags=\"i\")", "text");
    $text.val("ncc-1701-D");

    $text.regula('bind');
    equals($text.regula('validate').length, 0, "@Pattern should not fail on ncc-1701");

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
    equals($text.regula('validate').length, 0, "@Pattern should not fail on ncc-1701-D");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"g\")", "text");
    $text.val("NCC-1701-D NCC-1701");

    $text.regula('bind');
    equals($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

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
    equals($text.regula('validate').length, 0, "@Pattern should not fail on NCC-1701-D NCC-1701");

    deleteElement(inputElementId);
});

test('Test passing @Pattern against text field (markup)', function() {
    var inputElementId = "myText";
    var $text = createInputElement(inputElementId, "@Pattern(regex=/[A-Z]{3}-[0-9]{4}(-[A-Z])?/, flags=\"ig\")", "text");
    $text.val("Ncc-1701-d ncc-1701");

    $text.regula('bind');
    equals($text.regula('validate').length, 0, "@Pattern should not fail on Ncc-1701-d ncc-1701");

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
    equals($text.regula('validate').length, 0, "@Pattern should not fail on Ncc-1701-D Ncc-1701");

    deleteElement(inputElementId);
});

