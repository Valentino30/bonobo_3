import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { PAYMENT_PLANS } from './payment-service'
import { supabase } from './supabase'
import { getDeviceId } from './device-id'

export interface StripePaymentResult {
  success: boolean
  error?: string
}

export class StripeService {
  /**
   * Create a payment intent using Supabase Edge Function and initialize the payment sheet
   */
  static async initializePayment(planId: string): Promise<StripePaymentResult> {
    try {
      // Get the plan details
      const plan = Object.values(PAYMENT_PLANS).find((p) => p.id === planId)
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      console.log('Creating payment intent for plan:', plan.name, plan.price)

      // Get device ID for user identification
      const deviceId = await getDeviceId()

      // Call Supabase Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency.toLowerCase(),
          planId: plan.id,
          deviceId,
        },
      })

      if (error) {
        console.error('Error calling Supabase function:', error)
        throw new Error(error.message)
      }

      if (!data || !data.paymentIntent) {
        throw new Error('Failed to create payment intent')
      }

      const { paymentIntent, ephemeralKey, customer } = data

      // Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Bonobo Chat Analysis',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'User',
        },
      })

      if (initError) {
        console.error('Error initializing payment sheet:', initError)
        return { success: false, error: initError.message }
      }

      // Present the payment sheet
      const { error: paymentError } = await presentPaymentSheet()

      if (paymentError) {
        console.error('Error presenting payment sheet:', paymentError)
        // User cancelled
        if (paymentError.code === 'Canceled') {
          return { success: false }
        }
        return { success: false, error: paymentError.message }
      }

      console.log('✅ Payment successful!')
      return { success: true }
    } catch (error) {
      console.error('Payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      }
    }
  }
}
