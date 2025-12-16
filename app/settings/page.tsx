"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { authService } from "@/services/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { 
  User, 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor,
  Loader2
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout, checkAuth } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    email: ""
  })

  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        email: user.email || ""
      })
    } else {
      // If no user is loaded yet (and not loading), maybe redirect?
      // Protected route logic usually handles this, but safe to check.
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.updateProfile({
        name: profileData.name,
        bio: profileData.bio
      })
      await checkAuth() // Refresh local user data
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If not authenticated (and checked), showing nothing or redirecting is handled by layout/wrapper usually.
  // Assuming this page is protected.
  if (!user) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="flex flex-col space-y-1">
              <Button 
                variant={activeTab === "profile" ? "secondary" : "ghost"} 
                className="justify-start" 
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button 
                variant={activeTab === "appearance" ? "secondary" : "ghost"} 
                className="justify-start" 
                onClick={() => setActiveTab("appearance")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              <Button 
                variant={activeTab === "notifications" ? "secondary" : "ghost"} 
                className="justify-start" 
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button 
                variant={activeTab === "account" ? "secondary" : "ghost"} 
                className="justify-start" 
                onClick={() => setActiveTab("account")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Account
              </Button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your public profile display information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-xl bg-green-100 text-green-700">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="font-medium">Profile Picture</h4>
                        <p className="text-sm text-muted-foreground">
                          Your avatar is generated from your initials.
                        </p>
                      </div>
                    </div>

                    <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input 
                          id="name" 
                          value={profileData.name} 
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                          placeholder="Your name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={profileData.bio} 
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})} 
                          placeholder="Tell us a little about yourself" 
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                         <Label htmlFor="email">Email</Label>
                         <Input id="email" value={profileData.email} disabled className="bg-muted" />
                         <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" form="profile-form" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks on your device.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        <div 
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:bg-muted ${theme === 'light' ? 'border-primary' : 'border-transparent'}`}
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-6 w-6" />
                          <span className="text-sm font-medium">Light</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:bg-muted ${theme === 'dark' ? 'border-primary' : 'border-transparent'}`}
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-6 w-6" />
                          <span className="text-sm font-medium">Dark</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:bg-muted ${theme === 'system' ? 'border-primary' : 'border-transparent'}`}
                          onClick={() => setTheme('system')}
                        >
                          <Monitor className="h-6 w-6" />
                          <span className="text-sm font-medium">System</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage your notification preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about prompt updates.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive weekly digests and newsletters.
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Badge Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Show in-app alerts when you earn badges.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

               {/* Account Tab */}
               <TabsContent value="account" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Manage your account credentials and security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                       <div className="grid gap-2">
                         <Label>Password</Label>
                         <Button variant="outline" className="w-fit">Change Password</Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions for your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <p className="font-medium">Delete Account</p>
                         <p className="text-sm text-muted-foreground">
                           Permanently delete your account and all data.
                         </p>
                       </div>
                       <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
