var Registria = Registria || (function() {
  var RegistriaClass = function() {
    this.Cases = {};

    this.Cases.view = function(caseId, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url: '/services/cases/view',
        data: {case_id: caseId},
        dataType: "json"
      }, settings || {}));
    };

    this.Cases.accept = function(caseId, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url: '/services/cases/accept',
        data: {case_id: caseId},
        dataType: "json"
      }, settings || {}));
    };

    this.Cases.decline = function(caseId, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url: '/services/cases/decline',
        data: {case_id: caseId},
        dataType: "json"
      }, settings || {}));
    };

    this.Cases.close = function(caseId, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url: '/services/cases/close',
        data: {case_id: caseId},
        dataType: "json"
      }, settings || {}));
    };

    this.Cases.comment = function(caseId, comment, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url: '/services/cases/comment',
        data: {case_id: caseId, comment: comment},
        dataType: "json"
      }, settings || {}));
    };

    this.Locations = {};

    this.Locations.remove = function(locationId, settings){
      $.ajax($.extend(true, {
        type: 'DELETE',
        url: '/services/locations/'+locationId+'/delete',
        dataType: "json"
      }, settings || {}));
    };

    this.Addresses = {};

    this.Addresses.index = function(userId, settings){
      $.ajax($.extend(true, {
        type: 'GET',
        url:'/services/users/'+userId+'/addresses/',
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.Addresses.show = function(userId, addressId, settings){
      $.ajax($.extend(true, {
        type: 'GET',
        url:'/services/users/'+userId+'/addresses/'+addressId,
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.Addresses.create = function(userId, data, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url:'/services/users/'+userId+'/addresses/',
        data: data || {},
        dataType: "json"
      }, settings || {}));
    };

    this.Addresses.update = function(userId, addressId, data, settings){
      $.ajax($.extend(true, {
        type: 'PUT',
        url:'/services/users/'+userId+'/addresses/'+addressId,
        data: data || {},
        dataType: "json"
      }, settings || {}));
    };

    this.Addresses.destroy = function(userId, addressId, settings){
      $.ajax($.extend(true, {
        type: 'DELETE',
        url:'/services/users/'+userId+'/addresses/'+addressId,
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.PaymentProfiles = {};

    this.PaymentProfiles.index = function(userId, settings){
      $.ajax($.extend(true, {
        type: 'GET',
        url:'/services/users/'+userId+'/payment_profiles/',
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.PaymentProfiles.show = function(userId, profileId, settings){
      $.ajax($.extend(true, {
        type: 'GET',
        url:'/services/users/'+userId+'/payment_profiles/'+profileId,
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.PaymentProfiles.create = function(userId, paymentData, settings){
      $.ajax($.extend(true, {
        type: 'POST',
        url:'/services/users/'+userId+'/payment_profiles/',
        data: paymentData,
        dataType: "json"
      }, settings || {}));
    };

    this.PaymentProfiles.update = function(userId, profileId, paymentData, settings){
      $.ajax($.extend(true, {
        type: 'PUT',
        url:'/services/users/'+userId+'/payment_profiles/'+profileId,
        data: paymentData,
        dataType: "json"
      }, settings || {}));
    };

    this.PaymentProfiles.destroy = function(userId, profileId, settings){
      $.ajax($.extend(true, {
        type: 'DELETE',
        url:'/services/users/'+userId+'/payment_profiles/'+profileId,
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.ShoppingCart = {};

    this.ShoppingCart.show = function(settings){
      $.ajax($.extend(true, {
        type: 'GET',
        url:'/server_side_carts',
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.ShoppingCart.empty = function(settings){
      $.ajax($.extend(true, {
        type: 'PUT',
        url:'/server_side_carts/empty_cart',
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.ShoppingCart.reset = function(settings){
      $.ajax($.extend(true, {
        type: 'PUT',
        url:'/server_side_carts/reset_cart',
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.ShoppingCart.line_remove = function(line_number, settings){
      $.ajax($.extend(true, {
        type: 'PUT',
        url:"/server_side_carts/remove/"+line_number,
        data: {},
        dataType: "json"
      }, settings || {}));
    };

    this.ShoppingCart.line_inc = function(line_number, qty, settings){
      var line_url = "/server_side_carts/increment";
      var actual_settings = settings;

      if (arguments.length >= 3){
        line_url = line_url + "/" + line_number + "/" + qty;
      } else if (arguments.length == 2){
        if (Object.prototype.toString.call(arguments[1]) == "[object Object]"){
          line_url = line_url + "/" + line_number + "/1";
          actual_settings = qty;
        } else {
          line_url = line_url + "/" + line_number + "/" + qty;
        }
      } else {
        line_url = line_url + "/" + line_number + "/1";
      }

      $.ajax($.extend(true, {
        type: 'PUT',
        url: line_url,
        data: {},
        dataType: "json"
      }, actual_settings || {}));
    };

    this.ShoppingCart.line_dec = function(line_number, qty, settings){
      var line_url = "/server_side_carts/decrement";
      var actual_settings = settings;

      if (arguments.length >= 3){
        line_url = line_url + "/" + line_number + "/" + qty;
      } else if (arguments.length == 2){
        if (Object.prototype.toString.call(arguments[1]) == "[object Object]"){
          line_url = line_url + "/" + line_number + "/1";
          actual_settings = qty;
        } else {
          line_url = line_url + "/" + line_number + "/" + qty;
        }
      } else {
        line_url = line_url + "/" + line_number + "/1";
      }

      $.ajax($.extend(true, {
        type: 'PUT',
        url: line_url,
        data: {},
        dataType: "json"
      }, actual_settings || {}));
    };

    this.ShoppingCart.add = function(sku, qty, rgstrn, price_override, settings){
      var add_url = "/server_side_carts/sku/add";
      var actual_settings = settings;
      if (arguments.length > 4){
        add_url = add_url + "/" + rgstrn + "/" + sku + "/" + qty + "/" + price_override;
      } else if (arguments.length == 4){
        if (Object.prototype.toString.call(arguments[3]) == "[object Object]"){
          add_url = add_url + "/" + rgstrn + "/" + sku + "/" + qty;
          actual_settings = price_override;
        } else {
          add_url = add_url + "/" + rgstrn + "/" + sku + "/" + qty + "/" + price_override;
        }
      } else if (arguments.length == 3){
        if (Object.prototype.toString.call(arguments[2]) == "[object Object]"){
          add_url = add_url + "/" + sku + "/" + qty;
          actual_settings = rgstrn;
        } else {
          add_url = add_url + "/" + rgstrn + "/" + sku + "/" + qty;
        }
      } else if (arguments.length == 2){
        if (Object.prototype.toString.call(arguments[1]) == "[object Object]"){
          add_url = add_url + "/" + sku + "/1";
          actual_settings = qty;
        } else {
          add_url = add_url + "/" + sku + "/" + qty;
        }
      } else {
        add_url = add_url + "/" + sku + "/1";
      }

      $.ajax($.extend(true, {
        type: 'PUT',
        url: add_url,
        data: {},
        dataType: "json"
      }, actual_settings || {}));
    };

    this.Dispatch = {};
    this.Dispatch.ShoppingCart = (function(){
      var klass =  function(){
        var listeners = {};
        var cartEvents = ['show', 'add', 'remove', 'increment', 'decrement', 'empty', 'reset'];

        for (var f in cartEvents) {
          var name = cartEvents[f];
          this[name] = Function('handler', "this.addHandler('"+name+"', handler);")
        }

        this.addHandler = function(eventName, handler) {
          listeners[eventName] = listeners[eventName] || [];
          listeners[eventName].push(handler);
        }

        this.trigger = function(eventName) {
          if(listeners[eventName]) {
            for (var f in listeners[eventName]) {
              listeners[eventName][f].apply(this, Array.prototype.slice.call(arguments, 1));
            }
          }
        }
      }

      return new klass();
    }());
  };

  return new RegistriaClass();
}());
