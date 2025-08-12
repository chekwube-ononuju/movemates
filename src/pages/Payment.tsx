import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreditCardIcon, DollarSignIcon, ShieldCheckIcon, ArrowLeftIcon } from 'lucide-react';
import { UserProfile } from '@/types';
import { getUserById } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface PaymentComponentProps {}

function PaymentComponent() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Compute total with 10% fee
  const totalAmount = amount && parseFloat(amount) > 0 ? (parseFloat(amount) * 1.10).toFixed(2) : '';
  const serviceFee = amount && parseFloat(amount) > 0 ? (parseFloat(totalAmount) - parseFloat(amount)).toFixed(2) : '';

  useEffect(() => {
    const loadRecipient = async () => {
      if (!userId) {
        navigate('/');
        return;
      }
      if (!currentUser) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to make a payment.',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }
      try {
        const profileData = await getUserById(userId);
        if (!profileData) {
          toast({
            title: 'User Not Found',
          description: 'The recipient could not be found.',
          variant: 'destructive'
          });
          navigate('/');
          return;
        }
        if (profileData.id === currentUser.id) {
          toast({
            title: 'Invalid Payment',
            description: 'You cannot pay yourself.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }
        setRecipient(profileData);
      } catch (error) {
        console.error('Error loading recipient:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recipient information.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    loadRecipient();
  }, [userId, currentUser, navigate, toast]);

  // CardElement will handle the card UI; we no longer support alternative payment methods here.

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive'
      });
      return;
    }
    if (!stripe || !elements) {
      toast({ title: 'Stripe unavailable', description: 'Payment processing is unavailable.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      // Create payment intent via API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }
      setClientSecret(data.clientSecret);
      // Confirm payment with card details
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: currentUser?.name ?? undefined,
            email: currentUser?.email ?? undefined
          }
        }
      });
      if (result.error) {
        console.error(result.error);
        toast({ title: 'Payment Failed', description: result.error.message || 'There was an error processing your payment.', variant: 'destructive' });
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        toast({ title: 'Payment Successful', description: `Successfully sent $${totalAmount} to ${recipient?.name}` });
        navigate('/my-requests');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({ title: 'Payment Failed', description: error.message || 'There was an error processing your payment.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Payment">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!recipient) {
    return (
      <MainLayout title="Payment">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Recipient Not Found</h2>
          <p className="text-gray-600 mt-2">The payment recipient could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Send Payment">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Recipient Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5" />
              Send Payment To
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={recipient.avatar} alt={recipient.name} />
                <AvatarFallback className="text-lg">
                  {recipient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{recipient.name}</h3>
                <p className="text-gray-600">{recipient.school}</p>
                {recipient.isHelper && (
                  <Badge variant="secondary" className="mt-1">
                    Helper
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative">
                <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What's this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Separator />

            {/* Card input */}
            <div className="space-y-2">
              <Label>Card Details</Label>
              <div className="p-3 border rounded-lg">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Your payment information is encrypted and secure. Payments are processed instantly.
              </p>
            </div>

            {/* Payment Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (10%):</span>
                    <span>${serviceFee}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing || !stripe || !elements}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSignIcon className="w-4 h-4 mr-2" />
                  Pay ${totalAmount || '0.00'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

// Wrapper component that provides Stripe context via Elements.
function Payment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentComponent />
    </Elements>
  );
}

export default Payment;