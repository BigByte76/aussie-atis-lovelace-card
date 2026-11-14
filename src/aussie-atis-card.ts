// Aussie ATIS Lovelace card: draws an Australian airport's runways and
// animates the ones in use, from the Australian ATIS integration's sensors.
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { renderMap } from "./map";
import {
  arrivalUpRotation,
  endUsage,
  project,
  resolveLayout,
  runwayList,
  toKnots,
  type Projection,
} from "./model";
import type { AussieAtisCardConfig, HassEntity, HomeAssistant } from "./types";
import { WindParticles, type WindState } from "./wind";
import "./editor";

const CARD_VERSION = "0.1.0";
const VIEW_WIDTH = 400;

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
      ...config,
      airport: config.airport.trim().toLowerCase(),
    };
  }

  getCardSize(): number {
    return this._config?.show_info === false ? 5 : 7;
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
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._reducedMotion.removeEventListener("change", this._onMotionChange);
    this._observer?.disconnect();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._wind?.stop();
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
    const language = this.hass?.locale?.language ?? this.hass?.language ?? "en";
    const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
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

  protected updated(): void {
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
