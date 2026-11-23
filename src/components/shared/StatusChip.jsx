import {
  Calendar,
  Check,
  Clock,
  Hand,
  RefreshCw,
  Repeat,
  TriangleAlert,
} from "lucide-react";
import "./StatusChip.css";

// a status is always an icon and a label, never colour alone (NFR6)
const STATUSES = {
  open: { icon: Hand, label: "Up for grabs" },
  planned: { icon: Calendar, label: "Planned" },
  waiting: { icon: Clock, label: "Waiting" },
  rescheduled: { icon: RefreshCw, label: "New time" },
  done: { icon: Check, label: "Done" },
  clash: { icon: TriangleAlert, label: "Clash" },
  repeats: { icon: Repeat, label: "Every week" },
};

export default function StatusChip({ status }) {
  const { icon: Icon, label } = STATUSES[status];

  return (
    <span className={`status-chip status-chip--${status} t-chip`}>
      <Icon size={12} strokeWidth={2.25} aria-hidden="true" />
      {label}
    </span>
  );
}
