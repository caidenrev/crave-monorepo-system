import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Mail,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, FilterTabs, SearchInput } from "../../components/aether/primitives";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/admin/attendees")({
  component: AdminAttendeesPage,
});

function AdminAttendeesPage() {
  const { attendees, events, toggleAttendeeCheckIn, toggleAttendeePaid } = useApp();

  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  const filtered = attendees.filter((att) => {
    if (selectedEventId !== "all" && att.eventId !== selectedEventId) return false;
    if (attendanceFilter === "attended" && !att.attended) return false;
    if (attendanceFilter === "absent" && att.attended) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return att.name.toLowerCase().includes(q) || att.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = "ID,Nama,Email,Event,Status Bayar,Status Hadir,Waktu Check-in\n";
    const rows = filtered
      .map((a) => {
        const ev = events.find((e) => e.id === a.eventId);
        return `"${a.id}","${a.name}","${a.email}","${ev?.title || a.eventId}","${
          a.paid ? "Lunas" : "Belum"
        }","${a.attended ? "Hadir" : "Tidak Hadir"}","${a.checkInAt || "-"}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data-Peserta-Crave-Event-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data Peserta Berhasil Diekspor!", {
      description: `${filtered.length} baris data peserta telah diunduh sebagai file CSV.`,
    });
  };

  const totalAttended = filtered.filter((a) => a.attended).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Peserta &amp; Presensi"
        description="Pantau partisipasi peserta, verifikasi status pembayaran tiket, dan kelola absensi."
        action={
          <Button onClick={handleExportCSV} variant="primary" size="sm">
            <Download className="size-4" />
            Ekspor Data (CSV)
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari nama atau email..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-64">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-pill border border-hairline bg-surface/90 px-4 py-2.5 text-[13px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                <option value="all">Semua Webinar ({events.length})</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-56">
              <FilterTabs
                value={attendanceFilter}
                onChange={setAttendanceFilter}
                options={[
                  { value: "all", label: "Semua" },
                  { value: "attended", label: "Hadir" },
                  { value: "absent", label: "Belum" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-[13px] text-ink-secondary border-b border-hairline pb-3">
          <span className="flex items-center gap-2">
            {/* Live pulse dot */}
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span>
              <span className="font-semibold text-ink">{totalAttended}</span>
              <span className="text-ink-secondary"> / {filtered.length} peserta hadir</span>
              <span className="ml-2 text-[11px] text-green-600 font-medium">• Live</span>
            </span>
          </span>
          <span className="text-[12px] text-ink-tertiary">
            Klik status untuk mengubah manual kehadiran / pembayaran
          </span>
        </div>

      </div>

      {/* Attendees Table */}
      <div className="glass overflow-hidden rounded-2xl border border-hairline">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-hairline bg-surface/80 text-[12px] uppercase text-ink-tertiary">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Peserta</th>
                <th className="px-4 py-3.5 font-semibold">Webinar yang Diikuti</th>
                <th className="px-4 py-3.5 font-semibold">Status Pembayaran</th>
                <th className="px-4 py-3.5 font-semibold">Status Kehadiran</th>
                <th className="px-4 py-3.5 font-semibold">Waktu Presensi</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((att) => {
                const ev = events.find((e) => e.id === att.eventId);

                return (
                  <tr key={att.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-accent-tint text-[13px] font-semibold text-accent-strong">
                          {att.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{att.name}</p>
                          <p className="text-[12px] text-ink-tertiary">{att.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-medium text-ink truncate">{ev?.title || att.eventId}</p>
                      <span className="text-[11px] text-accent font-semibold">{ev?.playlist}</span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          toggleAttendeePaid(att.id);
                          toast.success(`Status pembayaran ${att.name} diperbarui!`);
                        }}
                        title="Klik untuk ubah status pembayaran"
                        className="cursor-pointer"
                      >
                        <Badge tone={att.paid ? "success" : "warning"}>
                          {att.paid ? "Lunas" : "Belum Bayar"}
                        </Badge>
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          toggleAttendeeCheckIn(att.id);
                          toast.success(`Status kehadiran ${att.name} diperbarui!`);
                        }}
                        title="Klik untuk ubah absensi"
                        className="cursor-pointer"
                      >
                        <Badge tone={att.attended ? "success" : "neutral"}>
                          {att.attended ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Hadir
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="size-3 text-ink-tertiary" /> Belum Hadir
                            </span>
                          )}
                        </Badge>
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-ink-secondary">
                      {att.checkInAt ? (
                        <span className="flex items-center gap-1 text-ink font-medium">
                          <Clock className="size-3.5 text-accent" />
                          {att.checkInAt} WIB
                        </span>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          toggleAttendeeCheckIn(att.id);
                          toast.success(`Presensi ${att.name} ditandai ${!att.attended ? "Hadir" : "Belum Hadir"}`);
                        }}
                        className="text-[12px] font-medium text-accent hover:underline"
                      >
                        {att.attended ? "Batalkan Hadir" : "Tandai Hadir Manual"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
