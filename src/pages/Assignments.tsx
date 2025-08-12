import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Progress 
} from '@/components/ui/progress';
import { MoveRequest } from '@/types';
import { 
  getHelperAssignments, 
  updateMoveRequest, 
  updateUserProfile 
} from '@/services/dataService';
import { PLATFORM_FEE_PERCENTAGE } from '@/lib/constants';
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  CheckCircle2, 
  ArrowUp, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

export default function Assignments() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  
  const [assignments, setAssignments] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCompletingJob, setIsCompletingJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Stats
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [platformFees, setPlatformFees] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  
  useEffect(() => {
    if (!user?.isHelper) return;
    
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const data = await getHelperAssignments(user.id);
        setAssignments(data);
        
        // Calculate stats from assignments
        let earnings = 0;
        let fees = 0;
        let completed = 0;
        let monthEarnings = 0;
        const currentMonth = new Date().getMonth();
        
        data.forEach(assignment => {
          if (assignment.status === 'completed' && assignment.helperPaid) {
            const price = assignment.price;
            const fee = price * (PLATFORM_FEE_PERCENTAGE / 100);
            
            earnings += price - fee;
            fees += fee;
            completed += 1;
            
            // Check if completed this month
            const completedDate = new Date(assignment.completedAt || Date.now());
            if (completedDate.getMonth() === currentMonth) {
              monthEarnings += price - fee;
            }
          }
        });
        
        setTotalEarnings(earnings);
        setPlatformFees(fees);
        setCompletedJobs(completed);
        setThisMonthEarnings(monthEarnings);
      } catch (error) {
        console.error('Error loading assignments:', error);
        toast({
          title: "Error",
          description: "Failed to load your assignments. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAssignments();
  }, [user, toast]);
  
  const handleMarkCompleted = async (requestId: string) => {
    if (!user) return;
    
    try {
      setProcessingId(requestId);
      
      const request = assignments.find(r => r.id === requestId);
      if (!request) return;
      
      // Update the request status
      await updateMoveRequest(requestId, { 
        status: 'completed',
        completedAt: new Date().toISOString(),
        helperPaid: true
      });
      
      // Calculate earnings
      const price = request.price;
      const fee = price * (PLATFORM_FEE_PERCENTAGE / 100);
      const earnings = price - fee;
      
      // Update helper profile
      if (user.helperProfile) {
        const updatedProfile = {
          helperProfile: {
            ...user.helperProfile,
            completedJobs: (user.helperProfile.completedJobs || 0) + 1,
            earnings: (user.helperProfile.earnings || 0) + earnings
          }
        };
        
        await updateUserProfile(user.id, updatedProfile);
        
        // Update local user state
        setUser({
          ...user,
          helperProfile: {
            ...user.helperProfile,
            completedJobs: (user.helperProfile.completedJobs || 0) + 1,
            earnings: (user.helperProfile.earnings || 0) + earnings
          }
        });
      }
      
      // Update local state
      setAssignments(prev => prev.map(a => 
        a.id === requestId 
          ? { 
              ...a, 
              status: 'completed', 
              completedAt: new Date().toISOString(),
              helperPaid: true
            } 
          : a
      ));
      
      // Update stats
      setTotalEarnings(prev => prev + earnings);
      setPlatformFees(prev => prev + fee);
      setCompletedJobs(prev => prev + 1);
      
      const currentMonth = new Date().getMonth();
      const completedDate = new Date();
      if (completedDate.getMonth() === currentMonth) {
        setThisMonthEarnings(prev => prev + earnings);
      }
      
      toast({
        title: "Job Completed",
        description: "Great job! Your earnings have been updated."
      });
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Error",
        description: "Failed to mark the job as completed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
      setIsCompletingJob(false);
      setSelectedJobId(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEE, MMM d');
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };
  
  // Filter assignments by status
  const pendingAssignments = assignments.filter(a => a.status === 'assigned');
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  
  // Calculate platform goal progress (example: goal is to earn $500)
  const earningsGoal = 500;
  const goalProgress = Math.min(100, (totalEarnings / earningsGoal) * 100);
  
  return (
    <MainLayout title="My Assignments">
      <div className="max-w-4xl mx-auto">
        {!user?.isHelper ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">You're not registered as a helper yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Register as a helper to start earning money by helping other students move.
              </p>
              <Button href="/become-helper">Become a Helper</Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
            <p>Loading your assignments...</p>
          </div>
        ) : (
          <>
            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatCurrency(totalEarnings)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    After {PLATFORM_FEE_PERCENTAGE}% platform fee
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatCurrency(thisMonthEarnings)}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <ArrowUp size={12} className="mr-1" />
                    <span>Active month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatCurrency(platformFees)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {PLATFORM_FEE_PERCENTAGE}% of ${formatCurrency(totalEarnings + platformFees)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Jobs Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedJobs}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: ${completedJobs > 0 ? formatCurrency(totalEarnings / completedJobs) : '0'}/job
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Earnings Goal */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Earnings Goal</CardTitle>
                <CardDescription>$500 this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={goalProgress} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">${formatCurrency(totalEarnings)} earned</span>
                    <span className="font-medium">{Math.round(goalProgress)}% of goal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="pending" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pending
                  {pendingAssignments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{pendingAssignments.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  {completedAssignments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{completedAssignments.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Pending Jobs */}
              <TabsContent value="pending">
                <div className="space-y-4 mt-4">
                  {pendingAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">You have no pending assignments.</p>
                        <Button variant="outline" className="mt-4" href="/find">
                          Find Jobs
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingAssignments.map(assignment => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle>{assignment.title}</CardTitle>
                            <Badge className="ml-2">
                              ${assignment.price}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {assignment.location.address}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {assignment.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-1 text-muted-foreground" />
                                {formatDate(assignment.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1 text-muted-foreground" />
                                {assignment.time}
                              </div>
                              <div className="flex items-center">
                                <DollarSign size={14} className="mr-1 text-muted-foreground" />
                                <span className="font-medium">
                                  You get: ${formatCurrency(assignment.price * (1 - PLATFORM_FEE_PERCENTAGE / 100))}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  (after {PLATFORM_FEE_PERCENTAGE}% fee)
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Button variant="outline" size="sm">
                                Message User
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    onClick={() => setSelectedJobId(assignment.id)}
                                    disabled={processingId === assignment.id}
                                  >
                                    {processingId === assignment.id ? (
                                      <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Completed
                                      </>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Complete this job?</DialogTitle>
                                    <DialogDescription>
                                      By marking this job as completed, you confirm that:
                                      <ul className="list-disc pl-4 pt-2 space-y-1">
                                        <li>You have completed all the work agreed upon</li>
                                        <li>You have received payment of ${assignment.price}</li>
                                        <li>A {PLATFORM_FEE_PERCENTAGE}% platform fee (${formatCurrency(assignment.price * PLATFORM_FEE_PERCENTAGE / 100)}) will be applied</li>
                                      </ul>
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="bg-muted/30 p-4 rounded-md">
                                    <div className="flex justify-between mb-1 text-sm">
                                      <span>Payment received:</span>
                                      <span className="font-medium">${assignment.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-1 text-sm">
                                      <span>Platform fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
                                      <span className="font-medium">-${formatCurrency(assignment.price * PLATFORM_FEE_PERCENTAGE / 100)}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t text-sm font-medium">
                                      <span>Your earnings:</span>
                                      <span className="text-green-600">${formatCurrency(assignment.price * (1 - PLATFORM_FEE_PERCENTAGE / 100))}</span>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedJobId(null)}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        setIsCompletingJob(true);
                                        handleMarkCompleted(selectedJobId!);
                                      }}
                                      disabled={isCompletingJob}
                                    >
                                      {isCompletingJob ? (
                                        <>
                                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                          Processing...
                                        </>
                                      ) : (
                                        'Confirm & Complete'
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {/* Completed Jobs */}
              <TabsContent value="completed">
                <div className="space-y-4 mt-4">
                  {completedAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">You haven't completed any jobs yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    completedAssignments.map(assignment => (
                      <Card key={assignment.id} className="bg-muted/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center">
                              {assignment.title}
                              <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                            </CardTitle>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              +${formatCurrency(assignment.price * (1 - PLATFORM_FEE_PERCENTAGE / 100))}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {assignment.location.address}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm mb-3">
                            <span className="text-muted-foreground">Completed: </span>
                            <span className="font-medium">
                              {assignment.completedAt 
                                ? formatDate(assignment.completedAt) 
                                : formatDate(assignment.date)}
                            </span>
                          </div>
                          <div className="text-sm flex items-center">
                            <DollarSign size={14} className="mr-1 text-muted-foreground" />
                            <span>Payment: ${assignment.price}</span>
                            <span className="text-xs ml-2 text-muted-foreground">
                              (Fee: ${formatCurrency(assignment.price * PLATFORM_FEE_PERCENTAGE / 100)})
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
}