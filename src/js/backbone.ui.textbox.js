/*globals Backbone, _, jQuery  */

(function(Backbone, _, $) {
	"use strict";

	var ENTER = Backbone.UI.KEYS.ENTER;

	var component = {
		className : '.textbox',
		events : {
			view : {
				'keypress.textbox .js-txt-input' : '_handleInputKeyPressEvent',
				'keyup.textbox .js-txt-input' : '_handleInputKeyUpEvent',
				'focus.textbox .js-txt-input' : '_handleInputFocusEvent',
				'blur.textbox .js-txt-input' : '_handleInputBlurEvent',
				'click.textbox .js-txt-empty' : '_handleEmptyMessageClickEvent',
				'click.textbox .js-txt-clear' : '_handleClearButtonClickEvent'
			},
			model : {
				changeValue : 'change:value',
				changeDisabled : 'change:disabled',
				changeError : 'change:error'
			}
		},
		triggers : {
			/**
			 * Triggered every time when textbox receives focus
			 *
			 * @event txt:focus
			 * @param {Object} Backbone.UI.Textbox
			 */
			focus : 'txt:focus',

			/**
			 * Triggered every time when textbox value changes
			 *
			 * @event txt:change:value
			 * @param {Object} Backbone.UI.Textbox
			 * @param {String} value
			 * @param {String} previous value
			 */
			changeValue : 'txt:change:value',

			/**
			 * Triggered every time when value in textbox doesn't match requirements
			 *
			 * @event txt:error
			 * @param {Object} Backbone.UI.Textbox
			 * @param {Object} error object
			 */
			error : 'txt:error'
		},
		classes : {
			ui : {
				empty : 'ui-txt-empty',
				clear : 'ui-txt-clear',
				disabled : 'ui-txt-disabled',
				error : 'ui-txt-error'
			},

			js : {
				input : '.js-txt-input',
				empty : '.js-txt-empty',
				clear : '.js-txt-clear',
				error : '.js-txt-error'
			}
		}
	};

	/**
	 * Textbox Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var TextboxModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			value : '',
			type : 'text',
			disabled : false,
			tabIndex : 1,
			template : '#tpl_textbox',
			emptyMessage : '',
			clearButton : false,
			live : false,
			invalidMessage : '',
			regexp : null,

			error : false,

			//type 'number'
			min : 0,
			max : 10
		},

		initialize : function() {

		},

		/**
		 * Returns tabindex specified by developer
		 *
		 * @method getTabIndex
		 * @protected
		 *
		 * @return {Number}
		 */
		getTabIndex : function() {
			return this.get('tabIndex');
		},

		/**
		 * Returns caption which is displayed in the textbox when there is no value
		 * specified in component
		 *
		 * @method getEmptyMessage
		 * @protected
		 *
		 * @return {String}
		 */
		getEmptyMessage : function() {
			return this.get('emptyMessage');
		},

		/**
		 * Returns value of the component
		 *
		 * @method getValue
		 * @protected
		 *
		 * @return {String}
		 */
		getValue : function() {
			return this.get('value');
		},

		/**
		 * Returns value which was in the component before the last
		 * one has been specified
		 *
		 * @method getPreviousValue
		 * @protected
		 *
		 * @return {String}
		 */
		getPreviousValue : function() {
			return this.previous('value');
		},

		/**
		 * Returns regular expression specified by developer or null otherwise
		 *
		 * @method getRegExp
		 * @protected
		 *
		 * @return {Object}
		 */
		getRegExp : function() {
			return this.get('regexp');
		},

		/**
		 * Returns textbox type
		 *
		 * @method getType
		 * @protected
		 *
		 * @return {String}
		 */
		getType : function() {
			return this.get('type');
		},

		/**
		 * Returns error object or false
		 *
		 * @method getError
		 * @protected
		 *
		 * @return {Object|Boolean}
		 */
		getError : function() {
			return this.get('error');
		},

		/**
		 * Returns maximal value which can be specified in textbox (type='number')
		 *
		 * @method getMax
		 * @protected
		 *
		 * @return {Number}
		 */
		getMax : function() {
			return this.get('max');
		},

		/**
		 * Returns minimal value which can be specified in textbox (type='number')
		 *
		 * @method getMin
		 * @protected
		 *
		 * @return {Number}
		 */
		getMin : function() {
			return this.get('min');
		},

		/**
		 * Sets maximal value which can be specified in textbox (type='number')
		 *
		 * @method setMax
		 * @protected
		 *
		 * @param {Number} value
		 */
		setMax : function(value) {
			this.set('max', value);
		},

		/**
		 * Sets minimal value which can be specified in textbox (type='number')
		 *
		 * @method setMin
		 * @protected
		 *
		 * @param {Number} value
		 */
		setMin : function(value) {
			this.set('min', value);
		},

		/**
		 * Sets error setting to object which keeps informations about last occured error
		 * or to false when value has been corrected
		 *
		 * @method setError
		 * @protected
		 *
		 * @param {Number} value
		 */
		setError : function(value) {
			this.set({error : value});
		},

		/**
		 * Sets new value in textbox
		 *
		 * @method setValue
		 * @protected
		 *
		 * @param {String|Number} value
		 * @param {Object} props
		 * @param {Boolean} props.force    determinate if value should be set without checking conditions
		 * @param {Boolean} props.silent   determinates if events should be fired when value changes
		 *
		 * @return {Object|Boolean} error object or true (@todo check why I return false for NaN)
		 */
		setValue : function(value, props) {
			props = props || {};

			var type = this.getType(), max, min, regexp;

			if (!props.force) {
				if (type === 'text') {
					regexp = this.getRegExp();

					if (regexp && !new RegExp(regexp).test(value)) {
						return this.setError({msg : "Value doesn't match regexp", value : value, suggestion : '', code : 1});
					}
				}
				else if (type === 'number') {
					if (isNaN(parseInt(value, 10))) {
						return false;
					}

					value = parseInt(value, 10);
					max = this.getMax();
					min = this.getMin();

					if (value > max) {
						return this.setError({msg : "Value is too big", value : value, suggestion : max, code : 11});
					}

					if (value < min) {
						return this.setError({msg : "Value is too small", value : value, suggestion : min, code : 12});
					}
				}
				else {
					throw "Unsupported Backbone.UI.Textbox component type: " + type;
				}
			}

			this.setError(false);
			this.set({value : value}, {silent : props.silent});

			return true;
		},

		/**
		 * Determinates if clear button should be visible or not
		 *
		 * @method showClearButton
		 * @protected
		 *
		 * @return {Boolean}
		 */
		showClearButton : function() {
			return this.get('clearButton');
		},

		/**
		 * Determinates if value is set or not
		 *
		 * @method isEmpty
		 * @protected
		 *
		 * @return {Boolean}
		 */
		isEmpty : function() {
			var value = this.getValue();

			return value === null || value === '';
		},

		/**
		 * Determinates last value change generated an error
		 *
		 * @method isError
		 * @protected
		 *
		 * @return {Boolean}
		 */
		isError : function() {
			return this.get('error') !== false;
		},

		/**
		 * Determinates if live typing is enabled
		 *
		 * @method isLiveTypingEnabled
		 * @protected
		 *
		 * @return {Boolean}
		 */
		isLiveTypingEnabled : function() {
			return this.get('live');
		}
	});

	/**
	 * Textbox View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var TextboxView = Backbone.UI.ComponentView.extend({
		events : component.events.view,

		componentClassName : component.className,

		liveTypingTimer : null,

		$input : null,
		$empty : null,
		$clear : null,
		$error : null,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on(component.events.model.changeValue, this._handleValueChange, this);
			model.on(component.events.model.changeDisabled, this._handleDisabledChange, this);
			model.on(component.events.model.changeError, this._handleErrorChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			var model = this.model;

			this.$el.html(this.template({
				value : model.getValue(),
				emptyMessage : model.getEmptyMessage(),
				tabIndex : model.getTabIndex() || Backbone.UI.getNextTabIndex()
			}));

			this.$input = this.$el.find(component.classes.js.input);
			this.$empty = this.$el.find(component.classes.js.empty);
			this.$clear = this.$el.find(component.classes.js.clear);
			this.$error = this.$el.find(component.classes.js.error);

			if (!this.$input.is('input')) {
				throw "Skin should contain 'input' HTMLElement.";
			}

			//model.setValue(value);
			//Apply default settings on the HTML nodes
			this.checkForDisable();

			this.checkForEmptyMessage();
			this.checkForClearButton();
			this.checkForError();
		},

		/**
		 * Helper methods
		 */
		checkForDisable : function() {
			this._handleDisabledChange();
		},

		checkForEmptyMessage : function() {
			var model = this.model;

			this[model.isEmpty() && !model.isError() ? 'showEmptyMessage' : 'hideEmptyMessage']();
		},

		showEmptyMessage : function() {
			this.$el.addClass(component.classes.ui.empty);
		},

		hideEmptyMessage : function() {
			this.$el.removeClass(component.classes.ui.empty);
		},

		checkForClearButton : function() {
			var model = this.model;

			if (model.showClearButton() && !this._isEmptyInput() && (!model.isEmpty() || model.isError())) {
				this.showClearButton();
			}
			else {
				this.hideClearButton();
			}
		},

		checkForError : function() {
			this._handleErrorChange();
		},

		showClearButton : function() {
			this.$el.addClass(component.classes.ui.clear);
		},

		hideClearButton : function() {
			this.$el.removeClass(component.classes.ui.clear);
		},

		_isEmptyInput : function() {
			return this.$input.val() === '';
		},

		/**
		 * Model event handlers
		 */
		_handleErrorChange : function() {
			var model = this.model, error = model.getError();

			this.checkForClearButton();

			if (model.isError() && !this._isEmptyInput()) {
				this.$error.html(error.msg);
				this.$el.addClass(component.classes.ui.error);

				this.controller.trigger(component.triggers.error, this.controller, error);
			}
			else {
				this.$el.removeClass(component.classes.ui.error);
			}
		},

		_handleDisabledChange : function() {
			var isDisabled = this.model.isDisabled();

			this.$el.toggleClass(component.classes.ui.disabled, isDisabled);

			if (isDisabled) {
				this.$input.attr('disabled', 'disabled');
			}
			else {
				this.$input.removeAttr('disabled');
			}
		},

		_handleValueChange : function() {
			var model = this.model;

			this.$input.val(model.getValue()).focus();

			this.checkForEmptyMessage();
			this.checkForClearButton();
			this.checkForError();
		},

		/**
		 * UI event handlers
		 */
		_handleInputKeyUpEvent : function() {
			var model = this.model,
				_self = this;

			if (model.isDisabled()) {
				return;
			}

			if (model.isLiveTypingEnabled()) {
				window.clearTimeout(this.liveTypingTimer);

				this.liveTypingTimer = window.setTimeout(function() {
					_self.controller._handleLiveTyping(_self.$input.val());
				}, 250);
			}
		},

		_handleInputBlurEvent : function() {
			if (!this._isEmptyInput()) {
				this.controller._handleInputBlurEvent(this.$input.val());
			}

			this.checkForEmptyMessage();
		},

		_handleEmptyMessageClickEvent : function() {
			if (this.model.isDisabled()) {
				return;
			}

			this.hideEmptyMessage();
			this.$input.focus();
		},

		_handleInputFocusEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			this.hideEmptyMessage();

			this.controller.trigger(component.triggers.focus, this.controller);
		},

		_handleInputKeyPressEvent : function(e) {
			this.controller._handleInputKeyPressEvent(e.keyCode, this.$input.val());
		},

		_handleClearButtonClickEvent : function() {
			this.hideClearButton();
			this.$input.val('').focus();

			this.controller._handleClearButtonClickEvent();
		}
	});

	/**
	 * **Description**
	 *
	 * Backbone.UI.Textbox component extends standard functionality of input HTMLElement (type text).
	 *
	 * **Additional information**
	 *
	 * CSS classes which are applied on the component depends on the state of component:
	 *
	 *     ui-btn-disabled   applied on root node when component is disabled
	 *     ui-txt-empty      applied on root node when empty message should be visible
	 *     ui-txt-clear      applied on root node when clear button should be visible
	 *     ui-txt-error      applied on root node when an error has been occured
	 *
	 * CSS classes which should be specified by developer:
	 *
	 *     js-txt-input    determinates position of input HTMLNode
	 *     js-txt-empty    determinates position of element which keeps empty-message
	 *     js-txt-clear    determinates position of clear value button
	 *     js-txt-error    determinates position of element which keeps error message
	 *
	 * @namespace Backbone.UI
	 * @class Textbox
	 * @extends Backbone.UI.Component
	 * @constructor
	 *
	 * @param {Object} el   jQuery Object
	 * @param {Object} settings   Hash array contains settings which will override default one
	 *     @param {String} settings.type='text'   textbox type
	 *     @param {Boolean} settings.disabled=false    determinates if component reacts on user's actions
	 *     @param {String} settings.template='#tpl_textbox'   template string or id of element where template is placed
	 *     @param {Number} settings.tabIndex=1   value which will be set in 'tabindex' input HTMLElement attribute
	 *     @param {String} settings.emptyMessage=''   message which will be displayed when value is not specified
	 *     @param {Boolean} settings.clearButton=false    determinates if clear button should be visible
	 *     @param {Boolean} settings.live=false    determinates if component should react on typing imediately or wait for confirmation by 'enter' key or blur event
	 *     @param {String} settings.invalidMessage=''   message which is displayed when an error occurs
	 *     @param {Object} settings.regexp=null    regular expression that value is checked against
	 *     @param {Boolean} settings.error    keeps information about error
	 *     @param {Number} settings.min    determinates minimal value which can be typed in textbox (works only when type='number')
	 *     @param {Number} settings.max    determinates maximal value which can be typed in textbox (works only when type='number')
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
     *             <script type="text/template" id="tpl_textbox">
	 *                 <!--div class="textbox" -->
	 *                     <div class="middle">
	 *                         <input class="js-txt-input" type="text" tabindex="<%= data.tabIndex %>" value="<%= data.value %>" />
	 *                         <div class="empty-message js-txt-empty"><%= data.emptyMessage %></div>
	 *                     </div>
	 *                     <div class="clear-txt-button js-txt-clear"></div>
	 *                     <div class="error-message js-txt-error"></div>
	 *                 <!--/div-->
	 *             </script>
	 *         </head>
	 *         <body>
	 *              <div class="txt_example textbox" style="width:200px;"></div>
	 *
	 *              <script>
	 *                  var textbox = new Backbone.UI.Textbox({
	 *                      el : $('.txt_example'),
	 *                      settings : {
	 *                          type : 'number',
	 *                          value : 1,
	 *                          max : 10,
	 *                          min : 0,
	 *                          live : true,
	 *                          emptyMessage : 'Insert your name',
	 *                          invalidMessage : 'Incorrect value'
	 *                      }
	 *                  }).on('txt:change:value', function(_txt, val, prev_val) {
	 *                      console.log('event:', val, prev_val);
	 *                  });
	 *              </script>
	 *         </body>
	 *     </html>
	 */
	Backbone.UI.Textbox = Backbone.UI.Component.extend({
		/**
		 * @method initialize
		 * @private
		 */
		initialize : function() {
			var settings = this.options.settings;

			this.model = new TextboxModel(settings);

			this.view = new TextboxView({
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
			this.trigger(component.triggers.changeValue, this, this.model.getValue(), this.model.getPreviousValue());
		},

		/**
		 * @method _handleInputKeyPressEvent
		 * @private
		 */
		_handleInputKeyPressEvent : function(keyCode, value) {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			//Enter
			if (keyCode === ENTER) {
				model.setValue(value);
			}
		},

		/**
		 * @method _handleInputBlurEvent
		 * @private
		 */
		_handleInputBlurEvent : function(value) {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			model.setValue(value);
		},

		/**
		 * @method _handleClearButtonClickEvent
		 * @private
		 */
		_handleClearButtonClickEvent : function() {
			var model = this.model;

			model.setError(false);
			model.setValue('', {force : true});
		},

		/**
		 * @method _handleLiveTyping
		 * @private
		 */
		_handleLiveTyping : function(value) {
			this.model.setValue(value);
		},

		/**
		 * Sets new value in textbox
		 *
		 * @method setValue
		 * @chainable
		 *
		 * @param {String|Number} value
		 *
		 * @return Backbone.UI.Textbox Component Object
		 */
		setValue : function(value) {
			this.model.setValue(value);

			return this;
		},

		/**
		 * Returns value of component
		 *
		 * @method getValue
		 *
		 * @return {String}
		 */
		getValue : function() {
			return this.model.getValue();
		},

		/**
		 * Sets maximal value which can be specified in textbox (type='number')
		 *
		 * @method setMax
		 * @chainable
		 *
		 * @param {Number} value
		 *
		 * @return Backbone.UI.Textbox Component Object
		 */
		setMax : function(value) {
			this.model.setMax(value);

			return this;
		},

		/**
		 * Sets minimal value which can be specified in textbox (type='number')
		 *
		 * @method setMin
		 * @chainable
		 *
		 * @param {Number} value
		 *
		 * @return Backbone.UI.Textbox Component Object
		 */
		setMin : function(value) {
			this.set('min', value);
		}
	});
}(Backbone, _, jQuery));