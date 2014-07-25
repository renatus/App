//Modules are used to divide huge app in a logical parts - say, activities, checkins, health reports etc. may be handled by different modules
var app = angular.module('testApp', ['ngRoute', 'exoFilters']);
var activitiesMod = angular.module('activitiesM', ['exoFilters', 'testApp']);



//Set pre-defined URLs and URL patterns for your app
app.config(['$routeProvider',
  function($routeProvider) {
      $routeProvider.
      //You can call a page with URL like this: http://yourdomain.com/#/activities/123
      when('/activities/:activityId', {
          //HTML template for this URL pattern
          templateUrl: 'templates/activity.html',
          //Angular controller for this URL pattern
          controller: 'showActivityController'
      }).
      
      //If there is no such a page
      otherwise({
          //Redirect user to
          redirectTo: '/'
      });
}]);



//Controller to work with activities
activitiesMod.controller('activitiesController', function ($scope, $q, $routeParams, indexedDBexo) {
    
    //You can populate scope by hands if needed. This is just example, app uses different activity data structure and populates it from IndexedDB.
	//$scope.activities = [
	//	{"nid":"6650","langcode":"en","title":"End an agreements with Stream ISP"},
	//	{"nid":"3188","langcode":"en","title":"Renew domain exocortex.pp.ua"}
	//];
    	
	
	
    //Open DB, get all entries and put them to $scope object
	$scope.init = function(){
        //console.log("Init started");
		indexedDBexo.open().then(function(){            
            indexedDBexo.getAllTodoItems().then(function(data){
				$scope.activities = data;
                //Will show us all objects we've get - at Chrome DevTools console
                console.log(data);
			});			
		});
	}
	
	$scope.init();
    
    
    
    //Add new activity entry to $scope and DB        
    //You can get user-entered field value without passing object to function with construction like $scope.activity.title
    $scope.addEntry = function(activity){
        var curTimestamp = new Date().getTime();
        //Get universally unique identifier for a new entry
        var UUID4 = generateUUID4();
        //Entry language code (like 'en')
        var langcode = activity.langcode;
        
        //Create entry object
        var newEntry = {
            "uuid": UUID4,
            //Entry is new, so revision number is "0"
            "lastVersion": 0,
            "0": {
                "title": {},
                "langcode": $scope.activity.langcode,
                "createdTimeStamp": curTimestamp,
                "modifiedTimeStamp": curTimestamp
            }
		};
        //Set entry title
        //Entry is new, so revision number is "0"
        newEntry["0"]["title"][langcode] = activity.title;        
        
        //Clean form from now saved user-entered data
        this.activity = {};
        
        //Add new entry to DB
        indexedDBexo.addEntry(newEntry).then(function(){
            console.log('Activity saved to DB!');
        });
        
        //Add new entry to $scope
        $scope.activities.push(newEntry);
    }
    
    
    
    //Edit activity entry at $scope and DB 
    $scope.editEntry = function(activity, langcode){
        var curTimestamp = new Date().getTime();
        //Get revision number of now-previous entry revision
        var prevVersion = activity["lastVersion"];
        //Generate current entry revision number
        var curVersion = activity["lastVersion"] + 1;
        
        //Create temporary object to populate and push to $scope and DB
        activity[curVersion] = {};
        //At first current revision will be the same as previous
        activity[curVersion] = angular.copy(activity[activity["lastVersion"]]);
        //Timestamp of a moment entry was modified
        activity[curVersion]["modifiedTimeStamp"] = curTimestamp;
        
        //If user have changed entry's language, we should change it for all language-specific properties
        //without creation dupes, such as en: "Title" ru: "Title"
        var oldLangcode = activity[activity["lastVersion"]]["langcode"];
        if (oldLangcode != langcode){
            //Set entry's new langcode
            activity[curVersion]["langcode"] = langcode;
            //Create title copy with different langcode
            activity[curVersion]["title"][langcode] = activity[curVersion]["title"][oldLangcode];
            //Title value is not an object, so it'll not be copied by reference, so it's safe to delete original title value in a new revision
            delete activity[curVersion]["title"][oldLangcode];
        }
        
        //Set entry's new revision number
        activity["lastVersion"] = curVersion;
        //Restore now-previous version, as it was modified while user edited activity
        activity[prevVersion] = angular.copy(this.editActivityLastRev);
        
        
        //Update entry at DB
        indexedDBexo.addEntry(activity).then(function(){
            console.log('Activity edited!');
        });
        
        //Update entry at $scope
        for (var i = 0; i < $scope.activities.length; i++){
            //If edited activity UUID is equal to found activity UUID
            if ($scope.activities[i].uuid == activity.uuid){        
                //Update entry at $scope
                $scope.activities[i] = angular.copy(activity);
                //Stop searching through all $scope entries
                break;
            }
        }
        
        //Clean form from now saved user-entered data
        delete this.editActivityLastRev;
        //Delete temporary object to populate and push to $scope and DB
        delete activity;   
    }
    
    
    
    //Delete activity entry at $scope and DB 
    $scope.deleteEntry = function(activity){
        //Delete entry at DB
        indexedDBexo.deleteEntry(activity).then(function(){
            //Delete entry at $scope
            $scope.activities.splice($scope.activities.indexOf(activity), 1 );
            console.log('Activity deleted!');
        });
    } 
    
    
    
    //Filter to hide activities with title "not show" from ng-repeat list
    $scope.filterNot123 = function(activity){
        //If filter condition is met, in this case, entry's title is "not show"
        if (activity[activity["lastVersion"]]["title"][activity[activity["lastVersion"]]["langcode"]] == "not show"){
            //This entry will not be listed in the results
            return false; 
        }
        
        //This entry will be within the results
        return true; 
    };
    
});



