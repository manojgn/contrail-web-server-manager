/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function(_) {
    var Labels = function() {
        var labelMap;
        this.get = function(key) {
            if(_.has(labelMap, key)){
                return labelMap[key];
            } else {
                return key;
            }
        }
        labelMap = {
            //General
            'email': 'Email',
            "domain": "Domain",
            "gateway": "Gateway",
            "ip_address": "IP Address",

            //Server
            "power_address": "Power Address",
            "base_image_id": "Base Image",
            "package_image_id": "Package Image",
            "roles": "Roles",
            "mac": "MAC Address",
            "ifname": "Interface",
            "compute_non_mgmt_ip": "Compute Non-Management IP",
            "compute_non_mgmt_gway": "Compute Non-Management Gateway",

            // Cluster
            "cluster_id": "Cluster",
            "analytics_data_ttl": "Analytics Data TTL",
            "ext_bgp": "External BGP",
            "openstack_mgmt_ip": "Openstack Management IP",
            "openstack_passwd": "Openstack Password",
            "keystone_tenant": "Keystone Tenant",
            "subnet_mask": "Subnet Mask",
            "router_asn": "Router ASN",
            "multi_tenancy": "Multi Tenancy"
        };
    }
    return Labels;
});