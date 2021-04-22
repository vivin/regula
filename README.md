<p align="right">
   <img src="https://travis-ci.org/vivin/regula.png?branch=master" alt="Regula Build Status" />&nbsp;
   <a href='https://coveralls.io/r/vivin/regula?branch=master'><img src='https://coveralls.io/repos/vivin/regula/badge.png?branch=master' alt='Coverage Status' /></a>
</p>
## Regula: An annotation-based form-validator for client-side validation

### Why?

You might be wondering why the world needs **another** client-side validation-framework. After all, there are already different validation-frameworks like jQuery's Validation Plugin, Validator from jQuery tools, and so many  more. Furthermore, browsers are starting to implement HTML5 validation constraints, so what makes Regula so special?

### Small, Easy, and Powerful

Regula is small. It's around 220Kb un-compressed, and 64Kb minified. Regula also doesn't depend on any other external libraries, so you don't have any other dependencies.

As far as ease-of-use goes, I would say that Regula is the easiest Javascript client-side validation-framework to use; on par with using HTML5 constraint-validation. Why is that? Well, let's take a look at how you'd mark an element for validation in Regula:

```html
<input type="text" id="name" name="name" data-constraints='@Required' />
```

That's it. Now compare that to HTML5:

```html
<input type="text" id="name" name="name" required="true" />
```

Not that different, right? Now how about other frameworks? While also useful, binding constraints to elements in other frameworks is somewhat verbose because all constraint-binding is done in Javascript. This has two problems: verbosity (as I mentioned earlier), and lack of context. Part of the appeal of HTML5 constraint validation is that one can immediately tell what restrictions apply to an input field simply by looking at the code. When using other validation-frameworks which rely solely on Javascript for constraint binding, you cannot easily identify the restrictions that apply to a specific element. If the constraints are defined in `<script>` tag (hopefully adjacent to the element), it's a little easier but if the constraints are defined in another file you need to go find that file first.

Since Regula's constraints are directly attached to the element, you can easily tell what restrictions apply to that element. Also, it's remarkably trivial to add more constraints:

```html
<input type="text" id="age" name="age"
       data-constraints='@Required @Numeric @Min(value=21)' />
```

The above example attaches the following conditions to the text field:

 - It is a required field.
 - It can only accept numbers.
 - The value must at least be 21.

That's the easy part. What makes Regula so powerful? Well, one of the hardest things to do well in form-validation is validating against a custom constraint. Usually this involves a little bit of complex logic, for example conditional validation of a field based on the value or state of another field, or validation according to some specific rule. Regula makes this very easy to do with custom constraints. There are two main advantages to the way Regula handles custom constraints: reuse and encapsulation. Once you define a custom constraint in Javascript, you can use it on any input element. Second, all your validation logic is conveniently encapsulated in one place. Here's a simple example:

```js
regula.custom({
   name: "MustBe42",
   defaultMessage: "The answer must be equal to 42",
   validator: function() {
      return this.value == 42;
   }
});
```

And its use:

```html
<input id = "theAnswerToLifeTheUniverseAndEverything"
       name = "theAnswerToLifeTheUniverseAndEverything"
       value = ""
       data-constraints = "@MustBe42" />
```

Here's another example. This one involves parameters to your custom constraint:

```js
regula.custom({
   name: "DivisibleBy",
   defaultMessage: "{label} must be divisible by {divisor}",
   params: ["divisor"],
   validator: function(params) {
      var divisor = params["divisor"];
      return (this.value % divisor) == 0;
   }
});
```

And usage:

```html
<input id = "number"
       name = "number"
       value = ""
       data-constraints = '@DivisibleBy(divisor=3, label="The Number")' />
```

Earlier I mentioned HTML5 constraints. Regula will detect and incorporate HTML5 validation constraints into its validation cycle. This way, you can still use HTML5 validation constraints with Regula. Regula also offers "wrapped" versions of HTML5 constraints (for example `@HTML5Required` for `required`), which means that you are able to take advantage of other features of Regula like custom failure-messages, labels, validation groups, and compound constraints. Here are some examples for HTML5 constraints:

```html
<input id = "number"
       name = "number"
       value = ""
       required="true"
       max="10"
       min="5" />
```

In the above example, you can see that it isn't any different from using regular HTML5 constraints. The advantage you have is that you can use Regula to validate these constraints now. You can also use the "wrapped" versions:

```html
<input id = "number"
       name = "number"
       value = ""
       data-constraints = '@HTML5Required(message = "Number is required!")
                           @HTML5Max(value=10, groups=[MyGroup])
                           @HTML5Min(value=5, groups=[MyOtherGroup])' />
```

