angular.module('lootSystem').directive('navBar',function(auth){

  return {
    restrict:'E',
    replace:'true',
    templateUrl: '/templates/nav-bar.html',
    link: function(scope){
      function swapLog(){
        if(auth.isAuthenticated()){
          scope.authenticated=true;
        }else{
          scope.authenticated=false;
        }
      }
      swapLog();
      scope.$watch(function(){return auth.isAuthenticated()}, swapLog, true);
    }
  }
})
