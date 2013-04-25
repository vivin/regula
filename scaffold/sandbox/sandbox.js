jQuery(document).ready(function() {
    var element1 = document.getElementById("element1");
    var element2 = document.getElementById("element2");

    regula.bind({
        elements: [element1, element2],
        constraints: [{
            constraintType: regula.Constraint.Min,
            params: {value: "18", message: "You must be at least 18 years old to vote", groups:["Vote"]}
        }]
    });
});
