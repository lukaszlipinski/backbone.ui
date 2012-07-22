/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var dropdown = new Backbone.UI.Dropdown({
        el : $('.dd_example'),
        settings : {
            value : 0,
            options : [
                {name : 'Option 1', value : 0},
                {name : 'Option 2', value : 1},
                {name : 'Option 3', value : 2}
            ],
            exclusions : [2],
            openOnHover : true
        }
    });
}(Backbone, _, jQuery));