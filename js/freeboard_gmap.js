//From:
////https://buglabs.tumblr.com/post/166116803266/new-freeboard-map-widget-gives-more-color-to-your
(function()
{
	freeboard.addStyle('.gm-style-cc a', "text-shadow:none;");
	freeboard.addStyle(".sub-section-height-5","height: 300px;");
	freeboard.addStyle(".sub-section-height-6","height: 360px;");
	freeboard.addStyle(".sub-section-height-8","height: 480px;");
	freeboard.addStyle(".sub-section-height-10","height: 600px;");

	var initializeCallbacks = [];
	window.gmap_initialize = function()
	{
	for(var index = 0; index < initializeCallbacks.length; index++)
	{
	initializeCallbacks[index]();
	}

	initializeCallbacks = [];
	}

	head.js("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=gmap_initialize");

	var googleMapCustomWidget = function(settings) {
		var self = this;
		var currentSettings = settings;
		var map;
		var marker;
		var poly;
		var currentPosition = {};
		var postUpdateCount = 0;

		function addLatLngPoly(position) {
		  var path = poly.getPath();
		  path.push(position);
		}

		function updatePosition()
		{
			if(map && marker && currentPosition.lat && currentPosition.lon)
			{
				var newLatLon = new google.maps.LatLng(currentPosition.lat, currentPosition.lon);
				marker.setPosition(newLatLon);

                                if(currentSettings.drawPath) addLatLngPoly(newLatLon);
				map.panTo(newLatLon);
			}
		}

		this.render = function(element)
		{
			function initializeMap()
			{
				var mapOptions = {
					zoom            : 13,
					center          : new google.maps.LatLng(37.235, -115.811111),
					disableDefaultUI: true,
					draggable       : true,
					styles: (currentSettings.customStyle != undefined) ? JSON.parse(currentSettings.customStyle) : [
						{"featureType": "water", "elementType": "geometry", "stylers": [
							{"color": "#2a2a2a"}
						]},
						{"featureType": "landscape", "elementType": "geometry", "stylers": [
							{"color": "#000000"},
							{"lightness": 20}
						]},
						{"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
							{"color": "#000000"},
							{"lightness": 17}
						]},
						{"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
							{"color": "#000000"},
							{"lightness": 29},
							{"weight": 0.2}
						]},
						{"featureType": "road.arterial", "elementType": "geometry", "stylers": [
							{"color": "#000000"},
							{"lightness": 18}
						]},
						{"featureType": "road.local", "elementType": "geometry", "stylers": [
							{"color": "#000000"},
							{"lightness": 16}
						]},
						{"featureType": "poi", "elementType": "geometry", "stylers": [
							{"color": "#000000"},
							{"lightness": 21}
						]},
						{"elementType": "labels.text.stroke", "stylers": [
							{"visibility": "on"},
							{"color": "#000000"},
							{"lightness": 16}
						]},
						{"elementType": "labels.text.fill", "stylers": [
							{"saturation": 36},
							{"color": "#000000"},
							{"lightness": 40}
						]},
						{"elementType": "labels.icon", "stylers": [
							{"visibility": "off"}
						]},
						{"featureType": "transit", "elementType": "geometry", "stylers": [
							{"color": "#000000"},
							{"lightness": 19}
						]},
						{"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
							{"color": "#000000"},
							{"lightness": 20}
						]},
						{"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
							{"color": "#000000"},
							{"lightness": 17},
							{"weight": 1.2}
						]}
					]
       			};

				map = new google.maps.Map(element, mapOptions);

				var polyOptions = {
					strokeColor: '#FF9900',
					strokeOpacity: 1.0,
					strokeWeight: 3
				  };

				poly = new google.maps.Polyline(polyOptions);
				poly.setMap(map);

				google.maps.event.addDomListener(element, 'mouseenter', function(e)
				{
					e.cancelBubble = true;
					if(!map.hover)
					{
						map.hover = true;
						map.setOptions({zoomControl: true});
					}
				});

				google.maps.event.addDomListener(element, 'mouseleave', function(e)
				{
					if(map.hover)
					{
						map.setOptions({zoomControl: false});
						map.hover = false;
					}
				});

				marker = new google.maps.Marker({map: map});

				updatePosition();
			}

			if(window.google && window.google.maps)
			{
                setTimeout(function() {
                    initializeMap();
                },5000);
            }
			else
			{
				initializeCallbacks.push(initializeMap);
			}
		}

		this.onSettingsChanged = function(newSettings)
		{
			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function(settingName, newValue)
		{
			if(settingName == "lat")
			{
				currentPosition.lat = newValue;
			}
			else if(settingName == "lon")
			{
				currentPosition.lon = newValue;
			}

			postUpdateCount++;

			if(postUpdateCount >= 2)
			{
			postUpdateCount = 0;
			updatePosition();
			}
		}

		this.onDispose = function()
		{
		}

		this.getHeight = function()
		{
			switch (currentSettings.size) {
				case 'Small':
					return 4;
				case  'Medium':
					return 8;
				case 'Large':
					return 10;
			}
		  	return 4;
      	}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
        type_name: "google_map_custom",
        display_name: "Google Map - Custom",
        fill_size: true,
        settings: [
            {
                name: "lat",
                display_name: "Latitude",
                type: "calculated"
            },
            {
                name: "lon",
                display_name: "Longitude",
                type: "calculated"
            },
            {
				name: "drawPath",
				display_name: "Draw Path",
				type: "boolean"
        	},
        	{
				"name": "size",
				"display_name": "Size",
				"description": "Small: 300x180 (1 column), Medium: 600x420 (2 columns), Large: 900x600 (3 columns).<br><strong>NOTE: You must also set the containing Pane's COLUMNS value to 1 (Small), 2 (Medium) or 3 (Large)</strong>",
				"type": "option",
				"options": [
					"Small",
					"Medium",
					"Large"				],
				"default_value": "Small"
			},
        	{
        		name: "customStyle",
        		display_name: "Custom Gmap Style",
        		description: "Paste your custom google map javascript style array here.  For examples and inspiration, check out https://snazzymaps.com",
        		type: "text"
        	}
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new googleMapCustomWidget(settings));
        }
    });
}());
