/*globals Backbone, _, jQuery */

/**
 * Extends standard functionality of the link or button elements.
 *
 * @param settings
 *     @param {String} caption     a string which is displayed in the button
 *     @param {Boolean} disabled   determinates if component reacts on user's actions
 *     @param {String} template    determinates template source
 *     @param {Boolean} toggle     when this property is true, 'state' changes
 *                                 every time when button is clicked additionaly
 *                                 special events are triggered
 *     @param {Boolean} state      determinates the current state of the button.
 *                                 As default is 'true' (firing events starts
 *                                 with 'event') and doesn't change if the
 *                                 'toggle' property is not set to 'true'
 *
 * Triggered events:
 * - btn:click        triggered every time when button is clicked
 * - btn:click:even   triggered only 'even' times (state = true)
 * - btn:click:odd    triggered only 'odd' times (state = false)
 *
 * Css classes:
 * - .btn-caption    determinates position of the caption
 */

(function(Backbone, _, $) {
	"use strict";

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
		componentClassName : '.label',

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
			this.$el.toggleClass('disabled', this.model.isDisabled());
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