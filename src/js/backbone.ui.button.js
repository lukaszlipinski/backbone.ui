/*globals Backbone, _, jQuery */

/**
 * Backbone.UI Button Component
 *
 * @module Backbone.UI
 * @submodule Backbone.UI.Button
 * @namespace Backbone.UI
 *
 * Extends standard functionality of link or button elements.
 *
 * @param settings
 *     @property {String} caption     a string which is displayed in the button
 *     @property {Boolean} disabled   determinates if component reacts on user's actions
 *     @property {String} template    template string
 *     @property {Boolean} toggle     when this property is true, 'state' changes
 *								      every time when button is clicked additionaly
 *                                    special events are triggered
 *     @property {Boolean} state      determinates the current state of button,
 *                                    as default is 'true' and doesn't change if
 *                                    the 'toggle' property is not set to true
 *
 * Triggered events:
 * - btn:click        triggered every time when button is clicked
 * - btn:click:even   triggered only 'even' times (state = true)
 * - btn:click:odd    triggered only 'odd' times (state = false)
 *
 * CSS Classes:
 * - ui-btn-disabled   applied on root node when component is disabled
 * - ui-btn-active     applied on root node when 'state' property is set to true
 *
 * JS Classes:
 * - js-btn-caption    determinates position of buttons's caption node
  *
 * @uses Backbone
 * @uses _
 * @uses $
 */

(function(Backbone, _, $) {
	"use strict";

	var classes = {
		events : {
			main : '.button'
		},

		triggers : {
			click : 'btn:click',
			clickEven : 'btn:click:even',
			clickOdd : 'btn:click:odd'
		},

		ui : {
			disabled : 'ui-btn-disabled',
			active : 'ui-btn-active'
		},

		js : {
			caption : '.js-btn-caption'
		}
	};

	var buttonViewEvents = {};
		buttonViewEvents['click' + classes.events.main] = '_handleClickEvent';
		buttonViewEvents['touchend' + classes.events.main] = '_handleClickEvent';

	/**
	 * Button Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var ButtonModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : '',
			disabled : false,
			template : '#tpl_button',
			toggle : false,
			state : true
		},

		/**
		 * Sets state
		 *
		 * @method setState
		 *
		 * @param {Boolean} value
		 */
		setState : function(value) {
			this.set('state', value);
		},

		/**
		 * Gets state
		 *
		 * @method getState
		 *
		 * @return {Boolean}
		 */
		getState : function() {
			return this.get('state');
		},

		/**
		 * Toggles state
		 *
		 * @method toggleState
		 */
		toggleState : function() {
			this.set('state', !this.get('state'));
		},

		/**
		 * Determinates whether button is togglable or not
		 *
		 * @method isTogglable
		 *
		 * @return {Boolean}
		 */
		isTogglable : function() {
			return this.get('toggle');
		},

		/**
		 * Sets caption of button
		 *
		 * @method setCaption
		 *
		 * @param {String} value
		 */
		setCaption : function(value) {
			this.set('caption', value);
		},

		/**
		 * Gets button's caption
		 *
		 * @method getCaption
		 *
		 * @return {String}
		 */
		getCaption : function() {
			return this.get('caption');
		}
	});

	/**
	 * Button View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var ButtonView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,
		$caption : null,

		events : buttonViewEvents,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:disabled', this._handleDisabledChange, this);
			model.on('change:state', this._handleStateChange, this);
			model.on('change:caption', this._handleCaptionChange, this);

			this.template = this.getTemplate();

			//Prepare elements
			this.$caption = this.$el.find(classes.js.caption);

			this.render();
		},

		render : function() {
			this._handleCaptionChange();
			this._handleDisabledChange();
			this._handleStateChange();
		},

		/**
		 * Event handlers
		 */
		_handleCaptionChange : function() {
			var model = this.model, $caption = this.$caption;

			if ($caption.length) {
				$caption.html(model.getCaption());
			}
			else {
				this.$el.html(this.template(model.toJSON()));
			}
		},

		_handleClickEvent : function() {
			this.controller._handleClickEvent();
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(classes.ui.disabled, this.model.isDisabled());
		},

		_handleStateChange : function() {
			this.$el.toggleClass(classes.ui.active, this.model.getState());
		}
	});

	/**
	 * Button Controller
	 *
	 * @class Backbone.UI.Button
	 * @extends Backbone.UI.ComponentController
	 */
	Backbone.UI.Button = Backbone.UI.ComponentController.extend({
		/**
		 * @method initialize
		 * @private
		 */
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new ButtonModel(settings);

			//View
			this.view = new ButtonView({
				el : this.$el,
				model : this.model,
				controller : this
			});
		},

		/**
		 * @method _handleClickEvent
		 * @private
		 */
		_handleClickEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			//Thigger common event
			this.trigger(classes.triggers.click, this);

			if (model.isTogglable()) {
				this.trigger(model.getState() ? classes.triggers.clickEven : classes.triggers.clickOdd, this);

				model.toggleState();
			}
		},

		/**
		 * Sets caption of button
		 *
		 * @method setCaption
		 * @chainable
		 *
		 * @param {String} value
		 * @return Backbone.UI.Button Component Object
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		},

		/**
		 * Gets state
		 *
		 * @method getState
		 *
		 * @return {Boolean}
		 */
		getState : function() {
			return this.model.getState();
		},

		/**
		 * Sets state
		 *
		 * @method setState
		 * @chainable
		 *
		 * @param {Boolean} value
		 * @return Backbone.UI.Button Component Object
		 */
		setState : function(value) {
			this.model.setState(value);

			return this;
		}
	});
}(Backbone, _, jQuery));