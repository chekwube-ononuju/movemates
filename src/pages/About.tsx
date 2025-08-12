import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORM_FEE_PERCENTAGE } from '@/lib/constants';

export default function About() {
  return (
    <MainLayout title="About MoveMates">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              MoveMates connects students who need moving assistance with fellow students 
              who can help for a fee. We make moving in and out of dorms and apartments easier, 
              more affordable, and more social.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">For Students Moving</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Post your moving job with details</li>
                    <li>Review available helpers in your area</li>
                    <li>Connect and coordinate with your helper</li>
                    <li>Pay them directly when the job is done</li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">For Helpers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Create a helper profile</li>
                    <li>Browse available jobs or get matched</li>
                    <li>Accept jobs that fit your schedule</li>
                    <li>Complete the work and get paid</li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">For Everyone</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Build connections within your campus</li>
                    <li>Save money compared to professional services</li>
                    <li>Flexible scheduling around classes</li>
                    <li>Quick, easy, and convenient</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Platform Fees</h2>
            <Card>
              <CardHeader>
                <CardTitle>How Our Platform Fee Works</CardTitle>
                <CardDescription>
                  MoveMates charges a {PLATFORM_FEE_PERCENTAGE}% fee on all completed jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  To sustain and improve our platform, MoveMates charges a {PLATFORM_FEE_PERCENTAGE}% fee on all 
                  payments received by helpers. This fee helps us:
                </p>
                
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  <li>Maintain and improve the platform</li>
                  <li>Provide customer support for both helpers and those needing help</li>
                  <li>Cover payment processing costs</li>
                  <li>Verify users and ensure community safety</li>
                  <li>Develop new features to improve your experience</li>
                </ul>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Example Calculation</h3>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div>Job payment:</div>
                    <div className="font-medium">$50.00</div>
                    <div>Platform fee ({PLATFORM_FEE_PERCENTAGE}%):</div>
                    <div className="font-medium">-$5.00</div>
                    <div className="border-t pt-1 font-medium">Helper receives:</div>
                    <div className="font-medium border-t pt-1">$45.00</div>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>
                    <strong>Note:</strong> Payments are made directly between students. The platform fee 
                    is calculated when helpers report completed jobs, but MoveMates does not handle 
                    the actual payment transaction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Safety & Trust</h2>
            <p className="text-muted-foreground mb-4">
              We take the safety of our community seriously. All users are verified students, 
              and we encourage reviews and ratings after each transaction to build trust within 
              the platform.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Our Safety Guidelines</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-2">
                <li>Always meet in public or well-populated areas</li>
                <li>Communicate through our platform when possible</li>
                <li>Be clear about expectations and requirements</li>
                <li>Use secure payment methods</li>
                <li>Report any suspicious behavior immediately</li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <p className="mt-2">
              Email: <a href="mailto:support@movemates.com" className="text-primary hover:underline">support@movemates.com</a>
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}