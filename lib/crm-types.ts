export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "offer_sent"
  | "sold"
  | "archived";

export type InquiryIntent = "inquire" | "buy_now" | "pay_in_4";

export type ArtwurkEventName =
  | "landing_page_view"
  | "session_started"
  | "return_visit"
  | "view_collection_click"
  | "gallery_view"
  | "artwork_card_hover"
  | "artwork_click"
  | "modal_open"
  | "modal_close"
  | "email_click"
  | "whatsapp_click"
  | "inquire_click"
  | "buy_now_click"
  | "pay_in_4_click"
  | "inquiry_submit";

export type ArtworkTrackingRecord = {
  id: string;
  displayId?: string;
  name: string;
  image?: string;
  price: string;
  dimensions: string;
  category?: string;
  status?: string;
};

export type TrackingContext = {
  visitorId: string;
  sessionId: string;
  deviceType: "mobile" | "tablet" | "desktop";
  pathname: string;
  referrer?: string;
  locale?: string;
  userAgent?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};

export type ArtwurkEventPayload = {
  id: string;
  type: "event";
  event: ArtwurkEventName;
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  artwork?: ArtworkTrackingRecord;
  context: TrackingContext;
  metadata?: Record<string, unknown>;
};

export type ArtwurkInquiryPayload = {
  id: string;
  type: "artwork_inquiry";
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  status: LeadStatus;
  intent: InquiryIntent;
  artwork: ArtworkTrackingRecord;
  inquiry: {
    channel: "form" | "email" | "whatsapp";
    destination?: string;
    preferredContact?: "email" | "whatsapp" | "phone";
    budgetRange?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  context: TrackingContext;
  metadata?: Record<string, unknown>;
};

export type ArtwurkLeadPayload = {
  id: string;
  type: "lead_capture";
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  status: LeadStatus;
  intent: InquiryIntent | "general";
  artwork?: ArtworkTrackingRecord;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    preferredContact?: "email" | "whatsapp" | "phone";
  };
  context: TrackingContext;
  metadata?: Record<string, unknown>;
};

export type ArtwurkCrmSnapshot = {
  events: ArtwurkEventPayload[];
  inquiries: ArtwurkInquiryPayload[];
  leads: ArtwurkLeadPayload[];
};

export type ArtwurkTrafficDay = {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  eventCount: number;
};

export type ArtwurkTrafficHour = {
  date: string;
  hour: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  eventCount: number;
};

export type ArtwurkTrafficSnapshot = {
  timezone: string;
  generatedAt: string;
  retainedSince?: string;
  totalUniqueVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  todayVisitors: number;
  todaySessions: number;
  daily: ArtwurkTrafficDay[];
  hourly: ArtwurkTrafficHour[];
};
