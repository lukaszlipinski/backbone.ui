/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

	var component = {
		className : '.label',
		events : {
			model : {
				changeCaption : 'change:caption',
				changeDisabled : 'change:disabled'
			}
		},
		classes : {
			ui : {
				disabled : 'ui-lbl-disabled'
			}
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
		 * @protected
		 *
		 * @param {String} value   caption string
		 */
		setCaption : function(value) {
			this.set('caption', value);
		},

		/**
		 * Gets caption of label
		 *
		 * @method getCaption
		 * @protected
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
		componentClassName : component.className,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;
			this.template = this.getTemplate();

			model.on(component.events.model.changeCaption, this._handleCaptionChange, this);
			model.on(component.events.model.changeDisabled, this._handleDisabledChange, this);

			this.render();
		},

		render : function() {
			this.$el.html(this.template({
				caption : this.model.getCaption()
			}));

			this._handleDisabledChange();
		},

		/**
		 * Model event handlers
		 */
		_handleCaptionChange : function() {
			this.render();
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(component.classes.ui.disabled, this.model.isDisabled());
		}
	});

	/**
	 * **Description**
	 *
	 * Backbone.UI.Label component extends standard functionality of label HTMLElement.
	 *
	 * **Additional information**
	 *
	 * CSS classes which are applied on the component depends on the state of component:
	 *
	 *     ui-lbl-disabled   applied on root node when component is disabled
	 *
	 *
	 * @namespace Backbone.UI
	 * @class Label
	 * @extends Backbone.UI.Component
	 * @constructor
	 *
	 * @param {Object} el   jQuery Object
	 * @param {Object} settings   Hash array contains settings which will override default one
	 *     @param {String} settings.caption='Defaultcaption'   a string which is displayed in label
	 *     @param {Boolean} settings.disabled=false    determinates if component reacts on user's actions
	 *     @param {String} settings.template='#tpl_label' template string or id of element where template is placed
	 *
	 * @uses Backbone.js
	 * @uses Underscore.js
	 * @uses jQuery
	 *
	 * @author Łukasz Lipiński
	 *
	 * @example
	 *
	 *     <!doctype html>
	 *	   <html lang="en">
	 *         <head>
     *             <script type="text/template" id="tpl_button">
	 *                 <!--div class="label" -->
     *                     <%= data.caption %>
     *                 <!--/div-->
	 *             </script>
	 *         </head>
	 *         <body>
	 *              <div class="lbl_example label"></div>
	 *
	 *              <script>
	 *	            //Component initialization
	 *              var label = new Backbone.UI.Label({
	 *                  el : $('.lbl_example'),
	 *                  settings : {
	 *                      caption : 'Hey you!',
	 *                      disabled : false
	 *                  }
	 *              });
	 *              </script>
	 *         </body>
	 *     </html>
	 */
	Backbone.UI.Label = Backbone.UI.Component.extend({
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
		 * @chainable
		 *
		 * @param {String} value   caption string
		 *
		 * @return {Object} Backbone.UI.Label Component Object
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		}
	});
}(Backbone, _, jQuery));