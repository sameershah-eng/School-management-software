import { 
  Student, 
  Teacher, 
  Room, 
  ClassItem, 
  Registration, 
  PricingRule, 
  Invoice, 
  PointCard, 
  PointCardTransaction, 
  AttendanceRecord, 
  BankTransaction, 
  SchoolSettings 
} from '../types';
import { generateSwissQRReference } from '../utils/swissQr';

export const INITIAL_SETTINGS: SchoolSettings = {
  name: 'DanseFlow Studio Zürich',
  legalName: 'DanseFlow GmbH',
  street: 'Dufourstrasse 42',
  postalCode: '8008',
  city: 'Zürich',
  canton: 'ZH',
  country: 'CH',
  email: 'info@danseflow.ch',
  phone: '+41 44 211 48 90',
  website: 'https://danseflow.ch',
  iban: 'CH44 0900 0000 8734 5612 9',
  qrIban: 'CH24 3000 0000 0004 8921 5',
  creditorName: 'DanseFlow GmbH',
  currency: 'CHF',
  timezone: 'Europe/Zurich',
  taxRatePercent: 8.1,
  defaultPaymentTermsDays: 30,
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Elena Rossi',
    email: 'elena.rossi@danseflow.ch',
    phone: '+41 79 342 11 80',
    specialities: ['Ballet', 'Lyrical', 'Pointe'],
    bio: 'Former soloist at Ballett Zürich with 14 years of professional performance and pedagogy experience.',
    color: '#8B5CF6',
    hourlyRateCHF: 95
  },
  {
    id: 'tch-2',
    name: 'Marc Suter',
    email: 'marc.suter@danseflow.ch',
    phone: '+41 78 650 92 14',
    specialities: ['Hip-Hop', 'Urban Choreography', 'Breakdance'],
    bio: 'Choreographer for national Swiss dance tours and European Urban Dance competition finalist.',
    color: '#3B82F6',
    hourlyRateCHF: 90
  },
  {
    id: 'tch-3',
    name: 'Sophie Delacroix',
    email: 'sophie.delacroix@danseflow.ch',
    phone: '+41 76 411 77 02',
    specialities: ['Contemporary Dance', 'Improvisation', 'Floorwork'],
    bio: 'Trained at Conservatoire de Paris, specializing in modern release techniques and spatial composition.',
    color: '#EC4899',
    hourlyRateCHF: 95
  },
  {
    id: 'tch-4',
    name: 'Luca Moretti',
    email: 'luca.moretti@danseflow.ch',
    phone: '+41 79 555 83 29',
    specialities: ['Salsa Cubana', 'Bachata Sensual', 'Latin Fusion'],
    bio: 'Swiss Salsa Champion 2023, renowned for musicality and friendly, inclusive social dancing pedagogy.',
    color: '#F59E0B',
    hourlyRateCHF: 85
  },
  {
    id: 'tch-5',
    name: 'Anja Meier',
    email: 'anja.meier@danseflow.ch',
    phone: '+41 77 902 44 11',
    specialities: ['Kids Creative Movement', 'Jazz Dance', 'Stretch & Tone'],
    bio: 'Certified rhythmic gymnastics instructor and early-childhood movement specialist.',
    color: '#10B981',
    hourlyRateCHF: 80
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-a',
    name: 'Studio A (Grand Studio)',
    capacity: 22,
    floor: 'Harlequin Sprung Harlequin Wood Floor (170m²)',
    equipment: ['Full wall mirrors', 'Fixed double barres', 'Sonos Arc sound system', 'Acoustic curtains']
  },
  {
    id: 'room-b',
    name: 'Studio B (Contemporary Hall)',
    capacity: 18,
    floor: 'Sprung vinyl dance floor (125m²)',
    equipment: ['Mobile barres', 'Gymnastics mats', 'Ceiling aerial rigging points', 'Genelec monitors']
  },
  {
    id: 'room-c',
    name: 'Studio C (Urban & Latin Lounge)',
    capacity: 16,
    floor: 'Polished oak sprung floor (95m²)',
    equipment: ['Color LED mood lighting', 'Pioneer DJ console', 'Wall mirrors with privacy blinds']
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'Ballet Beginners (Kids 6–9)',
    danceStyle: 'Ballet',
    teacherId: 'tch-1',
    roomId: 'room-a',
    dayOfWeek: 'Monday',
    startTime: '16:00',
    endTime: '17:00',
    capacity: 14,
    enrolledStudentIds: ['stu-1', 'stu-4'],
    minAge: 6,
    maxAge: 9,
    priceCategoryId: 'prc-kids',
    active: true,
    color: '#8B5CF6',
    description: 'Foundations of classical posture, turnout, coordination and musicality in a playful environment.'
  },
  {
    id: 'cls-2',
    name: 'Contemporary Dance Advanced',
    danceStyle: 'Contemporary',
    teacherId: 'tch-3',
    roomId: 'room-b',
    dayOfWeek: 'Monday',
    startTime: '18:30',
    endTime: '20:00',
    capacity: 16,
    enrolledStudentIds: ['stu-3', 'stu-8'],
    minAge: 16,
    maxAge: 60,
    priceCategoryId: 'prc-adult',
    active: true,
    color: '#EC4899',
    description: 'Dynamic floor work, fluid transitions, inversion technique and expressive choreography.'
  },
  {
    id: 'cls-3',
    name: 'Hip-Hop Juniors (Age 10–14)',
    danceStyle: 'Hip-Hop',
    teacherId: 'tch-2',
    roomId: 'room-c',
    dayOfWeek: 'Tuesday',
    startTime: '17:00',
    endTime: '18:15',
    capacity: 15,
    enrolledStudentIds: ['stu-2', 'stu-5', 'stu-7'],
    minAge: 10,
    maxAge: 14,
    priceCategoryId: 'prc-teens',
    active: true,
    color: '#3B82F6',
    description: 'Grooves, isolations, bounce, musicality and energetic urban routines to modern tracks.'
  },
  {
    id: 'cls-4',
    name: 'Adult Ballet Open Level',
    danceStyle: 'Ballet',
    teacherId: 'tch-1',
    roomId: 'room-a',
    dayOfWeek: 'Wednesday',
    startTime: '19:00',
    endTime: '20:15',
    capacity: 18,
    enrolledStudentIds: ['stu-3', 'stu-6'],
    minAge: 18,
    maxAge: 70,
    priceCategoryId: 'prc-adult',
    active: true,
    color: '#8B5CF6',
    description: 'Classical barre, centre adage and allegro adapted for adults seeking strength and grace.'
  },
  {
    id: 'cls-5',
    name: 'Salsa & Bachata Social',
    danceStyle: 'Salsa',
    teacherId: 'tch-4',
    roomId: 'room-c',
    dayOfWeek: 'Thursday',
    startTime: '19:30',
    endTime: '21:00',
    capacity: 20,
    enrolledStudentIds: ['stu-6'],
    minAge: 18,
    maxAge: 75,
    priceCategoryId: 'prc-adult',
    active: true,
    color: '#F59E0B',
    description: 'Cuban Salsa turn patterns, Bachata Sensual partner connection and social dance etiquette.'
  },
  {
    id: 'cls-6',
    name: 'Creative Movement (Pre-School 4–5)',
    danceStyle: 'Creative Movement',
    teacherId: 'tch-5',
    roomId: 'room-b',
    dayOfWeek: 'Friday',
    startTime: '15:30',
    endTime: '16:15',
    capacity: 12,
    enrolledStudentIds: ['stu-4'],
    minAge: 4,
    maxAge: 5,
    priceCategoryId: 'prc-kids',
    active: true,
    color: '#10B981',
    description: 'Rhythm discovery, spatial games and motor skills development through stories and music.'
  },
  {
    id: 'cls-7',
    name: 'Urban Choreography Masterclass',
    danceStyle: 'Hip-Hop',
    teacherId: 'tch-2',
    roomId: 'room-c',
    dayOfWeek: 'Saturday',
    startTime: '11:00',
    endTime: '12:30',
    capacity: 18,
    enrolledStudentIds: ['stu-2', 'stu-6', 'stu-8'],
    minAge: 15,
    maxAge: 35,
    priceCategoryId: 'prc-adult',
    active: true,
    color: '#3B82F6',
    description: 'Fast-paced, intricate choreography designed for performance and dancers with experience.'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    studentId: 'STU-001',
    firstName: 'Mia',
    lastName: 'Zimmermann',
    dateOfBirth: '2017-04-12', // 9 y/o
    email: 'beat.zimmermann@bluewin.ch',
    phone: '+41 79 432 90 12',
    street: 'Seestrasse 145',
    postalCode: '8002',
    city: 'Zürich',
    canton: 'ZH',
    guardianName: 'Beat Zimmermann',
    guardianEmail: 'beat.zimmermann@bluewin.ch',
    guardianPhone: '+41 79 432 90 12',
    emergencyContact: 'Martina Zimmermann (Mother) +41 79 432 90 13',
    registrationDate: '2024-09-01',
    assignedClassIds: ['cls-1'],
    pricingCategory: 'Kids',
    notes: 'Mild peanut allergy. Very enthusiastic dancer, loves pirouettes.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'guardian',
    createdAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'stu-2',
    studentId: 'STU-002',
    firstName: 'Noah',
    lastName: 'Keller',
    dateOfBirth: '2012-08-25', // 13 y/o
    email: 'sarah.keller@sunrise.ch',
    phone: '+41 78 812 34 56',
    street: 'Museumstrasse 18',
    postalCode: '8400',
    city: 'Winterthur',
    canton: 'ZH',
    guardianName: 'Sarah Keller',
    guardianEmail: 'sarah.keller@sunrise.ch',
    guardianPhone: '+41 78 812 34 56',
    emergencyContact: 'Thomas Keller (Father) +41 78 812 34 57',
    registrationDate: '2024-10-15',
    assignedClassIds: ['cls-3', 'cls-7'],
    pricingCategory: 'Teens',
    notes: 'Takes 2 classes per week. Eligible for multi-class rate.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'guardian',
    createdAt: '2024-10-15T09:30:00Z'
  },
  {
    id: 'stu-3',
    studentId: 'STU-003',
    firstName: 'Emma',
    lastName: 'Favre',
    dateOfBirth: '2004-11-03', // 21 y/o
    email: 'emma.favre@uzh.ch',
    phone: '+41 76 991 22 84',
    street: 'Langstrasse 210',
    postalCode: '8005',
    city: 'Zürich',
    canton: 'ZH',
    emergencyContact: 'Claire Favre (Sister) +41 76 220 91 00',
    registrationDate: '2025-01-10',
    assignedClassIds: ['cls-2', 'cls-4'],
    pricingCategory: 'Adults',
    notes: 'University student discount applied. Attends contemporary & adult ballet.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'student',
    createdAt: '2025-01-10T14:15:00Z'
  },
  {
    id: 'stu-4',
    studentId: 'STU-004',
    firstName: 'Liam',
    lastName: 'Widmer',
    dateOfBirth: '2019-03-14', // 7 y/o
    email: 'sandra.widmer@gmail.com',
    phone: '+41 79 550 41 82',
    street: 'Aathalstrasse 9',
    postalCode: '8610',
    city: 'Uster',
    canton: 'ZH',
    guardianName: 'Sandra Widmer',
    guardianEmail: 'sandra.widmer@gmail.com',
    guardianPhone: '+41 79 550 41 82',
    emergencyContact: 'David Widmer +41 79 550 41 80',
    registrationDate: '2025-02-01',
    assignedClassIds: ['cls-1', 'cls-6'],
    pricingCategory: 'Kids',
    notes: 'Young talent, transitions well between classes.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'guardian',
    createdAt: '2025-02-01T11:00:00Z'
  },
  {
    id: 'stu-5',
    studentId: 'STU-005',
    firstName: 'Chloé',
    lastName: 'Dubois',
    dateOfBirth: '2010-06-18', // 15 y/o
    email: 'jp.dubois@swisscom.net',
    phone: '+41 79 819 00 23',
    street: 'Goldhaldenstrasse 34',
    postalCode: '8700',
    city: 'Küsnacht',
    canton: 'ZH',
    guardianName: 'Jean-Paul Dubois',
    guardianEmail: 'jp.dubois@swisscom.net',
    guardianPhone: '+41 79 819 00 23',
    emergencyContact: 'Nathalie Dubois +41 79 819 00 24',
    registrationDate: '2024-11-20',
    assignedClassIds: ['cls-3'],
    pricingCategory: 'Teens',
    notes: 'Preparing for summer dance intensive in Lausanne.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'guardian',
    createdAt: '2024-11-20T16:45:00Z'
  },
  {
    id: 'stu-6',
    studentId: 'STU-006',
    firstName: 'Mateo',
    lastName: 'Garcia',
    dateOfBirth: '2000-02-14', // 26 y/o
    email: 'mateo.garcia@techzurich.io',
    phone: '+41 78 300 12 77',
    street: 'Badenerstrasse 380',
    postalCode: '8004',
    city: 'Zürich',
    canton: 'ZH',
    emergencyContact: 'Lucia Garcia +34 611 22 33 44',
    registrationDate: '2025-01-15',
    assignedClassIds: ['cls-5'],
    pricingCategory: 'Drop-in',
    notes: 'Uses 10-Class Point Card for drop-in salsa and urban classes.',
    status: 'active',
    pointBalance: 7, // 7 points remaining on 10-class card!
    billingContact: 'student',
    createdAt: '2025-01-15T18:20:00Z'
  },
  {
    id: 'stu-7',
    studentId: 'STU-007',
    firstName: 'Léa',
    lastName: 'Bachmann',
    dateOfBirth: '2015-09-09', // 10 y/o
    email: 'martina.bachmann@gmx.ch',
    phone: '+41 79 204 88 19',
    street: 'Gotthardstrasse 52',
    postalCode: '8800',
    city: 'Thalwil',
    canton: 'ZH',
    guardianName: 'Martina Bachmann',
    guardianEmail: 'martina.bachmann@gmx.ch',
    guardianPhone: '+41 79 204 88 19',
    emergencyContact: 'Florian Bachmann +41 79 204 88 20',
    registrationDate: '2024-09-12',
    assignedClassIds: ['cls-3'],
    pricingCategory: 'Teens',
    notes: 'Sibling discount: brother also attends gymnastics.',
    status: 'active',
    pointBalance: 0,
    billingContact: 'guardian',
    createdAt: '2024-09-12T10:00:00Z'
  },
  {
    id: 'stu-8',
    studentId: 'STU-008',
    firstName: 'David',
    lastName: 'Sommer',
    dateOfBirth: '1998-05-30', // 27 y/o
    email: 'david.sommer@solutix.ch',
    phone: '+41 76 492 88 31',
    street: 'Usterstrasse 71',
    postalCode: '8600',
    city: 'Dübendorf',
    canton: 'ZH',
    emergencyContact: 'Anita Sommer +41 76 492 88 32',
    registrationDate: '2024-10-01',
    assignedClassIds: ['cls-2', 'cls-7'],
    pricingCategory: 'Adults',
    notes: 'Experienced dancer, assists occasionally with stage setup.',
    status: 'active',
    pointBalance: 3,
    billingContact: 'student',
    createdAt: '2024-10-01T12:00:00Z'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    registrationRef: 'REG-2026-CH842',
    studentFirstName: 'Sophie',
    studentLastName: 'Brunner',
    dateOfBirth: '2018-02-14',
    email: 'andrea.brunner@postmail.ch',
    phone: '+41 79 611 44 90',
    street: 'Bellerivestrasse 28',
    postalCode: '8008',
    city: 'Zürich',
    canton: 'ZH',
    isMinor: true,
    guardianName: 'Andrea Brunner',
    guardianEmail: 'andrea.brunner@postmail.ch',
    guardianPhone: '+41 79 611 44 90',
    requestedClassId: 'cls-1',
    submittedAt: '2026-03-28T14:20:00Z',
    status: 'pending',
    notes: 'Wants to join Ballet Beginners immediately for Spring session.',
    agreedToTerms: true
  },
  {
    id: 'reg-2',
    registrationRef: 'REG-2026-CH843',
    studentFirstName: 'Lukas',
    studentLastName: 'Moser',
    dateOfBirth: '2013-11-20',
    email: 'urs.moser@bluewin.ch',
    phone: '+41 78 903 21 44',
    street: 'Witikonerstrasse 89',
    postalCode: '8053',
    city: 'Zürich',
    canton: 'ZH',
    isMinor: true,
    guardianName: 'Urs Moser',
    guardianEmail: 'urs.moser@bluewin.ch',
    guardianPhone: '+41 78 903 21 44',
    requestedClassId: 'cls-3',
    submittedAt: '2026-03-29T09:15:00Z',
    status: 'pending',
    notes: 'Transferred from Basel hip-hop school. Level evaluation requested.',
    agreedToTerms: true
  },
  {
    id: 'reg-3',
    registrationRef: 'REG-2026-CH840',
    studentFirstName: 'Camilla',
    studentLastName: 'Bianchi',
    dateOfBirth: '2001-07-19',
    email: 'c.bianchi@ethz.ch',
    phone: '+41 77 400 98 12',
    street: 'Rämistrasse 101',
    postalCode: '8006',
    city: 'Zürich',
    canton: 'ZH',
    isMinor: false,
    requestedClassId: 'cls-2',
    submittedAt: '2026-03-25T18:40:00Z',
    status: 'waitlisted',
    notes: 'Waitlist for Contemporary Advanced. Class currently near capacity.',
    agreedToTerms: true
  }
];

