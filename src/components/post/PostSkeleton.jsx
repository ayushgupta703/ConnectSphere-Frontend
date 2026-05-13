import React from 'react';
import Skeleton from '../ui/Skeleton';
import { motion } from 'framer-motion';

const PostSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-white/5 p-5 sm:p-7"
    >
      <div className="flex items-center space-x-3.5">
        <Skeleton className="h-12 w-12" variant="circle" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <Skeleton className="mt-4 w-full aspect-video rounded-3xl" />

      <div className="mt-5 flex items-center space-x-8">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </motion.div>
  );
};

export default PostSkeleton;
