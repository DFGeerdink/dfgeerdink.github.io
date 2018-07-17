// Scroll Top
$('.top').click(function() {
  $('html, body').stop().animate({scrollTop: 0}, 'slow', 'swing');
});
$(window).scroll(function() {
  if ($(this).scrollTop() > $(window).height()) {
    $('.top').addClass("up");
  } else {
    $('.top').removeClass("up");
  }
});

// Text slideshow
$(document).ready(function(){
  $(function(){
    $('.slideshow .sub_title:gt(0)').hide();
    setInterval(function(){
      $('.slideshow :first-child').fadeOut(1500).next('.sub_title').fadeIn(1500)
      .end().appendTo('.slideshow');
  }, 4000);
  });
});

// Hide nanogallery watermark
$(document).ready(function(){
  $(function(){
  	$('.nGY2PortInfo').hide();
  });
});