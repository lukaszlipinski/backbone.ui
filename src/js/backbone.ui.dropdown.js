/*globals Backbone, _, jQuery */

/**
 *
 * - dd:change:value
 *
 * Component Internal CSS Classes:
 * - caption element
 *     - none
 * - option elements
 *     - js-dd-option
 *
 * Component External CSS Classes:
 * - caption element
 *     - ui-dd-disabled
 * - list element
 *     - ui-dd-opened
 * - options elements
 *     - ui-dd-selected
 *
 * Component Attributes
 * - options elements
 *     - data-dd-option
 */

(function(Backbone, _, $) {
    "use strict";

	var classes = {
		events : {
			main : '.dropdown',
			list : '.dropdown-list'
		},

		triggers : {
			changeValue : 'dd:change:value'
		},

		ui : {
			opened : 'ui-dd-opened',
			selected : 'ui-dd-selected',
			disabled : 'ui-dd-disabled'
		},

		data : {
			option : 'data-dd-option'
		},

		js : {
			option : '.js-dd-option',
			closeListLayer : '.js-dd-close-list-layer'
		}
	};

	var dropdownViewEvents = {};
		dropdownViewEvents['click' + classes.events.main] = '_handleClickEvent';
		dropdownViewEvents['mouseover' + classes.events.main] = '_handleMouseOverEvent';
		dropdownViewEvents['mouseout' + classes.events.main] = '_handleMouseOutEvent';

	var dropdownListViewEvents = {};
		dropdownListViewEvents['click' + classes.events.list + ' ' + classes.js.option] = '_handleListOptionClickEvent';
		dropdownListViewEvents['mouseout' + classes.events.list] = '_handleListMouseOutEvent';

	/**
	 * Models
	 */
	var DropdownModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			opened : false,
			value : '',
			openOnClick : true,
			openOnHover : true,
			template : '#tpl_dropdown',
			listPosition : 'right',
			disabled : false,
			initialMessage : '',
			className : '',

			//List Settings
			listTemplate : '#tpl_dropdown_list',
			options : [],
			exclusions : []
		},

		/**
		 * Opens dropdown list
		 */
		open : function() {
			this.set('opened', true);
		},

		/**
		 * Closes dropdown list
		 */
		close : function() {
			this.set('opened', false);
		},

		/**
		 * Opens of closes dropdown list depends on the previous state
		 */
		toggleOpened : function() {
			this.set('opened', !this.isOpened());
		},

		/**
		 * Returns information whether the list is currently opened or closed
		 *
		 * @return {Boolean}
		 */
		isOpened : function() {
			return this.get('opened');
		},

		/**
		 * Determinates whether dropdown list should be opened on click or not
		 *
		 * @return {Boolean}
		 */
		openOnClick : function() {
			return this.get('openOnClick');
		},

		/**
		 * Determinates whether dropdown list should be opened on hover or not
		 *
		 * @return {Boolean}
		 */
		openOnHover : function() {
			return this.get('openOnHover');
		},

		/**
		 * Determinates dropdown list position related to the main container
		 *
		 * @return {String}   @see listPosition
		 */
		getListPosition : function() {
			return this.get('listPosition');
		},

		/**
		 * Returns dropdown list template
		 *
		 * @return {String}
		 */
		getListTemplate : function() {
			return this.get('listTemplate');
		},

		/**
		 * Returns value of dropdown
		 *
		 * @return {Number|String}
		 */
		getValue : function() {
			return this.get('value');
		},

		/**
		 * Sets value of dropdown
		 */
		setValue : function(value, props) {
			props = props || {};

			this.set('value', value, {silent : props.silent});
		},

		/**
		 * Returns options array, additionaly checks which options are excluded
		 *
		 * @return {Object}   an array with options
		 */
		getOptions : function() {
			var options = this.get('options').slice(0), i, l = options.length,
				exclusions = this.get('exclusions'), j, l2 = exclusions.length,
				extendedOptions = [];

			//Go trough all options and check which one are disabled
			for (i = 0; i < l; i++) {
				extendedOptions[i] = options[i];

				for (j = 0; j < l2; j++) {
					if (extendedOptions[i].value === exclusions[j]) {
						extendedOptions[i].disabled = true;
					}
				}
			}

			return extendedOptions;
		},

		/**
		 * Sets new options for dropdown
		 *
		 * @param {Object} value   an array with options
		 */
		setOptions : function(value, props) {
			props = props || {};

			this.set({options : value}, {silent : props.silent});
		},

		/**
		 * Returns currently selected option
		 *
		 * @return {Object}
		 */
		getSelectedOption : function() {
			var value = this.getValue(),
				result = _.find(this.getOptions(), function(option) {
					return option.value == value;
				});

			return result;
		},

		/**
		 * Sets exclusions for the dropdown
		 *
		 * @param {Object} value   an array with values of excluded options
		 */
		setExclusions : function(value, props) {
			props = props || {};

			this.set('exclusions', value, {silent : props.silent});
		},

		/**
		 * Returns class name which should be unique
		 *
		 * @return {String}
		 */
		getClassName : function() {
			return this.get('className');
		},

		/**
		 * Checks if the value passed as a parameter is excluded or not.
		 * (with excluded I mean that whether or not it should be disabled on the list)
		 *
		 * @param {String|Number} value   the value which have to be checked
		 *
		 * @return {Boolean}
		 */
		isExcluded : function(value) {
			var exclusions = this.get('exclusions'),
				i, l = exclusions.length;

			for (i = 0; i < l; i++) {
				if (exclusions[i] == value) {
					return true;
				}
			}

			return false;
		}
	});

	/**
	 * Views
	 */
	var DropdownListView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.list,
		//unique id for each list
		listindex : 0,
		//width of the list directly after initialization
		initialWidth : 0,
		//previous z-index set to the dropdown
		previousZIndex : null,
		//a layer which covers entire screen when dropdown list is opened
		$closeListLayer : null,

		events : dropdownListViewEvents,

		initialize : function() {
			var model = this.model;

			this.listindex = Backbone.UI.getNextListIndex();

			this.$parent = this.options.$parent;
			this.controller = this.options.controller;

			this.template = this.getTemplate(this.model.getListTemplate());

			this.$el = $(this.template({
				value : model.getValue(),
				options : model.getOptions()
			})).appendTo('body').attr("id", "dd_list_" + this.listindex);

			this.initialWidth = this.$el.outerWidth();

			model.on('change:value', this._handleValueChange, this);
			model.on('change:opened', this._handleOpenedChange, this);
			model.on('change:options', this._handleOptionsChange, this);
			model.on('change:exclusions', this._handleExclusionsChange, this);
		},

		render : function() {
			var model = this.model;

			this.$el.html($(this.template({
				value : model.getValue(),
				options : model.getOptions()
			})).children());
		},

		open : function() {
			var model = this.model,
				$el = this.$el, $parent = this.$parent;

			var listTotalWidth = $el.outerWidth(), listWidth = $el.width(),
				width = $parent.outerWidth(), height = $parent.outerHeight(),
				listPosition = model.getListPosition(), offset = $parent.offset(),
				modTop = height - 1, modLeft = 0,
				newTotalWidth = Math.max(width, this.initialWidth);

			switch (listPosition) {
				case "center":
					modLeft = -((newTotalWidth - width) / 2);
					break;
				case "left":
					//do nothing
					break;
				case "right":
					modLeft = width - newTotalWidth;
					break;
			}

			$el.css({
				top : offset.top + modTop,
				left : offset.left + modLeft,
				marginLeft : 0,
				zIndex : 19001
			});

			if (listTotalWidth !== newTotalWidth) {
				$el.width(listWidth - (listTotalWidth - newTotalWidth));
			}

			this.createCloseListLayer();

			$parent.addClass(classes.ui.opened);
			$el.addClass(classes.ui.opened);
		},

		close : function() {
			this.$parent.removeClass(classes.ui.opened);
			this.$el.removeClass(classes.ui.opened);

			this.destroyCloseListLayer();
		},

		/**
		 * Creates layer which is used to close dropdown when user will click
		 * somewhere in the window
		 */
		createCloseListLayer : function() {
			var _self = this,
				attr = {
					position : 'absolute', top : 0, left : 0, right : 0, bottom : 0, zIndex : 19000
				};

			this.$closeListLayer = $('<div class="' + (classes.js.closeListLayer).substr(1) + ' ' + this.model.getClassName() + '" />').appendTo('body').css(attr).one("click", function() {
				_self.controller._handleCloseListLayerClickEvent();
			});

			//Save previous z-index
			this.previousZIndex = this.$parent.css('zIndex');
			//and set temporary one
			this.$parent.css('zIndex', 20000);
		},

		/**
		 * Destroys layer which is used to close dropdown when user will click
		 * somewhere in the window
		 */
		destroyCloseListLayer : function() {
			var $closeListLayer = this.$closeListLayer;

			if ($closeListLayer) {
				$closeListLayer.off().remove();
				this.$closeListLayer = null;
				//Restore z-index
				this.$parent.css('zIndex', this.previousZIndex);
			}
		},

		_handleOpenedChange : function() {
			this[this.model.isOpened() ? 'open' : 'close']();
		},

		_handleValueChange : function() {
			this.render();
		},

		_handleOptionsChange : function() {
			if (this.model.changed.value) {
				return;
			}

			this.render();
		},

		_handleExclusionsChange : function() {
			if (this.model.changed.value) {
				return;
			}

			this.render();
		},

		_handleListOptionClickEvent : function(e) {
			var $target = $(e.currentTarget),
				value = $target.attr(classes.data.option);

			this.controller._handleListOptionClickEvent(value);
		},

		_handleListMouseOutEvent : function(e) {
			var $target = $(e.relatedTarget);

			this.controller._handleListMouseOutEvent(this.$el, $target);
        },

		destroy : function() {
			this.$el.off(classes.events.main).remove();

			this.destroyCloseListLayer();
		}
	});


	var DropdownView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,

		events : dropdownViewEvents,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;
			this.template = this.getTemplate();

			this.listView = new DropdownListView({
				$parent : this.$el,
				model : this.model,
				controller : this.controller
			});

			model.on('change:value', this._handleValueChange, this);

			this.render();
		},

		render : function() {
			this.$el.html(this.template(this.model.getSelectedOption()));
		},

		_handleValueChange : function() {
			this.render();
		},

		_handleClickEvent : function(e) {
			this.controller._handleClickEvent();
		},

		_handleMouseOverEvent : function(e) {
			this.controller._handleMouseOverEvent();
		},

		_handleMouseOutEvent : function(e) {
			var $target = $(e.relatedTarget);

			this.controller._handleMouseOutEvent($target, this.$el, this.listView.$el);
		},

		destroy : function() {
			this.listView.destroy();
			this.listView = null;
		}
	});

	/**
	 * Controller
	 */
	Backbone.UI.Dropdown = Backbone.UI.Component.extend({
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new DropdownModel(settings);

			//View
			this.view = new DropdownView({
				el : this.$el,
				model : this.model,
				controller : this
			});

			//Events
			this.model.on('change:value', this._handleValueChange, this);
		},

		_handleValueChange : function() {
			this.trigger(classes.triggers.changeValue, this, this.model.getValue());
		},

		_handleClickEvent : function() {
			var model = this.model;

			if (!model.isDisabled() && model.openOnClick()) {
				model.toggleOpened();
			}
		},

		_handleMouseOverEvent : function() {
			var model = this.model;

			if (!model.isDisabled() && model.openOnHover()) {
				model.open();
			}
		},

		_handleMouseOutEvent : function($target, $el, $list) {
			var model = this.model;

			if (!model.isDisabled() && model.openOnHover() && $target !== $list && !$list.find($target).length && $target !== $el && !$el.find($target).length) {
				model.close();
			}
		},

		_handleCloseListLayerClickEvent : function() {
			this.model.close();
		},

		_handleListOptionClickEvent : function(value) {
			var model = this.model;

			if (!model.isExcluded(value)) {
				model.setValue(value);
				model.close();
			}
		},

		_handleListMouseOutEvent : function($list, $target) {
			var model = this.model;

			if (model.openOnHover() && !$list.find($target).length) {
				model.close();
			}
		},

		/**
		 * Public Methods
		 */

		/**
		 * Opens dropdown list
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		open : function() {
			this.model.open();

			return this;
		},

		/**
		 * Closes dropdown list
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		close : function() {
			this.model.close();

			return this;
		},

		/**
		 * Opens of closes dropdown list depends on the previous state
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		toggleOpen : function() {
			this.model.toggleOpened();

			return this;
		},

		/**
		 * Returns information whether the list is currently opened or closed
		 *
		 * @return {Boolean}
		 */
		isOpened : function() {
			return this.model.isOpened();
		},

		/**
		 * Returns value of dropdown
		 *
		 * @return {Number|String}
		 */
		getValue : function() {
			return this.model.getValue();
		},

		/**
		 * Sets value of dropdown
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		setValue : function(value, props) {
			this.model.setValue(value, props);

			return this;
		},

		/**
		 * Sets new options for dropdown
		 *
		 * @param {Object} value   an array with options
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		setOptions : function(value, props) {
			this.model.setOptions(value, props);

			return this;
		},

		/**
		 * Sets exclusions for the dropdown
		 *
		 * @param {Object} value   an array with values of excluded options
		 *
		 * @return {Object} Backbone.UI.Dropdown
		 */
		setExclusions : function(value, props) {
			this.model.setExclusions(value, props);

			return this;
		}
	});
}(Backbone, _, jQuery));