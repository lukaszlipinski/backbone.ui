/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var supported_events = ['btn:click', 'btn:click:even', 'btn:click:odd'];

    var ButtonModel = Backbone.UI.ComponentModel.extend({
	defaults : {
	    caption : '',
	    disabled : false,
	    template : '#tpl_button',
	    toggle : false,
	    state : false
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

    var ButtonView = Backbone.UI.ComponentView.extend({
	events : {
	    'click.button' : '_handleButtonClick',
            'touchend.button' : '_handleButtonClick'
	},

	initialize : function() {
            var model = this.model;

            model.on('change:disabled', this._handleDisabledChange, this);
            model.on('change:state', this._handleActiveChange, this);
            model.on('change:caption', this.render, this);

            this.template = $(model.getTemplate()).html();

	    this.render();
	},

	render : function() {
	    this.$el.html(_.template(this.template, this.model.toJSON(), {variable : 'data'}));

            this._handleDisabledChange();
            this._handleActiveChange();
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

	    model.trigger('btn:click', model);
            model.trigger(event_name, model);
	},

        _handleDisabledChange : function() {
            this.$el.toggleClass('disabled', this.model.isDisabled());
        },

        _handleActiveChange : function() {
            this.$el.toggleClass("active", this.model.getState());
        },

        _destroy : function() {
            this.$el.off('.button');
            this.model.off(null, null, this);
        }
    });

    Backbone.UI.Button = function($el, settings) {
	var model = new ButtonModel(settings);

	var view = new ButtonView({
	    el : $el,
	    model : model
	});

	return model;
    };
}(Backbone, _, jQuery));