import { days, travelEstimates, travelEstimateNote, travelModes, formatTravelDuration, drivingSummary } from './data.js';
import { storage } from './store.js';
import { icon, escape, pageHeading, dayDate, softButton, inputClass, download, toast } from './ui.js';

function travelSection(day) {
  const travel = travelEstimates[day.id];
  return `<section aria-labelledby="travel-heading-${day.id}" class="mb-6 overflow-hidden rounded-xl border border-[#dce5d5] bg-[#f7faf3]">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4ebdc] px-4 py-3"><h3 id="travel-heading-${day.id}" class="flex items-center gap-2 text-xs font-semibold text-[#526e43]">${icon('steering-2-line')} 目的地之间 · 预估车程</h3><span class="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#526e43]">${escape(drivingSummary(day.id))}</span></div>
    <p class="px-4 pt-3 text-[11px] leading-6 text-[#71816a]">只计行驶；接驳单列，休息与游览另留时间。</p>
    <ol class="divide-y divide-[#e4ebdc] px-4">${travel.legs.map(leg => `<li class="py-3"><div class="flex flex-wrap items-start justify-between gap-2"><h4 class="min-w-0 flex-1 basis-48 text-xs font-medium leading-6 text-[#4f6546]">${escape(leg.from)} <span class="px-1 text-[#91a383]" aria-label="前往">→</span> ${escape(leg.to)}</h4><span class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#526e43]">${escape(formatTravelDuration(leg.minutes))}</span></div><p class="mt-1 text-[11px] leading-6 text-[#71816a]"><span class="mr-2 inline-block rounded border border-[#dce5d5] px-1.5 text-[10px] font-medium">${escape(travelModes[leg.mode])}</span>${escape(leg.note)}</p></li>`).join('')}</ol>
    <p class="border-t border-[#e4ebdc] bg-[#f5f1e5] px-4 py-3 text-[11px] leading-6 text-[#817047]">${icon('information-line', 'mr-1')}${escape(travel.note)}</p>
  </section>`;
}

function travelText(day) {
  const travel = travelEstimates[day.id];
  return [`预估车程：${drivingSummary(day.id)}（不含景区接驳、休息及游览）`, ...travel.legs.map(leg => `  ${leg.from} → ${leg.to}｜${travelModes[leg.mode]} ${formatTravelDuration(leg.minutes)}；${leg.note}`), `估算说明：${travel.note}`].join('\n');
}

function dayCard(day, openDay) {
  return `<details data-day="${day.id}" id="day-${day.id}" ${day.id === openDay ? 'open' : ''} class="group overflow-hidden rounded-xl border border-[#e4e8dc] bg-white open:border-[#bacbad] open:shadow-sm">
    <summary class="flex cursor-pointer list-none items-center gap-3 p-4 outline-offset-[-4px] transition-colors hover:bg-[#f8faf4] sm:gap-5 sm:p-5 [&::-webkit-details-marker]:hidden"><div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eff3e7] text-[#718a58]"><span class="text-center"><span class="block text-[8px] tracking-widest">DAY</span><span class="block text-xl font-semibold leading-6">${String(day.id).padStart(2, '0')}</span></span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h2 class="text-sm font-semibold sm:text-base">${day.title}</h2><span class="rounded-full bg-[#f4f5ee] px-2 py-0.5 text-[9px] text-[#98a386]">${day.tag}</span></div><p class="mt-2 whitespace-normal break-words text-[10px] leading-5 text-[#97a18c] sm:text-xs">${escape(day.route.join(' → '))}</p><p class="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] leading-5 text-[#657d4e]">${icon('time-line')}<span>${escape(drivingSummary(day.id))}</span><span class="text-[10px] text-[#879578]">规划粗估 · 接驳 / 游览另计${day.id === 2 ? ' · 胡杨林定位待确认' : ''}</span></p></div><span class="hidden text-[10px] text-[#99a386] sm:block">${dayDate(day.id, true)}</span><span class="text-xl text-[#99a889] transition-transform group-open:rotate-180">${icon('arrow-down-s-line')}</span></summary>
    <div class="border-t border-[#edf0e7] p-5 sm:p-6"><div class="mb-6 flex items-center gap-4"><img src="${day.image}" alt="${day.city}行程沿途景色参考" loading="lazy" class="h-20 w-28 shrink-0 rounded-lg object-cover sm:w-36"><div><p class="text-sm leading-7 text-[#7c8d6f]">${day.intro}</p><span class="mt-1 block text-[10px] text-[#a3ad96]">${dayDate(day.id, true)} · 按原图整理，具体时刻与师傅确认</span></div></div>
    ${travelSection(day)}
    <div class="mb-6 grid gap-4 lg:grid-cols-3">${day.activities.map((activity, index) => `<article class="rounded-xl border border-[#ebeee4] bg-[#fbfcf8] p-4"><span class="text-[10px] font-semibold tracking-[0.12em] text-[#a0af8d]">STOP 0${index + 1}</span><h3 class="mb-2 mt-2 text-xs font-semibold">${activity.title}</h3><p class="text-[11px] leading-6 text-[#8f9a84]">${activity.text}</p></article>`).join('')}</div>
    <div class="grid gap-3 sm:grid-cols-2"><div class="flex gap-3 rounded-lg bg-[#f5f7ef] p-4"><span class="text-lg text-[#81976d]">${icon('hotel-bed-line')}</span><div><h3 class="mb-1 text-[10px] text-[#9ca58f]">今晚住哪里</h3><p class="text-xs leading-6 text-[#667957]">${day.hotel}</p></div></div><div class="flex gap-3 rounded-lg bg-[#f5f7ef] p-4"><span class="text-lg text-[#81976d]">${icon('restaurant-line')}</span><div><h3 class="mb-1 text-[10px] text-[#9ca58f]">餐食安排</h3><p class="text-xs leading-6 text-[#667957]">${day.meal}</p></div></div></div>
    <div class="mt-4 rounded-xl border border-[#e4e8d8] bg-[#f0f4e9] p-4"><h3 class="flex items-center gap-2 text-xs font-semibold text-[#657d4e]">${icon('parent-line')} 给我们一家的小建议 <span class="font-normal text-[#a0ac8d]">· 补充建议</span></h3><p class="mt-2 text-[11px] leading-6 text-[#879578]">${day.family}</p></div>
    <div class="mt-3 flex gap-2 rounded-lg bg-[#f9f5e9] p-4 text-[11px] leading-6 text-[#a08f60]"><span>${icon('information-line')}</span><p><strong class="font-medium">出发前确认：</strong>${day.confirm}</p></div>
    <label class="mt-5 block"><span class="mb-2 flex items-center gap-2 text-[11px] text-[#8e9c7f]">${icon('sticky-note-line')} 这一天的家庭备注 <span class="text-[9px] text-[#abb49c]">自动保存在当前浏览器</span></span><textarea data-note="${day.id}" rows="2" maxlength="2000" placeholder="记下集合时间、想吃的餐厅，或想和师傅商量的安排…" class="${inputClass} resize-y bg-[#fcfdf9] leading-6 placeholder:text-[#b3baa7]">${escape(storage.get().notes[day.id] || '')}</textarea></label>
    </div>
  </details>`;
}
export function renderItinerary(openDay = 1) {
  return `${pageHeading('EIGHT DAYS · SEVEN NIGHTS', '一路向秋，慢慢走。', '原始路线完整保留，点击每天展开。路线、餐宿与家庭建议，一目了然。', `<div class="flex gap-2"><button data-action="source" data-source="0" class="${softButton}">${icon('image-line')} 对照原图</button><button data-download-itinerary class="${softButton}">${icon('download-2-line')} 下载行程</button></div>`)}
    <section class="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#e1e6d3] bg-[#edf2e3] px-5 py-4"><span class="text-2xl text-[#839769]">${icon('route-line')}</span><div class="flex-1"><p class="text-xs font-semibold text-[#607a4c]">乌鲁木齐往返 · 8 天 7 晚 · 喀纳斯二次入园</p><p class="mt-1.5 text-[11px] leading-6 text-[#71816a]">${escape(travelEstimateNote)}</p></div><button data-action="settings" class="text-[11px] text-[#7c8f65] hover:text-[#36583d]">${icon('calendar-line')} ${storage.get().startDate ? '调整日期' : '设置出发日期'}</button></section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><nav aria-label="按天跳转" class="flex flex-wrap gap-2">${days.map(day => `<a href="#itinerary/${day.id}" class="rounded-lg border border-[#e1e6d6] bg-white px-3 py-2 text-[10px] text-[#81926d] hover:border-[#a7b899] hover:bg-[#f0f4e9]">D${day.id} <span class="hidden xl:inline">${day.city}</span></a>`).join('')}</nav><button data-expand-all class="flex items-center gap-1 text-xs text-[#7c8c6c] hover:text-[#365640]">${icon('expand-up-down-line')}<span>全部展开</span></button></div>
    <section class="space-y-4" aria-label="八日行程">${days.map(day => dayCard(day, openDay)).join('')}</section>
    <p class="mt-6 rounded-xl border border-dashed border-[#dce3d0] p-4 text-[11px] leading-6 text-[#9ba58c]">${icon('information-line', 'mr-1')} 本页住宿钻级及赠送活动沿用原图描述，不作额外承诺；每日所有安排以最终合同、预约与当日开放为准。照片为目的地参考图，不代表住宿实景。</p>`;
}
export function bindItinerary(root) {
  const expand = root.querySelector('[data-expand-all]');
  const cards = [...root.querySelectorAll('[data-day]')];
  const updateLabel = () => { expand.querySelector('span').textContent = cards.every(card => card.open) ? '全部收起' : '全部展开'; };
  expand.addEventListener('click', () => { const open = !cards.every(card => card.open); cards.forEach(card => { card.open = open; }); updateLabel(); });
  cards.forEach(card => card.addEventListener('toggle', updateLabel));
  root.querySelectorAll('[data-note]').forEach(input => input.addEventListener('input', () => storage.setNote(input.dataset.note, input.value)));
  root.querySelector('[data-download-itinerary]').addEventListener('click', () => {
    const content = ['北疆慢游记 · 三大一小的 8 日行程', '时间统一为北京时间；未标注日期则以 D1–D8 为准。', travelEstimateNote, ...days.map(day => `\nD${day.id} ${dayDate(day.id, true)}｜${day.title}\n路线：${day.route.join(' → ')}\n${travelText(day)}\n${day.activities.map(activity => `${activity.title}：${activity.text}`).join('\n')}\n住宿：${day.hotel}\n餐食：${day.meal}\n家庭建议：${day.family}\n待确认：${day.confirm}\n家庭备注：${storage.get().notes[day.id] || '未填写'}`), '\n路线依据用户提供的行程图整理；车程为补充规划粗估，以最终合同、景区开放及实际路况为准。'].join('\n');
    download('北疆慢游记-8日行程.txt', content, 'text/plain;charset=utf-8'); toast('行程已下载，包含分段车程与家庭备注');
  });
}
