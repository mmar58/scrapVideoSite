import {LinkType} from "../util/linkUtil";
export interface MediaCategory {
	id: string;
	title: string;
	icon?: string;
    imageUrl?: string;
    filesCount?: number;
	description?: string;
	color?: string;
	link?: string;
	linkType?: LinkType;
	date?: string;
	parentLink?: string;
}