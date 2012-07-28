/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

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

		getValue : function() {
			return this.get('value');
		},

		setValue : function(value) {
			this.set('value', value);
		}
	});

	var TextboxView = Backbone.UI.ComponentView.extend({
		componentClassName : '.textbox',

		$input : null,

		events : {
			'keypress.textbox .txt-input' : '_handleInputKeyPressEvent',
			'keyup.textbox .txt-input' : '_handleInputKeyUpEvent',
			'focus.textbox .txt-input' : '_handleInputFocusEvent',
			'blur.textbox .txt-input' : '_handleInputBlurEvent',

			'click txt-empty' : '_handleEmptyMessageClickEvent',
			'click txt-clear' : '_handleClearButtonClickEvent'
		},

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:disabled', this._handleDisabledChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			this.$el.html(this.template({
				value : this.model.getValue()
			}));

			this.$input = this.$el.find('.txt-input');

			if (!this.$input.is('input')) {
				throw "Skin should contain 'input' HTMLElement.";
			}

			//Apply default settings on the HTML nodes
			this._handleDisabledChange();
		},

		_handleDisabledChange : function() {
			var isDisabled = this.model.isDisabled();

			this.$el.toggleClass('disabled', isDisabled);

			if (isDisabled) {
				this.$input.attr('disabled', 'disabled');
			}
			else {
				this.$input.removeAttr('disabled');
			}
		},

		_handleEmptyMessageClickEvent : function() {
			//$input.focus();
		},

		_handleClearButtonClickEvent : function() {
			//clearTextbox();
		},

		_handleInputBlurEvent : function() {
			/*if (settings.disabled) {
					return;
				}

				setValue($input.val());*/
		},

		_handleInputFocusEvent : function() {
			/*if (settings.disabled) {
					return;
				}

				$el.trigger("txt:focused", [_self]);

				if (settings.value === '' && settings.initial_message) {
					hideInitialMessage();
				}*/
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

		_handleInputKeyPressEvent : function() {
			/*if (settings.disabled) {
				return;
			}

			//Enter
			if (e.keyCode === 13) {
				setValue($input.val());
			}*/
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
		}
	});
}(Backbone, _, jQuery));