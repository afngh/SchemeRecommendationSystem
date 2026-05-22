import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 1. Fetch the currently authenticated user from Clerk session
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. No active Clerk session found.' },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress || '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const avatarUrl = user.imageUrl || '';

    // 2. Sync profile fields to Supabase `profiles` table
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Supabase sync failed:', error.message);
      return NextResponse.json(
        { error: 'Database sync failed', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ User sync complete for:', email);

    return NextResponse.json({
      message: 'User sync complete',
      profile: data[0],
    });
  } catch (err) {
    console.error('❌ Sync API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
