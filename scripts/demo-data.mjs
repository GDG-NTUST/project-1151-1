import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');

const DEMO_MEMBERS = [
  {
    id: 'alice',
    name: 'Alice Chen',
    emoji: '🚀',
    dept: '資訊工程學系三年級',
    bio: '熱愛開源的全端工程師，夢想是做出改變世界的產品',
    interests: ['Web 開發', '開源貢獻', '咖啡拉花'],
    github: 'alice-chen',
    color: '#4285F4'
  },
  {
    id: 'bob',
    name: 'Bob Wang',
    emoji: '🎮',
    dept: '電機工程學系二年級',
    bio: '白天焊電路，晚上寫程式，假日打電動',
    interests: ['嵌入式系統', '遊戲開發', '籃球'],
    github: 'bob-wang',
    color: '#EA4335'
  },
  {
    id: 'carol',
    name: 'Carol Lin',
    emoji: '🎨',
    dept: '設計學系四年級',
    bio: '用設計思考解決問題，偶爾也會寫寫 code',
    interests: ['UI/UX 設計', '插畫', '攝影'],
    github: 'carol-lin',
    color: '#34A853'
  },
  {
    id: 'dave',
    name: 'Dave Liu',
    emoji: '☕',
    dept: '資訊管理學系一年級',
    bio: '剛開始學程式，每天都有新發現',
    interests: ['Python', '資料分析', '咖啡'],
    github: 'dave-liu',
    color: '#FBBC04'
  },
  {
    id: 'eve',
    name: 'Eve Zhang',
    emoji: '🎵',
    dept: '應用外語學系三年級',
    bio: '文組也能學寫程式！正在自學 JavaScript',
    interests: ['前端開發', '翻譯', '彈吉他'],
    github: 'eve-zhang',
    color: '#A142F4'
  },
  {
    id: 'frank',
    name: 'Frank Wu',
    emoji: '🔧',
    dept: '機械工程學系四年級',
    bio: '機械系的斜槓仔，同時玩軟體和硬體',
    interests: ['3D 列印', 'Arduino', '機器人'],
    github: 'frank-wu',
    color: '#00ACC1'
  },
  {
    id: 'grace',
    name: 'Grace Huang',
    emoji: '🌟',
    dept: '數位媒體設計學系二年級',
    bio: '創意是我的超能力，Figma 是我的武器',
    interests: ['動態設計', 'Figma', '追劇'],
    github: 'grace-huang',
    color: '#FF7043'
  },
  {
    id: 'henry',
    name: 'Henry Tsai',
    emoji: '🐧',
    dept: '資訊工程學系碩士班一年級',
    bio: 'Linux 愛好者，打不贏 bug 就加入它',
    interests: ['Linux', '雲端運算', '開源社群'],
    github: 'henry-tsai',
    color: '#E91E8B'
  }
];

const DEMO_TEAMS = [
  { code: 'a', name: '超級程式戰隊', members: ['alice', 'bob', 'carol'] },
  { code: 'b', name: '深夜 Debug 組', members: ['dave', 'eve', 'frank'] },
  { code: 'c', name: '全端魔法師', members: ['grace', 'henry'] }
];

function generateMemberMd(m) {
  const interests = m.interests.map(i => `- ${i}`).join('\n');
  return `# ${m.name}

## Emoji

${m.emoji}

## Department

${m.dept}

## Bio

${m.bio}

## Interests

${interests}

## GitHub

${m.github}
`;
}

function generateTeamMd(t) {
  const members = t.members.map(m => `- ${m}`).join('\n');
  return `# Team ${t.code.toUpperCase()}

## Team Name

${t.name}

## Members

${members}
`;
}

function generateAvatarSvg(name, color) {
  const initial = name[0].toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" />
  <text x="200" y="230" text-anchor="middle" fill="white" font-size="180" font-family="Arial, sans-serif" font-weight="bold">${initial}</text>
</svg>`;
}

console.log('');
console.log('=== 產生展示用測試資料 ===');
console.log('');

const photosDir = join(dataDir, 'members', 'photos');
mkdirSync(photosDir, { recursive: true });

for (const m of DEMO_MEMBERS) {
  const memberPath = join(dataDir, 'members', `${m.id}.md`);
  writeFileSync(memberPath, generateMemberMd(m), 'utf-8');
  console.log(`  ✓ 建立成員卡片：data/members/${m.id}.md`);

  const avatarPath = join(photosDir, `${m.id}.svg`);
  writeFileSync(avatarPath, generateAvatarSvg(m.name, m.color), 'utf-8');
  console.log(`  ✓ 建立頭像圖片：data/members/photos/${m.id}.svg`);
}

for (const t of DEMO_TEAMS) {
  const teamDir = join(dataDir, 'teams', `team-${t.code}`);
  mkdirSync(teamDir, { recursive: true });
  writeFileSync(join(teamDir, 'team.md'), generateTeamMd(t), 'utf-8');
  console.log(`  ✓ 建立小組資料：data/teams/team-${t.code}/team.md`);
}

console.log('');
console.log(`共建立 ${DEMO_MEMBERS.length} 位成員、${DEMO_TEAMS.length} 個小組`);
console.log('');
console.log('下一步：');
console.log('  node scripts/build.mjs        # 建置網頁');
console.log('  瀏覽器打開 dist/index.html     # 預覽成果');
console.log('');
console.log('完成展示後，執行以下指令清除測試資料：');
console.log('  node scripts/clean-demo.mjs');
console.log('');
