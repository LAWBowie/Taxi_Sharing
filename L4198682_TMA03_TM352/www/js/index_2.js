/***********
 * OU TM352 Block 3, TMA03: index.js
 *
 * To function correctly this file must be placed in a Cordova project and the appopriate plugins installed.
 * You need to complete the code which is commented with TODO.
 * This includes the FRs and a few other minor changes related to your HTML design decisions.
 *
 * Released by Chris Thomson / Stephen Rice: Dec 2020
 * Modified by Chris Thomson: November 2021
 * Modified by Chris Thomson: November 2022
 * Modified by Chris Thomson: March 2023 - To address changes in the API
 * Modified by Chris Thomson: March 14 2023 - remove stray bracket
 * Modified and submitted by (Luke Bowman)
 ************/

/**
 * Please remember to install the cleartext plugin:
 *
 * cordova plugin add cordova-plugin-enable-cleartext-traffic
 * cordova prepare
 */



// Execute in strict mode to prevent some common mistakes
"use strict";

// Declare a TaxiShare object for use by the HTML view
var controller;

document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    // Create the TaxiShare object for use by the HTML view
    controller = new TaxiShare();
    //Camera
    console.log(navigator.camera);
}

// JavaScript "class" containing the model, providing controller "methods" for the HTML view
function TaxiShare() {
    console.log("Creating controller/model");

    // PRIVATE VARIABLES AND FUNCTIONS - available only to code inside the controller/model
    // Note these are declared as function functionName() { ... }

    var BASE_GET_URL = "http://137.108.68.13/openstack/taxi/";
	// NOTE HTTPS: at the time of writting we are investigating the creating a https service
	//             this will increase compatibility with Android. If we get it working we 
    //             will ask you to modify the line above.	
    var BASE_URL = BASE_GET_URL;
	// NOTE CORS: if you get a CORS error we may recommend you insert code at this point.

    var icon = new H.map.DomIcon("<div>&#x1F695;</div>");
    var marker;

    // HERE Maps code, based on:
    // https://developer.here.com/documentation/maps/3.1.19.2/dev_guide/topics/map-controls-ui.html
    // https://developer.here.com/documentation/maps/3.1.19.2/dev_guide/topics/map-events.html

    // Initialize the platform object:
    var platform = new H.service.Platform({
        // TODO: Change to your own API key or map will NOT work!
        apikey: "IX5xI7ari4wCYqSANvz5l9HRXpaD9ZuhF7wva47GXNQ",
    });
    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();
    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
            zoom: 15,
            center: { lat: 52.5, lng: 13.4 },
        }
    );

    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    var mapSettings = ui.getControl("mapsettings");
    var zoom = ui.getControl("zoom");
    var scalebar = ui.getControl("scalebar");
    mapSettings.setAlignment("top-left");
    zoom.setAlignment("top-left");
    scalebar.setAlignment("top-left");
    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);
    // Instantiate the default behavior, providing the mapEvents object:
    new H.mapevents.Behavior(mapEvents);

    var markers = []; // array of markers that have been added to the map
    var details = [];//Empty array of offer details

    // TODO Lookup an address and add a marker to the map at the position of this address
    function addMarkerToMap(address) {
        if (address) {
            // Hint: If you call the OpenStreetMap REST API too frequently, your access will be blocked.
            //       We have provided a helper function to prevent this however if you open the app
            //       on several browser windows at once you may still run into problems.
            //       Consider hardcoding locations for testing.

            // Hint: To ensure a marker will be cleared by clearMarkersFromMap, use:
            //       markers.push(marker);
            //       to add it to the markers array
            clearMarkersFromMap();

            // Convert the coordinates from the OSM API into point variables recognisable by HERE maps.
            var onSuccess = function (data) {
                // TODO 2(a) FR2.2
                // You need to implement this function
                // See the TMA for an explanation of the functional requirements

                // Hint: If you can't see the markers on the map if using the browser platform,
                //       try refreshing the page.
                var point = {
                    lng: data[0]["lon"],
                    lat: data[0]["lat"]
                };
                // For each location in the markers array, place a marker on the map.
                markers.push(point);
                map.setCenter(markers[0]);
                for (var i = 0; i < markers.length; i+=1){
                    marker = new H.map.DomMarker(markers[i], { icon: icon });
                    map.addObject(marker);
                }
            };

            // Hint: We have provided the helper function nominatim.get which uses
            //       the OpenStreetMap REST API to turn an address into co-ordinates.
            //       It does this in such a way that requests are cached and sent to
            //       the OpenStreetMap REST API no more than once every 5 seconds.
            nominatim.get(address, onSuccess);
        }
    }

    // Clear any markers added to the map (if added to the markers array)
    function clearMarkersFromMap() {
        // This is implemented for you and no further work is needed on it
        markers.forEach(function (marker) {
            if (marker) {
                map.removeObject(marker);
            }
        });
        markers = [];
    }

    // Obtain the device location and centre the map
    function centreMap() {
        // This is implemented for you and no further work is needed on it

        function onSuccess(position) {
            console.log("Obtained position", position);
            var point = {
                lng: position.coords.longitude,
                lat: position.coords.latitude,
            };
            map.setCenter(point);
        }

        function onError(error) {
            console.error("Error calling getCurrentPosition", error);

            // Inform the user that an error occurred
            alert("Error obtaining location, please try again.");
        }

        // Note: This can take some time to callback or may never callback,
        //       if permissions are not set correctly on the phone/emulator/browser
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
        });
    }

    // TODO Update the map with addresses for orders from the Taxi Sharing API
    function updateMap() {
        // TODO adjust the following to get the required data from your HTML view
        // TODO 2(a) FR2.1
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements

        // Hint: You will need to call addMarkerToMap and clearMarkersFromMap.
        // Hint: If you cannot complete FR2.1, call addMarkerToMap with a fixed value
        //       to allow yourself to move on to FR2.2.
        //       e.g. addMarkerToMap("Milton Keynes Central");
        function matchSuccess(data) {
            var results = data.data;
            markers = [];
            var locations = [];
            details = [];
            alert("you have " +results.length +" match(es)");

            //Create an array of match results
            for(var i = 0; i < results.length; i+=1){
                locations.push(results[i]);
            }
            //Create an array of match detail objects
            for (var i=0; i<results.length; i+=1){
                    var offer = {
                    userid: results[i]['userid'],
                    time: results[i]['start'],
                    location: results[i]['offer_address']
                };
                details.push(offer);
            }
            //populate and display a table of matches
            tableResults(details);
            
            // Send each address location to the map
            for (var i = 0; i < locations.length; i+=1){
                var address = (locations[i]['offer_address']);
                addMarkerToMap(address);
            }
        } 
        var userid = getInputValue("userid", "user1");
        var url = BASE_URL+"matches?userid="+ userid;
        console.log("matches: sending GET to url", url);
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: matchSuccess,
            error: function(xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    }

    // Register userid with the taxi sharing service
    function register(userid) {
        // 2(a) FR3
        // This is implemented for you and no further work is needed on it

        // Note we have pre-registered your userid so using this is only required
        // should you want to add an additional (fictional) userid for testing.

        function onSuccess(obj) {
            console.log("register: received obj", obj);

            // Inform the user what happened
            if (obj.status == "success") {
                alert("User " + userid + " has been successfully registered.");
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Invalid userid: " + userid);
            }
        }

        // Post the userid to register with the Taxi Sharing API
        var url = BASE_URL + "users";
        console.log("register: sending POST to " + url);
        $.ajax(url, { type: "POST", data: { userid: userid }, success: onSuccess });
    }

    // TODO Offer a taxi for the given userid
    function offer(userid, address, startTime, endTime) {
        // TODO 2(a) FR1.1
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements
        function offerSuccess(data) {
            console.log("offer: received data ", data);
            if (data.status === "success") {
    		alert("Your offer has been successfully received");}
    	}
        var url = BASE_URL + "orders";
        console.log("offer: sending POST to " + url);
        $.ajax(url, { type: "POST", data: {userid: userid, type: 0, address: address, start: startTime, end: endTime}, success: offerSuccess });   
    }

    // TODO Request an offered taxi for the given userid
    function request(userid, address, startTime) {
        // TODO 2(a) FR1.2
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements
        function requestSuccess(data){
            console.log("request: received data ", data);
            if (data.status === "success") {
                alert("Your request has been successfully received");}
            }
            
            var url = BASE_URL + "orders";
            console.log("request: sending POST to " + url);
            $.ajax(url, { type: "POST", data: {userid: userid, type: 1, address: address, start: startTime}, success: requestSuccess });
    }

    // Cancel all orders (offers and requests) for the given userid
    function cancel(userid) {
        // 2(a) FR1.3
        // This is implemented for you and no further work is needed on it

        function onDeleteSuccess(obj) {
            console.log("cancel/delete: received obj", obj);
        }

        function onListSuccess(obj) {
            console.log("cancel/list: received obj", obj);

            if (obj.status == "success") {
                // Orders are in an array named "data" inside the object returned
                var orders = obj.data;

                // Inform the user what is happening
                alert("Deleting " + orders.length + " orders");

                // Loop through each one and delete it
                orders.forEach(function (order) {
                    // Delete the order with this ID for the given userid
                    var deleteUrl = BASE_URL + "orders/" + order.id + "?userid=" + userid;
                    console.log("cancel/delete: Sending DELETE to " + deleteUrl);
                    $.ajax(deleteUrl, {
                        type: "DELETE",
                        data: {},
                        success: onDeleteSuccess,
                    });
                });
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert(obj.status + " " + obj.data[0].reason);
            }
        }

        // Get all the orders (offers and requests) for the given userid
        var listUrl = BASE_GET_URL + "orders?userid=" + userid;
        console.log("cancel/list: Sending GET to " + listUrl);
        $.ajax(listUrl, { type: "GET", data: {}, success: onListSuccess });
    }

    // Add table of match results to the HTML view
    function tableResults(data) {

        var col = [];
        for (var i = 0; i < data.length; i++) {
            for (var key in data[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }
        // Create a  results table.
        var table = document.createElement("table");      
        var tr = table.insertRow(-1);                  
        //Add a table header
        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");     
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // add results data to the table as rows.
        for (var i = 0; i < data.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = data[i][col[j]];
            }
        }

        //Add the table to the view container
        var divShowData = document.getElementById('table');
        divShowData.innerHTML = "";
        divShowData.appendChild(table);      
    }
        
    // Set initial HERE Map position
    centreMap();


    // PUBLIC FUNCTIONS - available to the view
    // Note these are declared as this.functionName = function () { ... };

    // Controller function to update map with matches to request or offer
    this.updateMap = function () {
        // 2(a) FR3
        // This is implemented for you and no further work is needed on it

        // Update map now
        updateMap();
    };
	
	// Controller function to centre map with matches to request or offer
    this.centreMap = function () {
        // 2(a) FR2.3
        // This is implemented for you and no further work is needed on it

        // Update map now
        centreMap();
    };

    // Controller function to register a user with the web service
    this.registerUser = function () {
        // 2(a) FR3
        // TODO adjust the following to get the userid from your HTML view
        var userid = getInputValue("userid", "user1");

        // Call the model using values from the view
        register(userid);
    };

    // Controller function for user to offer to share a taxi they have booked
    this.offerTaxi = function () {
        var defaultStartTime = convertToOrderTime(new Date());

        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");
        var address = getInputValue("spickup", "Milton Keynes Central Station");
        var startTime = getInputValue("sdatetime", defaultStartTime); // eg. 2020:12:18:14:38
        var hours = getInputValue("sduration", "1"); // duration in hours

        // The following code is very sensitive to the formatting of the date/time.
        // The code above automatically populates a defaultStartTime of the correct
        // format based on the current date and time. If you have problems we
        // recommend you leave the input blank on the HTML and use the default.

        // The format of the date and time should be exactly like:
        // 2020:12:18:14:38
        // YYYY:MM:DD:HH:MM
        // OR like
        // 2021-04-01 12:00:00
        // YYYY-MM-DD HH:MM:SS

        // You may change the way this code works if you wish.
        // Please take care with the formatting of the dates for the API call!

        // The model requires an end time, but the view provides a duration, so...
        // ...convert the start time back to a Date object...
        var endDate = convertFromOrderTime(startTime);
        // ...add on the hours (ensuring the string is an integer first)...
        endDate.setHours(endDate.getHours() + parseInt(hours));
        // ...convert back to an end time string
        var endTime = convertToOrderTime(endDate);

        // Call the model using values from the view
        offer(userid, address, startTime, endTime);
    };

    // Controller function for user to request to share an offered taxi
    this.requestTaxi = function () {
        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");
        var address = getInputValue("rpickup", "Open University, Milton Keynes");
        var startTime = getInputValue("rdatetime", convertToOrderTime(new Date()));

        // Call the model using values from the view
        request(userid, address, startTime);
    };

    // Controller function for user to cancel all their offers and requests
    this.cancel = function () {
        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");

        // Call the model using values from the view
        cancel(userid);
    };
}


