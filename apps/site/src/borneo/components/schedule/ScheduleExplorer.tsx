"use client";

import { useMemo, useState } from "react";
import { SCHEDULE_DAYS } from "@borneo/data/schedule";
import { AddToCalendarButton } from "./AddToCalendarButton";
import { DayCalendar } from "./DayCalendar";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";

const LEGEND = [
  { label: "Program", className: "schedule-legend__swatch--wisp" },
  { label: "Workshop", className: "schedule-legend__swatch--azure" },
  { label: "Key moment", className: "schedule-legend__swatch--byte" },
  { label: "Deadline", className: "schedule-legend__swatch--deadline" },
];

export function ScheduleExplorer({ initialDay = 1 }: { initialDay?: number }) {
  const [dayIndex, setDayIndex] = useState(initialDay);
  const day = useMemo(
    () => SCHEDULE_DAYS.find((d) => d.index === dayIndex) ?? SCHEDULE_DAYS[0],
    [dayIndex],
  );

  return (
    <SectionArticle>
      <div className="schedule-explorer">
        <div className="schedule-explorer__main">
          <SectionIntro
            title={day.title}
            lead={`${day.subtitle}${day.venueNote ? ` · ${day.venueNote}` : ""}`}
          />

          <div className="schedule-explorer__calendar-mobile">
            <AddToCalendarButton />
          </div>

          <div className="schedule-sticky-tabs mt-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {SCHEDULE_DAYS.map((d) => (
                <button
                  key={d.index}
                  type="button"
                  className="schedule-day-tab"
                  data-active={d.index === dayIndex}
                  onClick={() => setDayIndex(d.index)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="schedule-legend mt-6" aria-label="Calendar legend">
            {LEGEND.map((item) => (
              <li key={item.label} className="schedule-legend__item">
                <span className={`schedule-legend__swatch ${item.className}`} />
                {item.label}
              </li>
            ))}
          </ul>

          <DayCalendar events={day.events} />
        </div>

        <aside className="schedule-explorer__aside" aria-label="Calendar actions">
          <AddToCalendarButton />
        </aside>
      </div>
    </SectionArticle>
  );
}
