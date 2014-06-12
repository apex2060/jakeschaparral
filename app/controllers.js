var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $location, $http, config, userService, dataService){
	$rootScope.action = $routeParams.action;
	$rootScope.view = $routeParams.view;
	$rootScope.id = $routeParams.id;
	$rootScope.email = $routeParams.email;
	$rootScope.config = config;

	function setup(){
		$scope.$on('$viewContentLoaded', function(event) {
			ga('send', 'pageview', $location.path());
		});
	}

	var tools = {
		user: userService,

		url:function(){
			return 'views/'+$routeParams.view+'.html';
		},

		side:{
			set:function(side,url){
				$rootScope.side[side]=url;
				if(!$('#aside_'+side).hasClass('show'))
					$('#aside_'+side).removeClass('hide').addClass('show');
			},
			get:function(side){
				return $rootScope.side[side]
			},
			hide:function(side){
				$('#aside_'+side).removeClass('show').addClass('hide');
			},
			show:function(side){
				$('#aside_'+side).removeClass('hide').addClass('show');
			}
		},
		setup:function(){
			userService.init();
			setup();
			$rootScope.data=	{};
			$rootScope.resource={};
			$rootScope.temp=	{};
			$rootScope.side=	{};
			$rootScope.mode=	'normal';
			// tools.side.set('left','partials/shoeboxlist/sidebar.html')
			// tools.side.set('right','partials/sidebar.html')
		},
		signup:function(user){
			user.token=$routeParams.id;
			if($routeParams.email)
			user.email=$routeParams.email;
			tools.user.signup(user)
		},
		accountInit: function(){
			$rootScope.temp.user = angular.fromJson(angular.toJson($rootScope.user))
		},
		settings:function(user){
			var us = {}
				us.emailNotifications = user.emailNotifications
				us.phoneNotifications = user.phoneNotifications
			if(user.phone)
				us.phone = user.phone
			if(user.address)
				us.address = user.address
			if(user.email)
				us.email = user.email
			if(user.geo){
				us.geo = user.geo
				$rootScope.$broadcast('geoChange', user.geo);
			}

			$http.put(config.parseRoot+'users/'+$rootScope.user.objectId, us).success(function(data){
				$rootScope.error = null;
				$rootScope.success = data;
			}).error(function(error){
				$rootScope.error = error;
			})
		},
		invite: function(invitation){
			invitation.status = 'sending';
			$http.post(config.parseRoot+'classes/invitations', invitation)
				.success(function(response){
					console.log('invitation success: ', response);
					invitation.status='active';
				})
				.error(function(response){
					console.log('invitation error: ', response);
				})
		},
		clearInvite:function(){
			$rootScope.temp.invitation = {};
		}
	}
	$scope.tools = tools;
	$rootScope.mainTools = tools;

	if(!$rootScope.data){
		tools.setup();
	}
	$scope.$on('authenticated', function() {
		$rootScope.status = 'secured';
	})

	it.MainCtrl=$scope;
});








var SlideCtrl = app.controller('SlideCtrl', function($rootScope, $scope, $http, $q, config, dataService, fileService, userService){
	var timestamp = new Date().getTime();
	var slideResource = new dataService.resource(
		'Slides',
		'site/slides',
		true,
		true,
		{timestamp: timestamp}
	);
	slideResource.item.list().then(function(data){
		$scope.slides = data;
	})
	$rootScope.$on(slideResource.listenId, function(event, data){
		$scope.slides = data;
	})

	var tools = {
		user: userService,
		add:function(){
			$rootScope.temp.slide = {};
			$('#adminSlideModal').modal('show');
		},
		edit:function(slide){
			$rootScope.temp.slide = slide;
			$('#adminSlideModal').modal('show');
		},
		delete:function(slide){
			if(confirm('Are you sure you want to delete: '+slide.name)){
				slideResource.item.remove(slide).then(function(results){
					alert('Slide Removed')
					console.log('remove slide results',results)
				})
			}
		},
		save: function(){
			var slide = $rootScope.temp.slide;
			slideResource.item.save(slide).then(function(results){
				console.log('slide save results',results)
				$rootScope.temp.slide = {};
				$('#adminSlideModal').modal('hide');
			})
		},
		setPicture: function(details,src){
			if(!$rootScope.temp.slide)
				$rootScope.temp.slide = {};
			$rootScope.$apply(function(){
				$rootScope.temp.slide.picture = {
					temp: true,
					status: 'uploading',
					class: 'grayscale',
					name: 'Image Uploading...',
					src: src
				};
			});

			fileService.upload(details,src,function(data){
				$rootScope.$apply(function(){
					$rootScope.temp.slide.picture = {
						name: data.name(),
						src: data.url()
					}
				})
			});
		}
	}
	$scope.tools 	= tools;
	it.SlideCtrl 	= $scope;
});









