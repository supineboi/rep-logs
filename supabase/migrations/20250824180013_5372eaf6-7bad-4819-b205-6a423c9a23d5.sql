-- Add dummy users to profiles table
INSERT INTO public.profiles (user_id, username, display_name, avatar_url) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'sarah_smith', 'Sarah Smith', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face'),
  ('00000000-0000-0000-0000-000000000002', 'mike_wilson', 'Mike Wilson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
  ('00000000-0000-0000-0000-000000000003', 'emma_davis', 'Emma Davis', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'),
  ('00000000-0000-0000-0000-000000000004', 'alex_johnson', 'Alex Johnson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'),
  ('00000000-0000-0000-0000-000000000005', 'lisa_garcia', 'Lisa Garcia', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face')
ON CONFLICT (user_id) DO NOTHING;

-- Add some sample workouts for dummy users
INSERT INTO public.workouts (user_id, date, duration, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', '2024-01-20 10:00:00+00', 45, 'Great chest and triceps session'),
  ('00000000-0000-0000-0000-000000000001', '2024-01-18 08:30:00+00', 60, 'Leg day - feeling strong!'),
  ('00000000-0000-0000-0000-000000000002', '2024-01-19 17:00:00+00', 50, 'Back and biceps workout'),
  ('00000000-0000-0000-0000-000000000003', '2024-01-21 07:00:00+00', 40, 'Morning cardio and core'),
  ('00000000-0000-0000-0000-000000000004', '2024-01-20 19:00:00+00', 55, 'Evening full body session')
ON CONFLICT (id) DO NOTHING;

-- Add some sample exercises for the workouts
INSERT INTO public.exercises (workout_id, name, order_index)
SELECT 
  w.id,
  CASE 
    WHEN w.notes LIKE '%chest%' THEN 'Bench Press'
    WHEN w.notes LIKE '%leg%' THEN 'Squats'
    WHEN w.notes LIKE '%back%' THEN 'Pull-ups'
    WHEN w.notes LIKE '%cardio%' THEN 'Treadmill'
    ELSE 'Deadlifts'
  END,
  0
FROM public.workouts w
WHERE w.user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
)
ON CONFLICT DO NOTHING;

-- Add some sample sets for the exercises
INSERT INTO public.sets (exercise_id, reps, weight, completed, order_index)
SELECT 
  e.id,
  CASE 
    WHEN e.name = 'Bench Press' THEN 8
    WHEN e.name = 'Squats' THEN 12
    WHEN e.name = 'Pull-ups' THEN 6
    WHEN e.name = 'Treadmill' THEN 30
    ELSE 10
  END,
  CASE 
    WHEN e.name = 'Bench Press' THEN 185
    WHEN e.name = 'Squats' THEN 225
    WHEN e.name = 'Pull-ups' THEN 0
    WHEN e.name = 'Treadmill' THEN 0
    ELSE 315
  END,
  true,
  generate_series % 3
FROM public.exercises e
CROSS JOIN generate_series(0, 2)
WHERE EXISTS (
  SELECT 1 FROM public.workouts w 
  WHERE w.id = e.workout_id 
  AND w.user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
  )
)
ON CONFLICT DO NOTHING;