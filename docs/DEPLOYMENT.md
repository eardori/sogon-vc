# Sogon.vc 배포 가이드

## 배포 아키텍처

### 현재 구성
- **Frontend**: Netlify (https://sogonvc.multiful.ai)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Stripe
- **External APIs**: 국세청, 비즈노

## Netlify 배포 설정

### 1. 초기 설정

#### GitHub 연결
1. Netlify 대시보드에서 "New site from Git" 선택
2. GitHub 계정 연결 (eardori)
3. Repository 선택: `eardori/sogon.vc`
4. Branch 선택: `main`

#### 빌드 설정
```yaml
Build settings:
  Base directory: /
  Build command: npm run build
  Publish directory: .next
  Functions directory: netlify/functions (선택사항)
```

#### Node 버전 설정
`.nvmrc` 파일 생성:
```
18.17.0
```

또는 환경 변수 설정:
```
NODE_VERSION=18.17.0
```

### 2. 환경 변수 설정

#### Netlify Dashboard > Site Configuration > Environment Variables

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://diacyxklbvniikuwywdv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# External APIs (필수)
NTS_API_KEY=s0tU9ey8+kHhJdqwQCZMAuAcDhgAjrJzhF6cabLewVIjdaBau+aY3edObnOoD23VgC...
BIZNO_API_KEY=G0brGc9rHyeUI0bWIf5QIvtN
BUSINESS_VERIFICATION_TEST_MODE=false

# Stripe (필수)
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RmGM3I5VkPzQX48OUJsMsrZoSrCaUCDRun8gdvCqH1pNsOovVXWQ1tvNMocjE8gYlkK3xotwTD0LGOaNfvEQGaD00kivOY0rM
STRIPE_WEBHOOK_SECRET=(Stripe Dashboard에서 생성 후 추가)

# Email (선택)
EMAIL_FROM=noreply@sogon.vc

# App URL (필수)
NEXT_PUBLIC_APP_URL=https://sogonvc.multiful.ai
```

### 3. 커스텀 도메인 설정

#### DNS 설정
1. Netlify Dashboard > Domain management
2. Add custom domain: `sogonvc.multiful.ai`
3. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: sogonvc
   Value: [your-site].netlify.app
   ```

#### SSL 인증서
- Netlify가 자동으로 Let's Encrypt SSL 인증서 발급
- 강제 HTTPS 리다이렉션 활성화

### 4. 빌드 최적화

#### netlify.toml 파일
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/api/*"
  to = "/api/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

#### next.config.js 설정
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['diacyxklbvniikuwywdv.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
```

## Supabase 설정

### 1. 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. New project 생성
3. Region: Seoul (ap-northeast-2) 선택

### 2. 데이터베이스 초기화
1. SQL Editor 열기
2. `/supabase/schema.sql` 내용 복사
3. 실행 (F5 또는 Run 버튼)

### 3. Authentication 설정
1. Authentication > Providers
2. Email 활성화
3. Email 템플릿 커스터마이징 (선택)

### 4. Storage 설정
1. Storage > New bucket
2. Public bucket 생성: `avatars`, `attachments`
3. 정책 설정 (RLS)

### 5. Edge Functions (선택사항)
```bash
# Supabase CLI 설치
npm install -g supabase

# 함수 배포
supabase functions deploy
```

## Stripe 설정

### 1. 제품 및 가격 생성
```javascript
// Stripe Dashboard에서 생성
const products = {
  prospective_founder: {
    name: "예비창업자 플랜",
    price: "$4.99/월",
    price_id: "price_xxx"
  },
  founder: {
    name: "창업자 플랜",
    price: "$9.99/월",
    price_id: "price_xxx"
  },
  vc_general: {
    name: "일반 VC 플랜",
    price: "$49.99/월",
    price_id: "price_xxx"
  },
  vc_anonymous: {
    name: "익명 VC 플랜",
    price: "$299.99/월",
    price_id: "price_xxx"
  }
}
```

### 2. Webhook 설정
1. Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://sogonvc.multiful.ai/api/stripe/webhook`
3. Events 선택:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Signing secret 복사 → 환경 변수 추가

### 3. Restricted Key 생성
1. API keys > Create restricted key
2. 권한 설정:
   - Customers: Write
   - Checkout Sessions: Write
   - Subscriptions: Write
   - Webhooks: Read

## 모니터링 및 로깅

### 1. Netlify Analytics
- 자동 활성화
- 실시간 트래픽 모니터링
- 빌드 로그 확인

### 2. Supabase Monitoring
- Database > Monitoring
- API 사용량 확인
- 쿼리 성능 분석

### 3. Sentry 설정 (권장)
```bash
npm install @sentry/nextjs

# sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 배포 체크리스트

### 배포 전
- [ ] 모든 환경 변수 설정 확인
- [ ] TypeScript 빌드 오류 해결
- [ ] ESLint 경고 해결
- [ ] 테스트 실행 (`npm test`)
- [ ] 로컬 빌드 테스트 (`npm run build`)

### 배포 중
- [ ] Netlify 빌드 로그 모니터링
- [ ] 빌드 성공 확인
- [ ] Preview URL 테스트

### 배포 후
- [ ] 프로덕션 URL 접속 테스트
- [ ] 주요 기능 동작 확인:
  - [ ] 회원가입/로그인
  - [ ] 사업자등록번호 검증
  - [ ] VC 이메일 검증
  - [ ] 결제 프로세스 (테스트 모드)
- [ ] 에러 모니터링 확인
- [ ] 성능 메트릭 확인

## 롤백 절차

### Netlify 롤백
1. Deploys 탭 접속
2. 이전 성공 배포 선택
3. "Publish deploy" 클릭

### 데이터베이스 롤백
1. Supabase Dashboard > Database > Backups
2. Point-in-time recovery 선택
3. 복원 시점 선택

## 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 확인
npm run build

# 타입 체크
npm run type-check

# 의존성 정리
rm -rf node_modules package-lock.json
npm install
```

### 환경 변수 문제
1. Netlify Dashboard에서 모든 변수 확인
2. `NEXT_PUBLIC_` 접두사 확인
3. 빌드 캐시 삭제 후 재배포

### 404 오류
1. `netlify.toml` 리다이렉트 규칙 확인
2. Next.js 동적 라우팅 설정 확인
3. `_redirects` 파일 추가 (필요시)

### API 오류
1. CORS 설정 확인
2. API 키 유효성 확인
3. Rate limiting 확인

## CI/CD 파이프라인

### GitHub Actions (선택사항)
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: '.next'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 자동 변환
- Lazy loading 적용

### 2. 코드 스플리팅
- 동적 import 활용
- 라우트별 번들 분리
- 공통 청크 최적화

### 3. 캐싱 전략
- Static Generation 활용
- ISR (Incremental Static Regeneration)
- API 응답 캐싱

### 4. 데이터베이스 최적화
- 인덱스 생성
- 쿼리 최적화
- Connection pooling

## 보안 체크리스트

- [ ] 환경 변수 암호화
- [ ] HTTPS 강제 적용
- [ ] CSP 헤더 설정
- [ ] Rate limiting 구현
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] CSRF 토큰 구현

---

*최종 업데이트: 2025-01-13*
*Version: 1.0.0*