var MissionCtrl = app.controller('MissionCtrl', function($rootScope, $scope, $http, $q, config, settings, dataService, fileService, userService){
	var allMissions = $q.defer();
	userService.user().then(function(user){
		var liveId = $rootScope.user.objectId;
		var timestamp = new Date().getTime();
		var missionResource = new dataService.resource(
			'Missions',
			'missionList/'+liveId,
			true,
			true,
			{timestamp: timestamp}
		);
			// ar.setQuery('');
		allMissions.resolve(missionResource);
		missionResource.item.list().then(function(data){
			$scope.missions = data;
		})
		$rootScope.$on(missionResource.listenId, function(event, data){
			$scope.missions = data;
		})
	});
	var allMissionsPromise = allMissions.promise;


	var tools = {
		mission: {
			create: function(mission){
				allMissionsPromise.then(function(missionResource){
					missionResource.item.save(mission).then(function(results){
						console.log(results);
						alert('Saved!')
					})
				});
			}
		},
		setPicture:{
			main:function(details, src, d1, d2){
				if(!$rootScope.temp.mission)
					$rootScope.temp.mission = {};
				if(!$rootScope.temp.mission[d1])
					$rootScope.temp.mission[d1] = {};

				$rootScope.$apply(function(){
					$rootScope.temp.mission[d1][d2] = {
						temp: true,
						status: 'uploading',
						class: 'grayscale',
						name: 'Image Uploading...',
						src: src
					};
				})

				fileService.upload(details,src,function(data){
					$rootScope.$apply(function(){
						$rootScope.temp.mission[d1][d2] = {
							name: data.name(),
							src: data.url()
						}
					})
				});
			},
			asker1:function(details, src){
				tools.setPicture.main(details,src,'asker', 'picture1')
			},
			asker2:function(details, src){
				tools.setPicture.main(details,src,'asker', 'picture2')
			},
			askee1:function(details, src){
				tools.setPicture.main(details,src,'askee', 'picture1')
			},
			askee2:function(details, src){
				tools.setPicture.main(details,src,'askee', 'picture2')
			}
		},
		setGeo:{
			asker:function(geo){
				if(!$rootScope.temp.mission)
					$rootScope.temp.mission = {};
				if(!$rootScope.temp.mission.asker)
					$rootScope.temp.mission.asker = {};
				$rootScope.temp.mission.asker.geo = geo;
			},
			askee:function(geo){
				if(!$rootScope.temp.mission)
					$rootScope.temp.mission = {};
				if(!$rootScope.temp.mission.askee)
					$rootScope.temp.mission.askee = {};
				$rootScope.temp.mission.askee.geo = geo;
			}
		}
	}

	// tools.setup();
	// $scope.$on('authenticated', function() {
	// 	$('body').removeClass('locked').addClass('')
	// })

	$scope.tools = tools;
	it.MissionCtrl=$scope;
});











var MapCtrl = app.controller('MapCtrl', function($rootScope, $scope){
	var tools = {
		init:function(elemId, doBounce, doInfowindow) {
			var myLatlng = new google.maps.LatLng(37.046711,-112.533212);
			var mapOptions = {
				zoom: 16,
				center: myLatlng
			}
			var map = new google.maps.Map(document.getElementById(elemId), mapOptions);

			var contentString = ''+
			'<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<h1 id="firstHeading" class="firstHeading">Jake\'s Chaparral</h1>'+
				'<div id="bodyContent">'+
					'<p><a href="'+$rootScope.map+'" target="_new">86 S 200 W,<br> Kanab, Utah 84741</a><br>(435) 644-5464</p>'+
				'</div>'+
			'</div>';

			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			var marker = new google.maps.Marker({
				animation: google.maps.Animation.DROP,
				position: myLatlng,
				map: map,
				title: 'Jake\'s Chaparral!'
			});
			if(doBounce)
				marker.setAnimation(google.maps.Animation.BOUNCE);
			google.maps.event.addListener(marker, 'click', function(){
				if (marker.getAnimation() != null) {
					marker.setAnimation(null);
				} else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			});
			// google.maps.event.addListener(marker, 'click', function() {
			// 	infowindow.open(map,marker);
			// });
			if(doInfowindow)
				infowindow.open(map,marker);
			marker.setMap(map);
		}
	}
	$scope.tools = tools;
	it.MapCtrl=$scope;
});










var AdminCtrl = app.controller('AdminCtrl', function($rootScope, $scope, $http, $q, config, initSetupService, roleService){
	var tools = {
		email:function(fun){
			$http.post(config.parseRoot+'functions/'+fun, {}).success(function(data){
				$scope.response = data;
			}).error(function(error, data){
				$scope.response = {error:error,data:data};
			});
		},
		setup:function(){
			roleService.detailedRoles().then(function(roles){
				$rootScope.data.roles = roles;
				roleService.unassigned().then(function(unassigned){
					$rootScope.data.unassigned = unassigned;
				})
			})
		},
		userRoles:roleService,
		user:{
			editRoles:function(user){
				$rootScope.temp.user = user;
				$('#adminUserModal').modal('show');
				// ga('send', 'event', 'admin', 'editRoles');
			}
		},
		roles:{
			setup:function(){	//This is a one time only thing - used to initiate the website roles.
				initSetupService.setup($rootScope.user,config.roles).then(function(results){
					$rootScope.data.roles = results;
				})
			}
		}
	}

	tools.setup();
	$scope.$on('authenticated', function() {
		tools.setup();
	})
	$rootScope.$on('role-reassigned', function(event,unassigned){
		$rootScope.data.unassigned = unassigned;
	})
	$scope.tools = tools;
	it.AdminCtrl=$scope;
});