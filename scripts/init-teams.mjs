import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverTeams } from './parse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const templatePath = join(dataDir, 'teams', '_template', 'team.md');

function numberToLetters(n) {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function parseArgs(args) {
  if (args.length === 0) {
    console.error('用法：node scripts/init-teams.mjs <組數>');
    console.error('      node scripts/init-teams.mjs a b c d e');
    process.exit(1);
  }

  if (args.length === 1 && /^\d+$/.test(args[0])) {
    const count = parseInt(args[0], 10);
    if (count < 1) {
      console.error('組數必須至少為 1');
      process.exit(1);
    }
    return Array.from({ length: count }, (_, i) => numberToLetters(i));
  }

  return args.map(a => a.toLowerCase());
}

const letters = parseArgs(process.argv.slice(2));
const template = readFileSync(templatePath, 'utf-8');

const created = [];
const skipped = [];

for (const letter of letters) {
  const folderName = `team-${letter}`;
  const teamDir = join(dataDir, 'teams', folderName);

  if (existsSync(teamDir)) {
    skipped.push(folderName);
    continue;
  }

  mkdirSync(teamDir, { recursive: true });
  const displayLetter = letter.toUpperCase();
  const content = template.replace(/^#\s+Team\s+\?/m, `# Team ${displayLetter}`);
  writeFileSync(join(teamDir, 'team.md'), content, 'utf-8');
  created.push(folderName);
}

const allTeams = discoverTeams(dataDir);

console.log('');
console.log('=== 小組初始化完成 ===');
console.log('');

if (created.length > 0) {
  console.log(`新建 ${created.length} 組：${created.join('、')}`);
}
if (skipped.length > 0) {
  console.log(`跳過 ${skipped.length} 組（已存在）：${skipped.join('、')}`);
}
console.log(`目前共 ${allTeams.length} 組：${allTeams.join('、')}`);
console.log('');
console.log('下一步：');
console.log('  git add data/teams/');
console.log('  git commit -m "Initialize teams"');
console.log('  git push origin main');
console.log('');
