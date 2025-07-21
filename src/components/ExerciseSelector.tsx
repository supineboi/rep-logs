import React, { useState } from 'react';
import { Search, Plus, X, Dumbbell, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const EXERCISE_DATABASE = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Pull-ups', 'Dips', 'Incline Bench Press', 'Romanian Deadlift', 'Bulgarian Split Squat',
  'Lat Pulldown', 'Leg Press', 'Shoulder Press', 'Bicep Curl', 'Tricep Extension',
  'Leg Curl', 'Leg Extension', 'Calf Raise', 'Face Pull', 'Lateral Raise',
  'Chest Fly', 'Hammer Curl', 'Close Grip Bench Press', 'Front Squat', 'Sumo Deadlift',
  'T-Bar Row', 'Shrug', 'Hip Thrust', 'Plank', 'Russian Twist'
];

interface ExerciseSelectorProps {
  onSelectExercise: (exerciseName: string) => void;
  onClose: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelectExercise, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredExercises = EXERCISE_DATABASE.filter(exercise =>
    exercise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercise = (exerciseName: string) => {
    onSelectExercise(exerciseName);
  };

  const handleAddCustomExercise = () => {
    if (customExercise.trim()) {
      onSelectExercise(customExercise.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-4 top-4 bottom-4 bg-card rounded-lg shadow-xl animate-scale-in">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Select Exercise</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-auto p-4">
            {!showCustomInput ? (
              <div className="space-y-2">
                {/* Add Custom Exercise Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-left"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Add Custom Exercise
                </Button>

                {/* Exercise Database */}
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <Button
                      key={exercise}
                      variant="set"
                      className="w-full justify-start h-12 text-left"
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <Dumbbell className="w-4 h-4 mr-3 text-muted-foreground" />
                      {exercise}
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No exercises found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try a different search term or add a custom exercise
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Custom Exercise Input */
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground"
                  onClick={() => setShowCustomInput(false)}
                >
                  ← Back to exercise list
                </Button>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Exercise Name
                    </label>
                    <Input
                      placeholder="Enter custom exercise name..."
                      value={customExercise}
                      onChange={(e) => setCustomExercise(e.target.value)}
                      className="h-12 text-base"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomExercise()}
                    />
                  </div>
                  
                  <Button
                    variant="workout"
                    size="touch"
                    className="w-full"
                    onClick={handleAddCustomExercise}
                    disabled={!customExercise.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};