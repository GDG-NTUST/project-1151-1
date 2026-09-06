# 貢獻指南

## 你需要編輯的檔案

學員只需要編輯 `data/` 底下的 Markdown 檔案：

- **個人卡片**：`data/members/<你的英文名>.md`
- **小組資料**：`data/teams/team-<代號>/team.md`（由組長負責）

不需要修改任何 HTML、CSS 或 JavaScript 檔案。

## 個人卡片格式

檔案位置：`data/members/<你的英文名>.md`

檔名規則：
- 全部小寫英文字母
- 可用連字號（`-`）分隔，例如 `wang-ming.md`
- 不可使用中文、空格、底線或大寫

範例：

```markdown
# 王小明

## Emoji

🚀

## Department

資訊工程學系三年級

## Bio

白天寫 code，晚上打遊戲的快樂大學生

## Interests

- Web 開發
- 機器學習
- 咖啡

## GitHub

xiaoming-wang
```

### 各欄位說明

| 欄位 | 說明 | 範例 |
|------|------|------|
| `# 標題` | 你的名字 | `# 王小明` |
| `## Emoji` | 選一個代表你的 emoji | `🚀`、`🐱`、`☕` |
| `## Department` | 你的系級 | `資工系三年級` |
| `## Bio` | 一句話介紹自己 | `熱愛開源的大學生` |
| `## Interests` | 興趣或技能，一行一個 | `- Web 開發` |
| `## GitHub` | 你的 GitHub 帳號 | `xiaoming-wang` |

> **注意**：不要動 `#` 和 `##` 標題的文字，只改標題底下的內容。

## 在卡片上放自己的圖片（選填）

想讓你的卡片更有個人風格？你可以放一張圖片作為卡片上方的大頭照。

1. 把圖片放到 `data/members/photos/` 資料夾
2. 檔名必須跟你的 `.md` 檔相同，例如你的卡片是 `alice.md`，圖片就命名為 `alice.jpg`
3. 支援格式：`.jpg`、`.png`、`.gif`、`.webp`、`.svg`
4. 用 `git add` 把圖片加入版本控制，跟卡片一起 commit 並 push

> 圖片會顯示在卡片的上半部。如果沒有放圖片，會顯示你選的 Emoji。

## 小組資料檔格式

檔案位置：`data/teams/team-<代號>/team.md`（由組長負責編輯）

```markdown
# Team A

## Team Name

超級程式戰隊

## Members

- alice
- bob
- charlie
```

`## Members` 底下每一行列出一位組員的**檔案名稱**（不含 `.md`），必須對應到 `data/members/` 底下的檔案。

## Branch 命名慣例

```
feat/<描述>
```

範例：
- `feat/alice` — 新增 Alice 的卡片
- `feat/team-a-info` — 編輯 Team A 的組名

## Commit Message 慣例

一個好的 commit message 要能讓人**不看 diff 就知道你做了什麼**。

格式建議使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hant/v1.0.0/)：

```
<類型>: <簡短描述>
```

常用類型：
- `feat`: 新增功能或內容（例如新增卡片）
- `fix`: 修正錯誤
- `docs`: 文件修改

### 好的範例

```
feat: add Alice's profile card
```

```
feat: update Team A name and member list
```

### 不好的範例

| 訊息 | 為什麼不好 |
|------|-----------|
| `update` | 更新了什麼？每個 commit 都是 update |
| `fix` | 修了什麼？ |
| `done` | 什麼 done 了？ |
| `aaa` | 你未來的自己會感謝你多打幾個字 |

### 原則

1. **用英文**，以動詞原形開頭（`add`、`update`、`fix`、`remove`）
2. **說明做了什麼**，不要只寫一個動詞
3. **簡短但具體**，一行不超過 50 個字元
