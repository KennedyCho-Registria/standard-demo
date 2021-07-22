var placeSearch, autocomplete;
var componentForm = {
  street_number: ['short_name', 'address1'],
  route: ['long_name', 'address1'],
  locality: ['long_name', 'city'],
  administrative_area_level_1: ['long_name', 'state'],
  country: ['long_name', 'country'],
  postal_code: ['short_name', 'zip']
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('address1')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
  
  for (var component in componentForm) {
    document.getElementById(componentForm[component][1]).value = '';
  }

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType][0]];
      var input = document.getElementById(componentForm[addressType][1]);
      if (input && input.value) {
        input.value =  input.value + " " + val; 
      } else {
        input.value = val
      }
    }
  }
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

$(document).ready(function() {
if($("#address1").exists()){
  initAutocomplete();
  $("#address1").focus(function(){
    geolocate();
  });
}
});