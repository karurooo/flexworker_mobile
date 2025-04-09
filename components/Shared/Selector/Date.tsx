import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isValid,
} from 'date-fns';
import YearSelector from './Year';
interface CalendarProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

// Create a standalone YearSelector interface
export interface YearSelectorProps {
  onYearSelected: (year: number) => void;
  initialYear?: number;
}

const SecondaryButton = ({ onPress, title }: { onPress: () => void; title: string }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 items-center justify-center rounded-lg border border-gray-400 bg-transparent py-2"
  >
    <Text className="text-black font-poppins-medium">{title}</Text>
  </TouchableOpacity>
);

const PrimaryButton = ({ onPress, title }: { onPress: () => void; title: string }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 items-center justify-center rounded-lg bg-navy py-2"
  >
    <Text className="text-white font-poppins-medium">{title}</Text>
  </TouchableOpacity>
);

const Calendar: React.FC<CalendarProps> = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  minDate,
  maxDate,
}) => {
  // Safely ensure the initial date is valid
  const safeInitialDate = React.useMemo(() => {
    // Ensure initialDate is valid, or default to current date
    const now = new Date();
    if (!initialDate || !isValid(initialDate)) {
      return now;
    }

    try {
      // Additional safety check
      if (isNaN(initialDate.getTime())) {
        return now;
      }
      return initialDate;
    } catch (e) {
      console.error('Error processing initialDate:', e);
      return now;
    }
  }, [initialDate]);

  // Use initialDate only for the initial state
  const initialRender = useRef(true);
  const [currentMonth, setCurrentMonth] = useState(safeInitialDate);
  const [selectedDate, setSelectedDate] = useState(safeInitialDate);
  const [yearSelectorVisible, setYearSelectorVisible] = useState(false);
  const [monthSelectorVisible, setMonthSelectorVisible] = useState(false);

  // Fix the infinite loop by only updating on first render or when visibility changes
  useEffect(() => {
    if (!initialRender.current) {
      // Only reset the date when the modal becomes visible again
      if (visible && safeInitialDate) {
        try {
          setCurrentMonth(safeInitialDate);
          setSelectedDate(safeInitialDate);
        } catch (e) {
          console.error('Error in useEffect:', e);
        }
      }
    } else {
      initialRender.current = false;
    }
  }, [visible, safeInitialDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((current) => subMonths(current, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((current) => addMonths(current, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (isValid(selectedDate)) {
      onSelectDate(selectedDate);
    } else {
      // Fallback to current date if selected date is invalid
      onSelectDate(new Date());
    }
    onClose();
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateRange = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Day names row
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <View>
        {/* Day names header */}
        <View className="mb-2 flex-row justify-between">
          {dayNames.map((day, index) => (
            <View key={index} className="w-10 items-center">
              <Text className="text-sm font-medium text-black">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View>
          {Array.from({ length: Math.ceil(dateRange.length / 7) }, (_, weekIndex) => {
            const weekDates = dateRange.slice(weekIndex * 7, weekIndex * 7 + 7);

            return (
              <View key={`week-${weekIndex}`} className="mb-1 flex-row justify-between">
                {weekDates.map((date, dayIndex) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
                  const isTodayDate = isToday(date);

                  return (
                    <TouchableOpacity
                      key={`day-${dayIndex}`}
                      onPress={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled || !isCurrentMonth}
                      className={`h-10 w-10 items-center justify-center rounded-full
                        ${isSelected ? 'bg-navy' : isTodayDate && !isSelected ? 'border border-gray-400 bg-dark-600' : 'bg-transparent'}
                        ${!isCurrentMonth || isDisabled ? 'opacity-30' : ''}
                      `}>
                      <Text
                        className={`text-base 
                          ${isSelected ? 'font-bold text-white' : 'text-black'}
                          ${!isCurrentMonth ? 'text-black' : ''}
                        `}>
                        {format(date, 'd')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Month selector
  const renderMonthSelector = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return (
      <View className="h-60 rounded-lg bg-dark-700 p-4">
        <Text className="mb-2 text-lg font-bold text-black">Select Month</Text>
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingVertical: 8 }}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={`month-${index}`}
              onPress={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(index);
                setCurrentMonth(newDate);
                setMonthSelectorVisible(false);
              }}
              className={`my-1 rounded-md py-3 ${
                currentMonth.getMonth() === index ? 'bg-navy/20' : ''
              }`}>
              <Text
                className={`text-center text-base ${
                  currentMonth.getMonth() === index ? 'font-bold text-navy' : 'text-gray-300'
                }`}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-80 rounded-xl bg-dark-800 p-4 bg-white">
          {/* Header with title and close button */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-lg text-black">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Month and Year Selector */}
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setMonthSelectorVisible(true)} className="px-2">
                <Text className="font-poppins-medium text-lg text-black">
                  {format(currentMonth, 'MMMM')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setYearSelectorVisible(true)} className="px-2">
                <Text className="font-poppins-medium text-lg text-black">
                  {format(currentMonth, 'yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Main Content - Either Calendar, Year Selector or Month Selector */}
          {yearSelectorVisible ? (
            <YearSelector
              visible={yearSelectorVisible}
              onClose={() => setYearSelectorVisible(false)}
              onSelectYear={(year) => {
                const newDate = new Date(currentMonth); // Copy current month
                newDate.setFullYear(year);
                setCurrentMonth(newDate);
              }}
            />
          ) : monthSelectorVisible ? (
            renderMonthSelector()
          ) : (
            renderCalendarDays()
          )}

          {/* Selected date display */}
          {!yearSelectorVisible && !monthSelectorVisible && (
            <View className="mb-2 mt-4">
              <Text className="text-center font-poppins-medium text-lg text-black">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View className="mt-4 flex-row items-center gap-2">
            {yearSelectorVisible || monthSelectorVisible ? (
              <TouchableOpacity
                onPress={() => {
                  setYearSelectorVisible(false);
                  setMonthSelectorVisible(false);
                }}
                className="rounded-lg px-4 py-2"
              >
                <Text className="font-poppins-medium text-black">Back</Text>
              </TouchableOpacity>
            ) : (
              <View className="w-full flex-row items-center gap-2">
                <SecondaryButton onPress={onClose} title="Cancel" />
                <PrimaryButton onPress={handleConfirm} title="Confirm" />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Calendar;
