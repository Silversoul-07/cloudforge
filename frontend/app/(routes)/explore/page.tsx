import Explore from "@/components/Explore";
import { fetchAllCollections } from "@/lib/apihelp";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Explore',
    description: 'A expore page',
}

export default async function ExplorePage(){
    const initialExploreItems = await fetchAllCollections();
    
    return <Explore 
    initialExploreItems={initialExploreItems} 
    loadMore={fetchAllCollections} />
}