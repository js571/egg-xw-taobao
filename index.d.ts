import TaobaoService from './lib/service';

interface EggCpsTaobaoClientOption {
  appKey: string,
  secret: string,
  restUrl: string
}

interface EggCpsTaobaoClientsOption {
  [clientName: string]: EggCpsTaobaoClientOption;
}

interface EggCpsTaobaoConfig {
  default?: object;
  app?: boolean;
  agent?: boolean;
  client?: EggCpsTaobaoClientsOption;
  clients?: EggCpsTaobaoClientsOption;
}

declare module 'egg' {
  interface Application {
    taobao: TaobaoService
  }
}
