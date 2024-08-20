import { useStore } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch, AppState, AppStore } from '@/redux/store';

// Создаем хуки с типизацией нашего Redux приложения
export const useAppSelector = useSelector.withTypes<AppState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppStore = useStore.withTypes<AppStore>();
