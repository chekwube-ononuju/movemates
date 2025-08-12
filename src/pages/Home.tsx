import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 -mx-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                College Moves Made <span className="text-primary">Simple</span>
              </h1>
              <p className="text-lg mb-6 text-muted-foreground">
                Connect with fellow students for affordable moving help on campus. Post jobs or earn money helping others move in.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="px-6 font-semibold">
                  <Link to="/find">Find Helpers</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-6">
                  <Link to="/create">Post a Moving Job</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/images/MovingAssistance.jpg" 
                alt="Students helping with move" 
                className="w-full max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Simple steps to get the moving help you need</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Post Your Job</h3>
              <p className="text-muted-foreground">
                Create a detailed post about your moving needs, location, date, and how much you're willing to pay.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect with Helpers</h3>
              <p className="text-muted-foreground">
                Browse available student helpers in your area or wait for them to contact you about your job.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Complete the Move</h3>
              <p className="text-muted-foreground">
                Meet your helper on the arranged date, get your move done, and pay them directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Earn Money Section */}
      <section className="py-16 bg-slate-100 -mx-4 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img 
                src="https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2500&q=80" 
                alt="Student earning money" 
                className="w-full max-w-md rounded-lg shadow-lg mx-auto"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-4">Want to Earn Money?</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                Use your strength and free time to help fellow students with their moves.
                Set your own schedule and earn money on campus.
              </p>
              <Button asChild size="lg" className="px-6 font-semibold">
                <Link to="/become-helper">Become a Helper</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What Students Say</h2>
          <p className="text-muted-foreground mt-2">Real experiences from campus moves</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="font-semibold text-blue-600">LM</span>
                </div>
                <div>
                  <h4 className="font-semibold">Lisa M.</h4>
                  <p className="text-xs text-muted-foreground">State University</p>
                </div>
              </div>
              <p className="italic">
                "Found an awesome helper who carried all my heavy boxes up to the 4th floor. 
                Saved me so much time and stress on move-in day!"
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="font-semibold text-green-600">JT</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jake T.</h4>
                  <p className="text-xs text-muted-foreground">Tech Institute</p>
                </div>
              </div>
              <p className="italic">
                "I earned over $200 in my first week as a helper! Great way to make 
                money between classes and meet new people on campus."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make Your College Move Easier?</h2>
        <p className="text-lg mb-6 text-muted-foreground max-w-2xl mx-auto">
          Whether you need help moving or want to earn extra money, MoveMates 
          connects you with fellow students on campus.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="px-6 font-semibold">
            <Link to="/find">Find Helpers</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-6">
            <Link to="/become-helper">Become a Helper</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}