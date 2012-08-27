/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

	var textbox = new Backbone.UI.Textbox({
		el : $('.txt_example'),
		settings : {
			type : 'number',
			value : 1,
			max : 10,
			min : 0,
			live : true,
			emptyMessage : 'Insert your name',
			invalidMessage : 'Incorrect value'
		}
	}).on('txt:change:value', function(_txt, val, prev_val) {
		console.log('event:', val, prev_val);
	});


    /*var textbox = new Backbone.UI.Textbox({
		el : $('.txt_example'),
		settings : {
			value : 'popo',
			clearButton : true,
			//live : true,
			emptyMessage : 'Insert your name',
			invalidMessage : 'Incorrect value',
			//regexp : /(lol)/g,
			disabled : false
		}
	}).on('txt:change:value', function(_txt, val, prev_val) {
		console.log('event:', val, prev_val);
	});*/
}(Backbone, _, jQuery));