# test-ci-cd

最小可行的 Vue3 + Vite 專案，搭配 Docker、ESLint/Prettier，以及 **GitHub Actions self-hosted runner**，用來在本機完整跑一次 CI/CD 流程。

---

## 技術選型

| 項目       | 工具                                |
| ---------- | ----------------------------------- |
| 框架       | Vue 3 + Vite 6                      |
| 套件管理   | pnpm                                |
| 程式碼風格 | ESLint 9（flat config）+ Prettier   |
| 容器       | Docker（多階段 build）              |
| Web server | Nginx（serve dist）                 |
| CI/CD      | GitHub Actions + self-hosted runner |
| 部署目標   | 本機 Docker 容器（port `8080`）     |

---

## 1. 本機開發

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm lint         # ESLint
pnpm format:check # Prettier check
pnpm build        # 產出 dist/
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

1. **GitHub → Actions**：看到 `CI/CD` workflow 在 `self-hosted` runner 上跑，`lint` job 通過後 `deploy` job 才執行。
2. **本機**：`docker ps` 應看到 `test-ci-cd-app` 容器。
3. **瀏覽器**：開 http://localhost:8080 看到 Vue 預設頁面。

### 故意讓 CI 失敗（驗證 lint gate 真的有把關）

```bash
# 在 src/App.vue 隨手寫一個 lint error，例如未使用的變數
git commit -am "test: break lint"
git push origin main
```

`lint` job 會 fail、`deploy` 不會執行、本機容器維持原版本。

---

## 5. Workflow 結構

`.github/workflows/ci.yml` 兩個 job、皆 `runs-on: self-hosted`：

| Job      | 觸發           | 動作                                                                             |
| -------- | -------------- | -------------------------------------------------------------------------------- |
| `lint`   | push + PR      | `pnpm install` → `pnpm lint` → `pnpm format:check`                               |
| `deploy` | push 到 `main` | `docker build` → 重啟容器 (`docker rm -f` + `docker run -d`) → `curl` smoke test |

部署策略：**直接砍舊容器再起新的**（`--restart unless-stopped`）。Image tag 同時打 `:latest` 與 `:<git-sha>` 方便回滾（`docker run ... test-ci-cd-app:<sha>`）。

---

## 6. 疑難排解

| 症狀                        | 排查                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| Workflow 卡在 queued        | runner 沒在跑（`./run.sh` 視窗關了 / svc stop）。重啟。                   |
| `docker: command not found` | 開 Docker Desktop；svc 模式下檢查 PATH。                                  |
| `port 8080 already in use`  | `lsof -i :8080` 看誰佔用，或改 workflow 的 host port。                    |
| `pnpm: command not found`   | workflow 已用 `pnpm/action-setup@v4` 自動安裝；如失敗確認 runner 能上網。 |
| 註冊時 401/403              | token 過期了，到 Settings 重生一個。                                      |

---

## 7. 範圍外（未來可擴充）

- TypeScript / Vitest / Vue Router / Pinia
- 多平台 image（buildx）、push 到 registry
- HTTPS / reverse proxy
- 多環境（staging / prod）
- 通知（Slack / email）
