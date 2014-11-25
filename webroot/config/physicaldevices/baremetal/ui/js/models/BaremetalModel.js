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
        
        //Creates the VMI
        createVMI: function (data, callbackObj) {
            var ajaxConfig = {};
            var details = data['moreDetails'];
//            if (this.model().isValid(true, 'configureBaremetalValidation')) {
                var postObj = {};
//               TODO use this with ip postObj = {"vnUUID": data['vnUUID'], "fixedIPs":[details['ip_address']], "macAddress":data['macAddress']};
                postObj = {"vnUUID": data['vnUUID'], "macAddress":data['macAddress']};
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(postObj);
                ajaxConfig.url = '/api/tenants/config/create-port';
                console.log(ajaxConfig);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success(response);
                    }
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                });
//            } else {
//                if (contrail.checkIfFunction(callbackObj.error)) {
//                    callbackObj.error(this.getFormErrorText(smwc.SERVER_PREFIX_ID));
//                }
//            }
        },
        
        //Creates the dummy VM object
        createVM: function (vmiId,callbackObj) {
            var ajaxConfig = {};
            ajaxConfig.type = "GET";
            ajaxConfig.url = '/api/tenants/config/map-virtual-machine-refs/' + vmiId;
            console.log(ajaxConfig);
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success(response);
                }
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        
        //Creates the logical interface
        createLogicalInterface: function (data, vmiDetails, callbackObj) {
            var ajaxConfig = {};
            var postObject = {}; 
            var moreDetails = data['moreDetails'];
            var pRouter = moreDetails['tor'];
            var physicalInterface = moreDetails['tor_port'];
            var name = physicalInterface + '.0';
            var pRouter = 'pr1';//TODO
            var pRouterUUID;//TODO
            
            var deferredObj = $.Deferred();
            fetchPRouterUUIDFromName(pRouter,deferredObj);
            deferredObj.done( function(response){
                console.log(response);
                if(response != null && response['physical-routers'] != null){
                    $.each(response['physical-routers'],function(i,pr){
                       if(pr['fq_name'][1] == pRouter){
                           pRouterUUID = pr['uuid'];
                       } 
                    });
                    //Now get the physical-interface details using the prouter uuid
                    ajaxConfig.type = "GET";
                    ajaxConfig.url = '/api/tenants/config/physical-interfaces/' + pRouterUUID;
                    contrail.ajaxHandler(ajaxConfig, function () {
                    }, function (response) {
                        //on success
                        console.log(response);
                        if(response != null){
                            var pinterfaces = jsonPath(response,"$..physical-interface");
                            var intfUUID;
                            $.each(pinterfaces,function(i,pintf){
                                if(pintf['fq_name'][2] == physicalInterface){
                                    intfUUID = pintf['uuid'];
                                }
                            });
                            if(intfUUID != null){
                                postObject["logical-interface"] = {};
                                postObject["logical-interface"]["fq_name"] = ["default-global-system-config", pRouter, physicalInterface , name];
                                postObject["logical-interface"]["parent_type"] = "physical-interface";
                                postObject["logical-interface"]["parent_uuid"] = intfUUID;
                                postObject["logical-interface"]["name"] = name;  
                                postObject["logical-interface"]["logical_interface_vlan_tag"] = '4';//vlan;//TODO
                                postObject["logical-interface"]['virtual_machine_interface_refs'] = [{"to" : [vmiDetails[0], vmiDetails[1], vmiDetails[2]]}];
                                postObject["logical-interface"]["logical_interface_type"] = 'l2';
                                ajaxConfig.type = "POST";
                                ajaxConfig.data = JSON.stringify(postObject);
                                ajaxConfig.url = '/api/tenants/config/physical-interfaces/' + pRouterUUID + '/Logical';
                                console.log(ajaxConfig);
                                contrail.ajaxHandler(ajaxConfig, function () {
                                    if (contrail.checkIfFunction(callbackObj.init)) {
                                        callbackObj.init();
                                    }
                                }, function (response) {
                                    console.log(response);
                                    if (contrail.checkIfFunction(callbackObj.success)) {
                                        callbackObj.success(response);
                                    }
                                }, function (error) {
                                    console.log(error);
                                    if (contrail.checkIfFunction(callbackObj.error)) {
                                        callbackObj.error(error);
                                    }
                                });
                            } else {
                                if (contrail.checkIfFunction(callbackObj.error)) {
                                    callbackObj.error('Interface Not Found');
                                }
                            }
                        } else {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error('Interface Not Found');
                            }
                        }
                    }, function (error) {
                        console.log(error);
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                    });
                } else {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error('Physical Router Not Found');
                    }
                } 
            });
        },
        
        deleteBaremetal: function (selectedBaremetal, callbackObj) {
            var ajaxConfig = {};
            //Fetch the pRouter UUID through name
            var deferredObj = $.Deferred();
            fetchPRouterUUIDFromName(selectedBaremetal['pRouter'],deferredObj);
            deferredObj.done(function(response){
                console.log(response);
                
                if(response != null && response['physical-routers'] != null){
                    var pRouterUUID;
                    $.each(response['physical-routers'],function(i,pr){
                       if(pr['fq_name'][1] == pRouter){
                           pRouterUUID = pr['uuid'];
                       } 
                    });
                    //First delete the Logical Interface
                    ajaxConfig.type = "DELETE";
                    ajaxConfig.data = JSON.stringify(postObj);
                    ajaxConfig.url = '/api/tenants/config/physical-interface/' + prouterUUID + '/' + sel_row_data['type'] + '/' + selectedBaremetal['liUuid'];
                    console.log(ajaxConfig);
                    contrail.ajaxHandler(ajaxConfig, function () {
                        if (contrail.checkIfFunction(callbackObj.init)) {
                            callbackObj.init();
                        }
                    }, function (response) {
                        this.deleteVMI(selectedBaremetal, callBackObj);
                    }, function (error) {
                        console.log(error);
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                    });
                } else {
                    //NO PRouters not found
                }
            });
        },
        
        deleteVMI : function (selectedBaremetal, callBackObj) {
            var ajaxConfig = {};
            ajaxConfig.type = "GET";
            ajaxConfig.url = '/api/tenants/config/delete-port/' + selectedBaremetal['vmUuid'];
            console.log(ajaxConfig);
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success(response);
                }
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        
        fetchPRouterUUIDFromName: function (pRouter,deferredObj){
            var ajaxConfig = {};
          //Get the prouter details
            ajaxConfig.type = "GET";
            ajaxConfig.url = '/api/tenants/config/physical-routers-list';
            contrail.ajaxHandler(ajaxConfig, function () {
            }, function (response) {
                deferredObj.resolve(response);
            }, function (error) {
                deferredObj.fail(response);
            }); 
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
        },
        reimage: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            if (this.model().isValid(true, smwc.KEY_REIMAGE_VALIDATION)) {
                var serverAttrs = this.model().attributes,
                    putData = {}, servers = [],
                    that = this;

                for (var i = 0; i < checkedRows.length; i++) {
                    servers.push({'mac_address': checkedRows[i]['mac'], 'base_image_id': serverAttrs['base_image_id']});
                }
                putData = servers;
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = smwc.URL_SERVER_REIMAGE;   
                console.log(ajaxConfig);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
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
            }  else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(smwc.SERVER_PREFIX_ID));
                }
            }
        }
    });
    return BaremetalModel;
});