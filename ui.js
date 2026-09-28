import { storage } from './store.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const icon = (name, extra = '') => `<i class="ri-${escape(name)} ${extra}" aria-hidden="true"></i>`;
export const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#2e5642] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e3e2d] focus-visible:ring-2 focus-visible:ring-[#a1bda0]';
export const softButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e6db] bg-white px-4 py-2.5 text-sm hover:border-[#8b9e80] hover:bg-[#f7f9f3]';
export const inputClass = 'w-full rounded-lg border border-[#dfe4d8] bg-white px-3 py-2.5 text-sm focus:border-[#698269] focus:outline-none focus:ring-2 focus:ring-[#e4eddd]';
export const panelClass = 'rounded-2xl border border-[#e5e9df] bg-white';
const nav = [
  { id: 'overview', label: '旅行总览', small: '我们的金秋假期', icon: 'dashboard-line' },
  { id: 'itinerary', label: '每日行程', small: '8 天，一路向秋', icon: 'route-line' },
  { id: 'adventure', label: '历史冒险', small: '每一站，都有来处', icon: 'book-open-line' },
  { id: 'packing', label: '行前清单', small: '把安心装进行李', icon: 'suitcase-2-line' },
  { id: 'guide', label: '安心出行', small: '给一家人的小叮咛', icon: 'shield-check-line' }
];
export function dayDate(day, full = false) {
  const start = storage.get().startDate;
  if (!start) return full ? `第 ${day} 天 · 日期待定` : `DAY ${String(day).padStart(2, '0')}`;
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + day - 1);
  const label = `${date.getMonth() + 1}月${date.getDate()}日`;
  return full ? `${label} · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]}` : label;
}
export function dateRange() {
  return storage.get().startDate ? `${dayDate(1)} 至 ${dayDate(8)}` : '国庆假期 · 出发日期待定';
}
export function progress(percent, extra = '') {
  return `<div class="h-1.5 overflow-hidden rounded-full bg-[#edf0e8] ${extra}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="行李准备进度"><div class="h-full origin-left rounded-full bg-[#7e9766] transition-transform duration-500" style="transform:scaleX(${percent / 100})"></div></div>`;
}
export function pageHeading(eyebrow, title, text, actions = '') {
  return `<div class="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p class="mb-2 text-[10px] font-semibold tracking-[0.22em] text-[#839074]">${eyebrow}</p><h1 id="page-title" tabindex="-1" class="text-2xl font-semibold tracking-wide outline-none sm:text-[28px]">${title}</h1><p class="mt-2 text-sm leading-6 text-[#839080]">${text}</p></div>${actions}</div>`;
}
export function shell(page, content) {
  const active = nav.find(item => item.id === page) || nav[0];
  const stats = storage.stats();
  return `<aside class="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-[#e4e8dd] bg-[#fcfcf8] p-6 lg:flex print:hidden">
    <a href="#overview" class="mb-12 flex items-center gap-2.5"><span class="grid h-10 w-10 place-items-center rounded-xl bg-[#294d3b] text-2xl text-[#f4edca]">${icon('landscape-line')}</span><span><strong class="block text-[19px] tracking-wide">北疆慢游记</strong><span class="text-[8px] tracking-[0.24em] text-[#8e9884]">OUR AUTUMN JOURNEY</span></span></a>
    <p class="mb-4 pl-3 text-[10px] tracking-[0.16em] text-[#9da492]">属于我们的旅行手册</p>
    <nav aria-label="主导航" class="space-y-2">${nav.map(item => `<a href="#${item.id}" ${item.id === page ? 'aria-current="page"' : ''} class="flex items-center gap-3 rounded-xl p-3 ${item.id === page ? 'bg-[#eaf0df] text-[#375735]' : 'text-[#7e8878] hover:bg-[#f1f3eb]'}"><span class="text-xl">${icon(item.icon)}</span><span><span class="block text-[13px] font-semibold">${item.label}</span><span class="mt-0.5 block text-[10px] ${item.id === page ? 'text-[#85916f]' : 'text-[#a5ad9d]'}">${item.small}</span></span>${item.id === 'itinerary' ? '<span class="ml-auto rounded-md bg-white px-1.5 text-[10px] text-[#819070]">8</span>' : ''}</a>`).join('')}</nav>
    <div class="mt-10 rounded-xl border border-[#e7ebdc] bg-[#f6f7ed] p-4"><span class="text-[10px] tracking-widest text-[#8e976f]">本次旅行</span><p class="mt-2 text-sm font-semibold">三大一小 · 一路同行</p><p class="mt-1 text-[11px] text-[#919881]">8 天 7 晚 · 北疆金秋环线</p><div class="mt-4 flex -space-x-1.5">${['50+', '30', '30', '2岁'].map((text, index) => `<span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f6f7ed] text-[9px] font-medium ${index === 3 ? 'bg-[#efdcb5] text-[#90712f]' : 'bg-[#dce5d4] text-[#617c56]'}">${text}</span>`).join('')}<span class="pl-4 pt-2 text-[10px] text-[#8f9780]">+ 司机师傅</span></div></div>
    <div class="mt-auto pt-10"><div class="rounded-xl border border-dashed border-[#d7decc] p-4"><div class="flex items-center gap-2 text-[#687b51]">${icon('leaf-line')}<span class="text-xs font-medium">不赶路，好好看风景</span></div><p class="mt-2 text-[11px] leading-5 text-[#9aA28d]">把时间留给家人，<br>把回忆留给北疆。</p></div><button data-action="settings" class="mt-5 flex w-full items-center justify-center gap-2 text-xs text-[#8b9582] hover:text-[#36563c]">${icon('settings-3-line')} 旅行设置</button></div>
  </aside>
  <div class="min-h-screen lg:ml-[220px] print:ml-0">
    <header class="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-[#e6e9e1] bg-[#fcfcf8]/90 px-5 py-4 sm:px-8 print:hidden">
      <div class="flex items-center gap-3 text-xs"><a href="#overview" class="flex items-center gap-2 font-semibold lg:hidden">${icon('landscape-line', 'text-xl text-[#416845]')}北疆慢游记</a><span class="hidden text-[#99a08f] lg:inline">我们的旅行</span><span class="text-[#c5ccbc]">/</span><span class="text-[#607154]">${active.label}</span></div>
      <div class="flex items-center gap-4"><span data-save-status class="hidden items-center gap-1.5 text-[11px] text-[#8a967f] sm:flex">${icon('cloud-line')} 保存在当前浏览器</span><button data-action="settings" class="flex items-center gap-2 rounded-lg border border-[#e2e7d8] bg-[#f6f8ed] px-3 py-2 text-[11px] text-[#70805c]">${icon('calendar-2-line')} ${dateRange()}</button></div>
      <nav aria-label="移动端导航" class="-mb-1 grid w-full grid-cols-5 gap-0.5 pt-2 lg:hidden">${nav.map(item => `<a href="#${item.id}" ${item.id === page ? 'aria-current="page"' : ''} class="flex min-h-11 items-center justify-center gap-1 rounded-lg px-0.5 py-2.5 text-[10px] leading-4 sm:gap-1.5 sm:text-xs ${item.id === page ? 'bg-[#eaf0df] font-semibold text-[#3c5d35]' : 'text-[#8a947e]'}">${icon(item.icon)}<span class="truncate">${item.label}</span></a>`).join('')}</nav>
    </header>
    <main id="main" class="mx-auto w-full max-w-[1800px] px-5 py-7 sm:px-8 sm:py-8">${content}</main>
    <footer class="mx-5 mt-3 border-t border-[#e1e6d9] py-5 text-center text-[11px] leading-6 text-[#a0a894] sm:mx-8"><p class="mb-1">三大一小的金秋回忆 · 按附件整理，开放、天气及预订以出发前确认为准</p><p>由 AI 通过自然语言生成</p></footer>
  </div>`;
}
let toastTimer;
export function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.add('hidden'), 3500);
}
export function openModal(title, body, afterOpen) {
  const root = document.querySelector('#modal-root');
  const previous = document.activeElement;
  root.innerHTML = `<dialog aria-labelledby="dialog-title" class="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#e1e6d8] bg-[#fcfdf8] p-0 text-[#2c3e30] shadow-2xl backdrop:bg-[#172f25]/50 backdrop:backdrop-blur-sm"><div class="flex items-center justify-between border-b border-[#e5e9de] px-6 py-5"><h2 id="dialog-title" class="text-lg font-semibold">${title}</h2><button type="button" data-close aria-label="关闭弹窗" class="rounded-lg px-2 py-1 text-xl text-[#8e9883] hover:bg-[#edf1e5]">${icon('close-line')}</button></div><div class="p-6">${body}</div></dialog>`;
  const dialog = root.querySelector('dialog');
  const close = () => { dialog.close(); root.innerHTML = ''; if (previous?.isConnected) previous.focus(); };
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
  dialog.showModal();
  try { afterOpen?.(dialog, close); } catch (error) { close(); throw error; }
}
export function confirmModal(title, text, onConfirm, label = '确认') {
  openModal(title, `<p class="text-sm leading-7 text-[#7c8874]">${text}</p><div class="mt-6 flex justify-end gap-3"><button type="button" data-close class="${softButton}">取消</button><button type="button" data-confirm class="${buttonClass}">${label}</button></div>`, (dialog, close) => {
    dialog.querySelector('[data-confirm]').addEventListener('click', () => { close(); onConfirm(); });
  });
}
export function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
