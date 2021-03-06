/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'setting/sm/ui/js/models/ServerModel',
    'setting/sm/ui/js/views/ServerEditView'
], function (_, Backbone, ServerModel, ServerEditView) {
    var prefixId = smConstants.SERVER_PREFIX_ID,
        gridElId = '#' + prefixId + '-results',
        serverEditView = new ServerEditView();

    var ServersView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var smTemplate = contrail.getTemplate4Id(smConstants.SM_PREFIX_ID + "-template"),
                serverColumnsType = viewConfig['serverColumnsType'],
                showAssignRoles = viewConfig['showAssignRoles'];

            var queryString = getQueryString4ServersUrl(viewConfig['hashParams']);

            this.$el.html(smTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smLabels.TITLE_SERVERS
                    },
                    advanceControls: getHeaderActionConfig(queryString, showAssignRoles)
                },
                columnHeader: {
                    columns: smGridConfig.getServerColumns(serverColumnsType)
                },
                body: {
                    options: {
                        actionCell: getRowActionConfig(showAssignRoles),
                        checkboxSelectable: {
                            onNothingChecked: function (e) {
                                $('#btnActionServers').addClass('disabled-link').removeAttr('data-toggle');
                            },
                            onSomethingChecked: function (e) {
                                $('#btnActionServers').removeClass('disabled-link').attr('data-toggle', 'dropdown');
                            }
                        },
                        detail: {
                            template: $('#sm-grid-2-row-group-detail-template').html(),
                            templateConfig: detailTemplateConfig
                        },
                        sortable: {
                            defaultSortCols: {
                                'discovered': {sortAsc: false},
                                'tag': {sortAsc: true},
                                'status': {sortAsc: true}
                            }
                        }
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: {
                                url: smUtils.getObjectDetailUrl(prefixId) + queryString
                            }
                        }
                    }
                }
            };

            smUtils.renderGrid(gridElId, gridConfig);
        }
    });

    function getRowActionConfig(showAssignRoles) {
        var rowActionConfig = [
            smGridConfig.getConfigureAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = [dataItem],
                    _title = smLabels.TITLE_EDIT_CONFIG + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderConfigure({"title": _title, checkedRows: checkedRow, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }),
            smGridConfig.getTagAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = [dataItem],
                    _title = smLabels.TITLE_EDIT_TAGS + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderTagServers({
                    "title": _title,
                    checkedRows: checkedRow,
                    callback: function () {
                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                        $('#tagsCheckedMultiselect').data('contrailCheckedMultiselect').refresh();
                    },
                    lockEditingByDefault: false
                });
            }),
            smGridConfig.getReimageAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = [dataItem],
                    _title = smLabels.TITLE_REIMAGE + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderReimage({"title": _title, checkedRows: checkedRow, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }, true),
            smGridConfig.getProvisionAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = [dataItem],
                    _title = smLabels.TITLE_PROVISION_SERVER + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderProvisionServers({"title": _title, checkedRows: checkedRow, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }),
            smGridConfig.getDeleteAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = dataItem,
                    _title = smLabels.TITLE_DEL_SERVER + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderDeleteServer({"title": _title, checkedRows: checkedRow, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }, true)
        ];
        if (showAssignRoles) {
            rowActionConfig.push(smGridConfig.getAssignRoleAction(function (rowIndex) {
                var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                    serverModel = new ServerModel(dataItem),
                    checkedRow = [dataItem],
                    _title = smLabels.TITLE_ASSIGN_ROLES + ' ('+ dataItem['id'] +')';

                serverEditView.model = serverModel;
                serverEditView.renderAssignRoles({"title": _title, checkedRows: checkedRow, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }));
        }
        return rowActionConfig;
    };

    var detailTemplateConfig = [
        [
            {
                title: smLabels.TITLE_DETAILS,
                keys: ['id', 'cluster_id', 'email']
            },
            {
                title: smLabels.TITLE_SYSTEM_MANAGEMENT,
                keys: ['host_name', 'domain', 'ip_address', 'ipmi_address', 'gateway', 'subnet_mask', 'mac_address', 'static_ip', 'parameters.partition']
            },
            {
                title: smLabels.TITLE_INTERFACES,
                keys: ['parameters.interface_name', 'intf_bond', 'intf_data', 'intf_control']
            }
        ],
        [
            {
                title: smLabels.TITLE_STATUS,
                keys: ['status', 'last_update', 'state']
            },
            {
                title: smLabels.TITLE_ROLES,
                keys: ['roles']
            },
            {
                title: smLabels.TITLE_TAGS,
                keys: ['tag.datacenter', 'tag.floor', 'tag.hall', 'tag.rack', 'tag.user_tag']
            },
            {
                title: smLabels.TITLE_PROVISIONING,
                keys: [ 'base_image_id', 'reimaged_id', 'package_image_id', 'provisioned_id']
            }
        ]
    ];

    return ServersView;

    function formatData4Ajax(response) {
        var filterServerData = [];
        $.each(response, function (key, value) {
            var childrenData = [],
                children = value;
            $.each(children, function (k, v) {
                childrenData.push({'id': v, 'text': v});
            });
            filterServerData.push({'id': key, 'text': smLabels.get(key), children: childrenData});
        });

        /*if (contrail.checkIfExist(viewconfig.hashParams) && contrail.checkIfExist(viewconfig.hashParams.tag) && !$.isEmptyObject(viewconfig.hashParams)) {
         $.each(filterServerData, function (filterServerDataKey, filterServerDataValue) {
         var filterServerDataMapValue = {key: filterServerDataKey, children: {}},
         filterServerDataMapChildrenValue = {};

         $.each(filterServerData[filterServerDataKey].children, function (filterServerDataChildrenKey, filterServerDataChildrenValue) {
         filterServerDataMapChildrenValue[filterServerDataChildrenValue.id] = {key: filterServerDataChildrenKey};
         });

         filterServerDataMapValue.children = filterServerDataMapChildrenValue;
         filterServerDataMap[filterServerDataValue.id] = filterServerDataMapValue;
         });

         $.each(viewconfig.hashParams.tag, function (hashParamKey, hashParamValue) {
         var parentKey = filterServerDataMap[hashParamKey].key,
         childrenKey = filterServerDataMap[hashParamKey].children[hashParamValue].key;

         filterServerData[parentKey].children[childrenKey]['selected'] = true;
         });
         }*/
        return filterServerData;
    };

    function getHeaderActionConfig(queryString, showAssignRoles) {
        var headerActionConfig, dropdownActions;
        dropdownActions = [
            {
                "iconClass": "icon-edit",
                "title": smLabels.TITLE_EDIT_CONFIG,
                "onClick": function () {
                    var serverModel = new ServerModel(),
                        checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    serverEditView.model = serverModel;
                    serverEditView.renderConfigureServers({"title": smLabels.TITLE_EDIT_CONFIG, checkedRows: checkedRows, callback: function () {
                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
            {
                "iconClass": "icon-tags",
                "title": smLabels.TITLE_EDIT_TAGS,
                "onClick": function () {
                    var serverModel = new ServerModel(),
                        checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    serverEditView.model = serverModel;
                    serverEditView.renderTagServers({
                        "title": smLabels.TITLE_EDIT_TAGS,
                        "checkedRows": checkedRows,
                        callback: function () {
                            var dataView = $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                            $('#tagsCheckedMultiselect').data('contrailCheckedMultiselect').refresh();
                        },
                        lockEditingByDefault: true
                    });
                }
            }
        ];
        if (showAssignRoles) {
            dropdownActions.push({
                "iconClass": "icon-check",
                "title": smLabels.TITLE_ASSIGN_ROLES,
                "onClick": function () {
                    var serverModel = new ServerModel(),
                        checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    serverEditView.model = serverModel;
                    serverEditView.renderAssignRoles({"title": smLabels.TITLE_ASSIGN_ROLES, "checkedRows": checkedRows, callback: function () {
                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            });
        }
        dropdownActions.push({
            "iconClass": "icon-signin",
            "title": smLabels.TITLE_REIMAGE,
            divider: true,
            "onClick": function () {
            var serverModel = new ServerModel(),
                checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                serverEditView.model = serverModel;
                serverEditView.renderReimage({"title": smLabels.TITLE_REIMAGE, checkedRows: checkedRows, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }
        }),
        dropdownActions.push({
            "iconClass": "icon-cloud-upload",
            "title": smLabels.TITLE_PROVISION,
            "onClick": function () {
                var serverModel = new ServerModel(),
                    checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                serverEditView.model = serverModel;
                serverEditView.renderProvisionServers({"title": smLabels.TITLE_PROVISION_SERVERS, "checkedRows": checkedRows, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }
        });
        headerActionConfig = [
            {
                "type": "dropdown",
                "iconClass": "icon-cog",
                "linkElementId": 'btnActionServers',
                "disabledLink": true,
                "actions": dropdownActions
            }
        ];

        headerActionConfig = headerActionConfig.concat([
            {
                "type": "link",
                "title": smLabels.TITLE_ADD_SERVER,
                "iconClass": "icon-plus",
                "onClick": function () {
                    var serverModel = new ServerModel();

                    serverEditView.model = serverModel;
                    serverEditView.renderAddServer({"title": smLabels.TITLE_ADD_SERVER, callback: function () {
                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }, {
                type: 'checked-multiselect',
                iconClass: 'icon-filter',
                placeholder: 'Filter Servers',
                elementConfig: {
                    elementId: 'tagsCheckedMultiselect',
                    dataTextField: 'text',
                    dataValueField: 'id',
                    noneSelectedText: smLabels.FILTER_TAGS,
                    filterConfig: {
                        placeholder: smLabels.SEARCH_TAGS
                    },
                    parse: formatData4Ajax,
                    minWidth: 150,
                    height: 250,
                    emptyOptionText: 'No Tags found.',
                    dataSource: {
                        type: 'GET',
                        url: smUtils.getTagsUrl(queryString)
                    },
                    click: applyServerTagFilter,
                    optgrouptoggle: applyServerTagFilter,
                    control: false
                }
            }
        ]);
        return headerActionConfig;
    };

    function applyServerTagFilter(event, ui) {
        var checkedRows = $('#tagsCheckedMultiselect').data('contrailCheckedMultiselect').getChecked();
        $('#' + prefixId + '-results').data('contrailGrid')._dataView.setFilterArgs({
            checkedRows: checkedRows
        });
        $('#' + prefixId + '-results').data('contrailGrid')._dataView.setFilter(serverTagGridFilter);
    };

    /*
        ServerFilter: OR within the category , AND across the category
     */
    function serverTagGridFilter(item, args) {
        if (args.checkedRows.length == 0) {
            return true;
        } else {
            var returnObj = {},
                returnFlag = true;
            $.each(args.checkedRows, function (checkedRowKey, checkedRowValue) {
                var checkedRowValueObj = $.parseJSON(unescape($(checkedRowValue).val()));
                if(!contrail.checkIfExist(returnObj[checkedRowValueObj.parent])){
                    returnObj[checkedRowValueObj.parent] = false;
                }
                returnObj[checkedRowValueObj.parent] = returnObj[checkedRowValueObj.parent] || (item.tag[checkedRowValueObj.parent] == checkedRowValueObj.value);
            });

            $.each(returnObj, function(returnObjKey, returnObjValue) {
                returnFlag = returnFlag && returnObjValue;
            });

            return returnFlag;
        }
    };

    function getQueryString4ServersUrl(hashParams) {
        var queryString = '', tagKey, tagQueryArray = [];
        ;
        if (hashParams['cluster_id'] != null) {
            queryString += '?cluster_id=' + hashParams['cluster_id'];
        }

        if (hashParams['tag'] != null) {
            for (tagKey in hashParams['tag']) {
                tagQueryArray.push(tagKey + "=" + hashParams['tag'][tagKey]);
            }
            queryString += '?tag=' + tagQueryArray.join(',');
        }
        return queryString;
    };
});