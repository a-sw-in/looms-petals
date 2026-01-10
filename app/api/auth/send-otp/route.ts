import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOTPEmail } from "@/lib/nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now(); // Use timestamp in milliseconds
    const expiresAtMs = now + 10 * 60 * 1000; // Add 10 minutes
    
    const nowDate = new Date(now);
    const expiresAtDate = new Date(expiresAtMs);

    // Delete any existing OTPs for this email first (clean slate)
    const { data: deletedData, error: deleteError } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", email.toLowerCase())
      .select();

    console.log("Deleted old OTPs:", {
      email: email.toLowerCase(),
      deletedCount: deletedData?.length || 0,
      deleteError: deleteError
    });

    // Insert new OTP record with explicit ISO strings in UTC
    const { error: otpError } = await supabase
      .from("otp_verifications")
      .insert({
        email: email.toLowerCase(),
        otp: otp,
        is_used: false,
        expires_at: expiresAtDate.toISOString(),
        created_at: nowDate.toISOString(),
      });
    
    console.log("Created new OTP:", {
      email: email.toLowerCase(),
      otp: otp,
      nowMs: now,
      expiresAtMs: expiresAtMs,
      nowISO: nowDate.toISOString(),
      expiresAtISO: expiresAtDate.toISOString(),
      insertError: otpError
    });

    if (otpError) {
      console.error("Error storing OTP:", otpError);
      return NextResponse.json(
        { success: false, message: "Failed to send OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email (using Nodemailer with Gmail)
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        const result = await sendOTPEmail(email, otp, "Your Login Verification Code");
        
        if (!result.success) {
          console.error("Failed to send OTP email:", result.error);
        } else {
          console.log("✅ OTP email sent successfully");
        }
      } else {
        // For development: log OTP to console
        console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue even if email fails - OTP is stored in database
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
