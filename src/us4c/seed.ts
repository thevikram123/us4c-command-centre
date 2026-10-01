import type { Case, Mission } from "./data";
const units: Record<Mission, string> = {
  fraud: "Cyber Investigation & Technical Operations",
  safety: "Complaint Monitoring Unit",
  content: "Cyber Threat Intelligence & Monitoring Hub",
  distress: "Emergency Coordination Desk",
};
function incident(
  input: Partial<Case> & Pick<Case, "id" | "title" | "mission" | "summary">,
): Case {
  return {
    priority: "High",
    stage: 0,
    location: "Lucknow",
    source: "Citizen portal",
    unit: units[input.mission],
    createdAt: "2026-10-01T04:42:00.000Z",
    amount: 0,
    frozen: 0,
    insights: [],
    entities: [],
    evidence: [],
    actions: [],
    timeline: [],
    outcome: "Investigation open; outcome pending.",
    isDemo: true,
    ...input,
  };
}
// Fictional, masked training casework. The workspace banner identifies the exercise environment once.
export const operationalCases: Case[] = [
  incident({
    id: "US4C-2026-1042",
    title: "Merchant impersonation · UPI fund diversion",
    mission: "fraud",
    priority: "Critical",
    source: "1930 helpline",
    amount: 50000,
    frozen: 38500,
    summary:
      "The complainant received a payment-verification call and transferred ₹50,000 at 09:58 IST. The receipt names Aarav Enterprises; the beneficiary response lists Aarav Enterprises Services. Two onward transfers require reconciliation. The nodal response records ₹38,500 on hold under ACK/FI/1042/02.",
    entities: [
      {
        label: "Payment handle",
        value: "aarav.pay@upi",
        confidence: "Receipt extracted; review pending",
      },
      {
        label: "UTR reference",
        value: "UTR/20261001/1042",
        confidence: "Receipt reference",
      },
      {
        label: "Beneficiary account",
        value: "••4821",
        confidence: "Institution response",
      },
      {
        label: "Amount on hold",
        value: "₹38,500 · ACK/FI/1042/02",
        confidence: "Acknowledgement recorded",
      },
    ],
    insights: [
      {
        text: "Primary receipt and institution response share the payment handle; their legal-name suffixes differ. Resolve the identity before merging the records.",
        confidence: "Requires review",
        source: "E-01 / E-02",
      },
      {
        text: "Onward transfers of ₹31,500 and ₹7,000 leave ₹11,500 of the original debit to reconcile.",
        confidence: "Ledger finding",
        source: "E-03 transaction extract",
      },
    ],
    evidence: [
      {
        name: "Debit receipt · UTR/20261001/1042",
        type: "Payment receipt",
        status: "Preserved",
        source: "Citizen submission / E-01",
        time: "10:12 IST",
      },
      {
        name: "Beneficiary response · ACK/FI/1042/02",
        type: "Institution response",
        status: "Review pending",
        source: "Financial liaison register / E-02",
        time: "10:14 IST",
      },
      {
        name: "Onward transaction extract",
        type: "Ledger",
        status: "Review pending",
        source: "Investigator worksheet / E-03",
        time: "10:16 IST",
      },
    ],
    actions: [
      {
        agency: "Remitter bank nodal desk",
        task: "Confirm debit UTR, timestamp and complainant account ownership",
        status: "Acknowledged",
      },
      {
        agency: "Beneficiary bank nodal desk",
        task: "Reconcile ₹38,500 hold and identify onward transfer destinations",
        status: "Pending",
      },
      {
        agency: "Financial Investigation Team",
        task: "Assign investigator and preserve the transaction trail",
        status: "Pending",
      },
    ],
    timeline: [
      {
        time: "10:12 IST",
        text: "1930 complaint registered; payment receipt preserved",
      },
      {
        time: "10:14 IST",
        text: "Nodal acknowledgement ACK/FI/1042/02 attached",
      },
      { time: "10:16 IST", text: "Onward transfer reconciliation assigned" },
    ],
    outcome:
      "₹38,500 hold recorded; ₹11,500 and downstream funds require reconciliation.",
  }),
  incident({
    id: "US4C-2026-1041",
    title: "Account impersonation · repeated threats and address disclosure",
    mission: "safety",
    priority: "Critical",
    location: "Kanpur",
    summary:
      "The complainant reports threatening messages between 21:14 yesterday and 09:46 today from @northlane.help and @northlane.support. One message includes a residential-area reference. Preserve the message chain, keep the victim identity restricted, and review immediate protection before attempting identity linkage.",
    entities: [
      {
        label: "Reported accounts",
        value: "@northlane.help / @northlane.support",
        confidence: "Reported profile URLs",
      },
      {
        label: "Threat window",
        value: "30 Sep 21:14–01 Oct 09:46 IST",
        confidence: "Screenshots recorded",
      },
      {
        label: "Victim identity",
        value: "Restricted · V-1041",
        confidence: "Protection desk access",
      },
      {
        label: "Safe contact",
        value: "Assigned women safety officer",
        confidence: "Complainant preference",
      },
    ],
    insights: [
      {
        text: "A shared display name does not establish that the two accounts belong to one person. Compare the preserved primary identifiers.",
        confidence: "Identity unresolved",
        source: "E-02 profile archive",
      },
      {
        text: "Address disclosure and repeated threats require an immediate protection review alongside evidence preservation.",
        confidence: "Urgent operator review",
        source: "E-01 message chain",
      },
    ],
    evidence: [
      {
        name: "Threat message chain · 18 messages",
        type: "Screenshots",
        status: "Preserved",
        source: "Complainant submission / E-01",
        time: "10:08 IST",
      },
      {
        name: "Profile URL archive · 2 accounts",
        type: "Profile records",
        status: "Review pending",
        source: "Analyst capture / E-02",
        time: "10:09 IST",
      },
    ],
    actions: [
      {
        agency: "Women Safety Cell",
        task: "Confirm safe contact method and document immediate protection plan",
        status: "Pending",
      },
      {
        agency: "Jurisdiction officer",
        task: "Assess physical threat and address-disclosure risk",
        status: "Pending",
      },
      {
        agency: "Platform Liaison",
        task: "Prepare evidence-preservation reference and retain account URLs",
        status: "Draft",
      },
    ],
    timeline: [
      {
        time: "10:08 IST",
        text: "Complaint registered with restricted victim reference V-1041",
      },
      { time: "10:09 IST", text: "Message chain and profile URLs preserved" },
    ],
    outcome:
      "Protection review pending; account attribution remains unconfirmed.",
  }),
  incident({
    id: "US4C-2026-1040",
    title: "Reposted video · disputed location and event context",
    mission: "content",
    location: "Varanasi",
    source: "Threat intelligence referral",
    summary:
      "A 01:42 Hindi video is circulating with a caption claiming a current local incident. The archive contains an earlier upload at 17:18 yesterday. Review key frames, transcript and original-post context before classifying the claim. Six archived posts are grouped into three publisher clusters.",
    entities: [
      {
        label: "Language / duration",
        value: "Hindi · 01:42",
        confidence: "Media metadata",
      },
      {
        label: "Earlier upload",
        value: "OSINT/0930/16 · 30 Sep 17:18",
        confidence: "Archive reference",
      },
      {
        label: "Distribution records",
        value: "6 archived posts / 3 publisher groups",
        confidence: "Case archive count",
      },
      {
        label: "Claimed location",
        value: "Varanasi",
        confidence: "Caption claim; unverified",
      },
    ],
    insights: [
      {
        text: "The earlier upload and current caption may refer to different events. Compare source frames before recording a context mismatch.",
        confidence: "Analyst hypothesis",
        source: "E-01 / E-02",
      },
      {
        text: "Reposts with identical content identifiers should merge as content objects while publisher identities remain separate.",
        confidence: "Resolution rule",
        source: "Propagation worksheet",
      },
    ],
    evidence: [
      {
        name: "Reported post and caption archive",
        type: "Archived URL",
        status: "Preserved",
        source: "Intelligence referral / E-01",
        time: "09:56 IST",
      },
      {
        name: "Earlier upload, key frames and Hindi transcript",
        type: "Media analysis",
        status: "Review pending",
        source: "OSINT/0930/16 / E-02",
        time: "09:57 IST",
      },
      {
        name: "Six-post propagation worksheet",
        type: "Publisher records",
        status: "Review pending",
        source: "Analyst worksheet / E-03",
        time: "10:01 IST",
      },
    ],
    actions: [
      {
        agency: "Threat Intelligence Hub",
        task: "Verify source chronology and claimed location",
        status: "Pending",
      },
      {
        agency: "Command Supervisor",
        task: "Review classification rationale and recommended response",
        status: "Pending",
      },
      {
        agency: "Platform Liaison",
        task: "Prepare platform request only after the supervisor decision",
        status: "Not initiated",
      },
    ],
    timeline: [
      {
        time: "09:56 IST",
        text: "Intelligence referral received; source URL archived",
      },
      {
        time: "09:57 IST",
        text: "Earlier upload identified for context review",
      },
    ],
    outcome:
      "Context verification open; platform action has not been authorised.",
  }),
  incident({
    id: "US4C-2026-1039",
    title: "Urgent welfare concern · contact and location confirmation",
    mission: "distress",
    priority: "Critical",
    location: "Prayagraj",
    source: "Family referral",
    summary:
      "A family member reports an immediate welfare concern after a message received at 09:41 IST. The last known landmark is the riverfront access road near Sector 4. Confirm the contact and operational location, record supervisor review, and coordinate patrol and medical resources without delaying urgent protection for identity fusion.",
    entities: [
      {
        label: "Protected person reference",
        value: "R-1039",
        confidence: "Restricted contact details",
      },
      {
        label: "Last contact",
        value: "01 Oct · 09:41 IST",
        confidence: "Reporter statement",
      },
      {
        label: "Reported landmark",
        value: "Riverfront access road · Sector 4",
        confidence: "Location confirmation pending",
      },
      {
        label: "Resources proposed",
        value: "Patrol P-23 / Ambulance A-09",
        confidence: "Awaiting acknowledgement",
      },
    ],
    insights: [
      {
        text: "The immediate-time reference warrants urgent human assessment and contact attempts.",
        confidence: "Urgent review",
        source: "E-01 referral statement",
      },
      {
        text: "The reported landmark is an area clue; do not treat it as a precise or verified coordinate.",
        confidence: "Location unresolved",
        source: "E-02 reporter location note",
      },
    ],
    evidence: [
      {
        name: "Family referral statement and message extract",
        type: "Text record",
        status: "Preserved",
        source: "Referral register / E-01",
        time: "09:48 IST",
      },
      {
        name: "Last-known location and contact notes",
        type: "Location record",
        status: "Review pending",
        source: "Reporter statement / E-02",
        time: "09:49 IST",
      },
    ],
    actions: [
      {
        agency: "Command Supervisor",
        task: "Validate urgent response and record contact attempts",
        status: "Acknowledged",
      },
      {
        agency: "Patrol P-23",
        task: "Confirm response area, acknowledge assignment and record welfare contact",
        status: "Pending",
      },
      {
        agency: "Ambulance A-09",
        task: "Confirm medical standby availability and handover protocol",
        status: "Pending",
      },
    ],
    timeline: [
      {
        time: "09:48 IST",
        text: "Urgent referral recorded; contact verification initiated",
      },
      { time: "09:50 IST", text: "Supervisor review acknowledged" },
    ],
    outcome: "Welfare contact and verified response location pending.",
  }),
  incident({
    id: "US4C-2026-1038",
    title: "Courier impersonation · remote-access payment request",
    mission: "fraud",
    location: "Jaipur",
    source: "1930 helpline",
    amount: 18750,
    frozen: 12300,
    summary:
      "A caller posing as a courier representative requested a remote-access installation and a clearance payment. ₹18,750 was debited in two transactions. A ₹12,300 hold acknowledgement is attached; reconcile the second beneficiary and preserve the caller and payment identifiers.",
    entities: [
      {
        label: "Debits",
        value: "₹12,300 + ₹6,450",
        confidence: "Receipt references",
      },
      {
        label: "Beneficiary handle",
        value: "parcelassist.pay@upi",
        confidence: "Reported receipt",
      },
      {
        label: "Hold reference",
        value: "ACK/FI/1038/01",
        confidence: "Recorded acknowledgement",
      },
    ],
    evidence: [
      {
        name: "Two debit receipts",
        type: "Transaction records",
        status: "Preserved",
        source: "Citizen submission / E-01",
        time: "09:32 IST",
      },
      {
        name: "Caller message and installation link",
        type: "Messages",
        status: "Preserved",
        source: "Citizen submission / E-02",
        time: "09:35 IST",
      },
    ],
    actions: [
      {
        agency: "Financial liaison",
        task: "Reconcile second beneficiary and hold acknowledgement",
        status: "Pending",
      },
    ],
    timeline: [
      {
        time: "09:32 IST",
        text: "Complaint registered; two debit receipts attached",
      },
    ],
    outcome:
      "₹12,300 hold recorded; ₹6,450 beneficiary reconciliation pending.",
  }),
  incident({
    id: "US4C-2026-1037",
    title: "Impersonation profile · evidence preserved and protection handover",
    mission: "safety",
    priority: "Medium",
    stage: 5,
    location: "Bhopal",
    summary:
      "A profile impersonating the complainant was documented with the original URL and archived message references. The protection desk completed safe outreach and handed the investigation to the jurisdiction officer.",
    entities: [
      {
        label: "Protection reference",
        value: "PROT/1037/04",
        confidence: "Handover recorded",
      },
    ],
    evidence: [
      {
        name: "Profile URL and message archive",
        type: "Profile archive",
        status: "Reviewed",
        source: "Protection desk register",
        time: "08:38 IST",
      },
    ],
    actions: [
      {
        agency: "Women Safety Cell",
        task: "Safe outreach and protection handover",
        status: "Completed",
      },
      {
        agency: "Jurisdiction officer",
        task: "Acknowledge evidence and follow-up assignment",
        status: "Completed",
      },
    ],
    timeline: [
      { time: "08:38 IST", text: "Evidence archived" },
      {
        time: "09:22 IST",
        text: "Protection handover recorded under PROT/1037/04",
      },
    ],
    outcome:
      "Safe outreach completed; jurisdiction officer accepted handover. Follow-up: Protection Desk, 02 Oct 11:00 IST.",
  }),
  incident({
    id: "US4C-2026-1036",
    title: "False evacuation notice · source review and public advisory",
    mission: "content",
    priority: "Medium",
    stage: 5,
    location: "Indore",
    source: "Analyst referral",
    summary:
      "A reposted evacuation notice was checked against its original archived date and the jurisdiction desk response. The supervisor approved an advisory clarifying the outdated notice.",
    entities: [
      {
        label: "Advisory reference",
        value: "ADV/1036/02",
        confidence: "Supervisor decision recorded",
      },
    ],
    evidence: [
      {
        name: "Original notice and repost archive",
        type: "Archived documents",
        status: "Reviewed",
        source: "Intelligence archive",
        time: "08:12 IST",
      },
    ],
    actions: [
      {
        agency: "Threat Intelligence Hub",
        task: "Verify original publication date",
        status: "Completed",
      },
      {
        agency: "Command Supervisor",
        task: "Approve context clarification advisory",
        status: "Completed",
      },
    ],
    timeline: [
      { time: "08:12 IST", text: "Original notice date verified" },
      { time: "08:54 IST", text: "Advisory approved under ADV/1036/02" },
    ],
    outcome:
      "Outdated context confirmed; clarification advisory approved. Follow-up: Intelligence Hub, monitor new reposts through 02 Oct.",
  }),
  incident({
    id: "US4C-2026-1035",
    title: "Welfare referral · contact established and support handover",
    mission: "distress",
    priority: "High",
    stage: 5,
    location: "Nagpur",
    source: "Family referral",
    summary:
      "The responder established contact after a family referral and completed a welfare check. The supervisor recorded a support-service handover and the family contact preference.",
    entities: [
      {
        label: "Handover reference",
        value: "WEL/1035/03",
        confidence: "Response log recorded",
      },
    ],
    evidence: [
      {
        name: "Referral and responder contact log",
        type: "Response log",
        status: "Reviewed",
        source: "Emergency coordination register",
        time: "07:46 IST",
      },
    ],
    actions: [
      {
        agency: "Response supervisor",
        task: "Confirm welfare contact and support handover",
        status: "Completed",
      },
      {
        agency: "Support liaison",
        task: "Record follow-up appointment and contact preference",
        status: "Completed",
      },
    ],
    timeline: [
      { time: "07:46 IST", text: "Referral received" },
      {
        time: "08:31 IST",
        text: "Welfare contact confirmed; support handover recorded",
      },
    ],
    outcome:
      "Contact established and support handover accepted. Follow-up: Support Liaison, 02 Oct 10:30 IST.",
  }),
];
