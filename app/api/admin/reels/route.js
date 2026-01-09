import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAdmin() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('admin_token')?.value;

		if (!token || !supabaseAdmin) return null;

		const { data: session } = await supabaseAdmin
			.from('admin_sessions')
			.select('*')
			.eq('token', token)
			.gt('expires_at', new Date().toISOString())
			.single();

		if (!session) return null;

		const { data: user } = await supabaseAdmin
			.from('users')
			.select('*')
			.eq('id', session.user_id)
			.eq('role', 'admin')
			.single();

		return user;
	} catch {
		return null;
	}
}

// GET - Fetch all reels
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		let query = supabase
			.from("reels")
			.select("*")
			.order("created_at", { ascending: false });

		if (id) {
			query = query.eq("id", id).single();
		}

		const { data, error } = await query;

		if (error) {
			console.error("Supabase GET error:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 }
			);
		}

		console.log("GET reels - Found:", Array.isArray(data) ? `${data.length} reels` : '1 reel', data);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("Error fetching reels:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch reels" },
			{ status: 500 }
		);
	}
}

// POST - Create a new reel
export async function POST(request) {
	try {
		const admin = await verifyAdmin();
		if (!admin) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const body = await request.json();
		const { video_url, title, description } = body;

		if (!video_url || !title) {
			return NextResponse.json(
				{ success: false, error: "Video URL and title are required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("reels")
			.insert([
				{
					video_url,
					title,
					description: description || null,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error) {
		console.error("Error creating reel:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create reel" },
			{ status: 500 }
		);
	}
}

// PUT - Update a reel
export async function PUT(request) {
	try {
		const admin = await verifyAdmin();
		if (!admin) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		console.log("PUT request - ID:", id);

		if (!id) {
			console.error("PUT error: No ID provided");
			return NextResponse.json(
				{ success: false, error: "Reel ID is required" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const { video_url, title, description } = body;

		console.log("PUT request - Body:", { video_url, title, description });

		const updateData = {};
		if (video_url !== undefined) updateData.video_url = video_url;
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;

		console.log("PUT request - Update data:", updateData);

		// First, try to update without .single() to see if row exists
		const { data, error } = await supabase
			.from("reels")
			.update(updateData)
			.eq("id", parseInt(id))
			.select();

		if (error) {
			console.error("Supabase PUT error:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 }
			);
		}

		if (!data || data.length === 0) {
			console.error("PUT error: Reel not found");
			return NextResponse.json(
				{ success: false, error: "Reel not found" },
				{ status: 404 }
			);
		}

		console.log("PUT success:", data[0]);
		return NextResponse.json({ success: true, data: data[0] });
	} catch (error) {
		console.error("Error updating reel:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update reel" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete a reel
export async function DELETE(request) {
	try {
		const admin = await verifyAdmin();
		if (!admin) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Reel ID is required" },
				{ status: 400 }
			);
		}

		const { error } = await supabase.from("reels").delete().eq("id", id);

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Reel deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting reel:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete reel" },
			{ status: 500 }
		);
	}
}
