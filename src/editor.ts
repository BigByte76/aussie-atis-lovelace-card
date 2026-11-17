// Visual editor for the card, built on Home Assistant's own <ha-form>.
import { LitElement, html, nothing } from "lit";
import type { AussieAtisCardConfig, HomeAssistant } from "./types";

const LABELS: Record<string, string> = {
  airport: "Airport",
  title: "Title (optional)",
  orientation: "Orientation",
  show_planes: "Animated aircraft",
  show_wind: "Wind",
  show_info: "ATIS details",
  show_atfm: "ATFM Daily Plan",
};

function airportOptions(hass: HomeAssistant | undefined, current: string | undefined) {
  const options = Object.keys(hass?.states ?? {})
    .map((id) => /^sensor\.([a-z0-9]{4})_atis$/.exec(id))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({
      value: m[1],
      label: `${hass!.states[m[0]].attributes.airport ?? m[1].toUpperCase()} (${m[1].toUpperCase()})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  // Keep a configured airport selectable even if its sensors are missing.
  if (current && !options.some((o) => o.value === current)) {
    options.unshift({ value: current, label: current.toUpperCase() });
  }
  return options;
}

class AussieAtisCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: AussieAtisCardConfig;

  setConfig(config: AussieAtisCardConfig): void {
    this._config = config;
  }

  private _schema() {
    return [
      {
        name: "airport",
        required: true,
        selector: { select: { mode: "dropdown", options: airportOptions(this.hass, this._config?.airport) } },
      },
      { name: "title", selector: { text: {} } },
      {
        name: "orientation",
        selector: {
          select: {
            mode: "list",
            options: [
              { value: "north", label: "North up" },
              { value: "arrival", label: "Arrival runway up" },
            ],
          },
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_planes", selector: { boolean: {} } },
          { name: "show_wind", selector: { boolean: {} } },
          { name: "show_info", selector: { boolean: {} } },
          { name: "show_atfm", selector: { boolean: {} } },
        ],
      },
    ];
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;
    const data = {
      orientation: "north",
      show_planes: true,
      show_wind: true,
      show_info: true,
      show_atfm: false,
      ...this._config,
    };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${this._schema()}
      .computeLabel=${(s: { name: string }) => LABELS[s.name] ?? s.name}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
  }

  private _valueChanged(ev: CustomEvent<{ value: AussieAtisCardConfig }>): void {
    const config = { ...ev.detail.value };
    if (!config.title) delete config.title;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

if (!customElements.get("aussie-atis-card-editor")) {
  customElements.define("aussie-atis-card-editor", AussieAtisCardEditor);
}
