import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, DollarSign, Building, Save, Mail, Phone } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "Real Estate Professional"
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    dealUpdates: true,
    marketReports: false,
    systemUpdates: true
  });

  // Analysis preferences
  const [preferences, setPreferences] = useState({
    defaultCurrency: "USD",
    minCashOnCash: 8.0,
    minCapRate: 5.5,
    minDSCR: 1.2,
    autoSaveAnalysis: true,
    processingTimeout: 30
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Preferences Updated",
        description: "Your analysis preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
        <p className="text-sm text-neutral-600">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Real Estate Company Inc."
                    className="pl-10"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <CardTitle>Analysis Preferences</CardTitle>
              </div>
              <CardDescription>
                Set default parameters for your property analyses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    value={preferences.defaultCurrency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Processing Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={preferences.processingTimeout}
                    onChange={(e) => setPreferences(prev => ({ ...prev, processingTimeout: parseInt(e.target.value) || 30 }))}
                    min="10"
                    max="300"
                  />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-900">Default Investment Criteria</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minCashOnCash">Min Cash-on-Cash Return (%)</Label>
                    <Input
                      id="minCashOnCash"
                      type="number"
                      step="0.1"
                      value={preferences.minCashOnCash}
                      onChange={(e) => setPreferences(prev => ({ ...prev, minCashOnCash: parseFloat(e.target.value) || 8.0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minCapRate">Min Cap Rate (%)</Label>
                    <Input
                      id="minCapRate"
                      type="number"
                      step="0.1"
                      value={preferences.minCapRate}
                      onChange={(e) => setPreferences(prev => ({ ...prev, minCapRate: parseFloat(e.target.value) || 5.5 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minDSCR">Min DSCR</Label>
                    <Input
                      id="minDSCR"
                      type="number"
                      step="0.1"
                      value={preferences.minDSCR}
                      onChange={(e) => setPreferences(prev => ({ ...prev, minDSCR: parseFloat(e.target.value) || 1.2 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">Auto-save Analysis</Label>
                    <p className="text-sm text-neutral-600">Automatically save analysis results to your dashboard</p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={preferences.autoSaveAnalysis}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSaveAnalysis: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSavePreferences} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-neutral-600">Receive email notifications</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deal Updates</Label>
                    <p className="text-sm text-neutral-600">Analysis completion alerts</p>
                  </div>
                  <Switch
                    checked={notifications.dealUpdates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dealUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Market Reports</Label>
                    <p className="text-sm text-neutral-600">Weekly market insights</p>
                  </div>
                  <Switch
                    checked={notifications.marketReports}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketReports: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-neutral-600">Platform announcements</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading} size="sm" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}