export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

// ── Source definitions ────────────────────────────────────────────────────────

export type SourceId = "epic" | "cms" | "va";

export interface DemoSource {
  id: SourceId;
  name: string;
  shortName: string;
  type: "provider" | "payer" | "government";
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const DEMO_SOURCES: Record<SourceId, DemoSource> = {
  epic: {
    id: "epic",
    name: "Epic MyChart",
    shortName: "Epic",
    type: "provider",
    description: "Your clinical records from hospitals and physician groups using Epic — visit notes, lab results, imaging, and care plans.",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-800",
    borderColor: "border-indigo-200",
  },
  cms: {
    id: "cms",
    name: "CMS Blue Button",
    shortName: "Medicare",
    type: "payer",
    description: "Your Medicare claims history — every covered service, prescription, and explanation of benefits.",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    borderColor: "border-blue-200",
  },
  va: {
    id: "va",
    name: "VA Health",
    shortName: "VA",
    type: "government",
    description: "Your VA health records — clinical notes, pharmacy, lab results, and specialty care across all VA facilities.",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    borderColor: "border-red-200",
  },
};

// ── Clinical data types ───────────────────────────────────────────────────────

export interface DemoCondition {
  name: string;
  icd10: string;
  status: "active" | "resolved";
  onsetDate: string;
  lastReviewed: string;
  source: SourceId;
}

export interface DemoMedication {
  name: string;
  dose: string;
  frequency: string;
  indication?: string;
  startDate: string;
  source: SourceId;
}

export interface DemoLab {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "normal" | "high" | "low";
  date: string;
  source: SourceId;
  note?: string;
}

export interface DemoDocument {
  title: string;
  docType: string;
  date: string;
  source: SourceId;
  summary: string;
}

export interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: "male" | "female";
  sources: SourceId[];
  tagline: string;
  conditions: DemoCondition[];
  medications: DemoMedication[];
  labs: DemoLab[];
  documents: DemoDocument[];
}

// ── Demo patient 1: Maria Gonzalez ───────────────────────────────────────────
// Use case: common chronic disease management, payer + provider records

const MARIA: DemoPatient = {
  id: "maria",
  firstName: "Maria",
  lastName: "Gonzalez",
  dateOfBirth: "1980-09-14",
  age: 45,
  gender: "female",
  sources: ["epic", "cms"],
  tagline: "Diabetes · Hypertension · Hyperlipidemia",
  conditions: [
    {
      name: "Type 2 Diabetes Mellitus",
      icd10: "E11.9",
      status: "active",
      onsetDate: "2018-03",
      lastReviewed: "2026-05-15",
      source: "epic",
    },
    {
      name: "Essential Hypertension",
      icd10: "I10",
      status: "active",
      onsetDate: "2015-07",
      lastReviewed: "2026-05-15",
      source: "epic",
    },
    {
      name: "Pure Hypercholesterolemia",
      icd10: "E78.00",
      status: "active",
      onsetDate: "2019-11",
      lastReviewed: "2026-04-03",
      source: "cms",
    },
    {
      name: "Overweight",
      icd10: "E66.9",
      status: "active",
      onsetDate: "2018-03",
      lastReviewed: "2026-05-15",
      source: "cms",
    },
  ],
  medications: [
    {
      name: "Metformin HCl",
      dose: "1000 mg",
      frequency: "Twice daily (morning and evening)",
      indication: "Type 2 Diabetes",
      startDate: "2018-04",
      source: "epic",
    },
    {
      name: "Lisinopril",
      dose: "10 mg",
      frequency: "Once daily",
      indication: "Hypertension",
      startDate: "2015-08",
      source: "epic",
    },
    {
      name: "Atorvastatin",
      dose: "20 mg",
      frequency: "Once daily at bedtime",
      indication: "Hypercholesterolemia",
      startDate: "2019-12",
      source: "cms",
    },
    {
      name: "Aspirin",
      dose: "81 mg",
      frequency: "Once daily",
      indication: "Cardiovascular risk reduction",
      startDate: "2020-01",
      source: "cms",
    },
  ],
  labs: [
    {
      test: "Hemoglobin A1c",
      value: "7.2",
      unit: "%",
      referenceRange: "Diabetic goal < 7.0%",
      flag: "high",
      date: "2026-05-15",
      source: "epic",
      note: "Slightly above diabetic target — consider medication adjustment at next visit",
    },
    {
      test: "LDL Cholesterol",
      value: "112",
      unit: "mg/dL",
      referenceRange: "< 100 mg/dL",
      flag: "high",
      date: "2026-04-03",
      source: "cms",
    },
    {
      test: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      referenceRange: "< 130/80 mmHg",
      flag: "high",
      date: "2026-05-15",
      source: "epic",
      note: "Borderline elevated — lifestyle modification recommended",
    },
    {
      test: "eGFR",
      value: "74",
      unit: "mL/min/1.73m²",
      referenceRange: "> 60 mL/min/1.73m²",
      flag: "normal",
      date: "2026-04-03",
      source: "cms",
    },
  ],
  documents: [
    {
      title: "Annual Wellness Visit",
      docType: "Primary Care Visit Note",
      date: "2026-03-20",
      source: "epic",
      summary:
        "Patient presents for annual wellness visit. Blood pressure 132/84 mmHg, weight 168 lbs (BMI 27.3). Diabetic eye exam completed — no retinopathy. Foot exam normal. A1c reviewed at 7.4% — patient counseled on dietary carbohydrate reduction and increased physical activity. Flu and pneumococcal vaccines administered. Mammogram ordered. Return in 6 months or sooner if symptoms change.",
    },
    {
      title: "Explanation of Benefits — Primary Care Visit",
      docType: "Medicare Claims Summary",
      date: "2026-05-15",
      source: "cms",
      summary:
        "Service: Office Visit, Established Patient (CPT 99214). Provider: Lakewood Family Medicine. Amount Billed: $245.00. Medicare Approved: $178.32. Medicare Paid: $142.66. Your Responsibility: $35.66 (after deductible). Note: Preventive services associated with this visit are covered at 100% with no cost-sharing.",
    },
  ],
};

