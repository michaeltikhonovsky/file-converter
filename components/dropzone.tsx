"use client";
import { TbCloudUpload } from "react-icons/tb";
import { MdClose } from "react-icons/md";
import ReactDropzone from "react-dropzone";
import getFileSize from "@/utils/get-file-size";
import getFileIcon from "@/utils/get-file-icon";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import formatFileName from "@/utils/format-filename";

import convertFile from "@/utils/convert";
import { ImSpinner3 } from "react-icons/im";
import { MdDone } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import loadFfmpeg from "@/utils/load-ffmpeg";
import type { Action } from "@/types";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const extensions = {
	image: [
		"jpg",
		"jpeg",
		"png",
		"gif",
		"bmp",
		"webp",
		"ico",
		"tif",
		"tiff",
		"svg",
		"raw",
		"tga",
	],
	video: [
		"mp4",
		"m4v",
		"mp4v",
		"3gp",
		"3g2",
		"avi",
		"mov",
		"wmv",
		"mkv",
		"flv",
		"ogv",
		"webm",
		"h264",
		"264",
		"hevc",
		"265",
	],
	audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
};

export default function Dropzone() {
	const { toast } = useToast();
	const [is_hover, setIsHover] = useState<boolean>(false);
	const [actions, setActions] = useState<Action[]>([]);
	const [is_ready, setIsReady] = useState<boolean>(false);
	const [files, setFiles] = useState<Array<any>>([]);
	const [is_loaded, setIsLoaded] = useState<boolean>(false);
	const [is_converting, setIsConverting] = useState<boolean>(false);
	const [is_done, setIsDone] = useState<boolean>(false);
	const ffmpegRef = useRef<any>(null);
	const [defaultValues, setDefaultValues] = useState<string>("video");
	const [selcted, setSelected] = useState<string>("...");
	const accepted_files = {
		"image/*": [
			".jpg",
			".jpeg",
			".png",
			".gif",
			".bmp",
			".webp",
			".ico",
			".tif",
			".tiff",
			".raw",
			".tga",
		],
		"audio/*": [],
		"video/*": [],
	};

	// functions
	const reset = () => {
		setIsDone(false);
		setActions([]);
		setFiles([]);
		setIsReady(false);
		setIsConverting(false);
	};
	const downloadAll = (): void => {
		for (let action of actions) {
			!action.is_error && download(action);
		}
	};
	const download = (action: Action) => {
		const a = document.createElement("a");
		a.style.display = "none";
		a.href = action.url;
		a.download = action.output;

		document.body.appendChild(a);
		a.click();

		// Clean up after download
		URL.revokeObjectURL(action.url);
		document.body.removeChild(a);
	};
	const convert = async (): Promise<any> => {
		let tmp_actions = actions.map((elt) => ({
			...elt,
			is_converting: true,
		}));
		setActions(tmp_actions);
		setIsConverting(true);
		for (let action of tmp_actions) {
			try {
				const { url, output } = await convertFile(ffmpegRef.current, action);
				tmp_actions = tmp_actions.map((elt) =>
					elt === action
						? {
								...elt,
								is_converted: true,
								is_converting: false,
								url,
								output,
						  }
						: elt
				);
				setActions(tmp_actions);
			} catch (err) {
				tmp_actions = tmp_actions.map((elt) =>
					elt === action
						? {
								...elt,
								is_converted: false,
								is_converting: false,
								is_error: true,
						  }
						: elt
				);
				setActions(tmp_actions);
			}
		}
		setIsDone(true);
		setIsConverting(false);
	};
	const handleUpload = (data: Array<any>): void => {
		handleExitHover();
		setFiles(data);
		const tmp: Action[] = [];
		data.forEach((file: any) => {
			const formData = new FormData();
			tmp.push({
				file_name: file.name,
				file_size: file.size,
				from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
				to: null,
				file_type: file.type,
				file,
				is_converted: false,
				is_converting: false,
				is_error: false,
			});
		});
		setActions(tmp);
	};
	const handleHover = (): void => setIsHover(true);
	const handleExitHover = (): void => setIsHover(false);
	const updateAction = (file_name: String, to: String) => {
		setActions(
			actions.map((action): Action => {
				if (action.file_name === file_name) {
					return {
						...action,
						to,
					};
				}

				return action;
			})
		);
	};
	const checkIsReady = (): void => {
		let tmp_is_ready = true;
		actions.forEach((action: Action) => {
			if (!action.to) tmp_is_ready = false;
		});
		setIsReady(tmp_is_ready);
	};
	const deleteAction = (action: Action): void => {
		setActions(actions.filter((elt) => elt !== action));
		setFiles(files.filter((elt) => elt.name !== action.file_name));
	};
	useEffect(() => {
		if (!actions.length) {
			setIsDone(false);
			setFiles([]);
			setIsReady(false);
			setIsConverting(false);
		} else checkIsReady();
	}, [actions]);
	useEffect(() => {
		load();
	}, []);
	const load = async () => {
		const ffmpeg_response: FFmpeg = await loadFfmpeg();
		ffmpegRef.current = ffmpeg_response;
		setIsLoaded(true);
	};

	if (actions.length) {
		return (
			<div className="space-y-6 flex flex-col items-center">
				{actions.map((action: Action, i: any) => (
					<div
						key={i}
						className="relative flex flex-wrap items-center justify-between px-3 py-4 space-x-2 border cursor-pointer lg:py-0 rounded-xl h-fit lg:h-20 lg:px-10 lg:flex-nowrap"
					>
						<div className="flex items-center gap-2">
							<span className="text-2xl text-orange-600">
								{getFileIcon(action.file_type)}
							</span>
							<div className="flex items-center gap-1">
								<span className="overflow-x-hidden font-medium text-md">
									{formatFileName(action.file_name)}
								</span>
								<span className="text-sm text-muted-foreground">
									({getFileSize(action.file_size)})
								</span>
							</div>
						</div>

						{action.is_error ? (
							<Badge variant="destructive" className="flex gap-2">
								<span>Error Converting File</span>
								<BiError />
							</Badge>
						) : action.is_converted ? (
							<Badge variant="default" className="flex gap-2 bg-green-500">
								<span>Done</span>
								<MdDone />
							</Badge>
						) : action.is_converting ? (
							<Badge variant="default" className="flex gap-2">
								<span>Converting</span>
								<span className="animate-spin">
									<ImSpinner3 />
								</span>
							</Badge>
						) : (
							<div className="flex items-center gap-4 text-muted-foreground text-sm pl-4">
								<span>Convert to</span>
								<Select
									onValueChange={(value) => {
										if (extensions.audio.includes(value)) {
											setDefaultValues("audio");
										} else if (extensions.video.includes(value)) {
											setDefaultValues("video");
										}
										setSelected(value);
										updateAction(action.file_name, value);
									}}
								>
									<SelectTrigger className="w-32 font-medium text-center outline-none focus:outline-none focus:ring-0 text-muted-foreground bg-background text-md">
										<SelectValue placeholder="..." />
									</SelectTrigger>
									<SelectContent className="h-fit rounded-xl">
										{action.file_type.includes("image") && (
											<div className="grid grid-cols-2 gap-2 w-fit">
												{extensions.image.map((elt, i) => (
													<div key={i} className="col-span-1 text-center">
														<SelectItem
															value={elt}
															className="mx-auto cursor-pointer rounded-xl"
														>
															{elt}
														</SelectItem>
													</div>
												))}
											</div>
										)}
										{action.file_type.includes("video") && (
											<Tabs defaultValue={defaultValues} className="w-full">
												<TabsList className="w-full rounded-xl">
													<TabsTrigger
														value="video"
														className="w-full rounded-xl"
													>
														Video
													</TabsTrigger>
													<TabsTrigger
														value="audio"
														className="w-full rounded-xl"
													>
														Audio
													</TabsTrigger>
												</TabsList>
												<TabsContent value="video">
													<div className="grid grid-cols-3 gap-2 w-fit">
														{extensions.video.map((elt, i) => (
															<div key={i} className="col-span-1 text-center">
																<SelectItem
																	value={elt}
																	className="mx-auto rounded-xl"
																>
																	{elt}
																</SelectItem>
															</div>
														))}
													</div>
												</TabsContent>
												<TabsContent value="audio">
													<div className="grid grid-cols-3 gap-2 w-fit">
														{extensions.audio.map((elt, i) => (
															<div key={i} className="col-span-1 text-center">
																<SelectItem
																	value={elt}
																	className="mx-auto rounded-xl"
																>
																	{elt}
																</SelectItem>
															</div>
														))}
													</div>
												</TabsContent>
											</Tabs>
										)}
										{action.file_type.includes("audio") && (
											<div className="grid grid-cols-2 gap-2 w-fit">
												{extensions.audio.map((elt, i) => (
													<div key={i} className="col-span-1 text-center">
														<SelectItem
															value={elt}
															className="mx-auto rounded-xl"
														>
															{elt}
														</SelectItem>
													</div>
												))}
											</div>
										)}
									</SelectContent>
								</Select>
							</div>
						)}
						{!action.is_converted ? (
							<span
								onClick={() => deleteAction(action)}
								className="flex items-center justify-center w-10 h-10 text-2xl rounded-full cursor-pointer hover:bg-muted text-foreground"
							>
								<MdClose />
							</span>
						) : null}
					</div>
				))}
				<div className="flex justify-center w-full">
					{is_done ? (
						<div className="space-y-4 w-fit flex flex-col items-center justify-center">
							<Button
								size="lg"
								className="relative flex items-center w-full gap-2 py-4 font-semibold rounded-xl text-md"
								onClick={downloadAll}
							>
								{actions.length > 1 ? "Download All" : "Download"}
								<HiOutlineDownload />
							</Button>
							<Button
								size="lg"
								onClick={reset}
								variant="outline"
								className="rounded-xl"
							>
								Convert Another
							</Button>
						</div>
					) : (
						<Button
							size="lg"
							disabled={!is_ready || is_converting}
							className="relative flex items-center py-4 font-semibold rounded-xl text-md w-44"
							onClick={convert}
						>
							{is_converting ? (
								<span className="text-lg animate-spin">
									<ImSpinner3 />
								</span>
							) : (
								<span>Convert Now</span>
							)}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<ReactDropzone
			onDrop={handleUpload}
			onDragEnter={handleHover}
			onDragLeave={handleExitHover}
			accept={accepted_files}
			onDropRejected={() => {
				handleExitHover();
				toast({
					variant: "destructive",
					title: "Error uploading your file(s)",
					description: "Allowed Files: Audio, Video and Images.",
					duration: 5000,
				});
			}}
			onError={() => {
				handleExitHover();
				toast({
					variant: "destructive",
					title: "Error uploading your file(s)",
					description: "Allowed Files: Audio, Video and Images.",
					duration: 5000,
				});
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<div className="flex justify-center w-full">
					<div
						{...getRootProps()}
						className="flex items-center justify-center w-full max-w-xl p-4 transition-colors duration-300 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/10 bg-background border-secondary min-h-[12rem]"
					>
						<input {...getInputProps()} />
						<div className="space-y-4 text-foreground">
							<>
								<div className="flex justify-center text-6xl">
									<TbCloudUpload />
								</div>
								<h3 className="text-2xl font-medium text-center">
									Click here or drop your files into the box!
								</h3>
							</>
						</div>
					</div>
				</div>
			)}
		</ReactDropzone>
	);
}
