"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Quiz & Prize Wheel",
    siteDescription: "Complete the quiz to spin the prize wheel!",
    enableWhatsApp: true,
    enableEmailNotifications: false,
  })

  const [accountSettings, setAccountSettings] = useState({
    name: "Admin User",
    email: "admin@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGeneralChange = (field: string, value: any) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleAccountChange = (field: string, value: string) => {
    setAccountSettings((prev) => ({ ...prev, [field]: value }))
  }

  const saveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  const saveAccountSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setAccountSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Preview Mode</AlertTitle>
        <AlertDescription className="text-blue-600">
          This is running in preview mode. Settings changes are not saved in preview mode.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your application settings</CardDescription>
            </CardHeader>
            <form onSubmit={saveGeneralSettings}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => handleGeneralChange("siteName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleGeneralChange("siteDescription", e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableWhatsApp"
                    checked={generalSettings.enableWhatsApp}
                    onCheckedChange={(checked) => handleGeneralChange("enableWhatsApp", checked)}
                  />
                  <Label htmlFor="enableWhatsApp">Enable WhatsApp Integration</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    checked={generalSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleGeneralChange("enableEmailNotifications", checked)}
                  />
                  <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <form onSubmit={saveAccountSettings}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={accountSettings.name}
                    onChange={(e) => handleAccountChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => handleAccountChange("email", e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={accountSettings.currentPassword}
                        onChange={(e) => handleAccountChange("currentPassword", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={(e) => handleAccountChange("newPassword", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={(e) => handleAccountChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
