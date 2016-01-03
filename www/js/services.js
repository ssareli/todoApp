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
// production
    APP_ID: 'plvDtGUcGUmNqNuaIHxmEdOPlVpuPzEfOrf0kL9A',
    REST_API_KEY:'Wnav5R5ku3HQQfniFCoE1OREOaO3SGVL3M7BH960'
// dev
//    APP_ID: 'isCKihoiAm03zgM4GEL3l7PZiSkAMebDxlBL8Tqm',
//    REST_API_KEY:'XsuiqDfXWJoiRPLbn2UPrOCO12mUFWTeCJDdYtY0'

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
            console.log("localstorage.items.size:"+Object.keys(things).length);
        },
        // DOESN"T WORK ???
        reset: function() {
            $window.localStorage.clear();
        }
    }
}]);

services.factory('CommentModal', ['COMMENT',function() {
    return {
        setComment: function(message) {
            COMMENT.COMMENT_TEXT = message;
            console.log("COMMENT SAVED:"+COMMENT.COMMENT_TEXT);
        },

        getComment: function() {
            console.log("COMMENT RETRIEVED:"+COMMENT.COMMENT_TEXT);
            return (COMMENT.COMMENT_TEXT);
        }
    }
}]);

services.factory('FilterUtil', [function() {
    return {
        getSize: function(obj) {
            var size = 0, key;
            for (key in obj) {
                console.log("key...");
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        }
    }
}]);

services.factory('RepeatUtil', ['DATE_BUCKET',function() {
    return {
        showSelected: function(str) {
           var repeatObj = {
                timer: false,
                daily: false,
                weekly: false,
                monthly: false,
                yearly: false,
                frequencyText: ""
            };

            switch(str.toLowerCase()) {
                case "":
                    return;
                case "timer":
                    repeatObj.timer = true;
                    repeatObj.frequencyText = "minutes";
                    return(repeatObj);
                case "daily":
                    repeatObj.daily = true;
                    repeatObj.frequencyText = "days";
                    return(repeatObj);
                case "monthly":
                    repeatObj.monthly = true;
                    repeatObj.frequencyText = "months";
                    return(repeatObj);
                case "yearly":
                    repeatObj.yearly = true;
                    repeatObj.frequencyText = "years";
                    return(repeatObj);
                default: // "weekly":
                    repeatObj.weekly = true;
                    repeatObj.frequencyText = "weeks";
                    return(repeatObj);
            }
        }

    }
}]);

services.factory('DateUtil', ['DATE_BUCKET','DATE_NAME','$localstorage',function(DATE_BUCKET,DATE_NAME,$localstorage) {
    return {
        adjustPriority: function(item) { 
            // convert priority to number if not already
            if (typeof item.priority == 'string' || item.priority instanceof String) {
                //console.log("[adjustpriority]converting priority...");
                item.priority = Number(item.priority);
                //console.log("[adjustpriority]priority is now:"+item.priority);
            } else {
                //console.log("[adjustpriority]priority remains:"+item.priority);
            }

            // non-related cleanup for reminder level priority   
            if(item.priority == DATE_NAME.REMINDER) {
                item.duration = {name: 'reminder only', value:0.00};            
            }

            // if goal is set then priority should be even
            if(item.goal) {
                // if priority isn't even
                if((item.priority % 2)!=0) {
                    // decrement
                    item.priority--;
                }
                // if not a goal
            } else {
                // if priority isn't odd
                if((item.priority % 2)!=1) {
                    // increment
                    item.priority++;
                }
            }

            //console.log("[adjustpriority]priority returned as:"+item.priority);
            return(item);
        },

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

        // modify todo.deadline and todo.deadlineEpoch to reflect hr/min time
        appendTime: function(todo, parts) {
            // add on time
            if(this.stringHasContents(todo.deadlinetime)) {
                // make deadline string friendly for viewing in list
                todo.deadline = "@"+todo.deadlinetime + ", " + todo.deadline;

                // "2:30 PM", convert to 24hr time
                var time = this.convertTo24Hour(todo.deadlinetime.toLowerCase());
                var timeParts = time.split(':');

                // adjust time for local time zone??
                //var offset = deadline.getTimezoneOffset() * 60000;

                // update epochTime for time
                // hr 0-23, min 0-59
                todo.deadlineEpoch = Date.UTC(parts[2],parts[0]-1,parts[1],timeParts[0],timeParts[1]);
            }

            return(todo);
        },

        /* Take existing todo + snooze amount and update deadline, 
        deadlineEpoch, softedeadline but not deadlinedate. You can only
         snooze soft deadlines.  To move a hard deadline you must manually
         change the deadline.
         */
        updateSnoozedDeadlines: function(item, pushObj) {
            var hardEpoch = null;

            // pass 1: update softdeadline & deadline using new softdeadline
            item.deadlineEpoch = pushObj.epoch; // 
            item.deadline = pushObj.date; // "m/d/yyyy"
            item.softdeadline = pushObj.text;

            // Pass 2: override with hard deadline if earlier
            item = this.setEarliestDeadline(item);

            return(item);
        },

        // picks the earliest epoch time between soft and hard for todo.deadline
        setEarliestDeadline: function(todo) {
            // if deadline > hardDeadline, deadline = hard

            // assume deadline is soft
            todo.hard = false;

            // test to see if deadline is hard
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
                if(todo.deadlineEpoch >= hardEpoch) {
                    // set human friendly deadline
                    todo.deadline = todo.deadlinedate;
                    // set epoch deadline
                    todo.deadlineEpoch = hardEpoch;
                    todo.hard = true;

                    todo = this.appendTime(todo, parts);
                } 
            } 

            return(todo);
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
            console.log("[setDeadline](soft)deadline:"+todo.deadline);
            
            // set deadlineEpoch as softdeadline
            var parts = todo.deadline.split('/');
            // UTC yyyy/mm/dd  m=0-11, d=1-31
            console.log(parts);
            todo.deadlineEpoch = Date.UTC(parts[2],parts[0]-1,parts[1]);
            console.log(todo.deadlineEpoch);

            todo = this.setEarliestDeadline(todo);

            return(todo);
        },

        setSoftdeadline: function(todo) {

            console.log("[setSoftdeadline]"+todo.softdeadline);

            switch(todo.softdeadline) {
                case 'In Progress':
                    // format is m/d/yyyy
                    todo.deadline = DATE_BUCKET.H_IN_PROGRESS;
                    return(todo);
                case 'Today':
                    // format is m/d/yyyy
                    todo.deadline = DATE_BUCKET.H_TODAY;
                    return(todo);
                case 'Tomorrow':
                    todo.deadline = DATE_BUCKET.H_TOMORROW;
                    return(todo);
                case 'This Week':
                    todo.deadline = DATE_BUCKET.H_THIS_WEEK;
                    return(todo);
                case 'This Weekend':
                    todo.deadline = DATE_BUCKET.H_THIS_WEEKEND;
                    return(todo);
                case 'Next Week':
                    todo.deadline = DATE_BUCKET.H_NEXT_WEEK;
                    return(todo);
                case 'Next Weekend':
                    todo.deadline = DATE_BUCKET.H_NEXT_WEEKEND;
                    return(todo);
                case 'This Month':
                    todo.deadline = DATE_BUCKET.H_THIS_MONTH;
                    return(todo);
                case 'Next Month':
                    todo.deadline = DATE_BUCKET.H_NEXT_MONTH;
                    return(todo);
                case 'This Quarter':
                    todo.deadline = DATE_BUCKET.H_THIS_QUARTER;
                    return(todo);
                case 'This Year':
                    todo.deadline = DATE_BUCKET.H_THIS_YEAR;
                    return(todo);
                case 'Someday':
                    todo.deadline = DATE_BUCKET.H_SOMEDAY;
                    return(todo);
                default:
                    todo.deadline = 'no case matched';
                    return(todo);
            }
        },

        /*
            on second loads in a given day, this re-populates the singleton 
            values with date values.
        */
        loadDateCalcs: function() {
            console.log("loadingDateCalcs...");

            var dates = null;

            // load values from disk
            dates = $localstorage.getObject(DATE_NAME.MENU_HASH);

            // set singleton
            DATE_BUCKET.IN_PROGRESS = dates[DATE_NAME.IN_PROGRESS];
            DATE_BUCKET.H_IN_PROGRESS = dates[DATE_NAME.H_IN_PROGRESS];

            DATE_BUCKET.TODAY = dates[DATE_NAME.TODAY];
            DATE_BUCKET.H_TODAY = dates[DATE_NAME.H_TODAY];

            // Tomorrow
            DATE_BUCKET.TOMORROW = dates[DATE_NAME.TOMORROW];
            DATE_BUCKET.H_TOMORROW = dates[DATE_NAME.H_TOMORROW];

            // In Two Days
            DATE_BUCKET.TWO_DAYS = dates[DATE_NAME.TWO_DAYS];
            DATE_BUCKET.H_TWO_DAYS = dates[DATE_NAME.H_TWO_DAYS];

            // THIS WEEK
            DATE_BUCKET.THIS_WEEK = dates[DATE_NAME.THIS_WEEK];
            DATE_BUCKET.H_THIS_WEEK = dates[DATE_NAME.H_THIS_WEEK];
            // random day between today and friday

            // THIS WEEKEND
            DATE_BUCKET.THIS_WEEKEND = dates[DATE_NAME.THIS_WEEKEND];
            DATE_BUCKET.H_THIS_WEEKEND = dates[DATE_NAME.H_THIS_WEEKEND];
            // this saturday

            // NEXT WEEK
            DATE_BUCKET.NEXT_WEEK = dates[DATE_NAME.NEXT_WEEK];
            DATE_BUCKET.H_NEXT_WEEK = dates[DATE_NAME.H_NEXT_WEEK];
            // next monday 

            // NEXT WEEK
            DATE_BUCKET.NEXT_WEEKEND = dates[DATE_NAME.NEXT_WEEKEND];
            DATE_BUCKET.H_NEXT_WEEKEND = dates[DATE_NAME.H_NEXT_WEEKEND];
            // next saturday

            // THIS MONTH
            DATE_BUCKET.THIS_MONTH = dates[DATE_NAME.THIS_MONTH];
            DATE_BUCKET.H_THIS_MONTH = dates[DATE_NAME.H_THIS_MONTH];
            // monday after next

            // NEXT MONTH
            DATE_BUCKET.NEXT_MONTH = dates[DATE_NAME.NEXT_MONTH];
            DATE_BUCKET.H_NEXT_MONTH = dates[DATE_NAME.H_NEXT_MONTH];
            // first weekday of next month

            // THIS QUARTER
            DATE_BUCKET.THIS_QUARTER = dates[DATE_NAME.THIS_QUARTER];
            DATE_BUCKET.H_THIS_QUARTER = dates[DATE_NAME.H_THIS_QUARTER];

            // NEXT QUARTER
            DATE_BUCKET.NEXT_QUARTER = dates[DATE_NAME.NEXT_QUARTER];
            DATE_BUCKET.H_NEXT_QUARTER = dates[DATE_NAME.H_NEXT_QUARTER];

            // THIS YEAR
            DATE_BUCKET.THIS_YEAR = dates[DATE_NAME.THIS_YEAR];
            DATE_BUCKET.H_THIS_YEAR = dates[DATE_NAME.H_THIS_YEAR];

            // SOMEDAY
            DATE_BUCKET.SOMEDAY = dates[DATE_NAME.SOMEDAY];
            DATE_BUCKET.H_SOMEDAY = dates[DATE_NAME.H_SOMEDAY];

            // INBOX
            DATE_BUCKET.INBOX = dates[DATE_NAME.INBOX];
            DATE_BUCKET.H_INBOX = dates[DATE_NAME.H_INBOX];
        },

        createDate: function(epoch) {
            var tempDate = new Date(epoch);
            var yy = tempDate.getFullYear();
            var mm = tempDate.getMonth() + 1; // january is month 0 in javascript
            var dd = tempDate.getDate();

            //console.log("yy"+yy);
            //console.log("mm"+mm);
            //console.log("dd"+dd);
            return([mm, dd, yy].join("/"));
        },

        getDaysMonths: function(year) {
            var days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            // for leap years, February has 29 days. Check whether
            // February, the 29th exists for the given year
            
            if(this.isLeapYear(year)) {
                days_in_months[1] = 29;
            }

            return(days_in_months);
        },

        isLeapYear: function(y) {
            //var y = utc ? this.getUTCFullYear() : this.getFullYear();
            return !(y % 4) && (y % 100) || !(y % 400);
        },


        // calculate the end dates for all ranges based on today's date.
        computeTimeBuckets: function() {

            // calculate all time buckets...
            console.log("[computeTimeBuckets]calculate all time buckets...");

            // today calculated once
            var deadline = new Date();
            var y = deadline.getFullYear(),
                m = deadline.getMonth() + 1, // january is month 0 in javascript
                d = deadline.getDate();
                o = deadline.getTimezoneOffset();
                dayofWeek = deadline.getDay();
            var offset = o * 60000; // minutes offset * 60 * 1000 = milliseconds
            var dayofWeekTemp = null;
            var delta = 0;
            var timeIncrease = 0;
            var oneDay = 86400000; // 24hrs worth of milliseconds
            var oneWeek = oneDay * 7;
            var tempDate = null;
            var yy = null;
            var mm = null;
            var dd = null;
    
            var days_in_months = this.getDaysMonths(y);

            // In Progress - format is m/d/yyyy
            // set timestamp
            DATE_BUCKET.IN_PROGRESS = 1420092000000; // 1/1/2015 @ 12:00am
            // set human friendly time
            DATE_BUCKET.H_IN_PROGRESS = "in progress";

            // Today - format is m/d/yyyy
            // set timestamp
            // add in timezone offsite 
            DATE_BUCKET.TODAY = offset + Number($localstorage.get(DATE_NAME.TODAY_TIMESTAMP));
            // set human friendly time
            DATE_BUCKET.H_TODAY = [m, d, y].join("/");

            // #####################################################
            // Tomorrow
            DATE_BUCKET.TOMORROW = DATE_BUCKET.TODAY + oneDay;
            DATE_BUCKET.H_TOMORROW = [m, d+1, y].join("/");

            // #####################################################
            // In Two Days
            DATE_BUCKET.TWO_DAYS = DATE_BUCKET.TODAY + (oneDay * 2);
            DATE_BUCKET.H_TWO_DAYS = [m, d+2, y].join("/");

            // #####################################################
            // THIS WEEK
            // random day between today and friday
            // 6 - (day of week + 1) = days delta
            delta = 6 - (dayofWeek+1); // days until friday after today
            //console.log("days until friday"+delta);
            // random(1,delta)
            delta = Math.floor(Math.random() * delta) + 1;
            //console.log("days until friday (random)"+delta);
            DATE_BUCKET.THIS_WEEK = DATE_BUCKET.TODAY + (delta * oneDay);
            //console.log("this week epoch:"+DATE_BUCKET.THIS_WEEK);
            DATE_BUCKET.H_THIS_WEEK = this.createDate(DATE_BUCKET.THIS_WEEK);

            // #####################################################
            // THIS WEEKEND            
            // day of week is 0-6 (sunday is 0), +1 all dates
            // determine this saturday (7)
            // caculate differ between saturday and today
            delta = 0;
            delta = 7 - (dayofWeek+1);
            // if 0, then this weekend (saturday) is today
            // if 7, then today is sunday
            // assume days start at 12am localtime
            timeIncrease = delta * oneDay; 
            DATE_BUCKET.THIS_WEEKEND = DATE_BUCKET.TODAY + timeIncrease;
            // recreate calendar date
            DATE_BUCKET.H_THIS_WEEKEND = this.createDate(DATE_BUCKET.THIS_WEEKEND);
            //console.log("[timecalc]"+DATE_BUCKET.THIS_WEEKEND);

            // #####################################################
            // NEXT WEEK
            // next monday 
            // day of week is 0-6 (sunday is 0), +1 all dates
            // determine this saturday(7) + 2 
            // caculate differ between saturday and today
            delta = 0;
            delta = 7 + 2 - (dayofWeek+1);
            // if 0, then this weekend (saturday) is today
            // if 7, then today is sunday
            // assume days start at 12am localtime
            timeIncrease = delta * oneDay; 
            DATE_BUCKET.NEXT_WEEK = DATE_BUCKET.TODAY + timeIncrease;
            // recreate calendar date
            DATE_BUCKET.H_NEXT_WEEK = this.createDate(DATE_BUCKET.NEXT_WEEK);

            // #####################################################
            // NEXT WEEKEND
            // this saturday + 7
            DATE_BUCKET.NEXT_WEEKEND = DATE_BUCKET.THIS_WEEKEND + (7*oneDay);
            DATE_BUCKET.H_NEXT_WEEKEND = this.createDate(DATE_BUCKET.NEXT_WEEKEND);

            // #####################################################
            // THIS MONTH
            // random date between now and last day of month
            // 31 - (day of month + 1) = days delta
            delta = days_in_months[m-1] - (d+1); // days until end of month after today
            // random(1,delta)
            delta = Math.floor((Math.random() * delta) + 1);
            DATE_BUCKET.THIS_MONTH = DATE_BUCKET.TODAY + (delta * oneDay);
            DATE_BUCKET.H_THIS_MONTH = this.createDate(DATE_BUCKET.THIS_MONTH);

            // #####################################################
            // NEXT MONTH
            //DATE_BUCKET.NEXT_MONTH = DATE_BUCKET.TODAY + 2629743000 + 2629743000;
            //DATE_BUCKET.H_NEXT_MONTH = [m+2, d, y].join("/");
            // first weekday of next month
                // last day of this month + 1
            delta = days_in_months[m-1] - d + 1; // days in this month + 1
            timeIncrease = delta * oneDay;
            DATE_BUCKET.NEXT_MONTH = DATE_BUCKET.TODAY + timeIncrease;
            //console.log("next month first day:"+DATE_BUCKET.NEXT_MONTH);
                // check day of week, if 0 +1, if 7 + 2
            tempDate = new Date(DATE_BUCKET.NEXT_MONTH)
            dayofWeekTemp = tempDate.getDay();
            yy = tempDate.getFullYear();
            mm = tempDate.getMonth()+1;
            dd = tempDate.getDate();
            //console.log("day of week for next month="+dayofWeekTemp);
            if(dayofWeekTemp==0) {
                // if sunday, add a day to the date
                dd =+ 1; 
            } else if(dayofWeekTemp==7) {
                // if saturday, add 2 days to the date
                dd =+ 2;
            }
            DATE_BUCKET.H_NEXT_MONTH = [mm, dd, yy].join("/");

            // #####################################################
            // THIS QUARTER
            //DATE_BUCKET.THIS_QUARTER = DATE_BUCKET.TODAY + 7889229000;
            //DATE_BUCKET.H_THIS_QUARTER = [m+3, d, y].join("/");

            // days left this quarter
            var daysLeftInQuarter = delta = this.getDaysLeftThisQuarter(m,d,y);
            // random date between next month and last day of the quarter
            delta = Math.floor((Math.random() * delta) + (days_in_months[m-1]-d));
            DATE_BUCKET.THIS_QUARTER = DATE_BUCKET.TODAY + (delta * oneDay);
            DATE_BUCKET.H_THIS_QUARTER = this.createDate(DATE_BUCKET.THIS_QUARTER);

            // #####################################################
            // THIS YEAR
            DATE_BUCKET.THIS_YEAR = DATE_BUCKET.TODAY + 31556926000;
            DATE_BUCKET.H_THIS_YEAR = [m, d, y+1].join("/");

            // get the day of the year
            var start = new Date(y, 0, 0);
            var diff =  DATE_BUCKET.TODAY - start;
            var dayNumber = Math.ceil(diff / oneDay);
            // days left this year
            delta = 365 - dayNumber;
            // random date between next month and last day of the quarter
            delta = Math.floor((Math.random() * delta) + (dayNumber + daysLeftInQuarter));
            DATE_BUCKET.THIS_YEAR = DATE_BUCKET.TODAY + (delta * oneDay);
            DATE_BUCKET.H_THIS_YEAR = this.createDate(DATE_BUCKET.THIS_YEAR);

            // SOMEDAY
            DATE_BUCKET.SOMEDAY = DATE_BUCKET.TODAY + 2624554080000;
            DATE_BUCKET.H_SOMEDAY = [m, d, y+80].join("/");

            // INBOX
            DATE_BUCKET.INBOX = 1; 
            DATE_BUCKET.H_INBOX = "unscheduled";
        },

        getDaysLeftThisQuarter: function(m,d,y) {
            var monthLocation = null;
            var daysSoFar = d;
            //console.log("[getDaysLeftThisQuarter]days_in_month:"+daysSoFar);
            var days_in_months = this.getDaysMonths(y);
            var totalDays = 0;

            //console.log("[getDaysLeftThisQuarter]current_month:"+m);

            // mod to figure out month in quarter
            monthLocation = 3 % m;

            //console.log("[getDaysLeftThisQuarter]monthinquarter"+monthLocation);

            // remove added +1 from computeTimeBuckets
            m--;

            //console.log("[getDaysLeftThisQuarter]days_in_months[m+1]:"+days_in_months[m+1]);
            //console.log("[getDaysLeftThisQuarter]days_in_months[m+2]:"+days_in_months[m+2]);
            //console.log("[getDaysLeftThisQuarter]days_in_months[m]:"+days_in_months[m]);

            // third month
            if(monthLocation==0) {
                // just use days in this month
                totalDays =+ days_in_months[m+1] + days_in_months[m+2] + days_in_months[m];
            // second month
            } else if(monthLocation==1) {
                // one month before
                daysSoFar =+ days_in_months[m-1];
                totalDays =+ days_in_months[m-1] + days_in_months[m+1] + days_in_months[m];

            // 1st month
            } else {
                // two months before this month
                daysSoFar =+ days_in_months[m-1] + days_in_months[m-2];
                totalDays =+ days_in_months[m] + days_in_months[m-1] + days_in_months[m-2];
            }

            //console.log("[getDaysLeftThisQuarter]daysinquartersofar"+daysSoFar);
            //console.log("[getDaysLeftThisQuarter]totaldaysinquarter"+totalDays);

            // days left in this quarter
            return(totalDays - daysSoFar);
        },

        getDateHash: function() {
            var menuHash = null;

            /* 
                Check to see if we can reuse our menu buckets
                or need to generate new one's for today's date 
             */
            var fullDate = null;
            var date = new Date().getDate(); // today's number date

            console.log("today date:"+date);
            console.log("localstorage.today date:"+$localstorage.get(DATE_NAME.TODAY_DATE, null));

            /* OPTIMIZATION: CHECK MEMORY FOR CALCS BEFORE LOCALSTORAGE */

            // if today's day number matches last time we update date
            if($localstorage.get(DATE_NAME.TODAY_DATE,null) == date) {
                // generate today's full timestamp
                fullDate = this.getTodayFullDate();

                console.log("fullDate:"+fullDate);
                console.log("localstorage.timestamp:"+$localstorage.get(DATE_NAME.TODAY_TIMESTAMP,null));

                // if today's full timestamp matches
                if($localstorage.get(DATE_NAME.TODAY_TIMESTAMP,null) == fullDate) {
                    // reuse existing menu hash & data
                    // load existing date calcs
                    this.loadDateCalcs();
                    // return date hash from localstorage
                    return($localstorage.getObject(DATE_NAME.MENU_HASH));
                } else {
                    // save today's date to localstorage for next use
                    $localstorage.set(DATE_NAME.TODAY_DATE, date);
                    // store today's full timestamp to local storage
                    $localstorage.set(DATE_NAME.TODAY_TIMESTAMP, fullDate);
                    // create new hash
                    return(this.createMenuHash());
                }
            } else {
                // save today's date to localstorage for next use
                $localstorage.set(DATE_NAME.TODAY_DATE,date);
                // store today's full timestamp to local storage
                $localstorage.set(DATE_NAME.TODAY_TIMESTAMP, this.getTodayFullDate());

                console.log("localstorage.today:"+$localstorage.get(DATE_NAME.TODAY_DATE));
                console.log("localstorage.timestamp:"+$localstorage.get(DATE_NAME.TODAY_TIMESTAMP));

                // create new hash
                return(this.createMenuHash());
            }



            
        },

        // generate today's full timestamp
        getTodayFullDate: function() {
                var timestamp = null;
                var parts = new Date();
                d = parts.getDate();
                y = parts.getFullYear();
                m = parts.getMonth(); // january is month 0 in javascript
                // UTC yyyy/mm/dd  m=0-11, d=1-31
                timestamp = Date.UTC(y,m,d);

                return(timestamp);
        },

        /* create a hash for the time select dropdown menu
        */
        createMenuHash: function() {
            // generate new time buckets for this menu and for creating/editing task
            this.computeTimeBuckets();

            var menuHash = null;
        
            menuHash = {
                "In Progress": DATE_BUCKET.IN_PROGRESS,
                "Today": DATE_BUCKET.TODAY,
                "Tomorrow": DATE_BUCKET.TOMORROW,
                "In Two Days": DATE_BUCKET.TWO_DAYS,
                "This Week": DATE_BUCKET.THIS_WEEK,
                "This Weekend": DATE_BUCKET.THIS_WEEKEND,
                "Next Week": DATE_BUCKET.NEXT_WEEK,
                "Next Weekend": DATE_BUCKET.NEXT_WEEKEND,
                "This Month": DATE_BUCKET.THIS_MONTH,
                "Next Month": DATE_BUCKET.NEXT_MONTH,
                "This Quarter": DATE_BUCKET.THIS_QUARTER,
                "This Year": DATE_BUCKET.THIS_YEAR,
                "Someday": DATE_BUCKET.SOMEDAY,
                "Inbox": DATE_BUCKET.INBOX,
                "H_In Progress": DATE_BUCKET.H_IN_PROGRESS,
                "H_Today": DATE_BUCKET.H_TODAY,
                "H_Tomorrow": DATE_BUCKET.H_TOMORROW,
                "H_In Two Days": DATE_BUCKET.H_TWO_DAYS,
                "H_This Week": DATE_BUCKET.H_THIS_WEEK,
                "H_This Weekend": DATE_BUCKET.H_THIS_WEEKEND,
                "H_Next Week": DATE_BUCKET.H_NEXT_WEEK,
                "H_Next Weekend": DATE_BUCKET.H_NEXT_WEEKEND,
                "H_This Month": DATE_BUCKET.H_THIS_MONTH,
                "H_Next Month": DATE_BUCKET.H_NEXT_MONTH,
                "H_This Quarter": DATE_BUCKET.H_THIS_QUARTER,
                "H_This Year": DATE_BUCKET.H_THIS_YEAR,
                "H_Someday": DATE_BUCKET.H_SOMEDAY,
                "H_INBOX": DATE_BUCKET.H_INBOX

                /*  why won't this work?
                DATE_NAME.TODAY: DATE_BUCKET.TODAY,
                DATE_NAME.TOMORROW: DATE_BUCKET.TOMORROW,
                DATE_NAME.THIS_WEEK: DATE_BUCKET.THIS_WEEK,
                DATE_NAME.THIS_MONTH: DATE_BUCKET.THIS_MONTH,
                DATE_NAME.THIS_QUARTER: DATE_BUCKET.THIS_QUARTER,
                DATE_NAME.THIS_YEAR: DATE_BUCKET.THIS_YEAR,
                DATE_NAME.SOMEDAY: DATE_BUCKET.SOMEDAY
                */
            };

            // save hash to localstorage
            $localstorage.setObject(DATE_NAME.MENU_HASH,menuHash);

            console.log("localstorage.menuhash =>");
            console.log($localstorage.getObject(DATE_NAME.MENU_HASH));

            return(menuHash);
        }
    }

/* 
    Current calculations assume the date is the first day of the year starting
 on a monday.  More sophisticated calculations may or may not be required.
 */
}]).value('DATE_BUCKET',{
    /*
    TODAY: new Date().getTime(),
    TOMORROW: new Date().getTime() + 86400000,
    TWO_DAYS: new Date().getTime() + 86400000 + 86400000,
    THIS_WEEK: new Date().getTime() + 604800000,
    THIS_WEEKEND: new Date().getTime() + 604800000,
    NEXT_WEEK: new Date().getTime() + 604800000 + 604800000,
    THIS_MONTH: new Date().getTime() + 2629743000,
    NEXT_MONTH: new Date().getTime() + 2629743000 + 2629743000,
    THIS_QUARTER: new Date().getTime() + 7889229000,
    THIS_YEAR: new Date().getTime() + 31556926000,
    SOMEDAY: new Date().getTime() + 2624554080000,
    */
    MENU_HASH: null,
    IN_PROGRESS: -1,
    TODAY: -1,
    TOMORROW: -1,
    TWO_DAYS: -1,
    THIS_WEEK: -1,
    THIS_WEEKEND: -1,
    NEXT_WEEK: -1,
    NEXT_WEEKEND: -1,
    THIS_MONTH: -1,
    NEXT_MONTH: -1,
    THIS_QUARTER: -1,
    THIS_YEAR: -1,
    SOMEDAY: -1,
    INBOX: -1,
    H_IN_PROGRESS: "",
    H_TODAY: "",
    H_TOMORROW: "",
    H_TWO_DAYS: "",
    H_THIS_WEEK: "",
    H_THIS_WEEKEND: "",
    H_NEXT_WEEK: "",
    H_NEXT_WEEKEND: "",
    H_THIS_MONTH: "",
    H_NEXT_MONTH: "",
    H_THIS_QUARTER: "",
    H_THIS_YEAR: "",
    H_SOMEDAY: "",
    H_INBOX: ""

}).constant('DATE_NAME',{
    MENU_HASH: "menuHash",
    IN_PROGRESS: "In Progress",
    TODAY: "Today", 
    TOMORROW: "Tomorrow",
    TWO_DAYS: "In Two Days",
    THIS_WEEK: "This Week",
    NEXT_WEEK: "Next Week",
    THIS_WEEKEND: "This Weekend",
    NEXT_WEEKEND: "Next Weekend",
    THIS_MONTH: "This Month",
    NEXT_MONTH: "Next Month",
    THIS_QUARTER: "This Quarter",
    NEXT_QUARTER: "Next Quarter",
    THIS_YEAR: "This Year",
    SOMEDAY: "Someday",
    INBOX: "Inbox",
    H_IN_PROGRESS: "H_In Progress",
    H_TODAY: "H_Today", 
    H_TOMORROW: "H_Tomorrow",
    H_TWO_DAYS: "H_In Two Days",
    H_THIS_WEEK: "H_This Week",
    H_NEXT_WEEK: "H_Next Week",
    H_THIS_WEEKEND: "H_This Weekend",
    H_NEXT_WEEKEND: "H_Next Weekend",
    H_THIS_MONTH: "H_This Month",
    H_NEXT_MONTH: "H_Next Month",
    H_THIS_QUARTER: "H_This Quarter",
    H_NEXT_QUARTER: "H_Next Quarter",
    H_THIS_YEAR: "H_This Year",
    H_SOMEDAY: "H_Someday",
    H_INBOX: "H_INBOX",
    TODAY_TIMESTAMP: "today_timestamp",
    TODAY_DATE: "today_date",
    MUST: 3,
    PREFER: 5, 
    REMINDER: 7

}).value('CONFIG',{
    SHOW_COMPLETED: false,
    SORT_ORDER: 3

}).value('COMMENT',{
    COMMENT_TEXT: ''

});



