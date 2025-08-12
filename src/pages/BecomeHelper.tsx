import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { updateUserProfile } from '@/services/dataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PLATFORM_FEE_PERCENTAGE } from '@/lib/constants';
import { AlertCircle, CheckCircle2, DollarSign, FileCheck, Shield } from 'lucide-react';

export default function BecomeHelper() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [availableWeekends, setAvailableWeekends] = useState(true);
  const [availableWeekdays, setAvailableWeekdays] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToFees, setAgreedToFees] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to become a helper",
        variant: "destructive"
      });
      return;
    }
    
    if (!phone || !bio || !agreedToTerms || !agreedToFees) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and agree to the terms and platform fees",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const helperProfile = {
        isHelper: true,
        helperProfile: {
          phone,
          bio,
          experience,
          availability: {
            weekends: availableWeekends,
            weekdays: availableWeekdays
          },
          hasCar,
          maxDistance,
          joinDate: new Date().toISOString(),
          rating: 0,
          completedJobs: 0,
          earnings: 0
        }
      };
      
      await updateUserProfile(user.id, helperProfile);
      
      // Update local user state
      setUser({
        ...user,
        ...helperProfile
      });
      
      toast({
        title: "Success!",
        description: "You're now registered as a helper on MoveMates!"
      });
      
      navigate('/assignments');
    } catch (error) {
      console.error('Error registering as helper:', error);
      toast({
        title: "Error",
        description: "Failed to register as helper. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to calculate example earnings with platform fee
  const calculateEarnings = (amount: number) => {
    const fee = amount * (PLATFORM_FEE_PERCENTAGE / 100);
    const earnings = amount - fee;
    return {
      original: amount,
      fee,
      earnings
    };
  };
  
  // Example earnings
  const exampleAmount = 50;
  const exampleEarnings = calculateEarnings(exampleAmount);
  
  return (
    <MainLayout title="Become a Helper">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Earn Money Helping Fellow Students Move</CardTitle>
            <CardDescription>
              Join our platform as a helper and earn money assisting other students with their moves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50">
                <DollarSign className="h-10 w-10 text-blue-500 mb-2" />
                <h3 className="font-semibold">Set Your Own Rates</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose which jobs you want to accept based on payment and schedule
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50">
                <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                <h3 className="font-semibold">Flexible Schedule</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Work when it's convenient for you, no minimum hours required
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-amber-50">
                <Shield className="h-10 w-10 text-amber-500 mb-2" />
                <h3 className="font-semibold">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Work with verified students in your college community
                </p>
              </div>
            </div>
            
            {/* Platform Fee Information */}
            <Card className="mb-6 bg-slate-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Platform Fee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  MoveMates charges a {PLATFORM_FEE_PERCENTAGE}% platform fee on all payments received by helpers. This fee helps us maintain and improve the platform, provide customer support, and handle payment processing.
                </p>
                <div className="bg-white p-4 rounded-md border mb-4">
                  <h4 className="font-semibold mb-2">Example Payment</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div>Job payment:</div>
                    <div className="font-medium">${exampleAmount.toFixed(2)}</div>
                    <div>Platform fee ({PLATFORM_FEE_PERCENTAGE}%):</div>
                    <div className="font-medium">-${exampleEarnings.fee.toFixed(2)}</div>
                    <div className="border-t pt-1">You receive:</div>
                    <div className="font-medium border-t pt-1">${exampleEarnings.earnings.toFixed(2)}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payments are made directly between students. The platform fee is calculated automatically when you report completed jobs.
                </p>
              </CardContent>
            </Card>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="experience">Moving Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe any relevant experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Weekends</h4>
                      <p className="text-sm text-muted-foreground">Saturday & Sunday</p>
                    </div>
                    <Switch
                      checked={availableWeekends}
                      onCheckedChange={setAvailableWeekends}
                    />
                  </div>
                  <div className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Weekdays</h4>
                      <p className="text-sm text-muted-foreground">Monday through Friday</p>
                    </div>
                    <Switch
                      checked={availableWeekdays}
                      onCheckedChange={setAvailableWeekdays}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <h4 className="font-medium">I have access to a car</h4>
                    <p className="text-sm text-muted-foreground">For transporting items if needed</p>
                  </div>
                  <Switch
                    checked={hasCar}
                    onCheckedChange={setHasCar}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxDistance">
                    Maximum Distance (miles)
                  </Label>
                  <Input
                    id="maxDistance"
                    type="number"
                    min={1}
                    max={50}
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How far you're willing to travel for jobs
                  </p>
                </div>
                
                <div className="flex items-top space-x-2 pt-4">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Including background verification and community guidelines.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-top space-x-2">
                  <Checkbox 
                    id="fees" 
                    checked={agreedToFees}
                    onCheckedChange={(checked) => setAgreedToFees(checked as boolean)}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="fees"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I understand and agree to the {PLATFORM_FEE_PERCENTAGE}% platform fee
                    </label>
                    <p className="text-sm text-muted-foreground">
                      The fee will be deducted from payments I receive for completed jobs.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isSubmitting || !agreedToTerms || !agreedToFees}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Register as a Helper'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}