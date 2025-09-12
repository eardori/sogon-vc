# Stripe 설정 가이드

## 베타 테스트 기간 설정 (Test Mode)

### 1. Stripe Dashboard에서 Test Mode 전환
1. https://dashboard.stripe.com 접속
2. 우측 상단 토글 버튼을 **"Test mode"**로 전환
3. Test mode에서는 실제 결제가 발생하지 않음

### 2. Test API Keys 가져오기
Test mode에서:
- **Publishable key**: `pk_test_...`로 시작
- **Secret key**: `sk_test_...`로 시작

### 3. Test 제품 및 가격 생성
Test mode > Products에서 각 플랜 생성:

#### 예비창업자 플랜
- Product name: 예비창업자 구독
- Price: $2.99 USD
- Billing period: Monthly
- Price ID 복사 (예: `price_1234...`)

#### 창업자 플랜  
- Product name: 창업자 구독
- Price: $1.99 USD
- Billing period: Monthly
- Price ID 복사

#### VC 일반 플랜
- Product name: VC 일반 구독
- Price: $2.99 USD
- Billing period: Monthly
- Price ID 복사

#### VC 익명 플랜
- Product name: VC 익명 구독
- Price: $4.99 USD
- Billing period: Monthly
- Price ID 복사

### 4. 테스트 카드 번호
Stripe Test Mode에서 사용 가능한 카드 번호:
- **성공**: `4242 4242 4242 4242`
- **거절**: `4000 0000 0000 0002`
- **인증 필요**: `4000 0025 0000 3155`

만료일: 미래의 아무 날짜 (예: 12/34)
CVC: 아무 3자리 숫자 (예: 123)

## 프로덕션 전환 시

### 1. Live Mode로 전환
- Dashboard 우측 상단 토글을 **"Live mode"**로 전환
- Live API keys 사용 (`pk_live_...`, `sk_live_...`)

### 2. 실제 제품 생성
- Live mode에서 동일한 제품 구조 생성
- 실제 Price ID 획득

### 3. 환경변수 업데이트
```env
# Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RmGM3I5VkPzQX48OUJsMsrZoSrCaUCDRun8gdvCqH1pNsOovVXWQ1tvNMocjE8gYlkK3xotwTD0LGOaNfvEQGaD00kivOY0rM
STRIPE_SECRET_KEY=sk_live_...

# Test Mode (베타 기간)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 프로젝트 분리 전략

### Option 1: Metadata 활용 (추천)
각 제품/구독에 metadata 추가:
```javascript
metadata: {
  project: 'sogon-vc',
  environment: 'beta'
}
```

### Option 2: Restricted Keys
1. Dashboard > Developers > API keys
2. "Create restricted key" 클릭
3. Permissions 설정:
   - Charges: Write
   - Customers: Write
   - Products: Read
   - Prices: Read
   - Checkout Sessions: Write
   - Subscriptions: Write
4. 각 프로젝트별 별도 키 생성

### Option 3: Webhook Endpoints 분리
각 프로젝트별 별도 webhook endpoint:
- sogon.vc: `https://sogon.vc/api/stripe/webhook`
- 다른 프로젝트: `https://other-project.com/api/stripe/webhook`

## 사업자등록번호 검증 테스트

베타 테스트 기간 동안 사용 가능한 테스트 사업자등록번호:
- `123-45-67890` (자동 승인)
- `123`으로 시작하는 모든 번호 (자동 승인)
- 실제 체크섬이 유효한 번호 (자동 승인)

실제 운영 시에는 국세청 API 연동 필요:
- https://www.data.go.kr/data/15081808/openapi.do
- API 키 발급 후 환경변수 설정