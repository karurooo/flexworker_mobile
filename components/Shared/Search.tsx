import React, { useState, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceTime?: number;
  initialQuery?: string;
  containerStyle?: string; // Tailwind class for custom container styles
}

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  debounceTime = 300,
  initialQuery = '',
  containerStyle = '', // Default empty string for no additional styles
}: SearchBarProps) => {
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
    <View
      className={`h-12 flex-row items-center rounded-lg bg-white px-4 shadow-sm ${containerStyle}`}>
      <TextInput
        className="flex-1 text-base text-gray-900"
        placeholderTextColor="#6b7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        accessibilityLabel="Search input"
        accessibilityHint="Type to search content"
        returnKeyType="search"
        onSubmitEditing={() => onSearch(searchQuery.trim())}
      />
      {searchQuery ? (
        <IconButton
          icon="close"
          size={20}
          iconColor="#4b5563"
          onPress={clearSearch}
          accessibilityLabel="Clear search"
        />
      ) : (
        <IconButton icon="magnify" size={20} iconColor="#4b5563" />
      )}
    </View>
  );
};

export default React.memo(SearchBar);
