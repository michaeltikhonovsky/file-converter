import Dropzone from "@/components/dropzone";
import Link from "next/link";

export default function Home() {
	return (
		<div className="pb-8 space-y-16">
			<div className="space-y-6">
				<p className="text-center text-muted-foreground text-md md:text-lg md:px-24 xl:px-44 2xl:px-52">
					Tired of random file conversion tools that are filled with ads and
					take forever? Use this instead! All I ask for is a star on my{" "}
					<Link
						href="https://github.com/michaeltikhonovsky"
						target="_blank"
						passHref
						className="text-md font-bold text-white transition hover:text-blue-400"
					>
						github
					</Link>
				</p>
			</div>
			<Dropzone />
		</div>
	);
}
