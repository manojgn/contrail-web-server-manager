/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockback'
], function (_, Backbone, Knockback) {
    var prefixId = smwc.BAREMETAL_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(smwc.TMPL_BM_EDIT_FORM);

    var selectedBaremetal = null;
    
    var BaremetalEditView = Backbone.View.extend({
        modalElementId: '#' + modalId,
        
        renderAddBaremetal: function (options) {
            var editLayout = editTemplate({prefixId: prefixId}),
                that = this;

            smwu.createWizardModal({'modalId': modalId, 'className': 'modal-840', 'title': options['title'], 'body': editLayout, 'onSave': function () {
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                smwv.unbind(that);
                $("#" + modalId).find('.contrailWizard').data('contrailWizard').destroy();
                $("#" + modalId).modal('hide');
            }});

            smwu.renderView4Config($("#" + modalId).find("#bm-" + prefixId + "-form"), this.model, 
                    getAddBaremetalViewConfig(that.model, options['callback']), smwc.KEY_ADD_VALIDATION);

            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_CREATE_CONFIG]) + smwc.FORM_SUFFIX_ID, false);
            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_ASSIGN_ROLES, smwl.TITLE_SELECT_SERVERS]) + smwc.FORM_SUFFIX_ID, false);

            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smwv.bind(this);
        },
        renderReimage: function (options) {
            var editLayout = editTemplate({prefixId: prefixId}),
                that = this;

            smwu.createModal({'modalId': modalId, 'className': 'modal-700', 'title': options['title'], 'body': editLayout, 'onSave': function () {
                that.model.reimage(options['checkedRows'],{
                    init: function () {
                        that.model.showErrorAttr(prefixId + smwc.FORM_SUFFIX_ID, false);
                        smwu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        smwu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(prefixId + smwc.FORM_SUFFIX_ID, error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                smwv.unbind(that);
                $("#" + modalId).modal('hide');
            }});

            smwu.renderView4Config($("#" + modalId).find("#bm-" + prefixId + "-form"), this.model, reimageViewConfig, "configureValidation");
            this.model.showErrorAttr(prefixId + smwc.FORM_SUFFIX_ID, false);

            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smwv.bind(this);
        }
    });
    
    var selectServerViewConfig = [{
        elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_BAREMETAL_SERVER]),
        title: smwl.TITLE_SELECT_BAREMETAL_SERVER,
        view: "SectionView",

        viewConfig: {
            rows: [
                {
                    columns: [
                        {
                            elementId: 'select-baremetal-filtered-servers',
                            view: "FormGridView",
                            viewConfig: {
                                path: 'id',
                                class: "span12",
                                elementConfig: getSelectedServerGridElementConfig('select-baremetal', 'filterInNull=cluster_id')
                            }
                        }
                    ]
                }
            ]
        }
    }];      
    
    var configureServerViewConfig = [{
        elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_INTERFACE]),
        title: smwl.TITLE_SELECT_INTERFACE,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns : [

                               {
                                   elementId: 'baremetal-interfaces-grid',
                                   view: "FormDynamicGridView",
                                   viewConfig: {
                                       path: 'network.interfaces',
                                       class: "span12",
                                       modelAttributePath: 'network.interfaces',
                                       elementConfig: {
                                           options: {
                                               uniqueColumn: 'name',
                                               events: {
                                                   onUpdate: function () {
                                                       /*var interfaces = $('#baremetal-interfaces-grid').data('contrailDynamicgrid')._grid.getData(),
                                                           managementInterfacePrevData = $('#management_interface_dropdown').data('contrailDropdown').getAllData(),
                                                           managementInterfaceData = [],
                                                           controlDataInterfacePrevData = $('#control_data_interface_dropdown').data('contrailDropdown').getAllData(),
                                                           controlDataInterfaceData = [],
                                                           bondMemberInterfaces = [];

                                                       $.each(interfaces, function(interfaceKey, interfaceValue) {
                                                           bondMemberInterfaces = bondMemberInterfaces.concat(interfaceValue.member_interfaces);
                                                       });

                                                       $.each(interfaces, function (interfaceKey, interfaceValue) {
                                                           if (interfaceValue.name != '' && bondMemberInterfaces.indexOf(interfaceValue.name) == -1) {
                                                               if (interfaceValue.type == 'physical') {
                                                                   managementInterfaceData.push({
                                                                       id: interfaceValue.name,
                                                                       text: interfaceValue.name
                                                                   });
                                                               }

                                                               controlDataInterfaceData.push({
                                                                   id: interfaceValue.name,
                                                                   text: interfaceValue.name
                                                               });
                                                           }
                                                       });

                                                       if (JSON.stringify(managementInterfacePrevData) != JSON.stringify(managementInterfaceData)) {
                                                           $('#management_interface_dropdown').data('contrailDropdown').setData(managementInterfaceData)
                                                       }
                                                       if (JSON.stringify(controlDataInterfacePrevData) != JSON.stringify(controlDataInterfaceData)) {
                                                           $('#control_data_interface_dropdown').data('contrailDropdown').setData(controlDataInterfaceData)
                                                       }*/
                                                   }
                                               }
                                           },
                                           columns: [
                                                {
                                                    id: "name", name: "Name", field: "name", width: 85,
                                                    editor: ContrailGrid.Editors.Text,
                                                    formatter: ContrailGrid.Formatters.Text,
                                                    elementConfig: {
                                                        placeholder: 'Dummy field'
                                                    }
                                                },
                                               {
                                                   id: "baremetal_interface", name: "Interface", field: "interface", width: 250,
                                                   //defaultValue: 'physical',
                                                   editor: ContrailGrid.Editors.ContrailDropdown,
                                                   editEnabler: function (dc) {
                                                       return (dc.type == 'bond');
                                                   },
                                                   initSetData: function (args, $contrailDropdown) {
                                                       var checkedRows =  $('#select-baremetal-filtered-servers').data('contrailGrid').getCheckedRows()[0];
                                                       var dummydata = smwc.DUMMY_DATA[0];
                                                       checkedRows['network'] = dummydata.network;
                                                       var interfaceData = [];
                                                       var interfaces = jsonPath(checkedRows,'$.network.interfaces')[0];
                                                       if(interfaces){
                                                           $.each(interfaces,function(i,intf){
                                                               interfaceData.push({text:intf.name,value:intf.mac_address});
                                                           });
                                                       }
                                                       $contrailDropdown.setData(interfaceData)

                                                   },
                                                   elementConfig: {
                                                       width: 'element',
                                                       placeholder: 'Select Interface',
                                                       dataTextField: "text",
                                                       dataValueField: "value",
                                                       data: []
//                                                       data : function(){
//                                                           if($('#select-baremetal-filtered-servers').length > 0){
//                                                               var checkedRows =  $('#select-baremetal-filtered-servers').data('contrailGrid').getCheckedRows();
//                                                               var selectedServer = checkedRows[0];
//                                                               return [{text:'Intf1', value:'intf1'}];
//                                                           } else {
//                                                               return [{text:'No Interfaces found', value:'None'}];
//                                                           }
//                                                       }()
                                                       
                                                   }

                                               },
                                               {
                                                   id: "vn", name: "Virtual Network", field: "vn", width: 250,
                                                   //defaultValue: 'physical',
                                                   editor: ContrailGrid.Editors.ContrailDropdown,
                                                   elementConfig: {
                                                       width: 'element',
                                                       placeholder: 'Select Network',
                                                       dataTextField: "text",
                                                       dataValueField: "value",
                                                       dataSource : {
                                                           type : 'remote',
                                                           url : smwc.URL_NETWORKS,
                                                           parse: function(result){
                                                               var vnDataSrc = [{text : 'None', value : 'none'}];
                                                               if(result != null && result['data'] != null && result['data'].length > 0) {
                                                                   var vns =  result['data'];
                                                                   for(var i = 0; i < vns.length; i++) {
                                                                       var vn = vns[i]['virtual-network'];
                                                                       var fqn = vn.fq_name;
                                                                       var subnetStr = '';
                                                                       if('network_ipam_refs' in vn) {
                                                                           var ipamRefs = vn['network_ipam_refs'];
                                                                           for(var j = 0; j < ipamRefs.length; j++) {
                                                                               if('subnet' in ipamRefs[j]) {
                                                                                   if(subnetStr === '') {
                                                                                       subnetStr = ipamRefs[j].subnet.ipam_subnet;
                                                                                   } else {
                                                                                       subnetStr += ', ' + ipamRefs[j].subnet.ipam_subnet;
                                                                                   }
                                                                               }
                                                                           }
                                                                       }
                                                                       var textVN = fqn[2] + " (" + fqn[0] + ":" + fqn[1] + ")";
                                                                       if(subnetStr != '') {
                                                                           textVN += ' (' + subnetStr + ')';  
                                                                       }
                                                                       vnDataSrc.push({ text : textVN, value : vn.uuid});
                                                                   }
                                                               } else {
                                                                   vnDataSrc.push({text : 'No Virtual Network found', value : 'empty'});
                                                               }
                                                               return vnDataSrc;
                                                           }
                                                       }
                                                   }
                                               }
                                           ]
                                       }
                                   }
                               }
                           
                    ]
                }
            ]
        }
    
    },
    {
        elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_IMAGE]),
        title: smwl.TITLE_SELECT_IMAGE,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns: [
                        {
                            elementId: 'package_image_id',
                            view: "FormDropdownView",
                            viewConfig : {
                                path : 'package_image_id',
                                class : "span6",
                                dataBindValue : 'package_image_id',
                                elementConfig : {
                                    placeholder : smwl.SELECT_PACKAGE,
                                    dataTextField : "id",
                                    dataValueField : "id",
                                    dataSource : {
                                        type : 'remote',
                                        url : smwu
                                                .getObjectDetailUrl(
                                                        smwc.IMAGE_PREFIX_ID,
                                                        'filterInImages')
                                    }
                                }
                            }
                        },
                        {
                            elementId: 'baremetal_reimage',
                            view: "FormCheckboxView",
                            viewConfig : {
                                path : 'baremetal_reimage',
                                class : "span6",
                                dataBindValue : 'baremetal_reimage',
                                elementConfig : {
                                    label:'Reimage',
                                    isChecked:false
                                }
                            }
                        }
                    ]
                }
            ]
        }
    }];

    var configureInterfacesViewConfig = [{
        elementId: smwu.formatElementId([prefixId, smwl.TITLE_CONFIGURE_INTERFACES]),
        title: smwl.TITLE_CONFIGURE_INTERFACES,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns: [
                           {
                            elementId : 'interface',
                            view : "FormDropdownView",
                            viewConfig : {
                                path : 'parameters.server',
                                dataBindValue : 'parameters().servers',
                                class : "span6",
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    data : smwc.STATES
                                }
                            }
                        },
                    ]
                }
            ]
        }
    }];
    
    function getAddBaremetalViewConfig(baremetalModel, callback) {
        var addBaremetalViewConfig = {
                elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_BAREMETAL_SERVER]),
                view: "WizardView",
                viewConfig: {
                    steps: []
                }
            },
            steps = [],
            selectServerStepViewConfig = null,
            configureServerStepViewConfig = null,
            configureInterfacesStepViewConfig = null;
        
        /*
        Appending Select Server Steps
        */
        selectServerStepViewConfig = [{
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_SERVER]),
            view: "AccordianView",
            viewConfig: selectServerViewConfig,
            title: smwl.TITLE_SELECT_SERVER,
            stepType: 'step',
            onInitRender: true,
            onNext: function (params) {
                var checkedRows =  $('#select-baremetal-filtered-servers').data('contrailGrid').getCheckedRows();
                if(checkedRows.length == 0){
                    baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_SELECT_BAREMETAL_SERVER]) + smwc.FORM_SUFFIX_ID, false);
                    return false
                } else if(checkedRows > 1){
                    baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_SELECT_BAREMETAL_SERVER]) + smwc.FORM_SUFFIX_ID, false);
                    return false;
                } else {
                    baremetalModel.selectedServer = checkedRows[0];
                    var interfacedd = $('#baremetal_interface').data('contrailDropdown');
//                    interfacedd.setData
                }
                return true;
            },
            buttons: {
                next: {
                    label: smwl.TITLE_NEXT
                },
                previous: {
                    visible: false
                }
            }
        }];
        steps = steps.concat(selectServerStepViewConfig);
        
        /*
        Appending Configure Server Steps
        */
        configureServerStepViewConfig = [{
                elementId: smwu.formatElementId([prefixId, smwl.TITLE_CONFIGURE_SERVER]),
                view: "AccordianView",
                viewConfig: configureServerViewConfig,
                title: smwl.TITLE_CONFIGURE_SERVER,
                stepType: 'step',
                onInitRender: true,
                onNext: function (params) {
                    var interfaceMappings = $('#baremetal-interfaces-grid').data('contrailDynamicgrid')._grid.getData();
                    var selectedServer = $('#select-baremetal-filtered-servers').data('contrailGrid').getCheckedRows()[0];
                    $.each(interfaceMappings,function(i,interfaceMapping){
                        var mac = interfaceMapping['interface'];
                        var vnUUID = interfaceMapping['vn'];
                        var moreDetails = getMoreDetailsForInterface(selectedServer['network']['interfaces'], mac);
                        var data = {"vnUUID": vnUUID, "macAddress":mac, moreDetails:moreDetails}; 
                        configureBaremetal(data,params,baremetalModel);
                    });
                },
                buttons: {
                    finish: {
                        label: 'Save'
                    },
                    previous: {
                        visible: false
                    }
                }
            }];
        steps = steps.concat(configureServerStepViewConfig);
                
        addBaremetalViewConfig.viewConfig.steps = steps;

        return addBaremetalViewConfig;
    }
    
    function configureBaremetal(data,params,baremetalModel){
        params.model.createVMI(data, {
            init: function () {
                baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, false);
                smwu.enableModalLoading(modalId);
            },
            success: function (response) {
                var vmiDetails = response['virtual-machine-interface']['fq_name'];
                createVM(vmiDetails,data,params,baremetalModel);
            },
            error: function (error) {
                smwu.disableModalLoading(modalId, function () {
                    baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, error.responseText);
                });
            }
        });
    }
    
    function createVM(vmiDetails,data,params,baremetalModel){
        params.model.createVM(vmiDetails[2], {
            init: function () {
                baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, false);
                smwu.enableModalLoading(modalId);
            },
            success: function () {
                createLogicalInterface(data,vmiDetails,params,baremetalModel);
            },
            error: function (error) {
                smwu.disableModalLoading(modalId, function () {
                    baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, error.responseText);
                });
            }
        });
    }
    
    function createLogicalInterface(data,vmiDetails,params,baremetalModel){
        params.model.createLogicalInterface(data,vmiDetails, {
            init: function () {
                baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, false);
                smwu.enableModalLoading(modalId);
            },
            success: function () {
                smwu.disableModalLoading(modalId, function () {
//                    callback();
                    $('#' + modalId).modal('hide');
                });
            },
            error: function (error) {
                smwu.disableModalLoading(modalId, function () {
                    baremetalModel.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, error.responseText);
                });
            }
        });
    }
    
    function getMoreDetailsForInterface(interfaces,mac){
        var res = {};
        $.each(interfaces,function(i,intf){
           if(intf['mac_address'] === mac){
               res = { tor:intf['tor'],
                       tor_port:intf['tor_port'],
                       ip_address:intf['ip_address']};
           } 
        });
        return res;
    }
    
    function getSelectedServerGridElementConfig(gridPrefix, urlParam) {
        var filteredServerGrid = '#' + gridPrefix + '-filtered-servers',
            gridElementConfig = {
            header: {
                title: {
                    text: smwl.TITLE_SELECT_SERVERS
                },
                defaultControls: {
                    refreshable: true
                },
                advanceControls: [
                    /*{
                        "type": "link",
                        "title": 'Select Servers',
                        "iconClass": "icon-plus",
                        "onClick": function () {
                            var checkedRows = $(filteredServerGrid).data('contrailGrid').getCheckedRows();
                            updateSelectedServer(gridPrefix, 'add', checkedRows);
                        }
                    }, */
                    {
                        type: 'checked-multiselect',
                        iconClass: 'icon-filter',
                        title: 'Filter Servers',
                        placeholder: 'Filter Servers',
                        elementConfig: {
                            elementId: 'tagsCheckedMultiselect',
                            dataTextField: 'text',
                            dataValueField: 'id',
                            filterConfig: {
                                placeholder: 'Search Tags'
                            },
                            parse: formatData4Ajax,
                            minWidth: 200,
                            height: 250,
                            emptyOptionText: smwm.NO_TAGS_FOUND,
                            dataSource: {
                                type: 'GET',
                                url: smwu.getTagsUrl('')
                            },
                            click: function(event, ui){
                                applyServerTagFilter(filteredServerGrid, event, ui)
                            },
                            optgrouptoggle: function(event, ui){
                                applyServerTagFilter(filteredServerGrid, event, ui)
                            },
                            control: false
                        }
                    }
                ]

            },
            columnHeader: {
                columns: smwgc.EDIT_SERVERS_ROLES_COLUMNS
            },
            body: {
                /*options: {
                    actionCell: {
                        type: 'link',
                        iconClass: 'icon-plus',
                        onclick: function(e, args) {
                            var selectedRow = $(filteredServerGrid).data('contrailGrid')._dataView.getItem(args.row);
                            updateSelectedServer(gridPrefix, 'add', [selectedRow]);
                        }
                    }
                },*/
                dataSource: {
                    remote: {
                        ajaxConfig: {
                            url: smwu.getObjectDetailUrl(smwc.SERVER_PREFIX_ID) + '?' + urlParam
                        },
//                        dataParser: removeAlreadyConfiguredBaremetals
                    }
                },
                statusMessages: {
                    empty: {
                        type: 'status',
                        iconClasses: '',
                        text: smwm.NO_SERVERS_2_SELECT
                    }
                }
            }
        };
        return gridElementConfig;
    }
    
