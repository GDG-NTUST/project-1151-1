import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  discoverTeams, loadTeamData, loadMemberData,
  parseMembers, isTodo, teamDisplayName
} from './parse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const siteDir = join(rootDir, 'site');
const distDir = join(rootDir, 'dist');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nameToHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function parseInterests(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
    .filter(line => line.length > 0);
}

function findMemberPhoto(memberName) {
  const photosDir = join(dataDir, 'members', 'photos');
  for (const ext of IMAGE_EXTS) {
    const filename = `${memberName}${ext}`;
    if (existsSync(join(photosDir, filename))) {
      return filename;
    }
  }
  return null;
}

function buildMemberCard(memberName, delay) {
  const data = loadMemberData(dataDir, memberName);
  const hue = nameToHue(memberName);
  const delayStr = delay.toFixed(2);

  if (data.error) {
    return `<article class="card card--error" style="--card-hue: ${hue}; animation-delay: ${delayStr}s">
  <div class="card__avatar">⚠️</div>
  <div class="card__body">
    <h3 class="card__name">${escapeHtml(memberName)}</h3>
    <p class="card__error">⚠ 找不到 data/members/${escapeHtml(memberName)}.md</p>
  </div>
</article>`;
  }

  const name = data.title || memberName;
  const sections = data.sections;
  const rawEmoji = sections.get('Emoji') || '';
  const dept = sections.get('Department') || '';
  const bio = sections.get('Bio') || '';
  const interestsText = sections.get('Interests') || '';
  const github = sections.get('GitHub') || '';

  const emoji = (rawEmoji && !isTodo(rawEmoji)) ? rawEmoji.trim() : '🎯';
  const interests = isTodo(interestsText) ? [] : parseInterests(interestsText);
  const photoFile = findMemberPhoto(memberName);

  const parts = [];
  parts.push(`<article class="card" style="--card-hue: ${hue}; animation-delay: ${delayStr}s">`);
  if (photoFile) {
    parts.push(`  <div class="card__avatar card__avatar--has-photo">`);
    parts.push(`    <img class="card__photo" src="./photos/${photoFile}" alt="${escapeHtml(name)}">`);
    parts.push(`    <span class="card__emoji-badge">${emoji}</span>`);
    parts.push(`  </div>`);
  } else {
    parts.push(`  <div class="card__avatar">${emoji}</div>`);
  }
  parts.push(`  <div class="card__body">`);
  parts.push(`    <h3 class="card__name">${escapeHtml(name)}</h3>`);

  if (dept && !isTodo(dept))
    parts.push(`    <p class="card__dept">${escapeHtml(dept)}</p>`);

  if (bio && !isTodo(bio))
    parts.push(`    <p class="card__bio">${escapeHtml(bio)}</p>`);

  if (interests.length > 0) {
    const tags = interests.map(i => `<span class="card__tag">${escapeHtml(i)}</span>`).join('');
    parts.push(`    <div class="card__tags">${tags}</div>`);
  }

  if (github && !isTodo(github)) {
    const gh = github.trim();
    parts.push(`    <a class="card__github" href="https://github.com/${encodeURIComponent(gh)}" target="_blank" rel="noopener">@${escapeHtml(gh)}</a>`);
  }

  parts.push(`  </div>`);
  parts.push(`  <span class="card__watermark">GDG NTUST</span>`);
  parts.push(`</article>`);

  return parts.join('\n');
}