Asynchronous constraints are another feature that is supported by Regula. You can define and use custom, asynchronous constraints alongside regular constraints. Here is an example of a custom, asynchronous constraint:

```js
regula.custom({
    name: "MyAsyncContraint",
    async: true,
    defaultMessage: "The asynchronous constraint failed.",
    validator: function(params, validator, callback) {
        //Using jQuery as an example
        jQuery.ajax({
            url: myUrl,
            dataType: "jsonp",
            success: function(data) {
                //Use the callback to pass the result of validation back to
                //regula.
                callback(data.success)
            }
        });
    }
});
```

Asynchronous constraints can be used inside compound constraints too. There is no explicit syntax to make a compound-constraint asynchronous. Any compound constraint that contains at least one asynchronous constraint, is implicitly asynchronous.

**Note:** As of version 1.3.3, the callback syntax isn't limited to asynchronous constraints. While normally you simply look at the return value from `regula.validate()` when dealing with synchronous constraints, you can also use the callback syntax even if all you have are synchronous constraints. The reason this feature was added is that in some cases you cannot know if the set of constraints you are validating are synchronous or asynchronous. Previously, Regula would only call the callback if there was at least one asynchronous constraint.

But that's not all! Regula supports other features in addition to custom constraints:

 - Validation groups (i.e., selective validation of specific elements).
 - Compound constraints (constraints that contain one or more other constraints).
 - Form-specific constraints (i.e., constraints that apply to the form as a whole).
 - A simple, yet powerful API.

That's all well and good. But how exactly do you enforce these constraints prior to submitting your form? That part is easy as well. Here's a simple example (using jQuery):

```js
jQuery(document).ready(function() {
    // Must call regula.bind() first. The best place would be in an
    // onload handler. This function looks for elements with an
    // attribute called "data-constraints" and binds the defined
    // constraints to the elements

    regula.bind();

    jQuery("#myForm").submit(function() {
        // this function performs the actual validation and returns an array
        // of constraint violations
        var validationResults = regula.validate();

        for(var i = 0; i < validationResults.length; i++) {
             var validationResult = validationResults[i];
             alert(validationResult.message);
        }

        return validationResults.length === 0;
    });
});
```

In the above example, we first call `regula.bind()` to bind all our constraints to the elements they have been defined on. Then, we call `regula.validate()` that performs all the validation. This function returns an array of constraint violations, that you can then examine to see which elements failed validation. That's all there is to it!

 To validate using asynchronous constraints, you need to use a callback with `regula.validate()`:

```js
regula.validate(function(constraintViolations) {
    ...
});
```

You can still supply options to `regula.validate` while supplying a callback:

```js
regula.validate(options, function(constraintViolations) {
    ...
});
```

There is a lot more I haven't gone over, but I hope that these simple examples show you how powerful Regula is, and also how easy it is to use. I hope you give it a chance and [try it out](https://github.com/vivin/regula/downloads); 1.3.3 is the latest version. Suggestions and comments are always welcome! For more information, you can take a look at the [wiki](https://github.com/vivin/regula/wiki).

### Documentation
Documentation is available [here](http://vivin.github.io/regula/). It is still a work in progress since I am migrating stuff over from the old wiki into the new GitHub page.

### Ok, where can I get it?
You can download the latest version of Regula on the [releases page](https://github.com/vivin/regula/releases). The latest release is **1.3.3**.

### I want to contribute!
That's awesome! Take a look at **devreadme.txt** for information regarding contribution (I only accept changes into specific branches and not directly into master since I want master to reflect production-ready code; [see here](http://nvie.com/posts/a-successful-git-branching-model/) for more information) and how to set up your development environment. I'm still fleshing it out, but if you have any questions, don't hesitate to ask. Once you're done making your changes, send me a pull-request and we can go from there!

### Going forward

I'm not done with Regula yet! Going forward, I'm considering the following features:
 - Global parameter definitions (specify a parameter to be used by all constraints).
 - Constraint expressions (combine constraints into logical expressions).

This is by no means an exhaustive list. I honestly believe that Regula is a good alternative to existing client-side validation-frameworks and I will be constantly improving and enhancing Regula. I take the quality of my code seriously and will do my best to release bug-free code. Currently JSCoverage reports 97% coverage (effective coverage is pretty much 100%) established through over 2,300 assertions.

### Questions?

[Check out the mailing list!](https://groups.google.com/d/forum/regula-validation?fromplusone=1)

### Licensing

Regula is licensed under the BSD License.
