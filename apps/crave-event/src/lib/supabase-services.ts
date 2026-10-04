import { supabase, isSupabaseConfigured, type DatabaseCertificate } from "./supabase";
import type { EventItem, MyEvent, Playlist, BlogPost, Attendee } from "./mock-data";
import { assetUrl } from "./utils";

/**
 * ============================================================================
 * SUPABASE SERVICE LAYER — CRAVE EVENT
 * ============================================================================
 * Modul ini menyediakan fungsi asynchronous untuk interaksi langsung dengan
 * database PostgreSQL dan Auth di Supabase secara native dan handal di semua runtime.
 */

// Helper pemetaan dari record tabel 'events' ke interface frontend 'EventItem'
export function mapDatabaseEventToApp(record: any): EventItem {
  return {
    id: record.id,
    slug: record.id,
    title: record.title,
    description: record.description,
    longDescription: record.description,
    playlist: record.playlist || "#EnglishClub",
    category: record.category || "Webinar",
    type: (record.type as "free" | "paid") || "free",
    price: Number(record.price) || 0,
    startsAt: record.date
      ? `${record.date}T${record.time ? record.time.slice(0, 5) : "19:00"}:00Z`
      : new Date().toISOString(),
    durationMinutes: record.duration_minutes || 90,
    platform: "Zoom Meeting",
    location: record.location || "Online via Zoom",
    zoomLink: record.zoom_link || "https://zoom.us",
    quota: record.quota || 100,
    registered: record.registered_count || 0,
    attended: 0,
    thumbnail: record.banner_url || assetUrl("/logo.png"),
    status: record.status === "ongoing" ? "live" : (record.status as "upcoming" | "live" | "past") || "upcoming",
    speaker: record.speaker_name || "Eka Revandi",
    attendanceCode: record.attendance_code || "CRV-" + record.id.slice(-4).toUpperCase(),
  };
}

// Helper pemetaan dari record tabel 'blogs' ke interface frontend 'BlogPost'
export function mapDatabaseBlogToApp(record: any): BlogPost {
  let tag = "#TechTalk";
  let cleanContent = record.content || "";

  // Ekstrak tag jika disematkan di header markdown
  const tagMatch = cleanContent.match(/<!--tag:(.*?)-->/);
  if (tagMatch && tagMatch[1]) {
    tag = tagMatch[1].trim();
    cleanContent = cleanContent.replace(/<!--tag:.*?-->\r?\n\r?\n?/, "");
  } else if (record.tag) {
    tag = record.tag;
  }

  const readingTimeNumber = parseInt(record.reading_time || "5", 10) || 5;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt || "",
    body: [cleanContent || record.excerpt || ""],
    tag: tag,
    readMinutes: readingTimeNumber,
    publishedAt: record.published_at
      ? record.published_at.split("T")[0]
      : new Date().toISOString().split("T")[0]!,
    cover: record.cover_image || assetUrl("/logo.png"),
    status: record.is_published ? "published" : "draft",
  };
}

// Helper pemetaan dari record tabel 'playlists' ke interface frontend 'Playlist'
export function mapDatabasePlaylistToApp(record: any): Playlist {
  const formattedTag = record.slug
    ? record.slug.startsWith("#")
      ? record.slug
      : `#${record.slug}`
    : `#${record.title.replace(/\s+/g, "")}`;

  return {
    id: record.id,
    tag: formattedTag,
    title: record.title,
    description: record.description || "",
    eventCount: 0,
  };
}

