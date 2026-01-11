import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { loginRateLimit } from "@/lib/rateLimit";
import { validate, loginSchema } from "@/lib/validation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 attempts per minute per IP
    const rateLimit = loginRateLimit(request);
    if (!rateLimit.allowed) {
      const resetInSeconds = rateLimit.resetTime 
        ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        : 60;
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many login attempts. Please try again in ${resetInSeconds} seconds.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Input validation with Zod
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, password, name, phone, address, age, gender")
      .eq("email", email.toLowerCase())
      .single();

    console.log("Login attempt:", {
      email: email.toLowerCase(),
      userFound: !!user,
      userError: userError
    });

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("Password verification:", {
      email: email.toLowerCase(),
      isPasswordValid: isPasswordValid,
      passwordLength: password.length,
      hashedPasswordLength: user.password.length
    });

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Delete old sessions for this user (optional: keep only the last 5)
    const { data: oldSessions } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (oldSessions && oldSessions.length > 5) {
      const sessionsToDelete = oldSessions.slice(5).map((s) => s.id);
      await supabase
        .from("user_sessions")
        .delete()
        .in("id", sessionsToDelete);
    }

    // Create new session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Reduced from 30 days to 7 days

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: user.id,
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

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        age: user.age,
        gender: user.gender,
      },
      message: "Login successful",
    });

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Changed from "lax" to "strict" for better security
      maxAge: 7 * 24 * 60 * 60, // Reduced from 30 days to 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
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
