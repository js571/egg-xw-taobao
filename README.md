## 针对淘宝联盟服务商接口/推广者接口进行请求封装，方便调用

### 使用方法

1. 安装依赖包
```shell
npm install egg-tbk --save

```

2. egg插件里开启
``` javascript
// app/plugin.js
exports.tbk = {
  enable: true,
  package: 'egg-tbk',
};
```

3. 配置文件

``` javascript
// config/config.default.js 或其他配置文件
  config.tbk = {
    client: {
      appKey: '填写你在淘宝联盟应用的appkey',
      secret: '填写你的appSecret',
      restUrl: 'https://gw.api.taobao.com/router/rest',
    },
    app: true,
  };
```
4. 使用
``` javascript  
  const params = {
    adzone_id: '',
    material_dto: '',
    session: '',
  }
  const response = await this.ctx.app.tbk.request('taobao.tbk.sc.general.link.parse', params);
```

5. 如果需要配置多个应用

``` javascript
config.tbk = {
    clients: {
      main: {
        appKey: '填写你在淘宝联盟应用的appkey',
        secret: '填写你的appSecret',
        restUrl: 'https://gw.api.taobao.com/router/rest',
      },
      sub: {
        appKey: '填写你在淘宝联盟应用的appkey',
        secret: '填写你的appSecret',
        restUrl: 'https://gw.api.taobao.com/router/rest',
      }
    },
    app: true,
  };
```

6. 使用
```javascript
const params = {
    adzone_id: '',
    material_dto: '',
    session: '',
  }
  const response = await this.ctx.app.tbk.get('main').request('taobao.tbk.sc.general.link.parse', params);
```