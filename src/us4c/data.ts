export const stages = [
  "Report",
  "Analyse",
  "Verify",
  "Coordinate",
  "Respond",
  "Resolve",
];
export const missions = [
  {
    id: "fraud",
    title: "Financial fraud",
    short: "Fraud response",
    unit: "Cyber Investigation & Technical Operations",
    description:
      "1930 intake, transaction intelligence and financial coordination.",
    color: "#39c7ed",
  },
  {
    id: "safety",
    title: "Women & child online safety",
    short: "Online safety",
    unit: "Complaint Monitoring Unit",
    description:
      "Evidence preservation, identity analysis and victim protection.",
    color: "#b08cfa",
  },
  {
    id: "content",
    title: "Harmful content review",
    short: "Content intelligence",
    unit: "State Cyber Threat Intelligence & Monitoring Hub",
    description:
      "Multimedia analysis, propagation review and platform coordination.",
    color: "#579af2",
  },
  {
    id: "distress",
    title: "Emergency & welfare response",
    short: "Emergency response",
    unit: "Emergency Coordination Desk",
    description:
      "Human validation, location intelligence and welfare intervention.",
    color: "#f48b99",
  },
] as const;
export type Mission = (typeof missions)[number]["id"];
export type Case = {
  id: string;
  title: string;
  mission: Mission;
  priority: "Critical" | "High" | "Medium";
  stage: number;
  location: string;
  source: string;
  unit: string;
  createdAt: string;
  amount: number;
  frozen: number;
  summary: string;
  insights: { text: string; confidence: string; source: string }[];
  entities: { label: string; value: string; confidence: string }[];
  evidence: {
    name: string;
    type: string;
    status: string;
    source: string;
    time: string;
  }[];
  actions: { agency: string; task: string; status: string }[];
  timeline: { time: string; text: string }[];
  outcome: string;
  isDemo: boolean;
  owner?: string;
  fusion?: { step: number; reviewed: string[]; matches: string[] };
  investigation?: import("./investigation").Investigation;
};
export { operationalCases as seedCases } from "./seed";
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const nowIST = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  }) + " IST";
