# 这是一个笔记

## github 命令行

- 推送并设置上游github命令： `$ git push -u github-origin master`
- 拉取github： `$ git pull github-origin master`

## 代理命令

### SOCKS5 代理

- `$ git config --global http.proxy socks5://127.0.0.1:1080`
- `$ git config --global https.proxy socks5://127.0.0.1:1080`

### HTTP 代理

- `$ git config --global http.proxy http://127.0.0.1:1080`
- `$ git config --global https.proxy https://127.0.0.1:1080`

### 取消代理（如果不需要）

- `$ git config --global --unset http.proxy`
- `$ git config --global --unset https.proxy`