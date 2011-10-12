//using suggested jQuery practice by passing jQuery into a function
//in order to have $ notation without conflicting with other libraries
//Author: Troy Ingram
(function($) {

    //using jQuery suggested namespace practice
    var methods =
    {
        bind: function(options) {
            if (this instanceof jQuery) {
                if(!options) options = {};
                $.extend(true, options,  { elements: this.get() });
            }
            regula.bind(options);
            return this; //make chainable
        },
        validate: function(options) {
            if (this instanceof jQuery) {
                if(!options) options = {};
                $.extend(true, options,  { elements: this.get() });
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

    };



})(jQuery);
