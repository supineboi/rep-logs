import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutLogger } from "@/components/WorkoutLogger";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Navigation } from "@/components/Navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { Dumbbell, TrendingUp, History, LogOut } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 pt-8 pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Rep Logs
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {user.email?.split('@')[0]}!
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Workout</CardTitle>
                <CardDescription>
                  Track your sets and reps in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutLogger />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>
                  Review your past workouts and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracker</CardTitle>
                <CardDescription>
                  Visualize your strength gains over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressTracker />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;