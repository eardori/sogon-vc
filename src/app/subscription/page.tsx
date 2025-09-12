'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planKey: string, priceId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(planKey)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userType: planKey,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          alert(error.message)
        }
      }
    } catch (error) {
      alert('결제 프로세스 시작 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            구독 플랜 선택
          </h1>
          <p className="text-lg text-gray-600">
            sogon.vc의 모든 기능을 이용하려면 구독이 필요합니다
          </p>
          <p className="text-sm text-gray-500 mt-2">
            * 창업자는 후기 작성으로 크레딧을 얻어 무료로 이용할 수도 있습니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">/월</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(key, plan.priceId!)}
                disabled={loading === key}
                className="w-full"
              >
                {loading === key ? '처리 중...' : '구독 시작'}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            모든 플랜은 언제든지 취소 가능합니다
          </p>
          <p className="text-sm text-gray-600 mt-2">
            결제는 안전한 Stripe를 통해 처리됩니다
          </p>
        </div>
      </div>
    </div>
  )
}