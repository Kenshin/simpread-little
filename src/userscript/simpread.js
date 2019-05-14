// ==UserScript==
// @name         简悦( SimpRead ) · 轻阅版
// @namespace    http://ksria.com/simpread/
// @version      1.1.2.5005
// @description  简悦 - 让你瞬间进入沉浸式阅读的 User Script 扩展
// @author       Kenshin <kenshin@ksria.com>
// @include      http://*/*
// @include      https://*/*
// @require      https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/highlight.min.js
// @require      https://greasyfork.org/scripts/40244-mduikit/code/MDUIKit.js?version=697886
// @require      https://greasyfork.org/scripts/40236-notify/code/Notify.js?version=697887
// @require      https://greasyfork.org/scripts/40172-mousetrap/code/Mousetrap.js?version=262594
// @require      https://greasyfork.org/scripts/39995-pureread/code/PureRead.js?version=697882
// @require      https://greasyfork.org/scripts/39997-puplugin/code/PuPlugin.js?version=697883
// @resource     global_sites http://sr.ksria.cn/website_list_v4.json?data=1.1.2.5005
// @resource     notify_style http://sr.ksria.cn/puread/notify.css?version=1.1.2.5005
// @resource     main_style   http://sr.ksria.cn/puread/simpread.css?version=1.1.2.5005
// @resource     mntips_style http://sr.ksria.cn/puread/mintooltip.css?version=1.1.2.5005
// @resource     option_style http://sr.ksria.cn/puread/option.css?version=1.1.2.5005
// @resource     user_style   https://gist.github.com/Kenshin/365a91c61bad550b5900247539113f06/raw/3e666bee279f249e5b59140d8a777192ecb121cd/simpread_user.css
// @resource     theme_common http://sr.ksria.cn/puread/theme_common.css?version=1.1.2.5005
// @resource     theme_dark   http://sr.ksria.cn/puread/theme_dark.css?version=1.1.2.5005
// @resource     theme_github http://sr.ksria.cn/puread/theme_github.css?version=1.1.2.5005
// @resource     theme_gothic http://sr.ksria.cn/puread/theme_gothic.css?version=1.1.2.5005
// @resource     theme_night  http://sr.ksria.cn/puread/theme_night.css?version=1.1.2.5005
// @resource     theme_pixyii http://sr.ksria.cn/puread/theme_pixyii.css?version=1.1.2.5005
// @resource     theme_engwrite  http://sr.ksria.cn/puread/theme_engwrite.css?version=1.1.2.5005
// @resource     theme_monospace http://sr.ksria.cn/puread/theme_monospace.css?version=1.1.2.5005
// @resource     theme_newsprint http://sr.ksria.cn/puread/theme_newsprint.css?version=1.1.2.5005
// @resource     theme_octopress http://sr.ksria.cn/puread/theme_octopress.css?version=1.1.2.5005
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_info
// @run-at       document-end
// @noframes
// ==/UserScript==

const pr         = new PureRead(),
      style      = puplugin.Plugin( "style" ),
    global_sites = GM_getResourceText( "global_sites" ),
    notify_style = GM_getResourceText( "notify_style" ),
    main_style   = GM_getResourceText( "main_style" ),
    mntips_style = GM_getResourceText( "mntips_style" ),
    option_style = GM_getResourceText( "option_style" ),
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
        cleanup   : true,
        pure      : true,
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
        fontsize  : "62.5%",
        layout    : "20%",
    },
    option       = {
        version   : "2017-04-03",
        esc       : true,
        trigger   : "read", // include: 'focus' 'read', only by userscript
        origins   : [],
        trigger_hiden: true,
        blacklist : [
            "google.com","https://www.baidu.com/?vit=1"
        ],
    },
    opt_value    = `
                # 是否启用 ESC 退出方式？
                # 默认为 true，取值范围 true | false
                set_esc: true

                # 右下角触发器点击后进入的模式
                # 默认为 read，取值范围 focus | read
                set_trigger: read

                # 当在非适配的页面是否隐藏触发器
                # 默认为 true （隐藏），取值范围 true | false
                # 当选择了 true 且在非适配页面时，可以通过快捷键使用临时阅读模式
                set_trigger_hiden: true

                # 黑名单，加入其中后，不再启动简悦
                # 有别于白名单和排除列表，前两种当前页面还是加载简悦，但黑名单则彻底加载轻阅的代码
                # 支持 域名 和 URL，
                # 例如： 
                # https://www.baidu.com/?vit=1 则在此页面禁用
                # google.com 则凡是含有 google.com 的域名都禁用，包括： mail.google.com doc.google.com 等
                # mail.google.com 仅在 mail.google.com 下无法使用，但 doc.google.com 则没问题
                # 每个名单由小写 , 分隔
                set_blacklist: 
    `,
    focus_value  = `
                # 是否启用点击空白（遮罩）退出功能？
                # 默认为 true，取值范围 true | false
                set_mask: true

                # 遮罩的背景色，仅支持 rgba 格式
                # 默认为 rgba( 235, 235, 235, 1 )
                set_bgcolor: rgba( 235, 235, 235, 0.9 )

                # 遮罩的透明度
                # 默认为 90，取值范围 0 ~ 100
                set_opacity: 90

                # 启动聚焦模式的快捷键
                # 默认为 A S
                # 必须有两个值，仅支持 shift, 字母和数字，中间必须有空格
                set_shortcuts: A S

                # 当未适配聚焦模式时，是否启用手动聚焦模式？
                # 默认为启用，取值范围 true | false
                set_highlight: true
    `,
    read_value   = `
                # 主题样式
                # 取值范围 白练 → github, 白磁 → newsprint, 卯之花色 → gothic, 丁子色 → engwrite
                # 取值范围 娟鼠 → octopress, 月白 → pixyii, 百合 → monospace, 紺鼠 → night, 黒鸢 → dark
                # 请使用关键字，而非名称，如：pixyii
                set_theme: github

                # 字体样式，支持 css font-family 值
                # 默认为 default，即浏览器默认值
                set_fontfamily: default

                # 字体大小，支持 css font-size 值
                # 默认为 62.5%
                set_fontsize: 62.5%

                # 布局宽度，支持 css margin 值，例如： 20px, 80% 等
                # 默认为 20% 宽度
                set_layout: 20%

                # 是否一直显示右下角的控制栏？
                # 默认为不显示，取值范围 true | false
                set_controlbar: false

                # 当未适配阅读模式时，是否启用临时阅读模式？
                # 默认为启用，取值范围 true | false
                set_highlight: true

                # 启动阅读模式的快捷键
                # 默认为 A A
                # 必须有两个值，仅支持 shift, 字母和数字，中间必须有空格
                set_shortcuts: A A

                # 如果当前页面适配阅读模式，是否自动进入阅读模式？
                # 默认为 false，取值范围 true | false
                set_auto: false

                # 黑名单，加入其中后，不会自动进入阅读模式
                # 此功能在 auto = true 时才会生效
                # 支持 minimatch，域名 和 name，例如： "v2ex.com", "http://www.ifanr.com/**/*"
                # 每个名单由小写 , 分隔
                set_exclusion: 

                # 白名单，加入其中后，自动进入阅读模式
                # 此功能在 auto = true 时才会生效，并与黑名单互斥
                # 支持 minimatch，域名 和 name，例如： "v2ex.com", "http://www.ifanr.com/**/*"
                # 默认为空，每个名单由小写 , 分隔
                set_whitelist: 

                # 是否启用增强解析模式？
                # 增强解析模式会对版面重新设计，包括：去除多余空格、优化版面结构等，此功能为测试版，遇到解析失败时，请关闭此功能。
                # 默认为 true，取值范围 true | false
                set_cleanup: true

                # 是否启用纯粹模式？
                # 比【增强解析模式】还要彻底优化版本，包括：字形、颜色、字号、代码段等，专治页面及不规范，如：微信订阅号，CSDN 等。
                # 此功能在 cleanup = true 时才会生效
                # 默认为 true，取值范围 true | false
                set_pure: true
    `;
    let current_state = "", // include: focus, read, option
        simpread = { version: "1.1.2", focus, read, option },
        org_simp = { ...simpread };

