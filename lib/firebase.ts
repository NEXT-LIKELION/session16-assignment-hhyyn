import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Auth 관련 import 제거
import { firebaseConfig } from './firebaseConfig';

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 초기화
export const db = getFirestore(app);

// Auth 인스턴스 초기화 부분 제거

export default app; 