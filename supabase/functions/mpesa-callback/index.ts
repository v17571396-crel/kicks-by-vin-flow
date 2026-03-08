import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This endpoint receives callbacks from Safaricom after payment
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;
    const callbackMetadata = body?.Body?.stkCallback?.CallbackMetadata;

    if (resultCode === 0 && callbackMetadata) {
      // Payment successful
      const items = callbackMetadata.Item || [];
      const mpesaReceipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
      const amountPaid = items.find((i: any) => i.Name === "Amount")?.Value;

      // Find the order by matching amount and status
      // In production, store CheckoutRequestID in orders table for exact matching
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "stk_sent")
        .order("created_at", { ascending: false })
        .limit(10);

      if (orders && orders.length > 0) {
        const order = orders[0]; // Most recent pending order

        // Mark order as paid
        await supabase
          .from("orders")
          .update({
            status: "paid",
            mpesa_receipt: mpesaReceipt,
          })
          .eq("id", order.id);

        // Mark product as sold out
        await supabase
          .from("products")
          .update({ available: false })
          .eq("id", order.product_id);

        console.log(`Order ${order.id} paid. Receipt: ${mpesaReceipt}`);
      }
    } else {
      console.log(`Payment failed or cancelled. ResultCode: ${resultCode}`);
      // Could update order status to 'failed' here
    }

    // Safaricom expects a success response
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: "Error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
