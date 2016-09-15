// the GROUPDROPDOWNDIRECTIVE is nested inside this controller
//
angular.module('lootSystem').controller('listDropdownController',function(groupSprocket,auth,$scope){
  /* commented out 8/31/16 this code no longer served purpose
   //make an object containing the user token
     //var passObj = {};
    passObj.token = auth.isAuthenticated();

  //retrieve groups based on token/userID
    groupSprocket.groupListRet(passObj).then((res)=>{
      $scope.groups = res.data.data;
    },(res)=>{});*/

//using nesting scopes, putting the group drop down directive inside the listDropdownController, can manipulate the on CLICK to do:
//8/31/2016 - THIS IS ONLCICK FROM GROUPDROPDOWNDIRECTIVE!!
    $scope.passGroup = function(group){
      //this enables the 'create list' button on the list management page and the permalink button on the loot page
    $scope.groupClicked = true;
    //sets a scope varialbe that is watched, to enable listDrop
    $scope.groupSelected = group;
    //change the text of the button to the selected group
    $scope.buttonText = group.name +" ";

  }


})

//this controller gives the select list button lists and loads the selected list
.controller('currentListController',function(auth,$scope,$http,$state,$rootScope){

  //initialize the button text
  $scope.listWarning = "Select Group"

//define a function to be called when a new value is selected in the group scope variable
  var getList = function(newVal,oldVal,scope){
    //if the same group is selected do nothing.
    if(newVal==oldVal){
      console.log('was same group');
      return
    }else{

      //clear the state so all the old info is gone by reloading the current state


      //set the scope variable lists to null, this is what is used for populating the drop down
      $scope.lists = [];
      //create an object for the http call
      var dat = {};
      dat.token = auth.isAuthenticated();
      dat.queryID = newVal._id;
      dat.query = 'groupid';

      $http.post('/getLists',dat).then((res)=>{
            var postData = res.data.data
            //if any data was returned
            if(postData.length>0){
              //append the group name to the list -
              //the object is passed by state params to the next route/state to populate other fields
              angular.forEach(postData,function(index){
                index.groupName=newVal.name;
              })
              //modify the button text
              $scope.listWarning = "Current Lists"
              $scope.lists=postData;
            }else{
              // no lists for that group, modify the button text
              $scope.listWarning = "No Lists for Group!"
            }
            var reloadState = $state.current
            if(reloadState.name.indexOf('.')>0){
              var x = reloadState.name.indexOf('.');
              var parentState = reloadState.name.substr(0,x);
              return $state.go(parentState)
            }


      },
      (res)=>{})
    }

  }

  //watch the scope variable for changes, if there is a change call the getList
  $scope.$watch(function(){return $scope.groupSelected},function(newValue,oldValue){
    if(newValue){getList(newValue)}
  },true);

  //watch the scope for the list-created event to be emited, when it is, refresh the list dropdown
  $rootScope.$on('list-created',function(event, dat){
    getList(dat);
  });

})


