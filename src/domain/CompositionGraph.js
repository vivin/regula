/**
 * CompositionGraph is an internal data structure that I use to keep track of composing constraints and the
 * relationships between them (composing constraints can contain other composing constraints). The main use of this
 * data structure is to identify cycles during composition. This can only happen during calls to regula.override.
 * Since cycles in the constraint-composition graph will lead to infinite loops, I need to detect them and throw
 * an exception.
 *
 * @type {{addNode: Function, getNodeByType: Function, cycleExists: Function, getRoot: Function, setRoot: Function, clone: Function}}
 */
define(["service/ConstraintService"], function (ConstraintService) {
    var typeToNodeMap = {};

    /* root is a special node that serves as the root of the composition tree/graph (works either way because a tree
     is a special case of a graph)
     */

    var root = {
        visited: false,
        name: "RootNode",
        type: -1,
        children: []
    };

    function addNode(type, parent) {
        var newNode = typeToNodeMap[type] == null ? {
            visited: false,
            name: ConstraintService.ReverseConstraint[type],
            type: type,
            children: []
        } : typeToNodeMap[type];

        if (parent == null) {
            root.children[root.children.length] = newNode;
        } else {
            parent.children[parent.children.length] = newNode;
        }

        typeToNodeMap[type] = newNode;
    }

    function clone() {
        return _clone(root);
    }

    function _clone(node) {
        var cloned = {
            visited: node.visited,
            name: node.name,
            type: node.type,
            children: []
        };

        for (var i = 0; i < node.children.length; i++) {
            cloned.children[cloned.children.length] = _clone(node.children[i]);
        }

        return cloned;
    }

    function getNodeByType(type) {
        return typeToNodeMap[type];
    }

    function cycleExists(startNode) {
        var result = (function (node, path) {

            var result = {
                cycleExists: false,
                path: path
            };

            if (node.visited) {
                result = {
                    cycleExists: true,
                    path: path
                };
            } else {
                node.visited = true;

                var i = 0;
                while (i < node.children.length && !result.cycleExists) {
                    result = arguments.callee(node.children[i], path + "." + node.children[i].name);
                    i++;
                }
            }

            return result;
        }(startNode, startNode.name));

        if (!result.cycleExists) {
            clearVisited();
        }

        return result;
    }

    function removeChildren(node) {
        node.children = [];
    }

    function clearVisited() {
        (function (node) {
            node.visited = false;
            for (var i = 0; i < node.children.length; i++) {
                arguments.callee(node.children[i]);
            }
        }(root));
    }

    function getRoot() {
        return root;
    }

    function setRoot(newRoot) {
        root = newRoot;
    }

    return {
        addNode: addNode,
        removeChildren: removeChildren,
        getNodeByType: getNodeByType,
        cycleExists: cycleExists,
        getRoot: getRoot,
        setRoot: setRoot,
        clone: clone
    };
});