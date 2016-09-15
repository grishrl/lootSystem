angular.module('lootSystem').controller('loginController',function(auth,$scope,$state, $http){
$scope.login = function(userData){
  if(userData){
    if(userData.name==undefined){
      $scope.visible = true;
      $scope.classInfo = "alert alert-warning"
      $scope.message='Username cannot be blank';
    }else if(userData.password==undefined){
      $scope.visible = true;
      $scope.classInfo = "alert alert-warning"
      $scope.message='Password cannot be blank';
    }else{
      $scope.visible = false;
      $scope.message=null;
      var hash = CryptoJS.SHA1(userData.password);
      userData.password=hash.toString();
      let validated = false;
      $http.post('/userLogin', userData).then(
        //successful validation
        (res)=>{
          //console.log(res.data.authenticationPacket);
          auth.setAuthentication(res.data.authenticationPacket);
          $state.go('home');
        },
      //error
      (res)=>{
        userData.password = null;
        $scope.visible = true;
        $scope.classInfo = "alert alert-warning"
        $scope.message=res.data.message;
      });
  }

}else{
  $scope.visible = true;
  $scope.classInfo = "alert alert-warning"
  $scope.message='Username cannot be blank';
}

  }
})
