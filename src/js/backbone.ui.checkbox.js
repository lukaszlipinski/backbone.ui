/*globals Backbone, _, jQuery */

/**
 * Extends standard functionality of input[type='check']
 *
 * @param settings
 *     @param {String} caption     derteminates checkbox caption
 *     @param {Boolean} disabled   determinates if component reacts on user's actions or not
 *     @param {String} template    determinates template source
 *     @param {Boolean} checked    determinates if checkbox is checked or not
 *
 * Triggered events:
 * - cbx:change:checked    fired when 'checked' state is changed
 */

(function(Backbone, _, $) {
	"use strict";

	/**
	 * Model
	 */
	var CheckboxModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : 'Default Checkbox',
			disabled : false,
			template : '#tpl_checkbox',
			checked : false
		},

		isChecked : function() {
			return this.get('checked');
		},

		getChecked : function() {
			return this.get('checked');
		},

		setChecked : function(value) {
			return this.set('checked', value);
		},

		toggleChecked : function() {
			this.set('checked', !this.getChecked());
		}
	});

	/**
	 * View
	 */
	var CheckboxView = Backbone.UI.ComponentView.extend({
		componentClassName : '.checkbox',

		events : {
			'click.checkbox' : '_handleClickEvent'
		},

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:disabled', this._handleDisabledChange, this);
			model.on('change:checked', this._handleCheckedChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			var model = this.model;

			this.$el.html(this.template(model.toJSON()));

			this._handleDisabledChange();
			this._handleCheckedChange();
		},

		_handleClickEvent : function() {
			this.controller._handleClickEvent();
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass('disabled', this.model.isDisabled());
		},

		_handleCheckedChange : function() {
			this.$el.toggleClass('checked', this.model.isChecked());

			this.controller._handleCheckedChange();
		}
	});

	/**
	 * Controller
	 */
	Backbone.UI.Checkbox = Backbone.UI.ComponentController.extend({
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
		},

		_handleClickEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			this.model.toggleChecked();
		},

		_handleCheckedChange : function() {
			this.trigger('cbx:change:checked', this, this.model.getChecked());
		},

		/**
		 * Public methods
		 */

		/**
		 * Returns information whether checkbox is checked or not
		 *
		 * @return {Boolean}
		 */
		getChecked : function() {
			return this.model.getChecked();
		},

		/**
		 * Checks or unchecks checkbox
		 *
		 * @param {Boolean} value
		 *
		 * @return {Object} Backbone.UI.Checkbox
		 */
		setChecked : function(value) {
			this.model.setChecked(value);

			return this;
		},

		/**
		 * Toggle check
		 *
		 * @return {Object} Backbone.UI.Checkbox
		 */
		toggleChecked : function() {
			this.model.toggleChecked();

			return this;
		}
	});
}(Backbone, _, jQuery));