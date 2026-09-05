"use client";

import Link from "@borneo/components/Link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { RACE_TASKS } from "@borneo/data/race-tasks";
import { raceMilestoneImage } from "@borneo/data/race-milestone-images";
import { CtaButton } from "@borneo/components/ui";
import { withBasePath } from "@borneo/lib/base-path";
import type {
  ParticipantTeamOption,
  PublicRaceSubmission,
  RaceFeedItem,
} from "@borneo/lib/race/submissions";
import type { RaceTask } from "@borneo/data/race-tasks";

function formatTaskPoints(task: RaceTask): string {
  if (task.pointsNote) return task.pointsNote;
  if (task.pointsMax && task.pointsMax !== task.pointsBase) {
    return `${task.pointsBase}–${task.pointsMax} points`;
  }
  if (task.pointsBase === 0) return "Content award — no race points";
  return `${task.pointsBase} points`;
}

type MilestoneSubmitDrawerProps = {
  open: boolean;
  onClose: () => void;
  participantName: string;
  teams: ParticipantTeamOption[];
  tagTeamSlug: string | null;
  initialSubmissions: PublicRaceSubmission[];
  cutoffPassed: boolean;
  onSubmitted: (item: RaceFeedItem) => void;
};

export function MilestoneSubmitDrawer({
  open,
  onClose,
  participantName,
  teams,
  tagTeamSlug,
  initialSubmissions,
  cutoffPassed,
  onSubmitted,
}: MilestoneSubmitDrawerProps) {
  const [submissions, setSubmissions] = useState<PublicRaceSubmission[]>(initialSubmissions);
  const [teamSlug, setTeamSlug] = useState<string>(tagTeamSlug ?? teams[0]?.slug ?? "");
  const [step, setStep] = useState<"pick" | "link">("pick");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [threadUrl, setThreadUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submissionByTask = useMemo(() => {
    const map = new Map<string, PublicRaceSubmission>();
    for (const row of submissions) map.set(row.taskId, row);
    return map;
  }, [submissions]);

  const selectedTask = RACE_TASKS.find((task) => task.id === selectedTaskId) ?? null;
  const completedCount = submissions.length;
  const totalCount = RACE_TASKS.length;
  const taggedTeam = teamSlug
    ? (teams.find((team) => team.slug === teamSlug) ?? null)
    : null;

  useEffect(() => {
    if (!open) {
      setStep("pick");
      setSelectedTaskId(null);
      setThreadUrl("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    setSubmissions(initialSubmissions);
    setTeamSlug(tagTeamSlug ?? teams[0]?.slug ?? "");
  }, [initialSubmissions, tagTeamSlug, teams]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function pickTask(taskId: string) {
    const saved = submissionByTask.get(taskId);
    setSelectedTaskId(taskId);
    setThreadUrl(saved?.threadUrl ?? "");
    setStep("link");
    setError(null);
  }

  function backToPick() {
    setStep("pick");
    setSelectedTaskId(null);
    setThreadUrl("");
    setError(null);
  }

  async function submitLink() {
    if (!selectedTaskId || cutoffPassed) return;
    if (!threadUrl.trim()) {
      setError("Paste your X post link first.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch(withBasePath("/api/race/submissions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: selectedTaskId,
        threadUrl,
        teamSlug: taggedTeam?.slug ?? null,
      }),
    });
    const data = (await res.json()) as {
      error?: string;
      submission?: { id: string; taskId: string; threadUrl: string; submittedAt: string };
    };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save submission.");
      return;
    }

    if (data.submission && selectedTask) {
      const next: RaceFeedItem = {
        id: data.submission.id,
        taskId: data.submission.taskId,
        threadUrl: data.submission.threadUrl,
        submittedAt: data.submission.submittedAt,
        taskTitle: selectedTask.title,
        taskNumber: selectedTask.number,
        submitterId: "self",
        submitterName: participantName,
        teamSlug: taggedTeam?.slug ?? null,
        teamName: taggedTeam?.name ?? null,
      };
      setSubmissions((prev) => {
        const rest = prev.filter((row) => row.taskId !== selectedTaskId);
        return [
          {
            id: next.id,
            taskId: next.taskId,
            threadUrl: next.threadUrl,
            submittedAt: next.submittedAt,
            taskTitle: next.taskTitle,
            taskNumber: next.taskNumber,
          },
          ...rest,
        ];
      });
      onSubmitted(next);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="race-drawer" role="presentation" onClick={onClose}>
      <div
        className="race-drawer__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="race-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="race-drawer__handle" aria-hidden />

        <header className="race-drawer__header">
          {step === "link" ? (
            <button type="button" className="race-drawer__back" onClick={backToPick}>
              ← Milestones
            </button>
          ) : (
            <p id="race-drawer-title" className="race-drawer__title">
              Milestones
            </p>
          )}
          <button type="button" className="race-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="race-drawer__team-note">
          Submitting as <strong>{participantName}</strong>
        </p>

        {teams.length > 1 ? (
          <label className="race-drawer__team-field">
            <span className="race-drawer__team-label">Team tag (optional)</span>
            <select
              className="team-form__select"
              value={teamSlug}
              onChange={(e) => setTeamSlug(e.target.value)}
            >
              <option value="">No team tag</option>
              {teams.map((team) => (
                <option key={team.slug} value={team.slug}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        ) : teams.length === 1 ? (
          <p className="race-drawer__team-note">
            Team tag: <strong>{teams[0].name}</strong>
          </p>
        ) : null}

        {step === "pick" ? (
          <>
            <div className="race-drawer__progress">
              <p className="race-drawer__progress-label">
                {completedCount} of {totalCount} completed by you
              </p>
              <div className="race-drawer__progress-bar" aria-hidden>
                <span
                  className="race-drawer__progress-fill"
                  style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <p className="race-drawer__hint">
              Pick a milestone, then paste your X link — one post per person per milestone.
            </p>

            <ul className="race-drawer__milestones list-none">
              {RACE_TASKS.map((task) => {
                const saved = submissionByTask.has(task.id);
                const imageSrc = raceMilestoneImage(task.id);
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      className="race-drawer__milestone"
                      disabled={cutoffPassed}
                      onClick={() => pickTask(task.id)}
                    >
                      <span className="race-drawer__milestone-num">#{task.number}</span>
                      {imageSrc ? (
                        <span
                          className={[
                            "race-drawer__milestone-thumb",
                            task.id === "race-onboard-user" ? "race-drawer__milestone-thumb--logo" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Image
                            src={imageSrc}
                            alt=""
                            width={96}
                            height={96}
                            className="race-drawer__milestone-image"
                            sizes="3.5rem"
                          />
                        </span>
                      ) : null}
                      <span className="race-drawer__milestone-body">
                        <span className="race-drawer__milestone-title">{task.title}</span>
                        <span className="race-drawer__milestone-desc">{task.shortDescription}</span>
                      </span>
                      <span className="race-drawer__milestone-action" aria-hidden>
                        {saved ? "✓" : "+"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : selectedTask ? (
          <div className="race-drawer__link-step">
            <p className="race-drawer__link-title">{selectedTask.title}</p>
            <p className="race-drawer__link-points">{formatTaskPoints(selectedTask)}</p>
            <ul className="race-drawer__link-details">
              {selectedTask.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            {selectedTask.location ? (
              <p className="race-drawer__link-meta">{selectedTask.location}</p>
            ) : null}
            {selectedTask.deadline ? (
              <p className="race-drawer__link-meta">Due {selectedTask.deadline}</p>
            ) : null}

            {cutoffPassed ? (
              <p className="team-form__error">Submissions are closed — cutoff has passed.</p>
            ) : null}
            {error ? <p className="team-form__error">{error}</p> : null}

            <label className="team-form__field">
              <span className="team-form__label">X post link</span>
              <input
                type="url"
                className="team-form__input"
                placeholder="https://x.com/you/status/…"
                value={threadUrl}
                disabled={cutoffPassed}
                onChange={(e) => setThreadUrl(e.target.value)}
                autoFocus
              />
            </label>

            <CtaButton
              variant="byte"
              size="md"
              showArrow={false}
              className="race-drawer__submit"
              disabled={cutoffPassed || saving}
              onClick={() => void submitLink()}
            >
              {saving ? "Posting…" : submissionByTask.has(selectedTask.id) ? "Update feed post" : "Add to feed"}
            </CtaButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MilestoneSubmitGateProps = {
  isSignedIn: boolean;
  open: boolean;
  onClose: () => void;
  submission: {
    participantName: string;
    teams: ParticipantTeamOption[];
    tagTeamSlug: string | null;
    initialSubmissions: PublicRaceSubmission[];
    cutoffPassed: boolean;
  } | null;
  onSubmitted: (item: RaceFeedItem) => void;
};

export function MilestoneSubmitGate({
  isSignedIn,
  open,
  onClose,
  submission,
  onSubmitted,
}: MilestoneSubmitGateProps) {
  if (!open) return null;

  if (!isSignedIn) {
    return (
      <div className="race-drawer" role="presentation" onClick={onClose}>
        <div className="race-drawer__sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="race-drawer__handle" aria-hidden />
          <header className="race-drawer__header">
            <p className="race-drawer__title">Sign in to submit</p>
            <button type="button" className="race-drawer__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>
          <p className="race-drawer__hint">
            Sign in with your registration email, pick a milestone, and paste your X link.
          </p>
          <CtaButton href="/login" variant="byte" size="md" showArrow={false}>
            Sign in
          </CtaButton>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <MilestoneSubmitDrawer
      open={open}
      onClose={onClose}
      participantName={submission.participantName}
      teams={submission.teams}
      tagTeamSlug={submission.tagTeamSlug}
      initialSubmissions={submission.initialSubmissions}
      cutoffPassed={submission.cutoffPassed}
      onSubmitted={onSubmitted}
    />
  );
}
