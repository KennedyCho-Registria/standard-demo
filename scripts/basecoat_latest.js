/**
 * frautoComplete
 *
 * Turns any text field into an autocomplete
 * field, given a list of options to populate.
 *
 * @param {Element} targetField The field to target
 * @param {Object} settings Settings object (optional)
 *   @key {Element} hiddenField A hidden field to pass a special value
 *   @key {Number} limit Max number of list items to display
 *   @key {Boolean} validate When true, check if input value matches a list item
 *   @key {Boolean} highlight When true, displayed list items will have the match highlighted
 *   @key {String} modelString Template string for product data (ex. "{name} - {sku}")
 *   @key {Array} list List of autocomplete options
 * @return {Object} Methods
 *   @key {Function} updateList Updates the list
 */

'use strict';

(function (document, window) {

  var frautoComplete = function frautoComplete(targetField) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$hiddenField = _ref.hiddenField;
    var hiddenField = _ref$hiddenField === undefined ? targetField : _ref$hiddenField;
    var _ref$limit = _ref.limit;
    var limit = _ref$limit === undefined ? 5 : _ref$limit;
    var _ref$validate = _ref.validate;
    var validate = _ref$validate === undefined ? targetField.getAttribute('data-allowfreeinput') ? false : true : _ref$validate;
    var _ref$highlight = _ref.highlight;
    var highlight = _ref$highlight === undefined ? true : _ref$highlight;
    var _ref$modelString = _ref.modelString;
    var modelString = _ref$modelString === undefined ? targetField.getAttribute('data-model-string') || '{sku}' : _ref$modelString;
    var _ref$list = _ref.list;
    var list = _ref$list === undefined ? [] : _ref$list;

    /**
     * This is where we keep track of moving
     * and changing parts.
     */

    var state = {
      targetField: targetField,
      hiddenField: hiddenField,
      list: list,
      isScrolling: false
    };

    /**
     * === Data Handlers ===
     */

    /**
     * isProduct
     *
     * Determines if a given item is a
     * Registria Platform product.
     *
     * @param {Object} object The object to test
     * @return {Boolen} True if the item is a product
     */

    function isProduct(object) {
      var props = ['product_id', 'product_sku', 'product_name', 'sku'];

      return props.reduce(function (bool, prop) {
        if (bool) return bool;
        return object.hasOwnProperty(prop);
      }, false);
    }

    /**
     * parseTemplateString
     *
     * Parses an object with a template.
     * Object keys will be replaced with
     * their values when the keys are included
     * like "{key}" (ex "{sku} - {name}")
     *
     * @param {String} template The template string
     * @param {Object} obj Object to parse
     */

    function parseTemplateString(template, obj) {
      if (!template || typeof template !== 'string') {
        return null;
      }

      var regex = /\{([^\}]*)\}/g;
      var matches = regex.test(template) && template.match(regex);
      if (matches === false) return false;

      return matches.reduce(function (output, match) {
        var pattern = new RegExp(match);
        var key = match.replace(/\{|\}/g, '');
        var value = obj[key];
        return output.replace(pattern, value);
      }, template);
    }

    /**
     * itemTemplate
     *
     * Parses inputted list item into the
     * output format.
     *
     * @param {String|Object} item The item to parse
     * @return {Object} Template object for display
     */

    function itemTemplate(item) {
      var label = undefined,
          value = undefined;

      if (typeof item === 'string') {
        label = item;
        value = label;
      }

      // test if item is a product
      else if (isProduct(item)) {
          label = parseTemplateString(modelString, {
            name: item.product_name || item.label || item.name,
            sku: item.product_sku || item.sku,
            id: item.product_id || item.id
          });

          value = item.product_id || item.id;
        }

        // test if item is an object
        else if (item.hasOwnProperty('label')) {
            label = item.label;
            value = item.value || label;
          }

      return { label: label, value: value };
    }

    /**
     * filterList
     *
     * Filters the list by input and outputs
     * a new list of template objects.
     *
     * @param {String} input Input to filter against
     * @return {Array} List of template objects
     */

    function filterList(input) {
      return state.list.filter(function (item) {
        var template = itemTemplate(item);
        return fuzzyMatch(input, template.label);
      }).reduce(function (arr, item, i) {
        if (i >= limit) return arr;
        arr.push(itemTemplate(item));
        return arr;
      }, []);
    }

    /**
     * fuzzyMatch
     *
     * Matches some input string against a given
     * standard string. Comparison is done without
     * special characters, white space, and case.
     *
     * @param {String} input The input to test
     * @param {String} comparison Standard to test against
     * @return {Boolean} True if the strings match
     */

    function fuzzyMatch(input, comparison) {
      if (!input || !comparison) return false;
      var regex = /[\'\"\-\[\]\/\{\}\(\)\*\+\?\!\.\,\\\^\$\|\ ]/g;
      var _input = input.replace(regex, '').toUpperCase();
      var _comparison = comparison.replace(regex, '').toUpperCase();
      var search = new RegExp(_input, 'i');
      return search.test(_comparison);
    }

    /**
     * validateInput
     *
     * Checks whether a given input matches
     * an item in the stored list.
     *
     * @param {String} input The input to test
     * @return {Boolean} True if input is in list
     */

    function validateInput(input) {
      if (!input || typeof input !== 'string') return false;

      // if input is present in list as is, return true
      if (state.list.indexOf(input) > -1) return true;

      // otherwise, check if input matches any itemTemplate label
      return state.list.some(function (item) {
        return input === itemTemplate(item).label;
      });
    }

    /**
     * === DOM Handlers ===
     */

    /**
     * buildListItem
     *
     * Produces a list item component
     * given some data to populate.
     *
     * @param {Object} item itemTemplate object
     * @return {Element} List item component
     */

    function buildListItem(_ref2) {
      var label = _ref2.label;
      var value = _ref2.value;

      var li = document.createElement('li');
      var str = highlight ? highlightString(label, state.targetField.value) : label;
      li.innerHTML = str;
      li.setAttribute('data-value', value);
      return li;
    }

    /**
     * buildList
     *
     * Produces a list of list items
     * from the filtered list.
     *
     * @param {Array} filteredList List of items to build
     * @return {Element} List component
     */

    function buildList(filteredList) {
      var ul = document.createElement('ul');
      ul.classList.add('frauto-list');

      filteredList.map(buildListItem).map(function (el) {
        ul.appendChild(el);
      });

      // detect ul scrolls
      var timer = null;
      ul.addEventListener('scroll', function (event) {
        state.isScrolling = true;

        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(function () {
          state.isScrolling = false;
        }, 250);
      });

      if (ul.firstElementChild) ul.firstElementChild.classList.add('selected');
      return ul;
    }

    /**
     * highlightString
     *
     * Wraps the matching part of a string
     * in strong tags.
     *
     * @param {String} str Source string
     * @param {String} substr Substring to highlight
     * @return {String} str with substr highlighted
     */

    function highlightString(str, substr) {
      var _str = str.toLowerCase();
      var _substr = substr.toLowerCase();
      var regex = new RegExp(substr, 'i');

      // find index of the match
      var index = _str.indexOf(_substr);
      var insert = str.substr(index, substr.length);

      var highlighted = '<strong>' + insert + '</strong>';
      return str.replace(regex, highlighted);
    }

    /**
     * toggleList
     *
     * Toggles visiblity of the DOM list
     *
     * @param {Boolean} bool List will be shown when true, hidden when false
     */

    function toggleList(bool) {
      var frautoList = state.targetField.parentNode.querySelector('.frauto-list');
      var display = frautoList ? frautoList.style.display : null;

      if (frautoList === null) return;

      if (typeof bool === 'boolean') {
        frautoList.style.display = bool === true ? 'block' : 'none';
      } else {
        frautoList.style.display = display === 'none' ? 'block' : 'none';
      }
    }

    /**
     * clearFields
     *
     * Resets the value of both fields.
     */

    function clearFields() {
      state.targetField.value = '';
      state.hiddenField.value = '';
    }

    /**
     * makeSelection
     *
     * Selects a list item.
     *
     * @param {Element} item The list item to select
     */

    function makeSelection(item) {
      var frautoList = state.targetField.parentNode.querySelector('.frauto-list');
      var length = frautoList.children.length;
      var i = undefined;

      // update field values
      state.targetField.value = item.textContent;
      state.hiddenField.value = item.getAttribute('data-value');

      // update list items
      for (i = length - 1; i >= 0; i--) {
        frautoList.children[i].classList.remove('selected');
      }

      item.classList.add('selected');
    }

    /**
     * showAutocomplete
     *
     * Updates the list based on field input.
     *
     * @param {Boolean} show When true, list should display
     */

    function showAutocomplete(show) {
      var input = state.targetField.value;
      var templates = filterList(input);
      var oldList = state.targetField.parentNode.querySelector('.frauto-list');
      var newList = buildList(templates);

      // swap out the lists
      if (oldList) oldList.parentNode.removeChild(oldList);
      state.targetField.parentNode.appendChild(newList);

      // hide the list by default
      toggleList(false);
      if (show || input.length) toggleList(true);
    }

    /**
     * cycleOptions
     *
     * Changes the selected list item based
     * on DOM proximity.
     *
     * @param {String} direction Previous or next
     */

    function cycleOptions(direction) {
      var frautoList = state.targetField.parentNode.querySelector('.frauto-list');
      var current = frautoList.querySelector('.selected');
      var prev = current.previousSibling;
      var next = current.nextSibling;
      var first = frautoList.firstElementChild;
      var last = frautoList.lastElementChild;
      var selection = current;

      // make sure list is showing
      toggleList(true);

      if (direction === 'previous') {
        selection = prev ? prev : last;
      } else if (direction === 'next') {
        selection = next ? next : first;
      }

      // scroll to element if necessary
      selection.scrollIntoView();

      makeSelection(selection);
    }

    /**
     * === Event Handlers ===
     */

    (function () {
      var targetContainer = state.targetField.parentNode;
      var clickTest = null;

      // make selection on click
      var clickHandler = function clickHandler(event) {
        // fix for touch screens
        if (state.isScrolling) return false;

        // only select frauto-list li elements
        if (event.target.parentNode.classList.contains('frauto-list') && event.target.nodeName === 'LI') {
          event.preventDefault();
          state.targetField.focus();
          makeSelection(event.target);
          toggleList(false);
        }
      };

      // mousedown for most browsers, touchend for the rest
      targetContainer.addEventListener('mousedown', clickHandler);
      targetContainer.addEventListener('touchend', clickHandler);

      // handle non-input keys
      state.targetField.addEventListener('keypress', function (event) {
        var selection = targetContainer.querySelector('.frauto-list > .selected');

        // make selection on enter
        if (event.keyCode === 13) {
          event.preventDefault();
          makeSelection(selection);
          toggleList(false);
        }

        // recycle list on backspace
        if (event.keyCode === 8) {
          showAutocomplete(true);
        }
      });

      // keyboard controls and text entry
      state.targetField.addEventListener('input', function (event) {
        var key = event.keyCode;

        // hide list for ESC
        if (key === 27) return toggleList(false);

        // select next item for DownArrow
        if (key === 40) return cycleOptions('next');

        // select previous item for UpArrow
        if (key === 38) return cycleOptions('previous');

        // otherwise, show the list
        showAutocomplete(true);
      });

      // allow scrolling with click & drag in IE
      targetContainer.addEventListener('mousedown', function (event) {
        if (event.target.nodeName === 'UL') {
          clickTest = event.target.children.length ? event.target : null;
        }
      });

      targetContainer.addEventListener('mouseup', function (event) {
        if (clickTest && event.target.nodeName === 'UL') {
          clickTest = null;
          event.preventDefault();
        }
      });

      // validate input on blur
      state.targetField.addEventListener('blur', function (event) {
        var listItems = targetContainer.querySelectorAll('li');
        var highlighted = targetContainer.querySelectorAll('li:hover, li.selected');
        var defaultHidden = state.hiddenField.getAttribute('data-default');

        // passthru for above listener
        if (clickTest && clickTest.nodeName === 'UL') {
          clickTest = null;
          state.targetField.focus();
          return true;
        }

        // make selection if only on option is left
        if (listItems.length === 1) {
          makeSelection(listItems[0]);
        }

        // select highlighted option when there is input
        if (state.targetField.value && highlighted.length === 1) {
          makeSelection(highlighted[0]);
        }

        // validate the input
        if (validate) {
          if (!validateInput(state.targetField.value)) clearFields();
        } else {
          // set default value for hidden field
          if (defaultHidden && !validateInput(state.targetField.value)) {
            state.hiddenField.value = defaultHidden;
          }
        }

        toggleList(false);
      });

      // refilter the list and trigger blur on change
      state.targetField.addEventListener('change', function (event) {
        showAutocomplete();
        event.target.blur();
      });

      // clear selected class on hover
      targetContainer.addEventListener('hover', function (event) {
        if (event.target.nodeName === 'LI') {
          targetContainer.querySelector('.selected').classList.remove('selected');
          event.target.classList.add('selected');
        }
      });
    })();

    return {
      updateList: function updateList(list) {
        if (!Array.isArray(list)) {
          throw new Error('updateList must be called with an array. Called with: ' + list);
        }

        state.list = list;
        showAutocomplete();
      }
    };
  };

  // export the function
  window.frautoComplete = frautoComplete;
})(document, window);
/*
 * Mailcheck https://github.com/mailcheck/mailcheck
 * Author
 * Derrick Ko (@derrickko)
 *
 * Released under the MIT License.
 *
 * v 1.1.0
 */