// ── Demo patient 2: James Wilson ─────────────────────────────────────────────
// Use case: complex multi-morbidity, veteran, 3-source consolidation

const JAMES: DemoPatient = {
  id: "james",
  firstName: "James",
  lastName: "Wilson",
  dateOfBirth: "1957-04-22",
  age: 68,
  gender: "male",
  sources: ["epic", "cms", "va"],
  tagline: "COPD · Heart Failure · Diabetes · Veteran",
  conditions: [
    {
      name: "Chronic Obstructive Pulmonary Disease",
      icd10: "J44.1",
      status: "active",
      onsetDate: "2012-05",
      lastReviewed: "2026-05-20",
      source: "va",
    },
    {
      name: "Congestive Heart Failure, Systolic",
      icd10: "I50.20",
      status: "active",
      onsetDate: "2020-09",
      lastReviewed: "2026-06-01",
      source: "epic",
    },
    {
      name: "Type 2 Diabetes Mellitus",
      icd10: "E11.9",
      status: "active",
      onsetDate: "2008-11",
      lastReviewed: "2026-04-15",
      source: "epic",
    },
    {
      name: "Essential Hypertension",
      icd10: "I10",
      status: "active",
      onsetDate: "2005-03",
      lastReviewed: "2026-06-01",
      source: "va",
    },
    {
      name: "Chronic Kidney Disease, Stage 3a",
      icd10: "N18.31",
      status: "active",
      onsetDate: "2022-01",
      lastReviewed: "2026-04-15",
      source: "cms",
    },
  ],
  medications: [
    {
      name: "Tiotropium Bromide (Spiriva)",
      dose: "18 mcg",
      frequency: "Inhale once daily",
      indication: "COPD maintenance",
      startDate: "2013-01",
      source: "va",
    },
    {
      name: "Furosemide",
      dose: "40 mg",
      frequency: "Once daily in the morning",
      indication: "Heart failure — fluid management",
      startDate: "2020-10",
      source: "epic",
    },
    {
      name: "Carvedilol",
      dose: "12.5 mg",
      frequency: "Twice daily with food",
      indication: "Heart failure — reduce cardiac workload",
      startDate: "2020-10",
      source: "epic",
    },
    {
      name: "Insulin Glargine (Basaglar)",
      dose: "30 units",
      frequency: "Subcutaneous injection at bedtime",
      indication: "Type 2 Diabetes",
      startDate: "2015-06",
      source: "va",
    },
    {
      name: "Lisinopril",
      dose: "5 mg",
      frequency: "Once daily",
      indication: "Heart failure / kidney protection",
      startDate: "2020-10",
      source: "epic",
    },
    {
      name: "Albuterol (ProAir HFA)",
      dose: "90 mcg/actuation",
      frequency: "2 puffs as needed for shortness of breath",
      indication: "COPD rescue inhaler",
      startDate: "2012-06",
      source: "va",
    },
  ],
  labs: [
    {
      test: "B-type Natriuretic Peptide (BNP)",
      value: "285",
      unit: "pg/mL",
      referenceRange: "< 100 pg/mL",
      flag: "high",
      date: "2026-06-01",
      source: "va",
      note: "Elevated — indicates active heart failure. Trend improving from 410 pg/mL in February.",
    },
    {
      test: "FEV1/FVC Ratio (Spirometry)",
      value: "62",
      unit: "%",
      referenceRange: "> 70%",
      flag: "low",
      date: "2026-05-20",
      source: "va",
      note: "Consistent with GOLD Stage 2 (Moderate) COPD",
    },
    {
      test: "Hemoglobin A1c",
      value: "7.8",
      unit: "%",
      referenceRange: "Diabetic goal < 8.0% (individualized for age/complexity)",
      flag: "normal",
      date: "2026-04-15",
      source: "epic",
      note: "Within individualized target given comorbidities — avoid hypoglycemia",
    },
    {
      test: "Serum Creatinine",
      value: "1.6",
      unit: "mg/dL",
      referenceRange: "0.7 – 1.3 mg/dL",
      flag: "high",
      date: "2026-04-15",
      source: "cms",
    },
    {
      test: "eGFR",
      value: "48",
      unit: "mL/min/1.73m²",
      referenceRange: "> 60 mL/min/1.73m²",
      flag: "low",
      date: "2026-04-15",
      source: "cms",
      note: "CKD Stage 3a — stable from prior measurement",
    },
  ],
  documents: [
    {
      title: "Cardiology Consult Note",
      docType: "Specialty Consult",
      date: "2026-05-25",
      source: "va",
      summary:
        "Patient referred for management of systolic heart failure. Echo (05/20/2026): EF 38%, mild mitral regurgitation, elevated LVEDP. Patient reports improvement in functional capacity since February hospitalization — now walking 1–2 blocks without dyspnea (was 0.5 blocks at discharge). Current Furosemide 40mg daily maintaining euvolemia. Recommend: Continue current regimen, repeat echo in 3 months, optimize Carvedilol to 25mg BID if tolerated. Patient educated on daily weight log — return to clinic or ED if weight gain > 3 lbs in 24 hrs.",
    },
    {
      title: "Hospital Discharge Summary",
      docType: "Inpatient Discharge Summary",
      date: "2026-02-10",
      source: "epic",
      summary:
        "Patient: James Wilson, 68M. Admission: 02/07/2026. Discharge: 02/10/2026. Admitting Dx: Acute decompensated heart failure. Course: Presented with 2-week history of progressive dyspnea, orthopnea, and bilateral lower extremity edema. Weight on admission 198 lbs (12 lb gain from dry weight of 186 lbs). BNP 1,240 pg/mL. Treated with IV furosemide — 2.8 L net diuresis over 3 days. Discharged at weight 187 lbs, BNP 410. Medication change: Furosemide increased from 20mg to 40mg daily. Follow-up: PCP in 1 week, Cardiology in 2 weeks.",
    },
    {
      title: "Annual Wellness Visit Summary",
      docType: "Primary Care Visit Note",
      date: "2025-11-15",
      source: "cms",
      summary:
        "Medicare Annual Wellness Visit. Preventive screenings reviewed and updated. Colorectal cancer screening: Colonoscopy 2022, next due 2032. Depression screening (PHQ-9): Score 4, mild — monitoring. Fall risk assessment: Low. Advance care planning discussion completed — patient has existing healthcare proxy and POLST on file. All vaccines current. Bone density scan ordered (age and risk factors). Next wellness visit due November 2026.",
    },
  ],
};

