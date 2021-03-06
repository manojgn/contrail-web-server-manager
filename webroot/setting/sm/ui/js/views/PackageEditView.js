/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockback'
], function (_, Backbone, Knockback) {
    var prefixId = smConstants.PACKAGE_PREFIX_ID,
        editTemplate = contrail.getTemplate4Id("sm-edit-form-template"),
        modalId = 'configure-' + prefixId;

    var PackageEditView = Backbone.View.extend({
        render: function (options) {
            var modalId = 'configure-' + prefixId,
                editLayout = editTemplate({prefixId: prefixId}),
                that = this;

            smUtils.createModal({'modalId': modalId, 'className': 'modal-700', 'title': options['title'], 'body': editLayout, 'onSave': function () {
                that.model.configure({
                    init: function () {
                        that.model.showErrorAttr(prefixId + '_form', false);
                        smUtils.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        smUtils.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(prefixId + '_form', error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                smValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});

            smUtils.renderView4Config($("#" + modalId).find("#sm-" + prefixId + "-form"), this.model, configureViewConfig, "configureValidation");
            this.model.showErrorAttr(prefixId + '_form', false);
            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smValidation.bind(this);
        },
        renderDeletePackage: function (options) {
            var textTemplate = contrail.getTemplate4Id("sm-delete-package-template"),
                elId = 'deletePackage',
                that = this,
                checkedRows = options['checkedRows'],
                packageToBeDeleted = {'packageId': [], 'elementId': elId};
            packageToBeDeleted['packageId'].push(checkedRows['id']);
            smUtils.createModal({'modalId': modalId, 'className': 'modal-700', 'title': options['title'], 'btnName': 'Confirm', 'body': textTemplate(packageToBeDeleted), 'onSave': function () {
                that.model.deletePackage(options['checkedRows'],{
                    init: function () {
                        that.model.showErrorAttr(elId, false);
                        smUtils.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        smUtils.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(elId, error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                $("#" + modalId).modal('hide');
            }});

            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model, document.getElementById(modalId));
            smValidation.bind(this);
        }
    });

    var configureViewConfig = {
        prefixId: prefixId,
        view: "SectionView",
        viewConfig: {
            rows: [
                {
                    columns: [
                        {elementId: 'id', view: "FormInputView", viewConfig: {path: "id", dataBindValue: "id", class: "span6"}},
                        {elementId: 'type', view: "FormInputView", viewConfig: {path: "type", dataBindValue: "type", class: "span6"}},
                    ]
                },
                {
                    columns: [
                        {elementId: 'version', view: "FormInputView", viewConfig: {path: 'version', dataBindValue: "version", class: "span6"}},
                        {elementId: 'path', view: "FormInputView", viewConfig: {path: "path", dataBindValue: "path", class: "span6"}}
                    ]
                }
            ]
        }
    };

    return PackageEditView;
});