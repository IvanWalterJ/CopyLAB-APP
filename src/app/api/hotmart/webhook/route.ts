import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos admin client para poder procesar pagos aunque no haya sesion
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANTE: Deberás agregar esto en .env
);

// Map the Hotmart payload depending on version
export async function POST(req: Request) {
  try {
    // Si necesitas validar un token de Hotmart por seguridad (HOTMART_WEBHOOK_TOKEN)
    const hotmartToken = req.headers.get('x-hotmart-hottok');
    if (process.env.HOTMART_WEBHOOK_TOKEN && hotmartToken !== process.env.HOTMART_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[Hotmart Webhook] Payload recibído:', body);

    // Event checking, adapt to correct Hotmart event name usually 'PURCHASE_APPROVED' or 'APPROVED'
    const event = body.event || body.type;
    if (event !== 'PURCHASE_APPROVED' && event !== 'approved') {
      return NextResponse.json({ message: 'Ignored, not an approved purchase' });
    }

    // Adapt to Hotmart webhook payload 2.0 or 1.0 (the structure might change slightly)
    const transactionId = body.data?.purchase?.transaction || body.transaction || 'UNKNOWN_TX';
    const buyerEmail = body.data?.buyer?.email || body.email;
    const productId = body.data?.product?.id || body.product_id;
    const amount = body.data?.purchase?.price?.value || 0;

    if (!buyerEmail) {
      return NextResponse.json({ error: 'Missing buyer email' }, { status: 400 });
    }

    // Calcula cuántos créditos añadir. Asumimos que "un producto" da 100 créditos, o puedes usar un Switch:
    let creditsToAdd = 100;
    if (productId === 'PRODUCT_ID_BASICO') creditsToAdd = 50;
    if (productId === 'PRODUCT_ID_PRO') creditsToAdd = 300;

    // Llamamos el RPC que creamos en el dashboard de Supabase (add_credits_by_email)
    const { error: rpcError } = await supabaseAdmin.rpc('add_credits_by_email', {
      buyer_email_param: buyerEmail,
      credits_to_add: creditsToAdd
    });

    if (rpcError) {
      console.error('[Hotmart RPC Array]', rpcError);
      return NextResponse.json({ error: 'Failed to add credits via RPC' }, { status: 500 });
    }

    // Registra la transacción
    const { error: txError } = await supabaseAdmin.from('hotmart_transactions').insert({
      transaction_id: transactionId,
      product_id: productId,
      credits_added: creditsToAdd,
      amount_paid: amount,
      buyer_email: buyerEmail,
      status: 'APPROVED'
    });

    if (txError) {
      console.error('[Hotmart Transaction Error]', txError);
      // No hacemos throw porque la compra realmente ingresó los créditos (RPC). 
      // Sólo falló el tracking local si no está bien setteada la tabla.
    }

    return NextResponse.json({ success: true, credits_added: creditsToAdd });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Hotmart Parsing Error]', err);
    return NextResponse.json({ error: 'Webhook processing failed', details: err.message }, { status: 500 });
  }
}
