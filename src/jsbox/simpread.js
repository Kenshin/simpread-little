
const script       = document.createElement( "script" ),
      script_src   = "https://cdn.bootcss.com/script.js/2.5.8/script.min.js",
      jq_src       = "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js",
      puread_src   = "https://greasyfork.org/scripts/39995-pureread/code/PureRead.js",
      notify_src   = "https://greasyfork.org/scripts/40236-notify/code/Notify.js",
      puplugin_src = "https://greasyfork.org/scripts/39997-puplugin/code/PuPlugin.js",
      mduikit_src  = "https://greasyfork.org/scripts/40244-mduikit/code/MDUIKit.js",
      json         = "https://raw.githubusercontent.com/kenshin/simpread-little/develop/src/jsbox/res/website_list_v3.json";

const notif_style  = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/notify.css"        rel="stylesheet">',
      main_style   = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/simpread.css"      rel="stylesheet">',
      user_style   = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/simpread_user.css" rel="stylesheet">',
      option_style = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/option.css"        rel="stylesheet">',
      theme_common = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/theme_common.css"  rel="stylesheet">',
      theme_pixyii = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/theme_pixyii.css"  rel="stylesheet">',
      theme_gothic = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/theme_gothic.css"  rel="stylesheet">',
      theme_night  = '<link href="http://ojec5ddd5.bkt.clouddn.com/puread/theme_night.css"   rel="stylesheet">';

script.type        = "text/javascript";
script.src         = script_src;
script.onload      = () => {
    $script( jq_src, () => {
        $("head").append( notif_style )
                 .append( main_style )
                 .append( option_style )
                 .append( user_style )
                 .append( theme_common );
        $script( [ puread_src, notify_src, puplugin_src, mduikit_src ], "bundle" );
        $script.ready( "bundle", () => {
            $.getJSON( json, result => {
                const pr = new PureRead();
                pr.Addsites(result);
                pr.AddPlugin(puplugin.Plugin());
                pr.Getsites();
                readMode( pr, puplugin, $ );
            });
        });
    });
};
document.body.appendChild( script );

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

    $("head").append( theme_gothic );
    //style.FontFamily( simpread.read.fontfamily );
    //style.FontSize(   simpread.read.fontsize   );
    //style.Layout(     simpread.read.layout     );

    // exit
    $( ".simpread-read-root sr-rd-crlbar fab" ).one( "click", event => {
        $( ".simpread-read-root" ).addClass( "simpread-read-root-hide" );
        $root.removeClass( "simpread-theme-root" )
             .removeClass( "simpread-font" );
        if ( $root.attr("style") ) $root.attr( "style", $root.attr("style").replace( "font-size: 62.5%!important", "" ));
        $( "body" ).removeClass( "simpread-hidden" );
        $( ".simpread-read-root" ).remove();
    });

}