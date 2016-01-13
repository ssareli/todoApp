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

 
   //populate filter selection
    $scope.filters = [];  

    // manually insert minutes
    $scope.filters.push({name:'Inbox',value:'Inbox'});
    $scope.filters.push({name:'In Progress',value:'In Progress'});
    $scope.filters.push({name:'Today',value:'Today'});
    //$scope.filters.push({name:'Tomorrow',value:'Tomorrow'});

    var weekDays = DateUtil.getRemainingWeekDays();
    var i = 0;

    console.log("weekdays:"+weekDays);

    // add in options for remaining days in the week
    for(i=0; i<weekDays.length; i++) {
        $scope.filters.push({name: weekDays[i], value: weekDays[i]});
    }

    $scope.filters.push({name:'This Week',value:'This Week'});
    $scope.filters.push({name:'Next Week',value:'Next Week'});
    $scope.filters.push({name:'This Month',value:'This Month'});
    $scope.filters.push({name:'This Quarter',value:'This Quarter'});
    $scope.filters.push({name:'This Year',value:'This Year'});
    $scope.filters.push({name:'Next Year',value:'Next Year'});



    $scope.addDividers=function(items) {
        
        for(item in items) {

        }
    };

    $scope.makeItShort = function(message) {
        // set max char length using constant
        length = DEFAULTS.TITLE_LENGTH;
        return (message.substring(0,length));//+"...");
    };

    $scope.shortMessage=function(message) {
        return((message.length>DEFAULTS.TITLE_LENGTH) ? 
            $scope.makeItShort(message) : message);
    };

    $scope.shortMessageNeeded=function(message) {
        return(message.length>DEFAULTS.TITLE_LENGTH);
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
           { text: '+2 Days' },
           { text: '+3 Days' },
           { text: 'This Weekend' },
           { text: 'Next Week' },
           { text: '+2 Weeks' },           
           { text: 'Next Month' },
           { text: '+30 Days' },
           { text: '+60 Days' },
           { text: 'Next Year' }

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

                case SNOOZE_TYPE.THREE_DAYS:
                    pushObj.text = DATE_NAME.THREE_DAYS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_THREE_DAYS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.THREE_DAYS];
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

                case SNOOZE_TYPE.TWO_WEEKS:
                    pushObj.text = DATE_NAME.TWO_WEEKS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_TWO_WEEKS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.TWO_WEEKS];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true); 

                case SNOOZE_TYPE.NEXT_MONTH:
                    pushObj.text = DATE_NAME.NEXT_MONTH;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_NEXT_MONTH];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.NEXT_MONTH];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);  

                case SNOOZE_TYPE._30_DAYS:
                    pushObj.text = DATE_NAME._30_DAYS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_30_DAYS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME._30_DAYS];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE._60_DAYS:
                    pushObj.text = DATE_NAME._60_DAYS;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_60_DAYS];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME._60_DAYS];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);

                case SNOOZE_TYPE.NEXT_YEAR:
                    pushObj.text = DATE_NAME.NEXT_YEAR;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_NEXT_YEAR];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.NEXT_YEAR];
                    item = DateUtil.updateSnoozedDeadlines(item,pushObj);
                    $scope.saveSnoozedItem(item);
                    return(true);              

                default:
                    pushObj.text = DATE_NAME.NEXT_WEEK;
                    pushObj.date = $scope.dateFilterHash[DATE_NAME.H_NEXT_YEAR];
                    pushObj.epoch = $scope.dateFilterHash[DATE_NAME.NEXT_YEAR];
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
        $localstorage.set("dateFilterOption",selection.value);
        // set option
        $scope.dateFilterOption = selection.value;

        console.log("dateFilterOption"+selection.value);
        console.log("new filter saved!");
    };

    // return a timestamp for filtering results
    $scope.dateFilter=function(item) {
     //   $scope.dateFilter=function(item) {
        // get saved dateFilter option or use defaults

        if($scope.dateFilterOption==null) {
            $scope.dateFilterOption = 
                $localstorage.get("dateFilterOption",DEFAULTS.DATE_FILTER);
        }

        // d = selected filter
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

/*
        // for tomorrow just show things after today
        } else if($scope.dateFilterOption==DEFAULTS.TOMORROW_DEADLINE) {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }
*/
        } else if($scope.dateFilterOption=="Monday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }
        } else if($scope.dateFilterOption=="Tuesday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }
        } else if($scope.dateFilterOption=="Wednesday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }
        } else if($scope.dateFilterOption=="Thursday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }   
        } else if($scope.dateFilterOption=="Friday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
            }   
        } else if($scope.dateFilterOption=="Saturday") {
            // return true when deadline is betwee tomorrow start and end
            if((item.deadlineEpoch>=d) && (item.deadlineEpoch<(d+86400000)))  {
                return true;
            } else {
                return false;
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
            case 2:
            case 3:
                return("must complete");
            // prefer
            case 4:
            case 5:
                return("should to complete");
            case 6:
            case 7:
                return("like to complete");           
            case 9:
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
            hard:DEFAULTS.HARD,
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

}]).controller('TodoCreationController',['$scope','Todo','$state','DateUtil','DEFAULTS','$ionicModal','DATE_BUCKET','RepeatUtil','CommentModal',function($scope,Todo,$state,DateUtil,DEFAULTS,$ionicModal,DATE_BUCKET,RepeatUtil,CommentModal){

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
    $scope.todo.repeat = {};//DEFAULTS.REPEAT;

    //populate duration selection
    $scope.durations = [];  

    // manually insert minutes
    $scope.durations.push({name:'15min',value:0.25});
    $scope.durations.push({name:'30min',value:0.50});
    $scope.durations.push({name:'45min',value:0.75});
    $scope.durations.push({name:'60min',value:1.00});

    for(i=1.5; i<=24; i=i+.5) {
        if(i%1==0) {
        $scope.durations.push({name:i+'.0hrs',value:0.00+i});
        } else {
        $scope.durations.push({name:i+'hrs',value:0.00+i});            
        }
    }

    //$scope.duration = DEFAULTS.DURATION;
    $scope.dueDate = DEFAULTS.DUE_DATE;
    if($scope.deadline=="unscheduled") { $scope.deadline=""; }

/*
    // set all repeat defaults
    $scope.todo.repeat.type = "";//DEFAULTS.WEEKLY;
    $scope.todo.repeat.monthType = DEFAULTS.REPEAT_MONTH_TYPE;
    $scope.todo.repeat.frequency = DEFAULTS.REPEAT_FREQUENCY;
    $scope.todo.repeat.occurences = DEFAULTS.REPEAT_OCCURENCES;
    $scope.todo.repeat.endType = DEFAULTS.REPEAT_ENDS_TYPE;
    $scope.todo.repeat.repeatOn = DEFAULTS.REPEAT_ON;
    $scope.todo.repeat.endsOn = DEFAULTS.REPEAT_ENDS_ON;
    $scope.todo.repeat.startsOn = "";//DATE_BUCKET.H_TODAY;
    $scope.startDate = $scope.todo.repeat.startsOn;
*/

    $scope.setDueDate=function(todo) {
        if(todo.deadlinedate!='') {
            $scope.dueDate=todo.deadlinedate; 
        } else {
            $scope.dueDate=DEFAULTS.DUE_DATE;
        }
    };


    $scope.create=function(){
        // increment/decrment if a goal
        $scope.todo = DateUtil.adjustPriority($scope.todo);
        $scope.todo = DateUtil.setDeadline($scope.todo);  

        Todo.create({
            content:$scope.todo.content,
            done:false,
            goal:$scope.todo.goal,
            hard:$scope.todo.hard,
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
            comments:$scope.todo.comments,
            repeat:$scope.todo.repeat          
        }).success(function(data){
            $state.go('todos');
        });
    };

    // Modal methods

    // ############  comment modal  ########################
    $ionicModal.fromTemplateUrl('views/comment.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.commentModal = modal;
    });
      
    $scope.openCommentModal = function() {
        $scope.commentModal.show();

        //this.showSelected($scope.todo.repeat.type);
    };

   $scope.closeCommentModal = function() {
        $scope.commentModal.hide();
    };

    $scope.getComment = function() {
        CommentModal.getComment();
    }
    
    $scope.setComment = function(message) {
        CommentModal.setComment(message);
    }

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.commentModal.remove();
    });
   

    // ############  repeat modal  ########################
    $ionicModal.fromTemplateUrl('repeat.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
      
    $scope.openRepeatModal = function() {
        $scope.modal.show();

        // generate menus
        $scope.nums = [];  
        for(i=1; i<=30; i++) {
            $scope.nums.push(i);
        }    

        //this.showSelected($scope.todo.repeat.type);
    };
    
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    // if dynamic summary updates are required
    $scope.updateSummary=function() {
        var str = "";

        switch($scope.todo.repeat.type) {
            case DEFAULTS.TIMER:
                str = DEFAULTS.TIMER;
            case DEFAULTS.DAILY:
            case DEFAULTS.WEEKLY:
            case DEFAULTS.MONTHLY:
            case DEFAULTS.YEARLY:
        }

        $scope.summary = str;
    };

    $scope.showSelected=function(str) {
        var repeatObj = RepeatUtil.showSelected(str);

        $scope.timer = repeatObj.timer;
        $scope.daily = repeatObj.daily;
        $scope.weekly = repeatObj.weekly;
        $scope.monthly = repeatObj.monthly;
        $scope.yearly = repeatObj.yearly;
        $scope.frequencyText = repeatObj.frequencyText;
        if($scope.todo.repeat.startsOn == "") {
            $scope.todo.repeat.startsOn = DATE_BUCKET.H_TODAY;
            $scope.startDate = $scope.todo.repeat.startsOn;
        }

        // Trust the view template uses the same text as the DEFAULTS
        $scope.todo.repeat.type = str;
    };

    $scope.clearRepeat=function() {
        this.showSelected("");
        this.todo.repeat = {};
    }

}]).controller('TodoEditController',['$scope','Todo','$state','$stateParams','$localstorage','DateUtil','DEFAULTS','RepeatUtil','$ionicModal',function($scope,Todo,$state,$stateParams,$localstorage,DateUtil,DEFAULTS,RepeatUtil,$ionicModal){

    // get todo id from params
    $scope.todo={ objectId:$stateParams.id };

    //console.log($scope.todo);
    // pull todo object from hash memory in localstorage
    $scope.itemsHash = $localstorage.getObject("items");
    //console.log($scope.itemsHash[$scope.todo.objectId]);
    $scope.todo = $scope.itemsHash[$scope.todo.objectId];

    //populate duration selection
    $scope.durations = [];  

    // manually insert minutes
    $scope.durations.push({name:'15min',value:0.25});
    $scope.durations.push({name:'30min',value:0.50});
    $scope.durations.push({name:'45min',value:0.75});
    $scope.durations.push({name:'60min',value:1.00});

    for(i=1.5; i<=24; i=i+.5) {
        if(i%1==0) {
        $scope.durations.push({name:i+'.0hrs',value:0.00+i});
        } else {
        $scope.durations.push({name:i+'hrs',value:0.00+i});            
        }
    }
    $scope.durations.push({name:'reminder',value:0.00});

    //console.log("durations:");
    //console.log($scope.durations);

    //console.log("index: ");
    //console.log($scope.todo.duration.value*4);
    //console.log($scope.durations[($scope.todo.duration.value*4)].name);

    $scope.duration = 
        $scope.durations[($scope.todo.duration.value*4)].name;

    $scope.dueDate = DEFAULTS.DUE_DATE;

    $scope.edit=function(){

        $scope.todo = DateUtil.setDeadline($scope.todo);  

        // increment/decrment if a goal
        $scope.todo = DateUtil.adjustPriority($scope.todo);
      

        Todo.edit($scope.todo.objectId,{
            content:$scope.todo.content,
            done:$scope.todo.done,
            goal:$scope.todo.goal,
            hard:$scope.todo.hard,
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
            comments:$scope.todo.comments,
            repeat:$scope.todo.repeat             
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


   $ionicModal.fromTemplateUrl('repeat.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
      
    $scope.openModal = function() {
        $scope.modal.show();

        // generate menus
        $scope.nums = [];  
        for(i=1; i<=30; i++) {
            $scope.nums.push(i);
        }    

        //this.showSelected($scope.todo.repeat.type);
    };
    
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    $scope.showSelected=function(str) {
        var repeatObj = RepeatUtil.showSelected(str);

        $scope.timer = repeatObj.timer;
        $scope.daily = repeatObj.daily;
        $scope.weekly = repeatObj.weekly;
        $scope.monthly = repeatObj.monthly;
        $scope.yearly = repeatObj.yearly;
        $scope.frequencyText = repeatObj.frequencyText;
        // Trust the view template uses the same text as the DEFAULTS
        $scope.todo.repeat.type = str;
    };

    $scope.setDueDate=function(todo) {
        if(todo.deadlinedate!='') {
            $scope.dueDate=todo.deadlinedate; 
        } else {
            $scope.dueDate=DEFAULTS.DUE_DATE;
        }
    };

}]).controller('ContentController',['$scope','$ionicSideMenuDelegate',function($scope,$ionicSideMenuDelegate){
    
    $scope.toggleLeft = function(){
        $ionicSideMenuDelegate.toggleLeft();
    };


}]).value('DEFAULTS',{
    PRIORITY: 7, // prefer to complete (even #s are goals)
    DURATION: {name:'15min', value:'0.25'},
    SOFT_DEADLINE: 'Today',
    QUICKADD_DEADLINE: 'Inbox',
    TOMORROW_DEADLINE: 'Tomorrow',
    HARD: false,
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
    ADD_NEW_PLACEHOLDER: 'Add an item...',
    DUE_DATE: 'Due Date',
    REPEAT: {frequency: 1, type: 'weekly', monthType: 0, occurences: null, endType: 0, repeatOn: {}, endsOn: '', startsOn: ''},
    REPEAT_FREQUENCY: 1,
    REPEAT_ON: {m:0,t:0,w:0,th:0,f:0,s:0,su:0},
    REPEAT_ENDS_ON: '',
    REPEAT_OCCURENCES: null,
    REPEAT_MONTH_TYPE: 0,
    REPEAT_ENDS_TYPE: 0,
    TIMER: "Timer",
    WEEKLY: "Weekly",
    DAILY: "Daily",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
    TITLE_LENGTH: 53

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
    THREE_DAYS: 4,
    THIS_WEEKEND: 5,
    NEXT_WEEK: 6,
    TWO_WEEKS: 7,
    NEXT_MONTH: 8,
    _30_DAYS: 9,
    _60_DAYS: 10,
    NEXT_YEAR: 11,
    DEADLINE: 12


});




