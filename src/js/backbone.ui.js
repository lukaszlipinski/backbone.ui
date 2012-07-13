/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var tabindex = 0;

    Backbone.UI = Backbone.UI || {

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

    });

	Backbone.UI.ComponentController = Backbone.View.extend({
		getTemplate : function() {
			var template = $(this.model.getTemplate()).html();
			return _.template(template, null, {variable: 'data'});
		}
	});

	/*Function.prototype.inherits = function(F) {
		this.prototype = new F;
		this.prototype.constructor = this;
		this.prototype.parent = F.prototype;
	};*/
}(Backbone, _, jQuery));


