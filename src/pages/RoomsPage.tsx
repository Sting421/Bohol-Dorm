import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Users, ChevronDown, Mail, Calendar } from 'lucide-react';
import { Room, Tenant, GoogleUser } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { createRoom, getRooms, updateRoom, deleteRoom, getDormsForCurrentUser, getAvailableTenants, assignTenantToRoom, removeTenantFromRoom } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isManageTenantsOpen, setIsManageTenantsOpen] = useState(false);
  const [managingRoom, setManagingRoom] = useState<Room | null>(null);
  const [availableTenants, setAvailableTenants] = useState<GoogleUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigningTenant, setIsAssigningTenant] = useState(false);

  const [roomFormData, setRoomFormData] = useState({
    dorm_id: '',
    room_number: '',
    capacity: 1,
    rent_amount: 0,
    images: [] as string[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.tenants?.some(tenant => 
        tenant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [rooms, searchQuery]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const fetchedRooms = await getRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Failed to fetch rooms. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoom = async (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      dorm_id: room.dorm_id,
      room_number: room.room_number,
      capacity: room.capacity,
      rent_amount: room.rent_amount,
      images: room.images,
      created_at: room.created_at,
      updated_at: new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;
    
    try {
      setIsSubmitting(true);
      
      let imageUrls = roomFormData.images;
      if (uploadFiles.length > 0) {
        try {
          imageUrls = await Promise.all(
            uploadFiles.map(async (file) => await uploadToCloudinary(file))
          );
        } catch (error) {
          console.error('Error uploading images:', error);
          alert('Failed to upload images. Please try again.');
          return;
        }
      }

      await updateRoom(editingRoom.id, {
        room_number: roomFormData.room_number,
        capacity: roomFormData.capacity,
        rent_amount: roomFormData.rent_amount,
        images: imageUrls,
        updated_at: roomFormData.updated_at,
      });

      setIsEditModalOpen(false);
      setEditingRoom(null);
      setUploadFiles([]);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const handleManageTenants = async (room: Room) => {
    setManagingRoom(room);
    setIsManageTenantsOpen(true);
    try {
      const tenants = await getAvailableTenants();
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Error fetching available tenants:', error);
      alert('Failed to fetch available tenants');
    }
  };

  const handleAssignTenant = async () => {
    if (!managingRoom || !selectedUserId) return;
    
    try {
      setIsAssigningTenant(true);
      await assignTenantToRoom(selectedUserId, managingRoom.id);
      await fetchRooms();
      
      // Remove assigned user from available list
      setAvailableTenants(prev => prev.filter(t => t.id !== selectedUserId));
      setSelectedUserId('');
    } catch (error) {
      console.error('Error assigning tenant:', error);
      alert('Failed to assign tenant');
    } finally {
      setIsAssigningTenant(false);
    }
  };

  const handleRemoveTenant = async (tenantId: string) => {
    if (!managingRoom) return;

    try {
      setIsAssigningTenant(true);
      await removeTenantFromRoom(tenantId);
      await fetchRooms();
      
      // Refresh available tenants list
      const tenants = await getAvailableTenants();
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Error removing tenant:', error);
      alert('Failed to remove tenant');
    } finally {
      setIsAssigningTenant(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setIsSubmitting(true);
      const { data: dorms, error } = await getDormsForCurrentUser();
      if (error || !dorms || dorms.length === 0) {
        throw new Error('Failed to fetch dorm for the current user');
      }
      const dorm_id = dorms[0].id;

      let imageUrls = [] as string[];
      if (uploadFiles.length > 0) {
        try {
        
          imageUrls = await Promise.all(
            uploadFiles.map(async (file) => {
              try {
                const url = await uploadToCloudinary(file);
                console.log('Successfully uploaded image:', url);
                return url;
              } catch (error) {
                console.error('Error uploading specific file:', file.name, error);
                throw error;
              }
            })
          );
         
        } catch (error) {
          console.error('Error uploading images:', error);
          alert('Failed to upload images. Please try again.');
          return;
        }
      }

      await createRoom({
        dorm_id: dorm_id,
        room_number: roomFormData.room_number,
        capacity: roomFormData.capacity,
        rent_amount: roomFormData.rent_amount,
        images: imageUrls,
        created_at: roomFormData.created_at,
        updated_at: roomFormData.updated_at,
      });
      setIsCreateModalOpen(false);
      setUploadFiles([]);
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Rooms"
        description="Manage and view all rooms"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Room
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rooms..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Rent Amount</TableHead>
              <TableHead>Tenants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map(room => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>₱{room.rent_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {room.tenants && room.tenants.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="tenants" className="border-none">
                          <AccordionTrigger className="hover:no-underline py-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {room.tenants.length} {room.tenants.length === 1 ? 'Tenant' : 'Tenants'}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {room.tenants.map(tenant => (
                                <div key={tenant.id} className="bg-secondary rounded-lg p-3 text-sm space-y-2">
                                  <div className="font-medium">{tenant.full_name}</div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      <span>{tenant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>Moved in: {new Date(tenant.move_in_date).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <span className="text-muted-foreground text-sm">No tenants</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      room.tenants && room.tenants.length >= room.capacity 
                        ? 'bg-red-100 text-red-700'
                        : room.tenants && room.tenants.length > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {room.tenants && room.tenants.length >= room.capacity 
                        ? 'Full'
                        : room.tenants && room.tenants.length > 0
                        ? 'Partially Occupied'
                        : 'Available'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageTenants(room)}
                    >
                      <Users className="h-4 w-4 mr-1" /> Manage Tenants
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (room.tenants && room.tenants.length > 0) {
                          alert("Cannot delete room with tenants");
                          return;
                        }
                        setRoomToDelete(room);
                        setIsDeleteDialogOpen(true);
                        setDeleteConfirmInput('');
                      }}
                      disabled={room.tenants && room.tenants.length > 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setEditingRoom(null);
          setUploadFiles([]);
          setRoomFormData({
            dorm_id: '',
            room_number: '',
            capacity: 1,
            rent_amount: 0,
            images: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input 
              id="roomNumber"
              placeholder="Room Number"
              value={roomFormData.room_number}
              onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
            />
            <Label htmlFor="capacity">Capacity</Label>
            <Input 
              id="capacity"
              type="number"
              placeholder="Capacity"
              value={roomFormData.capacity}
              onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
            />
            <Label htmlFor="rentAmount">Rent Amount</Label>
            <Input 
              id="rentAmount"
              type="number"
              placeholder="Rent Amount"
              value={roomFormData.rent_amount}
              onChange={(e) => setRoomFormData({ ...roomFormData, rent_amount: parseFloat(e.target.value) })}
            />
            <Label htmlFor="images">Room Images</Label>
            <Input 
              id="images" 
              type="file" 
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setUploadFiles(files);
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={isEditModalOpen ? handleUpdateRoom : handleCreateRoom}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditModalOpen ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditModalOpen ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. To confirm deletion, please type the room number <strong>{roomToDelete?.room_number}</strong> below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              placeholder="Type room number to confirm"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRoomToDelete(null);
              setDeleteConfirmInput('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roomToDelete) {
                  handleDeleteRoom(roomToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setRoomToDelete(null);
                  setDeleteConfirmInput('');
                }
              }}
              disabled={deleteConfirmInput !== roomToDelete?.room_number}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isManageTenantsOpen} onOpenChange={(open) => {
        if (!open) {
          setIsManageTenantsOpen(false);
          setManagingRoom(null);
          setSelectedUserId('');
          setAvailableTenants([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tenants - Room {managingRoom?.room_number}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Current Tenants</h3>
              {managingRoom?.tenants && managingRoom.tenants.length > 0 ? (
                <div className="space-y-2">
                  {managingRoom.tenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <span>{tenant.full_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTenant(tenant.id)}
                        disabled={isAssigningTenant}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tenants assigned</p>
              )}
            </div>

            {(managingRoom?.tenants?.length || 0) < (managingRoom?.capacity || 0) && (
              <div>
                <h3 className="text-sm font-medium mb-2">Add Tenant</h3>
                <div className="flex space-x-2">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignTenant}
                    disabled={!selectedUserId || isAssigningTenant}
                  >
                    {isAssigningTenant ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </div>
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
