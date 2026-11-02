import React from 'react';
import {
  Hand, Calendar, Clock, RefreshCw, Check, TriangleAlert, Repeat,
  House, ListChecks, Plus, ShoppingCart, Heart, X,
} from 'lucide-react';
import './components.css';

/* person: 'a' = list owner (brick), 'b' = partner (petrol), null = nobody (up for grabs) */

export function Avatar({ initial, person, size = 32 }) {
  const kind = person === 'a' ? 'a' : person === 'b' ? 'b' : 'nobody';
  const fontSize = size >= 44 ? 18 : size >= 32 ? 14 : 11;
  return (
    <span
      className={`avatar avatar--${kind}`}
      style={{ width: size, height: size, fontSize }}
      aria-label={initial ? `Person ${initial}` : 'Nobody yet'}
    >
      {kind === 'nobody' ? '?' : initial}
    </span>
  );
}

export function AvatarPair({ people, size = 44 }) {
  return (
    <span className="avatar-pair">
      {people.map((p) => <Avatar key={p.initial} {...p} size={size} />)}
    </span>
  );
}

const STATUS = {
  open:        { icon: Hand,          label: 'Up for grabs' },
  planned:     { icon: Calendar,      label: 'Planned' },
  waiting:     { icon: Clock,         label: 'Waiting' },
  rescheduled: { icon: RefreshCw,     label: 'New time' },
  done:        { icon: Check,         label: 'Done' },
  clash:       { icon: TriangleAlert, label: 'Clash' },
  repeats:     { icon: Repeat,        label: 'Every week' },
};

export function StatusChip({ status, label }) {
  const s = STATUS[status] ?? STATUS.planned;
  const Icon = s.icon;
  return (
    <span className={`chip chip--${status} t-chip`}>
      <Icon size={12} strokeWidth={2.25} aria-hidden="true" />
      {label ?? s.label}
    </span>
  );
}

export function Button({ variant = 'primary', block = false, small = false, className = '', children, ...rest }) {
  const cls = ['btn', `btn--${variant}`, block && 'btn--block', small && 'btn--small', 't-button', className]
    .filter(Boolean).join(' ');
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

/**
 * One task as a card.
 * - person 'a' | 'b' shows the avatar; null shows a "Take it" button (up for grabs).
 * - onToggle is called when the check circle is tapped (not available for open tasks).
 */
export function TaskCard({ title, meta, status = 'planned', person, initial, done = false, onToggle, onTake }) {
  const kind = person === 'a' ? 'a' : person === 'b' ? 'b' : 'open';
  return (
    <article className={`task-card task-card--${kind} ${done ? 'task-card--done' : ''}`}>
      <button
        type="button"
        className="task-card__check"
        aria-pressed={done}
        aria-label={done ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
        onClick={kind === 'open' ? undefined : onToggle}
        disabled={kind === 'open'}
      >
        {done && <Check size={16} strokeWidth={3} aria-hidden="true" />}
      </button>
      <div className="task-card__body">
        <p className="task-card__title t-task-title">{title}</p>
        <div className="task-card__meta">
          <StatusChip status={done ? 'done' : status} />
          {meta && <span className="t-meta">{meta}</span>}
        </div>
      </div>
      {kind === 'open'
        ? <Button variant="soft" small onClick={onTake}>Take it</Button>
        : <Avatar initial={initial} person={person} size={32} />}
    </article>
  );
}

export function SectionHeader({ title, count, right }) {
  return (
    <div className="section-header">
      <h2 className="t-section-title">{title}</h2>
      {right ?? (count != null && <span className="section-header__count t-chip">{count}</span>)}
    </div>
  );
}

const TABS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
  { id: 'us', label: 'Us', icon: Heart },
];

/** The + opens the add form for the current tab (task, or grocery on Groceries). */
export function TabBar({ active, onNavigate, onAdd }) {
  const item = (t) => {
    const Icon = t.icon;
    const on = t.id === active;
    return (
      <button key={t.id} type="button" className="tab-bar__item" aria-current={on ? 'page' : undefined} onClick={() => onNavigate?.(t.id)}>
        <Icon size={24} strokeWidth={2} aria-hidden="true" />
        <span className="t-tab">{t.label}</span>
        {on && <span className="tab-bar__dot" aria-hidden="true" />}
      </button>
    );
  };
  return (
    <nav className="tab-bar" aria-label="Main">
      {item(TABS[0])}
      {item(TABS[1])}
      <button type="button" className="tab-bar__add" aria-label={active === 'groceries' ? 'Add a grocery' : 'Add a task'} onClick={() => onAdd?.(active)}>
        <Plus size={26} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {item(TABS[2])}
      {item(TABS[3])}
    </nav>
  );
}

export function Sheet({ title, onClose, children }) {
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__handle" aria-hidden="true" />
        <header className="sheet__header">
          <h2 className="t-section-title">{title}</h2>
          <button type="button" className="sheet__close" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