<<<<<<< HEAD
    var reimageViewConfig = {
        elementId: prefixId,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns: [
                        {
                            elementId: 'base_image_id',
                            view: "FormDropdownView",
                            viewConfig: {path: 'base_image_id', dataBindValue: 'base_image_id', class: "span6", elementConfig: {placeholder: smwl.SELECT_IMAGE, dataTextField: "id", dataValueField: "id", dataSource: {type: 'remote', url: smwu.getObjectDetailUrl(smwc.IMAGE_PREFIX_ID, 'filterInImages')}}}
                        }
                    ]
                }
            ]
        }
    };
=======
    function removeAlreadyConfiguredBaremetals(result){
        
    }
>>>>>>> Baremetal addition backend code and delete baremetal initial code
    
    function formatData4Ajax(response) {
        var filterServerData = [];
        $.each(response, function (key, value) {
            var childrenData = [],
                children = value;
            $.each(children, function (k, v) {
                childrenData.push({'id': v, 'text': v});
            });
            filterServerData.push({'id': key, 'text': smwl.get(key), children: childrenData});
        });
        return filterServerData;
    };
    
    function updateSelectedServer(gridPrefix, method, serverList){
        var filteredServerGridElement = $('#' + gridPrefix + '-filtered-servers'),
            confirmServerGridElement = $('#' + gridPrefix + '-confirm-servers'),
            currentSelectedServer = filteredServerGridElement.data('serverData').selectedServers,
            serverIds = filteredServerGridElement.data('serverData').serverIds;

        if(method == 'add') {
            var cgrids = [];
            currentSelectedServer = currentSelectedServer.concat(serverList);
            filteredServerGridElement.data('serverData').selectedServers = currentSelectedServer;

            $.each(serverList, function(serverListKey, serverListValue){
                cgrids.push(serverListValue.cgrid);
                serverIds.push(serverListValue.id);
            });
            filteredServerGridElement.data('contrailGrid')._dataView.deleteDataByIds(cgrids);
        }
        else if(method == 'remove') {
            var cgrids = [];

            $.each(serverList, function(serverListKey, serverListValue){
                cgrids.push(serverListValue.cgrid);
                serverIds.splice(serverIds.indexOf(serverListValue.id), 1 );
            });
            confirmServerGridElement.data('contrailGrid')._dataView.deleteDataByIds(cgrids);
            filteredServerGridElement.data('contrailGrid')._dataView.addData(serverList);
        }

        filteredServerGridElement.data('serverData').serverIds = serverIds;
        filteredServerGridElement.data('serverData').selectedServers = currentSelectedServer;
        filteredServerGridElement.parents('section').find('.selectedServerCount')
            .text((currentSelectedServer.length == 0) ? 'None' : currentSelectedServer.length);

        return true;
    }
    
    return BaremetalEditView;
});