jQuery.fn.exists = function(){return jQuery(this).length>0;}

jQuery.fn.registriaAutocomplete = function(options){
  var cache = {},
  lastXhr;

  var p = $.extend(true, {
    render: function(item){
      return item.label;
    }
  }, options || {});


  var ac_p = $.extend(true, {
    minLength: 3,
    source: function( request, response ) {
      var term = request.term;
      if ( term in cache ) {
        response( cache[ term ] );
        return;
      }

      if ($.browser.msie && window.XDomainRequest) {
        // Use Microsoft XDR
        var xdr = new XDomainRequest();
        xdr.open("get", p.url + "?" + $.param(request));
        xdr.onload = function() {
          data = jQuery.parseJSON(xdr.responseText);
          cache[ term ] = data;
          response( data );
        };
        xdr.send();
      } else {
        lastXhr = $.getJSON(p.url, request, function( data, status, xhr ) {
          cache[ term ] = data;
          if ( xhr === lastXhr ) {
            response( data );
          }
        });
      }
    }
  }, p.options || {});

  var ac = jQuery(this).autocomplete(ac_p);

  ac.data("autocomplete")._renderItem = function( ul, item ) {
    return $("<li></li>")
    .data("item.autocomplete", item)
    .append(p.render(item))
    .appendTo(ul); // result of render into append
  };

  return ac;
}

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[decodeURIComponent(hash[0])] = decodeURIComponent(hash[1]);
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  },
  objectSize: function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  }
});

function setCookie(c_name,value,expiredays,path)
{
    if(path == undefined)
        path = "/";
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toUTCString())+
    ";path="+path;
}

function getCookie(c_name)
{
    if (document.cookie.length>0)
      {
      c_start=document.cookie.indexOf(c_name + "=");
      if (c_start!=-1)
        {
        c_start=c_start + c_name.length+1;
        c_end=document.cookie.indexOf(";",c_start);
        if (c_end==-1) c_end=document.cookie.length;
        return unescape(document.cookie.substring(c_start,c_end));
        }
      }
    return "";
}

function postwith (to, p) {
  var myForm = $("<form action='" + to + "' method='POST'></form>");

  $.each(p, function(i,element){
	  var element = $(element);
	  if(element.attr('type') == 'radio') {
	    if(element.attr('checked')) {
	      var newElement = element.clone(true);
  		  newElement.val(element.val());
  		  newElement.attr('checked', true);
  		  element.attr('checked', true);
    		newElement.appendTo(myForm);
	    }
    }
    else {
      var newElement = element.clone(true);
		  newElement.val(element.val());
  		newElement.appendTo(myForm);
    }
	});

  myForm.appendTo('body');
  myForm.submit();
  myForm.remove();
}

function post_to_url(path, params, method) {
  method = method || "post"; // Set method to post by default, if not specified.

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    if(params.hasOwnProperty(key)) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}
