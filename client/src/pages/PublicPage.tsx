import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PAGE_BY_SLUG } from '../graphql/queries/pages';
import { useAuth } from '../hooks/useAuth';
import PageRenderer from '../components/PageRenderer';

interface PublicPageProps {
  slug?: string;
}

const PublicPage: React.FC<PublicPageProps> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const { user } = useAuth();
  
  const { data, loading, error } = useQuery(GET_PAGE_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });
  
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !data?.pageBySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or hasn't been published yet.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }
  
  const page = data.pageBySlug;
  
  return (
    <PageRenderer 
      blocks={page.blocks || []}
      title={page.title}
      pageId={page.id}
      isAdmin={user?.role === 'admin'}
    />
  );
};

export default PublicPage;