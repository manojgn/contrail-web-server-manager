/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'common/ui/js/grid.editors',
    'common/ui/js/grid.formatters'
], function (_, Backbone) {
    //TODO: Make it generic for any kind of form edit.
    var FormDynamicGridView = Backbone.View.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                model = this.model,
                elId = this.attributes.elementId,
                columns = viewConfig.elementConfig.columns,
                options = viewConfig.options,
                data = model.model().attributes.interfaces;

            var grid,
                defaultDataItem = {};

            $.each(columns, function (columnKey, columnValue) {
                defaultDataItem[columnValue.field] = contrail.checkIfExist(columnValue.defaultValue) ? columnValue.defaultValue : null;
            });

            columns.push({
                id: 'icon-minus',
                field: "",
                name: '',
                cssClass: '',
                rerenderOnResize: false,
                formatter: function (r, c, v, cd, dc) {
                    return '<i class="row-remove icon-minus grey" data-row=' + r + '></i>'
                },
                width: 20,
                resizable: false,
                sortable: false
            });

            columns.push({
                id: 'icon-plus',
                field: "",
                name: '',
                cssClass: '',
                rerenderOnResize: false,
                formatter: function (r, c, v, cd, dc) {
                    return '<i class="row-add icon-plus grey" data-row=' + r + '></i>'
                },
                width: 20,
                resizable: false,
                sortable: false
            });
            options = {
                editable: true,
                enableAddRow: true,
                enableCellNavigation: true,
                asyncEditorLoading: false,
                autoEdit: false,
                autoHeight: true,
                rowHeight: 30
            };

            grid = new Slick.Grid('#' + elId, data, columns, options);

            grid.gotoCell(data.length, 0, true);

            grid.onAddNewRow.subscribe(function (e, args) {
                var item = $.extend(true, {}, defaultDataItem, args.item);
                item.cgrid = 'cgr_' + data.length;
                grid.invalidateRow(data.length);
                data.push(item);
                grid.updateRowCount();
                grid.render();
                grid.gotoCell(data.length, 0, true);
            });

            $('#' + elId).addClass('contrail-grid contrail-grid-editable');

            $(document).on('click', 'i.row-add', function() {
                var rowIndex = $(this).data('row');
                data.splice((rowIndex + 1), 0, $.extend(true, {}, defaultDataItem));
                grid.setData(data);
                grid.gotoCell((rowIndex + 1), 0, true);
            });

            $(document).on('click', 'i.row-remove', function() {
                var rowIndex = $(this).data('row');
                data.splice(rowIndex, 1);
                grid.setData(data);
            });

        }
    });

    return FormDynamicGridView;
});