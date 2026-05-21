/**
 * 麻将练习场 - 用户行为追踪 SDK
 * 上报 PV/UV/游戏行为数据到管理端
 */

const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || 'https://majiang-admin.razet.me';

// 生成或读取访客 ID
function getVisitorId(): string {
  let id = localStorage.getItem('mj_visitor_id');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('mj_visitor_id', id);
  }
  return id;
}

// 获取会话 ID
function getSessionId(): string {
  let id = sessionStorage.getItem('mj_session_id');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('mj_session_id', id);
  }
  return id;
}

// 获取设备信息
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const screen = `${window.innerWidth}x${window.innerHeight}`;
  return { ua, isMobile, isTablet, screen, lang: navigator.language };
}

// 发送数据
async function send(payload: Record<string, unknown>) {
  const data = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    timestamp: Date.now(),
    url: window.location.href,
    path: window.location.pathname,
    ...getDeviceInfo(),
    ...payload,
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${TRACKER_URL}/api/track`, JSON.stringify(data));
    } else {
      fetch(`${TRACKER_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  } catch {
    // 静默失败，不影响用户体验
  }
}

// 追踪页面访问
export function trackPageView(page?: string) {
  send({ event: 'pageview', page: page || window.location.pathname });
}

// 追踪游戏模式选择
export function trackModeSelect(mode: string) {
  send({ event: 'mode_select', mode });
}

// 追踪游戏完成
export function trackGameComplete(mode: string, score: number, isWin: boolean, duration: number) {
  send({ event: 'game_complete', mode, score, isWin, duration });
}

// 追踪答题（听牌/出牌/牌型判断）
export function trackAnswer(mode: string, correct: boolean, questionType?: string) {
  send({ event: 'answer', mode, correct, questionType });
}

// 追踪成就解锁
export function trackAchievement(achievementId: string) {
  send({ event: 'achievement', achievementId });
}

// 追踪自定义事件
export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  send({ event: eventName, ...data });
}

// 初始化：上报 PV
trackPageView();

export default {
  trackPageView,
  trackModeSelect,
  trackGameComplete,
  trackAnswer,
  trackAchievement,
  trackEvent,
};
