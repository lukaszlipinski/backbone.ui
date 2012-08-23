/*globals Backbone, _, jQuery */


/**
 *
 * .empty
 * .disabled
 *
 */
(function(Backbone, _, $) {
	"use strict";

	var ENTER = Backbone.UI.KEYS.ENTER;

	var classes = {
		events : {
			main : '.textbox'
		},

		triggers : {
			focused : 'txt:focused',
			changeValue : 'txt:change:value'
		},

		ui : {
			empty : 'ui-txt-empty',
			clear : 'ui-txt-clear',
			disabled : 'ui-txt-disabled',
			error : 'ui-txt-error'
		},

		js : {
			input : '.js-txt-input',
			empty : '.js-txt-empty',
			clear : '.js-txt-clear'
		}
	};

	var textboxViewEvents = {};
		textboxViewEvents['keypress' + classes.events.main + ' ' + classes.js.input] = '_handleInputKeyPressEvent';
		textboxViewEvents['keyup' + classes.events.main + ' ' + classes.js.input] = '_handleInputKeyUpEvent';
		textboxViewEvents['focus' + classes.events.main + ' ' + classes.js.input] = '_handleInputFocusEvent';
		textboxViewEvents['blur' + classes.events.main + ' ' + classes.js.input] = '_handleInputBlurEvent';
		textboxViewEvents['click' + classes.events.main + ' ' + classes.js.empty] = '_handleEmptyMessageClickEvent';
		textboxViewEvents['click' + classes.events.main + ' ' + classes.js.clear] = '_handleClearButtonClickEvent';

	/*

	focus : false,
	selection : false,
	selection_details : null,
	 */

	var TextboxModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			value : null,
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

		validate : function(attr) {
			var value = attr.value, type = this.getType(),
				max, min, regexp;

			if (type === 'text') {
				regexp = this.getRegExp();

				if (regexp) {
					if (!new RegExp(regexp).test(value)) {
						return {msg : "Value didn't match regexp", value : value, suggested : ''};
					}
				}
			}
			else if (type === 'number') {
				value = parseInt(value, 10) || 0;
				max = this.getMax();
				min = this.getMin();

				if (value > max) {
					return {msg : "Value is too big", value : value, suggested : max};
				}

				if (value < min) {
					return {msg : "Value is too small", value : value, suggested : min};
				}
			}
			else {
				throw "Unsupported Backbone.UI.Textbox component type: " + type;
			}

			this.setError(false);
		},

		getMax : function() {
			return this.get('max');
		},

		setMax : function(value) {
			this.set('max', value);
		},

		getMin : function() {
			return this.get('min');
		},

		setMin : function(value) {
			this.set('min', value);
		},

		getRegExp : function() {
			return this.get('regexp');
		},

		correctMistakes : function() {
			return !this.get('invalidMessage');
		},

		getInvalidMessage : function() {
			return this.get('invalidMessage');
		},

		isEmpty : function() {
			var value = this.getValue();

			return value === null || value === '';
		},

		getType : function() {
			return this.get('type');
		},

		setType : function(value) {
			this.set('type', value);
		},

		getValue : function() {
			return this.get('value');
		},

		setValue : function(value, props) {
			props = props || {};

			this.set({value : value}, {silent : props.silent});
		},

		getPreviousValue : function() {
			return this.previous('value');
		},

		getEmptyMessage : function() {
			return this.get('emptyMessage');
		},

		showClearButton : function() {
			return this.get('clearButton');
		},

		liveTypingEnabled : function() {
			return this.get('live');
		},

		getTabIndex : function() {
			return this.get('tabIndex');
		},

		isError : function() {
			return this.get('error');
		},

		setError : function(value) {
			this.set({error : value}, {silent : true});
		}
	});

	var TextboxView = Backbone.UI.ComponentView.extend({
		events : textboxViewEvents,

		componentClassName : classes.events.main,

		liveTypingTimer : null,

		$input : null,
		$empty : null,
		$clear : null,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:value', this._handleValueChange, this);
			model.on('change:disabled', this._handleDisabledChange, this);

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

			this.$input = this.$el.find(classes.js.input);
			this.$empty = this.$el.find(classes.js.empty);
			this.$clear = this.$el.find(classes.js.clear);

			if (!this.$input.is('input')) {
				throw "Skin should contain 'input' HTMLElement.";
			}

			//Apply default settings on the HTML nodes
			this._handleDisabledChange();
			this.checkForEmptyMessage();
			this.checkForClearButton();
			this.checkForErrorMessage();
		},

		checkForEmptyMessage : function() {
			var model = this.model;

			this[model.isEmpty() && !model.isError() ? 'showEmptyMessage' : 'hideEmptyMessage']();
		},

		showEmptyMessage : function() {
			this.$el.addClass(classes.ui.empty);
		},

		hideEmptyMessage : function() {
			this.$el.removeClass(classes.ui.empty);
		},

		checkForClearButton : function() {
			var model = this.model;

			this[model.showClearButton() && !model.isEmpty() ? 'showClearButton' : 'hideClearButton']();
		},

		showClearButton : function() {
			this.$el.addClass(classes.ui.clear);
		},

		hideClearButton : function() {
			this.$el.removeClass(classes.ui.clear);
		},

		_handleValueChange : function() {
			var model = this.model;

			this.$input.val(model.getValue());

			this.checkForEmptyMessage();
			this.checkForClearButton();
			this.checkForErrorMessage();
		},

		checkForErrorMessage : function() {
			this.$el.toggleClass(classes.ui.error, this.model.isError());
		},

		_handleDisabledChange : function() {
			var isDisabled = this.model.isDisabled();

			this.$el.toggleClass(classes.ui.disabled, isDisabled);

			if (isDisabled) {
				this.$input.attr('disabled', 'disabled');
			}
			else {
				this.$input.removeAttr('disabled');
			}
		},

		_handleEmptyMessageClickEvent : function() {
			this.hideEmptyMessage();
			this.$input.focus();
		},

		_handleClearButtonClickEvent : function() {
			this.hideClearButton();

			this.controller._handleClearButtonClickEvent();
		},

		_handleInputBlurEvent : function() {
			this.controller._handleInputBlurEvent(this.$input.val());

			this.checkForEmptyMessage();
		},

		_handleInputFocusEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			this.hideEmptyMessage();

			this.controller.trigger(classes.triggers.focused, this.controller);
		},

		_handleInputKeyUpEvent : function() {
			var model = this.model,
				_self = this;

			if (model.isDisabled()) {
				return;
			}

			if (model.liveTypingEnabled()) {
				window.clearTimeout(this.liveTypingTimer);

				this.liveTypingTimer = window.setTimeout(function() {
					_self.controller._handleLiveTyping(_self.$input.val());
				}, 250);
			}
		},

		_handleInputKeyPressEvent : function(e) {
			this.controller._handleInputKeyPressEvent(e.keyCode, this.$input.val());
		}
	});

	/**
	 * Controller
	 */
	Backbone.UI.Textbox = Backbone.UI.ComponentController.extend({
		initialize : function() {
			var settings = this.options.settings;

			this.model = new TextboxModel(settings);

			this.view = new TextboxView({
				el : this.$el,
				model : this.model,
				controller : this
			});

			//Events
			this.model.on('change:value', this._handleValueChange, this);
			this.model.on('error', this._handleErrorEvent, this);
		},

		_handleValueChange : function() {
			this.trigger(classes.triggers.changeValue, this, this.model.getValue(), this.model.getPreviousValue());
		},

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

		_handleInputBlurEvent : function(value) {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			model.setValue(value);
		},

		_handleClearButtonClickEvent : function() {
			this.model.setValue('');
		},

		_handleLiveTyping : function(value) {
			this.model.setValue(value);
		},

		_handleErrorEvent : function(model, error) {
			//Correct mistake and there is no longer any error
			console.log("error handler ctrl");
			if (model.correctMistakes()) {
				model.setValue(error.suggested, {silent : true});
			}
			else {
				//Set error to 'true' and let user correct form
				console.log("set error true", model);
				model.setError(true);
			}

			//This is kind of workaround
			this.view._handleValueChange();
		},

		setValue : function(value) {
			this.model.setValue(value);

			return this;
		},

		getValue : function() {
			return this.model.getValue();
		}
	});
}(Backbone, _, jQuery));