//Controller to show single activity on a subpage
activitiesMod.controller('showActivityController', function($scope, $routeParams) {
    //Get parameter value from the URL
    var activityID = $routeParams.activityId;
    //Set current activity ID
    $scope.activityID = activityID;
    
    //We should watch for changes at activity to show it when it is fully loaded from DB
    //Loading from DB is async, so $scope.activities will be empty in case we're loadind activity page from the start
    //Activity will be updated, right after it was changed
    $scope.$watch("activities", function(newValue, oldValue) {
        //If activity is fully loaded
        if ($scope.activities){
            //Search through all activities
            for (var i = 0; i < $scope.activities.length; i++){
                //If watched activity UUID is equal to found activity UUID
                if ($scope.activities[i].uuid == activityID){
                    //Copy found activity object to temporary subobject
                    $scope.activity = angular.copy($scope.activities[i]);
                    //Stop searching through all $scope entries
                    break;
                }
            }
        } 
    });
});



//Filter to sort entries at ng-repeat list by title (title should be numeric)
//Entries with non-numeric titles will be shown as well, but without proper sorting
//"reverse" argument may be equal to "ascend" or "descend" - in latter case sorting order should be reversed
//orderBy standard filter only works with arrays, not with objects
activitiesMod.filter('orderObjectByINT', function(){
    return function(input, attribute, reverse) {
        //If input is not object, we can't process it properly
        if (!angular.isObject(input)) return input;
            
        //Temporary array for sorting
        var array = [];
        for (var objectKey in input) {
            //Push input object arguments to array one by one
            array.push(input[objectKey]);
        }
        
        array.sort(function(a, b){            
            a = parseInt(a[a['lastVersion']][attribute][a[a['lastVersion']]['langcode']]);
            b = parseInt(b[b['lastVersion']][attribute][b[b['lastVersion']]['langcode']]);
            return a - b;
        });
        
        //If user asked for reverse sorting order, reverse it
        if (reverse == 'descend') array.reverse();
        
        //Return array of sorted entries
        return array;
    }
});

//Filter to sort entries at ng-repeat list by title (title should be textual)
//Entries with numeric titles will be shown as well, but sorted as a text ones (i.e. 12 will be placed ahead of 2)
//"reverse" argument may be equal to "ascend" or "descend" - in latter case sorting order should be reversed
//orderBy standard filter only works with arrays, not with objects
activitiesMod.filter('orderObjectByTXT', function(){
    return function(input, attribute, reverse) {
        //If input is not object, we can't process it properly
        if (!angular.isObject(input)) return input;
            
        //Temporary array for sorting
        var array = [];
        for (var objectKey in input) {
            //Push input object arguments to array one by one
            array.push(input[objectKey]);
        }
        
        array.sort(function(a, b){            
            //.toString() will convert numbers to text, and they'll be sorted in order like: 1, 12, 1218, 2, 24, 3, 4, 5, 6...
            var alc = a[a['lastVersion']][attribute][a[a['lastVersion']]['langcode']].toString().toLowerCase();
            var blc = b[b['lastVersion']][attribute][b[b['lastVersion']]['langcode']].toString().toLowerCase();
            
            return alc > blc ? 1 : alc < blc ? -1 : 0;
        });
        
        //If user asked for reverse sorting order, reverse it
        if (reverse == 'descend') array.reverse();
        
        //Return array of sorted entries
        return array;
    }
});



