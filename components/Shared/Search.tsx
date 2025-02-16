import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { debounce } from 'lodash';

interface SearchBarProps<T> {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceTime?: number;
  initialQuery?: string;
  containerStyle?: object;
}

const SearchBar = <T,>({
  onSearch,
  placeholder = 'Search...',
  debounceTime = 300,
  initialQuery = '',
  containerStyle = {},
}: SearchBarProps<T>) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Debounced search handler
  const debouncedSearch = debounce((query: string) => {
    onSearch(query.trim());
  }, debounceTime);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <View className="mx-4 h-12 w-5/6 rounded-lg bg-gray-100 px-2 shadow-sm">
      <TextInput
        className=" text-base text-gray-900"
        placeholderTextColor="#6b7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        accessibilityLabel="Search input"
        accessibilityHint="Type to search content"
        returnKeyType="search"
        onSubmitEditing={() => onSearch(searchQuery.trim())}
      />
      <View className="absolute right-0 h-12 border-l border-gray-300">
        <IconButton icon="magnify" size={20} iconColor="#4b5563" />
      </View>
    </View>
  );
};

export default React.memo(SearchBar);
