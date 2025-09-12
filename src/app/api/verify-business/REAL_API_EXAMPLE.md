# 실제 사업자등록번호 검증 API 연동 예제

## 1. 국세청 사업자등록정보 진위확인 API (공공데이터포털)

### API 신청
1. https://www.data.go.kr 회원가입
2. "사업자등록정보 진위확인 및 상태조회 서비스" 검색
3. API 활용 신청 (승인까지 1-2일 소요)

### 구현 예제
```typescript
// 국세청 API 호출
const verifyWithNTS = async (businessNumber: string) => {
  const apiKey = process.env.NTS_API_KEY
  
  const response = await fetch('https://api.odcloud.kr/api/nts-businessman/v1/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      b_no: [businessNumber.replace(/-/g, '')]
    })
  })
  
  const result = await response.json()
  
  if (result.data && result.data[0]) {
    return {
      success: true,
      companyName: result.data[0].b_stt_nm, // 납세자 상태명
      status: result.data[0].b_stt, // 01: 계속사업자
      taxType: result.data[0].b_type // 과세 유형
    }
  }
  
  return { success: false }
}
```

## 2. 비즈노 API (bizno.net)

### 특징
- 회사명까지 조회 가능
- 더 자세한 정보 제공
- 유료 서비스 (건당 과금)

### API 신청
1. https://bizno.net 회원가입
2. API 키 발급
3. 크레딧 충전

### 구현 예제
```typescript
const verifyWithBizno = async (businessNumber: string) => {
  const apiKey = process.env.BIZNO_API_KEY
  
  const response = await fetch(`https://bizno.net/api/fapi?key=${apiKey}&gb=1&q=${businessNumber}&type=json`)
  
  const result = await response.json()
  
  if (result.items && result.items.length > 0) {
    return {
      success: true,
      companyName: result.items[0].company, // 상호명
      representative: result.items[0].owner, // 대표자명
      address: result.items[0].location, // 주소
      businessType: result.items[0].business // 업종
    }
  }
  
  return { success: false }
}
```

## 3. 홈택스 스크래핑 (권장하지 않음)

법적 이슈가 있을 수 있으므로 공식 API 사용 권장

## 4. 네이버 검색 API (간접 조회)

### 구현 예제
```typescript
const searchCompanyName = async (businessNumber: string) => {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  
  const response = await fetch(`https://openapi.naver.com/v1/search/local.json?query=${businessNumber}`, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret
    }
  })
  
  const result = await response.json()
  
  // 검색 결과에서 회사명 추출
  if (result.items && result.items.length > 0) {
    return {
      possibleCompanyName: result.items[0].title.replace(/<[^>]*>/g, '')
    }
  }
  
  return null
}
```

## 5. 실제 운영 시 권장 구현

```typescript
export async function verifyBusinessNumber(businessNumber: string) {
  const cleanNumber = businessNumber.replace(/-/g, '')
  
  // 1. 체크섬 검증
  if (!validateChecksum(cleanNumber)) {
    return { success: false, message: '유효하지 않은 사업자등록번호입니다.' }
  }
  
  // 2. 캐시 확인 (Redis 등)
  const cached = await getCachedVerification(cleanNumber)
  if (cached) {
    return cached
  }
  
  // 3. 국세청 API로 유효성 확인
  const ntsResult = await verifyWithNTS(cleanNumber)
  
  // 4. 비즈노 API로 상세 정보 조회 (선택)
  let companyDetails = null
  if (ntsResult.success) {
    companyDetails = await verifyWithBizno(cleanNumber)
  }
  
  // 5. 결과 캐싱 (24시간)
  const result = {
    success: ntsResult.success,
    companyName: companyDetails?.companyName || '정보 없음',
    status: ntsResult.status,
    ...companyDetails
  }
  
  await cacheVerification(cleanNumber, result, 86400)
  
  return result
}
```

## 환경변수 설정

```env
# 국세청 API
NTS_API_KEY=your_nts_api_key

# 비즈노 API
BIZNO_API_KEY=your_bizno_api_key

# 네이버 검색 API (선택)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 캐시 (Redis)
REDIS_URL=redis://localhost:6379
```