/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var textbox = new Backbone.UI.Textbox({
		el : $('.txt_example'),
		settings : {
			value : '',
			clearButton : true,
			live : false,
			emptyMessage : 'Insert your name',
			invalidMessage : 'Incorrect value',
			regexp : /(lol)/g
		}
	}).on('txt:change:value', function(_txt, val, prev_val) {
		console.log('event:', val, prev_val);
	});

	window.lol = textbox;
}(Backbone, _, jQuery));