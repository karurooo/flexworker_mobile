import { supabase } from 'services/supabase';
import { Employer, GovernmentEmployer } from '~/types/employers';
import {
  GovernmentDocumentData,
  CorporationDocumentData,
  SoleProprietorshipDocumentData,
} from '~/schema/employerSchema';
import { postEmployerStatus } from './statusDataApi';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import { EmployerCategory } from '~/types/employers';

async function postEmployerData(employer: Employer, userId: string) {
  try {
    console.log('Submitting employer data:', employer); // Log the data being submitted

    const { data, error } = await supabase
      .from('employers')
      .upsert(
        [
          {
            user_id: userId,
            company_name: employer.companyName,
            employers_category: employer.category,
            contact_person_name: employer.contactPerson,
            position_designation: employer.position,
            contact_number: employer.contactNumber,
            email_address: employer.email,
            office_location: employer.address,
            image_tin: employer.imageTin,
            selfie_tin: employer.selfieTin,
          },
        ],
        { onConflict: 'user_id' }
      )
      .single();

    if (error) {
      console.error('Supabase error:', error); // Log the Supabase error
      throw new Error(`Error inserting employer: ${error.message}`);
    } else {
      console.log('Employer data inserted successfully:', data); // Log the successful insertion of employer data
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in employerDataApi:', error); // Log unexpected errors
    throw error;
  }
}

// Generic document posting function
async function postEmployerDocument<T>(
  table: string,
  dataMapper: (employerId: string, data: T) => object,
  successMessage: string,
  employerId: string,
  data: T
) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .upsert([dataMapper(employerId, data)], { onConflict: 'employer_id' })
      .single();

    if (error) {
      throw new Error(`Error inserting ${table}: ${error.message}`);
    }

    console.log(`${successMessage}:`, result);
    await postEmployerStatus(employerId);
    return result;
  } catch (error) {
    console.error(`Error in ${table}:`, error);
    throw error;
  }
}
async function postPrivateEmployer(employerId: string) {
  await postEmployerStatus(employerId); // Changed from data.employer_id to data.id
  console.log('Private employer status updated');
}

// Government documents
async function postGovernmentData(employerId: string, data: GovernmentDocumentData) {
  return postEmployerDocument(
    'government_documents',
    (id, doc) => ({
      employer_id: id,
      office_agency_name: doc.agencyName,
      department_name: doc.department,
      accreditation: doc.accreditation,
      philgeps: doc.philGeps,
    }),
    'Government documents inserted successfully',
    employerId,
    data
  );
}

// Sole proprietorship
async function postSoleProprietorshipData(
  employerId: string,
  data: SoleProprietorshipDocumentData
) {
  return postEmployerDocument(
    'sole_proprietorship_documents',
    (id, doc) => ({
      employer_id: id,
      employment_type: doc.type,
      DTI_cert: doc.dtiCert,
      business_permit: doc.businessPermit,
      BIR_COR: doc.birCert,
    }),
    'Sole proprietorship documents inserted successfully',
    employerId,
    data
  );
}

// Corporation
async function postCorporationData(employerId: string, data: CorporationDocumentData) {
  console.log('Submitting corporation data for employer:', employerId);
  if (!employerId) {
    throw new Error('Missing employer ID');
  }
  if (!data.secCert || !data.birCert) {
    throw new Error('Missing required certificates');
  }
  return postEmployerDocument(
    'corporation_documents',
    (id, doc) => ({
      employer_id: id,
      sec_cert: doc.secCert,
      business_permit: doc.businessPermit,
      bir_cert: doc.birCert,
      articles_incorporation: doc.artInc,
      corporate_offices_location: doc.corporateLocation,
    }),
    'Corporation documents inserted successfully',
    employerId,
    data
  );
}

//fetch employer data
async function getEmployerData(userId: string) {
  console.log('Fetching employer data for user:', userId);
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided');
  }

  console.log('Fetching employer data for user:', userId);
  try {
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && !data) {
      console.error('Something went wrong in fetch employer: ', error);
      throw new Error(error.message);
    } else {
      console.log('Employer data fetched successfully: ', data);
    }
    return data;
  } catch (error) {
    console.log('Error in fetchEmployerData:', error);
    throw error;
  }
}

export const submitEmployerData = async (data: any): Promise<Employer> => {
  // Your API implementation
  const response = await fetch('/api/employer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const submitGovernmentData = async (data: any): Promise<GovernmentEmployer> => {
  // Your API implementation
  const response = await fetch('/api/employer/government', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export {
  postEmployerData,
  getEmployerData,
  postGovernmentData,
  postSoleProprietorshipData,
  postCorporationData,
  postPrivateEmployer,
};
