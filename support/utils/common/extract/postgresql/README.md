# PostgreSQL Extract Utility

## Overview
The PostgreSQL Extract utility provides functionality to extract and parse PostgreSQL dump files (`.sql`) into Flatfile workbooks. It specifically handles PostgreSQL COPY format data blocks, making it efficient for large datasets.

## Table of Contents
- [Getting Started](#getting-started)
  - [Basic Usage](#basic-usage)
- [Features](#features)
- [Processing Flow](#processing-flow)
- [Output Format](#output-format)
- [Error Handling](#error-handling)
- [Limitations](#limitations)

## Getting Started

### Basic Usage
Add the PostgreSQL Extractor to your Flatfile listener:

```typescript
import { PostgreSQLExtractor } from "../../support/utils/common/extract/postgresql";

export default function (listener: FlatfileListener) {
  // Configure the extractor to handle .sql files
  listener.use(PostgreSQLExtractor('.sql'))
}
```

## Features

- Parses PostgreSQL dump files in COPY format
- Automatically handles column names and data types
- Supports multiple tables in a single dump file
- Handles escaped characters and NULL values
- Maintains data integrity during extraction
- Automatically handles duplicate column names
- Processes large datasets efficiently

## Processing Flow

1. File is read and parsed as UTF-8 text
2. Data blocks are identified using regex pattern matching
3. For each data block:
   - Table name is extracted
   - Column headers are parsed from COPY statement
   - Data rows are processed line by line
   - Special characters and escapes are handled
   - NULL values are properly managed
4. Data is organized into a structured workbook format

## Output Format
The extractor creates a workbook capture with the following structure:
```typescript
{
  [tableName: string]: {
    headers: string[],           // Column names
    data: Record<string, any>[], // Row data with values
    metadata: {
      rowHeaders: string[]
    }
  }
}
```

## Error Handling
- Robust error handling for malformed dump files
- Validation of table structures
- Proper handling of special PostgreSQL COPY format characters
- Detailed error reporting for debugging

## Limitations
- Only supports PostgreSQL dump files in COPY format
- Requires .sql file extension
- Does not process other PostgreSQL dump file elements (like schema definitions, indexes, etc.)
- Focuses solely on data extraction from COPY blocks
