import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    if (!pin || typeof pin !== "string") {
      return Response.json({ error: "PIN required" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: staff, error } = await supabase
      .from("staff")
      .select("id, name, role, pin_hash, is_active, failed_attempts, locked_until")
      .eq("is_active", true);

    if (error || !staff) {
      return Response.json({ error: "Auth error" }, { status: 500 });
    }

    const bcrypt = require("bcryptjs");
    const staffMember = (staff as any[]).find((s: any) => {
      try {
        return bcrypt.compareSync(pin, s.pin_hash);
      } catch {
        return false;
      }
    });

    if (!staffMember) {
      return Response.json({ error: "Invalid PIN" }, { status: 401 });
    }

    if (staffMember.locked_until && new Date(staffMember.locked_until) > new Date()) {
      return Response.json({ error: "Account locked", locked_until: staffMember.locked_until }, { status: 403 });
    }

    await supabase
      .from("staff")
      .update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
      .eq("id", staffMember.id);

    const session_token = Buffer.from(crypto.randomUUID() + Date.now().toString()).toString("base64url");
    const expires_at = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    return Response.json({
      session: {
        staff_id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
        session_token,
        expires_at,
      },
    });
  } catch {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
