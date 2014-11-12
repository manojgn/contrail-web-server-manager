define([
    'underscore',
    'backbone',
    'config/physicaldevices/baremetal/ui/js/models/BaremetalModel',
    'config/physicaldevices/baremetal/ui/js/views/BaremetalEditView'
], function (_, Backbone, BaremetalModel, BaremetalEditView) {
         var prefixId = smwc.BAREMETAL_PREFIX_ID,
         baremetalEditView = new BaremetalEditView(),
         gridElId = '#' + prefixId + smwc.RESULTS_SUFFIX_ID;

    var BaremetalView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var hashParams = viewConfig['hashParams']
            if (hashParams['server_id'] != null) {
                this.renderServer(hashParams['server_id']);
            } else {
                this.renderServersList(viewConfig);
            }
        },
        
        renderServersList: function (viewConfig) {
            var bmTemplate = contrail.getTemplate4Id(smwc.BM_PREFIX_ID + smwc.TMPL_SUFFIX_ID),
                serverColumnsType = viewConfig['serverColumnsType'],
                showAssignRoles = viewConfig['showAssignRoles'];
            
            this.$el.html(bmTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smwl.TITLE_BAREMETAL_SERVERS
                    },
                    advanceControls: headerActionConfig
                },
                columnHeader: {
                    columns: smwgc.getBaremetalServerColumns(serverColumnsType)
                },
                body: {
                    options: {
                        checkboxSelectable: {
                            onNothingChecked: function (e) {
                                $('#btnActionServers').addClass('disabled-link').removeAttr('data-toggle');
                            },
                            onSomethingChecked: function (e) {
                                $('#btnActionServers').removeClass('disabled-link').attr('data-toggle', 'dropdown');
                            }
                        },
                    },
                    dataSource: { 
                        data : [{'test':'test'}]
                    }
                }
            };

            smwu.renderGrid(gridElId, gridConfig);
        },
    });
    var headerActionConfig = [
          {
              "type": "link",
              "title": smwl.TITLE_ADD_CLUSTER,
              "iconClass": "icon-plus",
              "onClick": function () {
                  var clusterModel = new ClusterModel();
    
                  clusterEditView.model = clusterModel;
                  clusterEditView.renderAddCluster({"title": smwl.TITLE_ADD_CLUSTER, callback: function () {
                      var dataView = $(gridElId).data("contrailGrid")._dataView;
                      dataView.refreshData();
                  }});
              }
          }
      ];
     return BaremetalView;
});
