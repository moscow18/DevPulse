import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: "DevPulse | Social for Developers",
  description: "Connect and share code snippets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ضفنا suppressHydrationWarning عشان المتصفح ميزعلش لما نغير الكلاس بالسكريبت
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 👇 السكريبت السحري: بيشتغل قبل ما أي حاجة تظهر على الشاشة 👇 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('system_theme');
                  if (savedTheme === 'light') {
                    document.documentElement.classList.add('light-mode');
                  } else {
                    document.documentElement.classList.remove('light-mode');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#020617] text-white antialiased transition-colors duration-300">
        
        {/* محرك اللغة بيغلف الموقع كله */}
        <LanguageProvider>
          {children} 
        </LanguageProvider>
        
        {/* التوستر عشان الإشعارات */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}