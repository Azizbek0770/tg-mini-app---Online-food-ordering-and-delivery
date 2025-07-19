import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertStaffSchema, type InsertStaff, type Staff } from "@shared/schema";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  ChefHat,
  Truck,
  Crown,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

type StaffFormData = InsertStaff;

const roleIcons = {
  kitchen: ChefHat,
  delivery: Truck,
  manager: Crown,
};

const roleColors = {
  kitchen: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  manager: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export default function AdminStaff() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    retry: false,
  });

  const form = useForm<StaffFormData>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "kitchen",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const response = await apiRequest("POST", "/api/staff", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setIsFormOpen(false);
      setEditingStaff(null);
      form.reset();
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: StaffFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/staff/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setIsFormOpen(false);
      setEditingStaff(null);
      form.reset();
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member removed successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    form.reset({
      name: staffMember.name,
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      role: staffMember.role,
      isActive: staffMember.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (data: StaffFormData) => {
    if (editingStaff) {
      updateMutation.mutate({ ...data, id: editingStaff.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRoleBadge = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || ChefHat;
    const colorClass = roleColors[role as keyof typeof roleColors] || roleColors.kitchen;
    
    return (
      <Badge className={colorClass}>
        <Icon className="w-3 h-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const activeStaff = staff?.filter(s => s.isActive) || [];
  const kitchenStaff = activeStaff.filter(s => s.role === 'kitchen');
  const deliveryStaff = activeStaff.filter(s => s.role === 'delivery');
  const managers = activeStaff.filter(s => s.role === 'manager');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeSection="staff" onSectionChange={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Staff Management</h2>
              <p className="text-muted-foreground">Manage your kitchen and delivery team</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                    <p className="text-3xl font-bold text-foreground">
                      {staffLoading ? "..." : activeStaff.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kitchen</p>
                    <p className="text-3xl font-bold text-foreground">
                      {staffLoading ? "..." : kitchenStaff.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="text-3xl font-bold text-foreground">
                      {staffLoading ? "..." : deliveryStaff.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Managers</p>
                    <p className="text-3xl font-bold text-foreground">
                      {staffLoading ? "..." : managers.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Staff Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {staffLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Hire Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {staff?.length ? staff.map((staffMember) => (
                        <tr key={staffMember.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium mr-3">
                                {staffMember.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {staffMember.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {staffMember.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {staffMember.email && (
                                <div className="flex items-center text-sm text-foreground">
                                  <Mail className="w-3 h-3 mr-2 text-muted-foreground" />
                                  {staffMember.email}
                                </div>
                              )}
                              {staffMember.phone && (
                                <div className="flex items-center text-sm text-foreground">
                                  <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                                  {staffMember.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(staffMember.role)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                              {staffMember.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-foreground">
                              <Calendar className="w-3 h-3 mr-2 text-muted-foreground" />
                              {new Date(staffMember.hireDate || staffMember.createdAt || '').toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(staffMember)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(staffMember.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="text-4xl mb-4">👨‍🍳</div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No staff members found</h3>
                            <p className="text-muted-foreground mb-4">
                              Start by adding your first team member
                            </p>
                            <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary-dark">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Staff Member
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingStaff(null);
                        form.reset();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                                  <SelectItem value="delivery">Delivery</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 pt-6">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Active</FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsFormOpen(false);
                            setEditingStaff(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              {editingStaff ? "Updating..." : "Adding..."}
                            </>
                          ) : (
                            editingStaff ? "Update Staff" : "Add Staff"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
