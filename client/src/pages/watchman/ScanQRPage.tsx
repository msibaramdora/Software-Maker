import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ScanQRPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent double initialization
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Success callback
        // Assuming QR code contains just the visit ID string like "123"
        const visitId = parseInt(decodedText);
        if (!isNaN(visitId)) {
          scanner.clear();
          setLocation(`/watchman/visitor/${visitId}`);
        } else {
          setError("Invalid QR Code format");
        }
      },
      (errorMessage) => {
        // Error callback (scanned but failed/no QR found yet)
        console.log(errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [setLocation]);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Scan Visitor Pass</CardTitle>
            <CardDescription>Place the QR code within the frame</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-secondary/50 min-h-[300px]" />
            {error && (
              <p className="text-center text-destructive mt-4 font-medium">{error}</p>
            )}
            <p className="text-xs text-center text-muted-foreground mt-4">
              Camera permission required. Ensure the room is well lit.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
