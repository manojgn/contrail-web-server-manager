/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var clustersPageLoader = new ClustersPageLoader(),
    serversPageLoader = new ServersPageLoader(),
    imagesPageLoader = new ImagesPageLoader(),
    packagesPageLoader = new PackagesPageLoader();

function ClustersPageLoader() {
    this.load = function (paramObject) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathClustersView = rootDir + '/js/views/ClustersView.js',
            hashParams = paramObject['hashParams'];

        check4SMInit(function () {
            requirejs([pathClustersView], function (ClustersView) {
                var clustersView = new ClustersView();
                clustersView.render({hashParams: hashParams});
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
    this.destroy = function () {
    };
};

function ServersPageLoader() {
    this.load = function (paramObject) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathServersView = rootDir + '/js/views/ServersView.js',
            hashParams = paramObject['hashParams'];

        check4SMInit(function () {
            requirejs([pathServersView], function (ServersView) {
                var serversView = new ServersView();
                serversView.render({serverColumnsType: smwc.SERVER_PREFIX_ID, hashParams: hashParams});
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
    this.destroy = function () {
    };
};

function ImagesPageLoader() {
    this.load = function (hashParams) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathImagesView = rootDir + '/js/views/ImagesView.js';

        check4SMInit(function () {
            requirejs([pathImagesView], function (ImagesView) {
                var imagesView = new ImagesView();
                imagesView.render();
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
    this.destroy = function () {
    };
};

function PackagesPageLoader() {
    this.load = function (hashParams) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathPackagesView = rootDir + '/js/views/PackagesView.js';

        check4SMInit(function () {
            requirejs([pathPackagesView], function (PackagesView) {
                var packagesView = new PackagesView();
                packagesView.render();
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams: hashObj});
    };
    this.destroy = function () {
    };
};

function check4SMInit(callback) {
    if (!smInitComplete) {
        requirejs(['sm-init'], function () {
            smInitComplete = true;
            callback()
        });
    } else {
        callback();
    }
};