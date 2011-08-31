//using suggested jQuery practice by passing jQuery into a function
//in order to have $ notation without conflicting with other libraries
//Author: Troy Ingram
(function($) {

    //using jQuery suggested namespace practice
    var methods =
    {
        bind: function(options) {
            if (this.length > 0) {
                $.extend(true, options,  { elements: this.get() });
                regula.bind(options);
            }
            else {
                regula.bind(options);
            }
        },
        validate: function(options) {
            if (this.length > 0) {
                $.extend(true, options,  { elements: this.get() });
                return regula.validate(options);
            }
            else {
                return regula.validate(options);
            }
        }
    };

    $.fn.regula = function(method) {

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
