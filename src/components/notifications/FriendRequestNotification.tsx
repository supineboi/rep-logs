import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

interface FriendRequestNotificationProps {
  notification: Notification;
  onClose: () => void;
}

export const FriendRequestNotification = ({ 
  notification, 
  onClose 
}: FriendRequestNotificationProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    if (!user || !notification.data?.request_id) return;

    setProcessing(true);
    try {
      // Update friend request status
      const { error: requestError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', notification.data.request_id);

      if (requestError) throw requestError;

      // Get the friend request details to create friendship
      const { data: requestData, error: fetchError } = await supabase
        .from('friend_requests')
        .select('from_user_id')
        .eq('id', notification.data.request_id)
        .single();

      if (fetchError) throw fetchError;

      // Create friendship entries for both users
      const { error: friendshipError } = await supabase
        .from('friends')
        .insert([
          {
            user_id: user.id,
            friend_user_id: requestData.from_user_id,
            status: 'accepted'
          },
          {
            user_id: requestData.from_user_id,
            friend_user_id: user.id,
            status: 'accepted'
          }
        ]);

      if (friendshipError) throw friendshipError;

      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      toast({
        title: "Friend request accepted!",
        description: `You are now friends with ${notification.data.from_user}`,
      });

      onClose();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!user || !notification.data?.request_id) return;

    setProcessing(true);
    try {
      // Update friend request status
      const { error: requestError } = await supabase
        .from('friend_requests')
        .update({ status: 'denied' })
        .eq('id', notification.data.request_id);

      if (requestError) throw requestError;

      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      toast({
        title: "Friend request denied",
        description: `Denied friend request from ${notification.data.from_user}`,
      });

      onClose();
    } catch (error) {
      console.error('Error denying friend request:', error);
      toast({
        title: "Error",
        description: "Failed to deny friend request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="font-medium text-sm">{notification.title}</div>
        <div className="text-sm text-muted-foreground">
          {notification.message}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handleAccept}
          disabled={processing}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDeny}
          disabled={processing}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          Deny
        </Button>
      </div>
    </div>
  );
};