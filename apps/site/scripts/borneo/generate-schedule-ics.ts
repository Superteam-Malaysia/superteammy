#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateScheduleIcs, SCHEDULE_ICS_FILENAME } from "../../src/borneo/lib/calendar/schedule-ics";

const outPath = join(process.cwd(), "public", "borneo", SCHEDULE_ICS_FILENAME);
writeFileSync(outPath, generateScheduleIcs(), "utf8");
console.log(`Wrote ${outPath}`);
