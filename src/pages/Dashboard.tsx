
import { useEffect, useState } from 'react';
import { 
  Users, Home, CreditCard, AlertCircle,
  TrendingUp, Calendar, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/stats/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats, Payment, Room } from '@/lib/types';
import { getDashboardStats, getRecentPayments, getUpcomingPayments, getRoomsWithTenants } from '@/lib/supabase';

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, recentData, upcomingData, roomsData] = await Promise.all([
          getDashboardStats(),
          getRecentPayments(),
          getUpcomingPayments(),
          getRoomsWithTenants()
        ]);
        
        setStats(statsData);
        setRecentPayments(recentData || []);
        setUpcomingPayments(upcomingData || []);
        setRooms(roomsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    </DashboardLayout>
  );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your dorm management system"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tenants"
          value={stats?.totalTenants || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Available Rooms"
          value={stats?.availableRooms || 0}
          icon={<Home className="h-5 w-5" />}
        />
        <StatsCard
          title="Occupied Rooms"
          value={stats?.occupiedRooms || 0}
          icon={<Home className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Revenue"
          value={`₱${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map(payment => {
                  return (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{payment.tenant?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Room {payment.tenant?.room?.room_number} - ₱{payment.amount}</p>
                      </div>
                      <div className="text-right">
                        <div className={`status-${payment.status}`}>
                          {payment.status}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming payments</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map(payment => {
                  return (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{payment.tenant?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₱{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.status === 'completed'
                            ? `Paid ${new Date(payment.payment_date).toLocaleDateString()}` 
                            : `Due ${new Date(payment.payment_date).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Rooms & Tenants</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Room {room.room_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Capacity: {room.capacity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rent: ₱{room.rent_amount.toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Tenants:</p>
                    {room.tenants && room.tenants.length > 0 ? (
                      <div className="space-y-3">
                        {room.tenants.map((tenant) => (
                          <div key={tenant.id} className="border-l-2 border-primary pl-3">
                            <p className="font-medium">{tenant.full_name}</p>
                            <p className="text-sm text-muted-foreground">{tenant.email}</p>
                            <p className="text-sm text-muted-foreground">Since {new Date(tenant.move_in_date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tenants</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
