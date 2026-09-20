/* ==========================================================================
   Site data. Edit this file to change menus, news items, links, etc.
   Menu item fields:
     t  = label            p  = page path (opens page.html?p=<path>)
     u  = external URL     hi = Hindi label (optional)
     c  = child items      wide = show the dropdown in two columns
     isNew = true adds a highlighted superscript "New" badge next to the label.
     hidden = true keeps the item out of the menu, sitemap and search.
              Delete `hidden: true` from an item to show it again.
   ========================================================================== */
window.SITE = {
  original: 'https://coal.gov.in/',
  files: 'https://coal.gov.in/sites/default/files/',
  theme: 'https://coal.gov.in/themes/custom/moc/assets/images/',

  menu: [
    { t: 'Home', p: '', hi: 'मुख्य पृष्ठ' },
    { t: 'About Us', p: 'about-us', hi: 'हमारे बारे में', c: [
      { t: 'About Ministry', p: 'about-us/about-ministry' },
      { t: 'Vision', p: 'about-us/vision' },
      { t: 'Mission', p: 'about-us/mission' },
      { t: 'History/Background', p: 'about-us/history-background' },
      { t: 'Functions and Responsibilities', p: 'about-us/functions-and-responsibilities' },
      { t: 'Ministers Profile', p: 'about-us/meet-minister' },
      { t: 'Senior Officials Details', p: 'about-us/details-senior-officials' },
      { t: 'Organization Chart', p: 'about-us/organization-chart' },
      { t: 'Agencies under Ministry', p: 'about-us/agencies-under-ministry' },
      { t: "Who's Who", p: 'about-us/whos-who' },
      { t: 'Standard Notes', p: 'about-us/standard-notes' }
    ]},
    { t: 'Compliance Tracker', p: 'compliance-tracker', isNew: true, c: [
      { t: 'Clearance compendium', p: 'compliance-tracker/compendium' },
      { t: 'Clearance report for coal mines', p: 'compliance-tracker/reports' },
      { t: 'Upload clearance report', p: 'compliance-tracker/upload' },
      { t: 'Login as admin', p: 'compliance-tracker/admin' }
    ]},
    { t: 'Inspections', p: 'inspections', isNew: true },
    { t: 'AI Risk Analytics', p: 'ai-risk-analytics', isNew: true },
    { t: 'Field Reporting', p: 'field-reporting', isNew: true },
    { t: 'Contractor Management', p: 'contractor-management', isNew: true },
    { t: 'GIS Compliance Map', p: 'gis-compliance-map', isNew: true },
    { t: 'Reports & Escalations', p: 'reports-escalations', isNew: true },
    { t: 'Secure Audit Trail', p: 'secure-audit-trail', isNew: true },
    { t: 'Major Statistics', p: 'major-statistics-page', hi: 'प्रमुख आँकड़े', wide: true, c: [
      { t: 'Coal – Indian Energy Choice', p: 'major-statistics/coal-indian-energy-choice' },
      { t: 'Monthly Statistics at a glance', p: 'public-information/monthly-statistics-at-glance' },
      { t: 'Production and Supplies', p: 'major-statistics/production-and-supplies' },
      { t: 'Statistical Report', p: 'public-information/statistical-report' },
      { t: 'Quarterly Report', p: 'major-statistics/quarterly-booklet' },
      { t: 'Estimated Coal Projection', p: 'major-statistics/coal-demand-projections' },
      { t: 'Over burden Removal (OBR)', p: 'major-statistics/obr' },
      { t: 'Output per Man Shift (OMS)', p: 'major-statistics/output-per-man-shift' },
      { t: 'Import and Export', p: 'major-statistics/import-and-export' },
      { t: 'Generation of Thermal Power from Raw Coal', p: 'major-statistics/generation-of-thermal-power-from-raw-coal' },
      { t: 'Coal & Lignite Resource', p: 'major-statistics/coal-reserves' },
      { t: 'Coal Grades', p: 'major-statistics/coal-grades' },
      { t: 'Mission Coking Coal', p: 'major-statistics/mission-coking-coal' },
      { t: 'Grading of Coal', p: 'major-statistics/grading-coal' },
      { t: 'Coal Evacuation Plan', p: 'major-statistics/coal-evacuation-plan' },
      { t: 'RSR Report', p: 'major-statistics/rsr-report' },
      { t: 'Coal Statistics', p: 'major-statistics/coal-statistics' },
      { t: 'Clearances (EC/FC/WLC/GWC)', p: 'major-statistics/Clearances' }
    ]},
    { t: 'Organisations', p: 'organisations', hi: 'संगठन' },
    { t: 'Sustainability', p: 'sustainable-development-cell', hi: 'स्थिरता', c: [
      { t: 'About SDC', p: 'sustainable-development-cell/about-sdc' },
      { t: 'Mine Water Utilization', p: 'sustainable-development-cell/mine-water-utilization' },
      { t: 'Greening Initiatives', p: 'sustainable-development-cell/greening-initiatives' },
      { t: 'Promoting Renewable - Moving towards net zero carbon', p: 'sustainable-development-cell/promoting-renewable' },
      { t: 'Eco - Tourism in mining area', p: 'sustainable-development-cell/eco-tourism-in-mining-area' },
      { t: 'Air Quality Management', p: 'sustainable-development-cell/air-quality-management' },
      { t: 'Gainful Utilization of Overburden', p: 'sustainable-development-cell/gainful-utilization' },
      { t: 'Energy Efficiency Measures', p: 'sustainable-development-cell/energy-efficiency' },
      { t: 'Guidelines & Report', p: 'sustainable-development-cell/report' },
      { t: 'Videos', p: 'sustainable-development-cell/sdc-videoes' }
    ]},
    { t: 'Nominated Authority', p: 'nominated-authority', hi: 'नामित प्राधिकारी', wide: true, c: [
      { t: 'About NA', p: 'nominated-authority/about-na' },
      { t: 'Auction/Allotment', p: 'nominated-authority/auction-allotment' },
      { t: 'Allocation Tranche-Wise', p: 'nominated-authority/allocation-tranche-wise' },
      { t: 'Compensation Orders', p: 'nominated-authority/sanction-order-notice' },
      { t: 'Termination Order', p: 'nominated-authority/termination-order' },
      { t: 'Scrutiny Committee', p: 'nominated-authority/review-meeting-scrutiny-committee' },
      { t: 'Production Reviews', p: 'nominated-authority/production-reviews' },
      { t: 'Operationalisation Reviews', p: 'nominated-authority/operationalisation-reviews' },
      { t: 'Single Window System', p: 'nominated-authority/single-window-system' },
      { t: 'National Coal Index', p: 'nominated-authority/national-coal-index' },
      { t: 'National Lignite Index', p: 'nominated-authority/national-lignite' },
      { t: 'Coal Block Information', p: 'nominated-authority/coal-block-information' },
      { t: 'Vacancy', p: 'nominated-authority/vacancy' },
      { t: 'Tender', p: 'nominated-authority/tender-na' },
      { t: 'Technical Help Desk', p: 'technical-help-desk' },
      { t: 'Energy Cell', p: 'nominated-authority/energy-cell' }
    ]},
    { t: 'Public Information', p: 'public-information', hi: 'सार्वजनिक सूचना', wide: true, c: [
      { t: 'Monthly Summary for Cabinet', p: 'public-information/monthly-summary-cabinets' },
      { t: 'Minutes of Meetings', p: 'public-information/minutes-metings', c: [
        { t: 'Standing Linkage Committee (LT)', p: 'public-information/standing-linkage-committee1' }
      ]},
      { t: 'Reports', p: 'public-information/reports', c: [
        { t: 'Annual Reports', p: 'public-information/reports/annual-reports' },
        { t: 'Budget Reports', p: 'public-information/reports/budget-reports' },
        { t: 'Critical and Super Critical Coal Stocks', p: 'public-information/critical-and-Super-critical-coal-stocks' },
        { t: 'Other Reports', p: 'public-information/reports/other-reports' }
      ]},
      { t: 'Public Grievance Cell', p: 'public-information/public-grievance-cell' },
      { t: 'Success Stories', p: 'public-information/success-storie' },
      { t: 'Mines summary', p: 'public-information/mine-summary' },
      { t: 'Advertisements', p: 'public-information/advertisements' },
      { t: 'Citizen Charter', p: 'public-information/citizen-charters' },
      { t: 'Action Plan', p: 'public-information/action-plan' },
      { t: 'Grant-in-Aid', p: 'public-information/grant-in-aid' },
      { t: 'Monthly Reports for Cabinet', p: 'public-information/monthly-report-cabinet' },
      { t: 'Paper Laid on the Table', p: 'public-information/paper-laid-table' },
      { t: 'Standard Operating Procedure', p: 'public-information/sop' }
    ]},
    { t: 'RTI', hidden: true, p: 'rti', hi: 'सूचना का अधिकार', c: [
      { t: 'Right To Information Portal', u: 'https://rti.gov.in/' },
      { t: 'PIO Details of Ministry of Coal', p: 'rti/pio-details-of-ministry-coal' },
      { t: 'Proactive disclosures on RTI Act from Ministry of Coal', p: 'rti/proactive-disclosures-rti-act-ministry-of-coal' }
    ]},
    { t: 'Tenders', hidden: true, p: 'tenders', hi: 'निविदाएँ' },
    { t: 'Media', hidden: true, p: 'media', hi: 'मीडिया', c: [
      { t: 'Press Releases (PIB)', u: 'https://www.pib.gov.in/allRel.aspx?reg=48&lang=1' },
      { t: 'Press Releases (MOC)', p: 'media/press-release' },
      { t: 'Photo Gallery', p: 'media/photo-gallery' }
    ]},
    { t: 'Parliament Q&A', hidden: true, p: 'parliament-qa', hi: 'संसद प्रश्नोत्तर', c: [
      { t: 'Lok Sabha', u: 'https://sansad.in/ls/questions/questions-and-answers' },
      { t: 'Rajya Sabha', u: 'https://sansad.in/rs/questions/questions-and-answers' }
    ]},
    { t: 'Contact Us', hidden: true, p: 'contact-us', hi: 'संपर्क करें', c: [
      { t: 'Contact Us', p: 'contact-us' }
    ]},
    { t: 'Acts & Policies', hidden: true, p: 'acts-rules-policies', hi: 'अधिनियम और नीतियाँ' },
    { t: 'Coal Gasification', hidden: true, p: 'major-statistics/national-coal-gasification-mission', hi: 'कोयला गैसीकरण' },
    { t: 'Safety in Coal Mines', hidden: true, p: 'about-safety-coal-mines', hi: 'कोयला खदानों में सुरक्षा', c: [
      { t: 'About Safety', p: 'major-statistics/safety-coal-mines' },
      { t: 'Safety Staistics', p: 'safety-coal-mines/safety-staistics' },
      { t: 'Accident Portal', p: 'safety-coal-mines/accident-portal' },
      { t: 'Safety Initiatives', p: 'safety-coal-mines/safety-initiatives' }
    ]},
    { t: 'Technology Roadmap', hidden: true, p: 'techno-roadmap-coal-sector', hi: 'प्रौद्योगिकी रोडमैप' },
    { t: 'Achievements Flipbook', hidden: true, p: 'achievements-flipbook', hi: 'उपलब्धियाँ फ्लिपबुक' },
    { t: 'CSR', hidden: true, p: 'CSR', hi: 'सीएसआर', c: [
      { t: 'About CSR', p: 'CSR/about-csr' },
      { t: 'Guidelines', p: 'CSR/guidelines' },
      { t: 'Photo Gallery', u: 'https://coal.gov.in/sites/default/files/2024-03/15-03-2024csr.pdf' }
    ]},
    { t: 'Central Sector Schemes', hidden: true, p: 'central-sector-schemes', hi: 'केंद्रीय क्षेत्र की योजनाएँ' },
    { t: 'Chintan Shivir', hidden: true, p: 'chintan-shivir', hi: 'चिंतन शिविर' },
    { t: 'Procurement Projection', hidden: true, p: 'procurement-projection', hi: 'खरीद प्रक्षेपण' }
  ],

  headerLogos: [
    { t: 'Coal Mine Surveillance and Management System', img: 'cmsms.png', u: 'https://coal.pmgatishakti.gov.in/CMSS/login/' },
    { t: 'Coal Block Information Portal (CBIP) under PM Gatishakti', img: 'pmgatisakti.png', u: 'https://pmgatishakti.gov.in/pmgatishakti/login' },
    { t: 'Coal Auction', img: 'coalblock1.jpeg', u: 'https://www.mstcecommerce.com/auctionhome/coalblock/index.jsp' },
    { t: 'Swachh Bharat', img: 'swach-bharat.png', u: 'https://swachhbharatmission.ddws.gov.in/' }
  ],

  social: [
    { t: 'Facebook', u: 'https://www.facebook.com/CoalMinistry/' },
    { t: 'Instagram', u: 'https://www.instagram.com/ministryofcoal' },
    { t: 'Twitter', u: 'https://twitter.com/coalministry' },
    { t: 'LinkedIn', u: 'https://in.linkedin.com/company/ministry-of-coal-official' },
    { t: 'Threads', u: 'https://www.threads.net/@ministryofcoal' },
    { t: 'YouTube', u: 'https://www.youtube.com/@Coal_Ministry' }
  ],

  /* Banner slides (image paths are relative to `files`) */
  slides: [
    { img: '2022-09/juGajmc1gOVBUtt5.jpg', alt: 'Inviting ideas for Mann Ki Baat by Prime Minister Narendra Modi', u: 'https://cbpssubscriber.mygov.in/aff/nq6o67MNjzOALSL7' },
    { img: '2026-07/slider-img.jpeg', alt: 'India Mining Week 2026', u: 'https://indiaminingweek.org/' },
    { img: '2026-07/India-mining.jpeg', alt: 'Curtain Raiser Event of India Mining Week' },
    { img: '2026-07/Banner%20copy.jpg.jpeg', alt: 'Virtual Inauguration of Coal Neer Plants' },
    { img: '2025-11/flcm-img.jpeg', alt: 'Four Labour Codes Implemented' },
    { img: '2019-10/banner_1.jpg', alt: 'All India Coal Production' },
    { img: '2019-10/banner%202.jpg', alt: 'Standard Operating Procedure' },
    { img: '2024-06/New-Banner-copy.jpg', alt: 'Coal Block Auction', u: 'https://www.mstcecommerce.com/auctionhome/coalblock/index.jsp' },
    { img: '2019-10/banner%203.jpg', alt: 'Boon to Consumers' },
    { img: '2019-10/banner%204_0.jpg', alt: 'Coal Supply' }
  ],

  officials: [
    { name: 'Shri Narendra Modi', role: 'Hon’ble Prime Minister', img: 'styles/max_325x325/public/2019-09/prime-minister.jpg?itok=vyOyg2dM', u: 'https://www.pmindia.gov.in/en/' },
    { name: 'Shri G. Kishan Reddy', role: 'Hon’ble Union Minister of Coal and Mines, Govt. of India', img: 'styles/mhb/public/2026-08/minister_moc_jkd.jpg?itok=kD9xmNPj', p: 'minister/shri-g-kishan-reddy' },
    { name: 'Shri Satish Chandra Dubey', role: 'Hon’ble Minister of State for Coal and Mines, Govt. of India', img: 'styles/mhb/public/2026-08/minister_mos_scd.jpg?itok=W5ADG9Q0', p: 'minister/shri-satish-chandra-dubey' }
  ],

  /* [title, file path, size, date] — file paths are relative to `files` */
  whatsNew: [
    ['Notice for Pre-Application Conference (Round 2)', '2026-09/16-09-2026a-wn%20.pdf', '133.59 KB', '16/09/2026'],
    ['Powers Conferred under Section 24A of the Coal Mines (Special Provisions) Act, 2015', '2026-09/15-09-2026a-wn.pdf', '385.46 KB', '15/09/2026'],
    ['Comprehensive Corporate Social Responsibility (CSR) Framework for Indian Coal Companies - This is a guidance document only and not a statutory instrument', '2026-09/15-09-2026b-wn.pdf', '10.44 MB', '15/09/2026'],
    ['Scheme for Promotion of Surface Coal/Lignite Gasification Projects (₹37,500 Crore): Timeline of Round-2 Application Process-reg.', '2026-09/08-09-2026cg.pdf', '1.24 MB', '08/09/2026'],
    ['Responses to queries/suggestions regarding the Request for Proposals (RFP) dated 13.08.2026', '2026-09/07-09-2026b-wn.pdf', '790.67 KB', '07/09/2026'],
    ['National Lignite Index with Base Year 2021-22 for the month of July 2026', '2026-09/07-09-2026a-wn.pdf', '1.81 MB', '07/09/2026'],
    ['Opening of Applications under the ₹37,500 Crore Financial Incentive Scheme for Promotion of Surface Coal/Lignite Gasification Projects', '2026-09/03-09-2026b-wn.pdf', '205.51 KB', '03/09/2026'],
    ['Bank Account Details for Furnishing of Bank Guarantee/RTGS/NEFT under the ₹37,500 Crore Financial Incentive Scheme for Promotion of Surface Coal/Lignite Gasification Projects', '2026-09/03-09-2026a-wn.pdf', '99.73 KB', '03/09/2026'],
    ['Result of the interview of Young Professionals held from 17-18 August 2026 in Ministry of Coal - reg', '2026-09/02-09-2026a-wn.pdf', '1.42 MB', '02/09/2026'],
    ['RFPs seeking Financial Support for setting up Gasification Projects Notice for Pre-Bid Conference', '2026-08/21-08-2026a-wn.pdf', '97.45 KB', '21/08/2026'],
    ['Minutes of the meeting of the Standing Linkage Committee (Long-Term) for Power Sector- SLC(LT) No. 03/2026', '2026-08/20-08-2026a-wn.pdf', '4.85 MB', '20/08/2026'],
    ['Open Call for Nominations/ Applications for Appointment of Employee Representative (Non-Trade Union Category) on the Board of Trustees (BoT), CMPFO under Section 3A(1)(f) of CMPF & MP Act,1948.', '2026-08/18-08-2026a-wn.pdf', '2 MB', '18/08/2026'],
    ['Tentative timeline for categoryIII', '2026-08/13-08-2026d-wn.pdf', '90.03 KB', '13/08/2026'],
    ['Request for Proposal-Category-III (3rd Round) 13.08.2026', '2026-08/13-08-2026b-wn.pdf', '929.47 KB', '13/08/2026'],
    ['Notice for inviting bid', '2026-08/13-08-2026e-wn.pdf', '90.21 KB', '13/08/2026'],
    ['Tentative time line for category II', '2026-08/13-08-2026c-wn.pdf', '90.26 KB', '13/08/2026'],
    ['Request for Proposal-Category-II (3rd Round) 13.08.2026', '2026-08/13-08-2026a-wn.pdf', '928.18 KB', '13/08/2026'],
    ['Gazette Notification on the Colliery Control (Amendment) Rules, 2026-reg.', '2026-08/10-08-2026a-wn.pdf', '750.61 KB', '10/08/2026'],
    ['Consolidated Pre-Application Queries and Ministry of Coal Responses on Surface Coal/Lignite Gasification Projects', '2026-08/MOC-CCT-07-08.pdf', '406.13 KB', '07/08/2026'],
    ['Meeting of the Standing Linkage Committee (Long-Term) for Power Sector- SLC/LT No. 03/2026', '2026-08/05-08-2026a-wn.pdf', '3.35 MB', '05/08/2026']
  ],

  press: [
    ['Ministry of Coal Invites Applications under the ₹37,500 Crore Scheme for Promotion of Surface Coal/Lignite Gasification Projects', '2026-09/080726pib.pdf', '213.16 KB', '08/07/2026'],
    ['Ministry of Coal Notifies Acceptance of Insurance Surety Bonds for MMDR Coal Blocks', '2026-07/Press2-07-2026pib.pdf', '113.29 KB', '02/07/2026'],
    ['Ministry of Coal Organises BRICS Side Event on Clean Coal Technologies with Focus on Coal Gasification', '2026-06/Press24june26.pdf', '173.14 KB', '24/06/2026'],
    ['‘Yoga for Healthy Ageing’; Ministry of Coal and Ministry of Mines Jointly Celebrate 12th International Day of Yoga', '2026-06/Press21junn26.pdf', '283.05 KB', '21/06/2026'],
    ['President of India Smt. Droupadi Murmu and Prime Minister Shri Narendra Modi lays Foundation Stone of Bharat Coal Gasification & Chemicals Limited (BCGCL) Coal-to-Ammonium Nitrate Project at Lakhanpur, Odisha', '2026-06/Press20june26.pdf', '139.43 KB', '20/06/2026'],
    ['Prime Minister to Lay Foundation Stone of India’s First Commercial-Scale Coal-to-Ammonium Nitrate Project in Odisha', '2026-06/Press19jun26.pdf', '148.49 KB', '19/06/2026'],
    ['Ministry of Coal to Organize Third Roadshow on Surface Coal/Lignite Gasification Projects in Mumbai on 18 June 2026', '2026-06/Press17june26.pdf', '138.01 KB', '17/06/2026'],
    ['Ministry of Coal Holds Successful Roadshow on Coal and Lignite Gasification Projects in Hyderabad', '2026-06/Press110626.pdf', '454.18 KB', '11/06/2026'],
    ['Ministry of Coal to Organize Roadshow on Coal and Lignite Gasification Projects in Hyderabad Tomorrow', '2026-06/Pib_10june26.pdf', '141.64 KB', '10/06/2026'],
    ['Empowering India’s Energy Markets: Coal Exchange for Viksit Bharat', '2026-06/Pib_9june26.pdf', '150.81 KB', '09/06/2026'],
    ['Ministry of Coal hosts Roadshow on Scheme for Promotion of Surface Coal/Lignite Gasification Projects in New Delhi', '2026-06/Pib28may.pdf', '272.95 KB', '28/05/2026'],
    ['Ministry of Coal to Organize Roadshow on Surface Coal & Lignite Gasification Projects on 28th May in New Delhi', '2026-06/PressBureau27may26.pdf', '137.02 KB', '27/05/2026'],
    ['Coal Production commences from Urtan and Dhirauli Mines in Madhya Pradesh', '2026-05/Press_19may26.pdf', '128.45 KB', '19/05/2026'],
    ['Union Minister of State for Coal & Mines reviews CMPDIL', '2026-05/Press15may26.pdf', '240.42 KB', '15/05/2026'],
    ['Visit of Union Minister of State (MoS) for Coal and Mines Shri Satish Chandra Dubey to Dhanbad; inspection of Belgaria Township and high-level review meeting at Koyla Bhawan', '2026-05/Press13may26-c.pdf', '303.38 KB', '13/05/2026'],
    ['Union Minister of State for Coal and Mines, Shri Satish Chandra Dubey Visits Eastern Coalfields Limited', '2026-05/Press13may26-b.pdf', '219.88 KB', '13/05/2026'],
    ['Cabinet approves Scheme for Promotion of Surface Coal/Lignite Gasification Projects with a financial outlay of Rs.37,500 crore', '2026-05/Press13may26.pdf', '165.45 KB', '13/05/2026'],
    ['Ministry of Coal Issues Letter of Award to Selected Applicant under Category III of Round II of the Financial Incentive Scheme for Promotion of Coal Gasification Projects', '2026-05/Press29apr26.pdf', '187.94 KB', '29/04/2026'],
    ['India Strengthens Energy Security: Historic First — Coal Mine Development Agreements with Underground Coal Gasification Provisions Signed', '2026-05/Pib28apr.pdf', '184.14 KB', '28/04/2026'],
    ['Ministry of Coal Drives Energy Security Push; Hosts Key Stakeholders’ Consultation and Launches 15th Round of Commercial Coal mine Auction', '2026-04/Press_170426.pdf', '356.38 KB', '17/04/2026']
  ],

  quickLinks: [
    { badge: 'NCP', t: 'National Coal Portal', u: 'https://coaldashboard.cmpdi.co.in/' },
    { badge: 'CBA', t: 'Coal Block Auction', u: 'https://www.mstcecommerce.com/auctionhome/coalblock/index.jsp' },
    { badge: '★', t: 'Star Rating of Coal Mines', u: 'https://starrating.coal.gov.in/' },
    { badge: 'S&T', t: 'Science and Technology Research in Coal and Lignite Sector', short: 'STRCLS', u: 'https://scienceandtech.cmpdi.co.in/' },
    { badge: 'SW', t: 'Single Window Clearance System', short: 'SWCS', u: 'https://swcs.coal.gov.in' },
    { badge: 'CI', t: 'Coal Import Monitoring System', short: 'CIMS', u: 'https://imports.coal.gov.in/CIMS/public/home' }
  ],

  gallery: [
    { img: 'styles/photo_gallery_618_392_/public/2026-07/aaroh3-.JPG?itok=ISo_k3MB', alt: 'Hon’ble Union Minister of Coal & Mines, Shri G. Kishan Reddy, addressing the gathering at the Release of AAROH - Annual Report on Mine Closure' },
    { img: 'styles/photo_gallery_618_392_/public/2026-07/aaroh5-.JPG?itok=MyWDW1vi', alt: 'Signing of the Tripartite MoU among BCCL, JRDA, Hindalco Industries Limited and Rajdhani Universal Fabrics Private Limited' },
    { img: 'styles/photo_gallery_618_392_/public/2026-07/aaroh4-_0.JPG?itok=Jerd3QMT', alt: 'Virtual Inauguration of Coal NEER Plants by the Hon’ble Minister of Coal' }
  ],

  /* Footer logo strip. `img` is relative to `files` */
  footerLogos: [
    { t: 'Nasha Mukt Bharat Abhiyaan', img: '2025-11/nasamukti.jpg', u: 'https://www.dosje.gov.in/organisation/nasha-mukt-bharat-abhiyaan/' },
    { t: 'SHe-box', img: '2025-07/she-box.png', u: 'https://shebox.wcd.gov.in/' },
    { t: 'India Code', img: '2021-03/india-code1.jpeg', u: 'https://www.indiacode.nic.in/' },
    { t: 'CPGRAMS', img: '2021-03/2021-03-08.png', u: 'https://pgportal.gov.in/' },
    { t: 'National Government Services Portal of India', img: '2019-10/ngsp_logo.jpg', u: 'https://services.india.gov.in/' },
    { t: 'Voters Online Services', img: '2019-10/nvsp3.png', u: 'https://www.nvsp.in' },
    { t: 'MyVisit', img: '2019-10/myvisit.png', u: 'https://www.swagatam.gov.in/public/Index.aspx' },
    { t: 'MyGov', img: '2019-04/mygov.png', u: 'https://www.mygov.in' },
    { t: 'Make In India', img: '2019-04/makeinindia.png', u: 'http://www.makeinindia.com/home' },
    { t: 'Prime Minister’s National Relief Fund', img: '2019-04/pmnrf.png', u: 'https://pmnrf.gov.in' },
    { t: 'Incredible India', img: '2019-04/incredible-india.png', u: 'http://incredibleindia.org/' },
    { t: 'Digital India', img: '2019-04/digital_india.png', u: 'https://www.digitalindiaportal.co.in/' },
    { t: 'National Portal of India', img: '2019-04/india-gov.png', u: 'https://www.india.gov.in' },
    { t: 'Data portal', img: '2019-04/data-gov.png', u: 'https://data.gov.in/' }
  ],

  footerMenu: [
    { t: 'Website Policy', p: 'website-policy' },
    { t: 'Help', p: 'help' },
    { t: 'Contact Us', p: 'contact-us' },
    { t: 'Terms and Conditions', p: 'terms-and-conditions' },
    { t: 'Feedback', p: 'feedback' },
    { t: 'Web Information Manager', p: 'web-information-manager' },
    { t: 'Disclaimer', p: 'disclaimer' }
  ],

  visitors: '29015448',
  visitorsSince: '01/01/2023 - 00:01',
  lastUpdated: '18 Sep 2026'
};
