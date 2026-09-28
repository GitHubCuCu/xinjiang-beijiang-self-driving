import { days, travelEstimates, travelEstimateNote, travelModes, formatTravelDuration, drivingSummary, adventureBook, adventureChapters, adventurePlaces, historySources, historyStories, storiesForDay } from './data.js';
import { storage } from './store.js';
import { icon, escape, pageHeading, dayDate, softButton, buttonClass, inputClass, download, toast, confirmModal } from './ui.js';

const archivePanel = 'rounded-2xl border border-[#dedfcf] bg-white';
const archiveButton = `${softButton} min-h-11 text-sm motion-reduce:transition-none`;
function chapterLabel(id) {
  const status = storage.adventureStatus(id);
  return status.field ? '实地完成' : status.reading ? '阅读体验' : status.done ? `探索中 · ${status.core}/3` : '待探索';
}
function adventureProgressText() {
  const stats = storage.adventureStats();
  return `实地完成 ${stats.field}/8 章 · 阅读替代 ${stats.reading}/8 章 · 线索 ${stats.clues}/8 · 行动 ${stats.tasks}/${stats.total}`;
}
function sourceMarkup(ids) {
  return `<ul class="space-y-3">${[...new Set(ids)].map(id => {
    const source = historySources[id];
    if (!source) return '';
    const url = new URL(source.url);
    const link = ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
    return `<li class="break-words text-sm leading-6"><p>${link ? `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer" class="font-medium text-[#426137] underline underline-offset-4">${escape(source.title)} ${icon('external-link-line')}</a>` : escape(source.title)}</p><p>${escape(source.publisher)} · 发布 ${escape(source.published)} · 查阅 ${escape(source.checked)}${url.protocol === 'http:' ? ' · 原站仅提供 HTTP 链接' : ''}</p><p class="mt-1">支持范围：${escape(source.supports)}</p></li>`;
  }).join('')}</ul>`;
}
function npcMessage(chapter) {
  const status = storage.adventureStatus(chapter.id);
  const choice = chapter.choice?.options.find(option => option.id === storage.get().adventure.choices[chapter.id]);
  const previousChoiceChapter = adventureChapters.slice(0, chapter.id - 1).reverse().find(item => storage.get().adventure.choices[item.id] && storage.adventureStatus(item.id).unlocked);
  const previousChoice = previousChoiceChapter?.choice.options.find(option => option.id === storage.get().adventure.choices[previousChoiceChapter.id]);
  return [status.unlocked ? chapter.reaction : status.done ? '你已经带回一些观察。先让细节说话，不必为了进度勉强同行的人。' : '我们先保留疑问。这里的任务不是考题，看不见、进不去或累了，都可以换成阅读。', previousChoice ? `我还记得你的选择：“${previousChoice.label}”。` : '', choice?.reply || ''].filter(Boolean).join(' ');
}
function clueMarkup(chapter) {
  const status = storage.adventureStatus(chapter.id);
  return status.unlocked
    ? `<p class="mb-2 text-sm font-semibold text-[#426137]">${status.field ? '来自你的实地行动（自行记录）' : '阅读获得 · 不计作实地完成'}</p><p class="leading-8">${escape(chapter.clue)}</p>`
    : `<p class="leading-8">线索还夹在这一页里。完成任意两项核心行动即可展开；亲子行动可选。无法到访时可选择阅读，不必补做或绕行。</p>`;
}
function endingMarkup() {
  const stats = storage.adventureStats();
  if (!stats.ending) return `<h2 class="text-lg font-semibold">最后一页，暂时留白</h2><p class="mt-3 text-sm leading-7">已获得 ${stats.clues}/8 条线索。实地或阅读都能继续故事，不强迫出行。</p><button type="button" data-ending-read class="${archiveButton} mt-4">提前阅读结局（含剧透）</button>`;
  const choice = adventureChapters[7].choice.options.find(option => option.id === storage.get().adventure.choices[8]);
  return `<span class="text-sm tracking-widest text-[#806528]">THE EIGHTH PAGE · 虚构故事结局</span><h2 tabindex="-1" data-ending-heading class="mt-2 text-xl font-semibold outline-offset-4">第八页，由同行者续写</h2>${stats.clues < 8 ? '<p class="mt-3 text-sm text-[#806528]">提前阅读，不代表完成全部实地任务。</p>' : ''}<p class="mt-4 whitespace-pre-line leading-8">${escape(adventureBook.ending)}</p>${choice ? `<p class="mt-4 border-l-2 border-[#b79a57] pl-4 leading-7">${escape(choice.reply)}</p>` : ''}<p class="mt-4 text-sm">${escape(adventureProgressText())}</p>`;
}
function storyMarkup(story) {
  const tone = story.type === '史实' ? 'bg-[#eaf0e2] text-[#426137]' : story.type === '虚构剧情' ? 'bg-[#eeeaf2] text-[#665477]' : 'bg-[#f6f2e5] text-[#806528]';
  return `<details class="group border-b border-[#e6e5d9] py-2 last:border-0"><summary class="flex min-h-14 cursor-pointer list-none items-start gap-3 py-3 outline-offset-4 [&::-webkit-details-marker]:hidden"><span class="mt-1 text-[#9a8550]">${icon('book-open-line')}</span><span class="min-w-0 flex-1"><span class="flex flex-wrap items-center gap-2"><span class="font-semibold">${escape(story.stop || story.title)}</span><span class="rounded px-2 py-0.5 text-sm ${tone}">${escape(story.type)}</span></span><span class="mt-2 block text-sm leading-6 text-[#53634c]">${escape(story.title)}</span></span><span class="mt-1 text-[#71816a] group-open:rotate-180 motion-reduce:transform-none">${icon('arrow-down-s-line')}</span></summary><p class="pb-4 leading-8 text-[#53634c]">${escape(story.text)}</p>${story.sources.length ? `<details class="mb-4 rounded-lg bg-[#f7f8f3] p-3 text-[#53634c]"><summary class="min-h-11 cursor-pointer py-2 text-sm font-medium">查看依据与核验范围</summary>${sourceMarkup(story.sources)}</details>` : '<p class="mb-4 text-sm text-[#665477]">叙事包装，不是地方史或出土文献。</p>'}</details>`;
}

