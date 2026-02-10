import { AuthProvider } from "@/src/context/AuthContext";
import { UIProvider } from "@/src/context/UIContext";

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
                    {children}
                </UIProvider>
            </AuthProvider>
        </body>
    </html>
  );
}