//Service to work with IndexedDB
app.service('indexedDBexo', function($window, $q){
	
	//IndexedDB database name
	var dbName = "ExocortexDB";
	//Database version (should be increased, when structure updates). Should be of integer type.
	var dbVersion = 9;
	var exoDB = {};
	var indexedDB = window.indexedDB;
	
	exoDB.indexedDB = {};
	exoDB.indexedDB.db = null;
	
	//Handle DB-related errors
	exoDB.indexedDB.onerror = function(e) {
		console.log(e);
	};
	
	
	
	//Function to open DB and upgrade it's data structure, if needed
	this.open = function() {
		var deferred = $q.defer();
		
		//Request to open database. Will return IDBOpenDBRequest object.
		var request = indexedDB.open(dbName, dbVersion);
		
		request.onsuccess = function(e) {
			console.log ("DB " + dbName + " was opened and ready for work");
			exoDB.indexedDB.db = e.target.result;
			deferred.resolve();
		}
		
		request.onupgradeneeded = function(e) {
			exoDB.indexedDB.db = e.target.result;
			var db = exoDB.indexedDB.db;
			console.log ("Going to upgrade DB from version " + e.oldVersion + " to version " + e.newVersion);
			
			//If there is Object store with the same name at DB from previous revision,
			//we'll face error while trying to upgrade DB
			//We should delete existing Object store (and all it's data, of course)
			try {
				if (db.objectStoreNames && db.objectStoreNames.contains("activities")) {
					db.deleteObjectStore("activities");
				}
			}
			catch (err) {
				console.log("Error in objectStoreNames: " + err);
			}
			
			//Create object store
			//Object Store is a storage for objects, instead of tables at SQL databases
			//We do not define objects structure here other than "fields" for keyPath, and for indexes
			//While adding objects, you can omit fields, including indexing ones, but keyPath field should be filled
			//We can make one of it's "fields" (with unique values) an in-line key with keyPath
			var store = db.createObjectStore("activities", {keyPath: "uuid"});
			// Create an index to search customers by text field. We may have duplicates so we can't use a unique index.
			store.createIndex("activities", "activities", {unique: false});
			
			//Or we can make unique integer out-of-line keys (1,2,3 ...) with keyGenerator, enabled by {autoIncrement: true}
			//var store = db.createObjectStore("store2", {autoIncrement: true});
			//console.log("Onupgradeneeded: "+ JSON.stringify(store));
		}
		
		request.onfailure = function(e) {
			console.error("Failed to open DB: " + e);
			deferred.reject();
		}
		
		request.onerror = function(e) {
			console.error("Error while opening DB: " + e);
			deferred.reject();
		}
		
		return deferred.promise;
	};
	
	
	
	//Add or edit Activity entry in DB
	this.addEntry = function(exEntry){
		var deferred = $q.defer();
		
		//Database table name
		var dbTableName = "activities";
		var db = exoDB.indexedDB.db;
		//Create transaction, define Object stores it will cover
		var transact = exoDB.indexedDB.db.transaction(dbTableName, "readwrite");
		var store = transact.objectStore(dbTableName);
        
        //We should put an object to IndexedDB
        //AngularJS works with objects, so we can just put them to DB without alteration
        
		//var data = {
        //  "uuid": exEntry.uuid,
		// 	"title": exEntry.title,
        //  "langcode": exEntry.langcode,
		//	"createdTimeStamp": exEntry.createdTimeStamp
		//};
		
		//Request to store data at DB
		var request = store.put(exEntry);
		
		request.onsuccess = function(e) {
			console.log('Data added to DB');
			deferred.resolve();
		};
		
		request.onerror = function(e) {
			console.error("Error Adding an item: ", e);
			deferred.reject();
		};
		
		return deferred.promise;
	};
    
    
    
    //Delete Activity entry in DB
	this.deleteEntry = function(exEntry){
		var deferred = $q.defer();
		
		//Database table name
		var dbTableName = "activities";
		var db = exoDB.indexedDB.db;
		//Create transaction, define Object stores it will cover
		var transact = exoDB.indexedDB.db.transaction(dbTableName, "readwrite");
		var store = transact.objectStore(dbTableName);
        
        var request = store.delete(exEntry.uuid);

		request.onsuccess = function(e) {
			console.log('Entry deleted from DB');
			deferred.resolve();
		};
		
		request.onerror = function(e) {
			console.error("Error deleting an entry: ", e);
			deferred.reject();
		};
		
		return deferred.promise;
    };
    
    
    
    this.getAllTodoItems = function() {
        var deferred = $q.defer();
        
        var activities = [];
        
        //Database table name
        var dbTableName = "activities";
        var db = exoDB.indexedDB.db;
        //Create transaction
        var transact = db.transaction(dbTableName, "readonly");
        var store = transact.objectStore(dbTableName);
        
        // Get everything in the store
        //keyRange is a continuous interval over keys, for example greater than X and smaller than Y
        var keyRange = IDBKeyRange.lowerBound(0);
        //Cursor is a mechanism for iterating over multiple records within a key range
        var cursorRequest = store.openCursor(keyRange);
        
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if (result === null || result === undefined) {
                deferred.resolve(activities);
            } else {
                if (result){
                    activities.push(result.value);
                    result.continue();
                }
            }
        };
        
        cursorRequest.onerror = function(e){
            console.log(e.value);
            deferred.reject("Something went wrong!!!");
        };
        
        return deferred.promise;
    };
	
	
	
});



