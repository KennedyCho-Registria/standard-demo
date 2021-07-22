$(document).ready(function() {
  $('input[type="file"]').change(function() {
    var file_path = $('input[type="file"]').val();
    var file_name = file_path.match(/[^\/\\]*$/)[0];
    $('.upload-text').html(file_name);
  });
});