export const playlistsApi = {
  async fetchAll(): Promise<Playlist[] | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error || !data) {
        console.warn("[playlistsApi.fetchAll] Error:", error?.message);
        return null;
      }
      return data.map(mapDatabasePlaylistToApp);
    } catch (err) {
      console.warn("[playlistsApi.fetchAll] Exception:", err);
      return null;
    }
  },

  async create(playlist: Omit<Playlist, "id" | "eventCount">): Promise<Playlist | null> {
    if (!isSupabaseConfigured) return null;

    const rawSlug = playlist.tag.replace(/^#/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      title: playlist.title,
      description: playlist.description,
      slug: rawSlug || `pl-${Date.now()}`,
      sort_order: 1,
    };

    try {
      const { data, error } = await supabase.from("playlists").insert(payload).select().single();
      if (error || !data) {
        console.error("[playlistsApi.create] Error:", error?.message);
        return null;
      }
      return mapDatabasePlaylistToApp(data);
    } catch (err) {
      console.error("[playlistsApi.create] Exception:", err);
      return null;
    }
  },

  async update(id: string, updates: Partial<Omit<Playlist, "id">>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload['title'] = updates.title;
    if (updates.description !== undefined) payload['description'] = updates.description;
    if (updates.tag !== undefined) {
      payload['slug'] = updates.tag.replace(/^#/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    try {
      const { error } = await supabase.from("playlists").update(payload).eq("id", id);
      if (error) {
        console.error("[playlistsApi.update] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[playlistsApi.update] Exception:", err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) {
        console.error("[playlistsApi.delete] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[playlistsApi.delete] Exception:", err);
      return false;
    }
  },

  async deleteAll(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("playlists").delete().neq("id", "");
      return !error;
    } catch {
      return false;
    }
  },
};

export const eventsApi = {
  async fetchAll(): Promise<EventItem[] | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.warn("[eventsApi.fetchAll] Error:", error.message);
        return null;
      }
      return data ? data.map(mapDatabaseEventToApp) : [];
    } catch (err: any) {
      console.warn("[eventsApi.fetchAll] Exception:", err);
      return null;
    }
  },

  async getById(id: string): Promise<EventItem | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) return null;
      return mapDatabaseEventToApp(data);
    } catch {
      return null;
    }
  },

  async create(item: Omit<EventItem, "id" | "registered" | "attended">): Promise<EventItem | null> {
    if (!isSupabaseConfigured) return null;

    const eventStatus = item.status === "live" ? "ongoing" : item.status || "upcoming";
    const payload = {
      title: item.title,
      description: item.description || item.longDescription,
      category: item.category || "Webinar",
      type: item.type || "free",
      price: item.price || 0,
      date: item.startsAt ? item.startsAt.split("T")[0] : new Date().toISOString().split("T")[0]!,
      time: "19:30 WIB",
      duration_minutes: item.durationMinutes || 90,
      location: item.location || "Online via Zoom",
      speaker_name: item.speaker || "Eka Revandi",
      speaker_role: "Principal Host",
      quota: item.quota || 100,
      zoom_link: item.zoomLink || "https://zoom.us",
      playlist: item.playlist || "#EnglishClub",
      status: eventStatus,
      attendance_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      banner_url: item.thumbnail || null,
    };

    try {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      if (error || !data) {
        console.error("[eventsApi.create] Error:", error?.message);
        return null;
      }
      return mapDatabaseEventToApp(data);
    } catch (err) {
      console.error("[eventsApi.create] Exception:", err);
      return null;
    }
  },

  async update(id: string, updates: Partial<EventItem>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload['title'] = updates.title;
    if (updates.description !== undefined) payload['description'] = updates.description;
    if (updates.category !== undefined) payload['category'] = updates.category;
    if (updates.playlist !== undefined) payload['playlist'] = updates.playlist;
    if (updates.type !== undefined) payload['type'] = updates.type;
    if (updates.price !== undefined) payload['price'] = updates.price;
    if (updates.startsAt) {
      const parts = updates.startsAt.split("T");
      if (parts[0]) payload['date'] = parts[0];
      if (parts[1]) payload['time'] = parts[1].slice(0, 5);
    }
    if (updates.location !== undefined) payload['location'] = updates.location;
    if (updates.quota !== undefined) payload['quota'] = updates.quota;
    if (updates.status !== undefined) {
      payload['status'] = updates.status === "live" ? "ongoing" : updates.status;
    }
    if (updates.zoomLink !== undefined) payload['zoom_link'] = updates.zoomLink;
    if (updates.speaker !== undefined) payload['speaker_name'] = updates.speaker;
    if (updates.thumbnail !== undefined) payload['banner_url'] = updates.thumbnail;

    try {
      const { error } = await supabase.from("events").update(payload).eq("id", id);
      if (error) {
        console.error("[eventsApi.update] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[eventsApi.update] Exception:", err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        console.error("[eventsApi.delete] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[eventsApi.delete] Exception:", err);
      return false;
    }
  },

  async deleteAll(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("events").delete().neq("id", "");
      return !error;
    } catch {
      return false;
    }
  },
};

export const blogsApi = {
  async fetchAll(): Promise<BlogPost[] | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });

      if (error || !data) {
        console.warn("[blogsApi.fetchAll] Error:", error?.message);
        return null;
      }
      return data.map(mapDatabaseBlogToApp);
    } catch (err) {
      console.warn("[blogsApi.fetchAll] Exception:", err);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return null;
      return mapDatabaseBlogToApp(data);
    } catch {
      return null;
    }
  },

  async create(post: Omit<BlogPost, "id">): Promise<BlogPost | null> {
    if (!isSupabaseConfigured) return null;

    // body[0] is the full raw markdown string when coming from new.tsx
    const bodyText = Array.isArray(post.body)
      ? post.body.join("\n\n")
      : (post.body as any) || post.excerpt || "";

    const tagHeader = post.tag ? `<!--tag:${post.tag}-->\n\n` : "";
    const fullContent = tagHeader + bodyText;

    const payload = {
      title: post.title,
      slug: post.slug || `post-${Date.now()}`,
      excerpt: post.excerpt || (bodyText.slice(0, 150) + "..."),
      content: fullContent,
      cover_image: post.cover || assetUrl("/logo.png"),
      author_name: "Eka Revandi",
      reading_time: `${post.readMinutes || 5} min read`,
      is_published: post.status === "published",
      published_at: post.publishedAt || new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from("blogs").insert(payload).select().single();
      if (error || !data) {
        console.error("[blogsApi.create] Error:", error?.message);
        return null;
      }
      return mapDatabaseBlogToApp(data);
    } catch (err) {
      console.error("[blogsApi.create] Exception:", err);
      return null;
    }
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const payload: Record<string, any> = {};

    if (updates.title !== undefined) payload['title'] = updates.title;
    if (updates.slug !== undefined) payload['slug'] = updates.slug;
    if (updates.excerpt !== undefined) payload['excerpt'] = updates.excerpt;
    if (updates.cover !== undefined) payload['cover_image'] = updates.cover;
    if (updates.status !== undefined) payload['is_published'] = updates.status === "published";
    if (updates.readMinutes !== undefined) payload['reading_time'] = `${updates.readMinutes} min read`;

    if (updates.body !== undefined || updates.tag !== undefined) {
      const targetTag = updates.tag || "#TechTalk";
      // body[0] holds the full raw markdown string
      const bodyText = Array.isArray(updates.body)
        ? (updates.body.length === 1 ? updates.body[0] : updates.body.join("\n\n"))
        : (updates.body as any) || updates.excerpt || "";
      const tagHeader = targetTag ? `<!--tag:${targetTag}-->\n\n` : "";
      payload['content'] = tagHeader + bodyText;
    }

    try {
      const { error } = await supabase.from("blogs").update(payload).eq("id", id);
      if (error) {
        console.error("[blogsApi.update] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[blogsApi.update] Exception:", err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) {
        console.error("[blogsApi.delete] Error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[blogsApi.delete] Exception:", err);
      return false;
    }
  },

  async deleteAll(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("blogs").delete().neq("id", "");
      return !error;
    } catch {
      return false;
    }
  },
};

