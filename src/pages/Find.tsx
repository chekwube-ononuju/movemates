import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { MapView } from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapMarker, MoveRequest } from '@/types';
import { getOpenRequests } from '@/services/dataService';
import { CalendarIcon, MapPinIcon, DollarSignIcon, ClockIcon, FilterIcon } from 'lucide-react';

export default function Find() {
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await getOpenRequests();
        setRequests(data);
        
        // Create map markers from requests
        const markers: MapMarker[] = data.map(req => ({
          id: req.id,
          position: { lat: req.location.lat, lng: req.location.lng },
          title: req.title,
          price: req.price
        }));
        setMapMarkers(markers);
        
        // Set map center to first request location or user's location
        if (data.length > 0) {
          setMapCenter({ lat: data[0].location.lat, lng: data[0].location.lng });
        } else {
          // Try to get user's current location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setMapCenter({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                });
              },
              () => {
                // Keep default NYC location if geolocation fails
              }
            );
          }
        }
      } catch (error) {
        console.error('Error loading move requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, []);

  const handleMarkerClick = (requestId: string) => {
    setSelectedRequest(requestId);
    // Scroll to the request card if on mobile
    const element = document.getElementById(`request-${requestId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestClick = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  const filteredAndSortedRequests = requests
    .filter(req => 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      return 0;
    });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <MainLayout title="Find Moving Help">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <MapView 
            markers={mapMarkers} 
            center={mapCenter}
            onMarkerClick={handleMarkerClick} 
            height="calc(100vh - 250px)"
          />
        </div>
        
        {/* Requests List */}
        <div>
          <div className="mb-4 space-y-3">
            <Input
              placeholder="Search by title, description, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center space-x-2">
              <FilterIcon size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Earliest)</SelectItem>
                  <SelectItem value="price-high">Price (Highest)</SelectItem>
                  <SelectItem value="price-low">Price (Lowest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading requests...</p>
              </div>
            ) : filteredAndSortedRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No moving requests found.</p>
              </div>
            ) : (
              filteredAndSortedRequests.map(request => (
                <Card 
                  key={request.id}
                  id={`request-${request.id}`}
                  className={`cursor-pointer transition-all ${
                    selectedRequest === request.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleRequestClick(request.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="ml-2 text-right">
                        <Badge variant="outline" className="mb-1">
                          ${request.price}{request.isHourly ? '/hr' : ''}
                        </Badge>
                        {request.isHourly && request.estimatedHours && (
                          <div className="text-xs text-muted-foreground">
                            ~{request.estimatedHours}h (${(request.price * request.estimatedHours).toFixed(0)} est.)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon size={14} className="mr-1" />
                      {request.location.address}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={request.userAvatar} alt={request.userName} />
                            <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{request.userName}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon size={14} className="mr-1" />
                          {formatDate(request.date)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <ClockIcon size={12} className="mr-1" />
                          {request.time}
                        </div>
                        {request.isHourly && request.estimatedHours && (
                          <div className="flex items-center">
                            <span>Est. {request.estimatedHours} hours</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <Button size="sm" className="w-full">Contact About Job</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}