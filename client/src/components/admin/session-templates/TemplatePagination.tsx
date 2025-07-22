import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface TemplatePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const TemplatePagination: React.FC<TemplatePaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of {totalCount} templates
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === page
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <Button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TemplatePagination; 