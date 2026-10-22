# 科特迪瓦客户需求收集落地页

移动端优先的单页落地页，用于收集阿比让客户的中国采购需求：

- 三语切换：法文 / 英文 / 中文，默认跟随浏览器语言
- 表单提交后自动生成结构化消息并打开 WhatsApp
- 同一份数据同步备份到飞书多维表格
- 纯静态页面 + Cloudflare Pages Function，无复杂后台

## 目录结构

```text
lead-capture/
├── public/                 # 静态页面
│   ├── index.html
│   ├── styles.css
│   ├── app.js              # 三语、表单、WhatsApp 消息逻辑
│   ├── config.js           # 品牌、WhatsApp 号码、邮箱等配置
│   └── assets/img/         # 本地图片素材
├── functions/api/submit.js # 飞书多维表格备份接口
├── server.js               # 本地预览服务器（无需 npm 依赖）
└── package.json
```

## 本地预览

```bash
npm start
```

然后打开 <http://localhost:4173>。

## 需要自己买服务器吗

不需要买云服务器。这个项目是「静态页面 + 一个无状态接口」，部署到 Cloudflare Pages
免费版即可，本地用的 `npm start` 只是预览服务器；正式上线时由 Cloudflare 托管页面并运行
`/api/submit`，不需要自己维护机器。

## WhatsApp 号码配置

WhatsApp Business 号码申请下来前，页面使用占位号码。申请完成后编辑 `public/config.js`：

```js
whatsappNumber: "2250700000000"
```

号码必须为国际格式、纯数字、不含 `+` 和空格。也可以用网址参数临时测试任意号码，无需改代码：

```text
http://localhost:4173/?wa=8613800000000
```

## 飞书多维表格备份

### 1. 创建飞书应用

1. 打开[飞书开放平台](https://open.feishu.cn/app)，创建「企业自建应用」。
2. 在「权限管理」中开通 `bitable:app`（多维表格读写）。
3. 发布应用版本并等待管理员审核通过。

### 2. 创建多维表格

新建一张多维表格，表头字段名保持完全一致：

```text
姓名
公司
WhatsApp号码
城市
品类
需求描述
数量
预算
清关责任
期望到货时间
页面语言
来源
提交时间
```

### 3. 填写环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

从多维表格网址获取两个参数：

```text
https://xxx.feishu.cn/base/Abc123?table=tblXYZ
FEISHU_APP_TOKEN=Abc123
FEISHU_TABLE_ID=tblXYZ
```

本地运行 `npm start` 后提交表单即可验证。备份失败不会阻断 WhatsApp 发送，页面上会提示。

## 部署到 Cloudflare Pages

1. 在 [Cloudflare Pages](https://pages.cloudflare.com/) 新建项目，连接 Git 仓库或直接上传本项目目录。
2. 构建输出目录设置为 `public`。
3. 在项目设置中添加与 `.env.example` 相同的四个飞书环境变量。
4. 部署完成后，`/api/submit` 由 `functions/` 自动变成接口，无需额外配置。

## 上线前检查

- [ ] `public/config.js` 中的 WhatsApp 号码已替换
- [ ] `public/config.js` 中的邮箱、Facebook 链接已替换
- [ ] 飞书应用权限已通过审核，`.env` / Cloudflare 环境变量已填写
- [ ] 手机端实际测试表单 -> WhatsApp -> 飞书全流程
- [ ] 用 `?wa=` 参数测试不需要改代码

## 图片来源与署名

页面图片来自 Wikimedia Commons，页脚已附带署名链接：

- `hero-abidjan.jpg`：[Navire conteneur ABIDJAN EXPRESS à quai](https://commons.wikimedia.org/wiki/File:Navire_conteneur_ABIDJAN_EXPRESS_%C3%A0_quai.jpg)，Farid mernissi，CC BY-SA 4.0
- `scaffold.jpg`：[Improvised Scaffolding in a construction site](https://commons.wikimedia.org/wiki/File:Improvised_Scaffolding_in_a_construction_site.jpg)，Haykinz001，CC BY-SA 4.0
- `excavator.jpg`：[Caterpillar 330 excavator on a pile of dirt](https://commons.wikimedia.org/wiki/File:Caterpillar_330_excavator_on_a_pile_of_dirt.jpg)，Matthew T Rader，CC BY-SA 4.0
