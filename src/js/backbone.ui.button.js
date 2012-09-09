/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
	"use strict";

	var component = {
		className : '.button',
		events : {
			view : {
				'click.button' : '_handleClickEvent',
				'touchend.button' : '_handleClickEvent'
			},
			model : {
				changeDisabled : 'change:disabled',
				changeState : 'change:state',
				changeCaption : 'change:caption'
			}
		},
		triggers : {
			/**
			 * Triggered every time when button is clicked
			 *
			 * @event btn:click
			 * @param {Object} Backbone.UI.Button
			 */
			click : 'btn:click',

			/**
			 * Triggered only when 'state' is equal true
			 *
			 * @event btn:click:even
			 * @param {Object} Backbone.UI.Button
			 */
			clickEven : 'btn:click:even',

			/**
			 * Triggered only when 'state' is equal false
			 *
			 * @event btn:click:odd
			 * @param {Object} Backbone.UI.Button
			 */
			clickOdd : 'btn:click:odd'
		},
		classes : {
			ui : {
				disabled : 'ui-btn-disabled',
				active : 'ui-btn-active'
			},

			js : {
				caption : '.js-btn-caption'
			}
		}
	};

	/**
	 * Button Model
	 *
	 * @extends Backbone.UI.ComponentModel
	 */
	var ButtonModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : '',
			disabled : false,
			template : '#tpl_button',
			toggle : false,
			state : true
		},

		/**
		 * Sets state
		 *
		 * @method setState
		 * @protected
		 *
		 * @param {Boolean} value
		 */
		setState : function(value) {
			this.set('state', value);
		},

		/**
		 * Gets state
		 *
		 * @method getState
		 * @protected
		 *
		 * @return {Boolean}
		 */
		getState : function() {
			return this.get('state');
		},

		/**
		 * Toggles state
		 *
		 * @method toggleState
		 * @protected
		 */
		toggleState : function() {
			this.set('state', !this.get('state'));
		},

		/**
		 * Determinates whether button is togglable or not
		 *
		 * @method isTogglable
		 * @protected
		 *
		 * @return {Boolean}
		 */
		isTogglable : function() {
			return this.get('toggle');
		},

		/**
		 * Sets caption of button
		 *
		 * @method setCaption
		 * @protected
		 *
		 * @param {String} value
		 */
		setCaption : function(value) {
			this.set('caption', value);
		},

		/**
		 * Gets button's caption
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
	 * Button View
	 *
	 * @extends Backbone.UI.ComponentView
	 */
	var ButtonView = Backbone.UI.ComponentView.extend({
		componentClassName : component.className,
		$caption : null,

		events : component.events.view,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on(component.events.model.changeDisabled, this._handleDisabledChange, this);
			model.on(component.events.model.changeState, this._handleStateChange, this);
			model.on(component.events.model.changeCaption, this._handleCaptionChange, this);

			this.template = this.getTemplate();

			//Prepare elements
			this.$caption = this.$el.find(component.classes.js.caption);

			this.render();
		},

		render : function() {
			this._handleCaptionChange();
			this._handleDisabledChange();
			this._handleStateChange();
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
		_handleCaptionChange : function() {
			var model = this.model, $caption = this.$caption;

			if ($caption.length) {
				$caption.html(model.getCaption());
			}
			else {
				this.$el.html(this.template(model.toJSON()));
			}
		},

		_handleDisabledChange : function() {
			this.$el.toggleClass(component.classes.ui.disabled, this.model.isDisabled());
		},

		_handleStateChange : function() {
			this.$el.toggleClass(component.classes.ui.active, this.model.getState());
		}
	});

	/**
	 * **Description**
	 *
	 * Backbone.UI.Button component extends standard functionality of link or button elements. 1234567
	 *
	 * **Additional information**
	 *
	 * CSS classes which are applied on the component depends on the state of component:
	 *
	 *     ui-btn-disabled   applied on root node when component is disabled
	 *     ui-btn-active     applied on root node when 'state' property is set to true
	 *
	 * CSS classes which should be specified by developer:
	 *
	 *     js-btn-caption    determinates position of buttons's caption node
	 *
	 * @namespace Backbone.UI
	 * @class Button
	 * @extends Backbone.UI.Component
	 * @constructor
	 *
	 * @param {Object} el   jQuery Object
	 * @param {Object} settings   Hash array contains settings which will override default one
	 *     @param {String} settings.caption=''   a string which is displayed in the button
	 *     @param {Boolean} settings.disabled=false    determinates if component reacts on user's actions
	 *     @param {String} settings.template='#tpl_button' template string or id of element where template is placed
	 *     @param {Boolean} settings.toggle=false   when this property is true, 'state' changes every time
	 *		   when button is clicked; additionaly special events are triggered
	 *     @param {Boolean} settings.state=true   determinates the current state of button, as default is true
	 *	       and doesn't change if the 'toggle' property is not set to true
	 *
	 * @uses Backbone.js
	 * @uses Underscore.js
	 * @uses jQuery
	 *
	 * @author Łukasz Lipiński
	 *
	 * @example
	 *     <!doctype html>
	 *	   <html lang="en">
	 *         <head>
     *             <script type="text/template" id="tpl_button">
	 *                 <!--div class="button" -->
	 *                    <div class="js-btn-caption"><%= data.caption %></div>
	 *                 <!--/div-->
	 *             </script>
	 *         </head>
	 *         <body>
	 *              <div class="btn_example button"></div>
	 *
	 *              <script>
	 *				 //Component initialization
	 *                  var button = new Backbone.UI.Button({
     *                      el : $('.btn_example1'),
     *                      settings : {
     *                          caption : 'First button',
     *                          toggle : true
     *                      }
     *                  }).on("btn:click", function(_btn) {
	 *                      console.log(_btn.getState());
	 *                  });
	 *              </script>
	 *         </body>
	 *     </html>
	 */
	Backbone.UI.Button = Backbone.UI.Component.extend({
		/**
		 * @method initialize
		 * @private
		 */
		initialize : function() {
			var settings = this.options.settings;

			//Model
			this.model = new ButtonModel(settings);

			//View
			this.view = new ButtonView({
				el : this.$el,
				model : this.model,
				controller : this
			});
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

			//Thigger common event
			this.trigger(component.triggers.click, this);

			if (model.isTogglable()) {
				this.trigger(model.getState() ? component.triggers.clickEven : component.triggers.clickOdd, this);

				model.toggleState();
			}
		},

		/**
		 * Sets caption of button
		 *
		 * @method setCaption
		 * @chainable
		 *
		 * @param {String} value
		 * @return Backbone.UI.Button Component Object
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		},

		/**
		 * Gets state
		 *
		 * @method getState
		 *
		 * @return {Boolean}
		 */
		getState : function() {
			return this.model.getState();
		},

		/**
		 * Sets state
		 *
		 * @method setState
		 * @chainable
		 *
		 * @param {Boolean} value
		 * @return Backbone.UI.Button Component Object
		 */
		setState : function(value) {
			this.model.setState(value);

			return this;
		}
	});
}(Backbone, _, jQuery));