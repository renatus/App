var app = angular.module('testApp', ['exoFilters']);



//orderBy only works with arrays, not with objects
// http://stackoverflow.com/questions/14478106/angularjs-sorting-by-property
app.filter('orderObjectByINT', function(){
    return function(input, attribute, reverse) {
        if (!angular.isObject(input)) return input;
            
        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }
        
        array.sort(function(a, b){            
            a = parseInt(a[0][attribute][a[0]['langcode']]);
            b = parseInt(b[0][attribute][b[0]['langcode']]);
            return a - b;
        });
        
        if (reverse == 'descend') array.reverse();
        
        return array;
    }
});

app.filter('orderObjectByTXT', function(){
    return function(input, attribute, reverse) {
        if (!angular.isObject(input)) return input;
            
        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }
        
        array.sort(function(a, b){            
            //.toString() will convert numbers to text, and they'll be sorted in order like: 1, 12, 1218, 2, 24, 3, 4, 5, 6...
            var alc = a[0][attribute]['en'].toString().toLowerCase();
            var blc = b[0][attribute]['en'].toString().toLowerCase();
            
            return alc > blc ? 1 : alc < blc ? -1 : 0;
        });
        
        if (reverse == 'descend') array.reverse();
        
        return array;
    }
});



app.controller('StartCtrl', function ($scope, indexedDBexo) {
    
	//$scope.activities = [
	//	{"nid":"6650","langcode":"en","title":"End an agreements with Stream ISP"},
	//	{"nid":"3188","langcode":"en","title":"Renew domain exocortex.pp.ua"}
	//];
    
    
    
    $scope.filterNot123 = function(activity){
        
        if (activity["0"]["title"][activity.langcode] == "123"){
            return false; // this will be listed in the results
        }
        
        return true; // otherwise it won't be within the results
    };
	
	
	
    //Open DB, get all entries and show them to user
	$scope.init = function(){
		indexedDBexo.open().then(function(){            
            indexedDBexo.getAllTodoItems().then(function(data){
				$scope.activities = data;
                console.log(data);
			});			
		});
	}
	
	$scope.init();
    
    
    
    //You can get user-entered field value without passing object to function with construction like $scope.activity.title
    $scope.addEntry = function(activity){
        var curTimestamp = new Date().getTime();
        var UUID4 = generateUUID4();
        
        var langcode = activity.langcode;
        
        
        var newEntry = {
            "uuid": UUID4,
            "lastVersion": 0,
            "0": {
                "title": {},
                "langcode": $scope.activity.langcode,
                "createdTimeStamp": curTimestamp,
                "modifiedTimeStamp": curTimestamp
            }
		};
        newEntry["0"]["title"][langcode] = activity.title;        
        
        $scope.activities.push(newEntry);
        
        //Clean form from now saved user-entered data
        this.activity = {};
        
        indexedDBexo.addEntry(newEntry).then(function(){
            console.log('Activity added!');
        });
    }
    
    
    
    //We should pass entry object (or some of it's properties) while calling function from <form> tag
    $scope.editEntry = function(activity, langcode){
        var curTimestamp = new Date().getTime();
        var curVersion = activity["lastVersion"] + 1;
        
        activity[curVersion] = {};
        activity[curVersion] = activity[activity["lastVersion"]];
        activity[curVersion]["modifiedTimeStamp"] = curTimestamp;
        
        
        console.log(langcode);
        //if (){
            
        //}
        
        
        activity["lastVersion"] = curVersion;
        
        indexedDBexo.addEntry(activity).then(function(){
            console.log('Activity edited!');
        });
    }
    
    
    
    $scope.deleteEntry = function(activity){        
        indexedDBexo.deleteEntry(activity).then(function(){
            $scope.activities.splice($scope.activities.indexOf(activity), 1 );
            
            console.log('Activity deleted!');
        });
    }
    
    
    
    //Change object, do not trigger DB entry update.
    $scope.changeEntryLang = function(activity){
        var curTimestamp = new Date().getTime();
        //
        var curVersion = activity["lastVersion"];

        activity[curVersion]["modifiedTimeStamp"] = curTimestamp;
        activity[curVersion]["langcode"] = "en";
        //By reference
        activity[curVersion]["title"]["en"] = activity[curVersion]["title"]["ru"];
        //delete activity[curVersion]["title"]["ru"];
        
        //activity["lastVersion"] = curVersion;
        
        //indexedDBexo.addEntry(activity).then(function(){
        //    console.log('Language changed!');
        //});
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



app.directive("clickToEdit", function() {
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



app.directive("editActivity", function() {
    //var editorTemplate = '';

    return {
        restrict: "A",
        replace: true,
        //template: editorTemplate,
        templateUrl: "templates/edit-activity.html",
        //scope: {
        //    value: "=clickToEdit",
        //},
        controller: function($scope) {
            //console.log($scope.activity);
            
            //Object will be passed by reference
            //$scope.view.editbActivity = $scope.activity;
            
            //$scope.view = {
                //editbActivity: $scope.activity,
            //    editorEnabled: false
            //};
            
            $scope.editbActivity = angular.copy($scope.activity);
            $scope.editbActivityLangcode = angular.copy($scope['activity'][$scope['activity']['lastVersion']]['langcode']);
            //$scope.editbActivity = JSON.parse(JSON.stringify($scope.activity));
            
            //Will delete only reference, not object itself, but that may help to garbage collector 
            //delete $scope.editbActivity;
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