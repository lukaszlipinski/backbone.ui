/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

	var items = {
		'main group 1' : {
			'sub group 1' : {
				'item 1' : 'value 1',
				'item 2' : 'value 2',
				'item 3' : 'value 3',
				'item 4' : 'value 4'
			}
		},
		'main group 2' : {

		},
		'main group 3' : {
			'sub group 1' : {
				'item 1' : 'value 1',
				'item 2' : 'value 2'
			},
			'sub group 2' : {
				'item 1' : 'value 1',
				'item 2' : 'value 2',
				'item 3' : 'value 3'
			}
		},
		'main group 4' : {
			'sub group 1' : {
				'item 1' : 'value 1',
				'item 2' : 'value 2'
			},
			'sub group 2' : {
				'item 1' : 'value 1',
				'item 2' : 'value 2',
				'item 3' : 'value 3'
			}
		}
	};

	var items2 = [
		{caption : 'Components', items : [], value : 'components', selected : true},
		{caption : 'Events', items : [], value : 'events'}
	];

    var tree1 = new Backbone.UI.Tree({
        el : $('.tree_example1'),
        settings : {
            items : items
        }
    }).on('tree:item:click', function(_tree, value) {
		console.log(value);
	});

	var tree2 = new Backbone.UI.Tree({
        el : $('.tree_example2'),
        settings : {
            items : items2
        }
    }).on('tree:item:click', function(_tree, value) {
		console.log(value);
	});

}(Backbone, _, jQuery));