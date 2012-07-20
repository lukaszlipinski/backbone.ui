/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var ENTER = Backbone.UI.KEYS.ENTER,
        KEY_UP = Backbone.UI.KEYS.KEY_UP,
        KEY_DOWN = Backbone.UI.KEYS.KEY_DOWN;

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
            }
			else if (value < min) {
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

			this.controller = this.options.controller;

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

			//Apply default settings on the HTML nodes
			this._handleDisabledChange();
		},

        _handleButtonUpClick : function() {
			this.controller._handleButtonUpClick();
        },

        _handleButtonDownClick : function() {
            this.controller._handleButtonDownClick();
        },

        _handleInputBlur : function() {
            this.controller._handleInputBlur(this.$input.val());
        },

        _handleInputKeyPress : function(e) {
            this.controller._handleInputKeyPress(this.$input.val(), e.keyCode, e.ctrlKey, e.shiftKey);
        },

        _handleValueChange : function() {
            //Change value in the HTML
			this.$input.val(this.model.getValue());

			this.controller._handleValueChange();
        },

        _handleRevertChange : function() {
            this.$input.val(this.model.getValue());
        },

        _handleDisabledChange : function() {
            var isDisabled = this.model.isDisabled();

			this.$el.toggleClass('disabled', isDisabled);

            if (isDisabled) {
                this.$input.attr('disabled', 'disabled');
            }
			else {
                this.$input.removeAttr('disabled');
            }
        },

        destroy : function() {
            this.$el.off('.spinner');
            this.model.off(null, null, this);
        }
    });

	/**
	 * Controller
	 */
    Backbone.UI.Spinner = Backbone.UI.ComponentController.extend({
		initialize : function() {
			var settings = this.options.settings,
				type = settings.type;

			if (!default_settings['type_' + settings.type]) {
				throw "Unsupported Backbone.UI.Spinner type";
			}

			this.model = new SpinnerModel(_.extend({tabindex : Backbone.UI.getNextTabIndex()}, default_settings['type_' + settings.type], settings));

			this.view = new SpinnerView({
				el : this.$el,
				model : this.model,
				controller : this
			});
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

		_handleInputBlur : function(value) {
			this.model.setValue(value, true);
        },

		_handleInputKeyPress : function(value, key, ctrl, shift) {
			var model = this.model,
                max = model.getMax(), min = model.getMin(),
                restricted_max = max === Infinity || max === -Infinity,
                restricted_min = min === Infinity || min === -Infinity;

            if (model.isDisabled()) {
                return;
            }

            if (key === ENTER) {
                model.setValue(value);
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

		_handleValueChange : function() {
			var model = this.model,
				value = model.getValue(),
                previousValue = model.getPreviousValue();

            this.trigger('sp:change:value', this, value, previousValue);
        },

		/**
		 * Sets value of spinner
		 *
		 * @param {Number} value
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		setValue : function(value) {
			this.model.setValue(value);

			return this;
		},

		/**
		 * Returns value of spinner
		 *
		 * @return {Number}
		 */
		getValue : function() {
			return this.model.getValue();
		},

		/**
		 * Increases value of spinner by predefined step
		 *
		 * @param {Number} multiplier   amount the value is multilpied by
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		stepUp : function(multiplier) {
			this.model.stepUp(multiplier);

			return this;
		},

		/**
		 * Decreases value of spinner by predefined step
		 *
		 * @param {Number} multiplier   amount the value is multilpied by
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		stepDown : function(multiplier) {
			this.model.stepDown(multiplier);

			return this;
		},

		/**
		 * Sets maximal allowed value in spinner
		 *
		 * @param {Number} value
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		setMax : function(value) {
			this.model.setMax(value);

			return this;
		},

		/**
		 * Returns maximal allowed value in spinner
		 *
		 * @return {Number}
		 */
		getMax : function() {
			return this.model.getMax();
		},

		/**
		 * Sets minimal allowed value in spinner
		 *
		 * @param {Number} value
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		setMin : function(value) {
			this.model.setMin(value);

			return this;
		},

		/**
		 * Returns minimal allowed value in spinner
		 *
		 * @return {Number}
		 */
		getMin : function() {
			return this.model.getMin();
		},

		/**
		 * Enables spinner
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		enable : function() {
			this.model.enable();

			return this;
		},

		/**
		 * Disables spinner
		 *
		 * @return {Object} Backbone.UI.Spinner
		 */
		disable : function() {
			this.model.disable();

			return this;
		},

		/**
		 * Destroys spinner
		 */
		destroy : function() {
			this.view.destroy();
			this.view = null;
			this.model = null;
		}
	});
}(Backbone, _, jQuery));