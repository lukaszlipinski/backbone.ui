/*globals Backbone, _, jQuery */

/**
 * Backbone.UI Checkbox Component
 *
 * @module Backbone.UI
 * @submodule Backbone.UI.Checkbox
 * @namespace Backbone.UI
 *
 * Extends standard functionality of input[type='check'] HTMLElement
 *
 * @param settings
 *     @property {String} caption     derteminates checkbox caption
 *     @property {Boolean} disabled   determinates if component reacts on user's actions or not
 *     @property {String} template    determinates template source
 *     @property {Boolean} check      determinates if checkbox is checked or not
 *
 * Triggered events:
 * - cbx:change:check    fired when 'check' state is changed
 *
 * CSS Classes:
 * - ui-cbx-disabled
 * - ui-cbx-check
 *
 * JS Classes:
 * - none
 *
 * @uses Backbone
 * @uses _
 * @uses $
 */

(function(Backbone, _, $) {
	"use strict";

	var classes = {
		events : {
			main : '.checkbox'
		},

		triggers : {
			changeCheck : 'cbx:change:check'
		},

		ui : {
			disabled : 'ui-cbx-disabled',
			check : 'ui-cbx-check'
		}
	};

	var checkboxViewEvents = {};
		checkboxViewEvents['click' + classes.events.main] = '_handleClickEvent';

	/**
	 * Checkbox Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var CheckboxModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : 'Default Checkbox',
			disabled : false,
			template : '#tpl_checkbox',
			check : false
		},

		/**
		 * Retrieves whether the element is in the checked state.
		 *
		 * @method isChecked
		 *
		 * @return {Boolean}
		 */
		isChecked : function() {
			return this.get('check');
		},

		/**
		 * Sets checked state to true
		 *
		 * @method check
		 */
		check : function() {
			this.set('check', true);
		},

		/**
		 * Sets checked state to false
		 *
		 * @method uncheck
		 */
		uncheck : function() {
			this.set('check', false);
		},

		/**
		 * Reverse check state
		 *
		 * @method toggleCheck
		 */
		toggleCheck : function() {
			this.set('check', !this.isChecked());
		}
	});

	/**
	 * Checkbox View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var CheckboxView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,

		events : checkboxViewEvents,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:disabled', this._handleDisabledChange, this);
			model.on('change:check', this._handleCheckChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			var model = this.model;

			this.$el.html(this.template(model.toJSON()));

			this._handleDisabledChange();
			this._handleCheckChange();
		},

		/**
		 * Event handlers
		 */
		_handleClickEvent : function() {
			this.controller._handleClickEvent();
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(classes.ui.disabled, this.model.isDisabled());
		},

		_handleCheckChange : function() {
			this.$el.toggleClass(classes.ui.check, this.model.isChecked());
		}
	});

	/**
	 * Checkbox Controller
	 *
	 * @class Backbone.UI.Checkbox
	 * @extends Backbone.UI.ComponentController
	 */
	Backbone.UI.Checkbox = Backbone.UI.ComponentController.extend({
		/**
		 * @method initialize
		 * @private
		 */
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new CheckboxModel(settings);

			//View
			this.view = new CheckboxView({
				el : this.$el,
				model : this.model,
				controller : this
			});

			//Events
			this.model.on('change:check', this._handleCheckChange, this);
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

			this.model.toggleCheck();
		},

		/**
		 * @method _handleCheckChange
		 * @private
		 */
		_handleCheckChange : function() {
			this.trigger(classes.triggers.changeCheck, this, this.model.isChecked());
		},

		/**
		 * Retrieves whether the element is in the checked state.
		 *
		 * @method isChecked
		 *
		 * @return {Boolean}
		 */
		isChecked : function() {
			return this.model.isChecked();
		},

		/**
		 * Sets checked state to true
		 *
		 * @method check
		 * @chainable
		 */

		/**
		 * Sets checked state to true
		 *
		 * @method check
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Checkbox
		 */
		check : function() {
			this.model.check();

			return this;
		},

		/**
		 * Sets checked state to false
		 *
		 * @method uncheck
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Checkbox
		 */
		uncheck : function() {
			this.model.uncheck();

			return this;
		},

		/**
		 * Reverse check state
		 *
		 * @method toggleCheck
		 * @chainable
		 *
		 * @return {Object} Backbone.UI.Checkbox
		 */
		toggleCheck : function() {
			this.model.toggleCheck();

			return this;
		}
	});
}(Backbone, _, jQuery));