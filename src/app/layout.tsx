import type { Metadata } from "next";
import "@/assets/globals.css";
import { cn } from "@/lib/utils/clsxUtils";
import { ReactNode } from "react";
import { SyneFont, RalewayFont } from "@/config/fonts";
import { defaultMeta } from "@/config/meta";

type RootLayoutPropType = { readonly children: ReactNode };
export const metadata: Metadata = defaultMeta;

export default function RootLayout({ children }: RootLayoutPropType) {
  return (
    <html lang="en">
      <body className={cn(SyneFont.className, RalewayFont.className)}>
        {children}
      </body>
    </html>
  );
}
