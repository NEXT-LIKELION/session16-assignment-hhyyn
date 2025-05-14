import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: Timestamp;
  completed?: boolean;
}

export interface TodoInput {
  title: string;
  description: string;
  deadline: string;
  completed?: boolean;
}

const todosCollection = collection(db, 'todos');

// todos 가져오기
export const getTodos = async (): Promise<Todo[]> => {
  const q = query(todosCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Todo));
};

// todo 추가하기
export const addTodo = async (todo: TodoInput): Promise<string> => {
  const docRef = await addDoc(todosCollection, {
    ...todo,
    createdAt: serverTimestamp(),
    completed: todo.completed || false
  });
  return docRef.id;
};

// todo 업데이트하기
export const updateTodo = async (id: string, todo: Partial<TodoInput>): Promise<void> => {
  const docRef = doc(db, 'todos', id);
  await updateDoc(docRef, todo);
};

// todo 삭제하기
export const deleteTodo = async (id: string): Promise<void> => {
  const docRef = doc(db, 'todos', id);
  await deleteDoc(docRef);
};

// todo 완료 상태 토글하기
export const toggleTodoComplete = async (id: string, completed: boolean): Promise<void> => {
  const docRef = doc(db, 'todos', id);
  await updateDoc(docRef, { completed });
}; 