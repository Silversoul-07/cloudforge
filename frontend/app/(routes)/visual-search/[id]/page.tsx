import React from 'react';
import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { fetchMedias } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
    title: 'Visual Search',
    description: 'A gallery of images',
};

export default async function VisualSearchPage({ params, searchParams }: Props) {
  const { id } = (await params);

  const medias = await fetchMedias();

  if (!medias) {
    notFound();
  }

  // Make it pass search image and add feat to display at the top
  return (
        <Gallery media={medias}/>
  );
}