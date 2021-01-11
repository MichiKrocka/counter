/***********************************************************
* @file     jquery.i18n.js
* @author   Michael Krocka
* @version  0.0
*
* @brief    Vertical scroll of view container to element
*           inside of container.
***********************************************************/
(function($) {
  // -------------------------------------------------------
  $.fn.i18n = function(obj) {
    return this.each(function(){
      if(typeof obj == "undefined" ||
         typeof obj.vocabulary == "undefined")
         return;
      // ...................................................
      $('.lang', this)
      .filter(function(){return $(this).text() != "";})
      .each(function(){
        var txt = $(this)
                  .text()
                  .replace(/^[ \r\n\t]*|[ \r\n\t]*$/g, "");
        
        if(typeof $(this).data("lang") == "undefined")
          $(this).data("lang", txt);
        $(this).text(getText(this, $(this).data("lang")));
      });
      // ...................................................
      $('.lang-title', this)
      .filter(function(){return $(this).prop("title") != "";})
      .each(function(){
        if(typeof $(this).data("lang-title") == "undefined")
          $(this).data("lang-title", $(this).prop("title"));
        $(this).prop("title", getText(this, $(this)
        .data("lang-title")));
      });
      // ...................................................
      $('.lang-label', this)
      .filter(function(){return $(this).prop("label") != "";})
      .each(function(){
        if(typeof $(this).data("lang-label") == "undefined")
          $(this).data("lang-label", $(this).prop("label"));
        $(this).prop("label", getText(this, $(this)
        .data("lang-label")));
      });
      // ...................................................
      $('.lang-value', this)
      .filter(function(){return $(this).val() != "";})
      .each(function(){
        var txt = $(this)
                  .val()
                  .replace(/^[ \r\n\t]*|[ \r\n\t]*$/g, "");
        
        if(typeof $(this).data("lang-value") == "undefined")
          $(this).data("lang-value", txt);
        $(this).val("title", getText(this, $(this)
        .data("lang-value")));
      });
      // ...................................................
      $('.lang-placeholder', this)
      .filter(function(){return $(this).prop("placeholder") != "";})
      .each(function(){
        if(typeof $(this).data("lang-placeholder") == "undefined")
          $(this).data("lang-placeholder", $(this)
          .prop("placeholder"));
        $(this).prop("placeholder", getText(this, $(this)
        .data("lang-placeholder")));
      });
    });
    // .....................................................
    function getText(el, T){
      if(obj.lang != "en-en"){
        if(typeof obj.vocabulary[T] == "undefined")
          console.log("i18n", T);
        else
          T = obj.vocabulary[T];
      }
      return T;
    }
  }
  // -------------------------------------------------------
  $.i18n = function(text, obj) {
    return typeof obj.vocabulary[text] == "undefined" ?
           text : obj.vocabulary[text];
  }
})(jQuery);
