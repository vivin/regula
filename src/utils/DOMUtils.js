/**
 * DOMUtils contains some convenience functions to look up information in the DOM.
 * @type {{friendlyInputNames: {}, getElementsByAttribute: Function, getAttributeValueForElement: Function, supportsHTML5Validation: Function}}
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

        root.regulaModules.DOMUtils = factory();
    }
}(this, function () {

    var friendlyInputNames = {
        form: "The form",
        select: "The select box",
        textarea: "The text area",
        checkbox: "The checkbox",
        radio: "The radio button",
        text: "The text field",
        password: "The password",
        email: "The email",
        url: "The URL",
        number: "The number",
        datetime: "The datetime",
        "datetime-local": "The local datetime",
        date: "The date",
        month: "The month",
        time: "The time",
        week: "The week",
        range: "The range",
        tel: "The telephone number",
        color: "The color"
    };

    function getElementsByAttribute(oElm, strTagName, strAttributeName, strAttributeValue) {
        var arrElements = (strTagName == "*" && oElm.all) ? oElm.all : oElm.getElementsByTagName(strTagName);
        var arrReturnElements = []; //modified; used to say new Array();
        var oAttributeValue = (typeof strAttributeValue !== "undefined") ? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)") : null;
        var oCurrent;
        var oAttribute;
        for (var i = 0; i < arrElements.length; i++) {
            oCurrent = arrElements[i];
            oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
            if (typeof oAttribute == "string" && oAttribute.length > 0) {
                if (typeof strAttributeValue === "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))) {
                    arrReturnElements.push(oCurrent);
                }
            }
        }

        return arrReturnElements;
    }

    /*
     Original code from:
     http://stackoverflow.com/a/3755343/263004
     */

    function getAttributeValueForElement(element, attribute) {
        var result = (element.getAttribute && element.getAttribute(attribute)) || null;

        if (!result) {
            var attributes = element.attributes;

            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].nodeName === attribute) {
                    result = attributes[i].nodeValue;
                }
            }
        }

        return result;
    }

    /**
     * generates a random id
     * @return {String} - the generated id
     */

    function generateRandomId() {
        return "regula-generated-" + Math.floor(Math.random() * 1000000);
    }

    /**
     * Returns true if the browser supports HTML5 validation
     * @returns {boolean}
     */
    function supportsHTML5Validation() {
        return (typeof document.createElement("input").checkValidity === "function");
    }

    return {
        friendlyInputNames: friendlyInputNames,
        getElementsByAttribute: getElementsByAttribute,
        getAttributeValueForElement: getAttributeValueForElement,
        generateRandomId: generateRandomId,
        supportsHTML5Validation: supportsHTML5Validation
    };

}));