// ==UserScript==
// @name         简悦( SimpRead ) · 轻阅版
// @namespace    http://ksria.com/simpread/
// @version      1.0.1.0404-beta
// @description  简悦 - 让你瞬间进入沉浸式阅读的 User Script 扩展
// @author       Kenshin <kenshin@ksria.com>
// @include      http://*/*
// @include      https://*/*
// @require      https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js
// @require      https://greasyfork.org/scripts/40244-mduikit/code/MDUIKit.js?version=263075
// @require      https://greasyfork.org/scripts/40236-notify/code/Notify.js?version=263047
// @require      https://greasyfork.org/scripts/40172-mousetrap/code/Mousetrap.js?version=262594
// @require      https://greasyfork.org/scripts/39995-pureread/code/PureRead.js?version=261636
// @require      https://greasyfork.org/scripts/39997-puplugin/code/PuPlugin.js?version=262834
// @resource     websites     http://ojec5ddd5.bkt.clouddn.com/website_list_v3.json?data=0402
// @resource     origins      http://ojec5ddd5.bkt.clouddn.com/website_list_origins.json
// @resource     notify_style http://ojec5ddd5.bkt.clouddn.com/puread/notify.css
// @resource     main_style   http://ojec5ddd5.bkt.clouddn.com/puread/simpread.css
// @resource     user_style   https://gist.github.com/Kenshin/365a91c61bad550b5900247539113f06/raw/4204bfba1f7cc75d8818f82b4b65b58ddc173e3d/simpread_user.css
// @resource     theme_common http://ojec5ddd5.bkt.clouddn.com/puread/theme_common.css
// @resource     theme_dark   http://ojec5ddd5.bkt.clouddn.com/puread/theme_dark.css
// @resource     theme_github http://ojec5ddd5.bkt.clouddn.com/puread/theme_github.css
// @resource     theme_gothic http://ojec5ddd5.bkt.clouddn.com/puread/theme_gothic.css
// @resource     theme_night  http://ojec5ddd5.bkt.clouddn.com/puread/theme_night.css
// @resource     theme_pixyii http://ojec5ddd5.bkt.clouddn.com/puread/theme_pixyii.css
// @resource     theme_engwrite  http://ojec5ddd5.bkt.clouddn.com/puread/theme_engwrite.css
// @resource     theme_monospace http://ojec5ddd5.bkt.clouddn.com/puread/theme_monospace.css
// @resource     theme_newsprint http://ojec5ddd5.bkt.clouddn.com/puread/theme_newsprint.css
// @resource     theme_octopress http://ojec5ddd5.bkt.clouddn.com/puread/theme_octopress.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

const pr         = new PureRead(),
      style      = puplugin.Plugin( "style" ),
    websites     = GM_getResourceText( "websites" ),
    notify_style = GM_getResourceText( "notify_style" ),
    main_style   = GM_getResourceText( "main_style" ),
    user_style   = GM_getResourceText( "user_style" ),
    theme_common = GM_getResourceText( "theme_common" ),
    theme_dark   = GM_getResourceText( "theme_dark" ),
    theme_github = GM_getResourceText( "theme_github" ),
    theme_gothic = GM_getResourceText( "theme_gothic" ),
    theme_night  = GM_getResourceText( "theme_night" ),
    theme_pixyii = GM_getResourceText( "theme_pixyii" ),
    theme_engwrite  = GM_getResourceText( "theme_engwrite" ),
    theme_monospace = GM_getResourceText( "theme_monospace" ),
    theme_newsprint = GM_getResourceText( "theme_newsprint" ),
    theme_octopress = GM_getResourceText( "theme_octopress" ),
    theme        = { theme_dark, theme_github, theme_gothic, theme_night, theme_pixyii, theme_engwrite, theme_monospace, theme_newsprint, theme_octopress },
    focus        = {
        version   : "2016-12-29",
        bgcolor   : "rgba( 235, 235, 235, 0.9 )",
        mask      : true,
        highlight : true,  // not-write, only read
        opacity   : 90,
        shortcuts : "A S",
    },
    read         = {
        version   : "2017-03-16",
        auto      : false,
        controlbar: true,
        highlight : true,
        shortcuts : "A A",
        theme     : "github",
        fontfamily: "default",
        whitelist : [],
        exclusion : [
            "v2ex.com","issue.github.com","readme.github.com","question.zhihu.com","douban.com","nationalgeographic.com.cn","tech.163.com","docs.microsoft.com","msdn.microsoft.com","baijia.baidu.com","code.oschina.net","http://www.ifanr.com","http://www.ifanr.com/news","http://www.ifanr.com/app","http://www.ifanr.com/minapp","http://www.ifanr.com/dasheng","http://www.ifanr.com/data","https://www.ifanr.com/app","http://www.ifanr.com/weizhizao","http://www.thepaper.cn","http://www.pingwest.com","http://tech2ipo.com","https://www.waerfa.com/social"
        ],
        fontsize  : "",  // default 62.5%
        layout    : "",  // default 20%
    },
    option = {
        version   : "2017-04-03",
        esc       : true,
        trigger   : "read", // include: 'focus' 'read', only by userscript
        origins   : [],
    };
    let simpread = { version: "1.1.0", focus, read, option },
        org_simp = { ...simpread };

