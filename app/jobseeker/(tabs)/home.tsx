import { View, Text, Button, Image, ActivityIndicator } from 'react-native';
import { Container } from '~/components/Shared/Container';
import Header from '~/components/Shared/Header';
import { useState, useEffect } from 'react';
import SearchBar from '~/components/Shared/Search';
import { useQuery } from '@tanstack/react-query';
import { getMatchedJobs } from '~/services/api/jobseekers/jobsDataApi';
import { useJobsStore } from '~/store/jobs';
import { useUserStore } from '~/store/users';

import Announcements from '~/components/Shared/Announcements';
import MatchedJobsList from '~/components/Jobseeker/MatchedJobs';
import { useJobseekerData } from '~/hooks/query/useJobSeekerData';

export default function Home() {
  return (
    <Container>
      <View className="h-[15%] bg-white">
        <View className="h-full justify-center rounded-br-[75px] bg-navy "></View>
      </View>
      <View className="mx-4 h-[85%] flex-1">
        <Announcements />
        <MatchedJobsList />
      </View>
    </Container>
  );
}
