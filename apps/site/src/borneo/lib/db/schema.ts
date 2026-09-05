import {
  boolean,
  customType,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: unknown) {
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Uint8Array) return Buffer.from(value);
    throw new Error("Unexpected bytea value");
  },
  toDriver(value: Buffer) {
    return value;
  },
});
/** Organizer ops only — never expose in public APIs, feeds, or directory UI. */
export const raceTeams = pgTable("race_teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: text("guest_id").notNull().unique(),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").notNull().unique(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  lumaCreatedAt: timestamp("luma_created_at", { withTimezone: true }),
  approvalStatus: text("approval_status"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  merchReceivedAt: timestamp("merch_received_at", { withTimezone: true }),
  /** Organizer check-in only — not shown on the public site. */
  amazingRaceLeader: boolean("amazing_race_leader").notNull().default(false),
  /** Organizer check-in only — not shown on the public site. */
  raceTeamId: uuid("race_team_id").references(() => raceTeams.id, { onDelete: "set null" }),
  ticketTypeId: text("ticket_type_id"),
  ticketName: text("ticket_name"),
  passportFirstName: text("passport_first_name"),
  passportLastName: text("passport_last_name"),
  telegram: text("telegram"),
  /** `/uploads/…` path, external HTTPS URL, or null. */
  avatarUrl: text("avatar_url"),
  /** Linked Telegram user id after first successful login. */
  telegramUserId: text("telegram_user_id"),
  projectIdea: text("project_idea"),
  proofOfWork: text("proof_of_work"),
  teamSetup: text("team_setup"),
  commitmentProof: text("commitment_proof"),
  jerseySize: text("jersey_size"),
  ownAccommodation: text("own_accommodation"),
  /** Solana wallet — collected on the Meteora challenge page only. */
  solanaWallet: text("solana_wallet"),
  /** Full Luma export row for audit / future fields. */
  rawRegistration: jsonb("raw_registration").notNull().default({}),
  importedAt: timestamp("imported_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One-time magic link tokens for email login. */
export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailNormalized: text("email_normalized").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Pending login via t.me bot deep link (mobile-friendly). */
export const telegramLoginSessions = pgTable("telegram_login_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  startToken: text("start_token").notNull().unique(),
  finishToken: text("finish_token").unique(),
  participantId: uuid("participant_id").references(() => participants.id, {
    onDelete: "cascade",
  }),
  telegramUserId: text("telegram_user_id"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Hackathon team — Base ecosystem-style project directory entry. */
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  category: text("category"),
  /** `/uploads/…` path, external HTTPS URL, or null. */
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  proofUrl: text("proof_url"),
  createdBy: uuid("created_by").references(() => participants.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("team_members_team_participant_unique").on(table.teamId, table.participantId)],
);

/** Amazing Race thread URL — one per participant per task; team is an optional feed tag. */
export const raceSubmissions = pgTable(
  "race_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    taskId: text("task_id").notNull(),
    threadUrl: text("thread_url").notNull(),
    submittedBy: uuid("submitted_by")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("race_submissions_participant_task_unique").on(table.submittedBy, table.taskId),
  ],
);

/** Small profile/team images stored in Postgres (no bucket or volume). */
export const uploadedImages = pgTable("uploaded_images", {
  objectKey: text("object_key").primaryKey(),
  contentType: text("content_type").notNull(),
  data: bytea("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type RaceTeam = typeof raceTeams.$inferSelect;
export type NewRaceTeam = typeof raceTeams.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamMemberRole = "owner" | "editor" | "member";
export type RaceSubmission = typeof raceSubmissions.$inferSelect;
export type NewRaceSubmission = typeof raceSubmissions.$inferInsert;

/** RedotPay card quiz — one submission per participant per question. */
export const redotpayQuizSubmissions = pgTable(
  "redotpay_quiz_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answer: jsonb("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    quizDay: text("quiz_day").notNull(),
    wonDailyPrize: boolean("won_daily_prize").notNull().default(false),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("redotpay_quiz_submissions_participant_question_unique").on(
      table.participantId,
      table.questionId,
    ),
  ],
);

export type RedotPayQuizSubmission = typeof redotpayQuizSubmissions.$inferSelect;
export type NewRedotPayQuizSubmission = typeof redotpayQuizSubmissions.$inferInsert;
