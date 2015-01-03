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
        },
        // DOESN"T WORK ???
        reset: function() {
            $window.localStorage.clear();
        }
    }
}]);

services.factory('DateUtil', ['DATE_BUCKET',function(DATE_BUCKET) {
    return {
        // Checked to see if a deadline string has anything in it
        stringHasContents: function(str) {
            return(
                str != null &&
                str != undefined &&
                str != '');
        },
        convertTo24Hour: function(time) {
            var hours = parseInt(time.substr(0, 2));
            if(time.indexOf('am') != -1 && hours == 12) {
                time = time.replace('12', '0');
            }
            if(time.indexOf('pm')  != -1 && hours < 12) {
                time = time.replace(hours, (hours + 12));
            }
            return time.replace(/(am|pm)/, '');
        },

        /*
          calculates all the soft deadlines, picks the earliest date
          as a deadline and ensures consistent date formats.
        */
        setDeadline: function(todo) {

            // Rule:  computed deadline is earliest date in item
            // Date data set:  deadlinedate, softdeadline
            var deadline = ""

            // calculate softDeadline, deadline = soft
            todo = this.setSoftdeadline(todo);
            console.log("softdeadline:"+todo.deadline);
            
            // set deadlineEpoch as softdeadline
            var parts = todo.deadline.split('/');
            // UTC yyyy/mm/dd  m=0-11, d=1-31
            console.log(parts);
            todo.deadlineEpoch = Date.UTC(parts[2],parts[0]-1,parts[1]);
            console.log(todo.deadlineEpoch);

            // if deadline > hardDeadline, deadline = hard
            if(this.stringHasContents(todo.deadlinedate)) {
                console.log("harddeadline:"+todo.deadlinedate);
                var hardEpoch = null;

                // 1/15/2015  m/d/yyyy
                parts = todo.deadlinedate.split('/');
                // UTC yyyy/mm/dd  m=0-11, d=1-31
                console.log(parts);
                hardEpoch = Date.UTC(parts[2],parts[0]-1,parts[1]);
                console.log(hardEpoch);

                // compare Epoch timestamps between soft and hard deadlines
                if(todo.deadlineEpoch > hardEpoch) {
                    // set human friendly deadline
                    todo.deadline = todo.deadlinedate;
                    // set epoch deadline
                    todo.deadlineEpoch = hardEpoch;

                    // add on time
                    if(this.stringHasContents(todo.deadlinetime)) {
                        // make deadline string friendly for viewing in list
                        todo.deadline = "@"+todo.deadlinetime + ", " + todo.deadline;

                        // "2:30 PM", convert to 24hr time
                        var time = convertTo24Hour($(todo.deadlinetime).val().toLowerCase());
                        var timeParts = time.split(':');

                        // update epochTime for time
                        // hr 0-23, min 0-59
                        todo.deadlineEpoch = Date.UTC(parts[2],parts[0]-1,parts[1],timeParts[0],timeParts[1]);
                    }
                } else { // deadline is soft, so mark deadline in italics
                    todo.deadline = "~"+todo.deadline;
                }
            } else { // deadline is soft, so mark deadline in italics
                todo.deadline = "~"+todo.deadline;
            }


        /*
            // look for hard deadline
            if(this.checkEmptyString(todo.deadlinedate)) {
                //console.log("setDeadlines:"+todo.deadlinedate);
                
                todo = this.computeDeadline(todo);

            // use soft deadlines
            } else {
                todo = this.setSoftdeadline(todo);
            }
        */

            return(todo);
        },

        /*
        // set computed deadline based on ruleset
        computeDeadline: function(todo) {
            // computed deadline should be based on earliest date
            //console.log("computeDeadline:"+todo.deadlinedate);
            todo.deadline = todo.deadlinedate;

            //todo.deadline = todo.deadlinedate;
            if(this.checkEmptyString(todo.deadlinetime)) {
                // make deadline string friendly for viewing in list
                todo.deadline = "@"+todo.deadlinetime + ", " + todo.deadline;
            }
            return(todo);
        },
        */

        setSoftdeadline: function(todo) {
            // today calculated once
            var deadline = new Date();
            var y = deadline.getFullYear(),
                m = deadline.getMonth() + 1, // january is month 0 in javascript
                d = deadline.getDate();


            switch(todo.softdeadline) {
                case 'today':
                    // format is m/d/yyyy
                    todo.deadline = deadline.toLocaleDateString();
                    return(todo);
                case 'tomorrow':
                    //deadline.setDate(deadline.getDate() + 1);
                    d+=1;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'this week':
                    // what day of the week is today?
                    // how many days until Sunday?
                    //deadline.setDate(deadline.getDate() + 7);
                    d+=7;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'this weekend':
                    // when does weekend start?
                case 'next week':
                    // when does next week start
                    d+=14;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'next weekend':
                    // when does the weekend begin?
                case 'this month':
                    // when does this month end?
                    m+=1;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'next month':
                    // when does next month end?
                    m+=2;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'within three months':
                    // what quarter is it?
                    // when does this quarter end?
                    m+=3;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'this year':
                    // when does this year end?
                    y+=1;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                case 'someday':
                    y+=80;
                    todo.deadline = [m, d, y].join("/");
                    return(todo);
                default:
                    todo.deadline = 'no case matched';
                    return(todo);
            }
        },
        // calculate the end dates for all ranges based on today's date.
        computeTimeBuckets: function() {

        },

        getTimeBuckets: function() {
                // check for staleness on time bucket calculations
                // if stale, run time bucket calculations
                    this.computeTimeBuckets();
                    // update select menu hash
                    // save menu has to localstorage
                // else, read select menu hash from localstorage

                // return date hash
                return(this.createMenuHash());
        },
        /* create a hash for the time select dropdown menu
        */
        createMenuHash: function() {
            var menuHash = null;
            menuHash = {
                "Today": DATE_BUCKET.TODAY,
                "Tomorrow": DATE_BUCKET.TOMORROW,
                "This Week": DATE_BUCKET.THIS_WEEK,
                "This Month": DATE_BUCKET.THIS_MONTH,
                "This Quarter": DATE_BUCKET.THIS_QUARTER,
                "This Year": DATE_BUCKET.THIS_YEAR,
                "Anytime": DATE_BUCKET.ANYTIME
            }
            return(menuHash);
        }
    }

/* 
    Current calculations assume the date is the first day of the year starting
 on a monday.  More sophisticated calculations may or may not be required.
 */
}]).value('DATE_BUCKET',{
    TODAY: new Date().getTime(),
    TOMORROW: new Date().getTime() + 86400000,
    THIS_WEEK: new Date().getTime() + 604800000,
    THIS_MONTH: new Date().getTime() + 2629743000,
    THIS_QUARTER: new Date().getTime() + 7889229000,
    THIS_YEAR: new Date().getTime() + 31556926000,
    ANYTIME: new Date().getTime() + 2624554080000 
/*
    Alternative option simply uses concentric ranges of time.

}).value('DATE_BUCKET',{
    TODAY: new Date().getTime(),
    TOMORROW: new Date().getTime() + 86400000,
    NEXT_7: new Date().getTime() + 604800000,
    NEXT_30: new Date().getTime() + 2629743000,
    NEXT_90: new Date().getTime() + 7889229000,
    NEXT_365: new Date().getTime() + 31556926000,
    ANYTIME: new Date().getTime() + 2524554080000 
});
*/
}).value('DATE_HASH',{
    TODAY: null, 
    TOMORROW: null,
    THIS_WEEK: null,
    THIS_MONTH: null,
    THIS_QUARTER: null,
    THIS_YEAR: null,
    ANYTIME: null

    // hour numbers <=> easy reading text map
/*
                    <option>0.00</option>
                    <option>0.25</option>
                    <option>0.50</option>
                    <option>0.75</option>
                    <option>1.00</option>
                    <option>1.25</option>
                    <option>1.50</option>
                    <option>1.75</option>
                    <option>2.00</option>
                    <option>2.50</option>
                    <option>3.00</option>
                    <option>3.50</option>
                    <option>4.00</option>
                    <option>4.50</option>
                    <option>5.00</option>
                    <option>5.50</option>
                    <option>6.00</option>
                    <option>6.50</option>
                    <option>7.00</option>
                    <option>7.50</option>
                    <option>8.00</option>
                    <option>8.50</option>
                    <option>9.00</option>
                    <option>9.50</option>
                    <option>10.00</option>
                    <option>10.50</option>
                    <option>11.00</option>
                    <option>11.50</option>
                    <option>12.00</option>
                    <option>12.50</option>
                    <option>13.00</option>
                    <option>13.50</option>
                    <option>14.00</option>
                    <option>14.50</option>
                    <option>15.00</option>
                    <option>15.50</option>
                    <option>16.00</option>
                    <option>16.50</option>
                    <option>17.00</option>
                    <option>17.50</option>
                    <option>18.00</option>
                    <option>18.50</option>
                    <option>19.00</option>
                    <option>19.50</option>
                    <option>20.00</option>
                    <option>20.50</option>
                    <option>21.00</option>
                    <option>21.50</option>
                    <option>22.00</option>
                    <option>22.50</option>
                    <option>23.00</option>
                    <option>23.50</option>
                    <option>24.00</option>
                    */

});



