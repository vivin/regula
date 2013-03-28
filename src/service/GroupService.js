/**
 * Encapsulates logic related to groups.
 * @type {{Group: {}, ReverseGroup: {}, deletedGroupIndices: Array, firstCustomGroupIndex: number}}
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

        root.regulaModules.GroupService = factory();
    }
}(this, function () {
    var Group = {
        Default: 0
    };

    var ReverseGroup = {
        0: "Default"
    };

    /* New groups are added to our 'enum' sequentially with the help of an explicit index that is maintained separately
     (see firstCustomGroupIndex). When groups are deleted, we need to remove them from the Group 'enum'. Simply
     removing them would be fine. But what we end up with are "gaps" in the indices. For example, assume that we added
     a new group called "New". Then regula.Group.New is mapped to 1 in regula.ReverseGroup, and 1 is mapped back to "New".
     Assume that we add another group called "Newer". So now what you have Newer -> 2 -> "Newer". Let's say we delete
     the "New" group. The existing indices are 0 and 2. As you can see, there is a gap. Now although the indices
     themselves don't mean anything (and we don't rely on their actual numerical values in anyway) when you now add
     another group, the index for that group will be 3. So repeated additions and deletions of groups will keep
     incrementing the index. I am uncomfortable with this (what if it increments past MAX_INT? Unlikely, but possible
     -- it doesn't hurt to be paranoid) and so I'd like to reuse deleted indices. For this reason I'm going to maintain
     a stack of deleted-group indices. When I go to add a new group, I'll first check this stack to see if there are
     any indices there. If there are, I'll use one. Conversely, when I delete a group, I'll add its index to this stack
     */

    /*
     TODO: currently providing direct access to these. Should probably be hidden behind service calls that modify these.
     TODO: outside could shouldn't be modifying this directly. The same goes for Constraint.
     */
    var deletedGroupIndices = [];
    var firstCustomGroupIndex = 1;

    return {
        Group: Group,
        ReverseGroup: ReverseGroup,
        deletedGroupIndices: deletedGroupIndices,
        firstCustomGroupIndex: firstCustomGroupIndex
    };
}));