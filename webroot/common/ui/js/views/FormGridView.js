/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    //TODO: Make it generic for any kind of form edit.
    var FormGridView = Backbone.View.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                model = this.model,
                elId = this.attributes.elementId;

            var defaultFormGridConfig = {
                header: {
                    defaultControls: {
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    }
                },
                body: {
                    options: {
                        checkboxSelectable: true,
                        detail: false
                    }
                },
                footer: {
                    pager: {
                        options: {
                            pageSize: 5,
                            pageSizeSelect: [5, 10, 50]
                        }

                    }
                }
            };

            var gridConfig = $.extend(true, {}, defaultFormGridConfig, viewConfig.elementConfig);

            smUtils.renderGrid(this.$el, gridConfig);
        }
    });

    return FormGridView;
});