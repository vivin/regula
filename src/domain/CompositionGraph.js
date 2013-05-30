/**
 * CompositionGraph is an internal data structure that I use to keep track of composing constraints and the
 * relationships between them (composing constraints can contain other composing constraints). The main use of this
 * data structure is to identify cycles during composition. This can only happen during calls to regula.override.
 * Since cycles in the constraint-composition graph will lead to infinite loops, I need to detect them and throw
 * an exception.
 *
 * @type {{addNode: Function, getNodeByType: Function, analyze: Function, getRoot: Function, setRoot: Function, clone: Function}}
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "service/ConstraintService"
        ], factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.CompositionGraph = factory();
    }
}(this, function () {
    var typeToNodeMap = {};

    /* root is a special node that serves as the root of the composition tree/graph (works either way because a tree
     is a special case of a graph)
     */

    var root = {
        visited: false,
        name: "RootNode",
        type: -1,
        async: false,
        children: []
    };

    function addNode(type, name, async, parent) {
        var newNode = typeToNodeMap[type] == null ? {
            visited: false,
            name: name,
            type: type,
            async: async,
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
            async: node.async,
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

    function analyze(startNode) {
        var result = (function traverse(node, path) {

            var result = {
                cycle: false,
                async: node.async,
                path: path
            };

            if (node.visited) {
                result.cycle = true;
            } else {
                node.visited = true;

                var i = 0;
                while (i < node.children.length && !result.cycle) {
                    var _result = traverse(node.children[i], path + "." + node.children[i].name);
                    result = {
                        cycle: _result.cycle,
                        async: result.async || _result.async,
                        path: _result.path
                    };

                    i++;
                }
            }

            return result;
        }(startNode, startNode.name));

        if (!result.cycle) {
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
        analyze: analyze,
        getRoot: getRoot,
        setRoot: setRoot,
        clone: clone
    };
}));