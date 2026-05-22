/**
 * 麻将练习场 - 用户行为追踪 SDK
 * 上报 PV/UV/游戏行为数据到管理端
 * 支持浏览器、OS、来源等用户属性采集
 */

const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || 'https://majiang-admin.razet.me'

interface ClientAttribution {
  country: string
  region: string
  city: string
}

const EMPTY_CLIENT_ATTRIBUTION: ClientAttribution = {
  country: '',
  region: '',
  city: '',
}

// Cookie 操作辅助函数
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number = 365): void {
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

// 生成或读取访客 ID（优先级：localStorage > cookie > 生成新ID）
function getVisitorId(): string {
  // 优先尝试 localStorage
  try {
    let id = localStorage.getItem('mj_visitor_id')
    if (id) return id
  }
  catch {}

  // 其次尝试 cookie
  let id = getCookie('mj_visitor_id')
  if (id) {
    // 同步到 localStorage
    try { localStorage.setItem('mj_visitor_id', id) } catch {}
    return id
  }

  // 生成新 ID
  id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  // 尝试存储到 localStorage 和 cookie
  try { localStorage.setItem('mj_visitor_id', id) } catch {}
  setCookie('mj_visitor_id', id)

  return id
}

// 获取会话 ID（优先级：sessionStorage > cookie > 生成新ID）
function getSessionId(): string {
  // 优先尝试 sessionStorage
  try {
    let id = sessionStorage.getItem('mj_session_id')
    if (id) return id
  }
  catch {}

  // 其次尝试 cookie（会话级别）
  let id = getCookie('mj_session_id')
  if (id) {
    try { sessionStorage.setItem('mj_session_id', id) } catch {}
    return id
  }

  // 生成新 ID
  id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  try { sessionStorage.setItem('mj_session_id', id) } catch {}
  // session ID 用短有效期 cookie
  setCookie('mj_session_id', id, 1)

  return id
}

// 解析浏览器信息
function getBrowserInfo(ua: string) {
  let browser = 'Unknown'
  let browserVersion = ''

  if (ua.includes('Firefox/')) {
    browser = 'Firefox'
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || ''
  }
  else if (ua.includes('Edg/')) {
    browser = 'Edge'
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || ''
  }
  else if (ua.includes('Chrome/')) {
    browser = 'Chrome'
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || ''
  }
  else if (ua.includes('Safari/') && ua.includes('Version/')) {
    browser = 'Safari'
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || ''
  }
  else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera'
    browserVersion = ua.split('OPR/')[1]?.split(' ')[0] || ua.split('Opera/')[1]?.split(' ')[0] || ''
  }

  return { browser, browserVersion }
}

// 解析操作系统
function getOSInfo(ua: string) {
  let os = 'Unknown'
  let osVersion = ''

  if (ua.includes('Windows NT 10')) {
    os = 'Windows'
    osVersion = '10/11'
  }
  else if (ua.includes('Windows NT 6.3')) {
    os = 'Windows'
    osVersion = '8.1'
  }
  else if (ua.includes('Windows NT 6.2')) {
    os = 'Windows'
    osVersion = '8'
  }
  else if (ua.includes('Windows NT 6.1')) {
    os = 'Windows'
    osVersion = '7'
  }
  else if (ua.includes('Mac OS X')) {
    os = 'macOS'
    osVersion = ua.split('Mac OS X ')[1]?.split(';')[0]?.replace(/_/g, '.') || ''
  }
  else if (ua.includes('Android')) {
    os = 'Android'
    osVersion = ua.split('Android ')[1]?.split(';')[0] || ''
  }
  else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS'
    osVersion = ua.split('OS ')[1]?.split(' ')[0]?.replace(/_/g, '.') || ''
  }
  else if (ua.includes('Linux')) {
    os = 'Linux'
  }
  else if (ua.includes('CrOS')) {
    os = 'ChromeOS'
  }

  return { os, osVersion }
}

// 获取来源信息
function getReferrerInfo() {
  const referrer = document.referrer || 'direct'
  const urlParams = new URLSearchParams(window.location.search)
  const utmSource = urlParams.get('utm_source') || ''
  const utmMedium = urlParams.get('utm_medium') || ''
  const utmCampaign = urlParams.get('utm_campaign') || ''

  return { referrer, utmSource, utmMedium, utmCampaign }
}

// 客户端不调用第三方 IP API，避免把访客 IP 发送给外部服务。
function getClientAttribution(): ClientAttribution {
  return EMPTY_CLIENT_ATTRIBUTION
}

// 获取完整设备信息
function getDeviceInfo() {
  const ua = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const isTablet = /iPad|Tablet/i.test(ua)
  const screen = `${window.innerWidth}x${window.innerHeight}`
  const { browser, browserVersion } = getBrowserInfo(ua)
  const { os, osVersion } = getOSInfo(ua)
  const { referrer, utmSource, utmMedium, utmCampaign } = getReferrerInfo()

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
  }
}

// 发送数据
async function send(payload: Record<string, unknown>) {
  const deviceInfo = getDeviceInfo()
  const clientAttribution = getClientAttribution()

  const data = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    timestamp: Date.now(),
    url: window.location.href,
    path: window.location.pathname,
    ...deviceInfo,
    ...clientAttribution,
    ...payload,
  }

  try {
    const jsonStr = JSON.stringify(data)
    if (navigator.sendBeacon) {
      const blob = new Blob([jsonStr], { type: 'application/json' })
      navigator.sendBeacon(`${TRACKER_URL}/api/track`, blob)
    }
    else {
      fetch(`${TRACKER_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr,
        keepalive: true,
      })
    }
  }
  catch {
    // 静默失败，不影响用户体验
  }
}

// 追踪页面访问
export function trackPageView(page?: string) {
  send({ event: 'pageview', page: page || window.location.pathname })
}

// 追踪游戏模式选择
export function trackModeSelect(mode: string) {
  send({ event: 'mode_select', mode })
}

// 追踪游戏完成
export function trackGameComplete(mode: string, score: number, isWin: boolean, duration: number) {
  send({ event: 'game_complete', mode, score, isWin, duration })
}

// 追踪答题（听牌/出牌/牌型判断）
export function trackAnswer(mode: string, correct: boolean, questionType?: string) {
  send({ event: 'answer', mode, correct, questionType })
}

// 追踪成就解锁
export function trackAchievement(achievementId: string) {
  send({ event: 'achievement', achievementId })
}

// 追踪自定义事件
export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  send({ event: eventName, ...data })
}

// 初始化：上报 PV
trackPageView()

export default {
  trackPageView,
  trackModeSelect,
  trackGameComplete,
  trackAnswer,
  trackAchievement,
  trackEvent,
}
