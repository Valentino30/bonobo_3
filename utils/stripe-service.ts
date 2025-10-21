import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { getPaymentPlans } from './payment-service'
import { supabase } from './supabase'
import { getDeviceId } from './device-id'

export interface StripePaymentResult {
  success: boolean
  error?: string
  paymentIntentId?: string
}

export class StripeService {
  /**
   * Create a payment intent using Supabase Edge Function and initialize the payment sheet
   */
  static async initializePayment(planId: string, chatId?: string): Promise<StripePaymentResult> {
    try {
      // Get the plan details
      const PAYMENT_PLANS = await getPaymentPlans()
      const plan = Object.values(PAYMENT_PLANS).find((p) => p.id === planId)
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      console.log('Creating payment intent for plan:', plan.name, plan.price, plan.currency)

      // Get device ID for user identification
      const deviceId = await getDeviceId()

      // Get user ID if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id

      console.log('📞 Calling create-payment-intent with:', {
        amount: Math.round(plan.price * 100),
        currency: plan.currency.toLowerCase(),
        planId: plan.id,
        deviceId,
        userId: userId || 'none (anonymous)',
        chatId,
      })

      // Call Supabase Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency.toLowerCase(),
          planId: plan.id,
          deviceId,
          userId, // Include userId if authenticated
          chatId, // Include chatId for one-time purchases
        },
      })

      console.log('📞 create-payment-intent response:', { data, error })

      if (error) {
        console.error('❌ Error calling Supabase function:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw new Error(error.message || 'Failed to create payment intent')
      }

      if (!data) {
        console.error('❌ No data returned from create-payment-intent')
        throw new Error('No data returned from payment service')
      }

      if (data.error) {
        console.error('❌ Error in response data:', data.error)
        throw new Error(data.error)
      }

      if (!data.paymentIntent) {
        console.error('❌ No paymentIntent in response:', data)
        throw new Error('Payment intent not created')
      }

      const { paymentIntent, ephemeralKey, customer } = data

      // Extract payment intent ID from client secret (format: pi_xxx_secret_yyy)
      const paymentIntentId = paymentIntent.split('_secret_')[0]
      console.log('💳 Payment Intent ID:', paymentIntentId)

      // Initialize the payment sheet with setup for future payments
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Bonobo Chat Analysis',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'User',
        },
        // Enable saving payment methods for future use
        returnURL: 'bonobo://payment-complete',
      })

      if (initError) {
        console.error('Error initializing payment sheet:', initError)
        return { success: false, error: initError.message }
      }

      // Present the payment sheet
      const { error: paymentError } = await presentPaymentSheet()

      if (paymentError) {
        // User cancelled - this is normal, not an error
        if (paymentError.code === 'Canceled') {
          console.log('ℹ️ User cancelled payment sheet')
          return { success: false }
        }
        // Actual error
        console.error('❌ Error presenting payment sheet:', paymentError)
        return { success: false, error: paymentError.message }
      }

      console.log('✅ Payment successful!')
      return { success: true, paymentIntentId }
    } catch (error) {
      console.error('Payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      }
    }
  }
}
