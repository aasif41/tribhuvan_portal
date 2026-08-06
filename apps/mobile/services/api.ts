import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://tribhuvan-portal.onrender.com/api';
const TOKEN_KEY = 'tribhuvan_auth_token';

let inMemoryToken: string | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    inMemoryToken = token;
    return token;
  } catch (error) {
    console.error('Error reading auth token from SecureStore:', error);
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  inMemoryToken = token;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token to SecureStore:', error);
  }
}

export async function removeToken(): Promise<void> {
  inMemoryToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token from SecureStore:', error);
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
