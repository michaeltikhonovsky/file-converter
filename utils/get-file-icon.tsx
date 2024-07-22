import {
	BsFillImageFill,
	BsFileEarmarkTextFill,
	BsFillCameraVideoFill,
} from "react-icons/bs";
import { AiFillFile } from "react-icons/ai";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";

export default function getFileIcon(file_type: string): JSX.Element {
	if (file_type.includes("video"))
		return <BsFillCameraVideoFill color="#FF4081" />; // Pink
	if (file_type.includes("audio"))
		return <PiSpeakerSimpleHighFill color="#4CAF50" />; // Green
	if (file_type.includes("text"))
		return <BsFileEarmarkTextFill color="#2196F3" />; // Blue
	if (file_type.includes("image"))
		return <BsFillImageFill color="#FFC107" />; // Amber
	else return <AiFillFile color="#9E9E9E" />; // Grey
}
