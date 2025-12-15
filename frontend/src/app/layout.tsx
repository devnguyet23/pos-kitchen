import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
                    title: "F&B POS System",
                    description: "Restaurant POS System with Real-time features",
};

export default function RootLayout({
                    children,
}: {
                    children: React.ReactNode;
}) {
                    return (
                                        <html lang="en">
                                                            <body>{children}</body>
                                        </html>
                    );
}
