'use strict';
angular.module('main')
.controller('GuestSignupCtrl', function (
	$log,
  $rootScope,
  $cordovaGeolocation,
  Config,
  BusyLoader,
  $stateParams,
  Auth
) {

  var ctrl = this;

  $log.log('Hello from your Controller: SignupCtrl in module auth:. This is your controller:', ctrl);

  ctrl.user = {
    email: '',
    password: '',
    name: ''
  };
  ctrl.savedUser = {
    email: '',
    password: '',
    name: '',
    authtoken: '',
    socialLogin: false,
    userId: ''
  };
  ctrl.productId = $stateParams.productId;
  ctrl.signup = function () {
    ctrl.responseCB = '';
    if (ctrl.signupForm.$valid) {
      BusyLoader.show();
      ctrl.user.password = ctrl.user.password;
      var posOptions = {timeout: 1000, enableHighAccuracy: false};
      var s = new Date().getTime();
      $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (position) {
        $log.log('Geolocation = ');
        $log.log(position);
        Config.ENV.USER.LATITUDE = position.coords.latitude;
        Config.ENV.USER.LONGITUDE = position.coords.longitude;
        ctrl.user.latitude = Config.ENV.USER.LATITUDE;
        ctrl.user.longitude = Config.ENV.USER.LONGITUDE;
        ctrl.user.userAgent = ionic.Platform.ua;
        return Auth.signup(ctrl.user);
      },
      function (err) {
        $log.log('Geolocation error = ' + err);
        ctrl.user.latitude = Config.ENV.USER.LATITUDE;
        ctrl.user.longitude = Config.ENV.USER.LONGITUDE;
        ctrl.user.userAgent = ionic.Platform.ua;
        return Auth.signup(ctrl.user);
      })
      .then(function (response) {
        var e = new Date().getTime();
        var t = e-s;
        Store.awsCloudWatch('JS Mob Signup','JS Mob signup',t);
        $log.log(response);
        $rootScope.$emit('internalGuestLogin', ctrl.user);
      })
      .catch(function (response) {
        BusyLoader.hide();
        $log.log(response);
        if (response.data.statusCode === '403') {
          ctrl.responseCB = response.data.status;
        } else {
          ctrl.responseCB = 'Something went wrong. Please try again.';
        }
      });
    }
  };

  ctrl.facebookLogin = function () {
    $rootScope.$emit('internalGuestFacebookLogin', ctrl.user);
  };

});
