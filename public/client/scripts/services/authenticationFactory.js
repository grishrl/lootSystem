angular.module('lootSystem').factory('auth', function authFactory($cookies){
  let authenticationObject = {
    'isAuthenticated': function(){
            return $cookies.get('token');
          },
            'setAuthentication':function(passVal){
              $cookies.put("authenticated",passVal.Autheticated);
              $cookies.put('userName',passVal.userName);
              $cookies.put('token',passVal.token);
            },
            'removeAuthentication':function(){
              $cookies.remove('authenticated');
              $cookies.remove('userName');
              $cookies.remove('token');
            },
            'returnUserName':function(){
              return $cookies.get('userName');
            }
  }
  return authenticationObject;
})
