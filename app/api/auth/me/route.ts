import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from("user_sessions")
      .select("user_id, expires_at")
      .eq("session_token", sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if session is expired (with timezone fix)
    let expiresAtStr = session.expires_at;
    if (!expiresAtStr.endsWith('Z')) {
      expiresAtStr += 'Z';
    }

    if (new Date(expiresAtStr) < new Date()) {
      // Delete expired session
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", sessionToken);

      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, phone, address, age, gender")
      .eq("id", session.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
