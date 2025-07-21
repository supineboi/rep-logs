import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RootState } from '@/store';
import { Friend } from '@/store/slices/friendsSlice';

interface FriendProgressProps {
  friend: Friend;
  onBack: () => void;
}

export const FriendProgress: React.FC<FriendProgressProps> = ({ friend, onBack }) => {
  const { friendWorkouts } = useSelector((state: RootState) => state.workout);
  const workouts = friendWorkouts[friend.id] || [];

  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const totalSets = workouts.reduce((sum, workout) => 
    sum + workout.exercises.reduce((exerciseSum, exercise) => exerciseSum + exercise.sets.length, 0), 0
  );

  const lastWorkout = workouts[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{friend.name}'s Progress</h2>
            <p className="text-muted-foreground">Workout buddy since {new Date(friend.connectedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <div className="text-sm text-muted-foreground">Workouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalExercises}</div>
            <div className="text-sm text-muted-foreground">Exercises</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalSets}</div>
            <div className="text-sm text-muted-foreground">Total Sets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {workouts.reduce((sum, w) => sum + w.duration, 0)}m
            </div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>Latest training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workouts recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.slice(0, 5).map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {new Date(workout.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground">{workout.duration} minutes</p>
                    </div>
                    <Badge variant="outline">
                      {workout.exercises.length} exercises
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className="flex justify-between text-sm">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets.length} sets
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};