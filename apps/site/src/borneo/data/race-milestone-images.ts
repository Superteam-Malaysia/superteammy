import { withBasePath } from "@borneo/lib/base-path";

/** Bump when milestone JPGs change — busts Next/image and CDN caches. */
const MILESTONE_ASSET_VERSION = "2";

function milestoneAsset(filename: string): string {
  return withBasePath(`/race/milestones/${filename}?v=${MILESTONE_ASSET_VERSION}`);
}

/** Thumbnail for each Amazing Race milestone — local assets under public/borneo/race/milestones/. */
const RACE_MILESTONE_IMAGES: Record<string, string> = {
  "race-landed-in-kuching": milestoneAsset("race-landed-in-kuching.jpg"),
  "content-first-impressions": milestoneAsset("race-landed-in-kuching.jpg"),
  "content-overall-impressions": withBasePath("/schedule/days/day-5-demo-day.jpg"),
  "race-bourdain": milestoneAsset("race-bourdain.jpg"),
  "race-kek-lapis": milestoneAsset("race-kek-lapis.jpg"),
  "race-sams-ice-cream": milestoneAsset("race-sams-ice-cream.jpg"),
  "race-ceylonese-naan": milestoneAsset("race-ceylonese-naan.jpg"),
  "race-cats": milestoneAsset("race-cats.jpg"),
  "race-carpenter-street": milestoneAsset("race-carpenter-street.jpg"),
  "race-old-court-house": milestoneAsset("race-old-court-house.jpg"),
  "race-brookes-dockyard": milestoneAsset("race-brookes-dockyard.jpg"),
  "race-traditional-attire": milestoneAsset("race-traditional-attire.jpg"),
  "race-word-sign": milestoneAsset("race-word-sign.jpg"),
  "race-sampan-ride": milestoneAsset("race-sampan-ride.jpg"),
  "race-flagpole-lean": milestoneAsset("race-flagpole-lean.jpg"),
  "race-flagpole-group": milestoneAsset("race-flagpole-group.jpg"),
  "race-darul-hana-bridge": milestoneAsset("race-darul-hana-bridge.jpg"),
  "race-onboard-user": withBasePath("/partners/redotpay.svg"),
  "race-photobooth": milestoneAsset("race-photobooth.jpg"),
};

export function raceMilestoneImage(taskId: string): string | null {
  return RACE_MILESTONE_IMAGES[taskId] ?? null;
}
