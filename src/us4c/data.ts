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
    title: "Digital distress response",
    short: "Distress response",
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
};
const timestamp = "2026-10-01T04:42:00.000Z";
export const seedCases: Case[] = [
  {
    id: "US4C-2026-1042",
    title: "UPI impersonation · urgent fund recovery",
    mission: "fraud",
    priority: "Critical",
    stage: 2,
    location: "Lucknow",
    source: "1930 helpline",
    unit: missions[0].unit,
    createdAt: timestamp,
    amount: 50000,
    frozen: 38500,
    summary:
      "A synthetic complaint reports ₹50,000 transferred to an impersonated merchant. Review the extracted UTR and beneficiary details before preparing institution requests.",
    insights: [
      {
        text: "Two onward transfers suggest a possible mule-account chain. This hypothesis needs transaction verification.",
        confidence: "Medium · unverified",
        source: "Sample transaction ledger",
      },
      {
        text: "₹38,500 is marked frozen in the sample bank acknowledgement.",
        confidence: "Verified sample",
        source: "Sample acknowledgement ACK-1042",
      },
    ],
    entities: [
      { label: "Transaction amount", value: "₹50,000", confidence: "High" },
      {
        label: "UPI identifier",
        value: "sample-merchant@upi",
        confidence: "High",
      },
      { label: "UTR", value: "DEMO-UTR-1042", confidence: "High" },
      {
        label: "Beneficiary bank",
        value: "Sample Bank B",
        confidence: "Needs verification",
      },
    ],
    evidence: [
      {
        name: "Payment receipt",
        type: "Transaction record",
        status: "Preserved",
        source: "Synthetic citizen submission",
        time: "10:12 IST",
      },
      {
        name: "Bank acknowledgement",
        type: "Document",
        status: "Reviewed",
        source: "Synthetic bank response",
        time: "10:14 IST",
      },
    ],
    actions: [
      {
        agency: "Sample Bank A",
        task: "Verify debit transaction",
        status: "Acknowledged",
      },
      {
        agency: "Sample Bank B",
        task: "Beneficiary freeze request",
        status: "₹38,500 frozen (sample)",
      },
      {
        agency: "Cyber Police Station",
        task: "Assign financial investigator",
        status: "Pending",
      },
    ],
    timeline: [
      { time: "10:12 IST", text: "Synthetic 1930 complaint captured" },
      { time: "10:13 IST", text: "Transaction entities extracted for review" },
      { time: "10:14 IST", text: "Sample bank acknowledgement recorded" },
    ],
    outcome:
      "Review bank confirmation and assign investigation. ₹38,500 frozen in sample records.",
    isDemo: true,
  },
  {
    id: "US4C-2026-1041",
    title: "Repeated threats from impersonation accounts",
    mission: "safety",
    priority: "Critical",
    stage: 2,
    location: "Kanpur",
    source: "Citizen portal",
    unit: missions[1].unit,
    createdAt: timestamp,
    amount: 0,
    frozen: 0,
    summary:
      "Synthetic harassment report involving repeated contact and an address reference. Keep victim protection alongside evidence review; identity details are restricted.",
    insights: [
      {
        text: "Threatening language and a location reference require immediate human assessment.",
        confidence: "High · unverified",
        source: "Sample message transcript",
      },
      {
        text: "Two profiles share an alias. Identity linkage is not established.",
        confidence: "Medium",
        source: "Sample profile metadata",
      },
    ],
    entities: [
      {
        label: "Victim category",
        value: "Protected identity",
        confidence: "Restricted",
      },
      {
        label: "Platform",
        value: "Sample social platform",
        confidence: "Reported",
      },
      {
        label: "Related aliases",
        value: "2 sample profiles",
        confidence: "Needs verification",
      },
    ],
    evidence: [
      {
        name: "Threat message screenshots",
        type: "Image",
        status: "Preserved",
        source: "Synthetic complainant",
        time: "10:08 IST",
      },
      {
        name: "Profile URLs",
        type: "URL",
        status: "Preservation pending",
        source: "Synthetic complainant",
        time: "10:09 IST",
      },
    ],
    actions: [
      {
        agency: "Women Safety Cell",
        task: "Protection review and outreach",
        status: "Pending",
      },
      {
        agency: "Local Police",
        task: "Review immediate physical threat",
        status: "Pending",
      },
      {
        agency: "Platform Liaison",
        task: "Prepare preservation request",
        status: "Draft",
      },
    ],
    timeline: [
      { time: "10:08 IST", text: "Synthetic complaint registered" },
      { time: "10:09 IST", text: "Evidence attached for operator review" },
    ],
    outcome:
      "Protection review required; preserve evidence before authorised platform action.",
    isDemo: true,
  },
  {
    id: "US4C-2026-1040",
    title: "Rapidly circulating video · context verification",
    mission: "content",
    priority: "High",
    stage: 1,
    location: "Varanasi",
    source: "Analyst referral",
    unit: missions[2].unit,
    createdAt: timestamp,
    amount: 0,
    frozen: 0,
    summary:
      "A synthetic video report requires context verification. Review original media, transcript and distribution indicators before classification or platform process.",
    insights: [
      {
        text: "A location appears in the sample transcript, but recording time and location remain unverified.",
        confidence: "Medium",
        source: "Sample Hindi transcript",
      },
      {
        text: "1,286 shares are a demonstration count, not measured platform activity.",
        confidence: "Sample metric",
        source: "Synthetic propagation dataset",
      },
    ],
    entities: [
      { label: "Language", value: "Hindi", confidence: "High" },
      { label: "Duration", value: "01:42", confidence: "Sample metadata" },
      {
        label: "Related clusters",
        value: "3 sample clusters",
        confidence: "Needs review",
      },
    ],
    evidence: [
      {
        name: "Reported content URL",
        type: "URL",
        status: "Archived (sample)",
        source: "Synthetic referral",
        time: "09:56 IST",
      },
      {
        name: "Transcript and key frames",
        type: "Document",
        status: "Review pending",
        source: "Synthetic analysis output",
        time: "09:57 IST",
      },
    ],
    actions: [
      {
        agency: "Threat Intelligence Hub",
        task: "Verify source and context",
        status: "Pending",
      },
      {
        agency: "Command Supervisor",
        task: "Review classification",
        status: "Pending",
      },
      {
        agency: "Platform Liaison",
        task: "Prepare authorised request if warranted",
        status: "Not initiated",
      },
    ],
    timeline: [
      { time: "09:56 IST", text: "Synthetic content referral received" },
      { time: "09:57 IST", text: "Sample transcript ready for analyst review" },
    ],
    outcome:
      "Analyst verification pending. No enforcement decision has been made.",
    isDemo: true,
  },
  {
    id: "US4C-2026-1039",
    title: "Credible digital distress · welfare coordination",
    mission: "distress",
    priority: "Critical",
    stage: 3,
    location: "Prayagraj",
    source: "Citizen referral",
    unit: missions[3].unit,
    createdAt: timestamp,
    amount: 0,
    frozen: 0,
    summary:
      "A synthetic distress referral includes an immediate-time reference. A human reviewer must validate urgency and location before recording emergency coordination.",
    insights: [
      {
        text: "Immediacy and distress language require human review, not an automated diagnosis.",
        confidence: "High · unverified",
        source: "Sample reported post",
      },
      {
        text: "A reported landmark suggests an approximate 300 m area. Location is not verified.",
        confidence: "Medium",
        source: "Synthetic reporter statement",
      },
    ],
    entities: [
      {
        label: "Location confidence",
        value: "Approx. 300 m · unverified",
        confidence: "Medium",
      },
      {
        label: "Contact information",
        value: "Restricted in demonstration",
        confidence: "Reported",
      },
      {
        label: "Review gate",
        value: "Human review required",
        confidence: "Mandatory",
      },
    ],
    evidence: [
      {
        name: "Reported distress signal",
        type: "Text",
        status: "Preserved",
        source: "Synthetic citizen referral",
        time: "09:48 IST",
      },
      {
        name: "Reported landmark",
        type: "Location note",
        status: "Needs verification",
        source: "Synthetic reporter",
        time: "09:49 IST",
      },
    ],
    actions: [
      {
        agency: "Command Supervisor",
        task: "Validate urgent welfare response",
        status: "Acknowledged",
      },
      {
        agency: "Patrol P-23 · sample",
        task: "Welfare-check coordination · 1.8 km",
        status: "Pending",
      },
      {
        agency: "Ambulance A-09 · sample",
        task: "Medical-resource coordination · 3.1 km",
        status: "Pending",
      },
    ],
    timeline: [
      { time: "09:48 IST", text: "Synthetic referral received" },
      { time: "09:50 IST", text: "Sample supervisor acknowledgement recorded" },
    ],
    outcome:
      "Individual welfare, support referral and follow-up remain pending.",
    isDemo: true,
  },
];
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
