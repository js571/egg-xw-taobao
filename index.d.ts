

interface EggTbkClientOption {
  appKey: string,
  secret: string,
  restUrl: string
}

interface EggTbkSDkClientsOption {
  [clientName: string]: EggTbkClientOption;
}

interface EggTbkConfig {
  default?: object;
  app?: boolean;
  agent?: boolean;
  client?: EggTbkClientOption;
  clients?: EggTbkClientOption;
}

declare module 'egg' {
  interface Application {
    tbk: {
      request: <T = any>(apiName: string, params: Record<string, any>) => Promise<T>;
    }
  }
  interface EggAppConfig {
    tbk: EggTbkConfig;
  }
}
