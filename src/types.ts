// The small slice of Home Assistant's frontend types this card uses.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  /** `time_zone` is "server" to show times in Home Assistant's time zone, or "local" for the browser's. */
  locale?: { language: string; time_zone?: string };
  language?: string;
  config?: { time_zone?: string };
}

export interface AussieAtisCardConfig {
  type: string;
  /** ICAO code, e.g. "ymml". */
  airport: string;
  title?: string;
  /** "north": north up. "arrival": the main arrival runway points up. */
  orientation?: "north" | "arrival";
  show_planes?: boolean;
  show_wind?: boolean;
  show_info?: boolean;
  /** Show the ATFM Daily Plan (YSSY, YMML, YBBN and YPPH, when it's turned on in the integration). */
  show_atfm?: boolean;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: AussieAtisCardConfig): void;
}

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description: string; preview?: boolean; documentationURL?: string }>;
  }
}