/****************************
 * Entry
 ****************************/

// initialize
version();

// blacklist
if ( !blacklist() ) {
    // add simpread style
    GM_addStyle( notify_style );
    GM_addStyle( main_style   );
    GM_addStyle( mntips_style );
    GM_addStyle( option_style );
    GM_addStyle( user_style   );
    GM_addStyle( theme_common );

    // add websites and current can'b read mode
    if (GM_getValue( "simpread_db" )) {
        pr.sites = GM_getValue( "simpread_db" );
    } else {
        pr.Addsites( JSON.parse( global_sites ));
        GM_setValue( "simpread_db", pr.sites );
    }
    pr.cleanup = simpread.read.cleanup;
    pr.pure    = simpread.read.pure;
    pr.AddPlugin( puplugin.Plugin() );
    pr.Getsites();

    // global
    bindShortcuts();
    controlbar();
    autoOpen();

    console.log( "[SimpRead Lite] current pureread is ", pr, simpread );
}

/****************************
 * Method
 ****************************/

/**
 * Version
 */
function version() {
    // get and set simpread
    if (GM_getValue( "simpread" )) {
        simpread = GM_getValue( "simpread" );
    } else {
        GM_setValue( "simpread", simpread );
        GM_setValue( "simpread_subver", GM_info.script.version );
        new Notify().Render( "简悦 · 轻阅版 版本提示", `安装到最新版 ${GM_info.script.version}，请看 <a href='https://github.com/Kenshin/simpread-little' target='_blank' >详细说明</a> 。` );
    }
    // compare
    if ( GM_getValue( "simpread_subver" ) != GM_info.script.version ) {
        GM_setValue( "simpread_subver", GM_info.script.version );
        if ( simpread.version != org_simp.version ) {
            if ( simpread.version == undefined ) {
                simpread = { ...org_simp };
            } else {
                Object.keys( org_simp ).forEach( key => {
                    key != "version" && Object.keys( org_simp[key] ).forEach( value => {
                        if ( !simpread[key][value] ) {
                            simpread[key][value] = org_simp[key][value];
                        }
                    });
                });
                simpread.version = org_simp.version;
            }
            GM_setValue( "simpread", simpread );
        }
        new Notify().Render( "简悦 · 轻阅版 版本提示", `升级到正式版 ${GM_info.script.version}，请看 <a href='http://ksria.com/simpread/changelog.html#us_${GM_info.script.version}' target='_blank' >更新说明</a> 。` );
    }
}

/**
 * Black list
 */
function blacklist() {
    let is_blacklist = false;
    for ( const item of simpread.option.blacklist ) {
        if ( !item.startsWith( "http" ) ) {
            if ( location.hostname.includes( item ) ) {
                is_blacklist = true;
                break;
            }
        } else {
            if ( location.href == item ) {
                is_blacklist = true;
                break;
            }
        }
    }
    console.log( "current site is blacklist", is_blacklist )
    return is_blacklist;
}

/**
 * Keyboard event handler
 */
