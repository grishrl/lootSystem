angular.module('lootSystem').run(function($timeout, $rootScope,$state,$location,auth){

  if($location.$$path.includes('permalink'))
  {
    return;
  }else if(!auth.isAuthenticated()){
    $timeout(function () {
      $state.go('signin');
    });
  }

      $rootScope.$on('$locationChangeStart', function(event, toState){

        if($location.$$path.includes('permalink')){
          return;
        }else if(!auth.isAuthenticated()){
          $state.go('signin');
        }else{
        }

      });
    })
