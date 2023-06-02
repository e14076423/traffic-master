// var mapsAPIKey = "AIzaSyC2Z_1g1BlZ_mHK2d9sB2eRNoZb8OxqZ1k";
var testData;
var bikeStationList = [];
var busStationList = [];
var trainStaionList = [];
var route_url = null;

async function getBike() {
  fetch("/api/get_bike")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //save stations info to browser's bikeStationList
      bikeStationList = data.slice();

      // Get the selection list element
      var selectList = document.getElementById("bikeStationList");

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        var option = document.createElement("option");
        option.value = data[i].station_id;
        option.text = data[i].station_name;
        selectList.add(option);
      }
      showBike();
    })
    .catch((error) => console.error(error));
}

function showBike() {
  if (bikeStationList.length == 0) {
    console.log("bikeStationList is null");
  }
  bikeStaionBody = $("#bike-station-tbody");
  bikeStaionBody.empty();
  for (i = 0; i < bikeStationList.length; i++) {
    const bikeStation = bikeStationList[i].station_name;
    const bikeAddress = bikeStationList[i].station_address;
    const bikeCapacity = bikeStationList[i].bikes_capacity;
    const stationID = bikeStationList[i].station_id;

    // add favorite button
    // Create a button element using jQuery
    var favorite = $("<button>");

    // Set attributes or properties for the button using jQuery's chaining
    favorite
      .text("Like")
      .attr("id", "myButton")
      .data("stationID", stationID)
      .click(function () {
        var stationID = $(this).data("stationID");
        console.log("Clicked button with station ID: " + stationID);
        likeBike(stationID);
      });

    const tableRow = $("<tr>");
    const tableData1 = $("<td>").text(bikeStation);
    const tableData2 = $("<td>").text(bikeAddress);
    const tableData3 = $("<td>").text(bikeCapacity);
    const tableData4 = $("<td>").append(favorite);

    tableRow.append(tableData1, tableData2, tableData3, tableData4);
    bikeStaionBody.append(tableRow);
  }
}

function restBike() {
  const selectList = document.getElementById("bikeStationList");
  const selectedIndex = selectList.selectedIndex;
  const selectedValue = selectList.options[selectedIndex].value;
  fetch("/api/rest_bike/" + selectedValue)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // return data from backend
      console.log(Object.keys(data));
      stationName = bikeStationList[selectedIndex].station_name;
      stationAddress = bikeStationList[selectedIndex].station_address;
      posLon = bikeStationList[selectedIndex].position_lon;
      posLat = bikeStationList[selectedIndex].position_lat;

      document.getElementById("bikeStation-information").innerHTML =
        "可租借車數: " +
        data["AvailableRentBikes"] +
        "<br />" +
        "剩餘停車格: " +
        data["AvailableReturnBikes"];
    })
    .catch((error) => console.error(error));
}

function getBus() {
  fetch("/api/get_bus")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //save stations info to browser's busStationList
      busStationList = data.slice();
    })
    .catch((error) => console.error(error));
}

function getTrain() {
  fetch("/api/get_train")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //save stations info to browser's busStationList
      trainStaionList = data.slice();

      // Get the selection list element
      var start = document.getElementById("train-station-start");
      var destination = document.getElementById("train-station-destination");

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        var option = document.createElement("option");
        option.value = data[i].station_id;
        option.text = data[i].station_name;
        start.add(option);
        destination.add(option.cloneNode(true));
      }
    })
    .catch((error) => console.error(error));
}

