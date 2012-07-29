/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var dropdown = new Backbone.UI.Dropdown({
        el : $('.dd_example'),
        settings : {
            value : 0,
            options : [
                {name : 'Option', value : 0, something : 'item'},
                {name : 'Option', value : 1, something : 'itemm'},
                {name : 'Options', value : 2, something : 'itemm'}
            ],
            exclusions : [2]
        }
    });

    var dropdown2 = new Backbone.UI.Dropdown({
        el : $('.dd_example2'),
        settings : {
            value : 0,
            options : [
                {name : 'Option', value : 0, something : 'item 1'},
                {name : 'Option', value : 1, something : 'itemm 2'},
                {name : 'Options', value : 2, something : 'itemm 3'}
            ],
            exclusions : [0]
        }
    }).on('dd:change:value', function(_dd, value) {
        if (value == 1) {
			dropdown.setOptions([
                {name : 'Option 1x', value : 0, something : 'item'},
                {name : 'Option 2x', value : 1, something : 'itemm'},
                {name : 'Options 3x', value : 2, something : 'itemm'}
            ]);
        }
        else {
			dropdown.setOptions([
                {name : 'Option 11x', value : 0, something : 'item'},
                {name : 'Option 22x', value : 1, something : 'itemm'},
                {name : 'Options 33x', value : 2, something : 'itemm'}
            ], {silent : true}).setExclusions([0], {silent : true}).setValue(0);
        }

    });
}(Backbone, _, jQuery));