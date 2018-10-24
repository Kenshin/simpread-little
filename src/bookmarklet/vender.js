
// https://github.com/kenshin/notify
var Notify = ( function () {
    var VERSION = "2.0.1",
        name    = "notify",
        root    = "notify-gp",
        roottmpl= "<" + root + ">",
        num     = 0,
        NORMAL  = 0,
        SUCCESS = 1,
        WARNING = 2,
        ERROR   = 3,
        MODE    = {
            toast    : "toast",
            modal    : "modal",
            snackbar : "snackbar",
        },
        STATE   = {
            loading  : "loading",
            holdon   : "holdon",
        },
        POSITION= {
            lefttop     : "lt",
            leftbottom  : "lb",
            rightbottom : "rb",
        },
        options = {
            version : VERSION,
            title   : "",
            content : "",
            type    : NORMAL,
            mode    : MODE.toast,
            state   : undefined,
            flat    : false,
            delay   : 1000 * 5,
            icon    : "",
            action  : "",
            cancel  : "",
            callback: undefined,
            complete: undefined,
        },
        timer      = {},
        $root,
        TMPL       = '\
        <notify>\
            <notify-a href="javascript:;"><notify-span></notify-span></notify-a>\
            <notify-i></notify-i>\
            <notify-title></notify-title>\
            <notify-content></notify-content>\
            <notify-action></notify-action>\
            <notify-cancel></notify-cancel>\
        </notify>',
        loading    = '\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling">\
                <circle stroke="#fff" stroke-width="10" cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" r="30" stroke-dasharray="141.37166941154067 49.12388980384689" transform="rotate(102 50 50)">\
                    <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform>\
                </circle>\
            </svg>',
        prefix     = function( value ) {
            return name + "-" + value;
        },
        registyElement = function( name, elements ) {
            elements.forEach( function( item ) {
                document.createElement( prefix( item ));
            });
        },
        closeHandle = function( event ) {
            $root.off( "click", "." + event.data + " notify-a", closeHandle );
            hidden( $(this).parent() );
        },
        delayHandler = function( item ) {
            clearTimeout( timer[item] );
            delete timer[item];
            hidden( this );
        },
        callbackHander = function( event ) {
            event.data[1] && event.data[1]( event.data[2] );
            $root.off( "click", "." + event.data[0] + " notify-action", callbackHander );
            hidden( $(this).parent() );
        },
        completeHandler = function() {
            hidden( this );
        },
        hidden = function( target ) {
            target.addClass( "notify-hide" ).slideUp( 500, function() {
                target.remove();
                if ($root.children().length === 0 ) $root.css( "z-index", 0 );
            });
        },
        render = function() {
            var $target  = $( TMPL ),
                $title   = $target.find(prefix( "title"   )),
                $content = $target.find(prefix( "content" )),
                $close   = $target.find(prefix( "a"       )),
                $icon    = $target.find(prefix( "i"       )),
                $action  = $target.find(prefix( "action"  )),
                $cancel  = $target.find(prefix( "cancel"  )),
                item     = "notify-item-" + num++,
                position = this.constructor.Position;

            this.title   ? $title.text( this.title )     : $title.hide();
            this.content ? $content.html( this.content ) : $content.hide();

            if ( this.mode === MODE.modal ) {
                $target.addClass( "notify-modal" );
                $content.addClass( "notify-modal-content" );
                $root.on( "click", "." + item + " notify-a", item, closeHandle );
            } else {
                $close.hide();
                this.mode == MODE.snackbar && $target.addClass( "notify-snackbar" );
            }

            this.mode !== MODE.modal && this.icon !== "" &&
                $icon.css({ "background-image": "url(" + this.icon + ")", "display": "block" });

            switch( this.type ) {
                case 1:
                    $content.addClass( "notify-success" );
                    break;
                case 2:
                    $content.addClass( "notify-warning" );
                    break;
                case 3:
                    $content.addClass( "notify-error" );
                    break;
            }

            if ( this.action !== "" && this.callback && typeof this.callback == "function" ) {
                $content.css( "width", "100%" );
                $action.text( this.action ).css( "display", "block" );
                $root.on( "click", "." + item + " notify-action", [ item, this.callback, "action" ], callbackHander );
            }

            if ( this.cancel !== "" && this.callback && typeof this.callback == "function" ) {
                $content.css( "width", "100%" );
                $cancel.text( this.cancel ).css( "display", "block" );
                $root.on( "click", "." + item + " notify-cancel", [ item, this.callback, "cancel" ], callbackHander );
            }

            this.mode !== MODE.modal && this.state !== STATE.loading && this.state !== STATE.holdon && ( this.action == "" || !this.callback || typeof this.callback != "function" ) &&
                ( timer[item] = setTimeout( delayHandler.bind( $target, item ), this.delay ) );

            if ( this.state == STATE.loading ) {
                $icon.html( loading );
                $icon.css({ display: "block" });
                this.complete = completeHandler.bind( $target );
            }

            if ( this.state == STATE.holdon ) {
                $icon.css({ display: "block" }).addClass( "holdon" );
                $cancel.after( $icon[0].outerHTML );
                $target.find( "notify-i:first" ).remove();
                $root.on( "click", "." + item + " notify-i", [ item, this.callback, "holdon" ], callbackHander );
                if ( !this.action || !this.cancel ) $content.css({ width: "100%" });
            }

            if ( this.flat ) {
                $target.css({ "box-shadow": "none", "border-radius": "2px" });
            }

            if ( position == POSITION.rightbottom || position == POSITION.leftbottom ) {
                $target.css({ "transform-origin": "left bottom 0px" });
                $root.addClass( "notify-position-" + position + "-corner" );
            } else if ( position == POSITION.lefttop ) {
                $root.addClass( "notify-position-" + position + "-corner" );
            }

            $target.addClass( item );
            $root.append( $target ).css( "z-index", 2147483647 );
            this.mode == MODE.snackbar && $target.css( "margin-left", "-" + $target.width()/2 + "px" );
            setTimeout( function() { $target.addClass( "notify-show" ); }, 200 );
        };

    function Notify() {
        registyElement( name, [ "gp", "div", "a", "span", "title", "content", "i" ] );
        if ( $( "html" ).find ( root ).length == 0 ) {
            $( "html" ).append( roottmpl );
            $root = $( root );
        }
    }

    Notify.prototype.title   = options.title;
    Notify.prototype.content = options.content;
    Notify.prototype.type    = options.type;
    Notify.prototype.mode    = options.mode;
    Notify.prototype.state   = options.state;
    Notify.prototype.delay   = options.delay;
    Notify.prototype.icon    = options.icon;
    Notify.prototype.flat    = options.flat;
    Notify.prototype.action  = options.action;
    Notify.prototype.cancel  = options.cancel;
    Notify.prototype.callback= options.callback;
    Notify.prototype.complete= options.complete;
    Notify.Position          = undefined;

    Notify.prototype.Render  = function () {

        var self = this;

        if ( arguments.length === 1 && typeof arguments[0] === "object" ) {
            options = arguments[0];

            Object.keys( options ).forEach( function( item ) {
                self[item] = options[item];
            });

            render.bind( self )();
        }
        else if ( typeof arguments[0] !== "object" && arguments.length > 0 && arguments.length < 5 ) {
            switch ( arguments.length ) {
                case 1:
                    this.content = arguments[0];
                    break;
                case 2:
                    if ( arguments[0] == MODE.snackbar ) {
                        this.mode = arguments[0];
                    }
                    else if ( typeof arguments[0] == "number" ) {
                        this.type  = arguments[0];
                    } else {
                        this.mode  = MODE.modal,
                        this.title = arguments[0];
                    }
                    this.content   = arguments[1];
                    break;
                case 3:
                    this.content   = arguments[0];
                    this.action    = arguments[1];
                    this.callback  = arguments[2];
                    break;
                case 4:
                    if ( arguments[0] == MODE.snackbar ) {
                        this.mode      = arguments[0];
                        this.content   = arguments[1];
                        this.action    = arguments[2];
                        this.callback  = arguments[3];
                    }
                    break;
            }
            render.bind( self )();
        }
        else {
            console.error( "Arguments error", arguments );
        }
        return self;
    };

    Notify.prototype.Clone  = function () {
        return new Notify();
    };

    return Notify;

})();

