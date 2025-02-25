import { PostgreSQL_DUMP } from "./helpers/postgresql.extract";
import { Extractor } from '@flatfile/util-extractor'


export const PostgreSQLExtractor = (
    fileExt: string
) => {

    if (fileExt === '.sql') {
        return Extractor(fileExt, 'sql', PostgreSQL_DUMP)
    }

    throw new Error(
        `Please use .sql file type.`
    )
}