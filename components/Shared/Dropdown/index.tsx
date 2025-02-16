import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: (string | DropdownOption)[];
  onSelect: (value: string) => void;
  placeholder?: string;
  placeholderColor?: string;
  value?: string | null;
  error?: string;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

const Dropdown = memo(
  ({
    options,
    onSelect,
    placeholder = 'Select',
    placeholderColor = '#1F355C',
    value,
    error,
    keyboardShouldPersistTaps,
  }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const normalizedOptions = useMemo(
      () => options.map((opt) => (typeof opt === 'string' ? opt : opt.label)),
      [options]
    );

    const handleSelect = useCallback(
      (selectedLabel: string) => {
        const selectedOption = options.find((opt) =>
          typeof opt === 'string' ? opt === selectedLabel : opt.label === selectedLabel
        );
        onSelect(typeof selectedOption === 'string' ? selectedOption : selectedOption?.value || '');
        setIsOpen(false);
      },
      [onSelect, options]
    );

    return (
      <View className="relative">
        {/* Toggle Dropdown */}
        <TouchableOpacity
          className=" w-full flex-row items-center justify-between rounded-lg border border-gray-400 bg-white/50 p-3"
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.7}>
          <Text
            className="text-background font-Poppins border border-white"
            style={{ color: value ? '#1F355C' : placeholderColor }}>
            {value || placeholder}
          </Text>
          <AntDesign name={isOpen ? 'up' : 'down'} size={20} color="black" />
        </TouchableOpacity>

        {/* Optimized Dropdown List */}
        {isOpen && (
          <FlatList
            data={normalizedOptions}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                className="border-b border-gray-200 p-4"
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}>
                <Text className="text-background font-Poppins">{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.toString()}
            getItemLayout={(data, index) => ({
              length: 48,
              offset: 48 * index,
              index,
            })}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={7}
            className="z-10 rounded-lg border border-gray-300 bg-white"
          />
        )}

        {/* Error Message */}
        {error && <Text className="font-Poppins text-red-500">{error}</Text>}
      </View>
    );
  }
);

export default Dropdown;
