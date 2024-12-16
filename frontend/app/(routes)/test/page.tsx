'use client';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import imagesLoaded from 'imagesloaded';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

type Image = {
  id: number,
  url: string,
  title: string,
  description: string
}

const isNumeric = (value: any) => {
  return !isNaN(value);
}

const MasonryLayout = ({ items }) => {
  const [loaded, setLoaded] = useState(false);
  const masonryRef = useRef(null);

  useEffect(() => {
    if (masonryRef.current) {
      imagesLoaded(masonryRef.current, () => {
        setLoaded(true);
      });
    }
  }, [items]);

  return (
    <div ref={masonryRef} className={`masonry-layout ${loaded ? 'loaded' : ''}`}>
      <style jsx>{`
        .masonry-layout {
          column-count: 3;
          column-gap: 24px;
          opacity: 0;
          transition: opacity 0.9s;
        }
        
        .masonry-layout.loaded {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .masonry-layout {
            column-count: 2;
          }
        }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
        }
        
        .masonry-item img {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
      {items.map((item, index) => (
        <Card className="bg-transparent border-0 relative group rounded-none">
          <CardContent className="pb-6">
            <div className="overflow-hidden relative object-cover w-full h-full border border-grey-800 rounded-lg">
              <Link href={`/visual-search/` + item.id}>
                <img src={`/${item.url}`} alt={item.title} className="w-full h-auto" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const VisualSearch = ({id}:{id:any}) => {
  const [image, setImage] = useState<Image | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!isNumeric(id)) {
          setError('Invalid image ID');
          return;
        }
        const response = await axios.get(`/api/media/${id}`);
        setImage(response.data);
      } catch (error) {
        console.error('Failed to fetch image:', error);
        setError('Failed to fetch image');
      }
    }
    const fetchItems = async () => {
      try {
        const response = await axios.post('/api/visual-search', {}, { params: { id } });
        setItems(response.data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setError('Failed to fetch items');
      }
    };

    fetchImage();
    fetchItems();
  }, [id]);

  return (
<>
  <div className="flex items-center justify-between lg:my-5">
    <h1 className="text-[23px] font-bold text-white mx-auto">Similar images</h1>
  </div>

  <section className="flex flex-col lg:flex-row h-[600px] lg:mx-16 overflow-hidden">
    {image && (
      <div className="w-full lg:w-2/5 overflow-y-auto no-scroll">
        <div>
          <div className="rounded-lg overflow-hidden">
            <img id="Main-image" src={`/${image.url}`} alt={image.title} className="w-full h-auto object-cover border border-grey-800" />
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white mb-2">{image.title}</h1>
            <p className="text-gray-300">{image.desc}</p>
            <a href={image.metadata_.source} target="_blank" rel="noreferrer" className="text-blue-500 underline">View source</a>
          </div>
        </div>
      </div>
    )}
    <span className='mx-7'></span>
    <div className="w-full lg:w-3/5 overflow-y-auto no-scroll">
      <MasonryLayout items={items} />
    </div>
  </section>
</>
  );
};