// ── Demo patient 3: Aisha Thompson ───────────────────────────────────────────
// Use case: younger adult, behavioral health integration, asthma management

const AISHA: DemoPatient = {
  id: "aisha",
  firstName: "Aisha",
  lastName: "Thompson",
  dateOfBirth: "1991-11-03",
  age: 34,
  gender: "female",
  sources: ["epic", "cms"],
  tagline: "Asthma · Anxiety · Migraine",
  conditions: [
    {
      name: "Intermittent Asthma, Mild",
      icd10: "J45.20",
      status: "active",
      onsetDate: "2010-08",
      lastReviewed: "2026-03-10",
      source: "epic",
    },
    {
      name: "Generalized Anxiety Disorder",
      icd10: "F41.1",
      status: "active",
      onsetDate: "2021-03",
      lastReviewed: "2026-04-22",
      source: "epic",
    },
    {
      name: "Migraine Without Aura",
      icd10: "G43.009",
      status: "active",
      onsetDate: "2019-06",
      lastReviewed: "2026-03-10",
      source: "cms",
    },
    {
      name: "Seasonal Allergic Rhinitis",
      icd10: "J30.1",
      status: "resolved",
      onsetDate: "2008-04",
      lastReviewed: "2023-05-01",
      source: "epic",
    },
  ],
  medications: [
    {
      name: "Albuterol (ProAir HFA)",
      dose: "90 mcg/actuation",
      frequency: "2 puffs as needed (max 8 puffs/day)",
      indication: "Asthma rescue",
      startDate: "2010-09",
      source: "epic",
    },
    {
      name: "Fluticasone Propionate (Flovent HFA)",
      dose: "110 mcg/actuation",
      frequency: "2 puffs twice daily",
      indication: "Asthma controller — reduce airway inflammation",
      startDate: "2021-01",
      source: "epic",
    },
    {
      name: "Sertraline (Zoloft)",
      dose: "50 mg",
      frequency: "Once daily in the morning",
      indication: "Generalized Anxiety Disorder",
      startDate: "2021-04",
      source: "epic",
    },
    {
      name: "Sumatriptan",
      dose: "100 mg",
      frequency: "As needed for migraine — max 2 doses per 24 hrs",
      indication: "Acute migraine treatment",
      startDate: "2019-07",
      source: "cms",
    },
  ],
  labs: [
    {
      test: "Spirometry — FEV1 (% Predicted)",
      value: "82",
      unit: "%",
      referenceRange: "> 80% predicted",
      flag: "normal",
      date: "2026-03-10",
      source: "epic",
      note: "Normal range — consistent with mild intermittent asthma well-controlled on current regimen",
    },
    {
      test: "Complete Blood Count (CBC)",
      value: "WBC 6.2 · Hgb 13.8 · Plt 245",
      unit: "K/µL · g/dL · K/µL",
      referenceRange: "WBC 4.5–11 · Hgb 12–16 · Plt 150–400",
      flag: "normal",
      date: "2026-01-15",
      source: "cms",
    },
    {
      test: "Comprehensive Metabolic Panel",
      value: "All within normal limits",
      unit: "",
      referenceRange: "See individual components",
      flag: "normal",
      date: "2026-01-15",
      source: "cms",
      note: "Sodium, Potassium, CO2, BUN, Creatinine, Glucose, ALT, AST — all within reference range",
    },
  ],
  documents: [
    {
      title: "Mental Health Progress Note",
      docType: "Behavioral Health Follow-up",
      date: "2026-04-22",
      source: "epic",
      summary:
        "Follow-up for Generalized Anxiety Disorder. Patient reports moderate improvement in anxiety symptoms since last visit (GAD-7 score: 8, down from 13 at initial presentation). Work stressors remain significant. Sleep improved with consistent sleep hygiene practices. Sertraline 50mg well tolerated — no side effects reported. Discussed continued CBT techniques for cognitive restructuring. No safety concerns. Plan: Continue Sertraline 50mg, follow up in 8 weeks. Referral to therapist for ongoing CBT discussed — patient interested, will coordinate scheduling.",
    },
    {
      title: "Explanation of Benefits — Specialist Visit",
      docType: "Medicare Claims Summary",
      date: "2026-03-10",
      source: "cms",
      summary:
        "Service: Pulmonary Function Testing (CPT 94010, 94726). Provider: Regional Pulmonology Associates. Amount Billed: $380.00. Medicare Approved: $242.18. Medicare Paid: $193.74. Your Responsibility: $48.44. Diagnosis Codes: J45.20 (Intermittent Asthma). Notes: Spirometry with bronchodilator response testing. Results forwarded to ordering physician.",
    },
  ],
};

