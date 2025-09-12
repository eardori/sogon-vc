import { loadStripe } from '@stripe/stripe-js'

// 클라이언트 사이드 Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Stripe 구독 플랜 정보
export const SUBSCRIPTION_PLANS = {
  prospective_founder: {
    name: '예비창업자',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROSPECTIVE_FOUNDER,
    price: 2.99,
    features: [
      '모든 후기 열람 가능',
      '댓글 작성 가능',
      '좋아요/싫어요 참여',
      'VC 통계 조회'
    ]
  },
  founder: {
    name: '창업자',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDER,
    price: 1.99,
    features: [
      '후기 작성 가능',
      '모든 후기 열람 가능',
      '댓글 작성 가능',
      '좋아요/싫어요 참여',
      'VC 통계 조회',
      '정보 제공자 특별 할인'
    ]
  },
  vc_general: {
    name: 'VC (일반)',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VC_GENERAL,
    price: 2.99,
    features: [
      '후기에 대한 답변 작성',
      '모든 후기 열람 가능',
      '댓글 작성 가능',
      '좋아요/싫어요 참여',
      '실명 표시'
    ]
  },
  vc_anonymous: {
    name: 'VC (익명)',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VC_ANONYMOUS,
    price: 4.99,
    features: [
      '후기에 대한 답변 작성',
      '모든 후기 열람 가능',
      '댓글 작성 가능',
      '좋아요/싫어요 참여',
      '익명 활동 가능'
    ]
  }
}