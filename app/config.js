app.factory('config', function ($rootScope, $http) {
	var config = {
		fireRoot: 			'https://jakeschaparral.firebaseio.com/',
		fireRef: 			new Firebase('https://jakeschaparral.firebaseio.com/'),
		parseRoot: 			'https://api.parse.com/1/',
	 	parseAppId: 		'AVwmfAVlV4h2AbfIadlGBkAVvgitiLgemE2Our8L',
	 	parseJsKey: 		'wqQb60Ki3DoWXDaOq3cUSWj5nSGAlvFL5dUg2RhU',
	 	parseRestApiKey: 	'OxkDAY6T8Ro4uzXOw4mDnS3kkbtgrdxmW3hnmDgb',
	 	googleApiKey: 		'AIzaSyB9AkOI2pK5WLEFHoQJDL9JokBio0KmTOo',
	 	roles: 				['Admin','Manager','Editor','Employee','User','BlockedUser']
	};

	Parse.initialize(config.parseAppId, config.parseJsKey);
	 $http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
	 $http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
	 $http.defaults.headers.common['Content-Type'] = 'application/json';

	return config;
});



app.factory('settings', function ($rootScope) {
	var settings = {
		colors: {
		}
	};
	return settings;
});