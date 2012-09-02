/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

	var component = {
		className : '.dropdown',
		events : {
			view : {
				'click.dropdown' : '_handleClickEvent',
				'mouseover.dropdown' : '_handleMouseOverEvent',
				'mouseout.dropdown' : '_handleMouseOutEvent'
			},

			model : {
				changeValue : 'change:value',
				changeOpened : 'change:opened',
				changeOptions : 'change:options',
				changeExclusions : 'change:exclusions'
			}
		},
		triggers : {
			/**
			 * Triggered every time when value is changed
			 *
			 * @event dd:change:value
			 * @param {Object} Backbone.UI.Button
			 * @param {String} value
			 */
			changeValue : 'dd:change:value'
		}
	};

	var componentList = {
		className : '.dropdown-list',
		events : {
			view : {
				'click.dropdown-list .js-dd-option' : '_handleListOptionClickEvent',
				'mouseout.dropdown-list' : '_handleListMouseOutEvent'
			}
		},
		classes : {
			ui : {
				opened : 'ui-dd-opened'
			},

			js : {
				option : 'js-dd-option'
			},

			data : {
				option : 'data-dd-option'
			}
		}
	};

	/**
	 * Dropdown Model
	 *
	 * @extends Backbone.UI.ComponentModel
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
		 *
		 * @method open
		 * @protected
		 */
		open : function() {
			this.set('opened', true);
		},

		/**
		 * Closes dropdown list
		 *
		 * @method close
		 * @protected
		 */
		close : function() {
			this.set('opened', false);
		},

		/**
		 * Opens of closes dropdown list depends on the previous state
		 *
		 * @method toggleOpened
		 * @protected
		 */
		toggleOpened : function() {
			this.set('opened', !this.isOpened());
		},

		/**
		 * Returns information whether the list is currently opened or closed
		 *
		 * @method isOpened
		 * @protected
		 *
		 * @return {Boolean}
		 */
		isOpened : function() {
			return this.get('opened');
		},

		/**
		 * Determinates whether dropdown list should be opened on click event or not
		 *
		 * @method openOnClick
		 * @protected
		 *
		 * @return {Boolean}
		 */
		openOnClick : function() {
			return this.get('openOnClick');
		},

		/**
		 * Determinates whether dropdown list should be opened on hover event or not
		 *
		 * @method openOnHover
		 * @protected
		 *
		 * @return {Boolean}
		 */
		openOnHover : function() {
			return this.get('openOnHover');
		},

		/**
		 * Determinates dropdown list position related to the main container
		 *
		 * @method getListPosition
		 * @protected
		 *
		 * @return {String}   @see listPosition
		 */
		getListPosition : function() {
			return this.get('listPosition');
		},

		/**
		 * Returns dropdown list template
		 *
		 * @method getListTemplate
		 * @protected
		 *
		 * @return {String}
		 */
		getListTemplate : function() {
			return this.get('listTemplate');
		},

		/**
		 * Returns value of dropdown
		 *
		 * @method getValue
		 * @protected
		 *
		 * @return {Number|String}
		 */
		getValue : function() {
			return this.get('value');
		},

		/**
		 * Sets value of dropdown
		 *
		 * @method setValue
		 * @protected
		 *
		 * @param {String} value   value of one of options existed on a list
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 */
		setValue : function(value, props) {
			props = props || {};

			this.set('value', value, {silent : props.silent});
		},

		/**
		 * Returns options array, additionaly checks which options are excluded
		 *
		 * @method getOptions
		 * @protected
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
		 * @method setOptons
		 * @protected
		 *
		 * @param {Object} value   an array with options
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 */
		setOptions : function(value, props) {
			props = props || {};

			this.set({options : value}, {silent : props.silent});
		},

		/**
		 * Returns currently selected option
		 *
		 * @method getSelectedOption
		 * @protected
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
		 * Sets exclusions for the dropdown options
		 *
		 * @method setExclusions
		 * @protected
		 *
		 * @param {Object} value   an array with values of excluded options
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 */
		setExclusions : function(value, props) {
			props = props || {};

			this.set('exclusions', value, {silent : props.silent});
		},

		/**
		 * Returns class name specified by developer (should be unique)
		 *
		 * @method getClassName
		 * @protected
		 *
		 * @return {String}
		 */
		getClassName : function() {
			return this.get('className');
		},

		/**
		 * Checks if the value passed as a parameter is excluded or not.
		 * (with excluded I mean that whether should be disabled on the list)
		 *
		 * @method isExcluded
		 * @protected
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
	 * Dropdown List View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var DropdownListView = Backbone.UI.ComponentView.extend({
		componentClassName : component.className,
		//unique id for each list
		listindex : 0,
		//width of the list directly after initialization
		initialWidth : 0,
		//previous z-index set to the dropdown
		previousZIndex : null,
		//a layer which covers entire screen when dropdown list is opened
		$closeListLayer : null,

		events : componentList.events.view,

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

			model.on(component.events.model.changeValue, this._handleValueChange, this);
			model.on(component.events.model.changeOpened, this._handleOpenedChange, this);
			model.on(component.events.model.changeOptions, this._handleOptionsChange, this);
			model.on(component.events.model.changeExclusions, this._handleExclusionsChange, this);
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

			$parent.addClass(componentList.classes.ui.opened);
			$el.addClass(componentList.classes.ui.opened);
		},

		close : function() {
			this.$parent.removeClass(componentList.classes.ui.opened);
			this.$el.removeClass(componentList.classes.ui.opened);

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

			this.$closeListLayer = $('<div class="js-dd-close-list-layer ' + this.model.getClassName() + '" />').appendTo('body').css(attr).one("click", function() {
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

		/**
		 * UI event handlers
		 */
		_handleListOptionClickEvent : function(e) {
			var $target = $(e.currentTarget),
				value = $target.attr(componentList.classes.data.option);

			this.controller._handleListOptionClickEvent(value);
		},

		_handleListMouseOutEvent : function(e) {
			var $target = $(e.relatedTarget);

			this.controller._handleListMouseOutEvent(this.$el, $target);
        },

		/**
		 * Model event handlers
		 */
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

		destroy : function() {
			this.$el.off(componentList.className).remove();

			this.destroyCloseListLayer();
		}
	});

	/**
	 * Dropdown View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var DropdownView = Backbone.UI.ComponentView.extend({
		componentClassName : component.className,

		events : component.events.view,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;
			this.template = this.getTemplate();

			this.listView = new DropdownListView({
				$parent : this.$el,
				model : this.model,
				controller : this.controller
			});

			model.on(component.events.model.changeValue, this._handleValueChange, this);

			this.render();
		},

		render : function() {
			this.$el.html(this.template(this.model.getSelectedOption()));
		},

		/**
		 * UI event handlers
		 */
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

		/**
		 * Model event handlers
		 */
		_handleValueChange : function() {
			this.render();
		},

		destroy : function() {
			this.listView.destroy();
			this.listView = null;
		}
	});

	/**
	 * **Description**
	 *
	 * Backbone.UI.Dropdown component extends standard functionality of Select HTMLElement.
	 *
	 * **Additional information**
	 *
	 * CSS classes which are applied on the component depends on the state of component:
	 *
	 *     ui-dd-opened   applied on root list node when list is visible
	 *
	 * CSS classes which should be specified by developer:
	 *
	 *     js-dd-option   should be specified on each option node
	 *
	 * HTML attributes which should be specified by developer
	 *
	 *     data-dd-option   should be specified on each option node and keeps information about its value
	 *
	 * @namespace Backbone.UI
	 * @class Dropdown
	 * @extends Backbone.UI.Component
	 * @constructor
	 *
	 * @param {Object} el   jQuery Object
	 * @param {Object} settings   Hash array contains settings which will override default one
	 *     @param {Boolean} settings.opened=false
	 *     @param {String} settings.value=''
	 *     @param {Boolean} settings.openOnClick=true
	 *     @param {Boolean} settings.openOnHover=true
	 *     @param {String} settings.template='#tpl_dropdown'
	 *     @param {String} settings.listPosition='right'
	 *     @param {Boolean} settings.disabled=false
	 *     @param {String} settings.initialMessage=''
	 *     @param {String} settings.className=''
	 *
	 *     @param {String} settings.listTemplate='#tpl_dropdown_list'
	 *     @param {Object} settings.options=Array
	 *     @param {Object} settings.exclusions=Array
	 *
	 * @uses Backbone.js
	 * @uses Underscore.js
	 * @uses jQuery
	 *
	 * @author Łukasz Lipiński
	 *
	 * @example
	 *     <!doctype html>
	 *	   <html lang="en">
	 *         <head>
     *             <script type="text/template" id="tpl_dropdown">
     *                 <!--div class="dropdown dd-caption" -->
     *                     <div class="caption js-dd-caption"><%= data.name + ' test ' +data.something %></div>
     *                 <!--/div-->
     *             </script>
     *             <script type="text/template" id="tpl_dropdown_list">
     *                 <div class="dropdown-list">
     *                     <% var option, options = data.options, i, l = options.length, cssClass;
     *
     *                     for (i = 0; i < l; i++) {
     *                         option = options[i];
     *                         cssClass = (option.disabled ? ' ui-dd-disabled' : '') + (data.value == option.value ? ' ui-dd-selected' : ''); %>
     *                              <div class="option<%= cssClass %>" data-dd-option="<%= option.value %>"><%= option.name +' '+option.value %></div>
     *                     <% } %>
     *                 </div>
     *             </script>
	 *         </head>
	 *         <body>
	 *              <div class="dd_example dropdown"></div>
	 *
	 *              <script>
	 *              //Component initialization
	 *				var dropdown = new Backbone.UI.Dropdown({
     *                  el : $('.dd_example'),
     *                  settings : {
     *                      value : 0,
     *                      options : [
     *                          {name : 'Option', value : 0, something : 'item'},
     *                          {name : 'Option', value : 1, something : 'itemm'},
     *                          {name : 'Options', value : 2, something : 'itemm'}
     *                      ],
     *                      exclusions : [2]
     *                  }
     *              });
	 *              </script>
	 *         </body>
	 *     </html>
	 */
	Backbone.UI.Dropdown = Backbone.UI.Component.extend({
		/**
		 * @method initialize
		 * @private
		 */
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
			this.model.on(component.events.model.changeValue, this._handleValueChange, this);
		},

		/**
		 * @method _handleValueChange
		 * @private
		 */
		_handleValueChange : function() {
			this.trigger(component.triggers.changeValue, this, this.model.getValue());
		},

		/**
		 * @method _handleClickEvent
		 * @private
		 */
		_handleClickEvent : function() {
			var model = this.model;

			if (!model.isDisabled() && model.openOnClick()) {
				model.toggleOpened();
			}
		},

		/**
		 * @method _handleMouseOverEvent
		 * @private
		 */
		_handleMouseOverEvent : function() {
			var model = this.model;

			if (!model.isDisabled() && model.openOnHover()) {
				model.open();
			}
		},

		/**
		 * @method _handleMouseOutEvent
		 * @private
		 */
		_handleMouseOutEvent : function($target, $el, $list) {
			var model = this.model;

			if (!model.isDisabled() && model.openOnHover() && $target !== $list && !$list.find($target).length && $target !== $el && !$el.find($target).length) {
				model.close();
			}
		},

		/**
		 * @method _handleCloseListLayerClickEvent
		 * @private
		 */
		_handleCloseListLayerClickEvent : function() {
			this.model.close();
		},

		/**
		 * @method _handleListOptionClickEvent
		 * @private
		 */
		_handleListOptionClickEvent : function(value) {
			var model = this.model;

			if (!model.isExcluded(value)) {
				model.setValue(value);
				model.close();
			}
		},

		/**
		 * @method _handleListMouseOutEvent
		 * @private
		 */
		_handleListMouseOutEvent : function($list, $target) {
			var model = this.model;

			if (model.openOnHover() && !$list.find($target).length) {
				model.close();
			}
		},

		/**
		 * Opens dropdown list
		 *
		 * @method open
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		open : function() {
			this.model.open();

			return this;
		},

		/**
		 * Closes dropdown list
		 *
		 * @method close
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		close : function() {
			this.model.close();

			return this;
		},

		/**
		 * Opens of closes dropdown list depends on the previous state
		 *
		 * @method toggleOpen
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		toggleOpen : function() {
			this.model.toggleOpened();

			return this;
		},

		/**
		 * Returns information whether the list is currently opened or closed
		 *
		 * @method isOpened
		 *
		 * @return {Boolean}
		 */
		isOpened : function() {
			return this.model.isOpened();
		},

		/**
		 * Returns value of dropdown
		 *
		 * @method getValue
		 *
		 * @return {Number|String}
		 */
		getValue : function() {
			return this.model.getValue();
		},

		/**
		 * Sets value of dropdown
		 *
		 * @method setValue
		 * @chainable
		 *
		 * @param {String} value   value of one of options existed on a list
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		setValue : function(value, props) {
			this.model.setValue(value, props);

			return this;
		},

		/**
		 * Sets new options for dropdown
		 *
		 * @method setOptons
		 * @chainable
		 *
		 * @param {Object} value   an array with options
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		setOptions : function(value, props) {
			this.model.setOptions(value, props);

			return this;
		},

		/**
		 * Sets exclusions for the dropdown options
		 *
		 * @method setExclusions
		 * @chainable
		 *
		 * @param {Object} value   an array with values of excluded options
		 * @param {Object} props   hash array with additional settings
		 *     @param {Boolean} props.silent   determinates if value should be
		 *                                     set silently (without triggering events)
		 *
		 * @return {Object} Backbone.UI.Dropdown Component Object
		 */
		setExclusions : function(value, props) {
			this.model.setExclusions(value, props);

			return this;
		}
	});
}(Backbone, _, jQuery));