/****************************
 * Entry
 ****************************/

// add simpread style
GM_addStyle( notify_style );
GM_addStyle( main_style );
GM_addStyle( user_style );
GM_addStyle( theme_common );

// add websites and current can'b read mode
pr.Addsites( JSON.parse( websites ));
pr.AddPlugin( puplugin.Plugin() );
pr.Getsites();

// initialize
version();
bindShortcuts();
controlbar();
autoOpen();

console.log( "current pureread is ", pr, simpread );

/****************************
 * Method
 ****************************/
/**
 * Version
 */
function version() {
    // get and set simpread
    if (GM_getValue( "simpread" )) {
        simpread = GM_getValue( "simpread" )
    } else {
        GM_setValue( "simpread",  simpread );
    }
    // compare
    if ( simpread.version != org_simp.version ) {
        if ( simpread.version == undefined ) {
            simpread = { ...org_simp };
        } else {
            Object.keys( org_simp ).forEach( key => {
                if ( !simpread[key] ) {
                    simpread[key] = org_simp[key];
                }
            });
        }
        GM_setValue( "simpread",  simpread );
        GM_notification( `简悦 · 轻阅版 已升级到最新版${GM_info.script.version}，如需生效请刷新页面。`, "简悦 · 轻阅版升级提示", GM_info.script.icon );
    }
}

/**
 * Keyboard event handler
 */
function bindShortcuts() {
    Mousetrap.bind( [ simpread.focus.shortcuts.toLowerCase() ], () => [ "none", "temp" ].includes( pr.state ) ? simpread.focus.highlight == true && tempMode( "focus" ) : focusMode() );
    Mousetrap.bind( [ simpread.read.shortcuts.toLowerCase()  ], () => [ "none", "temp" ].includes( pr.state ) ? simpread.read.highlight  == true && tempMode( "read"  ) : readMode()  );
    Mousetrap.bind( "esc", ( event, combo ) => {
        if ( combo == "esc" && simpread.option.esc ) {
            if ( $( ".simpread-read-root"  ).length > 0 ) $( ".simpread-read-root sr-rd-crlbar fab" )[0].click();
            if ( $( ".simpread-focus-root" ).length > 0 ) $( "sr-rd-crlbar fab" )[0].click();
        }
    });
}

/**
 * Auto open read mode
 */