function bindShortcuts() {
    Mousetrap.bind( [ simpread.focus.shortcuts.toLowerCase() ], () => entryMode( "focus" ));
    Mousetrap.bind( [ simpread.read.shortcuts.toLowerCase()  ], () => entryMode( "read"  ));
    Mousetrap.bind( "esc", ( event, combo ) => {
        if ( combo == "esc" && simpread.option.esc ) {
            if ( $( ".simpread-read-root"  ).length > 0 ) $( ".simpread-read-root sr-rd-crlbar fab" )[0].click();
            if ( $( ".simpread-focus-root" ).length > 0 ) $( "sr-rd-crlbar fab.crlbar-close" )[0].click();
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
    $( "body" ).append( '<sr-rd-crlbar class="controlbar"><fab class="about"></fab><fab class="setting"></fab><fab style="font-size:12px!important;">简 悦</fab></sr-rd-crlbar>' );
    $( "sr-rd-crlbar" ).css( "opacity", 1 );
    if ( pr.state == "none" ) $( "sr-rd-crlbar fab:not(.setting,.about)" ).addClass( "not-adapter" );
    setTimeout( () => {
        $( "sr-rd-crlbar" ).removeAttr( "style" );
        if ( pr.state == "none" && simpread.option.trigger_hiden == true ) $( "sr-rd-crlbar" ).css({ display: "none" });
    }, 1000 * 2 );
    $( "sr-rd-crlbar fab:not(.setting,.about)" ).click( event => {
        if ( $(event.target).hasClass( "crlbar-close" ) ) {
            $( ".simpread-focus-root" ).trigger( "click", "okay" );
            $( event.target ).removeClass( "crlbar-close" ).text( "简 悦" );
        } else entryMode( simpread.option.trigger );
        event.preventDefault();
        return false;
    });
    $( "sr-rd-crlbar fab:not(.setting,.about)" ).mouseover( () => {
        if ( $( ".simpread-focus-root" ).length == 0 ) {
            $( "sr-rd-crlbar fab.setting" ).addClass( "show" );
            $( "sr-rd-crlbar fab.about"   ).addClass( "show" );
        }
        $( "sr-rd-crlbar" ).one( "mouseleave" , () => {
            $( "sr-rd-crlbar fab.setting" ).removeClass( "show" );
            $( "sr-rd-crlbar fab.about"   ).removeClass( "show" );
        });
    });
    $( "sr-rd-crlbar fab.setting" ).click( () => {
        optionMode();
    });
    $( "sr-rd-crlbar fab.about" ).click( () => {
        aboutMode();
    });
};

/**
 * Enter Mode
 * 
 * @param {string} include: focus, read
 */
function entryMode( type ) {
    type = type == "focus" ? "focus" : "read";
    if ( [ "none" ].includes( pr.state ) ) {
        if ( simpread[type].highlight == true ) tempMode( type );
        else new Notify().Render( `当前未启用 <a href='http://ksria.com/simpread/docs/#/%E4%B8%B4%E6%97%B6%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F' target='_blank' >临时阅读模式</a>，并当前站点也未适配，如需要适配请提交到 <a href="https://github.com/Kenshin/simpread/issues/new" target="_blank">此页面</a>` );
    } else type == "focus" ? focusMode() : readMode();
}

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

    if ( current_state == "focus" ) {
        new Notify().Render( "请误重复进入。" );
        return;
    } else if ( current_state != "" ) {
        new Notify().Render( "请先退出当前模式。" );
        return;
    } else current_state = "focus";

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
        .css({ "background-color" : style.BgColor( simpread.focus.bgcolor, simpread.focus.opacity ) })
        .animate({ opacity: 1 });

    // click mask remove it
    $( bgclsjq ).on( "click", ( event, data ) => {
            if ( !simpread.focus.mask && !data ) return;
            $( bgclsjq ).animate({ opacity: 0 }, {
                complete: ()=> {
                    current_state = "";
                    includeStyle( $focus, focusstyle, focuscls, "delete" );
                    excludeStyle( $focus, "add" );
                    $( bgclsjq   ).remove();
                    $( bgclsjq   ).off( "click" );
                    $( "sr-rd-crlbar fab:not(.setting,.about)" ).removeClass( "crlbar-close" ).text( "简 悦" );
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
    $( "sr-rd-crlbar fab:not(.setting,.about)" ).addClass( "crlbar-close" ).text( "" );
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
                                <sr-rd-footer-group>
                                    <sr-rd-footer-line></sr-rd-footer-line>
                                    <sr-rd-footer-text>全文完</sr-rd-footer-text>
                                    <sr-rd-footer-line></sr-rd-footer-line>
                                </sr-rd-footer-group>
                                <sr-rd-footer-copywrite>
                                    <div>本文由 <a href="http://ksria.com/simpread" target="_blank">简悦 SimpRead</a> 优化，用以提升阅读体验</div>
                                    <div class="second">使用了 <abbr>全新的简悦词法分析引擎<sup>beta</sup></abbr>，<a target="_blank" href="http://ksria.com/simpread/docs/#/词法分析引擎">点击查看</a>详细说明</div>
                                    <div class="third">
                                        <a class="sr-icon good sr-top" data-sr-mini-tooltip="觉得不错？请帮忙投票 😄" data-position="up" target="_blank" href="https://chrome.google.com/webstore/detail/%E7%AE%80%E6%82%A6-simpread/ijllcpnolfcooahcekpamkbidhejabll/reviews">
                                            <svg t="1556354786433" viewBox="0 0 1024 1024" version="1.1" width="33" height="33"><defs><style type="text/css"></style></defs><path d="M859.8 191.2c-80.8-84.2-212-84.2-292.8 0L512 248.2l-55-57.2c-81-84.2-212-84.2-292.8 0-91 94.6-91 248.2 0 342.8L512 896l347.8-362C950.8 439.4 950.8 285.8 859.8 191.2z" p-id="6225" fill="#8C8C8C"></path></svg>
                                        </a>
                                        <a class="sr-icon bad sr-top" data-sr-mini-tooltip="有待改进，请帮忙吐槽 😄" data-position="up" target="_blank" href=""https://wj.qq.com/s2/3611463/7260/">
                                            <svg t="1556354650943" viewBox="0 0 1024 1024" version="1.1" p-id="5899" width="33" height="33"><defs><style type="text/css"></style></defs><path d="M458 576c2-36 0-76 16-110 4-10 2-20 2-30-8-42-28-80-30-120 0-2.78 2.008-9.542 2.01-12.314-6.432 4.468-15.214 8.048-22.01 10.314-40 12-35.02 5.146-69.02 27.146l-23.866 14.456c32.686-35.878 77.056-49.562 113.05-77.428 0.388-30.876 1.716-61.354 6.274-91.68C371.22 106.992 243.57 108.536 164.246 191.14c-90.994 94.688-90.994 248.202 0 342.89l305.698 318.192c-0.17-21.312-0.886-42.352-3.944-62.222C454 718 458 648 458 576z" p-id="5900" fill="#8C8C8C"></path><path d="M644 602c-22-52-66-88-126-100-1.7 0-3.758-1.086-5.872-2.638-0.046 0.214-0.082 0.426-0.128 0.638-22 96-46 188-42 284 0 24.454 7.966 50.234 7.666 76.262L512 896l208-216.5C690.306 658.542 660.856 637.242 644 602z" p-id="5901" fill="#8C8C8C"></path><path d="M859.748 191.14c-80.852-84.188-211.978-84.188-292.816 0L528 230.806c0.15 26.35 0.426 52.404-6 77.194-4 20-38 38-32 62 6.006 26.426 16.332 51.41 21.464 77.118C542.028 464.168 569.542 485.792 594 512c45.602 53.532 75.494 114.918 130.566 162.742l135.182-140.71C950.75 439.342 950.75 285.828 859.748 191.14z" p-id="5902" fill="#8C8C8C"></path></svg>
                                        </a>
                                    </div>
                                </sr-rd-footer-copywrite>
                            </sr-rd-footer>
                            <sr-rd-crlbar class=${ simpread.read.controlbar == true ? "" : "controlbar" }>
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

    if ( pr.isMathJax() && pr.state == "temp" ) {
        console.warn( '=== MathJax Mode ===' )
        const dom = pr.MathJaxMode();
        console.log( 'current get dom is ', dom )
        if ( typeof dom == "undefined" ) {
            new Notify().Render( "智能感知失败，请移动鼠标框选。" );
            highlight().done( dom => {
                storage.pr.TempMode( "read", dom );
                Render( false );
            });
        } else if ( typeof dom == "string" ) {
            const html = pr.GetDom( dom, "html" );
            pr.Newsite( "read", html );
        } else {
            pr.TempMode( "read", dom[0] );
        }
    }
    pr.ReadMode();

    if ( special() ) return;

    if ( current_state == "read" ) {
        new Notify().Render( "请误重复进入。" );
        return;
    } else if ( current_state != "" ) {
        new Notify().Render( "请先退出当前模式。" );
        return;
    } else current_state = "read";

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

    pr.pure && codehighlight();

    // exit
    $( ".simpread-read-root sr-rd-crlbar fab" ).one( "click",  event => {
        $( ".simpread-read-root" ).animate( { opacity: 0 }, {
            delay: 100,
            complete: () => {
                current_state = "";
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
    new Notify().Render( "当前并未适配阅读模式，请移动鼠标手动生成 <a href='http://ksria.com/simpread/docs/#/%E4%B8%B4%E6%97%B6%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F' target='_blank' >临时阅读模式</a>。" );
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

/**
 * Code highlight
 */
function codehighlight() {
    $("head").append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/styles/default.min.css">')
    $("head").append( '<style>.hljs{background:transparent!important;}</style>' )
    $("sr-rd-content").find( 'pre' ).map( function(idx,item){
        hljs.highlightBlock(item);
    });
}

/**
 * Option Mode
 */
function optionMode() {
    const close      = event => {
            mduikit.Destory();
            $( ".simpread-option-root" )
            .animate({ opacity: 0 }, { complete: ()=>{
                current_state = "";
                $( ".simpread-option-root" ).remove();
            }});
          },
          save       = event => {
            setter( $("#txt-option").val(), "option" );
            setter( $("#txt-focus ").val(), "focus"  );
            setter( $("#txt-read ").val(), "read"  );
            GM_setValue( "simpread",  simpread );
            console.log( "current simpread is ", simpread )
            new Notify().Render( "保存成功，请刷新当前页面，以便新配置文件生效。" );
          },
          imports    = event => {
            const input  = document.createElement( "input" ),
                  $input = $(input),
                  onload = event => {
                    if ( event && event.target && event.target.result ) {
                        try {
                            const json = JSON.parse( event.target.result );
                            if ( json.version && json.version.replace( /\./g, "" ) <= simpread.version.replace( /\./g, "" ) ) {
                                new Notify().Render( 2, "上传的版本太低，已转换为最新版版本！" );
                            }
                            Object.keys( simpread.focus  ).forEach( key => { json.focus[key]  != undefined && (simpread.focus[key]  = json.focus[key]  )});
                            Object.keys( simpread.read   ).forEach( key => { json.read[key]   != undefined && (simpread.read[key]   = json.read[key]   )});
                            Object.keys( simpread.option ).forEach( key => { json.option[key] != undefined && (simpread.option[key] = json.option[key] )});
                            GM_setValue( "simpread",  simpread );
                            if ( json.websites ) {
                                pr.sites.custom = [ ...json.websites.custom ];
                                pr.sites.local  = [ ...json.websites.local ];
                                GM_setValue( "simpread_db", pr.sites );
                                new Notify().Render( `已导入本地适配源：${ pr.sites.local.length} 条；官方次适配源：${pr.sites.custom.length} 条。` );
                                console.log( "new simpread db", pr.sites )
                            }
                            new Notify().Render( "导入成功，请刷新当前页面，以便新配置文件生效。" );
                        } catch ( error ) { new Notify().Render( 2, "上传失败，配置文件解析失败，请重新确认。" ); }
                    }
                  };
            $input.attr({ type : "file", multiple : "false" })
                  .one( "change", event => {
                          const reader  = new FileReader();
                          reader.onload = onload;
                          reader.readAsText( event.target.files[0] );
              });
            $input.trigger( "click" );
          },
          exports    = event => {
            const data = "data:text/json;charset=utf-8," + encodeURIComponent( JSON.stringify( simpread ));
            const $a   = $( `<a style="display:none" href=${data} download="simpread-little-config.json"></a>` ).appendTo( "body" );
            $a[0].click();
            $a.remove();
          },
          remote     = event => {
            if ( location.protocol == "https:" ) {
                new Notify().Render( `请勿在 https 下面使用此功能，请前往 http 的页面，如： <a href='http://kenshin.wang/blog/' target='_blank' >点击这里</a>` );
                return;
            }
            $.getJSON( "http://sr.ksria.cn/website_list_v3.json" + "?_=" + Math.round(+new Date()), result => {
                const count = pr.Addsites( result );
                count == 0 ? new Notify().Render( "适配列表已同步至最新版本。" ) : new Notify().Render( 0, `适配列表已同步成功，本次新增 ${ count } 个站点。` );
            });
          },
          clean      = event => {
            new Notify().Render( "是否清除掉本地配置文件？", "同意 ", () => {
                simpread = { ...org_simp };
                GM_setValue( "simpread", simpread );
                pr.sites = { global:[], custom:[], local:[] };
                GM_deleteValue( "simpread_db" );
                new Notify().Render( "清除成功，请刷新本页!" );
            });
          },
          getter     = ( value, type ) => {
            try {
                const arr = value.split( "\n" ).map( str => {
                    str = str.trim();
                    if ( str.startsWith( "set_" ) ) {
                        str = str.replace( "set_", "" );
                        const key   = str.split( ":" )[0];
                        let   value = str.split( ":" )[1];
                        if ( simpread[type][key] != undefined ) {
                            value = simpread[type][key];
                            ![ "whitelist", "exclusion", "blacklist" ].includes( key )  && value === "" && ( value = org_simp[type][key] );
                            return `set_${key}: ${value}`;
                        }
                    } else return str;
                });
                return arr.join( "\n" );
            } catch ( error ) {
                new Notify().Render( 2, "设置出现了问题，请重新打开设置。" );
            }
          },
          setter     = ( value, type ) => {
            try {
                const arr = value.split( "\n" ).forEach( str => {
                    str = str.trim();
                    if ( str.startsWith( "set_" ) ) {
                        str = str.replace( "set_", "" );
                        const key   = str.split( ":" )[0];
                        if ( [ "exclusion", "whitelist", "blacklist" ].includes( key )) {
                            const value = str.replace( `${key}:`, "" ).trim();
                            simpread[type][key] = value.split(",");
                        }
                        else if ( simpread[type][key] != undefined ) {
                            let   value = str.split( ":" )[1].trim();
                            if ( typeof simpread[type][key] == "boolean" ) {
                                simpread[type][key] = value == "true" ? true : false;
                            } else simpread[type][key] = value.trim();
                        }
                    }
                });
            } catch ( error ) {
                new Notify().Render( 2, "设置出现了问题，请重新打开设置。" );
            }
          },
          btn_cancel = mduikit.Button( "opt-cancel", "关 闭", { color: "rgb(33, 150, 243)", type: "flat", onclick: close, mode: "secondary" }),
          btn_save   = mduikit.Button( "opt-save",   "保 存", { color: "rgb(33, 150, 243)", type: "flat", onclick: save }),
          btn_import = mduikit.Button( "opt-import", "从本地导入配置文件", { color: "#fff", bgColor: "#FF5252", type: "flat", width: "100%", onclick: imports }),
          btn_export = mduikit.Button( "opt-export", "导出配置文件到本地", { color: "#fff", bgColor: "#2196F3", type: "flat", width: "100%", onclick: exports }),
          btn_remote = mduikit.Button( "opt-remote", "手动同步适配列表", { color: "#fff", bgColor: "#2196F3", type: "flat", width: "100%", onclick: remote }),
          btn_clean  = mduikit.Button( "opt-clean",  "清除数据", { color: "#fff", bgColor: "#757575", type: "flat", width: "100%", onclick: clean }),
          txt_option = mduikit.Textarea( "txt-option", getter(opt_value, "option"), { color: "rgba(51, 51, 51, 0.6)", state_color: "rgb(33, 150, 243)", size: "11px", height: "130px" }),
          txt_focus  = mduikit.Textarea( "txt-focus",  getter(focus_value, "focus"), { color: "rgba(51, 51, 51, 0.6)", state_color: "rgb(33, 150, 243)", size: "11px" }),
          txt_read   = mduikit.Textarea( "txt-read",   getter(read_value, "read"), { color: "rgba(51, 51, 51, 0.6)", state_color: "rgb(33, 150, 243)", size: "11px" }),
          optmpl = `<div class="simpread-option-root">
                        <dialog-gp>
                            <dialog-head>选项页</dialog-head>
                            <dialog-content>
                                <sr-opt-gp>
                                    <sr-opt-label>导入和导出</sr-opt-label>
                                    <sr-opt-item>${ btn_import + btn_export }</sr-opt-item>
                                </sr-opt-gp>
                                <sr-opt-gp>
                                    <sr-opt-label>同步与清除</sr-opt-label>
                                    <sr-opt-item>${ btn_remote + btn_clean }</sr-opt-item>
                                </sr-opt-gp>
                                <sr-opt-gp>
                                    <sr-opt-label>全局</sr-opt-label>
                                    <sr-opt-item>${ txt_option }</sr-opt-item>
                                </sr-opt-gp>
                                <sr-opt-gp>
                                    <sr-opt-label>聚焦模式</sr-opt-label>
                                    <sr-opt-item>${ txt_focus }</sr-opt-item>
                                </sr-opt-gp>
                                <sr-opt-gp>
                                    <sr-opt-label>阅读模式</sr-opt-label>
                                    <sr-opt-item>${ txt_read }</sr-opt-item>
                                </sr-opt-gp>
                            </dialog-content>
                            <dialog-footer>
                                ${btn_cancel + btn_save}
                            </dialog-footer>
                        </dialog-gp>
                    </div>`;
    if ( current_state == "option" ) {
        new Notify().Render( "请误重复进入。" );
        return;
    } else if ( current_state != "" ) {
        new Notify().Render( "请先退出当前模式。" );
        return;
    } else current_state = "option";
    $( "html" ).append( optmpl );
    $( ".simpread-option-root" ).animate({ opacity: 1 });
    const [ h1, h2 ] = [ $("dialog-gp").height(), $(".simpread-option-root").height() ];
    if ( h2 <= h1 ) {
        $("dialog-gp").height( h2 - 80 );
    }
}

/**
 * About Mode
 */
function aboutMode() {
    const close      = ( event, cb ) => {
            mduikit.Destory();
            $( ".simpread-option-root" )
            .animate({ opacity: 0 }, { complete: ()=>{
                current_state = "";
                $( ".simpread-option-root" ).remove();
                cb && cb();
            }});
          },
          option     = event => {
            close( event, () => optionMode() );
          },
          btn_cancel = mduikit.Button( "opt-cancel", "关 闭", { color: "rgb(33, 150, 243)", type: "flat", onclick: close }),
          btn_open   = mduikit.Button( "opt-open",   "设 定", { color: "rgb(33, 150, 243)", type: "flat", onclick: option, mode: "secondary" }),
          optmpl = `<div class="simpread-option-root">
                        <dialog-gp>
                            <dialog-head>关于</dialog-head>
                            <dialog-content>
                                <p align="center"><img src="http://sr.ksria.cn/logo@128.png"></p>
                                <div style="display:flex;flex-direction:row;justify-content:center;">
                                    <a href="https://github.com/Kenshin/simpread/releases" target="_blank" data-reactid=".2.1.5.0.0.2.0">
                                        <svg style="margin: 5px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="90" height="20"><linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="a"><rect width="90" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#a)"><path fill="#555" d="M0 0h51v20H0z"/><path fill="#007ec6" d="M51 0h39v20H51z"/><path fill="url(#b)" d="M0 0h90v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110"> <text x="265" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="410">version</text><text x="265" y="140" transform="scale(.1)" textLength="410">version</text><text x="695" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="290">1.1.2</text><text x="695" y="140" transform="scale(.1)" textLength="290">1.1.2</text></g> </svg>
                                    </a>
                                    <a href="http://ksria.com/simpread#lite" target="_blank" data-reactid=".2.1.5.0.0.2.1"><img style="padding:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAAAUCAYAAAAQqNbAAAAABmJLR0QA/wD/AP+gvaeTAAAJSklEQVRo3u1beVBU6RGfuIAY43qtq9lNsjHZ2tqqZFP51xSa0opR8QZUvK94LZoNqdSKF7JABAUHFOVcUZSKgIDOoKMgl+MAIma4WRQXhAG5L0GiRveX1z2Zx+MJCLtLpTI1XfWr93X3193f16+nv+8VhWLFihU2GzduVAowCIA5IOLOZAvMC4bwnElKjziFjYKKdcOGDTAnCJuzwAwRmjXhuGL9+vUNAmBOCMueaIE5ImdCg2LdunUwNwi/RAvMFIq1a9fC3BCiG2+BmUKxZs0amBuCb79tgZlCsXr1aowEiIZr8+LFC/5oovGlS5e4+L5N7NPacUPCy1fPEKqbMuT5/2t8883LAXVE39X//0M+FM7OzhgJEA3XZseOHeL41atXfLx/m9inbv1oSPCNskNQxrghzx8ugrUTvld/r4SCHUhH9F3XOdL5+D6gWLVqFeSIiIhAcnIyjw8cOMDJ2L9/P/MpKSkIDw/n8aFDh1BWVobKyko8fPgQnp6eog+i+Ph41tXW1sLf35/l9BWfnZ2N6upqVFVVIS8vT7ShDksfTVeuXGF78l1aWso2g8WSIyhzrIgQ7TuoaEpAS3cxmroKUNmcJOqoowRrJ/OYKLvSned19FQiIX8u8g0nBb6UEX33t6Idkb4mEOUN/8DjjhxcK3Huo8urPoaHTVeQ+cCVZfH6Oajr0Anx89H45B4uF9iL8+83xgoyPcf9ulmNcN37ok5TshptT++z3Z0qby5Y6d6kIKLn6VvjUVp/TkAUwm5PHXDv/a1Tmo/B1iVHQv4fUd+Zy3Obu4qQWDCP5eoiB4EvFOQlMLRn4nzuJ33iDzXfUihWrlwJObZt2waDwcDj6OhoFBcX48KFC8xT8ZF+y5YtePToEZycnDB79mwulKamJu6KNI8oLCyMdXS0d3R0sJ2vry+ysrJYTli6dKkYlwqW5s6fP5877Ny5czFnzhxs3rx50FhynMz4oQh1oRNKqtT4c6AtPjthi4Nnpoq6f798hlOZk3hMdDlnF887c3UNXrzsRmTKYuwJGI3L2r0oqY0W7YhitRvxebgtDkS8h84eAyKyPhB1cYLub6G28Lg4hl90U2cJ3CM/4PiHIz8U5tcIhTWR53uc/wnLKa7mziHcrfJj+ZdZ0/H0WQs8znzM+mT9QS5Y6d6kIArRvotHLcm4qffG3i9toS4YeO/ydcrzMdC65IjQ/QxPnzcjIG4mz/3LibEI0Ewzrv95C7yjPmF5XIYL6jvy+sQfar6lUAh/6YIcy5cvR0NDA3bu3In8/Hy4urpCr9czT3LSU+G1t7dzBySUlJRwke/evZt9EEn9UVclm61bt7IP6uBKpZIL1DSPCpbuoDSmgqXjncZviiXHifQxIoKuf4S2J9Uoqg0XOtZaBKW9I+roBQVlTOQxkfelCUbdtY/Q3dOCvyfaMh+RPBtVDdmiHZFvotGPMmUMCh8m4YreSdT5JEwS56ryndDV0wxDmxa17VoYWrVobKvAuexfsz61bA/q2nVCB85CfVshyg0alqsLnFFUcRV+141+jsT+mAtWujcpiBo79YjP3I0DUbZv3Lt8nfJ8DLQuOVQFK1FWlQoflTFmYJoxJ6r8VSitTIGfxjjvixihg798jpBb7w4731IoqGv1B41Gg9DQUD6ClyxZwsc38SQnvbe3NwoLC8VOSZg1axaWLVvGeiI63k3+cnJy+Bin4p03bx7c3d2RlJSE+vp67pQ0hwqWipTGVLDUSYcSS47ANFsRfhpbuAZOQlSKI+5WhKC952vuIqTjF5Q+gcdEAalGm9D0X6L9SZ3oI+rWTDyqzxV5ouCMaSL/VfUNxOgcRJ3yZm/82KwVqDDcxmcnbUS4+Nvg2DVbXLz7O7Q8eYB9oVOFbmaDMJUDHhjS2S4ua5XwQ0gU/QSlTeGCle5NCqK0e0rcr70mFN34N+5dvk5pPgZblxyxWU4or0l9TR6XvVLIS4pENlbw/xyn0qcMO99SKBwdHdEffHx80NjYCJVKxbxarWb+yJEjzFMn7OzshJeXl2izb98+cUwUGRnJYxcXF+6QVJh0LaCuunDhQixYsACtra3Yvn07z6OCpSKlMfnetGnTkGLJEZA6WkTE7ek4mToZnnE22B85Dp3d9QjXfsg6ekEn08bz2JhAo01o+i/Q3lUn8uf+m0ATT5RZ7sbjs9m/Qve/muGvfv81PwR/1XuCvgWJ+YtEWUzeLH5ezF6IBzW34H/DKC+ujsH9mjQeH1f/FG1dNQjOnMq8pmgTF6zJR4LeHuG3f95nTXvP2CAl7wiqW9O4Uw62d/k6pfkYbF3y2LS/rp5GocjtmD8hFGZw5jQohfXTvqNyfsPy1DIXVNbl4njy6GHnWwqFg4MD+gN1RyLqisTTk4iKjnjqbvRVT0c0Hc+PHz+GTqcT7Yno3kudme69bm5ubHP48GG+jxJqamr4A47usWRDBUt3UBqTnOzInmSDxZJDedNGRFyuPZqeFAmX/2K0dJVCpXXH0atGHb2gE6lv89jYcYzykLTpwi++VuRNCTTx3M0KPPkDo7XrPoITHIWj2+Y1PwSS+563Q01LFlq7v0L70wqU1cazzithDO6Vx6BKuHeW18cgo0DJhUG6Yxqhs10WvhnadCh9fAEZxZ5csCa/TZ2luHzPqc+a6OkWaY2k7IPC9UMH1T+dB9y7fJ3SfAy2Lnls2p9f9O9R13ZX+Fgq41gxuX/g9QfFLRGuKYW878qGDHie/fi19Q4l31Io6IjuD3QNmDFjBndB4ulJPMlNcxYtWsRHs52dHYOOapOO5tJH08yZM1ln8mNvb88yE2iO1IaKmsYkJzuaQ7LBYslxPMVaxBeXrPGpv5URflbYd9ZK1P3Jywr+ycbxFs+3RPnRq9bY4ds7zzvRGruVvTyRW6TR5y7Bp0dMbzypnz72Aca5u45ZwfW00RfFdg22Eq4JVvz8PMIKewJ74xyOMdr9VdBRvK1evbpPB4lLeyQ7sh9o7/2t05SPN61LHtsrwRouSmMMiuUZb5R7xFqLOSJ7H3X/631TvqVQUDGYG/yTrUYURCMdw4L+oaDj2Nzgd+OtEcVmj1EjHsOC/kEF20jHvDnh2PVRFpgjkkc1UMEqFy9eDHPCUc0PLDBHXB91nP5wYCO8ZCraFvqwMQf4XlNYYE7QKFqEJ/+LzH8AJAsHnUo27mMAAAAASUVORK5CYII=" data-reactid=".2.1.5.0.0.2.1.0"></a><a href="https://github.com/Kenshin/simpread" target="_blank" data-reactid=".2.1.5.0.0.2.2"><img style="padding:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAUCAMAAAAQlCuDAAACplBMVEVVVVXVVSvmcjP0gEFNTU1PT09fX1/kbzD2gUJfX1/3g0VdXV3nczT1gkJPT09NTU3kcDE5OTk7Ozs8PDw9PT0+Pj5BQUFCQkJDQ0NERERFRUVISEhJSUlMTExNTU1OTk5PT09QUFBRUVFSUlJTU1NUVFRVVVVWVlZXV1dYWFhZWVlaWlpbW1tcXFxdXV1eXl5fX19gYGBiYmJlZWVnZ2dra2t4eHh8fHx/f3+CgoKGhoaIiIiJiYmKioqLi4uMjIyQkJCTk5OZmZmampqenp6fn5+jUiajo6OkpKSmpqanp6eqqqqrq6usrKyuVyivWCivWCmwsLCxYDSzXCy0XC21Wyq1XCy3XCq4Xi65YTG6Zzq7Xiu9YS/BajvCwsLDYi3Dw8PEZjTEb0DExMTFxcXGxsbHZC7Hx8fIZjLKjGzPz8/QazTSqJDTqJHVbDPVk2/V1dXWazLWcjzW1tbZczzb29vcnXrcrJLc3NzdgE7d3d3e3t7f39/g4ODht6DicjXkcDHkdDfk5OTlcTLlczXlxrXl5eXmcjPmdTfml2znczTodDXoe0DpdTbpdzjpfULp6enqdjfq6urrdzjreTrrejzrhk/rmWzrzr/r1srseDnsez3sgkjs1MfteTrtfUHthU3twant1cjt7e3uejvvezzvfkDv0sLv7+/wfD3wfkDwgEPwhEnwlGHwzLjw8PDxfT7xfkDxoXXxrorx8fHyfj/y8vLzf0Dzpnz0gEH1gUL1so71v6L149n2gkP3g0T3wKL3waP37Ob37+v39/f4vZ34yK74z7n46eD4+Pj50Lr52Mf58/D60r361MD61sL61sP65tv6+vr73s/739D739H75tr759z76N376uD85dj85tr859z87OT9/f3+/fz+/f3///9Ftc+TAAAAEXRSTlMGBo2Njo6Ojo7j4+jo6Ons7CIlfBEAAAABYktHROFfCM+mAAACOUlEQVQYGZXBT0iTYQDH8e/7vs82l6ibYgYWMrE0QaE/VEKXBJMIBKVDHSLoUhSdO3axbqVEERFENwnqVpMIIoIoioIuSRCUFSFWrkzd9u7Z++udUgnhXJ+PQ9Rrp1IjrGx/kDfRzYhKiZXdoc9EROUs5awxraJyopxbRvyHgLKM+A8BZblabswohZTWcmn9UfgrYQv/MGKZoz4XBwIQy4nf8vzRPOnxlyNCrhY1HR5M3ZWumw6vvz9Cy4FjjYqfl9ybEm1Dh9ZqkQ25bdu2ttt1Tnenm9qybZNn7a6mjUlbYkSo5viZTBeC4FlxrFhH/uqGI5eDQAjB/LXG4eE5QgJiz+878f6x02e1e3xWbX1TkP5c10PIiFA8bRMfEaiauiJMJmZ2XhFCCD4lsumqn4R84Mm+7tkJfwe9HoMpZ2raB9uLT8iIUDHiqgqBhASuTAGL8BDEcp4biJAFqkY3bB14VMCPNDSesw09FtZbFhkRmut79X0dAul1/CcgUC5T+6MBQdP75J7HIpQHWqo/PGzNFr/Fsm+/dlc3Z/IQybPIiNDs6ND8y9cCaWTQv40Acan3yzQC72D0wrxLKACyfVHncn39jVPF63avHW8JIGCJ00qJZp2OjgdkEk4u79R8T0Im4fh5x8slycR9xaOUnAQ+vUNN7byZcrdPWGMWdnGvnyVOipLOLi/zMMtqTlCWESUvnsqNe6xGlGVmkoRiMUCspkg5Z002QeUs5SyYwufqWipVZGWjWf0CDsxBCuuBMAQAAAAASUVORK5CYII=" data-reactid=".2.1.5.0.0.2.2.0"></a></div>
                                <div style="display:flex;flex-direction:row;justify-content:center;" data-reactid=".2.1.5.0.0.3"><a href="http://ksria.com/simpread/changelog.html#us_${GM_info.script.version}" target="_blank" data-reactid=".2.1.5.0.0.3.0"><img style="padding:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAUCAYAAABGUvnzAAAABmJLR0QA/wD/AP+gvaeTAAAHa0lEQVRo3uVaaVBU2RV+wYaBmCjjZOJU1kqmUpU/k7/GuFdpLHdFBXcrrj/G/LDUcSGoQUPQCIWZlDNYwdHBYQAdkc1MsyPQsjWLCrgAAg0KCAOoLCL45X6HvGfTpbGtwrFq+lR91eee7fZ7X59zr5Ta8uXLPdavXx+qYFOAK+CdtPLvOmzj0stCtdhYD43krlu3Dq6EcallLgHvlJIQbe3atc0KcCW8nVLqEvBOLWvW1qxZA1eDt7nEZaCtXr0aroaxX1tdBtqqVavgahjzn2KXgbZy5Uo4i/7+frmkvErOm8Tg4OBz7T+8VOQUKM7GjgT6Bp/iXdV1I1lTW7FiBZzF1q1b8SrxrwqOz5GsR4KfZ/9BcqFToDgbOxLoGxjAjy6NbE3Nz88P9uAt02KxoL6+Hnfu3EFRUZHhYwfzkkKdEhUVJXHNzc04cOAAkpKS0NDQINi+fbuRR0lMTMTly5dx48YNHDt2bJgvLi4O+fn5iIiIEFtAQAAqKytRW1uL6upqBAYGGvG5ubmoqamRfQsLC7FhwwbDFxISgqamJsmLjY0Vgh2fjxidVDAMf7RUoqDjIa51deOqwuwrlWKn+Fc2iK22uw9+RbeMnJimNpR0PpKchHvf4Kdmq+GjBFQ1SIxVxdjnrbXexs2HvWI/eMOGgadPDV/fkwG8kzyk+xTeRLmqff1BN7LauvBBZrlTNRyh+fr6wh7BwcHIy8vDjBkzBIsWLTJ8JJhnGHVKWFiYxBw8eBC9vb3Yt28fpk+fjhMnTiAzM9PIoxw5cgSzZs3C4sWLcf/+fWzevHmYb+bMmZg3b54QVldXh2XLlkltEtLa2irdzXjdTvAHceHCBbFv2bIFXV1dMoLpO3XqlBDs+HzE9xPzDfxCEXO/7zGmfB4Hz79/gtHBn+K98+nio2zLKRH77/8djYZHPUbez8JjxE4E5BbjHzdtho+y3GyBZ9gZ/PaTL4y8X6dY0dLbh/c/PgNPtc9HljIMqLGs55HgcUn5+JWKa1Pf6YPwKKn/oTkHRe1dTtVwhKb+kgV7bNy4UTrSbDYjNDRUCNV9JJgvkDplyZIlopOUzs5OLFy4UNY7duzA9evXjTwKiaG+dOlS6UL+kHQfbXos7R0dHaioqBCwjs1mw7Zt28QfHh4u3V1VVSWdXFBQIPajR49KXR8fH1mTSBLs+HyEV8IVA75XKpBWUw/PqJQhW7wFXnE5olO8P0sQ3TM6FT1PnmCMIoDrP5feRm77A+QplLd14FJdk1GTMiby0tD6XCa6+4fyVqi94quq4XU+S3zjT8cLOXoeCX478Qr8VFxKdR28YjPEPjriIh4PDOLHany/rIYjNL54e5C02bNnY//+/TJW7927J91DHwnmGUZdJ4b6pk2bpMv0Grt27RIS9DWFlzN9TVI4dh3rEIcPH0Z5ebnRpcTUqVOl83fv3o3Gxkb5IdHOiWG1WiUvKCgI2dnZRh1+ZxLs+HyEpyJRx7L0IqTdaRxm00HxvJhrrB897od3ggV/yL6KW50PMT7sM3ioLvKJTUZGfdNL8/wyixB/u86wj0+0CDn6mgQzzjejCCm1NsM+WuGxOp/fdaKGIzS+XHtwdLJrOS7nzJmD9vZ2GX/0kWCOTOo6MQS7ngTr6507dwrB+ppy+vRp0dmJ7HYS4FiH4ITgqD106JBh27t3r3zynC8tLZUfIddZWVlCMHXeDVpaWuSHxDWPDxLs+HzEWxfzDPzky6/R0t2DyYo0rvky31PnIHWKfSyJGpuQh3kZxciua8RbX2WLPbqmEelc/y/uRXm/jElBq9rrfXOx2D+6WiPk6HEkmHE/jzajracXv0srEfuHpdUosN1V+11+aQ1HaBxp9uBL5BlI8LJ08uRJOYfpI8EcfdQpeg5HNAnW1zrB+poSGRkpNdmBe/bskY50rEPQzts6xzNH8927d43Ru2DBAqSlpaGkpAQ5OTlykSLBep6/v7/sy/P/7NmzQrDj8xEecbnPoEbotIgYFLZ1olJdaK51PcLM7DLxUexjSdSY+Fx4fZ6M6IrbMDd/g2hbK0KLrwnBetyL8jzUyF19Lhm31D5l6oL0N2sl2hWRehwJHorLxMKzcSjveICqBz3IbGqVs1ziXlLDERq7wR5z587FlClTDPBipPsmTpwoL1LXdTtH5qRJk4z1/PnzZazqawrrsN7kyZNlMtjXdPwOej5jCY5j3UedFzl+8mI2bdo0w8e6zKOP+z2vNuF+IWc4FGGmw/+CKfCfMB36GO5nksQ+am/wsDjTX47CXXWtu+ok07EImILDhz6PR8KkLkN63AvzlD5WnZmmvx6Xff6UakHyzZpncf7P4txPxUuMKfD4UO2oVCPu/9VwhEbCXjco38Y+zsJEgt4QgirrYVX/JGP3pTe24Deffvlaa2gcv68bEyZMwLexj7MYdT77zUF1u5uaFG6qM92CTmDUF+bXWoMEt3DEuhLczmW5Br7KbibBoby8uBK+py4xrgC381kh/EOHh3poktzGy40rQIvJ+G4jNrNNO5ch/2XnvyqleyAtV3GuAAAAAElFTkSuQmCC" data-reactid=".2.1.5.0.0.3.0.0"></a><a href="https://github.com/kenshin/simpread/issues" target="_blank" data-reactid=".2.1.5.0.0.3.1"><img style="padding:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAUCAYAAABGUvnzAAAABmJLR0QA/wD/AP+gvaeTAAAHnElEQVRo3uVa/VOTVxbOT/4z+2NnpBCI4IJAgABJSAIIdBGk7rq7QxX5Wj4KygKVrNPdwoAlQEFAWolTba0rGr7EACK1ho8qSZAABhQTtq3OOsM+m3Oc950kOBY6tp1p7swz7zn3ufec997znnNvGCQpKSl7srKy9B44PEAgQHsx/TcN3cV0h+Zimv53lSl7JBTczMxMBBI0xrSAQEp/aoMkIyPD6QECCZ6FBwQ0xlSn5ODBgwg0qC/oAgaS9PR0BBpUn2kDBpK0tDQEGpSfagIGktTUVOwUL1684EvKbub8mtja2nplf3Jfig/+Yf4QS5sOLDy1It2YtY3/qdj635YoU3tTdndjT6LT6bBT5OXlYTfjdwsqn2/SHgX4Vf1J59U+sDyaQd7ZIwirDIeiW7mN/6kg/4JM7U3Z3Y09iVarhTfoljk2NoaHDx/CbrdjcnJS5CiD6ZJCMrXu7m4e53Q6UVFRgcuXL2NpaYmRn58vzqN26dIlDA8PY35+HqdPn/bhjEYjzGYzWltbua+srAyzs7Ow2WxYWFhAVVWVOH50dBRWq5X9TkxMIDs7W+QaGhqwsrLC8/r6+niD/ddHSOxVifj828t49t9nePD4Aa5ZB7ivcKAElvUZzuj7Gw9QZqoUx7+Oqx2th2Nzmbnue73sX+Co9Vr6mHN4qkXNSJ3IDS0Oc7/dtQjz8jjS+zNFruR6GeaffMuc3WVnXbBHT+V5Db/3Ndt1lr3XRpBoNBp4o7a2Fjdv3kRERAQjMTFR5CjAdIaRTO3MmTM8prKyEs+fP0dJSQnCw8PR2NgIk8kkzqNWV1eHqKgoJCUl4fHjx8jNzfXhIiMjERcXxwFbXFyEWq1m2xSQ9fV1zm4aL/QT6IPo7+/n/sOHD2Nzc5NLMHEGg4E32H99BEWPUkTEB5GYW57HO43ZCK/9PdIuZMK+YYeiIRnSchmS9WqsfbcO1Xnta7ksYzbczzehbtAy1zLyMfsX/FD7yNTEXIpeB9czFzKMf2Au8YyS+3nejbPos3zG/Rn973hsunH47LvMUYVRdWhFe5pP03B7dQrtox387lR9vNdGkHj+kgVvHDp0iDPy6tWr0Ov1HFCBowDTBpLMZ0ByMssUFLfbDYVCwfqxY8dgsVjEedQoMCSrVCrOQvqQBI76hLHU73K5MDMzwyA7DocDR48eZb65uZmze25ujjN5fHyc++vr69muUqlknQJJG+y/PkJCd7IP5lfm8SfjX1muMp2C63sX7jktuLdmwTfOe1h64kDu50dey50y1WJkdhTyNgXbSWxSsX/BBzVF00uZxozO3UTVjVOs/8vcxFVhZn0WC+tW3LKaub/aVIPx+xOIORv/0s65ZMR1Jor2Hmws4PQXekQ0RG1bkwAJbbw3KGjR0dEoLy/nsvro0SPOHuIowHSGkSwEhuScnBzOMsFGQUEBB0HQqdHlTNApKFR2/e0QTp48ibt374pZSpDJZJz5hYWFWF5e5g+J+qliTE1N8byamhoMDQ2JduidaYP910eIP5fkAwrwH41/Ybniy/cxbfsa0gqZiLdLpIg1JLyWe/9KNQZnh0Sb6h4t+xd0zrgenaiP3b+Fsi8qkH/lOBwuB6Jr5QipCMOJriLctk2J7zJhndz2voK9c6M9uGUzI7kn5ZVjCBLaXG9Q6aSspXIZGxuLjY0NLn/EUYCpZJIsBIZAWU8BFvTjx49zgAWdWnt7O8uUiZTt/HvUzw6BKgSV2urqarGvuLiYn3TOT09P80dI+uDgIAeYZLobrK2t8YdEOh0ftMH+6yPEdSX6YI4C3P9nllWtGrh/2ETZ9UqRP/bViR/lNAYdnG4nNH1prH8w0sD+hXHUWiY/ZjnnYh6efv8UKoMWxV/+DXds05B3JDB3474Jk9bboj8a995XBawrzimh7UsX7e2r24/24Q5Mr34NZa9m27oIEipp3qBNpDOQQJellpYWPoeJowBT6SOZmjCHSjQFWNCFAAs6tc7OTrZJGVhUVMQZ6W+HQP10W6fyTKV5dXVVLL0JCQkYGBjAnTt3MDIywhcpCrAwr7S0lP3S+d/V1cUb7L8+grxT4QMK8JELR1mOaYtH9kc5fLNecjuw8p8VDFmHd8QVdhXDsjaDAesNtJs/Yf+CD2ptYx2wPbXB4Zlb0FHIcw40yfHvb67h9soUBu1D6LnVywEWbOY2vov5tXk8dC/xRevElSLRHj1lniA3DTSzX3WvbtvaJJQN3pDL5QgLCxNBFyOBCw4O5o0UZKGfSqZUKhX1+Ph4LquCTo3skL3Q0FCuDN42/d9BmE9jCVSOBY5kusjRky5m+/btEzmyS/OII3+vss3jPknwQVBpCKKaY0U9sikGb5dJsbc4GHuLghFSJdsRt//DKOak1TLI6vfjrff2itxb+Xu5L6gkhOfu/+eBl5wnc6UeG8EVofwM+3s4gstDff2VShFUHMJzIxujRXvCGLJLfumD8F+bhAL2c4N/s/0CfnaKmI74gIGEyu/PjaCgIPwSfnaK6Pa4gAEFeI1KbCDhQJs8IOAJsJMCrKfLSyAhyhAbEIhukzfQHzr2eBZNQX5Cl5tAQGRrzG8bhugnkYYY/ped/wO7SHqzJuEIewAAAABJRU5ErkJggg==" data-reactid=".2.1.5.0.0.3.1.0"></a><a href="https://github.com/kenshin/simpread/issues" target="_blank" data-reactid=".2.1.5.0.0.3.2"><img style="padding:5px;" src="data:image/png;base64,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" data-reactid=".2.1.5.0.0.3.2.0"></a></div>
                                <div class="about">
                                    你好，我是 <a target="_blank" href="https://github.com/Kenshin/simpread-little">简悦 · 轻阅版</a> 的开发者 <a target="_blank" href="http://kenshin.wang">Kenshin</a>，很高兴看到你能使用它。<br>
                                    它是一个阅读模式类的油猴脚本，也是 <a href="http://ksria.com/simpread">简悦</a> 的轻量级版本。</br>
                                    拥有 <a target="_blank" href="http://ksria.com/simpread/#feature">简悦的一切特性</a>，更具有「加载速度快 · 只关注阅读模式呈现」等 <a target="_blank" href="https://github.com/Kenshin/simpread-little/blob/master/README.md#特点">特点</a>。</br>
                                    简悦的初衷：还原一个干净的阅读空间，提升你的阅读体验。</br>
                                    截至到目前为止，简悦已经精准适配了 <spn style="color:#ff3f80;font-weight:600;">${ pr.sites.global.length }个</spn> 网址，详细请看 <a href="http://ksria.com/simpread/docs/#/%E9%80%82%E9%85%8D%E7%AB%99%E7%82%B9%E5%88%97%E8%A1%A8" target="_blank">这里</a>。<br>
                                    简悦是一个免费且开源的项目，占用了我绝大多数的业余时间。</br>
                                    如果觉得它还不错，希望可以给我 <a href="https://greasyfork.org/zh-CN/forum/post/discussion?script=39998&locale=zh-CN" target="_blank">投票</a> 或 <a href="https://github.com/kenshin/simpread#请杯咖啡" target="_blank">请我喝杯咖啡</a>，这是对简悦的最大鼓励。<br>
                                    现在就加入 <a href="https://t.me/simpread">Telegram</a> 群，获取简悦的第一手资料。</br>
                                </div>
                            </dialog-content>
                            <dialog-footer>
                                ${btn_open + btn_cancel}
                            </dialog-footer>
                        </dialog-gp>
                    </div>`;
    if ( current_state == "option" ) {
        new Notify().Render( "请误重复进入。" );
        return;
    } else if ( current_state != "" ) {
        new Notify().Render( "请先退出当前模式。" );
        return;
    } else current_state = "option";
    $( "html" ).append( optmpl );
    $( ".simpread-option-root" ).animate({ opacity: 1 },{ complete: ()=>{
        const [ h1, h2 ] = [ $("dialog-gp").height(), $(".simpread-option-root").height() ];
        if ( h2 <= h1 ) {
            $("dialog-gp").animate({height: h2 - 80 });
        }
    }});
}