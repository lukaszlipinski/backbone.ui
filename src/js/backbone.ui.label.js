/*globals Backbone, _, jQuery */

/**
 * Extends standard functionality of label HTMLElement
 *
 * @param settings
 *     @param {String} caption     a string which is displayed in label
 *     @param {Boolean} disabled   determinates if component reacts on user's actions
 */

(function(Backbone, _, $) {
	"use strict";

	var classes = {
		events : {
			main : '.label'
		},

		ui : {
			disabled : 'ui-lbl-disabled'
		}
	};

	/**
	 * Model
	 */
	var LabelModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : 'Default caption',
			disabled : false,
			template : '#tpl_label'
		},

		setCaption : function(value) {
			this.set('caption', value);

			return this;
		},

		getCaption : function() {
			return this.get('caption');
		}
	});

	/**
	 * View
	 */
	var LabelView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;
			this.template = this.getTemplate();

			model.on('change:caption', this._handleCaptionChange, this);
			model.on('change:disabled', this._handleDisabledChange, this);

			this.render();
		},

		render : function() {
			this.$el.html(this.template({
				caption : this.model.getCaption()
			}));

			this._handleDisabledChange();
		},

		_handleCaptionChange : function() {
			this.render();
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(classes.ui.disabled, this.model.isDisabled());
		}
	});

	/**
	 * Controller
	 */
	Backbone.UI.Label = Backbone.UI.ComponentController.extend({
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new LabelModel(settings);

			//View
			this.view = new LabelView({
				el : this.$el,
				model : this.model,
				controller : this
			});
		},

		/**
		 * Public methods
		 */

		/**
		 * Sets new caption to label
		 *
		 * @param {String}   new caption string
		 *
		 * @return {Object} Backbone.UI.Label
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		}
	});
}(Backbone, _, jQuery));