function searchTrain() {
  const start = document.getElementById("train-station-start");
  const destination = document.getElementById("train-station-destination");

  const startSelectedIndex = start.selectedIndex;
  const startSelectedValue = start.options[startSelectedIndex].value;
  const startSelectedText = start.options[startSelectedIndex].text;

  const destinationSelectedIndex = destination.selectedIndex;
  const destinationSelectedValue =
    destination.options[destinationSelectedIndex].value;
  const destinationSelectedText =
    destination.options[destinationSelectedIndex].text;

  console.log(startSelectedValue);
  console.log(destinationSelectedValue);

  data = {
    startID: parseInt(startSelectedValue),
    startIndex: startSelectedIndex,
    startName: startSelectedText,
    destinationID: parseInt(destinationSelectedValue),
    destinationIndex: destinationSelectedIndex,
    destinationName: destinationSelectedText,
  };
  console.log(JSON.stringify(data));
  fetch("/api/search_train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      const trainTimeTable = $("#train-time-table");
      trainTimeTable.empty();

      for (var i = 0; i < json.length; i++) {
        const trainID = json[i].trainID;
        const startStation = json[i].startStation;
        const startTime = json[i].startTime;
        const destinationStation = json[i].destinationStation;
        const destinationTime = json[i].destinationTime;
        const duration = json[i].duration;

        // check selected time
        const selectedTime = document.getElementById("train-time-select").value;
        const isoSelectedTime = `2023-06-07T${selectedTime}`;
        const isoStartTime = `2023-06-07T${startTime}`;
        const dateSelectedTime = new Date(isoSelectedTime);
        const dateStartTime = new Date(isoStartTime);

        if (dateSelectedTime > dateStartTime && selectedTime != "") {
          continue;
        }

        // Create a button element using jQuery
        var favorite = $("<button>");

        // Set attributes or properties for the button using jQuery's chaining
        favorite
          .text("Like")
          .data("info", json[i])
          .click(function () {
            var train = $(this).data("info");
            console.log("Clicked button with data: " + JSON.stringify(train));
            likeTrain(train);
          });

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(trainID);
        const tableData2 = $("<td>").text(startStation);
        const tableData3 = $("<td>").text(destinationStation);
        const tableData4 = $("<td>").text(startTime);
        const tableData5 = $("<td>").text(destinationTime);
        const tableData6 = $("<td>").text(duration);
        const tableData7 = $("<td>").append(favorite);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5,
          tableData6,
          tableData7
        );
        trainTimeTable.append(tableRow);
      }

      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateBusRouteID() {
  const selectList = document.getElementById("bus_type");
  const selectedIndex = selectList.selectedIndex;
  const selectedValue = selectList.options[selectedIndex].value;
  const busRouteIDList = document.getElementById("bus_route_id");
  busRouteIDList.innerHTML = "";
  busRouteIDList.innerHTML = '<option value="none">請選擇公車路線</option>';
  for (var i = 0; i < busStationList.length; i++) {
    if (selectedValue == busStationList[i].type) {
      var option = document.createElement("option");
      option.value = busStationList[i].route_id;
      option.text = busStationList[i].route_name;
      busRouteIDList.add(option);
    }
  }
}

function getBusRouteURL() {
  const busRouteIDList = document.getElementById("bus_route_id");
  const selectedIndex = busRouteIDList.selectedIndex;
  const selectedValue = busRouteIDList.options[selectedIndex].value;
  bus_url = busStationList.find((x) => x.route_id == selectedValue).url;
  console.log(bus_url);

  document.getElementById("bus-iframe").src = bus_url;
  document.getElementById("bus-iframe").style.display = "block";
}

function likeBus() {
  const routeID = document.getElementById("bus_route_id").value;
  const bus = busStationList.find((obj) => obj.route_id === routeID);

  console.log(routeID, bus);

  fetch("/api/like_bus/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bus),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLikeBus() {
  fetch("/api/get_like_bus")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const likeBusSelect = $("#like-bus-select");
      likeBusSelect.empty();
      var option = $("<option>");
      option.text(`請選擇公車路線`);
      option.val("none");
      likeBusSelect.append(option);
      for (var i = 0; i < data.length; i++) {
        const routeName = data[i].route_name;
        const url = data[i].url;

        var option = $("<option>");
        option.text(routeName);
        option.val(url);
        likeBusSelect.append(option);
      }
    })
    .catch((error) => console.error(error));
}

function showLikeBus() {
  const url = document.getElementById("like-bus-select").value;
  console.log(url);
  document.getElementById("bus-iframe").src = url;
  if (url == "none") {
    document.getElementById("bus-iframe").style.display = "none";
  } else {
    document.getElementById("bus-iframe").style.display = "block";
  }
}

function deleteBus() {
  const route_name = $("#like-bus-select option:selected").text();
  console.log(route_name);
  fetch("/api/delete_bus", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ route_name: route_name }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
      location.reload();
    })
    .catch((error) => {
      console.error(error);
    });
}

