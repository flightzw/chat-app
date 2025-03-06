### ChatApp - 基于 websocket 实现的聊天室项目

![ChatApp](https://github.com/flightzw/chat-app/actions/workflows/docker-ci.yml/badge.svg?branch=master&event=push)

项目结构：

```bash
./src
├── App.css
├── App.tsx
├── api                  # 服务端 api
│ ├── friend.ts          # 好友管理
│ ├── index.ts
│ ├── message.ts         # 私聊消息
│ ├── request.ts
│ ├── user.ts            # 登录/注册/用户管理
│ └── ws.ts              # websocket 封装
├── assets
├── components
│ ├── AddFriendModal     # 添加好友对话框
│ │ └── index.tsx
│ ├── AuthRoute.tsx      # 路由拦截组件，检查是否已获取 token
│ ├── Chat               # 聊天模块组件
│ │ ├── ChatBox          # 聊天窗口 + 输入框
│ │ │ └── index.tsx
│ │ ├── ChatHistoryModal # 聊天记录
│ │ │ └── index.tsx
│ │ ├── EmojiList        # emoji 表情选项
│ │ │ └── index.tsx
│ │ ├── MessageItem      # 聊天消息
│ │ │ └── index.tsx
│ │ ├── embed.ts         # 富文本框组件扩展，支持 emoji
│ │ └── model.ts
│ ├── DateSelector       # 日期选择组件
│ │ └── index.tsx
│ ├── LoginForm.tsx      # 登录表单
│ ├── LogoutConfirmModal # 退出登录对话框
│ │ └── index.tsx
│ ├── OpenChatModal      # 创建聊天对话框
│ │ └── index.tsx
│ ├── RegisterForm.tsx   # 用户注册表单
│ └── index.ts
├── hooks
│ ├── index.ts
│ └── useChatConn.tsx    # 初始化 websocket 连接
├── index.css
├── main.tsx             # 应用入口
├── pages
│ ├── Chat               # 聊天会话
│ │ ├── hooks
│ │ │ ├── index.ts
│ │ │ ├── useChatList.ts      # 会话列表
│ │ │ ├── useChatListMenu.ts  # 会话右键菜单
│ │ │ └── useChatMembers.ts   # 会话成员
│ │ └── index.tsx
│ ├── Friend             # 好友管理
│ │ └── index.tsx
│ ├── Layout
│ │ └── index.tsx
│ ├── Login              # 登录/注册
│ │ └── index.tsx
│ ├── NotFound           # 404 页
│ │ └── index.tsx
│ └── Setting            # 用户设置
│ ├── UpdatePasswordForm.tsx  # 修改密码
│ ├── UpdateUserInfoForm.tsx  # 更改个人信息
│ └── index.tsx
├── router               # 路由配置
│ └── index.tsx
├── store                # 状态存储
│ ├── auth.ts
│ ├── chat
│ │ ├── cache.ts
│ │ ├── chat.ts
│ │ ├── index.ts
│ │ ├── persist.ts
│ │ └── util.ts
│ ├── friend.ts
│ ├── index.ts
│ └── user.ts
├── utils                # 工具函数
│ ├── days.ts
│ ├── emoji
│ │ ├── data.ts
│ │ └── index.ts
│ ├── errors.ts
│ └── strings.ts
└── vite-env.d.ts
```
