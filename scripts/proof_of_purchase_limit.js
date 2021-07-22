$.validator.addMethod('imageFileExtension', function(value, element) {
  if (value === '') {
    return true;
  }
  var acceptableValues = ['jpg','jpeg','gif','tif','pdf','png'];
  var splitValue = value.split('.');
  var extension = splitValue[splitValue.length -1].toLowerCase();
  if (acceptableValues.indexOf(extension) != -1)
    return true;
  else
    return false;
}, "File should be a .jpg, .jpeg, .gif, .tif, .pdf, or .png.");

$.validator.addMethod('maxFileSize', function(value, element) {
  if (element.files) {
    if (element.files.length>0 && element.files[0].size > 10485760)
      return false;
    else 
      return true;
  }
  else {
    return true;
  }
}, "Could not upload the file because file size exceeds 10MB.");

$(document).ready(function() {
  $("input").on("focus", function() {
    if ($("label[for=proof_of_purchase]").find("input").hasClass("invalid")) {
      $("label[for=proof_of_purchase]").find(".file-label").addClass("invalid");
    } else {
      $("label[for=proof_of_purchase]").find(".file-label").removeClass("invalid");
    };
  });
});

