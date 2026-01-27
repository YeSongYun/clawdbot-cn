import { html, nothing } from "lit";

import { formatMs } from "../format";
import { t } from "../../i18n/index.js";
import {
  formatCronPayload,
  formatCronSchedule,
  formatCronState,
  formatNextRun,
} from "../presenter";
import type { ChannelUiMetaEntry, CronJob, CronRunLogEntry, CronStatus } from "../types";
import type { CronFormState } from "../ui-types";

export type CronProps = {
  loading: boolean;
  status: CronStatus | null;
  jobs: CronJob[];
  error: string | null;
  busy: boolean;
  form: CronFormState;
  channels: string[];
  channelLabels?: Record<string, string>;
  channelMeta?: ChannelUiMetaEntry[];
  runsJobId: string | null;
  runs: CronRunLogEntry[];
  onFormChange: (patch: Partial<CronFormState>) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onToggle: (job: CronJob, enabled: boolean) => void;
  onRun: (job: CronJob) => void;
  onRemove: (job: CronJob) => void;
  onLoadRuns: (jobId: string) => void;
};

function buildChannelOptions(props: CronProps): string[] {
  const options = ["last", ...props.channels.filter(Boolean)];
  const current = props.form.channel?.trim();
  if (current && !options.includes(current)) {
    options.push(current);
  }
  const seen = new Set<string>();
  return options.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function resolveChannelLabel(props: CronProps, channel: string): string {
  if (channel === "last") return "last";
  const meta = props.channelMeta?.find((entry) => entry.id === channel);
  if (meta?.label) return meta.label;
  return props.channelLabels?.[channel] ?? channel;
}

export function renderCron(props: CronProps) {
  const channelOptions = buildChannelOptions(props);
  return html`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">${t("cron.scheduler", "Scheduler")}</div>
        <div class="card-sub">${t("cron.scheduler.sub", "Gateway-owned cron scheduler status.")}</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">${t("cron.enabledLabel", "Enabled")}</div>
            <div class="stat-value">
              ${props.status
                ? props.status.enabled
                  ? t("common.yes", "Yes")
                  : t("common.no", "No")
                : "n/a"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">${t("cron.jobs", "Jobs")}</div>
            <div class="stat-value">${props.status?.jobs ?? "n/a"}</div>
          </div>
          <div class="stat">
            <div class="stat-label">${t("cron.nextWake", "Next wake")}</div>
            <div class="stat-value">${formatNextRun(props.status?.nextWakeAtMs ?? null)}</div>
          </div>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn" ?disabled=${props.loading} @click=${props.onRefresh}>
            ${props.loading ? t("cron.refreshing", "Refreshing…") : t("common.refresh", "Refresh")}
          </button>
          ${props.error ? html`<span class="muted">${props.error}</span>` : nothing}
        </div>
      </div>

      <div class="card">
        <div class="card-title">${t("cron.newJob", "New Job")}</div>
        <div class="card-sub">${t("cron.newJob.sub", "Create a scheduled wakeup or agent run.")}</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>${t("cron.name", "Name")}</span>
            <input
              .value=${props.form.name}
              @input=${(e: Event) =>
                props.onFormChange({ name: (e.target as HTMLInputElement).value })}
            />
          </label>
          <label class="field">
            <span>${t("cron.description", "Description")}</span>
            <input
              .value=${props.form.description}
              @input=${(e: Event) =>
                props.onFormChange({ description: (e.target as HTMLInputElement).value })}
            />
          </label>
          <label class="field">
            <span>${t("cron.agentId", "Agent ID")}</span>
            <input
              .value=${props.form.agentId}
              @input=${(e: Event) =>
                props.onFormChange({ agentId: (e.target as HTMLInputElement).value })}
              placeholder="default"
            />
          </label>
          <label class="field checkbox">
            <span>${t("cron.enabledLabel", "Enabled")}</span>
            <input
              type="checkbox"
              .checked=${props.form.enabled}
              @change=${(e: Event) =>
                props.onFormChange({ enabled: (e.target as HTMLInputElement).checked })}
            />
          </label>
          <label class="field">
            <span>${t("cron.schedule", "Schedule")}</span>
            <select
              .value=${props.form.scheduleKind}
              @change=${(e: Event) =>
                props.onFormChange({
                  scheduleKind: (e.target as HTMLSelectElement).value as CronFormState["scheduleKind"],
                })}
            >
              <option value="every">Every</option>
              <option value="at">At</option>
              <option value="cron">Cron</option>
            </select>
          </label>
        </div>
        ${renderScheduleFields(props)}
        <div class="form-grid" style="margin-top: 12px;">
          <label class="field">
            <span>${t("cron.session", "Session")}</span>
            <select
              .value=${props.form.sessionTarget}
              @change=${(e: Event) =>
                props.onFormChange({
                  sessionTarget: (e.target as HTMLSelectElement).value as CronFormState["sessionTarget"],
                })}
            >
              <option value="main">Main</option>
              <option value="isolated">Isolated</option>
            </select>
          </label>
          <label class="field">
            <span>${t("cron.wakeMode", "Wake mode")}</span>
            <select
              .value=${props.form.wakeMode}
              @change=${(e: Event) =>
                props.onFormChange({
                  wakeMode: (e.target as HTMLSelectElement).value as CronFormState["wakeMode"],
                })}
            >
              <option value="next-heartbeat">Next heartbeat</option>
              <option value="now">Now</option>
            </select>
          </label>
          <label class="field">
            <span>${t("cron.payload", "Payload")}</span>
            <select
              .value=${props.form.payloadKind}
              @change=${(e: Event) =>
                props.onFormChange({
                  payloadKind: (e.target as HTMLSelectElement).value as CronFormState["payloadKind"],
                })}
            >
              <option value="systemEvent">System event</option>
              <option value="agentTurn">Agent turn</option>
            </select>
          </label>
        </div>
        <label class="field" style="margin-top: 12px;">
          <span>${props.form.payloadKind === "systemEvent" ? t("cron.systemText", "System text") : t("cron.agentMessage", "Agent message")}</span>
          <textarea
            .value=${props.form.payloadText}
            @input=${(e: Event) =>
              props.onFormChange({
                payloadText: (e.target as HTMLTextAreaElement).value,
              })}
            rows="4"
          ></textarea>
        </label>
	          ${props.form.payloadKind === "agentTurn"
	          ? html`
	              <div class="form-grid" style="margin-top: 12px;">
                <label class="field checkbox">
                  <span>${t("cron.deliver", "Deliver")}</span>
                  <input
                    type="checkbox"
                    .checked=${props.form.deliver}
                    @change=${(e: Event) =>
                      props.onFormChange({
                        deliver: (e.target as HTMLInputElement).checked,
                      })}
                  />
	                </label>
	                <label class="field">
	                  <span>${t("cron.channel", "Channel")}</span>
	                  <select
	                    .value=${props.form.channel || "last"}
	                    @change=${(e: Event) =>
	                      props.onFormChange({
	                        channel: (e.target as HTMLSelectElement).value as CronFormState["channel"],
	                      })}
	                  >
	                    ${channelOptions.map(
                        (channel) =>
                          html`<option value=${channel}>
                            ${resolveChannelLabel(props, channel)}
                          </option>`,
                      )}
                  </select>
                </label>
                <label class="field">
                  <span>${t("cron.to", "To")}</span>
                  <input
                    .value=${props.form.to}
                    @input=${(e: Event) =>
                      props.onFormChange({ to: (e.target as HTMLInputElement).value })}
                    placeholder="+1555… or chat id"
                  />
                </label>
                <label class="field">
                  <span>${t("cron.timeout", "Timeout (seconds)")}</span>
                  <input
                    .value=${props.form.timeoutSeconds}
                    @input=${(e: Event) =>
                      props.onFormChange({
                        timeoutSeconds: (e.target as HTMLInputElement).value,
                      })}
                  />
                </label>
                ${props.form.sessionTarget === "isolated"
                  ? html`
                      <label class="field">
                        <span>${t("cron.postToMainPrefix", "Post to main prefix")}</span>
                        <input
                          .value=${props.form.postToMainPrefix}
                          @input=${(e: Event) =>
                            props.onFormChange({
                              postToMainPrefix: (e.target as HTMLInputElement).value,
                            })}
                        />
                      </label>
                    `
                  : nothing}
              </div>
            `
          : nothing}
        <div class="row" style="margin-top: 14px;">
          <button class="btn primary" ?disabled=${props.busy} @click=${props.onAdd}>
            ${props.busy ? t("cron.saving", "Saving…") : t("cron.addJob", "Add job")}
          </button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">${t("cron.jobs", "Jobs")}</div>
      <div class="card-sub">${t("cron.jobs.sub", "All scheduled jobs stored in the gateway.")}</div>
      ${props.jobs.length === 0
        ? html`<div class="muted" style="margin-top: 12px;">${t("cron.noJobs", "No jobs yet.")}</div>`
        : html`
            <div class="list" style="margin-top: 12px;">
              ${props.jobs.map((job) => renderJob(job, props))}
            </div>
          `}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">${t("cron.runHistory", "Run history")}</div>
      <div class="card-sub">Latest runs for ${props.runsJobId ?? "(select a job)"}.</div>
      ${props.runsJobId == null
        ? html`
            <div class="muted" style="margin-top: 12px;">
              ${t("cron.selectJob", "Select a job to inspect run history.")}
            </div>
          `
        : props.runs.length === 0
          ? html`<div class="muted" style="margin-top: 12px;">${t("cron.noRuns", "No runs yet.")}</div>`
          : html`
              <div class="list" style="margin-top: 12px;">
                ${props.runs.map((entry) => renderRun(entry))}
              </div>
            `}
    </section>
  `;
}

function renderScheduleFields(props: CronProps) {
  const form = props.form;
  if (form.scheduleKind === "at") {
    return html`
      <label class="field" style="margin-top: 12px;">
        <span>${t("cron.runAt", "Run at")}</span>
        <input
          type="datetime-local"
          .value=${form.scheduleAt}
          @input=${(e: Event) =>
            props.onFormChange({
              scheduleAt: (e.target as HTMLInputElement).value,
            })}
        />
      </label>
    `;
  }
  if (form.scheduleKind === "every") {
    return html`
      <div class="form-grid" style="margin-top: 12px;">
        <label class="field">
          <span>${t("cron.every", "Every")}</span>
          <input
            .value=${form.everyAmount}
            @input=${(e: Event) =>
              props.onFormChange({
                everyAmount: (e.target as HTMLInputElement).value,
              })}
          />
        </label>
        <label class="field">
          <span>${t("cron.unit", "Unit")}</span>
          <select
            .value=${form.everyUnit}
            @change=${(e: Event) =>
              props.onFormChange({
                everyUnit: (e.target as HTMLSelectElement).value as CronFormState["everyUnit"],
              })}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </label>
      </div>
    `;
  }
  return html`
    <div class="form-grid" style="margin-top: 12px;">
      <label class="field">
        <span>${t("cron.expression", "Expression")}</span>
        <input
          .value=${form.cronExpr}
          @input=${(e: Event) =>
            props.onFormChange({ cronExpr: (e.target as HTMLInputElement).value })}
        />
      </label>
      <label class="field">
        <span>${t("cron.timezone", "Timezone (optional)")}</span>
        <input
          .value=${form.cronTz}
          @input=${(e: Event) =>
            props.onFormChange({ cronTz: (e.target as HTMLInputElement).value })}
        />
      </label>
    </div>
  `;
}

function renderJob(job: CronJob, props: CronProps) {
  const isSelected = props.runsJobId === job.id;
  const itemClass = `list-item list-item-clickable${isSelected ? " list-item-selected" : ""}`;
  return html`
    <div class=${itemClass} @click=${() => props.onLoadRuns(job.id)}>
      <div class="list-main">
        <div class="list-title">${job.name}</div>
        <div class="list-sub">${formatCronSchedule(job)}</div>
        <div class="muted">${formatCronPayload(job)}</div>
        ${job.agentId ? html`<div class="muted">Agent: ${job.agentId}</div>` : nothing}
        <div class="chip-row" style="margin-top: 6px;">
          <span class="chip">${job.enabled ? "enabled" : "disabled"}</span>
          <span class="chip">${job.sessionTarget}</span>
          <span class="chip">${job.wakeMode}</span>
        </div>
      </div>
      <div class="list-meta">
        <div>${formatCronState(job)}</div>
        <div class="row" style="justify-content: flex-end; margin-top: 8px;">
          <button
            class="btn"
            ?disabled=${props.busy}
            @click=${(event: Event) => {
              event.stopPropagation();
              props.onToggle(job, !job.enabled);
            }}
          >
            ${job.enabled ? t("cron.disable", "Disable") : t("cron.enable", "Enable")}
          </button>
          <button
            class="btn"
            ?disabled=${props.busy}
            @click=${(event: Event) => {
              event.stopPropagation();
              props.onRun(job);
            }}
          >
            ${t("cron.run", "Run")}
          </button>
          <button
            class="btn"
            ?disabled=${props.busy}
            @click=${(event: Event) => {
              event.stopPropagation();
              props.onLoadRuns(job.id);
            }}
          >
            ${t("cron.runs", "Runs")}
          </button>
          <button
            class="btn danger"
            ?disabled=${props.busy}
            @click=${(event: Event) => {
              event.stopPropagation();
              props.onRemove(job);
            }}
          >
            ${t("cron.remove", "Remove")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRun(entry: CronRunLogEntry) {
  return html`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${entry.status}</div>
        <div class="list-sub">${entry.summary ?? ""}</div>
      </div>
      <div class="list-meta">
        <div>${formatMs(entry.ts)}</div>
        <div class="muted">${entry.durationMs ?? 0}ms</div>
        ${entry.error ? html`<div class="muted">${entry.error}</div>` : nothing}
      </div>
    </div>
  `;
}
