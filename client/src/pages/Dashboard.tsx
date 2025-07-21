import { BarChart, CheckCircle, Clock, Percent } from "lucide-react";
import { Link } from "wouter";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useRecentDeals } from "@/hooks/useAnalysis";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentDeals, isLoading: dealsLoading } = useRecentDeals();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Property Analysis Dashboard</h2>
          <p className="text-sm text-neutral-600">Underwrite multifamily deals in under 30 seconds</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/analyze">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <i className="fas fa-plus mr-2"></i>New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Deals Analyzed"
          value={stats?.dealsAnalyzed || 0}
          subtitle="+12% this month"
          icon={<BarChart className="text-primary" />}
          bgColor="bg-primary/10"
        />
        
        <StatsCard
          title="Passed Deals"
          value={stats?.passedDeals || 0}
          subtitle={`${stats?.dealsAnalyzed ? Math.round((stats.passedDeals / stats.dealsAnalyzed) * 100) : 0}% pass rate`}
          icon={<CheckCircle className="text-secondary" />}
          bgColor="bg-secondary/10"
        />
        
        <StatsCard
          title="Avg. CoC Return"
          value={stats?.avgCoCReturn ? `${stats.avgCoCReturn.toFixed(1)}%` : '0%'}
          subtitle="Above target"
          icon={<Percent className="text-yellow-600" />}
          bgColor="bg-yellow-100"
        />
        
        <StatsCard
          title="Processing Time"
          value={stats?.avgProcessingTime ? formatTime(stats.avgProcessingTime) : '0s'}
          subtitle="40% faster"
          icon={<Clock className="text-purple-600" />}
          bgColor="bg-purple-100"
        />
      </div>

      {/* Recent Deals Table */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Analyses</h3>
        </div>
        <div className="overflow-x-auto">
          {dealsLoading ? (
            <div className="p-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 mb-4" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cap Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">CoC Return</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentDeals && recentDeals.length > 0 ? (
                  recentDeals.map((deal) => (
                    <tr key={deal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{deal.property?.address}</p>
                          <p className="text-sm text-neutral-500">
                            {deal.property?.propertyType} • {deal.property?.totalUnits} Units
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {deal.capRate ? `${deal.capRate.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {deal.cashOnCashReturn ? `${deal.cashOnCashReturn.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={deal.status === 'pass' ? 'default' : deal.status === 'fail' ? 'destructive' : 'secondary'}
                          className={
                            deal.status === 'pass' ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' :
                            deal.status === 'fail' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                            'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }
                        >
                          {deal.status === 'pass' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {deal.status?.toUpperCase() || 'ANALYZING'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <Link href={`/results/${deal.id}`}>
                          <button className="text-primary hover:text-primary/80 mr-3">View</button>
                        </Link>
                        <button className="text-neutral-400 hover:text-neutral-600">Export</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      No deals analyzed yet. <Link href="/analyze" className="text-primary hover:underline">Start your first analysis</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
