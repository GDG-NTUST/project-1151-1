import { readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const distDir = join(rootDir, 'dist');

let removedMembers = 0;
let removedPhotos = 0;
let removedTeams = 0;

const membersDir = join(dataDir, 'members');
if (existsSync(membersDir)) {
  const entries = readdirSync(membersDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      rmSync(join(membersDir, entry.name));
      removedMembers++;
    }
  }
}

const photosDir = join(membersDir, 'photos');
if (existsSync(photosDir)) {
  const entries = readdirSync(photosDir);
  for (const entry of entries) {
    if (entry === '.gitkeep') continue;
    rmSync(join(photosDir, entry));
    removedPhotos++;
  }
}

const teamsDir = join(dataDir, 'teams');
if (existsSync(teamsDir)) {
  const entries = readdirSync(teamsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      rmSync(join(teamsDir, entry.name), { recursive: true });
      removedTeams++;
    }
  }
}

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}

console.log('');
console.log('=== 清除測試資料完成 ===');
console.log('');
console.log(`  刪除成員卡片：${removedMembers} 個`);
console.log(`  刪除頭像圖片：${removedPhotos} 個`);
console.log(`  刪除小組資料夾：${removedTeams} 個`);
console.log(`  刪除建置輸出：dist/`);
console.log('');
console.log('專案已恢復為乾淨狀態（僅保留 _template 範本檔）。');
console.log('');
