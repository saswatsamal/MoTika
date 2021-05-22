
let districtSelect = document.getElementById("districtSelect")
let stateSelect = document.getElementById("stateSelect")
let stateObject = {}
let districtObject = {}
let table = document.getElementById("table100")
table.style.display = "none";

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = dd + '-' + mm + '-' + yyyy;

$(document).ready(function () {
    updateStates()
    //getAvailability();
    //setInterval(() => {
        //getAvailability();
    //}, 5000);
});


function getAvailability(id = 446) {
    var available_centers = [];
    $.ajax({
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + id + "&date="+today,
        type: "GET",
        success: function (results) {
            // console.log(results.centers);
            if (results.centers && results.centers.length) {
                var is_available = false;
                results.centers.forEach(function (item) {
                    if (item.sessions && item.sessions.length) {
                        // console.log(item.sessions);
                        var available_sessions = [];
                        item.sessions.forEach((session) => {
                            //for 45+ years above only
                            if (session.available_capacity > 0 && session.min_age_limit == 45 || session.min_age_limit == 18) {
                                available_sessions.push(session);
                            }
                        });
                        if (available_sessions.length) {
                            item.availableSessions = available_sessions;
                            delete item.sessions;
                            available_centers.push(item);
                        }
                    }
                });
                if (available_centers.length) {
                    prepareHtml(available_centers);
                }
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function prepareHtml(data) {
    var tbody = '';
    data.forEach(function (center, ind) {
        tbody += '<tr>' +
            '<th class="column2" rowspan=' + (center.availableSessions.length) + '>' + "<h6>Center Name:</h6>" + center.name + '</td>' +
            '<th class="column2" rowspan=' + (center.availableSessions.length) + '>' + "<h6>Center Address:</h6>" + center.address + '</td>' +
            '<th class="column2" rowspan=' + (center.availableSessions.length) + '>' + "<h6>PIN:</h6>" + center.pincode + '</td>'
            ;


        center.availableSessions.forEach(function (session, ind_s) {
            var class_name = 'badge badge-success';
            if (session.available_capacity < 10) {
                class_name = 'badge badge-danger';
            } else if (session.available_capacity < 30) {
                class_name = 'badge badge-warning';
            }

            if (ind_s != 0) {
                tbody += '<tr>';
            }
            tbody += '<th class="column2">' + "<h6>Age Limit:</h6>" + session.min_age_limit + '</td>' +
                '<th class="column2">' + "<h6>Date:</h6>" + session.date + '</td>' +
                '<th class="column2"><span class="' + class_name + '">' + "<h6>Availability: </h8>" + session.available_capacity + '</span></td>' +
                '<th class="column2">' + "<h6>Vaccine: </h6>" + session.vaccine + '</td>' +
                '</tr>';
        });
    });

    $('#data-table').html(tbody);
}

async function updateDistrict() {
    let cowinData = await fetch("https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+stateObject[stateSelect.value])
    let jsonCowinData = await cowinData.json()
    console.log(await jsonCowinData)
    for (const i in jsonCowinData["districts"]){
        districtObject[jsonCowinData["districts"][i]["district_name"]] = jsonCowinData["districts"][i]["district_id"]
        var option = document.createElement('option')
        option.text = jsonCowinData["districts"][i]["district_name"]
        districtSelect.add(option)
    }
}
async function updateStates() {
    let cowinData = await fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
    let jsonCowinData = await cowinData.json()
    for (const i in jsonCowinData["states"]){
        stateObject[jsonCowinData["states"][i]["state_name"]] = jsonCowinData["states"][i]["state_id"]
        var option = document.createElement('option')
        option.text = jsonCowinData["states"][i]["state_name"]
        stateSelect.add(option)
    }
}

function changeData(){
    table.style.display = "block";
    id = districtObject[districtSelect.value]
    getAvailability(id);
    setInterval(() => {
        getAvailability(id);
    }, 5000);
}
