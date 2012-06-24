/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var supported_events = [];

    var default_settings = {
        type_integer : {
            value : 0,
            step : 500,
            max : Infinity,
            min : 0
        },
        type_float : {
            value : 0,
            step : 500,
            max : Infinity,
            min : 0
        },
        type_time : {
            value : '00:00:00',
            step : '00:30:00',
            max : '240:00:00',
            min : '00:00:00'
        }
    };

    var SpinnerModel = Backbone.Model.extend({
	defaults : {
	    template : '#tpl_spinner',
            disabled : false,
            tabindex : 1
	},

        _changeValue : function(value, step, sign) {
            var type = this.getType();

            //Parse value
            value = type === 'integer'
                ? parseInt(value, 10)
                : (type === 'float' ? parseFloat(value) : value);

            //Change it
            value = type === 'integer'
                ? value + sign * step
                : (type === 'float' ? Math.round((value + sign * step) * 100) / 100 : value);

            return this._checkLimitations(value);
        },

        _checkLimitations : function(value) {
            var max = this.getMax(), min = this.getMin();

            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }

            return value;
        },

        getTemplate : function() {
	    return this.get('template');
	},

        getType : function() {
            return this.get('type');
        },

        getStep : function() {
            return this.get('step');
        },

        getMax : function() {
            return this.get('max');
        },

        getMin : function() {
            return this.get('min');
        },

        setValue : function(value, silent) {
            value = this._checkLimitations(value);

            this.set('value', value, {silent : silent});

            if (!silent) {
                this.trigger('sp:change:value', this);
            }

            return this;
        },

        getValue : function(value) {
            return this.get('value');
        },

        stepUp : function(multiplier) {
            var step = this.getStep();

            step = multiplier ? multiplier * step : step;

            this.setValue(this._changeValue(this.getValue(), step, 1));

            return this;
        },

        stepDown : function(multiplier) {
            var step = this.getStep();

            step = multiplier ? multiplier * step : step;

            this.setValue(this._changeValue(this.getValue(), step, -1));

            return this;
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

    var SpinnerView = Backbone.View.extend({
	$input : null,

        events : {
            'click.spinner .sp-btn-up' : '_handleButtonUpClick',
            'click.spinner .sp-btn-down' : '_handleButtonDownClick'
	},

	initialize : function() {
            var model = this.model;

            model.on('change:disabled', this._handleDisabledChange, this);
            model.on('change:value', this._handleValueChange, this);

            this.template = $(model.getTemplate()).html();

	    this.render();
	},

	render : function() {
	    this.$el.html(_.template(this.template, this.model.toJSON(), {variable : 'data'}));
            this.$input = this.$el.find('.sp-input');
	},

        _handleButtonUpClick : function() {
            var model = this.model;

            if (model.isDisabled()) {
                return;
            }

            model.stepUp();
        },

        _handleButtonDownClick : function() {
            var model = this.model;

            if (model.isDisabled()) {
                return;
            }

            model.stepDown();
        },

        _handleValueChange : function(model) {
            var isInput = this.$input.is('input');

            this.$input[isInput ? 'val' : 'html'](model.getValue());
        },

        _handleDisabledChange : function() {
            this.$el.toggleClass('disabled', this.model.isDisabled());
        },

        destroy : function() {
            this.$el.off('.spinner');
            this.model.off(null, null, this);
        }
    });

    Backbone.UI.Spinner = function($el, settings) {
	var type = settings.type;

        if (!default_settings['type_' + type]) {
            throw "Not supported Spinner type '" + type + "'";
        }

        var model = new SpinnerModel(_.extend({
            tabindex : Backbone.UI.getNextTabIndex(),
            type : type
        }, default_settings['type_' + type], settings));

	var view = new SpinnerView({
	    el : $el,
	    model : model
	});

	return {
            destroy : function() {
                view.destroy();
                view = null;
                model = null;
            }
        };
    };
}(Backbone, _, jQuery));