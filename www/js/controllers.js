angular.module('todoApp.controllers',[]).controller('TodoListController',['$scope','Todo','$state','$stateParams','$localstorage','DateUtil','DEFAULTS','CONFIG','$ionicActionSheet','$timeout','SORT_TYPE','DATE_NAME','SNOOZE_TYPE','$ionicListDelegate','FilterUtil',function($scope,Todo,$state,$stateParams,$localstorage,DateUtil,DEFAULTS,CONFIG,$ionicActionSheet,$timeout,SORT_TYPE,DATE_NAME,SNOOZE_TYPE,$ionicListDelegate,FilterUtil){

    $scope.addNewPlaceholder = DEFAULTS.ADD_NEW_PLACEHOLDER; 

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
    $scope.dateFilterHash = DateUtil.getDateHash();

    // set "show completed" to default value
    $scope.show = CONFIG.SHOW_COMPLETED;

    $scope.addDividers=function(items) {
        
        for(item in items) {

        }
    };

    $scope.searchFocus=function(){
        $scope.searchOn=!$scope.searchOn;
        //document.getElementById('searchInput').focus();
    };


    $scope.saveSnoozedItem=function(item){
        Todo.edit(item.objectId,{
                deadline:item.deadline,
                deadlineEpoch:item.deadlineEpoch
            }).success(function(data){  
            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            $scope.itemsHash[item.objectId] = item;
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            });    
    };


   // Popup dialog to snooze current task
    $scope.showSnooze = function(item) {
    //alphabetical, due date, creation date, priority
     
        //close open option slider
        $ionicListDelegate.closeOptionButtons();

       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: 'In Progress' },
           { text: 'Today' },
           { text: 'Tomorrow' },
           { text: 'in 2 Days' },
           { text: 'This Weekend' },
           { text: 'Next Week' },
           { text: 'Next Month' },
           { text: 'Someday' }

         ],
         //destructiveText: 'Delete',
         titleText: 'Soft Deadline Snoozing Options:',
         cancelText: 'Cancel',
         
         cancel: function() {
              // add cancel code..
            },

         buttonClicked: function(index) {
//            console.log("BUTTON CLICKED",index);  
            var pushObj = {
                text: null,
                date: null,
                epoch: null
            };

            switch(index) {
                case SNOOZE_TYPE.IN_PROGRESS:
                    pushObj.text = DATE_NAME.IN_PROGRESS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_IN_PROGRESS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.IN_PROGRESS];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    console.log("snooze:item.deadline:"+item.deadline);
                    $scope.saveSnoozedItem(item);
                    return(true);
    
                case SNOOZE_TYPE.TODAY:
                    pushObj.text = DATE_NAME.TODAY;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_TODAY];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.TODAY];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    console.log("snooze:item.deadline:"+item.deadline);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE.TOMORROW:
                    pushObj.text = DATE_NAME.TOMORROW;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_TOMORROW];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.TOMORROW];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    console.log("snooze:item.deadline:"+item.deadline);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE.TWO_DAYS:
                    pushObj.text = DATE_NAME.TWO_DAYS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_TWO_DAYS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.TWO_DAYS];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE.THIS_WEEKEND:
                    pushObj.text = DATE_NAME.THIS_WEEKEND;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_THIS_WEEKEND];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.THIS_WEEKEND];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE.NEXT_WEEK:
                    pushObj.text = DATE_NAME.NEXT_WEEK;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_NEXT_WEEK];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.NEXT_WEEK];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true); 

                case SNOOZE_TYPE.NEXT_MONTH:
                    pushObj.text = DATE_NAME.NEXT_WEEK;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_NEXT_MONTH];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.NEXT_MONTH];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);  

                case SNOOZE_TYPE.SOMEDAY:
                    pushObj.text = DATE_NAME.NEXT_WEEK;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_SOMEDAY];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.SOMEDAY];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);              

                default:
                    pushObj.text = DATE_NAME.NEXT_WEEK;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_SOMEDAY];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.SOMEDAY];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);
            }
            return true;
        }
       });
       // For example's sake, hide the sheet after two seconds
       $timeout(function() {
         //hideSheet();
       }, 2000);
    };

    // Triggered on a button click, or some other target
    $scope.showSort = function() {
    //alphabetical, due date, creation date, priority
     
       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: 'Sort Alphabetically' },
           { text: 'Sort by Due Date' },
           { text: 'Sort by Creation Date' },
           { text: 'Sort by Deadline, Priority (default)' },
           { text: 'Sort by Priority'}

         ],
         //destructiveText: 'Delete',
         titleText: 'Sorting Options:',
         cancelText: 'Cancel',
         
         cancel: function() {
              // add cancel code..
            },

         buttonClicked: function(index) {
//            console.log("BUTTON CLICKED",index);    
            // save sort index type
            CONFIG.SORT_ORDER = index;
            //console.log("buttonClick.sort_order:"+CONFIG.SORT_ORDER);
            return true;
        }
       });

       // For example's sake, hide the sheet after two seconds
       $timeout(function() {
         //hideSheet();
       }, 2000);

    };

    // This method is called by ng-repeat to order the todo list.
    // the orderBy method needs an object property to order by
    $scope.predicateVal=function(item) {

        switch(CONFIG.SORT_ORDER) {
            case SORT_TYPE.ALPHABETICAL:
                //console.log("sort_type: '+content'");
                $scope.reverse = false;
                return([item.content,'']);
            case SORT_TYPE.DUE_DATE:
                //console.log("sort_type: '+deadlineEpoch'");
                $scope.reverse = false;
                return([item.deadlineEpoch,'']);
            case SORT_TYPE.CREATION_DATE:
                //console.log("sort_type: '-createdAt'");
                $scope.reverse = true;
                return([item.createdAt,'']);
             case SORT_TYPE.DEADLINE_PRIORITY:
                //console.log("sort_type: '+deadlineEpoch,+priority");  
                $scope.reverse = false;
                 return([item.deadlineEpoch,item.priority]);  
             case SORT_TYPE.PRIORITY:
                //console.log("sort_type: '+priority'");  
                $scope.reverse = false;
                 return([item.priority,'']);          
            default:
                //console.log("(default)sort_type: '+priority'");
                $scope.reverse = false;
                return([item.priority,'']);
        }
    }

    $scope.updateFilters=function(filter) {
        // update filter temporarily
        $scope.dateFilterOption = filter;
        //$scope.listFilterOption = projectFilter;

        // update sorting temporarily
        CONFIG.SORT_ORDER = SORT_TYPE.CREATION_DATE;
        console.log($scope.dateFilterOption);
    };

    // toggle whether to show completed or not and save it to singleton
    $scope.showCompleted=function(){
        $scope.show = CONFIG.SHOW_COMPLETED = !CONFIG.SHOW_COMPLETED;
        //console.log("showCompleted.state:"+CONFIG.SHOW_COMPLETED);
    };

    // reset storage to defaults  
    $scope.reset=function(){
        $localstorage.reset();
    };

    // save last user date range selection
    $scope.dateFilterUpdate=function(selection){
        
        // save option
        $localstorage.set("dateFilterOption",selection);
        // set option
        $scope.dateFilterOption = selection;

        //console.log("dateFilterOption"+selection);
        //console.log("new filter saved!");
    };

    // return a timestamp for filtering results
    $scope.dateFilter=function(item) {
     //   $scope.dateFilter=function(item) {
        // get saved dateFilter option or use defaults
 /*
        CAN I REMOVE THIS DISK WRITE????
 */
        if($scope.dateFilterOption==null) {
            $scope.dateFilterOption = 
                $localstorage.get("dateFilterOption",DEFAULTS.DATE_FILTER);
        }

        var d = $scope.dateFilterHash[$scope.dateFilterOption];
        
 //       console.log("item.content:"+item.content);
 //       console.log("item.timestamp:"+item.deadlineEpoch);
 //       console.log("filter.timestamp:"+d);

        if(item.deadlineEpoch==1) {
            // inbox only
            if($scope.dateFilterOption==DEFAULTS.QUICKADD_DEADLINE) {
                return(true);
            } else {
                return(false);
            }
        } else {
            // normal behavior
            return(item.deadlineEpoch<=d);
        }
    };

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

        //close open option slider
        $ionicListDelegate.closeOptionButtons();  
    };

