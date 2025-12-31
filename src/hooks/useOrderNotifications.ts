import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OrderPayload {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
}

interface UseOrderNotificationsOptions {
  onNewOrder?: (order: OrderPayload) => void;
  soundEnabled?: boolean;
  browserNotificationEnabled?: boolean;
}

export const useOrderNotifications = (options: UseOrderNotificationsOptions = {}) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { onNewOrder, soundEnabled = true, browserNotificationEnabled = true } = options;

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3');
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, [soundEnabled]);

  // Show browser notification
  const showBrowserNotification = useCallback((order: OrderPayload) => {
    if (browserNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🛒 سفارش جدید!', {
        body: `مبلغ: ${order.total_amount.toLocaleString('fa-IR')} تومان`,
        icon: '/favicon.png',
        tag: order.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/admin/orders';
        notification.close();
      };
    }
  }, [browserNotificationEnabled]);

  // Show in-app toast notification
  const showToastNotification = useCallback((order: OrderPayload) => {
    toast({
      title: '🛒 سفارش جدید دریافت شد!',
      description: `مبلغ: ${order.total_amount.toLocaleString('fa-IR')} تومان`,
      duration: 10000,
    });
  }, [toast]);

  // Send email notification via edge function
  const sendEmailNotification = useCallback(async (order: OrderPayload) => {
    try {
      // Get admin email from settings
      const { data: emailSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_email')
        .maybeSingle();

      const adminEmail = emailSetting?.setting_value;
      if (!adminEmail) return;

      // Get customer phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', order.user_id)
        .maybeSingle();

      await supabase.functions.invoke('send-order-notification', {
        body: {
          orderId: order.id,
          totalAmount: order.total_amount,
          customerPhone: profile?.phone || 'نامشخص',
          shippingAddress: order.shipping_address,
          adminEmail,
        },
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }, []);

  // Handle new order
  const handleNewOrder = useCallback((order: OrderPayload) => {
    console.log('New order received:', order);
    
    // Play sound
    playNotificationSound();
    
    // Show browser notification
    showBrowserNotification(order);
    
    // Show in-app toast
    showToastNotification(order);
    
    // Send email notification
    sendEmailNotification(order);
    
    // Call custom callback
    onNewOrder?.(order);
  }, [playNotificationSound, showBrowserNotification, showToastNotification, sendEmailNotification, onNewOrder]);

  // Subscribe to realtime orders
  useEffect(() => {
    if (!isAdmin) return;

    // Request notification permission on mount
    requestNotificationPermission();

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          handleNewOrder(payload.new as OrderPayload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, handleNewOrder, requestNotificationPermission]);

  return {
    requestNotificationPermission,
    playNotificationSound,
  };
};
