/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

	var reservedAttributes = ['selected'];

	var component = {
		className : '.tree',
		events : {
			view : {
				'click.tree .js-tree-item' : '_handleItemClickEvent'
			},
			model : {
				changeDisabled : 'change:disabled',
				changeOriginalItems : 'change:items',
				changeItems : 'change:_converted_items'
			}
		},
		triggers : {

		},

		classes : {
			ui : {
				disabled : 'ui-tree-disabled',
				opened : 'ui-tree-opened',
				selected : 'ui-tree-selected',
				item : 'ui-tree-item',
				arrow : 'ui-tree-arrow'
			},

			js : {
				subitems : '.js-tree-subitems',
				arrow : '.js-tree-arrow',
				item : '.js-tree-item'
			},

			data : {
				value : 'data-tree-value'
			}
		}
	};

	/**
	 * Tree Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var TreeModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			disabled : false,
			template : '#tpl_tree_item',
			items : null,
			_converted_items : null
		},

		getOriginalItems : function() {
			return this.get('items');
		},

		getItems : function() {
			return this.get('_converted_items');
		},

		setItems : function(items) {
			this.set('_converted_items', items);
		}
	});

	/**
	 * Tree View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var TreeView = Backbone.UI.ComponentView.extend({
		componentClassName : component.className,

		events : component.events.view,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;
			this.template = this.getTemplate();

			model.on(component.events.model.changeOriginalItems, this.convertItems, this);
			model.on(component.events.model.changeItems, this.renderItems, this);
			model.on(component.events.model.changeDisabled, this._handleDisabledChange, this);

			this.convertItems();
		},

		convertItems : function() {
			var model = this.model,
				items = model.getOriginalItems(),
				converted_items;

			if (_.isArray(items)) {
				converted_items = items;
			}
			else if (_.isObject(items)) {
				converted_items = this.convertObjectItems(items);
			}
			else {
				throw "Items variable have to be an Array or an Object.";
			}

			model.setItems(converted_items);
		},

		convertObjectItems : function(items) {
			var $el = this.$el, id, converted_items = [], item,
				isObject;

			for (id in items) {
				if (items.hasOwnProperty(id)) {
					item = items[id];
					isObject = _.isObject(item);

					converted_items[converted_items.length] = {
						caption : id,
						opened : false,
						items : isObject ? this.convertObjectItems(item) : [],
						value : !isObject ? item : null
					};
				}
			}

			return converted_items;
		},

		renderItems : function(model, items, changes, $parent) {
			var i, l = items.length, item, $item;

			if (!$parent) {
				$parent = this.$el;
			}

			for (i = 0; i < l; i++) {
				item = items[i];

				$item = $(this.template(item));
				$parent.append($item);

				if (item.items.length) {
					if (!$item.find(component.classes.js.subitems).length) {
						throw "Please specify container for sub nodes";
					}

					this.renderItems(this.model, item.items, {}, $item.find(component.classes.js.subitems));
				}
			}
		},

		/**
		 * UI event handlers
		 */
		_handleItemClickEvent : function(e) {
			e.stopPropagation();

			var $target = $(e.target),
				$item = $(e.currentTarget),
				$el = this.$el;

			if ($target.hasClass(component.classes.ui.arrow)) {
				this._handleArrowClickEvent(e);
			}

			$el.find(component.classes.js.item).removeClass(component.classes.ui.selected);
			$item.toggleClass(component.classes.ui.selected);

			this.controller.trigger('tree:item:click', this.controller, $item.attr(component.classes.data.value));
		},

		_handleArrowClickEvent : function(e) {
			var $item = $(e.currentTarget);

			$item.toggleClass(component.classes.ui.opened);
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(component.classes.ui.disabled, this.model.isDisabled());
		}
	});

	Backbone.UI.Tree = Backbone.UI.Component.extend({
		/**
		 * @method initialize
		 * @private
		 */
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new TreeModel(settings);

			//View
			this.view = new TreeView({
				el : this.$el,
				model : this.model,
				controller : this
			});
		}
	});
}(Backbone, _, jQuery));