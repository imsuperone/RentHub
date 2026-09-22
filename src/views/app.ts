// src/views/app.ts
// 房东管家 核心管理程序视图 (Android 16 / Material 3 Expressive 高阶设计)
// 适配房东日常高频操作：一键收租、抄表自动算费与底数滚存、一键续约、退租结清、实时搜索筛选、双轨加密凭证

import { QRCODE_INLINE_JS } from './qrcode_inline';

export function renderAppHtml(username: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>RentHub</title>
  <!-- 异步轻量字体，绝不阻塞国内网络渲染 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- 内置极速离线二维码生成库 (0 外部 CDN 依赖) -->
  <script>${QRCODE_INLINE_JS}</script>
  <script>
    tailwind.config = {
      darkMode: 'media',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans SC"', 'sans-serif'],
          },
          borderRadius: {
            'm3-xs': '8px',
            'm3-sm': '12px',
            'm3-md': '16px',
            'm3-lg': '22px',
            'm3-xl': '28px',
            'm3-2xl': '32px',
            'm3-3xl': '36px',
          },
          colors: {
            // Android 16 (Material 3 Expressive) Pixel Dynamic Tonal Colors
            m3: {
              surface: {
                light: '#F1F5F2',
                dark: '#0F1512',
              },
              container: {
                low: '#E8EDE9',
                'low-dark': '#161D1A',
                DEFAULT: '#FFFFFF',
                'dark': '#1A211D',
                high: '#DFE5E1',
                'high-dark': '#202824',
                highest: '#D7DED9',
                'highest-dark': '#26312B',
              },
              primary: {
                DEFAULT: '#0F5B38',
                dark: '#7CDCA0',
                container: '#C4EED0',
                'container-dark': '#1A402D',
                onContainer: '#002111',
                'onContainer-dark': '#A6F5B9',
              },
              amber: {
                container: '#FBE49B',
                'container-dark': '#382F00',
                text: '#745B00',
                'text-dark': '#F0C33C',
              },
              rose: {
                container: '#FFDAD6',
                'container-dark': '#410002',
                text: '#93000A',
                'text-dark': '#FFB4AB',
              }
            }
          }
        }
      }
    }
  </script>
  <style>
    /* Android 16 细腻扁平滚动条 */
    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(15, 91, 56, 0.25) transparent;
      -webkit-tap-highlight-color: transparent;
    }
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(15, 91, 56, 0.2);
      border-radius: 9999px;
    }
    @media (prefers-color-scheme: dark) {
      * {
        scrollbar-color: rgba(124, 220, 160, 0.2) transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(124, 220, 160, 0.2);
      }
    }

    body {
      background-color: #F1F5F2;
      color: #191C1A;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #0F1512;
        color: #E1E3DF;
      }
    }

    /* Android 16 M3 Continuous Squircle Cards */
    .m3-card {
      border-radius: 28px;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    }
    .m3-subcard {
      border-radius: 20px;
    }
    .m3-pill {
      border-radius: 9999px;
      transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
    }
    .m3-pill:active {
      transform: scale(0.96);
    }

    /* Android 16 Filled Text Fields */
    .m3-input {
      border-radius: 18px;
      border: 1.5px solid transparent;
      background-color: #E8EDE9;
      color: #191C1A;
      padding: 0.75rem 1rem;
      transition: all 0.18s cubic-bezier(0.2, 0, 0, 1);
    }
    .m3-input:focus {
      outline: none;
      border-color: #0F5B38;
      background-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(15, 91, 56, 0.12);
    }
    @media (prefers-color-scheme: dark) {
      .m3-input {
        background-color: #1E2622;
        color: #E1E3DF;
      }
      .m3-input:focus {
        border-color: #7CDCA0;
        background-color: #161D1A;
        box-shadow: 0 0 0 3px rgba(124, 220, 160, 0.15);
      }
    }
    select.m3-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230F5B38' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.1em;
      padding-right: 2.5rem;
    }
    @media (prefers-color-scheme: dark) {
      select.m3-input {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237CDCA0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      }
    }

    /* Android 16 Bottom Sheet Animation */
    .m3-sheet {
      animation: m3SheetIn 0.28s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    @keyframes m3SheetIn {
      from { transform: translateY(100%) scale(0.98); opacity: 0.6; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* 智能高度自适应：针对小屏幕笔记本 (高度 <= 820px)，自动收紧内边距与留白，但字号 100% 保持舒适原样 */
    @media (max-height: 820px) {
      body {
        padding-bottom: 2.5rem !important;
      }
      header {
        padding-top: 0.45rem !important;
        padding-bottom: 0.45rem !important;
      }
      main {
        padding-top: 0.75rem !important;
        padding-bottom: 2rem !important;
      }
      .m3-card {
        padding: 1.15rem 1.25rem !important;
        border-radius: 20px !important;
      }
      .m3-subcard {
        padding: 0.75rem 1rem !important;
      }
      .m3-input {
        padding: 0.5rem 0.85rem !important;
        border-radius: 14px !important;
      }
      .space-y-6 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0.85rem * calc(1 - var(--tw-space-y-reverse))) !important;
        margin-bottom: calc(0.85rem * var(--tw-space-y-reverse)) !important;
      }
      .space-y-5 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse))) !important;
        margin-bottom: calc(0.75rem * var(--tw-space-y-reverse)) !important;
      }
    }

    /* ⚡ 紧凑模式：极致空间利用率，每屏展示更多有效信息，字号保持完全不变，极度舒适护眼 */
    body.density-compact {
      padding-bottom: 2rem !important;
    }
    body.density-compact header {
      padding-top: 0.35rem !important;
      padding-bottom: 0.35rem !important;
    }
    body.density-compact main {
      padding-top: 0.5rem !important;
      padding-bottom: 2rem !important;
    }
    body.density-compact .m3-card {
      padding: 0.875rem 1.15rem !important;
      border-radius: 18px !important;
    }
    body.density-compact .m3-subcard {
      padding: 0.65rem 0.9rem !important;
      border-radius: 14px !important;
    }
    body.density-compact .m3-input {
      padding: 0.42rem 0.75rem !important;
      border-radius: 12px !important;
    }
    body.density-compact .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse))) !important;
      margin-bottom: calc(0.75rem * var(--tw-space-y-reverse)) !important;
    }
    body.density-compact .space-y-5 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.6rem * calc(1 - var(--tw-space-y-reverse))) !important;
      margin-bottom: calc(0.6rem * var(--tw-space-y-reverse)) !important;
    }
    body.density-compact .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.45rem * calc(1 - var(--tw-space-y-reverse))) !important;
      margin-bottom: calc(0.45rem * var(--tw-space-y-reverse)) !important;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col pb-28 md:pb-12">

  <!-- ==================== 顶部品牌与导航栏 ==================== -->
  <header class="sticky top-0 z-30 bg-[#F1F5F2]/95 dark:bg-[#0F1512]/95 border-b border-[#D7DED9]/60 dark:border-[#26312B]/60 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors shadow-sm">
    <div class="flex items-center">
      <h1 class="text-xl font-black tracking-tight text-[#0F5B38] dark:text-[#7CDCA0] font-mono">RentHub</h1>
    </div>
    
    <!-- 右侧：桌面端胶囊标签页 + 显示密度切换 + 2FA 盾牌胶囊 + 退出 -->
    <div class="flex items-center gap-2">
      <!-- 桌面端 M3 导航胶囊条 -->
      <nav class="hidden md:flex items-center bg-[#E8EDE9] dark:bg-[#161D1A] p-1 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        <button onclick="switchTab('dashboard')" class="desktop-tab-btn px-4 py-2 rounded-full transition-all" data-tab="dashboard">🏠 概览</button>
        <button onclick="switchTab('leases')" class="desktop-tab-btn px-4 py-2 rounded-full transition-all" data-tab="leases">🏘️ 房源</button>
        <button onclick="switchTab('payments')" class="desktop-tab-btn px-4 py-2 rounded-full transition-all" data-tab="payments">⚡ 记账</button>
        <button onclick="switchTab('receipts')" class="desktop-tab-btn px-4 py-2 rounded-full transition-all" data-tab="receipts">📁 文件</button>
        <button onclick="switchTab('settings')" class="desktop-tab-btn px-4 py-2 rounded-full transition-all" data-tab="settings">⚙️ 设置</button>
      </nav>

      <!-- 显示密度切换胶囊 (舒享 / 紧凑) -->
      <button id="densityToggleBtn" onclick="toggleDensity()" class="m3-pill px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-all bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-700 dark:text-neutral-300 hover:opacity-85" title="切换界面显示密度 (舒享 / 紧凑)">
        <span id="densityIcon">🌿</span>
        <span id="densityLabel">舒享模式</span>
      </button>

      <!-- 2FA 安全状态指示胶囊 (点击直达 2FA 设置) -->
      <button id="header2FABadge" onclick="switchTab('settings'); switchSettingsSection('security');" class="m3-pill px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-all bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300 hover:opacity-85" title="点击查看二次验证详情">
        <span class="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
        <span>二次验证检测中</span>
      </button>

      <!-- 退出登录按钮 -->
      <button onclick="logout()" title="安全退出登录" class="w-9 h-9 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 flex items-center justify-center text-xs transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      </button>
    </div>
  </header>
  
  <!-- 未开启 2FA 顶部长效警示条 (点击立即绑定) -->
  <div id="twoFABanner" class="hidden bg-[#FBE49B]/40 dark:bg-[#382F00]/40 border-b border-[#F0C33C]/40 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs text-[#745B00] dark:text-[#F0C33C]">
    <div class="flex items-center gap-2">
      <span class="font-extrabold text-sm">💡 提示：</span>
      <span>当前仅通过密码登录，建议开启手机二次验证（动态口令），进一步提升安全性。</span>
    </div>
    <button onclick="startRebind2FA()" class="m3-pill px-3.5 py-1 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-[11px] shadow-sm flex-shrink-0">
      去开启
    </button>
  </div>

  <!-- 主体视图容器 -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-32 sm:pb-12 space-y-6">

    <!-- ==================== TAB 1: 房源与记账概览 ==================== -->
    <section id="tab-dashboard" class="tab-content space-y-6">
      
      <!-- 四列高阶运营 KPI 指标卡 (Android 16 Tonal Surfaces) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 房源总数 -->
        <div class="m3-card p-5 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm flex flex-col justify-between">
          <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">房源数量</span>
          <div class="flex items-baseline gap-2 my-2">
            <span id="statTotalHouses" class="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-[#0F5B38] dark:text-[#7CDCA0]">0</span>
            <span class="text-xs text-neutral-400 font-semibold">套</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span id="statActiveBadge" class="text-emerald-700 dark:text-emerald-400 font-bold">● 0 套在租</span>
            <span id="statOverdueBadge" class="text-rose-600 dark:text-rose-400 font-bold">○ 0 套待续约</span>
          </div>
        </div>

        <!-- 本月实际已收 (实收款项) -->
        <div class="m3-card p-5 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">本月实际已收</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold" id="statThisMonthBadge">当月实收</span>
          </div>
          <div class="flex items-baseline gap-1 my-2">
            <span class="text-sm font-extrabold text-neutral-400">¥</span>
            <span id="statThisMonthIncome" class="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-[#0F5B38] dark:text-[#7CDCA0]">0.00</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
            <span>在租月租金总额</span>
            <span class="font-bold text-neutral-700 dark:text-neutral-300 font-mono">¥ <span id="statMonthlyRent">0</span></span>
          </div>
        </div>

        <!-- 已收租房押金 -->
        <div class="m3-card p-5 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm flex flex-col justify-between">
          <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">已收租房押金</span>
          <div class="flex items-baseline gap-1 my-2">
            <span class="text-sm font-extrabold text-neutral-400">¥</span>
            <span id="statDepositPool" class="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">0</span>
          </div>
          <span class="text-[11px] text-neutral-400 font-medium">当前代管的租客押金总额</span>
        </div>

        <!-- 待收欠款与近期待收 -->
        <div class="m3-card p-5 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">待收欠款</span>
            <span id="statUnpaidBadge" class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">0 笔欠费</span>
          </div>
          <div class="flex items-baseline gap-1 my-2">
            <span class="text-sm font-extrabold text-neutral-400">¥</span>
            <span id="statTotalUnpaid" class="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-rose-600 dark:text-rose-400">0.00</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
            <span>近期待收房租</span>
            <span class="font-bold text-amber-600 dark:text-amber-400 font-mono"><span id="statPendingRents">0</span> 笔</span>
          </div>
        </div>
      </div>

      <!-- 核心大盘：近期待收租队列 (带一键收租) + 快捷事务入口 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 待收租队列 (占两列) -->
        <div class="lg:col-span-2 space-y-3">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 class="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">近期待收房租 (未来30天内应收或已逾期)</h2>
            </div>
            <span class="text-xs text-neutral-400">按交租日期先后排序</span>
          </div>

          <div id="upcomingRentQueue" class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 divide-y divide-[#E8EDE9] dark:divide-[#26312B]/60 overflow-hidden shadow-sm">
            <div class="p-8 text-center text-xs text-neutral-400">正在拉取收租数据...</div>
          </div>
        </div>

        <!-- 房东日常高频快捷操作面板 -->
        <div class="space-y-3">
          <h2 class="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider px-1">常用功能</h2>
          
          <div class="m3-card p-4 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 space-y-3 shadow-sm">
            <button onclick="openUtilityModal()" class="w-full p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/50 dark:hover:bg-[#1A402D]/40 flex items-center justify-between text-left transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] flex items-center justify-center font-bold text-base flex-shrink-0">
                  ⚡
                </div>
                <div>
                  <div class="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[#0F5B38] dark:group-hover:text-[#7CDCA0]">记一笔水电杂费</div>
                  <div class="text-[11px] text-neutral-400 mt-0.5">支持抄表自动算费与底数滚存</div>
                </div>
              </div>
              <svg class="w-4 h-4 text-neutral-400 group-hover:text-[#0F5B38] transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button onclick="openAddLeaseModal()" class="w-full p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/50 dark:hover:bg-[#1A402D]/40 flex items-center justify-between text-left transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl bg-[#E8EDE9] dark:bg-[#202824] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-base flex-shrink-0">
                  🏠
                </div>
                <div>
                  <div class="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[#0F5B38] dark:group-hover:text-[#7CDCA0]">添加出租房源</div>
                  <div class="text-[11px] text-neutral-400 mt-0.5">支持月付/季付/年付，自动算到期日</div>
                </div>
              </div>
              <svg class="w-4 h-4 text-neutral-400 group-hover:text-[#0F5B38] transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button onclick="openUploadAttachmentModal()" class="w-full p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/50 dark:hover:bg-[#1A402D]/40 flex items-center justify-between text-left transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl bg-[#E8EDE9] dark:bg-[#202824] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-base flex-shrink-0">
                  📎
                </div>
                <div>
                  <div class="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[#0F5B38] dark:group-hover:text-[#7CDCA0]">上传照片/合同文件</div>
                  <div class="text-[11px] text-neutral-400 mt-0.5">支持本地 D1、WebDAV 云盘与 S3 对象存储</div>
                </div>
              </div>
              <svg class="w-4 h-4 text-neutral-400 group-hover:text-[#0F5B38] transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

      </div>

      <!-- 最近记账记录 (概览下方速览) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">最近记账记录</h2>
          <button onclick="switchTab('payments')" class="text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0] hover:underline">查看全部记账 →</button>
        </div>
        <div id="recentPaymentsList" class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 divide-y divide-[#E8EDE9] dark:divide-[#26312B]/60 overflow-hidden shadow-sm">
          <div class="p-8 text-center text-xs text-neutral-400">正在拉取数据...</div>
        </div>
      </div>

    </section>

    <!-- ==================== TAB 2: 房源/租客列表 (支持即时搜索+筛选芯片+一键续约+退租结清) ==================== -->
    <section id="tab-leases" class="tab-content hidden space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-extrabold tracking-tight">房源与租客管理</h2>
          <p class="text-xs text-neutral-400 mt-0.5">房源信息、在租状态、水电表底数及合同文件</p>
        </div>
        <button onclick="openAddLeaseModal()" class="m3-pill px-5 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 flex items-center justify-center gap-1.5 self-start sm:self-auto">
          <span>+</span> 添加房源
        </button>
      </div>

      <!-- Android 16 搜索与状态筛选芯片条 -->
      <div class="m3-card p-4 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm space-y-3">
        <!-- 搜索输入框 -->
        <div class="relative">
          <input type="text" id="leaseSearchInput" placeholder="🔍 搜索房源名称、地址、租客姓名或手机号..." oninput="filterLeases()" class="m3-input w-full text-xs pl-10 pr-4 py-2.5">
          <svg class="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Android 16 过滤芯片 (Chips) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button onclick="setLeaseFilter('ALL')" id="leaseChip_ALL" class="lease-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]">
            全部 (<span id="countLeasesAll">0</span>)
          </button>
          <button onclick="setLeaseFilter('PAY_OVERDUE')" id="leaseChip_PAY_OVERDUE" class="lease-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-rose-700 dark:bg-[#161D1A] dark:text-rose-300">
            🔴 欠租待收 (<span id="countLeasesPayOverdue">0</span>)
          </button>
          <button onclick="setLeaseFilter('ACTIVE')" id="leaseChip_ACTIVE" class="lease-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            ● 正常在租 (<span id="countLeasesActive">0</span>)
          </button>
          <button onclick="setLeaseFilter('OVERDUE')" id="leaseChip_OVERDUE" class="lease-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            ⚠️ 逾期待续 (<span id="countLeasesOverdue">0</span>)
          </button>
          <button onclick="setLeaseFilter('TERMINATED')" id="leaseChip_TERMINATED" class="lease-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            ○ 已退租结清 (<span id="countLeasesTerminated">0</span>)
          </button>
        </div>
      </div>

      <!-- 房源卡片瀑布网格 -->
      <div id="leasesContainer" class="grid grid-cols-1 md:grid-cols-2 gap-5"></div>
    </section>

    <!-- ==================== TAB 3: 收租与水电记账明细 (支持分类过滤+即时搜索) ==================== -->
    <section id="tab-payments" class="tab-content hidden space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-extrabold tracking-tight">收租与水电台账</h2>
          <p class="text-xs text-neutral-400 mt-0.5">房租收取明细、水电抄表与各项收支明细</p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button onclick="exportPaymentsToCsv()" class="m3-pill px-3.5 py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:bg-[#D7DED9] dark:hover:bg-[#26312B] text-neutral-700 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors" title="导出当前记账台账为 Excel 兼容 CSV 表格">
            <span>📥</span> 导出 CSV
          </button>
          <button onclick="quickCollectRent()" class="m3-pill px-4 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 flex items-center justify-center gap-1.5">
            <span>⚡</span> 记收房租
          </button>
          <button onclick="openUtilityModal()" class="m3-pill px-4 py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] text-[#0F5B38] dark:text-[#7CDCA0] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90">
            <span>⚡</span> 记水电杂费
          </button>
        </div>
      </div>

      <!-- 账单筛选与统计 -->
      <div class="m3-card p-4 bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 shadow-sm space-y-3">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- 搜索 -->
          <div class="relative flex-1">
            <input type="text" id="paymentSearchInput" placeholder="🔍 搜索房屋名称、租客或账单备注..." oninput="filterPayments()" class="m3-input w-full text-xs pl-10 pr-4 py-2.5">
            <svg class="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <!-- 月份选择器 -->
          <div class="flex-shrink-0">
            <select id="paymentMonthFilter" onchange="filterPayments()" class="m3-input text-xs font-bold py-2.5 px-3 w-full sm:w-auto">
              <option value="ALL">🗓️ 全部月份</option>
            </select>
          </div>
          <!-- 过滤总计展示 -->
          <div class="flex items-center gap-2 px-3.5 py-2 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] text-xs font-semibold self-stretch justify-between sm:justify-start">
            <span class="text-neutral-400">当前筛选：</span>
            <span id="filteredPaymentsSum" class="text-sm font-extrabold font-mono text-[#0F5B38] dark:text-[#7CDCA0]">¥ 0.00</span>
          </div>
        </div>

        <!-- Android 16 类型分类芯片 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button onclick="setPaymentTypeFilter('ALL')" id="payChip_ALL" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]">
            全部记录
          </button>
          <button onclick="setPaymentTypeFilter('UNPAID')" id="payChip_UNPAID" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-rose-700 dark:bg-[#161D1A] dark:text-rose-300">
            🔴 待收欠款 (<span id="countPaymentsUnpaid">0</span>)
          </button>
          <button onclick="setPaymentTypeFilter('RENT')" id="payChip_RENT" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            🏠 房租
          </button>
          <button onclick="setPaymentTypeFilter('ELECTRICITY')" id="payChip_ELECTRICITY" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            ⚡ 电费
          </button>
          <button onclick="setPaymentTypeFilter('WATER')" id="payChip_WATER" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            💧 水费
          </button>
          <button onclick="setPaymentTypeFilter('DEPOSIT')" id="payChip_DEPOSIT" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            🛡️ 押金
          </button>
          <button onclick="setPaymentTypeFilter('OTHER')" id="payChip_OTHER" class="pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
            📦 其他
          </button>
        </div>
      </div>

      <!-- 账单列表容器 -->
      <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 overflow-hidden shadow-sm">
        <div id="allPaymentsTable" class="divide-y divide-[#E8EDE9] dark:divide-[#26312B]/60"></div>
      </div>
    </section>

    <!-- ==================== TAB 4: 文件中心 (多渠道加密存储) ==================== -->
    <section id="tab-receipts" class="tab-content hidden space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-extrabold tracking-tight">文件与单据中心</h2>
          <p class="text-xs text-neutral-400 mt-0.5">租房合同、转账截图、验房单、电表照片等文件；支持查看本地 D1、WebDAV 网盘与 S3 对象存储</p>
        </div>
        <button onclick="openUploadAttachmentModal()" class="m3-pill px-5 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 flex items-center justify-center gap-1.5 self-start sm:self-auto">
          <span>+</span> 上传文件
        </button>
      </div>

      <!-- 存储来源与分类筛选栏 -->
      <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-4 space-y-3 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- 筛选芯片 -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs" id="attachmentFilterChips">
            <button onclick="filterAttachmentsBySource('ALL')" id="attFilter_ALL" class="att-filter-chip m3-pill px-3 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] transition-all">全部 (<span id="attCount_ALL">0</span>)</button>
            <button onclick="filterAttachmentsBySource('D1_LOCAL')" id="attFilter_D1_LOCAL" class="att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all">💾 本地 D1 (<span id="attCount_D1">0</span>)</button>
            <button onclick="filterAttachmentsBySource('WEBDAV')" id="attFilter_WEBDAV" class="att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all">☁️ WebDAV 网盘 (<span id="attCount_WEBDAV">0</span>)</button>
            <button onclick="filterAttachmentsBySource('S3')" id="attFilter_S3" class="att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all">🪣 S3 存储 (<span id="attCount_S3">0</span>)</button>
            <button onclick="filterAttachmentsBySource('LEASE')" id="attFilter_LEASE" class="att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all">🏠 房源文件 (<span id="attCount_LEASE">0</span>)</button>
            <button onclick="filterAttachmentsBySource('PAYMENT')" id="attFilter_PAYMENT" class="att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all">💳 记账凭单 (<span id="attCount_PAYMENT">0</span>)</button>
          </div>
          <!-- 文件名称实时搜索框 -->
          <div class="relative w-full sm:w-64 flex-shrink-0">
            <input type="text" id="attSearchInput" oninput="renderFilteredAttachments()" placeholder="搜索文件名称 / 房源..." class="m3-input w-full text-xs pl-8 py-2">
            <span class="absolute left-2.5 top-2.5 text-neutral-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      <div id="attachmentsGallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
    </section>

    <!-- ==================== TAB 5: 系统设置 & 云端存储 ==================== -->
    <!-- ==================== TAB 5: 系统设置中心 (SaaS 经典双栏布局) ==================== -->
    <section id="tab-settings" class="tab-content hidden space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
        <div>
          <h2 class="text-xl font-extrabold tracking-tight">系统设置中心</h2>
          <p class="text-xs text-neutral-400 mt-0.5">多通道存储备份、邮件待收提醒、账号安全验证与 SQLite 数据透视</p>
        </div>
      </div>

      <!-- 双栏栅格容器 -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        <!-- 左侧分类导航 (Desktop: 3 列吸顶，移动端: 横向滚动标签条) -->
        <aside class="md:col-span-3">
          <nav class="flex md:flex-col gap-1.5 p-1.5 bg-[#E8EDE9]/60 dark:bg-[#161D1A]/70 rounded-2xl border border-[#D7DED9]/60 dark:border-[#26312B]/60 sticky top-20 overflow-x-auto">
            <button type="button" onclick="switchSettingsSection('storage')" id="setNav_storage" class="settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all whitespace-nowrap bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] shadow-sm">
              <span class="text-base">📁</span>
              <span class="flex-1">存储与备份</span>
            </button>
            <button type="button" onclick="switchSettingsSection('notifications')" id="setNav_notifications" class="settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-neutral-700 dark:text-neutral-300 hover:bg-[#D7DED9]/60 dark:hover:bg-[#202923]">
              <span class="text-base">📧</span>
              <span class="flex-1">待收邮件提醒</span>
            </button>
            <button type="button" onclick="switchSettingsSection('security')" id="setNav_security" class="settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-neutral-700 dark:text-neutral-300 hover:bg-[#D7DED9]/60 dark:hover:bg-[#202923]">
              <span class="text-base">🛡️</span>
              <span class="flex-1">账号与安全</span>
            </button>
            <button type="button" onclick="switchSettingsSection('database')" id="setNav_database" class="settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-neutral-700 dark:text-neutral-300 hover:bg-[#D7DED9]/60 dark:hover:bg-[#202923]">
              <span class="text-base">📊</span>
              <span class="flex-1">数据库透视</span>
            </button>
            <button type="button" onclick="switchSettingsSection('reset')" id="setNav_reset" class="settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40">
              <span class="text-base">🧹</span>
              <span class="flex-1">数据重置自测</span>
            </button>
          </nav>
        </aside>

        <!-- 右侧分类内容区域 (Desktop: 9 列) -->
        <div class="md:col-span-9 space-y-4">
          
          <!-- ==================== 栏目 1: 存储与备份 ==================== -->
          <div id="setSection_storage" class="settings-section space-y-4">
            <!-- 全局文件存储与云端异地备份卡片 -->
            <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 md:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span>📁 文件存储渠道与异地备份</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold">本地基石 + 云端二选一</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">本地 SQLite 数据库为底层基础存储，始终保存；云端异地备份支持 WebDAV 与 S3 二选一</p>
                </div>
                <button onclick="saveDefaultStorageSetting()" id="saveDefaultStorageBtn" class="m3-pill px-4 py-2 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm">
                  保存存储模式
                </button>
              </div>

              <!-- 1. 本地存储 (常驻基石 · 无法取消) -->
              <div class="p-3.5 rounded-2xl bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#0F5B38]/10 dark:bg-[#7CDCA0]/10 text-[#0F5B38] dark:text-[#7CDCA0] flex items-center justify-center font-bold text-base flex-shrink-0">
                    💾
                  </div>
                  <div>
                    <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                      <span>本地 D1 数据库存储</span>
                      <span class="text-[10px] px-2 py-0.2 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold">系统基础 · 默认保存</span>
                    </div>
                    <div class="text-[11px] text-neutral-400 mt-0.5">合同原件与记账单据端到端加密保存在本地 SQLite 数据库中，始终保存无法取消</div>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-[11px] font-bold text-[#0F5B38] dark:text-[#7CDCA0] px-3 py-1.5 rounded-full bg-[#0F5B38]/10 dark:bg-[#7CDCA0]/10 cursor-not-allowed select-none flex-shrink-0" title="系统基础存储，永久启用无法取消">
                  <span>✓ 始终保存</span>
                </div>
              </div>

              <!-- 2. 云端异地备份通道 (二选一 / 可关闭) -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-neutral-700 dark:text-neutral-300 px-1">
                    云端异地备份通道 (二选一)
                  </label>
                  <span class="text-[11px] text-neutral-400">选择后在下方展开配置服务</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <!-- 选项 A: 关 / 不开启云备份 -->
                  <label class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:border-[#0F5B38] transition-all">
                    <input type="radio" name="cloudBackupProvider" id="cloudBackup_none" value="NONE" checked onchange="toggleCloudBackupUI('NONE')" class="accent-[#0F5B38] mt-0.5">
                    <div>
                      <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100">🚫 不开启云备份</div>
                      <div class="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">仅保存在本地 D1 数据库，不占用任何外部网盘或对象存储</div>
                    </div>
                  </label>

                  <!-- 选项 B: WebDAV / 网盘 -->
                  <label class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:border-[#0F5B38] transition-all">
                    <input type="radio" name="cloudBackupProvider" id="cloudBackup_webdav" value="WEBDAV" onchange="toggleCloudBackupUI('WEBDAV')" class="accent-[#0F5B38] mt-0.5">
                    <div>
                      <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>☁️ WebDAV / 网盘</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">国内网盘</span>
                      </div>
                      <div class="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">坚果云直连，或经 AList 备份至阿里云盘、百度网盘、天翼云</div>
                    </div>
                  </label>

                  <!-- 选项 C: S3 兼容对象存储 -->
                  <label class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:border-[#0F5B38] transition-all">
                    <input type="radio" name="cloudBackupProvider" id="cloudBackup_s3" value="S3" onchange="toggleCloudBackupUI('S3')" class="accent-[#0F5B38] mt-0.5">
                    <div>
                      <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>🪣 S3 兼容对象存储</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">高可用</span>
                      </div>
                      <div class="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">阿里云 OSS、腾讯云 COS、Cloudflare R2、自建 MinIO</div>
                    </div>
                  </label>
                </div>
              </div>

              <div id="defaultStorageFeedback" class="text-xs font-semibold px-1"></div>
            </div>

            <!-- S3 兼容对象存储配置卡片 (按需展开) -->
            <div id="s3ConfigCard" class="hidden m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 md:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-2 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span>🪣 S3 兼容对象存储 (阿里云 OSS / 腾讯云 COS / R2 / MinIO)</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">零 SDK 依赖</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">原生 WebCrypto 实现 AWS SigV4 认证，支持国内主流云厂商与自建 MinIO 异地容灾</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">对象存储服务地址 (Endpoint)</label>
                  <input type="text" id="s3Endpoint" placeholder="例如 https://oss-cn-hangzhou.aliyuncs.com 或 https://cos.ap-guangzhou.myqcloud.com" class="m3-input w-full text-sm font-mono">
                  <div class="flex items-center flex-wrap gap-2.5 mt-2 px-1">
                    <span class="text-[11px] text-neutral-400">快速填入预设：</span>
                    <button type="button" onclick="fillS3Preset('aliyun')" class="text-[11px] text-orange-600 dark:text-orange-400 font-bold hover:underline">阿里云 OSS</button>
                    <button type="button" onclick="fillS3Preset('tencent')" class="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline">腾讯云 COS</button>
                    <button type="button" onclick="fillS3Preset('r2')" class="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline">Cloudflare R2</button>
                    <button type="button" onclick="fillS3Preset('qiniu')" class="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline">七牛云 Kodo</button>
                    <button type="button" onclick="fillS3Preset('minio')" class="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline">自建 MinIO</button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">存储桶名称 (Bucket Name)</label>
                  <input type="text" id="s3Bucket" placeholder="填入 Bucket 名称" class="m3-input w-full text-sm font-mono">
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">地域标识 (Region)</label>
                  <input type="text" id="s3Region" placeholder="例如 cn-hangzhou, ap-guangzhou, auto" class="m3-input w-full text-sm font-mono">
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">AccessKey ID</label>
                  <input type="text" id="s3AccessKey" placeholder="对象存储访问密钥 ID" class="m3-input w-full text-sm font-mono">
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">Secret Access Key</label>
                  <input type="password" id="s3SecretKey" placeholder="修改时填入，留空不修改" class="m3-input w-full text-sm font-mono">
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">存储根目录前缀 (Base Path)</label>
                  <input type="text" id="s3BasePath" placeholder="例如 RentHubFiles (留空存根目录)" class="m3-input w-full text-sm font-mono">
                </div>
              </div>

              <div class="pt-4 border-t border-[#E8EDE9] dark:border-[#26312B]/60 flex flex-col sm:flex-row items-center gap-3">
                <button type="button" onclick="testS3()" id="testS3Btn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-bold transition-all">
                  测试 S3 连通性
                </button>
                <button type="button" onclick="saveS3()" id="saveS3Btn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm transition-all">
                  保存 S3 配置
                </button>
                <span id="s3Feedback" class="text-xs font-semibold px-2"></span>
              </div>
            </div>

            <!-- WebDAV 云盘挂载配置 (按需展开) -->
            <div id="webdavConfigCard" class="hidden m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 md:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-2 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span>☁️ WebDAV 云盘存储 (坚果云 / AList 挂载阿里云盘·百度网盘 / 123云盘)</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">网盘利器</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">支持坚果云直连；配合 AList 更可无感对接阿里云盘、百度网盘、天翼云、夸克等各种国内网盘</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">WebDAV 服务器地址 (Endpoint)</label>
                  <input type="text" id="webdavEndpoint" placeholder="例如 https://dav.jianguoyun.com/dav/ 或 http://your-alist-host:5244/dav/" class="m3-input w-full text-sm font-mono">
                  <div class="flex items-center flex-wrap gap-2.5 mt-2 px-1">
                    <span class="text-[11px] text-neutral-400">快速填入预设：</span>
                    <button type="button" onclick="fillPreset('jianguoyun')" class="text-[11px] text-[#0F5B38] dark:text-[#7CDCA0] font-bold hover:underline">坚果云预设</button>
                    <button type="button" onclick="fillPreset('alist')" class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">AList 网盘预设 (挂载阿里云盘/百度网盘)</button>
                    <button type="button" onclick="fillPreset('123pan')" class="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline">123 云盘预设</button>
                    <button type="button" onclick="fillPreset('openlist')" class="text-[11px] text-neutral-500 font-bold hover:underline">OpenList 预设</button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">用户名 / 账号</label>
                  <input type="text" id="webdavUsername" placeholder="坚果云注册邮箱或网盘用户名" class="m3-input w-full text-sm">
                </div>

                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">应用专用密码</label>
                  <input type="password" id="webdavPassword" placeholder="修改时填入，留空不修改" class="m3-input w-full text-sm">
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">远端基础目录 (Base Path)</label>
                  <input type="text" id="webdavBasePath" placeholder="例如 /RentRecords (留空存根目录)" class="m3-input w-full text-sm font-mono">
                </div>
              </div>

              <div class="pt-4 border-t border-[#E8EDE9] dark:border-[#26312B]/60 flex flex-col sm:flex-row items-center gap-3">
                <button type="button" onclick="testWebdav()" id="testWebdavBtn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-bold transition-all">
                  测试连通性
                </button>
                <button type="button" onclick="saveWebdav()" id="saveWebdavBtn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm transition-all">
                  保存 WebDAV 配置
                </button>
                <span id="webdavFeedback" class="text-xs font-semibold px-2"></span>
              </div>
            </div>
          </div>

          <!-- ==================== 栏目 2: 待收邮件提醒 ==================== -->
          <div id="setSection_notifications" class="settings-section hidden space-y-4">
            <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 md:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span>📧 待收提醒与邮箱设置</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold">定时自动提醒</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">支持交租提前发信提醒房东、水电欠费提醒，不错过任何应收账目</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="triggerNotificationCheck()" class="m3-pill px-3.5 py-1.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-semibold flex items-center gap-1">
                    ⚡ 立即检查待收账单
                  </button>
                </div>
              </div>

              <!-- 发信渠道选择器 (Resend API vs 自定义 SMTP) -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-neutral-700 dark:text-neutral-300 px-1">发信服务通道</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label class="flex items-start gap-2.5 p-3 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:border-[#0F5B38] transition-all">
                    <input type="radio" name="notifyMailProvider" id="mailProvider_resend" value="resend" onchange="toggleMailProviderUI('resend')" class="accent-[#0F5B38] mt-0.5">
                    <div>
                      <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>⚡ Resend API</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] font-bold">推荐 · 零配置端口</span>
                      </div>
                      <div class="text-[11px] text-neutral-400 mt-0.5">现代 HTTP REST 发信，无需配置 SMTP 端口与授权码</div>
                    </div>
                  </label>
                  <label class="flex items-start gap-2.5 p-3 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:border-[#0F5B38] transition-all">
                    <input type="radio" name="notifyMailProvider" id="mailProvider_smtp" value="smtp" checked onchange="toggleMailProviderUI('smtp')" class="accent-[#0F5B38] mt-0.5">
                    <div>
                      <div class="text-xs font-bold text-neutral-800 dark:text-neutral-100">📧 自定义 SMTP</div>
                      <div class="text-[11px] text-neutral-400 mt-0.5">支持 QQ / 163 / 谷歌 Gmail / 腾讯网易企业邮</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- 渠道 1: Resend API 配置卡片 -->
              <div id="resendConfigSection" class="hidden space-y-3.5 p-4 m3-subcard bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 border border-[#D7DED9]/50 dark:border-[#26312B]/60">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">⚡ Resend 密钥与发件人</span>
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-[#0F5B38] dark:text-[#7CDCA0] hover:underline flex items-center gap-0.5">获取 Resend API Key ↗</a>
                </div>
                <div>
                  <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1 px-1">Resend API Key</label>
                  <input type="password" id="notifyResendApiKey" placeholder="填入 Resend API Key (以 re_ 开头)" class="m3-input w-full text-xs font-mono">
                  <span class="text-[10px] text-neutral-400 mt-1 block px-1">在 resend.com 控制台免费申请（例如 <code>re_123456789...</code>）</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1 px-1">发件人邮箱 (From Email)</label>
                    <input type="text" id="notifyResendFromEmail" placeholder="例如 onboarding@resend.dev 或已验证域名邮箱" class="m3-input w-full text-xs font-mono">
                    <span class="text-[10px] text-neutral-400 mt-1 block px-1">测试期可直接填入 <code>onboarding@resend.dev</code></span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1 px-1">发件人显示名称 (From Name)</label>
                    <input type="text" id="notifyResendFromName" placeholder="例如 房东管家" class="m3-input w-full text-xs font-bold">
                  </div>
                </div>
              </div>

              <!-- 渠道 2: SMTP 发信服务配置 (完整配置项与主流邮箱一键预设) -->
              <div id="smtpConfigSection" class="space-y-4">
                <!-- 主流邮箱快捷预设芯片 -->
                <div class="p-3.5 m3-subcard bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-neutral-700 dark:text-neutral-200">⚡ 一键填入主流邮箱设置：</label>
                    <span class="text-[11px] text-neutral-400">点击自动填入主机与端口</span>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <button type="button" onclick="applySettingsSmtpPreset('qq')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">QQ 邮箱 (465 SSL)</button>
                    <button type="button" onclick="applySettingsSmtpPreset('163')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">163 网易邮箱 (465 SSL)</button>
                    <button type="button" onclick="applySettingsSmtpPreset('126')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">126 邮箱 (465 SSL)</button>
                    <button type="button" onclick="applySettingsSmtpPreset('foxmail')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">腾讯企业邮 / Foxmail</button>
                    <button type="button" onclick="applySettingsSmtpPreset('qiye163')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">网易企业邮</button>
                    <button type="button" onclick="applySettingsSmtpPreset('gmail')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">Gmail</button>
                    <button type="button" onclick="applySettingsSmtpPreset('outlook')" class="px-3 py-1.5 rounded-full bg-[#E8EDE9] dark:bg-[#242C27] hover:bg-[#DFE5E0] text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors">Outlook (587)</button>
                  </div>
                </div>

                <!-- SMTP Host, Port, Secure -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">SMTP 服务器主机地址 (Host)</label>
                    <input type="text" id="notifySmtpHost" placeholder="例如 smtp.qq.com 或 smtp.163.com" class="m3-input w-full text-xs font-mono">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">端口 (Port)</label>
                    <input type="number" id="notifySmtpPort" placeholder="465 或 587" class="m3-input w-full text-xs font-mono font-bold">
                  </div>
                </div>

                <!-- SSL/TLS 开关 -->
                <div class="flex items-center justify-between px-1">
                  <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-700 dark:text-neutral-300">
                    <input type="checkbox" id="notifySmtpSecure" checked class="w-4 h-4 rounded text-[#0F5B38] accent-[#0F5B38]">
                    <span>启用 SSL/TLS 安全协议 (端口 465 推荐开启；端口 587 STARTTLS 请关闭)</span>
                  </label>
                </div>

                <!-- User, Pass -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">SMTP 账号 / 发信邮箱</label>
                    <input type="text" id="notifySmtpUser" placeholder="例如 your-email@qq.com" class="m3-input w-full text-xs font-mono">
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1.5 px-1">
                      <label class="text-xs font-bold text-neutral-600 dark:text-neutral-400">发信授权码 / 密码</label>
                      <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">QQ/网易请填专有授权码</span>
                    </div>
                    <input type="password" id="notifySmtpPass" placeholder="修改时填入授权码，留空不修改" class="m3-input w-full text-xs font-mono">
                  </div>
                </div>

                <!-- From Name, From Email -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">发信人显示名称</label>
                    <input type="text" id="notifySmtpFromName" placeholder="例如 房东管家" class="m3-input w-full text-xs font-bold">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">发信人地址 (若空默认同账号)</label>
                    <input type="email" id="notifySmtpFromEmail" placeholder="例如 your-email@qq.com (留空同账号)" class="m3-input w-full text-xs font-mono">
                  </div>
                </div>
              </div>

              <!-- 接收邮箱 (双渠道通用) -->
              <div class="p-3.5 m3-subcard bg-[#E8EDE9]/50 dark:bg-[#161D1A]/60 border border-[#D7DED9]/60 dark:border-[#26312B]/60">
                <label class="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5 px-1">📬 房东接收提醒邮箱 (双渠道通用)</label>
                <input type="email" id="notifyRecipientEmail" placeholder="如 owner@domain.com (接收催租、水电欠费与数据库冷备)" class="m3-input w-full text-xs font-mono font-bold">
              </div>

              <!-- 触发时机与规则 -->
              <div class="p-4 m3-subcard bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 space-y-3">
                <span class="text-xs font-bold block text-neutral-700 dark:text-neutral-200">⏰ 提醒策略与发送时间</span>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label class="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">提前几天提醒 (逗号分隔天数)</label>
                    <input type="text" id="notifyDaysBefore" placeholder="7,3,1" class="m3-input w-full text-xs font-mono font-bold">
                    <div class="flex items-center gap-1.5 mt-1.5">
                      <span class="text-[10px] text-neutral-400">快捷:</span>
                      <button type="button" onclick="setNotifyDaysPreset('3,1')" class="text-[10px] text-[#0F5B38] dark:text-[#7CDCA0] font-bold underline">3天+1天</button>
                      <button type="button" onclick="setNotifyDaysPreset('7,3,1')" class="text-[10px] text-[#0F5B38] dark:text-[#7CDCA0] font-bold underline">7+3+1天</button>
                      <button type="button" onclick="setNotifyDaysPreset('5')" class="text-[10px] text-[#0F5B38] dark:text-[#7CDCA0] font-bold underline">提前5天</button>
                    </div>
                  </div>
                  <div class="flex flex-col justify-center">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 dark:text-neutral-300">
                      <input type="checkbox" id="notifyOnDueDay" class="w-4 h-4 rounded text-[#0F5B38] accent-[#0F5B38]">
                      <span>到期当天发信提醒</span>
                    </label>
                    <p class="text-[10px] text-neutral-400 mt-1">交租日当天早上 09:00 发送提醒邮件</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 dark:text-neutral-300">
                      <input type="checkbox" id="notifyOnOverdue" class="w-4 h-4 rounded text-[#0F5B38] accent-[#0F5B38]">
                      <span>超期未收房租每日提醒</span>
                    </label>
                    <p class="text-[10px] text-neutral-400 mt-1">有逾期未结清账单时每日发送提醒</p>
                  </div>
                </div>
                <div class="text-[11px] text-neutral-400 pt-1 border-t border-[#D7DED9]/60 dark:border-[#26312B]/60 flex items-center gap-2">
                  <span>⏱️ 定时检查规则：</span>
                  <span class="font-mono font-bold text-neutral-600 dark:text-neutral-300">每天早上 09:00 自动检查待收房租并给房东发邮件</span>
                </div>
              </div>

              <!-- 自定义通知模板配置 (中文语境) -->
              <div class="p-4 m3-subcard bg-[#E8EDE9]/40 dark:bg-[#161D1A]/60 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-neutral-700 dark:text-neutral-200">📝 提醒邮件通知内容</span>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="switchTemplateTab('rent')" id="tplTab_rent" class="tpl-tab-btn m3-pill px-3 py-1 text-xs font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]">
                      🏠 待收房租提醒
                    </button>
                    <button type="button" onclick="switchTemplateTab('utility')" id="tplTab_utility" class="tpl-tab-btn m3-pill px-3 py-1 text-xs font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300">
                      ⚡ 水电待收提醒
                    </button>
                  </div>
                </div>

                <!-- 房租模板编辑区域 -->
                <div id="tplBoxRent" class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">邮件标题</label>
                    <input type="text" id="notifyTemplateRentTitle" class="m3-input w-full text-xs font-semibold">
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-bold text-neutral-600 dark:text-neutral-400">邮件 HTML 正文</label>
                      <div class="flex items-center gap-1 flex-wrap text-[10px]">
                        <span class="text-neutral-400">Variables:</span>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{property_title}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{property_title}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{tenant_name}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{tenant_name}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{rent_amount}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{rent_amount}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{due_date}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{due_date}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{status_desc}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{status_desc}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{lease_period}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{lease_period}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateRentBody', '{{address}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{address}}</button>
                      </div>
                    </div>
                    <textarea id="notifyTemplateRentBody" rows="7" class="m3-input w-full text-xs font-mono" oninput="updateTemplatePreview()"></textarea>
                  </div>
                </div>

                <!-- 水电模板编辑区域 -->
                <div id="tplBoxUtility" class="hidden space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">邮件标题</label>
                    <input type="text" id="notifyTemplateUtilityTitle" class="m3-input w-full text-xs font-semibold">
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-bold text-neutral-600 dark:text-neutral-400">邮件 HTML 正文</label>
                      <div class="flex items-center gap-1 flex-wrap text-[10px]">
                        <span class="text-neutral-400">Variables:</span>
                        <button type="button" onclick="insertTplVar('notifyTemplateUtilityBody', '{{property_title}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{property_title}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateUtilityBody', '{{tenant_name}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{tenant_name}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateUtilityBody', '{{unpaid_amount}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{unpaid_amount}}</button>
                        <button type="button" onclick="insertTplVar('notifyTemplateUtilityBody', '{{usage_details}}')" class="px-1.5 py-0.5 bg-[#E8EDE9] dark:bg-[#161D1A] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono">{{usage_details}}</button>
                      </div>
                    </div>
                    <textarea id="notifyTemplateUtilityBody" rows="7" class="m3-input w-full text-xs font-mono" oninput="updateTemplatePreview()"></textarea>
                  </div>
                </div>

                <!-- 实时预览框 -->
                <div class="pt-2">
                  <span class="text-[11px] font-bold text-neutral-400 block mb-1">实时效果预览 (带入模拟数据)：</span>
                  <div id="tplPreviewFrame" class="p-3 bg-white dark:bg-[#121614] rounded-2xl border border-[#D7DED9]/60 dark:border-[#26312B]/60 max-h-56 overflow-y-auto text-xs"></div>
                </div>
              </div>

              <div class="pt-4 border-t border-[#E8EDE9] dark:border-[#26312B]/60 flex flex-col sm:flex-row items-center gap-3">
                <button type="button" onclick="sendTestEmail()" id="sendTestEmailBtn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-bold transition-all">
                  ✉️ 发送测试邮件
                </button>
                <button type="button" onclick="saveNotificationSettings()" id="saveNotifyBtn" class="m3-pill w-full sm:w-auto px-5 py-2.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm transition-all">
                  保存提醒设置
                </button>
                <span id="notifyFeedback" class="text-xs font-semibold px-2"></span>
              </div>
            </div>
          </div>

          <!-- ==================== 栏目 3: 账号与安全 ==================== -->
          <div id="setSection_security" class="settings-section hidden space-y-4">
            <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 space-y-4 shadow-sm">
              <h3 class="text-sm font-bold">管理员账号与安全验证</h3>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E8EDE9] dark:border-[#26312B]/60 text-xs gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold">当前登录账号：<span class="text-[#0F5B38] dark:text-[#7CDCA0] font-mono">${username}</span></span>
                    <span id="settings2FABadge" class="text-[10px] px-2.5 py-0.5 rounded-full font-bold">检测中...</span>
                  </div>
                  <p class="text-neutral-400 mt-1">当前设备登录状态正常</p>
                </div>
                <button type="button" onclick="logout()" class="m3-pill px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold transition-all self-start sm:self-auto">
                  退出当前登录
                </button>
              </div>
              
              <!-- 2FA 动态状态控制 -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E8EDE9] dark:border-[#26312B]/60 text-xs gap-3">
                <div>
                  <span class="font-bold">手机二次验证 (动态口令)</span>
                  <p id="settings2FADesc" class="text-neutral-400 mt-0.5">开启后登录需输入手机验证码，提升账号安全性</p>
                </div>
                <div class="flex items-center gap-2" id="settings2FAActionBtns"></div>
              </div>

              <!-- 安全与通知邮箱 -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#E8EDE9] dark:border-[#26312B]/60 text-xs gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold">安全与通知邮箱：<span id="settingsSecurityEmailDisplay" class="text-[#0F5B38] dark:text-[#7CDCA0] font-mono">加载中...</span></span>
                  </div>
                  <p class="text-neutral-400 mt-0.5">用于接收每日交租提醒、水电账单及密码找回</p>
                </div>
                <button type="button" onclick="openUpdateSecurityEmailModal()" class="m3-pill px-4 py-2 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 font-bold transition-all self-start sm:self-auto">
                  查看 / 换绑邮箱
                </button>
              </div>

              <div class="flex items-center justify-between py-2 text-xs">
                <div>
                  <span class="font-bold">修改登录密码</span>
                  <p class="text-neutral-400 mt-0.5">修改当前系统的登录密码</p>
                </div>
                <button type="button" onclick="openChangePasswordModal()" class="m3-pill px-4 py-2 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 font-bold">
                  修改密码
                </button>
              </div>
            </div>
          </div>

          <!-- ==================== 栏目 4: 数据库透视 ==================== -->
          <div id="setSection_database" class="settings-section hidden space-y-4">
            <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-6 space-y-4 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span>🗄️ D1 数据库透视速览</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-400 font-mono">SQLite 边缘直读</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">直接在网页中像 Excel 一样透视查阅底层所有数据表</p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <button type="button" onclick="sendEmailBackup()" id="emailBackupBtn" class="m3-pill px-3.5 py-1.5 bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] hover:opacity-90 text-xs font-bold flex items-center gap-1">
                    📧 发送备份至邮箱
                  </button>
                  <button type="button" onclick="dumpDatabaseJson()" class="m3-pill px-3.5 py-1.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-semibold flex items-center gap-1">
                    📥 导出全量 JSON
                  </button>
                  <button type="button" onclick="inspectDatabaseTable(currentInspectTable)" class="m3-pill px-3.5 py-1.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-90 text-xs font-semibold">
                    🔄 刷新当前表
                  </button>
                </div>
              </div>

              <!-- 数据表切换选项卡 -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button type="button" onclick="inspectDatabaseTable('leases')" id="tab_table_leases" class="inspect-tab-btn m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] transition-all">
                  🏠 房源租约 (leases)
                </button>
                <button type="button" onclick="inspectDatabaseTable('payments')" id="tab_table_payments" class="inspect-tab-btn m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 transition-all">
                  💰 记账明细 (payments)
                </button>
                <button type="button" onclick="inspectDatabaseTable('attachments')" id="tab_table_attachments" class="inspect-tab-btn m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 transition-all">
                  📎 单据文件 (attachments)
                </button>
                <button type="button" onclick="inspectDatabaseTable('users')" id="tab_table_users" class="inspect-tab-btn m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 transition-all">
                  👤 管理账号 (users)
                </button>
                <button type="button" onclick="inspectDatabaseTable('system_settings')" id="tab_table_system_settings" class="inspect-tab-btn m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 transition-all">
                  ⚙️ 系统配置 (system_settings)
                </button>
              </div>

              <!-- 表格实时渲染区 -->
              <div class="overflow-x-auto border border-[#D7DED9]/60 dark:border-[#26312B]/60 rounded-2xl max-h-96">
                <div id="dbInspectLoading" class="hidden p-8 text-center text-xs text-neutral-400">正在实时查询 D1 数据库...</div>
                <table id="dbInspectTable" class="w-full text-left text-xs font-mono border-collapse">
                  <thead id="dbInspectThead" class="bg-[#E8EDE9]/60 dark:bg-[#161D1A] text-neutral-500 uppercase tracking-wider text-[10px] border-b border-[#D7DED9]/60 dark:border-[#26312B]/60 sticky top-0"></thead>
                  <tbody id="dbInspectTbody" class="divide-y divide-[#E8EDE9]/60 dark:divide-[#26312B]/60"></tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ==================== 栏目 5: 数据重置与测试 ==================== -->
          <div id="setSection_reset" class="settings-section hidden space-y-4">
            <div class="m3-card bg-white dark:bg-[#1A211D] border border-rose-200/80 dark:border-rose-900/60 p-6 md:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950">
                <div>
                  <h3 class="text-sm font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <span>🧹 测试数据重置与清理</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">初装自测专用</span>
                  </h3>
                  <p class="text-xs text-neutral-400 mt-0.5">清空本地全部房源、记账、单据附件及当前管理员，将系统重置到全新未安装状态</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 leading-relaxed space-y-2">
                <p><strong>💡 功能说明：</strong>如果您想重新跑一遍完整的系统初装初始化流程（设置账号、配置邮箱、绑定手机 TOTP 二次验证），点击下方按钮即可一键重置。</p>
                <p class="text-[11px] text-rose-600 dark:text-rose-400">⚠️ 执行后 payments、leases、attachments、users 表数据将全部清空，页面将直接刷新并跳转至系统初装向导页。</p>
              </div>

              <div class="pt-2 flex items-center gap-3">
                <button type="button" onclick="confirmResetSystem()" id="btnResetSystem" class="m3-pill px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2">
                  <span>🧹 一键清空系统并重置 (进入初装向导)</span>
                </button>
                <span id="resetSystemFeedback" class="text-xs font-semibold"></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

  </main>

  <!-- ==================== Android 16 浮动扩展操作按钮 (Extended FAB) ==================== -->
  <div class="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-30">
    <button onclick="openFabMenuModal()" class="m3-pill px-5 py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-xl shadow-[#0F5B38]/25 flex items-center gap-2 hover:scale-105 transition-all">
      <span class="text-base leading-none">⚡</span>
      <span>快捷功能</span>
    </button>
  </div>

  <!-- ==================== Android 16 悬浮胶囊底栏 (移动端) ==================== -->
  <nav class="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 dark:bg-[#1A211D]/95 border border-[#D7DED9]/70 dark:border-[#26312B]/80 rounded-full p-2 flex items-center justify-around shadow-2xl">
    <button onclick="switchTab('dashboard')" class="mobile-nav-btn px-3 py-1.5 rounded-full flex flex-col items-center transition-all text-[#0F5B38] dark:text-[#7CDCA0]" data-tab="dashboard">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
      <span class="text-[10px] font-bold mt-0.5">概览</span>
    </button>
    <button onclick="switchTab('leases')" class="mobile-nav-btn px-3 py-1.5 rounded-full flex flex-col items-center transition-all text-neutral-400" data-tab="leases">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
      <span class="text-[10px] font-medium mt-0.5">房源</span>
    </button>
    <button onclick="switchTab('payments')" class="mobile-nav-btn px-3 py-1.5 rounded-full flex flex-col items-center transition-all text-neutral-400" data-tab="payments">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">台账</span>
    </button>
    <button onclick="switchTab('receipts')" class="mobile-nav-btn px-3 py-1.5 rounded-full flex flex-col items-center transition-all text-neutral-400" data-tab="receipts">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">文件</span>
    </button>
    <button onclick="switchTab('settings')" class="mobile-nav-btn px-3 py-1.5 rounded-full flex flex-col items-center transition-all text-neutral-400" data-tab="settings">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">设置</span>
    </button>
  </nav>

  <!-- ==================== 弹窗：快捷事务 FAB 菜单 (Android 16 Bottom Sheet) ==================== -->
  <div id="fabMenuModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-0 sm:p-4" onclick="closeModal('fabMenuModal')">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-md rounded-t-[36px] sm:rounded-[36px] p-6 space-y-4 shadow-2xl" onclick="event.stopPropagation()">
      <!-- 顶部拖拽手柄 -->
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      
      <div class="flex items-center justify-between pb-1">
        <h3 class="text-base font-extrabold">⚡ 快捷操作</h3>
        <button onclick="closeModal('fabMenuModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-1">
        <button onclick="closeModal('fabMenuModal'); openUtilityModal();" class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/40 flex flex-col items-center text-center gap-2 transition-colors">
          <div class="w-11 h-11 rounded-2xl bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] flex items-center justify-center text-xl font-bold">⚡</div>
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">记一笔水电杂费</span>
          <span class="text-[10px] text-neutral-400">抄表自动算费与滚存</span>
        </button>

        <button onclick="closeModal('fabMenuModal'); openAddLeaseModal();" class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/40 flex flex-col items-center text-center gap-2 transition-colors">
          <div class="w-11 h-11 rounded-2xl bg-[#E8EDE9] dark:bg-[#202824] text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xl font-bold">🏠</div>
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">添加房源</span>
          <span class="text-[10px] text-neutral-400">支持月付/季付/年付</span>
        </button>

        <button onclick="closeModal('fabMenuModal'); openUploadAttachmentModal();" class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/40 flex flex-col items-center text-center gap-2 transition-colors">
          <div class="w-11 h-11 rounded-2xl bg-[#E8EDE9] dark:bg-[#202824] text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xl font-bold">📎</div>
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">上传凭证照片</span>
          <span class="text-[10px] text-neutral-400">本地安全 / 云盘</span>
        </button>

        <button onclick="closeModal('fabMenuModal'); switchTab('leases');" class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/40 flex flex-col items-center text-center gap-2 transition-colors">
          <div class="w-11 h-11 rounded-2xl bg-[#E8EDE9] dark:bg-[#202824] text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xl font-bold">🔄</div>
          <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">租约续约</span>
          <span class="text-[10px] text-neutral-400">一键顺延交租日</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== 弹窗：录入 / 编辑出租房源 (Android 16 M3) ==================== -->
  <div id="leaseModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-2xl sm:max-w-3xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 id="leaseModalTitle" class="text-base font-extrabold">添加出租房源</h3>
        <button onclick="closeModal('leaseModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="editingLeaseId" value="">

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">房屋名称 / 房号 (如：幸福公寓302室)</label>
          <input type="text" id="leaseTitle" placeholder="例如 朝阳区望京SOHO 3-2-501" class="m3-input w-full text-sm font-semibold">
        </div>
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">详细地址 (留空则默认同房屋名称)</label>
          <input type="text" id="leaseAddress" placeholder="北京市朝阳区阜通东大街..." class="m3-input w-full text-sm">
        </div>

        <!-- 承租人信息 -->
        <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-neutral-700 dark:text-neutral-300 mb-1 px-0.5">承租人姓名</label>
            <input type="text" id="leaseTenantName" placeholder="张三" class="m3-input w-full text-xs font-bold">
          </div>
          <div>
            <label class="block font-bold text-neutral-700 dark:text-neutral-300 mb-1 px-0.5">联系手机号</label>
            <input type="text" id="leaseTenantPhone" placeholder="13800000000" class="m3-input w-full text-xs font-mono font-bold">
          </div>
          <div>
            <label class="block font-bold text-neutral-500 dark:text-neutral-400 mb-1 px-0.5">身份证号 / 备忘电话 (选填)</label>
            <input type="text" id="leaseTenantIdCard" placeholder="选填备忘" class="m3-input w-full text-xs">
          </div>
        </div>

        <!-- 起止日期与周期智能推算 -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">起租日期</label>
            <input type="date" id="leaseStartDate" min="2000-01-01" max="2099-12-31" class="m3-input w-full text-xs" onchange="onStartDateOrCycleChange()">
          </div>
          <div>
            <div class="flex items-center justify-between mb-1 px-1 flex-wrap gap-1">
              <label class="font-bold text-neutral-600 dark:text-neutral-300">到期日期</label>
              <div class="flex items-center gap-1">
                <button type="button" onclick="applyPeriodMonths(6)" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold">半年</button>
                <button type="button" onclick="applyPeriodMonths(12)" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold">1年</button>
                <button type="button" onclick="applyPeriodMonths(24)" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold">2年</button>
                <button type="button" onclick="applyPeriodMonths(36)" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold">3年</button>
                <button type="button" onclick="applyPeriodMonths(60)" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold">5年</button>
              </div>
            </div>
            <input type="date" id="leaseEndDate" min="2000-01-01" max="2099-12-31" class="m3-input w-full text-xs" onchange="onEndDateChange()" oninput="onEndDateChange()">
          </div>
        </div>

        <!-- 租金与交租周期 (修改周期时自动校准到期日与下次收租日) -->
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">月租金(元)</label>
            <input type="number" id="leaseRentAmount" placeholder="3000" class="m3-input w-full text-xs font-extrabold text-[#0F5B38] dark:text-[#7CDCA0]">
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">押金(元)</label>
            <input type="number" id="leaseDepositAmount" placeholder="3000" class="m3-input w-full text-xs font-extrabold">
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">交租周期</label>
            <select id="leasePayCycle" onchange="onStartDateOrCycleChange()" class="m3-input w-full text-xs font-bold">
              <option value="1">月付 (1个月)</option>
              <option value="3">季付 (3个月)</option>
              <option value="6">半年付 (6个月)</option>
              <option value="12" selected>年付 (12个月 / 1年)</option>
            </select>
          </div>
        </div>

        <!-- 水电参数绑定 (房源直接设置单价与初始底数) -->
        <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] space-y-2">
          <span class="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-200 block">⚡ 水电单价与起租底数 (抄表时自动带出)</span>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">电费单价 (元/度)</label>
              <input type="number" id="meterElecPrice" value="1.0" step="0.01" class="m3-input w-full text-xs font-mono font-bold">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">水费单价 (元/吨)</label>
              <input type="number" id="meterWaterPrice" value="3.5" step="0.01" class="m3-input w-full text-xs font-mono font-bold">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">起租电表底数 (可自动滚存)</label>
              <input type="number" id="meterElecBase" placeholder="例如 1200" step="0.1" class="m3-input w-full text-xs font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">起租水表底数 (可自动滚存)</label>
              <input type="number" id="meterWaterBase" placeholder="例如 350" step="0.1" class="m3-input w-full text-xs font-mono">
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">租约状态</label>
            <select id="leaseStatus" class="m3-input w-full text-xs font-bold">
              <option value="ACTIVE">● 正常在租</option>
              <option value="TERMINATED">○ 已退租结清</option>
              <option value="EXPIRED">✕ 租约到期</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">下次收租日期</label>
            <input type="date" id="leaseNextPayDate" min="2000-01-01" max="2099-12-31" class="m3-input w-full text-xs font-bold">
            <div class="flex items-center gap-1.5 flex-wrap mt-1.5">
              <button type="button" onclick="calibrateNextPay('END_PLUS_1')" class="text-[10px] text-[#0F5B38] dark:text-[#7CDCA0] bg-[#C4EED0]/60 dark:bg-[#1A402D] px-2 py-0.5 rounded-full font-bold hover:opacity-85" title="以到期日顺延下一年">📅 到期下一年 (+1年)</button>
              <button type="button" onclick="calibrateNextPay('END_EXACT')" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold hover:opacity-85" title="设为合同到期当天">🏁 合同到期日</button>
              <button type="button" onclick="calibrateNextPay('RECENT_CYCLE')" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold hover:opacity-85" title="计算距今最近交租周期">⚡ 最近应收周期</button>
              <button type="button" onclick="calibrateNextPay('START_CYCLE')" class="text-[10px] text-neutral-600 dark:text-neutral-300 bg-[#E8EDE9] dark:bg-[#161D1A] px-2 py-0.5 rounded-full font-bold hover:opacity-85" title="起租日顺延1周期">🌱 起租下周期</button>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">备注备忘 (选填)</label>
          <textarea id="leaseNotes" rows="2" placeholder="家具家电清单、车位号、门禁卡号等备忘..." class="m3-input w-full text-xs"></textarea>
        </div>
      </div>

      <button onclick="submitLease()" id="submitLeaseBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 hover:opacity-95">
        确认保存
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：⚡ 一键收租 (专用于收取房租与周期推算) ==================== -->
  <div id="quickRentModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-xl sm:max-w-2xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <div>
          <h3 id="quickRentTitle" class="text-base font-extrabold flex items-center gap-1.5">
            <span>⚡</span> <span>记录收取房租</span>
          </h3>
          <p class="text-[11px] text-neutral-400 mt-0.5">自动计算交租金额，并顺延下次收租日期</p>
        </div>
        <button onclick="closeModal('quickRentModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="rentPaymentId" value="">

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">收租房源</label>
          <select id="rentLeaseId" onchange="onRentLeaseChange()" class="m3-input w-full text-sm font-bold"></select>
        </div>

        <!-- 房源当前租约信息提示卡 -->
        <div id="rentLeaseSummaryCard" class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] space-y-1.5 text-neutral-700 dark:text-neutral-300 text-[11px]">
          <div class="flex items-center justify-between">
            <span class="text-neutral-400">承租人：<strong id="rentTenantText" class="text-neutral-800 dark:text-neutral-200 font-bold">--</strong></span>
            <span class="text-neutral-400">交租周期：<strong id="rentCycleText" class="text-[#0F5B38] dark:text-[#7CDCA0] font-bold">--</strong></span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-neutral-400">月租金标准：<strong id="rentMonthlyText" class="text-neutral-800 dark:text-neutral-200 font-bold">¥ 0</strong> / 月</span>
            <span class="text-neutral-400">下次收租日：<strong id="rentPrevDueText" class="text-neutral-800 dark:text-neutral-200 font-bold">--</strong></span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">本期实收金额 (元)</label>
            <input type="number" id="rentAmount" placeholder="0.00" step="0.01" class="m3-input w-full text-base font-extrabold text-[#0F5B38] dark:text-[#7CDCA0]">
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">实收收款时间</label>
            <div class="flex items-center gap-1.5">
              <input type="datetime-local" step="1" id="rentPaidAt" class="m3-input w-full text-xs font-bold">
              <button type="button" onclick="setNowDateTime('rentPaidAt')" title="设为当前时间" class="m3-pill px-2.5 py-2 bg-[#E8EDE9] dark:bg-[#161D1A] text-[10px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-[#D7DED9] flex-shrink-0">⚡现在</button>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 px-1">
            <label class="font-bold text-neutral-600 dark:text-neutral-300">下次收租日期 (自动推算)</label>
            <div class="flex items-center gap-1.5 text-[10px]">
              <button type="button" onclick="adjustNextPayMonths(1)" class="hover:underline text-[#0F5B38] dark:text-[#7CDCA0] font-bold">+1月</button>
              <button type="button" onclick="adjustNextPayMonths(3)" class="hover:underline text-[#0F5B38] dark:text-[#7CDCA0] font-bold">+季</button>
              <button type="button" onclick="adjustNextPayMonths(6)" class="hover:underline text-[#0F5B38] dark:text-[#7CDCA0] font-bold">+半年</button>
              <button type="button" onclick="adjustNextPayMonths(12)" class="hover:underline text-[#0F5B38] dark:text-[#7CDCA0] font-bold">+1年</button>
            </div>
          </div>
          <input type="date" id="rentNextPayDate" min="2000-01-01" max="2099-12-31" class="m3-input w-full text-xs font-bold">
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">交租备注</label>
          <input type="text" id="rentRemark" placeholder="如：微信转账 / 2026年9月至2027年9月房租" class="m3-input w-full text-xs">
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <label class="font-bold text-neutral-600 dark:text-neutral-300 text-xs">📎 关联收款凭证 (截图/收据，可选)</label>
            <div class="inline-flex rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] p-0.5 text-[10px] font-bold">
              <button type="button" id="rentAttMode_upload" onclick="switchRentAttMode('upload')" class="px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm">📤 上传新照片</button>
              <button type="button" id="rentAttMode_existing" onclick="switchRentAttMode('existing')" class="px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white">🗃️ 选择已有文件</button>
            </div>
          </div>
          <div id="rentAttUploadBox">
            <input type="file" id="rentReceiptFile" accept="image/*,application/pdf" class="m3-input w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C4EED0] file:text-[#002111] dark:file:bg-[#1A402D] dark:file:text-[#A6F5B9] cursor-pointer">
          </div>
          <div id="rentAttExistingBox" class="hidden">
            <select id="rentExistingAttSelect" class="m3-input w-full text-xs font-bold" onchange="previewExistingAtt('rent')">
              <option value="">-- 请选择之前已上传过的文件 --</option>
            </select>
            <div id="rentExistingPreview" class="hidden mt-2 p-2 rounded-xl bg-[#E8EDE9]/50 dark:bg-[#161D1A] flex items-center gap-2 text-xs">
              <img id="rentExistingThumb" src="" class="w-10 h-10 rounded-lg object-cover bg-neutral-200" alt="文件缩略图">
              <div class="flex-1 truncate">
                <div id="rentExistingName" class="font-bold truncate text-[11px]"></div>
                <div id="rentExistingMeta" class="text-neutral-400 text-[10px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-2 pt-2">
        <button onclick="submitRentCollection()" id="submitRentBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 hover:opacity-95">
          确认记账
        </button>
        <button onclick="copyRentReceiptNotice()" type="button" class="m3-pill w-full py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-700 dark:text-neutral-200 font-bold text-xs hover:bg-[#D7DED9]">
          📋 复制租金收据 (微信发给租客)
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== 弹窗：⚡ 水电抄表与杂费结算 (专用于电费、水费、燃气及物业) ==================== -->
  <div id="utilityModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-xl sm:max-w-2xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <div>
          <h3 id="utilityModalTitle" class="text-base font-extrabold flex items-center gap-1.5">
            <span>⚡</span> <span>记录水电杂费</span>
          </h3>
          <p class="text-[11px] text-neutral-400 mt-0.5">抄表底数自动算费与滚存 · 支持电/水/气/物业等费用</p>
        </div>
        <button onclick="closeModal('utilityModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="editingUtilityId" value="">
      <input type="hidden" id="utilType" value="ELECTRICITY">

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">关联房源</label>
          <select id="utilLeaseId" onchange="onUtilLeaseChange()" class="m3-input w-full text-sm font-bold"></select>
        </div>

        <!-- 费用类型 M3 Segment Chips (不再包含房租，房租由一键收租专用) -->
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1.5 px-1">费用类型</label>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" onclick="selectUtilType('ELECTRICITY')" id="utilChip_ELECTRICITY" class="util-type-chip m3-pill py-2 text-xs font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] flex items-center justify-center gap-1">
              ⚡ 电费抄表
            </button>
            <button type="button" onclick="selectUtilType('WATER')" id="utilChip_WATER" class="util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1">
              💧 水费抄表
            </button>
            <button type="button" onclick="selectUtilType('GAS')" id="utilChip_GAS" class="util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1">
              🔥 燃气费
            </button>
            <button type="button" onclick="selectUtilType('PROPERTY')" id="utilChip_PROPERTY" class="util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1">
              🏢 物业费
            </button>
            <button type="button" onclick="selectUtilType('OTHER')" id="utilChip_OTHER" class="util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1">
              📦 其他杂费
            </button>
            <button type="button" onclick="selectUtilType('DEPOSIT')" id="utilChip_DEPOSIT" class="util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1">
              🛡️ 押金记录
            </button>
          </div>
        </div>

        <!-- 抄表自动算费与底数滚存核心卡片 -->
        <div id="utilMeterBox" class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] space-y-3">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-extrabold text-neutral-800 dark:text-neutral-200">⚡ 抄表自动算费 (保存后自动更新房源底数)</span>
            <span class="text-neutral-400">用量 = 本次 - 上次</span>
          </div>
          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">上次底数 (自动带出)</label>
              <input type="number" id="utilMeterLast" placeholder="0.0" step="0.1" class="m3-input w-full text-xs font-mono font-bold" oninput="calcUtilMeterCost()">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">本次实抄底数</label>
              <input type="number" id="utilMeterCurrent" placeholder="0.0" step="0.1" class="m3-input w-full text-xs font-mono font-bold" oninput="calcUtilMeterCost()">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-neutral-500 mb-0.5">单价 (<span id="utilPriceUnit">元/度</span>)</label>
              <input type="number" id="utilMeterUnitPrice" placeholder="1.0" step="0.01" value="1.0" class="m3-input w-full text-xs font-mono font-bold" oninput="calcUtilMeterCost()">
            </div>
          </div>
          <div class="text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-between pt-2 border-t border-[#D7DED9]/60 dark:border-[#26312B]/60">
            <span>实抄用量：<strong id="utilCalcUsage" class="font-mono text-neutral-900 dark:text-neutral-100 font-extrabold">0.0</strong> <span id="utilUsageUnit">度</span></span>
            <span>换算金额：<strong id="utilCalcTotal" class="font-mono text-[#0F5B38] dark:text-[#7CDCA0] font-extrabold text-sm">¥ 0.00</strong></span>
          </div>
          <div id="utilMeterWarning" class="hidden text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>注意：本次实抄底数小于上次底数，请核实是否录入错误或电表/水表已翻表。</span>
          </div>
        </div>

        <!-- 付款/结算状态选择 (已付清 vs 暂未付款待缴欠款) -->
        <div class="space-y-1.5">
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 px-1">结算付款状态</label>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border border-emerald-500/50 cursor-pointer">
              <input type="radio" name="utilStatus" id="utilStatus_PAID" value="PAID" checked class="accent-[#0F5B38]">
              <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300">✓ 租客已付款</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#E8EDE9]/60 dark:bg-[#161D1A] border border-rose-500/50 cursor-pointer">
              <input type="radio" name="utilStatus" id="utilStatus_UNPAID" value="UNPAID" class="accent-rose-600">
              <span class="text-xs font-bold text-rose-700 dark:text-rose-300">🔴 暂未付款 (计入待收欠款)</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">结算金额 (元)</label>
            <input type="number" id="utilAmount" placeholder="0.00" step="0.01" class="m3-input w-full text-base font-extrabold text-[#0F5B38] dark:text-[#7CDCA0]">
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">抄表/结算时间</label>
            <div class="flex items-center gap-1.5">
              <input type="datetime-local" step="1" id="utilPaidAt" class="m3-input w-full text-xs font-bold">
              <button type="button" onclick="setNowDateTime('utilPaidAt')" title="设为当前时间" class="m3-pill px-2.5 py-2 bg-[#E8EDE9] dark:bg-[#161D1A] text-[10px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-[#D7DED9] flex-shrink-0">⚡现在</button>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">费用备注说明</label>
          <input type="text" id="utilRemark" placeholder="如：9月份电费 / 水费转账核销" class="m3-input w-full text-xs">
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <label class="font-bold text-neutral-600 dark:text-neutral-300 text-xs">📎 关联收款单据 (转账截图/收据，可选)</label>
            <div class="inline-flex rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] p-0.5 text-[10px] font-bold">
              <button type="button" id="utilAttMode_upload" onclick="switchUtilAttMode('upload')" class="px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm">📤 上传新照片</button>
              <button type="button" id="utilAttMode_existing" onclick="switchUtilAttMode('existing')" class="px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white">🗃️ 选择已有文件</button>
            </div>
          </div>
          <div id="utilAttUploadBox">
            <input type="file" id="utilReceiptFile" accept="image/*,application/pdf" class="m3-input w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C4EED0] file:text-[#002111] dark:file:bg-[#1A402D] dark:file:text-[#A6F5B9] cursor-pointer">
          </div>
          <div id="utilAttExistingBox" class="hidden">
            <select id="utilExistingAttSelect" class="m3-input w-full text-xs font-bold" onchange="previewExistingAtt('util')">
              <option value="">-- 请选择之前已上传过的文件 --</option>
            </select>
            <div id="utilExistingPreview" class="hidden mt-2 p-2 rounded-xl bg-[#E8EDE9]/50 dark:bg-[#161D1A] flex items-center gap-2 text-xs">
              <img id="utilExistingThumb" src="" class="w-10 h-10 rounded-lg object-cover bg-neutral-200" alt="文件缩略图">
              <div class="flex-1 truncate">
                <div id="utilExistingName" class="font-bold truncate text-[11px]"></div>
                <div id="utilExistingMeta" class="text-neutral-400 text-[10px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-2 pt-2">
        <button onclick="submitUtilityPayment()" id="submitUtilityBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 hover:opacity-95">
          确认保存
        </button>
        <button onclick="copyUtilityBillNotice()" type="button" class="m3-pill w-full py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-700 dark:text-neutral-200 font-bold text-xs hover:bg-[#D7DED9]">
          📋 复制水电账单条 (微信发给租客)
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== 弹窗：快捷续约 (一键推算新租期与收租日) ==================== -->
  <div id="renewModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-base font-extrabold flex items-center gap-1.5">
          <span>🔄</span>
          <span>租约续约</span>
        </h3>
        <button onclick="closeModal('renewModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="renewLeaseId" value="">

      <div class="space-y-3.5 text-xs">
        <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A]">
          <div id="renewLeaseTitle" class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">房源</div>
          <div id="renewLeaseInfo" class="text-neutral-400 text-[11px] mt-0.5">原租期至 2024-09-20 · 租客 张三</div>
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1.5">选择续约时长</label>
          <div class="grid grid-cols-3 gap-2.5">
            <button type="button" onclick="selectRenewMonths(12)" class="renew-btn m3-pill py-2.5 font-bold text-xs bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]" data-months="12">+1年 (12个月)</button>
            <button type="button" onclick="selectRenewMonths(6)" class="renew-btn m3-pill py-2.5 font-bold text-xs bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300" data-months="6">+半年 (6个月)</button>
            <button type="button" onclick="selectRenewMonths(24)" class="renew-btn m3-pill py-2.5 font-bold text-xs bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300" data-months="24">+2年 (24个月)</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3.5 pt-1">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">续约后新到期日</label>
            <input type="date" id="renewNewEndDate" class="m3-input w-full text-xs font-bold font-mono">
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">下次交租日期</label>
            <input type="date" id="renewNewPayDate" class="m3-input w-full text-xs font-bold font-mono">
          </div>
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">月租金微调 (留空保持原租金)</label>
          <input type="number" id="renewNewRent" placeholder="3000" class="m3-input w-full text-xs font-mono font-bold text-[#0F5B38] dark:text-[#7CDCA0]">
        </div>
      </div>

      <button onclick="submitRenewLease()" id="submitRenewBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 hover:opacity-95">
        确认续约并激活
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：退租结清 / 押金核算 ==================== -->
  <div id="checkoutModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-base font-extrabold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
          <span>🏁</span>
          <span>办理退租</span>
        </h3>
        <button onclick="closeModal('checkoutModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="checkoutLeaseId" value="">

      <div class="space-y-3.5 text-xs">
        <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A]">
          <div id="checkoutLeaseTitle" class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">房源</div>
          <div id="checkoutLeaseDeposit" class="text-neutral-500 font-bold mt-1">在押押金：¥ 0</div>
        </div>

        <div class="p-3 m3-subcard bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
          💡 办理退租后，房源状态将变更为<strong>已退租</strong>，不再出现在待收房租列表中。
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">实退押金金额 (元)</label>
          <input type="number" id="checkoutRefundDeposit" placeholder="0" class="m3-input w-full text-xs font-mono font-bold">
        </div>

        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">退租交接备忘 (如扣除清洁费或电费余款)</label>
          <input type="text" id="checkoutRemark" placeholder="如：已退押金2800元，扣除200元清洁水电" class="m3-input w-full text-xs">
        </div>
      </div>

      <button onclick="submitCheckoutLease()" id="submitCheckoutBtn" class="m3-pill w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md hover:opacity-95">
        确认退租
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：直接绑定上传文件 (多渠道透明加密存储) ==================== -->
  <div id="uploadModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-xl sm:max-w-2xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 id="uploadModalTitle" class="text-base font-extrabold">上传文件 / 关联附件</h3>
        <button onclick="closeModal('uploadModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="uploadPaymentId" value="">

      <!-- 存储目标去向选择器 (明确展示并允许选择存储渠道，存储去向透明化) -->
      <div id="uploadStorageSelectorArea">
        <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1.5 px-1">存放目标位置</label>
        <div class="grid grid-cols-3 gap-2">
          <label id="uploadStorageLabel_D1" class="flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-[#0F5B38] bg-[#C4EED0]/30 dark:bg-[#1A402D]/40 cursor-pointer text-center transition-all">
            <input type="radio" name="uploadStorageType" value="D1_LOCAL" class="sr-only" checked onchange="onUploadStorageTypeChange()">
            <span class="text-base">💾</span>
            <span class="text-[11px] font-bold mt-1 text-neutral-800 dark:text-neutral-200">本地 D1 数据库</span>
            <span class="text-[9px] text-neutral-400 mt-0.5">免配置 · 密文直存</span>
          </label>
          <label id="uploadStorageLabel_WEBDAV" class="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#D7DED9]/60 dark:border-[#26312B]/60 bg-[#E8EDE9]/30 dark:bg-[#161D1A]/50 cursor-pointer text-center hover:border-neutral-400 transition-all">
            <input type="radio" name="uploadStorageType" value="WEBDAV" class="sr-only" onchange="onUploadStorageTypeChange()">
            <span class="text-base">☁️</span>
            <span class="text-[11px] font-bold mt-1 text-neutral-800 dark:text-neutral-200">WebDAV / 网盘</span>
            <span class="text-[9px] text-neutral-400 mt-0.5">坚果云 / AList</span>
          </label>
          <label id="uploadStorageLabel_S3" class="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#D7DED9]/60 dark:border-[#26312B]/60 bg-[#E8EDE9]/30 dark:bg-[#161D1A]/50 cursor-pointer text-center hover:border-neutral-400 transition-all">
            <input type="radio" name="uploadStorageType" value="S3" class="sr-only" onchange="onUploadStorageTypeChange()">
            <span class="text-base">🪣</span>
            <span class="text-[11px] font-bold mt-1 text-neutral-800 dark:text-neutral-200">S3 对象存储</span>
            <span class="text-[9px] text-neutral-400 mt-0.5">OSS / COS / R2</span>
          </label>
        </div>
        <div id="uploadStorageHint" class="mt-2 text-[11px] text-[#0F5B38] dark:text-[#7CDCA0] px-1 font-medium">
          ✓ 文件将以 AES-256-GCM 强加密形式安全保存在 Cloudflare D1 数据库中，免第三方配置。
        </div>
      </div>

      <!-- 模式切换：上传新文件 / 选择已有内置文件 -->
      <div class="flex items-center justify-center p-1 rounded-2xl bg-[#E8EDE9] dark:bg-[#161D1A]">
        <button type="button" id="uploadModalTab_upload" onclick="switchUploadModalTab('upload')" class="flex-1 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm transition-all">📤 上传新照片/PDF</button>
        <button type="button" id="uploadModalTab_existing" onclick="switchUploadModalTab('existing')" class="flex-1 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all">🗃️ 选择系统已有文件并关联</button>
      </div>

      <!-- 模式A: 上传新文件 -->
      <div id="uploadSection_new" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">选择照片或合同 PDF</label>
          <input type="file" id="uploadFileInput" accept="image/*,application/pdf" class="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#0F5B38] file:text-white dark:file:bg-[#7CDCA0] dark:file:text-[#00391F] cursor-pointer">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">绑定房源</label>
            <select id="uploadLeaseId" class="m3-input w-full text-xs font-bold"></select>
          </div>
          <div>
            <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">文件分类</label>
            <select id="uploadCategory" class="m3-input w-full text-xs font-bold">
              <option value="CONTRACT">租房合同/协议照片</option>
              <option value="RECEIPT">交租/转账回执单据</option>
              <option value="HANDOVER">验房交接/电表照</option>
              <option value="OTHER">其他附件资料</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 模式B: 选择已有内置文件 -->
      <div id="uploadSection_existing" class="hidden space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">选择已存入系统的内置文件</label>
          <select id="uploadExistingAttSelect" class="m3-input w-full text-xs font-bold" onchange="previewExistingAtt('upload')">
            <option value="">-- 请选择系统已有文件 --</option>
          </select>
          <div id="uploadExistingPreview" class="hidden mt-2 p-2.5 rounded-xl bg-[#E8EDE9]/50 dark:bg-[#161D1A] flex items-center gap-2.5 text-xs">
            <img id="uploadExistingThumb" src="" class="w-12 h-12 rounded-lg object-cover bg-neutral-200" alt="文件缩略图">
            <div class="flex-1 truncate">
              <div id="uploadExistingName" class="font-bold truncate text-xs"></div>
              <div id="uploadExistingMeta" class="text-neutral-400 text-[11px] mt-0.5"></div>
            </div>
          </div>
        </div>
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">绑定目标房源</label>
          <select id="uploadExistingLeaseId" class="m3-input w-full text-xs font-bold"></select>
        </div>
      </div>

      <button onclick="submitUpload()" id="uploadSubmitBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/15 hover:opacity-95">
        确认保存并加密存入
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：文件高分辨率 Lightbox 预览 ==================== -->
  <div id="lightboxModal" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onclick="closeModal('lightboxModal')">
    <div class="max-w-3xl max-h-[85vh] w-full bg-white dark:bg-[#1A211D] rounded-[32px] overflow-hidden shadow-2xl p-5 flex flex-col" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-3 border-b border-[#D7DED9]/60 dark:border-[#26312B]/60">
        <h4 id="lightboxTitle" class="text-xs font-bold truncate max-w-md">文件预览</h4>
        <div class="flex items-center gap-3">
          <button id="lightboxDeleteBtn" onclick="deleteCurrentLightboxAttachment()" type="button" class="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline flex items-center gap-1">🗑️ 删除文件</button>
          <a id="lightboxDownload" href="#" target="_blank" class="text-xs text-[#0F5B38] dark:text-[#7CDCA0] font-bold underline">在新标签打开原件</a>
          <button onclick="closeModal('lightboxModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
        </div>
      </div>
      <div class="flex-1 overflow-auto flex items-center justify-center p-2 min-h-[300px]">
        <img id="lightboxImg" src="" alt="凭据原图" class="max-h-[70vh] max-w-full object-contain rounded-2xl">
      </div>
    </div>
  </div>

  <!-- ==================== 弹窗：修改密码 ==================== -->
  <div id="passwordModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-sm font-extrabold">修改登录密码</h3>
        <button onclick="closeModal('passwordModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">当前密码</label>
          <input type="password" id="oldPasswordInput" placeholder="••••••••" class="m3-input w-full text-sm">
        </div>
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">新密码 (至少8位)</label>
          <input type="password" id="newPasswordInput" placeholder="••••••••" class="m3-input w-full text-sm">
        </div>
      </div>

      <button onclick="submitChangePassword()" id="changePassBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md hover:opacity-95">
        确认修改
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：查看 / 换绑安全邮箱 ==================== -->
  <div id="updateSecurityEmailModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-sm font-extrabold">安全与通知邮箱</h3>
        <button onclick="closeModal('updateSecurityEmailModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
        <strong>说明：</strong>绑定此邮箱后，系统将自动向该邮箱投递每日交租提醒、水电欠费催缴，并在忘记密码时作为接收验证凭据的通道。
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">安全与提醒接收邮箱</label>
          <input type="email" id="secNewEmailInput" placeholder="例如: landlord@example.com" class="m3-input w-full text-sm font-semibold">
        </div>
        <div>
          <label class="block font-bold text-neutral-600 dark:text-neutral-300 mb-1 px-1">管理员登录密码</label>
          <input type="password" id="secPasswordInput" placeholder="输入当前登录密码以核验身份" class="m3-input w-full text-sm">
        </div>
      </div>

      <button onclick="submitUpdateSecurityEmail()" id="secEmailSubmitBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md hover:opacity-95">
        确认保存邮箱
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：查看 2FA 凭据 ==================== -->
  <div id="twoFAModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-sm font-extrabold">手机二次验证二维码与密钥</h3>
        <button onclick="closeModal('twoFAModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-neutral-200 shadow-inner">
        <div id="settingsQrBox" class="p-2 bg-white rounded-xl"></div>
        <div class="mt-2 text-center text-xs">
          <span class="text-neutral-400 block text-[10px]">密钥：</span>
          <span id="settingsSecretDisplay" class="font-mono font-bold text-neutral-800 select-all bg-neutral-100 px-2 py-1 rounded inline-block mt-0.5"></span>
        </div>
      </div>

      <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300 text-xs">
        <strong class="block mb-1">🔑 8组应急备用码：</strong>
        <div id="settingsRecoveryDisplay" class="grid grid-cols-2 gap-1 font-mono text-[11px] font-bold select-all"></div>
      </div>
    </div>
  </div>

  <!-- ==================== 持续提醒弹窗：绑定 2FA 动态验证 ==================== -->
  <div id="twoFARemindModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#1A211D] w-full max-w-lg rounded-[32px] p-6 sm:p-8 space-y-4 shadow-2xl border border-amber-500/20">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-[20px] bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-xl font-bold">
          🛡️
        </div>
        <div>
          <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">建议开启手机二次验证</h3>
          <p class="text-xs text-neutral-400 font-medium">开启手机动态验证码，提升账号安全性</p>
        </div>
      </div>

      <div class="p-4 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-2">
        <p>检测到您的账号当前仅依靠密码登录。</p>
        <p class="text-[11px] text-neutral-400">开启后登录时需输入手机上的 6 位动态验证码，能更好地保护您的房源与账单数据。</p>
      </div>

      <div class="space-y-2 pt-1">
        <button onclick="startRebind2FA(); closeModal('twoFARemindModal');" class="m3-pill w-full py-3 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/20 transition-all">
          🛡️ 去绑定二次验证
        </button>
        <button onclick="dismissTwoFARemindModal()" class="m3-pill w-full py-2.5 bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-semibold transition-all">
          稍后再说
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== 弹窗：扫码绑定 2FA (Android 16 M3) ==================== -->
  <div id="bind2FAModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-lg sm:max-w-xl rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-9 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 id="bind2FAModalTitle" class="text-sm font-extrabold">绑定手机二次验证 (动态口令)</h3>
        <button onclick="closeModal('bind2FAModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="text-center">
        <p class="text-xs text-neutral-500">请使用微信小程序（腾讯身份验证器）或手机验证器扫码</p>
      </div>

      <div class="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-neutral-200 shadow-inner">
        <div id="bindQrBox" class="p-2 bg-white rounded-xl"></div>
        <div class="mt-2 text-center text-xs">
          <span class="text-neutral-400 block text-[10px]">手动密钥：</span>
          <span id="bindSecretDisplay" class="font-mono font-bold text-neutral-800 select-all cursor-pointer bg-neutral-100 px-2 py-1 rounded inline-block mt-0.5" onclick="copyBindSecret()" title="点击复制"></span>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-center text-neutral-600 dark:text-neutral-300">
          请输入手机显示的 6 位动态验证码：
        </label>
        <input id="bindTotpCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="m3-input w-full px-4 py-3 bg-[#E8EDE9] dark:bg-[#161D1A] border-none text-center text-2xl tracking-widest font-mono font-bold">
      </div>

      <div class="p-3.5 m3-subcard bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs">
        <strong class="block mb-1">🔑 8组应急备用码 (请妥善保存)：</strong>
        <div id="bindRecoveryDisplay" class="grid grid-cols-2 gap-1 font-mono text-[11px] font-bold select-all"></div>
      </div>

      <button onclick="submitConfirmBind2FA()" id="confirmBindBtn" class="m3-pill w-full py-3.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-xs shadow-md shadow-[#0F5B38]/20 transition-all">
        确认并开启二次验证
      </button>
    </div>
  </div>

  <!-- ==================== 弹窗：关闭 2FA ==================== -->
  <div id="disable2FAModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="m3-sheet bg-white dark:bg-[#1A211D] w-full max-w-md sm:max-w-lg rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-8 space-y-4 shadow-2xl">
      <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 mx-auto"></div>
      <div class="flex items-center justify-between pb-1 border-b border-[#E8EDE9] dark:border-[#26312B]/60">
        <h3 class="text-sm font-bold text-rose-600">关闭手机二次验证</h3>
        <button onclick="closeModal('disable2FAModal')" class="w-7 h-7 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-400 font-bold flex items-center justify-center text-xs">✕</button>
      </div>

      <p class="text-xs text-neutral-500 leading-relaxed">
        关闭二次验证后系统将仅依靠密码保护。您也可以随时在设置中重新开启。
      </p>

      <div>
        <label class="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 px-1">请输入管理员主密码确认</label>
        <input id="disablePasswordInput" type="password" placeholder="••••••••" class="m3-input w-full text-sm">
      </div>

      <button onclick="submitDisable2FA()" id="disableBtn" class="m3-pill w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all">
        确认关闭
      </button>
    </div>
  </div>

  <!-- ==================== 客户端控制器脚本 (高效数据流与智能联动) ==================== -->
  <script>
    let appData = {
      stats: null,
      upcomingRentQueue: [],
      leases: [],
      allPayments: [],
      attachments: [],
      webdav: null,
      totpEnabled: false,
      currentLeaseFilter: 'ALL',
      currentPaymentTypeFilter: 'ALL'
    };

    // ==================== 🕒 记账时间与日期工具 (精确年月日时分秒 vs 合同到期日) ====================
    function getNowDateTimeLocal() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
    }

    function setNowDateTime(elementId) {
      const el = document.getElementById(elementId);
      if (el) el.value = getNowDateTimeLocal();
    }

    function formatDateTimeForStorage(val) {
      if (!val) return '';
      return val.replace('T', ' ');
    }

    function formatDateTimeForInput(val) {
      if (!val) return getNowDateTimeLocal();
      if (val.includes('T')) return val;
      if (val.includes(' ')) return val.replace(' ', 'T');
      return val + 'T' + new Date().toTimeString().slice(0, 8);
    }

    // ==================== 📎 内置已有文件绑定与模式切换 ====================
    let rentAttMode = 'upload';
    let utilAttMode = 'upload';
    let uploadModalTab = 'upload';
    let currentLightboxAttId = null;

    function switchRentAttMode(mode) {
      rentAttMode = mode;
      const uploadBox = document.getElementById('rentAttUploadBox');
      const existingBox = document.getElementById('rentAttExistingBox');
      const btnUpload = document.getElementById('rentAttMode_upload');
      const btnExisting = document.getElementById('rentAttMode_existing');
      if (mode === 'upload') {
        if (uploadBox) uploadBox.classList.remove('hidden');
        if (existingBox) existingBox.classList.add('hidden');
        if (btnUpload) btnUpload.className = 'px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm font-bold';
        if (btnExisting) btnExisting.className = 'px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold';
      } else {
        if (uploadBox) uploadBox.classList.add('hidden');
        if (existingBox) existingBox.classList.remove('hidden');
        if (btnExisting) btnExisting.className = 'px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm font-bold';
        if (btnUpload) btnUpload.className = 'px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold';
        const leaseId = document.getElementById('rentLeaseId')?.value;
        populateExistingAttDropdown('rentExistingAttSelect', leaseId);
      }
    }

    function switchUtilAttMode(mode) {
      utilAttMode = mode;
      const uploadBox = document.getElementById('utilAttUploadBox');
      const existingBox = document.getElementById('utilAttExistingBox');
      const btnUpload = document.getElementById('utilAttMode_upload');
      const btnExisting = document.getElementById('utilAttMode_existing');
      if (mode === 'upload') {
        if (uploadBox) uploadBox.classList.remove('hidden');
        if (existingBox) existingBox.classList.add('hidden');
        if (btnUpload) btnUpload.className = 'px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm font-bold';
        if (btnExisting) btnExisting.className = 'px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold';
      } else {
        if (uploadBox) uploadBox.classList.add('hidden');
        if (existingBox) existingBox.classList.remove('hidden');
        if (btnExisting) btnExisting.className = 'px-2.5 py-1 rounded-full bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm font-bold';
        if (btnUpload) btnUpload.className = 'px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold';
        const leaseId = document.getElementById('utilLeaseId')?.value;
        populateExistingAttDropdown('utilExistingAttSelect', leaseId);
      }
    }

    function switchUploadModalTab(tab) {
      uploadModalTab = tab;
      const secNew = document.getElementById('uploadSection_new');
      const secExisting = document.getElementById('uploadSection_existing');
      const tabNew = document.getElementById('uploadModalTab_upload');
      const tabExisting = document.getElementById('uploadModalTab_existing');
      const submitBtn = document.getElementById('uploadSubmitBtn');

      if (tab === 'upload') {
        if (secNew) secNew.classList.remove('hidden');
        if (secExisting) secExisting.classList.add('hidden');
        if (tabNew) tabNew.className = 'flex-1 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm transition-all';
        if (tabExisting) tabExisting.className = 'flex-1 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all';
        if (submitBtn) submitBtn.innerText = '确认保存并加密存入';
      } else {
        if (secNew) secNew.classList.add('hidden');
        if (secExisting) secExisting.classList.remove('hidden');
        if (tabExisting) tabExisting.className = 'flex-1 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#202824] text-[#0F5B38] dark:text-[#7CDCA0] shadow-sm transition-all';
        if (tabNew) tabNew.className = 'flex-1 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all';
        if (submitBtn) submitBtn.innerText = '确认绑定已有文件';
        const curLeaseId = document.getElementById('uploadLeaseId')?.value;
        populateExistingAttDropdown('uploadExistingAttSelect', curLeaseId);
      }
    }

    async function populateExistingAttDropdown(selectId, currentLeaseId) {
      const select = document.getElementById(selectId);
      if (!select) return;
      if (!appData.attachments || appData.attachments.length === 0) {
        try {
          const res = await fetch('/api/attachments');
          const json = await res.json();
          if (json.code === 0) appData.attachments = json.data || [];
        } catch (_) {}
      }
      const list = appData.attachments || [];
      select.innerHTML = '<option value="">-- 请选择系统内已上传过的文件 --</option>';
      if (list.length === 0) {
        select.innerHTML = '<option value="">暂无已上传的文件</option>';
        return;
      }
      const sorted = [...list].sort((a, b) => {
        const aThis = (currentLeaseId && a.lease_id === currentLeaseId) ? 1 : 0;
        const bThis = (currentLeaseId && b.lease_id === currentLeaseId) ? 1 : 0;
        return bThis - aThis;
      });

      sorted.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        const isThisLease = currentLeaseId && a.lease_id === currentLeaseId;
        const tag = isThisLease ? '【本房源】' : (a.payment_id ? '【账单单据】' : '【通用资料】');
        const sizeStr = (a.file_size / 1024).toFixed(0) + 'KB';
        const dateStr = a.created_at ? a.created_at.slice(0, 10) : '';
        opt.textContent = tag + ' ' + a.file_name + ' (' + sizeStr + ' · ' + dateStr + ')';
        opt.dataset.filename = a.file_name;
        opt.dataset.filesize = sizeStr;
        opt.dataset.createdat = dateStr;
        select.appendChild(opt);
      });
    }

    function previewExistingAtt(mode) {
      const selectId = mode === 'rent' ? 'rentExistingAttSelect' : (mode === 'util' ? 'utilExistingAttSelect' : 'uploadExistingAttSelect');
      const previewId = mode === 'rent' ? 'rentExistingPreview' : (mode === 'util' ? 'utilExistingPreview' : 'uploadExistingPreview');
      const thumbId = mode === 'rent' ? 'rentExistingThumb' : (mode === 'util' ? 'utilExistingThumb' : 'uploadExistingThumb');
      const nameId = mode === 'rent' ? 'rentExistingName' : (mode === 'util' ? 'utilExistingName' : 'uploadExistingName');
      const metaId = mode === 'rent' ? 'rentExistingMeta' : (mode === 'util' ? 'utilExistingMeta' : 'uploadExistingMeta');

      const select = document.getElementById(selectId);
      const preview = document.getElementById(previewId);
      if (!select || !preview) return;

      const attId = select.value;
      if (!attId) {
        preview.classList.add('hidden');
        return;
      }

      const opt = select.options[select.selectedIndex];
      preview.classList.remove('hidden');
      const thumb = document.getElementById(thumbId);
      if (thumb) thumb.src = '/api/attachments/' + attId + '/file';
      const nameEl = document.getElementById(nameId);
      if (nameEl) nameEl.innerText = opt.dataset.filename || '已选文件';
      const metaEl = document.getElementById(metaId);
      if (metaEl) metaEl.innerText = '大小：' + (opt.dataset.filesize || '') + ' · 上传时间：' + (opt.dataset.createdat || '');
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const target = document.getElementById('tab-' + tabId);
      if (target) target.classList.remove('hidden');

      // 移动端导航高亮
      document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle('text-[#0F5B38]', isActive);
        btn.classList.toggle('dark:text-[#7CDCA0]', isActive);
        btn.classList.toggle('font-bold', isActive);
        btn.classList.toggle('text-neutral-400', !isActive);
      });

      // 桌面端导航高亮 (M3 Expressive Pill)
      document.querySelectorAll('.desktop-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle('bg-white', isActive);
        btn.classList.toggle('dark:bg-[#1A211D]', isActive);
        btn.classList.toggle('shadow-sm', isActive);
        btn.classList.toggle('text-[#0F5B38]', isActive);
        btn.classList.toggle('dark:text-[#7CDCA0]', isActive);
        btn.classList.toggle('font-bold', isActive);
      });

      if (tabId === 'leases') {
        if (appData.leases && appData.leases.length > 0) {
          filterLeases();
        } else {
          loadLeases();
        }
      }
      if (tabId === 'payments') {
        if (appData.allPayments && appData.allPayments.length > 0) {
          filterPayments();
        } else {
          loadPayments();
        }
      }
      if (tabId === 'receipts') {
        if (appData.attachments && appData.attachments.length > 0) {
          // 凭据已在内存中，保持即显
        } else {
          loadAttachments();
        }
      }
      if (tabId === 'settings') {
        loadSettings();
        render2FAStatusUI();
      }
    }

    function openFabMenuModal() {
      openModal('fabMenuModal');
    }

    // ==================== 房源与记账概览 ====================
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);
        const data = json.data;

        appData.stats = data.stats;
        appData.upcomingRentQueue = data.upcomingRentQueue || [];
        appData.leases = data.leases || [];
        appData.totpEnabled = !!data.totpEnabled;
        appData.username = data.username || '';

        // 处理 2FA 状态与长效警示
        render2FAStatusUI();
        if (!appData.totpEnabled && !sessionStorage.getItem('twoFARemindDismissed')) {
          openModal('twoFARemindModal');
        }

        // 1. 更新顶部指标卡
        const s = data.stats || {};
        document.getElementById('statTotalHouses').innerText = s.totalProperties || 0;
        document.getElementById('statActiveBadge').innerText = '● ' + (s.activeCount || 0) + ' 正常在租';
        document.getElementById('statOverdueBadge').innerText = '○ ' + (s.overdueCount || 0) + ' 逾期待续';
        
        const incomeEl = document.getElementById('statThisMonthIncome');
        if (incomeEl) incomeEl.innerText = Number(s.thisMonthIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('statMonthlyRent').innerText = (s.totalMonthlyRent || 0).toLocaleString();
        document.getElementById('statDepositPool').innerText = (s.totalDepositHeld || 0).toLocaleString();
        
        const unpaidEl = document.getElementById('statTotalUnpaid');
        if (unpaidEl) unpaidEl.innerText = Number(s.totalUnpaidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const unpaidBadge = document.getElementById('statUnpaidBadge');
        if (unpaidBadge) unpaidBadge.innerText = (s.totalUnpaidCount || 0) + ' 笔欠费';
        document.getElementById('statPendingRents').innerText = data.upcomingRentQueue ? data.upcomingRentQueue.length : 0;

        // 2. 渲染待收租队列 (极其直观实用)
        const queueEl = document.getElementById('upcomingRentQueue');
        if (!data.upcomingRentQueue || data.upcomingRentQueue.length === 0) {
          queueEl.innerHTML = '<div class="p-8 text-center text-xs text-neutral-400">暂无近期待收房租（未来 30 天内无待交房租，全部正常）</div>';
        } else {
          queueEl.innerHTML = data.upcomingRentQueue.map(item => \`
            <div class="p-4 flex items-center justify-between hover:bg-[#E8EDE9]/40 dark:hover:bg-[#161D1A]/60 transition-colors text-xs">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl \${item.isPayOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'} flex items-center justify-center font-extrabold text-xs">
                  \${item.isPayOverdue ? '!' : '¥'}
                </div>
                <div>
                  <div class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">\${item.title}</div>
                  <div class="text-neutral-400 text-[11px] mt-0.5">承租人：\${item.tenant_name || '未录入'} · \${item.tenant_phone || '--'}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">¥ \${item.rent_amount}</div>
                  <div class="text-[10px] font-bold \${item.isPayOverdue ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}">\${item.nextPayText || ''}</div>
                </div>
                <button onclick="quickCollectRent('\${item.id}')" class="m3-pill px-3.5 py-1.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] font-bold text-[11px] shadow-sm">
                  ⚡ 一键收租
                </button>
              </div>
            </div>
          \`).join('');
        }

        // 3. 渲染最近记账记录
        const listEl = document.getElementById('recentPaymentsList');
        if (!data.recentPayments || data.recentPayments.length === 0) {
          listEl.innerHTML = '<div class="p-8 text-center text-xs text-neutral-400">暂无记账记录，点击上方快捷记一笔</div>';
        } else {
          listEl.innerHTML = data.recentPayments.map(p => \`
            <div class="p-4 flex items-center justify-between hover:bg-[#E8EDE9]/40 dark:hover:bg-[#161D1A]/60 transition-colors text-xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-extrabold text-xs">
                  \${p.payment_type === 'RENT' ? '租' : p.payment_type === 'ELECTRICITY' ? '电' : p.payment_type === 'WATER' ? '水' : '杂'}
                </div>
                <div>
                  <div class="font-bold">\${getPaymentTypeName(p.payment_type)} · \${p.lease_title || '房源'}</div>
                  <div class="text-neutral-400 text-[11px]">\${p.paid_at} \${p.meter_usage ? '· 用量 ' + p.meter_usage + '度/吨' : ''} \${p.remark ? '· ' + p.remark : ''}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-extrabold text-sm text-[#0F5B38] dark:text-[#7CDCA0]">¥ \${Number(p.amount).toFixed(2)}</div>
                <div class="text-[10px] text-emerald-600 font-bold">已结清</div>
              </div>
            </div>
          \`).join('');
        }
      } catch (err) {
        console.error('加载概览失败', err);
      }
    }

    // ==================== ⚡ 一键收取房租 (专职处理租金核算与下次到期顺延) ====================
    async function quickCollectRent(leaseId) {
      await ensureLeaseDropdowns();
      if (!appData.leases || appData.leases.length === 0) return alert('请先录入出租房源');

      const targetId = leaseId || document.getElementById('rentLeaseId').value || appData.leases[0].id;
      document.getElementById('rentPaymentId').value = '';
      document.getElementById('quickRentTitle').innerHTML = '<span>⚡</span> <span>一键收取房租</span>';
      document.getElementById('rentLeaseId').value = targetId;
      document.getElementById('rentPaidAt').value = getNowDateTimeLocal();
      switchRentAttMode('upload');
      const receiptInput = document.getElementById('rentReceiptFile');
      if (receiptInput) receiptInput.value = '';
      populateExistingAttDropdown('rentExistingAttSelect', targetId);
      onRentLeaseChange();
      openModal('quickRentModal');
    }

    function onRentLeaseChange() {
      const leaseId = document.getElementById('rentLeaseId').value;
      const target = (appData.leases || []).find(l => l.id === leaseId);
      if (!target) return;

      const cycle = target.pay_cycle_months || 1;
      const cycleText = cycle == 12 ? '年付 (12个月)' : cycle == 6 ? '半年付 (6个月)' : cycle == 3 ? '季付 (3个月)' : '月付 (1个月)';
      
      document.getElementById('rentTenantText').innerText = target.tenant_name ? \`\${target.tenant_name} (\${target.tenant_phone || '--'})\` : '未录入';
      document.getElementById('rentCycleText').innerText = cycleText;
      document.getElementById('rentMonthlyText').innerText = '¥ ' + (Number(target.rent_amount) || 0).toLocaleString();
      document.getElementById('rentPrevDueText').innerText = target.next_pay_date || '未设';

      // 智能推算本期租金总额：月租金 * 周期月份
      const totalRent = (Number(target.rent_amount) || 0) * (cycle > 1 ? cycle : 1);
      document.getElementById('rentAmount').value = totalRent;

      // 顺延下次收租日智能推算：若存在下次日期则基于原下次日期加一个周期，否则从收款日或今天推算
      let baseDate = new Date();
      if (target.next_pay_date) {
        const parsed = new Date(target.next_pay_date);
        if (!isNaN(parsed.getTime())) baseDate = parsed;
      }
      baseDate.setMonth(baseDate.getMonth() + cycle);
      const ny = baseDate.getFullYear();
      const nm = String(baseDate.getMonth() + 1).padStart(2, '0');
      const nd = String(baseDate.getDate()).padStart(2, '0');
      document.getElementById('rentNextPayDate').value = \`\${ny}-\${nm}-\${nd}\`;

      document.getElementById('rentRemark').value = \`收租 (\${cycleText})\`;
      populateExistingAttDropdown('rentExistingAttSelect', leaseId);
    }

    function adjustNextPayMonths(months) {
      const rawVal = document.getElementById('rentPaidAt').value || '';
      const paidAtStr = rawVal.slice(0, 10) || new Date().toISOString().slice(0, 10);
      const base = new Date(paidAtStr);
      if (isNaN(base.getTime())) return;
      base.setMonth(base.getMonth() + months);
      const ny = base.getFullYear();
      const nm = String(base.getMonth() + 1).padStart(2, '0');
      const nd = String(base.getDate()).padStart(2, '0');
      document.getElementById('rentNextPayDate').value = \`\${ny}-\${nm}-\${nd}\`;
    }

    let isSubmittingRent = false;
    async function submitRentCollection() {
      if (isSubmittingRent) return;

      const lease_id = document.getElementById('rentLeaseId').value;
      const amount = document.getElementById('rentAmount').value;
      const paid_at = formatDateTimeForStorage(document.getElementById('rentPaidAt').value);
      const next_pay_date = document.getElementById('rentNextPayDate').value;
      const remark = document.getElementById('rentRemark').value;
      const editingId = document.getElementById('rentPaymentId').value;

      if (!lease_id) return alert('请选择收租房源');
      if (!amount || Number(amount) <= 0) return alert('请输入有效的实收租金金额');
      if (!paid_at) return alert('请选择实收收款时间');

      const btn = document.getElementById('submitRentBtn');
      isSubmittingRent = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在保存入账...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        const payload = {
          lease_id,
          payment_type: 'RENT',
          amount: Number(amount),
          paid_at,
          next_pay_date: next_pay_date || null,
          remark: remark || '房租实收'
        };

        const url = editingId ? ('/api/payments/' + editingId) : '/api/payments';
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          const targetPaymentId = editingId || (json.data && json.data.id);
          const receiptFile = document.getElementById('rentReceiptFile')?.files?.[0];
          const existingAttId = document.getElementById('rentExistingAttSelect')?.value;

          if (rentAttMode === 'existing' && existingAttId && targetPaymentId) {
            try {
              await fetch('/api/attachments/bind', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachmentId: existingAttId, paymentId: targetPaymentId, leaseId: lease_id })
              });
            } catch (attErr) {
              console.warn('绑定已有文件未成功:', attErr);
            }
          } else if (rentAttMode === 'upload' && receiptFile && targetPaymentId) {
            try {
              const fd = new FormData();
              fd.append('file', receiptFile);
              fd.append('payment_id', targetPaymentId);
              fd.append('lease_id', lease_id);
              fd.append('category', 'RECEIPT');
              await fetch('/api/attachments/upload', { method: 'POST', body: fd });
            } catch (attErr) {
              console.warn('收款单据上传未成功:', attErr);
            }
          }

          closeModal('quickRentModal');
          loadDashboard();
          loadPayments();
          loadLeases();
          loadAttachments();
          alert('✓ 租金已成功入账！' + ((rentAttMode === 'upload' && receiptFile) || (rentAttMode === 'existing' && existingAttId) ? '（收款单据已关联绑定）' : ''));
        } else {
          alert(json.message || '保存失败');
        }
      } catch (err) {
        alert('提交失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingRent = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    function copyRentReceiptNotice() {
      const leaseId = document.getElementById('rentLeaseId').value;
      const target = (appData.leases || []).find(l => l.id === leaseId);
      const amount = document.getElementById('rentAmount').value || '0';
      const rawPaidAt = document.getElementById('rentPaidAt').value || '';
      const paidAt = rawPaidAt.replace('T', ' ') || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const nextDue = document.getElementById('rentNextPayDate').value || '未设置';
      const remark = document.getElementById('rentRemark').value || '';

      const cycle = target?.pay_cycle_months || 1;
      const cycleText = cycle == 12 ? '年付' : cycle == 6 ? '半年付' : cycle == 3 ? '季付' : '月付';
      const tenantName = (target && target.tenant_name ? target.tenant_name : '租客');

      const text = '【房租收据】\\n' +
        '您好 ' + tenantName + '，已收到您转来的房租款项，明细如下：\\n' +
        '・ 房源：' + (target ? target.title : '房源') + '\\n' +
        '・ 实收房租：¥' + Number(amount).toFixed(2) + ' (' + cycleText + ')\\n' +
        '・ 收款时间：' + paidAt + '\\n' +
        '・ 下次收租：' + nextDue + '\\n' +
        (remark ? ('・ 备注：' + remark + '\\n') : '') +
        '款项已核对结清，感谢配合，祝生活愉快！';

      navigator.clipboard.writeText(text).then(() => {
        alert('✓ 已复制收据！可直接发微信给租客。');
      }).catch(() => {
        prompt('请复制以下收据信息：', text);
      });
    }

    function getPaymentTypeName(type) {
      const map = {
        RENT: '房租',
        ELECTRICITY: '电费',
        WATER: '水费',
        GAS: '燃气费',
        PROPERTY: '物业费',
        DEPOSIT: '押金',
        OTHER: '其他费用'
      };
      return map[type] || type;
    }

    // ==================== 房源/租客列表 (支持筛选芯片与实时过滤) ====================
    async function loadLeases() {
      const res = await fetch('/api/leases');
      const json = await res.json();
      if (json.code === 0) {
        appData.leases = json.data;
        updateLeaseFilterCounts(json.data);
        filterLeases();
      }
    }

    function updateLeaseFilterCounts(leases) {
      const all = leases.length;
      const payOverdue = leases.filter(l => l.status === 'ACTIVE' && l.isPayOverdue).length;
      const active = leases.filter(l => l.status === 'ACTIVE' && !l.isOverdue).length;
      const overdue = leases.filter(l => l.status === 'ACTIVE' && l.isOverdue).length;
      const terminated = leases.filter(l => l.status === 'TERMINATED' || l.status === 'EXPIRED').length;

      document.getElementById('countLeasesAll').innerText = all;
      const payEl = document.getElementById('countLeasesPayOverdue');
      if (payEl) payEl.innerText = payOverdue;
      document.getElementById('countLeasesActive').innerText = active;
      document.getElementById('countLeasesOverdue').innerText = overdue;
      document.getElementById('countLeasesTerminated').innerText = terminated;
    }

    function setLeaseFilter(filterKey) {
      appData.currentLeaseFilter = filterKey;
      document.querySelectorAll('.lease-filter-chip').forEach(chip => {
        chip.className = 'lease-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300';
      });
      const activeChip = document.getElementById('leaseChip_' + filterKey);
      if (activeChip) {
        if (filterKey === 'PAY_OVERDUE') {
          activeChip.className = 'lease-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-rose-600 text-white dark:bg-rose-500 dark:text-white';
        } else {
          activeChip.className = 'lease-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]';
        }
      }
      filterLeases();
    }

    function filterLeases() {
      const keyword = (document.getElementById('leaseSearchInput')?.value || '').trim().toLowerCase();
      const filterKey = appData.currentLeaseFilter;

      const filtered = appData.leases.filter(l => {
        // 1. 状态匹配
        if (filterKey === 'PAY_OVERDUE' && (l.status !== 'ACTIVE' || !l.isPayOverdue)) return false;
        if (filterKey === 'ACTIVE' && (l.status !== 'ACTIVE' || l.isOverdue)) return false;
        if (filterKey === 'OVERDUE' && (l.status !== 'ACTIVE' || !l.isOverdue)) return false;
        if (filterKey === 'TERMINATED' && (l.status !== 'TERMINATED' && l.status !== 'EXPIRED')) return false;

        // 2. 关键词匹配
        if (keyword) {
          const matchTitle = (l.title || '').toLowerCase().includes(keyword);
          const matchAddr = (l.address || '').toLowerCase().includes(keyword);
          const matchTenant = (l.tenant_name || '').toLowerCase().includes(keyword);
          const matchPhone = (l.tenant_phone || '').includes(keyword);
          if (!matchTitle && !matchAddr && !matchTenant && !matchPhone) return false;
        }

        return true;
      });

      renderLeasesList(filtered);
    }

    function renderLeasesList(leases) {
      const container = document.getElementById('leasesContainer');
      if (leases.length === 0) {
        container.innerHTML = '<div class="col-span-2 m3-card bg-white dark:bg-[#1A211D] p-8 text-center text-xs text-neutral-400">没有符合筛选条件的房源</div>';
        return;
      }
      container.innerHTML = leases.map(l => {
        const boundAtts = l.attachments || [];
        const attThumbnails = boundAtts.length > 0 
          ? boundAtts.slice(0, 4).map(a => \`
              <div onclick="openLightbox('/api/attachments/\${a.id}/file', '\${a.file_name}', '\${a.id}')" class="w-11 h-11 rounded-2xl bg-[#E8EDE9] dark:bg-[#161D1A] overflow-hidden border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:opacity-80 transition-opacity relative group" title="\${a.file_name}">
                <img src="/api/attachments/\${a.id}/file" alt="\${a.file_name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-[10px] font-bold text-neutral-400\\'>PDF</div>';">
              </div>
            \`).join('') + (boundAtts.length > 4 ? \`<span class="text-[10px] text-neutral-400 font-bold self-center">+更多\${boundAtts.length - 4}份</span>\` : '')
          : '<span class="text-neutral-400 text-[11px]">暂无绑定文件原件</span>';

        return \`
        <div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-5 space-y-4 flex flex-col justify-between shadow-sm">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <!-- 收租缴费状态胶囊 (最核心财务警示) -->
              <div class="flex items-center gap-1.5 flex-wrap">
                \${
                  l.status === 'TERMINATED'
                    ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">○ 已退租结清</span>'
                    : l.isPayOverdue
                    ? \`<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>欠租超期 \${l.payOverdueDays || Math.abs(l.daysToNextPay || 0)} 天</span>\`
                    : (l.daysToNextPay !== null && l.daysToNextPay !== undefined && l.daysToNextPay <= 7)
                    ? \`<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">⚡ \${l.daysToNextPay === 0 ? '今日应收租' : '距交租 ' + l.daysToNextPay + ' 天'}</span>\`
                    : '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">✓ 租金已结清</span>'
                }
                \${
                  l.unpaidUtilityAmount && l.unpaidUtilityAmount > 0
                    ? \`<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1">🔴 水电欠费 ¥\${Number(l.unpaidUtilityAmount).toFixed(2)} (\${l.unpaidUtilityCount}笔)</span>\`
                    : ''
                }
                \${
                  l.status === 'ACTIVE' && l.isOverdue
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">⚠️ 合同已到期</span>'
                    : ''
                }
              </div>

              <!-- 合同租期倒计时 -->
              <span class="text-xs font-bold \${l.isOverdue ? 'text-rose-500' : 'text-neutral-400'} flex-shrink-0">
                \${l.status === 'TERMINATED' ? '已归档' : ('合同：' + (l.remainingText || ''))}
              </span>
            </div>

            <div>
              <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">\${l.title}</h3>
              <p class="text-xs text-neutral-400 mt-0.5">\${l.address}</p>
            </div>

            <div class="p-3.5 m3-subcard bg-[#E8EDE9]/60 dark:bg-[#161D1A] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-neutral-400">承租人：</span>
                <strong class="text-neutral-800 dark:text-neutral-200">\${l.tenant_name || '未填'}</strong>
              </div>
              <div>
                <span class="text-neutral-400">联系手机：</span>
                <a href="tel:\${l.tenant_phone}" class="text-[#0F5B38] dark:text-[#7CDCA0] font-mono font-bold underline">\${l.tenant_phone || '--'}</a>
              </div>
              <div>
                <span class="text-neutral-400">租期：</span>
                <span class="font-bold font-mono text-[11px]">\${l.start_date} ~ \${l.end_date}</span>
              </div>
              <div>
                <span class="text-neutral-400">月租金：</span>
                <strong class="text-[#0F5B38] dark:text-[#7CDCA0] text-sm">¥ \${l.rent_amount}</strong>
                <span class="text-[10px] text-neutral-400">/ \${l.pay_cycle_months == 12 ? '年付' : l.pay_cycle_months == 6 ? '半年付' : l.pay_cycle_months == 1 ? '月付' : '季付'}</span>
              </div>
              <div class="col-span-2 text-neutral-400 text-[11px] border-t border-[#D7DED9]/60 dark:border-[#26312B]/60 pt-1.5 flex items-center justify-between">
                <span>电单价 ¥\${l.meter_electric_price || 1.0} · 水单价 ¥\${l.meter_water_price || 3.5}</span>
                <span>下次收租：<strong class="\${l.isPayOverdue ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-neutral-700 dark:text-neutral-200'}">\${l.next_pay_date || '未设'}\${l.isPayOverdue ? ' (!已超期)' : ''}</strong></span>
              </div>
            </div>

            <!-- 文件缩略条 -->
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-neutral-400">已绑加密文件 (\${boundAtts.length}份)：</span>
                <button onclick="openUploadForLease('\${l.id}')" class="text-[#0F5B38] dark:text-[#7CDCA0] font-bold hover:underline">+ 绑定新文件</button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                \${attThumbnails}
              </div>
            </div>
          </div>

          <!-- 房东核心业务操作按钮条 (一键收租/续约/结清/复制) -->
          <div class="pt-3 border-t border-[#E8EDE9] dark:border-[#26312B]/60 space-y-2">
            <div class="flex items-center gap-2">
              <button onclick="quickCollectRent('\${l.id}')" class="flex-1 py-2 m3-pill bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm flex items-center justify-center gap-1">
                <span>⚡</span> 一键收租
              </button>
              <button onclick="openUtilityModal('\${l.id}', 'ELECTRICITY')" class="flex-1 py-2 m3-pill bg-[#C4EED0]/60 dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] hover:opacity-85 text-xs font-bold flex items-center justify-center gap-1">
                <span>⚡</span> 抄表计费
              </button>
              <button onclick="openRenewModal('\${l.id}')" class="py-2 px-3 m3-pill bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 text-xs font-bold flex items-center justify-center gap-1">
                <span>🔄</span> 续约
              </button>
              <button onclick="openCheckoutModal('\${l.id}')" class="py-2 px-2.5 m3-pill bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-500 dark:text-neutral-400 hover:text-rose-600 text-xs font-bold" title="退租结清">
                退租
              </button>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <button onclick="copyTenantMemo('\${l.id}')" class="text-neutral-400 hover:text-[#0F5B38] dark:hover:text-[#7CDCA0] font-bold text-[11px] flex items-center gap-1">
                📋 复制交租提醒
              </button>
              <div class="flex items-center gap-1">
                <button onclick="openEditLeaseModal('\${l.id}')" class="text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold px-2 py-1 rounded-full">
                  编辑
                </button>
                <button onclick="deleteLease('\${l.id}')" class="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-full">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      \`;}).join('');
    }

    // 复制交租提醒到剪贴板
    function copyTenantMemo(leaseId) {
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;
      const cycleText = l.pay_cycle_months == 12 ? '年付' : l.pay_cycle_months == 6 ? '半年付' : l.pay_cycle_months == 1 ? '月付' : '季付';
      let statusHint = '提醒您注意交租';
      if (l.next_pay_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pDate = new Date(l.next_pay_date);
        pDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((pDate.getTime() - today.getTime()) / 86400000);
        if (diffDays < 0) {
          statusHint = \`您的房租已逾期 \${Math.abs(diffDays)} 天，请尽快补缴\`;
        } else if (diffDays === 0) {
          statusHint = '今日为交租截止日，提醒您注意交租';
        } else if (diffDays <= 7) {
          statusHint = \`房租还剩 \${diffDays} 天到期，提醒您注意交租\`;
        } else {
          statusHint = \`下期交租日为 \${l.next_pay_date}（距今约 \${diffDays} 天），特此同步租约明细\`;
        }
      }
      const text = \`【房租交费提醒】\\n\${l.tenant_name || '租客'}您好，\${statusHint}，明细如下：\\n・ 房源：\${l.title}\\n・ 租金标准：¥\${l.rent_amount} / 月 (\${cycleText})\\n・ 交租日期：\${l.next_pay_date || '未设置'}\\n・ 水电标准：电费 ¥\${l.meter_electric_price || 1.0}/度，水费 ¥\${l.meter_water_price || 3.5}/吨\\n转账后麻烦发一下截图方便记账核销，祝生活愉快，谢谢配合！\`;
      
      navigator.clipboard.writeText(text).then(() => {
        alert('✓ 已复制交租提醒！可以直接粘贴发送给租客。');
      }).catch(() => {
        prompt('请长按复制交租提醒：', text);
      });
    }

    // 打开快捷续约弹窗
    function openRenewModal(leaseId) {
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;

      document.getElementById('renewLeaseId').value = l.id;
      document.getElementById('renewLeaseTitle').innerText = l.title;
      document.getElementById('renewLeaseInfo').innerText = \`原租期：\${l.start_date} ~ \${l.end_date} · 承租人：\${l.tenant_name || '未填'}\`;
      document.getElementById('renewNewRent').value = l.rent_amount || '';
      
      selectRenewMonths(12);
      openModal('renewModal');
    }

    function selectRenewMonths(months) {
      document.querySelectorAll('.renew-btn').forEach(btn => {
        const isSelected = parseInt(btn.dataset.months, 10) === months;
        btn.className = isSelected
          ? 'renew-btn m3-pill py-2 font-bold text-xs bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]'
          : 'renew-btn m3-pill py-2 font-bold text-xs bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300';
      });

      const leaseId = document.getElementById('renewLeaseId').value;
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;

      const oldEnd = new Date(l.end_date);
      if (!isNaN(oldEnd.getTime())) {
        const newEnd = new Date(oldEnd);
        newEnd.setMonth(newEnd.getMonth() + months);
        const y = newEnd.getFullYear();
        const m = String(newEnd.getMonth() + 1).padStart(2, '0');
        const d = String(newEnd.getDate()).padStart(2, '0');
        document.getElementById('renewNewEndDate').value = \`\${y}-\${m}-\${d}\`;

        // 计算续约后的下次收租日：若原下次收租日在未来则保持，若已过期则合理推算
        const todayStr = new Date().toISOString().slice(0, 10);
        let targetPayDate = l.next_pay_date;
        if (!targetPayDate || targetPayDate < todayStr) {
          targetPayDate = (l.end_date && l.end_date >= todayStr) ? l.end_date : todayStr;
        }
        document.getElementById('renewNewPayDate').value = targetPayDate;
      }
    }

    let isSubmittingRenew = false;
    async function submitRenewLease() {
      if (isSubmittingRenew) return;
      const leaseId = document.getElementById('renewLeaseId').value;
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;

      const newEnd = document.getElementById('renewNewEndDate').value;
      const newPayDate = document.getElementById('renewNewPayDate').value;
      const newRent = document.getElementById('renewNewRent').value;

      if (!newEnd) return alert('请选择新的到期日期');

      const btn = document.getElementById('submitRenewBtn');
      isSubmittingRenew = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在保存续期...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        const payload = {
          ...l,
          end_date: newEnd,
          next_pay_date: newPayDate || l.next_pay_date,
          rent_amount: newRent ? Number(newRent) : l.rent_amount,
          status: 'ACTIVE'
        };

        const res = await fetch('/api/leases/' + leaseId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          closeModal('renewModal');
          loadDashboard();
          loadLeases();
          alert('🎉 房源租约续期成功！已自动激活并重算到期状态。');
        } else {
          alert(json.message || '续期失败');
        }
      } catch (err) {
        alert('续期失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingRenew = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    // 打开退租结清弹窗
    function openCheckoutModal(leaseId) {
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;

      document.getElementById('checkoutLeaseId').value = l.id;
      document.getElementById('checkoutLeaseTitle').innerText = l.title;
      document.getElementById('checkoutLeaseDeposit').innerText = '在押押金：¥ ' + (l.deposit_amount || 0);
      document.getElementById('checkoutRefundDeposit').value = l.deposit_amount || 0;
      document.getElementById('checkoutRemark').value = '';
      openModal('checkoutModal');
    }

    let isSubmittingCheckout = false;
    async function submitCheckoutLease() {
      if (isSubmittingCheckout) return;
      const leaseId = document.getElementById('checkoutLeaseId').value;
      const l = appData.leases.find(item => item.id === leaseId);
      if (!l) return;

      const refund = document.getElementById('checkoutRefundDeposit').value;
      const remark = document.getElementById('checkoutRemark').value;

      if (!confirm('确定为该租客办理退租结清吗？\\n结清后状态将变更为 TERMINATED。')) return;

      const btn = document.getElementById('submitCheckoutBtn');
      isSubmittingCheckout = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在办理结清...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        // 1. 更新房源状态为 TERMINATED
        const leasePayload = {
          ...l,
          status: 'TERMINATED',
          notes: (l.notes ? l.notes + ' | ' : '') + '已退租结清: ' + (remark || '正常退房')
        };

        await fetch('/api/leases/' + leaseId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leasePayload)
        });

        // 2. 如果填写了退还押金，记录一笔退还记录
        if (refund && Number(refund) > 0) {
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lease_id: leaseId,
              payment_type: 'DEPOSIT',
              amount: -Math.abs(Number(refund)),
              paid_at: new Date().toISOString().slice(0, 10),
              remark: '退还押金: ' + (remark || '退房结清')
            })
          });
        }

        closeModal('checkoutModal');
        loadDashboard();
        loadLeases();
        loadPayments();
        alert('✓ 房源退租结清手续已完成！');
      } catch (err) {
        alert('办理退租失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingCheckout = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    // 快捷从卡片绑定上传凭证
    function openUploadForLease(leaseId) {
      ensureLeaseDropdowns().then(() => {
        document.getElementById('uploadLeaseId').value = leaseId;
        openModal('uploadModal');
      });
    }

    // 智能校准：当用户修改起租日或选择交租周期时，自动推算到期日并校准下次收租日
    function onStartDateOrCycleChange() {
      const startInput = document.getElementById('leaseStartDate').value;
      if (!startInput) return;
      const cycleMonths = parseInt(document.getElementById('leasePayCycle').value, 10) || 12;
      
      const start = new Date(startInput);
      if (isNaN(start.getTime())) return;
      
      const end = new Date(start);
      end.setMonth(end.getMonth() + cycleMonths);
      end.setDate(end.getDate() - 1);

      const y = end.getFullYear();
      const m = String(end.getMonth() + 1).padStart(2, '0');
      const d = String(end.getDate()).padStart(2, '0');
      document.getElementById('leaseEndDate').value = y + '-' + m + '-' + d;

      calibrateNextPay('END_PLUS_1');
    }

    function onEndDateChange() {
      calibrateNextPay('END_PLUS_1');
    }

    // 智能收租日快捷校准 (支持到期下一年、合同到期日、最近周期、起租周期)
    function calibrateNextPay(mode) {
      const endInput = document.getElementById('leaseEndDate')?.value;
      const startInput = document.getElementById('leaseStartDate')?.value;
      const cycleMonths = parseInt(document.getElementById('leasePayCycle')?.value, 10) || 12;
      const nextPayEl = document.getElementById('leaseNextPayDate');
      if (!nextPayEl) return;

      if (mode === 'END_PLUS_1') {
        // 核心智能校准：自动校准到到期日的下一年 (如 2026/09/24 -> 2027/09/24)
        if (endInput) {
          const d = new Date(endInput);
          if (!isNaN(d.getTime())) {
            d.setFullYear(d.getFullYear() + 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            nextPayEl.value = y + '-' + m + '-' + day;
            return;
          }
        }
      } else if (mode === 'END_EXACT') {
        if (endInput) {
          nextPayEl.value = endInput;
          return;
        }
      } else if (mode === 'RECENT_CYCLE') {
        if (startInput) {
          const start = new Date(startInput);
          const now = new Date();
          if (!isNaN(start.getTime())) {
            let cur = new Date(start);
            while (cur <= now) {
              cur.setMonth(cur.getMonth() + cycleMonths);
            }
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const day = String(cur.getDate()).padStart(2, '0');
            nextPayEl.value = y + '-' + m + '-' + day;
            return;
          }
        }
      } else if (mode === 'START_CYCLE') {
        if (startInput) {
          const start = new Date(startInput);
          if (!isNaN(start.getTime())) {
            const cur = new Date(start);
            cur.setMonth(cur.getMonth() + cycleMonths);
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const day = String(cur.getDate()).padStart(2, '0');
            nextPayEl.value = y + '-' + m + '-' + day;
            return;
          }
        }
      }
    }

    function applyPeriodMonths(months) {
      const startInput = document.getElementById('leaseStartDate').value;
      if (!startInput) return alert('请先选择起租日期');
      const start = new Date(startInput);
      if (isNaN(start.getTime())) return;
      
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      end.setDate(end.getDate() - 1);

      const y = end.getFullYear();
      const m = String(end.getMonth() + 1).padStart(2, '0');
      const d = String(end.getDate()).padStart(2, '0');
      document.getElementById('leaseEndDate').value = y + '-' + m + '-' + d;

      calibrateNextPay('END_PLUS_1');
    }

    function openAddLeaseModal() {
      document.getElementById('leaseModalTitle').innerText = '录入出租房源';
      document.getElementById('editingLeaseId').value = '';
      document.getElementById('leaseTitle').value = '';
      document.getElementById('leaseAddress').value = '';
      document.getElementById('leaseTenantName').value = '';
      document.getElementById('leaseTenantPhone').value = '';
      document.getElementById('leaseTenantIdCard').value = '';
      document.getElementById('leaseStartDate').value = new Date().toISOString().slice(0, 10);
      document.getElementById('leasePayCycle').value = '12'; // 默认年付
      onStartDateOrCycleChange();
      document.getElementById('leaseRentAmount').value = '';
      document.getElementById('leaseDepositAmount').value = '';
      document.getElementById('meterElecPrice').value = '1.0';
      document.getElementById('meterWaterPrice').value = '3.5';
      document.getElementById('meterElecBase').value = '';
      document.getElementById('meterWaterBase').value = '';
      document.getElementById('leaseStatus').value = 'ACTIVE';
      document.getElementById('leaseNotes').value = '';
      openModal('leaseModal');
    }

    function openEditLeaseModal(id) {
      const lease = appData.leases.find(l => l.id === id);
      if (!lease) return;
      document.getElementById('leaseModalTitle').innerText = '修改出租房源';
      document.getElementById('editingLeaseId').value = lease.id;
      document.getElementById('leaseTitle').value = lease.title;
      document.getElementById('leaseAddress').value = lease.address;
      document.getElementById('leaseTenantName').value = lease.tenant_name || '';
      document.getElementById('leaseTenantPhone').value = lease.tenant_phone || '';
      document.getElementById('leaseTenantIdCard').value = lease.tenant_id_card || '';
      document.getElementById('leaseStartDate').value = lease.start_date;
      document.getElementById('leaseEndDate').value = lease.end_date;
      document.getElementById('leaseRentAmount').value = lease.rent_amount;
      document.getElementById('leaseDepositAmount').value = lease.deposit_amount;
      document.getElementById('leasePayCycle').value = lease.pay_cycle_months || 12;
      document.getElementById('meterElecPrice').value = lease.meter_electric_price || 1.0;
      document.getElementById('meterWaterPrice').value = lease.meter_water_price || 3.5;
      document.getElementById('meterElecBase').value = lease.meter_electric_base || '';
      document.getElementById('meterWaterBase').value = lease.meter_water_base || '';
      document.getElementById('leaseStatus').value = lease.status || 'ACTIVE';
      document.getElementById('leaseNextPayDate').value = lease.next_pay_date || '';
      document.getElementById('leaseNotes').value = lease.notes || '';
      openModal('leaseModal');
    }

    let isSubmittingLease = false;
    async function submitLease() {
      if (isSubmittingLease) return;

      const editingId = document.getElementById('editingLeaseId').value;
      const title = document.getElementById('leaseTitle').value.trim();
      const address = document.getElementById('leaseAddress').value.trim();
      const tenant_name = document.getElementById('leaseTenantName').value.trim();
      const tenant_phone = document.getElementById('leaseTenantPhone').value.trim();
      const tenant_id_card = document.getElementById('leaseTenantIdCard').value.trim();
      const start_date = document.getElementById('leaseStartDate').value;
      const end_date = document.getElementById('leaseEndDate').value;
      const rent_amount = document.getElementById('leaseRentAmount').value;
      const deposit_amount = document.getElementById('leaseDepositAmount').value;
      const pay_cycle_months = document.getElementById('leasePayCycle').value;
      const meter_electric_price = document.getElementById('meterElecPrice').value;
      const meter_water_price = document.getElementById('meterWaterPrice').value;
      const meter_electric_base = document.getElementById('meterElecBase').value;
      const meter_water_base = document.getElementById('meterWaterBase').value;
      const status = document.getElementById('leaseStatus').value;
      const next_pay_date = document.getElementById('leaseNextPayDate').value;
      const notes = document.getElementById('leaseNotes').value.trim();

      if (!title || !address || !start_date || !end_date || !rent_amount) {
        return alert('请完整填写必填项（房屋名称、地址、起止日期、租金）');
      }

      const payload = {
        title, address, tenant_name, tenant_phone,
        tenant_id_card,
        start_date, end_date, rent_amount, deposit_amount,
        pay_cycle_months, meter_electric_price, meter_water_price,
        meter_electric_base, meter_water_base, status, next_pay_date, notes
      };

      const btn = document.getElementById('submitLeaseBtn');
      isSubmittingLease = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在保存房源...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        const url = editingId ? \`/api/leases/\${editingId}\` : '/api/leases';
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          closeModal('leaseModal');
          loadDashboard();
          loadLeases();
        } else {
          alert(json.message || '保存失败');
        }
      } catch (err) {
        alert('保存失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingLease = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    async function deleteLease(id) {
      if (!confirm('确定彻底删除该房源及其所有关联账单吗？')) return;
      await fetch('/api/leases/' + id, { method: 'DELETE' });
      loadLeases();
      loadDashboard();
    }

    // ==================== ⚡ 水电抄表与杂费结算 (智能底数滚存与实时核算) ====================
    async function openUtilityModal(leaseId, defaultType = 'ELECTRICITY') {
      await ensureLeaseDropdowns();
      if (!appData.leases || appData.leases.length === 0) return alert('请先录入出租房源');

      const targetId = leaseId || document.getElementById('utilLeaseId').value || appData.leases[0].id;
      document.getElementById('editingUtilityId').value = '';
      document.getElementById('utilLeaseId').value = targetId;
      document.getElementById('utilityModalTitle').innerHTML = '<span>⚡</span> <span>水电抄表与杂费结算</span>';
      document.getElementById('utilPaidAt').value = getNowDateTimeLocal();
      document.getElementById('utilAmount').value = '';
      document.getElementById('utilRemark').value = '';
      document.getElementById('utilMeterCurrent').value = '';
      switchUtilAttMode('upload');
      const utilReceipt = document.getElementById('utilReceiptFile');
      if (utilReceipt) utilReceipt.value = '';
      populateExistingAttDropdown('utilExistingAttSelect', targetId);

      const radioPaid = document.getElementById('utilStatus_PAID');
      if (radioPaid) radioPaid.checked = true;

      selectUtilType(defaultType);
      openModal('utilityModal');
    }

    function selectUtilType(type) {
      document.getElementById('utilType').value = type;

      // 更新芯片状态
      document.querySelectorAll('.util-type-chip').forEach(chip => {
        chip.className = 'util-type-chip m3-pill py-2 text-xs font-medium bg-[#E8EDE9] text-neutral-700 dark:bg-[#161D1A] dark:text-neutral-300 flex items-center justify-center gap-1';
      });
      const activeChip = document.getElementById('utilChip_' + type);
      if (activeChip) {
        activeChip.className = 'util-type-chip m3-pill py-2 text-xs font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] flex items-center justify-center gap-1';
      }

      const meterBox = document.getElementById('utilMeterBox');
      const isMeter = (type === 'ELECTRICITY' || type === 'WATER');
      if (isMeter) {
        meterBox.classList.remove('hidden');
        if (type === 'ELECTRICITY') {
          document.getElementById('utilPriceUnit').innerText = '元/度';
          document.getElementById('utilUsageUnit').innerText = '度';
        } else {
          document.getElementById('utilPriceUnit').innerText = '元/吨';
          document.getElementById('utilUsageUnit').innerText = '吨';
        }
      } else {
        meterBox.classList.add('hidden');
      }

      onUtilLeaseChange();
    }

    function onUtilLeaseChange() {
      const leaseId = document.getElementById('utilLeaseId').value;
      const target = (appData.leases || []).find(l => l.id === leaseId);
      const type = document.getElementById('utilType').value;
      if (!target) return;

      if (type === 'ELECTRICITY') {
        document.getElementById('utilMeterUnitPrice').value = target.meter_electric_price || 1.0;
        document.getElementById('utilMeterLast').value = (target.meter_electric_base !== null && target.meter_electric_base !== undefined) ? target.meter_electric_base : '';
      } else if (type === 'WATER') {
        document.getElementById('utilMeterUnitPrice').value = target.meter_water_price || 3.5;
        document.getElementById('utilMeterLast').value = (target.meter_water_base !== null && target.meter_water_base !== undefined) ? target.meter_water_base : '';
      }
      calcUtilMeterCost();
    }

    function calcUtilMeterCost() {
      const type = document.getElementById('utilType').value;
      if (type !== 'ELECTRICITY' && type !== 'WATER') return;

      const last = parseFloat(document.getElementById('utilMeterLast').value) || 0;
      const curr = parseFloat(document.getElementById('utilMeterCurrent').value) || 0;
      const price = parseFloat(document.getElementById('utilMeterUnitPrice').value) || 0;

      const warnEl = document.getElementById('utilMeterWarning');
      if (curr > 0 && curr < last) {
        if (warnEl) warnEl.classList.remove('hidden');
      } else {
        if (warnEl) warnEl.classList.add('hidden');
      }

      const usage = Math.max(0, curr - last);
      const total = (usage * price).toFixed(2);

      document.getElementById('utilCalcUsage').innerText = usage.toFixed(1);
      document.getElementById('utilCalcTotal').innerText = '¥ ' + total;

      const unit = type === 'ELECTRICITY' ? '度' : '吨';
      const name = type === 'ELECTRICITY' ? '电费' : '水费';

      if (curr > 0) {
        document.getElementById('utilAmount').value = total;
        if (!document.getElementById('utilRemark').value) {
          document.getElementById('utilRemark').placeholder = name + ' (底数 ' + last + ' → ' + curr + '，用量 ' + usage.toFixed(1) + unit + ')';
        }
      }
    }

    function copyUtilityBillNotice() {
      const leaseId = document.getElementById('utilLeaseId').value;
      const target = (appData.leases || []).find(l => l.id === leaseId);
      const type = document.getElementById('utilType').value;
      const amount = document.getElementById('utilAmount').value || '0.00';
      const rawPaidAt = document.getElementById('utilPaidAt').value || '';
      const paidAt = rawPaidAt.replace('T', ' ') || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const remark = document.getElementById('utilRemark').value || document.getElementById('utilRemark').placeholder || '';

      const typeName = getPaymentTypeName(type);
      const tenantName = (target && target.tenant_name ? target.tenant_name : '租客');
      let detailText = '';

      if (type === 'ELECTRICITY' || type === 'WATER') {
        const last = document.getElementById('utilMeterLast').value || '0';
        const curr = document.getElementById('utilMeterCurrent').value || '0';
        const usage = document.getElementById('utilCalcUsage').innerText || '0';
        const price = document.getElementById('utilMeterUnitPrice').value || '0';
        const unit = type === 'ELECTRICITY' ? '度' : '吨';
        detailText = '・ 抄表读数：上期 ' + last + ' -> 本期 ' + curr + '，实用 ' + usage + ' ' + unit + ' (¥' + price + '/' + unit + ')\\n';
      }

      const text = '【' + typeName + '账单】\\n' +
        '您好 ' + tenantName + '，本期【' + (target ? target.title : '房源') + '】' + typeName + '已结算，明细如下：\\n' +
        detailText +
        '・ 应付金额：¥' + Number(amount).toFixed(2) + '\\n' +
        '・ 抄表/记账时间：' + paidAt + '\\n' +
        (remark ? ('・ 备注说明：' + remark + '\\n') : '') +
        '核对无误后转账即可，转完麻烦发下截图，谢谢配合！';

      navigator.clipboard.writeText(text).then(() => {
        alert('✓ 已复制水电账单！可直接发微信给租客。');
      }).catch(() => {
        prompt('请复制以下水电账单明细：', text);
      });
    }

    async function loadPayments() {
      const res = await fetch('/api/payments');
      const json = await res.json();
      if (json.code === 0) {
        appData.allPayments = json.data || [];
        const unpaidCount = appData.allPayments.filter(p => p.status === 'UNPAID').length;
        const unpaidBadge = document.getElementById('countPaymentsUnpaid');
        if (unpaidBadge) unpaidBadge.innerText = unpaidCount;
        updatePaymentMonthOptions();
        filterPayments();
      }
    }

    function updatePaymentMonthOptions() {
      const select = document.getElementById('paymentMonthFilter');
      if (!select) return;
      const currentVal = select.value;
      const monthsMap = {};
      (appData.allPayments || []).forEach(p => {
        if (p.paid_at && p.paid_at.length >= 7) {
          const ym = p.paid_at.slice(0, 7);
          monthsMap[ym] = (monthsMap[ym] || 0) + 1;
        }
      });
      const sortedMonths = Object.keys(monthsMap).sort().reverse();
      
      let html = '<option value="ALL">🗓️ 全部月份</option>';
      sortedMonths.forEach(ym => {
        const parts = ym.split('-');
        const label = parts[0] + '年' + parts[1] + '月 (' + monthsMap[ym] + '笔)';
        html += '<option value="' + ym + '">' + label + '</option>';
      });
      select.innerHTML = html;
      if (currentVal && (currentVal === 'ALL' || monthsMap[currentVal])) {
        select.value = currentVal;
      } else {
        select.value = 'ALL';
      }
    }

    function setPaymentTypeFilter(type) {
      appData.currentPaymentTypeFilter = type;
      document.querySelectorAll('.pay-filter-chip').forEach(chip => {
        chip.className = 'pay-filter-chip m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300';
      });
      const activeChip = document.getElementById('payChip_' + type);
      if (activeChip) {
        if (type === 'UNPAID') {
          activeChip.className = 'pay-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-rose-600 text-white dark:bg-rose-500 dark:text-white';
        } else {
          activeChip.className = 'pay-filter-chip m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]';
        }
      }
      filterPayments();
    }

    function filterPayments() {
      const keyword = (document.getElementById('paymentSearchInput')?.value || '').trim().toLowerCase();
      const monthFilter = document.getElementById('paymentMonthFilter')?.value || 'ALL';
      const filterType = appData.currentPaymentTypeFilter || 'ALL';

      const filtered = (appData.allPayments || []).filter(p => {
        if (monthFilter !== 'ALL') {
          if (!p.paid_at || !p.paid_at.startsWith(monthFilter)) return false;
        }

        if (filterType === 'UNPAID') {
          if (p.status !== 'UNPAID') return false;
        } else if (filterType !== 'ALL') {
          if (filterType === 'OTHER') {
            if (['RENT', 'ELECTRICITY', 'WATER', 'DEPOSIT'].includes(p.payment_type)) return false;
          } else if (p.payment_type !== filterType) {
            return false;
          }
        }

        if (keyword) {
          const matchTitle = (p.lease_title || '').toLowerCase().includes(keyword);
          const matchTenant = (p.tenant_name || '').toLowerCase().includes(keyword);
          const matchRemark = (p.remark || '').toLowerCase().includes(keyword);
          if (!matchTitle && !matchTenant && !matchRemark) return false;
        }

        return true;
      });

      appData.filteredPayments = filtered;

      // 计算当前筛选金额：区分实收与待收欠款
      let paidSum = 0;
      let unpaidSum = 0;
      filtered.forEach(p => {
        const amt = Number(p.amount) || 0;
        if (p.status === 'UNPAID') {
          unpaidSum += amt;
        } else {
          paidSum += amt;
        }
      });

      let sumHtml = '实收 ¥ ' + paidSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (unpaidSum > 0) {
        sumHtml += ' <span class="text-rose-600 dark:text-rose-400 font-bold ml-1.5">(待收欠款 ¥ ' + unpaidSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ')</span>';
      }
      const sumEl = document.getElementById('filteredPaymentsSum');
      if (sumEl) sumEl.innerHTML = sumHtml;

      renderPaymentsList(filtered);
    }

    function exportPaymentsToCsv() {
      const payments = appData.filteredPayments || appData.allPayments || [];
      if (payments.length === 0) {
        alert('当前没有可导出的账单记录');
        return;
      }

      function escapeCsv(val) {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return '"' + str + '"';
      }

      const headers = [
        '账单ID',
        '记账时间',
        '房源名称',
        '承租人',
        '费用类型',
        '金额(元)',
        '结算状态',
        '上次底数',
        '本次底数',
        '实抄用量',
        '单价(元)',
        '费用说明与备注'
      ];

      const rows = payments.map(p => {
        const typeName = getPaymentTypeName(p.payment_type);
        const statusText = p.status === 'UNPAID' ? '🔴 待缴欠费' : (Number(p.amount) < 0 ? '已退款' : '已结清');
        return [
          escapeCsv(p.id),
          escapeCsv(p.paid_at || ''),
          escapeCsv(p.lease_title || ''),
          escapeCsv(p.tenant_name || ''),
          escapeCsv(typeName),
          escapeCsv(Number(p.amount || 0).toFixed(2)),
          escapeCsv(statusText),
          escapeCsv(p.meter_last !== null && p.meter_last !== undefined ? p.meter_last : ''),
          escapeCsv(p.meter_current !== null && p.meter_current !== undefined ? p.meter_current : ''),
          escapeCsv(p.meter_usage !== null && p.meter_usage !== undefined ? p.meter_usage : ''),
          escapeCsv(p.unit_price !== null && p.unit_price !== undefined ? p.unit_price : ''),
          escapeCsv(p.remark || '')
        ].join(',');
      });

      // 使用 UTF-8 BOM 确保 Windows Excel 打开中文不乱码
      const bom = String.fromCharCode(0xFEFF);
      const csvContent = bom + [headers.map(escapeCsv).join(','), ...rows].join(String.fromCharCode(13, 10));
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const nowStr = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RentHub_收租台账_' + nowStr + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function renderPaymentsList(payments) {
      const table = document.getElementById('allPaymentsTable');
      if (payments.length === 0) {
        table.innerHTML = '<div class="p-8 text-center text-xs text-neutral-400">没有符合条件的账单记录</div>';
        return;
      }
      table.innerHTML = payments.map(function(p) {
        var isRent = p.payment_type === 'RENT';
        var isElec = p.payment_type === 'ELECTRICITY';
        var isWater = p.payment_type === 'WATER';
        var isDep = p.payment_type === 'DEPOSIT';
        var typeShort = isRent ? '租' : (isElec ? '电' : (isWater ? '水' : (isDep ? '押' : '杂')));
        var typeName = getPaymentTypeName(p.payment_type);
        var leaseTitle = p.lease_title || '房源';
        var isNegative = Number(p.amount) < 0;
        var isUnpaid = p.status === 'UNPAID';
        var amtColor = isNegative ? 'text-rose-500' : (isUnpaid ? 'text-rose-600 dark:text-rose-400' : 'text-[#0F5B38] dark:text-[#7CDCA0]');
        var statusHtml = isUnpaid 
          ? '<span class="text-rose-600 dark:text-rose-400 font-extrabold">🔴 待缴欠费</span>' 
          : (isNegative ? '<span class="text-neutral-400">已退款</span>' : '<span class="text-emerald-600 dark:text-emerald-400">已结清</span>');
        var settleBtn = isUnpaid 
          ? ('<button onclick="settlePayment(&apos;' + p.id + '&apos;)" title="标记为租客已结清" class="px-2.5 py-1 m3-pill bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] hover:opacity-85 text-[11px] font-bold flex items-center gap-1">✓ 结清</button>') 
          : '';
        var meterDesc = p.meter_usage ? (' · 底数 ' + p.meter_last + '→' + p.meter_current + ' (用量 ' + p.meter_usage + '，单价¥' + p.unit_price + ')') : '';
        var remarkDesc = p.remark ? (' · ' + p.remark) : '';

        var boundAtts = p.attachments || [];
        var attHtml = '';
        if (boundAtts.length > 0) {
          attHtml = '<div class="flex items-center gap-1.5 mt-1.5 flex-wrap">' +
            boundAtts.map(function(a) {
              var safeName = (a.file_name || '文件').replace(/'/g, '');
              return '<div onclick="openLightbox(&apos;/api/attachments/' + a.id + '/file&apos;, &apos;' + safeName + '&apos;, &apos;' + a.id + '&apos;)" class="w-8 h-8 rounded-xl bg-[#E8EDE9] dark:bg-[#161D1A] overflow-hidden border border-[#D7DED9]/60 dark:border-[#26312B]/60 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" title="' + a.file_name + '">' +
                '<img src="/api/attachments/' + a.id + '/file" alt="' + a.file_name + '" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML=&apos;<span class=\\\'text-[8px] font-bold text-neutral-400 block text-center leading-8\\\'>PDF</span>&apos;;">' +
              '</div>';
            }).join('') +
            '<button onclick="openUploadForPayment(&apos;' + p.id + '&apos;, &apos;' + (p.lease_id || '') + '&apos;, &apos;' + typeName + '&apos;)" class="text-[10px] font-bold text-[#0F5B38] dark:text-[#7CDCA0] bg-[#C4EED0]/60 dark:bg-[#1A402D]/60 hover:bg-[#C4EED0] px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-all" title="补传单据文件">+ 补传</button>' +
          '</div>';
        } else {
          attHtml = '<div class="mt-1">' +
            '<button onclick="openUploadForPayment(&apos;' + p.id + '&apos;, &apos;' + (p.lease_id || '') + '&apos;, &apos;' + typeName + '&apos;)" class="text-[10px] font-medium text-neutral-400 hover:text-[#0F5B38] dark:hover:text-[#7CDCA0] bg-[#E8EDE9]/60 dark:bg-[#161D1A] hover:bg-[#C4EED0]/50 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 transition-colors" title="绑定付款单据或转账截图">📎 关联文件</button>' +
          '</div>';
        }

        return '<div class="p-4 sm:p-5 flex items-center justify-between text-xs hover:bg-[#E8EDE9]/40 dark:hover:bg-[#161D1A]/60 transition-colors">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-9 h-9 rounded-full bg-[#E8EDE9] dark:bg-[#161D1A] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-extrabold text-xs flex-shrink-0">' + typeShort + '</div>' +
            '<div>' +
              '<div class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">' + typeName + ' · ' + leaseTitle + '</div>' +
              '<div class="text-neutral-400 mt-0.5">' + p.paid_at + meterDesc + remarkDesc + '</div>' +
              attHtml +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-3">' +
            '<div class="text-right">' +
              '<div class="font-extrabold text-sm ' + amtColor + ' font-mono">¥ ' + Number(p.amount).toFixed(2) + '</div>' +
              '<div class="text-[10px] font-bold">' + statusHtml + '</div>' +
            '</div>' +
            settleBtn +
            '<button onclick="openEditPaymentModal(&apos;' + p.id + '&apos;)" title="编辑" class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1.5 rounded-full hover:bg-[#E8EDE9] dark:hover:bg-[#161D1A]">✏️</button>' +
            '<button onclick="deletePayment(&apos;' + p.id + '&apos;)" title="删除" class="text-neutral-400 hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30">✕</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    async function settlePayment(id) {
      if (!confirm('确定将该笔费用标记为已结清付款吗？')) return;
      try {
        const res = await fetch('/api/payments/' + id + '/settle', { method: 'POST' });
        const json = await res.json();
        if (json.code === 0) {
          loadPayments();
          loadLeases();
          loadDashboard();
          alert('✓ 账单已成功标记为结清！房源欠费状态已同步更新。');
        } else {
          alert(json.message || '结算失败');
        }
      } catch (err) {
        alert('请求失败: ' + err.message);
      }
    }

    async function openAddPaymentModal() {
      // 兼容旧调用，直接打开水电抄表弹窗
      openUtilityModal();
    }

    async function openEditPaymentModal(id) {
      await ensureLeaseDropdowns();
      const pmt = appData.allPayments.find(p => p.id === id);
      if (!pmt) return;

      if (pmt.payment_type === 'RENT') {
        document.getElementById('rentPaymentId').value = pmt.id;
        document.getElementById('rentLeaseId').value = pmt.lease_id;
        document.getElementById('rentAmount').value = pmt.amount;
        document.getElementById('rentPaidAt').value = formatDateTimeForInput(pmt.paid_at);
        document.getElementById('rentRemark').value = pmt.remark || '';
        document.getElementById('rentNextPayDate').value = '';
        document.getElementById('quickRentTitle').innerHTML = '<span>✏️</span> <span>修改房租记录</span>';
        onRentLeaseChange();
        // 恢复原有金额和备注
        document.getElementById('rentAmount').value = pmt.amount;
        document.getElementById('rentRemark').value = pmt.remark || '';
        openModal('quickRentModal');
      } else {
        document.getElementById('editingUtilityId').value = pmt.id;
        document.getElementById('utilLeaseId').value = pmt.lease_id;
        selectUtilType(pmt.payment_type);
        document.getElementById('utilAmount').value = pmt.amount;
        document.getElementById('utilPaidAt').value = formatDateTimeForInput(pmt.paid_at);
        document.getElementById('utilRemark').value = pmt.remark || '';
        document.getElementById('utilMeterLast').value = pmt.meter_last || '';
        document.getElementById('utilMeterCurrent').value = pmt.meter_current || '';
        document.getElementById('utilMeterUnitPrice').value = pmt.unit_price || '1.0';

        const radioStatus = document.getElementById(pmt.status === 'UNPAID' ? 'utilStatus_UNPAID' : 'utilStatus_PAID');
        if (radioStatus) radioStatus.checked = true;

        calcUtilMeterCost();
        document.getElementById('utilityModalTitle').innerHTML = '<span>✏️</span> <span>修改水电/杂费记录</span>';
        openModal('utilityModal');
      }
    }

    let isSubmittingUtility = false;
    async function submitUtilityPayment() {
      if (isSubmittingUtility) return;

      const editingId = document.getElementById('editingUtilityId').value;
      const lease_id = document.getElementById('utilLeaseId').value;
      const payment_type = document.getElementById('utilType').value;
      const amount = document.getElementById('utilAmount').value;
      const paid_at = formatDateTimeForStorage(document.getElementById('utilPaidAt').value);
      const remark = document.getElementById('utilRemark').value || document.getElementById('utilRemark').placeholder || '';
      const status = document.querySelector('input[name="utilStatus"]:checked')?.value || 'PAID';

      const isMeter = (payment_type === 'ELECTRICITY' || payment_type === 'WATER');
      const meter_last = isMeter ? document.getElementById('utilMeterLast').value : '';
      const meter_current = isMeter ? document.getElementById('utilMeterCurrent').value : '';
      const unit_price = isMeter ? document.getElementById('utilMeterUnitPrice').value : '';
      const meter_usage = (isMeter && meter_current && meter_last) ? Math.max(0, parseFloat(meter_current) - parseFloat(meter_last)) : null;

      if (!lease_id) return alert('请选择关联房源');
      if (!amount || Number(amount) < 0) return alert('请完整填写有效的结算金额');
      if (!paid_at) return alert('请选择抄表或结算时间');

      const btn = document.getElementById('submitUtilityBtn');
      isSubmittingUtility = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在保存台账...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        const payload = {
          lease_id,
          payment_type,
          status,
          amount: Number(amount),
          paid_at,
          remark: remark.trim(),
          meter_last: meter_last ? Number(meter_last) : null,
          meter_current: meter_current ? Number(meter_current) : null,
          meter_usage,
          unit_price: unit_price ? Number(unit_price) : null
        };

        const url = editingId ? ('/api/payments/' + editingId) : '/api/payments';
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          const targetPaymentId = editingId || (json.data && json.data.id);
          const receiptFile = document.getElementById('utilReceiptFile')?.files?.[0];
          const existingAttId = document.getElementById('utilExistingAttSelect')?.value;

          if (utilAttMode === 'existing' && existingAttId && targetPaymentId) {
            try {
              await fetch('/api/attachments/bind', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachmentId: existingAttId, paymentId: targetPaymentId, leaseId: lease_id })
              });
            } catch (attErr) {
              console.warn('绑定已有文件未成功:', attErr);
            }
          } else if (utilAttMode === 'upload' && receiptFile && targetPaymentId) {
            try {
              const fd = new FormData();
              fd.append('file', receiptFile);
              fd.append('payment_id', targetPaymentId);
              fd.append('lease_id', lease_id);
              fd.append('category', 'RECEIPT');
              await fetch('/api/attachments/upload', { method: 'POST', body: fd });
            } catch (attErr) {
              console.warn('单据文件上传未成功:', attErr);
            }
          }

          closeModal('utilityModal');
          loadDashboard();
          loadPayments();
          loadLeases(); // 刷新租约以获得最新滚存底数和欠款标记
          loadAttachments();
          alert('✓ 水电杂费台账记录已保存！' + ((utilAttMode === 'upload' && receiptFile) || (utilAttMode === 'existing' && existingAttId) ? '（单据文件已关联绑定）' : ''));
        } else {
          alert(json.message || '保存失败');
        }
      } catch (err) {
        alert('提交失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingUtility = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    async function deletePayment(id) {
      if (!confirm('确定删除这条记账记录吗？')) return;
      await fetch('/api/payments/' + id, { method: 'DELETE' });
      loadPayments();
      loadDashboard();
    }

    // ==================== 📁 文件与单据中心 (多渠道加密存储) ====================
    let currentAttFilter = 'ALL';

    async function loadAttachments() {
      const res = await fetch('/api/attachments');
      const json = await res.json();
      if (json.code === 0) {
        appData.attachments = json.data || [];
        updateAttachmentFilterCounts();
        renderFilteredAttachments();
      }
    }

    function updateAttachmentFilterCounts() {
      const list = appData.attachments || [];
      const total = list.length;
      const d1Count = list.filter(a => a.storage_type === 'D1_LOCAL').length;
      const webdavCount = list.filter(a => a.storage_type === 'WEBDAV').length;
      const s3Count = list.filter(a => a.storage_type === 'S3').length;
      const leaseCount = list.filter(a => !a.payment_id).length;
      const paymentCount = list.filter(a => !!a.payment_id).length;

      const elAll = document.getElementById('attCount_ALL');
      if (elAll) elAll.innerText = total;
      const elD1 = document.getElementById('attCount_D1');
      if (elD1) elD1.innerText = d1Count;
      const elWd = document.getElementById('attCount_WEBDAV');
      if (elWd) elWd.innerText = webdavCount;
      const elS3 = document.getElementById('attCount_S3');
      if (elS3) elS3.innerText = s3Count;
      const elLease = document.getElementById('attCount_LEASE');
      if (elLease) elLease.innerText = leaseCount;
      const elPmt = document.getElementById('attCount_PAYMENT');
      if (elPmt) elPmt.innerText = paymentCount;
    }

    function filterAttachmentsBySource(source) {
      currentAttFilter = source;
      const chips = ['ALL', 'D1_LOCAL', 'WEBDAV', 'S3', 'LEASE', 'PAYMENT'];
      chips.forEach(c => {
        const btn = document.getElementById('attFilter_' + c);
        if (!btn) return;
        if (c === source) {
          btn.className = 'att-filter-chip m3-pill px-3 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] transition-all';
        } else {
          btn.className = 'att-filter-chip m3-pill px-3 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 hover:opacity-90 transition-all';
        }
      });
      renderFilteredAttachments();
    }

    function renderFilteredAttachments() {
      const gallery = document.getElementById('attachmentsGallery');
      if (!gallery) return;

      const keyword = (document.getElementById('attSearchInput')?.value || '').trim().toLowerCase();
      let list = appData.attachments || [];

      // 按渠道或分类过滤
      if (currentAttFilter === 'D1_LOCAL') {
        list = list.filter(a => a.storage_type === 'D1_LOCAL');
      } else if (currentAttFilter === 'WEBDAV') {
        list = list.filter(a => a.storage_type === 'WEBDAV');
      } else if (currentAttFilter === 'S3') {
        list = list.filter(a => a.storage_type === 'S3');
      } else if (currentAttFilter === 'LEASE') {
        list = list.filter(a => !a.payment_id);
      } else if (currentAttFilter === 'PAYMENT') {
        list = list.filter(a => !!a.payment_id);
      }

      // 按搜索词模糊匹配
      if (keyword) {
        list = list.filter(a => {
          const fn = (a.file_name || '').toLowerCase();
          const pth = (a.webdav_path || '').toLowerCase();
          return fn.includes(keyword) || pth.includes(keyword);
        });
      }

      if (list.length === 0) {
        gallery.innerHTML = '<div class="col-span-full m3-card bg-white dark:bg-[#1A211D] p-8 text-center text-xs text-neutral-400">未找到符合条件的文件，可尝试切换分类或点击右上角上传</div>';
        return;
      }

      gallery.innerHTML = list.map(function(a) {
        var typeBadge = a.payment_id 
          ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">💳 记账凭单</span>' 
          : '<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">🏠 房源资料</span>';
        
        var storageBadge = '';
        if (a.storage_type === 'S3') {
          storageBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">🪣 S3 存储</span>';
        } else if (a.storage_type === 'WEBDAV') {
          storageBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">☁️ WebDAV</span>';
        } else {
          storageBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-[#0F5B38] dark:bg-emerald-950 dark:text-[#7CDCA0] font-bold">💾 本地 D1</span>';
        }

        var pathHint = a.webdav_path 
          ? '<div class="text-[10px] text-neutral-400 font-mono truncate mt-0.5" title="' + a.webdav_path + '">路径: ' + a.webdav_path + '</div>'
          : '<div class="text-[10px] text-neutral-400 mt-0.5">本地 SQLite 数据库</div>';

        var safeName = (a.file_name || '文件').replace(/'/g, '');
        return '<div class="m3-card bg-white dark:bg-[#1A211D] border border-[#D7DED9]/50 dark:border-[#26312B]/60 p-3.5 space-y-2 flex flex-col justify-between shadow-sm">' +
          '<div onclick="openLightbox(&apos;/api/attachments/' + a.id + '/file&apos;, &apos;' + safeName + '&apos;, &apos;' + a.id + '&apos;)" class="aspect-square bg-[#E8EDE9] dark:bg-[#161D1A] rounded-[20px] overflow-hidden flex items-center justify-center relative group cursor-pointer">' +
            '<span class="text-2xl font-bold text-neutral-400">📄</span>' +
            '<img src="/api/attachments/' + a.id + '/file" alt="' + safeName + '" class="absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.onerror=null; this.classList.add(&apos;hidden&apos;);">' +
            '<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">' +
              '点击查看原件' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="flex items-center justify-between gap-1 mb-1">' +
              typeBadge + storageBadge +
            '</div>' +
            '<div class="text-xs font-bold truncate" title="' + a.file_name + '">' + a.file_name + '</div>' +
            pathHint +
            '<div class="text-[10px] text-neutral-400 mt-0.5">' + (a.file_size / 1024).toFixed(1) + ' KB</div>' +
          '</div>' +
          '<button onclick="deleteAttachment(&apos;' + a.id + '&apos;)" class="text-[11px] text-rose-500 hover:underline text-right self-end mt-1">' +
            '删除文件' +
          '</button>' +
        '</div>';
      }).join('');
    }

    function openLightbox(url, title, attId) {
      currentLightboxAttId = attId || null;
      document.getElementById('lightboxTitle').innerText = title;
      document.getElementById('lightboxImg').src = url;
      document.getElementById('lightboxDownload').href = url;
      const delBtn = document.getElementById('lightboxDeleteBtn');
      if (delBtn) delBtn.style.display = attId ? 'inline-flex' : 'none';
      openModal('lightboxModal');
    }

    function deleteCurrentLightboxAttachment() {
      if (currentLightboxAttId) {
        deleteAttachment(currentLightboxAttId);
      }
    }

    function onUploadStorageTypeChange() {
      const val = document.querySelector('input[name="uploadStorageType"]:checked')?.value || 'D1_LOCAL';
      const labelD1 = document.getElementById('uploadStorageLabel_D1');
      const labelWd = document.getElementById('uploadStorageLabel_WEBDAV');
      const labelS3 = document.getElementById('uploadStorageLabel_S3');
      const hint = document.getElementById('uploadStorageHint');

      const activeCls = 'flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-[#0F5B38] bg-[#C4EED0]/30 dark:bg-[#1A402D]/40 cursor-pointer text-center transition-all';
      const inactiveCls = 'flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#D7DED9]/60 dark:border-[#26312B]/60 bg-[#E8EDE9]/30 dark:bg-[#161D1A]/50 cursor-pointer text-center hover:border-neutral-400 transition-all';

      if (labelD1) labelD1.className = val === 'D1_LOCAL' ? activeCls : inactiveCls;
      if (labelWd) labelWd.className = val === 'WEBDAV' ? activeCls : inactiveCls;
      if (labelS3) labelS3.className = val === 'S3' ? activeCls : inactiveCls;

      if (hint) {
        if (val === 'D1_LOCAL') {
          hint.innerText = '✓ 文件将以 AES-256-GCM 强加密形式安全保存在 Cloudflare D1 数据库中，零外部依赖。';
          hint.className = 'mt-2 text-[11px] text-[#0F5B38] dark:text-[#7CDCA0] px-1 font-medium';
        } else if (val === 'WEBDAV') {
          hint.innerText = '✓ 文件将加密上传至远程 WebDAV 云盘（坚果云或通过 AList 挂载的阿里云盘/百度网盘等）。';
          hint.className = 'mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 px-1 font-medium';
        } else if (val === 'S3') {
          hint.innerText = '✓ 文件将加密上传至 S3 兼容对象存储桶（阿里云 OSS / 腾讯云 COS / Cloudflare R2 / 七牛云）。';
          hint.className = 'mt-2 text-[11px] text-sky-600 dark:text-sky-400 px-1 font-medium';
        }
      }
    }

    function setUploadModalStorageDefault() {
      const def = appData.default_storage || 'D1_LOCAL';
      const radio = document.querySelector('input[name="uploadStorageType"][value="' + def + '"]');
      if (radio) radio.checked = true;
      onUploadStorageTypeChange();
    }

    async function openUploadAttachmentModal() {
      await ensureLeaseDropdowns();
      const pid = document.getElementById('uploadPaymentId');
      if (pid) pid.value = '';
      const titleEl = document.getElementById('uploadModalTitle');
      if (titleEl) titleEl.innerText = '上传文件 / 关联附件';
      switchUploadModalTab('upload');
      setUploadModalStorageDefault();
      const curLease = document.getElementById('uploadLeaseId')?.value;
      populateExistingAttDropdown('uploadExistingAttSelect', curLease);
      openModal('uploadModal');
    }

    async function openUploadForPayment(paymentId, leaseId, desc) {
      await ensureLeaseDropdowns();
      const pid = document.getElementById('uploadPaymentId');
      if (pid) pid.value = paymentId || '';
      if (leaseId) {
        document.getElementById('uploadLeaseId').value = leaseId;
        if (document.getElementById('uploadExistingLeaseId')) {
          document.getElementById('uploadExistingLeaseId').value = leaseId;
        }
      }
      document.getElementById('uploadCategory').value = 'RECEIPT';
      document.getElementById('uploadFileInput').value = '';
      const titleEl = document.getElementById('uploadModalTitle');
      if (titleEl) titleEl.innerText = '关联记账单据 (' + (desc || '付款单据') + ')';
      switchUploadModalTab('upload');
      setUploadModalStorageDefault();
      populateExistingAttDropdown('uploadExistingAttSelect', leaseId);
      openModal('uploadModal');
    }

    let isSubmittingUpload = false;
    async function submitUpload() {
      if (isSubmittingUpload) return;

      if (uploadModalTab === 'existing') {
        const attId = document.getElementById('uploadExistingAttSelect')?.value;
        if (!attId) return alert('请选择要关联的已有文件');
        const leaseId = document.getElementById('uploadExistingLeaseId')?.value || document.getElementById('uploadLeaseId')?.value;
        const paymentId = document.getElementById('uploadPaymentId')?.value || null;

        const btn = document.getElementById('uploadSubmitBtn');
        isSubmittingUpload = true;
        btn.disabled = true;
        const originalText = btn.innerText;
        btn.innerText = '正在关联绑定...';
        btn.classList.add('opacity-50', 'pointer-events-none');

        try {
          const res = await fetch('/api/attachments/bind', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attachment_ids: [attId],
              lease_id: leaseId || undefined,
              payment_id: paymentId || undefined
            })
          });
          const json = await res.json();
          if (json.code === 0) {
            closeModal('uploadModal');
            loadAttachments();
            loadLeases();
            loadPayments();
            alert(json.message || '绑定成功！');
          } else {
            alert(json.message || '绑定失败');
          }
        } catch (err) {
          alert('绑定失败: ' + (err.message || String(err)));
        } finally {
          isSubmittingUpload = false;
          btn.disabled = false;
          btn.innerText = originalText;
          btn.classList.remove('opacity-50', 'pointer-events-none');
        }
        return;
      }

      // 模式A: 上传新文件
      const fileInput = document.getElementById('uploadFileInput');
      if (!fileInput.files || fileInput.files.length === 0) {
        return alert('请选择要上传的照片或 PDF 合同');
      }

      const btn = document.getElementById('uploadSubmitBtn');
      isSubmittingUpload = true;
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = '正在保存上传中...';
      btn.classList.add('opacity-50', 'pointer-events-none');

      try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('lease_id', document.getElementById('uploadLeaseId').value);
        formData.append('category', document.getElementById('uploadCategory').value);
        const paymentId = document.getElementById('uploadPaymentId')?.value;
        if (paymentId) formData.append('payment_id', paymentId);

        // 存储目标去向
        const chosenStorage = document.querySelector('input[name="uploadStorageType"]:checked')?.value;
        if (chosenStorage) {
          formData.append('storage_type', chosenStorage);
        }

        const res = await fetch('/api/attachments/upload', {
          method: 'POST',
          body: formData
        });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error('服务器响应异常: ' + (text.length > 80 ? text.slice(0, 80) + '...' : text));
        }
        if (json.code === 0) {
          closeModal('uploadModal');
          loadAttachments();
          loadLeases();
          loadPayments();
          fileInput.value = '';
          if (document.getElementById('uploadPaymentId')) document.getElementById('uploadPaymentId').value = '';
          alert(json.message);
        } else {
          alert(json.message || '上传未成功');
        }
      } catch (err) {
        alert('上传失败: ' + (err.message || String(err)));
      } finally {
        isSubmittingUpload = false;
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }

    async function deleteAttachment(id) {
      if (!confirm('确定删除这份文件吗？\\n\\n💡 提示：此操作仅删除文件本身，关联的房租、水电记账记录和房源都会完好保留，请放心。')) return;
      const res = await fetch('/api/attachments/' + id, { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 0) {
        closeModal('lightboxModal');
        loadAttachments();
        loadLeases();
        loadPayments();
        loadDashboard();
      } else {
        alert(json.message || '删除文件失败');
      }
    }

    // ==================== 📧 待收提醒与邮箱设置 ====================
    let currentTplTab = 'rent';

    function setNotifyDaysPreset(days) {
      const el = document.getElementById('notifyDaysBefore');
      if (el) el.value = days;
    }

    function switchTemplateTab(tab) {
      currentTplTab = tab;
      document.querySelectorAll('.tpl-tab-btn').forEach(btn => {
        btn.className = 'tpl-tab-btn m3-pill px-3 py-1 text-xs font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-300';
      });
      const activeBtn = document.getElementById('tplTab_' + tab);
      if (activeBtn) {
        activeBtn.className = 'tpl-tab-btn m3-pill px-3 py-1 text-xs font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F]';
      }

      const rentBox = document.getElementById('tplBoxRent');
      const utilBox = document.getElementById('tplBoxUtility');
      if (rentBox) rentBox.classList.toggle('hidden', tab !== 'rent');
      if (utilBox) utilBox.classList.toggle('hidden', tab !== 'utility');

      updateTemplatePreview();
    }

    function insertTplVar(targetId, varTag) {
      const el = document.getElementById(targetId);
      if (!el) return;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const text = el.value;
      el.value = text.substring(0, start) + varTag + text.substring(end);
      el.focus();
      el.selectionStart = el.selectionEnd = start + varTag.length;
      updateTemplatePreview();
    }

    function updateTemplatePreview() {
      const previewFrame = document.getElementById('tplPreviewFrame');
      if (!previewFrame) return;

      const sampleVars = {
        '房源名称': 'No.302 Sunshine Garden',
        '房源地址': '128 Haidian St, Beijing',
        '承租人': 'Alex Smith',
        '承租人手机': '13800138000',
        '租期范围': '2026-01-01 ~ 2027-01-01',
        '应交租金': '3800.00',
        '交租截止日': '2026-10-01',
        '状态描述': 'Due in 8 days',
        '房东电话': '13988886666',
        '欠款金额': '168.50',
        '结算日期': new Date().toISOString().slice(0, 10),
        '用量明细': 'Electricity 150 kWh × ¥1.0; Water ¥18.50',
        'property_title': 'No.302 Sunshine Garden',
        'address': '128 Haidian St, Beijing',
        'tenant_name': 'Alex Smith',
        'tenant_phone': '13800138000',
        'lease_period': '2026-01-01 ~ 2027-01-01',
        'rent_amount': '3800.00',
        'due_date': '2026-10-01',
        'status_desc': 'Due in 8 days',
        'landlord_phone': '13988886666',
        'unpaid_amount': '168.50',
        'settle_date': new Date().toISOString().slice(0, 10),
        'usage_details': 'Electricity 150 kWh × ¥1.0; Water ¥18.50'
      };

      const rawHtml = (currentTplTab === 'rent'
        ? document.getElementById('notifyTemplateRentBody')?.value
        : document.getElementById('notifyTemplateUtilityBody')?.value) || '';

      let rendered = rawHtml;
      for (const [k, v] of Object.entries(sampleVars)) {
        rendered = rendered.split('{{' + k + '}}').join(v);
      }

      previewFrame.innerHTML = rendered || '<span class="text-neutral-400">（模板内容为空）</span>';
    }

    const SETTINGS_SMTP_PRESETS = {
      qq: { host: 'smtp.qq.com', port: 465, secure: true, fromName: 'RentHub' },
      '163': { host: 'smtp.163.com', port: 465, secure: true, fromName: 'RentHub' },
      '126': { host: 'smtp.126.com', port: 465, secure: true, fromName: 'RentHub' },
      foxmail: { host: 'smtp.exmail.qq.com', port: 465, secure: true, fromName: 'RentHub' },
      qiye163: { host: 'smtphz.qiye.163.com', port: 465, secure: true, fromName: 'RentHub' },
      gmail: { host: 'smtp.gmail.com', port: 465, secure: true, fromName: 'RentHub' },
      outlook: { host: 'smtp.office365.com', port: 587, secure: false, fromName: 'RentHub' }
    };

    function applySettingsSmtpPreset(key) {
      const p = SETTINGS_SMTP_PRESETS[key];
      if (!p) return;
      const hostEl = document.getElementById('notifySmtpHost');
      const portEl = document.getElementById('notifySmtpPort');
      const secEl = document.getElementById('notifySmtpSecure');
      const fromNameEl = document.getElementById('notifySmtpFromName');
      if (hostEl) hostEl.value = p.host;
      if (portEl) portEl.value = p.port;
      if (secEl) secEl.checked = p.secure;
      if (fromNameEl && !fromNameEl.value) fromNameEl.value = p.fromName;
    }

    function toggleMailProviderUI(provider) {
      const resendSection = document.getElementById('resendConfigSection');
      const smtpSection = document.getElementById('smtpConfigSection');
      if (provider === 'resend') {
        if (resendSection) resendSection.classList.remove('hidden');
        if (smtpSection) smtpSection.classList.add('hidden');
      } else {
        if (resendSection) resendSection.classList.add('hidden');
        if (smtpSection) smtpSection.classList.remove('hidden');
      }
    }

    function toggleCloudBackupUI(provider) {
      const s3Card = document.getElementById('s3ConfigCard');
      const webdavCard = document.getElementById('webdavConfigCard');
      if (provider === 'S3') {
        if (s3Card) s3Card.classList.remove('hidden');
        if (webdavCard) webdavCard.classList.add('hidden');
      } else if (provider === 'WEBDAV') {
        if (s3Card) s3Card.classList.add('hidden');
        if (webdavCard) webdavCard.classList.remove('hidden');
      } else {
        if (s3Card) s3Card.classList.add('hidden');
        if (webdavCard) webdavCard.classList.add('hidden');
      }
    }

    async function loadNotificationSettings() {
      try {
        const res = await fetch('/api/settings/notifications');
        const json = await res.json();
        if (json.code === 0 && json.data) {
          const d = json.data;
          const provider = d.mailProvider === 'resend' ? 'resend' : 'smtp';
          const rResend = document.getElementById('mailProvider_resend');
          const rSmtp = document.getElementById('mailProvider_smtp');
          if (provider === 'resend' && rResend) {
            rResend.checked = true;
          } else if (rSmtp) {
            rSmtp.checked = true;
          }
          toggleMailProviderUI(provider);

          const resendKeyEl = document.getElementById('notifyResendApiKey');
          const resendFromEl = document.getElementById('notifyResendFromEmail');
          const resendNameEl = document.getElementById('notifyResendFromName');
          if (resendKeyEl) resendKeyEl.value = d.resendApiKeyMasked || '';
          if (resendFromEl) resendFromEl.value = d.resendFromEmail || '';
          if (resendNameEl) resendNameEl.value = d.resendFromName || '';

          const hostEl = document.getElementById('notifySmtpHost');
          const portEl = document.getElementById('notifySmtpPort');
          const secEl = document.getElementById('notifySmtpSecure');
          const userEl = document.getElementById('notifySmtpUser');
          const passEl = document.getElementById('notifySmtpPass');
          const nameEl = document.getElementById('notifySmtpFromName');
          const fromEl = document.getElementById('notifySmtpFromEmail');
          const rcptEl = document.getElementById('notifyRecipientEmail');
          const daysEl = document.getElementById('notifyDaysBefore');
          const dueEl = document.getElementById('notifyOnDueDay');
          const overdueEl = document.getElementById('notifyOnOverdue');
          const rentTitleEl = document.getElementById('notifyTemplateRentTitle');
          const rentBodyEl = document.getElementById('notifyTemplateRentBody');
          const utilTitleEl = document.getElementById('notifyTemplateUtilityTitle');
          const utilBodyEl = document.getElementById('notifyTemplateUtilityBody');

          if (hostEl) hostEl.value = d.smtpHost || '';
          if (portEl) portEl.value = d.smtpPort || '';
          if (secEl) secEl.checked = d.smtpSecure !== false;
          if (userEl) userEl.value = d.smtpUser || '';
          if (passEl) passEl.value = d.smtpPassMasked || '';
          if (nameEl) nameEl.value = d.smtpFromName || '';
          if (fromEl) fromEl.value = d.smtpFromEmail || '';
          if (rcptEl) rcptEl.value = d.recipientEmail || '';
          if (daysEl) daysEl.value = d.notifyDaysBefore || '7,3,1';
          if (dueEl) dueEl.checked = !!d.notifyOnDueDay;
          if (overdueEl) overdueEl.checked = !!d.notifyOnOverdue;
          if (rentTitleEl) rentTitleEl.value = d.templateRentTitle || '';
          if (rentBodyEl) rentBodyEl.value = d.templateRentBody || '';
          if (utilTitleEl) utilTitleEl.value = d.templateUtilityTitle || '';
          if (utilBodyEl) utilBodyEl.value = d.templateUtilityBody || '';

          updateTemplatePreview();
        }
      } catch (err) {
        console.error('loadNotificationSettings error:', err);
      }
    }

    async function saveNotificationSettings() {
      const btn = document.getElementById('saveNotifyBtn');
      const fb = document.getElementById('notifyFeedback');
      btn.innerText = '保存中...';
      btn.disabled = true;
      fb.innerText = '';

      try {
        const mailProvider = document.querySelector('input[name="notifyMailProvider"]:checked')?.value || 'smtp';
        const payload = {
          mailProvider,
          resendApiKey: document.getElementById('notifyResendApiKey')?.value?.trim() || '',
          resendFromEmail: document.getElementById('notifyResendFromEmail')?.value?.trim() || '',
          resendFromName: document.getElementById('notifyResendFromName')?.value?.trim() || '',
          smtpHost: document.getElementById('notifySmtpHost')?.value?.trim() || '',
          smtpPort: parseInt(document.getElementById('notifySmtpPort')?.value, 10) || 465,
          smtpSecure: !!document.getElementById('notifySmtpSecure')?.checked,
          smtpUser: document.getElementById('notifySmtpUser')?.value?.trim() || '',
          smtpPass: document.getElementById('notifySmtpPass')?.value?.trim() || '',
          smtpFromName: document.getElementById('notifySmtpFromName')?.value?.trim() || '',
          smtpFromEmail: document.getElementById('notifySmtpFromEmail')?.value?.trim() || '',
          recipientEmail: document.getElementById('notifyRecipientEmail')?.value?.trim() || '',
          notifyDaysBefore: document.getElementById('notifyDaysBefore')?.value?.trim() || '7,3,1',
          notifyOnDueDay: !!document.getElementById('notifyOnDueDay')?.checked,
          notifyOnOverdue: !!document.getElementById('notifyOnOverdue')?.checked,
          templateRentTitle: document.getElementById('notifyTemplateRentTitle')?.value?.trim() || '',
          templateRentBody: document.getElementById('notifyTemplateRentBody')?.value || '',
          templateUtilityTitle: document.getElementById('notifyTemplateUtilityTitle')?.value?.trim() || '',
          templateUtilityBody: document.getElementById('notifyTemplateUtilityBody')?.value || '',
        };

        const res = await fetch('/api/settings/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ 待收提醒与发信设置已保存！';
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ ' + err.message;
      } finally {
        btn.innerText = '保存待收提醒设置';
        btn.disabled = false;
      }
    }

    async function sendTestEmail() {
      const btn = document.getElementById('sendTestEmailBtn');
      const fb = document.getElementById('notifyFeedback');
      const targetEmail = document.getElementById('notifyRecipientEmail')?.value?.trim();
      const mailProvider = document.querySelector('input[name="notifyMailProvider"]:checked')?.value || 'smtp';
      const resendApiKey = document.getElementById('notifyResendApiKey')?.value?.trim();
      const resendFromEmail = document.getElementById('notifyResendFromEmail')?.value?.trim();
      const resendFromName = document.getElementById('notifyResendFromName')?.value?.trim();
      const smtpHost = document.getElementById('notifySmtpHost')?.value?.trim();
      const smtpPort = document.getElementById('notifySmtpPort')?.value?.trim();
      const smtpSecure = !!document.getElementById('notifySmtpSecure')?.checked;
      const smtpUser = document.getElementById('notifySmtpUser')?.value?.trim();
      const smtpPass = document.getElementById('notifySmtpPass')?.value?.trim();
      const smtpFromName = document.getElementById('notifySmtpFromName')?.value?.trim();
      const smtpFromEmail = document.getElementById('notifySmtpFromEmail')?.value?.trim();

      if (!targetEmail) return alert('请先填写房东接收提醒邮箱以接收测试邮件');
      if (mailProvider === 'resend') {
        if (!resendApiKey) return alert('请先填写 Resend API Key (以 re_ 开头)');
      } else {
        if (!smtpHost || !smtpPort) return alert('请先填写 SMTP 主机与端口');
      }
      btn.innerText = '正在发信...';
      btn.disabled = true;
      fb.innerText = '';

      try {
        const res = await fetch('/api/settings/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testEmail: targetEmail,
            type: currentTplTab === 'utility' ? 'utility' : 'rent',
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
            smtpFromEmail
          })
        });
        const json = await res.json();
        if (json.code === 0) {
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ ' + json.message;
          alert('✓ 测试邮件已成功发出！请前往收件箱查看。');
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ ' + err.message;
        alert('发送测试邮件失败: ' + err.message);
      } finally {
        btn.innerText = '✉️ 发送测试邮件';
        btn.disabled = false;
      }
    }

    async function triggerNotificationCheck() {
      if (!confirm('确定立即检查所有房源并发送待收提醒邮件吗？\\n系统将检查近期待收房租与未付水电费，给房东发送提醒。')) return;

      try {
        const res = await fetch('/api/notifications/trigger-check', { method: 'POST' });
        const json = await res.json();
        if (json.code === 0) {
          alert('✓ 提醒检查完成！\\n' + json.message);
        } else {
          alert('检查提醒失败: ' + json.message);
        }
      } catch (err) {
        alert('请求失败: ' + err.message);
      }
    }

    // ==================== 设置、多渠道存储 (WebDAV / S3) 与邮箱备份 ====================
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.code === 0 && json.data) {
          // WebDAV
          if (json.data.webdav) {
            const w = json.data.webdav;
            const elEp = document.getElementById('webdavEndpoint');
            if (elEp) elEp.value = w.endpoint || '';
            const elUn = document.getElementById('webdavUsername');
            if (elUn) elUn.value = w.username || '';
            const elPw = document.getElementById('webdavPassword');
            if (elPw) elPw.value = w.password || '';
            const elBp = document.getElementById('webdavBasePath');
            if (elBp) elBp.value = w.base_path || '';
          }
          // S3 对象存储
          if (json.data.s3) {
            const s = json.data.s3;
            const elEp = document.getElementById('s3Endpoint');
            if (elEp) elEp.value = s.endpoint || '';
            const elBk = document.getElementById('s3Bucket');
            if (elBk) elBk.value = s.bucket || '';
            const elRg = document.getElementById('s3Region');
            if (elRg) elRg.value = s.region || '';
            const elAk = document.getElementById('s3AccessKey');
            if (elAk) elAk.value = s.access_key_id || '';
            const elSk = document.getElementById('s3SecretKey');
            if (elSk) elSk.value = s.secret_access_key || '';
            const elBp = document.getElementById('s3BasePath');
            if (elBp) elBp.value = s.base_path || '';
          }
          // 全局存储渠道判定与云端备份二选一
          let activeCloud = 'NONE';
          if (json.data.default_storage === 'S3' || (json.data.s3 && json.data.s3.is_enabled)) {
            activeCloud = 'S3';
          } else if (json.data.default_storage === 'WEBDAV' || (json.data.webdav && json.data.webdav.is_enabled)) {
            activeCloud = 'WEBDAV';
          }
          appData.default_storage = activeCloud === 'NONE' ? 'D1_LOCAL' : activeCloud;

          const rNone = document.getElementById('cloudBackup_none');
          const rWd = document.getElementById('cloudBackup_webdav');
          const rS3 = document.getElementById('cloudBackup_s3');
          if (activeCloud === 'S3' && rS3) rS3.checked = true;
          else if (activeCloud === 'WEBDAV' && rWd) rWd.checked = true;
          else if (rNone) rNone.checked = true;

          toggleCloudBackupUI(activeCloud);
        }
      } catch (err) {
        console.warn('拉取系统存储设置失败:', err);
      }
      loadNotificationSettings();
      inspectDatabaseTable(currentInspectTable);
    }

    async function saveDefaultStorageSetting() {
      const btn = document.getElementById('saveDefaultStorageBtn');
      const fb = document.getElementById('defaultStorageFeedback');
      const selected = document.querySelector('input[name="cloudBackupProvider"]:checked')?.value || 'NONE';
      const defaultStorage = selected === 'S3' ? 'S3' : (selected === 'WEBDAV' ? 'WEBDAV' : 'D1_LOCAL');

      btn.innerText = '保存中...';
      btn.disabled = true;
      fb.innerText = '';

      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ default_storage: defaultStorage })
        });
        const json = await res.json();
        if (json.code === 0) {
          appData.default_storage = defaultStorage;
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          if (selected === 'NONE') {
            fb.innerText = '✓ 已设置为：仅保存在本地 D1 数据库 (未开启外部云备份)';
          } else if (selected === 'WEBDAV') {
            fb.innerText = '✓ 已开启 WebDAV 网盘同步备份 (本地 D1 + WebDAV 双轨运行)';
          } else {
            fb.innerText = '✓ 已开启 S3 对象存储同步备份 (本地 D1 + S3 双轨运行)';
          }
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ 保存失败: ' + err.message;
      } finally {
        btn.innerText = '保存存储模式';
        btn.disabled = false;
      }
    }

    // ==================== 数据库速览透视与全量导出 ====================
    let currentInspectTable = 'leases';

    async function inspectDatabaseTable(tableName) {
      currentInspectTable = tableName;
      document.querySelectorAll('.inspect-tab-btn').forEach(btn => {
        btn.className = 'inspect-tab-btn m3-pill px-3.5 py-1.5 font-medium bg-[#E8EDE9] text-neutral-600 dark:bg-[#161D1A] dark:text-neutral-400 transition-all';
      });
      const activeBtn = document.getElementById('tab_table_' + tableName);
      if (activeBtn) {
        activeBtn.className = 'inspect-tab-btn m3-pill px-3.5 py-1.5 font-bold bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] transition-all';
      }

      const thead = document.getElementById('dbInspectThead');
      const tbody = document.getElementById('dbInspectTbody');
      const loading = document.getElementById('dbInspectLoading');
      if (!thead || !tbody) return;

      tbody.innerHTML = '';
      if (loading) loading.classList.remove('hidden');

      try {
        const res = await fetch('/api/database/inspect?table=' + tableName);
        const json = await res.json();
        if (loading) loading.classList.add('hidden');
        if (json.code !== 0) throw new Error(json.message);

        const rows = json.data.rows || [];
        if (rows.length === 0) {
          thead.innerHTML = '';
          tbody.innerHTML = '<tr><td colspan="10" class="p-8 text-center text-neutral-400 font-sans text-xs">当前表中暂无任何数据记录</td></tr>';
          return;
        }

        const headers = Object.keys(rows[0]);
        thead.innerHTML = '<tr>' + headers.map(h => '<th class="px-3.5 py-2.5">' + h + '</th>').join('') + '</tr>';
        tbody.innerHTML = rows.map(r => {
          return '<tr class="hover:bg-[#E8EDE9]/40 dark:hover:bg-[#161D1A]/60">' +
            headers.map(h => {
              let val = r[h];
              if (val === null || val === undefined) val = '<span class="text-neutral-400">NULL</span>';
              else if (typeof val === 'object') val = JSON.stringify(val);
              return '<td class="px-3.5 py-2.5 whitespace-nowrap text-[11px] truncate max-w-xs" title="' + String(val).replace(/"/g, '&quot;') + '">' + val + '</td>';
            }).join('') + '</tr>';
        }).join('');
      } catch (err) {
        if (loading) loading.classList.add('hidden');
        tbody.innerHTML = '<tr><td colspan="10" class="p-4 text-center text-rose-500 font-sans text-xs">查询失败: ' + err.message + '</td></tr>';
      }
    }

    async function dumpDatabaseJson() {
      try {
        const res = await fetch('/api/database/dump');
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FangDongGuanJia_Backup_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('导出失败: ' + err.message);
      }
    }

    async function sendEmailBackup() {
      const btn = document.getElementById('emailBackupBtn');
      if (!confirm('确定将系统当前数据库的全量备份归档发送至您的管理员邮箱吗？\\n此操作将导出所有房源、租约、账单与配置的最新快照并邮件发送。')) return;

      btn.innerText = '正在打包发送...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/settings/email-backup', { method: 'POST' });
        const json = await res.json();
        if (json.code === 0) {
          alert('✓ ' + json.message);
        } else {
          alert('发送备份邮件失败: ' + json.message);
        }
      } catch (err) {
        alert('发送备份邮件异常: ' + err.message);
      } finally {
        btn.innerText = '📧 发送备份至邮箱';
        btn.disabled = false;
      }
    }

    function fillPreset(type) {
      const rWd = document.getElementById('cloudBackup_webdav');
      if (rWd) rWd.checked = true;
      toggleCloudBackupUI('WEBDAV');

      if (type === 'jianguoyun') {
        document.getElementById('webdavEndpoint').value = 'https://dav.jianguoyun.com/dav/';
        document.getElementById('webdavBasePath').value = '/RentRecords';
      } else if (type === 'alist') {
        document.getElementById('webdavEndpoint').value = 'http://127.0.0.1:5244/dav/';
        document.getElementById('webdavBasePath').value = '/RentRecords';
        alert('💡 AList 提示：可先在 AList 后台挂载阿里云盘、百度网盘、天翼云等，并将 Endpoint 修改为您 AList 服务的公网或内网地址。');
      } else if (type === '123pan') {
        document.getElementById('webdavEndpoint').value = 'https://open-api.123pan.com/webdav/';
        document.getElementById('webdavBasePath').value = '/RentRecords';
      } else if (type === 'openlist') {
        document.getElementById('webdavEndpoint').value = 'https://your-openlist-domain/dav/';
        document.getElementById('webdavBasePath').value = '/RentRecords';
      }
    }

    function fillS3Preset(type) {
      const rS3 = document.getElementById('cloudBackup_s3');
      if (rS3) rS3.checked = true;
      toggleCloudBackupUI('S3');

      if (type === 'aliyun') {
        document.getElementById('s3Endpoint').value = 'https://oss-cn-hangzhou.aliyuncs.com';
        document.getElementById('s3Region').value = 'cn-hangzhou';
        document.getElementById('s3BasePath').value = 'RentHubFiles';
      } else if (type === 'tencent') {
        document.getElementById('s3Endpoint').value = 'https://cos.ap-guangzhou.myqcloud.com';
        document.getElementById('s3Region').value = 'ap-guangzhou';
        document.getElementById('s3BasePath').value = 'RentHubFiles';
      } else if (type === 'r2') {
        document.getElementById('s3Endpoint').value = 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com';
        document.getElementById('s3Region').value = 'auto';
        document.getElementById('s3BasePath').value = 'RentHubFiles';
      } else if (type === 'qiniu') {
        document.getElementById('s3Endpoint').value = 'https://s3.cn-east-1.qiniucs.com';
        document.getElementById('s3Region').value = 'cn-east-1';
        document.getElementById('s3BasePath').value = 'RentHubFiles';
      } else if (type === 'minio') {
        document.getElementById('s3Endpoint').value = 'http://127.0.0.1:9000';
        document.getElementById('s3Region').value = 'us-east-1';
        document.getElementById('s3BasePath').value = 'RentHubFiles';
      }
    }

    async function testS3() {
      const btn = document.getElementById('testS3Btn');
      const fb = document.getElementById('s3Feedback');
      btn.innerText = '测试中...';
      btn.disabled = true;
      fb.innerText = '';

      try {
        const payload = {
          s3: {
            endpoint: document.getElementById('s3Endpoint').value,
            bucket: document.getElementById('s3Bucket').value,
            region: document.getElementById('s3Region').value,
            access_key_id: document.getElementById('s3AccessKey').value,
            secret_access_key: document.getElementById('s3SecretKey').value,
            base_path: document.getElementById('s3BasePath').value,
          }
        };
        const res = await fetch('/api/settings/test-s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ ' + json.message;
        } else {
          fb.className = 'text-xs font-bold text-rose-500';
          fb.innerText = '✕ ' + json.message;
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ S3 测试请求异常';
      } finally {
        btn.innerText = '测试 S3 连通性';
        btn.disabled = false;
      }
    }

    async function saveS3() {
      const btn = document.getElementById('saveS3Btn');
      const fb = document.getElementById('s3Feedback');
      btn.innerText = '保存中...';
      btn.disabled = true;

      try {
        const payload = {
          s3: {
            endpoint: document.getElementById('s3Endpoint').value.trim(),
            bucket: document.getElementById('s3Bucket').value.trim(),
            region: document.getElementById('s3Region').value.trim(),
            access_key_id: document.getElementById('s3AccessKey').value.trim(),
            secret_access_key: document.getElementById('s3SecretKey').value.trim(),
            base_path: document.getElementById('s3BasePath').value.trim(),
            is_enabled: true,
          },
          default_storage: 'S3'
        };
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          appData.default_storage = 'S3';
          const rS3 = document.getElementById('cloudBackup_s3');
          if (rS3) rS3.checked = true;
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ S3 对象存储配置已安全保存并开启同步！';
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ ' + err.message;
      } finally {
        btn.innerText = '保存 S3 配置';
        btn.disabled = false;
      }
    }

    async function testWebdav() {
      const btn = document.getElementById('testWebdavBtn');
      const fb = document.getElementById('webdavFeedback');
      btn.innerText = '测试中...';
      btn.disabled = true;
      fb.innerText = '';

      try {
        const payload = {
          webdav: {
            endpoint: document.getElementById('webdavEndpoint').value,
            username: document.getElementById('webdavUsername').value,
            password: document.getElementById('webdavPassword').value,
            base_path: document.getElementById('webdavBasePath').value,
          }
        };
        const res = await fetch('/api/settings/test-webdav', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ ' + json.message;
        } else {
          fb.className = 'text-xs font-bold text-rose-500';
          fb.innerText = '✕ ' + json.message;
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ 连接测试异常';
      } finally {
        btn.innerText = '测试连通性';
        btn.disabled = false;
      }
    }

    async function saveWebdav() {
      const btn = document.getElementById('saveWebdavBtn');
      const fb = document.getElementById('webdavFeedback');
      btn.innerText = '保存中...';
      btn.disabled = true;

      try {
        const payload = {
          webdav: {
            endpoint: document.getElementById('webdavEndpoint').value.trim(),
            username: document.getElementById('webdavUsername').value.trim(),
            password: document.getElementById('webdavPassword').value.trim(),
            base_path: document.getElementById('webdavBasePath').value.trim(),
            is_enabled: true,
          },
          default_storage: 'WEBDAV'
        };
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.code === 0) {
          appData.default_storage = 'WEBDAV';
          const rWd = document.getElementById('cloudBackup_webdav');
          if (rWd) rWd.checked = true;
          fb.className = 'text-xs font-bold text-[#0F5B38] dark:text-[#7CDCA0]';
          fb.innerText = '✓ WebDAV 网盘配置已加密保存并开启同步！';
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        fb.className = 'text-xs font-bold text-rose-500';
        fb.innerText = '✕ ' + err.message;
      } finally {
        btn.innerText = '保存 WebDAV 配置';
        btn.disabled = false;
      }
    }

    function openChangePasswordModal() {
      document.getElementById('oldPasswordInput').value = '';
      document.getElementById('newPasswordInput').value = '';
      openModal('passwordModal');
    }

    async function submitChangePassword() {
      const oldPassword = document.getElementById('oldPasswordInput').value;
      const newPassword = document.getElementById('newPasswordInput').value;
      if (!oldPassword || !newPassword) return alert('请完整输入原密码与新密码');
      if (newPassword.length < 8) return alert('新密码长度不能少于 8 位');

      const btn = document.getElementById('changePassBtn');
      btn.innerText = '正在更新...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword, newPassword })
        });
        const json = await res.json();
        if (json.code === 0) {
          alert('密码修改成功，请牢记新密码！');
          closeModal('passwordModal');
        } else {
          alert(json.message);
        }
      } catch (err) {
        alert('修改失败: ' + err.message);
      } finally {
        btn.innerText = '确认修改';
        btn.disabled = false;
      }
    }

    function openUpdateSecurityEmailModal() {
      const cur = document.getElementById('settingsSecurityEmailDisplay')?.innerText;
      document.getElementById('secNewEmailInput').value = (cur && cur !== '未绑定' && !cur.includes('...')) ? cur : '';
      document.getElementById('secPasswordInput').value = '';
      openModal('updateSecurityEmailModal');
    }

    async function submitUpdateSecurityEmail() {
      const newEmail = document.getElementById('secNewEmailInput').value.trim();
      const currentPassword = document.getElementById('secPasswordInput').value;
      if (!newEmail) return alert('请输入有效的安全与通知邮箱');
      if (!currentPassword) return alert('请输入管理员密码以核验身份');

      const btn = document.getElementById('secEmailSubmitBtn');
      btn.innerText = '正在保存...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/update-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail, currentPassword })
        });
        const json = await res.json();
        if (json.code === 0) {
          alert('🎉 安全与通知邮箱已成功保存并同步！');
          closeModal('updateSecurityEmailModal');
          const disp = document.getElementById('settingsSecurityEmailDisplay');
          if (disp) disp.innerText = newEmail;
          const notifyRec = document.getElementById('notifyRecipientEmail');
          if (notifyRec) notifyRec.value = newEmail;
        } else {
          alert(json.message || '保存失败');
        }
      } catch (err) {
        alert('保存失败: ' + err.message);
      } finally {
        btn.innerText = '确认保存邮箱';
        btn.disabled = false;
      }
    }

    async function loadSecurityDetails() {
      try {
        const res = await fetch('/api/auth/2fa-details');
        const json = await res.json();
        if (json.code === 0 && json.data) {
          const emailEl = document.getElementById('settingsSecurityEmailDisplay');
          if (emailEl) {
            emailEl.innerText = json.data.recovery_email || '未绑定';
          }
        }
      } catch (_) {}
    }

    async function view2FADetails() {
      try {
        const res = await fetch('/api/auth/2fa-info');
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        document.getElementById('settingsSecretDisplay').innerText = json.data.totpSecret;

        const qrBox = document.getElementById('settingsQrBox');
        qrBox.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrBox, {
            text: json.data.totpUri,
            width: 160,
            height: 160,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }

        const recBox = document.getElementById('settingsRecoveryDisplay');
        recBox.innerHTML = '';
        json.data.recoveryCodes.forEach(code => {
          const span = document.createElement('div');
          span.className = 'p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-center';
          span.innerText = code;
          recBox.appendChild(span);
        });

        openModal('twoFAModal');
      } catch (err) {
        alert('获取 2FA 凭据失败: ' + err.message);
      }
    }

    let currentBindToken = '';
    let currentBindSecret = '';

    function render2FAStatusUI() {
      loadSecurityDetails();
      const badge = document.getElementById('settings2FABadge');
      const desc = document.getElementById('settings2FADesc');
      const actionBox = document.getElementById('settings2FAActionBtns');
      const banner = document.getElementById('twoFABanner');
      const headerBadge = document.getElementById('header2FABadge');

      if (!badge || !actionBox) return;

      if (appData.totpEnabled) {
        badge.className = 'text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9]';
        badge.innerText = '● 2FA 已保护';
        if (desc) desc.innerText = '当前处于双因子银行级保护状态。支持随时查看凭据、重新绑定或关闭。';
        if (banner) banner.classList.add('hidden');

        if (headerBadge) {
          headerBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>🛡️ 2FA 已保护</span>';
          headerBadge.className = 'm3-pill px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9]';
        }

        actionBox.innerHTML = \`
          <button onclick="view2FADetails()" class="m3-pill px-3 py-1.5 bg-[#E8EDE9] dark:bg-[#161D1A] hover:opacity-85 text-xs font-semibold">
            查看凭据
          </button>
          <button onclick="startRebind2FA()" class="m3-pill px-3 py-1.5 bg-[#C4EED0] dark:bg-[#1A402D] text-[#002111] dark:text-[#A6F5B9] hover:opacity-85 text-xs font-semibold">
            重新绑定
          </button>
          <button onclick="openDisable2FAModal()" class="m3-pill px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold">
            关闭 2FA
          </button>
        \`;
      } else {
        badge.className = 'text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#FBE49B] dark:bg-[#382F00] text-[#745B00] dark:text-[#F0C33C]';
        badge.innerText = '○ 2FA 未开启 (高风险)';
        if (desc) desc.innerText = '当前仅受主密码保护。未绑定 2FA 时每次进入系统将持续提醒。';
        if (banner) banner.classList.remove('hidden');

        if (headerBadge) {
          headerBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span>⚠️ 2FA 未开启</span>';
          headerBadge.className = 'm3-pill px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 bg-[#FBE49B] dark:bg-[#382F00] text-[#745B00] dark:text-[#F0C33C] cursor-pointer';
        }

        actionBox.innerHTML = \`
          <button onclick="startRebind2FA()" class="m3-pill px-4 py-1.5 bg-[#0F5B38] dark:bg-[#7CDCA0] text-white dark:text-[#00391F] text-xs font-bold shadow-sm">
            🛡️ 立即绑定 2FA
          </button>
        \`;
      }
    }

    async function startRebind2FA() {
      try {
        const res = await fetch('/api/auth/prepare-2fa', { method: 'POST' });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        const data = json.data;
        currentBindToken = data.bindToken;
        currentBindSecret = data.totpSecret;

        document.getElementById('bindSecretDisplay').innerText = data.totpSecret;
        document.getElementById('bindTotpCode').value = '';

        const qrBox = document.getElementById('bindQrBox');
        qrBox.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrBox, {
            text: data.totpUri,
            width: 160,
            height: 160,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }

        const recBox = document.getElementById('bindRecoveryDisplay');
        recBox.innerHTML = '';
        data.recoveryCodes.forEach(code => {
          const span = document.createElement('div');
          span.className = 'p-1 rounded bg-[#E8EDE9] dark:bg-[#161D1A] text-center font-mono text-[11px] font-bold';
          span.innerText = code;
          recBox.appendChild(span);
        });

        openModal('bind2FAModal');
      } catch (err) {
        alert('准备 2FA 绑定失败: ' + err.message);
      }
    }

    function copyBindSecret() {
      if (!currentBindSecret) return;
      navigator.clipboard.writeText(currentBindSecret).then(() => {
        alert('密钥已复制到剪贴板！');
      });
    }

    async function submitConfirmBind2FA() {
      const code = document.getElementById('bindTotpCode').value.trim();
      if (!code || code.length !== 6) return alert('请输入 6 位动态验证码');

      const btn = document.getElementById('confirmBindBtn');
      btn.innerText = '正在验证并开启...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/confirm-bind-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bindToken: currentBindToken, code })
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        appData.totpEnabled = true;
        render2FAStatusUI();
        closeModal('bind2FAModal');
        closeModal('twoFARemindModal');
        alert('🎉 2FA 动态口令已成功开启！系统安全级别已提升至最高等级。');
      } catch (err) {
        alert(err.message || '验证失败');
      } finally {
        btn.innerText = '确认验证并开启 2FA';
        btn.disabled = false;
      }
    }

    function openDisable2FAModal() {
      document.getElementById('disablePasswordInput').value = '';
      openModal('disable2FAModal');
    }

    async function submitDisable2FA() {
      const password = document.getElementById('disablePasswordInput').value;
      if (!password) return alert('请输入管理员主密码');

      if (!confirm('确定关闭 2FA 吗？\\n\\n关闭后仅依靠密码登录，每次进入系统将弹窗提醒您重新开启。')) return;

      const btn = document.getElementById('disableBtn');
      btn.innerText = '正在关闭...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/auth/disable-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);

        appData.totpEnabled = false;
        render2FAStatusUI();
        closeModal('disable2FAModal');
        alert('2FA 动态验证已关闭。每次进入系统将持续弹窗提醒您重新开启。');
      } catch (err) {
        alert(err.message || '关闭失败');
      } finally {
        btn.innerText = '确认关闭 2FA';
        btn.disabled = false;
      }
    }

    async function ensureLeaseDropdowns() {
      if (appData.leases.length === 0) {
        const res = await fetch('/api/leases');
        const json = await res.json();
        if (json.code === 0) appData.leases = json.data;
      }
      const options = appData.leases.map(l => \`<option value="\${l.id}">\${l.title}</option>\`).join('');
      const rentSelect = document.getElementById('rentLeaseId');
      const utilSelect = document.getElementById('utilLeaseId');
      const uploadSelect = document.getElementById('uploadLeaseId');
      const uploadExistingSelect = document.getElementById('uploadExistingLeaseId');
      if (rentSelect) rentSelect.innerHTML = options;
      if (utilSelect) utilSelect.innerHTML = options;
      if (uploadSelect) uploadSelect.innerHTML = options;
      if (uploadExistingSelect) uploadExistingSelect.innerHTML = options;
    }

    function dismissTwoFARemindModal() {
      sessionStorage.setItem('twoFARemindDismissed', '1');
      closeModal('twoFARemindModal');
    }

    function openModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    }
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    }

    // 核心优化：点击非窗口区域（遮罩层空白处）直接平滑关闭弹窗
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
        closeModal(e.target.id);
      }
    });

    // 核心优化：监听 ESC 键关闭所有打开的弹窗
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.fixed.inset-0:not(.hidden)').forEach(modal => {
          closeModal(modal.id);
        });
      }
    });

    // ==================== SaaS 设置中心双栏切换 ====================
    function switchSettingsSection(secId) {
      document.querySelectorAll('.settings-section').forEach(sec => sec.classList.add('hidden'));
      const target = document.getElementById('setSection_' + secId);
      if (target) target.classList.remove('hidden');

      document.querySelectorAll('.settings-nav-btn').forEach(btn => {
        const isActive = btn.id === 'setNav_' + secId;
        if (isActive) {
          if (secId === 'reset') {
            btn.className = 'settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all whitespace-nowrap bg-rose-600 text-white shadow-sm';
          } else {
            btn.className = 'settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all whitespace-nowrap bg-[#0F5B38] text-white dark:bg-[#7CDCA0] dark:text-[#00391F] shadow-sm';
          }
        } else {
          if (btn.id === 'setNav_reset') {
            btn.className = 'settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40';
          } else {
            btn.className = 'settings-nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap text-neutral-700 dark:text-neutral-300 hover:bg-[#D7DED9]/60 dark:hover:bg-[#202923]';
          }
        }
      });

      if (secId === 'security') {
        loadSecurityDetails();
      }
      if (secId === 'database') {
        inspectDatabaseTable(currentInspectTable || 'leases');
      }
    }

    // ==================== 显示密度双模式切换 (舒享 / 紧凑) ====================
    function toggleDensity() {
      const isCompact = document.body.classList.toggle('density-compact');
      const mode = isCompact ? 'compact' : 'comfortable';
      localStorage.setItem('renthub_density', mode);
      updateDensityUI(mode);
    }

    function updateDensityUI(mode) {
      const icon = document.getElementById('densityIcon');
      const label = document.getElementById('densityLabel');
      if (mode === 'compact') {
        document.body.classList.add('density-compact');
        if (icon) icon.innerText = '⚡';
        if (label) label.innerText = '紧凑模式';
      } else {
        document.body.classList.remove('density-compact');
        if (icon) icon.innerText = '🌿';
        if (label) label.innerText = '舒享模式';
      }
    }

    function initDensity() {
      const saved = localStorage.getItem('renthub_density') || 'comfortable';
      updateDensityUI(saved);
    }

    // ==================== 一键清空系统测试数据 ====================
    async function confirmResetSystem() {
      const confirmed = confirm('⚠️ 危险操作警告：\\n\\n确定要清空所有测试数据并重置系统吗？\\n\\n执行后：\\n1. 所有的房源 (leases)、记账 (payments)、单据附件 (attachments) 将被全部清除。\\n2. 管理员账号与会话将被清除，直接返回系统初装向导。\\n\\n是否立即执行？');
      if (!confirmed) return;

      const btn = document.getElementById('btnResetSystem');
      const fb = document.getElementById('resetSystemFeedback');
      if (btn) btn.disabled = true;
      if (fb) {
        fb.className = 'text-xs font-semibold text-amber-600 animate-pulse';
        fb.innerText = '正在清空系统数据...';
      }

      try {
        const res = await fetch('/api/admin/reset-system', { method: 'POST' });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);
        if (fb) {
          fb.className = 'text-xs font-semibold text-emerald-600';
          fb.innerText = '清空成功！正在进入初始化向导...';
        }
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (err) {
        if (fb) {
          fb.className = 'text-xs font-semibold text-rose-600';
          fb.innerText = '重置失败: ' + (err.message || '未知错误');
        }
        if (btn) btn.disabled = false;
      }
    }

    async function logout() {
      if (!confirm('确定安全退出登录吗？退出后需要重新输入密码与 2FA 动态码。')) return;
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {}
      window.location.href = '/';
    }

    window.addEventListener('DOMContentLoaded', () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      initDensity();
      switchTab('dashboard');
      loadDashboard();
    });
  </script>
</body>
</html>`;
}
