import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Button } from "../../components/aether/primitives";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/dashboard/settings")({
  component: DashboardSettingsPage,
});

function DashboardSettingsPage() {
  const { currentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || "Peserta");
  const [email, setEmail] = useState(currentUser?.email || "peserta@crave.id");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [institution, setInstitution] = useState("Software Engineer · Tech Corp");
  const [bio, setBio] = useState(
    "Tertarik mempelajari teknik komunikasi tim remote, public speaking berbahasa Inggris, dan sistem AI workflow.",
  );

  const [emailNotify, setEmailNotify] = useState(true);
  const [waNotify, setWaNotify] = useState(true);
  const [marketingNotify, setMarketingNotify] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profil Berhasil Diperbarui!", {
      description: "Informasi akun dan preferensi belajarmu telah disimpan.",
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Harap isi kata sandi lama dan baru.");
      return;
    }
    toast.success("Kata Sandi Berhasil Diubah!", {
      description: "Gunakan kata sandi baru untuk masuk berikutnya.",
    });
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Pengaturan Profil"
        description="Kelola informasi akun, kontak WhatsApp untuk pengingat Zoom, dan preferensi notifikasi."
      />

      {/* Profile Info Card */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-hairline pb-4">
          <User className="size-5 text-accent" />
          <h2 className="text-[18px] font-bold text-ink">Informasi Akun</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="aether-meta block text-ink-tertiary">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Nomor WhatsApp (Aktif)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Pekerjaan / Instansi</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Bio Singkat</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 p-4 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          {/* Notification Preferences */}
          <div className="pt-4 border-t border-hairline space-y-3">
            <label className="aether-meta block text-ink-tertiary">Preferensi Notifikasi</label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="size-4.5 rounded text-accent focus:ring-accent"
              />
              <span className="text-[14px] text-ink">
                Kirim tiket &amp; link Zoom via Email konfirmasi
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={waNotify}
                onChange={(e) => setWaNotify(e.target.checked)}
                className="size-4.5 rounded text-accent focus:ring-accent"
              />
              <span className="text-[14px] text-ink">
                Kirim pengingat WhatsApp 1 jam sebelum webinar dimulai
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingNotify}
                onChange={(e) => setMarketingNotify(e.target.checked)}
                className="size-4.5 rounded text-accent focus:ring-accent"
              />
              <span className="text-[14px] text-ink">
                Notifikasi artikel blog baru dan promo webinar
              </span>
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit">
              <Save className="size-4" />
              Simpan Perubahan Profil
            </Button>
          </div>
        </form>
      </div>

      {/* Security Card */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-hairline pb-4">
          <Shield className="size-5 text-accent" />
          <h2 className="text-[18px] font-bold text-ink">Keamanan &amp; Kata Sandi</h2>
        </div>

        <form onSubmit={handleSavePassword} className="mt-6 space-y-4 max-w-md">
          <div>
            <label className="aether-meta block text-ink-tertiary">Kata Sandi Saat Ini</label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <Button type="submit" variant="glass" size="sm">
            Perbarui Kata Sandi
          </Button>
        </form>
      </div>
    </div>
  );
}
