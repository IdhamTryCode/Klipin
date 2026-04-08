import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    transaction_id,
    payment_type,
  } = body;

  // Verify signature SHA512(order_id + status_code + gross_amount + server_key)
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expected = crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (expected !== signature_key) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // Idempotency check
  const { data: order } = await supabase
    .from("payment_orders")
    .select("*")
    .eq("midtrans_order_id", order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ ok: true, message: "ALREADY_PROCESSED" });
  }

  const isSettlement =
    (transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept"));

  if (isSettlement) {
    // Add credits via RPC
    await supabase.rpc("refund_credits", {
      p_user_id: order.user_id,
      p_amount: order.credits_to_add,
      p_reference_id: order_id,
      p_description: `Topup ${order.package_name}`,
    });
    await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        midtrans_transaction_id: transaction_id,
        payment_type,
        paid_at: new Date().toISOString(),
        webhook_received_at: new Date().toISOString(),
        raw_notification: body,
      })
      .eq("midtrans_order_id", order_id);
  } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status)) {
    await supabase
      .from("payment_orders")
      .update({
        status: transaction_status === "expire" ? "expired" : "failed",
        webhook_received_at: new Date().toISOString(),
        raw_notification: body,
      })
      .eq("midtrans_order_id", order_id);
  }

  return NextResponse.json({ ok: true });
}
