<p align="center"><img src="http://ojec5ddd5.bkt.clouddn.com/logo%20bigger.png" /></p>
<h1 align="center">简悦 - SimpRead</h1>
<p align="center">让你瞬间进入沉浸式阅读的扩展，还原阅读的本质，提升你的阅读体验。</p>
<p align="center">为了达到完美的阅读模式这个小目标 ，我适配了 <a target="_blank" href="https://github.com/kenshin/simpread/wiki/适配站点列表">240+</a> 个网站，因此诞生了简悦。</p>
<p align="center">
   <a href="https://github.com/kenshin/simpread/releases"><img src="https://i.imgur.com/fiweIRT.png"></a>
   <a target="_blank" href="http://ksria.com/simpread"><img src="https://i.imgur.com/ryEV5nm.png"></a>
   <a target="_blank" href="https://chrome.google.com/webstore/detail/%E7%AE%80%E6%82%A6-simpread/ijllcpnolfcooahcekpamkbidhejabll"><img src="https://i.imgur.com/ubNLVJa.png"></a>
   <a target="_blank" href="https://addons.mozilla.org/zh-CN/firefox/addon/simpread"><img src="https://i.imgur.com/tBstQ7d.png"></a>
   <a target="_blank" href="https://greasyfork.org/zh-CN/scripts/39998"><img src="https://i.imgur.com/JFhxHeR.png"></a>

</p>

***

<h1 align="center">简悦 · 轻阅版</h1>

