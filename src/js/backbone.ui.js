/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

	var tabindex = 0,
		listindex = 0;

	/**
	 * Backbone UI
	 *
	 * Provides customizable components
	 *
	 * @namespace Backbone
	 * @class UI
	 * @module Backbone
	 * @submodule UI
	 * @private
	 *
	 * @uses Backbone.js
	 * @uses Underscore.js
	 * @uses jQuery
	 */
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
	 * Backbone.UI Component Model Class provides basic methods for all
	 * component's models
	 *
	 * @namespace Backbone.UI
	 * @module UI
	 * @submodule ComponentModel
	 * @class ComponentModel
	 * @extends Backbone.Model
	 * @constructor
	 *
	 * @param settings {Object} Hash array which contains all settings
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
	 * Backbone.UI Component View Class provides basic methods for all
	 * component's views
	 *
	 * @namespace Backbone.UI
	 * @module UI
	 * @submodule ComponentView
	 * @class ComponentView
	 * @extends Backbone.View
	 * @constructor
	 *
	 * @param settings {Object} Hash array which contains all settings
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
	 * Backbone.UI Component Class provides basic methods for all
	 * component's constructors
	 *
	 * @namespace Backbone.UI
	 * @module UI
	 * @submodule Component
	 * @class Component
	 * @extends Backbone.View
	 * @constructor
	 *
	 * @param settings {Object} Hash array which contains all settings
	 */
	Backbone.UI.Component = Backbone.View.extend({
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