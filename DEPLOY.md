# Deploy Guide

## Environments
- dev: local docker postgres + backend nest + frontend next
- stage: backend container + managed postgres + s3 bucket stage
- prod: backend container/vm + managed postgres + s3 bucket prod

## Front (Vercel)
- Framework: Next.js
- Env: NEXT_PUBLIC_API_URL=https://api.seudominio.com

## Back (Container/VM)
- Run: npm run migrate && npm run start
- Env: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_PUBLIC_BASE_URL

## Database/S3
- Use isolated resources per env (dev/stage/prod)
- Never share JWT_SECRET between envs

