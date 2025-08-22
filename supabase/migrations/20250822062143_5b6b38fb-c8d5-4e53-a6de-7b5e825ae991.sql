-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER DEFAULT 0, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sets table
CREATE TABLE IF NOT EXISTS public.sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(6,2) DEFAULT 0,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for workouts
CREATE POLICY "Users can view own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for exercises
CREATE POLICY "Users can view own exercises" ON public.exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own exercises" ON public.exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own exercises" ON public.exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own exercises" ON public.exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_id AND user_id = auth.uid())
);

-- Create RLS policies for sets
CREATE POLICY "Users can view own sets" ON public.sets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exercises e 
    JOIN public.workouts w ON e.workout_id = w.id 
    WHERE e.id = exercise_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own sets" ON public.sets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exercises e 
    JOIN public.workouts w ON e.workout_id = w.id 
    WHERE e.id = exercise_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own sets" ON public.sets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.exercises e 
    JOIN public.workouts w ON e.workout_id = w.id 
    WHERE e.id = exercise_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own sets" ON public.sets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.exercises e 
    JOIN public.workouts w ON e.workout_id = w.id 
    WHERE e.id = exercise_id AND w.user_id = auth.uid()
  )
);

-- Create RLS policies for friends
CREATE POLICY "Users can view own friends" ON public.friends FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = friend_user_id
);
CREATE POLICY "Users can insert own friends" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friends" ON public.friends FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own friends" ON public.friends FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER TABLE public.workouts REPLICA IDENTITY FULL;
ALTER TABLE public.exercises REPLICA IDENTITY FULL;
ALTER TABLE public.sets REPLICA IDENTITY FULL;
ALTER TABLE public.friends REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exercises;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;