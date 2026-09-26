import { days, destinations, images } from './data.js';
import { storage } from './store.js';
import { icon, pageHeading, progress, buttonClass, dayDate, dateRange } from './ui.js';

export function renderOverview() {
  const stats = storage.stats();
  const insights = [
    { icon: 'calendar-check-line', value: '8 天 7 晚', text: '从乌鲁木齐出发，再回到这里', color: 'bg-[#edf1e4] text-[#7b905f]' },
    { icon: 'group-line', value: '3 大 1 小', text: '50 岁+ · 两位 30 岁 · 2 岁宝宝', color: 'bg-[#f7efdf] text-[#b29b62]' },
    { icon: 'steering-2-line', value: '司机师傅同行', text: '专注看风景，也照顾彼此', color: 'bg-[#eaf0ed] text-[#7d9b86]' },
    { icon: 'luggage-cart-line', value: `${stats.done} / ${stats.total} 项`, text: '行前准备 · 每勾一项，安心一点', color: 'bg-[#f3efe6] text-[#ac9771]', href: '#packing' }
  ];
  return `${pageHeading('NORTH XINJIANG · AUTUMN ESCAPE', '秋天的北疆，等我们出发。', '一份为三大一小准备的金秋手册，让风景慢一点，让陪伴多一点。', `<button data-action="settings" class="flex items-center gap-2 pb-1 text-xs text-[#7c8a6b] hover:text-[#345b3e]">${icon('edit-line')} 设置出发日期</button>`)}
    <section class="grid gap-5 xl:grid-cols-[1.85fr_1fr]" aria-label="金秋旅行概览">
      <div class="relative isolate min-h-[330px] overflow-hidden rounded-2xl bg-[#284b3d] sm:min-h-[350px]">
        <img src="${images.kanas}" alt="秋日喀纳斯，碧色河流蜿蜒流过金色山林" class="absolute inset-0 h-full max-h-[50vh] w-full object-cover object-center" fetchpriority="high">
        <div class="absolute inset-0 bg-gradient-to-r from-[#142e24]/80 via-[#203f2e]/25 to-transparent"></div><div class="absolute inset-0 bg-gradient-to-t from-[#112c20]/65 to-transparent"></div>
        <div class="relative flex h-full flex-col items-start p-7 sm:p-9">
          <span class="mb-5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] tracking-widest text-[#f4eedc] backdrop-blur-sm">${icon('leaf-line', 'mr-1')} 金秋限定 · 家庭慢旅行</span>
          <h2 class="text-[34px] font-semibold leading-[1.4] tracking-[0.08em] text-white sm:text-[39px]">去有秋天的地方，<br>和最爱的人。</h2>
          <p class="mb-6 mt-3 text-xs tracking-wider text-white/80">湖泊、山林、木屋，还有我们的一路欢笑。</p>
          <a href="#itinerary" class="mt-auto inline-flex items-center gap-5 rounded-lg bg-[#f4f4e7] px-5 py-3 text-xs font-semibold text-[#36523a] hover:bg-white">翻开我们的行程 ${icon('arrow-right-line')}</a>
          <span class="absolute bottom-7 right-6 flex items-center gap-1.5 text-[10px] text-white/80">${icon('map-pin-2-line')} 喀纳斯 · 新疆</span>
        </div>
      </div>
      <div class="flex flex-col rounded-2xl border border-[#e5e7d2] bg-[#f0f2e3] p-6 sm:p-7">
        <div class="flex items-center justify-between"><span class="text-[10px] font-semibold tracking-[0.18em] text-[#8c9470]">READY FOR THE JOURNEY</span><span class="grid h-8 w-8 place-items-center rounded-full bg-[#e3e9d3] text-[#7b8b57]">${icon('leaf-line')}</span></div>
        <h2 class="mt-4 text-xl font-semibold">美好旅行，从准备开始</h2><p class="mt-2 text-xs leading-6 text-[#949b81]">不用一次准备好，<br>我们一起，一点点装满行李。</p>
        <div class="mt-6"><div class="mb-3 flex items-end justify-between"><span class="text-xs text-[#7e8a6a]">行李准备进度</span><span class="font-serif text-[32px] leading-none text-[#567047]">${stats.percent}<small class="ml-0.5 text-sm">%</small></span></div>${progress(stats.percent)}<div class="mt-3 flex justify-between text-[10px] text-[#969e84]"><span>已准备 ${stats.done} 项</span><span>还有 ${stats.total - stats.done} 项待准备</span></div></div>
        <a href="#packing" class="${buttonClass} mt-6 w-full justify-between">去整理行前清单 ${icon('arrow-right-line')}</a>
        <p class="mt-3 text-center text-[10px] text-[#96a082]">${icon('check-double-line')} 勾选自动保存在当前浏览器</p>
      </div>
    </section>
    <section class="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="旅行信息">${insights.map(item => `<${item.href ? `a href="${item.href}"` : 'div'} class="flex items-center gap-3 rounded-xl border border-[#e6e9e0] bg-white px-4 py-5 ${item.href ? 'hover:border-[#b7c4a7]' : ''}"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${item.color}">${icon(item.icon)}</span><div><h3 class="text-[13px] font-semibold sm:text-sm">${item.value}</h3><p class="mt-1 text-[10px] leading-4 text-[#9aa38f]">${item.text}</p></div></${item.href ? 'a' : 'div'}>`).join('')}</section>
    <section class="rounded-2xl border border-[#e4e8dc] bg-white px-5 py-6 sm:px-6">
      <div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f4e9] text-[#7c9269]">${icon('route-line')}</span><h2 class="text-base font-semibold">8 天，把北疆的秋天串起来</h2></div><a href="#itinerary" class="hidden items-center gap-2 text-xs text-[#81926d] hover:text-[#3d633e] sm:flex">查看完整行程 ${icon('arrow-right-line')}</a></div>
      <div class="relative mt-6 grid grid-cols-4 gap-y-6 lg:grid-cols-8"><div class="absolute left-[6%] right-[6%] top-[20px] hidden border-t border-dashed border-[#cdd7bd] lg:block"></div>${days.map((day, index) => `<a href="#itinerary/${day.id}" class="group relative flex flex-col items-center px-1 text-center"><span class="relative mb-3 grid h-10 w-10 place-items-center rounded-full border-4 border-white text-sm transition-transform group-hover:-translate-y-1 ${index === 0 || index === 7 ? 'bg-[#e7eedc] text-[#577745]' : 'bg-[#f2f4ec] text-[#92a47f]'}">${icon(day.icon)}</span><span class="text-[9px] tracking-wider text-[#99a687]">D${day.id} ${storage.get().startDate ? `· ${dayDate(day.id)}` : ''}</span><strong class="mt-1 text-xs font-medium text-[#526348]">${day.city}</strong><span class="mt-1 text-[9px] leading-4 text-[#a7ae9f]">${day.short}</span></a>`).join('')}</div>
      <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e8] pt-4 text-[10px] text-[#9ea78e]"><span>${icon('map-pin-range-line', 'mr-1')} 乌鲁木齐往返 · 喀纳斯二进 · 禾木半日慢游</span><span>路线顺序示意，非导航地图</span></div>
    </section>
    <section class="mt-8"><div class="mb-4 flex items-center justify-between"><div><h2 class="text-lg font-semibold">这一路，值得期待</h2><p class="mt-1 text-[11px] text-[#98a18b]">四种风景，装满一家人的秋日回忆。</p></div><span class="rounded-full border border-[#e3e6d6] bg-[#f0f3e7] px-3 py-1.5 text-[10px] text-[#8b9774]">${icon('camera-line', 'mr-1')} 记得给全家拍一张合照</span></div>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">${destinations.map(destination => `<a href="#itinerary/${destination.day}" class="group overflow-hidden rounded-xl border border-[#e5e8dc] bg-white transition-shadow hover:shadow-lg hover:shadow-[#50623b]/10"><div class="relative overflow-hidden"><img src="${destination.image}" alt="${destination.name}风景" loading="lazy" class="aspect-[1.7/1] max-h-[50vh] w-full object-cover transition-transform duration-500 group-hover:scale-105"><span class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] text-[#566848] backdrop-blur-sm">${destination.tag}</span></div><div class="p-4"><h3 class="flex items-center justify-between text-sm font-semibold">${destination.name}${icon('arrow-right-up-line', 'text-[#9eac8c]')}</h3><p class="mt-1.5 text-[10px] leading-5 text-[#9aa28c]">${destination.subtitle}</p></div></a>`).join('')}</div>
    </section>
    <section class="mt-6 flex flex-col gap-4 rounded-xl border border-[#e7e4d0] bg-[#f6f2e5] p-5 sm:flex-row sm:items-center"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ece7d2] text-xl text-[#a79658]">${icon('heart-2-line')}</span><div class="flex-1"><h2 class="text-xs font-semibold text-[#85764c]">带上宝宝和长辈，舒适比打卡更重要。</h2><p class="mt-1.5 text-[11px] leading-5 text-[#aaa081]">提前确认安全座椅、住宿供暖与儿童餐食；每段长途给休息留一点时间，天气变化时及时调整行程。</p></div><a href="#guide" class="flex shrink-0 items-center gap-2 text-xs text-[#95824e] hover:text-[#675a30]">看看出行提醒 ${icon('arrow-right-line')}</a></section>
    <p class="mt-4 text-right text-[10px] text-[#aab09e]">${dateRange()} · 图片为目的地风景参考，不代表当日天气或景观保证</p>`;
}
