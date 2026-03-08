import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StkPushRequest {
  phone: string;
  amount: number;
  productId: string;
  customerName: string;
  deliveryArea: string;
}

// Get M-Pesa access token
async function getMpesaToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")!;
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
  const env = Deno.env.get("MPESA_ENVIRONMENT") || "sandbox";

  const baseUrl =
    env === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const res = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get M-Pesa token: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Format phone to 254XXXXXXXXX
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s+]/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  return cleaned;
}

// Generate timestamp in format YYYYMMDDHHmmss
function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate required secrets
    const requiredSecrets = ["MPESA_CONSUMER_KEY", "MPESA_CONSUMER_SECRET", "MPESA_SHORTCODE", "MPESA_PASSKEY"];
    const missing = requiredSecrets.filter(s => !Deno.env.get(s));
    if (missing.length > 0) {
      console.error("Missing M-Pesa secrets:", missing);
      return new Response(
        JSON.stringify({ error: "M-Pesa payment is not configured yet. Missing credentials." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone, amount, productId, customerName, deliveryArea }: StkPushRequest =
      await req.json();

    // Validate inputs
    if (!phone || !amount || !productId || !customerName || !deliveryArea) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhone(phone);
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: productId,
        customer_name: customerName,
        customer_phone: formattedPhone,
        delivery_area: deliveryArea,
        amount: amount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initiate STK Push
    const token = await getMpesaToken();
    const env = Deno.env.get("MPESA_ENVIRONMENT") || "sandbox";
    const baseUrl =
      env === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL") || `${supabaseUrl}/functions/v1/mpesa-callback`;
    const timestamp = getTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `KBV-${order.id.slice(0, 8)}`,
      TransactionDesc: `KicksbyVin Order ${order.id.slice(0, 8)}`,
    };

    const stkRes = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      // Update order with checkout request ID
      await supabase
        .from("orders")
        .update({ status: "stk_sent" })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "STK Push sent to your phone",
          orderId: order.id,
          checkoutRequestId: stkData.CheckoutRequestID,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ status: "stk_failed" })
        .eq("id", order.id);

      console.error("STK Push failed:", stkData);
      return new Response(
        JSON.stringify({
          error: "Failed to initiate M-Pesa payment",
          details: stkData.errorMessage || stkData.ResponseDescription,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("STK Push error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
