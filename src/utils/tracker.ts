/**
 * 麻将练习场 - 用户行为追踪 SDK
 * 上报 PV/UV/游戏行为数据到管理端
 * 支持 IP 归属地、浏览器、OS、来源等用户属性采集
 */

const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || 'https://majiang-admin.razet.me';

// 缓存 IP 归属地信息
let ipInfoCache: { ip: string; country: string; region: string; city: string; isp: string } | null = null;
let ipInfoPromise: Promise<typeof ipInfoCache> | null = null;

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

// 解析浏览器信息
function getBrowserInfo(ua: string) {
  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Safari/') && ua.includes('Version/')) {
    browser = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
    browserVersion = ua.split('OPR/')[1]?.split(' ')[0] || ua.split('Opera/')[1]?.split(' ')[0] || '';
  }

  return { browser, browserVersion };
}

// 解析操作系统
function getOSInfo(ua: string) {
  let os = 'Unknown';
  let osVersion = '';

  if (ua.includes('Windows NT 10')) { os = 'Windows'; osVersion = '10/11'; }
  else if (ua.includes('Windows NT 6.3')) { os = 'Windows'; osVersion = '8.1'; }
  else if (ua.includes('Windows NT 6.2')) { os = 'Windows'; osVersion = '8'; }
  else if (ua.includes('Windows NT 6.1')) { os = 'Windows'; osVersion = '7'; }
  else if (ua.includes('Mac OS X')) { os = 'macOS'; osVersion = ua.split('Mac OS X ')[1]?.split(';')[0]?.replace(/_/g, '.') || ''; }
  else if (ua.includes('Android')) { os = 'Android'; osVersion = ua.split('Android ')[1]?.split(';')[0] || ''; }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; osVersion = ua.split('OS ')[1]?.split(' ')[0]?.replace(/_/g, '.') || ''; }
  else if (ua.includes('Linux')) { os = 'Linux'; }
  else if (ua.includes('CrOS')) { os = 'ChromeOS'; }

  return { os, osVersion };
}

// 获取来源信息
function getReferrerInfo() {
  const referrer = document.referrer || 'direct';
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';

  return { referrer, utmSource, utmMedium, utmCampaign };
}

// 获取 IP 归属地信息（异步，使用免费 API）
async function getIpInfo(): Promise<typeof ipInfoCache> {
  if (ipInfoCache) return ipInfoCache;
  if (ipInfoPromise) return ipInfoPromise;

  ipInfoPromise = (async () => {
    try {
      // 使用 ip-api.com 免费 API（每分钟 45 次限制）
      const resp = await fetch('http://ip-api.com/json/?fields=66846721', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        ipInfoCache = {
          ip: data.query || '',
          country: data.country || '',
          region: data.regionName || '',
          city: data.city || '',
          isp: data.isp || '',
        };
        return ipInfoCache;
      }
    } catch {
      // 静默失败
    }
    ipInfoCache = { ip: '', country: '', region: '', city: '', isp: '' };
    return ipInfoCache;
  })();

  return ipInfoPromise;
}

// 获取完整设备信息
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const screen = `${window.innerWidth}x${window.innerHeight}`;
  const { browser, browserVersion } = getBrowserInfo(ua);
  const { os, osVersion } = getOSInfo(ua);
  const { referrer, utmSource, utmMedium, utmCampaign } = getReferrerInfo();

  return {
    ua,
    isMobile,
    isTablet,
    screen,
    lang: navigator.language,
    browser,
    browserVersion,
    os,
    osVersion,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
  };
}

// 发送数据（含 IP 归属地）
async function send(payload: Record<string, unknown>) {
  const deviceInfo = getDeviceInfo();
  const ipInfo = await getIpInfo();

  const data = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    timestamp: Date.now(),
    url: window.location.href,
    path: window.location.pathname,
    ...deviceInfo,
    ...ipInfo,
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

// 初始化：上报 PV（异步，IP 信息会延迟加载）
trackPageView();

export default {
  trackPageView,
  trackModeSelect,
  trackGameComplete,
  trackAnswer,
  trackAchievement,
  trackEvent,
};
