'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import QuickInput from '@/components/QuickInput';
import IdeaCard from '@/components/IdeaCard';
import { Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { ideas as initialIdeas, Idea } from '@/lib/mockData';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const statusOptions = ['All', 'Raw', 'Researching', 'Ready', 'Active', 'Archived'];
  const categories = ['All', ...Array.from(new Set(ideas.map(idea => idea.category)))];

  const handleAddIdea = (title: string) => {
    const newIdea: Idea = {
      id: Date.now().toString(),
      title,
      description: 'Add description...',
      category: 'Business',
      status: 'raw',
      createdAt: new Date().toISOString(),
      tags: [],
    };
    setIdeas(prev => [newIdea, ...prev]);
  };

  // Filter ideas
  const filteredIdeas = ideas.filter(idea => {
    const statusMatch = statusFilter === 'All' || 
      idea.status.toLowerCase() === statusFilter.toLowerCase();
    const categoryMatch = categoryFilter === 'All' || 
      idea.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  // Group by status
  const groupedIdeas = statusOptions.slice(1).reduce((acc, status) => {
    acc[status.toLowerCase()] = filteredIdeas.filter(
      idea => idea.status === status.toLowerCase()
    );
    return acc;
  }, {} as Record<string, Idea[]>);

  // Statistics
  const totalIdeas = ideas.length;
  const activeIdeas = ideas.filter(i => i.status === 'active').length;
  const rawIdeas = ideas.filter(i => i.status === 'raw').length;
  const readyIdeas = ideas.filter(i => i.status === 'ready').length;

  return (
    <div className="flex-1">
      <Header 
        title="Ideas Vault" 
        subtitle="Capture, organize, and develop your ideas"
      />
      
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-4">
            <h3 className="text-sm text-muted">Total Ideas</h3>
            <p className="text-2xl font-semibold text-white">{totalIdeas}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Raw Ideas</h3>
            <p className="text-2xl font-semibold text-gray-400">{rawIdeas}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Ready to Pursue</h3>
            <p className="text-2xl font-semibold text-yellow-400">{readyIdeas}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Active Projects</h3>
            <p className="text-2xl font-semibold text-green-400">{activeIdeas}</p>
          </div>
        </div>

        {/* Quick Capture */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Capture</h2>
          <QuickInput
            placeholder="Capture a new idea..."
            onSubmit={handleAddIdea}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-8">
          <Filter className="h-5 w-5 text-muted" />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                Status: {status}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                Category: {category}
              </option>
            ))}
          </select>
        </div>

        {/* Ideas by Status */}
        <div className="space-y-8">
          {Object.entries(groupedIdeas).map(([status, statusIdeas]) => {
            if (statusIdeas.length === 0) return null;
            
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'raw': return 'text-gray-400';
                case 'researching': return 'text-blue-400';
                case 'ready': return 'text-yellow-400';
                case 'active': return 'text-green-400';
                case 'archived': return 'text-red-400';
                default: return 'text-gray-400';
              }
            };

            return (
              <div key={status}>
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className={clsx(
                    'text-lg font-semibold capitalize',
                    getStatusColor(status)
                  )}>
                    {status}
                  </h3>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                    {statusIdeas.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusIdeas.map(idea => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onClick={() => console.log('Open idea detail:', idea.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No ideas found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}