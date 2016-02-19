L.K.ProjectEditor = L.Class.extend({
    initialize: function (map, options) {
        L.setOptions(this, options);
        this.map = map;
        this.initSidebar();
    },

    initSidebar: function () {
        var outer = this;

        this.container = L.DomUtil.create('div', 'project-editor');
        this.title = L.DomUtil.create('h3', '', this.container);
        this.layerContainer = L.DomUtil.create('div', '', this.container);
        this.title.innerHTML = 'Project Editor';

        var layerStr = '<ul id="project-layers">';

        this.sortableLayers = L.K.Config.project.layers.slice(0).reverse();

        this.sortableLayers.forEach(function(l) {
            layerStr += "<li style='background-color:#555;padding:4px;margin-bottom:2px;cursor:pointer'>" + l.name + "</li>\n";
        });

        layerStr += "</ul>";
        this.layerContainer.innerHTML = layerStr;

        var submit = L.DomUtil.create('a', 'button', this.container);
        submit.innerHTML = '✓ Save Project';
        submit.style.marginTop = "15px";

        this.map.sidebar.addTab({
            label: 'Project',
            className: 'project-editor',
            content: this.container
        });
        this.map.sidebar.rebuild();

        var sortable = Sortable.create(document.getElementById("project-layers"), {
            onEnd: function (/**Event*/evt) {
                var movedEl = outer.sortableLayers.splice(evt.oldIndex, 1);
                outer.sortableLayers.splice(evt.newIndex, 0, movedEl[0]);
            }
        });

        var saveLayers = function() {
            var ordered = outer.sortableLayers.slice(0).reverse();
            var layerStr = JSON.stringify(ordered);

            L.Kosmtik.Xhr.post("/save-layer/",{
                callback:function(code, data){
                    if (code != 200) {
                        var message = "Unknown error.";
                        try {
                            var resp = JSON.parse(data);
                            message = resp.msg;
                        }
                        catch(e) {
                            console.error("Error when trying to parse error message from server!", e, data);
                        }
                        alert("Error when saving project, server said: " + message);
                    }
                },
                data: layerStr
            });
        }

        L.DomEvent
            .on(submit, 'click', L.DomEvent.stop)
            .on(submit, 'click', saveLayers, this);
    },

    openSidebar: function () {
        this.map.sidebar.open('.project-editor');
    },

    buildForm: function () {
        var elements = [['format', this.elementDefinitions.format]];
        var extraElements = this.editableParams[this.params.format] || ['zoom', 'scale', 'showExtent'];
        for (var i = 0; i < extraElements.length; i++) {
            elements.push([extraElements[i], this.elementDefinitions[extraElements[i]]]);
        }
        this.builder.setFields(elements);
        this.builder.build();
    }

});

L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        this.projectEditor = new L.K.ProjectEditor(this);
    });
});
