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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertSettingSchema, type InsertSetting, type Setting } from "@shared/schema";
import { 
  Save,
  Clock,
  Store,
  Bell,
  Palette,
  Globe,
  Shield,
  Database
} from "lucide-react";
import { z } from "zod";

const settingsFormSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  restaurantDescription: z.string().optional(),
  openTime: z.string().min(1, "Opening time is required"),
  closeTime: z.string().min(1, "Closing time is required"),
  isOpen: z.boolean(),
  deliveryFee: z.string().regex(/^\d+\.?\d*$/, "Must be a valid number"),
  minimumOrder: z.string().regex(/^\d+\.?\d*$/, "Must be a valid number"),
  maxDeliveryRadius: z.string().regex(/^\d+\.?\d*$/, "Must be a valid number"),
  estimatedDeliveryTime: z.string().min(1, "Delivery time is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bannerMessage: z.string().optional(),
  enableNotifications: z.boolean(),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

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

  const { data: settings, isLoading: settingsLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    retry: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      restaurantName: "Durger King",
      restaurantDescription: "",
      openTime: "09:00",
      closeTime: "22:00",
      isOpen: true,
      deliveryFee: "2.99",
      minimumOrder: "15.00",
      maxDeliveryRadius: "10",
      estimatedDeliveryTime: "20-30 minutes",
      phoneNumber: "",
      address: "",
      bannerMessage: "",
      enableNotifications: true,
      currency: "USD",
      timezone: "America/New_York",
    },
  });

  // Load settings into form when data is available
  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      form.reset({
        restaurantName: settingsMap.restaurantName || "Durger King",
        restaurantDescription: settingsMap.restaurantDescription || "",
        openTime: settingsMap.openTime || "09:00",
        closeTime: settingsMap.closeTime || "22:00",
        isOpen: settingsMap.isOpen === "true",
        deliveryFee: settingsMap.deliveryFee || "2.99",
        minimumOrder: settingsMap.minimumOrder || "15.00",
        maxDeliveryRadius: settingsMap.maxDeliveryRadius || "10",
        estimatedDeliveryTime: settingsMap.estimatedDeliveryTime || "20-30 minutes",
        phoneNumber: settingsMap.phoneNumber || "",
        address: settingsMap.address || "",
        bannerMessage: settingsMap.bannerMessage || "",
        enableNotifications: settingsMap.enableNotifications === "true",
        currency: settingsMap.currency || "USD",
        timezone: settingsMap.timezone || "America/New_York",
      });
    }
  }, [settings, form]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const settingsToSave: InsertSetting[] = Object.entries(data).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value,
        type: typeof value === 'boolean' ? 'boolean' : 'string',
        description: getSettingDescription(key),
      }));

      // Save all settings
      const promises = settingsToSave.map(setting => 
        apiRequest("POST", "/api/settings", setting)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsSaving(false);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: (error) => {
      setIsSaving(false);
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
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      restaurantName: "The name of your restaurant",
      restaurantDescription: "A brief description of your restaurant",
      openTime: "Restaurant opening time",
      closeTime: "Restaurant closing time",
      isOpen: "Whether the restaurant is currently accepting orders",
      deliveryFee: "Default delivery fee in your currency",
      minimumOrder: "Minimum order amount for delivery",
      maxDeliveryRadius: "Maximum delivery radius in kilometers",
      estimatedDeliveryTime: "Estimated delivery time range",
      phoneNumber: "Restaurant contact phone number",
      address: "Restaurant address",
      bannerMessage: "Special message to display to customers",
      enableNotifications: "Enable order notifications",
      currency: "Currency used for pricing",
      timezone: "Restaurant timezone",
    };
    return descriptions[key] || "";
  };

  const handleSubmit = (data: SettingsFormData) => {
    setIsSaving(true);
    saveSettingsMutation.mutate(data);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeSection="settings" onSectionChange={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">Restaurant Settings</h2>
            <p className="text-muted-foreground">Configure your restaurant's operational settings</p>
          </div>

          {settingsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Restaurant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Restaurant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="restaurantName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restaurant Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Durger King" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="restaurantDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A brief description of your restaurant..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Main St, City, State 12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="openTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Time *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closeTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closing Time *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isOpen"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 pt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Currently Open</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Delivery Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Fee *</FormLabel>
                            <FormControl>
                              <Input placeholder="2.99" {...field} />
                            </FormControl>
                            <FormDescription>
                              Set to 0 for free delivery
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minimumOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Order Amount *</FormLabel>
                            <FormControl>
                              <Input placeholder="15.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxDeliveryRadius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Delivery Radius (km) *</FormLabel>
                            <FormControl>
                              <Input placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedDeliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Delivery Time *</FormLabel>
                            <FormControl>
                              <Input placeholder="20-30 minutes" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Display Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Display Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bannerMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banner Message</FormLabel>
                          <FormControl>
                            <Input placeholder="🎉 Grand Opening! Free delivery on orders over $25" {...field} />
                          </FormControl>
                          <FormDescription>
                            Special message to display to customers (leave empty to hide)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="CAD">CAD (C$)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="Europe/London">GMT</SelectItem>
                                <SelectItem value="Europe/Paris">CET</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="enableNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="!mt-0">Enable Order Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications when new orders are placed
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary-dark px-8"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </main>
      </div>
    </div>
  );
}
