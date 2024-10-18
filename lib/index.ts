import type { Application, Agent } from 'egg';
import Service from './service';
function createOneClient(config: Record<string, any>, app: Application) {
  app.coreLogger.info('[egg-taobao] 开始初始化', config);
  const client = new Service(config.appKey, config.secret, config.restUrl);
  return client;
}

export function initPlugin(app: Application | Agent) {
  app.addSingleton('taobao', createOneClient);
}