export const registrationsApi = {
  async getMyRegistrations(): Promise<MyEvent[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", user.id);

      if (error || !data) return null;
      return data.map((r: any) => ({
        eventId: r.event_id,
        registeredAt: r.created_at,
        paid: r.payment_status === "paid" || r.payment_status === "free",
        attended: r.status === "attended",
        certificateId: r.certificate_id,
      }));
    } catch {
      return null;
    }
  },

  async register(eventId: string, isPaid: boolean = false): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("registrations").upsert({
        user_id: user.id,
        event_id: eventId,
        status: "registered",
        payment_status: isPaid ? "paid" : "free",
      });

      return !error;
    } catch {
      return false;
    }
  },

  async recordAttendanceWithCode(
    eventId: string,
    attendanceCode: string,
  ): Promise<{ success: boolean; message: string; certificateId?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, message: "Supabase belum terkonfigurasi." };
    }

    try {
      const { data, error } = await supabase.rpc("record_attendance_and_claim_cert", {
        p_event_id: eventId,
        p_code: attendanceCode,
      });

      if (!error && data?.success) {
        return {
          success: true,
          message: data.message || "Presensi berhasil dicatat!",
          certificateId: data.certificate_id,
        };
      }
    } catch {
      // Fallback
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: "Anda belum login." };
      }

      const { data: eventData } = await supabase
        .from("events")
        .select("title, date, attendance_code")
        .eq("id", eventId)
        .maybeSingle();

      if (
        eventData?.attendance_code &&
        eventData.attendance_code.toUpperCase() !== attendanceCode.trim().toUpperCase()
      ) {
        return {
          success: false,
          message: "Kode absensi tidak cocok dengan sesi webinar ini.",
        };
      }

      await supabase
        .from("registrations")
        .update({
          status: "attended",
          attended_at: new Date().toISOString(),
        })
        .match({ user_id: user.id, event_id: eventId });

      const certNum = `CRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const certId = `cert-${Date.now()}`;

      await supabase.from("certificates").insert({
        id: certId,
        certificate_number: certNum,
        user_id: user.id,
        event_id: eventId,
        user_name: (user.user_metadata?.["full_name"] as string) || "Peserta Crave Event",
        event_title: eventData?.title || "Webinar Crave Event",
        event_date: eventData?.date || new Date().toISOString(),
        verification_url: `/verify/${certNum}`,
      });

      return {
        success: true,
        message: "Presensi berhasil dicatat! Sertifikat telah diterbitkan.",
        certificateId: certId,
      };
    } catch (err: any) {
      console.warn("Direct Supabase attendance fallback warning:", err);
      return { success: false, message: err?.message || "Gagal mencatat presensi." };
    }
  },
};

export const certificatesApi = {
  async getMyCertificates(): Promise<DatabaseCertificate[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error || !data) return [];
      return data as DatabaseCertificate[];
    } catch {
      return [];
    }
  },

  async verify(certNumber: string): Promise<DatabaseCertificate | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("certificate_number", certNumber)
        .maybeSingle();

      if (error || !data) return null;
      return data as DatabaseCertificate;
    } catch {
      return null;
    }
  },
};

export const authApi = {
  async signUp(email: string, password: string, fullName: string, role: "user" | "speaker" = "user") {
    if (!isSupabaseConfigured) throw new Error("Supabase credentials belum dimasukkan.");
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error("Supabase credentials belum dimasukkan.");
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signInWithOAuth(provider: "google" | "github") {
    if (!isSupabaseConfigured) throw new Error("Supabase credentials belum dimasukkan.");
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    return await supabase.auth.signOut();
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
