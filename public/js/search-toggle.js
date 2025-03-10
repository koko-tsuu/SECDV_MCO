$(document).ready(function() {
    $('#search-toggle').click(function(e) {
        e.preventDefault();
        $('#search-popup').fadeToggle();
    });
});