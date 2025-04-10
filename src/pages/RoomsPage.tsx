
import React, { useState } from 'react';
import { Plus, Search, BedDouble } from 'lucide-react';
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
import { rooms, tenants } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const RoomsPage = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.number.includes(searchTerm) ||
      room.floor.includes(searchTerm) ||
      room.status.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <DashboardLayout>
      <PageHeader 
        title="Rooms" 
        description="Manage and view all rooms"
        actions={
          isAdmin() && (
            <Button>
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
            {filteredRooms.length > 0 ? (
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
                    <TableCell>${room.price}/month</TableCell>
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
                          <Button variant="ghost" size="sm">Edit</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No rooms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};
