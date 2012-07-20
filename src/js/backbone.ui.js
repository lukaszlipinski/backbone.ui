/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    var tabindex = 0;

    Backbone.UI = Backbone.UI || {
        getNextTabIndex : function() {
            return ++tabindex;
        }
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
        destroy : function() {
            this.$el.off(this.className);
            this.model.off(null, null, this);
            this.controller.off(null, null, this);
        }
    });

    Backbone.UI.ComponentController = Backbone.View.extend({
        getTemplate : function() {
            var template = $(this.model.getTemplate()).html();

            if (!template) {
                throw "Please specify template";
            }

            return _.template(template, null, {variable: 'data'});
        },

        /**
         * Enables component
         *
         * @return {Object} Backbone.UI.Component
         */
        enable : function() {
            this.model.enable();

            return this;
        },

        /**
         * Disables component
         *
         * @return {Object} Backbone.UI.Component
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