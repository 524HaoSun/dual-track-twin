// Dual-Track Digital Twin — Data Types
// All values sourced from demo_data.json and demo_data_extra.json; never invented.

export interface BuildingMeta {
  id: string;
  label: string;
  type: string;
  sqm: number;
  built: number;
  occupants: number;
  heating: string;
}

export interface DemoMeta {
  dataset: string;
  building: BuildingMeta;
  model: string;
  split: string;
  typology_pool_buildings: number;
  note: string;
}

export interface DemoKPIs {
  performance_gap_pct: number;
  actual_kwh: number;
  design_kwh: number;
  final_cvrmse: number;
  final_nmbe: number;
  final_band_pct: number;
  ashrae_hourly_pass: boolean;
  baseload_share_pct: number;
  weekday_mean: number;
  weekend_mean: number;
  weekend_drop_pct: number;
  peak_kwh: number;
  load_factor_pct: number;
  intensity_kwh_m2: number;
}

export interface LadderStage {
  stage: string; // S0..S4
  label: string;
  cvrmse: number;
  nmbe: number;
  band_pct: number;
  ashrae_pass: boolean;
}

export interface StageData {
  p: number[];
  lo: number[];
  hi: number[];
}

export interface ScenarioData {
  timestamps: string[];
  actual: number[];
  airTemp: number[];
  week_gap_pct: number;
  mean_airTemp: number;
  stages: {
    S0: StageData;
    S1: StageData;
    S2: StageData;
    S3: StageData;
    S4: StageData;
  };
}

export interface Attribution {
  headline_gap_pct: number;
  occupancy_evidence: {
    term_weekday_mean_kwh: number;
    holiday_weekday_mean_kwh: number;
    holiday_drop_pct: number;
  };
  feature_importance_pct: Record<string, number>;
  grouped_importance: {
    measured_feedback: number;
    schedule_occupancy: number;
    weather: number;
  };
}

export interface DemoData {
  meta: DemoMeta;
  kpis: DemoKPIs;
  ladder: LadderStage[];
  scenarios: {
    cold_snap: ScenarioData;
    term_normal: ScenarioData;
    holiday: ScenarioData;
  };
  attribution: Attribution;
}

// ── Extra data types (demo_data_extra.json) ───────────────────────────────────

export interface AnnualData {
  year: number;
  note: string;
  dates: string[];       // ISO date strings, 366 entries for 2016
  actual: number[];      // daily kWh, 366 entries
  design: number[];      // typology model estimate, 366 entries
  valid_days: number;
}

export interface HeatmapData {
  year: number;
  months: number[];      // [1..12]
  hours: number[];       // [0..23]
  matrix: number[][];    // [12][24] — mean kWh per hour-of-day per month (workdays)
}

export interface BenchmarkBuilding {
  label: string;
  type: string;
  cvrmse: number;
  intensity_kwh_m2: number;
  is_target: boolean;
}

export interface OptimisationData {
  label: string;
  assumption: string;    // must be displayed verbatim in UI
  driver: string;
  saving_pct: number;
  baseline_week: number[];   // 168 hourly values
  scenario_week: number[];   // 168 hourly values (what-if)
  timestamps: string[];      // 168 ISO datetime strings
}

export interface ExtraData {
  annual: AnnualData;
  heatmap: HeatmapData;
  benchmarks: BenchmarkBuilding[];
  optimisation: OptimisationData;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export type ScenarioKey = 'cold_snap' | 'term_normal' | 'holiday';
export type StageKey = 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  cold_snap: 'Cold snap',
  term_normal: 'Term week',
  holiday: 'Holiday',
};

export const STAGE_LABELS: Record<StageKey, string> = {
  S0: 'Design assumptions',
  S1: 'Weather aligned',
  S2: 'Schedules calibrated',
  S3: 'Loads calibrated',
  S4: 'Fully calibrated',
};
