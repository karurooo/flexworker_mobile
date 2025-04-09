import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YearProps {
  visible: boolean;
  onClose: () => void;
  onSelectYear: (year: number) => void;
  initialYear?: number;
}

const Year: React.FC<YearProps> = ({ visible, onClose, onSelectYear, initialYear }) => {
  // Default to current year if no initial year provided
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // Reset state when modal opens
  useEffect(() => {
    if (visible && initialYear) {
      setSelectedYear(initialYear);
    }
  }, [visible, initialYear]);

  // Generate years (current year - 50 to current year + 1)
  const startYear = currentYear - 50;
  const endYear = currentYear + 1;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse(); // Newest years first

  const handleConfirm = () => {
    onSelectYear(selectedYear);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-80 rounded-xl bg-dark-600 p-4 bg-white">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="font-poppins-semibold text-lg text-black">Selected Year: </Text>
              <Text className="font-poppins-regular text-lg text-black">{selectedYear}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="mb-6 items-center justify-center">
            {/* Year selector */}
            <View className="border-dark-500 w-full rounded-lg border p-2">
              <ScrollView
                className="h-48"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={`year-${year}`}
                    onPress={() => setSelectedYear(year)}
                    className={`my-1 rounded-md px-3 py-2 ${
                      selectedYear === year ? 'bg-gray-500/20' : ''
                    }`}>
                    <Text
                      className={`text-center text-base ${
                        selectedYear === year
                          ? 'font-poppins-semibold text-navy'
                          : 'font-poppins-regular text-black'
                      }`}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity onPress={onClose} className="rounded-lg px-4 py-2">
              <Text className="font-poppins-medium text-black">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="rounded-lg bg-navy px-4 py-2">
              <Text className="font-poppins-medium text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Year;