function autoOpen() {
    const exclusion = ( minimatch, data ) => {
            const url = window.location.origin + window.location.pathname;
            return data.findIndex( item => {
                item = item.trim();
                return item.startsWith( "http" ) ? minimatch( url, item ) : item == pr.current.site.name;
            }) == -1 ? true : false;
        },
        whitelist = ( minimatch, data ) => {
            const url = window.location.origin + window.location.pathname;
            return data.findIndex( item => {
                item = item.trim();
                return item.startsWith( "http" ) ? minimatch( url, item ) : item == pr.current.site.name;
            }) != -1 ? true : false;
        };
    if   ( window.location.href.includes( "simpread_mode=read"     ) ||
         ( simpread.read.auto  && exclusion( puplugin.Plugin( "minimatch" ), simpread.read.exclusion )) ||
         ( !simpread.read.auto && whitelist( puplugin.Plugin( "minimatch" ), simpread.read.whitelist ))
        ) {
        switch ( pr.current.site.name ) {
            case "my.oschina.net":
            case "36kr.com":
            case "chiphell.com":
            case "question.zhihu.com":
                $( () => readMode() );
                break;
            case "post.juejin.im":
            case "entry.juejin.im":
                setTimeout( ()=>readMode(), 2500 );
                break;
            case "kancloud.cn":
            case "sspai.com":
                setTimeout( ()=>readMode(), 1000 );
                break;
            default:
                if ( pr.state == "adapter" ) readMode();
                break;
        }
    }
}

/**
 * Control bar
 */
function controlbar() {
    $( "body" ).append( '<sr-rd-crlbar class="controlbar"><fab class="setting"></fab><fab style="font-size:12px!important;">简 悦</fab></sr-rd-crlbar>' );
    $( "sr-rd-crlbar" ).css( "opacity", 1 );
    if ( pr.state == "none" ) $( "sr-rd-crlbar fab:not(.setting)" ).addClass( "not-adapter" );
    setTimeout( () => {
        $( "sr-rd-crlbar" ).removeAttr( "style" );
    }, 1000 * 2 );
    $( "sr-rd-crlbar fab:not(.setting)" ).click(  event => {
        if ( $(event.target).hasClass( "focus-crlbar-close" ) ) {
            $( ".simpread-focus-root" ).trigger( "click", "okay" );
            $( event.target ).removeClass( "focus-crlbar-close" ).text( "简 悦" );
        } else {
            if ( [ "none", "temp" ].includes( pr.state ) ) {
                tempMode( simpread.option.trigger );
            } else {
                if ( simpread.option.trigger == "read" ) {
                    readMode();
                } else focusMode();
            }
        }
        event.preventDefault();
        return false;
    });    
    $( "sr-rd-crlbar fab:not(.setting)" ).mouseover( () => {
        if ( $( ".simpread-focus-root" ).length == 0 ) {
            $( "sr-rd-crlbar fab.setting" ).addClass( "show" );
        }
        $( "sr-rd-crlbar" ).one( "mouseleave" , () => {
            $( "sr-rd-crlbar fab.setting" ).removeClass( "show" );
        });
    });
    $( "sr-rd-crlbar fab.setting" ).click( () => {
        // TO-DO
    });
};

/**
 * Focus mode
 * 
 * @param {dom} html element
 */
