#!/bin/bash
set -e

echo "→ 推送代码到 GitHub..."
git push

echo "→ 编译..."
pnpm build

echo "→ 同步到 ECS..."
rsync -az .next/standalone/     root@fanggang.cc:/srv/agentin/app/
rsync -az .next/static          root@fanggang.cc:/srv/agentin/app/.next/
rsync -az public                root@fanggang.cc:/srv/agentin/app/
rsync -az app/generated         root@fanggang.cc:/srv/agentin/app/app/
rsync -az skills/               root@fanggang.cc:/srv/agentin/app/skills/
rsync -az node_modules/prisma   root@fanggang.cc:/srv/agentin/app/node_modules/
rsync -az node_modules/@prisma  root@fanggang.cc:/srv/agentin/app/node_modules/

echo "→ 重启服务..."
ssh ecs "docker restart agentin-server"

echo "✓ 部署完成：https://www.fanggang.cc"
