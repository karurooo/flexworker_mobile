export enum EmployerCategory {
  GOVERNMENT = 'Government',
  PRIVATE = 'Private',
  SOLE_PROPRIETORSHIP = 'Sole Proprietorship',
  CORPORATION = 'Corporation',
}

export enum Type {
  SELF_EMPLOYED = 'Self Employed',
  SMALL_TEAM = 'Small Team',
}

export enum JobIndustries {
  CONSTRUCTION_AND_MAINTENANCE = 'Construction and Maintenance',
  MANUFACTURING_AND_PRODUCTION = 'Manufacturing and Production',
  TRANSPORTATION_AND_LOGISTICS = 'Transportation and Logistics',
  AGRICULTURE_AND_FARMING = 'Agriculture and Farming',
  MINING_AND_QUARRYING = 'Mining and Quarrying',
  HOSPITALITY_AND_FOOD_SERVICES = 'Hospitality and Food Services',
  HEALTHCARE_AND_PUBLIC_SERVICES = 'Healthcare and Public Services',
  TECHNICAL_TRADES = 'Technical Trades',
  UTILITIES_AND_INFRASTRUCTURE = 'Utilities and Infrastructure',
}

export enum JobType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
  INTERNSHIP = 'Internship',
  TEMPORARY = 'Temporary',
}

export enum ContractDuration {
  SixMonths = '6 Months',
  OneYear = '1 Year',
  TwoYears = '2 Years',
  ThreeYears = '3 Years',
  FourYears = '4 Years',
}
export enum JobExperience {
  NO_EXPERIENCE = 'No Experience',
  LESS_THAN_ONE_YEAR = 'Less than 1 year',
  ONE_TO_TWO_YEARS = '1-2 years',
  TWO_TO_FOUR_YEARS = '2-4 years',
  FOUR_TO_SIX_YEARS = '4-6 years',
  SIX_TO_EIGHT_YEARS = '6-8 years',
  EIGHT_TO_TEN_YEARS = '8-10 years',
  TEN_YEARS_ABOVE = '10 years above',
}

export enum SalaryType {
  MONTHLY = 'Monthly',
  WEEKLY = 'Weekly',
  DAILY = 'Daily',
  HOURLY = 'Hourly',
}
export type Employer = {
  id?: string;
  user_id: string;
  category: EmployerCategory;
  companyName: string;
  position: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: {
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
  };
  imageTin: string;
  selfieTin: string;
  status?: string;
  created_at?: string;
};

export interface GovernmentEmployer {
  philGeps: string;
  agencyName: string;
  department: string;
  accreditation: string;
}

export interface SoleProprietorshipEmployer {
  dtiCert: string;
  businessPermit: string;
  birCert: string;
  dtiCertFileName: string;
  businessPermitFileName: string;
  birCertFileName: string;
  type: Type;
}

export interface CorporationEmployer {
  birCert: string;
  birCertSelfie: string;
  businessPermit: string;
  businessPermitSelfie: string;
  secCert: string;
  secCertSelfie: string;
  artInc: string;
  location: {
    region: '';
    province: '';
    city: '';
    barangay: '';
    street: '';
    zipCode: '';
  };
}

export interface EmployerProps {
  onCloseModal: () => void;
}

export type JobPost = {
  id: string;
  created_at: string;
  employer_id: string;
  employer_user_id: string;
  job_title: string;
  job_industry: string;
  job_type: string;
  salary_type: SalaryType;
  min_salary: number;
  max_salary: number;
  description?: string;
  experience?: string;
  location?: string;
  contract?: string;
  job_specialization?: string;
};

interface LocationObject {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  street?: string;
  zipCode?: string;
}

export type JobPostWithRelations = JobPost & {
  employers: {
    company_name: string;
    user_id: string;
  };
};

export type EmployerCategoryComponentProps = {
  onCloseModal: () => void;
  category: EmployerCategory;
};

export type EmployerDocumentField = {
  type: 'document' | 'selfie';
  name: string;
  label: string;
  required?: boolean;
};
