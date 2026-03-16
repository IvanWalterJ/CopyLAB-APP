import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function createSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  );
}

// GET: list all brand profiles for logged-in user
export async function GET() {
  const supabase = createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: create or update brand profile
export async function POST(req: Request) {
  const supabase = createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Clean up fields for storage  
  const profileData = {
    user_id: user.id,
    name: body.name || 'Mi Marca',
    industry: body.industry || null,
    uvp: body.uvp || null,
    avatar_name: body.avatar_name || null,
    avatar_age: body.avatar_age || null,
    avatar_pains: body.avatar_pains || [],
    avatar_desires: body.avatar_desires || [],
    avatar_objections: body.avatar_objections || [],
    brand_adjectives: body.brand_adjectives || [],
    forbidden_words: body.forbidden_words || [],
    approved_copy: body.approved_copy || null,
    formality_level: body.formality_level || 5,
    product_name: body.product_name || null,
    product_transformation: body.product_transformation || null,
    product_mechanism: body.product_mechanism || null,
    product_results: body.product_results || null,
    product_guarantee: body.product_guarantee || null,
    product_price: body.product_price || null,
    default_consciousness_level: body.default_consciousness_level || 2,
    is_active: body.is_active ?? true,
  };

  let result;
  if (body.id) {
    // Update
    result = await supabase
      .from('brand_profiles')
      .update(profileData)
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();
  } else {
    // Insert
    result = await supabase
      .from('brand_profiles')
      .insert(profileData)
      .select()
      .single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json(result.data);
}

// DELETE: delete brand profile
export async function DELETE(req: Request) {
  const supabase = createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from('brand_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
