import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Delete, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/pin")({
  component: PinPage,
});

function PinPage() {
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const savedPin = user?.user_metadata?.["pin"];
  const isSetupMode = !savedPin;

  const handlePress = (num: string) => {
    if (pin.length < 6 && !isProcessing) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isProcessing) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    async function processPin() {
      if (pin.length === 6) {
        setIsProcessing(true);

        if (isSetupMode) {
          const { error } = await supabase.auth.updateUser({
            data: { pin },
          });

          if (error) {
            toast.error("Gagal menyimpan PIN: " + error.message);
            setPin("");
          } else {
            toast.success("PIN berhasil dibuat!");
            localStorage.setItem("app_unlocked", "true");
            navigate({ to: "/" });
          }
        } else {
          if (pin === savedPin) {
            toast.success("PIN Benar!");
            localStorage.setItem("app_unlocked", "true");
            navigate({ to: "/" });
          } else {
            toast.error("PIN Salah. Silakan coba lagi.");
            setPin("");
          }
        }
        setIsProcessing(false);
      }
    }
    processPin();
  }, [pin, isSetupMode, savedPin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">{isSetupMode ? "Buat PIN Baru" : "Masukkan PIN"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSetupMode
            ? "Buat 6 digit PIN rahasia untuk mengamankan aplikasi Anda"
            : "Masukkan 6 digit PIN untuk membuka kasir"}
        </p>
      </div>

      <div className="mb-10 flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "size-5 rounded-full border-2 transition-all",
              i < pin.length
                ? "border-primary bg-primary scale-110"
                : "border-muted bg-transparent",
            )}
          />
        ))}
      </div>

      <div className="grid w-[280px] grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            disabled={isProcessing}
            className="flex h-16 items-center justify-center rounded-2xl bg-muted/50 text-2xl font-semibold transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <div /> {}
        <button
          onClick={() => handlePress("0")}
          disabled={isProcessing}
          className="flex h-16 items-center justify-center rounded-2xl bg-muted/50 text-2xl font-semibold transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          disabled={isProcessing}
          className="flex h-16 items-center justify-center rounded-2xl bg-muted/50 text-xl transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
        >
          <Delete className="size-6" />
        </button>
      </div>
    </div>
  );
}
