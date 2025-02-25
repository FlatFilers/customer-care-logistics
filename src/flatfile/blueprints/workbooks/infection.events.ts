import type { Flatfile } from "@flatfile/api";

const monthOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
];

export const infectionEvents: Flatfile.CreateWorkbookConfig = {
  name: "Infection Events",
  sheets: [
    {
      name: "Organizations",
      slug: "organizations",
      fields: [
        {
          key: "Hospital_code",
          type: "string",
          label: "Hospital_code",
          constraints: [{ type: "required" }],
        },
        {
          key: "orgid",
          type: "string",
          label: "Organization Id",
          constraints: [{ type: "required" }, { type: "unique" }],
        },
      ],
    },
    {
      name: "CAUTI Records",
      slug: "cauti-records",
      fields: [
        {
          key: "orgid",
          type: "reference",
          label: "Organization Id",
          config: { key: "orgid", ref: "organizations", relationship: "has-one" },
        },
        {
          key: "Hospital_code",
          type: "string",
          label: "Hospital Code",
          readonly: true,
          constraints: [{ type: "required" }],
        },
        {
          key: "Month",
          type: "enum",
          label: "Month",
          config: {
            options: monthOptions,
          },
        },
        {
          key: "Year",
          type: "number",
          label: "Year",
          config: { decimalPlaces: 0 },
        },
        {
          key: "Fy Month",
          type: "enum",
          label: "Fy Month",
          config: { options: monthOptions },
        },
        {
          key: "Fy Year",
          type: "number",
          label: "Fy Year",
          config: { decimalPlaces: 0 },
        },
        {
          key: "Unit",
          type: "enum",
          label: "Unit",
          config: {
            options: [
              { value: "CTN ICU", label: "CTN ICU" },
              { value: "CTN CVICU", label: "CTN CVICU" },
              { value: "CTN Newborn", label: "CTN Newborn" },
              { value: "CTN 3E", label: "CTN 3E" },
              { value: "CTN 4E", label: "CTN 4E" },
              { value: "CTN 4S", label: "CTN 4S" },
              { value: "CTN OB/GYN", label: "CTN OB/GYN" },
              { value: "CTN 1W", label: "CTN 1W" },
              { value: "CTN CPCU", label: "CTN CPCU" },
              { value: "CTN EDIPOF", label: "CTN EDIPOF" },
              { value: "CTN NICU", label: "CTN NICU" },
            ],
          },
        },
        {
          key: "CAUTI Events",
          type: "number",
          label: "CAUTI Events",
          config: { decimalPlaces: 0 },
        },
        {
          key: "CAUTI Predicted Number",
          type: "number",
          label: "CAUTI Predicted Number",
          config: { decimalPlaces: 3 },
        },
        {
          key: "FYTD CAUTI Events",
          type: "number",
          label: "FYTD CAUTI Events",
          config: { decimalPlaces: 0 },
        },
        {
          key: "FYTD CAUTI Predicted Number",
          type: "number",
          label: "FYTD CAUTI Predicted Number",
          config: { decimalPlaces: 3 },
        },
      ],
    },
  ],
  actions: [
    {
      operation: "downloadWorkbook",
      mode: "foreground",
      label: "Download Excel Workbook",
      description: "Downloads Excel Workbook of Data",
      primary: true,
    },
  ],
};
