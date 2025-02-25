import type { FlatfileListener } from "@flatfile/listener";

import { ExcelExtractor } from "@flatfile/plugin-xlsx-extractor";
import spaceConfigure from "./jobs/space.configure";
import { exportWorkbookPlugin } from "@flatfile/plugin-export-workbook";
import { recordHook } from "@flatfile/plugin-record-hook";
import { TabularExtractor } from "../../support/utils/common/extract/tabular";
import { DateTime } from "luxon";
import { generateSummaryAction } from "./actions/generate.summary";

export default function (listener: FlatfileListener): void {
  listener.use(ExcelExtractor());
  listener.use(TabularExtractor(".txt"));
  listener.use(spaceConfigure);
  listener.use(
    recordHook("cauti-records", (record) => {
      const newRecord = record;
      const org = record.getLinks("orgid")[0];
      record.set("Hospital_code", org["Hospital_code"]);
      return newRecord;
    })
  );
  listener.use(
    exportWorkbookPlugin({
      excludedSheets: ["organizations"],
      excludeFields: ["orgid"],
    })
  );

  listener.use(
    recordHook("csv-survey-responses-export", (record) => {
      const newRecord = record;
      const demoGraphicRecord = record.getLinks("UNIQUE_ID")[0];
      const location = (
        demoGraphicRecord.ITLOCATI === null ? "" : demoGraphicRecord.ITLOCATI
      ) as string;
      newRecord.set("DISCHARGE_UNIT", location);
      newRecord.set("ADJSAMP", demoGraphicRecord.ADJSAMP);
      newRecord.set("TMG_GROUP", demoGraphicRecord.ITCLINIC);

      let facility = location === "0" ? "TMG" : location.slice(0, 3);
      newRecord.set("FACILITY", facility);

      const recordDate = demoGraphicRecord.RECDATE as string;
      const dateFormat = "M/d/yy";
      const date = DateTime.fromFormat(recordDate, dateFormat);
      record.set("RESPONSE_DATE", date.toFormat(dateFormat));
      record.set("RESPONSE_MONTH", date.month);

      return newRecord;
    })
  );

  listener.use(generateSummaryAction);
}
