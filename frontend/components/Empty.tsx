import React from 'react';

const NoResults: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-black dark:text-white">
            <div className="flex flex-col items-center justify-center h-full p-4">
                <img src="/assets/empty.svg" alt="No results found" className="size-[400px]" />
                <p className="text-2xl text-center">No results found</p>
            </div>
        </div>
    );
};

export default NoResults;