'use client';

import {
  CATEGORIES, SKILLS, MATERIALS, INDOOR_OUTDOOR, ENERGY_LEVELS,
  DIFFICULTIES, WEATHER_TAGS, ACTIVITY_STATUS,
} from '@/lib/enums';
import type { ActivityInput } from '@/lib/activitySchema';
import { saveActivity, deleteActivity } from '@/app/actions';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="ml-2 text-xs text-ink-faint">{hint}</span> : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const input = 'w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-primary';

function CheckGroup({
  name, options, selected,
}: {
  name: string;
  options: readonly string[];
  selected: string[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <label
            key={o}
            className={`cursor-pointer rounded-pill border px-3 py-1 text-sm capitalize ${
              on ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-soft'
            }`}
          >
            <input type="checkbox" name={name} value={o} defaultChecked={on} className="hidden" />
            {o.replace('_', ' ')}
          </label>
        );
      })}
    </div>
  );
}

export function ActivityForm({
  initial, mode,
}: {
  initial: ActivityInput | null;
  mode: 'create' | 'edit';
}) {
  const v = initial;

  return (
    <form action={saveActivity} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ID" hint="lowercase-dashes, permanent">
          <input
            name="id"
            defaultValue={v?.id ?? ''}
            readOnly={mode === 'edit'}
            required
            className={`${input} ${mode === 'edit' ? 'bg-canvas text-ink-soft' : ''}`}
            placeholder="paper-bridge-challenge"
          />
        </Field>
        <Field label="Title">
          <input name="title" defaultValue={v?.title ?? ''} required className={input} />
        </Field>
      </div>

      <Field label="Story intro">
        <textarea name="storyIntro" defaultValue={v?.storyIntro ?? ''} required rows={3} className={input} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mission">
          <input name="mission" defaultValue={v?.mission ?? ''} required className={input} />
        </Field>
        <Field label="Objective">
          <input name="objective" defaultValue={v?.objective ?? ''} required className={input} />
        </Field>
      </div>

      <Field label="Steps" hint="one per line">
        <textarea name="steps" defaultValue={(v?.steps ?? []).join('\n')} required rows={5} className={input} />
      </Field>

      <Field label="Safety tips" hint="one per line, optional">
        <textarea name="safetyTips" defaultValue={(v?.safetyTips ?? []).join('\n')} rows={3} className={input} />
      </Field>

      <Field label="Learning explanation">
        <textarea name="learningExplanation" defaultValue={v?.learningExplanation ?? ''} required rows={3} className={input} />
      </Field>

      <Field label="Reflection questions" hint="one per line">
        <textarea
          name="reflectionQuestions"
          defaultValue={(v?.reflectionQuestions ?? []).join('\n')}
          required
          rows={3}
          className={input}
        />
      </Field>

      <Field label="Parent tip" hint="optional">
        <input name="parentTip" defaultValue={v?.parentTip ?? ''} className={input} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select name="category" defaultValue={v?.category ?? CATEGORIES[0]} className={input}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Indoor / outdoor">
          <select name="indoorOutdoor" defaultValue={v?.indoorOutdoor ?? 'either'} className={input}>
            {INDOOR_OUTDOOR.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Energy level">
          <select name="energyLevel" defaultValue={v?.energyLevel ?? 'medium'} className={input}>
            {ENERGY_LEVELS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Difficulty">
          <select name="difficulty" defaultValue={v?.difficulty ?? 'medium'} className={input}>
            {DIFFICULTIES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Min age"><input type="number" name="minAge" defaultValue={v?.minAge ?? 4} required className={input} /></Field>
        <Field label="Max age"><input type="number" name="maxAge" defaultValue={v?.maxAge ?? 8} required className={input} /></Field>
        <Field label="Min time (min)"><input type="number" name="minTime" defaultValue={v?.minTime ?? 15} required className={input} /></Field>
        <Field label="Max time (min)"><input type="number" name="maxTime" defaultValue={v?.maxTime ?? 30} required className={input} /></Field>
      </div>

      <Field label="Skills"><CheckGroup name="skills" options={SKILLS} selected={v?.skills ?? []} /></Field>
      <Field label="Materials required"><CheckGroup name="materialsRequired" options={MATERIALS} selected={v?.materialsRequired ?? []} /></Field>
      <Field label="Weather tags"><CheckGroup name="weatherTags" options={WEATHER_TAGS} selected={v?.weatherTags ?? ['any']} /></Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select name="status" defaultValue={v?.status ?? 'approved'} className={input}>
            {ACTIVITY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Premium pack" hint="optional, e.g. space">
          <input name="premiumPack" defaultValue={v?.premiumPack ?? ''} className={input} />
        </Field>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-5">
        <button className="rounded-pill bg-primary px-6 py-2 font-semibold text-white hover:opacity-90">
          {mode === 'edit' ? 'Save changes' : 'Create activity'}
        </button>
        {mode === 'edit' && v ? (
          <button
            formAction={deleteActivity}
            name="id"
            value={v.id}
            formNoValidate
            className="rounded-pill border border-line px-4 py-2 text-sm font-medium text-bad hover:bg-bad/5"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
