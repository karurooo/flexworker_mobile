import { create } from 'zustand';

interface fileState {
  uri: string;
  type: string;
  fileName: string;
  filePath: string;
  isCanceled: boolean;
  setFilePath: (path: string) => void;
  setFileName: (fileName: string) => void;
  setFileType: (type: string) => void;
  setFileUri: (uri: string) => void;
  setIsCanceled: (isCanceled: boolean) => void;
}

export const useFileStore = create<fileState>((set) => ({
  uri: '',
  type: '',
  fileName: '',
  filePath: '',
  isCanceled: false,
  setFilePath: (path) => set({ filePath: path }),
  setFileName: (fileName) => set({ fileName: fileName }),
  setFileType: (type) => set({ type: type }),
  setFileUri: (uri) => set({ uri: uri }),
  setIsCanceled: (isCanceled) => set({ isCanceled: isCanceled }),
}));
