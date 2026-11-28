import { CalendarClock } from "lucide-react";
import { formatDay, startOfToday } from "../../utilities/dates.js";
import "./ClashNotice.css";

// our decision after testing: a calm icon and colours instead of the ⚠ Clash
// chip, which felt like an error; still icon + words (NFR6)
export default function ClashNotice({ clash, who, partnerName }) {
  let whose = "to a planned task";
  if (who === "me") whose = "to one of your tasks";
  if (who === "partner") whose = `to one of ${partnerName}'s tasks`;

  const isToday = clash.day.getTime() === startOfToday().getTime();
  const day = isToday ? "today" : formatDay(clash.day);

  return (
    <p className="clash-notice t-meta">
      <CalendarClock
        className="clash-notice__icon"
        size={16}
        aria-hidden="true"
      />
      <span>
        <strong>Close in time</strong> {whose} · {clash.title} · {day}{" "}
        {clash.time}
      </span>
    </p>
  );
}
