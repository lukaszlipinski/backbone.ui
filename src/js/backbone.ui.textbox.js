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
			disabled : 'ui-txt-disabled'
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
	min : 0,
	max : 10,
	focus : false,
	selection : false,
	selection_details : null,
	 */

	var TextboxModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			value : '',
			type : 'text',
			disabled : false,
			tabIndex : 1,
			template : '#tpl_textbox',
			emptyMessage : '',
			clearTextButton : false,
			live : false,
			regexp : /(.*)/g,
			invalidMsg : ''
		},

		isEmpty : function() {
			return this.getValue() === '';
		},

		withEmptyMessage : function() {
			return this.get('emptyMessage');
		},

		getValue : function() {
			return this.get('value');
		},

		setValue : function(value) {
			this.set('value', value);
		},

		getPreviousValue : function() {
			return this.previous('value');
		}
	});

	var TextboxView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,

		$input : null,
		$empty : null,
		$clear : null,

		events : textboxViewEvents,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:value', this._handleValueChange, this);
			model.on('change:disabled', this._handleDisabledChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			this.$el.html(this.template({
				value : this.model.getValue()
			}));

			this.$input = this.$el.find(classes.js.input);
			this.$empty = this.$el.find(classes.js.empty);
			this.$clear = this.$el.find(classes.js.clear);

			if (!this.$input.is('input')) {
				throw "Skin should contain 'input' HTMLElement.";
			}

			//Apply default settings on the HTML nodes
			this._handleDisabledChange();
		},

		_handleValueChange : function() {
			var model = this.model;

			this.$input.val(model.getValue());

			if (model.isEmpty()) {
				this.$el.addClass(classes.ui.empty);
			}
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
			this.$el.removeClass(classes.ui.empty);
			this.$input.focus();
		},

		_handleClearButtonClickEvent : function() {
			//clearTextbox();
		},

		_handleInputBlurEvent : function() {
			this.controller._handleInputBlurEvent(this.$input.val());
		},

		_handleInputFocusEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			this.$el.removeClass(classes.ui.empty);

			this.controller.trigger(classes.triggers.focused, this.controller);
		},

		_handleInputKeyUpEvent : function() {
			/*if (settings.disabled) {
					return;
				}

				//Show clear message icon
				if (settings.clear_msg_button && ($input.val() || "").length > 0) {
					showClearMessageButton();
					hideInitialMessage();
				}
				else {
					hideClearMessageButton();
				}

				if (settings.live) {
					w.clearTimeout(live_typing_timer);

					live_typing_timer = w.setTimeout(function () {
						setValue($input.val());
					}, 250);
				}*/
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

		setValue : function(value) {
			this.model.setValue(value);

			return this;
		},

		getValue : function() {
			return this.model.getValue();
		}
	});
}(Backbone, _, jQuery));