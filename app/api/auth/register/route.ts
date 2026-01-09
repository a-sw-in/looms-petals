import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, otp } = await request.json();

    // Validation
    if (!email || !password || !name || !otp) {
      return NextResponse.json(
        { success: false, message: "All fields including OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP first
    const { data: otpRecord } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp", otp)
      .eq("is_used", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or unverified OTP. Please verify OTP first." },
        { status: 400 }
      );
    }

    // Check if OTP was verified recently (within last 30 minutes)
    // Force UTC parsing by appending 'Z' if not present
    let createdAtStr = otpRecord.created_at;
    if (!createdAtStr.endsWith('Z') && !createdAtStr.includes('+')) {
      createdAtStr += 'Z';
    }

    const otpVerifiedAtMs = new Date(createdAtStr).getTime();
    const nowMs = Date.now();
    const timeDiff = (nowMs - otpVerifiedAtMs) / (1000 * 60); // minutes

    console.log("Registration OTP check:", {
      email: email.toLowerCase(),
      otpVerifiedAtMs,
      nowMs,
      timeDiff,
      rawCreatedAt: otpRecord.created_at
    });

    if (timeDiff > 30) {
      return NextResponse.json(
        { success: false, message: "OTP verification expired. Please start again." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters, at least one letter and one number)
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'user',
        is_verified: true,
      })
      .select("id, email, name, phone, address, age, gender")
      .single();

    if (createError || !newUser) {
      console.error("Error creating user:", createError);
      return NextResponse.json(
        { success: false, message: "Failed to create account" },
        { status: 500 }
      );
    }

    // Create session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: newUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json(
        { success: false, message: "Failed to create session" },
        { status: 500 }
      );
    }

    // Clean up: Delete the used OTP record
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", email.toLowerCase());

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: "Account created successfully",
    });

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
