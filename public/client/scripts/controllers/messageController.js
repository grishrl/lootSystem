angular.module('lootSystem').controller('messageController',function($http,$scope,auth){
  $scope.send=function(mail){
    console.log(mail);
    if(mail){
      if(!mail.to){
        $scope.visible = true;
        $scope.classInfo = "alert alert-warning"
        $scope.message="To cannot be empty.";
        $scope.toClass= "errorBorder"
      }else if(!mail.message){
        $scope.visible = true;
        $scope.classInfo = "alert alert-warning"
        $scope.message="Message Cannot be empty.";
        $scope.messageClass = "errorBorder";
      }else{
        var dat = {
          token:auth.isAuthenticated(),
          recipient:mail.to,
          message:mail.message
        };
          $http.post('/sendMessages',dat).then((res)=>{
            console.log(res);
          },(res)=>{
            console.log(res);
          })
      }
    }else{
      $scope.visible = true;
      $scope.classInfo = "alert alert-warning"
      $scope.message="Please enter some data.";
      $scope.messageClass = "errorBorder";
      $scope.toClass= "errorBorder"
    }


  }
})
