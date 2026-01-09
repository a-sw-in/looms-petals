import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find session
    const { data: session } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const { name, phone, address, age, gender } = await request.json();

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        age: age || undefined,
        gender: gender || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user_id)
      .select("id, email, name, phone, address, age, gender")
      .single();

    if (updateError || !updatedUser) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
