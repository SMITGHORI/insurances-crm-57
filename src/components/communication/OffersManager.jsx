
import React, { useState } from 'react';
import { Gift, Plus, Edit, Trash2, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOffers } from '@/hooks/useCommunication';

const OffersManager = () => {
  const { data: offers, isLoading } = useOffers();

  const getOfferTypeColor = (type) => {
    const colors = {
      discount: 'bg-blue-100 text-blue-800',
      cashback: 'bg-green-100 text-green-800',
      bonus_points: 'bg-purple-100 text-purple-800',
      free_addon: 'bg-orange-100 text-orange-800',
      premium_waiver: 'bg-red-100 text-red-800',
      special_rate: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Offers Management</h3>
          <p className="text-sm text-gray-500">Create and manage special offers for clients</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers?.data?.map((offer) => (
          <Card key={offer._id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Gift className="h-5 w-5 text-orange-500 mr-2" />
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                </div>
                <Badge className={getOfferTypeColor(offer.type)}>
                  {offer.type.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {offer.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Offer Details */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-medium">
                    {offer.discountPercentage ? `${offer.discountPercentage}%` : 
                     offer.discountAmount ? `₹${offer.discountAmount}` : 'Variable'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valid Until:</span>
                  <span className="font-medium">{formatDate(offer.validUntil)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Usage:</span>
                  <span className="font-medium">
                    {offer.maxUsageCount === -1 ? 'Unlimited' : 
                     `${offer.currentUsageCount}/${offer.maxUsageCount}`}
                  </span>
                </div>

                {/* Products */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Applicable Products:</p>
                  <div className="flex flex-wrap gap-1">
                    {offer.applicableProducts.slice(0, 3).map((product) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                    {offer.applicableProducts.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{offer.applicableProducts.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {offers?.data?.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
          <p className="text-gray-500 mb-4">Create your first offer to start engaging clients with special deals.</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Offer
          </Button>
        </div>
      )}
    </div>
  );
};

export default OffersManager;
