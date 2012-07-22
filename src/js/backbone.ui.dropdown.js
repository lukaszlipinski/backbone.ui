/*globals Backbone, _, jQuery */

(function(Backbone, _, $) {
    "use strict";

    /**
     * Models
     */
    var DropdownModel = Backbone.UI.ComponentModel.extend({
        defaults : {
            opened : false,
            value : '',
            openOnClick : true,
            openOnHover : false,
            template : '#tpl_dropdown',
            listPosition : 'right',
            disabled : false,
            initialMessage : '',
            className : '',

            //List Settings
            listTemplate : '#tpl_dropdown_list',
            options : [],
            exclusions : []
        },

        open : function() {
            this.set('opened', true);
        },

        close : function() {
            this.set('opened', false);
        },

        toggleOpened : function() {
            this.set('opened', !this.isOpened());
        },

        isOpened : function() {
            return this.get('opened');
        },

        openOnClick : function() {
            return this.get('openOnClick');
        },

        openOnHover : function() {
            return this.get('openOnHover');
        },

        getListPosition : function() {
            return this.get('listPosition');
        },

        getListTemplate : function() {
            return this.get('listTemplate');
        },

        getValue : function() {
            return this.get('value');
        },

        getOptions : function() {
            return this.get('options');
        },

        getCaption : function() {
            var value = this.getValue(),
                result = _.find(this.getOptions(), function(option) {
                return option.value == value;
            });

            return result ? result.name : '';
        },

        getClassName : function() {
            return this.get('className');
        },

        /**
         * Checks if the value passed as a parameter is excluded or not.
         * (with excluded I mean that whether or not it should be disabled on the list)
         *
         * @param {String|Number} value   the value which have to be checked
         *
         * @return {Boolean}
         */
        isExcluded : function(value) {
            var exclusions = this.get('exclusions'),
                i, l = exclusions.length;

            for (i = 0; i < l; i++) {
                if (exclusions[i] === value) {
                    return true;
                }
            }

            return false;
        }
    });

    /**
     * Views
     */
    var DropdownListView = Backbone.UI.ComponentView.extend({
        componentClassName : '.dropdown-list',
        //unique id for each list
        listindex : Backbone.UI.getNextListIndex(),
        //width of the list directly after initialization
        initialWidth : 0,

        $closeListLayer : null,

        events : {
            //'click.dropdown-list .option' : '_handleClickEvent',
            //'mouseout.dropdown-list' : '_handleMouseOutEvent'
        },

        initialize : function() {
            this.$parent = this.options.$parent;
            this.controller = this.options.controller;

            this.template = this.getTemplate(this.model.getListTemplate());

            this.$el = $(this.template(this.model.toJSON()))
                    .appendTo('body')
                    .attr("id", "dd_list_" + this.listindex);

            this.initialWidth = this.$el.outerWidth(true);
        },

        render : function() {
            this.$el.html(this.template(this.model.toJSON()));
        },

        show : function() {
            var model = this.model,
                $el = this.$el, $parent = this.$parent;

            var listTotalWidth = $el.outerWidth(true), listWidth = $el.width(),
                width = $parent.outerWidth(true), height = $parent.outerHeight(true),
                listPosition = model.getListPosition(), offset = $parent.offset(),
                modTop = height - 1, modLeft = 0,
                newTotalWidth = Math.max(width, this.initialWidth);

            switch(listPosition) {
                case "center":
                    modLeft = -((newTotalWidth - width) / 2);
                    break;
                case "left":
                    //do nothing
                    break;
                case "right":
                    modLeft = width - newTotalWidth;
                    break;
            }

            $el.css({
                top : offset.top + modTop,
                left : offset.left + modLeft,
                marginLeft : 0
            });

            if (listTotalWidth !== newTotalWidth) {
                $el.width(listWidth - (listTotalWidth - newTotalWidth));
            }

            this.createCloseListLayer();

            $parent.addClass('opened');
            $el.addClass('opened');
        },

        hide : function() {
            this.$parent.removeClass('opened');
            this.$el.removeClass('opened');

            this.destroyCloseListLayer();
        },

        /*_handleClickEvent : function() {
            var $target = $(e.currentTarget),
                value = $target.attr("name");

            if (!isExcluded(value)) {
                _self.setValue(value);
                _self.hide();
            }
        },

        _handleMouseOutEvent : function(e) {
            var $target = $(e.relatedTarget);

            if (settings.hover && !$list.find($target).length) {
                    _self.hide();
            }
        },*/

        /**
         * Creates layer which is used to close dropdown when user will click
         * somewhere in the window
         */
        createCloseListLayer : function() {
            var _self = this,
                attr = {
                    position : 'absolute', top : 0, left : 0, right : 0, bottom : 0, zIndex : 19000
                };

            this.$closeListLayer = $('<div class="close_list_layer ' + this.model.getClassName() + '" />').appendTo('body').css(attr).one("click", function() {
                _self.controller._handleCloseListLayerClickEvent();
            });
        },

        /**
         * Destroys layer which is used to close dropdown when user will click
         * somewhere in the window
         */
        destroyCloseListLayer : function() {
            var $closeListLayer = this.$closeListLayer;

            if ($closeListLayer) {
                $closeListLayer.off().remove();
                this.$closeListLayer = null;
            }
        },

        destroy : function() {
            this.$el.off('.dropdown').remove();

            this.destroyCloseListLayer();
        }
    });


    var DropdownView = Backbone.UI.ComponentView.extend({
        componentClassName : '.dropdown',

        $closeListLayer : null,

        events : {
            'click.dropdown' : '_handleClickEvent',
            'mouseover.dropdown' : '_handleMouseOverEvent',
            'mouseout.dropdown' : '_handleMouseOutEvent'
        },

        initialize : function() {
            var model = this.model;

            this.controller = this.options.controller;
            this.template = this.getTemplate();

            this.listView = new DropdownListView({
                $parent : this.$el,
                model : this.model,
                controller : this.controller
            });

            model.on('change:opened', this._handleOpenedChange, this);

            this.render();
        },

        _handleOpenedChange : function(model) {
            this.listView[model.isOpened() ? 'show' : 'hide']();
        },

        render : function() {
            this.$el.html(this.template({
                caption : this.model.getCaption()
            }));
        },

        _handleClickEvent : function(e) {
            this.controller._handleClickEvent();
        },

        _handleMouseOverEvent : function(e) {
            this.controller._handleMouseOverEvent();
        },

        _handleMouseOutEvent : function(e) {
            var $target = $(e.relatedTarget);

            this.controller._handleMouseOutEvent($target, this.$el, this.listView.$el);
        },

        destroy : function() {
            this.listView.destroy();
            this.listView = null;
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
        },

        _handleClickEvent : function() {
            var model = this.model;

            if (!model.isDisabled() && model.openOnClick()) {
                model.toggleOpened();
            }
        },

        _handleMouseOverEvent : function() {
            var model = this.model;

            if (!model.isDisabled() && model.openOnHover()) {
                model.open();
            }
        },

        _handleMouseOutEvent : function($target, $el, $list) {
            var model = this.model;

            if (!model.isDisabled() && model.openOnHover() && !$target.hasClass('close_list_layer')
                && $target !== $list && !$list.find($target).length && $target !== $el && !$el.find($target).length) {
                model.close();
            }
        },

        _handleCloseListLayerClickEvent : function() {
            this.model.close();
        }
    });
}(Backbone, _, jQuery));