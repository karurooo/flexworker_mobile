export enum SexCategory {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum CivilStatusCategory {
  SINGLE = 'Single',
  MARRIED = 'Married',
  WIDOWED = 'Widowed',
  SEPARATED = 'Separated',
  DIVORCED = 'Divorced',
}

export enum YesNoCategory {
  YES = 'Yes',
  NO = 'No',
}

export enum WorkTypeCategory {
  ALL = 'All',
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract/Temporary',
  CASUAL = 'Casual/Vacation',
  VOLUNTEER = 'Volunteer',
  WORK_IMMERSION = 'Work Immersion/OJT',
}

export enum SalaryTypeCategory {
  MONTHLY = 'Monthly',
  WEEKLY = 'Weekly',
  DAILY = 'Daily',
  HOURLY = 'Hourly',
}

export enum PlanToWorkCategory {
  ANY = 'Any',
  WITHIN_IN = 'With in',
  OUTSIDE = 'Outside',
}

export enum LocationCategory {
  COUNTRY = 'Country',
  REGION = 'Region',
  PROVINCE = 'Province',
  CITY = 'City',
  BARANGAY = 'Barangay',
}

export interface JobSeekerProps {
  onCloseModal: () => void;
}

export interface JobSeeker {
  id: string;
  personalInformation: {
    firstName: string;
    middleName: string;
    lastName: string;
    sex: SexCategory;
    religion: string;
    contactNumber: string;
    civilStatus: CivilStatusCategory;
    civilService: YesNoCategory;
    tin: string;
    tinSelfie: string;
  };
  presentAddress: {
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
  };
  educationalBackground: {
    elementary: string;
    highschool: string;
    bachelor: string;
    techvoc: string;
  };
  jobPreference: {
    workType: WorkTypeCategory.ALL;
    salaryType: SalaryTypeCategory.MONTHLY;
    minSalary: number;
    maxSalary: number;
    planToWork: PlanToWorkCategory.ANY;
    location: LocationCategory.COUNTRY;
  };
  coverLetter: string;
}

export interface JobSeekerSkills {
  jobIndustry: string;
  jobSpecialization: string;
}
export interface JobSeekerProps {
  onCloseModal: () => void;
}

export interface JobSeekerProfile {
  id: string;
  personal_information: {
    first_name: string;
    middle_name: string;
    last_name: string;
    sex: SexCategory;
    religion: string;
    contact_cumber: string;
    civil_status: CivilStatusCategory;
    civil_service: YesNoCategory;
    tin: string;
    tin_selfie: string;
  };
  presentAddress: {
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
  };
  educationalBackground: {
    elementary: string;
    highschool: string;
    bachelor: string;
    techvoc: string;
  };
  jobPreference: {
    workType: WorkTypeCategory.ALL;
    salaryType: SalaryTypeCategory.MONTHLY;
    minSalary: number;
    maxSalary: number;
    planToWork: PlanToWorkCategory.ANY;
    location: LocationCategory.COUNTRY;
  };
  coverLetter: string;
}

export interface JobSeekerSkillsProfile {
  jobIndustry: string;
  jobSpecialization: string;
}

export interface JobSeekerProps {
  onCloseModal: () => void;
}
