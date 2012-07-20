/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    /**
     * Model
     */
    var DropdownModel = Backbone.UI.ComponentModel.extend({
        defaults : {
            value : '',
            openOnClick : true,
            openOnHover : false,
            template : 'tpl_dropdown',
            listPosition : 'right',
            disabled : false,
            options : [],
            exclusions : [],
            initialMessage : '',
            className : ''
        }
    });

    /**
     * View
     */
    var DropdownView = Backbone.UI.ComponentView.extend({
        className : '.dropdown',

        events : {
            'click.button' : '_handleClickEvent'
        },

        initialize : function() {
            var model = this.model;

            this.controller = this.options.controller;

            model.on('change:disabled', this._handleDisabledChange, this);

            this.template = this.controller.getTemplate();

            this.render();
        },

        render : function() {
            /*var model = this.model, $caption = this.$caption;

            if ($caption.length) {
                $caption.html(model.getCaption());
            }
            else {
                this.$el.html(this.template(model.toJSON()));
            }

            this._handleDisabledChange();
            this._handleStateChange();*/
        }
    });

    /**
     * Controller
     */
    Backbone.UI.Dropdown = Backbone.UI.ComponentController.extend({
        initialize : function() {
            var settings = this.options.settings;

            //Model
            this.model = new DropdownModel(settings);

            //View
            this.view = new DropdownView({
                el : this.$el,
                model : this.model,
                controller : this
            });
        }
    });
}(Backbone, _, jQuery));