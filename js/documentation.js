jQuery(document).ready(function() {
    var windowHeight = jQuery(window).height();
    var tocTopPosition = jQuery("#toc").position().top;
    var height = windowHeight - tocTopPosition - 100;

    jQuery("#documentation").height(height);
    jQuery("#toc").height(height);

    if(window.location.pathname.indexOf("#") > -1) {
        var documentationElementid = window.location.pathname.replace(/^.*#/, "");

    }
});
