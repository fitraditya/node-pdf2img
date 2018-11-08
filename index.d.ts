import { any } from 'async';

export interface Options {
	type: 'png' | 'jpg';
	size: number;
	density: number;
	outputdir: string;
	outputname: string;
	page: number | null;
}

export function setOptions(options: Partial<Options>): void;

export interface ConvertedFilesInfo {
	result: 'success';
	message: Array<{
		page: number;
		name: string;
		size: number;
		path: string;
	}>;
}

export interface ConvertedFilesError {
	result: 'success';
	message: string;
}

export function convert(input: string, result: (error: ConvertedFilesError, info: ConvertedFilesInfo) => void): void;
