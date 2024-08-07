import { attributesModule, classModule, init } from 'snabbdom';
import { GameCtrl } from '../gameCtrl';
import { DevCtrl } from './devCtrl';
import { DevRepo, AssetList } from './devRepo';
import { renderDevView } from './devView';
import { BotCtrl } from '../botCtrl';
import { ShareCtrl } from './shareCtrl';
import renderGameView from '../gameView';
import type { RoundController } from 'round';
import type { LocalPlayOpts } from '../types';

const patch = init([classModule, attributesModule]);

interface LocalPlayDevOpts extends LocalPlayOpts {
  assets: AssetList;
}

export async function initModule(opts: LocalPlayDevOpts): Promise<void> {
  console.log(opts.pref);
  if (window.screen.width < 1260) return;

  opts.setup ??= JSON.parse(localStorage.getItem('local.dev.setup') ?? '{}');

  const devRepo = new DevRepo(opts.assets);
  const botCtrl = new BotCtrl(devRepo);
  devRepo.share = new ShareCtrl(botCtrl);
  await botCtrl.init(opts.bots);

  const gameCtrl = new GameCtrl(opts, botCtrl, redraw, 'local-dev');
  const devCtrl = new DevCtrl(gameCtrl, redraw);

  const el = document.createElement('main');
  document.getElementById('main-wrap')?.appendChild(el);

  let vnode = patch(el, renderGameView(gameCtrl, renderDevView(devCtrl)));

  gameCtrl.round = await site.asset.loadEsm<RoundController>('round', { init: gameCtrl.proxy.roundOpts });
  redraw();

  function redraw() {
    vnode = patch(vnode, renderGameView(gameCtrl, renderDevView(devCtrl)));
    gameCtrl.round.redraw();
  }
}
