import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  discoverTeams, discoverMembers, parseSections,
  parseMembers, isTodo, teamDisplayName
} from './parse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');

const errors = [];
const warnings = [];

function error(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

const checkedFiles = new Set();

function checkConflictMarkers(filePath) {
  if (checkedFiles.has(filePath)) return;
  checkedFiles.add(filePath);
  let text;
  try {
    text = readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^<{7}\s/.test(line) || /^={7}$/.test(line) || /^>{7}\s/.test(line)) {
      error(`${filePath} 第 ${i + 1} 行：殘留 Git 衝突標記，請先解決衝突再 commit`);
    }
  }
}

const teams = discoverTeams(dataDir);
const memberNamePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const memberToTeams = new Map();
const referencedMembers = new Set();

for (const teamFolder of teams) {
  const filePath = join(dataDir, 'teams', teamFolder, 'team.md');
  const display = teamDisplayName(teamFolder);

  checkConflictMarkers(filePath);

  let text;
  try {
    text = readFileSync(filePath, 'utf-8');
  } catch {
    error(`${filePath}：無法讀取檔案`);
    continue;
  }

  const { sections } = parseSections(text);

  const requiredSections = ['Team Name', 'Members'];
  for (const sec of requiredSections) {
    if (!sections.has(sec)) {
      error(`${filePath}：缺少必要區段「## ${sec}」`);
    }
  }

  const membersText = sections.get('Members');
  if (membersText && !isTodo(membersText)) {
    const memberList = parseMembers(membersText);

    if (memberList.length > 0 && (memberList.length < 2 || memberList.length > 5)) {
      warn(`${filePath}（${display}）：目前有 ${memberList.length} 位組員，建議每組 2 至 5 人，請確認是否正確`);
    }

    for (const name of memberList) {
      if (!memberNamePattern.test(name)) {
        error(`${filePath}（${display}）：成員名稱「${name}」不符合命名規則（僅限小寫英文字母、數字與連字號，且必須以字母開頭）`);
        continue;
      }

      referencedMembers.add(name);

      const memberFile = join(dataDir, 'members', `${name}.md`);
      try {
        readFileSync(memberFile, 'utf-8');
      } catch {
        error(`${filePath}（${display}）：成員「${name}」的檔案 data/members/${name}.md 不存在`);
        continue;
      }

      checkConflictMarkers(memberFile);

      if (memberToTeams.has(name)) {
        memberToTeams.get(name).push(display);
      } else {
        memberToTeams.set(name, [display]);
      }
    }
  }
}

for (const [name, teamList] of memberToTeams) {
  if (teamList.length > 1) {
    error(`成員「${name}」同時被列在 ${teamList.join(' 與 ')} 中，每位成員只能屬於一個小組`);
  }
}

const allMembers = discoverMembers(dataDir);
for (const name of allMembers) {
  if (!memberNamePattern.test(name)) {
    error(`data/members/${name}.md：檔案名稱不符合命名規則（僅限小寫英文字母、數字與連字號，且必須以字母開頭）`);
  }
  if (!referencedMembers.has(name)) {
    warn(`data/members/${name}.md：此成員檔案沒有被任何小組的 team.md 引用`);
  }
  checkConflictMarkers(join(dataDir, 'members', `${name}.md`));
}

console.log('');
console.log('=== 資料驗證結果 ===');
console.log('');

if (errors.length === 0 && warnings.length === 0) {
  console.log('全部通過，沒有發現任何問題。');
} else {
  if (errors.length > 0) {
    console.log(`發現 ${errors.length} 個錯誤：`);
    console.log('');
    for (const e of errors) {
      console.log(`  ✗ ${e}`);
    }
    console.log('');
  }
  if (warnings.length > 0) {
    console.log(`${warnings.length} 個警告（不影響通過）：`);
    console.log('');
    for (const w of warnings) {
      console.log(`  ⚠ ${w}`);
    }
    console.log('');
  }
}

if (errors.length > 0) {
  console.log('驗證未通過，請修正以上錯誤後重新提交。');
  process.exit(1);
} else {
  console.log('驗證通過。');
}
