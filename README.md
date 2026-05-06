# test-ci-cd

最小可行的 Vue3 + Vite 專案，搭配 Docker、ESLint/Prettier，以及 **GitHub Actions self-hosted runner**，用來在本機完整跑一次 CI/CD 流程。

---

## 技術選型

| 項目       | 工具                                                |
| ---------- | --------------------------------------------------- |
| 框架       | Vue 3 + Vite 6                                      |
| 套件管理   | pnpm                                                |
| 程式碼風格 | ESLint 9（flat config）+ Prettier                   |
| 容器       | Docker（多階段 build）                              |
| Web server | Nginx（serve dist）                                 |
| CI/CD      | GitHub Actions + self-hosted runner                 |
| 部署目標   | staging（port `8081`）+ prod（port `8080`）兩段部署 |

---

## 1. 本機開發

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm lint           # ESLint
pnpm format:check   # Prettier check
pnpm test           # Vitest（一次性）
pnpm test:watch     # Vitest（watch 模式）
pnpm test:coverage  # Vitest + 覆蓋率報告（含閾值檢查）
pnpm audit          # 依賴漏洞掃描（high+ 才算 fail）
pnpm build          # 產出 dist/
```

---

## 2. 用 Docker 在本機跑（不經 CI）

```bash
docker build -t test-ci-cd-app:dev .
docker run --rm -d --name test-ci-cd-app -p 8080:80 test-ci-cd-app:dev
curl http://localhost:8080      # 應回 200
```

停止：

```bash
docker rm -f test-ci-cd-app
```

---

## 3. 註冊 GitHub Actions self-hosted runner（macOS）

> 前置：先把這個 repo 推上 GitHub（`git remote add origin ...` → `git push -u origin main`）。

### 3.1 取得註冊 token

到 GitHub repo → **Settings** → **Actions** → **Runners** → **New self-hosted runner** → 選 **macOS** + 你的 CPU 架構（Apple Silicon = ARM64）。
頁面會列出當下唯一可用的指令，**token 一次性、約 1 小時內有效**。

### 3.2 安裝 runner（依官方頁面提供的指令為準，以下為示意）

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner

# 下載（版本與檔名請以 GitHub 頁面為準）
curl -o actions-runner-osx-arm64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.xxx.x/actions-runner-osx-arm64-2.xxx.x.tar.gz
tar xzf actions-runner-osx-arm64.tar.gz

# 註冊（token 由 GitHub 頁面提供）
./config.sh --url https://github.com/<YOUR_USER>/test-ci-cd --token <TOKEN>

# 前景執行（適合練習，Ctrl+C 結束）
./run.sh
```

執行 `./run.sh` 後看到 `√ Connected to GitHub` + `Listening for Jobs`，代表就緒。

> 想常駐：`./svc.sh install && ./svc.sh start`（背景跑、開機自動啟動）。

### 3.3 確認 Docker 對 runner 可用

Runner 必須能執行 `docker` 指令。在你跑 `./run.sh` 的同一個 shell：

```bash
docker info >/dev/null && echo OK
```

若失敗：

- 確認 Docker Desktop 已啟動。
- 用 svc 模式時，登入的 user 必須能存取 Docker（macOS 上 Docker Desktop 自動處理）。

---

## 4. 觸發並驗證 CI/CD 流程

```bash
git add -A
git commit -m "test: trigger CI"
git push origin main
```

依序檢查：

1. **GitHub → Actions**：`verify` 通過後 `deploy-staging` 自動跑，再串到 `deploy-prod`。
2. **本機**：`docker ps` 應看到 `test-ci-cd-app-staging`（port 8081）與 `test-ci-cd-app-prod`（port 8080）兩個容器。
3. **瀏覽器**：staging http://localhost:8081、prod http://localhost:8080，banner build 時間相同（同一份 image）。

### 故意讓 verify 失敗（驗證 gate 真的有把關）

任一個都會擋下整個部署：

- 加未使用變數 → ESLint fail
- 改錯一個 `expect` → Vitest fail
- 刪掉測試 → coverage 跌破閾值 → fail
- 出現 high+ CVE 的依賴 → audit fail

```bash
git commit -am "test: 故意壞 verify"
git push origin main
```

`verify` 會紅、`deploy-staging` 與 `deploy-prod` 都被 skipped、本機容器維持上一版。

---

## 5. Workflow 結構

`.github/workflows/ci.yml` 兩個 job、皆 `runs-on: self-hosted`：

| Job              | 觸發           | 動作                                                                                             |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `verify`         | push + PR      | install → lint → format:check → **test:coverage**（90/80/90/90 閾值）→ **audit**（high+）        |
| `deploy-staging` | push 到 `main` | build image (`:sha` + `:staging`) → `docker run -p 8081:80` → smoke test http://localhost:8081   |
| `deploy-prod`    | needs staging  | `docker tag :prod` → 砍舊 prod 容器 → `docker run -p 8080:80` → smoke test http://localhost:8080 |

部署為兩段：staging（port 8081）通過後才走 prod（port 8080）。
若想讓 prod 加上「人工核准」閘門：到 GitHub repo → **Settings → Environments → production → Required reviewers** 勾你自己；之後 `deploy-prod` 會卡在 waiting，必須在 Actions 頁面按 Approve 才會跑。
（`staging` environment 不勾 reviewer 即自動部署。）

部署策略：**直接砍舊容器再起新的**（`--restart unless-stopped`）。Image tag 在 staging build 時打 `:<git-sha>` + `:staging`，prod 額外加 `:prod`，方便回滾（`docker run ... test-ci-cd-app:<sha>` 用任何過去成功 build 的 sha 起容器）。

---

## 6. 疑難排解

| 症狀                           | 排查                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Workflow 卡在 queued           | runner 沒在跑（`./run.sh` 視窗關了 / svc stop）。重啟。                                   |
| `docker: command not found`    | 開 Docker Desktop；svc 模式下檢查 PATH。                                                  |
| `port 8080 already in use`     | `lsof -i :8080`（或 `:8081`）看誰佔用，或改 workflow 的 host port。                       |
| prod 卡在 `Waiting for review` | `production` environment 設了 reviewer，到 Actions 頁按 Approve；不想要就把 reviewer 移除 |
| `pnpm: command not found`      | workflow 已用 `pnpm/action-setup@v4` 自動安裝；如失敗確認 runner 能上網。                 |
| 註冊時 401/403                 | token 過期了，到 Settings 重生一個。                                                      |

---

## 7. 範圍外（未來可擴充）

- TypeScript / Vue Router / Pinia
- 多平台 image（buildx）、push 到 GHCR / Docker Hub
- HTTPS / reverse proxy
- E2E 測試（Playwright）、Lighthouse CI、Bundle size budget
- 通知（Slack / email）、Sentry release tag
- semantic-release / release-please（自動 tag + CHANGELOG）