export const DEMO_PATIENTS: DemoPatient[] = [MARIA, JAMES, AISHA];

// ── Demo connection state (localStorage) ─────────────────────────────────────

const DEMO_CONNECTED_KEY = "drls_demo_connected";

export function getDemoConnectedSources(): SourceId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_CONNECTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDemoConnectedSource(id: SourceId): void {
  if (typeof window === "undefined") return;
  const current = getDemoConnectedSources();
  if (!current.includes(id)) {
    localStorage.setItem(DEMO_CONNECTED_KEY, JSON.stringify([...current, id]));
  }
}

export function clearDemoConnections(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_CONNECTED_KEY);
}

// ── Patient matching ──────────────────────────────────────────────────────────

export function findDemoPatient(
  firstName: string,
  gender: string,
): DemoPatient {
  const isFemale = gender === "female";
  const femaleCandidates = DEMO_PATIENTS.filter((p) => p.gender === "female");
  const maleCandidates = DEMO_PATIENTS.filter((p) => p.gender === "male");
  const pool = isFemale ? femaleCandidates : maleCandidates;

  const nameLower = firstName.toLowerCase();
  const exact = pool.find((p) => p.firstName.toLowerCase() === nameLower);
  return exact ?? pool[0] ?? DEMO_PATIENTS[0];
}
