/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */

(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
/*!
 * jQuery JavaScript Library v3.3.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2018-01-20T17:24Z
 */

( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};




	var preservedScriptAttributes = {
		type: true,
		src: true,
		noModule: true
	};

	function DOMEval( code, doc, node ) {
		doc = doc || document;

		var i,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {
				if ( node[ i ] ) {
					script[ i ] = node[ i ];
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.3.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
        if ( nodeName( elem, "iframe" ) ) {
            return elem.contentDocument;
        }

        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
        // Treat the template element as a regular one in browsers that
        // don't support it.
        if ( nodeName( elem, "template" ) ) {
            elem = elem.content || elem;
        }

        return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc, node );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		div.style.position = "absolute";
		scrollboxSizeVal = div.offsetWidth === 36 || "absolute";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a property mapped along what jQuery.cssProps suggests or to
// a vendor prefixed property.
function finalPropName( name ) {
	var ret = jQuery.cssProps[ name ];
	if ( !ret ) {
		ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
	}
	return ret;
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5
		) );
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),
		val = curCSS( elem, dimension, styles ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox;

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}

	// Check for style in case a browser which returns unreliable values
	// for getComputedStyle silently falls back to the reliable elem.style
	valueIsBorderBox = valueIsBorderBox &&
		( support.boxSizingReliable() || val === elem.style[ dimension ] );

	// Fall back to offsetWidth/offsetHeight when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	// Support: Android <=4.1 - 4.3 only
	// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
	if ( val === "auto" ||
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) {

		val = elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ];

		// offsetWidth/offsetHeight provide border-box values
		valueIsBorderBox = true;
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),
				isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra && boxModelAdjustment(
					elem,
					dimension,
					extra,
					isBorderBox,
					styles
				);

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && support.scrollboxSize() === styles.position ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = Date.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );
(function() {


}).call(this);
(function() {


}).call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
/*!
 * Japan Map Selector (jQuery Plugin) v0.0.1
 *
 * Copyright (c) 2014 Takemaru Hirai
 * http://takemaru-hirai.github.io/japan-map-selector/
 *
 * Released under the MIT license
 *
 * Includes code of tikamoton
 * http://jsdo.it/tikamoton/vz68
 *
 * Date: 2014-05-15
 */


