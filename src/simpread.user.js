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
// @resource     user_style   https://gist.github.com/Kenshin/365a91c61bad550b5900247539113f06/raw/23ad1acaa0751d27d8cd3fcbaa752ab8896e05b0/simpread_user.css
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
    $root        = $( "html" ),
    bgtmpl       = `<div class="simpread-read-root">
                        <sr-read>
                            <sr-rd-title></sr-rd-title>
                            <sr-rd-desc></sr-rd-desc>
                            <sr-rd-content></sr-rd-content>
                            <sr-rd-crlbar class="controlbar">
                                <fab>╳</fab>
                            </sr-rd-crlbar>
                        </sr-read>
                    </div>`,
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

console.log( "current pureread is ", pr, simpread );

if (pr.state != "none" ) {
    bindShortcuts();
    controlbar();
}

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
            console.log( "asdfasdfasf" )
        }
    });
}

/**
 * Focus
 */
function focusMode() {

}

/**
 * Read mode
 */
function readMode() {
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
        readMode();
    });
};