function likeBike(stationID) {
  console.log(stationID);
  data = { stationID: stationID };
  fetch("/api/like_bike", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLikeBike() {
  fetch("/api/get_like_bike")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const likeBikeStation = data;
      var likeBikeTable = $("#like-bike-table");
      likeBikeTable.empty();
      for (i = 0; i < likeBikeStation.length; i++) {
        const stationID = likeBikeStation[i].station_id;
        const stationName = likeBikeStation[i].station_name;
        const stationAddress = likeBikeStation[i].station_address;
        const stationNotes = likeBikeStation[i].notes;

        // add favorite button
        // Create a button element using jQuery
        var notesField = $("<input>");
        var deleteBtn = $("<button>");
        var updateBtn = $("<button>");

        notesField.attr("id", stationID + "-notes").val(stationNotes);

        // Set attributes or properties for the button using jQuery's chaining
        deleteBtn
          .text("Delete")
          .data("stationID", stationID)
          .click(function () {
            var stationID = $(this).data("stationID");
            console.log("Clicked button with station ID: " + stationID);
            deleteBike(stationID);
          });

        updateBtn
          .text("Update")
          .data("stationID", stationID)
          .click(function () {
            var stationID = $(this).data("stationID");
            console.log("Clicked button with station ID: " + stationID);
            updateBike(stationID, $(`#${stationID}-notes`).val());
          });

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(stationName);
        const tableData2 = $("<td>").text(stationAddress);
        const tableData3 = $("<td>").append(notesField);
        const tableData4 = $("<td>").append(deleteBtn);
        const tableData5 = $("<td>").append(updateBtn);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5
        );
        likeBikeTable.append(tableRow);
      }
      getLikeTrain();
    })
    .catch((error) => console.error(error));
}

function deleteBike(stationID) {
  fetch("/api/delete_bike/" + stationID, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
      location.reload();
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateBike(stationID, notes) {
  fetch("/api/update_bike/" + stationID, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: notes }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
      location.reload();
    })
    .catch((error) => {
      console.error(error);
    });
}

function likeTrain(train) {
  console.log(train);
  data = { train: train };
  fetch("/api/like_train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLikeTrain() {
  fetch("/api/get_like_train")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const likeTrainStation = data;
      var likeTrainTable = $("#like-train-table");
      likeTrainTable.empty();
      for (i = 0; i < likeTrainStation.length; i++) {
        const trainID = likeTrainStation[i].train_id;
        const startStation = likeTrainStation[i].start_station;
        const destinationStation = likeTrainStation[i].destination_station;
        const startTime = likeTrainStation[i].start_time;
        const destinationTime = likeTrainStation[i].destination_time;
        const duration = likeTrainStation[i].duration;

        // Create a button element using jQuery
        var deleteBtn = $("<button>");

        // Set attributes or properties for the button using jQuery's chaining
        deleteBtn
          .text("Delete")
          .data("train", likeTrainStation[i])
          .click(function () {
            var train = $(this).data("train");
            console.log("Clicked button with train: " + JSON.stringify(train));
            deleteTrain(train);
          });

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(trainID);
        const tableData2 = $("<td>").text(startStation);
        const tableData3 = $("<td>").text(destinationStation);
        const tableData4 = $("<td>").text(startTime);
        const tableData5 = $("<td>").text(destinationTime);
        const tableData6 = $("<td>").text(duration);
        const tableData7 = $("<td>").append(deleteBtn);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5,
          tableData6,
          tableData7
        );
        likeTrainTable.append(tableRow);
      }
      getLikeBus();
    })
    .catch((error) => console.error(error));
}

function deleteTrain(train) {
  fetch("/api/delete_train/", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(train),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
      location.reload();
    })
    .catch((error) => {
      console.error(error);
    });
}

