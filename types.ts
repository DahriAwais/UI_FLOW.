export enum DeviceType {
  IOS = 'IOS',
  ANDROID = 'ANDROID'
}

export interface Screen {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  type: 'text' | 'analysis'; // 'analysis' is for showing AI thinking
  timestamp: number;
}

export interface Project {
  id: string;
  prompt: string;
  screens: Screen[];
  messages: Message[];
  createdAt: number;
  deviceType: DeviceType;
}

export interface GeneratorState {
  isGenerating: boolean;
  currentProject: Project | null;
  history: Project[];
  error: string | null;
}