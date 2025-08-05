import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";
// --- initialize clients ---
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2022-11-15"
});
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
serve(async (req)=>{
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature"
      }
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const sig = req.headers.get("Stripe-Signature");
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400
    });
  }
  try {
    switch(event.type){
      case "customer.created":
        {
          const customer = event.data.object;
          const customerId = customer.id;
          const email = customer.email;
          if (!customerId || !email) {
            console.error("⚠️ Missing customer ID or email.");
            break;
          }
          // Update the profiles table with stripe_customer_id based on email
          const { error } = await supabase.from("profiles").update({
            stripe_customer_id: customerId
          }).eq("email", email);
          if (error) {
            console.error("❌ Error updating user with Stripe customer ID:", error.message);
          } else {
            console.log(`✅ Successfully updated user with Stripe customer ID: ${customerId}`);
          }
          break;
        }
      case "checkout.session.completed":
        {
          const session = event.data.object;
          const userId = session.metadata?.supabase_user_id;
          const subscriptionId = session.subscription;
          const customerId = session.customer;
          const priceId = session.metadata?.price_id;
          if (userId && subscriptionId && customerId) {
            console.log(`✅ Checkout completed for user ${userId}`);
            await supabase.from("subscriptions").insert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              price_id: priceId || null,
              status: "active",
              current_period_start: new Date((session.created ?? 0) * 1000).toISOString(),
              current_period_end: new Date((session.expires_at ?? 0) * 1000).toISOString()
            });
          }
          break;
        }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        {
          const subscription = event.data.object;
          console.log(`🔄 Subscription update for ${subscription.id}`);
          await supabase.from("subscriptions").upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer.toString(),
            price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
          }, {
            onConflict: "stripe_subscription_id"
          });
          break;
        }
      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    return new Response(`Server error: ${err.message}`, {
      status: 500
    });
  }
});
