/*globals Backbone, _, jQuery */

/**
 * Extends standard functionality of the link or button elements.
 *
 * @param settings
 *     @param {String} caption     a string which is displayed in the button
 *     @param {Boolean} disabled   determinates if button is responsible to user or not
 *     @param {String} template    determinates template source
 *     @param {Boolean} toggle     when this property is true, 'state' changes
 *								   every time when button is clicked additionaly
 *								   special events are triggered
 *	   @param {Boolean} state      determinates the current state of the button.
 *								   As default is 'false' (firing events starts with 'odd') and doesn't change if the
 *								   'toggle' property is not set to 'true'
 *
 * Triggered events:
 * - btn:click        triggered every time when button is clicked
 * - btn:click:even   triggered only 'even' times (state = false)
 * - btn:click:odd    triggered only 'odd' times (state = true)
 *
 * Css classes:
 * - .btn-caption    determinates position of the caption
 */

(function(Backbone, _, $) {
    "use strict";

	/**
	 * Model
	 */
    var ButtonModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			caption : '',
			disabled : false,
			template : '#tpl_button',
			toggle : false,
			state : false
		},

		initialize : function() {
			this.on('change:disabled', function() {
				this.trigger('model:change:disabled');
			}, this);
			this.on('change:state', function() {
				this.trigger('model:change:state');
			}, this);
			this.on('change:caption', function() {
				this.trigger('model:change:caption');
			}, this);
		},

		setState : function(value) {
			this.set('state', value);

			return this;
		},

		getState : function() {
			return this.get('state');
		},

		toggleState : function() {
			this.set('state', !this.get('state'));

			return this;
		},

        isToggled : function() {
            return this.get('toggle');
        },

        setCaption : function(value) {
			this.set('caption', value);

            return this;
        },

        getCaption : function() {
            return this.get('caption');
        },

		enable : function() {
			this.set('disabled', false);
		},

		disable : function() {
			this.set('disabled', true);
		}
    });

	/**
	 * View
	 */
    var ButtonView = Backbone.UI.ComponentView.extend({
		$caption : null,

		events : {
			'click.button' : '_handleButtonClick',
			'touchend.button' : '_handleButtonClick'
		},

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('model:change:disabled', this._handleDisabledChange, this);
			model.on('model:change:state', this._handleStateChange, this);
			model.on('model:change:caption', this.render, this);

			this.template = this.controller.getTemplate();

			//Prepare elements
			this.$caption = this.$el.find('.btn-caption');

			this.render();
		},

		render : function() {
			var model = this.model, $caption = this.$caption;

			if ($caption.length) {
				$caption.html(model.getCaption());
			}
			else {
				this.$el.html(this.template(model.toJSON()));
			}

			this._handleDisabledChange();
			this._handleStateChange();
		},

		_handleButtonClick : function(e) {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			var event_name = "btn:click" + (model.getState() ? ":even" : ":odd");

			if (model.isToggled()) {
				model.toggleState();
			}

			this.controller.trigger('btn:click', this.controller);
			this.controller.trigger(event_name , this.controller);
		},

        _handleDisabledChange : function() {
            this.$el.toggleClass('disabled', this.model.isDisabled());
        },

        _handleStateChange : function() {
            this.$el.toggleClass("active", this.model.getState());
        },

        destroy : function() {
            this.$el.off('.button');
            this.model.off(null, null, this);
			this.controller.off(null, null, this);
        }
    });

	/**
	 * Controller
	 */
    Backbone.UI.Button = Backbone.UI.ComponentController.extend({
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
		 * Sets new caption to the button
		 *
		 * @param {String}   new caption string
		 *
		 * @return {Object} Backbone.UI.Button
		 */
		setCaption : function(value) {
			this.model.setCaption(value);

			return this;
		},

		/**
		 * Returns current state of the button
		 *
		 * @return {Boolean}
		 */
		getState : function() {
			return this.model.getState();
		},

		/**
		 * Sets button's state
		 *
		 * @param {Boolean} value    new state
		 *
		 * @return {Object} Backbone.UI.Button
		 */
		setState : function(value) {
			this.model.setState(value);

			return this;
		},

		/**
		 * Enables button
		 *
		 * @return {Object} Backbone.UI.Button
		 */
		enable : function() {
			this.model.enable();

			return this;
		},

		/**
		 * Disables button
		 *
		 * @return {Object} Backbone.UI.Button
		 */
		disable : function() {
			this.model.disable();

			return this;
		},

		/**
		 * Destroys component
		 */
		destroy : function() {
			this.view.destroy();
			this.view = null;
			this.model = null;
		}
	});
}(Backbone, _, jQuery));