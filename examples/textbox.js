/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var textbox = new Backbone.UI.Textbox({
		el : $('.txt_example'),
		settings : {
			value : "Some text"
		}
	});
}(Backbone, _, jQuery));