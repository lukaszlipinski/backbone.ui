/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var button1 = new Backbone.UI.Button({
		el : $('.btn_example1'),
		settings : {
			caption : 'First button',
			toggle : true,
			disabled : true
		}
	});

	var button2 = new Backbone.UI.Button({
		el : $('.btn_example2'),
		settings : {
			caption : 'Second button',
			toggle : true,
			state : true
		}
	});

    button1.on('btn:click', function(_btn) {
		console.log("click", _btn.getState());
    }).on('btn:click:even', function(_btn) {
		console.log(_btn.getState());
	});

    button2.on('btn:click', function(_btn) {
		button1.setCaption('Hey').enable();
    });

}(Backbone, _, jQuery));