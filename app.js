/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    //SPINNER

    /*var spinner = new Backbone.UI.Spinner($('.sp_example1'), {type : 'float', value : 200.5, max : 2000, min : -1000}).on('sp:change:value', function(model, newValue, previousValue) {
        console.log('spinner changed value from:', previousValue, 'to:', newValue);
    });

    var button1 = new Backbone.UI.Button($('.btn_example1'), {caption : 'First button', toggle : true}).on('btn:click:even', function() {
        spinner.setMax(100);
    }).on('btn:click:odd', function() {

    });*/

    //BUTTON

    var button1 = new Backbone.UI.Button($('.btn_example1'), {
		caption : 'First button', toggle : true, disabled : true}
	);

	var button2 = new Backbone.UI.Button($('.btn_example2'), {
		caption : 'Second button', toggle : true, state : true
	});

    button1.on('btn:click', function(model) {
		console.log("click", model.getState());
    });

    button2.on('btn:click', function(model) {
		button1.setCaption('Hey').enable();
    });

}(Backbone, _, jQuery));