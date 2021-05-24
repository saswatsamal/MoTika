let table = document.getElementById("table100")
let pinNotFound = document.getElementById("pin")
let pin
var available_centers = [];
let loadingBoolean = true

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = dd + '-' + mm + '-' + yyyy;

$(document).ready(function(){
    if (loadingBoolean){
    getAvailability();
    setInterval(() => {
        getAvailability();
    }, 5000);}
});
function getAvailability() {
    $.ajax({
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=446&date="+today,
        type: "GET",
        success: function(results) {
            available_centers = []
            // console.log(results.centers);
            if (results.centers && results.centers.length) {
                var is_available = false;
                results.centers.forEach(function(item) {
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
                    filterData(available_centers)
                }
            }
        },
        error:  function(error) {
            console.log(error);
        }
    });
}

function prepareHtml(data) {
    if (data.length != 0 ){
    var tbody = '';
    data.forEach(function(center, ind) {
        tbody += '<tr>'+
                '<th class="column2" rowspan='+(center.availableSessions.length)+'>'+"<h6>Center Name:</h6>"+center.name+ '</td>' +
                '<th class="column2" rowspan='+(center.availableSessions.length)+'>'+"<h6>Center Address:</h6>"+center.address+'</td>'+
                '<th class="column2" rowspan='+(center.availableSessions.length)+'>'+"<h6>PIN:</h6>"+center.pincode+'</td>'
                ;
                

        center.availableSessions.forEach(function(session, ind_s) {
            var class_name = 'badge badge-success';
            if (session.available_capacity < 10) {
                class_name = 'badge badge-danger';
            } else if (session.available_capacity < 30) {
                class_name = 'badge badge-warning';
            }

            if (ind_s != 0) {
                tbody += '<tr>';
            } 
            tbody += '<th class="column2">'+"<h6>Age Limit:</h6>"+session.min_age_limit+'</td>' +
                '<th class="column2">'+"<h6>Date:</h6>"+session.date+'</td>' +
                '<th class="column2"><span class="'+class_name+'">'+"<h6>Availability: </h8>"+session.available_capacity+'</span></td>' +
                '<th class="column2">'+"<h6>Vaccine: </h6>"+session.vaccine+'</td>' +
            '</tr>';
        });
    });

    $('#data-table').html(tbody);
    table.style.display = 'block'
    pinNotFound.style.display='none'
    }
    else{
        table.style.display='none'
        pinNotFound.style.display='block'
}
}

function filterData(){
    let loadingBoolean = false
    data = available_centers
    let filteredArray = []
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    for (i = 0; i< data.length;i++){
        pin = data[i]["pincode"].toString()
        if (pin){
        if (pin.toUpperCase().indexOf(filter) > -1){
            filteredArray.push(data[i])
        }
    }}
    let loadingBoolean = true
    prepareHtml(filteredArray);
    }

