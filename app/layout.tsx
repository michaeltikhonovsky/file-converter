import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "FileFlex",
	description: `FileFlex – your go-to online tool for unlimited and free
    multimedia conversion`,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<div className="container max-w-4xl min-h-screen pt-32 lg:pt-36 2xl:pt-44 lg:max-w-6xl 2xl:max-w-7xl">
					{children}
				</div>
				<Footer />
			</body>
		</html>
	);
}
