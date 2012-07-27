/*globals Backbone, _, jQuery */

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

	Backbone.UI.ComponentModel = Backbone.Model.extend({
		defaults : {
			disabled : false,
			template : ''
		},

		getTemplate : function() {
			return this.get('template');
		},

		enable : function() {
			this.set('disabled', false);

			return this;
		},

		isEnabled : function() {
			return !this.get('disabled');
		},

		disable : function() {
			this.set('disabled', true);

			return this;
		},

		isDisabled : function() {
			return this.get('disabled');
		}
	});

	Backbone.UI.ComponentView = Backbone.View.extend({
		getTemplate : function(template) {
			var tmpl = $(template || this.model.getTemplate()).html();

			if (!tmpl) {
				throw "Please specify template";
			}

			return _.template(tmpl, null, {variable: 'data'});
		},

		_destroy : function() {
			this.$el.off(this.componentClassName);
			this.model.off(null, null, this);
			this.controller.off(null, null, this);

			if (typeof this.destroy === 'function') {
				this.destroy();
			}
		}
	});

	Backbone.UI.ComponentController = Backbone.View.extend({
		/**
		 * Enables component
		 *
		 * @return {Object} Backbone.UI.Component
		 */
		enable : function() {
			this.model.enable();

			return this;
		},

		/**
		 * Disables component
		 *
		 * @return {Object} Backbone.UI.Component
		 */
		disable : function() {
			this.model.disable();

			return this;
		},

		/**
		 * Destroys component
		 */
		destroy : function() {
			this.view._destroy();
			this.view = null;
			this.model = null;
		}
	});
}(Backbone, _, jQuery));