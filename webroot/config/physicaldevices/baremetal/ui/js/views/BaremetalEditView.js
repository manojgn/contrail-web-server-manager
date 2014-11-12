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

            smwu.renderView4Config($("#" + modalId).find("#sm-" + prefixId + "-form"), this.model, 
                    getAddBaremetalViewConfig(that.model, options['callback']), smwc.KEY_ADD_VALIDATION);

            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_CREATE_CONFIG]) + smwc.FORM_SUFFIX_ID, false);
            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_ADD_SERVERS, smwl.TITLE_ADD_TO_CLUSTER]) + smwc.FORM_SUFFIX_ID, false);
            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_ASSIGN_ROLES, smwl.TITLE_SELECT_SERVERS]) + smwc.FORM_SUFFIX_ID, false);
            this.model.showErrorAttr(smwu.formatElementId([prefixId, smwl.TITLE_EDIT_CONFIG]) + smwc.FORM_SUFFIX_ID, false);

            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smwv.bind(this);
        },
    });
    
    var createServerViewConfig = [{
        elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_SERVER]),
        title: smwl.TITLE_SELECT_SERVER,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns: [
                          {elementId: 'server', view: "FormDropdownView", viewConfig: {path: 'parameters.server', dataBindValue: 'parameters().servers', class: "span6", elementConfig: {dataTextField: "text", dataValueField: "id", data: smwc.STATES}}},
                    ]
                }
            ]
        }
    }];
    //TODO remove this variable
    var disableId = 'false';
    var configureServerViewConfig = [
        {
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_SERVER_DETAIL]),
            title: smwl.TITLE_SERVER_DETAIL,
            view: "SectionView", 
            viewConfig: {
                rows: [
                   {
                       columns: [
                             {elementId: 'id', view: "FormInputView", viewConfig: {disabled: disableId, path: "id", dataBindValue: "id", class: "span6"}},
                             {elementId: 'email', view: "FormInputView", viewConfig: {path: 'email', dataBindValue: 'email', class: "span6"}}
                       ]
                   },
                   {
                       columns: [
                             {elementId: 'Image', view: "FormInputView", viewConfig: {disabled: disableId, path: "id", dataBindValue: "id", class: "span6"}}
                       ]
                   }
                ]
            }
        },
        {
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_SYSTEM_MANAGEMENT]),
            title: smwl.TITLE_SYSTEM_MANAGEMENT,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {elementId: 'mac_address', view: "FormInputView", viewConfig: {path: 'mac_address', dataBindValue: 'mac_address', class: "span6"}}
                        ]
                    },
                    {
                        columns: [
                            {elementId: 'host_name', view: "FormInputView", viewConfig: {path: "host_name", dataBindValue: "host_name", class: "span6"}},
                            {elementId: 'domain', view: "FormInputView", viewConfig: {path: "domain", dataBindValue: "domain", class: "span6", view: "FormInputView"}}
                        ]
                    },
                    {
                        columns: [
                            {elementId: 'ip_address', view: "FormInputView", viewConfig: {path: "ip_address", dataBindValue: "ip_address", class: "span6"}},
                            {elementId: 'password', view: "FormInputView", viewConfig: {path: 'password', type: 'password', dataBindValue: 'password', class: "span6"}}
                        ]
                    },
                    {
                        columns: [
                            {elementId: 'static_ip', view: "FormInputView", viewConfig: {path: 'static_ip', dataBindValue: 'static_ip', class: "span6"}},
                            {elementId: 'ipmi_address', view: "FormInputView", viewConfig: {path: 'ipmi_address', dataBindValue: 'ipmi_address', class: "span6"}}
                        ]
                    },
                    {
                        columns: [
                            {elementId: 'ipmi_username', view: "FormInputView", viewConfig: {path: 'ipmi_username', dataBindValue: 'ipmi_username', class: "span6"}},
                            {elementId: 'ipmi_password', view: "FormInputView", viewConfig: {path: 'ipmi_password', type: 'password', dataBindValue: 'ipmi_password', class: "span6"}}
                        ]
                    },
                    {
                        columns: [
                            {elementId: 'gateway', view: "FormInputView", viewConfig: {path: "gateway", dataBindValue: "gateway", class: "span6"}},
                            {elementId: 'subnet_mask', view: "FormInputView", viewConfig: {path: 'subnet_mask', dataBindValue: 'subnet_mask', class: "span6"}}
                        ]
                    }
                ]
            }
        }
    ];
    
    function getAddBaremetalViewConfig(baremetalModel, callback) {
        var addBaremetalViewConfig = {
                elementId: smwu.formatElementId([prefixId, smwl.TITLE_ADD_CLUSTER]),
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
        selectServerStepViewConfig = {
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_SELECT_SERVER]),
            view: "AccordianView",
            viewConfig: createServerViewConfig,
            title: smwl.TITLE_SELECT_SERVER,
            stepType: 'step',
            onInitRender: false,
            onNext: function (params) {
                var checkedRows =  $('#select-server-filtered-servers').data('contrailGrid').getCheckedRows();
                return updateSelectedServer(gridPrefix, 'add', checkedRows);
            },
            buttons: {
                next: {
                    label: smwl.TITLE_NEXT
                },
                previous: {
                    visible: false
                }
            }
        };
        steps = steps.concat(selectServerStepViewConfig);
        
        /*
        Appending Configure Server Steps
        */
        configureServerStepViewConfig = {
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_CONFIGURE_SERVER]),
            view: "AccordianView",
            viewConfig: configureInterfacesViewConfig,
            title: smwl.TITLE_SELECT_SERVER,
            stepType: 'step',
            onInitRender: false,
            onNext: function (params) {
                //TODO
            },
            buttons: {
                next: {
                    label: smwl.TITLE_NEXT
                },
                previous: {
                    visible: true
                }
            }
        };
        steps = steps.concat(configureServerStepViewConfig);
        
        /*
        Appending Configure Interfaces Steps
        */
        configureInterfacesStepViewConfig = {
            elementId: smwu.formatElementId([prefixId, smwl.TITLE_CONFIGURE_INTERFACES]),
            view: "AccordianView",
            viewConfig: createConfigureServerViewConfig,
            title: smwl.TITLE_CONFIGURE_INTERFACES,
            stepType: 'step',
            onInitRender: false,
            onNext: function (params) {
                //TODO
            },
            buttons: {
                finish: {
                    label: 'Save'
                },
                previous: {
                    visible: true
                }
            }
        };
        steps = steps.concat(configureInterfacesStepViewConfig);
        
        
        addBaremetalViewConfig.viewConfig.steps = steps;

        return addBaremetalViewConfig;
    }
    
    return BaremetalEditView;
});