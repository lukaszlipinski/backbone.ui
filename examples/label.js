/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var label = new Backbone.UI.Label({
		el : $('.lbl_example'),
		settings : {
			caption : 'Hey you!',
			disabled : false
		}
	});

	var label2 = new Backbone.UI.Label({
		el : $('.lbl_example2'),
		settings : {
			caption : 'Hey you!',
			disabled : true
		}
	});
}(Backbone, _, jQuery));