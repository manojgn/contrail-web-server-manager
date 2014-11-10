define([
    'underscore',
    'backbone',
    'config/physicaldevices/baremetal/ui/js/models/BaremetalModel',
    'config/physicaldevices/baremetal/ui/js/views/BaremetalEditView'
], function (_, Backbone, BaremetalModel, BaremetalEditView) {
    // var prefixId = smwc.BAREMETAL_PREFIX_ID,
        // baremetalEditView = new BaremetalEditView(),
        // gridElId = '#' + prefixId + smwc.RESULTS_SUFFIX_ID;

    var BaremetalView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var hashParams = viewConfig['hashParams']
        },
    });
     return BaremetalView;
});
