$(document).ready(function(){
    getAvailability();
    setInterval(() => {
        getAvailability();
    }, 5000);
});
function getAvailability() {
    var available_centers = [];
    $.ajax({
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=446&date=17-05-2021",
        type: "GET",
        success: function(results) {
            // console.log(results.centers);
            if (results.centers && results.centers.length) {
                var is_available = false;
                results.centers.forEach(function(item, ind) {
                    if (item.sessions && item.sessions.length) {
                        // console.log(item.sessions);
                        var available_sessions = [];
                        item.sessions.forEach((session, index) => {
                            if (session.available_capacity > 0 && session.min_age_limit == 45) {
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
        error:  function(error) {
            console.log(error);
        }
    });
}

function prepareHtml(data) {
    var tbody = '';
    data.forEach(function(center, ind) {
        tbody += '<tr>'+
                '<td class="column1" rowspan='+(center.availableSessions.length)+'>'+center.name+ " PIN: "+center.pincode+'</td>' +
                '<td class="column2" rowspan='+(center.availableSessions.length)+'>'+center.address+'</td>'
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
            tbody += '<td class="column3">'+session.min_age_limit+'</td>' +
                '<td class="column4">'+session.date+'</td>' +
                '<td class="column5"><span class="'+class_name+'">'+session.available_capacity+'</span></td>' +
                '<td class="column6">'+session.vaccine+'</td>' +
            '</tr>';
        });
    });

    $('#data-table').html(tbody);
}