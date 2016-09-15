angular.module('lootSystem').controller('createUserController', function($scope, $state, $http, auth){
  $scope.create = function (user){
    $scope.visible = false;
    $scope.message=null;
    var passwordValid = false;
    if(user.password == user.confirmPassword){
      passwordValid = true;
    }

    if(passwordValid){
      var hash = CryptoJS.SHA1(user.password);
      user.password=hash.toString();
      $http.post('/createUser', user).then((res)=>{
        auth.setAuthentication(res.data.authenticationPacket);
        $state.go('home');
      },(res)=>{
        $scope.visible = true;
        $scope.classInfo = "alert alert-warning";
        $scope.message=res.data.message;
        user.password=null;
      });
    }else{
      $scope.border = "errorBorder";
      $scope.visible = true;
      $scope.classInfo = "alert alert-warning";
      $scope.message="Passwords do not match.";
    }

  }

})
