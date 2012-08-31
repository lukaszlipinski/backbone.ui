/*globals Backbone, _, jQuery */

/**
 * It's a component with input and two buttons which allows to increment
 * or decrement value by some amount which can be determinated as a 'step'.
 * It also allows to change value directly in the input field. The value can
 * be limited by 'max' and 'min' settings
 *
 * @param params
 *    @property {Number} value       value of the spinner
 *    @property {Number} step        determinates step which will be take after click on button
 *    @property {Number} max         determinates maximal value which can be stored in the component
 *    @property {Number} min         determinates minimal value which can be stored in the component
 *    @property {Boolean} disabled   determinates if component reacts on user's actions
 *    @property {String} type        determinates how spinner will interprete values
 *	      Possible values:
 *        - 'integer'   treats all values as intergers
 *        - 'float'     treats all values as floats
 *    @property {String} template    determinates template source
 *	  @property {Number} tabIndex    determinates the HTML tabindex attribute
 *
 * Triggered events:
 * - sp:change:value    triggered when value was changed
 * - sp:change:max      triggered when max setting is changed
 * - sp:change:min      triggered when min setting is changed
 *
 * Css classes:
 * - ui-sp-disabled   applied when component is disabled
 *
 * JS classes
 * - js-sp-input      input html node
 * - js-sp-btn-up     button up html node
 * - js-sp-btn-down   button down html node
 */

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

	var classes = {
		events : {
			main : '.spinner'
		},

		triggers : {
			revertValue : 'sp:revert:value',
			changeValue : 'sp:change:value',
			changeMax : 'sp:change:max',
			changeMin : 'sp:change:min'
		},

		ui : {
			disabled : 'ui-sp-disabled'
		},

		js : {
			input : '.js-sp-input',
			buttonUp : '.js-sp-btn-up',
			buttonDown : '.js-sp-btn-down'
		}
	};

	var spinnerViewEvents = {};
		spinnerViewEvents['click' + classes.events.main + ' ' + classes.js.buttonUp] = '_handleButtonUpClickEvent';
		spinnerViewEvents['click' + classes.events.main + ' ' + classes.js.buttonDown] = '_handleButtonDownClickEvent';
		spinnerViewEvents['blur' + classes.events.main + ' ' + classes.js.input] = '_handleInputBlurEvent';
		spinnerViewEvents['keypress' + classes.events.main + ' ' + classes.js.input] = '_handleInputKeyPressEvent';

	var SpinnerModel = Backbone.UI.ComponentModel.extend({
		defaults : {
			template : '#tpl_spinner',
			disabled : false,
			tabIndex : 1
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
				this.trigger(classes.triggers.revertValue, this.controller);
			}
		},

		getType : function() {
			return this.get('type');
		},

		setType : function(value) {
			this.set('type', value);
		},

		getStep : function() {
			return this.get('step');
		},

		setStep : function(value) {
			this.set('step', value);
		},

		getMax : function() {
			return this.get('max');
		},

		setMax : function(max) {
			var value = this.getValue();

			//Set new max
			this.set('max', max);

			if (value > max) {
				this.setValue(max);
			}
		},

		getMin : function() {
			return this.get('min');
		},

		setMin : function(min) {
			var value = this.getValue();

			//Set new min
			this.set('min', min);

			if (value < min) {
				this.setValue(min);
			}
		},

		setValue : function(value, silent) {
			this._changeValue(value, 0, 1, silent);
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
		},

		stepDown : function(multiplier) {
			var step = this.getStep();

			step *= multiplier || 1;

			this._changeValue(this.getValue(), step, -1);
		}
	});

	var SpinnerView = Backbone.UI.ComponentView.extend({
		componentClassName : classes.events.main,

		$input : null,

		events : spinnerViewEvents,

		initialize : function() {
			var model = this.model;

			this.controller = this.options.controller;

			model.on('change:disabled', this._handleDisabledChange, this);
			model.on('change:value', this._handleValueChange, this);
			model.on(classes.triggers.revertValue, this._handleRevertChange, this);

			this.template = this.getTemplate();

			this.render();
		},

		render : function() {
			this.$el.html(this.template(this.model.toJSON()));

			this.$input = this.$el.find(classes.js.input);

			if (!this.$input.is('input')) {
				throw "Skin should contain 'input' HTMLElement.";
			}

			//Apply default settings on the HTML nodes
			this._handleDisabledChange();
		},

		_handleButtonUpClickEvent : function() {
			this.controller._handleButtonUpClickEvent();
		},

		_handleButtonDownClickEvent : function() {
			this.controller._handleButtonDownClickEvent();
		},

		_handleInputBlurEvent : function() {
			this.controller._handleInputBlurEvent(this.$input.val());
		},

		_handleInputKeyPressEvent : function(e) {
			this.controller._handleInputKeyPressEvent(this.$input.val(), e.keyCode, e.ctrlKey, e.shiftKey);
		},

		_handleValueChange : function() {
			//Change value in the HTML
			this.$input.val(this.model.getValue());
		},

		_handleRevertChange : function() {
			this.$input.val(this.model.getValue());
		},

		_handleDisabledChange : function() {
			var isDisabled = this.model.isDisabled();

			this.$el.toggleClass(classes.ui.disabled, isDisabled);

			if (isDisabled) {
				this.$input.attr('disabled', 'disabled');
			}
			else {
				this.$input.removeAttr('disabled');
			}
		}
	});

	/**
	 * Controller
	 */
	Backbone.UI.Spinner = Backbone.UI.Component.extend({
		initialize : function() {
			var settings = this.options.settings,
				type = settings.type;

			if (!default_settings['type_' + settings.type]) {
				throw "Unsupported Backbone.UI.Spinner type";
			}

			//Model
			this.model = new SpinnerModel(_.extend({tabIndex : Backbone.UI.getNextTabIndex()}, default_settings['type_' + settings.type], settings));

			//View
			this.view = new SpinnerView({
				el : this.$el,
				model : this.model,
				controller : this
			});

			//Events
			this.model.on('change:value', this._handleValueChange, this);
			this.model.on('change:max', this._handleMaxChange, this);
			this.model.on('change:min', this._handleMinChange, this);
		},

		_handleButtonUpClickEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			model.stepUp();
		},

		_handleButtonDownClickEvent : function() {
			var model = this.model;

			if (model.isDisabled()) {
				return;
			}

			model.stepDown();
		},

		_handleInputBlurEvent : function(value) {
			this.model.setValue(value, true);
		},

		_handleInputKeyPressEvent : function(value, key, ctrl, shift) {
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
			var model = this.model;

			this.trigger(classes.triggers.changeValue, this, model.getValue(), model.getPreviousValue());
		},

		_handleMaxChange : function() {
			this.trigger(classes.triggers.changeMax, this, this.model.getMax());
		},

		_handleMinChange : function() {
			this.trigger(classes.triggers.changeMin, this, this.model.getMin());
		},

		/**
		 * Public methods
		 */

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
		}
	});
}(Backbone, _, jQuery));