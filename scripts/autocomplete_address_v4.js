;(function(window, document, $) {
  var _placeSearch, _autocomplete;

  var _componentForm = {
    street_number: ['short_name', 'address1'],
    route: ['long_name', 'address1'],
    locality: ['long_name', 'city'],
    administrative_area_level_1: ['long_name', 'state'],
    country: ['long_name', 'country'],
    postal_code: ['short_name', 'zip']
  }

  var initAutocomplete = function() {
    // Create the autocomplete object, restricting the search to geographical location types.
    _autocomplete = new google.maps.places.Autocomplete((document.getElementById('address1')), {types: ['geocode']});

    // Only return "address_components" from autocomplete
    _autocomplete.setFields(['address_components']);

    // When the user selects an address from the dropdown, populate the address fields in the form.
    _autocomplete.addListener('place_changed', fillInAddress);
  }

  var fillInAddress = function() {
    var place = _autocomplete.getPlace();
    _placeSearch = place;

    for (var component in _componentForm) {
      document.getElementById(_componentForm[component][1]).value = '';
    }

    // Get each component of the address from the place details and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (_componentForm[addressType]) {
        var val = place.address_components[i][_componentForm[addressType][0]];
        var input = document.getElementById(_componentForm[addressType][1]);
        if (input && input.value) {
          input.value =  input.value + " " + val;
        } else {
          input.value = val
        }
      }
    }
  }

  $(function() {
    //initAutocomplete();
    $("#address1").on("keyup", function() {
      if ($(this).val().length > 5) {
        if (undefined == _autocomplete) {
          initAutocomplete();
        }
      } else if (undefined != _autocomplete) {
        $(".pac-container").remove();
        google.maps.event.clearListeners($(this));
        _autocomplete = undefined;
      }
    })
  })
})(window, document, window.jQuery);
