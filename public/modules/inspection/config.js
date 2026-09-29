/*
 * Inspection module – configuration
 * ---------------------------------
 * Edit this file to change the starting organizations, the inspection types
 * and the checklist. No build step is needed; just save and refresh.
 *
 * Organizations listed here are only used the FIRST time the app runs against
 * an empty server (no data/inspections.json yet). After that, organizations
 * live on the server and new ones are added from the "Add organization" button
 * on the Organizations page.
 */
window.INSPECTION_CONFIG = {
  // Where the "Home" breadcrumb link goes (your site's home page).
  homeUrl: "index.html",

  // Starting list shown on the Organizations page.
  organizations: [
    { name: "Coal India Limited", code: "CIL" },
    { name: "Eastern Coalfields Limited", code: "ECL" },
    { name: "Bharat Coking Coal Limited", code: "BCCL" },
    { name: "Central Coalfields Limited", code: "CCL" },
    { name: "Northern Coalfields Limited", code: "NCL" },
    { name: "Western Coalfields Limited", code: "WCL" },
    { name: "South Eastern Coalfields Limited", code: "SECL" },
    { name: "Mahanadi Coalfields Limited", code: "MCL" },
    { name: "North Eastern Coalfields", code: "NEC" }
  ],

  inspectionTypes: [
    "Routine inspection",
    "Surprise inspection",
    "Follow-up inspection",
    "Post-incident inspection",
    "Special audit"
  ],

  /*
   * Checklist shown in the "new inspection" form.
   *   id         unique key (do not reuse an id for a different question)
   *   label      text shown to the inspecting officer
   *   issueWhen  "unchecked" (default): an unticked box is reported as an issue
   *              "checked":             a ticked box is reported as an issue
   *   hint       optional small text under the label
   */
  checklist: [
    { id: "equipment", label: "Equipment inspection completed" },
    { id: "emergency", label: "Emergency equipment checked" },
    { id: "training",  label: "Safety training completed" },
    { id: "fire",      label: "Fire safety inspection overdue", issueWhen: "checked", hint: "Tick if the fire safety inspection is overdue." },
    { id: "incident",  label: "Incident reports submitted" }
  ],

  otherIssueLabel: "Report any other issue"
};
