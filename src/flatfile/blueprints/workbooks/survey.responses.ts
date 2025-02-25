import type { Flatfile } from "@flatfile/api";

export const surveyResponses: Flatfile.CreateWorkbookConfig = {
  name: "Survey Results",
  sheets: [
    {
      name: "CSV Demographics Export",
      slug: "csv-demographics-export",
      fields: [
        {
          key: "UNIQUE_ID",
          type: "string",
          label: "Unique ID",
          alternativeNames: ["UNIQUE_ID"],
          constraints: [{ type: "required" }],
        },
        {
          key: "RECDATE",
          type: "date",
          label: "Record Date",
          alternativeNames: ["RECDATE"],
          constraints: [{ type: "required" }],
        },
        {
          key: "ADJSAMP",
          type: "enum",
          label: "Adjusted Sample",
          alternativeNames: ["ADJSAMP"],
          config: {
            options: [
              { value: "Included", label: "Included" },
              { value: "Not Included", label: "Not Included" },
            ],
          },
        },
        {
          key: "ITCLINIC",
          type: "string",
          label: "Clinic Name",
          alternativeNames: ["ITCLINIC"],
          description: "clinic name",
        },
        {
          key: "ITLOCATI",
          type: "string",
          label: "Location",
          alternativeNames: ["ITLOCATI"],
          description: "the location / facility name",
        },
      ],
    },
    {
      name: "CSV Survey Responses Export",
      slug: "csv-survey-responses-export",
      fields: [
        {
          key: "UNIQUE_ID",
          type: "reference",
          label: "Unique ID",
          constraints: [{ type: "required" }],
          config: {
            key: "UNIQUE_ID",
            ref: "csv-demographics-export",
            relationship: "has-one",
          },
        },
        {
          key: "VAR_NAME",
          type: "string",
          label: "Variable Name",
          constraints: [{ type: "required" }],
        },
        {
          key: "RESPONSE",
          type: "string",
          label: "Response",
          constraints: [{ type: "required" }],
        },
        {
          key: "DISCHARGE_UNIT",
          type: "string",
          label: "Discharge Unit",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "FACILITY",
          type: "string",
          label: "Facility",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "RESPONSE_DATE",
          type: "string",
          label: "Response Date",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "RESPONSE_MONTH",
          type: "string",
          label: "Response Month",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "TMG_GROUP",
          type: "string",
          label: "TMG Group",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "ADJSAMP",
          type: "string",
          label: "Adjusted Sample",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
      ],
    },
    {
      name: "Current Upload",
      slug: "current-upload",
      fields: [
        {
          key: "Hospital_code",
          type: "string",
          label: "Hospital Code",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "Month",
          type: "string",
          label: "Month",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "Year",
          type: "string",
          label: "Year",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "FyMonth",
          type: "string",
          label: "Fiscal Year Month",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "FyYear",
          type: "string",
          label: "Fiscal Year",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "Unit",
          type: "string",
          label: "Unit",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "InpatientLTRTopBox",
          type: "number",
          label: "Inpatient LTR Top Box",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "InpatientLTRSubmissions",
          type: "number",
          label: "Inpatient LTR Submissions",
          readonly: true,
          constraints: [{ type: "computed" }],
        },
        {
          key: "InpatientLTRTopBox%",
          type: "number",
          label: "Inpatient LTR Top Box %",
          readonly: true,
          constraints: [{ type: "computed" }],
          config: {
            decimalPlaces: 1,
          },
        },
      ],
    },
  ],
  actions: [
    {
      operation: "generate-summary",
      mode: "foreground",
      label: "Summarize Results",
      primary: true,
      inputForm: {
        type: "simple",
        fields: [
          { key: "surveyId", label: "Survey Id (Variable Name)", type: "string", defaultValue: "O3" },
          { key: "topBox", label: "Top Box", type: "string", defaultValue: "5" },
        ],
      },
    },
  ],
};