export const INITIAL_PRICING_RULES: PricingRule[] = [
  {
    id: 'prc-kids',
    name: 'Kids Creative Movement & Ballet',
    category: 'Kids',
    minAge: 4,
    maxAge: 9,
    weeklyClasses: 1,
    monthlyCHF: 95,
    termCHF: 270,
    siblingDiscountPercent: 10,
    description: 'Ages 4–9. Includes end-of-year showcase participation and rehearsal coaching.'
  },
  {
    id: 'prc-teens-1',
    name: 'Juniors & Teens Single Class',
    category: 'Teens',
    minAge: 10,
    maxAge: 16,
    weeklyClasses: 1,
    monthlyCHF: 120,
    termCHF: 340,
    siblingDiscountPercent: 10,
    description: 'Ages 10–16. 75-minute weekly structured curriculum.'
  },
  {
    id: 'prc-teens-2',
    name: 'Juniors & Teens Multi-Class (2x/week)',
    category: 'Teens',
    minAge: 10,
    maxAge: 16,
    weeklyClasses: 2,
    monthlyCHF: 210,
    termCHF: 590,
    siblingDiscountPercent: 10,
    description: 'Discounted rate for two weekly classes (e.g. Hip-Hop + Urban Choreo).'
  },
  {
    id: 'prc-adult-1',
    name: 'Adult Open Single Class',
    category: 'Adults',
    minAge: 17,
    maxAge: 99,
    weeklyClasses: 1,
    monthlyCHF: 140,
    termCHF: 390,
    siblingDiscountPercent: 0,
    description: 'Adult open level courses (Ballet, Contemporary, Salsa).'
  },
  {
    id: 'prc-adult-2',
    name: 'Adult Multi-Class (2x/week)',
    category: 'Adults',
    minAge: 17,
    maxAge: 99,
    weeklyClasses: 2,
    monthlyCHF: 250,
    termCHF: 710,
    siblingDiscountPercent: 0,
    description: 'Two adult courses per week with free studio rehearsal booking privileges.'
  },
  {
    id: 'prc-pointcard',
    name: '10-Class Drop-In Point Card',
    category: 'Drop-in',
    minAge: 16,
    maxAge: 99,
    weeklyClasses: 0,
    monthlyCHF: 280,
    termCHF: 280,
    siblingDiscountPercent: 0,
    description: 'Flexible 10-session pass valid for 6 months across all adult classes.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0038',
    studentId: 'stu-1',
    studentName: 'Mia Zimmermann',
    billingPeriod: 'Q1 2026 (Jan–Mar)',
    issueDate: '2026-01-05',
    dueDate: '2026-02-05',
    status: 'paid',
    items: [
      {
        description: 'Ballet Beginners (Kids 6–9) — Term Fee Q1 2026',
        quantity: 1,
        unitPriceCHF: 270,
        totalCHF: 270
      }
    ],
    subtotalCHF: 270,
    discountCHF: 0,
    totalAmountCHF: 270,
    paidAmountCHF: 270,
    qrReference: generateSwissQRReference(20260038),
    paymentTerms: 'Payment due within 30 days via Swiss QR-bill or e-Banking.',
    notes: 'Paid in full on 18.01.2026 via PostFinance transfer.'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0039',
    studentId: 'stu-2',
    studentName: 'Noah Keller',
    billingPeriod: 'Q1 2026 (Jan–Mar)',
    issueDate: '2026-01-05',
    dueDate: '2026-02-05',
    status: 'paid',
    items: [
      {
        description: 'Juniors & Teens Multi-Class (2x/week) — Term Fee Q1 2026',
        quantity: 1,
        unitPriceCHF: 590,
        totalCHF: 590
      }
    ],
    subtotalCHF: 590,
    discountCHF: 0,
    totalAmountCHF: 590,
    paidAmountCHF: 590,
    qrReference: generateSwissQRReference(20260039),
    paymentTerms: 'Payment due within 30 days via Swiss QR-bill.',
    notes: 'Reconciled automatically from UBS statement.'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0040',
    studentId: 'stu-3',
    studentName: 'Emma Favre',
    billingPeriod: 'Q1 2026 (Jan–Mar)',
    issueDate: '2026-01-10',
    dueDate: '2026-02-10',
    status: 'overdue',
    items: [
      {
        description: 'Adult Multi-Class (Contemporary & Ballet) — Q1 2026',
        quantity: 1,
        unitPriceCHF: 710,
        totalCHF: 710
      },
      {
        description: 'Student Union Discount (10%)',
        quantity: 1,
        unitPriceCHF: -71,
        totalCHF: -71
      }
    ],
    subtotalCHF: 710,
    discountCHF: 71,
    totalAmountCHF: 639,
    paidAmountCHF: 0,
    qrReference: generateSwissQRReference(20260040),
    paymentTerms: 'Payment due within 30 days.',
    notes: '1st reminder sent. Outstanding balance: CHF 639.00.',
    lastReminderSentAt: '2026-03-01T10:00:00Z',
    reminderCount: 1
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0041',
    studentId: 'stu-4',
    studentName: 'Liam Widmer',
    billingPeriod: 'Q2 2026 (Apr–Jun)',
    issueDate: '2026-03-20',
    dueDate: '2026-04-20',
    status: 'issued',
    items: [
      {
        description: 'Creative Movement & Ballet — Term Fee Q2 2026',
        quantity: 1,
        unitPriceCHF: 270,
        totalCHF: 270
      }
    ],
    subtotalCHF: 270,
    discountCHF: 0,
    totalAmountCHF: 270,
    paidAmountCHF: 0,
    qrReference: generateSwissQRReference(20260041),
    paymentTerms: 'Payment due within 30 days via Swiss QR-bill.'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-0042',
    studentId: 'stu-5',
    studentName: 'Chloé Dubois',
    billingPeriod: 'Q2 2026 (Apr–Jun)',
    issueDate: '2026-03-22',
    dueDate: '2026-04-22',
    status: 'partially_paid',
    items: [
      {
        description: 'Hip-Hop Juniors (Age 10–14) — Q2 2026',
        quantity: 1,
        unitPriceCHF: 340,
        totalCHF: 340
      }
    ],
    subtotalCHF: 340,
    discountCHF: 0,
    totalAmountCHF: 340,
    paidAmountCHF: 170, // Half paid
    qrReference: generateSwissQRReference(20260042),
    paymentTerms: 'Payment due in 2 installments.',
    notes: 'Installment 1 of 2 received (CHF 170.00). Remaining: CHF 170.00.'
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-0043',
    studentId: 'stu-6',
    studentName: 'Mateo Garcia',
    billingPeriod: 'Point Card Purchase',
    issueDate: '2026-01-15',
    dueDate: '2026-01-30',
    status: 'paid',
    items: [
      {
        description: '10-Class Drop-In Point Card (Pass #PC-2026-904)',
        quantity: 1,
        unitPriceCHF: 280,
        totalCHF: 280
      }
    ],
    subtotalCHF: 280,
    discountCHF: 0,
    totalAmountCHF: 280,
    paidAmountCHF: 280,
    qrReference: generateSwissQRReference(20260043),
    paymentTerms: 'Paid on issuance via TWINT / Swiss QR.',
    notes: 'Payment confirmed.'
  }
];

