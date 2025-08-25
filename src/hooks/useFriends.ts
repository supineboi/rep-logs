import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Friend {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

export const useFriends = () => {
  const { user } = useAuthContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }

    fetchFriends();

    // Subscribe to real-time friend updates
    const channel = supabase
      .channel('user-friends')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          created_at,
          friend_user_id,
          profiles!friends_friend_user_id_fkey (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      const friendsWithProfiles = data?.map((friend: any) => ({
        id: friend.friend_user_id,
        display_name: friend.profiles?.display_name || friend.profiles?.username || 'Unknown User',
        username: friend.profiles?.username || '',
        avatar_url: friend.profiles?.avatar_url,
        status: friend.status,
        created_at: friend.created_at
      })) || [];

      setFriends(friendsWithProfiles);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (email: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if user exists in the app
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name, username')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      console.error('Error checking current user profile:', userError);
    }

    // For now, we'll assume the user doesn't exist and send email
    // TODO: Implement proper user lookup by email
    const targetUser = null;

    if (targetUser) {
      // User exists in app - create friend request and notification
      const targetUserId = targetUser.id;
      
      // Check if friend request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetUserId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Create friend request
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: targetUserId,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${existingUser?.display_name || existingUser?.username || 'Someone'} wants to be your workout buddy`,
          data: {
            request_id: requestData.id,
            from_user: existingUser?.display_name || existingUser?.username || 'Someone'
          }
        });

      if (notificationError) throw notificationError;

      return { success: true, message: 'Friend request sent!' };
    } else {
      // User doesn't exist - create pending request and send email
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          from_user_id: user.id,
          to_email: email,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Send email invite (you'll need to implement this edge function)
      const { error: emailError } = await supabase.functions.invoke('send-friend-invite', {
        body: {
          to_email: email,
          from_user: existingUser?.display_name || existingUser?.username || 'Someone',
          request_id: requestData.id
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw error here as the request was created successfully
      }

      return { success: true, message: 'Invitation sent via email!' };
    }
  };

  return {
    friends,
    loading,
    error,
    sendFriendRequest,
    refetch: fetchFriends
  };
};