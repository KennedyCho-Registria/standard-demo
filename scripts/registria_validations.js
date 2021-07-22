$.validator.addMethod(
  "regex",
  function(value, element, regexp) {
    var mod = "";

    // if regexp starts with a forward slash, remove it and split on the last one
    if(regexp.charAt(0) == "/") {
      var tokens = regexp.split("/");
      tokens.shift();
      mod = tokens.pop();
      regexp = tokens.join("/");
    }

    var re = new RegExp(regexp, mod);
    return this.optional(element) || re.test(value);
  },
  "Please check your input."
);

jQuery.fn.toggleValidations = function() {
  var element = jQuery(this);

  if(element.rules().length > 0) {
    element.removeValidations();
  }
  else {
    element.restoreValidations();
  }
};

jQuery.fn.removeValidations = function() {
  var element = jQuery(this);
  element.data("stored_validations", element.rules());
  element.rules("remove");
};

jQuery.fn.restoreValidations = function() {
  var element = jQuery(this);
  var validations = element.data("stored_validations");
  if(validations !== undefined) {
    element.rules("add", validations);
  }
};

if($(".registria_field:input[name*='product[model]']").exists()){
  $(".registria_field:input[name*='product[model]']").rules("add", {
    required: true
  });
}
if($(".registria_field:input[name*='product[purchased_at]']").exists()){
  $(".registria_field:input[name*='product[purchased_at]']").rules("add", {
    required: true
  });
}
if($(".registria_datepicker[name*='product[purchase_date]']").exists()){
  $(".registria_datepicker[name*='product[purchase_date]']").datepicker($.extend(true, {
    changeMonth: true,
    maxDate: '+0d',              yearRange: '1970:2018',                            changeYear: true
  }, $.datepicker.regional["en-us"] || $.datepicker.regional['']));

  $(".registria_datepicker[name*='product[purchase_date]']").rules("add", {
    dpDate: true
  });
}
if($(".registria_field:input[name*='product[purchase_date]']").exists()){
  $(".registria_field:input[name*='product[purchase_date]']").rules("add", {
    required: true
  });
}

if($(".registria_field:input[name*='user[phone]']").exists()){
  $(".registria_field:input[name*='user[phone]']").rules("add", {
    required: true
  });
}
if($(".registria_field:input[name*='user[last_name]']").exists()){
  $(".registria_field:input[name*='user[last_name]']").rules("add", {
    required: true
  });
}
if($(".registria_field:input[name*='user[first_name]']").exists()){
  $(".registria_field:input[name*='user[first_name]']").rules("add", {
    required: true
  });
}
if($(".registria_field:input[name*='user[email]']").exists()) {
  $(".registria_field:input[name*='user[email]']").rules("add", {
    regex: "^[A-Za-z0-9!%&'*+/=?^_`{|}~-]+(?:.[A-Za-z0-9!%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$".replace(new RegExp("\\.", "g"), "\\\."),
    messages: {
      regex: "Invalid."
    }
  });
}
if($(".registria_field:input[name*='user[email]']").exists()){
  $(".registria_field:input[name*='user[email]']").rules("add", {
    required: true
  });
}

if($(".registria_field:input[name*='user[address_attributes][zip]']").exists()){
  $(".registria_field:input[name*='user[address_attributes][zip]']").rules("add", {
    required: true
  });
}

if($(".registria_field:input[name*='user[address_attributes][state]']").exists()){
  $(".registria_field:input[name*='user[address_attributes][state]']").rules("add", {
    required: true
  });
}
if($(".registria_field:input[name*='user[address_attributes][address1]']").exists()){
  $(".registria_field:input[name*='user[address_attributes][address1]']").rules("add", {
    required: true
  });
}

if($(".registria_field:input[name*='user[password]']").exists() && $(".registria_field:input[name*='user[password_confirmation]']").exists()){
  $(".registria_field:input[name*='user[password_confirmation]']").rules("add", {
    equalTo: ".registria_field:input[name*='user[password]']",
    messages: {
      equalTo: "confirmation does not match"
    }
  });
}

if($(".registria_field:input[name*='user[email]']").exists() && $(".registria_field:input[name*='user[confirm_email]']").exists()){
  $(".registria_field:input[name*='user[confirm_email]']").rules("add", {
    equalTo: ".registria_field:input[name*='user[email]']",
    messages: {
      equalTo: "confirmation does not match"
    }
  });
}
