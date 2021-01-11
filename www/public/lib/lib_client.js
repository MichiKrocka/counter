/***********************************************************
* @file     lib.js
* @author   Michael Krocka
* @version  0.0
*
* @brief    Library functions.
***********************************************************/
var TIME_RESIZE  =  500,  // delay for resize
    TIME_REFRESH =  500,  // refresh for WebSocket D package
    TIME_CHANGE  =  TIME_REFRESH - 100,  // color notification for change < TIME_REFRESH
    TIME_DATE    = 1000,  // refresh time for date-time
    TIME_UNLOAD  =  500;  // time delay by beforeunload
// ---------------------------------------------------------
var CLASS_ON  = "w3-theme", // button class for ON
    CLASS_OFF = ""; // button class for OFF
// ---------------------------------------------------------
var DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";    
// ---------------------------------------------------------
var MAP = "https://www.google.com/maps/search/?api=1&query=";
// ---------------------------------------------------------
var keyNames = {
  3: "Pause", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift",
  17: "Ctrl", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Esc",
  32: "Space", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home",
  37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn",
  45: "Insert", 46: "Delete", 59: ";", 61: "=", 91: "Mod",
  92: "Mod", 93: "Mod", 106: "*", 107: "=", 109: "-", 110: ".",
  111: "/", 127: "Delete", 145: "ScrollLock", 171: "+", 173: "-", 186: ";",
  187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
  219: "[", 220: "\\", 221: "]", 222: "'", 63232: "Up",
  63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
  63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown",
  63302: "Insert"
};

// Number keys
for(var i = 0; i < 10; i++)
  keyNames[i + 48] = keyNames[i + 96] = String(i);
// Alphabetic keys
for(var i$1 = 65; i$1 <= 90; i$1++)
  keyNames[i$1] = String.fromCharCode(i$1);
// Function keys
for(var i$2 = 1; i$2 <= 12; i$2++)
  keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
