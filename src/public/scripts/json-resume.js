var resume;

// Load JSON resume for use in the console.
$(document).ready(function() {
  $.ajax({
    url: '/resume/resume.json',
    dataType: 'json',
    success: function(res) {
      resume = res;
    }
  });
});