export function renderAdventure(requestedDay = 1) {
  const chapter = adventureChapters.find(item => item.id === requestedDay) || adventureChapters[0];
  const place = adventurePlaces[chapter.place];
  const day = days.find(item => item.id === chapter.id);
  const stats = storage.adventureStats();
  const status = storage.adventureStatus(chapter.id);
  const previousMissing = chapter.id > 1 && !storage.adventureStatus(chapter.id - 1).unlocked;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`;
  return `${pageHeading('A FAMILY FIELD JOURNAL', '历史冒险', '每一站有故事，每一天留一点时间给好奇心。', `<button type="button" data-download-adventure class="${archiveButton}">${icon('download-2-line')} 下载路簿</button>`)}
    <div data-adventure-day="${chapter.id}" class="min-w-0 text-[15px] text-[#293b32]">
      <section class="relative isolate overflow-hidden rounded-2xl bg-[#183d2d] text-[#f7f8f3]">
        <img src="${escape(day.image)}" alt="${escape(day.city)}风景参考" class="absolute inset-0 h-full w-full object-cover opacity-20" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-r from-[#183d2d] via-[#183d2d]/90 to-transparent"></div>
        <div class="relative grid gap-7 p-6 sm:p-8 xl:grid-cols-[1.4fr_1fr]">
          <div><p class="text-sm tracking-[0.18em] text-[#e0cd98]">THE NORTHERN JOURNAL · 8 CHAPTERS</p><h2 class="mt-4 text-3xl font-semibold tracking-wider sm:text-4xl">${escape(adventureBook.title)}</h2><p class="mt-2 text-xl text-[#e9ddba]">${escape(adventureBook.subtitle)}</p><p class="mt-5 max-w-xl leading-8 text-[#e1e8da]">${escape(adventureBook.premise)}</p><a data-continue-adventure href="#adventure/${stats.next}" class="mt-6 inline-flex min-h-11 items-center gap-4 rounded-lg bg-[#eddfb6] px-5 py-3 font-semibold text-[#274432] hover:bg-[#f7eccd] motion-reduce:transition-none">继续调查 ${icon('arrow-right-line')}</a></div>
          <div class="self-center rounded-xl border border-[#c5ad70]/40 bg-[#f6f2e5] p-5 text-[#53634c] shadow-xl sm:p-6"><p class="flex items-center gap-2 text-sm font-semibold tracking-widest text-[#806528]">${icon('quill-pen-line')} 给同行者的一封信</p><p class="mt-4 leading-8">“我曾以为，只要找到那个人的名字，就能把家人的记忆保留下来。现在缺了第八页……请你先别替这本书写结论。”</p><p class="mt-3 text-right text-sm">— 阿岚 · 虚构人物</p><p class="mt-4 border-t border-[#d8ceb1] pt-4 text-sm leading-6">${escape(adventureBook.disclaimer)}</p></div>
        </div>
        <p data-adventure-progress class="relative border-t border-white/15 px-6 py-4 text-sm leading-7 text-[#e6e8db] sm:px-8">${escape(adventureProgressText())}</p>
      </section>
      <nav aria-label="冒险章节" class="my-6 flex min-w-0 gap-2 overflow-x-auto pb-2">${adventureChapters.map(item => `<a href="#adventure/${item.id}" ${item.id === chapter.id ? 'aria-current="page"' : ''} class="min-w-[138px] flex-1 rounded-xl border p-4 focus-visible:ring-2 focus-visible:ring-[#b79a57] ${item.id === chapter.id ? 'border-[#426137] bg-[#eaf0e2]' : 'border-[#dedfcf] bg-white hover:bg-[#f6f2e5]'}"><span class="text-sm tracking-widest text-[#806528]">CH. ${String(item.id).padStart(2, '0')}</span><strong class="mt-2 block text-sm leading-6">${escape(item.title)}</strong><span data-chapter-state="${item.id}" class="mt-2 block text-sm text-[#53634c]">${escape(chapterLabel(item.id))}</span></a>`).join('')}</nav>
      <div class="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p class="text-sm text-[#806528]">${escape(dayDate(chapter.id, true))} · ${escape(chapter.duration)}</p><h2 id="adventure-chapter-title" tabindex="-1" class="mt-2 text-2xl font-semibold outline-offset-4">${escape(chapter.subtitle)}</h2></div><a href="#itinerary/${chapter.id}" class="${archiveButton}">${icon('route-line')} 查看今日车程</a></div>
      <p class="mb-5 rounded-xl border border-dashed border-[#c9cdbb] p-4 text-sm leading-7 text-[#53634c]">前情提示：${escape(chapter.recap)} ${previousMissing ? `前章尚未解锁，仍可自由探索；<a href="#adventure/${chapter.id - 1}" class="font-medium underline underline-offset-4">回看前章</a>，或在前章主动选择阅读。` : '不用按固定顺序游玩，也不用完成所有行动。'}</p>
      <div class="grid min-w-0 items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section class="${archivePanel} min-w-0 overflow-hidden" aria-labelledby="quest-title">
          <div class="border-b border-[#dedfcf] bg-[#f6f2e5] p-5 sm:p-6"><h3 id="quest-title" class="text-lg font-semibold">QUEST ${String(chapter.id).padStart(2, '0')} | ${escape(chapter.title)}</h3>
            <p class="mt-4 font-medium">导航：“${escape(place.name)}”</p><p data-adventure-address class="mt-2 select-text break-words text-sm leading-7 text-[#53634c]">${escape(place.address)}</p><div class="mt-3 flex flex-wrap gap-2"><button type="button" data-copy-place class="${archiveButton}">${icon('file-copy-line')} 复制地点</button><a href="${escape(maps)}" target="_blank" rel="noopener noreferrer" class="${archiveButton}">${icon('map-pin-line')} 地图搜索</a></div><p class="mt-3 text-sm leading-7 text-[#53634c]">${escape(place.scope)}</p>
            <details class="mt-3 text-sm leading-7 text-[#806528]"><summary class="min-h-11 cursor-pointer py-2 font-medium">到访前必读 · 顺路与开放条件</summary><p>${escape(place.detour)}</p><p class="mt-2">${escape(place.access)}</p><p class="mt-2">预算含章内短走与阅读，不含驾车、排队和接驳；Google Maps 仅作地点搜索，可复制到常用地图，不保证可访问或精确停车定位。</p><div class="mt-3">${sourceMarkup(place.sources)}</div></details>
          </div>
          <div class="p-5 sm:p-6"><p class="text-sm font-semibold text-[#806528]">情景 / NPC</p><p class="mt-2 leading-8">${escape(chapter.scene)}</p><blockquote class="my-5 border-l-2 border-[#b79a57] bg-[#faf8ef] px-4 py-3 leading-7 text-[#69582e]">${escape(chapter.prop)}</blockquote>
            <div class="flex flex-wrap items-center justify-between gap-2"><h4 class="font-semibold">你的行动</h4><span data-core-progress class="text-sm text-[#426137]">核心 ${status.core}/3 · 任意2项可获线索</span></div><p class="mt-2 text-sm leading-7 text-[#53634c]">只勾选亲自做过的行动。不便到访，请使用下方阅读体验。</p>
            <ul class="mt-3 divide-y divide-[#e9e9de]">${chapter.tasks.map(task => `<li><label class="flex min-h-11 cursor-pointer items-start gap-3 py-4"><input type="checkbox" data-quest-task="${escape(task.id)}" ${storage.get().adventure.tasks[task.id] ? 'checked' : ''} class="mt-1.5 h-5 w-5 shrink-0 accent-[#426137]"><span class="leading-8">${task.optional ? '<span class="mb-1 inline-block rounded bg-[#f6f2e5] px-2 text-sm text-[#806528]">亲子可选</span><br>' : ''}${escape(task.text)}</span></label></li>`).join('')}</ul>
            ${chapter.choice ? `<fieldset class="mt-4 rounded-xl bg-[#f7f8f3] p-4"><legend class="px-1 text-sm font-semibold">给阿岚的小选择 · 不影响完成条件</legend><div class="space-y-2">${chapter.choice.options.map(option => `<label class="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name="adventure-choice" data-adventure-choice value="${escape(option.id)}" ${storage.get().adventure.choices[chapter.id] === option.id ? 'checked' : ''} class="h-4 w-4 accent-[#426137]"><span>${escape(option.label)}</span></label>`).join('')}</div></fieldset>` : ''}
            <div class="mt-5 rounded-xl border border-[#dedfcf] bg-[#faf8ef] p-4"><p class="text-sm font-semibold text-[#806528]">阿岚的回信 · 虚构反馈</p><p data-npc-reply class="mt-2 leading-8">${escape(npcMessage(chapter))}</p></div>
          </div>
        </section>
        <aside class="${archivePanel} min-w-0 p-5 sm:p-6" aria-labelledby="station-archives"><p class="text-sm tracking-widest text-[#806528]">FIELD ARCHIVES</p><h3 id="station-archives" class="mt-2 text-xl font-semibold">每一站，都有来处</h3><p class="mt-3 text-sm leading-7 text-[#53634c]">按原行程排列的历史小故事。档案可以自由打开；资料不足的站点如实标注，不以传说替代史实。</p><div class="mt-4">${storiesForDay(chapter.id).map(storyMarkup).join('')}${chapter.extraStory ? storyMarkup(historyStories[chapter.extraStory]) : ''}</div></aside>
      </div>
      <section class="mt-6 rounded-2xl border border-[#ccd6bd] bg-[#edf2e5] p-5 sm:p-6" aria-labelledby="clue-heading"><p class="text-sm tracking-widest text-[#657d4e]">A PIECE OF THE JOURNEY</p><h3 id="clue-heading" class="mb-4 mt-2 text-xl font-semibold">获得线索</h3><div data-clue-content>${clueMarkup(chapter)}</div><button type="button" data-reading-toggle aria-pressed="${status.reading}" class="${archiveButton} mt-4">${status.reading ? '取消本章阅读标记' : '不便到访？改为阅读体验'}</button><p class="mt-3 text-sm leading-7 text-[#53634c]">阅读仅解锁故事，不勾选实地任务。取消勾选后会重新计算进度，不影响其他章节。</p></section>
      <section data-adventure-ending class="mt-6 rounded-2xl border border-dashed border-[#bfa970] bg-[#f6f2e5] p-5 sm:p-7">${endingMarkup()}</section>
      <p class="mt-6 rounded-xl border border-[#dedfcf] p-4 text-sm leading-7 text-[#53634c]">${icon('shield-check-line', 'mr-1')}${escape(adventureBook.safety)}</p>
      <div class="mt-6 flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap gap-2">${chapter.id > 1 ? `<a href="#adventure/${chapter.id - 1}" class="${archiveButton}">${icon('arrow-left-line')} 上一章</a>` : ''}${chapter.id < 8 ? `<a href="#adventure/${chapter.id + 1}" class="${archiveButton}">下一章 ${icon('arrow-right-line')}</a>` : '<a href="#overview" class="' + archiveButton + '">返回总览</a>'}</div><button type="button" data-reset-adventure class="min-h-11 px-3 text-sm text-[#806528] underline underline-offset-4">重置冒险进度</button></div>
      <p data-adventure-live role="status" aria-live="polite" class="mt-3 text-sm text-[#426137]"></p>
    </div>`;
}

function historyText(dayId) {
  return storiesForDay(dayId).map(story => `${story.stop}｜${story.type}｜${story.title}\n${story.text}\n${story.sources.map(id => { const source = historySources[id]; return `依据：${source.title}（查阅 ${source.checked}）${source.url}`; }).join('\n')}`).join('\n\n');
}
export function adventureText() {
  return [`${adventureBook.title}：${adventureBook.subtitle}`, adventureBook.disclaimer, adventureProgressText(), adventureBook.safety, ...adventureChapters.map(chapter => {
    const place = adventurePlaces[chapter.place];
    const status = storage.adventureStatus(chapter.id);
    return `\nQUEST ${String(chapter.id).padStart(2, '0')} | ${chapter.title}\n导航：${place.name} / ${place.address}\n${chapter.duration}；${place.detour}\n访问：${place.access}\n情景：${chapter.scene}\n${chapter.tasks.map(task => `[${storage.get().adventure.tasks[task.id] ? 'x' : ' '}] ${task.text}`).join('\n')}\n每站故事：\n${historyText(chapter.id)}\n线索（${chapterLabel(chapter.id)}）：${status.unlocked ? chapter.clue : '待探索'}\n${status.unlocked ? `阿岚：${npcMessage(chapter)}` : ''}`;
  }), `\n结局：${storage.adventureStats().ending ? adventureBook.ending : '待探索；未揭示的结局不会随下载提前公开。'}`].join('\n');
}

export function bindAdventure(root) {
  const chapter = adventureChapters.find(item => item.id === Number(root.querySelector('[data-adventure-day]')?.dataset.adventureDay));
  if (!chapter) return;
  let lastEnding = '';
  const update = message => {
    const status = storage.adventureStatus(chapter.id);
    const stats = storage.adventureStats();
    root.querySelector('[data-adventure-progress]').textContent = adventureProgressText();
    root.querySelector('[data-continue-adventure]').href = `#adventure/${stats.next}`;
    root.querySelectorAll('[data-chapter-state]').forEach(element => { element.textContent = chapterLabel(Number(element.dataset.chapterState)); });
    root.querySelector('[data-core-progress]').textContent = `核心 ${status.core}/3 · 任意2项可获线索`;
    root.querySelector('[data-npc-reply]').textContent = npcMessage(chapter);
    root.querySelector('[data-clue-content]').innerHTML = clueMarkup(chapter);
    const reading = root.querySelector('[data-reading-toggle]');
    reading.textContent = status.reading ? '取消本章阅读标记' : '不便到访？改为阅读体验';
    reading.setAttribute('aria-pressed', String(status.reading));
    const ending = endingMarkup();
    if (ending !== lastEnding) { root.querySelector('[data-adventure-ending]').innerHTML = ending; lastEnding = ending; }
    root.querySelector('[data-adventure-live]').textContent = message ? `${message}${storage.available() ? '，已保存至当前浏览器。' : '；仅在内存中，尚未保存，请导出备份。'}` : '';
  };
  root.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-quest-task]') && chapter.tasks.some(task => task.id === input.dataset.questTask)) {
      storage.setAdventureTask(input.dataset.questTask, input.checked);
      update(input.checked ? '已记录这项行动' : '已撤销这项行动');
    }
    if (input.matches('[data-adventure-choice]')) { storage.chooseAdventure(chapter.id, input.value); update('阿岚收到了你的选择'); }
  });
  root.addEventListener('click', async event => {
    if (event.target.closest('[data-copy-place]')) {
      const place = adventurePlaces[chapter.place];
      try { await navigator.clipboard.writeText(`${place.name} ${place.address}`); toast('地点已复制，可粘贴到常用地图'); }
      catch { const text = root.querySelector('[data-adventure-address]'); const range = document.createRange(); range.selectNodeContents(text); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); toast('无法自动复制，已选中地址，请长按或手动复制'); }
    }
    if (event.target.closest('[data-reading-toggle]')) {
      if (storage.adventureStatus(chapter.id).reading) { storage.setAdventureReading(chapter.id, false); update('已取消本章阅读标记'); }
      else confirmModal('改为阅读体验？', '将揭示本章线索，但不勾选任何实地任务。闭馆、疲劳或不顺路时，阅读也能继续故事。', () => { storage.setAdventureReading(chapter.id, true); update('本章已标记为阅读体验'); }, '阅读本章线索');
    }
    if (event.target.closest('[data-ending-read]')) confirmModal('提前翻开最后一页？', '这里会揭晓完整剧情。只标记你主动阅读了结局，不会把未做的任务设为完成。', () => { storage.readAdventureEnding(true); update('已主动阅读结局'); root.querySelector('[data-ending-heading]')?.focus({ preventScroll: true }); }, '确认阅读结局');
    if (event.target.closest('[data-reset-adventure]')) confirmModal('重新开始冒险？', '仅清除冒险行动、阅读记录和剧情选择。行李清单、家庭备注、日期和联系人全部保留；不会解除原数据写保护。', () => { storage.resetAdventure(); root.querySelectorAll('[data-quest-task], [data-adventure-choice]').forEach(input => { input.checked = false; }); update('已重置冒险进度'); }, '重置冒险');
    if (event.target.closest('[data-download-adventure]')) { download('北疆慢游记-北境路簿.txt', adventureText(), 'text/plain;charset=utf-8'); toast('路簿已下载，未揭示的线索与结局保持隐藏'); }
  });
}

