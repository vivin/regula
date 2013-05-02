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

    regula.bind({
        element: element2,
        constraints: [{
            constraintType: regula.Constraint.Max,
            params: {value: "17", groups: ["Child"]}
        }]
    });

    console.log("element element1", regula.isBound({element: element1}));
    console.log("elementId element2:", regula.isBound({elementId: "element2"}));
    console.log("element element1, min", regula.isBound({element: element1, constraint: regula.Constraint.Min}));
    console.log("elementId element2, min", regula.isBound({elementId: "element2", constraint: regula.Constraint.Min}));
    console.log("element element1, min, vote", regula.isBound({element: element1, group: regula.Group.Vote, constraint: regula.Constraint.Min}));
    console.log("elementId element2, min, vote", regula.isBound({elementId: "element2", group: regula.Group.Vote, constraint: regula.Constraint.Min}));

    console.log("element element1", regula.isBound({element: element1}));
    console.log("elementId element2:", regula.isBound({elementId: "element2"}));
    console.log("element element1, max", regula.isBound({element: element1, constraint: regula.Constraint.Max}));
    console.log("elementId element2, max", regula.isBound({elementId: "element2", constraint: regula.Constraint.Max}));
    console.log("element element1, max, child", regula.isBound({element: element1, group: regula.Group.Child, constraint: regula.Constraint.Max}));
    console.log("elementId element2, max, child", regula.isBound({elementId: "element2", group: regula.Group.Child, constraint: regula.Constraint.Max}));
});
