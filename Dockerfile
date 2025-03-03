# 构建阶段（使用 Node 18 镜像）
FROM node:18-alpine AS builder
WORKDIR /app

# 安装依赖（利用 Docker 缓存加速）
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN yarn build

# 运行阶段（使用 Nginx 镜像）
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 复制构建产物和 Nginx 配置
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80
