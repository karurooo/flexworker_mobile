import React, { useState, memo } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useUploadFile } from '~/hooks/query/useUpload';
import { fileUtils } from '~/utils/pickDocument';
import { AntDesign } from '@expo/vector-icons';

interface DocumentPickerProps {
  onDocumentSelected: (publicUrl: string) => void;
  title?: string;
}

const DocumentPicker = memo(({ onDocumentSelected, title }: DocumentPickerProps) => {
  const { mutate: uploadFile, isPending } = useUploadFile();
  const { pickDocument } = fileUtils();
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await pickDocument();
      if (!result?.publicUrl) return;

      setFileName(result.name);
      onDocumentSelected(result.publicUrl);
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  return (
    <View className="flex items-center">
      <TouchableOpacity
        className={`h-10 w-full flex-row items-center justify-center gap-2 rounded-lg ${
          isPending ? 'border border-sky' : 'border border-navy'
        }`}
        onPress={!isPending ? handlePickDocument : undefined}
        disabled={isPending}>
        <Text className="text-bold text-md text-center">
          {title || 'Upload File'}{' '}
          {!isPending && <AntDesign name="filetext1" size={16} color="black" />}
        </Text>
        {isPending && <ActivityIndicator size="small" color="#1F355C" />}
      </TouchableOpacity>

      {fileName && (
        <View className="mt-2 flex-row items-center gap-2">
          <AntDesign name="filetext1" size={14} color="#1F355C" />
          <Text className="text-sm text-navy">{fileName}</Text>
        </View>
      )}
    </View>
  );
});

export default DocumentPicker;
