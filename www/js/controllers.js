angular.module('todoApp.controllers',[]).controller('TodoListController',['$scope','Todo','$state','$stateParams','$localstorage','DateUtil',function($scope,Todo,$state,$stateParams,$localstorage,DateUtil){

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

    // date hash
    $scope.dateFilterHash = DateUtil.getTimeBuckets();

    // reset storage to defaults   DOESN'T WORK
    $scope.reset=function(){
        $localstorage.reset();
    }

    // save last user date range selection
    $scope.dateFilterUpdate=function(selection){
        
        $localstorage.set("dateFilterOption",selection);

        //console.log("dateFilterOption"+selection);
        //console.log("new filter saved!");
    }

    // return a timestamp for filtering results
    $scope.dateFilter=function(item,dateFilterOption) {
        // get saved dateFilter option or use defaults
        $scope.dateFilterOption = $localstorage.get("dateFilterOption","Today");

        var d = $scope.dateFilterHash[$scope.dateFilterOption];
        console.log("dateFilterOption:"+$scope.dateFilterOption);
        
        return(item.deadlineEpoch<d);
    }

    $scope.onItemDelete=function(item){
        Todo.delete(item.objectId).success(function(){
            // Note needed currently with DB writes but for good housekeeping,
            // specifically to avoid a memory leak.
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
        item.done = !item.done;

        console.log("item.done:"+item.done);

        // mark item completed using epoch seconds
        if(item.done) {
            item.completedDate = new Date().getTime();
        } else {
            item.completedDate = null;
        }
        console.log("item.completeDate:"+item.completedDate);

        Todo.edit(item.objectId,{done:item.done,completedAt:item.completedDate}).success(function(data){  

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

/*
    $scope.getDeadline = function(item) {
        var deadline = "";
        console.log(item);
        if(item.deadlinetime != null) {
            deadline = item.deadlinedate + " @ " + item.deadlinetime;
        } else {
            deadline = item.deadlinedate;
        }
        return(deadline);
    }
    */

}]).controller('TodoCreationController',['$scope','Todo','$state','DateUtil','DEFAULTS',function($scope,Todo,$state,DateUtil,DEFAULTS){

    $scope.todo={};

    // establish default options
    $scope.todo.priority = DEFAULTS.PRIORITY;
    $scope.todo.goal = DEFAULTS.GOAL;
    $scope.todo.softdeadline = DEFAULTS.SOFT_DEADLINE;//"today";
    $scope.todo.duration = DEFAULTS.DURATION;//"0.25";
    $scope.todo.active = DEFAULTS.ACTIVE;
    $scope.todo.startTime = DEFAULTS.START_TIME;
    $scope.todo.deadline = DEFAULTS.DEADLINE;
    $scope.todo.deadlinetime = DEFAULTS.DEADLINE_TIME;
    $scope.todo.deadlinedate = DEFAULTS.DEADLINE_DATE;
    $scope.todo.completedDate = DEFAULTS.COMPLETED_DATE;

    $scope.create=function(){
        /*
          DateUtil Service calculates all the soft deadlines and 
          ensures consistent date formats.
        */
        $scope.todo = DateUtil.setDeadline($scope.todo);  

        Todo.create({
            content:$scope.todo.content,
            done:false,
            goal:$scope.todo.goal,
            duration:$scope.todo.duration,
            deadline:$scope.todo.deadline,
            softdeadline:$scope.todo.softdeadline,
            deadlinetime:$scope.todo.deadlinetime,
            deadlinedate:$scope.todo.deadlinedate,
            priority:$scope.todo.priority,
            active:$scope.todo.active,
            startTime:$scope.todo.startTime,
            completedAt:$scope.todo.completedDate,
            deadlineEpoch:$scope.todo.deadlineEpoch          
        }).success(function(data){
            $state.go('todos');
        });
    }

}]).controller('TodoEditController',['$scope','Todo','$state','$stateParams','$localstorage','DateUtil',function($scope,Todo,$state,$stateParams,$localstorage,DateUtil){

    // get todo id from params
    $scope.todo={ objectId:$stateParams.id };

    //console.log($scope.todo);
    // pull todo object from hash memory in localstorage
    $scope.itemsHash = $localstorage.getObject("items");
    //console.log($scope.itemsHash[$scope.todo.objectId]);
    $scope.todo = $scope.itemsHash[$scope.todo.objectId];

    $scope.edit=function(){

        $scope.todo = DateUtil.setDeadline($scope.todo);        

        Todo.edit($scope.todo.objectId,{
            content:$scope.todo.content,
            done:$scope.todo.done,
            goal:$scope.todo.goal,
            duration:$scope.todo.duration,
            deadline:$scope.todo.deadline,
            softdeadline:$scope.todo.softdeadline,
            deadlinetime:$scope.todo.deadlinetime,
            deadlinedate:$scope.todo.deadlinedate,
            priority:$scope.todo.priority,
            active:$scope.todo.active,
            startTime:$scope.todo.startTime,
            completedAt:$scope.todo.completedDate,
            deadlineEpoch:$scope.todo.deadlineEpoch          
        })
        .success(function(data){
            $state.go('todos');
        });
    }

    $scope.onItemDelete=function(){
        Todo.delete($scope.todo.objectId).success(function(data){
            // Note needed currently with DB writes but for good housekeeping,
            // specifically to avoid a memory leak.
            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            delete $scope.itemsHash[$scope.todo.objectId];
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);            
            $state.go('todos');
        });
    }


}]).controller('ContentController',['$scope','$ionicSideMenuDelegate',function($scope,$ionicSideMenuDelegate){
    
    $scope.toggleLeft = function(){
        $ionicSideMenuDelegate.toggleLeft();
    }

}]).value('DEFAULTS',{
    PRIORITY: 'prefer to complete by',
    DURATION: '0.25',
    SOFT_DEADLINE: 'today',
    GOAL: false,
    ACTIVE: true,
    START_TIME: null,
    DEADLINE: null,
    DEADLINE_TIME: null,
    DEADLINE_DATE: null,
    COMPLETED_DATE: 0
});




