import React, { useState } from 'react';
import { Check, X, Edit3, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Set {
  id: string;
  reps: number;
  weight: number;
  notes?: string;
  completed: boolean;
}

interface SetLoggerProps {
  set: Set;
  setNumber: number;
  onUpdate: (updates: Partial<Set>) => void;
}

export const SetLogger: React.FC<SetLoggerProps> = ({ set, setNumber, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!set.completed && (set.reps === 0 || set.weight === 0));
  const [tempReps, setTempReps] = useState(set.reps.toString());
  const [tempWeight, setTempWeight] = useState(set.weight.toString());
  const [tempNotes, setTempNotes] = useState(set.notes || '');

  const handleSave = () => {
    const reps = parseInt(tempReps) || 0;
    const weight = parseFloat(tempWeight) || 0;
    
    onUpdate({
      reps,
      weight,
      notes: tempNotes.trim() || undefined,
      completed: true
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempReps(set.reps.toString());
    setTempWeight(set.weight.toString());
    setTempNotes(set.notes || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempReps(set.reps.toString());
    setTempWeight(set.weight.toString());
    setTempNotes(set.notes || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="p-3 border-2 border-primary/50 bg-primary/5 animate-scale-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
            {setNumber}
          </div>
          <span className="text-sm font-medium text-foreground">Set {setNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Weight (lbs)
            </label>
            <div className="relative">
              <Weight className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={tempWeight}
                onChange={(e) => setTempWeight(e.target.value)}
                className="pl-8 h-10 text-center font-medium"
                placeholder="0"
                min="0"
                step="2.5"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Reps
            </label>
            <Input
              type="number"
              value={tempReps}
              onChange={(e) => setTempReps(e.target.value)}
              className="h-10 text-center font-medium"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Notes (optional)
          </label>
          <Input
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            className="h-10 text-sm"
            placeholder="e.g., failed at 8th rep, good form"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={handleSave}
            className="flex-1"
            disabled={!tempReps || !tempWeight}
          >
            <Check className="w-4 h-4" />
            Complete Set
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-3 transition-all duration-150 ${
      set.completed 
        ? 'bg-success/5 border-success/30' 
        : 'bg-card border-border hover:border-primary/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
            set.completed 
              ? 'bg-success text-success-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {set.completed ? <Check className="w-4 h-4" /> : setNumber}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{set.weight}</div>
              <div className="text-xs text-muted-foreground">lbs</div>
            </div>
            <div className="text-muted-foreground">×</div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{set.reps}</div>
              <div className="text-xs text-muted-foreground">reps</div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      {set.notes && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground italic">{set.notes}</p>
        </div>
      )}
    </Card>
  );
};