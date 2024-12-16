import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Tags({tags}: {tags: string[]}) {
    return (
        <div className="flex gap-3 overflow-x-auto whitespace-nowrap no-scroll pb-6">
        {tags?.map((tag, index) => (
          <Link key={tag} href={`/search?q=${tag}`} >
            <Button
              variant="outline"
              className="px-4 min-h-[45px] rounded-sm hover:opacity-80 transition-opacity"
            >
              {tag}
            </Button>
          </Link>
        ))}
      </div>
    )
    
}