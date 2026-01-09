import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get("session_token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        // Find session to get user_id
        const { data: session, error: sessionError } = await supabase
            .from("user_sessions")
            .select("user_id")
            .eq("session_token", sessionToken)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { success: false, message: "Invalid session" },
                { status: 401 }
            );
        }

        // Delete user (this should cascade if DB is set up correctly, 
        // but we'll be safe and delete session first if needed. 
        // user_sessions usually has a FK to users.)

        // 1. Delete all sessions for this user
        await supabase
            .from("user_sessions")
            .delete()
            .eq("user_id", session.user_id);

        // 2. Delete the user
        const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", session.user_id);

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return NextResponse.json(
                { success: false, message: "Failed to delete account" },
                { status: 500 }
            );
        }

        // Clear session cookie
        const response = NextResponse.json({
            success: true,
            message: "Account deleted successfully",
        });

        response.cookies.delete("session_token");

        return response;
    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
