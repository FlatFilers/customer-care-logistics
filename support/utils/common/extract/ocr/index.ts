import { OCRExtract } from "./helpers/ocr.extract";
import { Extractor } from '@flatfile/util-extractor'

export enum NativeFileTypes {
    CSV = 'csv',
    TSV = 'tsv',
    PSV = 'psv',
}

export interface ExtractOptions {
    doc_types: {}
}

export const OCRExtractor = (
    fileExt: string,
    options: ExtractOptions
) => {
    if (Object.values(NativeFileTypes).includes(fileExt as NativeFileTypes)) {
        throw new Error(
        `${fileExt} is a native file type and not supported by the ocr extractor.`
        )
    }

    return Extractor(fileExt, 'ocr', OCRExtract, options)
}