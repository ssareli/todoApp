angular.module('todoApp.controllers',[]).controller('TodoListController',['$scope','Todo','$state','$stateParams','$localstorage',function($scope,Todo,$state,$stateParams,$localstorage){

    Todo.getAll().success(function(data){
        // copy db read to scope memory
        $scope.items=data.results;

        // create hash version of JSON file, indexed by objectID
        // goal is to be able to lookup items on the edit page
        // without passing every data field through params
        $scope.itemsHash = $scope.items.reduce(function(map, obj) {
            map[obj.objectId] = obj;
            return map;
        }, {});
        //console.log($scope.itemsHash);
        $localstorage.saveItems($scope.itemsHash);
    });

    // not currently being used
    $scope.onItemDelete=function(item){
        Todo.delete(item.objectId).success(function(){
            // Note needed currently with DB writes but for good housekeeping :)
             // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            delete $scope.itemsHash[item.objectId];
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            $scope.items.splice($scope.items.indexOf(item),1);            
        });
    }

/*   Depricated 8:28pm 1.1.2015
    $scope.done=function(item){
        Todo.edit(item.objectId,{done:true}).success(function(data){ 
        });    
        //$scope.items.splice($scope.items.indexOf(item),1);
    }

*/

    $scope.goal=function(item){
        Todo.edit(item.objectId,{goal:item.goal=!item.goal}).success(function(data){  
            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            $scope.itemsHash[item.objectId] = item;
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            //$state.go('todos');
        });    
    }

    $scope.doneToggle=function(item){
        Todo.edit(item.objectId,{done:item.done}).success(function(data){  
            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            $scope.itemsHash[item.objectId] = item;
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            //$state.go('todos');
        });    
        //$scope.items.splice($scope.items.indexOf(item),1);
    }

    /*
    $scope.doRefresh = function() {
        Todo.getAll().success(function(data){
            $scope.items=data.results;
        })
        .finally(function() {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        });
    };
    */

    //createTodo
    $scope.doRefresh2 = function() {
        $state.go('createTodo');
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    };


}]).controller('TodoCreationController',['$scope','Todo','$state','$localstorage',function($scope,Todo,$state,$localstorage){

    $scope.todo={};

    // establish default options
    if($scope.todo.goal != true) $scope.todo.goal = false;
    $scope.todo.softdeadline = "today";
    $scope.todo.duration = "0.25";

    $scope.create=function(){
        // calculate deadline
        if($scope.todo.deadlinedate != null) {
              $scope.todo.deadline = $scope.todo.deadlinedate;
             
        } else {
            switch($scope.todo.softdeadline) {
                case 'choose a date':
                    $scope.todo.deadline = 'error';
                    break;
                case 'today':
                    //$scope.todo.deadline = new Date();
                    $scope.todo.deadline = new Date().toLocaleDateString();
                    //$scope.todo.deadline = new Date().toUTCString;
                    //$scope.todo.deadline = dateTool.today();
                    break;
                case 'tomorrow':
                case 'this week':
                case 'this weekend':
                case 'next week':
                case 'next weekend':
                case 'this month':
                case 'next month':
                case 'within three months':
                case 'this year':
                case 'someday':
                default:
                    $scope.todo.deadline = 'no case matched';
            }
        }

        Todo.create({
            content:$scope.todo.content,
            done:false,
            goal:$scope.todo.goal,
            duration:$scope.todo.duration,
            deadline:$scope.todo.deadline,
            softdeadline:$scope.todo.softdeadline,
            deadlinetime:$scope.todo.deadlinetime,
            deadlinedate:$scope.todo.deadlinedate
        }).success(function(data){
            $state.go('todos');
        });
    }

}]).controller('TodoEditController',['$scope','Todo','$state','$stateParams','$localstorage',function($scope,Todo,$state,$stateParams,$localstorage){

    // get todo id from params
    $scope.todo={
        objectId:$stateParams.id
        /*,
        content:$stateParams.content,
        done:$stateParams.done,
        goal:$stateParams.goal,
        duration:$stateParams.duration,
        deadline:$stateParams.deadline,
        softdeadline:$stateParams.softdeadline,
        deadlinetime:$stateParams.deadlinetime,
        deadlinedate:$stateParams.deadlinedate
        */
    };

    //console.log($scope.todo);

    // pull todo object from hash memory in localstorage
    $scope.itemsHash = $localstorage.getObject("items");
    //console.log($scope.itemsHash[$scope.todo.objectId]);
    $scope.todo = $scope.itemsHash[$scope.todo.objectId];

    // Param to boolean converter
    if(String($scope.todo.done).toLowerCase() === 'true') {
        $scope.todo.done = true;
    } else {
        $scope.todo.done = false;
    }

    // Param to boolean converter
    if(String($scope.todo.goal).toLowerCase() === 'true') {
        $scope.todo.goal = true;
    } else {
        $scope.todo.goal = false;
    }

    $scope.edit=function(){
        // calculate deadline HOW DO I ONLY WRITE THIS CODE ONCE???
        if($scope.todo.deadlinedate != null) {
            $scope.todo.deadline = $scope.todo.deadlinedate;//.toLocaleDateString();
            $scope.todo.deadlinedate = $scope.todo.deadlinedate;//.toLocaleDateString();  
        } else {
            switch($scope.todo.softdeadline) {
                case 'choose a date':
                    $scope.todo.deadline = 'error';
                    break;
                case 'today':
                    $scope.todo.deadline = new Date();
                    //$scope.todo.deadline = new Date().toLocaleDateString();
                    //$scope.todo.deadline = new Date().toUTCString;
                    //$scope.todo.deadline = dateTool.today();
                    break;
                case 'tomorrow':
                case 'this week':
                case 'this weekend':
                case 'next week':
                case 'next weekend':
                case 'this month':
                case 'next month':
                case 'within three months':
                case 'this year':
                case 'someday':
                default:
                    $scope.todo.deadline = 'no case matched';
            }
        }

        Todo.edit($scope.todo.objectId,{
            content:$scope.todo.content,
            done:$scope.todo.done,
            goal:$scope.todo.goal,
            duration:$scope.todo.duration,
            deadline:$scope.todo.deadline,
            softdeadline:$scope.todo.softdeadline,
            deadlinetime:$scope.todo.deadlinetime,
            deadlinedate:$scope.todo.deadlinedate
        })
        .success(function(data){
            $state.go('todos');
        });
    }

    $scope.onItemDelete=function(){
        Todo.delete($scope.todo.objectId).success(function(data){
            $state.go('todos');
        });
    }


}]).controller('ContentController',['$scope','$ionicSideMenuDelegate',function($scope,$ionicSideMenuDelegate){
    
    $scope.toggleLeft = function(){
        $ionicSideMenuDelegate.toggleLeft();
    }

}]);