function travelSection(day) {
  const travel = travelEstimates[day.id];
  return `<section aria-labelledby="travel-heading-${day.id}" class="mb-6 overflow-hidden rounded-xl border border-[#dce5d5] bg-[#f7faf3]">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4ebdc] px-4 py-3"><h3 id="travel-heading-${day.id}" class="flex items-center gap-2 text-xs font-semibold text-[#526e43]">${icon('steering-2-line')} 目的地之间 · 预估车程</h3><span class="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#526e43]">${escape(drivingSummary(day.id))}</span></div>
    <p class="px-4 pt-3 text-[11px] leading-6 text-[#71816a]">只计行驶；接驳单列，休息与游览另留时间。</p>
    <ol class="divide-y divide-[#e4ebdc] px-4">${travel.legs.map(leg => `<li class="py-3"><div class="flex flex-wrap items-start justify-between gap-2"><h4 class="min-w-0 flex-1 basis-48 text-xs font-medium leading-6 text-[#4f6546]">${escape(leg.from)} <span class="px-1 text-[#91a383]" aria-label="前往">→</span> ${escape(leg.to)}</h4><span class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#526e43]">${escape(formatTravelDuration(leg.minutes))}</span></div><p class="mt-1 text-[11px] leading-6 text-[#71816a]"><span class="mr-2 inline-block rounded border border-[#dce5d5] px-1.5 text-[10px] font-medium">${escape(travelModes[leg.mode])}</span>${escape(leg.note)}</p></li>`).join('')}</ol>
    <p class="border-t border-[#e4ebdc] bg-[#f5f1e5] px-4 py-3 text-[11px] leading-6 text-[#817047]">${icon('information-line', 'mr-1')}${escape(travel.note)}</p>
  </section>`;
}

function chapterSummary(day) {
  const chapter = adventureChapters.find(item => item.id === day.id);
  return `<section class="mb-6 rounded-xl border border-[#dedfcf] bg-[#faf8ef] p-4"><div class="flex flex-wrap items-center justify-between gap-3"><div class="min-w-0"><p class="text-[10px] tracking-[0.16em] text-[#806528]">CH. ${String(day.id).padStart(2, '0')} · 历史冒险</p><h3 class="mt-1 text-xs font-semibold">${escape(chapter.title)}</h3><p class="mt-1 text-[11px] leading-6 text-[#71816a]">${escape(chapter.subtitle)} · ${escape(chapter.duration)} · 含 ${storiesForDay(day.id).length} 段站点故事</p></div><div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-white px-3 py-1 text-[11px] text-[#806528]">${escape(chapterLabel(day.id))}</span><a href="#adventure/${day.id}" class="${archiveButton} px-3 py-2 text-xs">打开本章 ${icon('arrow-right-line')}</a></div></div></section>`;
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
    ${chapterSummary(day)}
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
    const content = ['北疆慢游记 · 三大一小的 8 日行程', '时间统一为北京时间；未标注日期则以 D1–D8 为准。', travelEstimateNote, ...days.map(day => `\nD${day.id} ${dayDate(day.id, true)}｜${day.title}\n路线：${day.route.join(' → ')}\n${travelText(day)}\n历史冒险 ${chapterLabel(day.id)}：${adventureChapters.find(item => item.id === day.id).title}｜${adventureChapters.find(item => item.id === day.id).duration}（完整 QUEST 与线索见历史冒险页面）\n${day.activities.map(activity => `${activity.title}：${activity.text}`).join('\n')}\n住宿：${day.hotel}\n餐食：${day.meal}\n家庭建议：${day.family}\n待确认：${day.confirm}\n家庭备注：${storage.get().notes[day.id] || '未填写'}`), '\n路线依据用户提供的行程图整理；车程为补充规划粗估，以最终合同、景区开放及实际路况为准。'].join('\n');
    download('北疆慢游记-8日行程.txt', content, 'text/plain;charset=utf-8'); toast('行程已下载，包含分段车程与家庭备注');
  });
}