;(function($){
    "use strict";

    $.fn.japanMap = function(options){
        var target = $(this);

        for (var option in options)
            if (options.hasOwnProperty(option) && options[option] == null) options[option] = undefined;

        options = $.extend({
            type                : "canvas",       // Only type of "canvas" exist now. Perhaps "svg" in future.
            selection           : "prefecture",   // "prefecture" or "area"
            width               : null,           // Canvas will be scaled to larger one of "width" and "height".
            height              : null,
            color               : "#a0a0a0",      // Default color, which used if no color is set in "areas" object.
            hoverColor          : null,           // If null, "color" will be 20% brightened when hovered.
            backgroundColor     : "transparent",  // Background color of the element, like "canvas".
            borderLineColor     : "#ffffff",      // Border Line of Prefectures.
            borderLineWidth     : 0.25,
            lineColor           : "#a0a0a0",      // Border Line of the element and the partition line when "movesIsland" is true.
            lineWidth           : 1,
            drawsBoxLine        : true,
            showsPrefectureName : false,
            prefectureNameType  : "full",
            showsAreaName       : false,
            areaNameType        : "full",
            areas               : definition_of_allJapan,
            prefectures         : definition_of_prefectures,
            movesIslands        : false,          //  Moves Nansei Islands (Okinawa and part of Kagishima) to the left-top space.
            font                : "Arial",
            fontSize            : null,
            fontColor           : null,
            fontShadowColor     : null,
            onSelect            : function(){},
            onHover             : function(){}
        }, options);

        var map;
        map = new MapCanvas(options);
        target.append(map.element);
        map.render();   // IE and Safari doesn't render properly when rendered before appending to the parent.
        map.addEvent(); // iPad 1st + iOS5 doesn't work if this sentence is put before "target.append".

        return target;
    };

    // ---------------------------------------------------------------------------------------------------------------
    // Just for polyfill.
    // ---------------------------------------------------------------------------------------------------------------
    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf= function(find, i) {
            if (i===undefined) i= 0;
            if (i<0) i+= this.length;
            if (i<0) i= 0;
            for (var n= this.length; i<n; i++)
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach= function(action, that) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    action.call(that, this[i], i, this);
        };
    }
    if (!('map' in Array.prototype)) {
        Array.prototype.map= function(mapper, that) {
            var other= new Array(this.length);
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    other[i]= mapper.call(that, this[i], i, this);
            return other;
        };
    }
    if (!('filter' in Array.prototype)) {
        Array.prototype.filter= function(filter, that) {
            var other= [], v;
            for (var i=0, n= this.length; i<n; i++)
                if (i in this && filter.call(that, v= this[i], i, this))
                    other.push(v);
            return other;
        };
    }
    // ---------------------------------------------------------------------------------------------------------------
    // I guess "Cross-browser" may be a word of fantasy...
    // https://w3g.jp/blog/studies/touches_events
    // http://stackoverflow.com/questions/8751479/javascript-detect-metro-ui-version-of-ie
    // ---------------------------------------------------------------------------------------------------------------
    var _ua = (function(){
        return {
            Touch : typeof document.ontouchstart !== "undefined",
            Pointer : window.navigator.pointerEnabled,
            MSPointer : window.navigator.msPointerEnabled
        }
    })();

    var isWinDesktop = (function(){
        var supported = null;
        try {
            supported = !!new ActiveXObject("htmlfile");
        } catch (e) {
            supported = false;
        }
        return supported;
    })();

    var _start = _ua.Pointer ? 'pointerdown'  : _ua.MSPointer ? 'MSPointerDown'  : _ua.Touch ? 'touchstart' : 'mousedown' ;
    var _move  = _ua.Pointer ? 'pointermove'  : _ua.MSPointer ? 'MSPointerMove'  : _ua.Touch ? 'touchmove'  : 'mousemove' ;
    var _end   = _ua.Pointer ? 'pointerup'    : _ua.MSPointer ? 'MSPointerUp'    : _ua.Touch ? 'touchend'   : 'mouseup'   ;
    var _enter = _ua.Pointer ? 'pointerenter' : _ua.MSPointer ? 'MSPointerEnter' : _ua.Touch ? 'touchenter' : 'mouseenter';
    var _leave = _ua.Pointer ? 'pointerleave' : _ua.MSPointer ? 'MSPointerLeave' : _ua.Touch ? 'touchleave' : 'mouseleave';

    // ---------------------------------------------------------------------------------------------------------------
    /* Base Class */
    // ---------------------------------------------------------------------------------------------------------------
    var Map = function(options){
        this.options = options;
        this.base = {width:651, height:571};
        this.NanseiIslands = {left:0, top:-400, width:100, height:160};
        this.okinawaCliclableZone = {x:0, y:515, w:180, h:56};
        this.fitSize();
        this.initializeData();
    };

    Map.prototype.initializeData = function(){
        this.setData(null,null);
    };

    Map.prototype.setData = function(prefecture,area){
        this.data = {
            code : prefecture? prefecture.code : null,
            name : prefecture? this.getName(prefecture) : null,
            fullName : prefecture? prefecture.name: null,
            ShortName : prefecture? this.getShortName(prefecture) : null,
            englishName : prefecture? this.getEnglishName(prefecture) : null,
            area : area? area : null
        };
    };

    Map.prototype.hasData = function(){
        return this.data && this.data.code && this.data.code !== null;
    };

    Map.prototype.fitSize = function(){
        this.size = {};

        if (this.options.movesIslands){
            this.base.width  = this.base.width  - this.NanseiIslands.width;
            this.base.height = this.base.height - this.NanseiIslands.height;
        }

        if (! this.options.width && ! this.options.height){
            this.options.width  = this.base.width;
            this.options.height = this.base.height;

        } else if (this.options.width && ! this.options.height) {
            this.options.height = this.base.height * this.options.width  / this.base.width;

        } else if (! this.options.width && this.options.height) {
            this.options.width  = this.base.width  * this.options.height / this.base.height;
        }

        if (this.options.height / this.options.width > this.base.height / this.base.width){
            this.size.width  = this.options.width;
            this.size.height = this.options.width  * this.base.height / this.base.width;
        } else {
            this.size.width  = this.options.height * this.base.width  / this.base.height;
            this.size.height = this.options.height;
        }
    };

    Map.prototype.addEvent = function(){
        var self = this;
        var _target = $(this.element);

        if (_ua.Pointer && ! isWinDesktop || _ua.MSPointer && ! isWinDesktop || _ua.Touch){

            if (_ua.Pointer || _ua.MSPointer){
                _target.css("-ms-touch-action", "none").css("touch-action", "none");
            }

            _target.on(_start, function(e){
                var point  = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;

                self.pointer = {
                    x: point.pageX - _target[0].offsetLeft,
                    y: point.pageY - _target[0].offsetTop
                };
                self.render();
                if (self.isHovering()) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                _target.on(_move, function(e){
                    point	= e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;

                    if (self.isHovering()) {
                        self.pointer = {
                            x: point.pageX - _target[0].offsetLeft,
                            y: point.pageY - _target[0].offsetTop
                        };

                        self.render();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                $(document).on(_end, function(e){
                    point	= e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;

                    if (self.data.code !== null && self.data.name != null && "onSelect" in self.options){
                        setTimeout(function(){
                            self.options.onSelect(self.data);
                        } ,0);
                    }
                    self.pointer = null;

                    _target.off(_move);
                    $(document).off(_end);
                });
            });


        } else {

            _target.on("mousemove", function(e){
                var point  = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;

                self.pointer = {
                    x: point.pageX - _target[0].offsetLeft,
                    y: point.pageY - _target[0].offsetTop
                };
                self.render();

            });

            _target.on("mousedown", function(e){
                var point	= e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;

                if (self.data.code !== null && self.data.name != null && "onSelect" in self.options){
                    setTimeout(function(){
                        self.options.onSelect(self.data);
                    } ,0);
                }
                self.pointer = null;
            });

            _target.on("mouseout", function(e){
                self.pointer = null;
                self.render();
            });
        }

    };

    Map.prototype.findPrefectureByCode = function(code){
        var results = this.options.prefectures.filter(function(p){return p.code == code});
        return (results.length>0)? results[0] : null;
    };

    Map.prototype.findAreaBelongingToByCode = function(code){
        var results = this.options.areas.filter(function(a){return a.prefectures.indexOf(code) > -1 });
        return (results.length>0)? results[0] : null;
    };

    Map.prototype.isNanseiIslands = function(path){
        var islands = ["屋久島","種子島","奄美諸島","沖縄本島","多良間島","宮古島","伊是名島","伊平屋島","八重山諸島"];
        return "name" in path && islands.indexOf(path.name) > -1;
    };

    Map.prototype.brighten = function(hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, parseInt(c + (c * lum))), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    };

    Map.prototype.getName = function(prefecture_or_area){
        switch (this.isArea(prefecture_or_area)? this.options.areaNameType : this.options.prefectureNameType){
            case "short"   : return this.getShortName(prefecture_or_area);
            case "english" : return this.getEnglishName(prefecture_or_area);
            case "romaji"  : return this.getEnglishName(prefecture_or_area);
            case "full"    : return prefecture_or_area.name;
            case "kanji"   : return prefecture_or_area.name;
            default        : return prefecture_or_area.name;
        }
    };

    Map.prototype.getShortName = function(prefecture_or_area){
        if (this.isArea(prefecture_or_area)){
            return prefecture_or_area.name.replace(/地方$/, "");
        }
        return prefecture_or_area.name.replace(/[都|府|県]$/, "");
    };

    Map.prototype.getEnglishName = function(prefecture_or_area){
        if (this.isArea(prefecture_or_area)){
            return prefecture_or_area.english? prefecture_or_area.english : null;
        }
        return definition_of_english_name[prefecture_or_area.code];
    };

    Map.prototype.isArea = function(prefecture_or_area){
        return this.options.areas.indexOf(prefecture_or_area) > -1;
    };

    // ---------------------------------------------------------------------------------------------------------------
    /* Canvas */
    // ---------------------------------------------------------------------------------------------------------------
    var MapCanvas = function(){
        var available = !!document.createElement('canvas').getContext;
        if (! available){
            throw "Your browser may not support CANVAS.";
        }
        this.element = document.createElement("canvas");
        Map.apply(this, arguments);

        this.element.width  = this.size.width;
        this.element.height = this.size.height;
    };
    MapCanvas.prototype = Object.create(Map.prototype);
    MapCanvas.prototype.constructor = Map;

    MapCanvas.prototype.render = function(){
        var context = this.element.getContext("2d");
        context.clearRect( 0, 0, this.element.width, this.element.height );

        this.hovering = false;
        this.hovered  = null;

        var render = this.options.selection == "area" ? this.renderAreaMap : this.renderPrefectureMap;
        render.apply(this);

        if (! this.hovering)
            this.initializeData();

        this.element.style.background = this.options.backgroundColor;

        if (this.options.drawsBoxLine){
            this.element.style.borderWidth = this.options.lineWidth + "px";
            this.element.style.borderColor = this.options.lineColor;
            this.element.style.borderStyle = "solid";
        }

        this.drawIslandsLine();
        this.drawName();
    };

    MapCanvas.prototype.renderPrefectureMap = function(){
        var context = this.element.getContext("2d");

        this.options.prefectures.forEach(function(prefecture){

            context.beginPath();
            this.drawPrefecture(prefecture);
            context.closePath();

            var area = this.findAreaBelongingToByCode(prefecture.code);
            if (area){
                this.setProperties(prefecture,area);
            } else {
                throw "No area has such prefecture code '" + code + "'.";
            }

            context.fill();
            if (this.options.borderLineColor && this.options.borderLineWidth > 0)
                context.stroke();

        }, this);
    };

    MapCanvas.prototype.renderAreaMap = function(){
        var context = this.element.getContext("2d");

        this.options.areas.forEach(function(area){

            context.beginPath();
            area.prefectures.forEach(function(code){
                var prefecture = this.findPrefectureByCode(code);
                if (prefecture) {
                    this.drawPrefecture(prefecture);
                } else {
                    throw "No prefecture code '" + code + "' is defined.";
                }
            }, this);
            context.closePath();

            this.setProperties(area,area);

            context.fill();
            if (this.options.borderLineColor && this.options.borderLineWidth > 0)
                context.stroke();
        }, this);
    };

    MapCanvas.prototype.drawPrefecture = function(prefecture){

        prefecture.path.forEach(function(p){
            var OFFSET =  {X:0, Y:0};
            if (this.options.movesIslands){
                OFFSET = {
                    X:OFFSET.X + (this.isNanseiIslands(p)? this.NanseiIslands.left : - this.NanseiIslands.width) ,
                    Y:OFFSET.Y + (this.isNanseiIslands(p)? this.NanseiIslands.top  : 0)
                };
            }
            if ("coords"  in p) this.drawCoords(p.coords, OFFSET);
            if ("subpath" in p){
                p.subpath.forEach(function(s){
                    if ("coords" in s) this.drawCoords(s.coords, OFFSET);
                }, this);
            }
        }, this);
    };

    MapCanvas.prototype.drawName = function(){
        if (! this.options.showsPrefectureName && ! this.options.showsAreaName)
            return;

        var drawsArea = this.options.showsAreaName && (! this.options.showsPrefectureName || this.options.selection == "area");

        if (drawsArea) {
            this.options.areas.forEach(function(area){
                var center = {x:0, y:0, n:0};
                area.prefectures.forEach(function(code){
                    var prefecture = this.findPrefectureByCode(code);
                    var _center = this.getCenterOfPrefecture(prefecture);
                    center.n ++;
                    center.x = (center.x * (center.n - 1) + _center.x) / center.n;
                    center.y = (center.y * (center.n - 1) + _center.y) / center.n;
                }, this);

                this.drawText(area, center);
            }, this);
        } else {
            this.options.prefectures.forEach(function(prefecture){
                var center = this.getCenterOfPrefecture(prefecture);
                this.drawText(prefecture, center);
            }, this);
        }
    };

    MapCanvas.prototype.drawText = function(prefecture_or_area, point){
        var context = this.element.getContext("2d");
        var area = this.isArea(prefecture_or_area)? prefecture_or_area : this.findAreaBelongingToByCode(prefecture_or_area.code);
        var drawsArea = this.options.showsAreaName && (! this.options.showsPrefectureName || this.options.selection == "area");


        context.save();

        if (this.options.fontColor && this.options.fontColor == "areaColor"){
            var hovered;
            if (drawsArea == (this.options.selection == "area")){
                hovered = this.hovered == prefecture_or_area.code;
            } else if (drawsArea) {
                hovered = area.prefectures.indexOf(this.hovered) > -1;
            } else {
                hovered = this.hovered == area.code;
            }
            var color   = area.color? area.color : this.options.color;
            var hvColor = area.color && area.hoverColor ?
                area.hoverColor :
                area.color?
                    this.brighten(area.color, 0.2) :
                    this.options.hoverColor? this.options.hoverColor : this.brighten(this.options.color, 0.2);

            context.fillStyle = hovered ? hvColor : color;
        } else if (this.options.fontColor) {
            context.fillStyle = this.options.fontColor;
        } else {
            context.fillStyle = this.options.color;
        }

        context.font = (this.options.fontSize? this.options.fontSize : this.element.width / 100) + "px '" + (this.options.font? this.options.font : "Arial") + "'";
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        if (this.options.fontShadowColor){
            context.shadowColor = this.options.fontShadowColor;
            context.shadowBlur = 5;
        }

        for (var i = 0; i < 5; i++)
            context.fillText(this.getName(prefecture_or_area), point.x * this.element.width / this.base.width, point.y * this.element.height / this.base.height);
        context.restore();
    };


    MapCanvas.prototype.getCenterOfPrefecture = function(prefecture){
        var center = {x:0, y:0, n:0};

        var OFFSET =  {X:0, Y:0};
        switch (prefecture.name){
            case "北海道"  : OFFSET.X = 10; OFFSET.Y = -5; break;
            case "宮城県"  : OFFSET.Y =  5; break;
            case "山形県"  : OFFSET.Y = -5; break;
            case "埼玉県"  : OFFSET.Y = -3; break;
            case "神奈川県": OFFSET.Y =  2; break;
            case "千葉県"  : OFFSET.X =  7; break;
            case "石川県"  : OFFSET.Y = -5; break;
            case "滋賀県"  : OFFSET.Y =  5; break;
            case "京都府"  : OFFSET.Y = -2; break;
            case "兵庫県"  : OFFSET.Y =  4; break;
            case "三重県"  : OFFSET.Y = -5; break;
            case "広島県"  : OFFSET.Y = -3; break;
            case "島根県"  : OFFSET.X = -5; break;
            case "高知県"  : OFFSET.X =  5; break;
            case "福岡県"  : OFFSET.Y = -5; break;
            case "長崎県"  : OFFSET.Y =  5; break;
        }

        var path = prefecture.path[0];

        if (this.options.movesIslands){
            OFFSET = {
                X:OFFSET.X + (this.isNanseiIslands(path)? this.NanseiIslands.left : - this.NanseiIslands.width) ,
                Y:OFFSET.Y + (this.isNanseiIslands(path)? this.NanseiIslands.top  : 0)
            };
        }
        if ("coords"  in path) {
            var i = 0;
            while(true){
                var x = path.coords[i * 2 + 0];
                var y = path.coords[i * 2 + 1];
                if (typeof x === "undefined" || typeof y === "undefined") break;

                x = x + OFFSET.X;
                y = y + OFFSET.Y;

                center.n ++;
                center.x = (center.x * (center.n - 1) + x) / center.n;
                center.y = (center.y * (center.n - 1) + y) / center.n;
                i++;
            }
        }
        return center;
    };


    MapCanvas.prototype.drawCoords = function(coords, OFFSET){
        var context = this.element.getContext("2d");
        var i = 0;
        while(true){
            var x = coords[i * 2 + 0];
            var y = coords[i * 2 + 1];
            if (typeof x === "undefined" || typeof y === "undefined") break;

            x = x + OFFSET.X;
            y = y + OFFSET.Y;

            if(i==0) {
                context.moveTo( x * this.element.width / this.base.width, y * this.element.height / this.base.height );
            } else {
                context.lineTo( x * this.element.width / this.base.width, y * this.element.height / this.base.height );
            }
            i++;
        }
    };

    MapCanvas.prototype.drawIslandsLine = function(){
        var context = this.element.getContext("2d");

        if (this.options.movesIslands){
            context.beginPath();
            context.moveTo(   0                                       , 200 * this.element.height / this.base.height );
            context.lineTo( 150 * this.element.width / this.base.width, 200 * this.element.height / this.base.height );
            context.lineTo( 350 * this.element.width / this.base.width,   0                                          );

            context.strokeStyle = this.options.lineColor;
            context.lineWidth = this.options.lineWidth;
            context.stroke();
        }
    };

    MapCanvas.prototype.setProperties = function(prefecture, area){
        var context = this.element.getContext("2d");
        context.fillStyle = ("color" in area)? area.color : this.options.color;

        if (this.options.borderLineColor)
            context.strokeStyle = this.options.borderLineColor;

        if (this.options.borderLineWidth)
            context.lineWidth = this.options.borderLineWidth;

        var pointerIsOn = this.pointer && context.isPointInPath( this.pointer.x, this.pointer.y );

        if (pointerIsOn){
            this.hovering = true;
            this.hovered  = prefecture.code;

            if (this.data.code != prefecture.code && this.options.onHover){
                this.setData(prefecture,area);
                this.options.onHover(this.data);

            } else {
                this.setData(prefecture,area);
            }

            if (area.hoverColor)
                context.fillStyle = area.hoverColor;
            else if (this.options.hoverColor)
                context.fillStyle = this.options.hoverColor;
            else
                context.fillStyle = this.brighten(context.fillStyle, 0.2);
        }

        this.element.style.cursor = (this.data.code == null)? "default" : "pointer";
    };

    MapCanvas.prototype.isHovering = function(){
        return this.hovering;
    };

    // ---------------------------------------------------------------------------------------------------------------
    /* data */
    var definition_of_allJapan = [
        {
            "code"       :0,
            "name"       :"日本",
            "english"    :"Japan",
            "color"      :"#a0a0a0",
            "prefectures":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47]
        }
    ];

    var definition_of_prefectures = [

        {
            "code" : 1,
            "name" : "北海道",
            "path" : [
                {
                    "coords" : [483,92,483,93,483,95,483,97,482,99,481,100,482,101,483,103,484,103,484,104,485,105,487,106,488,107,489,109,489,110,489,111,488,114,488,114,487,114,486,116,486,119,486,121,486,122,487,124,488,124,490,124,491,124,493,122,494,122,495,119,495,117,496,117,497,116,498,116,499,114,499,113,501,114,500,114,500,115,500,115,501,115,502,115,504,115,505,116,506,116,507,116,508,114,509,114,510,114,510,113,509,113,509,112,507,111,505,110,504,109,504,108,502,107,502,106,501,106,501,105,499,105,498,105,495,103,493,102,492,101,492,100,493,96,494,95,497,93,499,93,500,93,501,94,502,95,502,95,503,96,504,97,505,99,505,99,505,99,505,99,505,100,505,100,506,100,506,100,507,99,508,97,509,96,511,96,511,95,516,92,522,92,525,93,527,95,531,97,534,99,535,100,536,100,539,102,540,102,542,103,544,104,546,104,547,105,549,107,551,108,551,108,552,106,553,105,553,102,553,101,552,98,554,95,556,91,557,89,565,81,566,80,567,80,570,78,571,78,572,79,573,79,575,79,578,79,579,79,580,79,579,79,579,78,581,76,581,76,582,76,582,76,581,76,581,76,581,77,581,77,581,78,583,78,583,78,584,78,584,77,585,77,585,76,586,76,586,75,587,75,586,75,586,74,587,73,587,73,588,73,589,72,590,72,593,71,593,72,593,72,594,71,594,70,594,70,595,69,595,68,596,68,597,67,597,67,598,66,599,66,598,65,589,67,588,65,587,61,586,60,585,59,585,59,584,58,584,57,584,55,584,54,584,53,584,52,586,50,586,48,587,46,588,44,588,43,588,42,587,41,587,41,586,42,586,43,585,43,585,44,584,46,581,48,581,49,580,50,579,51,578,52,576,53,570,53,568,52,568,51,567,50,567,49,566,49,566,50,565,51,565,51,565,50,564,49,561,48,561,48,561,48,561,49,561,50,560,49,558,49,557,49,557,49,556,47,557,47,557,47,550,43,549,43,548,42,546,41,544,39,543,39,541,37,540,35,539,35,537,32,536,31,535,30,535,30,534,29,534,28,533,27,532,25,529,22,526,18,524,16,523,16,522,15,521,14,520,15,520,16,518,17,518,17,517,16,516,16,516,17,516,19,516,20,515,21,516,25,519,34,519,39,519,41,519,43,518,44,518,44,518,45,517,46,517,46,517,50,518,52,518,54,517,55,517,55,517,56,516,58,515,58,514,59,512,60,512,61,511,62,512,63,512,64,512,64,512,65,512,66,512,67,513,69,514,71,512,75,510,77,508,77,507,77,507,76,506,75,506,75,504,75,503,76,502,76,501,76,499,74,499,74,498,73,497,73,495,71,495,72,495,72,494,72,493,73,493,74,492,75,493,77,494,77,495,79,495,79,496,81,495,82,493,84,492,85,492,87,491,87,490,86,489,87,489,88,488,89,487,89,486,90,484,90,483,91,483,91,483,92,483,92]
                },{
                    "name" : "礼文島",
                    "coords" : [506,19,505,20,505,20,505,20,505,19,504,18,504,16,505,15,506,19,506,19]
                },{
                    "name" : "利尻島",
                    "coords" : [508,21,509,21,510,22,511,23,510,25,508,24,507,23,508,21,508,21]
                },{
                    "name" : "奥尻島",
                    "coords" : [477,102,477,103,476,104,476,106,475,107,474,105,474,103,475,103,475,103,476,102,477,102,477,102]
                },

                {
                    "name" : "北方領土",
                    "subpath" : [
                        {
                            "name" : "択捉島",
                            "coords" :  [645,2,647,1,649,1,650,2,649,3,649,3,649,4,649,6,647,7,644,8,643,9,643,9,643,9,641,11,639,12,638,13,638,13,636,16,635,18,632,19,631,19,631,19,630,19,629,18,628,19,629,20,628,22,627,23,625,25,623,28,622,30,621,31,620,31,619,33,618,34,617,35,616,34,616,33,617,32,617,31,616,30,617,29,617,30,618,31,618,30,618,29,619,29,620,29,620,28,621,27,621,26,620,26,619,26,619,25,620,24,621,25,622,24,622,23,622,23,623,22,624,20,625,19,626,18,626,16,628,16,629,15,630,13,631,12,632,10,631,9,632,7,633,7,634,9,635,10,639,9,641,8,642,6,642,6,642,6,644,3,645,2,645,2]
                        },{
                            "name" : "歯舞島",
                            "coords" : [606,61,605,63,604,62,604,61,605,60,606,61,606,61]
                        },{
                            "name" : "色丹島",
                            "coords" : [617,50,618,50,619,51,617,52,616,52,618,53,616,53,615,55,614,55,613,54,613,53,614,52,615,51,616,50,617,50,617,50]
                        },{
                            "name" : "国後島",
                            "coords" : [605,36,608,37,610,35,610,38,609,38,608,38,607,38,607,39,606,40,605,41,603,41,602,42,601,43,601,44,600,45,599,45,599,45,599,46,598,47,599,48,598,48,598,48,597,50,596,51,594,52,594,53,593,55,593,59,593,58,593,57,592,57,591,57,590,56,590,54,591,52,593,50,595,48,596,48,596,46,596,45,597,44,597,43,597,43,599,41,601,37,601,36,602,35,602,35,604,35,605,36,605,36]
                        }
                    ]
                }
            ]
        },

        {
            "code" : 2,
            "name" : "青森県",
            "path" : [
                {
                    "coords" : [514,125,515,124,516,124,516,125,515,128,515,142,517,147,518,148,519,148,520,149,521,150,521,151,521,151,521,151,519,152,518,153,517,153,516,153,514,154,514,154,513,154,511,155,509,156,507,157,506,157,506,155,506,154,506,152,506,152,505,152,504,150,503,150,503,151,502,151,501,152,500,152,499,152,498,152,495,151,495,150,493,150,493,151,493,151,489,152,488,151,487,151,486,151,486,152,486,152,485,150,485,148,484,147,484,148,483,147,484,146,485,145,485,144,487,142,488,142,489,143,490,142,491,142,492,138,492,136,493,135,493,135,493,136,494,135,494,135,495,135,493,135,493,134,493,134,493,133,491,133,490,132,491,132,492,132,493,130,493,130,493,129,494,129,495,130,496,130,497,130,499,131,499,134,500,139,501,141,503,140,504,138,504,138,503,137,504,135,506,136,506,137,507,138,507,138,509,139,511,138,511,135,512,132,511,129,510,128,510,128,510,128,509,130,506,131,504,131,502,132,502,131,502,129,503,124,504,123,504,122,504,121,505,121,506,122,509,123,510,124,512,126,514,125,514,125]
                }
            ]
        },

        {
            "code" : 3,
            "name" : "岩手県",
            "path" : [
                {
                    "coords" : [521,151,521,151,519,152,518,153,517,153,516,153,514,154,514,154,513,154,511,155,509,156,507,157,506,157,504,160,504,164,504,166,505,167,503,167,503,167,503,168,504,169,504,169,503,170,503,171,503,171,504,172,503,174,502,175,502,175,502,176,501,177,501,179,500,180,501,181,501,182,501,183,503,185,503,185,503,186,503,186,502,187,502,188,503,189,503,189,503,190,503,192,503,192,503,192,503,192,503,192,504,193,506,193,507,194,509,194,510,194,510,195,510,196,511,197,512,197,512,197,512,198,514,196,515,196,515,196,516,197,517,197,517,196,518,193,518,192,518,191,521,192,521,191,521,191,522,191,522,192,523,192,523,192,524,191,523,190,523,189,526,190,525,189,527,189,526,188,525,188,526,188,527,188,527,188,527,187,526,186,527,186,527,185,527,185,528,184,528,184,527,184,527,183,528,183,527,182,528,182,529,181,528,181,527,181,528,180,528,180,528,179,529,179,529,179,530,177,530,177,529,177,527,177,529,176,530,176,530,175,529,174,529,173,529,172,529,172,528,173,528,170,528,168,528,166,527,165,527,164,527,163,527,162,526,162,526,162,526,161,524,160,525,159,525,159,525,158,524,157,524,157,524,156,523,153,522,151,521,151,521,151,521,151]
                }
            ]
        },

        {
            "code" : 4,
            "name" : "宮城県",
            "path" : [
                {
                    "coords" : [518,192,518,191,521,192,521,191,522,195,521,193,520,195,521,196,519,196,519,197,519,197,520,199,520,199,520,199,519,199,519,199,517,200,518,201,519,201,519,202,518,203,519,204,519,203,520,204,520,205,519,205,519,205,519,205,519,206,519,206,518,207,519,207,520,207,519,208,519,208,519,208,520,210,519,210,518,210,518,210,518,209,517,209,517,208,517,208,516,208,513,207,512,208,512,210,510,210,510,209,511,209,510,208,509,209,509,209,509,210,509,210,510,210,510,210,509,211,507,213,507,222,506,222,505,222,505,223,505,224,504,225,503,225,504,225,502,225,501,223,499,222,497,222,496,222,496,221,496,220,495,220,494,220,494,220,492,220,492,220,492,220,492,219,492,219,492,218,493,218,495,217,495,216,496,215,496,214,496,212,497,210,497,210,498,210,498,209,499,208,499,206,499,205,498,204,498,201,499,201,499,201,499,200,500,198,499,196,498,195,498,194,500,194,501,193,502,193,503,192,503,192,503,192,503,192,504,193,506,193,507,194,509,194,510,194,510,195,510,196,511,197,512,197,512,197,512,198,514,196,515,196,515,196,516,197,517,197,517,196,518,193,518,192,518,192]
                }
            ]
        },

        {
            "code" : 5,
            "name" : "秋田県",
            "path" : [
                {
                    "coords" : [506,152,506,154,506,155,506,157,504,160,504,164,504,166,505,167,503,167,503,167,503,168,504,169,504,169,503,170,503,171,503,171,504,172,503,174,502,175,502,175,502,176,501,177,501,179,500,180,501,181,501,182,501,183,503,185,503,185,503,186,503,186,502,187,502,188,503,189,503,189,503,190,503,192,503,192,503,192,503,192,502,193,501,193,500,194,498,194,498,194,497,194,496,193,495,192,495,192,494,191,494,191,494,190,493,190,493,191,491,190,491,190,490,189,489,190,488,189,487,188,487,188,485,188,484,188,484,188,484,187,484,186,484,186,484,185,484,184,485,183,486,181,487,170,486,168,485,166,486,166,487,167,487,165,486,165,486,165,485,164,485,162,486,161,485,163,485,164,485,166,483,167,482,167,481,167,480,166,480,163,481,164,482,165,485,161,486,156,486,153,485,152,485,152,486,152,486,152,486,151,487,151,488,151,489,152,493,151,493,151,493,150,495,150,495,151,498,152,499,152,500,152,501,152,502,151,503,151,503,150,504,150,505,152,506,152,506,152,506,152]
                }
            ]
        },

        {
            "code" : 6,
            "name" : "山形県",
            "path" : [
                {
                    "coords" : [498,194,497,194,496,193,495,192,495,192,494,191,494,191,494,190,493,190,493,191,491,190,491,190,490,189,489,190,488,189,487,188,487,188,485,188,484,188,484,188,483,190,482,194,481,196,479,199,477,202,476,203,476,204,477,204,479,205,480,205,480,206,480,208,481,209,483,210,483,212,481,213,479,213,479,215,479,217,478,220,478,221,478,223,479,224,480,224,481,224,481,224,482,224,483,224,484,224,485,224,485,225,486,226,487,226,487,226,487,226,488,227,489,226,490,226,491,226,492,225,492,224,492,220,492,220,492,220,492,220,492,219,492,219,492,218,493,218,495,217,495,216,496,215,496,214,496,212,497,210,497,210,498,210,498,209,499,208,499,206,499,205,498,204,498,201,499,201,499,201,499,200,500,198,499,196,498,195,498,194,498,194,498,194]
                }
            ]
        },

        {
            "code" : 7,
            "name" : "福島県",
            "path" : [
                {
                    "coords" : [504,225,505,224,505,223,505,222,506,222,507,222,508,226,508,228,509,230,509,235,509,241,509,242,508,244,508,247,508,249,507,249,506,249,505,250,504,251,503,251,501,251,500,250,499,249,499,251,498,252,497,253,496,253,494,252,492,249,491,247,491,247,490,246,490,246,489,245,484,243,482,245,480,246,477,247,474,248,473,249,472,250,469,249,469,247,469,245,469,243,468,242,467,240,468,239,469,238,469,237,469,236,469,235,471,235,472,234,473,233,474,233,476,234,476,232,476,230,476,229,477,229,478,228,478,227,479,226,480,225,480,224,480,224,481,224,481,224,482,224,483,224,484,224,485,224,485,225,486,226,487,226,487,226,487,226,488,227,489,226,490,226,491,226,492,225,492,224,492,220,492,220,494,220,494,220,495,220,496,220,496,221,496,222,497,222,499,222,501,223,502,225,504,225,503,225,504,225,504,225]
                }
            ]
        },

        {
            "code" : 8,
            "name" : "茨城県",
            "path" : [
                {
                    "coords" : [503,255,502,257,501,261,500,262,500,264,500,265,500,266,499,268,499,269,500,275,501,277,502,277,502,278,503,279,504,281,505,283,505,283,504,283,503,281,501,280,500,279,499,278,498,278,497,279,496,278,495,279,494,279,494,279,493,280,491,280,489,280,489,280,488,280,484,277,482,275,481,273,481,274,480,273,479,270,479,270,482,268,483,267,484,266,485,266,485,265,487,265,487,265,488,264,488,264,489,264,490,265,490,264,491,262,491,261,491,261,491,258,491,257,492,256,492,255,492,254,492,253,492,252,492,249,492,249,494,252,496,253,497,253,498,252,499,251,499,249,500,250,501,251,503,251,504,251,504,253,503,255,503,255]
                }
            ]
        },

        {
            "code" : 9,
            "name" : "栃木県",
            "path" : [
                {
                    "coords" : [489,245,490,246,490,246,491,247,491,247,492,249,492,249,492,252,492,253,492,254,492,255,492,256,491,257,491,258,491,261,491,261,491,262,490,264,490,265,489,264,488,264,488,264,487,265,487,265,485,265,485,266,484,266,483,267,482,268,479,270,479,270,478,269,477,268,475,268,473,267,472,266,472,263,472,262,473,261,474,260,473,259,471,258,471,256,471,255,471,254,472,253,472,252,472,252,472,250,472,250,473,249,474,248,477,247,480,246,482,245,484,243,489,245,489,245]
                }
            ]
        },

        {
            "code" : 10,
            "name" : "群馬県",
            "path" : [
                {
                    "coords" : [467,248,468,249,469,249,472,250,472,250,472,250,472,252,472,252,472,253,471,254,471,255,471,256,471,258,473,259,474,260,473,261,472,262,472,263,472,266,473,267,475,268,477,268,478,269,479,270,477,270,475,270,474,270,471,269,471,269,470,269,467,268,465,270,464,271,464,272,464,272,463,272,462,273,462,273,461,273,459,274,457,275,456,276,456,276,455,276,454,273,455,273,454,272,453,270,454,271,454,270,454,269,454,268,454,267,455,267,454,264,453,264,451,264,449,263,450,260,450,259,451,258,451,257,452,257,452,256,452,256,456,255,456,255,457,254,457,254,458,255,459,253,460,253,460,252,462,252,462,250,463,251,463,248,465,247,465,246,466,246,467,248,467,248]
                }
            ]
        },

        {
            "code" : 11,
            "name" : "埼玉県",
            "path" : [
                {
                    "coords" : [471,269,471,269,470,269,467,268,465,270,464,271,464,272,464,272,463,272,462,273,462,273,461,273,459,274,457,275,456,276,456,276,456,277,457,278,457,278,458,279,458,279,459,280,460,280,461,280,461,280,461,280,462,280,462,280,462,279,462,279,463,279,463,279,463,279,465,280,467,280,469,281,469,281,470,281,471,282,473,282,475,282,475,282,476,283,478,282,478,282,479,282,480,282,481,281,483,282,483,282,483,282,483,280,483,280,483,278,482,277,481,275,481,275,481,275,481,274,481,274,480,273,479,270,477,270,475,270,474,270,471,269,471,269]
                }
            ]
        },

        {
            "code" : 12,
            "name" : "千葉県",
            "path" : [
                {
                    "coords" : [498,278,497,279,496,278,495,279,494,279,494,279,493,280,491,280,489,280,489,280,488,280,484,277,482,275,481,273,481,274,481,274,481,275,481,275,481,275,482,277,483,278,483,280,483,282,483,282,483,282,483,283,484,284,483,286,483,286,484,286,485,285,486,286,486,286,487,286,488,288,488,288,488,288,487,289,486,290,486,291,485,291,485,292,484,293,484,294,483,294,482,294,482,295,481,295,480,295,482,296,482,297,483,298,482,299,482,300,482,302,481,303,482,304,482,304,481,305,480,305,481,306,482,307,482,307,483,307,485,306,486,304,487,303,488,303,488,302,489,301,490,301,492,301,493,300,493,301,494,300,495,299,496,298,495,297,495,295,496,291,499,287,502,285,503,285,504,284,505,284,506,285,506,285,506,284,506,283,505,283,505,283,504,283,503,281,501,280,500,279,499,278,498,278,498,278]
                }
            ]
        },

        {
            "code" : 13,
            "name" : "東京都",
            "path" : [
                {
                    "coords" : [481,281,483,282,483,283,484,284,483,286,483,286,483,286,483,286,483,286,482,286,481,286,481,287,481,289,480,289,479,289,479,289,479,289,478,288,476,287,475,286,475,287,474,287,473,287,474,287,474,288,474,288,474,288,474,289,474,290,473,290,470,287,466,285,466,285,466,285,466,285,466,285,465,285,462,282,461,280,461,280,462,280,462,280,462,279,462,279,463,279,463,279,463,279,465,280,467,280,469,281,469,281,470,281,471,282,473,282,475,282,475,282,476,283,478,282,478,282,479,282,480,282,481,281,481,281]
                },

                {
                    "name" : " 伊豆諸島",
                    "subpath" : [
                        {
                            "name" : "三宅島",
                            "coords" : [476,330,476,331,475,332,474,333,473,332,473,331,474,330,475,330,476,330,476,330]
                        },{
                            "name" : "御蔵島",
                            "coords" : [476,338,476,337,476,337,477,337,476,338,476,338]
                        },{
                            "name" : "八丈島",
                            "coords" : [481,358,482,359,482,360,482,361,482,362,482,361,481,361,480,360,480,359,481,358,481,358]
                        },{
                            "name" : "神津島",
                            "coords" : [465,326,466,326,466,327,466,328,465,328,465,326,465,326]
                        },{
                            "name" : "新島",
                            "coords" : [469,321,469,322,469,323,469,324,468,323,468,322,468,322,469,321,469,321]
                        },{
                            "name" : "大島",
                            "coords" : [472,311,473,312,473,313,471,313,470,311,472,311,472,311]
                        }
                    ]
                }
            ]
        },

        {
            "code" : 14,
            "name" : "神奈川県",
            "path" : [
                {
                    "coords" : [476,287,478,288,479,289,479,289,480,289,481,289,481,289,481,290,480,290,479,291,478,291,478,291,478,291,478,291,479,293,478,293,478,293,478,294,478,295,478,295,478,296,478,296,479,297,480,297,480,298,479,299,478,300,478,300,478,301,477,301,477,300,477,299,477,299,477,298,476,297,474,296,474,296,473,295,471,296,467,297,466,299,466,300,463,300,463,298,462,297,462,296,463,294,462,293,461,293,460,293,462,291,463,290,464,290,464,289,465,287,466,285,466,285,470,287,473,290,474,290,474,289,474,288,474,288,474,288,474,287,473,287,474,287,475,287,475,286,476,287,476,287]
                }
            ]
        },

        {
            "code" : 15,
            "name" : "新潟県",
            "path" : [
                {
                    "coords" : [480,205,480,206,480,208,481,209,483,210,483,212,481,213,479,213,479,215,479,217,478,220,478,221,478,223,479,224,480,224,480,225,479,226,478,227,478,228,477,229,476,229,476,230,476,232,476,234,474,233,473,233,472,234,471,235,469,235,469,236,469,237,469,238,468,239,467,240,468,242,469,243,469,245,469,247,469,249,468,249,467,248,466,246,465,246,465,247,463,248,463,251,462,250,462,252,460,252,460,253,459,253,458,255,457,254,457,254,456,255,456,255,456,255,456,253,455,251,454,249,453,246,451,247,449,248,448,249,448,249,447,249,447,251,447,252,444,251,442,252,442,252,441,251,441,250,440,249,439,249,437,250,437,250,437,251,436,252,436,253,435,253,435,253,435,252,434,250,434,249,434,248,433,248,433,247,433,247,435,246,438,245,440,245,441,244,442,243,443,242,445,242,446,242,447,242,449,239,452,238,454,235,455,234,456,232,457,231,458,229,459,227,461,223,465,221,468,220,471,218,473,214,474,210,474,207,475,205,476,205,476,204,477,204,479,205,480,205,480,205]
                },{
                    "name" : "佐渡島",
                    "coords" : [452,211,452,210,453,210,453,211,453,213,452,216,453,217,454,217,454,217,454,219,450,223,449,224,448,224,447,224,446,224,447,223,448,223,448,222,448,221,449,220,449,219,449,219,448,219,448,220,447,220,447,218,447,217,448,216,448,214,449,213,451,212,452,211,452,211]
                }
            ]
        },

        {
            "code" : 16,
            "name" : "富山県",
            "path" : [
                {
                    "coords" : [413,266,413,266,414,264,415,264,416,264,416,265,416,266,416,266,417,266,418,265,419,263,421,262,421,262,422,262,424,261,424,262,425,262,426,262,427,263,428,263,430,264,430,264,431,264,431,264,431,263,431,263,431,263,432,262,432,261,432,260,433,260,433,260,433,259,434,258,435,256,435,255,435,253,435,253,436,253,435,253,435,253,435,252,434,250,434,249,434,248,434,248,433,248,433,247,431,247,428,248,427,249,427,250,427,251,426,252,425,252,423,253,421,252,420,252,418,250,418,249,419,248,419,247,418,247,415,249,415,250,414,251,414,252,414,253,414,253,413,253,413,253,413,254,413,255,413,256,413,258,413,259,413,260,412,261,412,262,413,263,412,264,412,266,413,266,413,266,413,266]
                }
            ]
        },

        {
            "code" : 17,
            "name" : "石川県",
            "path" : [
                {
                    "coords" : [424,236,425,236,425,236,423,238,422,238,420,239,419,240,418,240,417,240,417,240,416,241,416,242,415,243,415,244,416,245,416,243,417,244,418,244,418,243,419,243,419,244,419,245,419,247,419,247,419,247,418,247,415,249,415,250,414,251,414,252,414,253,413,253,413,253,413,254,413,255,413,256,413,258,413,259,413,260,412,261,412,262,413,263,412,264,412,266,413,266,413,266,413,266,413,266,413,266,413,267,413,267,412,270,411,271,411,271,410,272,409,271,408,270,406,270,405,269,405,269,404,270,403,269,402,268,401,266,400,265,400,265,401,264,403,263,405,260,407,258,409,255,410,254,411,252,412,248,412,247,413,246,412,244,412,242,411,241,412,238,412,237,413,236,414,235,415,235,415,234,416,234,417,234,417,234,421,233,421,232,423,232,425,231,427,232,427,234,426,234,425,234,424,236,424,236]
                },{
                    "name" : "能登島",
                    "coords" : [419,241,419,241,419,242,417,243,417,242,416,241,417,242,417,242,417,242,417,241,418,242,419,241,419,241]
                }
            ]
        },

        {
            "code" : 18,
            "name" : "福井県",
            "path" : [
                {
                    "coords" : [401,266,402,268,403,269,404,270,405,269,405,269,406,270,408,270,409,271,410,272,411,271,410,273,410,276,412,276,412,278,411,279,409,280,408,280,408,279,403,280,401,280,400,281,400,282,400,282,399,283,398,282,397,282,397,283,396,285,395,286,394,286,393,287,391,287,390,289,389,290,388,290,386,291,384,290,381,289,381,288,380,288,380,287,380,286,380,285,381,284,381,285,381,285,381,285,381,285,381,286,383,286,385,285,385,286,384,287,385,287,387,287,386,286,386,286,386,284,387,284,389,286,388,285,389,284,389,285,389,284,389,283,389,283,388,283,389,282,389,283,390,284,390,283,391,284,392,283,392,282,392,281,392,281,393,280,394,280,394,281,394,282,394,282,395,282,395,280,394,277,393,276,393,275,393,274,393,274,393,273,395,270,397,268,397,266,399,265,400,265,400,265,401,266,401,266]
                }
            ]
        },

        {
            "code" : 19,
            "name" : "山梨県",
            "path" : [
                {
                    "coords" : [460,280,459,280,458,279,458,279,457,278,457,278,457,278,456,279,455,279,454,279,453,278,451,278,450,278,450,277,449,277,447,277,446,279,445,279,444,281,444,282,444,282,443,283,443,284,444,285,444,285,444,285,444,285,445,287,445,288,445,291,445,294,445,295,446,295,447,295,448,296,448,298,449,299,450,299,451,298,451,296,452,292,453,293,454,293,455,293,455,294,455,294,457,294,461,293,461,293,460,293,462,291,463,290,464,290,464,289,465,287,466,285,466,285,465,285,462,282,461,280,460,280,460,280]
                }
            ]
        },

        {
            "code" : 20,
            "name" : "長野県",
            "path" : [
                {
                    "coords" : [451,247,453,246,454,249,455,251,456,253,456,255,452,256,452,256,452,257,451,257,451,258,450,259,450,260,449,263,451,264,453,264,454,264,455,267,454,267,454,268,454,269,454,270,454,271,453,270,454,272,455,273,454,273,455,276,457,278,455,279,454,279,453,278,451,278,450,278,450,277,449,277,447,277,446,279,445,279,444,281,444,282,444,282,443,283,443,284,444,285,444,285,444,285,444,286,444,287,443,287,443,287,443,289,443,290,442,291,442,291,442,291,442,292,441,294,440,294,439,295,437,296,435,297,434,298,433,297,432,297,431,297,429,297,428,296,428,295,429,295,429,295,429,295,429,294,429,293,429,292,430,292,430,291,430,290,430,288,429,288,428,288,428,285,428,284,427,282,426,281,424,280,425,279,426,277,427,278,428,277,428,276,430,275,430,273,429,272,430,270,430,269,431,268,432,266,432,265,431,264,431,264,431,264,431,263,431,263,432,262,432,261,432,260,433,260,433,260,433,259,434,258,435,256,435,255,435,253,435,253,436,253,436,252,437,251,437,250,437,250,439,249,440,249,441,250,441,251,442,252,442,252,444,251,447,252,447,251,447,249,448,249,448,249,449,248,451,247,451,247]
                }
            ]
        },

        {
            "code" : 21,
            "name" : "岐阜県",
            "path" : [
                {
                    "coords" : [425,262,424,262,424,261,422,262,421,262,419,263,418,265,417,266,416,266,416,266,416,265,416,264,415,264,414,264,413,266,413,266,413,266,413,267,413,267,413,267,412,270,411,271,411,271,410,273,410,276,412,276,412,278,411,279,409,280,408,280,408,279,403,280,401,280,400,281,400,282,400,282,399,283,399,284,400,285,401,287,402,286,402,287,402,290,401,293,402,296,402,295,402,296,403,295,404,295,405,296,406,297,407,298,408,299,408,299,408,298,408,296,408,295,408,295,409,293,411,292,414,291,415,291,415,291,416,292,417,293,418,294,419,295,420,295,421,295,423,295,424,296,425,296,426,297,427,296,429,295,429,295,429,295,429,294,429,293,429,292,430,292,430,291,430,290,430,288,429,288,428,288,428,285,428,284,427,282,426,281,424,280,425,279,426,277,427,278,428,277,428,276,430,275,430,273,429,272,430,270,430,269,431,268,432,266,432,265,431,264,431,264,430,264,430,264,428,263,427,263,426,262,425,262,425,262]
                }
            ]
        },

        {
            "code" : 22,
            "name" : "静岡県",
            "path" : [
                {
                    "coords" : [454,293,453,293,452,292,451,296,451,298,450,299,449,299,448,298,448,296,447,295,446,295,445,295,445,294,445,291,445,288,444,285,444,285,444,285,444,285,444,286,444,287,443,287,443,287,443,289,443,290,442,291,442,291,442,291,442,292,441,294,440,294,439,295,437,296,435,297,434,298,434,299,435,299,434,300,434,300,433,301,433,301,432,302,431,304,430,305,430,306,429,307,428,308,427,308,426,310,426,313,426,313,426,313,428,313,428,312,428,310,428,309,428,311,429,310,430,309,429,310,429,312,430,311,429,312,429,313,430,313,432,314,434,314,440,314,444,316,444,315,443,314,444,312,445,311,446,310,447,308,448,307,449,306,450,305,451,305,451,304,451,304,451,304,451,303,451,303,452,302,454,301,456,301,459,302,459,304,458,304,457,304,457,307,457,309,456,310,457,311,456,311,456,312,456,313,456,313,457,314,457,315,458,316,459,316,461,314,462,314,462,314,463,312,464,311,464,310,465,309,466,308,466,306,465,305,465,305,465,304,464,303,465,301,463,300,463,298,462,297,462,296,463,294,462,293,461,293,461,293,457,294,455,294,455,294,455,293,454,293,454,293]
                }
            ]
        },

        {
            "code" : 23,
            "name" : "愛知県",
            "path" : [
                {
                    "coords" : [429,297,431,297,432,297,433,297,434,298,435,297,434,298,434,299,435,299,434,300,434,300,433,301,433,301,433,301,432,302,431,304,430,305,430,306,429,307,428,308,427,308,426,310,426,312,426,313,426,313,426,313,426,313,419,315,415,315,416,313,417,313,418,313,420,312,421,312,422,311,422,311,422,312,422,312,422,312,422,311,422,311,422,309,421,309,420,309,419,309,419,310,418,309,416,309,415,309,414,308,414,307,414,305,413,306,413,308,414,310,414,312,411,310,411,309,412,308,411,306,411,304,412,302,412,301,411,302,411,302,411,301,410,301,409,301,409,301,409,300,408,299,408,299,408,299,408,298,408,296,408,295,408,295,409,293,411,292,414,291,415,291,415,291,416,292,417,293,418,294,419,295,420,295,421,295,423,295,424,296,425,296,426,297,427,296,429,295,428,295,428,296,429,297,429,297]
                }
            ]
        },

        {
            "code" : 24,
            "name" : "三重県",
            "path" : [
                {
                    "coords" : [409,302,408,301,408,302,408,302,407,303,407,304,406,306,405,308,404,310,404,311,404,312,404,313,406,315,409,316,411,317,412,319,413,319,412,320,412,320,412,321,411,321,412,321,412,321,412,322,411,323,412,323,411,324,408,324,408,323,409,323,408,323,409,323,408,323,407,323,407,322,406,322,406,322,406,323,405,323,405,324,404,324,404,323,403,324,403,323,402,323,402,326,401,324,401,324,401,325,398,325,397,326,397,326,396,326,397,327,397,328,397,329,396,328,395,329,395,329,396,329,396,330,397,330,396,330,396,330,396,332,395,332,395,333,394,332,394,332,394,334,394,333,393,333,393,334,392,334,391,335,390,337,389,338,388,338,388,338,386,335,386,334,387,332,387,332,388,332,388,332,389,332,389,331,389,331,390,330,391,329,392,330,393,330,392,329,392,328,392,328,392,326,392,325,393,323,393,322,393,322,393,321,392,319,394,318,396,317,395,316,393,314,392,313,393,312,392,311,392,311,393,311,392,310,393,309,392,309,392,308,392,307,393,307,394,305,393,305,393,305,395,305,396,305,397,306,398,305,400,304,401,301,402,298,402,296,402,296,402,295,402,296,403,295,404,295,405,296,406,297,407,298,408,299,408,299,408,299,409,300,409,301,409,301,409,301,409,302,409,302]
                }
            ]
        },

        {
            "code" : 25,
            "name" : "滋賀県",
            "path" : [
                {
                    "coords" : [396,282,397,282,397,282,397,282,397,282,397,282,397,282,399,282,399,282,399,283,399,283,399,283,399,284,400,285,401,287,402,286,402,287,402,290,401,293,402,296,402,296,402,298,401,301,400,304,398,305,397,306,396,305,395,305,393,305,393,305,394,305,393,307,392,307,392,308,391,307,392,307,391,306,390,305,390,305,389,305,388,303,388,302,387,299,388,296,388,295,388,293,386,291,388,290,389,290,390,289,391,287,393,287,394,286,395,286,396,285,397,283,396,282,396,282,396,282,396,282]
                }
            ]
        },

        {
            "code" : 26,
            "name" : "京都府",
            "path" : [
                {
                    "coords" : [380,286,380,287,380,288,381,288,381,289,384,290,386,291,386,291,388,293,388,295,388,296,387,299,388,302,388,303,389,305,390,305,390,305,391,306,392,307,391,307,392,308,392,309,391,309,389,308,389,309,387,309,386,309,385,307,385,307,384,305,383,303,382,302,382,302,381,302,381,303,380,302,380,301,379,301,378,300,377,300,377,299,377,299,378,298,377,297,377,296,375,296,375,295,374,295,373,295,373,295,373,294,373,294,372,293,371,293,370,293,368,291,367,289,369,288,370,288,370,286,371,284,369,284,368,285,367,283,367,282,367,281,367,280,368,281,369,280,371,279,372,279,372,278,374,278,375,278,376,278,377,280,377,281,376,281,375,283,375,283,376,284,375,285,376,285,377,286,377,286,378,286,378,286,377,285,378,284,378,284,380,283,381,284,380,285,380,286,380,286]
                }
            ]
        },

        {
            "code" : 27,
            "name" : "大阪府",
            "path" : [
                {
                    "coords" : [382,302,381,302,381,303,380,302,380,301,379,301,378,300,377,300,377,299,377,299,376,299,377,300,376,301,376,301,377,302,378,302,379,302,378,303,378,306,378,308,378,308,377,309,377,309,377,309,377,311,377,311,377,311,377,312,376,313,377,314,376,315,374,316,373,318,372,319,370,319,369,319,369,319,369,320,369,320,370,321,371,321,372,320,372,320,372,320,372,320,373,320,373,320,375,319,377,319,378,319,379,319,381,319,382,319,382,318,383,317,383,315,383,312,383,310,384,307,385,307,385,307,384,305,383,303,382,302,382,302,382,302]
                }
            ]
        },

        {
            "code" : 28,
            "name" : "兵庫県",
            "path" : [
                {
                    "coords" : [367,282,367,283,368,285,369,284,371,284,370,286,370,288,369,288,367,289,368,291,370,293,371,293,372,293,373,294,373,294,373,295,373,295,374,295,375,295,375,296,377,296,377,297,378,298,377,299,376,299,377,300,376,301,376,301,377,302,378,302,379,302,378,303,378,306,378,308,377,309,377,309,376,309,375,308,375,309,373,309,372,309,371,310,367,310,365,308,363,307,362,306,360,305,359,306,359,305,358,305,356,305,355,305,355,305,355,306,354,306,353,306,352,306,351,306,351,305,351,305,351,303,350,302,351,301,351,300,351,300,351,299,351,298,352,297,353,294,354,294,354,293,355,291,356,291,357,291,357,290,357,288,357,288,357,287,356,286,356,285,356,282,356,281,356,280,358,280,359,280,360,280,360,280,361,280,362,280,363,280,363,280,364,280,365,280,367,281,367,282,367,282]
                },{
                    "name" : "淡路島",
                    "coords" : [368,312,367,312,367,312,367,313,365,315,364,317,365,319,365,319,365,320,364,321,362,321,361,322,360,323,360,322,359,322,359,321,359,321,359,321,358,321,358,320,359,320,358,320,359,319,359,318,360,318,361,316,362,315,363,314,366,312,368,312,368,312]
                }
            ]
        },

        {
            "code" : 29,
            "name" : "奈良県",
            "path" : [
                {
                    "coords" : [389,308,389,309,387,309,386,309,385,307,384,307,383,310,383,312,383,315,383,317,382,318,382,319,382,321,383,322,383,323,383,323,382,323,381,324,380,325,380,326,379,326,379,327,380,328,380,330,380,331,380,332,380,333,380,333,380,334,382,333,383,333,384,333,386,334,386,334,386,335,386,334,387,332,389,331,390,330,391,329,392,330,393,330,392,329,392,328,392,328,392,326,392,325,393,323,393,322,393,322,393,321,392,319,394,318,396,317,395,316,393,314,392,313,393,312,392,311,392,311,393,311,392,310,393,309,392,309,391,309,389,308,389,308]
                }
            ]
        },

        {
            "code" : 30,
            "name" : "和歌山県",
            "path" : [
                {
                    "coords" : [381,319,382,319,382,321,383,322,383,323,383,323,382,323,381,324,380,325,380,326,379,326,379,327,380,328,380,330,380,331,380,332,380,333,380,333,380,334,382,333,383,333,384,333,386,334,386,334,386,335,388,338,388,338,389,338,389,338,390,338,388,339,388,340,389,341,388,340,387,341,388,341,388,341,388,341,387,342,388,342,388,342,387,343,387,343,387,343,386,344,385,344,383,345,384,345,385,345,384,346,383,345,382,346,383,345,383,345,382,345,380,345,379,344,377,344,377,343,376,343,374,341,374,340,374,340,373,339,373,338,373,338,374,338,374,338,374,337,373,336,372,336,371,335,370,334,369,333,369,332,368,332,367,332,367,331,367,331,367,330,367,329,368,329,369,329,369,328,369,327,367,326,368,326,368,326,369,325,370,325,371,324,370,323,369,322,368,321,368,320,369,319,369,320,370,321,371,321,372,320,372,320,372,320,373,320,373,320,375,319,377,319,378,319,379,319,381,319,381,319]
                }
            ]
        },

        {
            "code" : 31,
            "name" : "鳥取県",
            "path" : [
                {
                    "coords" : [348,282,352,282,354,281,356,280,356,281,356,282,356,285,356,286,357,287,357,288,357,288,357,290,357,291,356,291,355,291,354,291,353,292,352,292,350,293,349,292,349,291,348,290,348,289,347,289,346,288,346,288,346,287,344,288,342,289,341,290,341,289,341,288,338,287,337,287,336,288,335,289,334,289,334,291,333,291,332,291,331,291,329,293,328,293,328,294,327,294,326,293,324,292,325,292,326,291,326,290,326,289,326,289,327,288,329,288,329,287,330,285,330,285,330,284,330,283,329,283,328,281,328,280,329,280,329,281,331,282,332,283,333,282,338,281,340,282,342,282,346,282,346,282,347,282,348,282,348,282]
                }
            ]
        },

        {
            "code" : 32,
            "name" : "島根県",
            "path" : [
                {
                    "coords" : [315,281,317,281,316,280,316,280,318,280,322,280,322,279,322,279,324,279,324,278,323,277,325,278,325,277,327,278,328,278,330,279,331,279,331,279,329,280,328,280,328,281,329,283,330,283,330,284,330,285,330,285,329,287,329,288,327,288,326,289,326,289,326,290,326,291,325,292,324,292,324,292,323,293,322,292,321,292,321,292,320,292,319,292,318,292,318,293,317,293,316,294,315,295,314,295,313,296,313,297,314,297,313,298,311,298,310,299,309,299,308,298,308,298,305,299,303,298,302,299,299,300,300,301,300,302,299,303,298,305,297,306,297,307,296,307,295,309,294,311,294,311,293,310,291,311,290,310,290,309,290,308,290,308,290,307,289,307,288,305,288,304,289,303,290,302,289,300,291,300,293,299,294,298,294,297,295,297,296,297,296,296,297,296,297,296,298,295,298,295,299,294,300,293,301,292,303,292,305,291,306,290,307,288,309,287,311,286,313,285,315,284,315,282,314,282,314,282,315,281,315,281]
                },{
                    "name" : "隠岐島",
                    "coords" : [333,257,334,258,335,259,334,261,333,262,332,262,330,261,330,259,331,258,333,257,333,257]
                },{
                    "name" : "西ノ島",
                    "coords" : [327,266,326,267,326,267,326,266,326,266,325,266,325,265,324,263,325,263,325,264,325,265,326,265,327,266,327,266]
                },{
                    "name" : "中ノ島",
                    "coords" : [329,264,328,264,329,265,328,264,328,265,327,266,327,264,327,263,326,264,326,264,326,262,328,262,327,263,327,263,328,263,328,263,329,264,329,264]
                }
            ]
        },

        {
            "code" : 33,
            "name" : "岡山県",
            "path" : [
                {
                    "coords" : [346,287,346,288,346,288,347,289,348,289,348,290,349,291,349,292,350,293,352,292,353,292,354,291,354,293,354,294,353,294,352,297,351,298,351,299,351,300,351,300,351,301,350,302,351,303,351,305,351,305,350,306,347,309,346,309,345,309,345,309,345,308,344,309,343,308,343,309,344,309,344,310,344,311,344,310,344,311,344,313,343,311,343,311,342,312,341,313,340,312,339,312,339,313,339,313,338,312,337,311,337,312,336,312,336,311,336,310,336,310,335,310,335,310,335,311,334,311,334,311,333,311,332,311,332,310,331,310,331,311,331,311,330,311,330,310,330,310,330,309,330,308,329,306,329,305,329,303,329,301,328,300,328,298,328,297,328,296,329,296,328,295,328,294,328,293,329,293,331,291,332,291,333,291,334,291,334,289,335,289,336,288,337,287,338,287,341,288,341,289,341,290,342,289,344,288,346,287,346,287]
                }
            ]
        },

        {
            "code" : 34,
            "name" : "広島県",
            "path" : [
                {
                    "coords" : [324,292,324,292,323,293,322,292,321,292,321,292,320,292,319,292,318,292,318,293,317,293,316,294,315,295,314,295,313,296,313,297,314,297,313,298,311,298,310,299,309,299,308,298,308,298,305,299,303,298,302,299,299,300,300,301,300,302,299,303,298,305,297,306,297,307,297,307,297,309,297,310,298,312,300,315,300,315,300,315,300,315,300,315,300,314,301,313,302,313,301,314,301,314,302,314,303,314,303,313,304,313,303,312,303,312,303,311,304,311,304,311,306,311,306,312,307,312,308,312,307,312,307,313,307,315,308,315,308,315,307,316,306,317,307,315,306,313,305,314,305,314,304,314,304,315,305,316,305,316,305,318,306,318,305,318,305,319,306,319,307,319,307,320,307,320,308,320,308,319,308,318,308,318,307,318,307,318,308,318,307,317,308,316,309,316,310,316,310,317,311,317,311,317,311,317,312,318,312,318,313,318,313,318,314,317,313,317,313,317,311,316,312,316,313,315,313,315,314,314,315,314,315,314,316,314,317,314,319,314,321,313,321,312,323,312,324,312,323,313,322,314,322,314,321,316,321,316,323,315,323,315,323,315,323,316,324,315,324,314,323,314,325,313,327,313,326,314,325,314,327,314,328,314,328,313,329,312,329,311,329,311,330,311,330,310,330,310,330,309,330,308,329,306,329,305,329,303,329,301,328,300,328,298,328,297,328,296,329,296,328,295,328,294,327,294,326,293,324,292,324,292]
                },{
                    "name" : "大崎上島",
                    "coords" : [315,315,317,315,317,314,317,315,317,316,316,317,315,317,315,316,315,315,315,315]
                }
            ]
        },

        {
            "code" : 35,
            "name" : "山口県",
            "path" : [
                {
                    "coords" : [287,301,287,300,288,300,289,300,289,300,289,300,290,302,289,303,288,304,288,305,289,307,290,307,290,308,290,308,290,309,290,310,291,311,293,310,294,311,294,311,295,309,296,307,297,307,297,307,297,309,297,310,298,312,300,315,300,315,300,315,300,315,300,317,300,317,300,317,299,319,299,321,299,322,299,322,300,322,301,323,302,324,302,324,302,323,304,323,304,324,303,324,302,325,302,325,301,325,300,324,299,325,298,325,298,325,298,324,298,323,298,323,298,322,297,322,297,324,297,325,296,325,296,325,296,324,295,323,293,323,293,322,292,321,290,320,290,320,290,321,289,320,288,320,289,319,290,319,289,318,288,317,286,318,286,318,285,318,284,318,284,317,283,319,282,318,282,317,281,318,280,318,279,318,279,319,279,318,279,317,278,319,276,319,276,321,276,320,275,319,274,319,274,318,274,318,274,318,274,317,273,317,272,316,271,315,271,316,269,317,268,318,267,319,267,318,268,317,268,316,268,315,267,313,268,312,269,310,269,308,269,307,269,306,270,306,271,306,272,305,271,305,270,305,271,305,272,304,275,305,275,305,275,306,276,306,277,306,277,306,278,306,279,306,280,306,280,306,281,306,281,306,281,305,282,305,282,304,284,303,285,302,286,301,286,301,287,301,287,301]
                },{
                    "name" : "長島",
                    "coords" : [295,325,295,325,295,326,294,326,295,325,295,325,295,325]
                }
            ]
        },

        {
            "code" : 36,
            "name" : "徳島県",
            "path" : [
                {
                    "coords" : [346,322,345,323,344,323,344,323,342,324,341,324,341,323,340,322,339,323,338,323,337,323,336,324,335,324,334,325,334,325,334,325,334,326,334,327,334,327,334,328,333,329,336,330,337,330,338,330,338,331,339,332,340,331,341,331,342,331,342,335,343,335,344,336,345,337,344,338,345,339,347,340,348,340,348,339,348,339,349,339,350,338,350,337,350,337,351,337,352,336,354,336,355,334,356,334,358,333,359,332,359,332,358,332,357,332,357,331,358,330,357,326,356,327,356,326,356,325,357,323,358,321,358,320,357,320,356,320,356,321,353,321,353,322,352,322,351,322,348,322,346,322,346,322]
                }
            ]
        },

        {
            "code" : 37,
            "name" : "香川県",
            "path" : [
                {
                    "coords" : [347,315,347,315,347,316,347,317,347,316,348,316,348,316,348,316,348,317,349,317,349,317,349,318,349,319,350,319,351,319,351,320,352,319,352,320,353,321,353,321,353,321,353,321,353,322,352,322,351,322,348,322,346,322,345,323,344,323,344,323,342,324,341,324,341,323,340,323,340,322,339,323,338,323,337,323,336,324,335,324,334,325,334,325,334,325,334,325,333,324,332,324,333,323,333,322,334,320,333,318,332,317,333,317,334,318,335,318,336,318,337,317,338,316,339,315,339,315,340,316,340,315,340,315,341,314,343,315,344,316,344,316,345,316,345,315,346,315,346,315,347,315,347,315]
                },{
                    "name" : "小豆島",
                    "coords" : [350,311,352,311,352,311,352,311,351,314,350,314,350,313,349,314,348,314,349,314,349,313,347,313,347,313,347,312,347,311,348,311,350,311,350,311]
                },{
                    "name" : "豊島",
                    "coords" : [345,313,344,312,345,312,346,313,345,313,345,313]
                }
            ]
        },

        {
            "code" : 38,
            "name" : "愛媛県",
            "path" : [
                {
                    "coords" : [317,319,319,324,321,326,323,325,324,325,325,325,325,324,327,325,329,325,331,325,332,324,332,324,333,324,334,325,334,325,334,325,334,326,334,327,334,327,334,328,333,329,332,328,331,328,330,328,329,330,328,330,327,329,326,329,324,329,324,329,323,330,322,330,322,330,321,330,321,331,320,332,320,333,318,334,318,334,318,335,318,335,318,336,318,336,317,337,316,338,313,338,312,338,312,340,313,342,312,343,310,344,310,345,309,345,307,347,306,346,306,347,306,349,306,351,306,352,306,352,306,353,306,353,305,353,304,354,304,353,303,353,303,353,303,353,302,352,302,353,302,354,301,353,301,352,301,352,301,351,302,351,302,351,302,351,302,350,301,349,301,349,300,349,300,350,299,350,299,349,300,349,301,348,301,349,301,347,302,347,301,346,301,345,300,345,300,345,301,344,302,345,304,344,303,344,302,343,302,342,303,342,302,341,300,341,300,341,301,340,301,340,301,339,301,339,301,338,301,337,302,337,301,337,300,336,299,337,299,336,296,338,295,338,294,339,294,339,294,339,294,338,293,339,292,339,293,338,295,337,296,337,297,336,298,336,300,336,302,335,305,332,308,331,309,329,310,326,310,325,311,325,311,325,312,323,315,321,316,321,316,320,317,319,317,319]
                },{
                    "name" : "大三島",
                    "coords" : [319,315,320,315,319,317,317,318,317,317,318,317,318,316,318,315,319,315,319,315]
                },{
                    "name" : "伯方島",
                    "coords" : [320,317,320,317,321,317,321,318,321,318,321,318,321,318,321,318,320,317,320,317]
                },{
                    "name" : "中島",
                    "coords" : [309,322,309,323,309,323,308,323,308,323,309,322,309,322,309,322]
                },{
                    "name" : "大島",
                    "coords" : [321,318,321,319,319,320,319,320,319,319,320,318,321,318,321,318,321,318]
                }
            ]
        },

        {
            "code" : 39,
            "name" : "高知県",
            "path" : [
                {
                    "coords" : [340,331,341,331,342,331,342,335,343,335,344,336,345,337,344,338,345,339,347,340,348,340,347,341,345,346,343,348,343,347,343,347,342,347,342,346,342,345,341,344,341,344,341,343,338,340,336,339,334,339,331,339,330,339,329,340,328,340,327,340,327,341,326,342,325,342,325,342,324,342,323,343,323,342,322,343,321,343,322,344,321,346,321,347,320,347,320,348,320,349,319,348,318,350,318,350,317,351,317,352,316,352,316,351,315,352,314,353,314,354,314,356,313,356,313,357,313,358,314,359,313,360,312,360,312,359,312,359,311,358,308,359,306,358,305,358,305,358,305,359,304,358,304,358,304,357,305,357,305,355,307,354,306,354,306,354,306,353,306,353,306,352,306,352,306,351,306,349,306,347,306,346,307,347,309,345,310,345,310,344,312,343,313,342,312,340,312,338,313,338,316,338,317,337,318,336,318,336,318,335,318,335,318,334,318,334,320,333,320,332,321,331,321,330,322,330,322,330,323,330,324,329,324,329,326,329,327,329,328,330,329,330,330,328,331,328,332,328,333,329,336,330,337,330,338,330,338,331,339,332,340,331,340,331]
                }
            ]
        },

        {
            "code" : 40,
            "name" : "福岡県",
            "path" : [
                {
                    "coords" : [270,318,270,319,270,319,269,320,269,321,270,326,270,327,272,328,272,329,272,329,272,329,272,330,272,330,272,331,271,331,269,331,266,331,265,332,264,332,264,333,264,334,263,335,263,336,263,337,262,337,262,337,262,339,263,339,262,341,262,342,262,342,262,342,260,341,258,340,257,341,256,341,255,341,254,342,253,343,253,343,252,343,252,343,251,343,251,341,251,340,250,339,250,338,250,338,250,338,250,337,251,337,252,336,253,336,253,336,253,335,255,334,255,334,256,333,255,331,254,331,253,332,253,332,253,331,251,330,248,328,247,328,246,328,244,328,244,328,245,327,246,327,247,326,247,326,247,325,246,325,246,325,247,325,248,324,248,324,249,324,249,323,249,323,250,324,250,325,250,325,251,326,252,326,254,325,254,325,254,324,254,323,253,323,253,323,254,323,255,322,256,321,255,320,256,320,256,320,256,319,257,319,258,318,258,318,259,318,261,318,262,317,262,317,262,317,263,317,264,318,265,318,266,318,266,318,266,319,267,319,268,319,268,318,270,318,270,318]
                }
            ]
        },

        {
            "code" : 41,
            "name" : "佐賀県",
            "path" : [
                {
                    "coords" : [253,332,254,331,255,331,256,333,255,334,255,334,253,335,253,336,253,336,252,336,251,337,250,337,250,338,250,338,250,338,250,339,248,338,247,337,246,338,245,339,245,340,246,342,246,343,246,343,246,344,244,343,244,343,243,342,242,341,241,340,240,339,240,338,240,338,240,337,239,336,237,335,237,333,237,332,237,331,237,331,238,331,238,331,238,331,238,332,239,332,239,331,239,330,239,329,239,329,239,328,238,327,239,327,239,328,240,327,240,326,240,325,240,325,240,324,240,325,241,325,243,326,242,328,242,327,242,328,244,328,244,328,244,328,246,328,247,328,248,328,251,330,253,331,253,332,253,332,253,332]
                }
            ]
        },

        {
            "code" : 42,
            "name" : "長崎県",
            "path" : [
                {
                    "coords" : [246,344,244,345,243,345,244,346,244,347,245,346,248,346,249,348,249,351,248,352,246,353,245,353,244,354,244,354,243,354,243,354,243,353,242,352,243,351,244,350,244,349,244,349,243,348,242,348,239,348,238,350,236,351,234,353,233,353,233,353,233,352,234,351,234,349,236,349,235,348,235,348,235,347,234,346,234,346,234,346,234,346,234,347,232,342,232,342,232,341,232,340,233,337,234,337,234,338,235,339,235,339,235,339,235,340,235,340,236,341,236,342,235,344,237,345,237,345,237,344,238,345,240,346,239,343,239,342,239,340,238,339,238,339,237,340,236,339,236,338,236,339,235,337,235,337,235,336,234,337,233,337,233,337,233,336,234,336,233,335,233,335,233,335,232,334,232,332,232,331,232,330,232,330,232,329,232,330,231,330,231,331,230,331,230,332,229,333,228,334,227,334,226,333,227,333,227,333,227,333,227,332,228,332,228,332,228,331,229,331,229,330,229,329,230,329,232,328,230,328,231,328,232,328,232,328,233,329,234,329,235,329,235,328,235,329,235,330,236,330,237,329,238,330,238,331,238,331,237,331,237,331,237,332,237,333,237,335,239,336,240,337,240,338,240,338,240,339,241,340,242,341,243,342,244,343,244,343,246,344,246,344,246,344]
                },

                {
                    "name" : "五島列島",
                    "subpath" : [
                        {
                            "name" : "的山大島",
                            "coords" : [221,329,222,330,221,330,220,329,221,329,221,329,221,329]
                        },{
                            "name" : "対馬",
                            "coords" : [236,291,237,291,237,292,237,293,237,294,236,295,234,297,234,297,234,298,234,299,233,299,234,300,234,301,233,301,232,302,231,302,231,304,230,305,229,307,228,307,228,307,228,306,227,306,227,307,227,306,227,305,228,302,228,301,229,300,229,300,230,301,230,301,231,300,231,300,230,299,230,299,231,298,231,297,231,296,232,295,233,294,233,294,232,294,232,293,234,291,236,291,236,291]
                        },{
                            "name" : "福江島",
                            "coords" : [211,342,211,343,212,344,212,344,211,344,212,346,212,347,211,347,210,346,209,347,209,348,209,348,208,348,208,347,207,347,206,347,205,346,205,345,206,346,206,346,207,345,206,344,207,344,207,343,207,342,208,341,208,342,209,343,209,343,210,342,211,342,211,342,211,342]
                        },{
                            "name" : "中通島",
                            "coords" : [219,331,219,331,220,331,221,331,221,332,221,332,221,333,220,333,220,334,220,336,220,336,219,337,219,337,219,338,220,337,221,338,221,339,219,339,219,340,219,341,219,341,218,342,218,342,218,342,217,343,217,342,217,341,216,341,216,341,215,341,215,341,215,342,214,343,214,342,214,342,214,341,213,341,213,342,212,343,212,342,212,341,212,341,213,341,213,340,213,340,214,340,215,340,215,340,215,340,215,340,216,340,216,340,216,340,215,339,216,339,216,339,217,338,217,338,218,338,218,337,218,337,218,336,219,336,219,336,219,335,219,335,220,333,220,333,220,332,219,331,219,331]
                        },{
                            "name" : "壱岐島",
                            "coords" : [239,316,239,316,240,316,240,317,240,318,240,318,239,318,240,318,240,319,239,319,238,320,237,319,236,319,236,318,237,318,237,318,237,317,237,316,237,317,237,316,237,315,238,315,239,316,239,316]
                        }
                    ]
                }
            ]
        },

        {
            "code" : 43,
            "name" : "熊本県",
            "path" : [
                {
                    "coords" : [268,341,270,343,270,344,271,345,271,346,271,347,271,349,272,351,272,352,272,352,271,352,270,353,269,354,268,356,267,356,267,356,266,357,266,358,265,358,264,358,263,360,263,362,264,363,264,363,264,364,264,365,265,366,263,367,263,368,264,370,263,370,262,370,261,371,260,371,258,371,257,371,256,371,255,371,254,371,254,371,254,371,254,371,253,369,252,368,251,368,250,368,249,369,247,369,246,369,246,368,246,368,246,368,246,367,246,367,246,366,247,365,249,363,250,361,252,360,252,359,252,359,252,358,252,358,252,358,252,357,255,355,253,355,251,355,251,355,250,354,250,356,248,356,249,355,250,354,251,354,253,353,253,352,254,350,253,347,252,346,251,345,251,343,252,343,252,343,253,343,253,343,254,342,255,341,256,341,257,341,258,340,260,341,262,342,262,342,263,343,264,344,265,345,266,344,266,343,266,343,265,341,266,341,268,341,268,341]
                },{
                    "name" : "天草諸島",
                    "coords" : [240,355,240,355,240,356,241,355,242,355,243,355,243,358,245,358,246,357,247,357,249,357,249,357,250,357,249,358,249,360,247,361,247,361,244,360,244,360,244,359,243,359,243,360,243,360,243,361,242,362,241,362,241,363,240,363,240,364,240,364,239,365,238,365,238,366,238,366,237,366,237,366,237,366,237,366,237,366,237,365,237,365,237,364,237,364,237,364,236,363,238,362,237,360,239,358,239,356,239,355,240,355,240,355]
                }
            ]
        },

        {
            "code" : 44,
            "name" : "大分県",
            "path" : [
                {
                    "coords" : [281,328,280,328,278,330,277,330,276,330,274,329,273,329,273,328,272,328,272,328,272,329,272,329,272,329,272,330,272,330,272,331,271,331,269,331,266,331,265,332,264,332,264,333,264,334,263,335,263,336,263,337,262,337,262,337,262,339,263,339,262,341,262,342,262,342,262,342,262,342,263,343,264,344,265,345,266,344,266,343,266,343,265,341,266,341,268,341,270,343,270,344,271,345,271,346,271,347,271,349,272,351,272,352,272,352,272,352,273,352,274,353,275,352,276,353,277,354,278,354,280,355,281,355,282,354,283,353,284,354,285,355,285,356,285,357,285,357,285,357,285,356,286,356,285,356,286,356,287,355,287,355,288,355,289,354,288,353,289,352,290,351,292,351,291,351,290,351,290,351,289,350,289,351,288,350,287,350,287,349,288,348,289,348,290,347,290,347,290,346,290,346,289,347,289,347,288,346,288,347,286,346,288,345,287,345,286,344,286,343,287,342,288,341,286,341,285,341,284,341,283,340,282,340,279,340,279,337,279,337,280,337,281,337,282,337,282,337,282,336,283,336,284,336,284,336,285,334,285,332,285,329,283,328,282,328,281,328,281,328]
                }
            ]
        },

        {
            "code" : 45,
            "name" : "宮崎県",
            "path" : [
                {
                    "coords" : [285,355,285,356,285,357,285,357,285,358,284,358,284,358,283,359,282,360,281,361,280,361,281,362,280,363,280,364,279,363,279,364,279,364,279,365,279,365,278,365,278,366,278,367,277,367,276,369,275,371,273,376,271,381,271,382,271,382,272,384,271,385,271,387,269,388,269,389,269,389,269,389,269,389,268,390,268,392,268,392,267,393,267,393,266,394,267,395,266,395,265,394,265,394,265,394,264,393,264,392,263,392,262,391,262,391,262,391,262,390,262,390,263,390,263,387,263,386,262,386,262,386,261,385,260,385,260,384,260,384,260,383,260,382,259,382,259,381,258,380,257,379,257,378,257,376,255,375,255,373,254,372,254,372,254,372,254,371,254,371,254,371,254,371,254,371,255,371,256,371,257,371,258,371,260,371,261,371,262,370,263,370,264,370,263,368,263,367,265,366,264,365,264,364,264,363,264,363,263,362,263,360,263,359,264,358,265,358,266,358,266,357,267,356,267,356,268,356,269,354,270,353,271,352,272,352,272,352,273,352,274,353,275,352,276,353,277,354,278,354,280,355,281,355,282,354,283,353,284,354,285,355,285,355]
                }
            ]
        },

        {
            "code" : 46,
            "name" : "鹿児島県",
            "path" : [
                {
                    "coords" : [254,372,254,372,254,372,254,371,254,371,253,369,252,368,251,368,250,368,249,369,247,369,246,369,246,368,246,368,246,368,246,367,245,368,245,368,244,368,244,369,243,368,241,368,241,367,241,367,242,367,241,366,242,364,242,363,241,364,241,364,241,364,241,365,240,365,240,365,239,365,239,366,239,368,240,368,240,368,241,370,241,371,240,372,241,372,241,373,240,376,239,377,239,378,240,379,240,379,242,383,241,387,238,389,238,389,238,388,237,388,235,388,238,391,237,391,238,392,237,392,238,393,238,394,239,394,241,394,243,395,244,396,244,397,245,397,246,397,246,398,247,398,247,397,247,397,247,397,248,396,249,395,248,394,247,393,246,388,247,387,248,385,249,384,250,383,249,382,250,382,251,382,253,382,254,383,254,385,253,386,252,386,252,386,251,384,250,384,249,385,249,386,250,387,251,387,251,388,251,389,251,390,252,393,252,395,251,397,250,399,249,400,248,400,248,401,248,401,248,401,247,402,249,402,250,401,251,401,252,401,254,401,255,400,257,399,257,398,258,398,259,397,260,397,261,396,260,396,260,396,260,395,258,394,259,392,261,391,262,391,262,391,262,390,263,390,263,387,263,386,262,386,262,386,261,385,260,385,260,384,260,383,260,382,259,382,259,381,258,380,257,379,257,378,257,376,255,375,255,373,254,372,254,372]
                },{
                    "name" : "種子島",
                    "coords" : [250,422,250,423,249,422,249,420,250,419,251,418,253,414,254,412,254,412,255,411,255,411,256,409,257,409,257,412,256,414,256,415,255,417,254,418,253,419,253,420,253,422,252,422,250,422,250,422]
                },{
                    "name" : "屋久島",
                    "coords" : [244,423,242,425,239,425,237,422,237,419,238,419,239,419,240,418,242,419,244,421,244,423,244,423]
                },{
                    "name" : "下瓶島",
                    "coords" : [229,378,228,378,228,379,227,380,225,379,226,379,226,379,228,377,229,377,229,376,229,376,230,376,230,377,229,377,229,378,229,378,229,378]
                },{
                    "name" : "上瓶島",
                    "coords" : [231,373,232,374,233,375,233,374,233,375,233,375,232,376,231,375,231,374,231,374,231,373,231,373]
                },

                {
                    "name" : "奄美諸島",
                    "subpath" : [
                        {
                            "name" : "徳之島",
                            "coords" : [187,488,187,489,187,491,187,493,186,494,185,495,184,494,183,492,184,492,184,491,184,490,184,488,184,487,185,487,187,488,187,488,187,488]
                        },{
                            "name" : "与路島",
                            "coords" : [193,485,192,485,192,484,193,484,193,485,193,485]
                        },{
                            "name" : "請島",
                            "coords" : [195,486,194,485,194,484,195,484,195,485,196,485,195,486,195,486]
                        },{
                            "name" : "与論島",
                            "coords" : [168,510,168,511,167,511,167,510,168,510,168,510]
                        },{
                            "name" : "沖永良部島",
                            "coords" : [172,500,172,500,175,501,177,500,176,501,174,502,173,503,171,501,172,500,172,500]
                        },{
                            "name" : "加計呂麻島",
                            "coords" : [195,480,195,480,196,480,195,480,195,480,196,481,196,482,198,483,198,484,197,484,197,484,196,484,196,484,196,484,195,483,194,484,194,483,195,482,194,481,194,480,195,480,195,480]
                        },{
                            "name" : "奄美大島",
                            "coords" : [195,478,197,478,196,477,197,476,198,476,199,475,200,475,201,475,202,475,202,475,203,475,204,475,205,474,206,474,207,473,208,473,207,474,207,474,208,474,207,475,208,475,208,474,208,473,209,472,210,472,210,473,210,475,209,476,207,476,206,477,205,478,203,478,202,478,202,479,202,480,202,481,201,481,200,482,199,482,199,482,199,483,199,484,198,483,197,481,196,480,193,478,195,478,195,478]
                        },{
                            "name" : "喜界島",
                            "coords" : [216,481,215,481,214,480,216,479,217,479,218,479,217,480,217,480,216,481,216,481]
                        }
                    ]
                }

            ]
        },

        {
            "code" : 47,
            "name" : "沖縄県",
            "path" : [
                {
                    "name" : "沖縄本島",
                    "coords" : [153,521,152,520,155,521,157,519,159,518,160,516,161,515,162,516,162,518,162,520,161,520,161,520,160,521,158,522,157,522,156,523,156,524,154,525,153,524,153,524,152,525,151,525,151,526,150,526,149,526,148,526,147,526,147,527,147,529,148,530,148,530,148,531,147,530,147,529,146,529,146,530,145,531,144,532,144,533,145,534,142,536,140,536,140,535,140,534,140,533,140,532,140,532,141,531,141,531,142,530,143,528,143,525,145,526,146,525,147,524,148,524,149,524,149,524,150,523,151,523,151,522,151,522,150,521,149,520,149,519,150,519,150,518,151,518,153,520,153,521,153,521]
                },{
                    "name" : "多良間島",
                    "coords" : [49,556,51,556,52,557,50,558,49,556,49,556]
                },{
                    "name" : "宮古島",
                    "coords" : [66,555,69,553,70,557,72,561,67,560,66,557,65,556,64,553,66,555,66,555]
                },{
                    "name" : "伊是名島",
                    "coords" : [153,511,153,511,153,512,152,511,153,511,153,511]
                },{
                    "name" : "伊平屋島",
                    "coords" : [154,508,156,507,154,509,154,509,153,510,153,509,154,508,154,508]
                },

                {
                    "name" : "八重山諸島",
                    "subpath" : [
                        {
                            "name" : "与那国島",
                            "coords" : [1,549,4,549,5,551,3,551,1,549,1,549]
                        },{
                            "name" : "波照間島",
                            "coords" : [19,567,22,567,22,570,20,569,19,567,19,567]
                        },{
                            "name" : "西表島",
                            "coords" : [22,558,29,560,27,563,25,563,22,561,22,558,22,558]
                        },{
                            "name" : "石垣島",
                            "coords" : [42,556,40,560,37,563,34,563,31,558,35,559,36,558,42,556,42,556]
                        }
                    ]
                }
            ]
        }
    ];

    var definition_of_english_name = {
         1 : "Hokkaido",   2 : "Aomori",     3 : "Iwate",     4 : "Miyagi",     5 : "Akita",
         6 : "Yamagata",   7 : "Fukushima",  8 : "Ibaraki",   9 : "Tochigi",   10 : "Gunma",
        11 : "Saitama",   12 : "Chiba",     13 : "Tokyo",    14 : "Kanagawa",  15 : "Niigata",
        16 : "Toyama",    17 : "Ishikawa",  18 : "Fukui",    19 : "Yamanashi", 20 : "Nagano",
        21 : "Gifu",      22 : "Shizuoka",  23 : "Aichi",    24 : "Mie",       25 : "Shiga",
        26 : "Kyoto",     27 : "Osaka",     28 : "Hyogo",    29 : "Nara",      30 : "Wakayama",
        31 : "Tottori",   32 : "Shimane",   33 : "Okayama",  34 : "Hiroshima", 35 : "Yamaguchi",
        36 : "Tokushima", 37 : "Kagawa",    38 : "Ehime",    39 : "Kochi",     40 : "Fukuoka",
        41 : "Saga",      42 : "Nagasaki",  43 : "Kumamoto", 44 : "Oita",      45 : "Miyazaki",
        46 : "Kagoshima", 47 : "Okinawa"
    };

})(jQuery);
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}(';(1L($){"cE ej";$.ei.eh=1L(a){1g b=$(B);8z(1g c 5M a)1E(a.ef(c)&&a[c]==3D)a[c]=8t;a=$.ed({ec:"ar",9t:"as",2F:3D,2U:3D,6I:"#au",7O:3D,cm:"e7",9y:"#e5",9u:0.25,ax:"#au",9K:1,cg:9R,9S:9w,cc:"aD",9T:9w,c9:"aD",9x:w,7K:z,9f:9w,9X:"c4",aI:3D,9k:3D,aN:3D,9r:1L(){},aO:1L(){}},a);1g d;d=aP u(a);b.dI(d.3w);d.8V();d.bW();3X b};1E(!(\'8X\'5M 7Q.2V)){7Q.2V.8X=1L(a,i){1E(i===8t)i=0;1E(i<0)i+=B.7f;1E(i<0)i=0;8z(1g n=B.7f;i<n;i++)1E(i 5M B&&B[i]===a)3X i;3X-1}}1E(!(\'7r\'5M 7Q.2V)){7Q.2V.7r=1L(a,b){8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B)a.aR(b,B[i],i,B)}}1E(!(\'bQ\'5M 7Q.2V)){7Q.2V.bQ=1L(a,b){1g c=aP 7Q(B.7f);8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B)c[i]=a.aR(b,B[i],i,B);3X c}}1E(!(\'a0\'5M 7Q.2V)){7Q.2V.a0=1L(a,b){1g c=[],v;8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B&&a.aR(b,v=B[i],i,B))c.dx(v);3X c}}1g j=(1L(){3X{8l:9D 9F.dt!=="8t",8f:bK.bJ.dq,8e:bK.bJ.do}})();1g k=(1L(){1g a=3D;dm{a=!!aP dl("dk")}dg(e){a=9w}3X a})();1g l=j.8f?\'da\':j.8e?\'d9\':j.8l?\'d7\':\'bA\';1g m=j.8f?\'d2\':j.8e?\'d1\':j.8l?\'d0\':\'bw\';1g o=j.8f?\'cX\':j.8e?\'cV\':j.8l?\'cT\':\'cS\';1g q=j.8f?\'cR\':j.8e?\'cQ\':j.8l?\'cP\':\'cO\';1g r=j.8f?\'cL\':j.8e?\'cJ\':j.8l?\'cI\':\'cH\';1g t=1L(a){B.J=a;B.3Y={2F:cB,2U:bo};B.7E={bg:0,bi:-5y,2F:7u,2U:8P};B.eg={x:0,y:6Y,w:9b,h:56};B.bm();B.bf()};t.2V.bf=1L(){B.ab(3D,3D)};t.2V.ab=1L(a,b){B.6D={1b:a?a.1b:3D,C:a?B.bd(a):3D,e3:a?a.C:3D,e2:a?B.bc(a):3D,e0:a?B.ac(a):3D,8N:b?b:3D}};t.2V.dX=1L(){3X B.6D&&B.6D.1b&&B.6D.1b!==3D};t.2V.bm=1L(){B.8r={};1E(B.J.9f){B.3Y.2F=B.3Y.2F-B.7E.2F;B.3Y.2U=B.3Y.2U-B.7E.2U}1E(!B.J.2F&&!B.J.2U){B.J.2F=B.3Y.2F;B.J.2U=B.3Y.2U}6r 1E(B.J.2F&&!B.J.2U){B.J.2U=B.3Y.2U*B.J.2F/B.3Y.2F}6r 1E(!B.J.2F&&B.J.2U){B.J.2F=B.3Y.2F*B.J.2U/B.3Y.2U}1E(B.J.2U/B.J.2F>B.3Y.2U/B.3Y.2F){B.8r.2F=B.J.2F;B.8r.2U=B.J.2F*B.3Y.2U/B.3Y.2F}6r{B.8r.2F=B.J.2U*B.3Y.2F/B.3Y.2U;B.8r.2U=B.J.2U}};t.2V.bW=1L(){1g b=B;1g c=$(B.3w);1E(j.8f&&!k||j.8e&&!k||j.8l){1E(j.8f||j.8e){c.bv("-dV-bx-cw","by").bv("bx-cw","by")}c.8M(l,1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V();1E(b.b0()){e.bG();e.bH()}c.8M(m,1L(e){a=e.7t.7q?e.7t.7q[0]:e;1E(b.b0()){b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V();e.bG();e.bH()}});$(9F).8M(o,1L(e){a=e.7t.7q?e.7t.7q[0]:e;1E(b.6D.1b!==3D&&b.6D.C!=3D&&"9r"5M b.J){bI(1L(){b.J.9r(b.6D)},0)}b.7o=3D;c.bL(m);$(9F).bL(o)})})}6r{c.8M("bw",1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V()});c.8M("bA",1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;1E(b.6D.1b!==3D&&b.6D.C!=3D&&"9r"5M b.J){bI(1L(){b.J.9r(b.6D)},0)}b.7o=3D});c.8M("dE",1L(e){b.7o=3D;b.8V()})}};t.2V.aW=1L(a){1g b=B.J.7K.a0(1L(p){3X p.1b==a});3X(b.7f>0)?b[0]:3D};t.2V.aV=1L(b){1g c=B.J.9x.a0(1L(a){3X a.7K.8X(b)>-1});3X(c.7f>0)?c[0]:3D};t.2V.9J=1L(a){1g b=["屋久島","種子島","奄美諸島","沖縄本島","多良間島","宮古島","伊是名島","伊平屋島","八重山諸島"];3X"C"5M a&&b.8X(a.C)>-1};t.2V.af=1L(a,b){a=du(a).aS(/[^0-9a-f]/dp,\'\');1E(a.7f<6){a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]}b=b||0;1g d="#",c,i;8z(i=0;i<3;i++){c=bZ(a.c2(i*2,2),16);c=aL.dd(aL.dc(aL.db(0,bZ(c+(c*b))),2x)).d6(16);d+=("d4"+c).c2(c.7f)}3X d};t.2V.bd=1L(a){c3(B.9i(a)?B.J.c9:B.J.cc){4X"cY":3X B.bc(a);4X"ah":3X B.ac(a);4X"cU":3X B.ac(a);4X"aD":3X a.C;4X"cN":3X a.C;c7:3X a.C}};t.2V.bc=1L(a){1E(B.9i(a)){3X a.C.aS(/地方$/,"")}3X a.C.aS(/[都|府|県]$/,"")};t.2V.ac=1L(a){1E(B.9i(a)){3X a.ah?a.ah:3D}3X A[a.1b]};t.2V.9i=1L(a){3X B.J.9x.8X(a)>-1};1g u=1L(){1g a=!!9F.c8(\'ar\').7W;1E(!a){aC"cD cC cA cz cy cx.";}B.3w=9F.c8("ar");t.cd(B,ek);B.3w.2F=B.8r.2F;B.3w.2U=B.8r.2U};u.2V=ee.eb(t.2V);u.2V.ea=t;u.2V.8V=1L(){1g a=B.3w.7W("2d");a.e8(0,0,B.3w.2F,B.3w.2U);B.aj=9w;B.9l=3D;1g b=B.J.9t=="8N"?B.ci:B.ck;b.cd(B);1E(!B.aj)B.bf();B.3w.9s.e4=B.J.cm;1E(B.J.cg){B.3w.9s.e1=B.J.9K+"co";B.3w.9s.dY=B.J.ax;B.3w.9s.dW="dU"}B.cs();B.cv()};u.2V.ck=1L(){1g c=B.3w.7W("2d");B.J.7K.7r(1L(a){c.ap();B.ao(a);c.bp();1g b=B.aV(a.1b);1E(b){B.an(a,b)}6r{aC"cq 8N dM dL as 1b \'"+1b+"\'.";}c.ce();1E(B.J.9y&&B.J.9u>0)c.az()},B)};u.2V.ci=1L(){1g d=B.3w.7W("2d");B.J.9x.7r(1L(c){d.ap();c.7K.7r(1L(a){1g b=B.aW(a);1E(b){B.ao(b)}6r{aC"cq as 1b \'"+a+"\' dH dG.";}},B);d.bp();B.an(c,c);d.ce();1E(B.J.9y&&B.J.9u>0)d.az()},B)};u.2V.ao=1L(b){b.1Z.7r(1L(p){1g a={X:0,Y:0};1E(B.J.9f){a={X:a.X+(B.9J(p)?B.7E.bg:-B.7E.2F),Y:a.Y+(B.9J(p)?B.7E.bi:0)}}1E("D"5M p)B.aG(p.D,a);1E("8u"5M p){p.8u.7r(1L(s){1E("D"5M s)B.aG(s.D,a)},B)}},B)};u.2V.cv=1L(){1E(!B.J.9S&&!B.J.9T)3X;1g f=B.J.9T&&(!B.J.9S||B.J.9t=="8N");1E(f){B.J.9x.7r(1L(d){1g e={x:0,y:0,n:0};d.7K.7r(1L(a){1g b=B.aW(a);1g c=B.b9(b);e.n++;e.x=(e.x*(e.n-1)+c.x)/e.n;e.y=(e.y*(e.n-1)+c.y)/e.n},B);B.ba(d,e)},B)}6r{B.J.7K.7r(1L(a){1g b=B.b9(a);B.ba(a,b)},B)}};u.2V.ba=1L(a,b){1g c=B.3w.7W("2d");1g d=B.9i(a)?a:B.aV(a.1b);1g e=B.J.9T&&(!B.J.9S||B.J.9t=="8N");c.dy();1E(B.J.9k&&B.J.9k=="dw"){1g f;1E(e==(B.J.9t=="8N")){f=B.9l==a.1b}6r 1E(e){f=d.7K.8X(B.9l)>-1}6r{f=B.9l==d.1b}1g g=d.6I?d.6I:B.J.6I;1g h=d.6I&&d.7O?d.7O:d.6I?B.af(d.6I,0.2):B.J.7O?B.J.7O:B.af(B.J.6I,0.2);c.8c=f?h:g}6r 1E(B.J.9k){c.8c=B.J.9k}6r{c.8c=B.J.6I}c.9X=(B.J.aI?B.J.aI:B.3w.2F/7u)+"co \'"+(B.J.9X?B.J.9X:"c4")+"\'";c.di=\'f9\';c.df=\'de\';1E(B.J.aN){c.d8=B.J.aN;c.d5=5}8z(1g i=0;i<5;i++)c.d3(B.bd(a),b.x*B.3w.2F/B.3Y.2F,b.y*B.3w.2U/B.3Y.2U);c.cZ()};u.2V.b9=1L(a){1g b={x:0,y:0,n:0};1g c={X:0,Y:0};c3(a.C){4X"北海道":c.X=10;c.Y=-5;5J;4X"宮城県":c.Y=5;5J;4X"山形県":c.Y=-5;5J;4X"埼玉県":c.Y=-3;5J;4X"神奈川県":c.Y=2;5J;4X"千葉県":c.X=7;5J;4X"石川県":c.Y=-5;5J;4X"滋賀県":c.Y=5;5J;4X"京都府":c.Y=-2;5J;4X"兵庫県":c.Y=4;5J;4X"三重県":c.Y=-5;5J;4X"広島県":c.Y=-3;5J;4X"島根県":c.X=-5;5J;4X"高知県":c.X=5;5J;4X"福岡県":c.Y=-5;5J;4X"長崎県":c.Y=5;5J}1g d=a.1Z[0];1E(B.J.9f){c={X:c.X+(B.9J(d)?B.7E.bg:-B.7E.2F),Y:c.Y+(B.9J(d)?B.7E.bi:0)}}1E("D"5M d){1g i=0;bs(9R){1g x=d.D[i*2+0];1g y=d.D[i*2+1];1E(9D x==="8t"||9D y==="8t")5J;x=x+c.X;y=y+c.Y;b.n++;b.x=(b.x*(b.n-1)+x)/b.n;b.y=(b.y*(b.n-1)+y)/b.n;i++}}3X b};u.2V.aG=1L(a,b){1g c=B.3w.7W("2d");1g i=0;bs(9R){1g x=a[i*2+0];1g y=a[i*2+1];1E(9D x==="8t"||9D y==="8t")5J;x=x+b.X;y=y+b.Y;1E(i==0){c.bt(x*B.3w.2F/B.3Y.2F,y*B.3w.2U/B.3Y.2U)}6r{c.bb(x*B.3w.2F/B.3Y.2F,y*B.3w.2U/B.3Y.2U)}i++}};u.2V.cs=1L(){1g a=B.3w.7W("2d");1E(B.J.9f){a.ap();a.bt(0,8j*B.3w.2U/B.3Y.2U);a.bb(6c*B.3w.2F/B.3Y.2F,8j*B.3w.2U/B.3Y.2U);a.bb(4g*B.3w.2F/B.3Y.2F,0);a.cu=B.J.ax;a.9K=B.J.9K;a.az()}};u.2V.an=1L(a,b){1g c=B.3w.7W("2d");c.8c=("6I"5M b)?b.6I:B.J.6I;1E(B.J.9y)c.cu=B.J.9y;1E(B.J.9u)c.9K=B.J.9u;1g d=B.7o&&c.dA(B.7o.x,B.7o.y);1E(d){B.aj=9R;B.9l=a.1b;1E(B.6D.1b!=a.1b&&B.J.aO){B.ab(a,b);B.J.aO(B.6D)}6r{B.ab(a,b)}1E(b.7O)c.8c=b.7O;6r 1E(B.J.7O)c.8c=B.J.7O;6r c.8c=B.af(c.8c,0.2)}B.3w.9s.dz=(B.6D.1b==3D)?"c7":"7o"};u.2V.b0=1L(){3X B.aj};1g w=[{"1b":0,"C":"日本","ah":"dv","6I":"#au","7K":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47]}];1g z=[{"1b":1,"C":"北海道","1Z":[{"D":[1Y,92,1Y,93,1Y,95,1Y,97,2N,99,1T,7u,2N,aw,1Y,7S,2B,7S,2B,9O,2S,8y,3I,9v,3T,9M,4w,ct,4w,cr,4w,cp,3T,7J,3T,7J,3I,7J,3E,8D,3E,cn,3E,av,3E,9A,3I,8g,3T,8g,5x,8g,3G,8g,3b,9A,4k,9A,3r,cn,3r,ch,4O,ch,6e,8D,3O,8D,2Z,7J,2Z,aB,3p,7J,4d,7J,4d,9B,4d,9B,3p,9B,3y,9B,2v,9B,3z,8D,3d,8D,5N,8D,6j,7J,4F,7J,4t,7J,4t,aB,4F,aB,4F,dB,5N,cp,3z,cr,2v,ct,2v,aE,3y,9M,3y,9v,3p,9v,3p,8y,2Z,8y,3O,8y,3r,7S,3b,7T,2o,aw,2o,7u,3b,96,4k,95,6e,93,2Z,93,4d,93,3p,94,3y,95,3y,95,1k,96,2v,97,3z,99,3z,99,3z,99,3z,99,3z,7u,3z,7u,3d,7u,3d,7u,5N,99,6j,97,4F,96,5v,96,5v,95,6d,92,7v,92,7a,93,5w,95,9d,97,9e,99,9V,7u,9Y,7u,c0,7T,bX,7T,cG,7S,bV,9O,bU,9O,em,8y,8J,9M,9Z,aE,9Z,aE,bj,9v,9z,8y,9z,7T,9z,aw,bj,98,e9,95,7g,91,7X,89,a1,81,aY,80,8o,80,aZ,78,bo,78,dr,79,dC,79,dD,79,bF,79,a2,79,bD,79,a2,79,a2,78,7N,76,7N,76,bC,76,bC,76,7N,76,7N,76,7N,77,7N,77,7N,78,bB,78,bB,78,7G,78,7G,77,8Q,77,8Q,76,7D,76,7D,75,8m,75,7D,75,7D,74,8m,73,8m,73,9H,73,bz,72,b8,72,8d,71,8d,72,8d,72,8Z,71,8Z,70,8Z,70,be,69,be,68,9j,68,8T,67,8T,67,9p,66,8S,66,9p,65,bz,67,9H,65,8m,61,7D,60,8Q,59,8Q,59,7G,58,7G,57,7G,55,7G,54,7G,53,7G,52,7D,50,7D,48,8m,46,9H,44,9H,43,9H,42,8m,41,8m,41,7D,42,7D,43,8Q,43,8Q,44,7G,46,7N,48,7N,49,bD,50,a2,51,bF,52,dj,53,aZ,53,bk,52,bk,51,8o,50,8o,49,aY,49,aY,50,a1,51,a1,51,a1,50,ds,49,8v,48,8v,48,8v,48,8v,49,8v,50,a9,49,8x,49,7X,49,7X,49,7g,47,7X,47,7X,47,dK,43,8J,43,dO,42,bU,41,bV,39,dP,39,dT,37,bX,35,c0,35,e6,32,9Y,31,9V,30,9V,30,9e,29,9e,28,bh,27,aa,25,6L,22,6C,18,6K,16,7L,16,7v,15,4L,14,5R,15,5R,16,3R,17,3R,17,5E,16,6d,16,6d,17,6d,19,6d,20,6Y,21,6d,25,3J,34,3J,39,3J,41,3J,43,3R,44,3R,44,3R,45,5E,46,5E,46,5E,50,3R,52,3R,54,5E,55,5E,55,5E,56,6d,58,6Y,58,7e,59,5m,60,5m,61,5v,62,5m,63,5m,64,5m,64,5m,65,5m,66,5m,67,ad,69,7e,71,5m,75,4t,77,6j,77,5N,77,5N,76,3d,75,3d,75,2v,75,1k,76,3y,76,3p,76,2Z,74,2Z,74,3O,73,6e,73,3r,71,3r,72,3r,72,4k,72,3b,73,3b,74,2o,75,3b,77,4k,77,3r,79,3r,79,4O,81,3r,82,3b,84,2o,85,2o,87,3G,87,5x,86,4w,87,4w,88,3T,89,3I,89,3E,90,2B,90,1Y,91,1Y,91,1Y,92,1Y,92]},{"C":"礼文島","D":[3d,19,3z,20,3z,20,3z,20,3z,19,2v,18,2v,16,3z,15,3d,19,3d,19]},{"C":"利尻島","D":[6j,21,4F,21,4t,22,5v,23,4t,25,6j,24,5N,23,6j,21,6j,21]},{"C":"奥尻島","D":[4M,7T,4M,7S,2W,9O,2W,9v,3N,9M,2T,8y,2T,7S,3N,7S,3N,7S,2W,7T,4M,7T,4M,7T]},{"C":"北方領土","8u":[{"C":"択捉島","D":[b6,2,bE,1,9I,1,dn,2,9I,3,9I,3,9I,4,9I,6,bE,7,bM,8,aU,9,aU,9,aU,9,bN,11,bO,12,bP,13,bP,13,dF,16,bR,18,aQ,19,ag,19,ag,19,c1,19,aK,18,aJ,19,aK,20,aJ,22,dZ,23,c6,25,cb,28,ai,30,ak,31,9m,31,9n,33,8I,34,7F,35,8G,34,8G,33,7F,32,7F,31,8G,30,7F,29,7F,30,8I,31,8I,30,8I,29,9n,29,9m,29,9m,28,ak,27,ak,26,9m,26,9n,26,9n,25,9m,24,ak,25,ai,24,ai,23,ai,23,cb,22,cF,20,c6,19,cl,18,cl,16,aJ,16,aK,15,c1,13,ag,12,aQ,10,ag,9,aQ,7,cM,7,cW,9,bR,10,bO,9,bN,8,at,6,at,6,at,6,bM,3,b6,2,b6,2]},{"C":"歯舞島","D":[al,61,8F,63,aA,62,aA,61,8F,60,al,61,al,61]},{"C":"色丹島","D":[7F,50,8I,50,9n,51,7F,52,8G,52,8I,53,8G,53,bY,55,bu,55,br,54,br,53,bu,52,bY,51,8G,50,7F,50,7F,50]},{"C":"国後島","D":[8F,36,bl,37,bS,35,bS,38,dJ,38,bl,38,bn,38,bn,39,al,40,8F,41,dN,41,am,42,a8,43,a8,44,dQ,45,8S,45,8S,45,8S,46,9p,47,8S,48,9p,48,9p,48,8T,50,9j,51,8Z,52,8Z,53,8d,55,8d,59,8d,58,8d,57,dS,57,bq,57,b8,56,b8,54,bq,52,8d,50,be,48,9j,48,9j,46,9j,45,8T,44,8T,43,8T,43,8S,41,a8,37,a8,36,am,35,am,35,aA,35,8F,36,8F,36]}]}]},{"1b":2,"C":"青森県","1Z":[{"D":[7e,a7,6Y,8g,6d,8g,6d,a7,6Y,a6,6Y,8A,5E,7z,3R,7y,3J,7y,5R,8E,4L,6c,4L,3v,4L,3v,4L,3v,3J,3F,3R,4Y,5E,4Y,6d,4Y,7e,6v,7e,6v,ad,6v,5v,9c,4F,8C,5N,7w,3d,7w,3d,9c,3d,6v,3d,3F,3d,3F,3z,3F,2v,6c,1k,6c,1k,3v,3y,3v,3p,3F,4d,3F,2Z,3F,3O,3F,3r,3v,3r,6c,3b,6c,3b,3v,3b,3v,4w,3F,3T,3v,3I,3v,3E,3v,3E,3F,3E,3F,2S,6c,2S,7y,2B,7z,2B,7y,1Y,7z,2B,a4,2S,a3,2S,b7,3I,8A,3T,8A,4w,b5,5x,8A,3G,8A,2o,8H,2o,aX,3b,7V,3b,7V,3b,aX,4k,7V,4k,7V,3r,7V,3b,7V,3b,aT,3b,aT,3b,c5,3G,c5,5x,9o,3G,9o,2o,9o,3b,8L,3b,8L,3b,9W,4k,9W,3r,8L,4O,8L,6e,8L,2Z,9U,2Z,aT,4d,ca,3p,ay,1k,8k,2v,8H,2v,8H,1k,cf,2v,7V,3d,aX,3d,cf,5N,8H,5N,8H,4F,ca,5v,8H,5v,7V,5m,9o,5v,9W,4t,a6,4t,a6,4t,a6,4F,8L,3d,9U,2v,9U,3y,9o,3y,9U,3y,9W,1k,8g,2v,cj,2v,9A,2v,av,3z,av,3d,9A,4F,cj,4t,8g,5m,dR,7e,a7,7e,a7]}]},{"1b":3,"C":"岩手県","1Z":[{"D":[4L,3v,4L,3v,3J,3F,3R,4Y,5E,4Y,6d,4Y,7e,6v,7e,6v,ad,6v,5v,9c,4F,8C,5N,7w,3d,7w,2v,8P,2v,8O,2v,8i,3z,6U,1k,6U,1k,6U,1k,7U,2v,9Q,2v,9Q,1k,9P,1k,9C,1k,9C,2v,83,1k,9N,3y,8Y,3y,8Y,3y,9E,3p,8q,3p,9G,4d,9b,3p,8U,3p,ae,3p,8W,1k,7B,1k,7B,1k,7x,1k,7x,3y,6W,3y,5W,1k,6X,1k,6X,1k,6p,1k,3U,1k,3U,1k,3U,1k,3U,1k,3U,2v,5I,3d,5I,5N,4B,4F,4B,4t,4B,4t,4Q,4t,4x,5v,6b,5m,6b,5m,6b,5m,7R,7e,4x,6Y,4x,6Y,4x,6d,6b,5E,6b,5E,4x,3R,5I,3R,3U,3R,6J,4L,3U,4L,6J,4L,6J,7v,6J,7v,3U,7L,3U,7L,3U,6K,6J,7L,6p,7L,6X,6C,6p,7a,6X,5w,6X,6C,5W,7a,5W,6C,5W,5w,5W,5w,5W,5w,6W,6C,7x,5w,7x,5w,7B,5w,7B,6F,7h,6F,7h,5w,7h,5w,8W,6F,8W,5w,ae,6F,ae,6L,8U,6F,8U,5w,8U,6F,9b,6F,9b,6F,9G,6L,9G,6L,9G,7P,8q,7P,8q,6L,8q,5w,8q,6L,9E,7P,9E,7P,8Y,6L,9N,6L,aF,6L,83,6L,83,6F,aF,6F,9P,6F,7U,6F,8i,5w,9q,5w,8O,5w,aH,5w,8s,6C,8s,6C,8s,6C,8K,6K,8P,7a,aM,7a,aM,7a,bT,6K,7w,6K,7w,6K,8C,7L,4Y,7v,3v,4L,3v,4L,3v,4L,3v]}]},{"1b":4,"C":"宮城県","1Z":[{"D":[3R,3U,3R,6J,4L,3U,4L,6J,7v,4Q,4L,5I,5R,4Q,4L,4x,3J,4x,3J,6b,3J,6b,5R,7b,5R,7b,5R,7b,3J,7b,3J,7b,5E,8j,3R,7i,3J,7i,3J,7Z,3R,9h,3J,7C,3J,9h,5R,7C,5R,5A,3J,5A,3J,5A,3J,5A,3J,6O,3J,6O,3R,6n,3J,6n,5R,6n,3J,5c,3J,5c,3J,5c,5R,4i,3J,4i,3R,4i,3R,4i,3R,6a,5E,6a,5E,5c,5E,5c,6d,5c,ad,6n,5m,5c,5m,4i,4t,4i,4t,6a,5v,6a,4t,5c,4F,6a,4F,6a,4F,4i,4F,4i,4t,4i,4t,4i,4F,6Q,5N,6S,5N,6x,3d,6x,3z,6x,3z,7j,3z,4j,2v,5U,1k,5U,2v,5U,3y,5U,3p,7j,2Z,6x,6e,6x,4O,6x,4O,5O,4O,3j,3r,3j,4k,3j,4k,3j,2o,3j,2o,3j,2o,3j,2o,4H,2o,4H,2o,6z,3b,6z,3r,6f,3r,6k,4O,6G,4O,7k,4O,6H,6e,4i,6e,4i,3O,4i,3O,6a,2Z,5c,2Z,6O,2Z,5A,3O,7C,3O,7i,2Z,7i,2Z,7i,2Z,8j,4d,7R,2Z,4x,3O,4Q,3O,4B,4d,4B,3p,5I,3y,5I,1k,3U,1k,3U,1k,3U,1k,3U,2v,5I,3d,5I,5N,4B,4F,4B,4t,4B,4t,4Q,4t,4x,5v,6b,5m,6b,5m,6b,5m,7R,7e,4x,6Y,4x,6Y,4x,6d,6b,5E,6b,5E,4x,3R,5I,3R,3U,3R,3U]}]},{"1b":5,"C":"秋田県","1Z":[{"D":[3d,3F,3d,6v,3d,9c,3d,7w,2v,8P,2v,8O,2v,8i,3z,6U,1k,6U,1k,6U,1k,7U,2v,9Q,2v,9Q,1k,9P,1k,9C,1k,9C,2v,83,1k,9N,3y,8Y,3y,8Y,3y,9E,3p,8q,3p,9G,4d,9b,3p,8U,3p,ae,3p,8W,1k,7B,1k,7B,1k,7x,1k,7x,3y,6W,3y,5W,1k,6X,1k,6X,1k,6p,1k,3U,1k,3U,1k,3U,1k,3U,3y,5I,3p,5I,4d,4B,3O,4B,3O,4B,6e,4B,4O,5I,3r,3U,3r,3U,4k,6J,4k,6J,4k,6p,3b,6p,3b,6J,3G,6p,3G,6p,5x,6X,4w,6p,3T,6X,3I,5W,3I,5W,2S,5W,2B,5W,2B,5W,2B,6W,2B,7x,2B,7x,2B,7B,2B,7h,2S,8W,3E,8U,3I,9P,3E,7U,2S,8i,3E,8i,3I,6U,3I,9q,3E,9q,3E,9q,2S,8O,2S,8s,3E,8K,2S,aH,2S,8O,2S,8i,1Y,6U,2N,6U,1T,6U,2r,8i,2r,aH,1T,8O,2N,9q,2S,8K,3E,8C,3E,4Y,2S,3F,2S,3F,3E,3F,3E,3F,3E,3v,3I,3v,3T,3v,4w,3F,3b,3v,3b,3v,3b,6c,3r,6c,3r,3v,3O,3F,2Z,3F,4d,3F,3p,3F,3y,3v,1k,3v,1k,6c,2v,6c,3z,3F,3d,3F,3d,3F,3d,3F]}]},{"1b":6,"C":"山形県","1Z":[{"D":[3O,4B,6e,4B,4O,5I,3r,3U,3r,3U,4k,6J,4k,6J,4k,6p,3b,6p,3b,6J,3G,6p,3G,6p,5x,6X,4w,6p,3T,6X,3I,5W,3I,5W,2S,5W,2B,5W,2B,5W,1Y,6p,2N,4B,1T,4x,3e,7b,4M,7Z,2W,9h,2W,7C,4M,7C,3e,5A,2r,5A,2r,6O,2r,5c,1T,6a,1Y,4i,1Y,6H,1T,6S,3e,6S,3e,6G,3e,6f,2C,3j,2C,5O,2C,7j,3e,4j,2r,4j,1T,4j,1T,4j,2N,4j,1Y,4j,2B,4j,2S,4j,2S,5U,3E,5i,3I,5i,3I,5i,3I,5i,3T,6q,4w,5i,5x,5i,3G,5i,2o,5U,2o,4j,2o,3j,2o,3j,2o,3j,2o,3j,2o,4H,2o,4H,2o,6z,3b,6z,3r,6f,3r,6k,4O,6G,4O,7k,4O,6H,6e,4i,6e,4i,3O,4i,3O,6a,2Z,5c,2Z,6O,2Z,5A,3O,7C,3O,7i,2Z,7i,2Z,7i,2Z,8j,4d,7R,2Z,4x,3O,4Q,3O,4B,3O,4B,3O,4B]}]},{"1b":7,"C":"福島県","1Z":[{"D":[2v,5U,3z,4j,3z,7j,3z,6x,3d,6x,5N,6x,6j,5i,6j,6s,4F,6w,4F,4s,4F,3B,4F,3A,6j,2X,6j,2m,6j,1C,5N,1C,3d,1C,3z,1K,2v,2e,1k,2e,3p,2e,4d,1K,2Z,1C,2Z,2e,3O,1N,6e,1e,4O,1e,4k,1N,2o,1C,3G,2m,3G,2m,5x,2n,5x,2n,4w,5a,2B,3Z,2N,5a,2r,2n,4M,2m,2T,3k,4h,1C,4o,1K,4b,1C,4b,2m,4b,5a,4b,3Z,7l,3A,6Z,2q,7l,2P,4b,3o,4b,2h,4b,4P,4b,4s,5f,4s,4o,3n,4h,4z,2T,4z,2W,3n,2W,4l,2W,6w,2W,5k,4M,5k,2C,6s,2C,6q,3e,5i,2r,5U,2r,4j,2r,4j,1T,4j,1T,4j,2N,4j,1Y,4j,2B,4j,2S,4j,2S,5U,3E,5i,3I,5i,3I,5i,3I,5i,3T,6q,4w,5i,5x,5i,3G,5i,2o,5U,2o,4j,2o,3j,2o,3j,4k,3j,4k,3j,3r,3j,4O,3j,4O,5O,4O,6x,6e,6x,2Z,6x,3p,7j,3y,5U,2v,5U,1k,5U,2v,5U,2v,5U]}]},{"1b":8,"C":"茨城県","1Z":[{"D":[1k,2x,3y,4r,3p,4S,4d,1u,4d,1a,4d,2H,4d,1p,2Z,3q,2Z,2O,4d,4V,3p,4m,3y,4m,3y,2u,1k,1r,2v,1X,3z,2w,3z,2w,2v,2w,1k,1X,3p,H,4d,1r,2Z,2u,3O,2u,6e,1r,4O,2u,3r,1r,4k,1r,4k,1r,3b,H,3G,H,4w,H,4w,H,3T,H,2B,4m,2N,4V,1T,4p,1T,5L,2r,4p,3e,2s,3e,2s,2N,3q,1Y,4n,2B,1p,2S,1p,2S,2H,3I,2H,3I,2H,3T,1a,3T,1a,4w,1a,5x,2H,5x,1a,3G,1u,3G,4S,3G,4S,3G,4J,3G,4r,2o,4u,2o,2x,2o,2j,2o,1e,2o,1N,2o,1C,2o,1C,4k,1N,4O,1e,6e,1e,3O,1N,2Z,2e,2Z,1C,4d,1K,3p,2e,1k,2e,2v,2e,2v,1e,1k,2x,1k,2x]}]},{"1b":9,"C":"栃木県","1Z":[{"D":[4w,5a,5x,2n,5x,2n,3G,2m,3G,2m,2o,1C,2o,1C,2o,1N,2o,1e,2o,2j,2o,2x,2o,4u,3G,4r,3G,4J,3G,4S,3G,4S,3G,1u,5x,1a,5x,2H,4w,1a,3T,1a,3T,1a,3I,2H,3I,2H,2S,2H,2S,1p,2B,1p,1Y,4n,2N,3q,3e,2s,3e,2s,2C,2O,4M,3q,3N,3q,4h,4n,4o,1p,4o,1J,4o,1u,4h,4S,2T,3x,4h,5V,5f,4J,5f,4u,5f,2x,5f,2j,4o,1e,4o,1N,4o,1N,4o,1K,4o,1K,4h,1C,2T,3k,4M,2m,2r,2n,2N,5a,2B,3Z,4w,5a,4w,5a]}]},{"1b":10,"C":"群馬県","1Z":[{"D":[6Z,3k,7l,1C,4b,1C,4o,1K,4o,1K,4o,1K,4o,1N,4o,1N,4o,1e,5f,2j,5f,2x,5f,4u,5f,4J,4h,5V,2T,3x,4h,4S,4o,1u,4o,1J,4o,1p,4h,4n,3N,3q,4M,3q,2C,2O,3e,2s,4M,2s,3N,2s,2T,2s,5f,2O,5f,2O,8p,2O,6Z,3q,4T,2s,6E,3m,6E,2D,6E,2D,4W,2D,3M,4p,3M,4p,6g,4p,7m,5L,5e,4V,5b,5d,5b,5d,5Y,5d,3L,4p,5Y,4p,3L,2D,6y,2s,3L,3m,3L,2s,3L,2O,3L,3q,3L,4n,5Y,4n,3L,1a,6y,1a,4I,1a,6l,1J,6P,3x,6P,5V,4I,4J,4I,4r,6t,4r,6t,4u,6t,4u,5b,2x,5b,2x,5e,2j,5e,2j,7I,2x,7m,1e,7n,1e,7n,1N,3M,1N,3M,1K,4W,2e,4W,3k,4T,2m,4T,2n,5B,2n,6Z,3k,6Z,3k]}]},{"1b":11,"C":"埼玉県","1Z":[{"D":[5f,2O,5f,2O,8p,2O,6Z,3q,4T,2s,6E,3m,6E,2D,6E,2D,4W,2D,3M,4p,3M,4p,6g,4p,7m,5L,5e,4V,5b,5d,5b,5d,5b,4m,5e,2u,5e,2u,7I,1r,7I,1r,7m,H,7n,H,6g,H,6g,H,6g,H,3M,H,3M,H,3M,1r,3M,1r,4W,1r,4W,1r,4W,1r,4T,H,6Z,H,4b,1X,4b,1X,8p,1X,5f,F,4h,F,3N,F,3N,F,2W,2w,2C,F,2C,F,3e,F,2r,F,1T,1X,1Y,F,1Y,F,1Y,F,1Y,H,1Y,H,1Y,2u,2N,4m,1T,4V,1T,4V,1T,4V,1T,5L,1T,5L,2r,4p,3e,2s,4M,2s,3N,2s,2T,2s,5f,2O,5f,2O]}]},{"1b":12,"C":"千葉県","1Z":[{"D":[3O,2u,6e,1r,4O,2u,3r,1r,4k,1r,4k,1r,3b,H,3G,H,4w,H,4w,H,3T,H,2B,4m,2N,4V,1T,4p,1T,5L,1T,5L,1T,4V,1T,4V,1T,4V,2N,4m,1Y,2u,1Y,H,1Y,F,1Y,F,1Y,F,1Y,2w,2B,2I,1Y,1S,1Y,1S,2B,1S,2S,O,3E,1S,3E,1S,3I,1S,3T,1q,3T,1q,3T,1q,3I,1D,3E,1H,3E,1l,2S,1l,2S,2k,2B,1i,2B,1P,1Y,1P,2N,1P,2N,N,1T,N,2r,N,2N,1B,2N,1x,1Y,1U,2N,1t,2N,T,2N,1f,1T,2J,2N,3f,2N,3f,1T,Q,2r,Q,1T,W,2N,1G,2N,1G,1Y,1G,2S,W,3E,3f,3I,2J,3T,2J,3T,1f,4w,M,5x,M,2o,M,3b,T,3b,M,4k,T,3r,1t,4O,1U,3r,1x,3r,N,4O,1l,2Z,1m,3y,O,1k,O,2v,2I,3z,2I,3d,O,3d,O,3d,2I,3d,2w,3z,2w,3z,2w,2v,2w,1k,1X,3p,H,4d,1r,2Z,2u,3O,2u,3O,2u]}]},{"1b":13,"C":"東京都","1Z":[{"D":[1T,1X,1Y,F,1Y,2w,2B,2I,1Y,1S,1Y,1S,1Y,1S,1Y,1S,1Y,1S,2N,1S,1T,1S,1T,1m,1T,1D,2r,1D,3e,1D,3e,1D,3e,1D,2C,1q,2W,1m,3N,1S,3N,1m,2T,1m,4h,1m,2T,1m,2T,1q,2T,1q,2T,1q,2T,1D,2T,1H,4h,1H,8p,1m,5B,O,5B,O,5B,O,5B,O,5B,O,4T,O,3M,F,6g,H,6g,H,3M,H,3M,H,3M,1r,3M,1r,4W,1r,4W,1r,4W,1r,4T,H,6Z,H,4b,1X,4b,1X,8p,1X,5f,F,4h,F,3N,F,3N,F,2W,2w,2C,F,2C,F,3e,F,2r,F,1T,1X,1T,1X]},{"C":" 伊豆諸島","8u":[{"C":"三宅島","D":[2W,G,2W,S,3N,1n,2T,1W,4h,1n,4h,S,2T,G,3N,G,2W,G,2W,G]},{"C":"御蔵島","D":[2W,1s,2W,1z,2W,1z,4M,1z,2W,1s,2W,1s]},{"C":"八丈島","D":[1T,2Q,2N,4q,2N,5l,2N,6R,2N,6V,2N,6R,1T,6R,2r,5l,2r,4q,1T,2Q,1T,2Q]},{"C":"神津島","D":[4T,1M,5B,1M,5B,2L,5B,I,4T,I,4T,1M,4T,1M]},{"C":"新島","D":[4b,1h,4b,1F,4b,L,4b,1w,7l,L,7l,1F,7l,1F,4b,1h,4b,1h]},{"C":"大島","D":[4o,U,4h,1o,4h,1d,5f,1d,8p,U,4o,U,4o,U]}]}]},{"1b":14,"C":"神奈川県","1Z":[{"D":[2W,1m,2C,1q,3e,1D,3e,1D,2r,1D,1T,1D,1T,1D,1T,1H,2r,1H,3e,1l,2C,1l,2C,1l,2C,1l,2C,1l,3e,1i,2C,1i,2C,1i,2C,1P,2C,N,2C,N,2C,1B,2C,1B,3e,1x,2r,1x,2r,1U,3e,1t,2C,T,2C,T,2C,M,4M,M,4M,T,4M,1t,4M,1t,4M,1U,2W,1x,2T,1B,2T,1B,4h,N,5f,1B,6Z,1x,5B,1t,5B,T,4W,T,4W,1U,3M,1x,3M,1B,4W,1P,3M,1i,6g,1i,7n,1i,3M,1l,4W,1H,6E,1H,6E,1D,4T,1m,5B,O,5B,O,8p,1m,4h,1H,2T,1H,2T,1D,2T,1q,2T,1q,2T,1q,2T,1m,4h,1m,2T,1m,3N,1m,3N,1S,2W,1m,2W,1m]}]},{"1b":15,"C":"新潟県","1Z":[{"D":[2r,5A,2r,6O,2r,5c,1T,6a,1Y,4i,1Y,6H,1T,6S,3e,6S,3e,6G,3e,6f,2C,3j,2C,5O,2C,7j,3e,4j,2r,4j,2r,5U,3e,5i,2C,6q,2C,6s,4M,5k,2W,5k,2W,6w,2W,4l,2W,3n,2T,4z,4h,4z,4o,3n,5f,4s,4b,4s,4b,4P,4b,2h,4b,3o,7l,2P,6Z,2q,7l,3A,4b,3Z,4b,5a,4b,2m,4b,1C,7l,1C,6Z,3k,5B,2n,4T,2n,4T,2m,4W,3k,4W,2e,3M,1K,3M,1N,7n,1N,7n,1e,7m,1e,7I,2x,5e,2j,5e,2j,5b,2x,5b,2x,5b,2x,5b,1e,5Y,2e,3L,1C,6y,2n,4I,2m,6l,3k,5Q,1C,5Q,1C,5P,1C,5P,2e,5P,1N,4f,2e,6M,1N,6M,1N,8n,2e,8n,1K,8R,1C,a5,1C,8b,1K,8b,1K,8b,2e,9g,1N,9g,1e,5o,1e,5o,1e,5o,1N,5h,1K,5h,1C,5h,3k,5G,3k,5G,2m,5G,2m,5o,2n,cK,5a,8R,5a,8n,2X,6M,3Z,6A,3A,6N,3A,8w,3A,5P,3A,6l,2P,6t,3o,3L,4s,5Y,3n,5b,4l,5e,5C,7I,5k,7m,6q,6g,7j,4T,5O,7l,3j,5f,6z,4h,7k,2T,4i,2T,6n,3N,5A,2W,5A,2W,7C,4M,7C,3e,5A,2r,5A,2r,5A]},{"C":"佐渡島","D":[6t,6Q,6t,4i,6y,4i,6y,6Q,6y,6S,6t,6k,6y,6f,3L,6f,3L,6f,3L,4H,6P,7j,6l,4j,5Q,4j,5P,4j,8w,4j,5P,7j,5Q,7j,5Q,6x,5Q,5O,6l,3j,6l,4H,6l,4H,5Q,4H,5Q,3j,5P,3j,5P,6z,5P,6f,5Q,6k,5Q,7k,6l,6S,4I,6H,6t,6Q,6t,6Q]}]},{"1b":16,"C":"富山県","1Z":[{"D":[2z,1p,2z,1p,5u,1a,5T,1a,5K,1a,5K,2H,5K,1p,5K,1p,5X,1p,5Z,2H,4a,1J,7c,1u,7c,1u,5H,1u,7d,4S,7d,1u,6m,1u,5g,1u,6i,1J,4C,1J,4c,1a,4c,1a,5q,1a,5q,1a,5q,1J,5q,1J,5q,1J,6h,1u,6h,4S,6h,3x,5G,3x,5G,3x,5G,5V,5h,4J,5o,4u,5o,2x,5o,1e,5o,1e,9g,1e,5o,1e,5o,1e,5o,1N,5h,1K,5h,1C,5h,3k,5h,3k,5G,3k,5G,2m,5q,2m,4C,3k,6i,1C,6i,1K,6i,2e,5g,1N,6m,1N,7A,1e,7c,1N,8h,1N,5Z,1K,5Z,1C,4a,3k,4a,2m,5Z,2m,5T,1C,5T,1K,5u,2e,5u,1N,5u,1e,5u,1e,2z,1e,2z,1e,2z,2j,2z,2x,2z,4u,2z,4J,2z,5V,2z,3x,3g,4S,3g,1u,2z,1J,3g,1a,3g,1p,2z,1p,2z,1p,2z,1p]}]},{"1b":17,"C":"石川県","1Z":[{"D":[7d,4P,6m,4P,6m,4P,7A,3o,5H,3o,8h,2P,4a,2q,5Z,2q,5X,2q,5X,2q,5K,3B,5K,3A,5T,3Z,5T,2X,5K,5a,5K,3Z,5X,2X,5Z,2X,5Z,3Z,4a,3Z,4a,2X,4a,5a,4a,2m,4a,2m,4a,2m,5Z,2m,5T,1C,5T,1K,5u,2e,5u,1N,5u,1e,2z,1e,2z,1e,2z,2j,2z,2x,2z,4u,2z,4J,2z,5V,2z,3x,3g,4S,3g,1u,2z,1J,3g,1a,3g,1p,2z,1p,2z,1p,2z,1p,2z,1p,2z,1p,2z,4n,2z,4n,3g,2s,4D,3m,4D,3m,7Y,2D,4R,3m,3C,2s,7H,2s,7s,2O,7s,2O,7p,2s,7M,2O,4K,3q,4N,1p,5y,2H,5y,2H,4N,1a,7M,1J,7s,3x,8B,4J,4R,2x,7Y,2j,4D,1N,3g,3k,3g,2m,2z,2n,3g,2X,3g,3A,4D,3B,3g,3o,3g,2h,2z,4P,5u,4s,5T,4s,5T,3n,5K,3n,5X,3n,5X,3n,7c,4z,7c,4l,7A,4l,6m,5C,6i,4l,6i,3n,5g,3n,6m,3n,7d,4P,7d,4P]},{"C":"能登島","D":[4a,3B,4a,3B,4a,3A,5X,3Z,5X,3A,5K,3B,5X,3A,5X,3A,5X,3A,5X,3B,5Z,3A,4a,3B,4a,3B]}]},{"1b":18,"C":"福井県","1Z":[{"D":[4N,1p,4K,3q,7M,2O,7p,2s,7s,2O,7s,2O,7H,2s,3C,2s,4R,3m,7Y,2D,4D,3m,7Y,4p,7Y,5d,3g,5d,3g,2u,4D,1r,4R,H,3C,H,3C,1r,7M,H,4N,H,5y,1X,5y,F,5y,F,6T,2w,8a,F,3P,F,3P,2w,4G,O,5s,1S,4y,1S,2A,1m,5j,1m,5p,1D,3l,1H,3h,1H,3K,1l,5D,1H,4E,1D,4E,1q,2M,1q,2M,1m,2M,1S,2M,O,4E,2I,4E,O,4E,O,4E,O,4E,O,4E,1S,3S,1S,5F,O,5F,1S,5D,1m,5F,1m,4Z,1m,3K,1S,3K,1S,3K,2I,4Z,2I,3l,1S,3h,O,3l,2I,3l,O,3l,2I,3l,2w,3l,2w,3h,2w,3l,F,3l,2w,5p,2I,5p,2w,5j,2I,2p,2w,2p,F,2p,1X,2p,1X,2A,H,4y,H,4y,1X,4y,F,4y,F,5s,F,5s,H,4y,4m,2A,5d,2A,4V,2A,5L,2A,5L,2A,4p,5s,2s,3P,3q,3P,1p,6T,2H,5y,2H,5y,2H,4N,1p,4N,1p]}]},{"1b":19,"C":"山梨県","1Z":[{"D":[7n,H,7m,H,7I,1r,7I,1r,5e,2u,5e,2u,5e,2u,5b,1r,5Y,1r,3L,1r,6y,2u,4I,2u,6P,2u,6P,4m,6l,4m,5P,4m,8w,1r,6N,1r,4f,1X,4f,F,4f,F,6A,2w,6A,2I,4f,O,4f,O,4f,O,4f,O,6N,1m,6N,1q,6N,1l,6N,1P,6N,N,8w,N,5P,N,5Q,1B,5Q,1U,6l,1t,6P,1t,4I,1U,4I,1B,6t,2k,6y,1i,3L,1i,5Y,1i,5Y,1P,5Y,1P,5e,1P,6g,1i,6g,1i,7n,1i,3M,1l,4W,1H,6E,1H,6E,1D,4T,1m,5B,O,5B,O,4T,O,3M,F,6g,H,7n,H,7n,H]}]},{"1b":20,"C":"長野県","1Z":[{"D":[4I,2m,6y,2n,3L,1C,5Y,2e,5b,1e,5b,2x,6t,4u,6t,4u,6t,4r,4I,4r,4I,4J,6P,5V,6P,3x,6l,1J,4I,1a,6y,1a,3L,1a,5Y,4n,3L,4n,3L,3q,3L,2O,3L,2s,3L,3m,6y,2s,3L,2D,5Y,4p,3L,4p,5Y,5d,5e,2u,5Y,1r,3L,1r,6y,2u,4I,2u,6P,2u,6P,4m,6l,4m,5P,4m,8w,1r,6N,1r,4f,1X,4f,F,4f,F,6A,2w,6A,2I,4f,O,4f,O,4f,O,4f,1S,4f,1m,6A,1m,6A,1m,6A,1D,6A,1H,6M,1l,6M,1l,6M,1l,6M,2k,8n,1P,8R,1P,a5,N,8b,1B,5o,1x,5h,1U,5G,1x,6h,1x,5q,1x,3W,1x,4C,1B,4C,N,3W,N,3W,N,3W,N,3W,1P,3W,1i,3W,2k,4c,2k,4c,1l,4c,1H,4c,1q,3W,1q,4C,1q,4C,O,4C,2I,6i,F,5g,1X,7d,H,6m,1r,5g,4m,6i,2u,4C,4m,4C,5d,4c,4V,4c,4p,3W,2D,4c,2s,4c,2O,5q,3q,6h,1p,6h,2H,5q,1a,5q,1a,5q,1a,5q,1J,5q,1J,6h,1u,6h,4S,6h,3x,5G,3x,5G,3x,5G,5V,5h,4J,5o,4u,5o,2x,5o,1e,5o,1e,9g,1e,9g,1N,8b,2e,8b,1K,8b,1K,a5,1C,8R,1C,8n,1K,8n,2e,6M,1N,6M,1N,4f,2e,5P,1N,5P,2e,5P,1C,5Q,1C,5Q,1C,6l,3k,4I,2m,4I,2m]}]},{"1b":21,"C":"岐阜県","1Z":[{"D":[6m,1u,7d,1u,7d,4S,5H,1u,7c,1u,4a,1J,5Z,2H,5X,1p,5K,1p,5K,1p,5K,2H,5K,1a,5T,1a,5u,1a,2z,1p,2z,1p,2z,1p,2z,4n,2z,4n,2z,4n,3g,2s,4D,3m,4D,3m,7Y,4p,7Y,5d,3g,5d,3g,2u,4D,1r,4R,H,3C,H,3C,1r,7M,H,4N,H,5y,1X,5y,F,5y,F,6T,2w,6T,2I,5y,O,4N,1m,4K,1S,4K,1m,4K,1H,4N,1i,4K,1B,4K,N,4K,1B,7M,N,7p,N,7s,1B,7H,1x,8B,1U,3C,1t,3C,1t,3C,1U,3C,1B,3C,N,3C,N,4R,1i,4D,2k,5u,1l,5T,1l,5T,1l,5K,2k,5X,1i,5Z,1P,4a,N,8h,N,7c,N,7A,N,7d,1B,6m,1B,5g,1x,6i,1B,3W,N,3W,N,3W,N,3W,1P,3W,1i,3W,2k,4c,2k,4c,1l,4c,1H,4c,1q,3W,1q,4C,1q,4C,O,4C,2I,6i,F,5g,1X,7d,H,6m,1r,5g,4m,6i,2u,4C,4m,4C,5d,4c,4V,4c,4p,3W,2D,4c,2s,4c,2O,5q,3q,6h,1p,6h,2H,5q,1a,5q,1a,4c,1a,4c,1a,4C,1J,6i,1J,5g,1u,6m,1u,6m,1u]}]},{"1b":22,"C":"静岡県","1Z":[{"D":[3L,1i,6y,1i,6t,2k,4I,1B,4I,1U,6P,1t,6l,1t,5Q,1U,5Q,1B,5P,N,8w,N,6N,N,6N,1P,6N,1l,6N,1q,4f,O,4f,O,4f,O,4f,O,4f,1S,4f,1m,6A,1m,6A,1m,6A,1D,6A,1H,6M,1l,6M,1l,6M,1l,6M,2k,8n,1P,8R,1P,a5,N,8b,1B,5o,1x,5h,1U,5h,1t,5o,1t,5h,T,5h,T,5G,M,5G,M,6h,1f,5q,3f,4c,Q,4c,W,3W,1G,4C,2b,6i,2b,5g,2f,5g,1d,5g,1d,5g,1d,4C,1d,4C,1o,4C,2f,4C,1j,4C,U,3W,2f,4c,1j,3W,2f,3W,1o,4c,U,3W,1o,3W,1d,4c,1d,6h,1R,5h,1R,8R,1R,4f,1O,4f,R,6A,1R,4f,1o,6N,U,8w,2f,5P,2b,5Q,1G,6l,W,6P,Q,4I,Q,4I,3f,4I,3f,4I,3f,4I,2J,4I,2J,6t,1f,3L,M,5b,M,7m,1f,7m,3f,7I,3f,5e,3f,5e,1G,5e,1j,5b,2f,5e,U,5b,U,5b,1o,5b,1d,5b,1d,5e,1R,5e,R,7I,1O,7m,1O,6g,1R,3M,1R,3M,1R,4W,1o,6E,U,6E,2f,4T,1j,5B,2b,5B,W,4T,Q,4T,Q,4T,3f,6E,2J,4T,M,4W,T,4W,1U,3M,1x,3M,1B,4W,1P,3M,1i,6g,1i,6g,1i,5e,1P,5Y,1P,5Y,1P,5Y,1i,3L,1i,3L,1i]}]},{"1b":23,"C":"愛知県","1Z":[{"D":[3W,1x,5q,1x,6h,1x,5G,1x,5h,1U,5o,1x,5h,1U,5h,1t,5o,1t,5h,T,5h,T,5G,M,5G,M,5G,M,6h,1f,5q,3f,4c,Q,4c,W,3W,1G,4C,2b,6i,2b,5g,2f,5g,1o,5g,1d,5g,1d,5g,1d,5g,1d,4a,R,5T,R,5K,1d,5X,1d,5Z,1d,8h,1o,7c,1o,5H,U,5H,U,5H,1o,5H,1o,5H,1o,5H,U,5H,U,5H,1j,7c,1j,8h,1j,4a,1j,4a,2f,5Z,1j,5K,1j,5T,1j,5u,2b,5u,1G,5u,Q,2z,W,2z,2b,5u,2f,5u,1o,4D,2f,4D,1j,3g,2b,4D,W,4D,3f,3g,1f,3g,M,4D,1f,4D,1f,4D,M,7Y,M,4R,M,4R,M,4R,T,3C,1t,3C,1t,3C,1t,3C,1U,3C,1B,3C,N,3C,N,4R,1i,4D,2k,5u,1l,5T,1l,5T,1l,5K,2k,5X,1i,5Z,1P,4a,N,8h,N,7c,N,7A,N,7d,1B,6m,1B,5g,1x,6i,1B,3W,N,4C,N,4C,1B,3W,1x,3W,1x]}]},{"1b":24,"C":"三重県","1Z":[{"D":[4R,1f,3C,M,3C,1f,3C,1f,8B,2J,8B,3f,7H,W,7s,2b,7p,2f,7p,U,7p,1o,7p,1d,7H,R,4R,1O,4D,1c,3g,P,2z,P,3g,1y,3g,1y,3g,1h,4D,1h,3g,1h,3g,1h,3g,1F,4D,L,3g,L,4D,1w,3C,1w,3C,L,4R,L,3C,L,4R,L,3C,L,8B,L,8B,1F,7H,1F,7H,1F,7H,L,7s,L,7s,1w,7p,1w,7p,L,7M,1w,7M,L,4K,L,4K,1M,4N,1w,4N,1w,4N,V,8a,V,3P,1M,3P,1M,4G,1M,3P,2L,3P,I,3P,K,4G,I,5s,K,5s,K,4G,K,4G,G,3P,G,4G,G,4G,G,4G,1n,5s,1n,5s,1W,4y,1n,4y,1n,4y,1A,4y,1W,2A,1W,2A,1A,2p,1A,5j,3c,5p,1z,3l,1s,3h,1s,3h,1s,3K,3c,3K,1A,4Z,1n,4Z,1n,3h,1n,3h,1n,3l,1n,3l,S,3l,S,5p,G,5j,K,2p,G,2A,G,2p,K,2p,I,2p,I,2p,1M,2p,V,2A,L,2A,1F,2A,1F,2A,1h,2p,P,4y,E,4G,1c,5s,1O,2A,1R,2p,1d,2A,1o,2p,U,2p,U,2A,U,2p,2f,2A,1j,2p,1j,2p,2b,2p,1G,2A,1G,4y,Q,2A,Q,2A,Q,5s,Q,4G,Q,3P,W,8a,Q,5y,3f,4N,M,4K,1U,4K,1B,4K,1B,4K,N,4K,1B,7M,N,7p,N,7s,1B,7H,1x,8B,1U,3C,1t,3C,1t,3C,1t,4R,T,4R,M,4R,M,4R,M,4R,1f,4R,1f]}]},{"1b":25,"C":"滋賀県","1Z":[{"D":[4G,F,3P,F,3P,F,3P,F,3P,F,3P,F,3P,F,6T,F,6T,F,6T,2w,6T,2w,6T,2w,6T,2I,5y,O,4N,1m,4K,1S,4K,1m,4K,1H,4N,1i,4K,1B,4K,1B,4K,1U,4N,M,5y,3f,8a,Q,3P,W,4G,Q,5s,Q,2A,Q,2A,Q,4y,Q,2A,1G,2p,1G,2p,2b,5j,1G,2p,1G,5j,W,5p,Q,5p,Q,3l,Q,3h,2J,3h,1f,4Z,1t,3h,1B,3h,N,3h,1i,3K,1l,3h,1H,3l,1H,5p,1D,5j,1m,2A,1m,4y,1S,5s,1S,4G,O,3P,2w,4G,F,4G,F,4G,F,4G,F]}]},{"1b":26,"C":"京都府","1Z":[{"D":[2M,1S,2M,1m,2M,1q,4E,1q,4E,1D,5D,1H,3K,1l,3K,1l,3h,1i,3h,N,3h,1B,4Z,1t,3h,1f,3h,2J,3l,Q,5p,Q,5p,Q,5j,W,2p,1G,5j,1G,2p,2b,2p,1j,5j,1j,3l,2b,3l,1j,4Z,1j,3K,1j,5F,1G,5F,1G,5D,Q,3S,2J,3H,1f,3H,1f,4E,1f,4E,2J,2M,1f,2M,M,5r,M,4e,T,2G,T,2G,1t,2G,1t,4e,1U,2G,1x,2G,1B,5z,1B,5z,N,6B,N,4v,N,4v,N,4v,1P,4v,1P,4A,1i,2Y,1i,5t,1i,2R,1l,3u,1D,3V,1q,5t,1q,5t,1S,2Y,2I,3V,2I,2R,O,3u,2w,3u,F,3u,1X,3u,H,2R,1X,3V,H,2Y,1r,4A,1r,4A,2u,6B,2u,5z,2u,4U,2u,2G,H,2G,1X,4U,1X,5z,2w,5z,2w,4U,2I,5z,O,4U,O,2G,1S,2G,1S,4e,1S,4e,1S,2G,O,4e,2I,4e,2I,2M,2w,4E,2I,2M,O,2M,1S,2M,1S]}]},{"1b":27,"C":"大阪府","1Z":[{"D":[3H,1f,4E,1f,4E,2J,2M,1f,2M,M,5r,M,4e,T,2G,T,2G,1t,2G,1t,4U,1t,2G,T,4U,M,4U,M,2G,1f,4e,1f,5r,1f,4e,2J,4e,W,4e,2b,4e,2b,2G,1j,2G,1j,2G,1j,2G,U,2G,U,2G,U,2G,1o,4U,1d,2G,1R,4U,R,6B,1O,4v,E,4A,P,5t,P,3V,P,3V,P,3V,1y,3V,1y,5t,1h,2Y,1h,4A,1y,4A,1y,4A,1y,4A,1y,4v,1y,4v,1y,5z,P,2G,P,4e,P,5r,P,4E,P,3H,P,3H,E,3S,1c,3S,R,3S,1o,3S,2f,5D,1G,5F,1G,5F,1G,5D,Q,3S,2J,3H,1f,3H,1f,3H,1f]}]},{"1b":28,"C":"兵庫県","1Z":[{"D":[3u,F,3u,2w,2R,O,3V,2I,2Y,2I,5t,1S,5t,1q,3V,1q,3u,1D,2R,1l,5t,1i,2Y,1i,4A,1i,4v,1P,4v,1P,4v,N,4v,N,6B,N,5z,N,5z,1B,2G,1B,2G,1x,4e,1U,2G,1t,4U,1t,2G,T,4U,M,4U,M,2G,1f,4e,1f,5r,1f,4e,2J,4e,W,4e,2b,2G,1j,2G,1j,4U,1j,5z,2b,5z,1j,4v,1j,4A,1j,2Y,2f,3u,2f,5n,2b,6o,1G,6V,W,5l,Q,4q,W,4q,Q,2Q,Q,2K,Q,3s,Q,3s,Q,3s,W,3i,W,2E,W,2y,W,2t,W,2t,Q,2t,Q,2t,2J,4g,1f,2t,M,2t,T,2t,T,2t,1t,2t,1U,2y,1x,2E,1P,3i,1P,3i,1i,3s,1l,2K,1l,3t,1l,3t,1H,3t,1q,3t,1q,3t,1m,2K,1S,2K,O,2K,F,2K,1X,2K,H,2Q,H,4q,H,5l,H,5l,H,6R,H,6V,H,6o,H,6o,H,5S,H,5n,H,3u,1X,3u,F,3u,F]},{"C":"淡路島","D":[2R,1o,3u,1o,3u,1o,3u,1d,5n,R,5S,1c,5n,P,5n,P,5n,1y,5S,1h,6V,1h,6R,1F,5l,L,5l,1F,4q,1F,4q,1h,4q,1h,4q,1h,2Q,1h,2Q,1y,4q,1y,2Q,1y,4q,P,4q,E,5l,E,6R,1O,6V,R,6o,1R,6u,1o,2R,1o,2R,1o]}]},{"1b":29,"C":"奈良県","1Z":[{"D":[3l,2b,3l,1j,4Z,1j,3K,1j,5F,1G,5D,1G,3S,2f,3S,1o,3S,R,3S,1c,3H,E,3H,P,3H,1h,3S,1F,3S,L,3S,L,3H,L,4E,1w,2M,V,2M,1M,5r,1M,5r,2L,2M,I,2M,G,2M,S,2M,1n,2M,1W,2M,1W,2M,1A,3H,1W,3S,1W,5D,1W,3K,1A,3K,1A,3K,3c,3K,1A,4Z,1n,3l,S,5p,G,5j,K,2p,G,2A,G,2p,K,2p,I,2p,I,2p,1M,2p,V,2A,L,2A,1F,2A,1F,2A,1h,2p,P,4y,E,4G,1c,5s,1O,2A,1R,2p,1d,2A,1o,2p,U,2p,U,2A,U,2p,2f,2A,1j,2p,1j,5j,1j,3l,2b,3l,2b]}]},{"1b":30,"C":"和歌山県","1Z":[{"D":[4E,P,3H,P,3H,1h,3S,1F,3S,L,3S,L,3H,L,4E,1w,2M,V,2M,1M,5r,1M,5r,2L,2M,I,2M,G,2M,S,2M,1n,2M,1W,2M,1W,2M,1A,3H,1W,3S,1W,5D,1W,3K,1A,3K,1A,3K,3c,3h,1s,3h,1s,3l,1s,3l,1s,5p,1s,3h,2c,3h,1Q,3l,Z,3h,1Q,4Z,Z,3h,Z,3h,Z,3h,Z,4Z,1v,3h,1v,3h,1v,4Z,1I,4Z,1I,4Z,1I,3K,1V,5F,1V,3S,2g,5D,2g,5F,2g,5D,2l,3S,2g,3H,2l,3S,2g,3S,2g,3H,2g,2M,2g,5r,1V,2G,1V,2G,1I,4U,1I,6B,Z,6B,1Q,6B,1Q,4v,2c,4v,1s,4v,1s,6B,1s,6B,1s,6B,1z,4v,2a,4A,2a,2Y,3c,5t,1A,3V,1W,3V,1n,2R,1n,3u,1n,3u,S,3u,S,3u,G,3u,K,2R,K,3V,K,3V,I,3V,2L,3u,1M,2R,1M,2R,1M,3V,V,5t,V,2Y,1w,5t,L,3V,1F,2R,1h,2R,1y,3V,P,3V,1y,5t,1h,2Y,1h,4A,1y,4A,1y,4A,1y,4v,1y,4v,1y,5z,P,2G,P,4e,P,5r,P,4E,P,4E,P]}]},{"1b":31,"C":"鳥取県","1Z":[{"D":[3a,F,2y,F,3i,1X,2K,H,2K,1X,2K,F,2K,O,2K,1S,3t,1m,3t,1q,3t,1q,3t,1H,3t,1l,2K,1l,3s,1l,3i,1l,2E,2k,2y,2k,4g,1i,3Q,2k,3Q,1l,3a,1H,3a,1D,2i,1D,2l,1q,2l,1q,2l,1m,1V,1q,1v,1D,Z,1H,Z,1D,Z,1q,1s,1m,1z,1m,2a,1q,3c,1D,1A,1D,1A,1l,1W,1l,1n,1l,S,1l,K,1i,I,1i,I,1P,2L,1P,1M,1i,1w,2k,V,2k,1M,1l,1M,1H,1M,1D,1M,1D,2L,1q,K,1q,K,1m,G,O,G,O,G,2I,G,2w,K,2w,I,1X,I,H,K,H,K,1X,S,F,1n,2w,1W,F,1s,1X,1Q,F,1v,F,2l,F,2l,F,2i,F,3a,F,3a,F]}]},{"1b":32,"C":"島根県","1Z":[{"D":[R,1X,1c,1X,1O,H,1O,H,E,H,1F,H,1F,1r,1F,1r,1w,1r,1w,2u,L,4m,V,2u,V,4m,2L,2u,I,2u,G,1r,S,1r,S,1r,K,H,I,H,I,1X,K,2w,G,2w,G,2I,G,O,G,O,K,1m,K,1q,2L,1q,1M,1D,1M,1D,1M,1H,1M,1l,V,2k,1w,2k,1w,2k,L,1i,1F,2k,1h,2k,1h,2k,1y,2k,P,2k,E,2k,E,1i,1c,1i,1O,1P,R,N,1R,N,1d,1B,1d,1x,1R,1x,1d,1U,U,1U,2f,1t,1j,1t,2b,1U,2b,1U,Q,1t,2J,1U,1f,1t,1t,T,T,M,T,1f,1t,2J,1U,Q,1x,W,1x,1G,1B,1G,N,1j,1P,U,1P,U,1i,2f,1l,U,1H,2f,1H,1j,1H,2b,1H,2b,1H,1G,1D,1G,1q,Q,1q,3f,1D,2J,1H,1f,1D,T,1l,T,1i,1t,1P,1U,1P,1x,N,1x,1B,1x,1B,1B,1x,1B,1x,1B,1U,N,1U,N,1t,1P,T,1i,M,2k,2J,2k,Q,1l,W,1H,1G,1q,1j,1m,U,1S,1d,O,R,2I,R,F,1R,F,1R,F,R,1X,R,1X]},{"C":"隠岐島","D":[1W,4r,1A,4J,3c,5V,1A,4S,1W,1u,1n,1u,G,4S,G,5V,S,4J,1W,4r,1W,4r]},{"C":"西ノ島","D":[2L,1p,1M,4n,1M,4n,1M,1p,1M,1p,V,1p,V,2H,1w,1J,V,1J,V,1a,V,2H,1M,2H,2L,1p,2L,1p]},{"C":"中ノ島","D":[K,1a,I,1a,K,2H,I,1a,I,2H,2L,1p,2L,1a,2L,1J,1M,1a,1M,1a,1M,1u,I,1u,2L,1J,2L,1J,I,1J,I,1J,K,1a,K,1a]}]},{"1b":33,"C":"岡山県","1Z":[{"D":[2l,1m,2l,1q,2l,1q,2i,1D,3a,1D,3a,1H,3Q,1l,3Q,2k,4g,1i,2y,2k,2E,2k,3i,1l,3i,1i,3i,1P,2E,1P,2y,1x,2t,1U,2t,1t,2t,T,2t,T,2t,M,4g,1f,2t,2J,2t,Q,2t,Q,4g,W,2i,1j,2l,1j,2g,1j,2g,1j,2g,2b,1V,1j,1I,2b,1I,1j,1V,1j,1V,2f,1V,U,1V,2f,1V,U,1V,1d,1I,U,1I,U,1v,1o,Z,1d,1Q,1o,2c,1o,2c,1d,2c,1d,1s,1o,1z,U,1z,1o,2a,1o,2a,U,2a,2f,2a,2f,3c,2f,3c,2f,3c,U,1A,U,1A,U,1W,U,1n,U,1n,2f,S,2f,S,U,S,U,G,U,G,2f,G,2f,G,1j,G,2b,K,W,K,Q,K,2J,K,M,I,T,I,1U,I,1x,I,1B,K,1B,I,N,I,1P,I,1i,K,1i,S,1l,1n,1l,1W,1l,1A,1l,1A,1D,3c,1D,2a,1q,1z,1m,1s,1m,Z,1q,Z,1D,Z,1H,1v,1D,1V,1q,2l,1m,2l,1m]}]},{"1b":34,"C":"広島県","1Z":[{"D":[1w,2k,1w,2k,L,1i,1F,2k,1h,2k,1h,2k,1y,2k,P,2k,E,2k,E,1i,1c,1i,1O,1P,R,N,1R,N,1d,1B,1d,1x,1R,1x,1d,1U,U,1U,2f,1t,1j,1t,2b,1U,2b,1U,Q,1t,2J,1U,1f,1t,1t,T,T,M,T,1f,1t,2J,1U,Q,1x,W,1x,1G,1x,1G,1x,1j,1x,2f,1U,1o,T,R,T,R,T,R,T,R,T,R,T,1R,M,1d,1f,1d,M,1R,M,1R,1f,1R,2J,1R,2J,1d,3f,1d,2J,1o,2J,1o,2J,U,3f,U,3f,U,W,U,W,1o,1G,1o,2b,1o,1G,1o,1G,1d,1G,R,2b,R,2b,R,1G,1O,W,1c,1G,R,W,1d,Q,1R,Q,1R,3f,1R,3f,R,Q,1O,Q,1O,Q,E,W,E,Q,E,Q,P,W,P,1G,P,1G,1y,1G,1y,2b,1y,2b,P,2b,E,2b,E,1G,E,1G,E,2b,E,1G,1c,2b,1O,1j,1O,2f,1O,2f,1c,U,1c,U,1c,U,1c,1o,E,1o,E,1d,E,1d,E,1R,1c,1d,1c,1d,1c,U,1O,1o,1O,1d,R,1d,R,1R,1R,R,1R,R,1R,1O,1R,1c,1R,P,1R,1h,1d,1h,1o,L,1o,1w,1o,L,1d,1F,1R,1F,1R,1h,1O,1h,1O,L,R,L,R,L,R,L,1O,1w,R,1w,1R,L,1R,V,1d,2L,1d,1M,1R,V,1R,2L,1R,I,1R,I,1d,K,1o,K,U,K,U,G,U,G,2f,G,2f,G,1j,G,2b,K,W,K,Q,K,2J,K,M,I,T,I,1U,I,1x,I,1B,K,1B,I,N,I,1P,2L,1P,1M,1i,1w,2k,1w,2k]},{"C":"大崎上島","D":[R,R,1c,R,1c,1R,1c,R,1c,1O,1O,1c,R,1c,R,1O,R,R,R,R]}]},{"1b":35,"C":"山口県","1Z":[{"D":[1m,M,1m,T,1q,T,1D,T,1D,T,1D,T,1H,1f,1D,2J,1q,3f,1q,Q,1D,1G,1H,1G,1H,2b,1H,2b,1H,1j,1H,2f,1l,U,1i,2f,1P,U,1P,U,N,1j,1B,1G,1x,1G,1x,1G,1x,1j,1x,2f,1U,1o,T,R,T,R,T,R,T,R,T,1c,T,1c,T,1c,1t,P,1t,1h,1t,1F,1t,1F,T,1F,M,L,1f,1w,1f,1w,1f,L,3f,L,3f,1w,2J,1w,1f,V,1f,V,M,V,T,1w,1t,V,1U,V,1U,V,1U,1w,1U,L,1U,L,1U,1F,1x,1F,1x,1w,1x,V,1B,V,1B,V,1B,1w,N,L,1i,L,1i,1F,2k,1h,1H,1y,1H,1y,1H,1h,1D,1y,1q,1y,1D,P,1H,P,1D,E,1q,1c,1S,E,1S,E,O,E,2I,E,2I,1c,2w,P,F,E,F,1c,1X,E,H,E,1r,E,1r,P,1r,E,1r,1c,2u,P,5d,P,5d,1h,5d,1y,4V,P,5L,P,5L,E,5L,E,5L,E,5L,1c,4p,1c,2D,1O,3m,R,3m,1O,2O,1c,3q,E,4n,P,4n,E,3q,1c,3q,1O,3q,R,4n,1d,3q,1o,2O,2f,2O,2b,2O,1G,2O,W,2s,W,3m,W,2D,Q,3m,Q,2s,Q,3m,Q,2D,3f,4V,Q,4V,Q,4V,W,5d,W,4m,W,4m,W,2u,W,1r,W,H,W,H,W,1X,W,1X,W,1X,Q,F,Q,F,3f,2I,2J,O,1f,1S,M,1S,M,1m,M,1m,M]},{"C":"長島","D":[N,V,N,V,N,1M,1P,1M,N,V,N,V,N,V]}]},{"1b":36,"C":"徳島県","1Z":[{"D":[2l,1F,2g,L,1V,L,1V,L,1v,1w,Z,1w,Z,L,1Q,1F,2c,L,1s,L,1z,L,2a,1w,3c,1w,1A,V,1A,V,1A,V,1A,1M,1A,2L,1A,2L,1A,I,1W,K,2a,G,1z,G,1s,G,1s,S,2c,1n,1Q,S,Z,S,1v,S,1v,3c,1I,3c,1V,2a,2g,1z,1V,1s,2g,2c,2i,1Q,3a,1Q,3a,2c,3a,2c,3Q,2c,4g,1s,4g,1z,4g,1z,2t,1z,2y,2a,3i,2a,3s,1A,2K,1A,2Q,1W,4q,1n,4q,1n,2Q,1n,3t,1n,3t,S,2Q,G,3t,1M,2K,2L,2K,1M,2K,V,3t,L,2Q,1h,2Q,1y,3t,1y,2K,1y,2K,1h,2E,1h,2E,1F,2y,1F,2t,1F,3a,1F,2l,1F,2l,1F]}]},{"1b":37,"C":"香川県","1Z":[{"D":[2i,R,2i,R,2i,1O,2i,1c,2i,1O,3a,1O,3a,1O,3a,1O,3a,1c,3Q,1c,3Q,1c,3Q,E,3Q,P,4g,P,2t,P,2t,1y,2y,P,2y,1y,2E,1h,2E,1h,2E,1h,2E,1h,2E,1F,2y,1F,2t,1F,3a,1F,2l,1F,2g,L,1V,L,1V,L,1v,1w,Z,1w,Z,L,1Q,L,1Q,1F,2c,L,1s,L,1z,L,2a,1w,3c,1w,1A,V,1A,V,1A,V,1A,V,1W,1w,1n,1w,1W,L,1W,1F,1A,1y,1W,E,1n,1c,1W,1c,1A,E,3c,E,2a,E,1z,1c,1s,1O,2c,R,2c,R,1Q,1O,1Q,R,1Q,R,Z,1R,1I,R,1V,1O,1V,1O,2g,1O,2g,R,2l,R,2l,R,2i,R,2i,R]},{"C":"小豆島","D":[4g,U,2y,U,2y,U,2y,U,2t,1R,4g,1R,4g,1d,3Q,1R,3a,1R,3Q,1R,3Q,1d,2i,1d,2i,1d,2i,1o,2i,U,3a,U,4g,U,4g,U]},{"C":"豊島","D":[2g,1d,1V,1o,2g,1o,2l,1d,2g,1d,2g,1d]}]},{"1b":38,"C":"愛媛県","1Z":[{"D":[1c,P,P,1w,1h,1M,L,V,1w,V,V,V,V,1w,2L,V,K,V,S,V,1n,1w,1n,1w,1W,1w,1A,V,1A,V,1A,V,1A,1M,1A,2L,1A,2L,1A,I,1W,K,1n,I,S,I,G,I,K,G,I,G,2L,K,1M,K,1w,K,1w,K,L,G,1F,G,1F,G,1h,G,1h,S,1y,1n,1y,1W,E,1A,E,1A,E,3c,E,3c,E,2a,E,2a,1c,1z,1O,1s,1d,1s,1o,1s,1o,1Q,1d,1v,1o,1I,2f,1V,2f,2g,1j,2g,1G,2i,W,2l,W,2i,W,3Q,W,2t,W,2y,W,2y,W,2E,W,2E,Q,2E,3f,3i,3f,2E,2J,2E,2J,2E,2J,2E,1f,2y,1f,2E,1f,3i,M,2E,M,2y,M,2y,M,2t,1f,2t,1f,2t,1f,2t,1f,4g,M,3Q,M,3Q,T,3Q,T,4g,1t,4g,1t,3Q,T,3Q,M,3a,M,3Q,M,2i,1f,2i,M,2l,M,2g,T,2g,T,2g,M,1V,1f,2g,3f,1V,2J,1V,1f,1I,1f,1v,2J,1v,1f,Z,T,Z,T,Z,M,1Q,M,1Q,M,2c,M,2c,M,1s,M,1z,1f,1z,M,1z,T,2a,1t,1z,1t,2a,1B,1s,N,1s,1P,2c,1P,2c,1P,2c,1P,1s,1i,2c,2k,2c,1i,1s,N,1z,1B,1z,1x,2a,1U,2a,T,2a,1f,3c,Q,1n,2b,S,1j,K,2f,1M,2f,V,U,V,U,V,1o,L,R,1h,1O,1h,1O,1y,1c,P,1c,P]},{"C":"大三島","D":[P,R,1y,R,P,1c,1c,E,1c,1c,E,1c,E,1O,E,R,P,R,P,R]},{"C":"伯方島","D":[1y,1c,1y,1c,1h,1c,1h,E,1h,E,1h,E,1h,E,1h,E,1y,1c,1y,1c]},{"C":"中島","D":[1j,1F,1j,L,1j,L,2b,L,2b,L,1j,1F,1j,1F,1j,1F]},{"C":"大島","D":[1h,E,1h,P,P,1y,P,1y,P,P,1y,E,1h,E,1h,E,1h,E]}]},{"1b":39,"C":"高知県","1Z":[{"D":[1Q,S,Z,S,1v,S,1v,3c,1I,3c,1V,2a,2g,1z,1V,1s,2g,2c,2i,1Q,3a,1Q,2i,Z,2g,2l,1I,3a,1I,2i,1I,2i,1v,2i,1v,2l,1v,2g,Z,1V,Z,1V,Z,1I,1s,1Q,2a,2c,1A,2c,S,2c,G,2c,K,1Q,I,1Q,2L,1Q,2L,Z,1M,1v,V,1v,V,1v,1w,1v,L,1I,L,1v,1F,1I,1h,1I,1F,1V,1h,2l,1h,2i,1y,2i,1y,3a,1y,3Q,P,3a,E,4g,E,4g,1c,2t,1c,2y,1O,2y,1O,2t,R,2y,1R,2E,1R,3i,1R,2K,1d,2K,1d,3t,1d,2Q,1R,4q,1d,5l,1o,5l,1o,4q,1o,4q,U,2Q,2b,4q,W,2Q,Q,2Q,Q,2Q,Q,4q,3f,2Q,3f,2Q,3f,3t,Q,3t,Q,3s,1G,3i,W,3i,W,3i,W,2E,W,2E,W,2y,W,2y,W,2t,W,3Q,W,2i,W,2l,1G,2i,1j,2g,2f,2g,2f,1V,1o,1I,1d,1v,1o,1Q,1o,1s,1d,1s,1O,1s,1c,1z,E,2a,E,2a,E,3c,E,3c,E,1A,E,1A,1y,1W,1y,1n,1h,S,1h,G,1F,G,1F,G,L,G,1w,K,1w,K,1M,K,2L,K,I,G,K,G,G,I,S,I,1n,I,1W,K,2a,G,1z,G,1s,G,1s,S,2c,1n,1Q,S,1Q,S]}]},{"1b":40,"C":"福岡県","1Z":[{"D":[2s,E,2s,P,2s,P,2O,1y,2O,1h,2s,1M,2s,2L,2D,I,2D,K,2D,K,2D,K,2D,G,2D,G,2D,S,3m,S,2O,S,1p,S,2H,1n,1a,1n,1a,1W,1a,1A,1J,3c,1J,2a,1J,1z,1u,1z,1u,1z,1u,2c,1J,2c,1u,Z,1u,1v,1u,1v,1u,1v,3x,Z,4J,1Q,4r,Z,4u,Z,2x,Z,2j,1v,1e,1I,1e,1I,1N,1I,1N,1I,2e,1I,2e,Z,2e,1Q,1K,2c,1K,1s,1K,1s,1K,1s,1K,1z,2e,1z,1N,2a,1e,2a,1e,2a,1e,3c,2x,1A,2x,1A,4u,1W,2x,S,2j,S,1e,1n,1e,1n,1e,S,2e,G,3k,I,2m,I,2n,I,2X,I,2X,I,5a,2L,2n,2L,2m,1M,2m,1M,2m,V,2n,V,2n,V,2m,V,3k,1w,3k,1w,1C,1w,1C,L,1C,L,1K,1w,1K,V,1K,V,2e,1M,1N,1M,2j,V,2j,V,2j,1w,2j,L,1e,L,1e,L,2j,L,2x,1F,4u,1h,2x,1y,4u,1y,4u,1y,4u,P,4r,P,4J,E,4J,E,5V,E,4S,E,1u,1c,1u,1c,1u,1c,1J,1c,1a,E,2H,E,1p,E,1p,E,1p,P,4n,P,3q,P,3q,E,2s,E,2s,E]}]},{"1b":41,"C":"佐賀県","1Z":[{"D":[1e,1n,2j,S,2x,S,4u,1W,2x,1A,2x,1A,1e,3c,1e,2a,1e,2a,1N,2a,2e,1z,1K,1z,1K,1s,1K,1s,1K,1s,1K,2c,3k,1s,2m,1z,2n,1s,5a,2c,5a,1Q,2n,1v,2n,1I,2n,1I,2n,1V,2X,1I,2X,1I,3Z,1v,3A,Z,3B,1Q,2q,2c,2q,1s,2q,1s,2q,1z,2P,2a,2h,3c,2h,1W,2h,1n,2h,S,2h,S,3o,S,3o,S,3o,S,3o,1n,2P,1n,2P,S,2P,G,2P,K,2P,K,2P,I,3o,2L,2P,2L,2P,I,2q,2L,2q,1M,2q,V,2q,V,2q,1w,2q,V,3B,V,3Z,1M,3A,I,3A,2L,3A,I,2X,I,2X,I,2X,I,2n,I,2m,I,3k,I,2e,G,1e,S,1e,1n,1e,1n,1e,1n]}]},{"1b":42,"C":"長崎県","1Z":[{"D":[2n,1V,2X,2g,3Z,2g,2X,2l,2X,2i,5a,2l,3k,2l,1C,3a,1C,2t,3k,2y,2n,2E,5a,2E,2X,3i,2X,3i,3Z,3i,3Z,3i,3Z,2E,3A,2y,3Z,2t,2X,4g,2X,3Q,2X,3Q,3Z,3a,3A,3a,2P,3a,3o,4g,4P,2t,3n,2E,4z,2E,4z,2E,4z,2y,3n,2t,3n,3Q,4P,3Q,4s,3a,4s,3a,4s,2i,3n,2l,3n,2l,3n,2l,3n,2l,3n,2i,4l,1v,4l,1v,4l,Z,4l,1Q,4z,1z,3n,1z,3n,1s,4s,2c,4s,2c,4s,2c,4s,1Q,4s,1Q,4P,Z,4P,1v,4s,1V,2h,2g,2h,2g,2h,1V,3o,2g,2q,2l,2P,1I,2P,1v,2P,1Q,3o,2c,3o,2c,2h,1Q,4P,2c,4P,1s,4P,2c,4s,1z,4s,1z,4s,2a,3n,1z,4z,1z,4z,1z,4z,2a,3n,2a,4z,3c,4z,3c,4z,3c,4l,1A,4l,1n,4l,S,4l,G,4l,G,4l,K,4l,G,5C,G,5C,S,6w,S,6w,1n,5k,1W,6s,1A,6q,1A,5i,1W,6q,1W,6q,1W,6q,1W,6q,1n,6s,1n,6s,1n,6s,S,5k,S,5k,G,5k,K,6w,K,4l,I,6w,I,5C,I,4l,I,4l,I,4z,K,3n,K,4s,K,4s,I,4s,K,4s,G,4P,G,2h,K,3o,G,3o,S,3o,S,2h,S,2h,S,2h,1n,2h,1W,2h,3c,2P,2a,2q,1z,2q,1s,2q,1s,2q,2c,3B,1Q,3A,Z,3Z,1v,2X,1I,2X,1I,2n,1V,2n,1V,2n,1V]},{"C":"五島列島","8u":[{"C":"的山大島","D":[5O,K,6x,G,5O,G,3j,K,5O,K,5O,K,5O,K]},{"C":"対馬","D":[4P,1l,2h,1l,2h,2k,2h,1i,2h,1P,4P,N,3n,1x,3n,1x,3n,1U,3n,1t,4z,1t,3n,T,3n,M,4z,M,4l,1f,5C,1f,5C,3f,6w,Q,5k,1G,6s,1G,6s,1G,6s,W,6q,W,6q,1G,6q,W,6q,Q,6s,1f,6s,M,5k,T,5k,T,6w,M,6w,M,5C,T,5C,T,6w,1t,6w,1t,5C,1U,5C,1x,5C,1B,4l,N,4z,1P,4z,1P,4l,1P,4l,1i,3n,1l,4P,1l,4P,1l]},{"C":"福江島","D":[6Q,1v,6Q,1I,6H,1V,6H,1V,6Q,1V,6H,2l,6H,2i,6Q,2i,4i,2l,6a,2i,6a,3a,6a,3a,5c,3a,5c,2i,6n,2i,6O,2i,5A,2l,5A,2g,6O,2l,6O,2l,6n,2g,6O,1V,6n,1V,6n,1I,6n,1v,5c,Z,5c,1v,6a,1I,6a,1I,4i,1v,6Q,1v,6Q,1v,6Q,1v]},{"C":"中通島","D":[4H,S,4H,S,3j,S,5O,S,5O,1n,5O,1n,5O,1W,3j,1W,3j,1A,3j,2a,3j,2a,4H,1z,4H,1z,4H,1s,3j,1z,5O,1s,5O,2c,4H,2c,4H,1Q,4H,Z,4H,Z,6z,1v,6z,1v,6z,1v,6f,1I,6f,1v,6f,Z,6k,Z,6k,Z,6G,Z,6G,Z,6G,1v,7k,1I,7k,1v,7k,1v,7k,Z,6S,Z,6S,1v,6H,1I,6H,1v,6H,Z,6H,Z,6S,Z,6S,1Q,6S,1Q,7k,1Q,6G,1Q,6G,1Q,6G,1Q,6G,1Q,6k,1Q,6k,1Q,6k,1Q,6G,2c,6k,2c,6k,2c,6f,1s,6f,1s,6z,1s,6z,1z,6z,1z,6z,2a,4H,2a,4H,2a,4H,3c,4H,3c,3j,1W,3j,1W,3j,1n,4H,S,4H,S]},{"C":"壱岐島","D":[2P,1O,2P,1O,2q,1O,2q,1c,2q,E,2q,E,2P,E,2q,E,2q,P,2P,P,3o,1y,2h,P,4P,P,4P,E,2h,E,2h,E,2h,1c,2h,1O,2h,1c,2h,1O,2h,R,3o,R,2P,1O,2P,1O]}]}]},{"1b":43,"C":"熊本県","1Z":[{"D":[3q,Z,2s,1I,2s,1V,3m,2g,3m,2l,3m,2i,3m,3Q,2D,2t,2D,2y,2D,2y,3m,2y,2s,2E,2O,3i,3q,2K,4n,2K,4n,2K,1p,3t,1p,2Q,2H,2Q,1a,2Q,1J,5l,1J,6V,1a,6o,1a,6o,1a,5S,1a,5n,2H,6u,1J,3u,1J,2R,1a,5t,1J,5t,1u,5t,4S,2Y,3x,2Y,4J,2Y,4r,2Y,4u,2Y,2x,2Y,2j,2Y,2j,2Y,2j,2Y,2j,2Y,1e,3V,1N,2R,2e,2R,1K,2R,1C,3V,2m,3V,2n,3V,2n,2R,2n,2R,2n,2R,2n,3u,2n,3u,2n,6u,2m,5n,1C,6o,1K,6R,1N,5l,1N,4q,1N,4q,1N,2Q,1N,2Q,1N,2Q,1N,3t,2x,3s,1e,3s,2e,3s,2e,3s,1K,3i,1K,2K,3k,2K,1C,3s,1K,3i,2e,3i,1e,2E,1e,2y,2j,4g,1e,2i,1N,2l,2e,2g,2e,1I,1N,1I,1N,1I,1e,1I,1e,1I,2j,1v,2x,Z,4u,Z,4r,Z,4J,1Q,3x,Z,1u,1v,1u,1v,1J,1I,1a,1V,2H,2g,1p,1V,1p,1I,1p,1I,2H,Z,1p,Z,3q,Z,3q,Z]},{"C":"天草諸島","D":[2q,3s,2q,3s,2q,2K,3B,3s,3A,3s,3Z,3s,3Z,2Q,5a,2Q,2n,3t,2m,3t,1C,3t,1C,3t,1K,3t,1C,2Q,1C,5l,2m,6R,2m,6R,2X,5l,2X,5l,2X,4q,3Z,4q,3Z,5l,3Z,5l,3Z,6R,3A,6V,3B,6V,3B,6o,2q,6o,2q,5S,2q,5S,2P,5n,3o,5n,3o,6u,3o,6u,2h,6u,2h,6u,2h,6u,2h,6u,2h,6u,2h,5n,2h,5n,2h,5S,2h,5S,2h,5S,4P,6o,3o,6V,2h,5l,2P,2Q,2P,2K,2P,3s,2q,3s,2q,3s]}]},{"1b":44,"C":"大分県","1Z":[{"D":[1X,I,H,I,2u,G,4m,G,5d,G,5L,K,4p,K,4p,I,2D,I,2D,I,2D,K,2D,K,2D,K,2D,G,2D,G,2D,S,3m,S,2O,S,1p,S,2H,1n,1a,1n,1a,1W,1a,1A,1J,3c,1J,2a,1J,1z,1u,1z,1u,1z,1u,2c,1J,2c,1u,Z,1u,1v,1u,1v,1u,1v,1u,1v,1J,1I,1a,1V,2H,2g,1p,1V,1p,1I,1p,1I,2H,Z,1p,Z,3q,Z,2s,1I,2s,1V,3m,2g,3m,2l,3m,2i,3m,3Q,2D,2t,2D,2y,2D,2y,2D,2y,4p,2y,5L,2E,4V,2y,5d,2E,4m,3i,2u,3i,H,3s,1X,3s,F,3i,2w,2E,2I,3i,O,3s,O,2K,O,3t,O,3t,O,3t,O,2K,1S,2K,O,2K,1S,2K,1m,3s,1m,3s,1q,3s,1D,3i,1q,2E,1D,2y,1H,2t,2k,2t,1l,2t,1H,2t,1H,2t,1D,4g,1D,2t,1q,4g,1m,4g,1m,3Q,1q,3a,1D,3a,1H,2i,1H,2i,1H,2l,1H,2l,1D,2i,1D,2i,1q,2l,1q,2i,1S,2l,1q,2g,1m,2g,1S,1V,1S,1I,1m,1v,1q,Z,1S,Z,O,Z,2I,Z,2w,1Q,F,1Q,1r,1Q,1r,1z,1r,1z,H,1z,1X,1z,F,1z,F,1z,F,2a,2w,2a,2I,2a,2I,2a,O,1A,O,1n,O,K,2w,I,F,I,1X,I,1X,I]}]},{"1b":45,"C":"宮崎県","1Z":[{"D":[O,3s,O,2K,O,3t,O,3t,O,2Q,2I,2Q,2I,2Q,2w,4q,F,5l,1X,6R,H,6R,1X,6V,H,6o,H,5S,1r,6o,1r,5S,1r,5S,1r,5n,1r,5n,2u,5n,2u,6u,2u,3u,4m,3u,5d,3V,4V,2Y,4p,4U,3m,4E,3m,3H,3m,3H,2D,5D,3m,5F,3m,4Z,2O,3h,2O,3l,2O,3l,2O,3l,2O,3l,3q,5p,3q,2p,3q,2p,4n,2A,4n,2A,1p,4y,4n,5s,1p,5s,2H,4y,2H,4y,2H,4y,1a,2A,1a,2p,1J,2p,1u,5j,1u,5j,1u,5j,1u,5p,1u,5p,1J,5p,1J,4Z,1J,3K,1u,3K,1u,3K,4S,5F,3x,5F,3x,5D,3x,5D,3x,3S,3x,3H,5V,3H,5V,4E,4J,2M,4r,5r,4r,4e,4r,4U,2x,5z,2x,4v,2j,4A,2j,4A,2j,4A,2j,2Y,2j,2Y,2j,2Y,2j,2Y,2j,2Y,2x,2Y,4u,2Y,4r,2Y,4J,2Y,3x,2Y,4S,2Y,1u,5t,1J,5t,1a,5t,1J,2R,1J,3u,2H,6u,1a,5n,1a,5S,1a,6o,1a,6o,1J,6V,1J,5l,1J,4q,1a,2Q,2H,2Q,1p,2Q,1p,3t,4n,2K,4n,2K,3q,2K,2O,3i,2s,2E,3m,2y,2D,2y,2D,2y,4p,2y,5L,2E,4V,2y,5d,2E,4m,3i,2u,3i,H,3s,1X,3s,F,3i,2w,2E,2I,3i,O,3s,O,3s]}]},{"1b":46,"C":"鹿児島県","1Z":[{"D":[2j,4A,2j,4A,2j,4A,2j,2Y,2j,2Y,1e,3V,1N,2R,2e,2R,1K,2R,1C,3V,2m,3V,2n,3V,2n,2R,2n,2R,2n,2R,2n,3u,5a,2R,5a,2R,2X,2R,2X,3V,3Z,2R,3B,2R,3B,3u,3B,3u,3A,3u,3B,6u,3A,5S,3A,6o,3B,5S,3B,5S,3B,5S,3B,5n,2q,5n,2q,5n,2P,5n,2P,6u,2P,2R,2q,2R,2q,2R,3B,5t,3B,2Y,2q,4A,3B,4A,3B,4v,2q,4U,2P,2G,2P,4e,2q,5r,2q,5r,3A,3S,3B,4Z,3o,3l,3o,3l,3o,3h,2h,3h,4s,3h,3o,5j,2h,5j,3o,2p,2h,2p,3o,2A,3o,4y,2P,4y,3B,4y,3Z,5s,2X,4G,2X,3P,5a,3P,2n,3P,2n,8a,2m,8a,2m,3P,2m,3P,2m,3P,3k,4G,1C,5s,3k,4y,2m,2A,2n,3h,2m,4Z,3k,5F,1C,5D,1K,3S,1C,3H,1K,3H,2e,3H,1e,3H,2j,3S,2j,5F,1e,3K,1N,3K,1N,3K,2e,5D,1K,5D,1C,5F,1C,3K,1K,4Z,2e,4Z,2e,3h,2e,3l,2e,5p,1N,2A,1N,5s,2e,3P,1K,6T,1C,5y,3k,5y,3k,4N,3k,4N,3k,4N,2m,4K,1C,4K,1K,4N,2e,4N,1N,4N,2j,4N,2x,5y,4r,6T,4r,8a,4J,8a,5V,3P,3x,3P,4S,4G,3x,4G,3x,4G,3x,5s,4J,4y,5V,2p,4S,5j,1u,5j,1u,5j,1u,5p,1J,5p,1J,4Z,1J,3K,1u,3K,1u,3K,4S,5F,3x,5F,3x,5D,3x,3S,3x,3H,5V,3H,5V,4E,4J,2M,4r,5r,4r,4e,4r,4U,2x,5z,2x,4v,2j,4A,2j,4A]},{"C":"種子島","D":[1K,5H,1K,7A,1C,5H,1C,8h,1K,4a,2e,5Z,1e,5u,2j,3g,2j,3g,2x,4D,2x,4D,4u,4R,4r,4R,4r,3g,4u,5u,4u,5T,2x,5X,2j,5Z,1e,4a,1e,8h,1e,5H,1N,5H,1K,5H,1K,5H]},{"C":"屋久島","D":[2X,7A,3A,6m,2P,6m,2h,5H,2h,4a,3o,4a,2P,4a,2q,5Z,3A,4a,2X,7c,2X,7A,2X,7A]},{"C":"下瓶島","D":[5k,4e,6s,4e,6s,5r,6q,2M,5U,5r,5i,5r,5i,5r,6s,2G,5k,2G,5k,4U,5k,4U,6w,4U,6w,2G,5k,2G,5k,4e,5k,4e,5k,4e]},{"C":"上瓶島","D":[5C,4v,4l,6B,4z,5z,4z,6B,4z,5z,4z,5z,4l,4U,5C,5z,5C,6B,5C,6B,5C,4v,5C,4v]},{"C":"奄美諸島","8u":[{"C":"徳之島","D":[6W,3T,6W,4w,6W,3G,6W,3b,7x,4k,7B,3r,7h,4k,8W,2o,7h,2o,7h,3G,7h,5x,7h,3T,7h,3I,7B,3I,6W,3T,6W,3T,6W,3T]},{"C":"与路島","D":[5I,2S,3U,2S,3U,2B,5I,2B,5I,2S,5I,2S]},{"C":"請島","D":[4Q,3E,4B,2S,4B,2B,4Q,2B,4Q,2S,4x,2S,4Q,3E,4Q,3E]},{"C":"与論島","D":[7U,4t,7U,5v,6U,5v,6U,4t,7U,4t,7U,4t]},{"C":"沖永良部島","D":[83,4d,83,4d,8Y,3p,8q,4d,9E,3p,9N,3y,aF,1k,9C,3p,83,4d,83,4d]},{"C":"加計呂麻島","D":[4Q,2r,4Q,2r,4x,2r,4Q,2r,4Q,2r,4x,1T,4x,2N,7R,1Y,7R,2B,6b,2B,6b,2B,4x,2B,4x,2B,4x,2B,4Q,1Y,4B,2B,4B,1Y,4Q,2N,4B,1T,4B,2r,4Q,2r,4Q,2r]},{"C":"奄美大島","D":[4Q,2C,6b,2C,4x,4M,6b,2W,7R,2W,7b,3N,8j,3N,7i,3N,7Z,3N,7Z,3N,9h,3N,7C,3N,5A,2T,6O,2T,6n,4h,5c,4h,6n,2T,6n,2T,5c,2T,6n,3N,5c,3N,5c,2T,5c,4h,6a,4o,4i,4o,4i,4h,4i,3N,6a,2W,6n,2W,6O,4M,5A,2C,9h,2C,7Z,2C,7Z,3e,7Z,2r,7Z,1T,7i,1T,8j,2N,7b,2N,7b,2N,7b,1Y,7b,2B,7R,1Y,6b,1T,4x,2r,5I,2C,4Q,2C,4Q,2C]},{"C":"喜界島","D":[6k,1T,6G,1T,7k,2r,6k,3e,6f,3e,6z,3e,6f,2r,6f,2r,6k,1T,6k,1T]}]}]},{"1b":47,"C":"沖縄県","1Z":[{"C":"沖縄本島","D":[4Y,4L,3F,5R,9c,4L,7w,3J,aM,3R,8P,6d,8K,6Y,8s,6d,8s,3R,8s,5R,8K,5R,8K,5R,8P,4L,bT,7v,7w,7v,8C,7L,8C,6K,6v,7a,4Y,6K,4Y,6K,3F,7a,3v,7a,3v,6C,6c,6C,8E,6C,7y,6C,7z,6C,7z,5w,7z,6L,7y,7P,7y,7P,7y,9d,7z,7P,7z,6L,a4,6L,a4,7P,a3,9d,b7,aa,b7,bh,a3,9e,8A,9Y,8k,9Y,8k,9V,8k,9e,8k,bh,8k,aa,8k,aa,ay,9d,ay,9d,8A,7P,b5,6F,b5,7a,a3,6C,a4,7a,7z,6K,7y,6K,8E,6K,8E,6K,6c,7L,3v,7L,3v,7v,3v,7v,6c,4L,8E,5R,8E,3J,6c,3J,6c,3R,3v,3R,4Y,5R,4Y,4L,4Y,4L]},{"C":"多良間島","D":[49,7g,51,7g,52,7X,50,8x,49,7g,49,7g]},{"C":"宮古島","D":[66,aq,69,9z,70,7X,72,8v,67,a9,66,7X,65,7g,64,9z,66,aq,66,aq]},{"C":"伊是名島","D":[4Y,5v,4Y,5v,4Y,5m,3F,5v,4Y,5v,4Y,5v]},{"C":"伊平屋島","D":[6v,6j,8C,5N,6v,4F,6v,4F,4Y,4t,4Y,4F,6v,6j,6v,6j]},{"C":"八重山諸島","8u":[{"C":"与那国島","D":[1,8J,4,8J,5,9Z,3,9Z,1,8J,1,8J]},{"C":"波照間島","D":[19,8o,22,8o,22,aZ,20,el,19,8o,19,8o]},{"C":"西表島","D":[22,8x,29,a9,27,9L,25,9L,22,8v,22,8x,22,8x]},{"C":"石垣島","D":[42,7g,40,a9,37,9L,34,9L,31,8x,35,en,36,8x,42,7g,42,7g]}]}]}];1g A={1:"eo",2:"ep",3:"eq",4:"er",5:"es",6:"et",7:"eu",8:"ev",9:"ew",10:"ex",11:"ey",12:"ez",13:"eA",14:"eB",15:"eC",16:"eD",17:"eE",18:"eF",19:"eG",20:"eH",21:"eI",22:"eJ",23:"eK",24:"eL",25:"eM",26:"eN",27:"eO",28:"eP",29:"eQ",30:"eR",31:"eS",32:"eT",33:"eU",34:"eV",35:"eW",36:"eX",37:"eY",38:"eZ",39:"f0",40:"f1",41:"f2",42:"f3",43:"f4",44:"f5",45:"f6",46:"f7",47:"f8"}})(dh);',62,940,'|||||||||||||||||||||||||||||||||||||this|name|coords|318|282|330|280|328|options|329|323|301|295|285|319|305|315|331|300|311|325|306|||341|||||||||||264|code|317|313|253|302|var|321|293|309|503|291|287|332|312|266|288|279|338|299|262|342|324|297|320|337|334|296|249|289|if|322|307|290|343|263|250|function|326|252|316|294|340|314|286|481|298|344|333|281|483|path|||||||||||336|308|339||251|310|345|237|347|254|292|346|247|246|492|392|240|480|270|351|278|504|283|255|352|413|393|484|478|272|353|width|377|265|284|303|356|327|380|482|269|239|358|368|485|474|height|prototype|476|244|371|499|||||||||||348|493|335|506|479|304|412|388|354|220|248|389|271|234|238|501|268|495|355|357|367|151|element|260|502|505|242|241|408|null|486|152|491|382|487|519|386|454|462|475|498|397|349|518|383|488|192|369|429|return|base|243|||||||||||419|469|430|500|378|444|350|473|210|224|494|232|277|267|472|273|359|257|235|510|256|373|489|196|394|233|372|194|428|411|381|509|396|219|451|258|402|521|477|401|496|236|195|409|261|465|376|275|463|case|153|387|||||||||||245|456|208|276|457|471|426|434|226|391|229|360|512|365|435|390|431|379|395|370|414|511|527|490|400|375|205|466|231|384|517|385|433|422|193|break|416|274|in|507|221|447|448|520|364|415|225|259|188|417|455|418|||||||||||209|197|150|516|497|217|461|432|427|508|216|449|425|207|363|190|227|else|228|452|366|154|230|222|453|218|443|374|526|data|464|528|215|212|color|191|524|529|442|445|206|450|211|361|213|399|167|362|187|189|515|467|||||||||||525|199|421|424|514|length|556|184|201|223|214|468|459|460|pointer|404|changedTouches|forEach|405|originalEvent|100|522|157|186|148|147|423|185|204|586|NanseiIslands|617|584|406|458|114|prefectures|523|403|581|hoverColor|530|Array|198|103|102|168|135|getContext|557|410|202||||172|||||||398|437|fillStyle|593|MSPointer|Pointer|124|420|166|200|140|Touch|587|441|567|470|177|size|162|undefined|subpath|561|446|558|105|for|142|407|156|116|149|605|616|138|618|549|161|130|on|area|164|160|585|440|599|597|181|render|183|indexOf|175|594||||||||||||180|155|531|534|movesIslands|436|203|isArea|596|fontColor|hovered|620|619|132|598|165|onSelect|style|selection|borderLineWidth|106|false|areas|borderLineColor|553|122|115|171|typeof|176|document|179|588|649|isNanseiIslands|lineWidth|563|107|174|104|170|169|true|showsPrefectureName|showsAreaName|131|535|129|font|536|551|filter|565|579|145|146|439|128|125|601|560|532|setData|getEnglishName|513|182|brighten|631|english|622|hovering|621|606|602|setProperties|drawPrefecture|beginPath|555|canvas|prefecture|642|a0a0a0|121|101|lineColor|141|stroke|604|113|throw|full|108|173|drawCoords|163|fontSize|628|629|Math|159|fontShadowColor|onHover|new|632|call|replace|134|643|findAreaBelongingToByCode|findPrefectureByCode|136|566|570|isHovering|offsetTop|pageY|offsetLeft|pageX|143|645|144|590|getCenterOfPrefecture|drawText|lineTo|getShortName|getName|595|initializeData|left|533|top|552|568|608|fitSize|607|571|closePath|591|613|while|moveTo|614|css|mousemove|touch|none|589|mousedown|583|582|580|647|578|preventDefault|stopPropagation|setTimeout|navigator|window|off|644|641|639|638|map|635|610|158|546|544|addEvent|540|615|parseInt|539|630|substr|switch|Arial|133|625|default|createElement|areaNameType|139|623|prefectureNameType|apply|fill|137|drawsBoxLine|117|renderAreaMap|123|renderPrefectureMap|626|backgroundColor|119|px|111|No|110|drawIslandsLine|109|strokeStyle|drawName|action|CANVAS|support|not|may|651|browser|Your|use|624|542|mouseleave|touchleave|MSPointerLeave|438|pointerleave|633|kanji|mouseenter|touchenter|MSPointerEnter|pointerenter|mouseup|touchend|romaji|MSPointerUp|634|pointerup|short|restore|touchmove|MSPointerMove|pointermove|fillText|00|shadowBlur|toString|touchstart|shadowColor|MSPointerDown|pointerdown|max|min|round|middle|textBaseline|catch|jQuery|textAlign|576|htmlfile|ActiveXObject|try|650|msPointerEnabled|gi|pointerEnabled|572|564|ontouchstart|String|Japan|areaColor|push|save|cursor|isPointInPath|112|573|575|mouseout|636|defined|is|append|609|550|such|has|603|548|543|600|126|592|541|solid|ms|borderStyle|hasData|borderColor|627|englishName|borderWidth|ShortName|fullName|background|ffffff|537|transparent|clearRect|554|constructor|create|type|extend|Object|hasOwnProperty|okinawaCliclableZone|japanMap|fn|strict|arguments|569|547|559|Hokkaido|Aomori|Iwate|Miyagi|Akita|Yamagata|Fukushima|Ibaraki|Tochigi|Gunma|Saitama|Chiba|Tokyo|Kanagawa|Niigata|Toyama|Ishikawa|Fukui|Yamanashi|Nagano|Gifu|Shizuoka|Aichi|Mie|Shiga|Kyoto|Osaka|Hyogo|Nara|Wakayama|Tottori|Shimane|Okayama|Hiroshima|Yamaguchi|Tokushima|Kagawa|Ehime|Kochi|Fukuoka|Saga|Nagasaki|Kumamoto|Oita|Miyazaki|Kagoshima|Okinawa|center'.split('|'),0,{}))
;
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//






;
