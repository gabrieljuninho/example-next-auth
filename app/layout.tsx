import type { Metadata } from "next";

import { SessionProvider } from "next-auth/react";

import "@/styles/globals.css";

import { auth } from "@/auth";

import { cn } from "@/lib/utils";

import Layouts from "@/common/components/layouts";

import { geistSans } from "@/common/lib/fonts";

import { ILayoutsProps } from "@/common/types";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<ILayoutsProps>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("font-geist", geistSans.variable)}>
          <Layouts>{children}</Layouts>
        </body>
      </html>
    </SessionProvider>
  );
}
