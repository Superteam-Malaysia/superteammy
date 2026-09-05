import { withBasePath } from "@borneo/lib/base-path";

/** Thumbnail for each Amazing Race milestone — local assets under public/borneo/race/milestones/. */
const RACE_MILESTONE_IMAGES: Record<string, string> = {
  "race-landed-in-kuching": withBasePath("/race/milestones/race-landed-in-kuching.jpg"),
  "race-bourdain": withBasePath("/race/milestones/race-bourdain.jpg"),
  "race-kek-lapis": withBasePath("/race/milestones/race-kek-lapis.jpg"),
  "race-sams-ice-cream": withBasePath("/race/milestones/race-sams-ice-cream.jpg"),
  "race-ceylonese-naan": withBasePath("/race/milestones/race-ceylonese-naan.jpg"),
  "race-cats": withBasePath("/race/milestones/race-cats.jpg"),
  "race-carpenter-street": withBasePath("/race/milestones/race-carpenter-street.jpg"),
  "race-old-court-house": withBasePath("/race/milestones/race-old-court-house.jpg"),
  "race-brookes-dockyard": withBasePath("/race/milestones/race-brookes-dockyard.jpg"),
  "race-traditional-attire": withBasePath("/race/milestones/race-traditional-attire.jpg"),
  "race-word-sign": withBasePath("/race/milestones/race-word-sign.jpg"),
  "race-sampan-ride": withBasePath("/race/milestones/race-sampan-ride.jpg"),
  "race-flagpole-lean": withBasePath("/race/milestones/race-flagpole-lean.jpg"),
  "race-flagpole-group": withBasePath("/race/milestones/race-flagpole-group.jpg"),
  "race-darul-hana-bridge": withBasePath("/race/milestones/race-darul-hana-bridge.jpg"),
  "race-onboard-user": withBasePath("/partners/redotpay.svg"),
  "race-photobooth": withBasePath("/race/milestones/race-photobooth.jpg"),
};

export function raceMilestoneImage(taskId: string): string | null {
  return RACE_MILESTONE_IMAGES[taskId] ?? null;
}
