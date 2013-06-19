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
        define(factory);
    } else {
        // Browser globals
        if (typeof root.regulaModules === "undefined") {
            root.regulaModules = {};
        }

        root.regulaModules.CompositionGraph = factory();
    }
}(this, function () {

    /*
    We need one node per constraint-type.
     */
    var typeToNodeMap = {};

    /* root is a special node that serves as the root of the composition tree/graph (works either way because a tree
     is a special case of a graph).
     */

    var root = {
        visited: false,
        name: "RootNode",
        type: -1, //constraint type
        parents: [],
        children: []
    };

    function addNode(options) {
        var type = options.type;
        var name = options.name;
        var parent = options.parent;

        var newNode = typeof typeToNodeMap[type] === "undefined" ? {
            visited: false,
            name: name,
            type: type,
            parents: [],
            children: []
        } : typeToNodeMap[type];

        if (parent == null) {
            root.children.push(newNode);
        } else {
            parent.children.push(newNode);
            newNode.parents.push(parent);
        }

        typeToNodeMap[type] = newNode;
    }

    function clone() {
        var clonedTypeToNodeMap = {};

        var clonedRoot = (function _clone(node, parent) {
            var cloned = typeof clonedTypeToNodeMap[node.type] === "undefined" ? {
                visited: node.visited,
                name: node.name,
                type: node.type,
                parents: [],
                children: []
            } : clonedTypeToNodeMap[node.type];

            if(parent !== null) {
                cloned.parents.push(parent);
            }

            for (var i = 0; i < node.children.length; i++) {
                cloned.children.push(_clone(node.children[i], cloned));
            }

            clonedTypeToNodeMap[node.type] = cloned;

            return cloned;
        })(root, null);

        return {
            typeToNodeMap: clonedTypeToNodeMap,
            root: clonedRoot
        };
    }

    function getNodeByType(type) {
        var node = typeToNodeMap[type];
        return typeof node === "undefined" ? null : node;
    }

    function analyze(startNode) {
        var result = (function traverse(node, path) {

            var result = {
                cycle: false,
                path: path
            };

            if (node.visited) {
                result.cycle = true;
            } else {
                node.visited = true;

                var i = 0;
                while (i < node.children.length && !result.cycle) {
                    result = traverse(node.children[i], path + "." + node.children[i].name);
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

    function clearVisited() {
        (function clear(node) {
            node.visited = false;
            for (var i = 0; i < node.children.length; i++) {
                clear(node.children[i]);
            }
        }(root));
    }

    function getRoot() {
        return root;
    }

    function setRoot(newRoot) {
        root = newRoot;
    }

    function initializeFromClone(clone) {
        typeToNodeMap = clone.typeToNodeMap;
        root = clone.root;
    }

    return {
        ROOT: -1,
        addNode: addNode,
        getNodeByType: getNodeByType,
        analyze: analyze,
        getRoot: getRoot,
        setRoot: setRoot,
        clone: clone,
        initializeFromClone: initializeFromClone
    };
}));