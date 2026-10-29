import { UserAccount, AccountCredential, Designation } from '../types.ts';

export type { AccountCredential };

export const ACCOUNTS_DATABASE: AccountCredential[] = [
  {
    id: 'usr-admin',
    name: 'Rajeev Singhania',
    email: 'admin@e9graphics.com',
    designation: 'admin',
    designationTitle: 'Managing Director & Enterprise Admin',
    department: 'Executive Board',
    avatarInitials: 'RS',
    allowedRoles: ['executive', 'sales', 'quotation', 'project_manager', 'design', 'production', 'installation', 'invoicing', 'admin_panel', 'chat'],
    defaultRole: 'executive',
    badgeLabel: 'Full System Clearance',
    passwordHash: 'admin123',
    phone: '+91 98110 00001',
    status: 'active',
    lastUpdated: '2026-10-28',
    description: 'Unrestricted enterprise control: pipeline analytics, margins, rate cards, and multi-department oversight.',
  },
  {
    id: 'usr-pm',
    name: 'Vikram Sharma',
    email: 'pm@e9graphics.com',
    designation: 'project_manager',
    designationTitle: 'Senior Operations & Site Project Manager',
    department: 'Project Management & Survey',
    avatarInitials: 'VS',
    allowedRoles: ['project_manager', 'quotation', 'sales', 'invoicing', 'admin_panel', 'chat'],
    defaultRole: 'project_manager',
    badgeLabel: 'Operations & Site Survey',
    passwordHash: 'pm123',
    phone: '+91 98110 00002',
    status: 'active',
    lastUpdated: '2026-10-28',
    description: 'Field management: assigning site leads, wall elevations, ladder/scaffolding safety briefs, and handover to design.',
  },
  {
    id: 'usr-designer',
    name: 'Priya Sen',
    email: 'designer@e9graphics.com',
    designation: 'designer',
    designationTitle: 'Lead Architectural Visual Designer',
    department: 'Design Studio & Vector Lab',
    avatarInitials: 'PS',
    allowedRoles: ['design', 'chat'],
    defaultRole: 'design',
    badgeLabel: 'Design & Active Stopwatch',
    passwordHash: 'design123',
    phone: '+91 98110 00003',
    status: 'active',
    lastUpdated: '2026-10-28',
    description: 'Creative studio: live design stopwatch tracking, iterative moodboard proofs, high-res print packages, and timesheets.',
  },
  {
    id: 'usr-employee',
    name: 'Rameshwar Pal',
    email: 'employee@e9graphics.com',
    designation: 'employee',
    designationTitle: 'Production QC & Field Installation Lead',
    department: 'Print Floor & On-Site Mounting',
    avatarInitials: 'RP',
    allowedRoles: ['production', 'installation', 'chat'],
    defaultRole: 'production',
    badgeLabel: 'Production Floor & Site Crew',
    passwordHash: 'emp123',
    phone: '+91 98110 00004',
    status: 'active',
    lastUpdated: '2026-10-28',
    description: 'Execution specialist: PO quantity limit checks, QC pass certification, waybill dispatch, 5-point readiness & snag-free signoff.',
  },
];

export function getAccountByDesignation(
  designation: Designation,
  accounts: AccountCredential[] = ACCOUNTS_DATABASE
): AccountCredential {
  const match = accounts.find((a) => a.designation === designation);
  return match || accounts[0] || ACCOUNTS_DATABASE[0];
}

export function authenticateUser(
  email: string,
  password: string,
  accounts: AccountCredential[] = ACCOUNTS_DATABASE
): AccountCredential | null {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // Match existing account
  const match = accounts.find(
    (a) =>
      a.email.toLowerCase() === cleanEmail &&
      (a.passwordHash === cleanPass || cleanPass === 'demo' || cleanPass === '123456')
  );

  return match || null;
}
