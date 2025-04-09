import React, { useCallback } from 'react';
import { View, Text, Modal, ScrollView, Pressable } from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void; // Optional callback for accepting terms
}

const TermsModal = ({ visible, onClose, onAccept }: TermsModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Outer Container */}
      <View className="flex-1 justify-center items-center bg-black/50">
        {/* Inner Container */}
        <View className="w-full max-w-lg bg-white rounded-lg p-6 max-h-[90%]">
          {/* Title */}
          <Text className="text-xl font-bold text-center mb-4">
            Terms and Conditions on Data Privacy and User Information Security
          </Text>

          {/* Scrollable Content */}
          <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 16 }}>
            <Text className="text-base mb-4">
              <Text className="font-bold">
                By accessing and using this system, users acknowledge and agree to the
                following terms in compliance with the Data Privacy Act of 2012 (RA 10173),
                the Cybercrime Prevention Act of 2012 (RA 10175), and all applicable laws
                governing data protection and digital integrity in the Philippines:
              </Text>
            </Text>

            <Text className="text-base mb-3 font-bold">1. Collection and Use of Personal Data</Text>
            <Text className="text-base mb-4">
              All personal information and credentials voluntarily submitted to the system
              are collected solely for lawful, specified, and legitimate purposes related to
              employment matching, user verification, and platform services.
            </Text>

            <Text className="text-base mb-3 font-bold">2. Visibility of User Profiles and Information</Text>
            <Text className="text-base mb-2">
              • Job Seekers: Comprehensive profiles will only be visible to verified employers
              once the job seeker applies or connects to a job post.
            </Text>
            <Text className="text-base mb-4">
              • Employers: Once a job is posted, the employer's profile becomes publicly visible
              to job seekers.
            </Text>

            <Text className="text-base mb-3 font-bold">3. Purpose of Data Processing and Use in Analytics</Text>
            <Text className="text-base mb-2">
              User data may be used to:
              {"\n"}• Facilitate secure hiring processes;
              {"\n"}• Generate anonymized data for analytics and statistics;
              {"\n"}• Inform public policy and labor market interventions;
              {"\n"}• Support evidence-based governance decisions related to upskilling, training alignment, and employment trends.
            </Text>

            <Text className="text-base mb-3 font-bold">4. Data Privacy and Protection</Text>
            <Text className="text-base mb-4">
              Strict organizational, physical, and technical safeguards are enforced. Only authorized system administrators and host agencies have access to user data.
            </Text>

            <Text className="text-base mb-3 font-bold">5. No Sale, Commercial Use, or Cross-Border Transfer of Data</Text>
            <Text className="text-base mb-2">
              • No Selling of Data: The platform strictly prohibits the sale, lease, trade, or any unauthorized commercial use of user data to any third party.
            </Text>
            <Text className="text-base mb-4">
              • No Sending of Data Abroad: All personal data is securely stored within the jurisdiction of the Philippines. No user data shall be transferred, accessed, or stored outside the country, ensuring full compliance with Philippine data privacy regulations and the national interest in protecting citizen data.
            </Text>

            <Text className="text-base mb-3 font-bold">6. User Rights</Text>
            <Text className="text-base mb-2">
              In accordance with the Data Privacy Act of 2012, users have the right to:
              {"\n"}• Access and update their personal data;
              {"\n"}• Request correction or deletion;
              {"\n"}• Withdraw consent with notice;
              {"\n"}• File complaints in case of data misuse or breach.
            </Text>

            <Text className="text-base mb-3 font-bold">7. Data Retention and Disposal</Text>
            <Text className="text-base mb-4">
              User data shall be retained only for the duration necessary to serve its original purpose or as required by law. Once retention is no longer needed, data will be securely destroyed or anonymized.
            </Text>

            <Text className="text-base mb-3 font-bold">8. Cybersecurity Compliance</Text>
            <Text className="text-base mb-4">
              All activities within the system are protected under the Cybercrime Prevention Act of 2012. Any unauthorized access, hacking, phishing, or related digital crimes will be dealt with legally.
            </Text>

            <Text className="text-base mb-3 font-bold">9. User Consent and Agreement</Text>
            <Text className="text-base mb-4">
              By registering, submitting documents, applying for jobs, posting job vacancies, connecting with other users, or leaving feedback within the system, users affirm that they fully understand and agree to these terms and give informed, voluntary, and explicit consent for their data to be processed as described above.
            </Text>
          </ScrollView>

          {/* Buttons */}
          <View className="flex-row justify-between gap-2 mt-4">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 bg-gray-200 rounded-md items-center"
            >
              <Text className="text-gray-800 font-semibold">Close</Text>
            </Pressable>
            {onAccept && (
              <Pressable
                onPress={onAccept}
                className="flex-1 py-3 bg-blue-600 rounded-md items-center"
              >
                <Text className="text-white font-semibold">I Accept Terms</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;