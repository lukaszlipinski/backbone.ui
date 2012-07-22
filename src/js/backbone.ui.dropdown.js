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
            openOnHover : true,
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

        setValue : function(value) {
            this.set('value', value);
        },

        getOptions : function() {
            var options = this.get('options').slice(0), i, l = options.length,
                exclusions = this.get('exclusions'), j, l2 = exclusions.length,
                extendedOptions = [];

            //Go trough all options and check which one are disabled
            for (i = 0; i < l; i++) {
                extendedOptions[i] = options[i];

                for (j = 0; j < l2; j++) {
                    if (extendedOptions[i].value === exclusions[j]) {
                        extendedOptions[i].disabled = true;
                    }
                }
            }

            return extendedOptions;
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
                if (exclusions[i] == value) {
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
        //previous z-index set to the dropdown
        previousZIndex : null,
        //a layer which covers entire screen when dropdown list is opened
        $closeListLayer : null,

        events : {
            'click.dropdown-list .dd-option' : '_handleListOptionClickEvent',
            'mouseout.dropdown-list' : '_handleListMouseOutEvent'
        },

        initialize : function() {
            this.$parent = this.options.$parent;
            this.controller = this.options.controller;

            this.template = this.getTemplate(this.model.getListTemplate());

            this.$el = $(this.template({
                options : this.model.getOptions()
            })).appendTo('body')
               .attr("id", "dd_list_" + this.listindex);

            this.initialWidth = this.$el.outerWidth();

            this.model.on('change:opened', this._handleOpenedChange, this);
        },

        render : function() {
            this.$el.html(this.template(this.model.toJSON()));
        },

        open : function() {
            var model = this.model,
                $el = this.$el, $parent = this.$parent;

            var listTotalWidth = $el.outerWidth(), listWidth = $el.width(),
                width = $parent.outerWidth(), height = $parent.outerHeight(),
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
                marginLeft : 0,
                zIndex : 19001
            });

            if (listTotalWidth !== newTotalWidth) {
                $el.width(listWidth - (listTotalWidth - newTotalWidth));
            }

            this.createCloseListLayer();

            $parent.addClass('opened');
            $el.addClass('opened');
        },

        close : function() {
            this.$parent.removeClass('opened');
            this.$el.removeClass('opened');

            this.destroyCloseListLayer();
        },

        /**
         * Creates layer which is used to close dropdown when user will click
         * somewhere in the window
         */
        createCloseListLayer : function() {
            var _self = this,
                attr = {
                    position : 'absolute', top : 0, left : 0, right : 0, bottom : 0, zIndex : 19000
                };

            this.$closeListLayer = $('<div class="dd-close-list-layer ' + this.model.getClassName() + '" />').appendTo('body').css(attr).one("click", function() {
                _self.controller._handleCloseListLayerClickEvent();
            });

            //Save previous z-index
            this.previousZIndex = this.$parent.css('zIndex');
            //and set temporary one
            this.$parent.css('zIndex', 20000);
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
                //Restore z-index
                this.$parent.css('zIndex', this.previousZIndex);
            }
        },

        _handleOpenedChange : function() {
            this[this.model.isOpened() ? 'open' : 'close']();
        },

        _handleListOptionClickEvent : function(e) {
            var $target = $(e.currentTarget),
                value = $target.attr('dd-data');

            this.controller._handleListOptionClickEvent(value);
        },

        _handleListMouseOutEvent : function(e) {
            var $target = $(e.relatedTarget);

            this.controller._handleListMouseOutEvent(this.$el, $target);
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

            model.on('change:value', this._handleValueChange, this);

            this.render();
        },

        render : function() {
            this.$el.html(this.template({
                caption : this.model.getCaption()
            }));
        },

        _handleValueChange : function() {
            this.render();
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

            if (!model.isDisabled() && model.openOnHover() && $target !== $list && !$list.find($target).length && $target !== $el && !$el.find($target).length) {
                model.close();
            }
        },

        _handleCloseListLayerClickEvent : function() {
            this.model.close();
        },

        _handleListOptionClickEvent : function(value) {
            var model = this.model;

            if (!model.isExcluded(value)) {
                model.setValue(value);
                model.close();
            }
        },

        _handleListMouseOutEvent : function($list, $target) {
            var model = this.model;

            if (model.openOnHover() && !$list.find($target).length) {
                model.close();
            }
        }
    });
}(Backbone, _, jQuery));