/*   Depricated 8:28pm 1.1.2015
    $scope.done=function(item){
        Todo.edit(item.objectId,{done:true}).success(function(data){ 
        });    
        //$scope.items.splice($scope.items.indexOf(item),1);
    }

*/

    $scope.priorityText = function(priority) {
        //console.log(priority);
        switch(priority) {
            // must
            case 2:
            case 3:
                return("must complete");
            // prefer
            case 4:
            case 5:
                return("prefer to complete");
            // reminder
            case 6:
            case 7:
                return("reminder only");
            default:  
                return("ERROR");
        }
    };

    $scope.goal=function(item){
        // toggle goal setting
        item.goal=!item.goal;

        // increment/decrment priority
        item = DateUtil.adjustPriority(item);

        Todo.edit(item.objectId,{
                goal:item.goal,
                priority:item.priority}).success(function(data){  
            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            $scope.itemsHash[item.objectId] = item;
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            //$state.go('todos');

        });    
        //close open option slider
        $ionicListDelegate.closeOptionButtons();  
    };

    $scope.doneToggle=function(item){
        item.done = !item.done;

        // mark item completed using epoch millisecond time
        if(item.done) {
            item.completedAt = new Date().getTime();
        } else {
            item.completedAt = 0;
        }

        Todo.edit(item.objectId,{done:item.done,completedAt:item.completedAt}).success(function(data){  

            // pull existing hash from localstorage
            $scope.itemsHash = $localstorage.getObject("items");
            // update item that was changed
            $scope.itemsHash[item.objectId] = item;
            // replace localstorage copy
            $localstorage.saveItems($scope.itemsHash);
            //$state.go('todos');
        });    
        //$scope.items.splice($scope.items.indexOf(item),1);
    };

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

}]).controller('TodoQuickAddController',['$scope','Todo','$state','DateUtil','DEFAULTS','$localstorage','$timeout',function($scope,Todo,$state,DateUtil,DEFAULTS,$localstorage,$timeout){
    // Quickadd new items with just a line of text
    $scope.addNewItem=function() {
        // use default options but no deadlines
        //console.log("[addNewItem]content:"+$scope.newItem);

        
        var todo={};
        todo.content = "made it dood";

        console.log("items before:");
        console.log($scope.items.length);

            //$scope.items.splice(0,1,todo); 
            $scope.items.unshift(todo);
            //$scope.items.splice(0,1,todo);  
            //$scope.$apply();

        console.log("items after:");
        console.log($scope.items.length);

        //$scope.filterTxt = '';

        Todo.create({
            content:$scope.newItem,
            done:false,
            goal:DEFAULTS.GOAL,
            duration:DEFAULTS.DURATION,
            deadline:DEFAULTS.DEADLINE,
            softdeadline:DEFAULTS.QUICKADD_DEADLINE,//'Inbox' so won't show anything;
            deadlinetime:DEFAULTS.DEADLINE_TIME,
            deadlinedate:DEFAULTS.DEADLINE_DATE,
            priority:DEFAULTS.PRIORITY,
            active:DEFAULTS.ACTIVE,
            startTime:DEFAULTS.START_TIME,
            completedAt:DEFAULTS.COMPLETED_DATE,
            deadlineEpoch:DEFAULTS.DEADLINE_EPOCH,// 1
            comments:DEFAULTS.COMMENTS       
        }).success(function(data){
        
            Todo.getAll().success(function(data){
                // copy db read to scope memory
                console.log("[addNewItem] new item saved and pulling fresh JSON....");
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
                $state.go('todos');
            });
        
        });

        // give user feedback
        $scope.newItem = "";
        $scope.addNewPlaceholder = "item saved!...";

        $timeout(function() {        
            // clear input box
            $scope.addNewPlaceholder = DEFAULTS.ADD_NEW_PLACEHOLDER; 
        }, 330); // delay 250 ms

    };

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
    $scope.todo.completedAt = DEFAULTS.COMPLETED_DATE;

    $scope.create=function(){
        // increment/decrment if a goal
        $scope.todo = DateUtil.adjustPriority($scope.todo);
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
            completedAt:$scope.todo.completedAt,
            deadlineEpoch:$scope.todo.deadlineEpoch,
            comments:$scope.todo.comments          
        }).success(function(data){
            $state.go('todos');
        });
    };

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

        // increment/decrment if a goal
        $scope.todo = DateUtil.adjustPriority($scope.todo);
      

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
            completedAt:$scope.todo.completedAt,
            deadlineEpoch:$scope.todo.deadlineEpoch,
            comments:$scope.todo.comments            
        })
        .success(function(data){
            $state.go('todos');
        });
    };

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
    };


}]).controller('ContentController',['$scope','$ionicSideMenuDelegate',function($scope,$ionicSideMenuDelegate){
    
    $scope.toggleLeft = function(){
        $ionicSideMenuDelegate.toggleLeft();
    };


}]).value('DEFAULTS',{
    PRIORITY: 5, // prefer to complete (even #s are goals)
    DURATION: '0.25',
    SOFT_DEADLINE: 'Today',
    QUICKADD_DEADLINE: 'Inbox',
    GOAL: false,
    ACTIVE: true,
    START_TIME: null,
    DEADLINE: 'unscheduled',
    DEADLINE_TIME: null,
    DEADLINE_DATE: null,
    COMPLETED_DATE: 0,
    DATE_FILTER: 'In Progress',
    DEADLINE_EPOCH: 1,
    COMMENTS: '',
    ADD_NEW_PLACEHOLDER: 'Add an item...'

}).constant('SORT_TYPE',{
    ALPHABETICAL: 0,
    DUE_DATE: 1,
    CREATION_DATE: 2,
    DEADLINE_PRIORITY: 3,
    PRIORITY: 4
 
 }).constant('SNOOZE_TYPE',{
    IN_PROGRESS: 0,
    TODAY: 1,
    TOMORROW: 2,
    TWO_DAYS: 3,
    THIS_WEEKEND: 4,
    NEXT_WEEK: 5,
    NEXT_MONTH: 6,
    SOMEDAY: 7,
    DEADLINE: 8

});




