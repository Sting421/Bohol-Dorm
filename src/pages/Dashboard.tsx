
import React from 'react';
import { 
  Users, Home, CreditCard, AlertCircle,
  TrendingUp, Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/stats/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardStats, payments, rooms, tenants } from '@/lib/data';

export const Dashboard = () => {
  // Get recent payments - last 5
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  // Get upcoming payments that are due
  const upcomingPayments = payments
    .filter(payment => payment.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your dorm management system"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tenants"
          value={dashboardStats.totalTenants}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Available Rooms"
          value={dashboardStats.availableRooms}
          icon={<Home className="h-5 w-5" />}
        />
        <StatsCard
          title="Occupied Rooms"
          value={dashboardStats.occupiedRooms}
          icon={<Home className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Revenue"
          value={`₱${dashboardStats.totalRevenue.toLocaleString()}`}
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
                  const tenant = tenants.find(t => t.id === payment.tenantId);
                  const room = rooms.find(r => r.id === payment.roomId);
                  
                  return (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{tenant?.name}</p>
                        <p className="text-sm text-muted-foreground">Room {room?.number} - ₱{payment.amount}</p>
                      </div>
                      <div className="text-right">
                        <div className={`status-${payment.status}`}>
                          {payment.status}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due {new Date(payment.dueDate).toLocaleDateString()}
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
                  const tenant = tenants.find(t => t.id === payment.tenantId);
                  
                  return (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{tenant?.name}</p>
                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₱{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.paidDate 
                            ? `Paid ${new Date(payment.paidDate).toLocaleDateString()}` 
                            : `Due ${new Date(payment.dueDate).toLocaleDateString()}`
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
    </DashboardLayout>
  );
};
