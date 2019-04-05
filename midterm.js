/* jshint esversion: 6 */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */
"use strict"

class EventsNearby {
  constructor(title, date, city, state, location, venue, performers, address) {
    this.title = title
    this.date = date
    this.city = city
    this.state = state
    this.location = location
    this.venue = venue
    this.performers = performers
    this.address = address
    this.type = type
  }
}

var stateList = []
var cityList = []
var eventList = []
var mapCoordinates = []

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
  let i
  for (i in states[0]) {
    stateList.push(states[0][i])
  }
  let stateLists = document.getElementById("state")
  for (let a of stateList) {
    let choice = document.createElement("option")
    choice.innerHTML = a
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
    for (let b of a[opt]) {
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
  let post = await Promise.all([getData(url)])
  var events = post.events
  console.log(events)
  for (let a of events) {
    var location = a.venue.display_location.split(",")
    for (let b of location) {
      b.trim()
    }
    var event = new SingleEvent(
      a.title,
      a.type,
      a.datetime_local,
      a.performers,
      cityState[0],
      cityState[1],
      a.venue.name,
      a.venue.address,
      a.venue.location
    )
    eventList.push(event)
  }
  let showMap = document.getElementById("showMap")
  showMap.removeAttribute("disabled")
}
async function geography() {
  let state = document.getElementById("state").value
  let city = document.getElementById("city").value
  let username = "mngonk01"
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

  if (mapCoordinates.length > 0) {
    while (mapCoordinates.length > 0) {
      mapCoordinates.pop()
    }
  }
  mapCoordinates.push(latitude)
  mapCoordinates.push(longitude)
}
function createMap() {
  console.log("reachedcreatemap")
  let map1 = new google.maps.Map(document.getElementById("map"), {
    center: {
      latit: parseFloat(mapCoordinates[0]),
      longi: parseFloat(mapCoordinates[1])
    },
    zoom: 15
  })
  let showMap = document.getElementById("map")
  showMap.onclick = function() {
    var map1
    if (eventList.length == 0) {
      alert("There are no events in the area chosen")
    }
    for (var a = 0; a < eventList.length; a++) {
      addMarker(eventList[a])
    }
    function addMarker(props) {
      var marker = new google.maps.Marker({
        position: {
          latit: props.location["latit"],
          longi: props.location["longi"]
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
  }
}

$(document).ready(function() {
  // stateController();
  weather()
})
