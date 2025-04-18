import { h, type VNode } from 'snabbdom';
import * as licon from 'lib/licon';
import { spinnerVdom as spinner } from 'lib/controls';
import { bind, dataIcon } from 'lib/snabbdom';
import type TournamentController from '../ctrl';

function orJoinSpinner(ctrl: TournamentController, f: () => VNode): VNode {
  return ctrl.joinSpinner ? spinner() : f();
}

export function withdraw(ctrl: TournamentController): VNode {
  return orJoinSpinner(ctrl, () => {
    const pause = ctrl.data.isStarted;
    return h(
      'button.fbt.text',
      {
        attrs: dataIcon(pause ? licon.Pause : licon.FlagOutline),
        hook: bind('click', ctrl.withdraw, ctrl.redraw),
      },
      i18n.site[pause ? 'pause' : 'withdraw'],
    );
  });
}

export function join(ctrl: TournamentController): VNode {
  return orJoinSpinner(ctrl, () => {
    const delay = ctrl.data.me && ctrl.data.me.pauseDelay;
    const joinable = ctrl.data.verdicts.accepted && !delay;
    const button = h(
      'button.fbt.text' + (joinable ? '.highlight' : ''),
      {
        attrs: { disabled: !joinable, 'data-icon': licon.PlayTriangle },
        hook: bind('click', _ => ctrl.join(), ctrl.redraw),
      },
      i18n.site.join,
    );
    return delay
      ? h('div.delay-wrap', { attrs: { title: 'Waiting to be able to re-join the tournament' } }, [
          h(
            'div.delay',
            {
              hook: {
                insert(vnode) {
                  const el = vnode.elm as HTMLElement;
                  el.style.animation = `tour-delay ${delay}s linear`;
                  setTimeout(() => {
                    if (delay === ctrl.data.me!.pauseDelay) {
                      ctrl.data.me!.pauseDelay = 0;
                      ctrl.redraw();
                    }
                  }, delay * 1000);
                },
              },
            },
            button,
          ),
        ])
      : button;
  });
}

export function joinWithdraw(ctrl: TournamentController): VNode | undefined {
  if (!ctrl.opts.userId)
    return h(
      'a.fbt.text.highlight',
      { attrs: { href: '/login?referrer=' + window.location.pathname, 'data-icon': licon.PlayTriangle } },
      i18n.site.signIn,
    );
  if (!ctrl.data.isFinished) return ctrl.isIn() ? withdraw(ctrl) : join(ctrl);
  return undefined;
}
