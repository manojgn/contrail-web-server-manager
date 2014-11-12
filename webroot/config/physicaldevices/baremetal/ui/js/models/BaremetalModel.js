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
        
        validations: {
            reimageValidation: {
                'base_image_id': {
                    required: true,
                    msg: smwm.getRequiredMessage('base_image_id')
                },
                'gateway': {
                    required: true,
                    msg: smwm.getRequiredMessage('gateway')
                }
            },
            configureValidation: {
                'id': {
                    required: true,
                    msg: smwm.getRequiredMessage('id')
                },
                'ip_address': {
                    required: true,
                    pattern: smwc.PATTERN_IP_ADDRESS,
                    msg: smwm.getInvalidErrorMessage('ip_address')
                },
                'ipmi_address': {
                    required: false,
                    pattern: smwc.PATTERN_IP_ADDRESS,
                    msg: smwm.getInvalidErrorMessage('ipmi_address')
                },
                'mac_address': {
                    required: true,
                    pattern: smwc.PATTERN_MAC_ADDRESS,
                    msg: smwm.getInvalidErrorMessage('mac_address')
                },
                'email': {
                    required: false,
                    pattern: 'email',
                    msg: smwm.getInvalidErrorMessage('email')
                },
                'gateway': {
                    required: true,
                    pattern: smwc.PATTERN_IP_ADDRESS,
                    msg: smwm.getInvalidErrorMessage('gateway')
                },
                'mac_address': {
                    required: true,
                    pattern: smwc.PATTERN_MAC_ADDRESS,
                    msg: smwm.getInvalidErrorMessage('mac_address')
                },
                'subnet_mask': {
                    required: false,
                    pattern: smwc.PATTERN_SUBNET_MASK,
                    msg: smwm.getInvalidErrorMessage('subnet_mask')
                }
            },
            editTagsValidation: {}
        }
    });
    return BaremetalModel;
});