import type { Agent, IBoot } from 'egg';
import { initPlugin } from './lib';

export default class AgentBootHook implements IBoot {
  private readonly agent: Agent;
  constructor(agent: Agent) {
    this.agent = agent;
  }

  configDidLoad() {
    if (this.agent.config.taobao.agent) {
      initPlugin(this.agent);
    }
  }
}