function buildTeamSection(teamFolder, teamIndex, memberOffset) {
  const display = teamDisplayName(teamFolder);
  const data = loadTeamData(dataDir, teamFolder);

  if (data.error) {
    return {
      status: 'error',
      memberCount: 0,
      html: `<section class="team">
  <div class="team__header">
    <span class="team__code">${escapeHtml(display)}</span>
    <span class="team__status--pending">⚠ 格式錯誤</span>
  </div>
  <div class="team__pending">
    <div class="team__pending-icon">⚠️</div>
    <p class="team__pending-text">${escapeHtml(data.error)}</p>
  </div>
</section>`
    };
  }

  const sections = data.sections;
  const teamName = sections.get('Team Name');
  const membersText = sections.get('Members');
  const memberList = (membersText && !isTodo(membersText)) ? parseMembers(membersText) : [];

  const allTodo = isTodo(teamName || 'TODO') && memberList.length === 0;

  if (allTodo) {
    return {
      status: 'pending',
      memberCount: 0,
      html: `<section class="team">
  <div class="team__header">
    <span class="team__code">${escapeHtml(display)}</span>
    <span class="team__status--pending">⏳ 等待提交</span>
  </div>
  <div class="team__pending">
    <div class="team__pending-icon">⏳</div>
    <p class="team__pending-text">等待小組提交卡片...</p>
  </div>
</section>`
    };
  }

  const displayName = (teamName && !isTodo(teamName)) ? teamName : display;
  const cardsHtml = memberList.map((m, i) =>
    buildMemberCard(m, (memberOffset + i) * 0.08)
  ).join('\n');

  return {
    status: 'done',
    memberCount: memberList.length,
    html: `<section class="team">
  <div class="team__header">
    <h2 class="team__name">${escapeHtml(displayName)}</h2>
    <span class="team__code">${escapeHtml(display)}</span>
  </div>
  <div class="card-grid">
${cardsHtml}
  </div>
</section>`
  };
}

const teams = discoverTeams(dataDir);
let contentHtml;

if (teams.length === 0) {
  contentHtml = `
<div class="empty-state">
  <div class="empty-state__icon">👋</div>
  <h2>尚未建立任何小組</h2>
  <p>請講師執行以下指令來初始化小組：</p>
  <p><code>node scripts/init-teams.mjs &lt;組數&gt;</code></p>
  <p>例如 <code>node scripts/init-teams.mjs 5</code> 會建立 Team A 到 Team E。</p>
</div>`;
} else {
  let memberOffset = 0;
  const teamSections = teams.map((t, i) => {
    const result = buildTeamSection(t, i, memberOffset);
    memberOffset += result.memberCount;
    return result;
  });

  const totalTeams = teams.length;
  const doneTeams = teamSections.filter(s => s.status === 'done').length;
  const totalMembers = teamSections.reduce((sum, s) => sum + s.memberCount, 0);
  const percent = totalTeams > 0 ? Math.round((doneTeams / totalTeams) * 100) : 0;
  const hintText = doneTeams < totalTeams
    ? `還有 ${totalTeams - doneTeams} 組尚未提交`
    : '🎉 全部收集完成！';

  const statsHtml = `
<div class="stats">
  <div class="stats__header">
    <span class="stats__title">📇 卡片收藏</span>
    <span class="stats__subtitle">收集中</span>
  </div>
  <div class="stats__grid">
    <div class="stats__cell">
      <span class="stats__number">${totalMembers}</span>
      <span class="stats__label">已收集</span>
    </div>
    <div class="stats__cell">
      <span class="stats__number">${doneTeams} / ${totalTeams}</span>
      <span class="stats__label">小組完成</span>
    </div>
  </div>
  <div class="stats__bar">
    <div class="stats__fill" style="width: ${percent}%"></div>
  </div>
  <p class="stats__hint">${hintText}</p>
</div>`;

  contentHtml = statsHtml + '\n' + teamSections.map(s => s.html).join('\n');
}

const buildTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

const template = readFileSync(join(siteDir, 'template.html'), 'utf-8');
const finalHtml = template
  .replace('<!-- TEAMS -->', contentHtml)
  .replace('<!-- BUILD_TIME -->', escapeHtml(buildTime));

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'index.html'), finalHtml, 'utf-8');
cpSync(join(siteDir, 'style.css'), join(distDir, 'style.css'));

const photosSourceDir = join(dataDir, 'members', 'photos');
if (existsSync(photosSourceDir)) {
  const entries = readdirSync(photosSourceDir);
  const imageFiles = entries.filter(f =>
    IMAGE_EXTS.some(ext => f.toLowerCase().endsWith(ext))
  );
  if (imageFiles.length > 0) {
    const distPhotosDir = join(distDir, 'photos');
    mkdirSync(distPhotosDir, { recursive: true });
    for (const file of imageFiles) {
      cpSync(join(photosSourceDir, file), join(distPhotosDir, file));
    }
    console.log(`圖片：複製了 ${imageFiles.length} 張`);
  }
}

console.log('');
console.log('=== 建置完成 ===');
console.log('');
console.log(`小組數：${teams.length}`);
console.log(`輸出：dist/index.html`);
console.log(`建置時間：${buildTime}`);
console.log('');
