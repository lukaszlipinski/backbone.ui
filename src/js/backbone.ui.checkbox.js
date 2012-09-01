/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

	var component = {
		className : '.checkbox',

		events : {
			view : {
				'click.checkbox' : '_handleClickEvent'
			},
			model : {
				changeCheck : 'change:check',
				changeDisabled : 'change:disabled'
			}
		},

		triggers : {
			/**
			 * Fired when 'check' state is changed
			 *
			 * @event cbx:change:check
			 * @param {Object} Backbone.UI.Checkbox
			 * @param {Boolean} returns 'checked' state
			 */
			changeCheck : 'cbx:change:check'
		},
		classes : {
			ui : {
				disabled : 'ui-cbx-disabled',
				check : 'ui-cbx-check'
			}
		}
	};

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
		 * @protected
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
		 * @protected
		 */
		check : function() {
			this.set('check', true);
		},

		/**
		 * Sets checked state to false
		 *
		 * @method uncheck
		 * @protected
		 */
		uncheck : function() {
			this.set('check', false);
		},

		/**
		 * Reverse check state
		 *
		 * @method toggleCheck
		 * @protected
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
		componentClassName : component.className,

		events : component.events.view,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on(component.events.model.changeDisabled, this._handleDisabledChange, this);
			model.on(component.events.model.changeCheck, this._handleCheckChange, this);

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
		 * UI event handlers
		 */
		_handleClickEvent : function() {
			this.controller._handleClickEvent();
		},

		/**
		 * Model event handlers
		 */
		_handleDisabledChange : function() {
			this.$el.toggleClass(component.classes.ui.disabled, this.model.isDisabled());
		},

		_handleCheckChange : function() {
			this.$el.toggleClass(component.classes.ui.check, this.model.isChecked());
		}
	});

	/**
	 * **Description**
	 *
	 * Backbone.UI.Checkbox component extends standard functionality of input[type='check'] HTMLElement.
	 *
	 * **Additional information**
	 *
	 * CSS classes which are applied on the component depends on the state of component:
	 *
	 *      ui-cbx-disabled   applied on root node when component is disabled
	 *      ui-cbx-check      applied on root node when 'check' property is set to true
	 *
	 * CSS classes which should be specified by developer:
	 *
	 *      none
	 *
	 *
	 * @namespace Backbone.UI
	 * @class Checkbox
	 * @extends Backbone.View
	 * @constructor
	 *
	 * @param el {Object}   jQuery Object
	 * @param settings {Object}   Hash array contains settings which will override default one
	 *     @param {String} settings.caption='Default Checkbox'   derteminates checkbox caption
	 *     @param {Boolean} settings.disabled=false   determinates   if component reacts on user's actions
	 *     @param {String} settings.template='#tpl_checkbox'   determinates template source
	 *     @param {Boolean} settings.check=false   determinates if checkbox is checked or not
	 *
	 * @uses Backbone.js
	 * @uses Underscore.js
	 * @uses jQuery
	 *
	 * @author Łukasz Lipiński
	 */

	Backbone.UI.Checkbox = Backbone.UI.Component.extend({
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
			this.model.on(component.events.model.changeCheck, this._handleCheckChange, this);
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
			this.trigger(component.triggers.changeCheck, this, this.model.isChecked());
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
		 * Sets check state to true
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
		 * Sets check state to false
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