function showBusTable() {
  fetch("/api/get_bus")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#BUS-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const route_id = data[i].route_id;
        const url = data[i].url;
        const type = data[i].type;
        const type_zh = data[i].type_zh;
        const route_name = data[i].route_name;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(route_id);
        const tableData2 = $("<td>").text(url);
        const tableData3 = $("<td>").text(type);
        const tableData4 = $("<td>").text(type_zh);
        const tableData5 = $("<td>").text(route_name);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showTrainTable() {
  fetch("/api/get_train")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#TRAIN-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const station_id = data[i].station_id;
        const station_address = data[i].station_address;
        const station_phone = data[i].station_phone;
        const station_name = data[i].station_name;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(station_id);
        const tableData2 = $("<td>").text(station_address);
        const tableData3 = $("<td>").text(station_phone);
        const tableData4 = $("<td>").text(station_name);

        tableRow.append(tableData1, tableData2, tableData3, tableData4);
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showBikeTable() {
  fetch("/api/get_bike")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#BIKE-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const station_id = data[i].station_id;
        const bikes_capacity = data[i].bikes_capacity;
        const station_name = data[i].station_name;
        const station_address = data[i].station_address;
        const position_lon = data[i].position_lon;
        const position_lat = data[i].position_lat;
        const geo_hash = data[i].geo_hash;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(station_id);
        const tableData2 = $("<td>").text(bikes_capacity);
        const tableData3 = $("<td>").text(station_name);
        const tableData4 = $("<td>").text(station_address);
        const tableData5 = $("<td>").text(position_lon);
        const tableData6 = $("<td>").text(position_lat);
        const tableData7 = $("<td>").text(geo_hash);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5,
          tableData6,
          tableData7
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showTrainNorthStationTable() {
  fetch("/api/get_train_north_station")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#TRAIN_NORTH_STATION-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const station_id = data[i].station_id;
        const train_id = data[i].train_id;
        const order_num = data[i].order_num;
        const arr_time = data[i].arr_time;
        const station_name = data[i].station_name;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(station_id);
        const tableData2 = $("<td>").text(train_id);
        const tableData3 = $("<td>").text(order_num);
        const tableData4 = $("<td>").text(arr_time);
        const tableData5 = $("<td>").text(station_name);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showTrainSouthStationTable() {
  fetch("/api/get_train_south_station")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#TRAIN_SOUTH_STATION-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const station_id = data[i].station_id;
        const train_id = data[i].train_id;
        const order_num = data[i].order_num;
        const arr_time = data[i].arr_time;
        const station_name = data[i].station_name;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(station_id);
        const tableData2 = $("<td>").text(train_id);
        const tableData3 = $("<td>").text(order_num);
        const tableData4 = $("<td>").text(arr_time);
        const tableData5 = $("<td>").text(station_name);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showLikeBusTable() {
  fetch("/api/get_like_bus")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#LIKE_BUS-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const route_id = data[i].route_id;
        const route_name = data[i].route_name;
        const type = data[i].type;
        const type_zh = data[i].type_zh;
        const url = data[i].url;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(route_id);
        const tableData2 = $("<td>").text(route_name);
        const tableData3 = $("<td>").text(type);
        const tableData4 = $("<td>").text(type_zh);
        const tableData5 = $("<td>").text(url);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showLikeTrainTable() {
  fetch("/api/get_like_train")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#LIKE_TRAIN-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const route_id = data[i].train_id;
        const start_station = data[i].start_station;
        const destination_station = data[i].destination_station;
        const start_time = data[i].start_time;
        const destination_time = data[i].destination_time;
        const duration = data[i].duration;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(route_id);
        const tableData2 = $("<td>").text(start_station);
        const tableData3 = $("<td>").text(destination_station);
        const tableData4 = $("<td>").text(start_time);
        const tableData5 = $("<td>").text(destination_time);
        const tableData6 = $("<td>").text(duration);

        tableRow.append(
          tableData1,
          tableData2,
          tableData3,
          tableData4,
          tableData5,
          tableData6
        );
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function showLikeBikeTable() {
  fetch("/api/get_like_bike")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      var table = $("#LIKE_BIKE-TABLE-tbody");
      table.empty();

      // Loop through the array and create an option element for each object
      for (var i = 0; i < data.length; i++) {
        const station_id = data[i].station_id;
        const station_name = data[i].station_name;
        const station_address = data[i].station_address;
        const notes = data[i].notes;

        const tableRow = $("<tr>");
        const tableData1 = $("<td>").text(station_id);
        const tableData2 = $("<td>").text(station_name);
        const tableData3 = $("<td>").text(station_address);
        const tableData4 = $("<td>").text(notes);

        tableRow.append(tableData1, tableData2, tableData3, tableData4);
        table.append(tableRow);
      }
    })
    .catch((error) => console.error(error));
}

function boom() {
  console.log("boom!");
}

function test() {
  fetch("/test")
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // right now you get the return data (usually data are in json format)

      // and then you can store the data to a variable, and make sure you decode the json data
      testData = data; // testData now becomes {'message': 'This is a test'}
      console.log(Object.keys(testData)); // see how many keys the object has

      document.getElementById("test").innerHTML = testData["message"]; //show the message
    })
    .catch((error) => console.error(error));
}

function dbTest() {
  fetch("/db/test")
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // right now you get the return data (usually data are in json format)
      document.getElementById("database-content").innerHTML = "";
      for (i = 0; i < data.length; i++) {
        document.getElementById("database-content").innerHTML +=
          data[i] + "<br />"; //show the message
      }
    })
    .catch((error) => console.error(error));
}

function dbInsert() {
  var testID = document.getElementById("testID").value;
  var testCONTENT = document.getElementById("testCONTENT").value;
  document.getElementById("testID").value = "";
  document.getElementById("testCONTENT").value = "";
  console.log("testID: " + testID);
  console.log("testCONTENT: " + testCONTENT);
  data = { testID, testCONTENT };
  fetch("/db/test/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to submit data");
      }
    })
    .then((json) => {
      console.log(json);
    })
    .catch((error) => {
      console.error(error);
    });

  // fetch("http://127.0.0.1:5000/db/test/insert")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log(data); // right now you get the return data (usually data are in json format)
  //     console.log(typeof data);
  //     document.getElementById("database-content").innerHTML = data; //show the message
  //   })
  //   .catch((error) => console.error(error));
}
