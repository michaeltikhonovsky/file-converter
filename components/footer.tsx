"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		const interval = setInterval(() => {
			const date = new Date();
			date.setHours(date.getHours());
			setTime(
				date.toLocaleTimeString("en-US", {
					hour12: true,
					hour: "numeric",
					minute: "numeric",
				})
			);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<footer className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-primary/[1%] to-transparent">
			<div className="container mx-auto flex flex-row items-center justify-center py-6">
				<span className="flex flex-row items-center space-x-4">
					<p className="text-xs text-gray-200">
						Check me out on{" "}
						<Link
							href="https://github.com/michaeltikhonovsky"
							target="_blank"
							passHref
							className="font-bold text-white transition hover:text-blue-400"
						>
							github
						</Link>
					</p>
					<hr className="hidden h-6 border-l border-muted md:flex" />
					<span className="flex flex-row items-center space-x-2 md:flex">
						<p className="text-xs text-gray-100">Local time:</p>
						<p className="text-sm font-semibold text-gray-100">{time} UTC+1</p>
					</span>
				</span>
			</div>
			<div className="h-1 bg-[radial-gradient(closest-side,#8486ff,#42357d,#5d83ff,transparent)] opacity-50" />
		</footer>
	);
}
