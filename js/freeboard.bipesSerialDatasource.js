
(function () {

	var bipesSerialDatasource = function (settings, updateCallback) {
		var self = this;
		var updateTimer = null;
		var currentSettings = settings;

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

					//Test for single value. Works!
					//var number=localStorage.getItem('bipesDataSourceTest');
					//Our BIPES queue (from serial to freeboard)
					let q = new Queue(currentSettings.id);
					if (!q.isEmpty()) {
						var number = q.dequeue();
						//alert(number);
						console.log(number);
						data = number;
						updateCallback(data);
					}
		}

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		}

		this.onSettingsChanged = function (newSettings) {

			currentSettings = newSettings;
			updateRefresh(currentSettings.refresh * 1000);
			self.updateNow();
		}
	};

	freeboard.loadDatasourcePlugin({
		type_name: "BIPES Serial, USB or Bluetooth",
		settings: [
			{
				name: "id",
				display_name: "Message ID",
				type: "text",
				description: "ID of the message arriving at the terminal. Any device can send data as: BIPES-DATA:ID,VALUE. For example: BIPES-DATA:5,7"
			},
			{
				name: "refresh",
				display_name: "Refresh Every",
				type: "number",
				suffix: "seconds",
				default_value: 5
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new bipesSerialDatasource(settings, updateCallback));
		}
	});



}());
