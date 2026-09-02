import React from 'react';
import ClinicClosedNotice from '@/components/ClinicClosedNotice';

const BlogPostCTA = ({ className = '' }) => {
  return (
    <div className={className}>
      <ClinicClosedNotice variant="card" />
    </div>
  );
};

export default BlogPostCTA;
