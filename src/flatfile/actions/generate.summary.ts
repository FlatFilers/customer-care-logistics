import api from "@flatfile/api";
import { RecordData, RecordsWithLinks } from "@flatfile/api/api";
import FlatfileListener from "@flatfile/listener";
import { jobHandler } from "@flatfile/plugin-job-handler";
import { DateTime } from "luxon";

interface SheetIds {
  readonly demographics: string;
  readonly surveyResponses: string;
  readonly currentUpload: string;
}

interface SummaryRow extends RecordData {
  readonly Hospital_code: { value: string };
  readonly Month: { value: string };
  readonly Year: { value: string };
  readonly FyMonth: { value: string };
  readonly FyYear: { value: string };
  readonly Unit: { value: string };
  readonly InpatientLTRTopBox: { value: string | null };
  readonly InpatientLTRSubmissions: { value: string | null };
  readonly "InpatientLTRTopBox%": { value: string | null };
}

type ResponseCount = Record<string, number>;
type QuestionResponses = Record<string, ResponseCount>;
type MonthResponses = Record<string, QuestionResponses>;
type ResponseTree = Map<string, MonthResponses>;

class SurveySummaryGenerator {
  private readonly responseTree: ResponseTree = new Map();
  private static readonly FISCAL_YEAR = 2025; // TODO: Make this configurable
  private surveyQuestion: string;
  private topBox: string;
  private hospitalCode: string;
  constructor(surveyRecords: RecordsWithLinks, hospitalCode: string, surveyId: string, topBox: string) {
    this.buildResponseTree(surveyRecords);
    this.surveyQuestion = surveyId;
    this.topBox = topBox;
    this.hospitalCode = hospitalCode;
  }

  private buildResponseTree(records: RecordsWithLinks): void {
    records.forEach((record) => {
      const date = DateTime.fromFormat(record.values.RESPONSE_DATE.value as string, "M/d/yy");
      const yrMonth = `${date.year}-${date.month}`;
      const varName = record.values.VAR_NAME.value as string;
      const dischargeUnit = record.values.DISCHARGE_UNIT.value as string;
      const response = record.values.RESPONSE.value as string;

      if (!this.responseTree.has(dischargeUnit)) {
        this.responseTree.set(dischargeUnit, {});
      }
      const unitObj = this.responseTree.get(dischargeUnit)!;
      if (!unitObj[yrMonth]) {
        unitObj[yrMonth] = {};
      }
      if (!unitObj[yrMonth][varName]) {
        unitObj[yrMonth][varName] = {};
      }
      const varObj = unitObj[yrMonth][varName];
      varObj[response] = (varObj[response] || 0) + 1;
    });
  }

  public generateSummaryRows(): SummaryRow[] {
    const summaryRows: SummaryRow[] = [];

    for (const [dischargeUnit, resultsForMonth] of this.responseTree) {
      for (let fyMonth = 1; fyMonth <= 12; fyMonth++) {
        const { regMonth, regYear } = this.calculateRegularDate(fyMonth);
        const monthKey = `${regYear}-${regMonth}`;

        summaryRows.push(this.createSummaryRow(dischargeUnit, fyMonth, regMonth, regYear, resultsForMonth[monthKey]));
      }
    }

    return summaryRows;
  }

  private calculateRegularDate(fyMonth: number): { regMonth: number; regYear: number } {
    const regMonth = fyMonth > 6 ? fyMonth - 6 : fyMonth + 6;
    const regYear = fyMonth > 6 ? SurveySummaryGenerator.FISCAL_YEAR : SurveySummaryGenerator.FISCAL_YEAR - 1;
    return { regMonth, regYear };
  }

  private createSummaryRow(
    dischargeUnit: string,
    fyMonth: number,
    regMonth: number,
    regYear: number,
    monthData?: QuestionResponses,
  ): SummaryRow {
    if (!monthData) {
      return this.createEmptySummaryRow(dischargeUnit, fyMonth, regMonth, regYear);
    }

    const topBoxCount = monthData?.[this.surveyQuestion]?.[this.topBox] || 0;
    const totalResponses = Object.values(monthData?.[this.surveyQuestion] || {}).reduce((a, b) => a + b, 0);

    return {
      Hospital_code: { value: this.hospitalCode },
      Month: { value: regMonth.toString() },
      Year: { value: regYear.toString() },
      FyMonth: { value: fyMonth.toString() },
      FyYear: { value: SurveySummaryGenerator.FISCAL_YEAR.toString() },
      Unit: { value: dischargeUnit },
      InpatientLTRTopBox: { value: topBoxCount.toString() },
      InpatientLTRSubmissions: { value: totalResponses.toString() },
      "InpatientLTRTopBox%": { value: ((topBoxCount / totalResponses) * 100).toFixed(1) },
    };
  }

  private createEmptySummaryRow(dischargeUnit: string, fyMonth: number, regMonth: number, regYear: number): SummaryRow {
    return {
      Hospital_code: { value: this.hospitalCode },
      Month: { value: regMonth.toString() },
      Year: { value: regYear.toString() },
      FyMonth: { value: fyMonth.toString() },
      FyYear: { value: SurveySummaryGenerator.FISCAL_YEAR.toString() },
      Unit: { value: dischargeUnit },
      InpatientLTRTopBox: { value: null },
      InpatientLTRSubmissions: { value: null },
      "InpatientLTRTopBox%": { value: null },
    };
  }
}

export const generateSummaryAction = (listener: FlatfileListener) => {
  listener.use(
    jobHandler("workbook:generate-summary", async (event, tick) => {
      const { workbookId, jobId } = event.context;
      const {
        data: {
          input: { surveyId, topBox },
        },
      } = await api.jobs.get(jobId);

      const sheets = await api.sheets.list({ workbookId });

      tick(10, "Preparing to generate summary");
      const sheetIds: SheetIds = {
        demographics: sheets.data.find((wb) => wb.slug === "csv-demographics-export")?.id,
        surveyResponses: sheets.data.find((wb) => wb.slug === "csv-survey-responses-export")?.id,
        currentUpload: sheets.data.find((wb) => wb.slug === "current-upload")?.id,
      };

      // Fetch all records
      const PAGE_SIZE = 10000;
      const validRecordCount = (await api.sheets.get(sheetIds.surveyResponses)).data.recordCounts.valid;
      const pages = Math.ceil(validRecordCount / PAGE_SIZE);

      const pageTickSize = Math.floor(80 / pages);
      const allRecords: RecordsWithLinks = [];
      for (let i = 1; i <= pages; i++) {
        const responseRecords = await api.records.get(sheetIds.surveyResponses, {
          pageSize: PAGE_SIZE,
          pageNumber: i,
        });
        allRecords.push(...responseRecords.data.records);
        tick(10 + i * pageTickSize, "Analzying responses...");
      }

      tick(85, "Generating summary...");
      const generator = new SurveySummaryGenerator(allRecords, "T-CARR-GA", surveyId, topBox);
      const summaryRows = generator.generateSummaryRows();

      tick(90, "Uploading summary results...");
      // Insert the summary rows
      await api.records.insert(sheetIds.currentUpload, summaryRows);
    }),
  );
};
