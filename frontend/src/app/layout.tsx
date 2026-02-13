import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import ToastContainer from "@/components/feedback/ToastContainer";
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        <body>
            <AuthProvider>
                <UIProvider>
                    <ToastContainer />
                    {children}
                </UIProvider>
            </AuthProvider>
        </body>
    </html>
  );
}
