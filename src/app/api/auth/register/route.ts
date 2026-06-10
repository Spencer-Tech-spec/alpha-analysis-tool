import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!name || !phone || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Since they didn't provide a username, we'll auto-generate one based on their name
    const baseUsername = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const username = `${baseUsername}${randomNum}`;

    // Note: In a production app, password should be hashed (e.g. using bcrypt)
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        name,
        email,
        phone,
        password_hash: password,
        status: 'active' // Changed from pending_payment so they can login immediately
      })
      .select('id, username')
      .single();

    if (error) {
      console.error('[Register Error]', error);
      // Check for unique constraint violations
      if (error.code === '23505') {
        if (error.message.includes('email')) {
           return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
        }
        if (error.message.includes('phone')) {
           return NextResponse.json({ error: 'Phone number is already registered' }, { status: 409 });
        }
      }
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Registration successful', user });
  } catch (error) {
    console.error('[Register Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
