import Image from "next/image";
import Link from "@borneo/components/Link";
import { SectionIntro } from "@borneo/components/ui";
import { DEMO_DAY_JUDGES, type Judge } from "@borneo/data/judges";
import { mentorDirectoryHref } from "@borneo/data/mentors";

function JudgeCard({ judge }: { judge: Judge }) {
  return (
    <li>
      <Link
        href={mentorDirectoryHref(judge.id)}
        className="judges-panel__card judges-panel__card--link"
      >
        <div className="judges-panel__photo">
          {judge.photo ? (
            <Image
              src={judge.photo}
              alt=""
              fill
              className="judges-panel__photo-image"
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          ) : null}
        </div>
        <h3 className="judges-panel__name">{judge.name}</h3>
        <p className="judges-panel__org">{judge.role}</p>
        <span className="judges-panel__cta">View mentor profile</span>
      </Link>
    </li>
  );
}

/** Summit Serbia–style judges grid — square photo, name + org below. */
export function JudgesPanel() {
  return (
    <section className="judges-panel" aria-labelledby="judges-heading">
      <div className="judges-panel__inner">
        <div id="judges-heading" className="judges-panel__title">
          <SectionIntro title="Judges" accent="byte" />
        </div>
        <ul className="judges-panel__grid list-none">
          {DEMO_DAY_JUDGES.map((judge) => (
            <JudgeCard key={judge.id} judge={judge} />
          ))}
        </ul>
      </div>
    </section>
  );
}
