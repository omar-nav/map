/* jshint esversion: 6 */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */
"use strict"

class EventsNearby {
  //THIS NEEDS TO BE CONFIRMED
  constructor(title, date, city, state, location, venue, performers, address) {
    this.title = title
    this.date = date
    this.city = city
    this.state = state
    this.location = location
    this.venue = venue
    this.performers = performers
    this.address = address
    //this.type = type
  }
}

var stateList = []
var cityList = []
var eventList = []
var mapCoordinates = []
var map1;
var geocoder;

async function getData(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => console.log(error))
}

async function weather() {
  let current = await Promise.all([
    getData(
      "https://api.apixu.com/v1/current.json?key=3ecad20435bd429692762237190204&q=52101"
    )
  ])
  var cardPara = `The current weather in Decorah is ${
    current[0].current.condition.text
  } with temperature of ${current[0].current.temp_f} F.`
  document.getElementById("card-body").innerHTML = cardPara
  document.getElementById("weather-icon").src =
    "https://" + current[0].current.condition.icon
}

async function stateController() {
  let statesLink =
    "https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json"
  let states = await Promise.all([getData(statesLink)])
  //NEEDED STATE CODE NOT ONLY STATE NAME
  let stateCodes = Object.getOwnPropertyNames(states[0]);
  // let i
  // for (i in states[0]) {
  //   stateList.push(states[0][i])
  // }
  stateList = states[0];
  let stateLists = document.getElementById("state")
  for (let a of stateCodes) {
    let choice = document.createElement("option")
    choice.innerHTML = states[0][a];
    choice.value = a;
    stateLists.appendChild(choice)
  }
}
async function cityController() {
  let opt = document.getElementById("state").value
  let cityLink =
    "https://raw.githubusercontent.com/cschoi3/US-states-and-cities-json/master/data.json"
  let cities = await Promise.all([getData(cityLink)])
  console.log(cities)
  cityList = []
  for (let a of cities) {
    for (let b of a[stateList[opt]]) {
      cityList.push(b)
    }
  }
  let citieslist = document.getElementById("city")
  citieslist.options.length = 0
  for (let c of cityList) {
    let choice = document.createElement("option")
    choice.innerHTML = c
    citieslist.appendChild(choice)
  }
}

async function eventsController() {
  let state = document.getElementById("state").value
  let city = document.getElementById("city").value
  let client_id = "&client_id=MTYwMzE4MjB8MTU1NDM0OTc2MC4yOA"
  let url =
    "https://api.seatgeek.com/2/events?venue.state=" +
    state +
    "&venue.city=" +
    city +
    client_id
  let post = await Promise.all([getData(url)]);
  //post returns an array, was erroring our events undefined
  var events = post[0].events
  console.log(events)
  for (let a of events) {
    var location = a.venue.display_location.split(",")
    for (let b of location) {
      b.trim()
    }
    //NAME WRONG, EVENTS NEARBY AND LOCATION
    var event = new EventsNearby(
      a.title,
      a.datetime_local,
      location[0],
      location[1],
      a.venue.location,
      a.venue.name,
      a.performers,
      a.venue.address,
    )
    eventList.push(event)
  }
  //Event List has been set to whatever is returned now we need to:
  //1. Dump all Other markers
  //1. Update map Markers
  //2. Change Center of Map and Zoom to the selected City(Google Maps Search)

  // var marker = new google.maps.Marker({
  //   position: myLatLng,
  //   map: map,
  //   title: 'Hello World!'
  // });

  //this element did not exist in the html, not sure what its purpose is
  // let showMap = document.getElementById("showMap")
  // showMap.removeAttribute("disabled")
}
async function geography() {
  console.log("running GEO");
  let state = document.getElementById("state").value
  let city = document.getElementById("city").value
  let username = "mngonk01"
  //NOT NECESSARY TO USE ANOTHER API JUST FOR THIS.
  //GETTING A 401 UNATHORIZED
  let url =
    "http://api.geonames.org/postalCodeLookupJSON?placename=" +
    city +
    "&country=US&username=" +
    username
  let [post] = await Promise.all([getData(url)])
  console.log(post)
  if (post.postalcodes.length > 0) {
    for (let a of post.postalcodes) {
      if (a.adminCode1 == state) {
        var latitude = a.latit
        var longitude = a.longi
      }
    }
  }
  if (latitude == null) {
    latitude = eventList[0].location[latit]
  }
  if (longitude == null) {
    longitude = eventList[0].location[longi]
  }


  //This seems strnage and not a place to use an array, better to save an obj = {lat: 23862.34, lng: 209723.2323}
  if (mapCoordinates.length > 0) {
    while (mapCoordinates.length > 0) {
      mapCoordinates.pop()
    }
  }
  mapCoordinates.push(latitude)
  mapCoordinates.push(longitude)
}

