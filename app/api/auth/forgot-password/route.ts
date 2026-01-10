import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOTPEmail } from "@/lib/nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase())
      .single();

    // Don't reveal if user exists or not for security
    if (userError || !user) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset OTP.",
      });
    }

    // Delete old OTPs for this email
    const { error: deleteError, count: deletedCount } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", email.toLowerCase());

    console.log("Deleted old OTPs:", {
      email: email.toLowerCase(),
      deletedCount,
      deleteError,
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes
    const now = Date.now();
    const expiresAtMs = now + 10 * 60 * 1000;
    const expiresAt = new Date(expiresAtMs);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        email: email.toLowerCase(),
        otp: otp,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    console.log("Created new OTP for password reset:", {
      email: email.toLowerCase(),
      otp: otp,
      nowMs: now,
      expiresAtMs: expiresAtMs,
      nowISO: new Date(now).toISOString(),
      expiresAtISO: expiresAt.toISOString(),
      insertError,
    });

    if (insertError) {
      console.error("Error creating OTP:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email (using Nodemailer with Gmail)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const result = await sendOTPEmail(
          email.toLowerCase(),
          otp,
          "Password Reset OTP - Looms & Petals"
        );
        
        if (result.success) {
          console.log("✅ Password reset OTP email sent successfully");
        } else {
          console.error("❌ Failed to send password reset email:", result.error);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("⚠️ RESEND_API_KEY not configured. Password reset OTP:", otp);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset OTP.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