.controller('listInfoController',function($stateParams,$scope,$state,auth,$http){
  //if the stateparms are null send us to top level of page
  var reloadState = $state.current
  var x = reloadState.name.indexOf('.');
  var parentState = reloadState.name.substr(0,x);
  if(!$stateParams.groupObj){ return $state.go(parentState)}

  //if we reloaded the page after a change, refresh the list history to match
  refreshListHistory();

  //pass the group name and list name to scope; this displays the group name and list name on the panel headers
  $scope.groupName=$stateParams.groupObj.groupName;
  $scope.listName = $stateParams.groupObj.name;
  //create a variable list for passing to HTTP
  var listDat = {
    token:auth.isAuthenticated(),
    listID:$stateParams.groupObj._id
  };

  getListData(listDat);


function getListData(listDat){

  $http.post('/getList',listDat).then(
    (res)=>{
      var retDat = res.data.data;
      var groupID = retDat.associateId;
      //variable to contain members of the returned data
      var list = retDat.members;

      //returnted users will have _ids if they are linked members
      //we need to get them easily understandable names
      //create an array to put all users in
      var userData = [];

      //add only the user portion of the members array
      for(var i = 0; i<list.length;i++){
        userData.push(list[i].user)
      }

      //build an object for passing to http
      var userQuery = {
        token: auth.isAuthenticated(),
        payload: userData
      };
      $http.post('/userIDQuery',userQuery).then(
        (res)=>{
          //array to contain the properly formatted username info
          var listArr = [];
          //users returned from the ID query
          var returnedUsers = res.data.data;
          //loop through the returned users
          for(var i = 0;i<returnedUsers.length;i++){
            //loop through the originally returned members
              for(var x = 0; x<list.length;x++){
                //if we get a mactch on the IDs we need to give object a friendly name,
                // we also keep the ID because the ID is used for reference in dB (if they are registered)
                if(list[x].user==returnedUsers[i]._id){
                  list[x].friendlyName = returnedUsers[i].userName;
                }
              }
            }

            //the drag and drop list requires a 'label' to display info
            //loop through the list
            for(var i = 0; i<list.length;i++){
              //create a temp obj
              var tempObj = {};
              //if we have a friendlyName (stated otherwise an ID or registerd user)
              if(list[i].friendlyName){
                //give the label the friendly name
                tempObj.label=list[i].friendlyName;
                //make the user the ID, this is used for other functions in app
                tempObj.userID=list[i].user;
              }else{
                //else just make the label the user
                tempObj.label=list[i].user;
                tempObj.userID=list[i].user;
              }
              //give the object the 'active' status from the dB (used for turning users on and off on LOOT)
              tempObj.active=list[i].active;
              //this is required for the drag and drop lists
              tempObj.drag=true;

              //
              listArr.push(tempObj);
            }
            var dat = {
              token:auth.isAuthenticated(),
              groupID:groupID
            }
            $http.post('/getGroup',dat).then((res)=>{
              var noteArr = res.data.data.notes;

              //loop through the member notes array
              for(var i = 0;i<noteArr.length;i++){
                //loop through original array
                for(var x =0;x<listArr.length;x++){
                  if(noteArr[i].user==listArr[x].userID){
                  listArr[x].note = noteArr[i].note;
                  }
                }
              }
              //scope variable is the created array

              $scope.list1=listArr;
            },(res)=>{
              //error getting member notes
                        })


          }
    ,(res)=>{
      //error finding user data
    })}
    ,(res)=>{
    //there was an error finding the list
    console.log(res);
  })
}
//----------------------------------------------------------------------------------
$scope.myFunction =function(){
  $scope.orgList = $scope.list1.slice();
}
//----------------------------------------------------------------------------------
//reArrangeList
  $scope.reArrangeList = function(index,pList){
    var list = $scope.list1;
    console.log($scope.orgList);
    console.log(list);

    var movedUser = list[index].userID;;
    //commented out 8/31/2016
    // this can be removed by adding user to both cases from the userIDQuery
    /*if(list[index].userID){
      movedUser=list[index].userID;
    }else{
      movedUser=list[index].label;
    }*/

    //moved the object arround in the array
    list.splice(index,1);


    //create an array of the new list order, this goes in the object to HTTP
    if(testArr(list, $scope.orgList)){
      //if they are the same, do nothing
      console.log('no change');
    }else{
      //if there was a change, do some stuff.
      var temparr = [];
      for(var i = 0;i<list.length;i++){
        /*
        // removed 8/31/2016 this was no longer needed because I added userID to all cases above
        var standName;
        if(list[i].userID){
          standName = list[i].userID;
        }else{
          standName = list[i].label;
        }*/

        //this format is requred for the dB
        var tempobj = {
          user: list[i].userID,
          active: list[i].active
        }
        temparr.push(tempobj);
      }
      //$scope.list1 = list;

      //create a token for the HTTP call
      var dat = {}
      dat.token=auth.isAuthenticated();
      dat.memberOrder = temparr;
      dat.listID = $stateParams.groupObj._id;
      dat.actedUpon = movedUser;

  //post the rearranged list to dB
      $http.post('/reArrangeList',dat).then((res)=>{
        //if it was successful display the message from server
        $scope.list1 = list;
        refreshListHistory();
      },
      (res)=>{
        //if it was unsuccessful display the message from server
      //  $scope.list1=null;
        if(res.data.code==21){
          var listDat = {
            token:auth.isAuthenticated(),
            listID:$stateParams.groupObj._id
          };
          getListData(listDat);
        }
      })
    }


  };

//   9/14/2016  this function tests arrays and returns true or false depending on changes to the list order
//    prevents dB calls and history logs when ever a user is clicked and dragged but not actually moved in order.
  function testArr(arr1,arr2) {
    arr1 = arr1.slice();
    arr2= arr2.slice();
    for(var i = 0;i<arr1.length;i++){
      delete arr1[i]['$$hashKey'];
      delete arr2[i]['$$hashKey'];
      console.log(arr1[i]);
      console.log(arr2[i]);
      if(JSON.stringify(arr1[i]) == JSON.stringify(arr2[i])){
        //if the elements match, do nothing
      }else{
      return false;
      }
    }
    return true;
  }

//-----------------------------------------------------------------------------
//activate or inactivate a raider
  $scope.activate = function(userID,onOff){
    //build an object for the http call
    var dat = {};
    dat.token=auth.isAuthenticated();
    dat.listID=$stateParams.groupObj._id;
    dat.user=userID;
    // 8/31/2016 removed, no longer needed userID added to all objects
    /*if(userID){
      dat.user=userID;
    }else{
      dat.user=userLabel;
    }*/
    //this helps annotate the notes for history, is either
    //activated / deactivated
    dat.onOff = onOff;
    $http.post('activateUser',dat).then((res)=>{
      //if the call is made successful to dB, swap the data in scope,
      //no refresh made here.
      var arr = $scope.list1;
      for(var i = 0;i<arr.length;i++){
        if(arr[i].userID == dat.user){
          arr[i].active = !arr[i].active;
        }

      }
      //refresh history to show the changes logged
      refreshListHistory();
    },(res)=>{
      console.log(res);
    });
};

//-------------------------------------------------------------------------------
//assign loot
  $scope.assignLoot=function(id,lootNote){
    var arr = $scope.list1.slice();
    var org = $scope.list1.slice();

    //build an array that holds inactive members
    //these members maintain position in line
    var positions= [];

    for(var i = 0;i<arr.length;i++){
      if(!arr[i].active){
        temp = arr[i];
        temp.order = i;
        //push the data plus the orginal position number into the array
        //the original position is needed because of reference arrays
        positions.push(temp);
      }
    }

    //step through the original
    for(var i =0;i<arr.length;i++){
      //step through the incative member array
      for(var x=0;x<positions.length;x++){
        //match inactives insied the original
        if(arr[i].label==positions[x].label){
          //remove them from the array all that is left is active members
          arr.splice(i,1);
        }
      }
    }

    //run the line like normal for all active members, shift the winner to the bottom and everyone else moves up a rung
    for(var i = 0; i<arr.length;i++){
      //if this is more than zero - don't touch
      // this will prevent us from moving the same item more than once
      //.... or does it do anything?
      var touchCount = 0;
      if(touchCount == 0){
        if(arr[i].label==id.label){
        var temp=arr[i];
        arr.splice(i,1);
        arr.push(temp);
        touchCount+=1;
      }}else{
        console.log('the touchcount did something!');
      }
    }

    //reinsert the inactive members in their original position in line
    for(var i = 0; i<positions.length;i++){
      if(positions[i]){
          arr.splice(positions[i].order,0,positions[i]);
      }
    }


    var prettify = [];
    for(var i = 0;i<arr.length;i++){
      var tempObj = {};
    //commented out 8/31/16 this was no longer needed, userID added to both cases
  /*    if(arr[i].userID){
      tempObj.user = arr[i].userID;
    }else{
    tempObj.user = arr[i].label;
  }*/
      tempObj.user = arr[i].userID;
      tempObj.active = arr[i].active;
      prettify.push(tempObj);
    }

    var dat = {
      token : auth.isAuthenticated(),
      listID : listID=$stateParams.groupObj._id,
      memberID : id.userID,
      loot : true,
      memberOrder : prettify,
      note: id.lootNote
    };
    //post the rearranged list to the server
    $http.post('reArrangeList',dat).then((res)=>{
      $scope.list1=arr;
      //clear the note field
      id.lootNote=""
      //refresh the history
      refreshListHistory();
    },(res)=>{
      $scope.list1=org;
      //alert an error --- giving loot DID NOT OCCUR

    })

  };


//---------------------------------------------------------------------------------------------------------
//filling the history box
function refreshListHistory(){
  //build obj for http -- this is for the history call
  var listDat = {
    token:auth.isAuthenticated(),
    type:'list',
    listID:$stateParams.groupObj._id
  }

  $http.post('/history', listDat).then((res)=>{
    if(res){
      var arr = res.data.data;
      //build set for user IDs
      var users = new Set();
      for(var i=0;i<arr.length;i++){
        //cycle through the array and capture all the actors and acted upons
        if(arr[i].actor!=undefined&&arr[i].actor!=null)
        {
          users.add(arr[i].actor)
        };
        if(arr[i].actedUpon!=undefined&&arr[i].actedUpon!=null){
          users.add(arr[i].actedUpon);
        }

      }
      //build obj for http call for users!
      var userDat = {
        token:auth.isAuthenticated(),
        payload:Array.from(users) //cast set to array
      };
      $http.post('/userIDQuery',userDat).then((res)=>{
        var returnedUsers = res.data.data;
        //loop through the array and the returned users, if _ids match enter user friendly name
        for(var x = 0; x<returnedUsers.length; x++){
          for(var i=0;i<arr.length;i++){
            if(arr[i].actor==returnedUsers[x]._id){
              arr[i].actor=returnedUsers[x].userName;
            }
            if(arr[i].actedUpon==returnedUsers[x]._id){
              arr[i].actedUpon=returnedUsers[x].userName;
            }
          }
        }
        $scope.listHist = arr;
      },(res)=>{})
    }
  },(res)=>{}

  )
}

})
