/*globals Backbone, _, jQuery */

/**
 * Label Component
 *
 * Extends standard functionality of label HTMLElement
 *
 * @param settings
 *     @property {String} caption     a string which is displayed in label
 *     @property {Boolean} disabled   determinates if component reacts on user's actions
 *     @property {String} template    template string
 *
 * @module Backbone.UI
 * @submodule Backbone.UI.Label
 * @namespace Backbone.UI
 * @class Label
 *
 * @uses Backbone
 * @uses _
 * @uses $
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
	 * Label Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var LabelModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : 'Default caption',
			disabled : false,
			template : '#tpl_label'
		},

		/**
		 * Sets caption of label
		 *
		 * @method setCaption
		 * @param {String} value   caption string
		 *
		 * @return {Object} Backbone.UI.Label Component Object
		 * @chainable
		 */
		setCaption : function(value) {
			this.set('caption', value);

			return this;
		},

		/**
		 * Gets caption of label
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
	 * Label View
	 *
	 * @extends Backbone.UI.ComponentView
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
	 * Label Controller
	 *
	 * @extends Backbone.UI.ComponentController
	 */
	Backbone.UI.Label = Backbone.UI.ComponentController.extend({
		/**
		 * @method initialize
		 * @private
		 */
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
		 * Sets caption of label
		 *
		 * @method setCaption
		 * @param {String} value   caption string
		 *
		 * @return {Object} Backbone.UI.Label Component Object
		 * @chainable
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		}
	});
}(Backbone, _, jQuery));