import React, { useState } from 'react';
import { View } from 'react-native';
import { Container } from '~/components/Shared/Container';
import Announcements from '~/components/Shared/Announcements';
import MatchedJobsList from '~/components/Jobseeker/MatchedJobs';
import Header from '~/components/Shared/Header';

export default function Home() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>();

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement your search logic here
  };

  return (
    <Container>
      {/* Header Section */}
      <View className="h-[15%]">
        <View className="h-full justify-center rounded-br-[75px] bg-navy">
          <Header />
        </View>
      </View>

      {/* Content Section */}
      <View className="mx-4 h-[85%] flex-1">
        <Announcements />
        <View className="my-3 border-b border-gray-300" />
        <MatchedJobsList selectedIndustry={selectedIndustry} />
      </View>
    </Container>
  );
}
