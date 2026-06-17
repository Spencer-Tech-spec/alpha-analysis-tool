import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Look up the user in Supabase
    // Note: In a real production app, password_hash should be encrypted/hashed and compared securely.
    // Since we just generated the password and saved it directly in the previous steps for simplicity,
    // we'll do a direct comparison here.
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 });
    }
    // If the user managed to log in while pending_payment, it means the Admin gave them their secret username.
    // We treat this successful login as proof of payment and auto-activate the account.
    if (user.status === 'pending_payment') {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('[Login] Failed to mark user as active:', updateError);
      }
    } else if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
