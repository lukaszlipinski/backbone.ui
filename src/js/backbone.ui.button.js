/*globals Backbone, _, jQuery */

/**
 * Extends standard functionality of the link or button elements.
 *
 * @param settings
 *     @param {String} caption     a string which is displayed in the button
 *     @param {Boolean} disabled   determinates if component reacts on user's actions
 *     @param {String} template    determinates template source
 *     @param {Boolean} toggle     when this property is true, 'state' changes
 *				   every time when button is clicked additionaly
 *				   special events are triggered
 *     @param {Boolean} state      determinates the current state of the button.
 *				   As default is 'true' (firing events starts
 *				   with 'event') and doesn't change if the
 *				   'toggle' property is not set to 'true'
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
    var ButtonModel = Backbone.UI.ComponentModel.extend({
        defaults : {
            caption : '',
            disabled : false,
            template : '#tpl_button',
            toggle : false,
            state : true
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
        }
    });

    /**
     * View
     */
    var ButtonView = Backbone.UI.ComponentView.extend({
        className : '.button',
        $caption : null,

        events : {
            'click.button' : '_handleClickEvent',
            'touchend.button' : '_handleClickEvent'
        },

        initialize : function() {
            var model = this.model;

            this.controller = this.options.controller;

            model.on('change:disabled', this._handleDisabledChange, this);
            model.on('change:state', this._handleStateChange, this);
            model.on('change:caption', this._handleCaptionChange, this);

            this.template = this.controller.getTemplate();

            //Prepare elements
            this.$caption = this.$el.find('.btn-caption');

            this.render();
        },

        render : function() {
            this._handleCaptionChange();
            this._handleDisabledChange();
            this._handleStateChange();
        },

        _handleCaptionChange : function() {
            var model = this.model, $caption = this.$caption;

            if ($caption.length) {
                $caption.html(model.getCaption());
            }
            else {
                this.$el.html(this.template(model.toJSON()));
            }
        },

        _handleClickEvent : function() {
            this.controller._handleClickEvent();
        },

        _handleDisabledChange : function() {
            this.$el.toggleClass('disabled', this.model.isDisabled());
        },

        _handleStateChange : function() {
            this.$el.toggleClass("active", this.model.getState());
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

        _handleClickEvent : function() {
            var model = this.model;

            if (model.isDisabled()) {
                return;
            }

            //Thigger common event
            this.trigger('btn:click', this);

            if (model.isToggled()) {
                this.trigger("btn:click:" + (model.getState() ? "even" : "odd"), this);

                model.toggleState();
            }
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
        }
    });
}(Backbone, _, jQuery));