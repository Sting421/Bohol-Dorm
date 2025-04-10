import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, CalendarIcon, Phone, Mail, User, Home, Clock } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tenants, rooms } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export const TenantsPage = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    roomId: 'unassigned',
    startDate: new Date(),
  });
  
  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(searchLower) ||
      tenant.email.toLowerCase().includes(searchLower) ||
      tenant.phone.includes(searchTerm)
    );
  });

  const renderContent = () => {
    if (isMobile) {
      return (
        <div className="grid gap-4">
          {filteredTenants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 text-muted-foreground">
                No tenants found
              </CardContent>
            </Card>
          ) : (
            filteredTenants.map((tenant) => {
              const tenantRoom = rooms.find(room => room.id === tenant.roomId);
              const joinDate = new Date(tenant.dateJoined);
              const nextDue = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, joinDate.getDate());
              
              return (
                <Card key={tenant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{tenant.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          {tenantRoom ? (
                            <Badge variant="outline">Room {tenantRoom.number}</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              Not Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Contact Information</div>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          <span>{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          <span>{tenant.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dates</div>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Joined: {new Date(tenant.dateJoined).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Next Due: {nextDue.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm">View</Button>
                    {isAdmin() && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setTenantFormData({
                              name: tenant.name,
                              email: tenant.email,
                              phone: tenant.phone,
                              address: tenant.address,
                              emergencyContact: tenant.emergencyContact,
                              roomId: tenant.roomId || 'unassigned',
                              startDate: new Date(tenant.dateJoined),
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
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
              <TableHead>Name</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => {
                const tenantRoom = rooms.find(room => room.id === tenant.roomId);
                const joinDate = new Date(tenant.dateJoined);
                const nextDue = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, joinDate.getDate());
                
                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      {tenantRoom ? (
                        <Badge variant="outline">Room {tenantRoom.number}</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Not Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tenant.email}</div>
                        <div className="text-muted-foreground">{tenant.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(tenant.dateJoined).toLocaleDateString()}</TableCell>
                    <TableCell>{nextDue.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">View</Button>
                      {isAdmin() && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setTenantFormData({
                                name: tenant.name,
                                email: tenant.email,
                                phone: tenant.phone,
                                address: tenant.address,
                                emergencyContact: tenant.emergencyContact,
                                roomId: tenant.roomId || 'unassigned',
                                startDate: new Date(tenant.dateJoined),
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
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
        title="Tenants" 
        description="Manage and view all tenants"
        actions={
          isAdmin() && (
            <Button onClick={() => {
              setTenantFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                emergencyContact: '',
                roomId: 'unassigned',
                startDate: new Date(),
              });
              setIsCreateModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Button>
          )
        }
      />
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {renderContent()}

      {/* Create Tenant Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Create a new tenant in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={tenantFormData.name}
                onChange={(e) => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={tenantFormData.email}
                onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={tenantFormData.phone}
                onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                placeholder="123-456-7890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={tenantFormData.address}
                onChange={(e) => setTenantFormData({ ...tenantFormData, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={tenantFormData.emergencyContact}
                onChange={(e) => setTenantFormData({ ...tenantFormData, emergencyContact: e.target.value })}
                placeholder="234-567-8901"
              />
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tenantFormData.startDate ? (
                      <span>{tenantFormData.startDate.toLocaleDateString()}</span>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tenantFormData.startDate}
                    onSelect={(date) => setTenantFormData({ ...tenantFormData, startDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Select 
                value={tenantFormData.roomId} 
                onValueChange={(value) => setTenantFormData({ ...tenantFormData, roomId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Not Assigned</SelectItem>
                  {rooms.filter(room => room.status === 'available').map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const newTenant: Tenant = {
                id: (tenants.length + 1).toString(),
                ...tenantFormData,
                roomId: tenantFormData.roomId === 'unassigned' ? undefined : tenantFormData.roomId,
                dateJoined: tenantFormData.startDate.toISOString().split('T')[0],
              };
              tenants.push(newTenant);

              // Update room status if room is assigned
              if (tenantFormData.roomId && tenantFormData.roomId !== 'unassigned') {
                const roomIndex = rooms.findIndex(r => r.id === tenantFormData.roomId);
                if (roomIndex !== -1) {
                  rooms[roomIndex].status = 'occupied';
                  rooms[roomIndex].tenantIds = [...rooms[roomIndex].tenantIds, newTenant.id];
                }
              }

              setIsCreateModalOpen(false);
            }}>Create Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Modify tenant details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={tenantFormData.name}
                onChange={(e) => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={tenantFormData.email}
                onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={tenantFormData.phone}
                onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                placeholder="123-456-7890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={tenantFormData.address}
                onChange={(e) => setTenantFormData({ ...tenantFormData, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={tenantFormData.emergencyContact}
                onChange={(e) => setTenantFormData({ ...tenantFormData, emergencyContact: e.target.value })}
                placeholder="234-567-8901"
              />
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tenantFormData.startDate ? (
                      <span>{tenantFormData.startDate.toLocaleDateString()}</span>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tenantFormData.startDate}
                    onSelect={(date) => setTenantFormData({ ...tenantFormData, startDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Select 
                value={tenantFormData.roomId} 
                onValueChange={(value) => setTenantFormData({ ...tenantFormData, roomId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Not Assigned</SelectItem>
                  {rooms
                    .filter(room => 
                      room.status === 'available' || 
                      (selectedTenant && room.id === selectedTenant.roomId)
                    )
                    .map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedTenant) {
                const index = tenants.findIndex(t => t.id === selectedTenant.id);
                if (index !== -1) {
                  // If room assignment changed
                  if (selectedTenant.roomId !== tenantFormData.roomId) {
                    // Update old room
                    if (selectedTenant.roomId) {
                      const oldRoom = rooms.find(r => r.id === selectedTenant.roomId);
                      if (oldRoom) {
                        oldRoom.tenantIds = oldRoom.tenantIds.filter(id => id !== selectedTenant.id);
                        if (oldRoom.tenantIds.length === 0) {
                          oldRoom.status = 'available';
                        }
                      }
                    }
                    // Update new room
                    if (tenantFormData.roomId && tenantFormData.roomId !== 'unassigned') {
                      const newRoom = rooms.find(r => r.id === tenantFormData.roomId);
                      if (newRoom) {
                        newRoom.status = 'occupied';
                        newRoom.tenantIds = [...newRoom.tenantIds, selectedTenant.id];
                      }
                    }
                  }

                  tenants[index] = {
                    ...tenants[index],
                    ...tenantFormData,
                    roomId: tenantFormData.roomId === 'unassigned' ? undefined : tenantFormData.roomId,
                    dateJoined: tenantFormData.startDate.toISOString().split('T')[0],
                  };
                }
              }
              setIsEditModalOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action cannot be undone. This will permanently delete tenant ${selectedTenant ? selectedTenant.name : ''} and remove all associated data.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (selectedTenant) {
                const index = tenants.findIndex(t => t.id === selectedTenant.id);
                if (index !== -1) {
                  // Update room if tenant was assigned to one
                  if (selectedTenant.roomId) {
                    const room = rooms.find(r => r.id === selectedTenant.roomId);
                    if (room) {
                      room.tenantIds = room.tenantIds.filter(id => id !== selectedTenant.id);
                      if (room.tenantIds.length === 0) {
                        room.status = 'available';
                      }
                    }
                  }
                  
                  tenants.splice(index, 1);
                }
              }
              setIsDeleteDialogOpen(false);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};