轻阅版是在 [简悦](https://github.com/kenshin/simpread) 的基础上专门针对 Apple Safari, Microsoft Edge 以及任意支持 UserScript 的浏览器而生的。  
现在就加入 [Telegram 群](https://t.me/simpread)，获取简悦的第一手资料。

***

#### 马上使用：
* 安装 [Tampermonkey](http://tampermonkey.net/) 并选择对应浏览器的版本；
* 进入 <https://greasyfork.org/zh-CN/scripts/39998>，并选择 `安装`；
* 安装完毕后，打开 <https://sspai.com/post/39491> 键盘快捷键 → <kbd>A</kbd> <kbd>A</kbd>（双击 A） 就可以进入阅读模式；
  _简悦能完美适配的网址多达数千个，加上临时阅读模式的话，可支持任意页面。_
* 不清楚简悦如何使用？想知道简悦的高级功能，请看简悦的 [帮助中心](https://github.com/kenshin/simpread/wiki) 。

#### 特点：
* 加载速度快；（由于直接使用 JavaScript 作为模板引擎）
* 基于 UserScript 编写，所以只要是支持此的浏览器均可以感受简悦带来的 `沉浸式阅读体验`；
* 可导入 `简悦` 的配置信息；
* 只关注阅读模式，除此以外并无其它任何功能。

#### 功能：
- [聚焦模式](https://github.com/Kenshin/simpread/wiki/%E8%81%9A%E7%84%A6%E6%A8%A1%E5%BC%8F)：  
  不改变当前页面的结构，仅仅高亮需要阅读的部分，不分散用户的注意力；适合 `临时阅读` 或者 `未适配阅读模式` 的网站

- [阅读模式](https://github.com/Kenshin/simpread/wiki/%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F/)：  
  简悦 `原创` 功能，逐一适配了 [240+](https://github.com/kenshin/simpread/wiki/适配站点列表) 个网站，自动提取 `标题` `描述` `正文` `媒体资源（ 图片/ 视频 ）` 等，生成 `符合中文阅读` 的页面

   * [TXT 阅读器](https://github.com/Kenshin/simpread/wiki/txt-%E9%98%85%E8%AF%BB%E5%99%A8) [论坛类页面及分页](https://github.com/Kenshin/simpread/wiki/%E8%AE%BA%E5%9D%9B%E7%B1%BB%E9%A1%B5%E9%9D%A2%E5%8F%8A%E5%88%86%E9%A1%B5) 如：知乎 · 百度贴吧等

   * 临时阅读模式：  
    将 `非适配阅读模式的页面` 生成 `阅读模式` 一样的排版，支持任意页面，详细请看 [临时阅读模式](https://github.com/kenshin/simpread/wiki/临时阅读模式) 以及 [操作](http://ksria.com/simpread/welcome/version_1.0.5.html#temp-read-mode)

   * 主动适配：  
    通过简单的一个步骤，就可以让 `非适配页面` 支持阅读模式，详细请看 [主动适配](https://github.com/kenshin/simpread/wiki/主动适配阅读模式) 以及 [操作](http://ksria.com/simpread/welcome/version_1.0.5.html#mate-read-mode)

- 导入 / 导出 / 同步适配列表 / 初始化数据，以及（相对简悦来说）适度的设置选项；

#### 与 简悦 差别：

* 无 `稍后读`；
* 无 `导出到生产力功能`；
* 无 `站点编辑器` `站点适配源` `站点管理器`；
* 无 `自定义样式`；

#### 截图：
<img src="https://i.imgur.com/7q5czJ9.gif" width="600px"/>  

#### 新手入门：

* 正确安装 简悦 · 轻阅版 后，每次新开一个页面，都会在右下角显示如下两种图标状态：  
  ![Imgur](https://i.imgur.com/UgwxLGc.png)

* 点击绿色 → 进入 `阅读模式`；
* 点击灰色 → 进入 `临时阅读模式`；
* `聚焦模式` 默认快捷键 为 <kbd>A</kbd> <kbd>S</kbd>
* `阅读模式` 默认快捷键 为 <kbd>A</kbd> <kbd>A</kbd>
* 更详细的设定请看  
  ![Imgur](https://i.imgur.com/77Vo2uFl.png)

#### 投票：
简悦是一个免费并开源的项目。如果觉得不错，请给我 [投票](https://greasyfork.org/zh-CN/forum/post/discussion?script=39998&locale=zh-CN) 。这样让更多人了解并受用与 `简悦` 带来的便利，你的认可是对我最大的鼓励。

#### 相关链接：
* [简悦](https://github.com/kenshin/simpread)
* [反馈](https://github.com/kenshin/simpread/issues)
* [联系](http://kenshin.wang) · [邮件](kenshin@ksria.com) · [微博](http://weibo.com/23784148) · [Telegram 群](https://t.me/simpread)
* 想了解简悦背后的故事？ [猛击这里](https://sspai.com/post/39491)

#### 简悦相关的模块：
* 简悦的 `核心库` → [PuRead](https://github.com/kenshin/puread)
* 简悦的 `Material Design Component` → [MDUIKit](https://github.com/kenshin/mduikit)
* 简悦的 `消息提示系统` → [Notify](https://github.com/kenshin/notify)

#### 简悦的诞生离不开它们：
- [Node.js](https://nodejs.org/) · [NPM](https://www.npmjs.com)
- [Rollup](https://webpack.github.io/)
- [Tampermonkey](http://tampermonkey.net/) · [Greasyfork](https://greasyfork.org/zh-CN)
- [ES6](http://es6-features.org/) · [Babel](https://babeljs.io)
- [jQuery](https://jquery.com/) · [Mousetrap](https://craig.is/killing/mice) · [minimatch](https://github.com/isaacs/minimatch) 
- [Sketch](https://www.sketchapp.com/) · [Pixelmator](http://www.pixelmator.com/)
- Icon from <http://iconfont.cn>
- Mockup Design usage <http://magicmockups.com/>
- Material Design usage <https://material.io/guidelines/>
- Mind Maps <https://coggle.it/>
- 咖啡 · 网易音乐 · Google Chrome · rMBP

#### 请杯咖啡：
如果简悦可以解决你在阅读上痛点，提升 Web 端的阅读体验，可以请我喝杯咖啡，想必也是非常愉悦的事情。 :smile:  
_如发现下图显示不全，请直接访问 http://ojec5ddd5.bkt.clouddn.com/zhifu_m2.png_
<img src="https://i.imgur.com/cyQuQBb.png"/>

#### 许可：
[![license-badge]][license-link]

<!-- Link -->
[license-badge]:    https://img.shields.io/github/license/mashape/apistatus.svg
[license-link]:     https://opensource.org/licenses/MIT