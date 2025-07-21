import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search, Filter, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import { convertCurrency, formatCurrencyCompact } from "@/lib/currency";

interface Deal {
  id: number;
  property: {
    address: string;
    propertyType: string;
    totalUnits: number;
  };
  status: 'pass' | 'fail' | 'analyzing';
  purchasePrice: number;
  cashOnCashReturn: number;
  capRate: number;
  dscr: number;
  createdAt: string;
  processingTimeSeconds: number;
}

export default function PastDeals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showINR, setShowINR] = useState(false);

  const { data: deals, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Past Deals</h2>
            <p className="text-sm text-neutral-600">View and manage your previous property analyses</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !deals) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Past Deals</h2>
            <p className="text-sm text-neutral-600">View and manage your previous property analyses</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Deals</h3>
              <p className="text-neutral-600">There was an error loading your past deals.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.property.propertyType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'fail': return XCircle;
      default: return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Past Deals</h2>
          <p className="text-sm text-neutral-600">View and manage your previous property analyses</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowINR(!showINR)}
          >
            Show {showINR ? 'USD' : 'INR'}
          </Button>
          <Link href="/analyze">
            <Button>New Analysis</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search by address or property type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="pass">Passed</option>
                <option value="fail">Failed</option>
                <option value="analyzing">Analyzing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-neutral-600">
        Showing {filteredDeals.length} of {deals.length} deals
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Deals Found</h3>
                <p className="text-neutral-600">No deals match your current search and filter criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDeals.map((deal) => {
            const StatusIcon = getStatusIcon(deal.status);
            const converted = convertCurrency(deal.purchasePrice || 0);
            
            return (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">{deal.property.address}</h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {deal.property.propertyType} • {deal.property.totalUnits} units
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">Purchase Price</p>
                          <p className="font-semibold">
                            {showINR 
                              ? formatCurrencyCompact(converted.inr, 'INR')
                              : formatCurrencyCompact(converted.usd, 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">Cash-on-Cash Return</p>
                          <p className="font-semibold">{deal.cashOnCashReturn?.toFixed(2) || 0}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">Cap Rate</p>
                          <p className="font-semibold">{deal.capRate?.toFixed(2) || 0}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">DSCR</p>
                          <p className="font-semibold">{deal.dscr?.toFixed(2) || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(deal.status)}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {deal.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-neutral-600 mt-2">
                          Processed in {deal.processingTimeSeconds}s
                        </p>
                      </div>
                      <Link href={`/results/${deal.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}