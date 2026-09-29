/* Menu + dashboard data. Edit here to change sidebar items, badges or the sample mines on Overview. */
window.SITE = {
  user: { name: 'R. Sengupta', role: 'Director, Corporate Safety', ini: 'RS' },
  notifications: 12,
  menu: [
    { t: 'Overview', p: '', i: 'grid' },
    { t: 'Compliance Tracker', p: 'compliance-tracker', i: 'check', badge: 37 },
    { t: 'Inspections', p: 'inspections', i: 'clock' },
    { t: 'AI Risk Analytics', p: 'ai-risk-analytics', i: 'chart' },
    { t: 'Field Reporting', p: 'field-reporting', i: 'pin' },
    { t: 'Contractor Management', p: 'contractor-management', i: 'users' },
    { t: 'GIS Compliance Map', p: 'gis-compliance-map', i: 'map' },
    { t: 'Reports & Escalations', p: 'reports-escalations', i: 'file', badge: 6 },
    { t: 'Secure Audit Trail', p: 'secure-audit-trail', i: 'lock' }
  ],
  settings: { t: 'Settings', p: 'settings', i: 'gear' },
  kpis: [
    { l: 'Total Coal Mines', v: 62, s: '▲ 62 Mines Live', c: 'red', h: 'index.html' },
    { l: 'Open violations', v: 37, s: '▲ 6 new this week', c: 'red', h: 'page.html?p=compliance-tracker' },
    { l: 'Inspections this month', v: 214, s: '▲ 18% vs target', c: 'green', h: 'page.html?p=inspections' },
    { l: 'Corrective actions overdue', v: 15, s: '4 past 30 days', c: 'amber', h: 'page.html?p=reports-escalations' },
    { l: 'Escalations pending sign-off', v: 6, s: '2 at DGMS level', c: 'ink', h: 'page.html?p=reports-escalations' }
  ],
  cats: ['Environment', 'Safety', 'Production', 'Licensing', 'Reclamation'],
  reqs: {
    Environment: [['ENV-01', 'Environmental clearance validity', 1], ['ENV-02', 'Air quality monitoring reports'], ['ENV-03', 'Water discharge within limits']],
    Safety: [['SAF-01', 'Statutory safety officer appointed', 1], ['SAF-02', 'Emergency response drill held'], ['SAF-03', 'Ventilation survey completed']],
    Production: [['PRD-01', 'Production within approved cap', 1], ['PRD-02', 'Monthly returns filed'], ['PRD-03', 'Royalty paid on time']],
    Licensing: [['LIC-01', 'Valid mining lease', 1], ['LIC-02', 'Environmental clearance validity', 1], ['LIC-03', 'Consent to Operate (State Pollution Control Board)']],
    Reclamation: [['REC-01', 'Mine closure plan approved', 1], ['REC-02', 'Progressive reclamation target met'], ['REC-03', 'Escrow deposit maintained']]
  },
  mines: [
    { k: 'I', n: 9, name: 'North Karanpura Coalfield', st: 'Jharkhand', lic: 'JH-MC-7761', sc: 48.7, v: 9, w: 2, pr: 1, cs: [10, 50, 100, 83.3, 0], o: { 'LIC-02': 'UNCERTAIN', 'LIC-03': 'PASS' } },
    { k: 'B', n: 2, name: 'Korba Coalfield', st: 'Chhattisgarh', lic: 'CG-MC-0871', sc: 51.3, v: 9, w: 3, pr: 2, cs: [30, 60, 80, 55, 20], o: {} },
    { k: 'F', n: 6, name: 'Wardha Valley Coalfield', st: 'Maharashtra', lic: 'MH-MC-4423', sc: 68.7, v: 5, w: 2, pr: 1, cs: [55, 70, 90, 70, 58], o: {} },
    { k: 'H', n: 8, name: 'Godavari Valley Coalfield', st: 'Andhra Pradesh', lic: 'AP-MC-2290', sc: 71.3, v: 4, w: 1, pr: 1, cs: [60, 75, 88, 75, 60], o: {} },
    { k: 'J', n: 10, name: 'Ib Valley Coalfield', st: 'Odisha', lic: 'OD-MC-5588', sc: 75.3, v: 3, w: 1, pr: 0, cs: [70, 80, 92, 78, 56], o: {} },
    { k: 'A', n: 1, name: 'Talcher Coalfield', st: 'Odisha', lic: 'OD-MC-1042', sc: 79.8, v: 2, w: 1, pr: 0, cs: [75, 85, 95, 80, 64], o: {} }
  ]
};