var Mailcheck = {
  domainThreshold: 2,
  secondLevelThreshold: 2,
  topLevelThreshold: 2,

  defaultDomains: ['msn.com', 'bellsouth.net',
    'telus.net', 'comcast.net', 'optusnet.com.au',
    'earthlink.net', 'qq.com', 'sky.com', 'icloud.com',
    'mac.com', 'sympatico.ca', 'googlemail.com',
    'att.net', 'xtra.co.nz', 'web.de',
    'cox.net', 'gmail.com', 'ymail.com',
    'aim.com', 'rogers.com', 'verizon.net',
    'rocketmail.com', 'google.com', 'optonline.net',
    'sbcglobal.net', 'aol.com', 'me.com', 'btinternet.com',
    'charter.net', 'shaw.ca'],

  defaultSecondLevelDomains: ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"],

  defaultTopLevelDomains: ["com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de",
    "fr", "it", "ru", "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu",
    "ie", "co.il", "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz",
    "in", "net", "net.au", "info", "biz", "mil", "co.jp", "sg", "hu"],

  run: function(opts) {
    opts.domains = opts.domains || Mailcheck.defaultDomains;
    opts.secondLevelDomains = opts.secondLevelDomains || Mailcheck.defaultSecondLevelDomains;
    opts.topLevelDomains = opts.topLevelDomains || Mailcheck.defaultTopLevelDomains;
    opts.distanceFunction = opts.distanceFunction || Mailcheck.sift3Distance;

    var defaultCallback = function(result){ return result };
    var suggestedCallback = opts.suggested || defaultCallback;
    var emptyCallback = opts.empty || defaultCallback;

    var result = Mailcheck.suggest(Mailcheck.encodeEmail(opts.email), opts.domains, opts.secondLevelDomains, opts.topLevelDomains, opts.distanceFunction);

    return result ? suggestedCallback(result) : emptyCallback()
  },

  suggest: function(email, domains, secondLevelDomains, topLevelDomains, distanceFunction) {
    email = email.toLowerCase();

    var emailParts = this.splitEmail(email);

    var closestDomain = this.findClosestDomain(emailParts.domain, domains, distanceFunction, this.domainThreshold);

    if (closestDomain) {
      if (closestDomain == emailParts.domain) {
        // The email address exactly matches one of the supplied domains; do not return a suggestion.
        return false
      } else {
        // The email address closely matches one of the supplied domains; return a suggestion
        return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
      }
    }

    // The email address does not closely match one of the supplied domains
    var closestSecondLevelDomain = this.findClosestDomain(emailParts.secondLevelDomain, secondLevelDomains, distanceFunction, this.secondLevelThreshold);
    var closestTopLevelDomain    = this.findClosestDomain(emailParts.topLevelDomain, topLevelDomains, distanceFunction, this.topLevelThreshold);

    if (emailParts.domain) {
      var closestDomain = emailParts.domain;
      var rtrn = false;

      if(closestSecondLevelDomain && closestSecondLevelDomain != emailParts.secondLevelDomain) {
        // The email address may have a mispelled second-level domain; return a suggestion
        closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
        rtrn = true;
      }

      if(closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain) {
        // The email address may have a mispelled top-level domain; return a suggestion
        closestDomain = closestDomain.replace(emailParts.topLevelDomain, closestTopLevelDomain);
        rtrn = true;
      }

      if (rtrn == true) {
        return { address: emailParts.address, domain: closestDomain, full: emailParts.address + "@" + closestDomain };
      }
    }

    /* The email address exactly matches one of the supplied domains, does not closely
     * match any domain and does not appear to simply have a mispelled top-level domain,
     * or is an invalid email address; do not return a suggestion.
     */
    return false;
  },

  findClosestDomain: function(domain, domains, distanceFunction, threshold) {
    threshold = threshold || this.topLevelThreshold;
    var dist;
    var minDist = 99;
    var closestDomain = null;

    if (!domain || !domains) {
      return false;
    }
    if(!distanceFunction) {
      distanceFunction = this.sift3Distance;
    }

    for (var i = 0; i < domains.length; i++) {
      if (domain === domains[i]) {
        return domain;
      }
      dist = distanceFunction(domain, domains[i]);
      if (dist < minDist) {
        minDist = dist;
        closestDomain = domains[i];
      }
    }

    if (minDist <= threshold && closestDomain !== null) {
      return closestDomain;
    } else {
      return false;
    }
  },

  sift3Distance: function(s1, s2) {
    // sift3: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
    if (s1 == null || s1.length === 0) {
      if (s2 == null || s2.length === 0) {
        return 0;
      } else {
        return s2.length;
      }
    }

    if (s2 == null || s2.length === 0) {
      return s1.length;
    }

    var c = 0;
    var offset1 = 0;
    var offset2 = 0;
    var lcs = 0;
    var maxOffset = 5;

    while ((c + offset1 < s1.length) && (c + offset2 < s2.length)) {
      if (s1.charAt(c + offset1) == s2.charAt(c + offset2)) {
        lcs++;
      } else {
        offset1 = 0;
        offset2 = 0;
        for (var i = 0; i < maxOffset; i++) {
          if ((c + i < s1.length) && (s1.charAt(c + i) == s2.charAt(c))) {
            offset1 = i;
            break;
          }
          if ((c + i < s2.length) && (s1.charAt(c) == s2.charAt(c + i))) {
            offset2 = i;
            break;
          }
        }
      }
      c++;
    }
    return (s1.length + s2.length) /2 - lcs;
  },

  splitEmail: function(email) {
    var parts = email.trim().split('@');

    if (parts.length < 2) {
      return false;
    }

    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '') {
        return false;
      }
    }

    var domain = parts.pop();
    var domainParts = domain.split('.');
    var sld = '';
    var tld = '';

    if (domainParts.length == 0) {
      // The address does not have a top-level domain
      return false;
    } else if (domainParts.length == 1) {
      // The address has only a top-level domain (valid under RFC)
      tld = domainParts[0];
    } else {
      // The address has a domain and a top-level domain
      sld = domainParts[0];
      for (var i = 1; i < domainParts.length; i++) {
        tld += domainParts[i] + '.';
      }
      tld = tld.substring(0, tld.length - 1);
    }

    return {
      topLevelDomain: tld,
      secondLevelDomain: sld,
      domain: domain,
      address: parts.join('@')
    }
  },

  // Encode the email address to prevent XSS but leave in valid
  // characters, following this official spec:
  // http://en.wikipedia.org/wiki/Email_address#Syntax
  encodeEmail: function(email) {
    var result = encodeURI(email);
    result = result.replace('%20', ' ').replace('%25', '%').replace('%5E', '^')
                   .replace('%60', '`').replace('%7B', '{').replace('%7C', '|')
                   .replace('%7D', '}');
    return result;
  }
};