angular.module('exoFilters', []).filter('reverse', function() {
	return function(input, uppercase) {
		input = input || '';
		var out = "";
		for (var i = 0; i < input.length; i++) {
			out = input.charAt(i) + out;
		}
		
		// conditional based on optional argument
		if (uppercase) {
			out = out.toUpperCase();
		}
		
		return out;
	};
});



activitiesMod.directive("clickToEdit", function() {
    var editorTemplate = '<div>' + '<input type="text" value="' + '{{value}}' + '" required />' + '</div>';

    return {
        restrict: "A",
        replace: true,
        template: editorTemplate,
        scope: {
            value: "=clickToEdit",
        },
        controller: function($scope) {
            
            $scope.view = {
                editableValue: $scope.value,
                editorEnabled: false
            };
        }
    };
});



//TODO:EDIT
activitiesMod.directive("editActivity", function() {

    return {
        //Directive can be used as (element) Attribute or (custom) Element
        restrict: "AE",
        replace: true,
        //template: editorTemplate,
        templateUrl: "templates/edit-activity.html",
        controller: function($scope) {            
            $scope.editActivity = angular.copy($scope.activity);
            $scope.editActivityLangcode = angular.copy($scope['activity'][$scope['activity']['lastVersion']]['langcode']);
            $scope.editActivityLastRev = angular.copy($scope['activity'][$scope['activity']['lastVersion']]);
            
        }
    };
});



//Generate UUID version 4 (based on random or pseudo-random numbers), something like 20fbd631-75ce-4d27-a920-35ad76608dd7
//Version 4 UUIDs have the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is any hexadecimal digit and y is one of 8, 9, a, or b.
//First number of a forth part determines the variant (currently only 1 in use); If it is one of 8,9,a,b, it is correct
//0-7 are reserved for backward compatibility, c,d are reserved for Microsoft, and e,f are reserved for future use)
//First number of a third part determines version - in our case it should be 4, as we use UUID version 4
function generateUUID4(){
    //Square brackets means we should find any character between the brackets (not necessary exact sequence)
    // /g modifier means we should search for all x an y symbols, not just the first one
    //All found x symbols will be replaced with randomly picked hexadecimal digits (1-9, a-f) one by one
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        
        //Math.random will give us not that random results, so UUID collisions are possible
        //It is preferable to use window.crypto.getRandomValues() function - it gives cryptographically-grade pseudo-random values
        //window.crypto.getRandomValues() is not available in older browsers, so we should fallback to Math.random() if needed
        //randNum variable should contain number between 0 and 15
        var randNum = "";
        //if window.crypto.getRandomValues() is available
        if (window.crypto){
            //Create one-element array (counting starts from 1, not from 0). 
            var randArr = new Uint32Array(1);
            //Each array element will be populated with random value (like 3479190651), so you can get many numbers in a time.
            window.crypto.getRandomValues(randArr);
            //% will give us division remainder, in our case it will be a number between 0 and 15
            randNum = randArr[0] % 16;
        } else {
            //Math.random() will give us pseudorandom number between 0 and 1
            // |0 - bitwise operation OR, it will drop fraction part of the number
            randNum = Math.random() * 16|0;
        }
        
        //v = c == 'x'  - if current replaceable symbol is not equal to x
        //r : (r&0x3|0x8)  - v will be populated with hexadecimal number between 8 and 11 (i.e. 8, 9, a or b)
        var r = randNum, v = c == 'x' ? r : (r&0x3|0x8);
        //Conversion of hexadecimal number to string (i.e. to one of these symbols: 1-9, a-f)
        return v.toString(16);
    });
    
    return uuid;
}