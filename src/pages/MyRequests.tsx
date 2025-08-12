import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MoveRequest } from '@/types';
import { getUserRequests, updateMoveRequest } from '@/services/dataService';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  TrashIcon,
  Loader2Icon,
  AlertCircleIcon
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

export default function MyRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getUserRequests(user.id);
        setRequests(data);
      } catch (error) {
        console.error('Error loading user requests:', error);
        toast({
          title: "Error",
          description: "Failed to load your requests. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [user, toast]);

  const handleCancelRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await updateMoveRequest(requestId, { status: 'closed' });
      
      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Request Canceled",
        description: "Your moving request has been canceled successfully."
      });
    } catch (error) {
      console.error('Error canceling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await updateMoveRequest(requestId, { status: 'completed' });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'completed' } : req
      ));
      
      toast({
        title: "Request Completed",
        description: "Your moving request has been marked as completed. Don't forget to leave a review!"
      });
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: "Error",
        description: "Failed to complete your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const openRequests = requests.filter(req => req.status === 'open');
  const assignedRequests = requests.filter(req => req.status === 'assigned');
  const completedRequests = requests.filter(req => req.status === 'completed');

  return (
    <MainLayout title="My Requests">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Your Moving Requests</h2>
          <Button onClick={() => navigate('/create')}>
            Create New Request
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2Icon className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
            <p>Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Requests Found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any moving requests yet.
              </p>
              <Button onClick={() => navigate('/create')}>
                Create Your First Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="open">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="open">
                Open 
                {openRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{openRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="assigned">
                In Progress
                {assignedRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{assignedRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{completedRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Open Requests */}
            <TabsContent value="open">
              <div className="space-y-4 mt-4">
                {openRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">You have no open requests.</p>
                    </CardContent>
                  </Card>
                ) : (
                  openRequests.map(request => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{request.title}</CardTitle>
                          <Badge>${request.price}</Badge>
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPinIcon size={14} className="mr-1" />
                          {request.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon size={14} className="mr-1" />
                            {formatDate(request.date)} at {request.time}
                          </div>
                          <div className="flex space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <TrashIcon size={16} className="mr-1" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove your request from the listings. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelRequest(request.id)}
                                    disabled={processingId === request.id}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {processingId === request.id ? (
                                      <>
                                        <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                                        Canceling...
                                      </>
                                    ) : (
                                      'Yes, Cancel It'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button size="sm" variant="default">Edit</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* Assigned Requests */}
            <TabsContent value="assigned">
              <div className="space-y-4 mt-4">
                {assignedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">You have no in-progress requests.</p>
                    </CardContent>
                  </Card>
                ) : (
                  assignedRequests.map(request => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{request.title}</CardTitle>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPinIcon size={14} className="mr-1" />
                          {request.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon size={14} className="mr-1" />
                            {formatDate(request.date)} at {request.time}
                          </div>
                          <Button 
                            onClick={() => handleCompleteRequest(request.id)} 
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <>
                                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon size={16} className="mr-2" />
                                Mark as Completed
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* Completed Requests */}
            <TabsContent value="completed">
              <div className="space-y-4 mt-4">
                {completedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">You have no completed requests.</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedRequests.map(request => (
                    <Card key={request.id} className="bg-muted/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{request.title}</CardTitle>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Completed
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPinIcon size={14} className="mr-1" />
                          {request.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ClockIcon size={14} className="mr-1" />
                            Completed on {formatDate(request.date)}
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}