function focusMode( element = undefined ) {
    let $focus = element ? $(element) : pr.Include(),
        tag, $parent,
        sel, range, node;
    const focuscls   = "simpread-focus-highlight",
          focusstyle = "z-index: 2147483646; overflow: visible; position: relative;",
          maskcls    = "simpread-focus-mask",
          maskstyle  = "z-index: auto; opacity: 1; overflow: visible; transform: none; animation: none; position: relative;",
          bgcls      = "simpread-focus-root",
          bgtmpl     = "<div class=" + bgcls + "></div>",
          bgclsjq    = "." + bgcls,
          includeStyle = ( $target, style, cls, type ) => {
            $target.each( ( idx, ele ) => {
                let bakstyle,
                    selector = $(ele);
                if ( type === "add" ) {
                    bakstyle = selector.attr( "style" ) == undefined ? "" : selector.attr( "style" );
                    selector.attr( "style", bakstyle + style ).addClass( cls );
                } else if (  type === "delete" ) {
                    bakstyle = selector.attr( "style" );
                    bakstyle = bakstyle.replace( style, "" );
                    selector.attr( "style", bakstyle ).removeClass( cls );
                }
            });
        },
        excludeStyle = ( $target, type ) => {
            const tags = pr.Exclude( $target );
            if ( type == "delete" )   $target.find( tags ).hide();
            else if ( type == "add" ) $target.find( tags ).show();
        };

    // set include style
    includeStyle( $focus, focusstyle, focuscls, "add" );

    // set exclude style
    excludeStyle( $focus, "delete" );

    // add simpread-focus-mask
    $parent = $focus.parent();
    tag     = $parent[0].tagName;
    while ( tag.toLowerCase() != "body" ) {
        includeStyle( $parent, maskstyle, maskcls, "add" );
        $parent = $parent.parent();
        tag     = $parent[0].tagName;
    }

    // add background
    $( "body" ).append( bgtmpl );

    // add background color
    $( bgclsjq )
        .css({ "background-color" : simpread.focus.bgcolor })
        .animate({ opacity: 1 });

    // click mask remove it
    $( bgclsjq ).on( "click", ( event, data ) => {
            if ( !simpread.focus.mask && !data ) return;
            $( bgclsjq ).animate({ opacity: 0 }, {
                complete: ()=> {
                    includeStyle( $focus, focusstyle, focuscls, "delete" );
                    excludeStyle( $focus, "add" );
                    $( bgclsjq   ).remove();
                    $( bgclsjq   ).off( "click" );
                    $( "sr-rd-crlbar fab:not(.setting)" ).removeClass( "focus-crlbar-close" ).text( "简 悦" );
                }
            });

        // remove simpread-focus-mask style
        $parent = $focus.parent();
        tag     = $parent[0].tagName;
        while ( tag && tag.toLowerCase() != "body" ) {
            includeStyle( $parent, maskstyle, maskcls, "delete" );
            $parent = $parent.parent();
            tag     = $parent[0].tagName;
        }
    });

    // set focus controlbar
    $( "sr-rd-crlbar fab:not(.setting)" ).addClass( "focus-crlbar-close" ).text( "╳" );
}

/**
 * Read mode
 */
