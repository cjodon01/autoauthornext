import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2022-11-15"
});
// Initialize Supabase
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// Optional: Stripe pricing table ID, if needed in the future
const pricingTableId = Deno.env.get("STRIPE_PRICING_TABLE_ID");
serve(async (req)=>{
  // Handle CORS preflight
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Content-Type": "application/json"
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: corsHeaders
    });
  }
  try {
    // Extract both values at once to avoid duplicate reads
    const { user_id, product_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({
        error: "Missing user_id"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (!product_id) {
      return new Response(JSON.stringify({
        error: "Missing product_id"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    console.log(`🔍 Looking up user profile for user_id: ${user_id}`);
    // Fetch email from Supabase
    const { data: profile, error: profileError } = await supabase.from("profiles").select("email").eq("user_id", user_id).single();
    if (profileError || !profile?.email) {
      console.error("Error fetching profile or missing email:", profileError);
      return new Response(JSON.stringify({
        error: "User profile not found or missing email"
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    console.log(`Found email: ${profile.email}`);
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        supabase_user_id: user_id
      }
    });
    console.log(`Stripe customer created: ${customer.id}`);
    // Look up Stripe price ID from Supabase
    const trimmedName = product_id.trim();
    console.log("Looking up product with id:", product_id);
    // Look up Stripe price ID from Supabase
    const { data: product, error: productError } = await supabase.from("stripe_products").select("default_price").ilike("name", trimmedName).maybeSingle();
    console.log("Supabase product result:", product);
    if (productError || !product?.default_price) {
      console.error("Error fetching product or missing default_price:", productError);
      return new Response(JSON.stringify({
        error: "Stripe product not found or missing default price"
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.id,
      line_items: [
        {
          price: product.default_price,
          quantity: 1
        }
      ],
      success_url: "https://autoauthor.cc/success",
      cancel_url: "https://autoauthor.cc/cancel"
    });
    return new Response(JSON.stringify({
      url: session.url
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("Stripe Checkout error:", err);
    return new Response(JSON.stringify({
      error: err.message || "Unknown error"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
