// ==UserScript==
// @name         简悦 - SimpRead
// @namespace    http://ksria.com/simpread/
// @version      1.0.0.0328-beta
// @description  简悦 - 让你瞬间进入沉浸式阅读的 User Script 扩展
// @author       Kenshin <kenshin@ksria.com>
// @include      http://*/*
// @include      https://*/*
// @require      https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js
// @require      http://ojec5ddd5.bkt.clouddn.com/puread/mousetrap.min.js
// @require      https://greasyfork.org/scripts/39995-pureread/code/PureRead.js?version=261636
// @require      https://greasyfork.org/scripts/39997-puplugin/code/PuPlugin.js?version=261638
// @resource     websites     http://ojec5ddd5.bkt.clouddn.com/website_list_v3.json?data=0402
// @resource     origins      http://ojec5ddd5.bkt.clouddn.com/website_list_origins.json
// @resource     main_style   http://ojec5ddd5.bkt.clouddn.com/puread/simpread.css
// @resource     user_style   https://gist.github.com/Kenshin/365a91c61bad550b5900247539113f06/raw/8b1146ab3b876d174ba278052b345c7ae08f0e96/simpread_user.css
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
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

const pr         = new PureRead(),
    websites     = GM_getResourceText( "websites" ),
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
    focus        = {
        version   : "2016-12-29",
        bgcolor   : "rgba( 235, 235, 235, 0.9 )",
        controlbar: true,
        mask      : true,
        highlight : true,
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
        origins   : [],
    };
    let simpread = { focus, read, option };

/****************************
 * Entry
 ****************************/

// add simpread style
GM_addStyle( main_style );
GM_addStyle( user_style );
GM_addStyle( theme_common );

// add websites and current can'b read mode
pr.Addsites( JSON.parse( websites ));
pr.AddPlugin( puplugin.Plugin() );
pr.Getsites();

// set/get storage
if (GM_getValue( "simpread" )) {
    simpread = GM_getValue( "simpread" )
} else {
    GM_setValue( "simpread",  simpread );
}

if (pr.state != "none" ) {
    bindShortcuts();
    controlbar();
}

console.log( "current pureread is ", pr, simpread );

/****************************
 * Method
 ****************************/

/**
 * Keyboard event handler
 */
function bindShortcuts() {
    Mousetrap.bind( [ simpread.focus.shortcuts.toLowerCase() ], focusMode );
    Mousetrap.bind( [ simpread.read.shortcuts.toLowerCase()  ], readMode  );
    Mousetrap.bind( "esc", ( event, combo ) => {
        if ( combo == "esc" && simpread.option.esc ) {
            if ( $( ".simpread-read-root" ).length > 0 ) $( ".simpread-read-root sr-rd-crlbar fab" )[0].click();
        }
    });
}

/**
 * Focus mode
 */
function focusMode() {
    let $focus = pr.Include(),
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

    while ( $focus.length == 0 ) {
        if ( $( "body" ).find( "article" ).length > 0 ) {
            $focus = $( "body" ).find( "article" );
        }
        else {
            try {
                sel    = window.getSelection();
                range  = sel.getRangeAt( sel.rangeCount - 1 );
                node   = range.startContainer.nodeName;
            if ( node.toLowerCase() === "body" ) throw( "selection area is body tag." );
                $focus = $( range.startContainer.parentNode );
            } catch ( error ) {
                console.log( sel, range, node )
                console.error( error )
            }
        }
    }

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
        .css({ "background-color" : focus.bgcolor })
        .animate({ opacity: 1 });

    // click mask remove it
    $( bgclsjq ).on( "click", ( event, data ) => {
            $( bgclsjq ).animate({ opacity: 0 }, {
                complete: ()=> {
                    includeStyle( $focus, focusstyle, focuscls, "delete" );
                    excludeStyle( $focus, "add" );
                    $( bgclsjq   ).remove();
                    $( bgclsjq   ).off( "click" );
                    $( "sr-rd-crlbar fab" ).removeClass( "focus-crlbar-close" ).text( "简 悦" );
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
    $( "sr-rd-crlbar fab" ).addClass( "focus-crlbar-close" ).text( "╳" );
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
                            <sr-rd-crlbar class="controlbar">
                                <fab style="font-size:12px!important;">╳</fab>
                            </sr-rd-crlbar>
                        </sr-read>
                    </div>`;

    GM_addStyle( theme_pixyii );
    pr.ReadMode();

    $( "body" ).addClass( "simpread-hidden" );
    $root
        .addClass( "simpread-font" )
        .addClass( "simpread-theme-root" )
        .append( bgtmpl );

    $( ".simpread-read-root" )
        .addClass( "simpread-theme-root" )
        .animate( { opacity: 1 }, { delay: 100 })
        .addClass( "simpread-read-root-show" );

    $( "sr-rd-title" ).html(   pr.html.title   );
    $( "sr-rd-desc" ).html(    pr.html.desc    );
    $( "sr-rd-content" ).html( pr.html.include );
    if ( pr.html.desc === "" ) $( "sr-rd-desc" ).remove();

    $("sr-rd-content").find( pr.Exclude( $("sr-rd-content") ) ).remove();
    pr.Beautify( $( "sr-rd-content" ) );
    pr.Format( "simpread-read-root" );

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
 * Control bar
 */
function controlbar() {
    $( "body" ).append( '<sr-rd-crlbar class="controlbar"><fab style="font-size:12px!important;">简 悦</fab></sr-rd-crlbar>' );
    $( "sr-rd-crlbar" ).css( "opacity", 1 );
    setTimeout( () => {
        $( "sr-rd-crlbar" ).removeAttr( "style" );
    }, 1000 * 2 );
    $( "sr-rd-crlbar fab" ).click(  event => {
        if ( $(event.target).hasClass( "focus-crlbar-close" ) ) {
            $( ".simpread-focus-root" )[0].click();
            $( event.target ).removeClass( "focus-crlbar-close" ).text( "简 悦" );
        } else readMode();
    });
};
