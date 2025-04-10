import React, { useState } from 'react';
import { Plus, Search, BedDouble, Pencil, Trash2, Building2, CreditCard, Users } from 'lucide-react';
import { Room } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
import { rooms, tenants } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export const RoomsPage = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    number: '',
    floor: '',
    capacity: 1,
    price: 500,
    status: 'available' as 'available' | 'occupied',
    description: '',
    photo: '',
    amenities: [] as string[],
  });
  
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.number.includes(searchTerm) ||
      room.floor.includes(searchTerm) ||
      room.status.toLowerCase().includes(searchLower)
    );
  });

  const renderContent = () => {
    if (isMobile) {
      return (
        <div className="grid gap-4">
          {filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 text-muted-foreground">
                No rooms found
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => {
              const roomTenants = tenants.filter(tenant => tenant.roomId === room.id);
              return (
                <Card key={room.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-semibold">Room {room.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Floor {room.floor}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={room.status === 'available' 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                        <div className="flex items-center gap-2 mt-1">
                          <BedDouble className="h-4 w-4" />
                          <span>{roomTenants.length}/{room.capacity}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="h-4 w-4" />
                          <span>₱{room.price}/month</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Tenants</div>
                      <div className="mt-1">
                        {roomTenants.length > 0 ? (
                          <div className="space-y-1">
                            {roomTenants.map(tenant => (
                              <div key={tenant.id} className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <span>{tenant.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No tenants</span>
                        )}
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
                            setSelectedRoom(room);
                            setRoomFormData({
                              number: room.number,
                              floor: room.floor,
                              capacity: room.capacity,
                              price: room.price,
                              status: room.status,
                              description: room.description || '',
                              photo: room.photo || '',
                              amenities: room.amenities,
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
                            setSelectedRoom(room);
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
              <TableHead>Room Number</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Tenants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => {
                const roomTenants = tenants.filter(tenant => tenant.roomId === room.id);
                
                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.number}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={room.status === 'available' 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BedDouble className="h-4 w-4 mr-1 text-muted-foreground" />
                        {roomTenants.length}/{room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>₱{room.price}/month</TableCell>
                    <TableCell>
                      {roomTenants.length > 0 ? (
                        <div className="text-sm">
                          {roomTenants.map(tenant => (
                            <div key={tenant.id}>{tenant.name}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No tenants</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      {isAdmin() && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedRoom(room);
                              setRoomFormData({
                                number: room.number,
                                floor: room.floor,
                                capacity: room.capacity,
                                price: room.price,
                                status: room.status,
                                description: room.description || '',
                                photo: room.photo || '',
                                amenities: room.amenities,
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
                              setSelectedRoom(room);
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
        title="Rooms" 
        description="Manage and view all rooms"
        actions={
          isAdmin() && (
            <Button onClick={() => {
              setRoomFormData({
                number: '',
                floor: '',
                capacity: 1,
                price: 500,
                status: 'available',
                description: '',
                photo: '',
                amenities: [],
              });
              setIsCreateModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          )
        }
      />
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {renderContent()}

      {/* Create Room Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={roomFormData.number}
                onChange={(e) => setRoomFormData({ ...roomFormData, number: e.target.value })}
                placeholder="e.g. 101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={roomFormData.capacity}
                onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price per Month (₱)</Label>
              <Input
                id="price"
                type="number"
                value={roomFormData.price}
                onChange={(e) => setRoomFormData({ ...roomFormData, price: parseInt(e.target.value) })}
                min={0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={roomFormData.status} 
                onValueChange={(value: 'available' | 'occupied') => 
                  setRoomFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                placeholder="Enter room description..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setRoomFormData(prev => ({
                          ...prev,
                          photo: event.target.result as string
                        }));
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              {roomFormData.photo && (
                <div className="mt-2">
                  <img
                    src={roomFormData.photo}
                    alt="Room preview"
                    className="rounded-md max-h-40 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const newRoom: Room = {
                id: (rooms.length + 1).toString(),
                ...roomFormData,
                tenantIds: [],
                description: roomFormData.description || '',
                photo: roomFormData.photo || '',
              };
              rooms.push(newRoom);
              setIsCreateModalOpen(false);
            }}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Modify room details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={roomFormData.number}
                onChange={(e) => setRoomFormData({ ...roomFormData, number: e.target.value })}
                placeholder="e.g. 101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={roomFormData.capacity}
                onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price per Month (₱)</Label>
              <Input
                id="price"
                type="number"
                value={roomFormData.price}
                onChange={(e) => setRoomFormData({ ...roomFormData, price: parseInt(e.target.value) })}
                min={0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={roomFormData.status} 
                onValueChange={(value: 'available' | 'occupied') => 
                  setRoomFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                placeholder="Enter room description..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setRoomFormData(prev => ({
                          ...prev,
                          photo: event.target.result as string
                        }));
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              {roomFormData.photo && (
                <div className="mt-2">
                  <img
                    src={roomFormData.photo}
                    alt="Room preview"
                    className="rounded-md max-h-40 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedRoom) {
                const index = rooms.findIndex(r => r.id === selectedRoom.id);
                if (index !== -1) {
                  rooms[index] = {
                    ...rooms[index],
                    ...roomFormData,
                  };
                }
              }
              setIsEditModalOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room
              {selectedRoom && ` ${selectedRoom.number}`} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (selectedRoom) {
                const index = rooms.findIndex(r => r.id === selectedRoom.id);
                if (index !== -1) {
                  rooms.splice(index, 1);
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
