/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'knockout',
    'common/ui/js/models/ContrailModel'
], function (_, Knockback, Knockout, ContrailModel) {
    
    var BaremetalModel = ContrailModel.extend({
        
        defaultConfig: smwmc.getServerModel(),
        
        configureBaremetal: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            if (this.model().isValid(true, 'configureBaremetalValidation')) {
                var serverAttrs = this.model().attributes,
                    putData = {}, servers = [],
                    that = this;

                for (var i = 0; i < checkedRows.length; i++) {
                    servers.push({'id': checkedRows[i]['id'], 'package_image_id': serverAttrs['package_image_id']});
                }
                putData = servers;

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = smwc.URL_BAREMETAL_ADD;
                console.log(ajaxConfig);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                    // TODO do the backend calls here
                    // First create the VMI in the VN
                    // Create the LI. Set the ref to the above VMI
                    
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(smwc.SERVER_PREFIX_ID));
                }
            }
        },
        
        validations: {
            configureBaremetalValidation: {
                'package_image_id': {
                    required: true,
                    msg: smwm.getRequiredMessage('package_image_id')
                },
                'baremetal_interface': {
                    required: true,
                    msg: smwm.getRequiredMessage('baremetal_interface')
                },
                'baremetal_network': {
                    required: true,
                    msg: smwm.getRequiredMessage('baremetal_network')
                },
            }
        }
    });
    return BaremetalModel;
});