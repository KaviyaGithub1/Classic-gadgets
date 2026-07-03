import { Request, Response } from 'express';
import { prisma } from '../../config/db';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    
    // Set default period
    const validPeriods = ['day', 'week', 'month', 'year'];
    const selectedPeriod = validPeriods.includes(period as string) ? (period as string) : 'week';

    // Calculate start date based on period
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'day':
        startDate.setHours(0, 0, 0, 0); // Start of today
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // 1. Total Metrics (All time)
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const allOrders = await prisma.order.findMany({ select: { totalPrice: true } });
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 2. Period Metrics
    const periodUsers = await prisma.user.count({
      where: { role: 'USER', createdAt: { gte: startDate } }
    });
    const periodProducts = await prisma.product.count({
      where: { createdAt: { gte: startDate } }
    });
    const periodOrdersQuery = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { totalPrice: true, createdAt: true, status: true }
    });
    
    const periodOrders = periodOrdersQuery.length;
    const periodRevenue = periodOrdersQuery.reduce((sum, order) => sum + order.totalPrice, 0);

    // 3. Time Series Data (Grouping by date blocks)
    // To keep it database-agnostic in Prisma and avoid complex raw SQL, we'll group it in memory.
    // For large scale, you'd use raw SQL `DATE_TRUNC`. For this, memory grouping is fine.
    
    const groupedData: Record<string, { revenue: number; orders: number }> = {};
    
    // Initialize buckets based on period
    if (selectedPeriod === 'day') {
      // Group by hour
      for (let i = 0; i < 24; i++) {
        const hourStr = `${i.toString().padStart(2, '0')}:00`;
        groupedData[hourStr] = { revenue: 0, orders: 0 };
      }
    } else if (selectedPeriod === 'week' || selectedPeriod === 'month') {
      // Group by day (e.g., "Mon", "Tue" or "MM-DD")
      const days = selectedPeriod === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        groupedData[dateStr] = { revenue: 0, orders: 0 };
      }
    } else if (selectedPeriod === 'year') {
      // Group by month
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const monthStr = d.toLocaleString('default', { month: 'short' });
        groupedData[monthStr] = { revenue: 0, orders: 0 };
      }
    }

    // Populate buckets
    periodOrdersQuery.forEach(order => {
      let bucketKey = '';
      const orderDate = order.createdAt;

      if (selectedPeriod === 'day') {
        bucketKey = `${orderDate.getHours().toString().padStart(2, '0')}:00`;
      } else if (selectedPeriod === 'week' || selectedPeriod === 'month') {
        bucketKey = `${orderDate.getMonth() + 1}/${orderDate.getDate()}`;
      } else if (selectedPeriod === 'year') {
        bucketKey = orderDate.toLocaleString('default', { month: 'short' });
      }

      if (groupedData[bucketKey]) {
        groupedData[bucketKey].revenue += order.totalPrice;
        groupedData[bucketKey].orders += 1;
      }
    });

    // Convert to array for Recharts
    const chartData = Object.keys(groupedData).map(key => ({
      name: key,
      revenue: groupedData[key].revenue,
      orders: groupedData[key].orders
    }));

    res.status(200).json({
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        periodUsers,
        periodProducts,
        periodOrders,
        periodRevenue
      },
      chartData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
