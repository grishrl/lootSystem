angular.module('lootSystem').controller('logOutController',function(auth,$scope,$state){
  $scope.logOut = function(){
    auth.removeAuthentication();
    //add promise to resolve before leaving page.
    $state.go('signin');
  }
})