function updateMap(eventList) {
  //Clear Markers

  //Update Center

  //


}

function addMarker(props) {
  var marker = new google.maps.Marker({
    position: {
      latit: props.location["lat"],
      longi: props.location["lon"]
    },
    map1: map1
  })

  if (props.performers) {
    var title = "<h2>" + props.title + "</h2>"
    var date = "<p><b>Time and Date:</b> " + props.date + "</p>"
    var venue = "<p><b>Venue:</b> " + props.venue + "</p>"
    var address = "<p><b>Address:</b> " + props.address + "</p>"
    var type = "<p><b>" + props.type + "</b></p>"
    var featuring =
      "<p><b>Featuring:</b> " + props.performers[0].name + "</p>"
    var sentence = title + date + venue + address + type + featuring
    var infoWindow = new google.maps.infoWindow({ content: sentence })
    marker.addListener("click", function() {
      infoWindow.open(map1, marker)
    })
  }
}


function createMap() {
  //https://developers.google.com/maps/documentation/javascript/tutorial
  console.log("reachedcreatemap");


  //Need to authorize Geocoder EXTRA CREDIT
  //geocoder = new google.maps.Geocoder();
  //https://www.wpgmaps.com/documentation/how-to-generate-a-google-maps-geocoding-api-key/
  // geocoder.geocode({"address": "Houston, TX"}, function(result, status){
  //   var lat,lng;
    
  //   if(status == google.maps.GeocoderStatus.OK){
  //     lat = results[0].geometry.location.lat();
  //     lng = results[0].geometry.location.lng();
  //   } else {
  //     lat =100;
  //     lng = 100;
  //   }

  //   options = {
  //     center: new google.maps.LatLng(lat, lng),
  //     zoom: 15
  //   }

  //   map1 = new google.maps.Map(document.getElementById("map"), options)
  // });

  let options = {
    center: new google.maps.LatLng(10, 0),
    zoom: 10
  }

  map1 = new google.maps.Map(document.getElementById("map"), options)

  //let showMap = document.getElementById("map")

  //YOU DO NOT WANT TO PUT ON A CLICK EVENT ON THE CONTAINER FOR THE MAP, THEN YOU CANNOT INTERACT WITH THE MAP
  //showMap.onclick = function() {
  
  //https://developers.google.com/maps/documentation/javascript/events
  //THIS SHOULD BE A BUTTON THAT SAYS SHOW EVENTS
  map1.addListener("click", function(){
    console.dir(eventList);
    if (eventList.length == 0) {
      alert("There are no events in the area chosen")
    }
    //SHOULD NOT BE DONE IN THE CLICK, INSTEAD SHOULD BE DONE WHEN CITY IS UPDATED
    for (var a = 0; a < eventList.length; a++) {
      addMarker(eventList[a])
    }
  });
}

$(document).ready(async function() {
  weather();
  await stateController();
  cityController();
  
  document.getElementById("state").addEventListener("change", async (evnt) => {
    await cityController();
    eventsController();
  });

  document.getElementById("city").addEventListener("change", async (evnt) => {
    console.dir(evnt);
    await eventsController();

    //await geography();
    //createMap();
  });

})

