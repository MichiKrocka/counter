/***********************************************************
* @file     jquery.scrollView.js
* @author   Michael Krocka
* @version  0.0
*
* @brief    Vertical scroll of view container to element
*           inside of container.
***********************************************************/
(function($) {
  $.fn.scrollView = function(el) {
    return this.each(function(){
      var $V = $(this).eq(0),
          $E = $(el).eq(0);
      if(!$E.length)
        return;
      var Vt = $V.scrollTop(),
          Vo = $V.offset().top,
          Vh = $V.innerHeight(),
          Vd = Vo + Vh,
          Eo = $E.offset().top,
          Eh = $E.outerHeight(),
          Ed = Eo + Eh,
          s  = Vt;

      if(1 || Eh <= Vh){           // view bigger as element ??
        if(Eo < Vo)           // scroll down
          s = Eo - Vo + Vt;
        else if(Ed > Vd)      // scroll up
          s = Ed - Vd + Vt;
      } else {                // view smaller as element
        if(Ed < Vo)           // scroll up
          s = Ed - Vh;
        else if(Eo > Vd)      // scroll down
          s = Eo;
      }
      $V
      .stop()
      .animate({            // scroll view with animate
        scrollTop: s
      }, "fast");
    });
  }
})(jQuery);
