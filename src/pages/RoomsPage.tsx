import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Room } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createRoom, getRooms, updateRoom, deleteRoom, getDormsForCurrentUser } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    dorm_id: '',
    room_number: '',
    capacity: 1,
    rent_amount: 0,
    images: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const fetchRooms = async () => {
    const fetchedRooms = await getRooms();
    setRooms(fetchedRooms);
  };

const handleCreateRoom = async () => {
  // Fetch the dorm where the current user is the owner
  const { data: dorms, error } = await getDormsForCurrentUser();
  if (error || !dorms || dorms.length === 0) {
    console.error('Failed to fetch dorm for the current user');
    return;
  }
  const dorm_id = dorms[0].id;

if (roomFormData.images.length > 0) {
  const uploadedImages = await Promise.all(
    roomFormData.images.map(async (file: File) => await uploadToCloudinary(file))
  );
  roomFormData.images = uploadedImages;
}

await createRoom({
  dorm_id: dorm_id,
  room_number: roomFormData.room_number,
  capacity: roomFormData.capacity,
  rent_amount: roomFormData.rent_amount,
  images: roomFormData.images,
  created_at: roomFormData.created_at,
  updated_at: roomFormData.updated_at,
});
    setIsCreateModalOpen(false);
    fetchRooms();
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
          <Input placeholder="Search rooms..." className="pl-9" />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Rent Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.room_number}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>₱{room.rent_amount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
<Label htmlFor="roomNumber">Room Number</Label>
<Input id="roomNumber"
              placeholder="Room Number"
              value={roomFormData.room_number}
              onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
            />
<Label htmlFor="capacity">Capacity</Label>
<Input id="capacity"
              type="number"
              placeholder="Capacity"
              value={roomFormData.capacity}
              onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
            />
<Label htmlFor="rentAmount">Rent Amount</Label>
<Input id="rentAmount"
              type="number"
              placeholder="Rent Amount"
              value={roomFormData.rent_amount}
              onChange={(e) => setRoomFormData({ ...roomFormData, rent_amount: parseFloat(e.target.value) })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
