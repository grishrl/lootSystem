angular.module('lootSystem',['ui.router','autoActive','ui.bootstrap','ngAnimate','ngCookies','dndLists','xeditable']).config(function($httpProvider){
  $httpProvider.interceptors.push(function($q, $injector, auth){
    return{
      responseError: function(rejection){
        if(rejection.status === 401){
          auth.removeAuthentication();
          $injector.get('$state').transitionTo('signin');
          return $q.reject(rejection);
        }else if(rejection.status === 403){
          alert(rejection.data.message);
          return $q.reject(rejection)
        }else{
          return $q.reject(rejection);
        }
      }
    }
  })
});
