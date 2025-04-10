import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Calendar, User, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { payments, tenants, rooms } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Payment, PaymentStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const PaymentsPage = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const handlePaymentStatusChange = (payment: Payment) => {
    const updatedPayments = payments.map(p => {
      if (p.id === payment.id) {
        const newStatus = payment.status === 'paid' ? 'pending' : 'paid';
        return {
          ...p,
          status: newStatus,
          paidDate: newStatus === 'paid' ? new Date().toISOString() : undefined
        };
      }
      return p;
    });
    
    Object.assign(payments, updatedPayments);
    setSelectedPayment(null);
    setShowConfirmDialog(false);
  };
  
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewDialog(true);
  };
  
  const filteredPayments = payments.filter(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const room = rooms.find(r => r.id === payment.roomId);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      tenant?.name.toLowerCase().includes(searchLower) ||
      room?.number.includes(searchTerm) ||
      payment.description.toLowerCase().includes(searchLower);
      
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(payment.status);
    
    return matchesSearch && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );
  
  const toggleStatusFilter = (status: PaymentStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const renderContent = () => {
    if (isMobile) {
      return (
        <div className="grid gap-4">
          {sortedPayments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 text-muted-foreground">
                No payments found
              </CardContent>
            </Card>
          ) : (
            sortedPayments.map((payment) => {
              const tenant = tenants.find(t => t.id === payment.tenantId);
              const room = rooms.find(r => r.id === payment.roomId);
              
              return (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{tenant?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Home className="h-4 w-4" />
                          <span>Room {room?.number}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="font-semibold">₱{payment.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="text-sm">{payment.description}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewPayment(payment)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {isAdmin() && (
                      payment.status === 'paid' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowConfirmDialog(true);
                          }}
                        >
                          Mark Unpaid
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePaymentStatusChange(payment)}
                        >
                          Mark Paid
                        </Button>
                      )
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      );
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              sortedPayments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenantId);
                const room = rooms.find(r => r.id === payment.roomId);
                
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{tenant?.name}</TableCell>
                    <TableCell>Room {room?.number}</TableCell>
                    <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {isAdmin() && (
                        payment.status === 'paid' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowConfirmDialog(true);
                            }}
                          >
                            Mark Unpaid
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePaymentStatusChange(payment)}
                          >
                            Mark Paid
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Payments" 
        description="Manage and track all payments"
        actions={
          isAdmin() && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          )
        }
      />
      
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('paid')}
              onCheckedChange={() => toggleStatusFilter('paid')}
            >
              Paid
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('pending')}
              onCheckedChange={() => toggleStatusFilter('pending')}
            >
              Pending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('overdue')}
              onCheckedChange={() => toggleStatusFilter('overdue')}
            >
              Overdue
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {renderContent()}

      {/* View Payment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Tenant</p>
                  <p>{tenants.find(t => t.id === selectedPayment.tenantId)?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Room</p>
                  <p>Room {rooms.find(r => r.id === selectedPayment.roomId)?.number}</p>
                </div>
                <div>
                  <p className="font-medium">Amount</p>
                  <p>₱{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium">Due Date</p>
                  <p>{new Date(selectedPayment.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge 
                    variant="outline" 
                    className={
                      selectedPayment.status === 'paid'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : selectedPayment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                {selectedPayment.paidDate && (
                  <div>
                    <p className="font-medium">Paid Date</p>
                    <p>{new Date(selectedPayment.paidDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="font-medium">Description</p>
                  <p>{selectedPayment.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Unpaid Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Mark as Unpaid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this payment as unpaid? This action will remove the paid date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => selectedPayment && handlePaymentStatusChange(selectedPayment)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
