'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { 
  Users, Package, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

type Period = 'day' | 'week' | 'month' | 'year';

interface AnalyticsSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  periodUsers: number;
  periodProducts: number;
  periodOrders: number;
  periodRevenue: number;
}

interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSummary(response.data.summary);
      setChartData(response.data.chartData);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        // Simulation Fallback
        toast.success('(Simulation) Loaded Mock Analytics Data');
        loadMockData(period);
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = (currentPeriod: Period) => {
    setSummary({
      totalUsers: 1420,
      totalProducts: 450,
      totalOrders: 3200,
      totalRevenue: 245000,
      periodUsers: currentPeriod === 'year' ? 1200 : currentPeriod === 'month' ? 150 : currentPeriod === 'week' ? 45 : 12,
      periodProducts: 5,
      periodOrders: currentPeriod === 'year' ? 3000 : currentPeriod === 'month' ? 420 : currentPeriod === 'week' ? 85 : 15,
      periodRevenue: currentPeriod === 'year' ? 240000 : currentPeriod === 'month' ? 35000 : currentPeriod === 'week' ? 8500 : 1200,
    });

    // Generate mock chart data based on period
    const mockChart: ChartData[] = [];
    if (currentPeriod === 'day') {
      for (let i = 0; i < 24; i += 2) {
        mockChart.push({
          name: `${i.toString().padStart(2, '0')}:00`,
          revenue: Math.floor(Math.random() * 500),
          orders: Math.floor(Math.random() * 5)
        });
      }
    } else if (currentPeriod === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach(day => {
        mockChart.push({
          name: day,
          revenue: Math.floor(Math.random() * 2000) + 500,
          orders: Math.floor(Math.random() * 20) + 5
        });
      });
    } else if (currentPeriod === 'month') {
      for (let i = 1; i <= 30; i += 3) {
        mockChart.push({
          name: `Day ${i}`,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 50) + 10
        });
      }
    } else if (currentPeriod === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(month => {
        mockChart.push({
          name: month,
          revenue: Math.floor(Math.random() * 40000) + 10000,
          orders: Math.floor(Math.random() * 400) + 100
        });
      });
    }
    setChartData(mockChart);
  };

  const periodOptions: { label: string; value: Period }[] = [
    { label: 'Today', value: 'day' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Track your store's performance and growth.</p>
        </div>
        
        <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                period === opt.value 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !summary ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12.5%
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
                <p className="text-2xl font-bold text-white mt-1">${summary?.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">${summary?.periodRevenue.toLocaleString()} this {period}</p>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingCart className="w-16 h-16 text-blue-500" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex items-center text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8.2%
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium">Total Orders</h3>
                <p className="text-2xl font-bold text-white mt-1">{summary?.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{summary?.periodOrders.toLocaleString()} this {period}</p>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-indigo-500" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex items-center text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +5.4%
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
                <p className="text-2xl font-bold text-white mt-1">{summary?.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{summary?.periodUsers.toLocaleString()} new this {period}</p>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="w-16 h-16 text-purple-500" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                  0.0%
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium">Total Products</h3>
                <p className="text-2xl font-bold text-white mt-1">{summary?.totalProducts.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{summary?.periodProducts.toLocaleString()} added this {period}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Revenue Chart */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Revenue Trends
                  </h2>
                  <p className="text-sm text-slate-400">Gross revenue over the selected period.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No data available for this period.</div>
                )}
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Order Volume</h2>
                <p className="text-sm text-slate-400">Total orders processed.</p>
              </div>
              <div className="h-80 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                        itemStyle={{ color: '#3b82f6' }}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                      />
                      <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No data available.</div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
