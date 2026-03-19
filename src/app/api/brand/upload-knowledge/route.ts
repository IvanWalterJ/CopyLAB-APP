import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const brandId = formData.get('brand_id') as string | null;

  if (!file || !brandId) {
    return NextResponse.json({ error: 'Missing file or brand_id' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = file.name.toLowerCase();

  let extractedText = '';

  try {
    if (fileName.endsWith('.pdf')) {
      const result = await pdfParse(buffer);
      extractedText = result.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: 'Formato no soportado. Usa PDF o DOCX.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Error al procesar el archivo.' }, { status: 500 });
  }

  // Trim to avoid huge tokens in AI context (max ~6000 chars)
  const trimmedText = extractedText.trim().substring(0, 6000);

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : supabase;

  const { error } = await adminClient
    .from('brand_profiles')
    .update({ knowledge_base_text: trimmedText })
    .eq('id', brandId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, chars: trimmedText.length });
}
