"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Bell,
  X,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add types for the transaction data
type TransactionStatus = 'completed' | 'pending' | 'failed';

type Transaction = {
  id: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  recipient: string | null;
  fee: number;
};

type TransactionData = {
  topups: Transaction[];
  transfers: Transaction[];
  withdrawals: Transaction[];
  deposits: Transaction[];
};

type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
  read: boolean;
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [balance, setBalance] = useState(1250.75);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<keyof TransactionData>('topups');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifPage, setNotifPage] = useState(1);
  const notificationsPerPage = 3;
  
  // Add custom animation class
  useEffect(() => {
    // Add the animation stylesheet
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-opacity {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .animate-pulse-opacity {
        animation: pulse-opacity 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get paginated notifications
  const paginatedNotifications = notifications.slice(
    (notifPage - 1) * notificationsPerPage, 
    notifPage * notificationsPerPage
  );
  
  // Calculate total notification pages
  const totalNotifPages = Math.ceil(notifications.length / notificationsPerPage);
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };
  
  // Get icon for notification type - using consistent sizing for better UI
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  // Position the dropdown correctly
  useEffect(() => {
    // This ensures dropdown position updates when opened
    if (isDropdownOpen && dropdownRef.current) {
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current.querySelector('[role="menu"]') as HTMLElement;
      
      if (dropdown) {
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
        
        // Center on mobile, right-aligned on desktop
        if (window.innerWidth < 640) {
          dropdown.style.left = '50%';
          dropdown.style.right = 'auto';
          dropdown.style.transform = 'translateX(-50%)';
          dropdown.style.maxWidth = 'calc(100vw - 32px)';
        } else {
          dropdown.style.left = 'auto';
          dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
          dropdown.style.transform = 'none';
        }
      }
    }
    
    // Reset notification page when opening dropdown
    if (isDropdownOpen) {
      setNotifPage(1);
    }
  }, [isDropdownOpen]);
  
  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Initialize mock data on client side only to prevent hydration errors
  useEffect(() => {
    // Set demo notifications
    setNotifications([
      {
        id: 'notif-1',
        type: 'success',
        message: 'Your top-up of $250 was successful',
        time: '5 minutes ago',
        read: false
      },
      {
        id: 'notif-2',
        type: 'info',
        message: 'Welcome to Mercy Money dashboard',
        time: '1 hour ago',
        read: false
      },
      {
        id: 'notif-3',
        type: 'warning',
        message: 'Your account verification is pending',
        time: '3 hours ago',
        read: false
      },
      {
        id: 'notif-4',
        type: 'error',
        message: 'Withdrawal request failed. Please try again',
        time: '1 day ago',
        read: true
      },
      {
        id: 'notif-5',
        type: 'success',
        message: 'Transfer of $100 to user123 completed',
        time: '2 days ago',
        read: true
      }
    ]);

    // Generate transaction data
    setTransactionData({
      topups: generateMockTransactions('topup', 24),
      transfers: generateMockTransactions('transfer', 18),
      withdrawals: generateMockTransactions('withdrawal', 12),
      deposits: generateMockTransactions('deposit', 16),
    });

    // Set last updated time
    setLastUpdated(new Date().toLocaleString());
  }, []);

  // Function to generate mock transactions for demo
  function generateMockTransactions(type: string, count: number): Transaction[] {
    const statuses: TransactionStatus[] = ['completed', 'pending', 'failed'];
    const transactions: Transaction[] = [];
    
    // Use a seed for random to make it deterministic per session
    const seed = type.charCodeAt(0) + count;
    
    for (let i = 1; i <= count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor((seed * i) % 30));
      
      transactions.push({
        id: `${type}-${i}`,
        amount: parseFloat(((seed * i * 10) % 500 + 50).toFixed(2)),
        status: statuses[Math.floor((seed * i) % 3)],
        date: date.toISOString(),
        recipient: type === 'transfer' ? `user${Math.floor((seed * i) % 999) + 1}` : null,
        fee: parseFloat(((seed * i) % 10).toFixed(2)),
      });
    }
    
    return transactions;
  }

  // Calculate pagination
  const itemsPerPage = 8;
  const getCurrentPageItems = () => {
    if (!transactionData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return transactionData[activeTab].slice(startIndex, startIndex + itemsPerPage);
  };
  
  const totalPages = transactionData ? Math.ceil(transactionData[activeTab].length / itemsPerPage) : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Status badge color class
  const getStatusClass = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Show loading state while data is being generated
  if (!transactionData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
          <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-[50]">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.welcomeMessage')}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          {/* Notifications System (New Implementation) */}
          <div className="relative" ref={dropdownRef}>
            {/* Notification Button */}
            <Button 
              variant="outline"
              size="sm"
              className={`relative transition-all duration-200 z-[60] ${isDropdownOpen ? 'bg-accent border-primary' : 'hover:bg-accent/50'}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <Bell className={`w-4 h-4 mr-2 ${isDropdownOpen ? 'text-primary' : ''} ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
              {t('dashboard.notifications')}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs font-bold px-1 border-2 border-background shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notification Dropdown - Fixed Position for better rendering */}
            {isDropdownOpen && (
                            <div 
                 className="fixed w-80 mx-auto mt-2 bg-background rounded-lg border shadow-xl overflow-hidden z-[9999]"
                 style={{
                   top: 'auto', // Using fixed with auto top to prevent scroll issues
                 }}
                 role="menu"
               >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between p-4 border-b bg-accent/50">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">{t('dashboard.notificationsTitle')}</h3>
                  </div>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs h-7 hover:bg-background hover:text-primary"
                    >
                      {t('dashboard.markAllRead')}
                    </Button>
                  )}
                </div>
                
                {/* Notification List */}
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                      {paginatedNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`
                            group p-4 transition-colors duration-200
                            ${!notification.read ? 'bg-accent/20' : 'bg-background'}
                            hover:bg-accent/30 cursor-pointer
                          `}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Notification Icon */}
                            <div className={`
                              flex-none mt-0.5 p-1.5 rounded-full
                              ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                              ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''}
                              ${notification.type === 'success' ? 'bg-green-100 text-green-600' : ''}
                              ${notification.type === 'error' ? 'bg-red-100 text-red-600' : ''}
                            `}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                            
                            {/* Delete Button - Only visible on hover */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              aria-label="Delete notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.noNotifications')}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {notifications.length > notificationsPerPage && (
                  <div className="p-3 border-t bg-accent/10">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        disabled={notifPage === 1}
                        onClick={() => setNotifPage(prev => Math.max(prev - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                      </Button>
                      
                      <span className="text-xs">
                        {notifPage} / {totalNotifPages}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        disabled={notifPage === totalNotifPages}
                        onClick={() => setNotifPage(prev => Math.min(prev + 1, totalNotifPages))}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Dropdown Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-muted/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs font-normal hover:bg-background"
                    >
                      {t('dashboard.viewAllNotifications')}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Backdrop/Overlay to close dropdown when clicking outside */}
            {isDropdownOpen && (
              <div 
                className="fixed inset-0 z-[9998] pointer-events-auto" 
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
                style={{ display: isDropdownOpen ? 'block' : 'none' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Balance Card with Gradient */}
      <Card className="mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg z-0"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl">{t('dashboard.balanceTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-bold mb-6 transition-all duration-500 hover:scale-105">
            {formatCurrency(balance)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Top Up Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  {t('dashboard.topUp')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.topUpTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.topUpDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('dashboard.amount')}
                    </label>
                    <Input type="number" placeholder="0.00" />
                    <p className="text-xs text-muted-foreground">{t('dashboard.fee')}</p>
                  </div>
                  
                  {/* Horizontally scrollable cryptocurrency options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('dashboard.supportedCoins')}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {[
                        { symbol: 'BTC', name: 'Bitcoin' },
                        { symbol: 'BCH', name: 'Bitcoin Cash' },
                        { symbol: 'BNB', name: 'BNB' },
                        { symbol: 'ETH', name: 'Ethereum' },
                        { symbol: 'LTC', name: 'Lite Coin' },
                        { symbol: 'POL', name: 'Polygon' },
                        { symbol: 'SOL', name: 'Solana' },
                        { symbol: 'tether', name: 'Tether' },
                        { symbol: 'TON', name: 'Ton Coin' },
                        { symbol: 'TRX', name: 'Tron' },
                        { symbol: 'USDC', name: 'USDC' },
                      ].map((crypto) => (
                        <div 
                          key={crypto.symbol} 
                          className="flex-shrink-0 border rounded-lg p-2 flex flex-col items-center justify-center cursor-default"
                        >
                          <div className="relative w-10 h-10 mb-1">
                            <div className="absolute inset-0 rounded-full animate-pulse-opacity">
                              <img 
                                src={`/crypto/${crypto.symbol}.png`} 
                                alt={crypto.name} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                          <span className="text-xs text-center">{crypto.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.estimatedTotal')}:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.fee')}:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('dashboard.confirmTopUp')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Transfer Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  {t('dashboard.transfer')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.transferTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.transferDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.recipient')}
                    </label>
                    <Input type="text" placeholder="username@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.amount')}
                    </label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.available')}:</span>
                      <span className="font-medium">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('dashboard.confirmTransfer')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Withdraw Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  {t('dashboard.withdraw')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.withdrawTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.withdrawDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.amount')}
                    </label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.fee')}:</span>
                      <span className="font-medium">$2.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.available')}:</span>
                      <span className="font-medium">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">{t('dashboard.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{t('dashboard.proceed')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Secondary Withdraw Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" disabled className="hidden">
                  {t('dashboard.withdrawConfirm')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.withdrawalInfo')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.withdrawalInfoDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.withdrawalId')}
                    </label>
                    <div className="flex">
                      <Input readOnly value="WD-20240601-123456789" className="flex-1" />
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.withdrawalKey')}
                    </label>
                    <div className="flex">
                      <Input readOnly value="WK-87654321-ABCDEFG" className="flex-1" />
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    {t('dashboard.withdrawalWarning')}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('dashboard.close')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Deposit Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  {t('dashboard.deposit')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.depositTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.depositDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.depositId')}
                    </label>
                    <Input type="text" placeholder="DP-XXXXXXXX-XXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {t('dashboard.depositKey')}
                    </label>
                    <Input type="text" placeholder="DK-XXXXXXXX-XXXXXX" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('dashboard.confirmDeposit')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="relative z-10">
          <p className="text-xs text-muted-foreground">
            {t('dashboard.lastUpdated')}: {lastUpdated}
          </p>
        </CardFooter>
      </Card>

      {/* Transaction History Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('dashboard.transactionHistory')}</h2>
        
        <Tabs 
          defaultValue="topups" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as keyof TransactionData);
            setCurrentPage(1);
          }}
        >
                      {/* Mobile dropdown selector for small screens */}
          <div className="block md:hidden mb-4">
            <div className="relative">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as keyof TransactionData)}
              >
                <option value="topups">{t('dashboard.topUps')}</option>
                <option value="transfers">{t('dashboard.transfers')}</option>
                <option value="withdrawals">{t('dashboard.withdrawals')}</option>
                <option value="deposits">{t('dashboard.deposits')}</option>
              </select>
              <ChevronRight className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 opacity-50 pointer-events-none" />
            </div>
          </div>
            
          {/* Regular tabs for larger screens */}
          <TabsList className="mb-4 hidden md:flex">
            <TabsTrigger value="topups">{t('dashboard.topUps')}</TabsTrigger>
            <TabsTrigger value="transfers">{t('dashboard.transfers')}</TabsTrigger>
            <TabsTrigger value="withdrawals">{t('dashboard.withdrawals')}</TabsTrigger>
            <TabsTrigger value="deposits">{t('dashboard.deposits')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {/* Transaction Items */}
            {getCurrentPageItems().length > 0 ? (
              <div className="space-y-4">
                {getCurrentPageItems().map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">{transaction.id}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusClass(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                        {transaction.recipient && (
                          <p className="text-sm">
                            {t('dashboard.recipient')}: {transaction.recipient}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.fee')}: {formatCurrency(transaction.fee)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>{t('dashboard.noTransactions')}</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.showing')} {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, transactionData[activeTab].length)} 
                  {t('dashboard.of')} {transactionData[activeTab].length}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}