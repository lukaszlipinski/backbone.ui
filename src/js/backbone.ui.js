/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var tabindex = 0;

    Backbone.UI = Backbone.UI || {
        getNextTabIndex : function() {
            return ++tabindex;
        }
    };
}(Backbone, _, jQuery));


