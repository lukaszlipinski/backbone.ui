/*globals Backbone, _, jQuery */

/**
 * Backbone UI
 *
 * Provides customizable components
 *
 * @module Backbone.UI
 * @namespace Backbone
 * @class UI
 *
 * @uses Backbone
 * @uses _
 * @uses $
 */
(function(Backbone, _, $) {
	"use strict";

	var tabindex = 0,
	listindex = 0;

	Backbone.UI = Backbone.UI || {
		getNextTabIndex : function() {
			return ++tabindex;
		},

		getNextListIndex : function() {
			return ++listindex;
		}
	};

	Backbone.UI.KEYS = {
		ENTER : 13,
		KEY_UP : 38,
		KEY_DOWN : 40
	};

	/**
	 * Backbone.UI Component Model Class
	 *
	 * Provides basic methods for all component's models
	 *
	 * @namespace Backbone.UI
	 * @subclass ComponentModel
	 * @extends Backbone.Model
	 */
	Backbone.UI.ComponentModel = Backbone.Model.extend({
		defaults : {
			disabled : false,
			template : ''
		},

		/**
		 * Returns template
		 *
		 * @method getTemplate
		 * @return {String}
		 */
		getTemplate : function() {
			return this.get('template');
		},

		/**
		 * Enables component's interaction with users
		 *
		 * @method enable
		 */
		enable : function() {
			this.set('disabled', false);
		},

		/**
		 * Checks if component is enabled
		 *
		 * @method isEnabled
		 * @return {Boolean}
		 */
		isEnabled : function() {
			return !this.get('disabled');
		},

		/**
		 * Disables component's interaction with users
		 *
		 * @method disable
		 */
		disable : function() {
			this.set('disabled', true);
		},

		/**
		 * Checks if component is disabled
		 *
		 * @method isDisabled
		 * @return {Boolean}
		 */
		isDisabled : function() {
			return this.get('disabled');
		}
	});

	/**
	 * Backbone.UI Component View Class
	 *
	 * Provides basic methods for all component's views
	 *
	 * @namespace Backbone.UI
	 * @subclass ComponentView
	 * @extends Backbone.View
	 */
	Backbone.UI.ComponentView = Backbone.View.extend({
		/**
		 * Returns precompiled template
		 *
		 * @method getTemplate
		 * @param {String} template
		 * @return {String}
		 */
		getTemplate : function(template) {
			var tmpl = $(template || this.model.getTemplate()).html();

			if (!tmpl) {
				throw "Please specify template";
			}

			return _.template(tmpl, null, {
				variable: 'data'
			});
		},

		/**
		 * Cleans up enviroment when view is being destoryed
		 *
		 * @private
		 */
		_destroy : function() {
			this.$el.off(this.componentClassName);
			this.model.off(null, null, this);
			this.controller.off(null, null, this);

			if (typeof this.destroy === 'function') {
				this.destroy();
			}
		}
	});

	/**
	 * Backbone.UI Component Controller Class
	 *
	 * Provides basic methods for all component's controllers
	 *
	 * @namespace Backbone.UI
	 * @subclass ComponentController
	 * @extends Backbone.View
	 */
	Backbone.UI.ComponentController = Backbone.View.extend({
		/**
		 * Enables component's interaction with users
		 *
		 * @method enable
		 *
		 * @return {Object} Backbone.UI Component Object
		 * @chainable
		 */
		enable : function() {
			this.model.enable();

			return this;
		},

		/**
		 * Disables component's interaction with users
		 *
		 * @method disable
		 *
		 * @return {Object} Backbone.UI Component Object
		 * @chainable
		 */
		disable : function() {
			this.model.disable();

			return this;
		},

		/**
		 * Destroys component
		 *
		 * @method destory
		 */
		destroy : function() {
			this.view._destroy();
			this.view = null;
			this.model = null;
		}
	});
}(Backbone, _, jQuery));