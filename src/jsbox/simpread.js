
const script       = document.createElement( "script" ),
      script_src   = "https://cdn.bootcss.com/script.js/2.5.8/script.min.js",
      jq_src       = "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js",
      puread_src   = "https://greasyfork.org/scripts/39995-pureread/code/PureRead.js",
      notify_src   = "https://greasyfork.org/scripts/40236-notify/code/Notify.js",
      puplugin_src = "https://greasyfork.org/scripts/39997-puplugin/code/PuPlugin.js",
      mduikit_src  = "https://greasyfork.org/scripts/40244-mduikit/code/MDUIKit.js",
      json         = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/website_list_v3.json";

const notif_style  = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/notify.css",
      main_style   = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/simpread.css",
      user_style   = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/simpread_user.css",
      option_style = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/option.css",
      theme_common = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/theme_common.css",
      theme_pixyii = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/theme_pixyii.css",
      theme_gothic = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/theme_gothic.css",
      theme_night  = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/theme_night.css";

script.type        = "text/javascript";
script.src         = script_src;
script.onload      = () => {
    $script( jq_src, () => {
        $.get( notif_style,  result => { $("head").append( `<style type="text/css">${result}</style>` ) });
        $.get( main_style,   result => { $("head").append( `<style type="text/css">${result}</style>` ) });
        $.get( option_style, result => { $("head").append( `<style type="text/css">${result}</style>` ) });
        $.get( user_style,   result => { $("head").append( `<style type="text/css">${result}</style>` ) });
        $.get( theme_common, result => { $("head").append( `<style type="text/css">${result}</style>` ) });
        $script( [ puread_src, notify_src, puplugin_src, mduikit_src ], "bundle" );
        $script.ready( "bundle", () => {
            $.getJSON( json, result => {
                const pr = new PureRead();
                pr.Addsites(result);
                pr.AddPlugin(puplugin.Plugin());
                pr.Getsites();
                if ( pr.state == "none" ) {
                    alert( location.href )
                    new Notify().Render( "当前页面不支持简悦的阅读模式" );
                }
                else readMode( pr, puplugin, $ );
            });
        });
    });
};
document.body.appendChild( script );

/**
 * User Agent
 * 
 * @return {string} ipad and iphone
 */
function userAgent() {
    const ua = navigator.userAgent.toLowerCase();
    if ( ua.match( /ipad/i ) == "iphone" ) {
        return "iphone";
    } else {
        return "ipad";
    }
}

/**
 * Set style
 * 
 * @param {object} puplugin.Plugin( "style" )
 */
function setStyle( style ) {
    if ( userAgent() == "iphone" ) {
        style.FontSize( "62.5%" );
        $("sr-read").css({ "padding": "0 50px" });
        $.get( theme_gothic, result => { $("head").append( `<style type="text/css">${result}</style>` ) });
    } else {
        style.FontSize( "72%" );
        style.Layout( "10%" );
        $.get( theme_pixyii, result => { $("head").append( `<style type="text/css">${result}</style>` ) });
    }
}

/**
 * Control bar
 */
function controlbar() {
    let cur = 0;
    $( window ).scroll( event => {
        const next = $(window).scrollTop();
        if ( next > cur ) {
            $( "fab" ).css({ opacity: 0 });
        } else {
            $( "fab" ).css({ opacity: 1 });
        }
        cur = next;
    });
}

/**
 * Read mode
 */
function readMode( pr, puplugin, $ ) {
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
                            <sr-rd-crlbar>
                                <fab class="evernote"></fab>
                                <fab class="pocket"></fab>
                                <fab class="crlbar-close"></fab>
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
                  btn_next = mduikit.Button( "btn-next", "后一页 →", { href: next == undefined ? "javascript:;" : next, disable: next == undefined ? true : false, color: "#fff", bgColor: "#1976D2" }),
                  btn_prev = mduikit.Button( "btn-prev", "← 前一页", { href: prev == undefined ? "javascript:;" : prev, disable: prev == undefined ? true : false, color: "#fff", bgColor: "#1976D2" });
            if ( !prev && !next ) $( "sr-page" ).remove();
            else $( "sr-page" ).html( btn_prev + btn_next );
        },
        special = ()=> {
            if ( pr.html.include.includes && pr.html.include.includes( "sr-rd-content-error" ) ) {
                new Notify().Render( `当前页面结构改变导致不匹配阅读模式，请报告 <a href="https://github.com/Kenshin/simpread/issues/new" target="_blank">此页面</a>` );
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

    setStyle( puplugin.Plugin( "style" ) );
    controlbar();
    service( pr );

    // exit
    $( ".simpread-read-root sr-rd-crlbar fab.crlbar-close" ).one( "click", event => {
        $( ".simpread-read-root" ).addClass( "simpread-read-root-hide" );
        $root.removeClass( "simpread-theme-root" )
             .removeClass( "simpread-font" );
        if ( $root.attr("style") ) $root.attr( "style", $root.attr("style").replace( "font-size: 62.5%!important", "" ));
        $( "body" ).removeClass( "simpread-hidden" );
        $( ".simpread-read-root" ).remove();
    });

}

/**
 * Service
 * 
 * @param {object} pr object
 */
function service( pr ) {
    const clickEvent = event => {
        const type   = event.target.className,
              notify = new Notify().Render({ state: "loading", content: "保存中，请稍后！" });
        if ( type == "pocket" ) {
            $.ajax({
                url     : `http://localhost:3000/service/add`,
                type    : "POST",
                data    : {
                    name  : "pocket",
                    token : "68d4c6c6-7460-b8e3-96c5-7a176f",
                    tags  : "temp",
                    title : pr.html.title,
                    url   : location.href
                }
            }).done( ( result, textStatus, jqXHR ) => {
                console.log( result, textStatus, jqXHR )
                notify.complete();
                if ( result.code == 200 ) {
                    new Notify().Render( "保存成功！" );
                } else new Notify().Render( "保存失败，请稍候再试！" );
            }).fail( ( jqXHR, textStatus, error ) => {
                console.error( jqXHR, textStatus, error );
                notify.complete();
                new Notify().Render( "保存失败，请稍候再试！" );
            });
        } else if ( type == "evernote" ) {
            $.ajax({
                url     : `http://localhost:3000/evernote/add`,
                type    : "POST",
                headers : { sandbox: false, china: false, type: "evernote" },
                data    : {
                    token  : "S=s1:U=120a6:E=16739f21c19:C=15fe240ee38:P=81:A=wonle-9146:V=2:H=e95d8333616d0ec4946bbfca9e5b9c6d",
                    title  : pr.html.title,
                    content: pr.html.content,
                }
            }).done( ( result, textStatus, jqXHR ) => {
                console.log( result, textStatus, jqXHR )
                notify.complete();
                if ( result.code == 200 ) {
                    new Notify().Render( "保存成功！" );
                } else new Notify().Render( "保存失败，请稍候再试！" );
            }).fail( ( jqXHR, textStatus, error ) => {
                console.error( jqXHR, textStatus, error );
                notify.complete();
                new Notify().Render( "保存失败，请稍候再试！" );
            });
        }
    };
    $( "sr-rd-crlbar fab.pocket"   ).click( clickEvent );
    $( "sr-rd-crlbar fab.evernote" ).click( clickEvent );
}
