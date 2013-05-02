//using suggested jQuery practice by passing jQuery into a function
//in order to have $ notation without conflicting with other libraries
//Author: Troy Ingram
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function(jQuery) {
    var // Create local copy of $ just in case jQuery
        // has been removed from global scope
        $ = jQuery,

        //using jQuery suggested namespace practice
        methods =
        {
            bind: function(options) {
                if (this instanceof jQuery) {
                    if(!options) options = {};

                    if(this.get().length > 0) {
                        $.extend(true, options,  { elements: this.get() });
                    }
                }
                regula.bind(options);
                return this; //make chainable
            },
            unbind: function(options) {
                if(this instanceof jQuery) {
                    if(!options) options = {};

                    if(this.get().length > 0) {
                        $.extend(true, options, { elements: this.get() });
                    }
                }
                regula.unbind(options);
                return this; //make chainable
            },
            isBound: function(options) {
                if(this instanceof jQuery) {
                    if(!options) options = {};

                    if(this.get().length > 0) {
                        $.extend(true, options, { element: this.get(0) });
                    }
                }
                regula.isBound(options);
                return this; //make chainable
            },
            validate: function(options) {
                if (this instanceof jQuery) {
                    if(!options) options = {};

                    if(this.get().length > 0) {
                        $.extend(true, options, { elements: this.get() });
                    }
                }
                return regula.validate(options);
            },
            custom: function(options) {
                regula.custom(options);
                return this; //make chainable
            },
            compound: function(options) {
                regula.compound(options);
                return this; //make chainable
            },
            override: function(options) {
                regula.override(options);
                return this; //make chainable
            }
        };

    // Alias methods to match jQuery 1.7+ conventions
    methods.on = methods.bind;
    methods.off = methods.unbind;

    $.fn.regula = CallMethod;
    $.regula = CallMethod;
      
    function CallMethod(method) {

        // Method calling logic
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.bind.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.regula');
        }

    }

}));
