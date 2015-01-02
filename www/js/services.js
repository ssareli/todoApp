/**
 * Created by Sandeep on 11/09/14.
 */
angular.module('todoApp.services',[]).factory('Todo',['$http','PARSE_CREDENTIALS',function($http,PARSE_CREDENTIALS){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/Todo',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                }
            });
        },
        get:function(id){
            return $http.get('https://api.parse.com/1/classes/Todo/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/Todo',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'Content-Type':'application/json'
                }
            });
        }, 
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/Todo/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/Todo/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
//    APP_ID: 'xhTpJiNedJ7mmDj3LTTBUePqSVegcJHzEbh70Y0Q',
//    REST_API_KEY:'XCfQDPODgNB1HqmaCQgKLPWGxQ0lCUxqffzzURJY'
    APP_ID: 'plvDtGUcGUmNqNuaIHxmEdOPlVpuPzEfOrf0kL9A',
    REST_API_KEY:'Wnav5R5ku3HQQfniFCoE1OREOaO3SGVL3M7BH960'
});


/*

angular.module('sileras.utils',[]).factory('dateTool', ['things',function('things') {
    return {

    }

.factory('dateTool', function() {
    this.parseDate = function(input) {
        var parts = input.split('-');
        // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
    }

    this.today = function() {
        return new Date().toUTCString;
    }

});
*/

var services = angular.module('ionic.utils', []);

services.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        saveItems: function(things) {
            // db write to localstorage
            this.setObject("items",things);
            //console.log("localstorage.items.size:"+Object.keys(things).length);
        }
    }
}]);

services.factory('DateUtil', function() {
    return {
        test: function() {
            return(true);
        },
        /*
          calculates all the soft deadlines and 
          ensures consistent date formats.
        */
        setDeadlines: function(todo) {
            if(todo.deadlinedate != null) {
                todo.deadline = todo.deadlinedate;
                if(todo.deadlinetime != undefined &&
                    todo.deadlinetime != '' &&
                    todo.deadlinetime != null) {
                    todo.deadline += " @ " + todo.deadlinetime;
                }
            } else {
                // today calculated once
                var deadline = new Date();
                var y = deadline.getFullYear(),
                    m = deadline.getMonth() + 1, // january is month 0 in javascript
                    d = deadline.getDate();

                switch(todo.softdeadline) {
                    case 'today':
                        // format is m/d/yyyy
                        todo.deadline = deadline.toLocaleDateString();
                        break;
                    case 'tomorrow':
                        //deadline.setDate(deadline.getDate() + 1);
                        d+=1;
                        todo.deadline = [m, d, y].join("/");
                        break;
                    case 'this week':
                        // what day of the week is today?
                        // how many days until Sunday?
                        //deadline.setDate(deadline.getDate() + 7);
                        d+=7;
                        todo.deadline = [m, d, y].join("/");
                        break;
                    case 'this weekend':
                        // when does weekend start?
                    case 'next week':
                        // when does next week start
                    case 'next weekend':
                        // when does the weekend begin?
                    case 'this month':
                        // when does this month end?
                    case 'next month':
                        // when does next month end?
                    case 'this quarter':
                        // what quarter is it?
                        // when does this quarter end?
                    case 'this year':
                        // when does this year end?
                    case 'someday':
                        $scope.todo.deadline = deadline.setDate(deadline.getDate() + 365);
                        break;
                    default:
                        todo.deadline = 'no case matched';
                }
            }
            return(todo);
        }
    }
});