// https://github.com/kenshin/puread
var PureRead = (function () {
    'use strict';
  
    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };
  
    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
  
      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
  
    var _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
  
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
  
      return target;
    };
  
    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
  
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
  
        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
  
        if (getter === undefined) {
          return undefined;
        }
  
        return getter.call(receiver);
      }
    };
  
    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
  
      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };
  
    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
  
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };
  
    var slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
  
        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);
  
            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }
  
        return _arr;
      }
  
      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();
  
    var toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
  
        return arr2;
      } else {
        return Array.from(arr);
      }
    };
  
    console.log("=== PureRead: Util load ===");
  
    /**
     * Deep clone object
     * 
     * @param  {object} target object
     * @return {object} new target object
     */
    function clone(target) {
        return $.extend(true, {}, target);
    }
  
    /**
     * Get URI
     * 
     * @return {string} e.g. current site url is http://www.cnbeta.com/articles/1234.html return http://www.cnbeta.com/articles/
     */
    function getURI() {
        var name = function name(pathname) {
            pathname = pathname != "/" && pathname.endsWith("/") ? pathname = pathname.replace(/\/$/, "") : pathname;
            return pathname.replace(/\/[%@#.~a-zA-Z0-9_-]+$|^\/$/g, "");
        },
            path = name(window.location.pathname);
        return window.location.protocol + "//" + window.location.hostname + path + "/";
    }
  
    /**
     * Verify html
     * 
     * @param  {string} input include html tag, e.g.:
        <div class="article fmt article__content">
     *
     * @return {array} 0: int include ( -1: fail； 0: empty html; 1: success; 2: special tag )
     *                 1: result
     */
    function verifyHtml(html) {
        if (html == "") return [0, html];else if (specTest(html)) return [2, html];
        var item = html.match(/<\S+ (class|id)=("|')?[\w-_=;:' ]+("|')?>?$|<[^/][-_a-zA-Z0-9]+>?$/ig);
        if (item && item.length > 0) {
            return [1, item];
        } else {
            return [-1, undefined];
        }
    }
  
    /**
     * Conver html to jquery object
     * 
     * @param  {string} input include html tag, e.g.:
        <div class="article fmt article__content">
     *
     * @return {string} formatting e.g.:
                h2#news_title
                div.introduction
                div.content
                div.clearfix
                div.rating_box
                span
                special tag, @see specTest
                     e.g. [['<strong>▽</strong>']]        [[[$('.article-btn')]]]
                          [[/src=\\S+(342459.png)\\S+'/]] [[{$('.content').html()}]]
     *
     */
    function selector(html) {
        var _verifyHtml = verifyHtml(html),
            _verifyHtml2 = slicedToArray(_verifyHtml, 2),
            code = _verifyHtml2[0],
            item = _verifyHtml2[1];
  
        if (code == 2) return html;else if (code == 1) {
            var _item$0$trim$replace$ = item[0].trim().replace(/['"<>]/g, "").replace(/ /ig, "=").split("="),
                _item$0$trim$replace$2 = slicedToArray(_item$0$trim$replace$, 3),
                tag = _item$0$trim$replace$2[0],
                prop = _item$0$trim$replace$2[1],
                value = _item$0$trim$replace$2[2]; // ["h2", "class", "title"]
  
  
            if (!prop) prop = tag;else if (prop.toLowerCase() === "class") prop = tag + "." + value;else if (prop.toLowerCase() === "id") prop = tag + "#" + value;
            return prop;
        } else {
            return null;
        }
    }
  
    /**
     * Verify special action, action include:
       - [[{juqery code}]] // new Function, e.g. $("xxx").xxx() return string
       - [['text']]        // remove '<text>'
       - [[/regexp/]]      // regexp e.g. $("sr-rd-content").find( "*[src='http://ifanr-cdn.b0.upaiyun.com/wp-content/uploads/2016/09/AppSo-qrcode-signature.jpg']" )
       - [[[juqery code]]] // new Function, e.g. $("xxx").find() return jquery object
  
     * 
     * @param  {string} verify content
     * @return {boolen} verify result
     */
    function specTest(content) {
        return (/^(\[\[)[\[{'/]{1}[ \S]+[}'/\]]\]\]{1}($)/g.test(content)
        );
    }
  
    /**
     * Exec special action, action include: @see specTest
     * type: 0, 3 - be chiefly used in include logic
     * type: 1, 2 - be chiefly used in exclude logic
     * 
     * @param  {string} content
     * @return {array}  0: result; 1: type( include: -1:error 0:{} 1:'' 2:// 3:[])
     */
    function specAction(content) {
        var _ref = [content.replace(/(^)\[\[|\]\]$/g, "")],
            value = _ref[0],
            type = _ref[1];
  
        switch (value[0]) {
            case "{":
                value = value.replace(/^{|}$/g, "");
                content = function (v) {
                    return new Function("return " + v)();
                }(value);
                type = 0;
                break;
            case "'":
                content = value.replace(/^'|'$/g, "");
                var name = content.match(/^<[a-zA-Z0-9_-]+>/g).join("").replace(/<|>/g, "");
                var str = content.replace(/<[/a-zA-Z0-9_-]+>/g, "");
                content = name + ":contains(" + str + ")";
                type = 1;
                break;
            case "/":
                content = value.replace(/^\/|\/$/g, "").replace(/\\{2}/g, "\\").replace(/'/g, '"');
                type = 2;
                break;
            case "[":
                value = value.replace(/^{|}$/g, "");
                content = function (v) {
                    return new Function("return " + v)();
                }(value)[0];
                type = 3;
                break;
            default:
                console.error("Not support current action.", content);
                type = -1;
                break;
        }
        return [content, type];
    }
  
    console.log("=== PureRead: AdapteSite load ===");
  
    var site = {
        url: "",
        target: "",
        matching: [],
        name: "", // only read mode
        title: "", // only read mode
        desc: "", // only read mode
        exclude: [],
        include: "",
        avatar: [],
        paging: []
    };
    var minimatch = void 0;
  
    var AdapteSite = function () {
        function AdapteSite() {
            var sites = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { global: [], custom: [], local: [] };
            classCallCheck(this, AdapteSite);
  
            this.url = getURI();
            this.sites = sites; // include: global, custom, local
            this.current = {};
            this.state = "none"; // include: meta, txt, adapter, none, temp
            this.origins = [];
        }
  
        /**
         * Set global minimatch
         */
  
  
        createClass(AdapteSite, [{
            key: "SetMinimatch",
            value: function SetMinimatch(value) {
                minimatch = value;
            }
  
            /**
             * Get site from url
             * 
             * @param {string} include: global, custom, local
             * @param {string} url 
             */
  
        }, {
            key: "Getsite",
            value: function Getsite(type, url) {
                return this.sites[type].find(function (item) {
                    return item[0] == url;
                });
            }
  
            /**
             * Get sites from url
             */
  
        }, {
            key: "Getsites",
            value: function Getsites() {
                var matching = [],
                    meta = readmeta();
                this.current.url = this.url;
                if (meta) {
                    this.current.auto = meta.auto;
                    this.current.url = meta.url;
                    delete meta.auto;
                    delete meta.url;
                    this.current.site = _extends({}, meta);
                    this.current.site.name.startsWith("metaread::") && (this.state = "meta");
                    this.current.site.name.startsWith("txtread::") && (this.state = "txt");
                } else {
                    getsite("local", new Map(this.sites.local), this.url, matching);
                    getsite("global", new Map(this.sites.global), this.url, matching);
                    getsite("custom", new Map(this.sites.custom), this.url, matching);
                    if (matching.length > 0) {
                        var found = matching[0];
                        this.current.url = found[0];
                        this.current.site = this.Safesite(_extends({}, found[1]), found[2], found[0]);
                        this.state = "adapter";
                    } else {
                        var obj = readmulti();
                        if (obj != -1) {
                            this.Newmultisite("read", obj);
                            this.state = "temp";
                        } else {
                            var $dom = readtmpl();
                            if ($dom != -1) {
                                this.Newsite("read", $dom[0].outerHTML);
                                this.dom = $dom[0];
                                this.state = "temp";
                            } else this.current.site = clone(site);
                        }
                    }
                }
                this.current.site.matching = matching;
            }
  
            /**
             * Add new sites to this.sites.global( global sites )
             * 
             * @param {object} sites.[array]
             * @return {int} update sites count
             */
  
        }, {
            key: "Addsites",
            value: function Addsites(result) {
                var count = 0;
                if (this.sites.global.length == 0) {
                    this.sites.global = this.Formatsites(result);
                    count = this.sites.global.length;
                } else {
                    var obj = addsites(this.Formatsites(result), this.sites.global);
                    count = obj.count;
                    this.sites.global = obj.newsites;
                }
                return count;
            }
  
            /**
             * Add new sites to this.sites.local( local sites )
             * 
             * @param  {object} new sites
             * @return {array} this.sites.local
             */
  
        }, {
            key: "Addlocalsites",
            value: function Addlocalsites(new_sites) {
                this.sites.local = [].concat(toConsumableArray(new_sites));
                return this.sites.local;
            }
  
            /**
             * Add all sites to this.sites
             * 
             * @param  {object} new sites
             * @return {object} this.sites
             */
  
        }, {
            key: "Addallsites",
            value: function Addallsites(sites) {
                this.sites = {
                    global: [].concat(toConsumableArray(sites.global)),
                    custom: [].concat(toConsumableArray(sites.custom)),
                    local: [].concat(toConsumableArray(sites.local))
                };
                return this.sites;
            }
  
            /**
             * Add new site( read only )
             * 
             * @param {string} include: focus, read
             * @param {string} when read html is dom.outerHTML
             */
  
        }, {
            key: "Newsite",
            value: function Newsite(mode, html) {
                var new_site = { mode: mode, url: window.location.href, site: { name: "tempread::" + window.location.host, title: "<title>", desc: "", include: "", exclude: [] } };
                html && (new_site.site.html = html);
                this.current.mode = new_site.mode, this.current.url = new_site.url;
                this.current.site = this.Safesite(_extends({}, new_site.site), "local", new_site.url);
                console.log("【read only】current site object is ", this.current);
            }
  
            /**
             * Add new multi-site( read only )
             * 
             * @param {string} include: focus, read
             * @param {object} multi-page, avator, include
             */
  
        }, {
            key: "Newmultisite",
            value: function Newmultisite(mode, multi) {
                var new_site = { mode: mode, url: window.location.href, site: { name: "tempread::" + window.location.host, title: "<title>", desc: "", include: multi.include, exclude: [], avatar: multi.avatar } };
                this.current.mode = new_site.mode, this.current.url = new_site.url;
                this.current.site = this.Safesite(_extends({}, new_site.site), "local", new_site.url);
                console.log("【read only】current multi-site object is ", this.current);
            }
  
            /**
             * Update url and site from param
             * 
             * @param {string} value is: global, custom, local
             * @param {string} older url
             * @param {array}  [ url, new site]
             */
  
        }, {
            key: "Updatesite",
            value: function Updatesite(key, older, newer) {
                var idx = this.sites[key].findIndex(function (item) {
                    return item[0] == older;
                });
                idx == -1 && (idx = this.sites[key].length);
                this.sites[key].splice(idx, 1, newer);
            }
  
            /**
             * Delete site from this.sites.local
             * 
             * @param {string} value is: global, custom, local
             * @param {string} older url
             * @param {func}   callback
             */
  
        }, {
            key: "Deletesite",
            value: function Deletesite(key, older, callback) {
                var idx = this.sites[key].findIndex(function (item) {
                    return item[0] == older;
                });
                idx != -1 && this.sites[key].splice(idx, 1);
                callback(idx);
            }
  
            /**
             * Safe site, add all site props
             * 
             * @param {object} modify site 
             * @param {string} target include: global custom local
             * @param {string} url 
             * @returns {object} site
             */
  
        }, {
            key: "Safesite",
            value: function Safesite(site, target, url) {
                site.url = url;
                site.target = target;
                site.name == "" && (site.name = "tempread::");
                (!site.avatar || site.avatar.length == 0) && (site.avatar = [{ name: "" }, { url: "" }]);
                (!site.paging || site.paging.length == 0) && (site.paging = [{ prev: "" }, { next: "" }]);
                return site;
            }
  
            /**
             * Clean useless site props
             * 
             * @param   {object} site
             * @returns {object} site
            */
  
        }, {
            key: "Cleansite",
            value: function Cleansite(site) {
                delete site.url;
                delete site.html;
                delete site.target;
                delete site.matching;
                site.avatar && site.avatar.length > 0 && site.avatar[0].name == "" && delete site.avatar;
                site.paging && site.paging.length > 0 && site.paging[0].prev == "" && delete site.paging;
                return site;
            }
  
            /**
             * Format sites object from local or remote json file
             * 
             * @param  {object} sites.[array]
             * @return {array} foramat e.g. [[ <url>, object ],[ <url>, object ]]
             */
  
        }, {
            key: "Formatsites",
            value: function Formatsites(result) {
                var format = new Map();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;
  
                try {
                    for (var _iterator = result.sites[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _site = _step.value;
  
                        if (verifysite(_site) != 0) continue;
                        var url = _site.url;
                        delete _site.url;
                        format.set(url, _site);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
  
                return [].concat(toConsumableArray(format));
            }
  
            /**
             * Clear sites
             * 
             * @param {string} site type, only include: global, custom. local
             */
  
        }, {
            key: "Clearsites",
            value: function Clearsites(type) {
                type ? this.sites[type] = [] : this.sites = { global: [], custom: [], local: [] };
            }
  
            /**
             * Add urls to origins
             * 
             * @param {json} result json
             */
  
        }, {
            key: "Origins",
            value: function Origins(result) {
                var urls = result.origins.map(function (item) {
                    return item.url;
                });
                urls = new Set(this.origins.concat(urls));
                urls.forEach(function (item) {
                    if (item.trim() == "" || !item.trim().startsWith("http") || !item.trim().endsWith(".json")) urls.delete(item);
                });
                this.origins = [].concat(toConsumableArray(urls));
                return this.origins;
            }
  
            /**
             * Add new sites to this.sites.custom( custom sites )
             * 
             * @param  {object} new sites
             * @return {array} this.sites.custom
             */
  
        }, {
            key: "Addorigins",
            value: function Addorigins(new_sites) {
                this.sites.custom = [].concat(toConsumableArray(new_sites));
                return this.sites.custom;
            }
  
            /**
             * Clear origins
             * 
             * @returns custom.length
             */
  
        }, {
            key: "Clearorigins",
            value: function Clearorigins() {
                var len = this.sites.custom.length;
                this.sites.custom = [];
                return len;
            }
        }]);
        return AdapteSite;
    }();
    function readmeta() {
        if (minimatch(location.href, "file://**/*.txt") || minimatch(location.href, "http*://**/*.txt")) {
            return readtxt();
        }
        var reg = /<\S+ (class|id)=("|')?[\w-_=;:' ]+("|')?>?$|<[^/][-_a-zA-Z0-9]+>?$/ig,
            // from util.verifyHtml()
        meta = {
            name: $("meta[name='simpread:name']").attr("content"),
            url: $("meta[name='simpread:url']").attr("content"),
            title: $("meta[name='simpread:title']").attr("content"),
            desc: $("meta[name='simpread:desc']").attr("content"),
            include: $("meta[name='simpread:include']").attr("content"),
            exp: $("meta[name='simpread:exclude']").attr("content"),
            auto: $("meta[name='simpread:auto']").attr("content"),
            exclude: []
        };
        if (meta.name && meta.include) {
            if (meta.url && !minimatch(location.href, meta.url)) {
                return undefined;
            }
            !meta.title && (meta.title = "<title>");
            !meta.desc && (meta.desc = "");
            !meta.exp && (meta.exp = "");
            meta.name = "metaread::" + meta.name;
            meta.auto = meta.auto == "true" ? true : false;
            var idx = ["title", "desc", "include", "exp"].findIndex(function (item) {
                return meta[item] != "" && !meta[item].match(reg);
            });
            meta.exclude.push(meta.exp);
            delete meta.exp;
            console.assert(idx == -1, "meta read mode error. ", meta);
            return idx == -1 ? meta : undefined;
        } else {
            console.warn("current not found meta data", meta);
            return undefined;
        }
    }
  
    /**
     * Read txt, include: file and http
     */
    function readtxt() {
        var title = location.pathname.split("/").pop(),
            type = location.protocol == "file:" ? "local" : "remote",
            meta = {
            name: "txtread::" + type,
            title: "<title>",
            desc: "",
            include: "<pre>",
            auto: false,
            exclude: []
        };
        if (type == "remote") {
            meta.include = "";
            meta.html = $("body pre").html().replace(/\n/ig, "<br>");
        }
        !$("title").html() && $("head").append("<title>" + decodeURI(title.replace(".txt", "")) + "</title>");
        return meta;
    }
  
    /**
     * Read mode template, include:
     * 
     * - Hexo
     * - WordPress
     * - Common( include <article> )
     * 
     * @return {jquery} jquery object
     */
    function readtmpl() {
        var $root = $("body"),
            selectors = [".post-content", ".entry-content", ".post-article", ".content-post", ".article-entry", ".article-content", ".article-body", ".markdown-body", "[itemprop='articleBody']", "article", ".post", ".content"];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;
  
        try {
            for (var _iterator2 = selectors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var selector$$1 = _step2.value;
  
                var $target = $root.find(selector$$1);
                if ($target.length > 0) {
                    console.warn("current selector is", selector$$1);
                    return $target;
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
  
        return -1;
    }
  
    /**
     * Read mode multi template, include:
     * 
     * - Discuz
     * - Discourse
     * 
     * @return {object} true: object; false: -1
     */
    function readmulti() {
        if (location.pathname.includes("thread") || location.pathname.includes("forum.php")) {
            if ($('.t_f').length > 0 && $('.favatar').find('.authi').length > 0 && $('.avatar').find('img').length > 0) {
                return {
                    avatar: [{ "name": "[[{$('.favatar').find('.authi')}]]" }, { "url": "[[{$('.avatar').find('img')}]]" }],
                    include: "[[{$('.t_f')}]]"
                };
            }
        } else if (/\/t\/[\w-]+\/\d+/.test(location.pathname) && $('meta[name=generator]').attr("content").includes("discourse")) {
            return {
                avatar: [{ "name": "[[{$('.topic-avatar').find('.a[data-user-card]')}]]" }, { "url": "[[{$('.topic-avatar').find('img')}]]" }],
                include: "[[{$('.cooked')}]]"
            };
        }
        return -1;
    }
  
    /**
     * Add new sites to old sites
     * 
     * @param  {array}  new     sites from local or remote
     * @param  {array}  current sites from this.sites.global
     * @return {object} count: new sites; forced: update sites( discard, all site must be forced update)
     */
    function addsites(newsites, old) {
        var oldsites = new Map(old),
            urls = [].concat(toConsumableArray(oldsites.keys()));
        var count = 0;
  
        newsites.map(function (site) {
            if (!urls.includes(site[0])) {
                count++;
            } else if (urls.includes(site[0])) {
            }
        });
        return { count: count, newsites: newsites };
    }
  
    /**
     * Find site by url from sites
     * 
     * @param  {string} type, include: global, local, custom
     * @param  {map}    sites
     * @param  {string} url
     * @param  {array}  matching sites
     * 
     * @return {array}  0: current site; 1: current url， 2: type
     */
    function getsite(type, sites, url) {
        var matching = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  
        var domain = function domain(names) {
            var arr = names.replace("www.", "").match(/\.\S+\.\S+/g);
            if (arr) {
                return arr[0].substr(1);
            } else {
                return names.replace("www.", "");
            }
        },
            urls = [].concat(toConsumableArray(sites.keys())),
            arr = url.match(/[.a-zA-z0-9-_]+/g),
            uri = arr[1].replace("www.", ""),
            hostname = domain(window.location.hostname),
            isroot = function isroot() {
            return window.location.pathname == "/" || /\/(default|index|portal).[0-9a-zA-Z]+$/.test(window.location.pathname);
        };
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;
  
        try {
            for (var _iterator3 = urls[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var cur = _step3.value;
  
                var name = sites.get(cur).name,
                    sufname = domain(name);
                if (!isroot() && !cur.endsWith("*") && cur.replace(/^http[s]?:/, "") == url.replace(/^http[s]?:/, "")) {
                    matching.push([cur, clone(sites.get(cur)), type]);
                } else if (cur.match(/\*/g) && cur.match(/\*/g).length == 1 && !isroot() && cur.endsWith("*") && uri.includes(sufname) && hostname == sufname && url.includes(name)) {
                    // e.g. https://www.douban.com/* http://mp.weixin.qq.com/*
                    matching.push([cur, clone(sites.get(cur)), type]);
                } else if (minimatch(window.location.origin + window.location.pathname, cur)) {
                    matching.push([cur, clone(sites.get(cur)), type]);
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }
    }
  
    /**
     * Verify site validity, include:
     * - name, url, include, error is -1
     * - title include desc, error is -2
     * - paging, error is -3 ~ -6
     * - avatar, error is -7 ~ -10
     * 
     * @param {object} site 
     */
    function verifysite(site) {
        if (!site.name || !site.url || !site.include) return -1;
        if (verifyHtml(site.title)[0] == -1 || verifyHtml(site.include)[0] == -1 || verifyHtml(site.desc)[0] == -1) {
            return -2;
        }
        if (site.paging) {
            if (site.paging.length != 2) return -3;
            if (!site.paging[0].prev) return -4;
            if (!site.paging[1].next) return -5;
            if (verifyHtml(site.paging[0].prev)[0] == -1 || verifyHtml(site.paging[1].next)[0] == -1) {
                return -6;
            }
        }
        if (site.avatar) {
            if (site.avatar.length != 2) return -7;
            if (!site.avatar[0].name) return -8;
            if (!site.avatar[1].url) return -9;
            if (verifyHtml(site.avatar[0].name)[0] == -1 || verifyHtml(site.avatar[1].url)[0] == -1) {
                return -10;
            }
        }
        return 0;
    }
  
    console.log("=== PureRead: PureRead load ===");
  
    var PureRead = function (_AdapteSite) {
        inherits(PureRead, _AdapteSite);
  
        function PureRead(sites) {
            classCallCheck(this, PureRead);
  
            var _this = possibleConstructorReturn(this, (PureRead.__proto__ || Object.getPrototypeOf(PureRead)).call(this, sites));
  
            _this.version = "0.0.2";
            _this.org_url = location.href;
            _this.html = {}; // clone site, include: title, desc, include, avatar, paging
            _this.plugin = {};
            return _this;
        }
  
        /**
         * Verify current puread is same
         * 
         * @return {boolean} true: same; false: not same;
         */
  
  
        createClass(PureRead, [{
            key: 'Exist',
            value: function Exist() {
                return this.org_url == location.href;
            }
  
            /**
             * Add Plugin
             * 
             * @param {object} plugin object
             */
  
        }, {
            key: 'AddPlugin',
            value: function AddPlugin(plugin) {
                this.plugin = {
                    minimatch: plugin.minimatch,
                    pangu: plugin.pangu,
                    beautify: plugin.beautify,
                    stylesheet: plugin.style
                };
                get(PureRead.prototype.__proto__ || Object.getPrototypeOf(PureRead.prototype), 'SetMinimatch', this).call(this, this.plugin.minimatch);
            }
  
            /**
             * Create temp read mode
             * 
             * @param {string} include: read, focus
             * @param {dom} html dom element
             */
  
        }, {
            key: 'TempMode',
            value: function TempMode(mode, dom) {
                this.state = "temp";
                this.dom = dom;
                this.Newsite(mode, dom.outerHTML);
            }
  
            /**
             * Get read mode html
             */
  
        }, {
            key: 'ReadMode',
            value: function ReadMode() {
                this.html = wrap(this.current.site);
            }
  
            /**
             * Get highlight( focus ) jquery, only usage focus mode
             * 
             * @return {jquery} jquery object
             */
  
        }, {
            key: 'Include',
            value: function Include() {
                var include = this.current.site.include,
                    $focus = [];
                var target = selector(include);
                try {
                    if (specTest(target)) {
                        var _util$specAction = specAction(include),
                            _util$specAction2 = slicedToArray(_util$specAction, 2),
                            value = _util$specAction2[0],
                            state = _util$specAction2[1];
  
                        if (state == 0) {
                            include = include.replace(/\[\[{\$\(|}\]\]|\).html\(\)/g, "");
                            $focus = $(specAction('[[[' + include + ']]]')[0]);
                        } else if (state == 3) {
                            $focus = value;
                        }
                    } else if (target) {
                        $focus = $("body").find(target);
                    }
                } catch (error) {
                    console.error("Get $focus failed", error);
                }
                return $focus;
            }
  
            /**
             * Get exlcude jquery selector array list
             * 
             * @param  {jquery} jquery object
             * @return {array} jquery selector
             */
  
        }, {
            key: 'Exclude',
            value: function Exclude($target) {
                return excludeSelector($target, this.current.site.exclude);
            }
  
            /**
             * Beautify html
             * 
             * @param {jquery} jquery
             */
  
        }, {
            key: 'Beautify',
            value: function Beautify($target) {
                if (this.plugin.beautify) {
                    this.plugin.beautify.specbeautify(this.current.site.name, $target);
                    this.plugin.beautify.removeSpareTag(this.current.site.name, $target);
                    this.plugin.beautify.htmlbeautify($target);
                    this.plugin.beautify.commbeautify(this.current.site.name, $target);
                }
            }
  
            /**
             * Format usage pangu plugin
             * 
             * @param {string} class name
             */
  
        }, {
            key: 'Format',
            value: function Format(cls) {
                this.plugin.pangu && this.plugin.pangu.spacingElementByClassName(cls);
            }
        }]);
        return PureRead;
    }(AdapteSite);
    function wrap(site) {
        var wrapper = clone(site),
            title = selector(site.title == "" ? "<title>" : site.title),
            desc = selector(site.desc),
            include = selector(site.include);
        wrapper.title = query(title);
        wrapper.desc = query(desc);
        wrapper.include = site.include == "" && site.html != "" ? site.html : query(include, "html");
        wrapper.avatar && wrapper.avatar.length > 0 && wrapper.avatar[0].name == "" && delete wrapper.avatar;
        wrapper.paging && wrapper.paging.length > 0 && wrapper.paging[0].prev == "" && delete wrapper.paging;
        wrapper.avatar && wrapper.avatar.forEach(function (item) {
            var key = Object.keys(item).join(),
                value = item[key];
            item[key] = query(selector(value), "html");
        });
        wrapper.paging && wrapper.paging.forEach(function (item) {
            var key = Object.keys(item).join(),
                value = item[key];
            item[key] = query(selector(value));
        });
        return wrapper;
    }
  
    /**
     * Query content usage jquery
     * 
     * @param  {string} query content
     * @param  {string} type, incldue: text,  html and multi
     * @return {string} query result
     */
    function query(content) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "text";
  
        var $root = $("html");
        if (specTest(content)) {
            var _util$specAction3 = specAction(content),
                _util$specAction4 = slicedToArray(_util$specAction3, 2),
                value = _util$specAction4[0],
                state = _util$specAction4[1];
  
            if (state == 0) {
                content = value;
            } else if (state == 3) {
                content = getcontent($root.find(value));
            }
        } else if (type == "html") {
            content = getcontent($root.find(content));
        } else if (type == "multi") {
            // TO-DO
        } else {
            content = $root.find(content).text().trim();
        }
        return content;
    }
  
    /**
     * Get content from current.site.include
     * 
     * @param  {jquery} jquery object e.g. $root.find( content )
     * @return {string} $target html
     */
    function getcontent($target) {
        var html = "";
        switch ($target.length) {
            case 0:
                html = "<sr-rd-content-error></sr-rd-content-error>";
                break;
            case 1:
                html = $target.html().trim();
                break;
            default:
                html = $target.map(function (index, item) {
                    return $(item).html();
                }).get().join("<br>");
                break;
        }
        return html;
    }
  
    /**
     * Get exclude tags list
     * 
     * @param  {jquery} jquery object
     * @param  {array}  hidden html
     * @return {string} tags list string
     */
    function excludeSelector($target, exclude) {
        var tags = [],
            tag = "";
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
  
        try {
            for (var _iterator = exclude[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var content = _step.value;
  
                if (specTest(content)) {
                    var _util$specAction5 = specAction(content),
                        _util$specAction6 = slicedToArray(_util$specAction5, 2),
                        value = _util$specAction6[0],
                        type = _util$specAction6[1];
  
                    if (type == 1) {
                        tag = value;
                    } else if (type == 2) {
                        var arr = $target.html().match(new RegExp(value, "g"));
                        if (arr && arr.length > 0) {
                            var str = arr.join("");
                            tag = '*[' + str + ']';
                        } else {
                            tag = undefined;
                        }
                    } else if (type == 3) {
                        value.remove();
                    }
                } else {
                    tag = selector(content);
                }
                if (tag) tags.push(tag);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
  
        return tags.join(",");
    }
  
    return PureRead;
  
}());

// https://github.com/kenshin/puread
var puplugin = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var pangu_min = createCommonjsModule(function (module, exports) {
	  /*!
	   * pangu.js
	   * --------
	   * @version: 3.3.0
	   * @homepage: https://github.com/vinta/pangu.js
	   * @license: MIT
	   * @author: Vinta Chen <vinta.chen@gmail.com> (https://github.com/vinta)
	   */
	  !function (e, u) {
	    module.exports = u();
	  }(commonjsGlobal, function () {
	    return function (e) {
	      function u(a) {
	        if (f[a]) return f[a].exports;var t = f[a] = { exports: {}, id: a, loaded: !1 };return e[a].call(t.exports, t, t.exports, u), t.loaded = !0, t.exports;
	      }var f = {};return u.m = e, u.c = f, u.p = "", u(0);
	    }([function (e, u, f) {
	      function a(e, u) {
	        if (!(e instanceof u)) throw new TypeError("Cannot call a class as a function");
	      }function t(e, u) {
	        if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !u || "object" != (typeof u === 'undefined' ? 'undefined' : _typeof(u)) && "function" != typeof u ? e : u;
	      }function n(e, u) {
	        if ("function" != typeof u && null !== u) throw new TypeError("Super expression must either be null or a function, not " + (typeof u === 'undefined' ? 'undefined' : _typeof(u)));e.prototype = Object.create(u && u.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), u && (Object.setPrototypeOf ? Object.setPrototypeOf(e, u) : e.__proto__ = u);
	      }var i = function () {
	        function e(e, u) {
	          for (var f = 0; f < u.length; f++) {
	            var a = u[f];a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, a.key, a);
	          }
	        }return function (u, f, a) {
	          return f && e(u.prototype, f), a && e(u, a), u;
	        };
	      }(),
	          r = f(1).Pangu,
	          o = 8,
	          s = function (e) {
	        function u() {
	          a(this, u);var e = t(this, Object.getPrototypeOf(u).call(this));return e.topTags = /^(html|head|body|#document)$/i, e.ignoreTags = /^(script|code|pre|textarea)$/i, e.spaceSensitiveTags = /^(a|del|pre|s|strike|u)$/i, e.spaceLikeTags = /^(br|hr|i|img|pangu)$/i, e.blockTags = /^(div|h1|h2|h3|h4|h5|h6|p)$/i, e;
	        }return n(u, e), i(u, [{ key: "canIgnoreNode", value: function value(e) {
	            for (var u = e.parentNode; u && u.nodeName && u.nodeName.search(this.topTags) === -1;) {
	              if (u.nodeName.search(this.ignoreTags) >= 0 || u.isContentEditable || "true" === u.getAttribute("g_editable")) return !0;u = u.parentNode;
	            }return !1;
	          } }, { key: "isFirstTextChild", value: function value(e, u) {
	            for (var f = e.childNodes, a = 0; a < f.length; a++) {
	              var t = f[a];if (t.nodeType !== o && t.textContent) return t === u;
	            }return !1;
	          } }, { key: "isLastTextChild", value: function value(e, u) {
	            for (var f = e.childNodes, a = f.length - 1; a > -1; a--) {
	              var t = f[a];if (t.nodeType !== o && t.textContent) return t === u;
	            }return !1;
	          } }, { key: "spacingNodeByXPath", value: function value(e, u) {
	            for (var f = document.evaluate(e, u, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), a = void 0, t = void 0, n = f.snapshotLength - 1; n > -1; --n) {
	              if (a = f.snapshotItem(n), this.canIgnoreNode(a)) t = a;else {
	                var i = this.spacing(a.data);if (a.data !== i && (a.data = i), t) {
	                  if (a.nextSibling && a.nextSibling.nodeName.search(this.spaceLikeTags) >= 0) {
	                    t = a;continue;
	                  }var r = a.data.toString().substr(-1) + t.data.toString().substr(0, 1),
	                      o = this.spacing(r);if (o !== r) {
	                    for (var s = t; s.parentNode && s.nodeName.search(this.spaceSensitiveTags) === -1 && this.isFirstTextChild(s.parentNode, s);) {
	                      s = s.parentNode;
	                    }for (var c = a; c.parentNode && c.nodeName.search(this.spaceSensitiveTags) === -1 && this.isLastTextChild(c.parentNode, c);) {
	                      c = c.parentNode;
	                    }if (c.nextSibling && c.nextSibling.nodeName.search(this.spaceLikeTags) >= 0) {
	                      t = a;continue;
	                    }if (c.nodeName.search(this.blockTags) === -1) if (s.nodeName.search(this.spaceSensitiveTags) === -1) s.nodeName.search(this.ignoreTags) === -1 && s.nodeName.search(this.blockTags) === -1 && (t.previousSibling ? t.previousSibling.nodeName.search(this.spaceLikeTags) === -1 && (t.data = " " + t.data) : this.canIgnoreNode(t) || (t.data = " " + t.data));else if (c.nodeName.search(this.spaceSensitiveTags) === -1) a.data = a.data + " ";else {
	                      var d = document.createElement("pangu");d.innerHTML = " ", s.previousSibling ? s.previousSibling.nodeName.search(this.spaceLikeTags) === -1 && s.parentNode.insertBefore(d, s) : s.parentNode.insertBefore(d, s), d.previousElementSibling || d.parentNode && d.parentNode.removeChild(d);
	                    }
	                  }
	                }t = a;
	              }
	            }
	          } }, { key: "spacingNode", value: function value(e) {
	            var u = ".//*/text()[normalize-space(.)]";this.spacingNodeByXPath(u, e);
	          } }, { key: "spacingElementById", value: function value(e) {
	            var u = 'id("' + e + '")//text()';this.spacingNodeByXPath(u, document);
	          } }, { key: "spacingElementByClassName", value: function value(e) {
	            var u = '//*[contains(concat(" ", normalize-space(@class), " "), "' + e + '")]//text()';this.spacingNodeByXPath(u, document);
	          } }, { key: "spacingElementByTagName", value: function value(e) {
	            var u = "//" + e + "//text()";this.spacingNodeByXPath(u, document);
	          } }, { key: "spacingPageTitle", value: function value() {
	            var e = "/html/head/title/text()";this.spacingNodeByXPath(e, document);
	          } }, { key: "spacingPageBody", value: function value() {
	            for (var e = "/html/body//*/text()[normalize-space(.)]", u = ["script", "style", "textarea"], f = 0; f < u.length; f++) {
	              var a = u[f];e += '[translate(name(..),"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")!="' + a + '"]';
	            }this.spacingNodeByXPath(e, document);
	          } }, { key: "spacingPage", value: function value() {
	            this.spacingPageTitle(), this.spacingPageBody();
	          } }]), u;
	      }(r),
	          c = new s();u = e.exports = c, u.Pangu = s;
	    }, function (e, u) {
	      function f(e, u) {
	        if (!(e instanceof u)) throw new TypeError("Cannot call a class as a function");
	      }var a = function () {
	        function e(e, u) {
	          for (var f = 0; f < u.length; f++) {
	            var a = u[f];a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, a.key, a);
	          }
	        }return function (u, f, a) {
	          return f && e(u.prototype, f), a && e(u, a), u;
	        };
	      }(),
	          t = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])(["])/g,
	          n = /(["])([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          i = /(["']+)(\s*)(.+?)(\s*)(["']+)/g,
	          r = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])( )(')([A-Za-z])/g,
	          o = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])(#)([A-Za-z0-9\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+)(#)([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          s = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])(#([^ ]))/g,
	          c = /(([^ ])#)([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          d = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([\+\-\*\/=&\\|<>])([A-Za-z0-9])/g,
	          p = /([A-Za-z0-9])([\+\-\*\/=&\\|<>])([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          l = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([\(\[\{<\u201c]+(.*?)[\)\]\}>\u201d]+)([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          g = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([\(\[\{<\u201c>])/g,
	          h = /([\)\]\}>\u201d<])([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          v = /([\(\[\{<\u201c]+)(\s*)(.+?)(\s*)([\)\]\}>\u201d]+)/,
	          b = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([~!;:,\.\?\u2026])([A-Za-z0-9])/g,
	          y = /([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([A-Za-z0-9`\$%\^&\*\-=\+\\\|\/@\u00a1-\u00ff\u2022\u2027\u2150-\u218f])/g,
	          m = /([A-Za-z0-9`~\$%\^&\*\-=\+\\\|\/!;:,\.\?\u00a1-\u00ff\u2022\u2026\u2027\u2150-\u218f])([\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g,
	          $ = function () {
	        function e() {
	          f(this, e);
	        }return a(e, [{ key: "spacing", value: function value(e) {
	            var u = e;u = u.replace(t, "$1 $2"), u = u.replace(n, "$1 $2"), u = u.replace(i, "$1$3$5"), u = u.replace(r, "$1$3$4"), u = u.replace(o, "$1 $2$3$4 $5"), u = u.replace(s, "$1 $2"), u = u.replace(c, "$1 $3"), u = u.replace(d, "$1 $2 $3"), u = u.replace(p, "$1 $2 $3");var f = u,
	                a = u.replace(l, "$1 $2 $4");return u = a, f === a && (u = u.replace(g, "$1 $2"), u = u.replace(h, "$1 $2")), u = u.replace(v, "$1$3$5"), u = u.replace(b, "$1$2 $3"), u = u.replace(y, "$1 $2"), u = u.replace(m, "$1 $2");
	          } }, { key: "spacingText", value: function value(e) {
	            var u = arguments.length <= 1 || void 0 === arguments[1] ? function () {} : arguments[1];try {
	              var f = this.spacing(e);u(null, f);
	            } catch (a) {
	              u(a);
	            }
	          } }]), e;
	      }(),
	          N = new $();u = e.exports = N, u.Pangu = $;
	    }]);
	  });
	  
	});
	var pangu_min_1 = pangu_min.pangu;

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	function resolve() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : '/';

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	}
	// path.normalize(path)
	// posix version
	function normalize(path) {
	  var isPathAbsolute = isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isPathAbsolute).join('/');

	  if (!path && !isPathAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isPathAbsolute ? '/' : '') + path;
	}
	// posix version
	function isAbsolute(path) {
	  return path.charAt(0) === '/';
	}

	// posix version
	function join() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	}


	// path.relative(from, to)
	// posix version
	function relative(from, to) {
	  from = resolve(from).substr(1);
	  to = resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	}

	var sep = '/';
	var delimiter = ':';

	function dirname(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	}

	function basename(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	}


	function extname(path) {
	  return splitPath(path)[3];
	}
	var path = {
	  extname: extname,
	  basename: basename,
	  dirname: dirname,
	  sep: sep,
	  delimiter: delimiter,
	  relative: relative,
	  join: join,
	  isAbsolute: isAbsolute,
	  normalize: normalize,
	  resolve: resolve
	};
	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b' ?
	    function (str, start, len) { return str.substr(start, len) } :
	    function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	var path$1 = /*#__PURE__*/Object.freeze({
		resolve: resolve,
		normalize: normalize,
		isAbsolute: isAbsolute,
		join: join,
		relative: relative,
		sep: sep,
		delimiter: delimiter,
		dirname: dirname,
		basename: basename,
		extname: extname,
		default: path
	});

	var concatMap = function (xs, fn) {
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        var x = fn(xs[i], i);
	        if (isArray(x)) res.push.apply(res, x);
	        else res.push(x);
	    }
	    return res;
	};

	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};

	var balancedMatch = balanced;
	function balanced(a, b, str) {
	  if (a instanceof RegExp) a = maybeMatch(a, str);
	  if (b instanceof RegExp) b = maybeMatch(b, str);

	  var r = range(a, b, str);

	  return r && {
	    start: r[0],
	    end: r[1],
	    pre: str.slice(0, r[0]),
	    body: str.slice(r[0] + a.length, r[1]),
	    post: str.slice(r[1] + b.length)
	  };
	}

	function maybeMatch(reg, str) {
	  var m = str.match(reg);
	  return m ? m[0] : null;
	}

	balanced.range = range;
	function range(a, b, str) {
	  var begs, beg, left, right, result;
	  var ai = str.indexOf(a);
	  var bi = str.indexOf(b, ai + 1);
	  var i = ai;

	  if (ai >= 0 && bi > 0) {
	    begs = [];
	    left = str.length;

	    while (i >= 0 && !result) {
	      if (i == ai) {
	        begs.push(i);
	        ai = str.indexOf(a, i + 1);
	      } else if (begs.length == 1) {
	        result = [ begs.pop(), bi ];
	      } else {
	        beg = begs.pop();
	        if (beg < left) {
	          left = beg;
	          right = bi;
	        }

	        bi = str.indexOf(b, i + 1);
	      }

	      i = ai < bi && ai >= 0 ? ai : bi;
	    }

	    if (begs.length) {
	      result = [ left, right ];
	    }
	  }

	  return result;
	}

	var braceExpansion = expandTop;

	var escSlash = '\0SLASH'+Math.random()+'\0';
	var escOpen = '\0OPEN'+Math.random()+'\0';
	var escClose = '\0CLOSE'+Math.random()+'\0';
	var escComma = '\0COMMA'+Math.random()+'\0';
	var escPeriod = '\0PERIOD'+Math.random()+'\0';

	function numeric(str) {
	  return parseInt(str, 10) == str
	    ? parseInt(str, 10)
	    : str.charCodeAt(0);
	}

	function escapeBraces(str) {
	  return str.split('\\\\').join(escSlash)
	            .split('\\{').join(escOpen)
	            .split('\\}').join(escClose)
	            .split('\\,').join(escComma)
	            .split('\\.').join(escPeriod);
	}

	function unescapeBraces(str) {
	  return str.split(escSlash).join('\\')
	            .split(escOpen).join('{')
	            .split(escClose).join('}')
	            .split(escComma).join(',')
	            .split(escPeriod).join('.');
	}


	// Basically just str.split(","), but handling cases
	// where we have nested braced sections, which should be
	// treated as individual members, like {a,{b,c},d}
	function parseCommaParts(str) {
	  if (!str)
	    return [''];

	  var parts = [];
	  var m = balancedMatch('{', '}', str);

	  if (!m)
	    return str.split(',');

	  var pre = m.pre;
	  var body = m.body;
	  var post = m.post;
	  var p = pre.split(',');

	  p[p.length-1] += '{' + body + '}';
	  var postParts = parseCommaParts(post);
	  if (post.length) {
	    p[p.length-1] += postParts.shift();
	    p.push.apply(p, postParts);
	  }

	  parts.push.apply(parts, p);

	  return parts;
	}

	function expandTop(str) {
	  if (!str)
	    return [];

	  // I don't know why Bash 4.3 does this, but it does.
	  // Anything starting with {} will have the first two bytes preserved
	  // but *only* at the top level, so {},a}b will not expand to anything,
	  // but a{},b}c will be expanded to [a}c,abc].
	  // One could argue that this is a bug in Bash, but since the goal of
	  // this module is to match Bash's rules, we escape a leading {}
	  if (str.substr(0, 2) === '{}') {
	    str = '\\{\\}' + str.substr(2);
	  }

	  return expand(escapeBraces(str), true).map(unescapeBraces);
	}

	function embrace(str) {
	  return '{' + str + '}';
	}
	function isPadded(el) {
	  return /^-?0\d/.test(el);
	}

	function lte(i, y) {
	  return i <= y;
	}
	function gte(i, y) {
	  return i >= y;
	}

	function expand(str, isTop) {
	  var expansions = [];

	  var m = balancedMatch('{', '}', str);
	  if (!m || /\$$/.test(m.pre)) return [str];

	  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
	  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
	  var isSequence = isNumericSequence || isAlphaSequence;
	  var isOptions = m.body.indexOf(',') >= 0;
	  if (!isSequence && !isOptions) {
	    // {a},b}
	    if (m.post.match(/,.*\}/)) {
	      str = m.pre + '{' + m.body + escClose + m.post;
	      return expand(str);
	    }
	    return [str];
	  }

	  var n;
	  if (isSequence) {
	    n = m.body.split(/\.\./);
	  } else {
	    n = parseCommaParts(m.body);
	    if (n.length === 1) {
	      // x{{a,b}}y ==> x{a}y x{b}y
	      n = expand(n[0], false).map(embrace);
	      if (n.length === 1) {
	        var post = m.post.length
	          ? expand(m.post, false)
	          : [''];
	        return post.map(function(p) {
	          return m.pre + n[0] + p;
	        });
	      }
	    }
	  }

	  // at this point, n is the parts, and we know it's not a comma set
	  // with a single entry.

	  // no need to expand pre, since it is guaranteed to be free of brace-sets
	  var pre = m.pre;
	  var post = m.post.length
	    ? expand(m.post, false)
	    : [''];

	  var N;

	  if (isSequence) {
	    var x = numeric(n[0]);
	    var y = numeric(n[1]);
	    var width = Math.max(n[0].length, n[1].length);
	    var incr = n.length == 3
	      ? Math.abs(numeric(n[2]))
	      : 1;
	    var test = lte;
	    var reverse = y < x;
	    if (reverse) {
	      incr *= -1;
	      test = gte;
	    }
	    var pad = n.some(isPadded);

	    N = [];

	    for (var i = x; test(i, y); i += incr) {
	      var c;
	      if (isAlphaSequence) {
	        c = String.fromCharCode(i);
	        if (c === '\\')
	          c = '';
	      } else {
	        c = String(i);
	        if (pad) {
	          var need = width - c.length;
	          if (need > 0) {
	            var z = new Array(need + 1).join('0');
	            if (i < 0)
	              c = '-' + z + c.slice(1);
	            else
	              c = z + c;
	          }
	        }
	      }
	      N.push(c);
	    }
	  } else {
	    N = concatMap(n, function(el) { return expand(el, false) });
	  }

	  for (var j = 0; j < N.length; j++) {
	    for (var k = 0; k < post.length; k++) {
	      var expansion = pre + N[j] + post[k];
	      if (!isTop || isSequence || expansion)
	        expansions.push(expansion);
	    }
	  }

	  return expansions;
	}

	var require$$0 = ( path$1 && path ) || path$1;

	var minimatch_1 = minimatch;
	minimatch.Minimatch = Minimatch;

	var path$2 = { sep: '/' };
	try {
	  path$2 = require$$0;
	} catch (er) {}

	var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};

	var plTypes = {
	  '!': { open: '(?:(?!(?:', close: '))[^/]*?)' },
	  '?': { open: '(?:', close: ')?' },
	  '+': { open: '(?:', close: ')+' },
	  '*': { open: '(?:', close: ')*' },
	  '@': { open: '(?:', close: ')' }

	  // any single thing other than /
	  // don't need to escape / when using new RegExp()
	};var qmark = '[^/]';

	// * => any number of characters
	var star = qmark + '*?';

	// ** when dots are allowed.  Anything goes, except .. and .
	// not (^ or / followed by one or two dots followed by $ or /),
	// followed by anything, any number of times.
	var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

	// not a ^ or / followed by a dot,
	// followed by anything, any number of times.
	var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

	// characters that need to be escaped in RegExp.
	var reSpecials = charSet('().*{}+?[]^$\\!');

	// "abc" -> { a:true, b:true, c:true }
	function charSet(s) {
	  return s.split('').reduce(function (set, c) {
	    set[c] = true;
	    return set;
	  }, {});
	}

	// normalizes slashes.
	var slashSplit = /\/+/;

	minimatch.filter = filter$1;
	function filter$1(pattern, options) {
	  options = options || {};
	  return function (p, i, list) {
	    return minimatch(p, pattern, options);
	  };
	}

	function ext(a, b) {
	  a = a || {};
	  b = b || {};
	  var t = {};
	  Object.keys(b).forEach(function (k) {
	    t[k] = b[k];
	  });
	  Object.keys(a).forEach(function (k) {
	    t[k] = a[k];
	  });
	  return t;
	}

	minimatch.defaults = function (def) {
	  if (!def || !Object.keys(def).length) return minimatch;

	  var orig = minimatch;

	  var m = function minimatch(p, pattern, options) {
	    return orig.minimatch(p, pattern, ext(def, options));
	  };

	  m.Minimatch = function Minimatch(pattern, options) {
	    return new orig.Minimatch(pattern, ext(def, options));
	  };

	  return m;
	};

	Minimatch.defaults = function (def) {
	  if (!def || !Object.keys(def).length) return Minimatch;
	  return minimatch.defaults(def).Minimatch;
	};

	function minimatch(p, pattern, options) {
	  if (typeof pattern !== 'string') {
	    throw new TypeError('glob pattern string required');
	  }

	  if (!options) options = {};

	  // shortcut: comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    return false;
	  }

	  // "" only matches ""
	  if (pattern.trim() === '') return p === '';

	  return new Minimatch(pattern, options).match(p);
	}

	function Minimatch(pattern, options) {
	  if (!(this instanceof Minimatch)) {
	    return new Minimatch(pattern, options);
	  }

	  if (typeof pattern !== 'string') {
	    throw new TypeError('glob pattern string required');
	  }

	  if (!options) options = {};
	  pattern = pattern.trim();

	  // windows support: need to use /, not \
	  if (path$2.sep !== '/') {
	    pattern = pattern.split(path$2.sep).join('/');
	  }

	  this.options = options;
	  this.set = [];
	  this.pattern = pattern;
	  this.regexp = null;
	  this.negate = false;
	  this.comment = false;
	  this.empty = false;

	  // make the set of regexps etc.
	  this.make();
	}

	Minimatch.prototype.debug = function () {};

	Minimatch.prototype.make = make;
	function make() {
	  // don't do it more than once.
	  if (this._made) return;

	  var pattern = this.pattern;
	  var options = this.options;

	  // empty patterns and comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    this.comment = true;
	    return;
	  }
	  if (!pattern) {
	    this.empty = true;
	    return;
	  }

	  // step 1: figure out negation, etc.
	  this.parseNegate();

	  // step 2: expand braces
	  var set = this.globSet = this.braceExpand();

	  if (options.debug) this.debug = console.error;

	  this.debug(this.pattern, set);

	  // step 3: now we have a set, so turn each one into a series of path-portion
	  // matching patterns.
	  // These will be regexps, except in the case of "**", which is
	  // set to the GLOBSTAR object for globstar behavior,
	  // and will not contain any / characters
	  set = this.globParts = set.map(function (s) {
	    return s.split(slashSplit);
	  });

	  this.debug(this.pattern, set);

	  // glob --> regexps
	  set = set.map(function (s, si, set) {
	    return s.map(this.parse, this);
	  }, this);

	  this.debug(this.pattern, set);

	  // filter out everything that didn't compile properly.
	  set = set.filter(function (s) {
	    return s.indexOf(false) === -1;
	  });

	  this.debug(this.pattern, set);

	  this.set = set;
	}

	Minimatch.prototype.parseNegate = parseNegate;
	function parseNegate() {
	  var pattern = this.pattern;
	  var negate = false;
	  var options = this.options;
	  var negateOffset = 0;

	  if (options.nonegate) return;

	  for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
	    negate = !negate;
	    negateOffset++;
	  }

	  if (negateOffset) this.pattern = pattern.substr(negateOffset);
	  this.negate = negate;
	}

	// Brace expansion:
	// a{b,c}d -> abd acd
	// a{b,}c -> abc ac
	// a{0..3}d -> a0d a1d a2d a3d
	// a{b,c{d,e}f}g -> abg acdfg acefg
	// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
	//
	// Invalid sets are not expanded.
	// a{2..}b -> a{2..}b
	// a{b}c -> a{b}c
	minimatch.braceExpand = function (pattern, options) {
	  return braceExpand(pattern, options);
	};

	Minimatch.prototype.braceExpand = braceExpand;

	function braceExpand(pattern, options) {
	  if (!options) {
	    if (this instanceof Minimatch) {
	      options = this.options;
	    } else {
	      options = {};
	    }
	  }

	  pattern = typeof pattern === 'undefined' ? this.pattern : pattern;

	  if (typeof pattern === 'undefined') {
	    throw new TypeError('undefined pattern');
	  }

	  if (options.nobrace || !pattern.match(/\{.*\}/)) {
	    // shortcut. no need to expand.
	    return [pattern];
	  }

	  return braceExpansion(pattern);
	}

	// parse a component of the expanded set.
	// At this point, no pattern may contain "/" in it
	// so we're going to return a 2d array, where each entry is the full
	// pattern, split on '/', and then turned into a regular expression.
	// A regexp is made at the end which joins each array with an
	// escaped /, and another full one which joins each regexp with |.
	//
	// Following the lead of Bash 4.1, note that "**" only has special meaning
	// when it is the *only* thing in a path portion.  Otherwise, any series
	// of * is equivalent to a single *.  Globstar behavior is enabled by
	// default, and can be disabled by setting options.noglobstar.
	Minimatch.prototype.parse = parse;
	var SUBPARSE = {};
	function parse(pattern, isSub) {
	  if (pattern.length > 1024 * 64) {
	    throw new TypeError('pattern is too long');
	  }

	  var options = this.options;

	  // shortcuts
	  if (!options.noglobstar && pattern === '**') return GLOBSTAR;
	  if (pattern === '') return '';

	  var re = '';
	  var hasMagic = !!options.nocase;
	  var escaping = false;
	  // ? => one single character
	  var patternListStack = [];
	  var negativeLists = [];
	  var stateChar;
	  var inClass = false;
	  var reClassStart = -1;
	  var classStart = -1;
	  // . and .. never match anything that doesn't start with .,
	  // even when options.dot is set.
	  var patternStart = pattern.charAt(0) === '.' ? '' // anything
	  // not (start or / followed by . or .. followed by / or end)
	  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';
	  var self = this;

	  function clearStateChar() {
	    if (stateChar) {
	      // we had some state-tracking character
	      // that wasn't consumed by this pass.
	      switch (stateChar) {
	        case '*':
	          re += star;
	          hasMagic = true;
	          break;
	        case '?':
	          re += qmark;
	          hasMagic = true;
	          break;
	        default:
	          re += '\\' + stateChar;
	          break;
	      }
	      self.debug('clearStateChar %j %j', stateChar, re);
	      stateChar = false;
	    }
	  }

	  for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
	    this.debug('%s\t%s %s %j', pattern, i, re, c);

	    // skip over any that are escaped.
	    if (escaping && reSpecials[c]) {
	      re += '\\' + c;
	      escaping = false;
	      continue;
	    }

	    switch (c) {
	      case '/':
	        // completely not allowed, even escaped.
	        // Should already be path-split by now.
	        return false;

	      case '\\':
	        clearStateChar();
	        escaping = true;
	        continue;

	      // the various stateChar values
	      // for the "extglob" stuff.
	      case '?':
	      case '*':
	      case '+':
	      case '@':
	      case '!':
	        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

	        // all of those are literals inside a class, except that
	        // the glob [!a] means [^a] in regexp
	        if (inClass) {
	          this.debug('  in class');
	          if (c === '!' && i === classStart + 1) c = '^';
	          re += c;
	          continue;
	        }

	        // if we already have a stateChar, then it means
	        // that there was something like ** or +? in there.
	        // Handle the stateChar, then proceed with this one.
	        self.debug('call clearStateChar %j', stateChar);
	        clearStateChar();
	        stateChar = c;
	        // if extglob is disabled, then +(asdf|foo) isn't a thing.
	        // just clear the statechar *now*, rather than even diving into
	        // the patternList stuff.
	        if (options.noext) clearStateChar();
	        continue;

	      case '(':
	        if (inClass) {
	          re += '(';
	          continue;
	        }

	        if (!stateChar) {
	          re += '\\(';
	          continue;
	        }

	        patternListStack.push({
	          type: stateChar,
	          start: i - 1,
	          reStart: re.length,
	          open: plTypes[stateChar].open,
	          close: plTypes[stateChar].close
	        });
	        // negation is (?:(?!js)[^/]*)
	        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
	        this.debug('plType %j %j', stateChar, re);
	        stateChar = false;
	        continue;

	      case ')':
	        if (inClass || !patternListStack.length) {
	          re += '\\)';
	          continue;
	        }

	        clearStateChar();
	        hasMagic = true;
	        var pl = patternListStack.pop();
	        // negation is (?:(?!js)[^/]*)
	        // The others are (?:<pattern>)<type>
	        re += pl.close;
	        if (pl.type === '!') {
	          negativeLists.push(pl);
	        }
	        pl.reEnd = re.length;
	        continue;

	      case '|':
	        if (inClass || !patternListStack.length || escaping) {
	          re += '\\|';
	          escaping = false;
	          continue;
	        }

	        clearStateChar();
	        re += '|';
	        continue;

	      // these are mostly the same in regexp and glob
	      case '[':
	        // swallow any state-tracking char before the [
	        clearStateChar();

	        if (inClass) {
	          re += '\\' + c;
	          continue;
	        }

	        inClass = true;
	        classStart = i;
	        reClassStart = re.length;
	        re += c;
	        continue;

	      case ']':
	        //  a right bracket shall lose its special
	        //  meaning and represent itself in
	        //  a bracket expression if it occurs
	        //  first in the list.  -- POSIX.2 2.8.3.2
	        if (i === classStart + 1 || !inClass) {
	          re += '\\' + c;
	          escaping = false;
	          continue;
	        }

	        // handle the case where we left a class open.
	        // "[z-a]" is valid, equivalent to "\[z-a\]"
	        if (inClass) {
	          // split where the last [ was, make sure we don't have
	          // an invalid re. if so, re-walk the contents of the
	          // would-be class to re-translate any characters that
	          // were passed through as-is
	          // TODO: It would probably be faster to determine this
	          // without a try/catch and a new RegExp, but it's tricky
	          // to do safely.  For now, this is safe and works.
	          var cs = pattern.substring(classStart + 1, i);
	          try {
	          } catch (er) {
	            // not a valid class!
	            var sp = this.parse(cs, SUBPARSE);
	            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
	            hasMagic = hasMagic || sp[1];
	            inClass = false;
	            continue;
	          }
	        }

	        // finish up the class.
	        hasMagic = true;
	        inClass = false;
	        re += c;
	        continue;

	      default:
	        // swallow any state char that wasn't consumed
	        clearStateChar();

	        if (escaping) {
	          // no need
	          escaping = false;
	        } else if (reSpecials[c] && !(c === '^' && inClass)) {
	          re += '\\';
	        }

	        re += c;

	    } // switch
	  } // for

	  // handle the case where we left a class open.
	  // "[abc" is valid, equivalent to "\[abc"
	  if (inClass) {
	    // split where the last [ was, and escape it
	    // this is a huge pita.  We now have to re-walk
	    // the contents of the would-be class to re-translate
	    // any characters that were passed through as-is
	    cs = pattern.substr(classStart + 1);
	    sp = this.parse(cs, SUBPARSE);
	    re = re.substr(0, reClassStart) + '\\[' + sp[0];
	    hasMagic = hasMagic || sp[1];
	  }

	  // handle the case where we had a +( thing at the *end*
	  // of the pattern.
	  // each pattern list stack adds 3 chars, and we need to go through
	  // and escape any | chars that were passed through as-is for the regexp.
	  // Go through and escape them, taking care not to double-escape any
	  // | chars that were already escaped.
	  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
	    var tail = re.slice(pl.reStart + pl.open.length);
	    this.debug('setting tail', re, pl);
	    // maybe some even number of \, then maybe 1 \, followed by a |
	    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
	      if (!$2) {
	        // the | isn't already escaped, so escape it.
	        $2 = '\\';
	      }

	      // need to escape all those slashes *again*, without escaping the
	      // one that we need for escaping the | character.  As it works out,
	      // escaping an even number of slashes can be done by simply repeating
	      // it exactly after itself.  That's why this trick works.
	      //
	      // I am sorry that you have to see this.
	      return $1 + $1 + $2 + '|';
	    });

	    this.debug('tail=%j\n   %s', tail, tail, pl, re);
	    var t = pl.type === '*' ? star : pl.type === '?' ? qmark : '\\' + pl.type;

	    hasMagic = true;
	    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
	  }

	  // handle trailing things that only matter at the very end.
	  clearStateChar();
	  if (escaping) {
	    // trailing \\
	    re += '\\\\';
	  }

	  // only need to apply the nodot start if the re starts with
	  // something that could conceivably capture a dot
	  var addPatternStart = false;
	  switch (re.charAt(0)) {
	    case '.':
	    case '[':
	    case '(':
	      addPatternStart = true;
	  }

	  // Hack to work around lack of negative lookbehind in JS
	  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
	  // like 'a.xyz.yz' doesn't match.  So, the first negative
	  // lookahead, has to look ALL the way ahead, to the end of
	  // the pattern.
	  for (var n = negativeLists.length - 1; n > -1; n--) {
	    var nl = negativeLists[n];

	    var nlBefore = re.slice(0, nl.reStart);
	    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
	    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
	    var nlAfter = re.slice(nl.reEnd);

	    nlLast += nlAfter;

	    // Handle nested stuff like *(*.js|!(*.json)), where open parens
	    // mean that we should *not* include the ) in the bit that is considered
	    // "after" the negated section.
	    var openParensBefore = nlBefore.split('(').length - 1;
	    var cleanAfter = nlAfter;
	    for (i = 0; i < openParensBefore; i++) {
	      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
	    }
	    nlAfter = cleanAfter;

	    var dollar = '';
	    if (nlAfter === '' && isSub !== SUBPARSE) {
	      dollar = '$';
	    }
	    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
	    re = newRe;
	  }

	  // if the re is not "" at this point, then we need to make sure
	  // it doesn't match against an empty path part.
	  // Otherwise a/* will match a/, which it should not.
	  if (re !== '' && hasMagic) {
	    re = '(?=.)' + re;
	  }

	  if (addPatternStart) {
	    re = patternStart + re;
	  }

	  // parsing just a piece of a larger pattern.
	  if (isSub === SUBPARSE) {
	    return [re, hasMagic];
	  }

	  // skip the regexp for non-magical patterns
	  // unescape anything in it, though, so that it'll be
	  // an exact match against a file etc.
	  if (!hasMagic) {
	    return globUnescape(pattern);
	  }

	  var flags = options.nocase ? 'i' : '';
	  try {
	    var regExp = new RegExp('^' + re + '$', flags);
	  } catch (er) {
	    // If it was an invalid regular expression, then it can't match
	    // anything.  This trick looks for a character after the end of
	    // the string, which is of course impossible, except in multi-line
	    // mode, but it's not a /m regex.
	    return new RegExp('$.');
	  }

	  regExp._glob = pattern;
	  regExp._src = re;

	  return regExp;
	}

	minimatch.makeRe = function (pattern, options) {
	  return new Minimatch(pattern, options || {}).makeRe();
	};

	Minimatch.prototype.makeRe = makeRe;
	function makeRe() {
	  if (this.regexp || this.regexp === false) return this.regexp;

	  // at this point, this.set is a 2d array of partial
	  // pattern strings, or "**".
	  //
	  // It's better to use .match().  This function shouldn't
	  // be used, really, but it's pretty convenient sometimes,
	  // when you just want to work with a regex.
	  var set = this.set;

	  if (!set.length) {
	    this.regexp = false;
	    return this.regexp;
	  }
	  var options = this.options;

	  var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
	  var flags = options.nocase ? 'i' : '';

	  var re = set.map(function (pattern) {
	    return pattern.map(function (p) {
	      return p === GLOBSTAR ? twoStar : typeof p === 'string' ? regExpEscape(p) : p._src;
	    }).join('\\\/');
	  }).join('|');

	  // must match entire pattern
	  // ending in a * or ** will make it less strict.
	  re = '^(?:' + re + ')$';

	  // can match anything, as long as it's not this.
	  if (this.negate) re = '^(?!' + re + ').*$';

	  try {
	    this.regexp = new RegExp(re, flags);
	  } catch (ex) {
	    this.regexp = false;
	  }
	  return this.regexp;
	}

	minimatch.match = function (list, pattern, options) {
	  options = options || {};
	  var mm = new Minimatch(pattern, options);
	  list = list.filter(function (f) {
	    return mm.match(f);
	  });
	  if (mm.options.nonull && !list.length) {
	    list.push(pattern);
	  }
	  return list;
	};

	Minimatch.prototype.match = match;
	function match(f, partial) {
	  this.debug('match', f, this.pattern);
	  // short-circuit in the case of busted things.
	  // comments, etc.
	  if (this.comment) return false;
	  if (this.empty) return f === '';

	  if (f === '/' && partial) return true;

	  var options = this.options;

	  // windows: need to use /, not \
	  if (path$2.sep !== '/') {
	    f = f.split(path$2.sep).join('/');
	  }

	  // treat the test path as a set of pathparts.
	  f = f.split(slashSplit);
	  this.debug(this.pattern, 'split', f);

	  // just ONE of the pattern sets in this.set needs to match
	  // in order for it to be valid.  If negating, then just one
	  // match means that we have failed.
	  // Either way, return on the first hit.

	  var set = this.set;
	  this.debug(this.pattern, 'set', set);

	  // Find the basename of the path by looking for the last non-empty segment
	  var filename;
	  var i;
	  for (i = f.length - 1; i >= 0; i--) {
	    filename = f[i];
	    if (filename) break;
	  }

	  for (i = 0; i < set.length; i++) {
	    var pattern = set[i];
	    var file = f;
	    if (options.matchBase && pattern.length === 1) {
	      file = [filename];
	    }
	    var hit = this.matchOne(file, pattern, partial);
	    if (hit) {
	      if (options.flipNegate) return true;
	      return !this.negate;
	    }
	  }

	  // didn't get any hits.  this is success if it's a negative
	  // pattern, failure otherwise.
	  if (options.flipNegate) return false;
	  return this.negate;
	}

	// set partial to true to test if, for example,
	// "/a/b" matches the start of "/*/b/*/d"
	// Partial means, if you run out of file before you run
	// out of pattern, then that's fine, as long as all
	// the parts match.
	Minimatch.prototype.matchOne = function (file, pattern, partial) {
	  var options = this.options;

	  this.debug('matchOne', { 'this': this, file: file, pattern: pattern });

	  this.debug('matchOne', file.length, pattern.length);

	  for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
	    this.debug('matchOne loop');
	    var p = pattern[pi];
	    var f = file[fi];

	    this.debug(pattern, p, f);

	    // should be impossible.
	    // some invalid regexp stuff in the set.
	    if (p === false) return false;

	    if (p === GLOBSTAR) {
	      this.debug('GLOBSTAR', [pattern, p, f]);

	      // "**"
	      // a/**/b/**/c would match the following:
	      // a/b/x/y/z/c
	      // a/x/y/z/b/c
	      // a/b/x/b/x/c
	      // a/b/c
	      // To do this, take the rest of the pattern after
	      // the **, and see if it would match the file remainder.
	      // If so, return success.
	      // If not, the ** "swallows" a segment, and try again.
	      // This is recursively awful.
	      //
	      // a/**/b/**/c matching a/b/x/y/z/c
	      // - a matches a
	      // - doublestar
	      //   - matchOne(b/x/y/z/c, b/**/c)
	      //     - b matches b
	      //     - doublestar
	      //       - matchOne(x/y/z/c, c) -> no
	      //       - matchOne(y/z/c, c) -> no
	      //       - matchOne(z/c, c) -> no
	      //       - matchOne(c, c) yes, hit
	      var fr = fi;
	      var pr = pi + 1;
	      if (pr === pl) {
	        this.debug('** at the end');
	        // a ** at the end will just swallow the rest.
	        // We have found a match.
	        // however, it will not swallow /.x, unless
	        // options.dot is set.
	        // . and .. are *never* matched by **, for explosively
	        // exponential reasons.
	        for (; fi < fl; fi++) {
	          if (file[fi] === '.' || file[fi] === '..' || !options.dot && file[fi].charAt(0) === '.') return false;
	        }
	        return true;
	      }

	      // ok, let's see if we can swallow whatever we can.
	      while (fr < fl) {
	        var swallowee = file[fr];

	        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

	        // XXX remove this slice.  Just pass the start index.
	        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
	          this.debug('globstar found match!', fr, fl, swallowee);
	          // found a match.
	          return true;
	        } else {
	          // can't swallow "." or ".." ever.
	          // can only swallow ".foo" when explicitly asked.
	          if (swallowee === '.' || swallowee === '..' || !options.dot && swallowee.charAt(0) === '.') {
	            this.debug('dot detected!', file, fr, pattern, pr);
	            break;
	          }

	          // ** swallows a segment, and continue.
	          this.debug('globstar swallow a segment, and continue');
	          fr++;
	        }
	      }

	      // no match was found.
	      // However, in partial mode, we can't say this is necessarily over.
	      // If there's more *pattern* left, then
	      if (partial) {
	        // ran out of file
	        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
	        if (fr === fl) return true;
	      }
	      return false;
	    }

	    // something other than **
	    // non-magic patterns just have to match exactly
	    // patterns with magic have been turned into regexps.
	    var hit;
	    if (typeof p === 'string') {
	      if (options.nocase) {
	        hit = f.toLowerCase() === p.toLowerCase();
	      } else {
	        hit = f === p;
	      }
	      this.debug('string match', p, f, hit);
	    } else {
	      hit = f.match(p);
	      this.debug('pattern match', p, f, hit);
	    }

	    if (!hit) return false;
	  }

	  // Note: ending in / means that we'll get a final ""
	  // at the end of the pattern.  This can only match a
	  // corresponding "" at the end of the file.
	  // If the file ends in /, then it can only match a
	  // a pattern that ends in /, unless the pattern just
	  // doesn't have any more for it. But, a/b/ should *not*
	  // match "a/b/*", even though "" matches against the
	  // [^/]*? pattern, except in partial mode, where it might
	  // simply not be reached yet.
	  // However, a/b/ should still satisfy a/*

	  // now either we fell off the end of the pattern, or we're done.
	  if (fi === fl && pi === pl) {
	    // ran out of pattern and filename at the same time.
	    // an exact hit!
	    return true;
	  } else if (fi === fl) {
	    // ran out of file, but still had pattern left.
	    // this is ok if we're doing the match as part of
	    // a glob fs traversal.
	    return partial;
	  } else if (pi === pl) {
	    // ran out of pattern, still have file left.
	    // this is only acceptable if we're on the very last
	    // empty segment of a file with a trailing slash.
	    // a/* should match a/b/
	    var emptyFileEnd = fi === fl - 1 && file[fi] === '';
	    return emptyFileEnd;
	  }

	  // should be unreachable.
	  throw new Error('wtf?');
	};

	// replace stuff like \* with *
	function globUnescape(s) {
	  return s.replace(/\\(.)/g, '$1');
	}

	function regExpEscape(s) {
	  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	}

	console.log("=== PureRead: Beautify load ===");

	/**
	 * Beautify html
	 * 
	 * @param {string} storage.current.site.name
	 */
	function specbeautify(name, $target) {
	    switch (name) {
	        case "sspai.com":
	            //TO-DO
	            $target.find(".relation-apps").remove();
	            $target.find(".ss-app-card").remove();
	            break;
	        case "post.smzdm.com":
	            $target.find("img.face").addClass("sr-rd-content-nobeautify");
	            $target.find(".insert-outer img").addClass("sr-rd-content-nobeautify");
	            break;
	        case "infoq.com":
	            $target.find("img").map(function (index, item) {
	                if ($(item).css("float") == "left") {
	                    $(item).addClass("sr-rd-content-nobeautify");
	                }
	            });
	            $target.find("script").remove();
	            break;
	        case "appinn.com":
	            $target.find(".emoji").addClass("sr-rd-content-nobeautify");
	            break;
	        case "hacpai.com":
	            $target.find(".emoji").addClass("sr-rd-content-nobeautify");
	            break;
	        case "douban.com":
	            $target.find(".review-content").children().unwrap();
	            $target.find("table").addClass("sr-rd-content-center");
	            $target.find("p").css({ "white-space": "pre-wrap" });
	            $target.find(".cc").removeClass();
	            break;
	        case "qdaily.com":
	            $target.find("img").map(function (index, item) {
	                var $target = $(item),
	                    height = Number.parseInt($target.css("height"));
	                if (height == 0) $target.remove();
	            });
	            $target.find(".com-insert-images").map(function (index, item) {
	                var $target = $(item),
	                    imgs = $target.find("img").map(function (index, item) {
	                    return "<div>" + item.outerHTML + "</div>";
	                }),
	                    str = imgs.get().join("");
	                $target.empty().removeAttr("class").append(str);
	            });
	            $target.find(".com-insert-embed").remove();
	            break;
	        case "news.mtime.com":
	            $target.find(".newspictool").map(function (index, item) {
	                var $target = $(item),
	                    $img = $target.find("img"),
	                    $label = $target.find("p:last");
	                $target.removeAttr("class").addClass("sr-rd-content-center").empty().append($img).append($label);
	            });
	            break;
	        case "blog.csdn.net":
	            $target.find(".save_code").remove();
	            $target.find(".pre-numbering").remove();
	            $target.find("pre").removeAttr("style").removeAttr("class");
	            $target.find("code").removeAttr("style");
	            $target.find(".dp-highlighter").map(function (index, item) {
	                $(item).find(".bar .tools").remove();
	                if ($(item).next().is("pre")) $(item).next().remove();
	            });
	            break;
	        case "news.sohu.com":
	            $target.find(".conserve-photo").remove();
	            $target.find("table").addClass("sr-rd-content-center");
	            break;
	        case "qq.com":
	            $target.find(".rv-root-v2, #backqqcom").remove();
	            break;
	        case "azofreeware.com":
	            $target.find("iframe").remove();
	            break;
	        case "apprcn.com":
	            $target.find("img").map(function (index, item) {
	                var $target = $(item),
	                    src = $target.attr("src");
	                if (src && src.includes("Apprcn_Wechat_Small.jpeg")) $target.parent().remove();
	            });
	            $target.find("a").map(function (index, item) {
	                var $target = $(item),
	                    text = $target.text();
	                if (text == "来自反斗软件") $target.parent().remove();
	            });
	            break;
	        case "tieba.baidu.com":
	            $target.find(".BDE_Smiley").addClass("sr-rd-content-nobeautify");
	            $target.find(".replace_div").removeAttr("class").removeAttr("style");
	            $target.find(".replace_tip").remove();
	            $target.find(".d_post_content, .j_d_post_content, .post_bubble_top, .post_bubble_middle, .post_bubble_bottom").map(function (idx, target) {
	                $(target).removeAttr("class").removeAttr("style");
	            });
	            $("body").find(".p_author_face").map(function (idx, target) {
	                var $target = $(target).find("img"),
	                    src = $target.attr("data-tb-lazyload"),
	                    name = $target.attr("username");
	                src && $("sr-rd-mult-avatar").find("span").map(function (idx, span) {
	                    var $span = $(span),
	                        text = $span.text();
	                    if (text == name) {
	                        $span.parent().find("img").attr("src", src);
	                    }
	                });
	            });
	            break;
	        case "jingyan.baidu.com":
	            $target.find(".exp-image-wraper").removeAttr("class").removeAttr("href");
	            break;
	        case "question.zhihu.com":
	            $target.find(".zu-edit-button").remove();
	            $target.find("a.external").map(function (idx, target) {
	                $(target).removeAttr("class").attr("style", "border: none;");
	            });
	            $target.find(".VagueImage").map(function (idx, target) {
	                var $target = $(target),
	                    src = $target.attr("data-src");
	                $target.replaceWith("<img class=\"sr-rd-content-img\" src=\"" + src + "\" style=\"zoom: 0.6;\">");
	            });
	            break;
	        case "chiphell.com":
	            $target.find("img").map(function (index, item) {
	                var $target = $(item),
	                    $parent = $target.parent(),
	                    src = $target.attr("src"),
	                    smilieid = $target.attr("smilieid");
	                if ($parent.is("ignore_js_op")) $target.unwrap();
	                smilieid && src && src.includes("static/image/smiley") && $target.addClass("sr-rd-content-nobeautify").attr("style", "width: 50px;");
	            });
	            $target.find(".quote").remove();
	            break;
	        case "jiemian.com":
	            $target.find("script").remove();
	            break;
	        case "36kr.com":
	            $target.find(".load-html-img").removeAttr("class");
	            break;
	        case "cnblogs.com":
	            $target.find(".cnblogs_code").removeClass();
	            $target.find(".cnblogs_code_hide").removeClass().removeAttr("style");
	            $target.find(".cnblogs_code_toolbar").remove();
	            $target.find(".code_img_opened").remove();
	            $target.find(".code_img_closed").remove();
	            break;
	        case "news.cnblogs.com":
	            $target.find(".topic_img").remove();
	            break;
	        case "g-cores.com":
	            $target.find(".swiper-slide-active").find("img").map(function (index, item) {
	                var $target = $(item);
	                $target.parent().parent().parent().parent().parent().parent().removeAttr("class").removeAttr("style").html($target);
	            });
	            break;
	        case "feng.com":
	            $target.find("span").removeAttr("style");
	            break;
	        case "young.ifeng.com":
	            $target.find("span").removeAttr("style");
	            break;
	        case "ftchinese.com":
	            $target.find("script").remove();
	            break;
	        case "segmentfault.com":
	            $target.find(".widget-codetool").remove();
	            break;
	        case "mp.weixin.qq.com":
	            $target.find('section[powered-by="xiumi.us"]').find("img").map(function (index, item) {
	                var $target = $(item),
	                    src = $target.attr("data-src");
	                $target.addClass("sr-rd-content-nobeautify").attr("src", src);
	            });
	            break;
	        case "ruby-china.org":
	            $target.find(".twemoji").remove();
	            break;
	        case "w3cplus.com":
	            $target.find("iframe").addClass("sr-rd-content-nobeautify");
	            break;
	        case "zuojj.com":
	            $target.find(".syntaxhighlighter .Brush").attr("style", "font-size: .7em !important;");
	            break;
	        case "aotu.io":
	            $target.find(".highlight table").map(function (index, item) {
	                var $target = $(item),
	                    $pre = $target.find("pre"),
	                    $table = $target.find("table");
	                $target.html($pre[1]);
	                $table.unwrap();
	            });
	            $target.find("table").addClass("sr-rd-content-center");
	            break;
	        case "colobu.com":
	            $target.find(".highlight table").map(function (index, item) {
	                var $target = $(item),
	                    $pre = $target.find("pre");
	                $target.html($pre[1]);
	                $target.unwrap();
	            });
	            break;
	        case "hao.caibaojian.com":
	            $target.find(".tlink").map(function (index, item) {
	                var $target = $(item);
	                $target.html("<link>");
	            });
	            break;
	        case "wkee.net":
	            $target.find("script").remove();
	            break;
	        case "linux.cn":
	            $target.find("pre").attr("style", "background-color: #161b20; background-image: none;");
	            $target.find("code").attr("style", "background-color: transparent; background-image: none;");
	            break;
	        case "zhuanlan.zhihu.com":
	            $target.find("div[data-src]").map(function (index, item) {
	                var $target = $(item),
	                    src = $target.attr("data-src");
	                $target.replaceWith("<div class=\"sr-rd-content-center\"><img src=\"" + src + "\"></div>");
	            });
	            break;
	        case "jianshu.com":
	            $target.find(".image-package").map(function (index, item) {
	                var $target = $(item),
	                    $div = $target.find("img");
	                $target.html($div);
	            });
	            break;
	    }
	}

	/**
	 * Remove spare tag
	 * 
	 * @param {string} storage.current.site.name
	 * @param {jquery} jquery object
	 */
	function removeSpareTag(name, $target) {
	    var remove = false,
	        tag = "";

	    if (["lib.csdn.net", "huxiu.com", "my.oschina.net", "caixin.com", "163.com", "steachs.com", "hacpai.com", "apprcn.com", "mp.weixin.qq.com"].includes(name)) {
	        remove = true;
	        tag = "p";
	    } else if (["nationalgeographic.com.cn", "dgtle.com", "news.mtime.com"].includes(name)) {
	        remove = true;
	        tag = "div";
	    } else if (["chiphell.com"].includes(name)) {
	        remove = true;
	        tag = "font";
	    }
	    if (remove) {
	        $target.find(tag).map(function (index, item) {
	            var str = $(item).text().toLowerCase().trim();
	            if ($(item).find("img").length == 0 && str == "") $(item).remove();
	        });
	    }
	}

	/**
	 * Beautify html, incldue:
	 * 
	 * - change all <blockquote> to <sr-blockquote>
	 * - remove useless <br>
	 * 
	 * @param {jquery} jquery object
	 */
	function htmlbeautify($target) {
	    try {
	        $target.html(function (index, html) {
	            return html.trim().replace(/<\/?blockquote/g, function (value) {
	                return value[1] == "/" ? "</sr-blockquote" : "<sr-blockquote";
	            }).replace(/<br>\n?<br>(\n?<br>)*/g, "<br>").replace(/\/(div|p)>\n*(<br>\n)+/g, function (value) {
	                return value.replace("<br>", "");
	            });
	        });
	    } catch (error) {
	        console.error(error);
	        return $target.html();
	    }
	}

	/**
	 * Common Beautify html, include:
	 * - task: all webiste image, remove old image and create new image
	 * - task: all webiste sr-blockquote, remove style
	 * - task: all webiste iframe, embed add center style
	 * - task: all hr tag add simpread-hidden class
	 * - task: all pre/code tag remove class
	 * - task: all a tag remove style
	 * 
	 * @param {jquery}
	 */
	function commbeautify(name, $target) {
	    $target.find("img:not(.sr-rd-content-nobeautify)").map(function (index, item) {
	        var $target = $(item),
	            $orgpar = $target.parent(),
	            $img = $("<img class='sr-rd-content-img-load'>"),
	            src = $target.attr("src"),
	            lazysrc = $target.attr("data-src"),
	            zuimei = $target.attr("data-original"),
	            cnbeta = $target.attr("original"),
	            jianshu = $target.attr("data-original-src"),
	            fixOverflowImgsize = function fixOverflowImgsize() {
	            $img.removeClass("sr-rd-content-img-load");
	            if ($img[0].clientWidth > 1000) {
	                $img.css("zoom", "0.6");
	            } else if ($img[0].clientHeight > 620) {
                if ( !/iphone/i.test(navigator.userAgent) ) {
                  $img.attr("height", 620);
                  if ($img[0].clientWidth < $("sr-rd-content").width()) $img.css({ "width": "auto" });
                }
            }
	            if ($img[0].clientWidth > $("sr-rd-content").width()) $img.addClass("sr-rd-content-img");
	        },
	            loaderrorHandle = function loaderrorHandle() {
	            $img.addClass("simpread-hidden");
	            if ($img.parent().hasClass("sr-rd-content-center")) {
	                $img.parent().removeAttr("class").addClass("simpread-hidden");
	            }
	        };
	        var newsrc = void 0,
	            $parent = $target.parent(),
	            tagname = $parent[0].tagName.toLowerCase();

	        // remove current image and create new image object
	        newsrc = cnbeta ? cnbeta : src;
	        newsrc = lazysrc ? lazysrc : newsrc;
	        newsrc = zuimei ? zuimei : newsrc;
	        newsrc = jianshu ? jianshu : newsrc;
	        !newsrc.startsWith("http") && (newsrc = newsrc.startsWith("//") ? location.protocol + newsrc : location.origin + newsrc);
	        $img.attr("src", newsrc).on("load", function () {
	            return fixOverflowImgsize();
	        }).on("error", function () {
	            return loaderrorHandle();
	        }).replaceAll($target).wrap("<div class='sr-rd-content-center'></div>");
      });
	    $target.find("sr-blockquote").map(function (index, item) {
	        var $target = $(item),
	            $parent = $target.parent();
	        $target.removeAttr("style").removeAttr("class");
	        if (name == "dgtle.com") {
	            $parent.removeClass("quote");
	        }
	    });
	    $target.find("iframe:not(.sr-rd-content-nobeautify), embed:not(.sr-rd-content-nobeautify)").map(function (index, item) {
	        $(item).wrap("<div class='sr-rd-content-center'></div>");
	    });
	    $target.find("hr").map(function (index, item) {
	        $(item).addClass("simpread-hidden");
	    });
	    $target.find("pre").map(function (index, item) {
	        $(item).find("code").removeAttr("class");
	    });
	    $target.find("pre").removeAttr("class");
	    $target.find("a").removeAttr("style");
	}

	var be = /*#__PURE__*/Object.freeze({
		specbeautify: specbeautify,
		removeSpareTag: removeSpareTag,
		htmlbeautify: htmlbeautify,
		commbeautify: commbeautify
	});

	console.log("=== PureRead: StyleSheet load ===");

	var bgcolorstyl = "background-color",
	    bgcls = ".simpread-focus-root";

	var html_style_bal = "-1";

	/**
	 * Get background color value for focus mode
	 * 
	 * @param  {string} background-color, e.g. rgba(235, 235, 235, 0.901961)
	 * @return {string} e.g. 235, 235, 235
	 */
	function getColor(value) {
	    var arr = value ? value.match(/[0-9]+, /ig) : [];
	    if (arr.length > 0) {
	        return arr.join("").replace(/, $/, "");
	    } else {
	        return null;
	    }
	}
	/**
	 * Set focus mode background color for focus mode
	 * 
	 * @param  {string} background color
	 * @param  {number} background opacity
	 * @return {string} new background color
	 */
	function backgroundColor(bgcolor, opacity) {
	    var color = getColor(bgcolor),
	        newval = "rgba(" + color + ", " + opacity / 100 + ")";
	    $(bgcls).css(bgcolorstyl, newval);
	    return newval;
	}

	/**
	 * Set background opacity for focus mode
	 * 
	 * @param  {string} opacity
	 * @return {string} new background color or null
	 */
	function opacity(opacity) {
	    var bgcolor = $(bgcls).css(bgcolorstyl),
	        color = getColor(bgcolor),
	        newval = "rgba(" + color + ", " + opacity / 100 + ")";
	    if (color) {
	        $(bgcls).css(bgcolorstyl, newval);
	        return newval;
	    } else {
	        return null;
	    }
	}

	/**
	 * Set read mode font family for read mode
	 * 
	 * @param {string} font family name e.g. PingFang SC; Microsoft Yahei
	 */
	function fontFamily(family) {
	    $("sr-read").css("font-family", family == "default" ? "" : family);
	}

	/**
	 * Set read mode font size for read mode
	 * 
	 * @param {string} font size, e.g. 70% 62.5%
	 */
	function fontSize(value) {
	    if (html_style_bal == "-1") {
	        html_style_bal = $("html").attr("style");
	        html_style_bal == undefined && (html_style_bal = "");
	    }
	    value ? $("html").attr("style", "font-size: " + value + "!important;" + html_style_bal) : $("html").attr("style", html_style_bal);
	}

	/**
	 * Set read mode layout width for read mode
	 * 
	 * @param {string} layout width
	 */
	function layout(width) {
	    $("sr-read").css("margin", width ? "20px " + width : "");
	}

	/**
	 * Add custom css to <head> for read mode
	 * 
	 * @param {string} read.custom[type]
	 * @param {object} read.custom
	 */
	function custom(type, props) {
	    var format = function format(name) {
	        return name.replace(/[A-Z]/, function (name) {
	            return "-" + name.toLowerCase();
	        });
	    },
	        arr = Object.keys(props).map(function (v) {
	        return props[v] && format(v) + ": " + props[v] + ";";
	    });
	    var styles = arr.join("");
	    switch (type) {
	        case "title":
	            styles = "sr-rd-title {" + styles + "}";
	            break;
	        case "desc":
	            styles = "sr-rd-desc {" + styles + "}";
	            break;
	        case "art":
	            styles = "sr-rd-content *, sr-rd-content p, sr-rd-content div {" + styles + "}";
	            break;
	        case "pre":
	            styles = "sr-rd-content pre {" + styles + "}";
	            break;
	        case "code":
	            styles = "sr-rd-content pre code, sr-rd-content pre code * {" + styles + "}";
	            break;
	    }

	    var $target = $("head").find("style#simpread-custom-" + type);
	    if ($target.length == 0) {
	        $("head").append("<style type=\"text/css\" id=\"simpread-custom-" + type + "\">" + styles + "</style>");
	    } else {
	        $target.html(styles);
	    }
	}

	/**
	 * Add css to <head> for read mode
	 * 
	 * @param {string} read.custom.css
	 * @param {object} read.custom.css value
	 */
	function css(type, styles) {
	    var $target = $("head").find("style#simpread-custom-" + type);
	    if ($target.length == 0) {
	        $("head").append("<style type=\"text/css\" id=\"simpread-custom-" + type + "\">" + styles + "</style>");
	    } else {
	        $target.html(styles);
	    }
	}

	/**
	 * Add/Remove current site styles( string ) to head for read mdoe
	 * 
	 * @param {string} styles 
	 */
	function siteCSS(styles) {
	    styles ? $("head").append("<style type=\"text/css\" id=\"simpread-site-css\">" + styles + "</style>") : $("#simpread-site-css").remove();
	}

	/**
	 * Add custom to .preview tag
	 * 
	 * @param {object} read.custom
	 * @param {string} theme backgroud color
	 */
	function preview(styles) {
	    Object.keys(styles).forEach(function (v) {
	        v != "css" && custom(v, styles[v]);
	    });
	    css("css", styles["css"]);
	}

	/**
	 * Verify custom is exist
	 * 
	 * @param {string} verify type
	 * @param {object} read.custom value
	 */
	function vfyCustom(type, styles) {
	    switch (type) {
	        case "layout":
	        case "margin":
	        case "fontfamily":
	        case "custom":
	            return styles.css != "";
	        case "fontsize":
	            return styles.title.fontSize != "" || styles.desc.fontSize != "" || styles.art.fontSize != "" || styles.css != "";
	        case "theme":
	            return styles.css.search("simpread-theme-root") != -1;
	    }
	}

	var ss = /*#__PURE__*/Object.freeze({
		GetColor: getColor,
		BgColor: backgroundColor,
		Opacity: opacity,
		FontFamily: fontFamily,
		FontSize: fontSize,
		Layout: layout,
		SiteCSS: siteCSS,
		Preview: preview,
		Custom: custom,
		CSS: css,
		VerifyCustom: vfyCustom
	});

	console.log("=== PureRead: Plugin load ===");

	var plugins = {
	    pangu: pangu_min,
	    minimatch: minimatch_1,
	    beautify: be,
	    style: ss
	};

	/**
	 * Get PureRead Plugin
	 * 
	 * @param  {string} plugin name, when undefined, return all plugin
	 * @return {object} all plugins
	 *         {string} plgin
	 */
	function Plugin(type) {
	    var result = void 0;
	    if (type == undefined) {
	        result = plugins;
	    } else {
	        result = plugins[type];
	    }
	    return result;
	}

	exports.Plugin = Plugin;

	return exports;

}({}));

// https://github.com/domchristie/turndown
var TurndownService = (function () {
    'use strict';
    
    function extend (destination) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (source.hasOwnProperty(key)) destination[key] = source[key];
        }
      }
      return destination
    }
    
    function repeat (character, count) {
      return Array(count + 1).join(character)
    }
    
    var blockElements = [
      'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
      'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
      'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
      'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
      'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
    ];
    
    function isBlock (node) {
      return blockElements.indexOf(node.nodeName.toLowerCase()) !== -1
    }
    
    var voidElements = [
      'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
      'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    
    function isVoid (node) {
      return voidElements.indexOf(node.nodeName.toLowerCase()) !== -1
    }
    
    var voidSelector = voidElements.join();
    function hasVoid (node) {
      return node.querySelector && node.querySelector(voidSelector)
    }
    
    var rules = {};
    
    rules.paragraph = {
      filter: 'p',
    
      replacement: function (content) {
        return '\n\n' + content + '\n\n'
      }
    };
    
    rules.lineBreak = {
      filter: 'br',
    
      replacement: function (content, node, options) {
        return options.br + '\n'
      }
    };
    
    rules.heading = {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    
      replacement: function (content, node, options) {
        var hLevel = Number(node.nodeName.charAt(1));
    
        if (options.headingStyle === 'setext' && hLevel < 3) {
          var underline = repeat((hLevel === 1 ? '=' : '-'), content.length);
          return (
            '\n\n' + content + '\n' + underline + '\n\n'
          )
        } else {
          return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
        }
      }
    };
    
    rules.blockquote = {
      filter: 'blockquote',
    
      replacement: function (content) {
        content = content.replace(/^\n+|\n+$/g, '');
        content = content.replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n'
      }
    };
    
    rules.list = {
      filter: ['ul', 'ol'],
    
      replacement: function (content, node) {
        var parent = node.parentNode;
        if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
          return '\n' + content
        } else {
          return '\n\n' + content + '\n\n'
        }
      }
    };
    
    rules.listItem = {
      filter: 'li',
    
      replacement: function (content, node, options) {
        content = content
          .replace(/^\n+/, '') // remove leading newlines
          .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
          .replace(/\n/gm, '\n    '); // indent
        var prefix = options.bulletListMarker + '   ';
        var parent = node.parentNode;
        if (parent.nodeName === 'OL') {
          var start = parent.getAttribute('start');
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + '.  ';
        }
        return (
          prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
        )
      }
    };
    
    rules.indentedCodeBlock = {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === 'indented' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        )
      },
    
      replacement: function (content, node, options) {
        return (
          '\n\n    ' +
          node.firstChild.textContent.replace(/\n/g, '\n    ') +
          '\n\n'
        )
      }
    };
    
    rules.fencedCodeBlock = {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === 'fenced' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        )
      },
    
      replacement: function (content, node, options) {
        var className = node.firstChild.className || '';
        var language = (className.match(/language-(\S+)/) || [null, ''])[1];
    
        return (
          '\n\n' + options.fence + language + '\n' +
          node.firstChild.textContent +
          '\n' + options.fence + '\n\n'
        )
      }
    };
    
    rules.horizontalRule = {
      filter: 'hr',
    
      replacement: function (content, node, options) {
        return '\n\n' + options.hr + '\n\n'
      }
    };
    
    rules.inlineLink = {
      filter: function (node, options) {
        return (
          options.linkStyle === 'inlined' &&
          node.nodeName === 'A' &&
          node.getAttribute('href')
        )
      },
    
      replacement: function (content, node) {
        var href = node.getAttribute('href');
        var title = node.title ? ' "' + node.title + '"' : '';
        return '[' + content + '](' + href + title + ')'
      }
    };
    
    rules.referenceLink = {
      filter: function (node, options) {
        return (
          options.linkStyle === 'referenced' &&
          node.nodeName === 'A' &&
          node.getAttribute('href')
        )
      },
    
      replacement: function (content, node, options) {
        var href = node.getAttribute('href');
        var title = node.title ? ' "' + node.title + '"' : '';
        var replacement;
        var reference;
    
        switch (options.linkReferenceStyle) {
          case 'collapsed':
            replacement = '[' + content + '][]';
            reference = '[' + content + ']: ' + href + title;
            break
          case 'shortcut':
            replacement = '[' + content + ']';
            reference = '[' + content + ']: ' + href + title;
            break
          default:
            var id = this.references.length + 1;
            replacement = '[' + content + '][' + id + ']';
            reference = '[' + id + ']: ' + href + title;
        }
    
        this.references.push(reference);
        return replacement
      },
    
      references: [],
    
      append: function (options) {
        var references = '';
        if (this.references.length) {
          references = '\n\n' + this.references.join('\n') + '\n\n';
          this.references = []; // Reset references
        }
        return references
      }
    };
    
    rules.emphasis = {
      filter: ['em', 'i'],
    
      replacement: function (content, node, options) {
        if (!content.trim()) return ''
        return options.emDelimiter + content + options.emDelimiter
      }
    };
    
    rules.strong = {
      filter: ['strong', 'b'],
    
      replacement: function (content, node, options) {
        if (!content.trim()) return ''
        return options.strongDelimiter + content + options.strongDelimiter
      }
    };
    
    rules.code = {
      filter: function (node) {
        var hasSiblings = node.previousSibling || node.nextSibling;
        var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;
    
        return node.nodeName === 'CODE' && !isCodeBlock
      },
    
      replacement: function (content) {
        if (!content.trim()) return ''
    
        var delimiter = '`';
        var leadingSpace = '';
        var trailingSpace = '';
        var matches = content.match(/`+/gm);
        if (matches) {
          if (/^`/.test(content)) leadingSpace = ' ';
          if (/`$/.test(content)) trailingSpace = ' ';
          while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`';
        }
    
        return delimiter + leadingSpace + content + trailingSpace + delimiter
      }
    };
    
    rules.image = {
      filter: 'img',
    
      replacement: function (content, node) {
        var alt = node.alt || '';
        var src = node.getAttribute('src') || '';
        var title = node.title || '';
        var titlePart = title ? ' "' + title + '"' : '';
        return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
      }
    };
    
    /**
     * Manages a collection of rules used to convert HTML to Markdown
     */
    
    function Rules (options) {
      this.options = options;
      this._keep = [];
      this._remove = [];
    
      this.blankRule = {
        replacement: options.blankReplacement
      };
    
      this.keepReplacement = options.keepReplacement;
    
      this.defaultRule = {
        replacement: options.defaultReplacement
      };
    
      this.array = [];
      for (var key in options.rules) this.array.push(options.rules[key]);
    }
    
    Rules.prototype = {
      add: function (key, rule) {
        this.array.unshift(rule);
      },
    
      keep: function (filter) {
        this._keep.unshift({
          filter: filter,
          replacement: this.keepReplacement
        });
      },
    
      remove: function (filter) {
        this._remove.unshift({
          filter: filter,
          replacement: function () {
            return ''
          }
        });
      },
    
      forNode: function (node) {
        if (node.isBlank) return this.blankRule
        var rule;
    
        if ((rule = findRule(this.array, node, this.options))) return rule
        if ((rule = findRule(this._keep, node, this.options))) return rule
        if ((rule = findRule(this._remove, node, this.options))) return rule
    
        return this.defaultRule
      },
    
      forEach: function (fn) {
        for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
      }
    };
    
    function findRule (rules, node, options) {
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (filterValue(rule, node, options)) return rule
      }
      return void 0
    }
    
    function filterValue (rule, node, options) {
      var filter = rule.filter;
      if (typeof filter === 'string') {
        if (filter === node.nodeName.toLowerCase()) return true
      } else if (Array.isArray(filter)) {
        if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
      } else if (typeof filter === 'function') {
        if (filter.call(rule, node, options)) return true
      } else {
        throw new TypeError('`filter` needs to be a string, array, or function')
      }
    }
    
    /**
     * The collapseWhitespace function is adapted from collapse-whitespace
     * by Luc Thevenard.
     *
     * The MIT License (MIT)
     *
     * Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    
    /**
     * collapseWhitespace(options) removes extraneous whitespace from an the given element.
     *
     * @param {Object} options
     */
    function collapseWhitespace (options) {
      var element = options.element;
      var isBlock = options.isBlock;
      var isVoid = options.isVoid;
      var isPre = options.isPre || function (node) {
        return node.nodeName === 'PRE'
      };
    
      if (!element.firstChild || isPre(element)) return
    
      var prevText = null;
      var prevVoid = false;
    
      var prev = null;
      var node = next(prev, element, isPre);
    
      while (node !== element) {
        if (node.nodeType === 3 || node.nodeType === 4) { // Node.TEXT_NODE or Node.CDATA_SECTION_NODE
          var text = node.data.replace(/[ \r\n\t]+/g, ' ');
    
          if ((!prevText || / $/.test(prevText.data)) &&
              !prevVoid && text[0] === ' ') {
            text = text.substr(1);
          }
    
          // `text` might be empty at this point.
          if (!text) {
            node = remove(node);
            continue
          }
    
          node.data = text;
    
          prevText = node;
        } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
          if (isBlock(node) || node.nodeName === 'BR') {
            if (prevText) {
              prevText.data = prevText.data.replace(/ $/, '');
            }
    
            prevText = null;
            prevVoid = false;
          } else if (isVoid(node)) {
            // Avoid trimming space around non-block, non-BR void elements.
            prevText = null;
            prevVoid = true;
          }
        } else {
          node = remove(node);
          continue
        }
    
        var nextNode = next(prev, node, isPre);
        prev = node;
        node = nextNode;
      }
    
      if (prevText) {
        prevText.data = prevText.data.replace(/ $/, '');
        if (!prevText.data) {
          remove(prevText);
        }
      }
    }
    
    /**
     * remove(node) removes the given node from the DOM and returns the
     * next node in the sequence.
     *
     * @param {Node} node
     * @return {Node} node
     */
    function remove (node) {
      var next = node.nextSibling || node.parentNode;
    
      node.parentNode.removeChild(node);
    
      return next
    }
    
    /**
     * next(prev, current, isPre) returns the next node in the sequence, given the
     * current and previous nodes.
     *
     * @param {Node} prev
     * @param {Node} current
     * @param {Function} isPre
     * @return {Node}
     */
    function next (prev, current, isPre) {
      if ((prev && prev.parentNode === current) || isPre(current)) {
        return current.nextSibling || current.parentNode
      }
    
      return current.firstChild || current.nextSibling || current.parentNode
    }
    
    /*
     * Set up window for Node.js
     */
    
    var root = (typeof window !== 'undefined' ? window : {});
    
    /*
     * Parsing HTML strings
     */
    
    function canParseHTMLNatively () {
      var Parser = root.DOMParser;
      var canParse = false;
    
      // Adapted from https://gist.github.com/1129031
      // Firefox/Opera/IE throw errors on unsupported types
      try {
        // WebKit returns null on unsupported types
        if (new Parser().parseFromString('', 'text/html')) {
          canParse = true;
        }
      } catch (e) {}
    
      return canParse
    }
    
    function createHTMLParser () {
      var Parser = function () {};
    
      {
        if (shouldUseActiveX()) {
          Parser.prototype.parseFromString = function (string) {
            var doc = new window.ActiveXObject('htmlfile');
            doc.designMode = 'on'; // disable on-page scripts
            doc.open();
            doc.write(string);
            doc.close();
            return doc
          };
        } else {
          Parser.prototype.parseFromString = function (string) {
            var doc = document.implementation.createHTMLDocument('');
            doc.open();
            doc.write(string);
            doc.close();
            return doc
          };
        }
      }
      return Parser
    }
    
    function shouldUseActiveX () {
      var useActiveX = false;
      try {
        document.implementation.createHTMLDocument('').open();
      } catch (e) {
        if (window.ActiveXObject) useActiveX = true;
      }
      return useActiveX
    }
    
    var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
    
    function RootNode (input) {
      var root;
      if (typeof input === 'string') {
        var doc = htmlParser().parseFromString(
          // DOM parsers arrange elements in the <head> and <body>.
          // Wrapping in a custom element ensures elements are reliably arranged in
          // a single element.
          '<x-turndown id="turndown-root">' + input + '</x-turndown>',
          'text/html'
        );
        root = doc.getElementById('turndown-root');
      } else {
        root = input.cloneNode(true);
      }
      collapseWhitespace({
        element: root,
        isBlock: isBlock,
        isVoid: isVoid
      });
    
      return root
    }
    
    var _htmlParser;
    function htmlParser () {
      _htmlParser = _htmlParser || new HTMLParser();
      return _htmlParser
    }
    
    function Node (node) {
      node.isBlock = isBlock(node);
      node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode;
      node.isBlank = isBlank(node);
      node.flankingWhitespace = flankingWhitespace(node);
      return node
    }
    
    function isBlank (node) {
      return (
        ['A', 'TH', 'TD'].indexOf(node.nodeName) === -1 &&
        /^\s*$/i.test(node.textContent) &&
        !isVoid(node) &&
        !hasVoid(node)
      )
    }
    
    function flankingWhitespace (node) {
      var leading = '';
      var trailing = '';
    
      if (!node.isBlock) {
        var hasLeading = /^[ \r\n\t]/.test(node.textContent);
        var hasTrailing = /[ \r\n\t]$/.test(node.textContent);
    
        if (hasLeading && !isFlankedByWhitespace('left', node)) {
          leading = ' ';
        }
        if (hasTrailing && !isFlankedByWhitespace('right', node)) {
          trailing = ' ';
        }
      }
    
      return { leading: leading, trailing: trailing }
    }
    
    function isFlankedByWhitespace (side, node) {
      var sibling;
      var regExp;
      var isFlanked;
    
      if (side === 'left') {
        sibling = node.previousSibling;
        regExp = / $/;
      } else {
        sibling = node.nextSibling;
        regExp = /^ /;
      }
    
      if (sibling) {
        if (sibling.nodeType === 3) {
          isFlanked = regExp.test(sibling.nodeValue);
        } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
          isFlanked = regExp.test(sibling.textContent);
        }
      }
      return isFlanked
    }
    
    var reduce = Array.prototype.reduce;
    var leadingNewLinesRegExp = /^\n*/;
    var trailingNewLinesRegExp = /\n*$/;
    
    function TurndownService (options) {
      if (!(this instanceof TurndownService)) return new TurndownService(options)
    
      var defaults = {
        rules: rules,
        headingStyle: 'setext',
        hr: '* * *',
        bulletListMarker: '*',
        codeBlockStyle: 'indented',
        fence: '```',
        emDelimiter: '_',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        linkReferenceStyle: 'full',
        br: '  ',
        blankReplacement: function (content, node) {
          return node.isBlock ? '\n\n' : ''
        },
        keepReplacement: function (content, node) {
          return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
        },
        defaultReplacement: function (content, node) {
          return node.isBlock ? '\n\n' + content + '\n\n' : content
        }
      };
      this.options = extend({}, defaults, options);
      this.rules = new Rules(this.options);
    }
    
    TurndownService.prototype = {
      /**
       * The entry point for converting a string or DOM node to Markdown
       * @public
       * @param {String|HTMLElement} input The string or DOM node to convert
       * @returns A Markdown representation of the input
       * @type String
       */
    
      turndown: function (input) {
        if (!canConvert(input)) {
          throw new TypeError(
            input + ' is not a string, or an element/document/fragment node.'
          )
        }
    
        if (input === '') return ''
    
        var output = process.call(this, new RootNode(input));
        return postProcess.call(this, output)
      },
    
      /**
       * Add one or more plugins
       * @public
       * @param {Function|Array} plugin The plugin or array of plugins to add
       * @returns The Turndown instance for chaining
       * @type Object
       */
    
      use: function (plugin) {
        if (Array.isArray(plugin)) {
          for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
        } else if (typeof plugin === 'function') {
          plugin(this);
        } else {
          throw new TypeError('plugin must be a Function or an Array of Functions')
        }
        return this
      },
    
      /**
       * Adds a rule
       * @public
       * @param {String} key The unique key of the rule
       * @param {Object} rule The rule
       * @returns The Turndown instance for chaining
       * @type Object
       */
    
      addRule: function (key, rule) {
        this.rules.add(key, rule);
        return this
      },
    
      /**
       * Keep a node (as HTML) that matches the filter
       * @public
       * @param {String|Array|Function} filter The unique key of the rule
       * @returns The Turndown instance for chaining
       * @type Object
       */
    
      keep: function (filter) {
        this.rules.keep(filter);
        return this
      },
    
      /**
       * Remove a node that matches the filter
       * @public
       * @param {String|Array|Function} filter The unique key of the rule
       * @returns The Turndown instance for chaining
       * @type Object
       */
    
      remove: function (filter) {
        this.rules.remove(filter);
        return this
      },
    
      /**
       * Escapes Markdown syntax
       * @public
       * @param {String} string The string to escape
       * @returns A string with Markdown syntax escaped
       * @type String
       */
    
      escape: function (string) {
        return (
          string
            // Escape backslash escapes!
            .replace(/\\(\S)/g, '\\\\$1')
    
            // Escape headings
            .replace(/^(#{1,6} )/gm, '\\$1')
    
            // Escape hr
            .replace(/^([-*_] *){3,}$/gm, function (match, character) {
              return match.split(character).join('\\' + character)
            })
    
            // Escape ol bullet points
            .replace(/^(\W* {0,3})(\d+)\. /gm, '$1$2\\. ')
    
            // Escape ul bullet points
            .replace(/^([^\\\w]*)[*+-] /gm, function (match) {
              return match.replace(/([*+-])/g, '\\$1')
            })
    
            // Escape blockquote indents
            .replace(/^(\W* {0,3})> /gm, '$1\\> ')
    
            // Escape em/strong *
            .replace(/\*+(?![*\s\W]).+?\*+/g, function (match) {
              return match.replace(/\*/g, '\\*')
            })
    
            // Escape em/strong _
            .replace(/_+(?![_\s\W]).+?_+/g, function (match) {
              return match.replace(/_/g, '\\_')
            })
    
            // Escape code _
            .replace(/`+(?![`\s\W]).+?`+/g, function (match) {
              return match.replace(/`/g, '\\`')
            })
    
            // Escape link brackets
            .replace(/[\[\]]/g, '\\$&') // eslint-disable-line no-useless-escape
        )
      }
    };
    
    /**
     * Reduces a DOM node down to its Markdown string equivalent
     * @private
     * @param {HTMLElement} parentNode The node to convert
     * @returns A Markdown representation of the node
     * @type String
     */
    
    function process (parentNode) {
      var self = this;
      return reduce.call(parentNode.childNodes, function (output, node) {
        node = new Node(node);
    
        var replacement = '';
        if (node.nodeType === 3) {
          replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
        } else if (node.nodeType === 1) {
          replacement = replacementForNode.call(self, node);
        }
    
        return join(output, replacement)
      }, '')
    }
    
    /**
     * Appends strings as each rule requires and trims the output
     * @private
     * @param {String} output The conversion output
     * @returns A trimmed version of the ouput
     * @type String
     */
    
    function postProcess (output) {
      var self = this;
      this.rules.forEach(function (rule) {
        if (typeof rule.append === 'function') {
          output = join(output, rule.append(self.options));
        }
      });
    
      return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
    }
    
    /**
     * Converts an element node to its Markdown equivalent
     * @private
     * @param {HTMLElement} node The node to convert
     * @returns A Markdown representation of the node
     * @type String
     */
    
    function replacementForNode (node) {
      var rule = this.rules.forNode(node);
      var content = process.call(this, node);
      var whitespace = node.flankingWhitespace;
      if (whitespace.leading || whitespace.trailing) content = content.trim();
      return (
        whitespace.leading +
        rule.replacement(content, node, this.options) +
        whitespace.trailing
      )
    }
    
    /**
     * Determines the new lines between the current output and the replacement
     * @private
     * @param {String} output The current conversion output
     * @param {String} replacement The string to append to the output
     * @returns The whitespace to separate the current output and the replacement
     * @type String
     */
    
    function separatingNewlines (output, replacement) {
      var newlines = [
        output.match(trailingNewLinesRegExp)[0],
        replacement.match(leadingNewLinesRegExp)[0]
      ].sort();
      var maxNewlines = newlines[newlines.length - 1];
      return maxNewlines.length < 2 ? maxNewlines : '\n\n'
    }
    
    function join (string1, string2) {
      var separator = separatingNewlines(string1, string2);
    
      // Remove trailing/leading newlines and replace with separator
      string1 = string1.replace(trailingNewLinesRegExp, '');
      string2 = string2.replace(leadingNewLinesRegExp, '');
    
      return string1 + separator + string2
    }
    
    /**
     * Determines whether an input can be converted
     * @private
     * @param {String|HTMLElement} input Describe this parameter
     * @returns Describe what it returns
     * @type String|Object|Array|Boolean|Number
     */
    
    function canConvert (input) {
      return (
        input != null && (
          typeof input === 'string' ||
          (input.nodeType && (
            input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
          ))
        )
      )
    }
    
    return TurndownService;
    
    }());


return {
  Notify   : Notify,
  PureRead : PureRead,
  puplugin : puplugin,
  TurndownService : TurndownService,
}