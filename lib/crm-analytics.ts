import type {
  ArtwurkCrmSnapshot,
  ArtwurkTrafficHour,
  ArtwurkTrafficSnapshot,
  ArtwurkTrafficDay,
} from "./crm-types";

const DEFAULT_TIMEZONE = process.env.ARTWURK_CRM_TIMEZONE ?? "America/Los_Angeles";

const formatParts = (value: string, timeZone: string) => {
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";

  return {
    dayKey: `${year}-${month}-${day}`,
    hourKey: `${year}-${month}-${day} ${hour}:00`,
    hourLabel: `${hour}:00`,
  };
};

const sortByNewest = <T extends { date: string }>(items: T[]) =>
  [...items].sort((left, right) => right.date.localeCompare(left.date));

export const buildTrafficSnapshot = (
  snapshot: ArtwurkCrmSnapshot,
  timeZone = DEFAULT_TIMEZONE,
): ArtwurkTrafficSnapshot => {
  const dailyMap = new Map<
    string,
    {
      visitors: Set<string>;
      sessions: Set<string>;
      pageViews: number;
      eventCount: number;
    }
  >();

  const hourlyMap = new Map<
    string,
    {
      date: string;
      hour: string;
      visitors: Set<string>;
      sessions: Set<string>;
      pageViews: number;
      eventCount: number;
    }
  >();

  const allVisitors = new Set<string>();
  const allSessions = new Set<string>();

  snapshot.events.forEach((event) => {
    const visitorId = event.context?.visitorId;
    const sessionId = event.context?.sessionId;
    const { dayKey, hourKey, hourLabel } = formatParts(event.occurredAt, timeZone);

    if (visitorId) {
      allVisitors.add(visitorId);
    }

    if (sessionId) {
      allSessions.add(sessionId);
    }

    const dayEntry =
      dailyMap.get(dayKey) ??
      {
        visitors: new Set<string>(),
        sessions: new Set<string>(),
        pageViews: 0,
        eventCount: 0,
      };

    if (visitorId) {
      dayEntry.visitors.add(visitorId);
    }

    if (sessionId) {
      dayEntry.sessions.add(sessionId);
    }

    if (event.event === "landing_page_view" || event.event === "gallery_view") {
      dayEntry.pageViews += 1;
    }

    dayEntry.eventCount += 1;
    dailyMap.set(dayKey, dayEntry);

    const hourEntry =
      hourlyMap.get(hourKey) ??
      {
        date: dayKey,
        hour: hourLabel,
        visitors: new Set<string>(),
        sessions: new Set<string>(),
        pageViews: 0,
        eventCount: 0,
      };

    if (visitorId) {
      hourEntry.visitors.add(visitorId);
    }

    if (sessionId) {
      hourEntry.sessions.add(sessionId);
    }

    if (event.event === "landing_page_view" || event.event === "gallery_view") {
      hourEntry.pageViews += 1;
    }

    hourEntry.eventCount += 1;
    hourlyMap.set(hourKey, hourEntry);
  });

  const daily: ArtwurkTrafficDay[] = sortByNewest(
    Array.from(dailyMap.entries()).map(([date, entry]) => ({
      date,
      visitors: entry.visitors.size,
      sessions: entry.sessions.size,
      pageViews: entry.pageViews,
      eventCount: entry.eventCount,
    })),
  );

  const hourly: ArtwurkTrafficHour[] = Array.from(hourlyMap.entries())
    .map(([key, entry]) => ({
      date: key,
      hour: entry.hour,
      visitors: entry.visitors.size,
      sessions: entry.sessions.size,
      pageViews: entry.pageViews,
      eventCount: entry.eventCount,
    }))
    .sort((left, right) => right.date.localeCompare(left.date));

  const todayKey = daily[0]?.date;
  const todayEntry = todayKey ? daily.find((item) => item.date === todayKey) : undefined;

  return {
    timezone: timeZone,
    generatedAt: new Date().toISOString(),
    retainedSince: daily[daily.length - 1]?.date,
    totalUniqueVisitors: allVisitors.size,
    totalSessions: allSessions.size,
    totalPageViews: daily.reduce((sum, item) => sum + item.pageViews, 0),
    todayVisitors: todayEntry?.visitors ?? 0,
    todaySessions: todayEntry?.sessions ?? 0,
    daily,
    hourly,
  };
};
