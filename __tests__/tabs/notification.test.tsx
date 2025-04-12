import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Notification from '@/app/(tabs)/notification';
import { useRouter } from 'expo-router';
import { fetchNotifications, markAllAsRead, markAsRead } from '@/services/notifications';
import { getToken } from '@/services/auth';
import { useNotification } from '@/context/NotificationContext';

// Mocks completos
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/services/notifications', () => ({
  fetchNotifications: jest.fn(),
  markAllAsRead: jest.fn(),
  markAsRead: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  getToken: jest.fn(),
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

jest.mock('../../assets/images/icon.png', () => 'test-image-path');

describe('Notification Screen', () => {
  const mockNotifications = [
    {
      id: 1,
      titulo: 'Nuevo dispositivo asignado',
      mensaje: 'Se ha asignado un nuevo dispositivo a tu cuenta',
      fecha: '2023-05-15',
      estado: 'no_leida'
    },
    {
      id: 2,
      titulo: 'Mantenimiento programado',
      mensaje: 'Tu dispositivo requiere mantenimiento preventivo',
      fecha: '2023-05-10',
      estado: 'leida'
    }
  ];

  const mockToken = 'fake-token';
  const mockRefreshUnreadCount = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (getToken as jest.Mock).mockResolvedValue(mockToken);
    (fetchNotifications as jest.Mock).mockResolvedValue({
      notifications: mockNotifications
    });
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 1,
      refreshUnreadCount: mockRefreshUnreadCount
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renderiza el título correctamente', async () => {
    const { getByText } = render(<Notification />);
    expect(getByText('Notificaciones')).toBeTruthy();
  });

  it('Muestra las notificaciones después de cargar', async () => {
    const { findByText } = render(<Notification />);
    
    await waitFor(() => {
      expect(findByText('Nuevo dispositivo asignado')).toBeTruthy();
      expect(findByText('Mantenimiento programado')).toBeTruthy();
    });
  });

  it('Muestra botón de marcar todo como leído cuando hay no leídas', async () => {
    const { findByText } = render(<Notification />);
    expect(await findByText('Marcar todo leído')).toBeTruthy();
  });
});