function readMode() {
    const $root  = $( "html" ),
          bgtmpl = `<div class="simpread-read-root">
                        <sr-read>
                            <sr-rd-title></sr-rd-title>
                            <sr-rd-desc></sr-rd-desc>
                            <sr-rd-content></sr-rd-content>
                            <sr-page></sr-page>
                            <sr-rd-footer>
                                <sr-rd-footer-text style="display:none;">全文完</sr-rd-footer-text>
                                <sr-rd-footer-copywrite>
                                    <span>本文由 简悦 </span><a href="http://ksria.com/simpread" target="_blank">SimpRead</a><span> 优化，用以提升阅读体验。</span>
                                </sr-rd-footer-copywrite>
                                </sr-rd-footer>
                            <sr-rd-crlbar class=${ simpread.read.controlbar == true ? "" : "controlbar" }>
                                <fab style="font-size:12px!important;">╳</fab>
                            </sr-rd-crlbar>
                        </sr-read>
                    </div>`,
        multiple  = ( include, avatar ) => {
            const contents = [],
                names    = avatar[ 0 ].name,
                urls     = avatar[ 1 ].url;
            include.each( ( idx, item ) => {
                const art = {};
                art.name    = $( names[idx] ).text();
                art.url     = $( urls[idx]  ).attr( "src" );
                art.content = $( item       ).html();
                !art.url && ( art.url = default_src );
                contents.push( art );
            });
            const child = contents.map( item => {
                return `<sr-rd-mult>
                            <sr-rd-mult-avatar>
                                <div class="sr-rd-content-nobeautify"><img src=${ item.url } /></div>
                                <span>${ item.name }</span>
                            </sr-rd-mult-avatar>
                            <sr-rd-mult-content>${ item.content }</sr-rd-mult-content>
                    </sr-rd-mult>`;
            });
            $( "sr-rd-content" ).html( child );
        },
        paging = page => {
            const prev     = page[0].prev,
                  next     = page[1].next,
                  btn_next = mduikit.Button( next, "后一页 →", next == undefined ? true : false, "#fff", "#1976D2" ),
                  btn_prev = mduikit.Button( prev, "← 前一页", prev == undefined ? true : false, "#fff", "#1976D2" );
            if ( !prev && !next ) $( "sr-page" ).remove();
            else $( "sr-page" ).html( btn_prev + btn_next );
        },
        special = ()=> {
            if ( pr.current.site.name == "qdaily.com" ) {
                new Notify().Render( "简悦 · 轻阅版 并不支持此站的适配，如需请使用完整版。" );
                return true;
            }
            if ( pr.html.include.includes && pr.html.include.includes( "sr-rd-content-error" ) ) {
                new Notify().Render( `当前页面结构改变导致不匹配阅读模式，请报告 <a href="https://github.com/Kenshin/simpread/issues/new" target="_blank">此页面</a>` );
                simpread.read.highlight  == true && tempMode( "read"  );
                return true;
            }
        };

    pr.ReadMode();

    if ( special() ) return;

    $( "body" ).addClass( "simpread-hidden" );
    $root
        .addClass( "simpread-font" )
        .addClass( "simpread-theme-root" )
        .append( bgtmpl );

    $( ".simpread-read-root" )
        .addClass( "simpread-theme-root" )
        .animate( { opacity: 1 }, { delay: 100 })
        .addClass( "simpread-read-root-show" );

    $( "sr-rd-title"        ).html(   pr.html.title   );
    if ( pr.html.desc != "" ) $( "sr-rd-desc" ).html( pr.html.desc );
    else $( "sr-rd-desc"    ).remove();
    if   ( pr.html.avatar   ) multiple( pr.html.include, pr.html.avatar );
    else $( "sr-rd-content" ).html( pr.html.include );
    if   ( pr.html.paging   ) paging( pr.html.paging );
    else $( "sr-page"       ).remove();

    $("sr-rd-content").find( pr.Exclude( $("sr-rd-content") ) ).remove();
    pr.Beautify( $( "sr-rd-content" ) );
    pr.Format( "simpread-read-root" );

    GM_addStyle( theme[`theme_${simpread.read.theme}`]    );
    style.FontFamily( simpread.read.fontfamily );
    style.FontSize(   simpread.read.fontsize   );
    style.Layout(     simpread.read.layout     );

    // exit
    $( ".simpread-read-root sr-rd-crlbar fab" ).one( "click",  event => {
        $( ".simpread-read-root" ).animate( { opacity: 0 }, {
            delay: 100,
            complete: () => {
                $root.removeClass( "simpread-theme-root" )
                     .removeClass( "simpread-font" );
                if ( $root.attr("style") ) $root.attr( "style", $root.attr("style").replace( "font-size: 62.5%!important", "" ));
                $( "body" ).removeClass( "simpread-hidden" );
                $( ".simpread-read-root" ).remove();
            }
        }).addClass( "simpread-read-root-hide" );
    });
};

/**
 * Temp Read mode
 * 
 * @param {string} include: focus, read
 */
function tempMode( mode = "read" ) {
    new Notify().Render( "当前并未适配阅读模式，请移动鼠标手动生成 <a href='https://github.com/Kenshin/simpread/wiki/%E4%B8%B4%E6%97%B6%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F' target='_blank' >临时阅读模式</a>。" );
    highlight().done( dom => {
        if ( mode == "read" ) {
            pr.TempMode( mode, dom.outerHTML );
            readMode();
        } else focusMode( dom );
    });
}

/**
 * Highlight
 * 
 * @return {promise} promise
 */
function highlight() {
    const highlight_class= "simpread-highlight-selector";
    let $prev;
    const dtd            = $.Deferred(),
          mousemoveEvent = event => {
            if ( !$prev ) {
                $( event.target ).addClass( highlight_class );
            } else {
                $prev.removeClass( highlight_class );
                $( event.target ).addClass( highlight_class );
            }
            $prev = $( event.target );
    };
    $( "body" ).one( "click", event => {
        if ( !$prev ) return;
        $( event.target ).removeClass( highlight_class );
        $( "body"       ).off( "mousemove", mousemoveEvent );
        $prev = undefined;
        dtd.resolve( event.target );
    });
    $( "body" ).one( "keydown", event => {
        if ( event.keyCode == 27 && $prev ) {
            $( event.target ).find( `.${highlight_class}` ).removeClass( highlight_class );
            $( "body"       ).off( "mousemove", mousemoveEvent );
            $prev = undefined;
        }
    });
    $( "body" ).on( "mousemove", mousemoveEvent );
    return dtd;
}