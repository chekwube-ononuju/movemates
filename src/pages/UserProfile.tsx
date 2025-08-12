import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarIcon, PhoneIcon, MailIcon, MapPinIcon, CalendarIcon, MessageCircleIcon, CreditCardIcon } from 'lucide-react';
import { UserProfile, Review } from '@/types';
import { getUserById, getUserReviews } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        const [profileData, reviewsData] = await Promise.all([
          getUserById(userId),
          getUserReviews(userId)
        ]);

        if (!profileData) {
          toast({
            title: "User Not Found",
            description: "The requested user profile could not be found.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setUserProfile(profileData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, navigate, toast]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i === Math.floor(rating) && rating % 1 !== 0
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handlePayment = () => {
    navigate(`/payment/${userId}`);
  };

  const handleMessage = () => {
    // In a real app, this would open a messaging interface
    toast({
      title: "Messaging",
      description: "Messaging feature coming soon!"
    });
  };

  if (loading) {
    return (
      <MainLayout title="User Profile">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!userProfile) {
    return (
      <MainLayout title="User Profile">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
          <p className="text-gray-600 mt-2">The requested user profile could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = currentUser?.id === userProfile.id;

  return (
    <MainLayout title={`${userProfile.name}'s Profile`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  {userProfile.isHelper && (
                    <Badge variant="secondary" className="w-fit">
                      Helper
                    </Badge>
                  )}
                </div>
                
                {userProfile.rating && userProfile.reviews ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(userProfile.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {userProfile.rating.toFixed(1)} ({userProfile.reviews} review{userProfile.reviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MailIcon className="w-4 h-4" />
                    {userProfile.email}
                  </div>
                  {userProfile.phone && (
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" />
                      {userProfile.phone}
                    </div>
                  )}
                  {userProfile.location && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {userProfile.location}
                    </div>
                  )}
                  {userProfile.joinedDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Joined {new Date(userProfile.joinedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleMessage} variant="outline">
                    <MessageCircleIcon className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button onClick={handlePayment}>
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Pay
                  </Button>
                </div>
              )}
            </div>
            
            {userProfile.bio && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-700">{userProfile.bio}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* School Information */}
        {userProfile.school && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{userProfile.school}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.fromUserAvatar} alt={review.fromUserName} />
                        <AvatarFallback>
                          {review.fromUserName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{review.fromUserName}</h4>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}