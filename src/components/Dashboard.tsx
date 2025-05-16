"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Bell, Calendar, Cog, FileText, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';

export const Dashboard = () => {
  const { user } = useAuth();

  // Dummy data for dashboard metrics
  const metrics = [
    {
      title: 'Total Users',
      value: '5,231',
      change: '+12%',
      positive: true,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Active Now',
      value: '752',
      change: '+18%',
      positive: true,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      title: 'Revenue',
      value: '$24,500',
      change: '+5.2%',
      positive: true,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: 'New Documents',
      value: '342',
      change: '-3%',
      positive: false,
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  // Dummy data for recent activity
  const recentActivity = [
    {
      title: 'Profile Updated',
      description: 'Your profile information was updated',
      time: '2 hours ago',
    },
    {
      title: 'Password Changed',
      description: 'Your account password was changed',
      time: '1 day ago',
    },
    {
      title: 'New Login',
      description: 'New login from Chrome on Windows',
      time: '3 days ago',
    },
  ];

  // Dummy data for upcoming events
  const upcomingEvents = [
    {
      title: 'Team Meeting',
      date: 'Today, 3:00 PM',
    },
    {
      title: 'Project Deadline',
      date: 'Tomorrow, 11:59 PM',
    },
    {
      title: 'Quarterly Review',
      date: 'Dec 15, 10:00 AM',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-9">
              <Cog className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="bg-primary/10 p-1 rounded-full">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs flex items-center mt-1">
                <Badge variant={metric.positive ? "default" : "destructive"} className="text-xs font-medium">
                  {metric.change}
                </Badge>
                <span className="text-muted-foreground ml-2">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity and Events Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest account activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 