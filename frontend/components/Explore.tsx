'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CollectionInfo } from '@/lib/types';
import { useClient } from '@/lib/helper';
import NoResults from './Empty';
import { useInView } from 'react-intersection-observer';

type ExploreProps = {
  initialExploreItems: CollectionInfo[];
  loadMore: (page: number) => Promise<CollectionInfo[]>;
};

const Explore: React.FC<ExploreProps> = ({ initialExploreItems, loadMore }) => {
  const [exploreItems, setExploreItems] = useState<CollectionInfo[]>(initialExploreItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !loading) {
      loadMoreItems();
    }
  }, [inView]);

  const loadMoreItems = async () => {
    setLoading(true);
    const newItems = await loadMore(page + 1);
    setExploreItems([...exploreItems, ...newItems]);
    setPage(page + 1);
    setLoading(false);
  };

  if (!exploreItems || exploreItems.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-center mb-8">Stay Inspired</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
        {exploreItems.map((item, index) => (
          <Card 
            key={index}
            className="rounded-none relative aspect-square group overflow-hidden"
          >
            <CardContent className="p-0 h-full">
              <Link href={`/c/${item.title}`} className="block h-full">
                <img 
                  src={useClient(item.thumbnail)} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                  <h3 className="text-white text-xl font-bold text-center">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm text-center">
                    by {item.user}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading more...</p>}
      <div ref={ref} className="h-10" />
    </div>
  );
};

export default Explore;