// Export the mailcheck object if we're in a CommonJS env (e.g. Node).
// Modeled off of Underscore.js.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mailcheck;
}

// Support AMD style definitions
// Based on jQuery (see http://stackoverflow.com/a/17954882/1322410)
if (typeof define === "function" && define.amd) {
  define("mailcheck", [], function() {
    return Mailcheck;
  });
}

if (typeof window !== 'undefined' && window.jQuery) {
  (function($){
    $.fn.mailcheck = function(opts) {
      var self = this;
      if (opts.suggested) {
        var oldSuggested = opts.suggested;
        opts.suggested = function(result) {
          oldSuggested(self, result);
        };
      }

      if (opts.empty) {
        var oldEmpty = opts.empty;
        opts.empty = function() {
          oldEmpty.call(null, self);
        };
      }

      opts.email = this.val();
      Mailcheck.run(opts);
    }
  })(jQuery);
}

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent, iPhone = /iphone/i.test(ua), chrome = /chrome/i.test(ua), android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin,
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(),
                range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin),
                range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(),
            begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length),
            {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length,
            firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])),
                null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }
                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }
                function seekNext(pos) {
                    for (;++pos < len && !tests[pos]; ) ;
                    return pos;
                }
                function seekPrev(pos) {
                    for (;--pos >= 0 && !tests[pos]; ) ;
                    return pos;
                }
                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                            if (!(len > j && tests[i].test(buffer[j]))) break;
                            buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                        }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }
                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                        if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                        c = t;
                    }
                }
                function androidInputEvent() {
                    var curVal = input.val(), pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                        if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }
                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }
                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(),
                        begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1),
                        end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1),
                        e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText),
                        input.caret(0, checkVal()), e.preventDefault());
                    }
                }
                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode, pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)),
                            p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }
                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }
                function writeBuffer() {
                    input.val(buffer.join(""));
                }
                function checkVal(allow) {
                    var i, c, pos, test = input.val(), lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++) if (tests[i]) {
                        for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) if (c = test.charAt(pos - 1),
                        tests[i].test(c)) {
                            buffer[i] = c, lastMatch = i;
                            break;
                        }
                        if (pos > test.length) {
                            clearBuffer(i + 1, len);
                            break;
                        }
                    } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""),
                    clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))),
                    partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this), buffer = $.map(mask.split(""), function(c, i) {
                    return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                }), defaultBuffer = buffer.join(""), focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent),
                checkVal();
            });
        }
    });
});

// based on PHP Name Parser by Josh Fraser (joshfraser.com)
// http://www.onlineaspect.com/2009/08/17/splitting-names/
// ported to JavaScript by Mark Pemburn (pemburnia.com)
// released under Apache 2.0 license

var NameParse = (function(){
    function NameParse() {
        return NameParse;
    }

        // split full names into the following parts:
        // - prefix / salutation  (Mr., Mrs., etc)
        // - given name / first name
        // - middle initials
        // - surname / last name
        // - suffix (II, Phd, Jr, etc)
    NameParse.parse = function (fullName) {
        fullName = fullName.trim();

        var
            nameParts = [],
            firstName = "",
            lastName = "",
            initials = "",
            initials = "",
            word = null,
            j = 0,
            i = 0;

        // split into words
        // completely ignore any words in parentheses
        nameParts = fullName.split(" ").filter(function(namePart){
            return (namePart.indexOf("(") === -1);
        });

        var
            numWords = nameParts.length,
            // check for prefix and suffix
            salutation = this.is_salutation(nameParts[0]),
            suffix = this.is_suffix(nameParts[numWords - 1]),
            // trim any found prefixes and suffixes
            start = (salutation) ? 1 : 0,
            end = (suffix) ? numWords - 1 : numWords;

        // update word to start parsing inner
        word = nameParts[start];

        // if we start off with an initial, we'll call it the first name
        if (this.is_initial(word)) {
            // if so, do a look-ahead to see if they go by their middle name
            // for ex: "R. Jason Smith" => "Jason Smith" & "R." is stored as an initial
            // but "R. J. Smith" => "R. Smith" and "J." is stored as an initial
            if (this.is_initial(nameParts[start + 1])) {
                firstName += " " + word.toUpperCase(); }
            else {
                initials += " " + word.toUpperCase(); }
        } else {
            firstName += " " + this.fix_case(word);
        }

        // concat the first name
        for (i=start + 1; i<(end - 1); i++) {
            word = nameParts[i];
            // move on to parsing the last name if we find an indicator of a compound last name (Von, Van, etc)
            // we do not check earlier to allow for rare cases where an indicator is actually the first name (like "Von Fabella")
            if (this.is_compound_lastName(word)) {
                break;
            }

            if (this.is_initial(word)) {
                initials += " " + word.toUpperCase();
            } else {
                firstName += " " + this.fix_case(word);
            }
        }

        // check that we have more than 1 word in our string
        if ((end - start) > 1) {
            // concat the last name
            for (j=i; j<end; j++) {
                lastName += " " + this.fix_case(nameParts[j]);
            }
        }

        // return the various parts in an array
        return {
            "salutation": salutation || "",
            "firstName": firstName.trim(),
            "initials": initials.trim(),
            "lastName": lastName.trim(),
            "suffix": suffix || ""
        };
    };

    NameParse.removeIgnoredChars = function (word) {
        //ignore periods
        return word.replace(".","");
    };

    // detect and format standard salutations
    // I'm only considering english honorifics for now & not words like
    NameParse.is_salutation = function (word) {
        word = this.removeIgnoredChars(word).toLowerCase();
        // returns normalized values
        switch (word) {
            case 'mr':
            case 'master':
            case 'mister':
                return "Mr.";
            case 'mrs':
                return "Mrs.";
            case 'miss':
            case 'ms':
                return "Ms.";
            case 'dr':
                return "Dr.";
            case 'rev':
                return "Rev.";
            case 'fr':
                return "Fr.";
            default:
                return false;
        }
    };

    //  detect and format common suffixes
    NameParse.is_suffix = function (word) {
        word = this.removeIgnoredChars(word).toLowerCase();
        // these are some common suffixes - what am I missing?
        var suffixArray = [
            'I','II','III','IV','V','Senior','Junior','Jr','Sr','PhD','APR','RPh','PE','MD','MA','DMD','CME',
            "BVM","CFRE","CLU","CPA","CSC","CSJ","DC","DD","DDS","DO","DVM","EdD","Esq",
            "JD","LLD","OD","OSB","PC","Ret","RGS","RN","RNC","SHCJ","SJ","SNJM","SSMO",
            "USA","USAF","USAFR","USAR","USCG","USMC","USMCR","USN","USNR"
        ];

        var suffixIndex = suffixArray.map(function(suffix){
            return suffix.toLowerCase();
        }).indexOf(word);

        if(suffixIndex >= 0) {
            return suffixArray[suffixIndex]; }
        else {
            return false; }
    };

    // detect compound last names like "Von Fange"
    NameParse.is_compound_lastName = function (word) {
        word = word.toLowerCase();
        // these are some common prefixes that identify a compound last names - what am I missing?
        var words = ['vere','von','van','de','del','della','di','da','pietro','vanden','du','st.','st','la','lo','ter'];
        return (words.indexOf(word) >= 0);
    };

    // single letter, possibly followed by a period
    NameParse.is_initial = function (word) {
        word = this.removeIgnoredChars(word);
        return (word.length === 1);
    };

    // detect mixed case words like "McDonald"
    // returns false if the string is all one case
    NameParse.is_camel_case = function (word) {
        var ucReg = /[A-Z]+/;
        var lcReg = /[a-z]+/;
        return (ucReg.exec(word) && lcReg.exec(word));
    };

    // ucfirst words split by dashes or periods
    // ucfirst all upper/lower strings, but leave camelcase words alone
    NameParse.fix_case = function (word) {
        // uppercase words split by dashes, like "Kimura-Fay"
        word = this.safe_ucfirst("-",word);
        // uppercase words split by periods, like "J.P."
        word = this.safe_ucfirst(".",word);
        return word;
    };

    // helper for this.fix_case
    // uppercase words split by the seperator (ex. dashes or periods)
    NameParse.safe_ucfirst = function (seperator, word) {
        return word.split(seperator).map(function(thisWord){
            if(this.is_camel_case(thisWord)) {
                return thisWord;
            } else {
                return thisWord.substr(0,1).toUpperCase() + thisWord.substr(1).toLowerCase();
            }
        }, this).join(seperator);
    };

    return NameParse;
})();

