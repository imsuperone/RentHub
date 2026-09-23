// src/views/gate.ts
// 极简边缘门禁视图 (未通过 2FA 绝不下发任何后台应用代码)
// 100% 严格遵循 Android 16 (Material 3 Expressive) 设计语言与动态取色规范

import { QRCODE_INLINE_JS } from './qrcode_inline';

export function renderGateHtml(isInitialized: boolean): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>RentHub · Login</title>
  <!-- 异步轻量字体，绝不阻塞渲染 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- 内置极速离线二维码生成库 (0 外部 CDN 依赖) -->
  <script>${QRCODE_INLINE_JS}</script>
  <script>
    tailwind.config = {
      darkMode: 'media',
      theme: {
        extend: {
          fontFamily: {
            sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans SC"', 'sans-serif'],
          },
          borderRadius: {
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '36px',
            '5xl': '44px',
          },
          colors: {
            m3: {
              primary: '#006C4C',
              primaryDark: '#2EE59D',
              onPrimary: '#FFFFFF',
              onPrimaryDark: '#003822',
              primaryContainer: '#A2F2CD',
              onPrimaryContainer: '#002114',
              surface: '#F1F5F2',
              surfaceDark: '#0F1512',
              card: '#FFFFFF',
              cardDark: '#1A211D',
              field: '#E8EDE9',
              fieldDark: '#242C27',
              fieldHover: '#DFE5E0',
              fieldHoverDark: '#2B342F',
              outline: '#707973',
            }
          }
        }
      }
    }
  </script>
  <style>
    /* Android 16 Material 3 Expressive 基础规范与纯原生兜底 */
    :root {
      --m3-primary: #006C4C;
      --m3-primary-container: #A2F2CD;
      --m3-bg: #F1F5F2;
      --m3-card: #FFFFFF;
      --m3-field: #E8EDE9;
      --m3-text: #191C1A;
      --m3-subtext: #414944;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --m3-primary: #2EE59D;
        --m3-primary-container: #005138;
        --m3-bg: #0F1512;
        --m3-card: #1A211D;
        --m3-field: #242C27;
        --m3-text: #E1E3DF;
        --m3-subtext: #89938D;
      }
    }

    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 108, 76, 0.25) transparent;
      box-sizing: border-box;
    }
    ::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 108, 76, 0.25);
      border-radius: 9999px;
    }
    body {
      -webkit-tap-highlight-color: transparent;
      background-color: var(--m3-bg);
      background-image: radial-gradient(circle at 50% 15%, rgba(0, 108, 76, 0.08) 0%, transparent 65%);
      color: var(--m3-text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
      margin: 0;
      padding: 0;
    }
    button {
      cursor: pointer;
      user-select: none;
    }
    .hidden {
      display: none !important;
    }

    /* M3 Expressive 卡片 */
    .m3-expressive-card {
      background: var(--m3-card);
      border-radius: 40px;
      box-shadow: 0 20px 60px -15px rgba(0, 108, 76, 0.12), 0 0 1px 1px rgba(0, 108, 76, 0.06);
      transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
    }
    @media (prefers-color-scheme: dark) {
      .m3-expressive-card {
        box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.06);
      }
    }

    /* M3 Expressive 输入框 */
    .m3-field {
      background: var(--m3-field);
      border-radius: 24px;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      border: 2px solid transparent;
    }
    .m3-field:focus-within {
      background: var(--m3-card);
      border-color: var(--m3-primary);
      box-shadow: 0 0 0 4px rgba(0, 108, 76, 0.12);
    }

    /* M3 Expressive 药丸主按钮 */
    .m3-btn-primary {
      height: 56px;
      border-radius: 9999px;
      background: #006C4C;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 15px;
      border: none;
      box-shadow: 0 8px 24px -4px rgba(0, 108, 76, 0.35);
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .m3-btn-primary:hover {
      background: #00573D;
      box-shadow: 0 10px 28px -2px rgba(0, 108, 76, 0.45);
    }
    .m3-btn-primary:active {
      transform: scale(0.97);
    }
    @media (prefers-color-scheme: dark) {
      .m3-btn-primary {
        background: #2EE59D;
        color: #003822;
        box-shadow: 0 8px 24px -4px rgba(46, 229, 157, 0.3);
      }
      .m3-btn-primary:hover {
        background: #4CFFA8;
      }
    }

    /* M3 Expressive 辅助药丸按钮 */
    .m3-btn-tonal {
      height: 48px;
      border-radius: 9999px;
      background: rgba(0, 108, 76, 0.08);
      color: var(--m3-primary);
      font-weight: 600;
      font-size: 13px;
      border: 1px solid rgba(0, 108, 76, 0.15);
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .m3-btn-tonal:hover {
      background: rgba(0, 108, 76, 0.14);
    }
    .m3-btn-tonal:active {
      transform: scale(0.97);
    }

    /* M3 弹簧震颤 */
    .shake {
      animation: m3Shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes m3Shake {
      10%, 90% { transform: translate3d(-2px, 0, 0); }
      20%, 80% { transform: translate3d(3px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
      40%, 60% { transform: translate3d(5px, 0, 0); }
    }

    /* 智能小屏自适应 (高 <= 820px): 紧凑外留白与内衬，字号保持完全不变 */
    @media (max-height: 820px) {
      body { padding: 1rem !important; }
      .m3-expressive-card { padding: 1.25rem 1.5rem !important; border-radius: 24px !important; }
      .m3-btn-primary { height: 46px !important; }
      .m3-field { padding-top: 0.45rem !important; padding-bottom: 0.45rem !important; }
      #brandHeader { margin-bottom: 1rem !important; }
      .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.65rem !important; }
    }
  </style>
</head>
<body class="min-h-screen flex items-start justify-center p-4 sm:p-6 sm:py-10">
  
  <!-- 核心门禁容器 -->
  <div id="gateCard" class="m3-expressive-card w-full max-w-[540px] p-6 sm:p-8 relative overflow-hidden shadow-2xl">

    <!-- 品牌标题 (RentHub) -->
    <div id="brandHeader" class="flex flex-col items-center mb-6">
      <h1 class="text-3xl font-black tracking-tight text-[#006C4C] dark:text-[#2EE59D] font-mono">RentHub</h1>
    </div>

    <!-- 动态错误提示胶囊 (Material 3 Expressive Tonal Banner) -->
    <div id="errorAlert" class="hidden mb-5 p-4 rounded-[22px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-3 shadow-sm">
      <div class="w-6 h-6 rounded-full bg-rose-200/60 dark:bg-rose-900/60 flex items-center justify-center flex-shrink-0 text-rose-700 dark:text-rose-300">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.008v.008H12v-.008z" />
        </svg>
      </div>
      <span id="errorMsg" class="flex-1 leading-snug">校验失败</span>
    </div>

    <!-- ==================== 流程 1: 首次初始化 (仅无用户时) ==================== -->
    <div id="initSection" class="${isInitialized ? 'hidden' : ''} space-y-4">
      
      <!-- 步骤指示胶囊 -->
      <div class="flex items-center justify-between px-1 py-1 mb-1">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#006C4C] text-white text-[11px] font-extrabold">1</span>
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">设置管理员账号</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
          <span>下一步: 二次验证</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </div>

      <div class="p-4 rounded-[24px] bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
        <strong>首次使用：</strong>请设置管理员账号与登录密码，方便日常管理出租房源与账单。
      </div>

      <!-- M3 填充式用户名输入框 -->
      <div class="m3-field px-4 pt-2.5 pb-2">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">管理员账号</label>
          <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <input id="initUsername" type="text" autocomplete="username" placeholder="例如: admin" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
      </div>

      <!-- M3 填充式主密码输入框 (带眼睛切换) -->
      <div class="m3-field px-4 pt-2.5 pb-2">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">设置登录密码 (至少8位)</label>
          <button type="button" onclick="togglePass('initPassword', 'eyeInit')" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5" title="切换显示密码">
            <svg id="eyeInit" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </div>
        <input id="initPassword" type="password" autocomplete="new-password" placeholder="••••••••" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
      </div>

      <!-- 🛡️ 安全找回凭据 1: 安全密保问题 (离线即用，防死锁) -->
      <div class="p-3.5 rounded-[24px] bg-[#E8EDE9]/60 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span>❓</span> <span>密保问题设置 (用于忘记密码时快速找回)</span>
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#006C4C] dark:text-[#2EE59D] font-bold">推荐设置</span>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">选择密保问题</label>
          <select id="initSecurityQuestionSelect" onchange="onSecurityQuestionSelectChange()" class="m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
            <option value="您就读的第一所小学 / 母校全称是？">🎓 您就读的第一所小学 / 母校全称是？</option>
            <option value="您出生或童年成长的城市全称是？">🌆 您出生或童年成长的城市全称是？</option>
            <option value="您领养或拥有的第一只宠物名字？">🐾 您领养或拥有的第一只宠物名字？</option>
            <option value="您最喜欢的一部童年经典电影或书籍？">🌟 您最喜欢的一部童年经典电影或书籍？</option>
            <option value="CUSTOM">✏️ 自定义密保问题...</option>
          </select>
          <input id="initCustomSecurityQuestion" type="text" placeholder="输入您自定义的密保问题" class="hidden m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none mt-1.5">
        </div>

        <div>
          <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">密保答案 (请牢记)</label>
          <input id="initSecurityAnswer" type="text" placeholder="请填写答案 (例如: 朝阳第一小学)" class="m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
        </div>
      </div>

      <!-- 📧 安全找回凭据 2: 邮件服务配置与实测 (支持 Resend API 与 SMTP) -->
      <details id="initEmailDetails" class="p-4 rounded-[24px] bg-[#E8EDE9]/50 dark:bg-[#161D1A]/50 border border-[#D7DED9]/70 dark:border-[#26312B]/70 text-xs">
        <summary class="font-bold flex items-center justify-between cursor-pointer select-none text-neutral-800 dark:text-neutral-200">
          <span class="flex items-center gap-1.5">
            <span>📧</span> <span>配置发件邮箱 (用于发送收租提醒与找回密码)</span>
          </span>
          <span id="initEmailSummaryTag" class="text-[10px] text-[#006C4C] dark:text-[#2EE59D] font-bold">展开配置与测试 ▾</span>
        </summary>
        
        <div class="mt-3.5 pt-3 border-t border-[#D7DED9]/60 dark:border-[#26312B]/60 space-y-3">
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            配置发信邮箱后，系统可在房租/水电到期时给您发邮件提醒，忘记密码时也可向您的邮箱发送验证码找回。
          </p>

          <!-- 发信渠道切换药丸/卡片 (Resend API vs 自定义 SMTP) -->
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-0.5">选择发信通道</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label class="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-[#006C4C] dark:border-[#2EE59D] cursor-pointer transition-all" id="labelInitProviderResend">
                <input type="radio" name="initMailProvider" id="initProvider_resend" value="resend" checked onchange="toggleInitMailProviderUI('resend')" class="accent-[#006C4C] mt-0.5">
                <div>
                  <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1">
                    <span>⚡ Resend API</span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold">推荐 · 零端口限制</span>
                  </div>
                  <div class="text-[10px] text-neutral-400 mt-0.5">现代 HTTP 发信，边缘 Workers 极速稳定</div>
                </div>
              </label>
              <label class="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer transition-all" id="labelInitProviderSmtp">
                <input type="radio" name="initMailProvider" id="initProvider_smtp" value="smtp" onchange="toggleInitMailProviderUI('smtp')" class="accent-[#006C4C] mt-0.5">
                <div>
                  <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100">📧 自定义 SMTP</div>
                  <div class="text-[10px] text-neutral-400 mt-0.5">QQ / 163 / 企业邮等传统邮箱</div>
                </div>
              </label>
            </div>
          </div>

          <!-- 渠道 1: Resend API 配置 -->
          <div id="initResendSection" class="space-y-2.5">
            <div>
              <div class="flex items-center justify-between mb-1 px-1">
                <label class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Resend API Key</label>
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" class="text-[10px] font-bold text-[#006C4C] dark:text-[#2EE59D] hover:underline">获取 API Key ↗</a>
              </div>
              <input id="initResendApiKey" type="password" placeholder="" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              <span class="text-[9px] text-neutral-400 mt-0.5 block px-1">在 resend.com 免费申请（例如 re_123456789...）</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">发件人邮箱 (From Email)</label>
                <input id="initResendFromEmail" type="text" placeholder="例如 onboarding@resend.dev 或已验证域名" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">发件人显示名称</label>
                <input id="initResendFromName" type="text" placeholder="RentHub" class="m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
            </div>
          </div>

          <!-- 渠道 2: SMTP 配置 (默认隐藏) -->
          <div id="initSmtpSection" class="hidden space-y-2.5">
            <!-- 主流邮箱快捷预设芯片 -->
            <div>
              <div class="flex items-center justify-between mb-1.5 px-0.5">
                <label class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">一键预设主流邮箱：</label>
                <span class="text-[10px] text-neutral-400">点击自动填充服务器与端口</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button type="button" onclick="applyInitSmtpPreset('qq')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">QQ邮箱</button>
                <button type="button" onclick="applyInitSmtpPreset('163')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">163网易</button>
                <button type="button" onclick="applyInitSmtpPreset('126')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">126邮箱</button>
                <button type="button" onclick="applyInitSmtpPreset('foxmail')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">腾讯企业邮</button>
                <button type="button" onclick="applyInitSmtpPreset('qiye163')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">网易企业邮</button>
                <button type="button" onclick="applyInitSmtpPreset('gmail')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">Gmail</button>
                <button type="button" onclick="applyInitSmtpPreset('outlook')" class="px-2.5 py-1 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] text-neutral-700 dark:text-neutral-200 hover:bg-[#DFE5E0] font-bold text-[11px] transition-colors">Outlook</button>
              </div>
            </div>

            <!-- SMTP Host & Port -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">SMTP 服务器主机</label>
                <input id="initSmtpHost" type="text" placeholder="如 smtp.qq.com" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">端口</label>
                <input id="initSmtpPort" type="number" placeholder="465" value="465" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
            </div>

            <!-- SSL/TLS 开关 -->
            <div class="flex items-center justify-between px-1 py-0.5">
              <label class="flex items-center gap-2 cursor-pointer font-bold text-[11px] text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" id="initSmtpSecure" checked class="w-3.5 h-3.5 rounded text-[#006C4C] dark:text-[#2EE59D] accent-[#006C4C]">
                <span>启用 SSL/TLS 安全加密 (端口 465 开启，端口 587 关闭)</span>
              </label>
            </div>

            <!-- User & Password (授权码) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">SMTP 账号 / 发件人邮箱</label>
                <input id="initSmtpUser" type="text" placeholder="如 your@qq.com" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
              <div>
                <div class="flex items-center justify-between mb-1 px-1">
                  <label class="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">授权码 / 密码</label>
                  <span class="text-[9px] text-amber-600 dark:text-amber-400 font-bold">请填专有授权码</span>
                </div>
                <input id="initSmtpPass" type="password" placeholder="邮箱授权码" class="m3-field w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">发信人显示名称</label>
              <input id="initSmtpFromName" type="text" placeholder="RentHub" class="m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
            </div>
          </div>

          <!-- 通用接收安全邮箱 -->
          <div>
            <label class="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-1">安全找回邮箱 (接收测试验证码与收租提醒)</label>
            <input id="initRecoveryEmail" type="email" placeholder="如 admin@yourdomain.com" class="m3-field w-full px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none">
          </div>

          <!-- ⚡ 实机测通按钮与验证码 -->
          <div class="pt-1.5 space-y-2">
            <div class="flex items-center gap-2">
              <button type="button" onclick="sendInitVerifyCode()" id="btnSendInitCode" class="flex-1 py-2.5 px-3 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-neutral-800 dark:text-neutral-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                <span>⚡ 发送实测验证码</span>
              </button>
              <div id="initEmailStatusBadge" class="hidden text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2">
                <span>✓ 已测通并激活</span>
              </div>
            </div>

            <!-- 验证码确认区 -->
            <div id="initCodeVerifyBox" class="hidden flex items-center gap-2">
              <input id="initVerifyCodeInput" type="text" inputmode="numeric" maxlength="6" placeholder="输入 6 位验证码" class="m3-field flex-1 px-3 py-2 text-center text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100 outline-none">
              <button type="button" onclick="confirmInitVerifyCode()" id="btnConfirmInitCode" class="px-4 py-2 rounded-full bg-[#006C4C] dark:bg-[#2EE59D] text-white dark:text-[#003822] text-xs font-bold hover:opacity-90 transition-all">
                确认激活
              </button>
            </div>
          </div>
        </div>
      </details>

      <!-- 主操作按钮 (Android 16 Pill FAB) -->
      <button onclick="submitInit()" id="initBtn" class="m3-btn-primary w-full mt-2">
        <span>下一步：设置二次验证 (可选)</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>

    <!-- ==================== 流程 1.5: 扫码并输入动态码激活 2FA (支持跳过) ==================== -->
    <div id="totpSetupSection" class="hidden space-y-3.5">
      
      <!-- 步骤指示与返回 -->
      <div class="flex items-center justify-between px-1 py-1">
        <button type="button" onclick="backToInitStep()" class="text-xs text-neutral-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors">
          <span>← 重设账号</span>
        </button>
        <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-[#006C4C] dark:text-[#2EE59D] font-bold">
          🛡️ 第 2 步：设置二次验证 (可选)
        </span>
      </div>

      <div class="text-center">
        <h2 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">绑定手机二次验证 (动态口令)</h2>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">请使用微信小程序（腾讯身份验证器）或手机验证器扫码</p>
      </div>

      <!-- Android 16 风格白底圆角二维码卡片 -->
      <div class="flex flex-col items-center justify-center p-5 bg-white rounded-[32px] border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm">
        <div id="qrcodeBox" class="p-1 bg-white rounded-2xl flex items-center justify-center"></div>
        <div class="mt-3 text-center w-full">
          <span class="text-[10px] text-neutral-400 font-semibold block mb-1">无法扫码？点击复制密钥手动添加：</span>
          <div id="secretDisplay" onclick="copySecret()" title="点击复制密钥" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 font-mono text-xs font-bold cursor-pointer transition-colors select-all">
          </div>
        </div>
      </div>

      <!-- 6 位动态验证码输入 (M3 大字距居中样式) -->
      <div class="m3-field px-4 pt-2.5 pb-2 text-center">
        <label class="block text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider mb-1">
          输入手机上显示的 6 位动态验证码
        </label>
        <input id="initTotpCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full bg-transparent border-none outline-none text-center text-3xl tracking-[0.35em] font-mono font-extrabold text-[#006C4C] dark:text-[#2EE59D]">
      </div>

      <!-- 备用恢复码卡片 (可折叠紧凑展示) -->
      <details class="p-3.5 rounded-[22px] bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
        <summary class="flex items-center justify-between cursor-pointer font-bold select-none">
          <span class="flex items-center gap-1.5">🔑 8组应急备用码</span>
          <span class="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">展开查看/复制 ▾</span>
        </summary>
        <div class="mt-2.5 pt-2 border-t border-amber-200/50 dark:border-amber-900/30">
          <div class="flex justify-end mb-1.5">
            <button type="button" onclick="copyAllRecoveryCodes()" class="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline">📋 一键复制全部备用码</button>
          </div>
          <div id="recoveryCodesDisplay" class="grid grid-cols-2 gap-1 font-mono text-[11px] font-bold select-all"></div>
        </div>
      </details>

      <!-- 按钮组合 -->
      <div class="space-y-2.5 pt-1">
        <button onclick="confirmInit2FA()" id="confirmInitBtn" class="m3-btn-primary w-full">
          <span>确认并开启二次验证</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </button>
        <button onclick="skipInit2FA()" id="skipInitBtn" class="m3-btn-tonal w-full">
          <span>暂不绑定，直接进入系统</span>
        </button>
      </div>
    </div>

    <!-- ==================== 流程 2: 登录第一步 (账号密码) ==================== -->
    <div id="loginStep1Section" class="${!isInitialized ? 'hidden' : ''} space-y-4">
      
      <div class="text-center mb-2">
        <h2 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">房东登录</h2>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">请输入账号和密码</p>
      </div>

      <!-- 账号输入 -->
      <div class="m3-field px-4 pt-2.5 pb-2">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">登录账号</label>
          <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
        <input id="loginUsername" type="text" autocomplete="username" placeholder="账号 (默认: admin)" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
      </div>

      <!-- 密码输入 -->
      <div class="m3-field px-4 pt-2.5 pb-2">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">登录密码</label>
          <button type="button" onclick="togglePass('loginPassword', 'eyeLogin')" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5" title="切换显示密码">
            <svg id="eyeLogin" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </div>
        <input id="loginPassword" type="password" autocomplete="current-password" placeholder="••••••••" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
      </div>

      <!-- 忘记密码快捷入口 -->
      <div class="flex items-center justify-end px-1 -mt-1">
        <button type="button" onclick="openForgotPassword()" class="text-xs font-bold text-[#006C4C] dark:text-[#2EE59D] hover:underline transition-colors">
          忘记密码？
        </button>
      </div>

      <!-- 登录提交按钮 -->
      <button onclick="submitStep1()" id="step1Btn" class="m3-btn-primary w-full mt-2">
        <span>登 录</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>

    <!-- ==================== 流程 3: 登录第二步 (TOTP 2FA 动态码) ==================== -->
    <div id="loginStep2Section" class="hidden space-y-4">
      
      <div class="text-center mb-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-[#006C4C] dark:text-[#2EE59D]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 密码正确
        </span>
        <h2 class="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">二次身份验证</h2>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">请输入手机验证器中的 6 位动态验证码或应急备用码</p>
      </div>

      <!-- 6 位验证码居中大字距输入 -->
      <div class="m3-field px-4 pt-3 pb-2.5 text-center">
        <input id="totpCode" type="text" inputmode="numeric" maxlength="9" placeholder="000000" class="w-full bg-transparent border-none outline-none text-center text-4xl tracking-[0.3em] font-mono font-extrabold text-[#006C4C] dark:text-[#2EE59D]">
      </div>

      <button onclick="submitStep2()" id="step2Btn" class="m3-btn-primary w-full">
        <span>完成验证并进入系统</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </button>

      <div class="text-center pt-1">
        <button onclick="backToStep1()" class="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold transition-colors">
          ← 返回重输密码
        </button>
      </div>
    </div>

    <!-- ==================== 流程 4: 忘记密码与安全重置 (Android 16 M3) ==================== -->
    <div id="forgotPasswordSection" class="hidden space-y-4">
      <div class="flex items-center justify-between px-1 py-1">
        <button type="button" onclick="backToLoginFromForgot()" class="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold flex items-center gap-1 transition-colors">
          <span>← 返回登录</span>
        </button>
        <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold">
          🔑 找回登录密码
        </span>
      </div>

      <div class="text-center mb-1">
        <h2 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">重置登录密码</h2>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">请选择您初始化时设置的找回方式进行验证</p>
      </div>

      <!-- 步骤 A: 填写账号查询找回方式 -->
      <div id="forgotStepAccount" class="space-y-3.5">
        <div class="m3-field px-4 pt-2.5 pb-2">
          <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider block">登录账号</label>
          <input id="forgotUsername" type="text" placeholder="输入登录账号 (如: admin)" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
        </div>
        <button onclick="queryRecoveryOptions()" id="btnQueryRecovery" class="m3-btn-primary w-full">
          <span>下 一 步</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        </button>
      </div>

      <!-- 步骤 B: 选择验证方式并填写凭证 -->
      <div id="forgotStepVerify" class="hidden space-y-3.5">
        <!-- 找回方式切换药丸 -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1" id="recoveryMethodTabs">
          <button type="button" id="tabMethodQuestion" onclick="switchRecoveryMethod('QUESTION')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-[#006C4C] text-white">❓ 密保问题</button>
          <button type="button" id="tabMethodCode" onclick="switchRecoveryMethod('RECOVERY_CODE')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300">🔑 应急备用码</button>
          <button type="button" id="tabMethodEmail" onclick="switchRecoveryMethod('EMAIL_OTP')" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300">📧 安全邮箱</button>
        </div>

        <!-- 方式 1: 密保问题 -->
        <div id="methodBoxQuestion" class="space-y-3">
          <div class="p-3.5 rounded-[20px] bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-xs">
            <span class="text-neutral-500 dark:text-neutral-400 block mb-1">您的安全密保问题：</span>
            <strong id="displaySecurityQuestion" class="text-neutral-900 dark:text-neutral-100 text-sm block">--</strong>
          </div>
          <div class="m3-field px-4 pt-2.5 pb-2">
            <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider block">密保问题答案</label>
            <input id="inputSecurityAnswer" type="text" placeholder="输入您当时填写的答案" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
          </div>
        </div>

        <!-- 方式 2: 8组紧急恢复码 -->
        <div id="methodBoxCode" class="hidden space-y-3">
          <div class="p-3.5 rounded-[20px] bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            请输入初始化时生成的 8 组应急备用码中的<strong>任意 1 组</strong>。使用后该备用码将自动作废。
          </div>
          <div class="m3-field px-4 pt-2.5 pb-2 text-center">
            <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider block mb-1">8 组应急备用码之一</label>
            <input id="inputRecoveryCode" type="text" placeholder="例如: ABCD-1234" class="w-full bg-transparent border-none outline-none text-center font-mono font-bold text-lg text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1 uppercase">
          </div>
        </div>

        <!-- 方式 3: 安全邮箱验证码 -->
        <div id="methodBoxEmail" class="hidden space-y-3">
          <div class="p-3.5 rounded-[20px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <div>
              <span class="text-neutral-500 dark:text-neutral-400 block text-[10px]">接收验证码的安全邮箱：</span>
              <strong id="displayMaskedEmail" class="font-mono text-xs">--</strong>
            </div>
            <button type="button" onclick="sendRecoveryEmailCode()" id="btnSendRecoveryOtp" class="px-3 py-1.5 rounded-full bg-[#006C4C] dark:bg-[#2EE59D] text-white dark:text-[#003822] text-[11px] font-bold hover:opacity-90 transition-opacity">
              发送验证码
            </button>
          </div>
          <div class="m3-field px-4 pt-2.5 pb-2 text-center">
            <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider block mb-1">邮箱收到的 6 位验证码</label>
            <input id="inputEmailOtp" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full bg-transparent border-none outline-none text-center text-2xl tracking-[0.3em] font-mono font-extrabold text-[#006C4C] dark:text-[#2EE59D]">
          </div>
        </div>

        <button onclick="submitVerifyRecovery()" id="btnVerifyRecovery" class="m3-btn-primary w-full">
          <span>验证并继续</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </button>
      </div>

      <!-- 步骤 C: 输入新密码 -->
      <div id="forgotStepNewPass" class="hidden space-y-3.5">
        <div class="p-3 rounded-[20px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center">
          ✓ 身份验证通过，请设置新的登录密码
        </div>

        <!-- 新密码输入 -->
        <div class="m3-field px-4 pt-2.5 pb-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">设置新密码 (至少8位)</label>
            <button type="button" onclick="togglePass('forgotNewPassword', 'eyeNewPass')" class="text-neutral-400 p-0.5">
              <svg id="eyeNewPass" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
          <input id="forgotNewPassword" type="password" placeholder="••••••••" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
        </div>

        <!-- 确认新密码输入 -->
        <div class="m3-field px-4 pt-2.5 pb-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold text-[#006C4C] dark:text-[#2EE59D] uppercase tracking-wider">确认新密码</label>
            <button type="button" onclick="togglePass('forgotConfirmPassword', 'eyeConfirmPass')" class="text-neutral-400 p-0.5">
              <svg id="eyeConfirmPass" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
          <input id="forgotConfirmPassword" type="password" placeholder="••••••••" class="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 pt-1">
        </div>

        <button onclick="submitResetPassword()" id="btnResetPassword" class="m3-btn-primary w-full">
          <span>确认重置密码并登录</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </button>
      </div>
    </div>

  </div>

  <script>
    let tempToken = '';
    let pendingUserId = '';
    let rawSecret = '';
    let currentRecoveryCodes = [];

    function togglePass(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>';
      } else {
        input.type = 'password';
        if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
      }
    }

    function showError(msg) {
      const el = document.getElementById('errorAlert');
      const text = document.getElementById('errorMsg');
      const card = document.getElementById('gateCard');
      text.innerText = msg;
      el.classList.remove('hidden');
      el.style.display = 'flex';
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
    }

    function clearError() {
      const el = document.getElementById('errorAlert');
      el.classList.add('hidden');
      el.style.display = 'none';
    }

    function copySecret() {
      if (!rawSecret) return;
      navigator.clipboard.writeText(rawSecret).then(() => {
        alert('密钥已成功复制到剪贴板！');
      });
    }

    function copyAllRecoveryCodes() {
      if (!currentRecoveryCodes.length) return;
      navigator.clipboard.writeText(currentRecoveryCodes.join('\\n')).then(() => {
        alert('8 组应急备用码已全部复制到剪贴板！请妥善保存在手机便签中。');
      });
    }

    function onSecurityQuestionSelectChange() {
      const select = document.getElementById('initSecurityQuestionSelect');
      const customInput = document.getElementById('initCustomSecurityQuestion');
      if (select && customInput) {
        customInput.classList.toggle('hidden', select.value !== 'CUSTOM');
        if (select.value === 'CUSTOM') customInput.focus();
      }
    }

    const SMTP_PRESETS = {
      qq: { host: 'smtp.qq.com', port: 465, secure: true, fromName: 'RentHub' },
      '163': { host: 'smtp.163.com', port: 465, secure: true, fromName: 'RentHub' },
      '126': { host: 'smtp.126.com', port: 465, secure: true, fromName: 'RentHub' },
      foxmail: { host: 'smtp.exmail.qq.com', port: 465, secure: true, fromName: 'RentHub' },
      qiye163: { host: 'smtphz.qiye.163.com', port: 465, secure: true, fromName: 'RentHub' },
      gmail: { host: 'smtp.gmail.com', port: 465, secure: true, fromName: 'RentHub' },
      outlook: { host: 'smtp.office365.com', port: 587, secure: false, fromName: 'RentHub' }
    };

    function toggleInitMailProviderUI(provider) {
      const isResend = provider === 'resend';
      const resendSec = document.getElementById('initResendSection');
      const smtpSec = document.getElementById('initSmtpSection');
      const lblResend = document.getElementById('labelInitProviderResend');
      const lblSmtp = document.getElementById('labelInitProviderSmtp');

      if (resendSec) {
        if (isResend) resendSec.classList.remove('hidden');
        else resendSec.classList.add('hidden');
      }
      if (smtpSec) {
        if (isResend) smtpSec.classList.add('hidden');
        else smtpSec.classList.remove('hidden');
      }
      if (lblResend) {
        if (isResend) {
          lblResend.className = 'flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-[#006C4C] dark:border-[#2EE59D] cursor-pointer transition-all';
        } else {
          lblResend.className = 'flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-transparent cursor-pointer transition-all';
        }
      }
      if (lblSmtp) {
        if (!isResend) {
          lblSmtp.className = 'flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-[#006C4C] dark:border-[#2EE59D] cursor-pointer transition-all';
        } else {
          lblSmtp.className = 'flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border-2 border-transparent cursor-pointer transition-all';
        }
      }
    }

    function applyInitSmtpPreset(key) {
      const p = SMTP_PRESETS[key];
      if (!p) return;
      const smtpRadio = document.getElementById('initProvider_smtp');
      if (smtpRadio) {
        smtpRadio.checked = true;
        toggleInitMailProviderUI('smtp');
      }
      const hostEl = document.getElementById('initSmtpHost');
      const portEl = document.getElementById('initSmtpPort');
      const secEl = document.getElementById('initSmtpSecure');
      const fromNameEl = document.getElementById('initSmtpFromName');
      if (hostEl) hostEl.value = p.host;
      if (portEl) portEl.value = p.port;
      if (secEl) secEl.checked = p.secure;
      if (fromNameEl && !fromNameEl.value) fromNameEl.value = p.fromName;
    }

    async function sendInitVerifyCode() {
      clearError();
      const email = document.getElementById('initRecoveryEmail')?.value.trim();
      const mailProvider = document.getElementById('initProvider_resend')?.checked ? 'resend' : 'smtp';
      const resendApiKey = document.getElementById('initResendApiKey')?.value.trim();
      const resendFromEmail = document.getElementById('initResendFromEmail')?.value.trim();
      const resendFromName = document.getElementById('initResendFromName')?.value.trim();

      const smtpHost = document.getElementById('initSmtpHost')?.value.trim();
      const smtpPort = document.getElementById('initSmtpPort')?.value.trim();
      const smtpSecure = !!document.getElementById('initSmtpSecure')?.checked;
      const smtpUser = document.getElementById('initSmtpUser')?.value.trim();
      const smtpPass = document.getElementById('initSmtpPass')?.value.trim();
      const smtpFromName = document.getElementById('initSmtpFromName')?.value.trim();

      if (!email || !email.includes('@')) {
        return showError('请填写接收实测验证码的安全邮箱');
      }

      if (mailProvider === 'resend') {
        if (!resendApiKey) {
          return showError('请填写 Resend API Key (以 re_ 开头)');
        }
      } else {
        if (!smtpHost || !smtpPort) {
          return showError('请填写 SMTP 服务器主机与端口');
        }
      }

      const btn = document.getElementById('btnSendInitCode');
      btn.innerText = mailProvider === 'resend' ? '正在调用 Resend API 实测发信...' : '正在连接 SMTP 服务器测通发信...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/send-init-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            mailProvider,
            resendApiKey,
            resendFromEmail,
            resendFromName,
            smtpHost,
            smtpPort,
            smtpSecure,
            smtpUser,
            smtpPass,
            smtpFromName,
            smtpFromEmail: smtpUser
          })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(text || '服务器未返回有效数据');
        }
        if (data.code !== 0) throw new Error(data.message);

        document.getElementById('initCodeVerifyBox')?.classList.remove('hidden');
        document.getElementById('initVerifyCodeInput')?.focus();
        alert('✓ ' + data.message);
      } catch (err) {
        showError(err.message || (mailProvider === 'resend' ? 'Resend API 发信失败' : 'SMTP 发信失败'));
      } finally {
        btn.innerText = '⚡ 重新发送验证码';
        btn.disabled = false;
      }
    }

    async function confirmInitVerifyCode() {
      clearError();
      const email = document.getElementById('initRecoveryEmail')?.value.trim();
      const code = document.getElementById('initVerifyCodeInput')?.value.trim();
      if (!code || code.length !== 6) {
        return showError('请输入收到的 6 位验证码');
      }

      const btn = document.getElementById('btnConfirmInitCode');
      btn.innerText = '校验中...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/confirm-init-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(text || '服务器未返回有效数据');
        }
        if (data.code !== 0) throw new Error(data.message);

        document.getElementById('initCodeVerifyBox')?.classList.add('hidden');
        document.getElementById('btnSendInitCode')?.classList.add('hidden');
        const badge = document.getElementById('initEmailStatusBadge');
        if (badge) badge.classList.remove('hidden');
        alert(data.message);
      } catch (err) {
        showError(err.message || '验证码错误');
      } finally {
        btn.innerText = '确认激活';
        btn.disabled = false;
      }
    }

    async function submitInit() {
      clearError();
      const userEl = document.getElementById('initUsername');
      const passEl = document.getElementById('initPassword');
      const username = (userEl ? userEl.value : '').trim();
      const password = passEl ? passEl.value : '';

      if (!username) {
        if (userEl) userEl.focus();
        return showError('请填写登录账号 (例如: admin)');
      }
      if (!password) {
        if (passEl) passEl.focus();
        return showError('请设置登录密码');
      }
      if (password.length < 8) {
        if (passEl) passEl.focus();
        return showError('为了数据安全，密码长度不能少于 8 位');
      }

      const qSelect = document.getElementById('initSecurityQuestionSelect');
      let securityQuestion = qSelect ? qSelect.value : '';
      if (securityQuestion === 'CUSTOM') {
        const customQ = document.getElementById('initCustomSecurityQuestion');
        securityQuestion = customQ ? customQ.value.trim() : '';
      }
      const ansEl = document.getElementById('initSecurityAnswer');
      const securityAnswer = ansEl ? ansEl.value.trim() : '';
      const emailEl = document.getElementById('initRecoveryEmail');
      const recoveryEmail = emailEl ? emailEl.value.trim() : '';

      const mailProvider = document.getElementById('initProvider_resend')?.checked ? 'resend' : 'smtp';
      const resendApiKey = document.getElementById('initResendApiKey')?.value.trim() || '';
      const resendFromEmail = document.getElementById('initResendFromEmail')?.value.trim() || '';
      const resendFromName = document.getElementById('initResendFromName')?.value.trim() || '';

      const smtpHost = document.getElementById('initSmtpHost')?.value.trim() || '';
      const smtpPort = document.getElementById('initSmtpPort')?.value.trim() || '';
      const smtpSecure = !!document.getElementById('initSmtpSecure')?.checked;
      const smtpUser = document.getElementById('initSmtpUser')?.value.trim() || '';
      const smtpPass = document.getElementById('initSmtpPass')?.value.trim() || '';
      const smtpFromName = document.getElementById('initSmtpFromName')?.value.trim() || '';

      const btn = document.getElementById('initBtn');
      btn.innerText = '正在生成二维码...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            securityQuestion,
            securityAnswer,
            recoveryEmail,
            mailProvider,
            resendApiKey,
            resendFromEmail,
            resendFromName,
            smtpHost,
            smtpPort,
            smtpSecure,
            smtpUser,
            smtpPass,
            smtpFromName,
            smtpFromEmail: smtpUser
          })
        });
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.message || '初始化失败');

        pendingUserId = data.data.userId;
        rawSecret = data.data.totpSecret;
        currentRecoveryCodes = data.data.recoveryCodes || [];

        document.getElementById('initSection').classList.add('hidden');
        document.getElementById('totpSetupSection').classList.remove('hidden');
        const brand = document.getElementById('brandHeader');
        if (brand) brand.classList.add('hidden');
        document.getElementById('secretDisplay').innerHTML = rawSecret + ' <span class="text-[10px] text-[#006C4C] dark:text-[#2EE59D] font-bold">📋 复制</span>';

        // 生成真实清晰二维码
        const qrContainer = document.getElementById('qrcodeBox');
        qrContainer.innerHTML = '';
        try {
          if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
              text: data.data.totpUri,
              width: 140,
              height: 140,
              colorDark: '#000000',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.M
            });
          } else {
            qrContainer.innerHTML = '<div class="text-xs text-neutral-400 p-4 text-center">二维码组件加载中，请手动复制密钥添加</div>';
          }
        } catch (qrErr) {
          console.error('QR render error:', qrErr);
          qrContainer.innerHTML = '<div class="text-xs text-amber-600 p-4 text-center">二维码渲染异常，请手动复制密钥</div>';
        }

        const recBox = document.getElementById('recoveryCodesDisplay');
        recBox.innerHTML = '';
        currentRecoveryCodes.forEach(code => {
          const span = document.createElement('div');
          span.className = 'p-1.5 rounded-[12px] bg-amber-100/70 dark:bg-amber-900/40 text-center font-mono text-xs font-bold';
          span.innerText = code;
          recBox.appendChild(span);
        });

        setTimeout(() => {
          const input = document.getElementById('initTotpCode');
          if (input) input.focus();
        }, 100);

      } catch (err) {
        console.error('submitInit error:', err);
        showError(err.message || '初始化失败，请稍后重试');
      } finally {
        btn.innerHTML = '<span>下一步：设置二次验证 (可选)</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>';
        btn.disabled = false;
      }
    }

    async function confirmInit2FA() {
      clearError();
      const code = document.getElementById('initTotpCode').value.trim();
      if (!code || code.length !== 6) return showError('请输入手机验证器显示的 6 位动态验证码');

      const btn = document.getElementById('confirmInitBtn');
      btn.innerText = '正在激活...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/confirm-init-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: pendingUserId, code })
        });
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.message);

        alert('🎉 二次验证绑定成功，已自动登录！');
        window.location.reload();
      } catch (err) {
        showError(err.message || '验证码不正确，请检查手机时间是否准确');
        btn.innerHTML = '<span>确认并开启二次验证</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        btn.disabled = false;
      }
    }

    async function skipInit2FA() {
      if (!confirm('确定暂不绑定二次验证吗？\\n\\n开启二次验证能更好保护记账与租客信息安全，您也可以稍后在系统设置中开启。')) return;
      const btn = document.getElementById('skipInitBtn');
      btn.innerText = '正在进入系统...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/skip-init-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: pendingUserId })
        });
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.message);

        window.location.reload();
      } catch (err) {
        showError(err.message || '跳过失败');
        btn.innerHTML = '<span>暂不绑定，直接进入系统</span>';
        btn.disabled = false;
      }
    }

    async function submitStep1() {
      clearError();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!username || !password) return showError('请输入账号和密码');

      const btn = document.getElementById('step1Btn');
      btn.innerText = '正在验证...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/login-step1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.message);

        // 若账号未开启 2FA，服务端已直接下发 Cookie，直接放行进入系统
        if (data.data.need2FA === false) {
          window.location.reload();
          return;
        }

        tempToken = data.data.tempToken;
        document.getElementById('loginStep1Section').classList.add('hidden');
        document.getElementById('loginStep2Section').classList.remove('hidden');
        setTimeout(() => document.getElementById('totpCode').focus(), 100);
      } catch (err) {
        showError(err.message || '验证失败');
      } finally {
        btn.innerHTML = '<span>登 录</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>';
        btn.disabled = false;
      }
    }

    async function submitStep2() {
      clearError();
      const code = document.getElementById('totpCode').value.trim();
      if (!code) return showError('请输入 6 位动态验证码');

      const btn = document.getElementById('step2Btn');
      btn.innerText = '正在确认 2FA...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/login-step2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempToken, code })
        });
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.message);

        window.location.reload();
      } catch (err) {
        showError(err.message || '动态验证码错误');
        btn.innerHTML = '<span>完成验证并进入系统</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        btn.disabled = false;
      }
    }

    function backToStep1() {
      document.getElementById('loginStep2Section').classList.add('hidden');
      document.getElementById('loginStep1Section').classList.remove('hidden');
      clearError();
    }

    function backToInitStep() {
      document.getElementById('totpSetupSection').classList.add('hidden');
      document.getElementById('initSection').classList.remove('hidden');
      const brand = document.getElementById('brandHeader');
      if (brand) brand.classList.remove('hidden');
      clearError();
    }

    // ==================== 🔑 忘记密码安全找回控制器 ====================
    let activeRecoveryMethod = 'QUESTION';
    let currentRecoveryUsername = '';
    let currentResetToken = '';

    function openForgotPassword() {
      clearError();
      document.getElementById('loginStep1Section')?.classList.add('hidden');
      document.getElementById('loginStep2Section')?.classList.add('hidden');
      document.getElementById('forgotPasswordSection')?.classList.remove('hidden');
      document.getElementById('forgotStepAccount')?.classList.remove('hidden');
      document.getElementById('forgotStepVerify')?.classList.add('hidden');
      document.getElementById('forgotStepNewPass')?.classList.add('hidden');
      setTimeout(() => document.getElementById('forgotUsername')?.focus(), 100);
    }

    function backToLoginFromForgot() {
      clearError();
      document.getElementById('forgotPasswordSection')?.classList.add('hidden');
      document.getElementById('loginStep1Section')?.classList.remove('hidden');
    }

    async function queryRecoveryOptions() {
      clearError();
      const username = document.getElementById('forgotUsername')?.value.trim();
      if (!username) return showError('请输入登录账号');

      currentRecoveryUsername = username;
      const btn = document.getElementById('btnQueryRecovery');
      btn.innerText = '正在查询找回方式...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/recovery-options?username=' + encodeURIComponent(username));
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        const d = json.data;
        if (!d.hasAccount) {
          throw new Error('未查询到该账号，请核对后重试');
        }

        const tabQ = document.getElementById('tabMethodQuestion');
        const tabC = document.getElementById('tabMethodCode');
        const tabE = document.getElementById('tabMethodEmail');

        if (tabQ) tabQ.classList.toggle('hidden', !d.hasSecurityQuestion);
        if (tabC) tabC.classList.toggle('hidden', !d.hasRecoveryCodes);
        if (tabE) tabE.classList.toggle('hidden', !d.hasRecoveryEmail);

        if (d.hasSecurityQuestion) {
          document.getElementById('displaySecurityQuestion').innerText = d.securityQuestion || '';
        }
        if (d.hasRecoveryEmail) {
          document.getElementById('displayMaskedEmail').innerText = d.maskedEmail || '';
        }

        if (d.hasSecurityQuestion) {
          switchRecoveryMethod('QUESTION');
        } else if (d.hasRecoveryCodes) {
          switchRecoveryMethod('RECOVERY_CODE');
        } else if (d.hasRecoveryEmail) {
          switchRecoveryMethod('EMAIL_OTP');
        } else {
          throw new Error('该账号未设置密码找回方式，无法在线重置');
        }

        document.getElementById('forgotStepAccount')?.classList.add('hidden');
        document.getElementById('forgotStepVerify')?.classList.remove('hidden');
      } catch (err) {
        showError(err.message || '查询失败');
      } finally {
        btn.innerHTML = '<span>下 一 步</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>';
        btn.disabled = false;
      }
    }

    function switchRecoveryMethod(method) {
      activeRecoveryMethod = method;
      const isQ = method === 'QUESTION';
      const isC = method === 'RECOVERY_CODE';
      const isE = method === 'EMAIL_OTP';

      const updateTab = (id, active) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (active) {
          el.className = 'px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-[#006C4C] text-white shadow-sm';
        } else {
          el.className = 'px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300 hover:opacity-85';
        }
      };

      updateTab('tabMethodQuestion', isQ);
      updateTab('tabMethodCode', isC);
      updateTab('tabMethodEmail', isE);

      document.getElementById('methodBoxQuestion')?.classList.toggle('hidden', !isQ);
      document.getElementById('methodBoxCode')?.classList.toggle('hidden', !isC);
      document.getElementById('methodBoxEmail')?.classList.toggle('hidden', !isE);
      clearError();
    }

    async function sendRecoveryEmailCode() {
      clearError();
      const btn = document.getElementById('btnSendRecoveryOtp');
      btn.innerText = '发送中...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/send-recovery-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentRecoveryUsername })
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        alert('✓ 重置验证码已发送至您的安全邮箱，请查收！');
        let sec = 60;
        const timer = setInterval(() => {
          sec--;
          if (sec <= 0) {
            clearInterval(timer);
            btn.innerText = '重新发送';
            btn.disabled = false;
          } else {
            btn.innerText = sec + 's 后重发';
          }
        }, 1000);
      } catch (err) {
        showError(err.message || '发送失败');
        btn.innerText = '发送验证码';
        btn.disabled = false;
      }
    }

    async function submitVerifyRecovery() {
      clearError();
      let answer = '';
      let code = '';

      if (activeRecoveryMethod === 'QUESTION') {
        answer = document.getElementById('inputSecurityAnswer')?.value.trim();
        if (!answer) return showError('请填写密保问题答案');
      } else if (activeRecoveryMethod === 'RECOVERY_CODE') {
        code = document.getElementById('inputRecoveryCode')?.value.trim();
        if (!code) return showError('请输入 8 组应急备用码之一');
      } else if (activeRecoveryMethod === 'EMAIL_OTP') {
        code = document.getElementById('inputEmailOtp')?.value.trim();
        if (!code || code.length !== 6) return showError('请输入 6 位邮箱验证码');
      }

      const btn = document.getElementById('btnVerifyRecovery');
      btn.innerText = '正在验证...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/verify-recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentRecoveryUsername,
            method: activeRecoveryMethod,
            answer,
            code
          })
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        currentResetToken = json.data.resetToken;
        document.getElementById('forgotStepVerify')?.classList.add('hidden');
        document.getElementById('forgotStepNewPass')?.classList.remove('hidden');
        setTimeout(() => document.getElementById('forgotNewPassword')?.focus(), 100);
      } catch (err) {
        showError(err.message || '验证失败');
      } finally {
        btn.innerHTML = '<span>验证并继续</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        btn.disabled = false;
      }
    }

    async function submitResetPassword() {
      clearError();
      const newPassword = document.getElementById('forgotNewPassword')?.value;
      const confirmPassword = document.getElementById('forgotConfirmPassword')?.value;

      if (!newPassword || newPassword.length < 8) {
        return showError('新密码长度不能少于 8 位');
      }
      if (newPassword !== confirmPassword) {
        return showError('两次输入的密码不一致，请核对');
      }

      const btn = document.getElementById('btnResetPassword');
      btn.innerText = '正在重置密码...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resetToken: currentResetToken,
            newPassword
          })
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        alert('🎉 ' + json.message);
        backToLoginFromForgot();
        const loginUserEl = document.getElementById('loginUsername');
        if (loginUserEl) loginUserEl.value = currentRecoveryUsername;
        document.getElementById('loginPassword')?.focus();
      } catch (err) {
        showError(err.message || '重置失败');
      } finally {
        btn.innerHTML = '<span>确认重置密码并登录</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        btn.disabled = false;
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const initSec = document.getElementById('initSection');
        const loginSec = document.getElementById('loginStep1Section');
        const totpSec = document.getElementById('loginStep2Section');
        const setupSec = document.getElementById('totpSetupSection');
        const forgotSec = document.getElementById('forgotPasswordSection');

        if (initSec && !initSec.classList.contains('hidden')) {
          submitInit();
        } else if (loginSec && !loginSec.classList.contains('hidden')) {
          submitStep1();
        } else if (totpSec && !totpSec.classList.contains('hidden')) {
          submitStep2();
        } else if (setupSec && !setupSec.classList.contains('hidden')) {
          confirmInit2FA();
        } else if (forgotSec && !forgotSec.classList.contains('hidden')) {
          const stepAcc = document.getElementById('forgotStepAccount');
          const stepVer = document.getElementById('forgotStepVerify');
          const stepNew = document.getElementById('forgotStepNewPass');
          if (stepAcc && !stepAcc.classList.contains('hidden')) {
            queryRecoveryOptions();
          } else if (stepVer && !stepVer.classList.contains('hidden')) {
            submitVerifyRecovery();
          } else if (stepNew && !stepNew.classList.contains('hidden')) {
            submitResetPassword();
          }
        }
      }
    });

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  </script>
</body>
</html>`;
}
