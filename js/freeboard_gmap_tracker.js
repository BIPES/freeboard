
//From: https://gist.github.com/Sypheos/d58a6b2457fab37e3fa503e046c27594
// # Building a Freeboard Plugin
//
// A freeboard plugin is simply a javascript file that is loaded into a web page after the main freeboard.js file is loaded.
//
// Let's get started with an example of a datasource plugin and a widget plugin.
//
// -------------------

// Best to encapsulate your plugin in a closure, although not required.
(function()
{
    // ## A Widget Plugin
    //
    // -------------------
    // ### Widget Definition
    //
    // -------------------
    // **freeboard.loadWidgetPlugin(definition)** tells freeboard that we are giving it a widget plugin. It expects an object with the following:
    freeboard.loadWidgetPlugin({
        // Same stuff here as with datasource plugin.
        "type_name"   : "google_map_tracker",
        "display_name": "Google map tracker",
        "description" : "Some sort of description <strong>with optional html!</strong>",
        // **external_scripts** : Any external scripts that should be loaded before the plugin instance is created.
        "external_scripts": [
            "http://mydomain.com/myscript1.js", "http://mydomain.com/myscript2.js"
        ],
        // **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
        "fill_size" : true,
        "settings"    : [
            {
                "name"        : "coordinates",
                "display_name": "Coordinates",
                // We'll use a calculated setting because we want what's displayed in this widget to be dynamic based on something changing (like a datasource).
                "type"        : "calculated",
                multi_input: "true"
            },
            {
                "name"        : "apiKey",
                "display_name": "Google Map API Key",
                "type"        : "text",
            },
            {
                "name"  : "path_color",
                "display_name": "Paths Colors",
                "type": "array",
                "settings": [
                    {
                        "name": "color",
                        "display_name": "Color",
                        "type": "text"
                    }
            ]
            }
        ],
        // Same as with datasource plugin, but there is no updateCallback parameter in this case.
        newInstance   : function(settings, newInstanceCallback)
        {
            newInstanceCallback(new myWidgetPlugin(settings));
        }
    });

    // ### Widget Implementation
    //
    // -------------------
    // Here we implement the actual widget plugin. We pass in the settings;
    var myWidgetPlugin = function(settings)
    {
        var self = this;
        var currentSettings = settings;
        var map;
        // Here we create an element to hold the text we're going to display. We're going to set the value displayed in it below.
        var coordinates = [[{lat:0,lng:0}]];

        // **render(containerElement)** (required) : A public function we must implement that will be called when freeboard wants us to render the contents of our widget. The container element is the DIV that will surround the widget.
        function updatePaths() {
            var i = 0;
            coordinates.forEach(function (elem) {
                var plan = new google.maps.Polyline({
                    path: elem,
                    geodesic: true,
                    strokeColor: currentSettings.path_color[i].color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                plan.setMap(map);
                i++
            })
            var center = coordinates[0][coordinates[0].length-1];
            map.panTo(new google.maps.LatLng(center.lat, center.lng))
        }
        self.render = function(containerElement)
        {
            function initMap() {
                map = new google.maps.Map(containerElement, {
                    zoom: 16,
                    center: {
                        lat: coordinates[0][coordinates.length - 1].lat,
                        lng: coordinates[0][coordinates.length - 1].lng
                    },
                    mapTypeId: 'terrain'
                });
                google.maps.event.addDomListener(containerElement, 'mouseenter', function (e) {
                    e.cancelBubble = true;
                    if (!map.hover) {
                        map.hover = true;
                        map.setOptions({zoomControl: true});
                    }
                });

                google.maps.event.addDomListener(containerElement, 'mouseleave', function (e) {
                    if (map.hover) {
                        map.setOptions({zoomControl: false});
                        map.hover = false;
                    }
                });

                updatePaths()
            }

            if (window.google && window.google.maps) {
                initMap();
            }else {
                window.gmap_initialize = initMap ;
                head.js("https://maps.googleapis.com/maps/api/js?key="+currentSettings.apiKey+"&callback=gmap_initialize");
            }
        };

               // src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyDF0g4gyqIEcONWBrSaRkF4Z9a6DR0XIOw&callback=initMap\">\n" +

        // **getHeight()** (required) : A public function we must implement that will be called when freeboard wants to know how big we expect to be when we render, and returns a height. This function will be called any time a user updates their settings (including the first time they create the widget).
        //
        // Note here that the height is not in pixels, but in blocks. A block in freeboard is currently defined as a rectangle that is fixed at 300 pixels wide and around 45 pixels multiplied by the value you return here.
        //
        // Blocks of different sizes may be supported in the future.
        self.getHeight = function()
        {
            return 4
        }

        // **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
        self.onSettingsChanged = function(newSettings)
        {
            // Normally we'd update our text element with the value we defined in the user settings above (the_text), but there is a special case for settings that are of type **"calculated"** -- see below.
            currentSettings = newSettings;
        }

        // **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
        self.onCalculatedValueChanged = function(settingName, newValue)
        {
            // Remember we defined "the_text" up above in our settings.
            if(settingName === "coordinates")
            {
                coordinates = []
                newValue.forEach(function (value) {
                    path = []
                    value.forEach(function (value2) {
                        path.push({lat: value2.Latitude, lng: value2.Longitude})
                    })
                    coordinates.push(path)
                })
                // Here we do the actual update of the value that's displayed in on the screen.
            }
            updatePaths()
        }

        // **onDispose()** (required) : Same as with datasource plugins.
        self.onDispose = function()
        {
        }
    }

    function generatePlan() {
        return
    }
}());
