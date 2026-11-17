// Aussie ATIS Lovelace card: draws an Australian airport's runways and
// animates the ones in use, from the Australian ATIS integration's sensors.
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { renderMap } from "./map";
import {
  arrivalUpRotation,
  currentHourIndex,
  endUsage,
  modeSegments,
  nextChange,
  planHours,
  project,
  resolveLayout,
  runwayList,
  toKnots,
  type Projection,
} from "./model";
import type { AussieAtisCardConfig, HassEntity, HomeAssistant } from "./types";
import { WindParticles, type WindState } from "./wind";
import "./editor";

const CARD_VERSION = "1.0.0";
const VIEW_WIDTH = 400;
const HOUR = 3600000;

const hasValue = (entity: HassEntity | undefined): entity is HassEntity =>
  !!entity && !["unknown", "unavailable", ""].includes(entity.state);

/** Find the ICAO codes of airports set up in the integration, from the main sensors. */
export function findAirports(hass: HomeAssistant | undefined): { icao: string; name: string }[] {
  if (!hass) return [];
  return Object.keys(hass.states)
    .map((id) => /^sensor\.([a-z0-9]{4})_atis$/.exec(id))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({
      icao: m[1],
      name: String(hass.states[m[0]].attributes.airport ?? m[1].toUpperCase()),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

class AussieAtisCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: AussieAtisCardConfig;
  private _wind?: WindParticles;
  private _visible = true;
  private _observer?: IntersectionObserver;
  private _resizeObserver?: ResizeObserver;
  private _hourTimer?: number;
  private readonly _reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly _onVisibility = () => this._updatePlayback();
  private readonly _onMotionChange = () => this.requestUpdate();

  static getConfigElement(): HTMLElement {
    return document.createElement("aussie-atis-card-editor");
  }

  static getStubConfig(hass: HomeAssistant): Partial<AussieAtisCardConfig> {
    return { airport: findAirports(hass)[0]?.icao ?? "yssy" };
  }

  setConfig(config: AussieAtisCardConfig): void {
    if (!config || typeof config.airport !== "string" || !/^[a-z0-9]{4}$/i.test(config.airport.trim())) {
      throw new Error("Set `airport` to a 4-letter ICAO code, e.g. airport: ymml");
    }
    this._config = {
      orientation: "north",
      show_planes: true,
      show_wind: true,
      show_info: true,
      show_atfm: false,
      ...config,
      airport: config.airport.trim().toLowerCase(),
    };
  }

  getCardSize(): number {
    return (this._config?.show_info === false ? 5 : 7) + (this._config?.show_atfm ? 3 : 0);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this._onVisibility);
    this._reducedMotion.addEventListener("change", this._onMotionChange);
    this._observer = new IntersectionObserver((entries) => {
      this._visible = entries.some((e) => e.isIntersecting);
      this._updatePlayback();
    });
    this._observer.observe(this);
    this._scheduleHourTick();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._reducedMotion.removeEventListener("change", this._onMotionChange);
    this._observer?.disconnect();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._wind?.stop();
    window.clearTimeout(this._hourTimer);
  }

  private get _animate(): boolean {
    return !this._reducedMotion.matches;
  }

  private _entity(suffix = ""): HassEntity | undefined {
    return this.hass?.states[`sensor.${this._config!.airport}_atis${suffix}`];
  }

  /** Only re-render when one of this airport's sensors changed. */
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.has("_config")) return true;
    const old = changed.get("hass") as HomeAssistant | undefined;
    if (!old || !this.hass || !this._config) return true;
    const prefix = `sensor.${this._config.airport}_atis`;
    if (old.locale?.language !== this.hass.locale?.language) return true;
    return Object.keys(this.hass.states).some(
      (id) => (id === prefix || id.startsWith(`${prefix}_`)) && old.states[id] !== this.hass!.states[id],
    );
  }

  private _windState(): WindState | null {
    const speedEntity = this._entity("_wind_speed");
    if (!hasValue(speedEntity)) return null;
    const speed = toKnots(speedEntity.state, speedEntity.attributes.unit_of_measurement);
    if (speed === null) return null;
    const directionEntity = this._entity("_wind_direction");
    const direction = hasValue(directionEntity) ? Number.parseFloat(directionEntity.state) : NaN;
    const gustEntity = this._entity("_wind_gust");
    const gust = hasValue(gustEntity) ? toKnots(gustEntity.state, gustEntity.attributes.unit_of_measurement) : null;
    return { direction: Number.isFinite(direction) ? Math.round(direction) : null, speed, gust };
  }

  private _issuedAgo(): string | null {
    const issued = this._entity("_issued");
    if (!hasValue(issued)) return null;
    const time = Date.parse(issued.state);
    if (!Number.isFinite(time)) return null;
    const minutes = Math.round((time - Date.now()) / 60000);
    const format = new Intl.RelativeTimeFormat(this._language(), { numeric: "auto" });
    return Math.abs(minutes) < 60 ? format.format(minutes, "minute") : format.format(Math.round(minutes / 60), "hour");
  }

  private _text(suffix: string): string | null {
    const entity = this._entity(suffix);
    if (!hasValue(entity)) return null;
    return String(entity.attributes.full_text ?? entity.state);
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const config = this._config;
    const icao = config.airport.toUpperCase();
    const main = this._entity();
    const metar = this._entity("_metar");

    if (!main && !metar) {
      return html`<ha-card>
        <div class="warning">
          No data for <b>${icao}</b>. Check that it's selected in the Australian ATIS integration
          (<code>sensor.${config.airport}_atis</code> wasn't found).
        </div>
      </ha-card>`;
    }

    const attrs = main?.attributes ?? {};
    const hasAtis = hasValue(main);
    const changed = Array.isArray(attrs.changed_fields) ? (attrs.changed_fields as string[]) : [];
    const arrivals = hasAtis
      ? runwayList(attrs.arrival_runways ?? this._entity("_arrival_runways")?.state)
      : [];
    const departures = hasAtis
      ? runwayList(attrs.departure_runways ?? this._entity("_departure_runways")?.state)
      : [];
    const { runways, source } = resolveLayout(attrs.runways, icao);
    const rotation = config.orientation === "arrival" ? arrivalUpRotation(runways, arrivals) : 0;
    const projection: Projection = project(runways, VIEW_WIDTH, rotation);
    const { usage, unmatched } = endUsage(runways, arrivals, departures);
    const wind = hasAtis ? this._windState() : null;
    const title = config.title ?? `${attrs.airport ?? icao} (${icao})`;
    const ago = hasAtis ? this._issuedAgo() : null;

    return html`<ha-card>
      <div class="header">
        <div class="title">${title}</div>
        ${hasAtis
          ? html`<div class="letter" title="Information ${main!.state}">${main!.state}</div>`
          : html`<div class="badge">No ATIS</div>`}
      </div>
      ${source === "none"
        ? html`<div class="warning">No runway layout is available for ${icao}.</div>`
        : html`<div class="map-wrap" style="aspect-ratio:${projection.width} / ${projection.height}">
            ${renderMap(projection, usage, {
              animate: this._animate,
              showPlanes: config.show_planes !== false,
              dimmed: !hasAtis,
              runwayChanged: changed.includes("runway"),
              wind: config.show_wind === false ? null : wind,
              windChanged: changed.includes("wind"),
            })}
            <canvas class="particles"></canvas>
          </div>`}
      <div class="legend">
        <span class="key arr">Arrivals ${arrivals.length ? arrivals.join(", ") : "—"}</span>
        <span class="key dep">Departures ${departures.length ? departures.join(", ") : "—"}</span>
      </div>
      ${unmatched.length
        ? html`<div class="note">Not on the map: ${unmatched.join(", ")}</div>`
        : nothing}
      ${config.show_info === false ? nothing : this._renderInfo(hasAtis, ago, wind, changed)}
      ${config.show_atfm ? this._renderAtfm(icao) : nothing}
    </ha-card>`;
  }

  private _renderInfo(hasAtis: boolean, ago: string | null, wind: WindState | null, changed: string[]) {
    if (!hasAtis) {
      const other = this._entity()?.attributes.other_info;
      return html`<div class="info">
        <div class="note">No ATIS is being broadcast right now. The tower may be closed.</div>
        ${other ? html`<div class="note">${other}</div>` : nothing}
      </div>`;
    }
    const mark = (field: string) => (changed.includes(field) ? html`<span class="changed-dot" title="Changed in this broadcast"></span>` : nothing);
    const xw = this._entity("_max_crosswind");
    const tw = this._entity("_max_tailwind");
    const qnh = this._entity("_qnh");
    const components = [
      hasValue(xw) ? `XW ${toKnots(xw.state, xw.attributes.unit_of_measurement)} kt` : null,
      hasValue(tw) ? `TW ${toKnots(tw.state, tw.attributes.unit_of_measurement)} kt` : null,
    ].filter(Boolean);
    const rows: [string, string | null, string][] = [
      ["Approach", this._text("_approach"), "approach"],
      ["Wind", this._text("_wind"), "wind"],
      ["Visibility", this._text("_visibility"), "visibility"],
      ["Weather", this._text("_weather"), "weather"],
      ["Cloud", this._text("_cloud"), "cloud"],
      ["Significant weather", this._text("_significant_weather"), "sigwx"],
      ["Operational info", this._text("_operational_info"), "operational_info"],
    ];
    return html`<div class="info">
      <div class="stats">
        ${ago ? html`<span>Issued ${ago}</span>` : nothing}
        ${wind ? html`<span>${wind.direction === null ? "VRB" : `${String(wind.direction).padStart(3, "0")}°`} / ${wind.speed}${wind.gust ? `G${wind.gust}` : ""} kt</span>` : nothing}
        ${components.length ? html`<span>${components.join(" · ")}</span>` : nothing}
        ${hasValue(qnh) ? html`<span>QNH ${qnh.state}${mark("qnh")}</span>` : nothing}
      </div>
      <dl>
        ${rows
          .filter(([, value]) => value)
          .map(([label, value, field]) => html`<dt>${label}${mark(field)}</dt><dd>${value}</dd>`)}
      </dl>
    </div>`;
  }

  private _language(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  /** Format a time in the user's chosen time zone (Home Assistant's or the browser's). */
  private _time(ms: number): string {
    const timeZone = this.hass?.locale?.time_zone === "server" ? this.hass.config?.time_zone : undefined;
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
    try {
      return new Intl.DateTimeFormat(this._language(), { ...options, timeZone }).format(ms);
    } catch {
      return new Intl.DateTimeFormat(this._language(), options).format(ms);
    }
  }

  /** The ATFM Daily Plan: the planned runway mode and arrival rate, hour by hour. */
  private _renderAtfm(icao: string) {
    const plan = this._entity("_atfm_plan");
    const heading = (detail?: string) =>
      html`<div class="atfm-title">ATFM Daily Plan${detail ? html`<span>${detail}</span>` : nothing}</div>`;
    if (!plan) {
      return html`<div class="atfm">
        ${heading()}
        <div class="note">
          No ATFM Daily Plan for ${icao}. It covers YSSY, YMML, YBBN and YPPH, and needs
          <b>Include ATFM Daily Plan</b> turned on in the Australian ATIS integration.
        </div>
      </div>`;
    }
    if (!hasValue(plan)) {
      return html`<div class="atfm">
        ${heading()}
        <div class="note">The ATFM Daily Plan hasn't been downloaded yet.</div>
      </div>`;
    }

    const day = Date.parse(`${plan.state}T00:00:00Z`);
    const date = Number.isFinite(day)
      ? new Intl.DateTimeFormat(this._language(), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(day)
      : plan.state;
    const version = plan.attributes.version;
    const hours = planHours(plan.attributes.forecast);
    const now = Date.now();
    const currentIndex = currentHourIndex(hours, now);
    const current = hours[currentIndex];
    const nextMode = nextChange(hours, now, "runwayMode");
    const nextRate = nextChange(hours, now, "arrivalRate");
    const maxRate = Math.max(1, ...hours.map((h) => h.arrivalRate ?? 0));
    const segments = modeSegments(hours);
    const gdp = this._entity("_atfm_ground_delay_program");
    const programs = hasValue(gdp) && gdp.state !== "None" && Array.isArray(gdp.attributes.programs)
      ? (gdp.attributes.programs as { name?: string; start?: string; end?: string }[])
      : [];
    const span = (start?: string, end?: string) => {
      const from = Date.parse(String(start));
      const to = Date.parse(String(end));
      return Number.isFinite(from) && Number.isFinite(to) ? ` ${this._time(from)}–${this._time(to)}` : "";
    };
    const affected = gdp?.attributes.affected_flights;
    const average = gdp?.attributes.average_ground_delay_minutes;
    const notes = this._text("_atfm_notes");
    const rate = (value: number | null) => (value === null ? "—" : `${value} arr/h`);

    return html`<div class="atfm">
      ${heading([date, version != null ? `v${version}` : null].filter(Boolean).join(" · "))}
      <div class="stats">
        ${current
          ? html`<span class="atfm-now">Now ${current.runwayMode ?? "—"} · ${rate(current.arrivalRate)}</span>`
          : html`<span>${hours.length && now < hours[0].start ? `Plan starts ${this._time(hours[0].start)}` : "Outside the plan's hours"}</span>`}
        ${nextMode ? html`<span>${nextMode.runwayMode ?? "—"} from ${this._time(nextMode.start)}</span>` : nothing}
        ${nextRate && nextRate.start !== nextMode?.start
          ? html`<span>${rate(nextRate.arrivalRate)} from ${this._time(nextRate.start)}</span>`
          : nothing}
      </div>
      ${programs.length
        ? html`<div class="gdp">
            Ground delay program
            ${programs.map((p) => `${p.name ?? ""}${span(p.start, p.end)}`).join(", ")}${typeof affected === "number"
              ? `, ${affected} flights affected`
              : ""}${typeof average === "number" ? `, average delay ${average} min` : ""}
          </div>`
        : nothing}
      ${hours.length
        ? html`<div class="plan" style="--hours:${hours.length}" role="img"
            aria-label="Planned runway mode and arrival rate for each hour">
            ${hours.map(
              (h, i) => html`<div
                class="bar ${i === currentIndex ? "current" : h.end <= now ? "past" : ""}"
                style="grid-column:${i + 1};--rate:${(h.arrivalRate ?? 0) / maxRate}"
                title="${this._time(h.start)}  ${h.runwayMode ?? "—"}, ${rate(h.arrivalRate)}"
              >${h.arrivalRate ?? ""}</div>`,
            )}
            ${segments.map(
              (seg, i) => html`<div
                class="mode ${i % 2 ? "odd" : ""} ${currentIndex >= seg.from && currentIndex < seg.to ? "current" : ""}"
                style="grid-column:${seg.from + 1} / ${seg.to + 1}"
                title="${this._time(hours[seg.from].start)}–${this._time(hours[seg.to - 1].end)}  ${seg.runwayMode ?? "—"}"
              >${seg.runwayMode ?? "—"}</div>`,
            )}
            ${hours.map((h, i) =>
              i % 3 === 0 ? html`<div class="hour" style="grid-column:${i + 1} / span 3">${this._time(h.start)}</div>` : nothing,
            )}
          </div>`
        : nothing}
      ${notes
        ? html`<dl>
            <dt>Plan notes</dt>
            <dd class="clamp" title="Show all" @click=${(ev: Event) => {
              const dd = ev.currentTarget as HTMLElement;
              dd.classList.toggle("clamp");
              dd.title = dd.classList.contains("clamp") ? "Show all" : "";
            }}>${notes}</dd>
          </dl>`
        : nothing}
    </div>`;
  }

  /** Re-render at the top of each hour, so the plan's current hour moves on. */
  private _scheduleHourTick(): void {
    window.clearTimeout(this._hourTimer);
    if (!this._config?.show_atfm || !this.isConnected) return;
    const now = Date.now();
    this._hourTimer = window.setTimeout(() => this.requestUpdate(), Math.ceil((now + 1) / HOUR) * HOUR - now + 1000);
  }

  protected updated(): void {
    this._scheduleHourTick();
    const canvas = this.renderRoot.querySelector<HTMLCanvasElement>("canvas.particles");
    if (!canvas) {
      this._wind?.stop();
      this._wind = undefined;
      return;
    }
    if (!this._wind || this._wind.canvas !== canvas) {
      this._wind?.stop();
      this._wind = new WindParticles(canvas);
      this._resizeObserver?.disconnect();
      this._resizeObserver = new ResizeObserver(() => this._wind?.resize());
      this._resizeObserver.observe(canvas);
    }
    const svgEl = this.renderRoot.querySelector<SVGSVGElement>("svg.map");
    const height = svgEl?.viewBox.baseVal.height ?? 300;
    const colour = getComputedStyle(this).getPropertyValue("--secondary-text-color").trim() || "#888";
    const hasAtis = hasValue(this._entity());
    const wind = this._config?.show_wind !== false && hasAtis && this._animate ? this._windState() : null;
    this._wind.configure(wind, svgEl ? this._rotation(svgEl) : 0, VIEW_WIDTH, height, colour);
    this._updatePlayback();
  }

  private _rotation(svgEl: SVGSVGElement): number {
    return Number(svgEl.dataset.rotation ?? 0);
  }

  /** Pause everything while the card is off-screen or the tab is hidden. */
  private _updatePlayback(): void {
    const playing = this._visible && document.visibilityState === "visible" && this._animate;
    const svgEl = this.renderRoot?.querySelector<SVGSVGElement>("svg.map");
    if (svgEl) {
      if (playing) svgEl.unpauseAnimations();
      else svgEl.pauseAnimations();
      svgEl.classList.toggle("paused", !playing);
    }
    if (playing) this._wind?.start();
    else this._wind?.stop();
  }

  static styles = css`
    :host {
      --aac-arrival-color: var(--success-color, #2ecc71);
      --aac-departure-color: var(--info-color, #3498db);
      --aac-runway-color: #3b3f45;
      --aac-label-color: var(--primary-text-color);
    }
    ha-card {
      overflow: hidden;
      padding-bottom: 8px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px 4px;
    }
    .title {
      font-size: 1.15em;
      font-weight: 500;
    }
    .letter {
      min-width: 32px;
      height: 32px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 1.2em;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .badge {
      padding: 4px 8px;
      border-radius: 8px;
      background: var(--disabled-color, #888);
      color: var(--text-primary-color, #fff);
      font-size: 0.85em;
    }
    .map-wrap {
      position: relative;
      width: 100%;
    }
    .map-wrap svg,
    .particles {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .particles {
      pointer-events: none;
    }
    svg {
      overflow: visible;
    }
    .runway {
      stroke: var(--aac-runway-color);
      stroke-linecap: butt;
      fill: none;
    }
    .runway.concrete {
      stroke: #9a9da1;
    }
    .runway.grass {
      stroke: #829c36;
    }
    .runway.gravel {
      stroke: #7d7a73;
    }
    .runway.dirt {
      stroke: #bf6e4d;
    }
    .runway.water {
      stroke: #1581cf;
    }
    .centreline {
      stroke: #fff;
      stroke-width: 1;
      stroke-dasharray: 8 5;
      opacity: 0.85;
      fill: none;
    }
    .dimmed .runways,
    .dimmed .labels {
      opacity: 0.45;
    }
    .glow {
      fill: none;
      stroke-linecap: round;
      opacity: 0.6;
      filter: url(#aac-glow);
    }
    .glow.arr {
      stroke: var(--aac-arrival-color);
    }
    .glow.dep {
      stroke: var(--aac-departure-color);
    }
    .glow.both {
      stroke: var(--aac-arrival-color);
      animation: both-colours 4s ease-in-out infinite;
    }
    .glow.changed {
      animation: pulse 1.2s ease-in-out 4;
    }
    .glow.both.changed {
      animation:
        both-colours 4s ease-in-out infinite,
        pulse 1.2s ease-in-out 4;
    }
    @keyframes both-colours {
      0%,
      100% {
        stroke: var(--aac-arrival-color);
      }
      50% {
        stroke: var(--aac-departure-color);
      }
    }
    @keyframes pulse {
      0%,
      100% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
    }
    .chevron {
      fill: none;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.2;
      animation: flow 1.6s linear infinite;
    }
    .chevron.arr {
      stroke: var(--aac-arrival-color);
    }
    .chevron.dep {
      stroke: var(--aac-departure-color);
    }
    @keyframes flow {
      0% {
        opacity: 0.15;
      }
      25% {
        opacity: 1;
      }
      65%,
      100% {
        opacity: 0.15;
      }
    }
    .plane {
      stroke: var(--card-background-color, #fff);
      stroke-width: 1;
    }
    .plane.arr {
      fill: var(--aac-arrival-color);
    }
    .plane.dep {
      fill: var(--aac-departure-color);
    }
    .label rect {
      fill: var(--card-background-color, #fff);
      stroke: var(--divider-color, #ccc);
      stroke-width: 1;
    }
    .label text {
      font: 700 10px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--aac-label-color);
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .label.arr rect {
      fill: var(--aac-arrival-color);
      stroke: none;
    }
    .label.dep rect {
      fill: var(--aac-departure-color);
      stroke: none;
    }
    .label.both rect {
      fill: var(--aac-arrival-color);
      stroke: var(--aac-departure-color);
      stroke-width: 2.5;
    }
    .label.arr text,
    .label.dep text,
    .label.both text {
      fill: #fff;
    }
    .wind-ring {
      fill: var(--card-background-color, #fff);
      fill-opacity: 0.7;
      stroke: var(--divider-color, #ccc);
    }
    .wind-arrow {
      fill: var(--primary-text-color);
    }
    .wind-text {
      font: 600 10px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--primary-text-color);
      text-anchor: middle;
    }
    .wind-text .unit {
      font-weight: 400;
      fill: var(--secondary-text-color);
    }
    .wind.changed .wind-ring {
      stroke: var(--warning-color, #ff9800);
      stroke-width: 2;
    }
    .north path {
      fill: var(--secondary-text-color);
    }
    .north text {
      font: 700 9px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--secondary-text-color);
      text-anchor: middle;
    }
    .paused *,
    .paused {
      animation-play-state: paused !important;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      padding: 4px 16px;
      font-weight: 500;
    }
    .key::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: -1px;
    }
    .key.arr::before {
      background: var(--aac-arrival-color);
    }
    .key.dep::before {
      background: var(--aac-departure-color);
    }
    .info {
      padding: 0 16px;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      padding: 4px 0;
    }
    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 2px 12px;
      margin: 4px 0 0;
      font-size: 0.9em;
    }
    dt {
      color: var(--secondary-text-color);
    }
    dd {
      margin: 0;
    }
    .changed-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-left: 5px;
      border-radius: 50%;
      background: var(--warning-color, #ff9800);
      vertical-align: 1px;
    }
    .note,
    .warning {
      padding: 4px 16px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .info .note {
      padding: 4px 0;
    }
    .atfm {
      padding: 8px 16px 0;
      margin-top: 8px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .atfm-title {
      font-weight: 500;
    }
    .atfm-title span {
      margin-left: 8px;
      font-weight: 400;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .atfm .note {
      padding: 4px 0;
    }
    .atfm dd.clamp {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
    }
    .atfm-now {
      color: var(--primary-text-color);
      font-weight: 500;
    }
    .gdp {
      margin: 4px 0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.9em;
      background: rgba(255, 152, 0, 0.15);
      border-left: 3px solid var(--warning-color, #ff9800);
    }
    .plan {
      display: grid;
      grid-template-columns: repeat(var(--hours), minmax(0, 1fr));
      grid-template-rows: 48px auto auto;
      column-gap: 2px;
      margin: 6px 0 2px;
      font-size: 0.75em;
    }
    .bar {
      grid-row: 1;
      align-self: end;
      height: calc(14px + var(--rate) * 34px);
      box-sizing: border-box;
      border-radius: 3px 3px 0 0;
      background: var(--aac-arrival-color);
      opacity: 0.55;
      color: #fff;
      text-align: center;
      font-size: 0.85em;
      line-height: 14px;
      overflow: hidden;
    }
    .bar.past {
      opacity: 0.35;
    }
    .bar.current {
      opacity: 1;
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .mode {
      grid-row: 2;
      margin-top: 3px;
      padding: 2px 3px;
      border-radius: 3px;
      background: rgba(127, 127, 127, 0.18);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
    .mode.odd {
      background: rgba(127, 127, 127, 0.32);
    }
    .mode.current {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      font-weight: 500;
    }
    .hour {
      grid-row: 3;
      padding-top: 2px;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
    }
    .warning {
      padding: 16px;
      color: var(--warning-color, #ff9800);
    }
  `;
}

if (!customElements.get("aussie-atis-card")) {
  customElements.define("aussie-atis-card", AussieAtisCard);
  window.customCards = window.customCards ?? [];
  window.customCards.push({
    type: "aussie-atis-card",
    name: "Aussie ATIS",
    description: "An Australian airport's runways, with the runways in use animated. Needs the Australian ATIS integration.",
    preview: true,
    documentationURL: "https://github.com/BigByte76/aussie-atis-lovelace-card",
  });
  console.info(`%c AUSSIE-ATIS-CARD %c ${CARD_VERSION} `, "color:#fff;background:#00843d", "color:#00843d");
}
