
(function () {

	var easyMQTTDatasource = function (settings, updateCallback) {
		var self = this;
		var updateTimer = null;
		var currentSettings = settings;
		var errorStage = 0; 	// 0 = try standard request
		// 1 = try JSONP
		// 2 = try thingproxy.freeboard.io
		var lockErrorStage = false;

		function updateRefresh(refreshTime) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}

			updateTimer = setInterval(function () {
				self.updateNow();
			}, refreshTime);
		}

		updateRefresh(currentSettings.refresh * 1000);

		this.updateNow = function () {

			var requestURL = "/easymqtt/gettopic_last.php?session=" + currentSettings.session + "&topic=" + currentSettings.topic;

			var body = currentSettings.body;

			// Can the body be converted to JSON?
			if (body) {
				try {
					body = JSON.parse(body);
				}
				catch (e) {
				}
			}

			$.ajax({
				url: requestURL,
				dataType: (errorStage == 1) ? "JSONP" : "JSON",
				type: currentSettings.method || "GET",
				data: body,
				beforeSend: function (xhr) {
					try {
						_.each(currentSettings.headers, function (header) {
							var name = header.name;
							var value = header.value;

							if (!_.isUndefined(name) && !_.isUndefined(value)) {
								xhr.setRequestHeader(name, value);
							}
						});
					}
					catch (e) {
					}
				},
				success: function (data) {
					lockErrorStage = true;
					updateCallback(data);
				},
				error: function (xhr, status, error) {
					if (!lockErrorStage) {
						// TODO: Figure out a way to intercept CORS errors only. The error message for CORS errors seems to be a standard 404.
						errorStage++;
						self.updateNow();
					}
				}
			});
		}

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		}

		this.onSettingsChanged = function (newSettings) {
			lockErrorStage = false;
			errorStage = 0;

			currentSettings = newSettings;
			updateRefresh(currentSettings.refresh * 1000);
			self.updateNow();
		}
	};

	freeboard.loadDatasourcePlugin({
		type_name: "BIPES EasyMQTT",
		settings: [
			{
				name: "session",
				display_name: "BIPES EasyMQTT Session",
				type: "text",
				description: "The session code automatically given when you insert the Start EasyMQTT block on your BIPES program. You can list sessions here: <a href=http://bipes.net.br/easymqtt/listsessions.php>http://bipes.net.br/easymqtt/listsessions.php</a>"
			},
			{
				name: "topic",
				display_name: "BIPES EasyMQTT Topic",
				type: "text",
				description: "The topic you want to access for your EasyMQTT Session. You can list topics here: <a href=http://bipes.net.br/easymqtt/getsession.php?session=XXX>http://bipes.net.br/easymqtt/getsession.php?session=XXX (change XXX by your session)</a>"
			},
			{
				name: "refresh",
				display_name: "Refresh Every",
				type: "number",
				suffix: "seconds",
				default_value: 5
			},
			{
				name: "method",
				display_name: "Method",
				type: "option",
				options: [
					{
						name: "GET",
						value: "GET"
					}
				],
				description: "The URL for BIPES EasyMQTT will be assembled from session and topic you inform. For example: http://bipes.net.br/easymqtt/gettopic_last.php?session=chocadeira&topic=umidade"
			},
			{
				name: "body",
				display_name: "Body",
				type: "text",
				description: "The body of the request. Normally only used if method is POST"
			},
			{
				name: "headers",
				display_name: "Headers",
				type: "array",
				settings: [
					{
						name: "name",
						display_name: "Name",
						type: "text"
					},
					{
						name: "value",
						display_name: "Value",
						type: "text"
					}
				]
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new easyMQTTDatasource(settings, updateCallback));
		}
	});



}());
