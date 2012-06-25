/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var ENTER = Backbone.UI.KEYS.ENTER,
        KEY_UP = Backbone.UI.KEYS.KEY_UP,
        KEY_DOWN = Backbone.UI.KEYS.KEY_DOWN;

    var supported_events = ['sp:change:value'];

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
        }
    };

    var SpinnerModel = Backbone.UI.ComponentModel.extend({
	defaults : {
	    template : '#tpl_spinner',
            disabled : false,
            tabindex : 1
	},

        initialize : function() {
            this.on('change:type', this._handleTypeChange, this);
            this.on('change:max', this._handleMaxChange, this);
            this.on('change:min', this._handleMinChange, this);
        },

        _handleTypeChange : function() {
            this.setValue(this.getValue());
        },

        _handleMinChange : function() {
            this.setValue(this.getValue());
        },

        _handleMaxChange : function() {
            this.setValue(this.getValue());
        },

        _changeValue : function(value, step, sign, silent) {
            var currentValue = this.getValue(), type = this.getType(),
                max = this.getMax(), min = this.getMin();

            value = type === 'integer'
                ? parseInt(value, 10) + sign * step
                : (type === 'float'
                    ? Math.round((parseFloat(value) + sign * step) * 100) / 100
                    : value);

            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }

            this.set('value', value, {silent : silent});

            if (currentValue === value) {
                this.trigger('sp:revert:value');
            }
        },

        getType : function() {
            return this.get('type');
        },

        setType : function(value) {
            this.set('type', value);

            return this;
        },

        getStep : function() {
            return this.get('step');
        },

        setStep : function(value) {
            this.set('step', value);

            return this;
        },

        getMax : function() {
            return this.get('max');
        },

        setMax : function(value) {
            this.set('max', value);

            return this;
        },

        getMin : function() {
            return this.get('min');
        },

        setMin : function(value) {
            this.set('min', value);

            return this;
        },

        setValue : function(value, silent) {
            this._changeValue(value, 0, 1, silent);

            return this;
        },

        getValue : function(value) {
            return this.get('value');
        },

        getPreviousValue : function(value) {
            return this.previous('value');
        },

        stepUp : function(multiplier) {
            var step = this.getStep();

            step *= multiplier || 1;

            this._changeValue(this.getValue(), step, 1);

            return this;
        },

        stepDown : function(multiplier) {
            var step = this.getStep();

            step *= multiplier || 1;

            this._changeValue(this.getValue(), step, -1);

            return this;
        }
    });

    var SpinnerView = Backbone.UI.ComponentView.extend({
	$input : null,

        events : {
            'click.spinner .sp-btn-up' : '_handleButtonUpClick',
            'click.spinner .sp-btn-down' : '_handleButtonDownClick',
            'blur.spinner input' : '_handleInputBlur',
            'keypress.spinner input' : '_handleInputKeyPress'
	},

	initialize : function() {
            var model = this.model;

            model.on('change:disabled', this._handleDisabledChange, this);
            model.on('change:value', this._handleValueChange, this);
            model.on('sp:revert:value', this._handleRevertChange, this);

            this.template = $(model.getTemplate()).html();

	    this.render();
	},

	render : function() {
	    this.$el.html(_.template(this.template, this.model.toJSON(), {variable : 'data'}));
            this.$input = this.$el.find('.sp-input');

            if (!this.$input.is('input')) {
                throw "Skin should contain 'input' HTMLElement.";
            }
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

        _handleInputBlur : function() {
            this.model.setValue(this.$input.val(), true);
        },

        _handleInputKeyPress : function(e) {
            var model = this.model,
                key = e.keyCode, ctrl = e.ctrlKey, shift = e.shiftKey,
                max = model.getMax(), min = model.getMin(),
                    restricted_max = max === Infinity || max === -Infinity,
                    restricted_min = min === Infinity || min === -Infinity;

            if (model.isDisabled()) {
                return;
            }

            if (key === ENTER) {
                model.setValue(this.$input.val());
            }
            else if (key === KEY_UP && shift && !restricted_max) {
                model.setValue(max);
            }
            else if (key === KEY_UP && ctrl) {
                model.stepUp(2);
            }
            else if (key === KEY_UP) {
                model.stepUp();
            }
            else if (key === KEY_DOWN && shift && !restricted_min) {
                model.setValue(min);
            }
            else if (key === KEY_DOWN && ctrl) {
                model.stepDown(2);
            }
            else if (key === KEY_DOWN) {
                model.stepDown();
            }
        },

        _handleValueChange : function(model) {
            var value = model.getValue(),
                previousValue = model.getPreviousValue();

            this.$input.val(value);

            this.model.trigger('sp:change:value', this, value, previousValue);
        },

        _handleRevertChange : function() {
            this.$input.val(this.model.getValue());
        },

        _handleDisabledChange : function() {
            var isDisabled = this.model.isDisabled();

            this.$el.toggleClass('disabled', isDisabled);

            if (isDisabled) {
                this.$input.attr('disabled', 'disabled');
            } else {
                this.$input.removeAttr('disabled');
            }
        },

        _destroy : function() {
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

	return model;
    };
}(Backbone, _, jQuery));