export const INITIAL_POINT_CARDS: PointCard[] = [
  {
    id: 'pc-1',
    cardCode: 'PC-2026-904',
    studentId: 'stu-6',
    studentName: 'Mateo Garcia',
    cardType: '10-Class Pass',
    totalPoints: 10,
    remainingPoints: 7,
    purchaseDate: '2026-01-15',
    expiryDate: '2026-07-15',
    priceCHF: 280,
    status: 'active'
  },
  {
    id: 'pc-2',
    cardCode: 'PC-2026-881',
    studentId: 'stu-8',
    studentName: 'David Sommer',
    cardType: '10-Class Pass',
    totalPoints: 10,
    remainingPoints: 3,
    purchaseDate: '2025-11-01',
    expiryDate: '2026-05-01',
    priceCHF: 280,
    status: 'active'
  }
];

export const INITIAL_POINT_CARD_TXS: PointCardTransaction[] = [
  {
    id: 'ptx-1',
    cardId: 'pc-1',
    studentId: 'stu-6',
    type: 'purchase',
    points: 10,
    date: '2026-01-15T18:20:00Z',
    reason: 'Initial card issuance (Invoice INV-2026-0043)',
    recordedBy: 'Admin'
  },
  {
    id: 'ptx-2',
    cardId: 'pc-1',
    studentId: 'stu-6',
    type: 'redemption',
    points: -1,
    date: '2026-01-22T19:30:00Z',
    className: 'Salsa & Bachata Social',
    reason: 'Drop-in session check-in',
    recordedBy: 'Luca Moretti'
  },
  {
    id: 'ptx-3',
    cardId: 'pc-1',
    studentId: 'stu-6',
    type: 'redemption',
    points: -1,
    date: '2026-02-05T19:30:00Z',
    className: 'Salsa & Bachata Social',
    reason: 'Drop-in session check-in',
    recordedBy: 'Luca Moretti'
  },
  {
    id: 'ptx-4',
    cardId: 'pc-1',
    studentId: 'stu-6',
    type: 'redemption',
    points: -1,
    date: '2026-02-19T19:30:00Z',
    className: 'Salsa & Bachata Social',
    reason: 'Drop-in session check-in',
    recordedBy: 'Luca Moretti'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    classId: 'cls-1',
    date: '2026-03-23',
    studentId: 'stu-1',
    status: 'present',
    isDropIn: false,
    recordedBy: 'Elena Rossi'
  },
  {
    id: 'att-2',
    classId: 'cls-1',
    date: '2026-03-23',
    studentId: 'stu-4',
    status: 'present',
    isDropIn: false,
    recordedBy: 'Elena Rossi'
  },
  {
    id: 'att-3',
    classId: 'cls-3',
    date: '2026-03-24',
    studentId: 'stu-2',
    status: 'present',
    isDropIn: false,
    recordedBy: 'Marc Suter'
  },
  {
    id: 'att-4',
    classId: 'cls-3',
    date: '2026-03-24',
    studentId: 'stu-5',
    status: 'late',
    isDropIn: false,
    note: 'Arrived 10 min late with parent notice',
    recordedBy: 'Marc Suter'
  },
  {
    id: 'att-5',
    classId: 'cls-3',
    date: '2026-03-24',
    studentId: 'stu-7',
    status: 'excused',
    isDropIn: false,
    note: 'School trip to Bern',
    recordedBy: 'Marc Suter'
  },
  {
    id: 'att-6',
    classId: 'cls-5',
    date: '2026-03-26',
    studentId: 'stu-6',
    status: 'present',
    isDropIn: true,
    pointCardId: 'pc-1',
    note: 'Point card verified and redeemed',
    recordedBy: 'Luca Moretti'
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'btx-1',
    transactionId: 'TX-UBS-2026-9921',
    bookingDate: '2026-03-25',
    amountCHF: 270.00,
    creditorName: 'DanseFlow GmbH',
    debtorName: 'Sandra Widmer',
    debtorIBAN: 'CH89 0023 0230 4910 2931 0',
    paymentReference: generateSwissQRReference(20260041),
    remittanceInfo: 'Invoice INV-2026-0041 Liam Widmer Q2',
    status: 'matched',
    matchedInvoiceId: 'inv-4',
    confidenceScore: 100,
    matchReason: 'Exact 27-digit Swiss QR reference and matching CHF 270.00 amount'
  },
  {
    id: 'btx-2',
    transactionId: 'TX-PF-2026-4482',
    bookingDate: '2026-03-24',
    amountCHF: 170.00,
    creditorName: 'DanseFlow GmbH',
    debtorName: 'Jean-Paul Dubois',
    debtorIBAN: 'CH61 0900 0000 4820 1928 3',
    paymentReference: generateSwissQRReference(20260042),
    remittanceInfo: 'Part 2 of 2 for Chloé Dubois Dance class',
    status: 'matched',
    matchedInvoiceId: 'inv-5',
    confidenceScore: 95,
    matchReason: 'QR reference matched; remaining balance on invoice is CHF 170.00'
  },
  {
    id: 'btx-3',
    transactionId: 'TX-CS-2026-1109',
    bookingDate: '2026-03-23',
    amountCHF: 639.00,
    creditorName: 'DanseFlow GmbH',
    debtorName: 'Emma Favre',
    debtorIBAN: 'CH12 0024 0240 8891 0021 9',
    paymentReference: '',
    remittanceInfo: 'DanseFlow kurs Emma Favre INV 2026 0040',
    status: 'unmatched',
    matchedInvoiceId: 'inv-3',
    confidenceScore: 88,
    matchReason: 'Invoice number INV-2026-0040 found in unstructured message, amount matches exactly'
  },
  {
    id: 'btx-4',
    transactionId: 'TX-UBS-2026-8830',
    bookingDate: '2026-03-21',
    amountCHF: 300.00,
    creditorName: 'DanseFlow GmbH',
    debtorName: 'Zürcher Kantonalbank Kto 4991',
    debtorIBAN: 'CH93 0070 0110 0004 9912 3',
    paymentReference: '',
    remittanceInfo: 'Spende / Sponsorship Tanzgala 2026',
    status: 'unmatched',
    confidenceScore: 15,
    matchReason: 'No matching invoice found for this payment'
  }
];
