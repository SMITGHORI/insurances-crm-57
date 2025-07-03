
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Gift, Download, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useOffers, useDeleteOffer, useExportOffers } from '@/hooks/useBroadcast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

const Offers = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // MongoDB-connected hooks
  const { data: offersResponse, isLoading, error } = useOffers({
    page,
    limit,
    search: searchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
  });

  const deleteOfferMutation = useDeleteOffer();
  const exportOffersMutation = useExportOffers();

  const offers = offersResponse?.data || [];
  const pagination = {
    currentPage: offersResponse?.currentPage || 1,
    totalPages: offersResponse?.totalPages || 1,
    total: offersResponse?.total || 0
  };

  const handleCreateOffer = () => {
    navigate('/offers/create');
  };

  const handleEditOffer = (offerId) => {
    navigate(`/offers/edit/${offerId}`);
  };

  const handleViewOffer = (offerId) => {
    navigate(`/offers/${offerId}`);
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      console.log('Deleting offer from MongoDB:', offerId);
      await deleteOfferMutation.mutateAsync(offerId);
    } catch (error) {
      console.error('Error deleting offer from MongoDB:', error);
    }
  };

  const handleExport = async () => {
    try {
      console.log('Exporting offers from MongoDB');
      await exportOffersMutation.mutateAsync({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
        search: searchTerm
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export offers data from database');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-blue-100 text-blue-800';
      case 'cashback': return 'bg-green-100 text-green-800';
      case 'bonus_points': return 'bg-purple-100 text-purple-800';
      case 'free_addon': return 'bg-orange-100 text-orange-800';
      case 'premium_waiver': return 'bg-red-100 text-red-800';
      case 'special_rate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDiscount = (offer) => {
    if (offer.discountPercentage) {
      return `${offer.discountPercentage}%`;
    } else if (offer.discountAmount) {
      return `₹${offer.discountAmount}`;
    }
    return 'Variable';
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Offers</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offers Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Real-time database operations • {pagination.total} total offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={exportOffersMutation.isLoading}
            className={isMobile ? "w-full" : ""}
          >
            <Download className="mr-2 h-4 w-4" /> 
            {exportOffersMutation.isLoading ? 'Exporting...' : 'Export'}
          </Button>
          
          <Button onClick={handleCreateOffer} className={isMobile ? "w-full" : ""}>
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="bonus_points">Bonus Points</SelectItem>
                <SelectItem value="free_addon">Free Add-on</SelectItem>
                <SelectItem value="premium_waiver">Premium Waiver</SelectItem>
                <SelectItem value="special_rate">Special Rate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        {offer.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(offer.type)}>
                        {offer.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatDiscount(offer)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {offer.applicableProducts?.slice(0, 2).map((product) => (
                          <Badge key={product} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                        {offer.applicableProducts?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{offer.applicableProducts.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.validUntil ? formatDate(offer.validUntil) : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {offer.maxUsageCount === -1 ? (
                          <span>Unlimited</span>
                        ) : (
                          <span>{offer.currentUsageCount || 0}/{offer.maxUsageCount}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                          <DropdownMenuItem onClick={() => handleViewOffer(offer._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOffer(offer._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this offer? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOffer(offer._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteOfferMutation.isLoading}
                                >
                                  {deleteOfferMutation.isLoading ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {offers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No offers match your current filters.'
                  : 'Create your first offer to start engaging clients with special deals.'
                }
              </p>
              <Button onClick={handleCreateOffer}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Offer
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * limit + 1} to {Math.min(pagination.currentPage * limit, pagination.total)} of {pagination.total} offers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Offers;