// ---------------------------------------------------------
oCmOptions = {
  lineNumbers: true,
  lineWrapping: true,
  autoCloseBrackets: true,
  autoCloseTags: true,
  matchTags: {bothTags: true},
  tabSize: 2,
  gutters: ["CodeMirror-linenumbers", "breakpoints"],
  extraKeys: {
    "Ctrl-J": function(cm){
      cm.execCommand('toMatchingTag');
    },
    "F11": function(cm) {
      cm.setOption('fullScreen', !cm.getOption('fullScreen'));
    },
    "Esc": function(cm) {
      if(cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
    },
    "Tab": function(cm){
      if(cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        cm.replaceSelection(cm.getOption("indentWithTabs") ?
          "\t":
          Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
      }
    },
/*    
    "Ctrl-S": function(cm){
      $('li[data-c="SAVE"]', '#id_EditorNav').click();
    },
    "Alt-R": function(cm){
      $('li[data-c="RELOAD"]', '#id_EditorNav').click();
    },
    "Alt-S": function(cm){
      $('li[data-c="SAVE"]', '#id_EditorNav').click();
    },
    "Alt-W": function(cm){
      $('li[data-c="CLOSE"]', '#id_EditorNav').click();
    },
    "Alt-X": function(cm){
      $('li[data-c="SAVE+CLOSE"]', '#id_EditorNav').click();
    },
    "Alt-L": function(cm){
      $('[data-c="ROW"]', '#id_EditorNav').click();
    },
    "Alt-PageUp": function(cm){
      $('[data-file].w3-theme-d3', '#id_EditorNav')
      .prev()
      .click();
    },
    "Alt-PageDown": function(cm){
      $('[data-file].w3-theme-d3', '#id_EditorNav')
      .next()
      .click();
    },
    "Ctrl-O": function(cm){
      $('li[data-c="OPEN"]', '#id_EditorNav').click();
    },
*/
    "Shift-Ctrl-,": function(cm){
      $('li[data-c="COMMENT"]', '#id_EditorNav').click();
    },
    "Ctrl-Backspace": function(cm){return false}
  },
/*  
  allowDropFileTypes: [
    "text/html", "text/plain",
    "application/javascript", "application/x-javascript",
    "text/css"
  ],
*/
  highlightSelectionMatches: {
    showToken: /\w/,
    annotateScrollbar: true
  },
  styleActiveLine: true,
  matchBrackets: true
};
/***********************************************************
* @brief Whait and repeat key in wheel event.
*
* @param[in] key buffer
***********************************************************/
function repeatWheel(buf, self){
  if(document.ajax){
    setTimeout(function(){
      repeatWheel(buf, self);
    }, 10);
    return;
  }
  if(keyCode = buf.shift()){
    var e = new KeyboardEvent("keydown", {
      bubbles:    true,
      cancelable: true,
      keyCode:    keyCode
    });
    self.dispatchEvent(e);
    repeatWheel(buf, self);
  }
}
/***********************************************************
* @brief Set events promises.
*
* @param[in] delay delay time in miliseconds
***********************************************************/
function setEvents(){
  // window ------------------------------------------------
  var TIME_RESIZE_LOC = 0;
  
  $(window)
  // resize ................................................
  .on("resize", function(ev, arg){
    if(window.resize_t)
      clearTimeout(window.resize_t);
    window.resize_t = setTimeout(function(){
      $('.w3-main').height(
        $(window).innerHeight() - 
        $('.footer').height()
      );
      $('[data-resize]').each(function(){
        var f = $(this).data("resize");

        TIME_RESIZE_LOC = TIME_RESIZE;
        if(typeof f == "function"){
          f(ev, this, arg);
        }
        try{
          f = eval(f)
        } catch(e) {
          return;
        }
      });
    }, TIME_RESIZE_LOC);
  })
  // unload ................................................
  .on("beforeunload", function(ev){
    if(typeof logout == "function")
      logout();
    sleep(TIME_UNLOAD);
  });
  // .date -------------------------------------------------
  setInterval(function(){
    var D = new Date(),
        F = typeof oLang == "undefined" ||
            typeof oLang.datetime == "undefined" ?
            DATETIME_FORMAT : oLang.datetime;

    $('.date').text($.format.date(D, F));
    delete D;
  }, TIME_DATE);
  // body --------------------------------------------------
  $('body')
  // .d-open ...............................................
  .on("click", '.d-open', function(ev){
    var m = $(this).nextAll('.w3-modal');

    m.show();
    $('.w3-modal-content', m)
    .css({top:"", left:""})
    .drags({handle: 'header'});
    $('input,textarea,select', m).eq(0).select();
  })
  // .d-close ..............................................
  .on("click", '.d-close', function(ev){
    $(this).closest('.w3-modal').hide();
  })
  // .w3-select ............................................
  .on("change refresh", '.w3-select', function(ev){
    var cl = $('option:selected', this).attr("class");

    if(cl == "lang")
      return;
    if(typeof this.cl != "undefined")
      $(this).removeClass(this.cl);
    if(typeof cl != "undefined"){
      this.cl = cl;
      $(this).addClass(cl);
    }
  })
  // .tabs .................................................
  .on("click", '.tabs-nav button.tabs-btn', function(ev){
    var tab = $(this).parent(),
        div = tab.data("tabs"),
        ix  = $(this).index();
        
    $('.tabs-btn', tab).removeClass("w3-theme-d3");
    $(this).addClass("w3-theme-d3");
    $('.tabs-cnt', div).hide();
    $('.tabs-cnt', div).eq(ix).show();
  })
  // .t_lab ................................................
  .on("click", '.t_lab[data-help]', function(ev){
    var tr = [],
        O  = $(this).data("help");
    
    for(var o in O)
      tr.push(
        '<tr>'+
          '<td>'+o+'</td>'+
          '<td>'+O[o]+'</td>'+
        '</tr>'
      );
    $.alert(
      '<table class="w3-table w3-bordered w3-striped">'+
        '<tbody>'+
          tr.join("")+
        '</tbody>'+
      '</table>', {
        title: $(this).text(),
        lang: "",
        alert_class: ""
      }
    );
  })
  // [data-df] .............................................
  .on("dblclick", '[data-df]:not(.w3-disabled)', function(ev){
    var df = $(this).data("df");
    
    if(typeof df == "function")
      df(ev, this);
    else
      console.log(df);
  })
  // .switch[data-c] .......................................
  .on("click", '.switch[data-c]:not(.w3-disabled)', function(ev){
    var off = $(this).data("off"),
        on  = $(this).data("on");
        
    if(!off)
      $(this).data("off", off = CLASS_OFF);
    if(!on)
      $(this).data("on",  on  = CLASS_ON);
    $(this).toggleClass([on, off]).blur();
  })
  // [data-c] ..............................................
  .on("click", 
      ':not(.c-change,.c-focusout,.c-keyup,.w3-disabled)[data-c]', 
  function(ev, arg){
    var R = true;
    
    if(typeof choice != "undefined")
      R = choice(ev, this, Array.from(arguments).slice(1));
    $(this).blur();
    return R;
  })
  // .change[data-c] .......................................
  .on("change focusout keyup",
      '.c-change[data-c],.c-focusout[data-c],.c-keyup[data-c]', 
  function(ev){
    if(!$(this).hasClass("c-"+ev.type))
      return;
    var R = true;
    
    if(typeof choice != "undefined")
      R = choice(ev, this, Array.from(arguments).slice(1));
    return R;
  })
/*
  // .change[data-c] .......................................
  .on("change", '.c-change[data-c]', 
  function(ev){
    var R = true;
    
    if(typeof choice != "undefined")
      R = choice(ev, this);
    return R;
  })
  // .focusout[data-c] .....................................
  .on("focusout", '.c-focusout[data-c]', 
  function(ev){
    var R = true;
    
    if(typeof choice != "undefined")
      R = choice(ev, this);
    return R;
  })
*/
/*  
  // .c-blur[data-c] .......................................
  .on("blur", '.c-blur[data-c]', function(ev){
    var R = true;
    
    if(typeof choice != "undefined")
      R = choice(ev, this);
    return R;
  })
   // check blur ............................................
  .on("bblur", '[data-check]', function(ev){
    if(window.check && window.check !== this)
      return false;
    var x    = this.value,
        self = this;

    if(x == "")
      return;
    if(eval($(this).data("check"))){
      window.check = false;
      $(this).removeClass("w3-red");
    } else {
      window.check = this;
      $(this).addClass("w3-red");
      setTimeout(function(){
        self.focus();
      }, 0);
    }
    return false;
  })
*/
  // check focus / stop pingpong ...........................
  .on("focus", '[data-check]', function(ev){
    if(window.check && window.check !== this){
      window.check.focus();
      return false;
    }
  })
/*  
  // input[data-set],select[data-set] ......................
  .on("change", 'input[data-set],select[data-set]', function(ev){
    this.blur();
    var x = this.value;
    
    x = eval(this.inv);
    $.post("/set", this.set+"="+x);
  })
  // .w3-button[data-set]:not(.push) ...........................
  .on("click", 'button[data-set]:not(.push)',
  function(ev){
    var x    = $(this).hasClass(this.on) ? 0 : 1,
        self = this;
    
    x = eval(this.inv);
    if(typeof this.bit == "undefined"){
      $.post("/set", this.set+"="+x);
      return;      
    }
    $.post("/get", this.get, function(D){
      var m = self.get.replace(/&.*$/, ""),
          v = self.get.replace(/^.*&/, "");

      x = x ? 
          D[m][v] |  (1 << self.bit) :
          D[m][v] & ~(1 << self.bit);
      $.post("/set", self.set+"="+x);
    });
  })
  // .push[data-set] .......................................
  .on("mousedown", '.push[data-set]', function(ev){
    var x = 1;
    
    if(this.bit !== null){
      var self = this;
      
      $.post("/get", this.get, function(D){
        var v = self.get.replace(/^.*&/, ""),
            m = self.get.replace(/&.+/, "");
        
        x = D[m][v] | (1 << self.bit);
        $.post("/set", self.set+"="+eval(self.inv));
      });
    } else
      $.post("/set", this.set+"="+eval(this.inv));
    this.push = true;
  })
  // .push[data-set] .......................................
  .on("mouseup mouseleave", '.push[data-set]', function(ev){
    if(this.push){
      var x = 0;
    
      if(this.bit !== null){
        var self = this;
        
        $.post("/get", this.get, function(D){
          var v = self.get.replace(/^.*&/, ""),
              m = self.get.replace(/&.+/, "");
          
          x = D[m][v] & ~(1 << self.bit);
          $.post("/set", self.set+"="+eval(self.inv));
        });
      } else
      $.post("/set", this.set+"="+eval(this.inv));
      this.push = false;
    }
  })
*/
  // contextmenu ...........................................
  .on("contextmenu", '.contextmenu', function(ev){
    var f = $(this).data("contextmenu_fn");

    if(typeof f == "function")
      return f(ev, this);
  })
  // .sort .................................................
  .on("click", '.sort', function(ev, not_change){
    // sort function
    function sortFn(x){
      if(typeof sort_fn == "function")
        return sort_fn(x);
      try {
        x = eval(sort_fn);
      } catch(err){
        console.error(err);
        x = 0;
      }
      return x;
    }
    // event function
    var parent     = $(this).closest('[data-sort]'),
        target     = $(parent.data("sort")),
        el_set     = $('>', target).get(),
        el_ix      = $(this).index(),
        sort       = "asc",
        sort_fn    = $(this).data("sort_fn"),
        sort_after = parent.data("sort_after");

    target.hide();
    if(typeof sort_fn == "undefined")
      sort_fn = "x";
    // change sort type
    if(not_change){
      if($('.asc', parent).length)
        sort = "asc";
      else if($('.desc', parent).length)
        sort = "desc";
    } else {
      if($('.asc', parent).length)
        sort = $(this).hasClass("asc") ? "desc" : "asc";
      else if($('.desc', parent).length)
        sort = $(this).hasClass("desc") ? "" : "desc";
      $('.asc,.desc', parent).removeClass("asc desc");
      $(this).addClass(sort);
    }
    // sort
    var A = el_set.sort(function(a, b){
      if(sort == ""){
        return parseInt($(a).data("sort_id")) -
               parseInt($(b).data("sort_id"));
      }
      var A = sortFn($('>', a).eq(el_ix).text()),
          B = sortFn($('>', b).eq(el_ix).text());

      if(A == B){
        A = parseInt($(a).data("sort_id")),
        B = parseInt($(b).data("sort_id"));
        return A - B;
      }
      
      if(sort == "asc")
        return typeof A == "string" ? A.localeCompare(B) :
                                      A - B;
      if(sort == "desc")
        return typeof A == "string" ? B.localeCompare(A) :
                                      B - A;
    });
    target.append(A);
    target.show();
    if(typeof sort_after == "function")
      sort_after(this, sort);
    else if(typeof sort_after !== "undefined")
      try {
        eval(sort_after);
      } catch(err){
        console.error(err);
      }
  })
  // debug data from w3-theme-d3 ...........................
  .on("click", '.w3-theme-d3', function(ev){
    if(!ev.shiftKey)
      return;
    var D = $(this).data();
    
    if(typeof D == "undefined")
      return;
    console.log(D);
  })
  // wheel x ...............................................
  .on("wheel", ".x-wheel", function(ev){
    var self    = this,
        keyCode = ev.originalEvent.deltaX > 0 ? 40 : 38;

    if(typeof this.x_buf == "undefined")
      this.x_buf = [];

    this.x_buf.push(keyCode);
    if(document.ajax)
      return false;
    else
      repeatWheel(self.x_buf, self);
    return false;
  })
  // wheel y ...............................................
  .on("wheel", ".y-wheel", function(ev){
    var self    = this,
        keyCode = ev.originalEvent.deltaY > 0 ? 40 : 38;

    if(typeof this.y_buf == "undefined")
      this.y_buf = [];

    this.y_buf.push(keyCode);
    if(document.ajax)
      return false;
    else
      repeatWheel(self.y_buf, self);
    return false;
  })
  // keyboard ..............................................
  .on("keydown", function(ev){
    if(ev.keyCode == 34 && ev["char"])
      return;
    var key = keyNames[ev.keyCode];
    
    if(key == null || ev.altGraphKey)
      return;
    // Ctrl-ScrollLock has keyCode 3, same as Ctrl-Pause,
    // so we'll use event.code when available (Chrome 48+, FF 38+, Safari 10.1+)
    if(ev.keyCode == 3 && ev.code)
      key = ev.code;
    if(ev.altKey && key != "Alt")
      key = "Alt-" + key;
    if(ev.ctrlKey && key != "Ctrl")
      key = "Ctrl-" + key;
    if(ev.metaKey && key != "Cmd")
      key = "Cmd-" + key;
    if(ev.shiftKey && key != "Shift")
      key = "Shift-" + key;

    $('[data-key]:visible,[data-key_ever]').each(function(){
      var f = $(this).data();

      if(typeof f.key == "function")
        return f.key(key, this);
      else if(typeof f.key_ever == "function")
        return f.key_ever(key, this);
      else if(key == f.key)
        $(this).click();
      else if(key == f.key_ever)
        $(this).click();
    });
    if($('[data-key="'+key+'"]:visible,[data-key_ever="'+key+'"]').length){
      return false;
    }
  });
}
/***********************************************************
* @brief Sleep all process.
*
* @param[in] delay delay time in miliseconds
***********************************************************/
function sleep(delay) {
  var start = new Date().getTime();
  
  while(new Date().getTime() < start + delay);
}
/***********************************************************
* @brief Make buttons list of directory as menu.
*
* Format of file names:
*   [GRUPPE].[ORDER].[ROLE].[MenuItem].ejs
* visible only if user.role <= ROLE (router dir.js)
*
* @param[in]    dir       Directory on server
* @param[inout] callBack  CallBack function with HTML code
***********************************************************/
function menu(dir, callBack){
  $.post(dir, function(D){
    var A = [],
        R = [],
        C = "w3-bar-item w3-button w3-margin-right",
        p = "";
    
    for(var i in D){
      if(!D[i][1].match(/^[0-9]{2}[.][0-9]{2}[.].*/))
        continue;
      if(D[i][0] == 'F')
        A.push(D[i][1]);
    }
    A.sort();
    for(i in A){
      var Arr = A[i].split("."),
          c   = "";

      if(Arr.length != 5 || Arr[Arr.length - 1] != "ejs")
        continue;
      if(Arr[0] != p){
        if(p != "")
          c = 'w3-border-top';
        p = Arr[0];
      }
      if(i == A.length - 1)
        c += ' w3-border-bottom';
      var n = Arr[3].match(/^_*/)[0].length;

      R.push(
        '<button data-c="MENU" data-file="'+
          A[i].replace(".ejs", ".htm")+'" class="'+c+'">'+
          '<span class="lang" style="padding-left:'+n+'em">'+
            Arr[3].replace(/^_*/, "")+
          '</span>'+
        '</button>'
      );
    }
    R = $("<span>").html(R.join(""));
    $('button', R).addClass(C);//.data("data-c", "MENU");
    callBack(R.html());
  });
}
/***********************************************************
* @brief Get file name.
***********************************************************/
(function(){
  this.__defineGetter__("__FILE__", function() {
    var stack=((new Error).stack).split("\n");

    if(stack[0]=="Error") { // Chromium
      var m;
      if(m=stack[2].match(/\((.*):[0-9]+:[0-9]+\)/))
        return m[1];
    }
    else { // Firefox, Opera
      return stack[1].split("@")[1].split(":").slice(0,-1).join(":");
    }
  });
})();
/***********************************************************
* @brief Get function name.
***********************************************************/
(function(){
  this.__defineGetter__("__FUNCTION__", function() {
    return (new Error).stack.split("\n")[1].split("@")[0];
    //.split(":").slice(0,-1).join(":");
  });
})();
/***********************************************************
* @brief Copy text (str) in clipboard.
***********************************************************/
function copyToClipboard(str){
  var el = document.createElement('textarea');  // Create a <textarea> element

  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  var selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if(selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};
/***********************************************************
* @brief Copy text (str) in clipboard.
***********************************************************/
function insertAtCursor(el, txt) {
  var cursorPos = $(el).prop('selectionStart'),
      txtAll    = $(el).val(),
      txtBefore = txtAll.substring(0, cursorPos),
      txtAfter  = txtAll.substring(cursorPos, txtAll.length);

  $(el)
  .val(txtBefore + txt + txtAfter)
  .focus();
  $(el).prop('selectionEnd', txtBefore.length + txt.length);
  $(el).trigger("keyup");
}
/***********************************************************
* @brief Space.
***********************************************************/
function nbsp(s){
  return s == "" ? "&nbsp;" : s;
}
/***********************************************************
* @brief Format size of file.
***********************************************************/
function formatSizeUnits(bytes) {
  if(       ( bytes >> 30 ) & 0x3FF)
    bytes = ( bytes >>> 30 ) + '.' + ( bytes & (3*0x3FF )) + ' GB' ;
  else if ( ( bytes >> 20 ) & 0x3FF )
    bytes = ( bytes >>> 20 ) + '.' + ( bytes & (2*0x3FF ) ) + ' MB' ;
  else if ( ( bytes >> 10 ) & 0x3FF )
    bytes = ( bytes >>> 10 ) + '.' + ( bytes & (0x3FF ) ) + ' KB' ;
  else if ( ( bytes >> 1 ) & 0x3FF )
    bytes = ( bytes >>> 1 ) + ' Bytes' ;
  else
    bytes = bytes + 'Byte' ;
  return bytes ;
}
/***********************************************************
* @brief List of doc directory and open the file.
***********************************************************/
function help(){
  var loc_path  = window.location.pathname.substr(-1) == "/" ?
      window.location.pathname :
      window.location.pathname.replace(/[^/]*$/g, "");
  $.post("/dir"+loc_path+DIR_DOC, function(D){
    var HTML = "";

    D.sort(function(a, b){
      return a[1] > b[1] ? 1 : -1;
    });
    for(var i in D){
      HTML +=
        '<tr><td><a href="doc/'+D[i][1]+'" '+
          'style="width:100%;text-decoration: none;display:block" target="_blank">'+
          D[i][1]+
        '</a></td></tr>';
    }
    $.alert(
      '<table class="w3-table w3-table-all w3-hoverable">'+
        '<tbody>'+
          HTML+
        '</tbody>'+
      '</table>', {
        title:"Help",
        alert_class:""
    });
  })
}
/***********************************************************
* @brief Load cached JS.
  Usage:
  $.cachedScript("ajax/test.js")
  .done(function(script, textStatus){
    console.log( textStatus );
  });
***********************************************************/
jQuery.cachedScript = function(url, options){
  options = $.extend(options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return jQuery.ajax(options);
};
/***********************************************************
* @brief Load array of JS.
***********************************************************/
var CACHE = [];
function loadJS(A, cache, callBack){
  if(!A.length){
    if(callBack)
      callBack();
    return;
  }
  if(cache){
    if(CACHE.indexOf(A[0]) < 0){
      CACHE.push(A[0]);
      $.cachedScript(A[0])
      .done(function(script, textStatus){
        loadJS(A.slice(1), cache, callBack);
      });
    } else
      loadJS(A.slice(1), cache, callBack);
  } else
    $.getScript(A[0], function(){
      loadJS(A.slice(1), cache, callBack);
    });
}
/***********************************************************
* @brief Load array of CSS.
***********************************************************/
function loadCSS(A, callBack){
  for(var ix in A){

    $('<link rel="stylesheet">')
    .appendTo('head')
    .attr({
        type: 'text/css', 
        rel: 'stylesheet',
        href: A[ix]
    });
  }
  if(callBack)
    callBack();
}
/***********************************************************
* @brief Preview file in new tab over POST request.
***********************************************************/
function preview(url, data) {
  $('#id_dwnDiv').remove();
  var inp  = [],
      $div = $(
        '<div id="id_dwnDiv" style="display:non">'+
          '<form action="'+url+'" target="_blank" method="post">'+
          '</form>"'+
        '</div>'
      );
  
  for(var d in data){
    var $inp = $('<input name="'+d+'">');

    $inp.val(data[d]);
    inp.push($inp);
  }
  $('form', $div).html(inp);
  $div.appendTo('body');
  $('form', '#id_dwnDiv').submit().remove();
}
/***********************************************************
* @brief Download file over POST request.
***********************************************************/
function download(url, data) {
  $('#id_dwnDiv').remove();
  var inp  = [],
      $div = $(
        '<div id="id_dwnDiv" style="display:non">'+
          '<iframe name="dwnIframe"></iframe>'+
          '<form action="'+url+'" target="dwnIframe" method="post">'+
          '</form>"'+
        '</div>'
      );
  
  for(var d in data){
    var $inp = $('<input name="'+d+'">');

    $inp.val(data[d]);
    inp.push($inp);
  }
  $('form', $div).html(inp);
  $div.appendTo('body');
  $('form', '#id_dwnDiv').submit().remove();
}
/***********************************************************
* @brief Download data as file.
* @param[in] data = [PROTOCOL:][MIME,]DATA
*   Example:
* data = 'msag:text/plain;charset=utf-8,' +
         encodeURIComponent(data));
*
***********************************************************/
function downloadData(data){
  var W = open(data);

  setTimeout(function(){
    W.close();
  }, 2000);
  return;
}
/***********************************************************
* @brief QR-Code generation.
* @param[in]    text text to code
* @param[inout] callBack  CallBack
***********************************************************/
function qrCode(text, callBack){
  var dia = $(
  '<div>'+
    '<div class="print" style="padding:1em;white-space:pre-line">'+
      text+
    '</div>'+
    '<div id="id_QR" style="height:512px;padding:5px"></div>'+
  '</div>'
  ).dialog("open", {
    title:   "QR-Code",
    css: {
      "top": 0,
      "width": "512px"
    },
    buttons: {
      "CLOSE":
        '<button data-key="Esc" data-dc="CLOSE" '+
          'class="lang dialog-close w3-bar-item w3-button w3-right">'+
        'Cancel'+
        '</button>',
      "PRINT":
        '<button data-dc="PRINT" '+
          'class="lang w3-bar-item w3-button w3-right">'+
        'Print'+
        '</button>'
    },
    callBack: function(ev, el){
      switch($(el).data("dc")){
        case "CLOSE": // ...................................
          break;
        case "PRINT": // ...................................
          printCanvas($('canvas', div), text);
          return 0;
      }
      if(callBack)
        callBack();
      return 1;
    }
  });
  var div = $('#id_QR');
  
  div.height(div.width());
  div.qrcode({
    size: div.width(),
    text: text
  });
  
}
/***********************************************************
* @brief Print canvas from new window.
* @param[in]    el tcabvas
***********************************************************/
function printCanvas(el, text){
  const dataUrl = $(el)[0].toDataURL(); 
  let windowContent = 
    '<!DOCTYPE html>'+
    '<html>'+
    '<head><title>Print canvas</title></head>'+
    '<body>'+
    '<div style="padding:1em;white-space:pre-line">'+text+'</div>'+
    '<img src="' + dataUrl + '">'+
    '</body>'+
    '</html>';
  const printWin = window.open('', '');
  printWin.document.open();
  printWin.document.write(windowContent); 
  printWin.document.addEventListener('load', function() {
    printWin.focus();
    printWin.print();
    printWin.document.close();
    //printWin.close();            
  }, true);
}
/***********************************************************
* @brief Set right content type for JSON.
***********************************************************/
$.postJSON = function(url, data, callback, type) {
  return jQuery.ajax({
    'type':        'POST',
    'url':         url,
    'contentType': 'application/json; charset=utf-8',
    'data':        JSON.stringify(data),
    'dataType':    type ? type : 'json',
    'error':       callback,
    'success':     callback
  });
};
/***********************************************************
* @brief Play tone with frequency
***********************************************************/
var audioContext = typeof AudioContext == "undefined" ? 
                   null : new AudioContext();
function playFrequency(f, t, v) {
  if(!audioContext)
    return;
  if(!f) f = 1000;
  if(!t) t = 0.1;
  if(!v) v = 1;
  var sR      = audioContext.sampleRate;
  var d       = t * sR;
  var n       = 1;
  var buffer  = audioContext.createBuffer(n, d, sR);
  var D       = buffer.getChannelData(0);

  for(var i = 0; i < sR; i++)
    D[i] = v * Math.sin(2 * Math.PI * f * i / sR);
  var source = audioContext.createBufferSource();
  
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}
/***********************************************************
* @brief set a cookie value
***********************************************************/
function setCookie(cname, cvalue, exdays) {
  if(typeof exdays == "undefined")
    exdays = 31;
  var d = new Date();
  
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  
  document.cookie = cname + "=" + cvalue + ";" + expires +
                    ";path=/";
}
/***********************************************************
* @brief get a cookie value
***********************************************************/
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');

  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
/***********************************************************
* @brief copy string to clipboard
***********************************************************/
function copy2clipboard(str) {
  var ta = document.createElement('textarea');
  
  ta.value = str;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};
/***********************************************************
* @brief paste string from clipboard
***********************************************************/
/*
function clipboard2paste(){
  var ta = $('<textarea>');


  ta.on('copy', function(event) {
    console.log(event);
    ta.focus();
    document.execCommand("paste");
    console.log("ta", document.execCommand, ta.val());
    return false;
  });

  ta.trigger("copy");
}      
*/
/***********************************************************
* @brief get name from url search
***********************************************************/
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : 
    decodeURIComponent(results[1].replace(/\+/g, ' '));
};
/***********************************************************
* @brief parse of search object from url
***********************************************************/
function searchToObject(search) {
  return search.substring(1).split("&")
  .reduce(function(result, value) {
    var parts = value.split('=');
    
    if(parts[0]) result[decodeURIComponent(parts[0])] = 
      decodeURIComponent(parts[1]);
    return result;
  }, {})
}
/***********************************************************
* @brief Text to voice.
* @param[in]    text Text to speech
***********************************************************/
function speech(text) {
  var A = $('#id_Audio').get(0);
  
  $('source', A).attr('src', "spe?&text="+
    encodeURIComponent(text));
  A.load();
  A.play();
}