/**
 * baseCoat
 * A front-end framework for Registria
 *
 * v2.4.3
 *
 * Dependencies:
 *   jQuery 1.7.2
 *   Google Maps API
 */

var BaseCoat = (function BaseCoat(document, window, $) {

  // Constants
  var $doc = $(document);

/**
 * Internationalization
 *
 * This module is largely automatic. Its methods
 * are used by other modules in the baseCoat framework.
 */

var i18n = (function i18n() {

  /**
   * Returns the value of a particular URL param
   * @param {String} key The key to check
   * @return {String} The value of the param
   */

  var getParam = function getParam(key) {
    var query = window.location.search.substring(1);
    var params = query.split('&');

    return params.reduce(function(output, param) {
      var split = param.split('=');
      if (split[0] === key) return split[1];
      return output;
    }, undefined);
  };

  /**
   * Returns the user's country code
   * based on IP address.
   * @return {String} 2-char ISO country code
   */

  var getCountry = function getCountry() {
    var testCountry = getParam('test_country');
    var isStaging = window.location.href.indexOf('staging') > -1 || window.location.href.indexOf('localhost') > -1;
    if (isStaging && testCountry) return testCountry;
    if ($.IPInfo && $.IPInfo.country_code) return $.IPInfo.country_code;
    return 'US';
  };

  /**
   * Returns the user's locale string or part
   * of the string, optionally.
   * @param {String} part 'language' || 'country' (optional)
   * @return {String} User's current locale
   */

  var getLocale = function getLocale(part) {
    var locale = $.currentLocale || 'en';

    if (typeof part !== 'string') return locale;

    var regex = /([a-z]{2})\-?([a-z]{0,2})/i;
    var matches = locale.match(regex);
    if (matches && matches[0] === locale) matches.shift();

    if (part === 'language') return matches[0];
    if (part === 'country') return matches[1] || null;
    return locale;
  };

  /**
   * Common text translations used in baseCoat.
   * The translation text returned depends on
   * the current user's locale.
   * @param {String} text The option to return
   * @return {String} Translated text
   */

  var translate = function translate(text) {
    var language = getLocale('language');
    var languages = ['fr', 'es', 'en'];
    var translations = {
      close: {
        en: 'Close',
        fr: 'Fermer',
        es: 'Cerrar'
      },

      yesNo: {
        en: ['Yes', 'No'],
        fr: ['Oui', 'Non'],
        es: ['Sí', 'No']
      },

      invalidDate: {
        en: 'Invalid date',
        fr: 'Date invalide',
        es: 'Fecha invalida'
      },

      futureDate: {
        en: 'Can\'t select a future date',
        fr: 'Vous ne pouvez pas sélectionner une date ultérieure',
        es: 'No se puede seleccionar una fecha futura'
      },

      didYouMean: {
        en: 'Did you mean',
        fr: 'Vouliez-vous dire',
        es: '¿Quiso decir'
      },

      intState: {
        en: 'International State',
        fr: 'État international',
        es: 'Estado Internacional'
      },

      postalCode: {
        en: 'Postal Code',
        fr: 'Code Postal',
        es: 'Código Postal'
      },

      postalValidation: {
        en: 'Please enter a valid postal code.',
        fr: 'Saiser un code postal valide s\'il vous plaît.',
        es: 'Por favor, introduzca un código postal válido.'
      },

      fullName: {
        en: 'Please enter your full name.',
        fr: 'S\'il vous plait entrez votre nom entier.',
        es: 'Por favor ingresa tu nombre completo.'
      }
    };

    // Default to English if language is not available.
    if (languages.indexOf(language) < 0) language = 'en';

    return translations[text][language];
  };

  /**
   * Updates various things for
   * Canadian users
   */

  var canadianForm = function canadianForm() {
    var $fields = {
      state: $('#state'),
      zip: $('#zip')
    };

    var rules = {
      state: $fields.state.length ? $fields.state.rules() : {},
      zip: $fields.zip.length ? $fields.zip.rules() : {}
    };

    // Canadian users should get provinces
    if ($fields.state.attr('type') !== 'hidden') {
      $fields.state
        .removeClass('autocomplete-state')
        .addClass('autocomplete-province')
        .parents('label')
          .find('.label-text')
          .text('Province');

      // Show asterisk in labels
      if (rules.state.required) {
        $fields.state.siblings('.label-text')
          .append(' *');
      }
    }

    // Change zip code to postal code
    if ($fields.zip.attr('type') !== 'hidden') {
      $fields.zip = $fields.zip.clone();

      $fields.zip.attr('type', 'text');

      // Add CA validation
      $.validator.addMethod('canadaZip', function(value, elem) {
        var regex = /^([ABCEGHJKLMNPRSTVWXYZ]\s*\d\s*){3}$/i;
        return this.optional(elem) || regex.test(value);
      }, translate('postalValidation'));

      $('#zip').replaceWith($fields.zip);

      $fields.zip = $('#zip');

      $fields.zip.rules('add', 'canadaZip');
      $fields.zip.rules('remove', 'regex');

      $fields.zip
        .parents('label')
          .find('.label-text')
          .text(translate('postalCode'));

      if (rules.zip.required) {
        $fields.zip.siblings('.label-text')
          .append(' *');
      }
    }
  };

  /**
   * DOM API
   */

  $doc.ready(function() {
    var country = getLocale('country') || getCountry();
    var c = country.toUpperCase();
    var $state = $('#state');
    var $zip = $('#zip');

    if (c === 'CA' && ($state.length || $zip.length)) canadianForm();
  });

  /**
   * Public API
   */

  return {
    getCountry: getCountry,
    getLocale: getLocale,
    translate: translate
  };

})();

/**
 * Geolocation
 *
 * Create a geolocation trigger by attaching the class name
 * "geo-trigger" to an interactive element. Alternatively,
 * attach the class name "reverse-zip" to an input field
 * to use its value to trigger a reverse ZIP code lookup.
 */

var geolocation = (function geolocation() {

  // Exit if Google Maps API is not present.
  /* if (typeof google === 'undefined' || !google.maps) {
    console.warn('Geolocation requires the Google Maps API.');
    return false;
  }   */

  /**
   * Triggers a browser geolocation request
   * and passes the result on to a callback.
   * @param {Function} callback Handles latLng data
   */

  var getLatLong = function getLatLong(callback) {
    var settings = {

      // use real GPS when available
      enableHighAccuracy: true,

      // never timeout
      timeout: Infinity,

      // use cache up to 5m old
      maximumAge: 300000
    };

    function success(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      var latLng = new google.maps.LatLng(latitude, longitude);

      if (callback) callback(latLng);
    }

    function error(err) {
      console.warn('ERROR ' + err.code + ': ' + err.message, error);
    }

    navigator.geolocation.getCurrentPosition(success, error, settings);
  };

  /**
   * Reverse geocodes a latLng object or a postal code.
   * @param {String} request A postal code
   * @param {Object} request Maps API LatLng object
   * @param {Function} callback Handle the list of locations
   * @return {Object} Address components
   */

  var reverseGeocode = function reverseGeocode(request, callback) {
    var geocoder = new google.maps.Geocoder();
    var settings = { 'latLng': request };
    var locationType = 'street_address';
    var $trigger = $('.geo-trigger');
    var dataCountries = $trigger.attr('data-allowed-countries');
    var allowedCountries = dataCountries ? dataCountries.split(',') : [];

    // Strings are assumed postal codes
    if (typeof request === 'string') {
      settings = { 'address': request };
      locationType = 'postal_code';
    }

    // Filter the geocoder results
    geocoder.geocode(settings, function(results) {
      var filtered = results.filter(function(result) {
        return (result.types.indexOf(locationType) > -1);
      });

      var location = filtered[0];
      var components = {};

      /**
       * Filter results by country if there
       * are multiple passed.
       */

      if (filtered.length > 1) {
        // TODO: Actually do this.
        filtered = filtered.filter(function(loc) {
          console.log('glc', loc);
        });

        location = filtered[0];
      }

      /**
       * Loop through the address components
       * to find the right values.
       */

      if (!location || location.address_components.length < 1) {
        return false;
      }

      location.address_components.forEach(function(elem) {
        var types = elem.types;

        if (types.indexOf('postal_code') > -1) components.zip = elem.short_name;
        if (types.indexOf('locality') > -1) components.city = elem.long_name;
        if (types.indexOf('administrative_area_level_1') > -1) components.state = elem.long_name;
        if (types.indexOf('country') > -1) components.country = elem.long_name;

        // Fall back to sublocality for city
        if (!components.city && types.indexOf('sublocality') > -1) {
          components.city = elem.long_name;
        }
      });

      // Treat Guam and Puerto Rico as states
      if (!components.state) {
        if (components.country === 'Guam' ||
            components.country === 'Puerto Rico') {
          components.state = components.country;
          components.country = 'United States';
        }
      }

      // Normalize USA to United States
      if (components.country === 'USA') components.country = 'United States';

      // Show an error if country is not allowed.
      $trigger.parents('label').find('.country-disallowed').remove();
      if (allowedCountries.length && allowedCountries.indexOf(components.country) === -1) {
        $trigger.siblings('input')
          .after('<label class="invalid country-disallowed" generated="true" for="' +
            $trigger.attr('id') +
            '">Country ' +
            components.country +
            ' is not allowed.</label>');
        if ($trigger.parents('label').find('.country-disallowed').length > 1) {
          $trigger.parents('label').find('.country-disallowed').first().remove();
        }
        return;
      }

      if (callback) {
        callback(components);
      } else {
        populateFields(components);
      }
    });
  };

  /**
   * Populates fields with the given values.
   * @param {Object} components Field values
   */

  var populateFields = function populateFields(components) {
    var city = components.city;
    var state = components.state;
    var zip = components.zip;
    var country = components.country;

    if (city && city !== $('#city').val()) $('#city').val(city).change();
    if (state && state !== $('#state').val()) $('#state').val(state).change();
    if (zip && zip !== $('#zip').val()) $('#zip').val(zip).change();
    if (country) $('#country').val(country);
  };

  /**
   * DOM API
   */

  $doc.ready(function() {
    var $trigger = $('.geo-trigger');
    var $reverseZip = $('.reverse-zip');

    $trigger.off('click').on('click', function() {
      getLatLong(reverseGeocode);
    });

    $reverseZip.parents('label').on('blur', '.reverse-zip', function() {
      var zip = $(this).val();
      reverseGeocode(zip);
    });
  });

  /**
   * Public API
   */

  return {
    latlng: getLatLong,
    lookup: reverseGeocode
  };

})();

/**
 * Autocomplete
 *
 * baseCoat includes a few standard autocompletes.
 * This module controls them and how they work.
 * View the docs for more information on these.
 */

var autocomplete = (function autocomplete() {

  /**
   * Throttle execution of a given function
   * @param {Function} fn The function to execute
   * @param {Number} wait Time in ms to wait before executing
   * @param {Boolean} immed When true, execute the function immediately
   */

  var debounce = function debounce(fn, wait, immed) {
    var timeout;
    return function() {
      var ctx = this;
      var args = arguments;
      var later = function() {
        timeout = null;
        if (!immed) fn.apply(ctx, args);
      };

      var callNow = immed && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) fn.apply(ctx, args);
    };
  };

  /**
   * Get a list of products from the platform
   * @param {Function} callback Function to call on success
   * @param {String} category A category name to filter by
   * @param {String} family A family name to filter by
   * @param {Number} limit Max # of items to request
   * @param {Boolean} beginsWith When true, match search with begins_with
   * @param {String} search A substring to search on
   * @param {Array} fields A list of product fields to request
   */

  var getProducts = function getProducts(obj) {
    var callback = obj.callback || function(x){return x};
    var category = obj.category;
    var family = obj.family;
    var brandname = obj.brandname;
    var limit = obj.limit || 25;
    var beginsWith = obj.beginsWith || false;
    var term = beginsWith ? 'begins_with' : 'contains';
    var search = obj.search || '';
    var fields = obj.fields || false;

    var url = '/services/products';
    var params = { limit: limit };
    var query = '?';

    // Build params object
    if (category) params.product_category_name = category;
    if (family) params.product_family_name = family;
    if (search) params[term] = search;
    if (fields) params.fields = fields;
    if (brandname) params.brand_name = brandname;

    // get active and allow_registration fields
    params.fields = params.fields || [];
    params.fields.push('active');
    params.fields.push('allow_registration');

    // create query string
    query += $.param(params);

    // Make the request
    $.ajax({
      type: 'GET',
      url: url + query,
      success: callback,
      error: function(err) {
        console.log(err.responseText, err);
      }
    });
  };

  /**
   * Get a list of organizations from the platform
   * @param {Function} callback Handle the list
   */

  var getOrganizations = function getOrganizations(callback) {
    var fn = callback || function(x) { return x; };

    // Make the request
    $.ajax({
      type: 'GET',
      url: '/services/organizations_autocomplete.json',
      success: fn,
      error: function(err) {
        console.log(err.responseText, err);
      }
    });
  };

  /**
   * Settings for standard autocompletes
   * @param {String} field Which field to get settings for
   * @return {Object} Settings for the requested field
   */

  var getSettings = function getSettings(field) {
    switch (field) {
      case 'state':
        return {
          limit: 5,
          list: ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Virgin Islands', 'Armed Forces Americas', 'Armed Forces Europe', 'Armed Forces Pacific']
        };
      case 'province':
        return {
          limit: 5,
          list: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon']
        };
      case 'product':
        return {
          hiddenField: $('#product')[0],
          limit: Infinity
        };
      default:
        return false;
    }
  };

  /**
   * DOM API
   */

  $doc.ready(function() {
    // The platform does this, so do it for local testing
    if (window.location.hostname === 'localhost') $('form').validate();

    // Target fields
    var $state = $('.autocomplete-state');
    var $province = $('.autocomplete-province');
    var $product = $('.autocomplete-product');
    var $orgs = $('.autocomplete-organizations');

    var settings = {};
    var frauto;

    // Simple state and province setup
    if ($state.length) frautoComplete($state[0], getSettings('state'));
    if ($province.length) frautoComplete($province[0], getSettings('province'));

    // Setup product autocomplete
    if ($product.length) {
      // create frauto
      frauto = frautoComplete($product[0], getSettings('product'));

      // Get settings for list call
      if ($product.attr('data-productcategory')) {
        settings.category = $product.attr('data-productcategory');
      }

      if ($product.attr('data-productfamily')) {
        settings.family = $product.attr('data-productfamily');
      }

      if ($product.attr('data-brandname')) {
        settings.brandname = $product.attr('data-brandname');
      }

      if ($product.attr('data-beginswith') === 'true') {
        settings.beginsWith = true;
      }

      if ($product.attr('data-fields')) {
        settings.fields = JSON.parse($product.attr('data-fields'));
      }

      // set callback
      settings.callback = function(list) {
        var filtered = list.filter(function(p) {
          return p.active && p.allow_registration;
        });

        frauto.updateList(filtered);
      };

      // update list on keyup
      $product.on('input', debounce(function() {
        settings.search = $(this).val();
        getProducts(settings);
      }, 50));
    }

    // Setup orgs autocomplete
    if ($orgs.length) {
      getOrganizations(function(list) {
        frautoComplete($orgs[0], { limit: $orgs.attr('data-limit') || 5, list: list });
      });
    }
  });

  /**
   * Support old FrautoComplete jQuery plugin
   */

  $.fn.frautoComplete = function(list, settings) {
    if (typeof settings === 'undefined') settings = {}
    return frautoComplete(this[0], {
      list: list || [],
      limit: settings.listLimit || settings.limit,
      validate: settings.validate
    });
  };

  /**
   * Public API
   */

  return {
    getProducts: getProducts,
    getOrganizations: getOrganizations,
    getStates: getSettings('state'),
    getProvinces: getSettings('province')
  };

})();

/**
 * Input Masks
 *
 * baseCoat includes a few standard input
 * masks to restrict and guide input on
 * certain fields. Use the following classes
 * on your fields:
 *
 * .mask-numerical
 *   - Only allows users to type numbers and one period
 *
 * .mask-date
 *   - Custom localized date format mask
 *
 * .mask-mmyy
 *   - Month and year mask (MM/YY or MM/YYYY)
 *
 * .mask-phone
 *   - Custom localized phone number format mask
 */

var inputMasks = (function inputMasks() {

  // Allow literal 9s in input masks
  delete $.mask.definitions['9'];
  $.mask.definitions['#'] = '[0-9]';

  // Set up mask defs for date slots
  $.mask.definitions.m = '[0-1]';
  $.mask.definitions.d = '[0-3]';
  $.mask.definitions.y = '[1-2]';
  $.mask.definitions.Y = '[09]';

  /**
   * Numerical input mask (.mask-numerical)
   * @param {Object} event An event object
   */

  var maskNumerical = function maskNumerical(event) {
    var keyCode = event.which;
    var value = $(event.target).val();

    if (
        // allow .
        (keyCode !== 46 &&

         // allow backspace
         keyCode !== 8 &&

         // allow numbers
         (keyCode < 48 || keyCode > 57)
        ) ||

        // Only allow one .
        (keyCode === 46 && value.indexOf('.') > -1)
      ) {

      // block the key press
      event.preventDefault();
    }
  };

  /**
   * Localized phone number mask (.mask-phone)
   * @param {Function} callback Handle the data
   * @param {String} value The field's initial value
   */

  var maskPhone = function maskPhone(callback, value) {
    var prefillValue = value.replace('+', '');

    var masks = {
      // US, CA, US Minor Islands
      1: '+1##########',

      // Mexico
      52: '+52#########?#',

      // UK
      44: '+44#######?###',

      // Australia
      61: '+61#########?#',

      // Japan
      81: '+81#########?#',

      // India
      91: '+91##########'
    };

    var countryCodes = {
      US: 1,
      UM: 1,
      CA: 1,
      GB: 44,
      MX: 52,
      AU: 61,
      JP: 81,
      IN: 91
    };

    var country = countryCodes[i18n.getCountry()];
    var mask;

    // Check for country code in prefilled value
    if (value && value.length) {
      country = Object.keys(masks).filter(function(code) {
        return prefillValue.indexOf(code) === 0;
      });

      country = countryCodes[country];
    }

    mask = masks[country];

    if (callback) callback(mask, value);
    return { mask: mask, prefill: value };
  };

  /**
   * Simple month and year input mask (.mask-mmyy)
   * @param {Boolean} useFullYear When true, mask wants 4-digit year
   */

  var maskMMYY = function maskMMYY(useFullYear) {
    if (useFullYear) {
      return {
        placeholder: 'mm/yyyy',
        mask: 'm#/yY##'
      };
    }

    return {
      placeholder: 'mm/yy',
      mask: 'm#/##'
    };
  };

  /**
   * Localized date format mask (.mask-date)
   */

  var maskDate = (function maskDate() {

    /**
     * Get the preferred date format by country
     * @return {Object} Date format object
     */

    var getFormat = function getFormat() {
      var country = i18n.getCountry();
      var dateFormats = {
        mdy: ['CA', 'BZ', 'FM', 'PH', 'US'],
        ymd: ['IR', 'SI', 'ZA', 'SE', 'AF',
              'CN', 'HU', 'JP', 'KR', 'KP',
              'LT', 'MN', 'TW']
      };

      var isMDY = (dateFormats.mdy.indexOf(country) > -1);
      var isYMD = (dateFormats.ymd.indexOf(country) > -1);
      var format = {
        completed: function($field, fmt) {
          $field.attr('data-format', fmt);
        }
      };

      if (isMDY) {
        format.placeholder = 'mm/dd/yyyy';
        format.mask = 'm#/d#/yY##';
        format.format = 'mdy';
      }

      if (isYMD) {
        format.placeholder = 'yyyy/mm/dd';
        format.mask = 'yY##/m#/d#';
        format.format = 'ymd';
      }

      if (!format.format) {
         if($.currentLocale == 'fr-ca') {
           format.placeholder = 'jj/mm/aaaa';
       } else {
        format.placeholder = 'dd/mm/yyyy';
        }
        format.mask = 'd#/m#/yY##';
        format.format = 'dmy';
      }

      return format;
    };

    /**
     * Converts DMY-format date string to YMD-format
     * @param {String} dateStr The string to be converted
     */

    var normalizeDmy = function normalizeDmy(dateStr) {
      var dmyDate = dateStr.split('/');
      var dmyDay = dmyDate[0];
      var dmyMon = dmyDate[1];
      var dmyYear = dmyDate[2];

      return dmyYear + '/' + dmyMon + '/' + dmyDay;
    };

    /**
     * Determine whether a field's date input is valid
     * @param {jQuery Element} $field The field to validate
     */

    var valiDate = function valiDate($field) {
      var input = $field.val();
      var $label = $field.parent('label');
      var $hidden = $label.find('[type="hidden"]');

      // If field is blank, remove hidden field
      if (input === '') {
        if ($hidden.length) {
          $field.addClass('registria_field');
          $hidden.remove();
        }

        return true;
      }

      var name = $field.attr('name');
      var format = $field.attr('data-format');
      var dateStr = format === 'dmy' ? normalizeDmy(input) : input;
      var today = new Date();
      var dateObj = new Date(dateStr);
      var year = dateObj.getFullYear();
      var month = dateObj.getMonth() + 1;
      var day = dateObj.getDate();
      var dateIsValid = true;
      var allowFutureDate = false;
      var datepicker;

      // Set allow future dates on element
      if ($field.attr('data-allowfuturedates')) {
        allowFutureDate = true;
      }

      // Check for a future date
      if (!allowFutureDate && dateObj > today) {
        dateIsValid = false;
      }

      // Check for invalid dates
      if (dateObj === 'Invalid Date') {
        dateIsValid = false;
      }

      if (dateIsValid) {
        // Normalize date components for string
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;

        // get datepicker formatted date
        datepicker = year + '-' + month + '-' + day;

        // add/update hidden field for datepicker format
        if ($hidden.length < 1) {
          $field.removeClass('registria_field')
            .after('<input class="registria_field valid" type="hidden" name="' + name + '" value="' + datepicker + '">');
        } else {
          $hidden.val(datepicker);
        }
      } else {
        // Remove the hidden field if date is invalid
        $field.addClass('registria_field');
        $hidden.remove();
      }

      return dateIsValid;
    };

    return {
      format: getFormat,
      normalize: normalizeDmy,
      validate: valiDate
    };
  })();

  /**
   * DOM API
   */

  $doc.ready(function() {
    var $maskNum = $('.mask-numerical');
    var $maskPhone = $('.mask-phone');
    var $maskMMYY = $('.mask-mmyy');
    var $maskDate = $('.mask-date');
    var dateFormat;
    var mmyy;

    // numerical
    if ($maskNum.length) {
      $maskNum.on('keypress', maskNumerical);
    }

    // phone
    if ($maskPhone.length) {
      maskPhone(function(mask, prefill) {
        if (mask) {
          $maskPhone.mask(mask)
            .val(prefill)
            .blur();
        } else {
          $maskPhone.mask('+1##########');
        }
      }, $maskPhone.val());
    }

    // mm/yyyy
    if ($maskMMYY) {
      mmyy = $maskMMYY.attr('data-fullyear') ? maskMMYY(true) : maskMMYY();
      $maskMMYY.mask(mmyy.mask, {
        placeholder: mmyy.placeholder
      });
    }

    // date
    if ($maskDate.length) {
      dateFormat = maskDate.format();
      $maskDate.mask(dateFormat.mask, {
        placeholder: dateFormat.placeholder,
        completed: function() {
          $maskDate.attr('data-format', dateFormat.format);
        }
      });

      // validate on blur
      $maskDate.on('blur', function() {
        maskDate.validate($(this));
      });

      // Date validations
      $.validator.addMethod('futureDate', function(value, elem) {
        var $elem = $(elem);
        var today = new Date();
        var date;

        // Normalize DMY input
        if ($elem.attr('data-format') === 'dmy') {
          value = maskDate.normalize(value);
        }

        // Allow future dates?
        if ($elem.attr('data-allowfuturedates')) return true;

        date = new Date(value);

        // Skip invalid dates
        if (date === 'Invalid Date') return true;

        return this.optional(elem) || today > date;
      }, i18n.translate('futureDate'));

      $.validator.addMethod('realDate', function(value, elem) {
        var $elem = $(elem);
        var date;

        // Ensure that input is not mask text
        switch (value) {
          case 'mm/dd/yyyy':
          case 'dd/mm/yyyy':
          case 'yyyy/mm/dd':
          case '':
            return true;
        }

        // Normalize DMY input
        if ($elem.attr('data-format') === 'dmy') {
          value = maskDate.normalize(value);
        }

        date = new Date(value);

        return this.optional(elem) || date !== 'Invalid Date';
      }, i18n.translate('invalidDate'));

      $.validator.addClassRules('mask-date', {
        realDate: true,
        futureDate: true
      });
    }
  });

})();

/**
 * Modals
 *
 * Create a modal by attaching the class name "modal-trigger"
 * to an interactive element. Paramaters are applied as
 * data attributes on the element.
 *
 * @param {String} data-text Desired text/HTML for the modal
 * @param {String} data-image An image URL (optional)
 * @param {String} data-buttontype Modal button options ['close', 'boolean'] (optional)
 */

var modal = (function modal() {

  /**
   * Array of Modal instances
   * @type {Array}
   */

  var modals = [];

  /**
   * Data model for modals
   * @param {Object} obj Modal attributes
   */

  var Modal = function Modal(obj) {
    return {
      image: obj.image || false,
      text: obj.text || '...',
      buttonType: obj.buttonType || 'close'
    };
  };

  /**
   * Populates the modals array
   * @param {jQuery Element} $elem A modal trigger element
   * @return {Array} An array of Modal instances
   */

  var getModals = function getModals($elem) {
    $elem.each(function(i) {
      var t = $(this);

      // Add an ID to the node
      t.attr('data-id', i);

      // Create Modal instance
      modals.push(Modal({
        image: t.attr('data-image'),
        text: t.attr('data-text'),
        buttonType: t.attr('buttonType')
      }));
    });

    return modals;
  };

  /**
   * Produces a modal component
   * @param  {Object} modal A Modal instance
   * @return {jQuery Element}
   */

  var createModal = function createModal(modal) {
    var image = modal.image;
    var text = modal.text;

    var markup =
      '<div class="modal-overlay modal-close">' +
        '<div class="modal-content">' +
        '</div>' +
      '</div>';

    var $elem = $(markup);
    var $content = $elem.find('.modal-content');

    if (image) {
      $content.prepend(
        '<img src="' + image + '" class="modal-image">');
    }

    if (text) {
      $content.append(
        '<p class="modal-text">' + text + '</p>');
    }

    $content.append(
      '<button type="button" class="button-primary full-width modal-close">' +
        i18n.translate('close') +
      '</button>');

    $content.find('.modal-close')
      .on('click', closeModal);

    return $elem;
  };

  /**
   * Attach modal to DOM
   * @param  {Object} event Event object
   */

  var openModal = function openModal(event) {
    var $elem = $(event.target);
    var id = parseInt($elem.attr('data-id'), 10);
    var modalInst = createModal(modals[id]);

    event.preventDefault();

    // Only append to body once
    if (!$('.modal-overlay').length) $('body').append(modalInst);

    // Attach event listeners
    $(document).on('keyup', closeModal);
  };

  /**
   * Remove modal from DOM
   * @param  {Object} event Event object
   */

  var closeModal = function closeModal(event) {
    var $elem = $(event.target);
    var $overlay = $('.modal-overlay');

    // Catch keyboard events
    if (event.type === 'keyup') {
      if (event.which === 27) {
        $elem = $overlay;
      } else {
        return false;
      }
    }

    // Catch clicks on close button & overlay
    if (!$elem.hasClass('modal-overlay') && !$elem.is('button')) {
      return false;
    }

    // Remove the overlay
    $overlay.remove();

    // Remove modal event listeners
    $(document).off('keyup', closeModal);
  };

  /**
   * DOM API
   */

  $doc.ready(function() {
    var $trigger = $('.modal-trigger');

    if ($trigger.length) {
      getModals($trigger);
      $trigger.on('click', openModal);
    }
  });

  /**
   * Public API
   */

  return {
    // TODO: DRY this out in openModal()
    trigger: function trigger(modal) {
      var modalInst = createModal(modal);

      // Only append to body once
      if (!$('.modal-overlay').length) $('body').append(modalInst);

      // Attach event listeners
      $('body').on('click', '.modal-close', closeModal);
      $(document).on('keyup', closeModal);
    }
  };

})();

/**
 * Properly sets the value on the a given checkbox element
 * @param {jQuery Element} $field The field to toggle
 */

var toggleCheckbox = function toggleCheckbox(event) {
  var $field = $(event.target);
  var val = $field.val();
  var noUpdate = val !== '' && val !== '0' && val !== '1' && val !== 'on';
  var name = $field.attr('name');
  var $hidden = $('<input type="hidden" name="'+ name +'" class="real_checkbox registria_field" />');
  var optout = $field.is('[data-optout]');
  var newVal;

  /**
   * If the field has a pre-set value,
   * don't do anything to the value.
   */

  if (noUpdate) return;

  /**
   * Initialize hidden field
   */

  if ($field.siblings('[type="hidden"].real_checkbox').length < 1) {
    $field.parents('label').append($hidden);
    $field.removeClass('registria_field');
  }

  $hidden = $field.siblings('[type="hidden"].real_checkbox');

  /**
   * Update the value
   */

  if ($field.is(':checked')) {
    newVal = optout ? '0' : '1';
  } else {
    newVal = optout ? '1' : '0';
  }

  $hidden.val(newVal);
};

$doc.ready(function() {
  $('input[type="checkbox"]').each(function(){
    toggleCheckbox({ target: this });
  })
  $('input[type="checkbox"]').on('change', toggleCheckbox);
});

(function() {

  var selector = '.dropdown-toggle';

  function init($nodes) {
    var newNodes = [];

    $nodes.each(function() {
      var $this = $(this).removeClass(selector.replace('.', ''));
      var $options = $this.find('option');

      var $current = $options.filter('[selected]');
      var $selected = $current.length ? $current : $options.first();

      var target = $this.data('target');
      var classes = Array.prototype.slice.call($this[0].classList);
      var id = $this.attr('id');

      var $nav = $('<nav class="dropdown-toggle" />')
        .data('target', target)
        .append('<span class="current" />')
        .append('<ul class="options" style="display:none" />');


      if (id) $nav.attr('id', id);
      $nav.addClass(classes.join(' '));
      $nav.find('.current').text($current.text());

      $options.each(function() {
        var $this = $(this);
        var text = $this.text();
        var value = $this.val();

        $nav.find('.options')
          .append('<li data-value="' + value + '">' + text + '</li>');

        if ($this[0] === $selected[0]) {
          if (target && target !== 'url') {
            $(target).val(value);
          }

          $nav.find('.options > li:last-child').css('display', 'none');
        }
      });

      $this.replaceWith($nav);
    });
  }

  function toggleOpen($dropdown) {
    $dropdown.find('.current').toggleClass('open');
    $dropdown.find('.options').slideToggle(250);
  }

  function onSelection(event) {
    var $event = $(event.target);
    var $dropdown = $event.parents(selector);
    var target = $dropdown.data('target');
    var value = $event.data('value');

    if (!target || target === 'url') {
      window.location = value;
    } else {
      $(target).val(value).change();
    }

    $dropdown.find('.current').text($event.text());
    toggleOpen($dropdown);
    $dropdown.find('.options > li').show();
    $event.hide();
  }

  $doc.ready(function() {
    init($(selector));
    var $elem = $(selector);

    $elem.on('click', '.current', function() {
      toggleOpen($(this).parents(selector));
    });

    $elem.on('click', '.options > li', onSelection);
  });

})();

/**
 * Show filename in custom file input
 */

var customFileInput = function customFileInput() {
  var $this = $(this);
  var $label = $this.parent('label').find('.file-label');
  var filepath = $this.val();
  var filename = filepath.match(/[^\/\\]*$/)[0];

  // Save the original label text in data-text
  if (!$label.is('[data-text]')) {
    $label.attr('data-text', $label.text());
  }

  // Recall the original text if no file is selected
  if (!filename) filename = $label.attr('data-text');

  // Update the label text
  $label.text(filename);
};

$doc.ready(function() {
  $('label.file-input').on('change', 'input[type="file"]', customFileInput);
});

/**
 * Hide Toggle
 *
 * Allows implementers to toggle the
 * display of DOM elements using a set
 * of data attributes.
 *
 * [data-toggles]
 *   String, the selector to toggle
 * [data-toggle-show]
 *   Boolean, when true show the target
 *   element initially. When applied to
 *   checkboxes or radio buttons, :checked
 *   value determines target initial display.
 */

var hideToggle = (function hideToggle() {
  /**
   * Class name to apply to an
   * element to hide it.
   */

  var hiddenClass = 'hidden-text';

  /**
   * Toggle
   *
   * Creates a Toggle object given
   * some settings.
   *
   * @param {Object} settings Set toggler, target, and type
   */

  function Toggle(settings) {
    return {
      toggler: $(settings.toggler),
      target: $(settings.target)
    };
  }

  /**
   * clearFields
   *
   * Clears the value of any fields
   * inside a given DOM element.
   *
   * @param {jQuery Object} $target Clear this element's child fields
   */

  function clearFields($target) {
    $target.find('[type="radio"], [type="checkbox"]')
      .removeAttr('checked');

    $target.find('select > option')
      .removeAttr('selected');

    $target.find(':input').not(':button, :submit, :reset, [type="radio"], [type="checkbox"]')
      .val('');
  }

  /**
   * trigger
   *
   * Triggers show/hide display for
   * data-toggle-show given a Toggle object.
   *
   * @param {Object} toggle The Toggle to trigger
   */

  function trigger(toggle) {
    var targetID = toggle.toggler.data('toggles');
    var $target = $(toggle.target);

    var $togglers = $('[data-toggles="' + targetID + '"]');
    var $show = $togglers.filter('[data-toggle-show="true"]');
    var $hide = $togglers.filter('[data-toggle-show="false"]');
    var notChecked = (!$show.is(':checked') && !$hide.is(':checked'));
    var hideTarget = notChecked || $hide.is(':checked');

    if ($togglers.length === 1) {
      $target.toggleClass(hiddenClass);
    } else {
      $target.toggleClass(hiddenClass, hideTarget);
    }

    if ($target.hasClass(hiddenClass)) clearFields($target);
  }

  /**
   * toggleEvent
   *
   * Handles click and change events
   * on [data-toggles]
   *
   * @param {Object} event The DOM event
   */

  function toggleEvent(event) {
    var $event = $(event.target);

    var toggle = Toggle({
      toggler: $event,
      target: $event.data('toggles')
    });

    if (toggle && toggle.target.length) trigger(toggle);
  }

  return toggleEvent;
})();

$doc.ready(function() {
  $('[data-toggles]')
    .on('click change', hideToggle)
    .each(function() {
      hideToggle({ target: this });
    });
});

/**
 * Suggest a correction when users
 * typo common email domains.
 */

var mailcheck = function mailcheck($field) {
  var $label = $field.parent('label');

  // Generate an HTML string given the email suggestion
  var template = function template(suggestion) {
    return '<p class="small-text update-email">' +
      i18n.translate('didYouMean') +
      ' <a href="#" class="email-link">' +
        suggestion.full +
      '</a>?' +
    '</p>';
  };

  // Do the thing.
  $field.mailcheck({
    suggested: function(elem, sugg) {
      if ($label.find('.update-email').length === 0) {
        $field.after(template(sugg));
      }

      $label.on('click', '.update-email', function(event) {
        if (event) event.preventDefault();
        if (sugg && sugg.full) $field.val(sugg.full);
        $label.find('.update-email').remove();
      });
    },

    empty: function() {
      $label.find('.update-email').remove();
    }
  });
};

$doc.ready(function() {
  $('input[type="email"]').on('blur', function() {
    mailcheck($(this));
  });
});

/**
 * Parse full name field into its
 * parts and populate fields.
 */

var nameParse = function nameParse($field) {
  /**
   * Create or update a given field
   * depending on whether it already exists.
   * @param {jQuery Element} $f The field to check
   * @param {String} value The value to pass to the field
   */

  var createOrUpdate = function createOrUpdate($f, value) {
    var name = $f.attr('name');
    var $domField = $('[name="' + name + '"]');

    // skip if name is blank
    if (!name) return false;

    // update the value of fake field
    if (value) $f.val(value);

    // Update if field exists
    if ($domField.length) {
      $domField.val(value);
    } else {
      // Otherwise, append
      if (value) $field.after($f);
    }

    // Remove the field if no value for it
    if (!value) $domField.remove();
  };

  /**
   * Create and populate hidden fields
   * @param {Object} parsed NameParse object
   */

  var populateFields = function populateFields(parsed, target) {
    var obj = target || 'user';
    var fields = {
      user: 'user',
      shipping: 'order[shipping_address_attributes]',
      billing: 'order[biling_address_attributes]',
      'case': 'case'
    };

    var $f = $('<input type="hidden" class="registria_field">');
    var $prefix = $f.clone().attr('name', fields[obj] + '[title]');
    var $first = $f.clone().attr('name', fields[obj] + '[first_name]');
    var $middle = $f.clone().attr('name', fields[obj] + '[middle_name]');
    var $last = $f.clone().attr('name', fields[obj] + '[last_name]');

    if (obj === 'user') createOrUpdate($prefix, parsed.salutation);
    if (obj === 'user') createOrUpdate($middle, parsed.initials);
    createOrUpdate($first, parsed.firstName);
    createOrUpdate($last, parsed.lastName);
  };

  var value = $field.val();
  var target = $field.data('target');

  // If value is 1 char, NameParse will ignore it
  if (value.length === 1) {
    return populateFields({ firstName: value.toUpperCase() }, target);
  }

  populateFields(NameParse.parse(value), target);
};

$doc.ready(function() {
  var $fullName = $('.full-name');

  // split on blur
  $fullName.on('blur change', function() {
    var $this = $(this);
    var $label = $this.parents('label');

    nameParse($this);
  });

  // validate if required
  $.validator.addMethod('fullName', function(value, elem) {
    if (value.length < 1) return true;
    if (value.length === 1) return false;

    var parsed = NameParse.parse(value);
    var hasLastName = (parsed.lastName.length > 0);

    return this.optional(elem) || hasLastName;
  }, i18n.translate('fullName'));

  $.validator.addClassRules('full-name', {
    fullName: true
  });
});

/**
 * Prefill fields by passing their ID as
 * a query param key with the value being
 * what you want to prefill the field with.
 */

$doc.ready(function() {
  (function fieldPrefills() {
    /**
     * Returns an object of URL params
     * @return {Object} URL params
     */

    var getParams = function getParams() {
      var query = window.location.search.substring(1);
      var params = query.split('&');

      return params.map(function(param) {
        var split = param.split('=');
        return { key: split[0], value: decodeURIComponent(split[1]) };
      });
    };

    /**
     * Populate a field given a corresponding
     * param key
     * @param {String} param The param key
     */

    var popField = function popField(param) {
      if (param) $('#' + param.key).val(param.value);
    };

    getParams().forEach(function(param) {
      popField(param);
    });
  })();
});

/**
 * Select
 *
 * Creates custom components for select
 * elements. Can be disabled for a given
 * field by adding the class name default.
 */

var select = (function select() {
  /**
   * setupMulti
   *
   * Converts a given select[multiple]
   * field into the custom component.
   *
   * @param {jQuery Element} $field The field to transform
   */

  function setupMulti($field) {
    var $container = $('<ul class="multi-select" />');
    var $options = $field.find('option');

    $options.each(function() {
      var $opt = $(this);
      var value = $opt.val();
      var text = $opt.text();
      var selected = $opt.is(':selected');
      var $node = $('<li class="multi-option" tabindex="0" />').clone();

      $node.text(text).attr('data-value', value);
      if (selected) $node.addClass('selected');
      $container.append($node);
    });

    $field.after($container);
  }

  /**
   * selectMulti
   *
   * Handles events on multiselect options.
   *
   * @param {Object} event The event payload
   */

  function selectMulti(event) {
    var $event = $(event.target);
    var $hidden = $event.parents('label').find('select');

    var values = $hidden.val() || [];
    var value = $event.data('value');
    var index = values.indexOf(value);
    var max = $hidden.data('max');
    var selected = $event.parents('label').find('.multi-option.selected').length;

    var type = event.type;
    var keycode = event.which;

    // only listen for spacebar to toggle
    if (type === 'keypress' && keycode !== 32) return;

    // don't allow more selections than max
    if (max && selected >= max && !$event.hasClass('selected')) return;

    $event.toggleClass('selected');

    // if item is in values, remove it
    if (index > -1) {
      values.splice(index, 1);
    } else {
      // otherwise, add it
      values.push(value);
    }

    // update the real field
    $hidden.val(values);
  }

  return {
    multi: {
      init: setupMulti,
      event: selectMulti
    }
  };
})();

$doc.ready(function() {
  $('select[multiple]:not(.default)').each(function() {
    select.multi.init($(this));
  });

  $('label').on('click keypress', '.multi-option', select.multi.event);
});

/**
 * Public Methods
 */

return {
  i18n: i18n,
  modal: modal,
  geolocation: geolocation,
  autocomplete: autocomplete
};

})(document, window, jQuery);
