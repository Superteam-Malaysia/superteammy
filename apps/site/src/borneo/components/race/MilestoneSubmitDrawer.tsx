"use client";

import Link from "@borneo/components/Link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MILESTONE_SUBMIT_TASKS, type RaceTask } from "@borneo/data/race-tasks";
import { raceMilestoneImage } from "@borneo/data/race-milestone-images";
import { CtaButton } from "@borneo/components/ui";
import { withBasePath } from "@borneo/lib/base-path";
import { raceTeamLabel } from "@borneo/lib/race/group-label";
import type {
  PublicRaceSubmission,
  RaceFeedItem,
} from "@borneo/lib/race/submissions";
import type { ParticipantRaceGroup } from "@borneo/lib/race/group-types";
import { RaceGroupPanel } from "./RaceGroupPanel";

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
  initialSubmissions: PublicRaceSubmission[];
  initialGroup: ParticipantRaceGroup | null;
  cutoffPassed: boolean;
  onSubmitted: (item: RaceFeedItem) => void;
  onGroupChange?: (group: ParticipantRaceGroup) => void;
};

export function MilestoneSubmitDrawer({
  open,
  onClose,
  participantName,
  initialSubmissions,
  initialGroup,
  cutoffPassed,
  onSubmitted,
  onGroupChange,
}: MilestoneSubmitDrawerProps) {
  const [submissions, setSubmissions] = useState<PublicRaceSubmission[]>(initialSubmissions);
  const [groupNumber, setGroupNumber] = useState<number | null>(initialGroup?.groupNumber ?? null);
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

  const selectedTask = MILESTONE_SUBMIT_TASKS.find((task) => task.id === selectedTaskId) ?? null;
  const selectedTaskImage = selectedTask ? raceMilestoneImage(selectedTask.id) : null;
  const completedCount = submissions.length;
  const totalCount = MILESTONE_SUBMIT_TASKS.length;

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
    setGroupNumber(initialGroup?.groupNumber ?? null);
  }, [initialSubmissions, initialGroup]);

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
        groupNumber,
        groupLabel:
          groupNumber != null
            ? raceTeamLabel(
                initialGroup?.leaderName ??
                  (initialGroup?.isLeader ? participantName : null),
              )
            : null,
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

        <RaceGroupPanel
          isSignedIn
          initialGroup={initialGroup}
          variant="drawer"
          onGroupChange={(group) => {
            setGroupNumber(group.groupNumber);
            onGroupChange?.(group);
          }}
        />

        <p className="race-drawer__team-note">
          Submitting as <strong>{participantName}</strong>
        </p>

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

            <div className="race-drawer__scroll">
              <ul className="race-drawer__milestones list-none">
                {MILESTONE_SUBMIT_TASKS.map((task) => {
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
                            unoptimized
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
            </div>
          </>
        ) : selectedTask ? (
          <div className="race-drawer__scroll">
          <div className="race-drawer__link-step">
            {selectedTaskImage ? (
              <div
                className={[
                  "race-drawer__link-hero",
                  selectedTask.id === "race-onboard-user" ? "race-drawer__link-hero--logo" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Image
                  src={selectedTaskImage}
                  alt=""
                  width={880}
                  height={550}
                  unoptimized
                  className="race-drawer__link-hero-image"
                  sizes="(max-width: 550px) 100vw, 550px"
                  priority
                />
              </div>
            ) : null}
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
    initialSubmissions: PublicRaceSubmission[];
    initialGroup: ParticipantRaceGroup | null;
    cutoffPassed: boolean;
  } | null;
  onSubmitted: (item: RaceFeedItem) => void;
  onGroupChange?: (group: ParticipantRaceGroup) => void;
};

export function MilestoneSubmitGate({
  isSignedIn,
  open,
  onClose,
  submission,
  onSubmitted,
  onGroupChange,
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
      initialSubmissions={submission.initialSubmissions}
      initialGroup={submission.initialGroup}
      cutoffPassed={submission.cutoffPassed}
      onSubmitted={onSubmitted}
      onGroupChange={onGroupChange}
    />
  );
}
