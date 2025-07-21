import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Users, User, Eye, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FriendProgress } from './FriendProgress';
import { RootState, AppDispatch } from '@/store';
import { fetchFriendWorkouts } from '@/store/slices/workoutSlice';

export const FriendsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { friends } = useSelector((state: RootState) => state.friends);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const handleViewProgress = (friendId: string) => {
    setSelectedFriend(friendId);
    dispatch(fetchFriendWorkouts(friendId));
  };

  if (selectedFriend) {
    const friend = friends.find(f => f.id === selectedFriend);
    return (
      <FriendProgress 
        friend={friend!} 
        onBack={() => setSelectedFriend(null)} 
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Workout Buddies
          </CardTitle>
          <CardDescription>
            Connected friends who can view your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
              <p className="text-muted-foreground mb-4">
                Invite friends to share your workout progress and stay motivated together
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{friend.name}</h4>
                              <p className="text-sm text-muted-foreground">{friend.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={friend.status === 'accepted' ? 'default' : 'secondary'}
                                  className={friend.status === 'accepted' ? 'bg-accent' : ''}
                                >
                                  {friend.status === 'accepted' ? 'Connected' : 'Pending'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Since {new Date(friend.connectedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {friend.status === 'accepted' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewProgress(friend.id)}
                                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Progress
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {friends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {friends.filter(f => f.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Connected Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {friends.filter(f => f.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Invites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};