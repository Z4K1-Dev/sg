'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/dashboard-layout';
import { 
  PostList, 
  PostForm, 
  PostDetail, 
  PostSearch,
  PostActions,
  PostStatusManager,
  CategoryManager,
  TagManager,
  Post
} from '@/components/posts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  FileText, 
  Folder, 
  Tag, 
  Settings, 
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data - in real app, this would come from tRPC
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-nextjs-15',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    excerpt: 'Learn how to build modern web applications with Next.js 15 and App Router.',
    type: 'POST',
    status: 'PUBLISHED',
    metaTitle: 'Getting Started with Next.js 15 - Complete Guide',
    metaDescription: 'A comprehensive guide to building web applications with Next.js 15',
    featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    authorId: '1',
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    author: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    },
    category: {
      id: '1',
      name: 'Technology',
      slug: 'technology',
    },
    tags: [
      {
        id: '1',
        tag: {
          id: '1',
          name: 'Next.js',
          slug: 'nextjs',
        },
      },
      {
        id: '2',
        tag: {
          id: '2',
          name: 'React',
          slug: 'react',
        },
      },
    ],
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    slug: 'advanced-typescript-patterns',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    excerpt: 'Explore advanced TypeScript patterns and best practices for large-scale applications.',
    type: 'POST',
    status: 'DRAFT',
    authorId: '2',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-14'),
    author: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    },
    category: {
      id: '1',
      name: 'Technology',
      slug: 'technology',
    },
    tags: [
      {
        id: '3',
        tag: {
          id: '3',
          name: 'TypeScript',
          slug: 'typescript',
        },
      },
    ],
  },
];

const mockCategories = [
  { id: '1', name: 'Technology', slug: 'technology', type: 'POST' as const },
  { id: '2', name: 'Design', slug: 'design', type: 'POST' as const },
  { id: '3', name: 'Business', slug: 'business', type: 'POST' as const },
];

const mockTags = [
  { id: '1', name: 'Next.js', slug: 'nextjs' },
  { id: '2', name: 'React', slug: 'react' },
  { id: '3', name: 'TypeScript', slug: 'typescript' },
  { id: '4', name: 'JavaScript', slug: 'javascript' },
];

const mockAuthors = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

type ViewMode = 'list' | 'create' | 'detail' | 'categories' | 'tags' | 'status';

export default function PostsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate data fetching
  const fetchPosts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  // Post operations
  const handlePostCreate = async (data: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPost: Post = {
        id: Date.now().toString(),
        ...data,
        author: mockAuthors[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
      setPosts([newPost, ...posts]);
      setViewMode('list');
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = async (data: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(posts.map(post => 
        post.id === selectedPost?.id 
          ? { ...post, ...data, updatedAt: new Date() }
          : post
      ));
      setViewMode('list');
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = async (postId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostStatusChange = async (postId: string, status: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
            publishedAt: status === 'PUBLISHED' ? new Date() : post.publishedAt,
            updatedAt: new Date()
          } as Post;
        }
        return post;
      }));
      toast({
        title: "Success",
        description: `Post status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change post status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string, postIds: string[], options?: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let updatedPosts = [...posts];
      
      switch (action) {
        case 'delete':
          updatedPosts = posts.filter(post => !postIds.includes(post.id));
          break;
        case 'publish':
          updatedPosts = posts.map(post => 
            postIds.includes(post.id) 
              ? { ...post, status: 'PUBLISHED' as const, publishedAt: new Date(), updatedAt: new Date() }
              : post
          );
          break;
        case 'unpublish':
          updatedPosts = posts.map(post => 
            postIds.includes(post.id) 
              ? { ...post, status: 'DRAFT' as const, updatedAt: new Date() }
              : post
          );
          break;
        case 'archive':
          updatedPosts = posts.map(post => 
            postIds.includes(post.id) 
              ? { ...post, status: 'ARCHIVED' as const, updatedAt: new Date() }
              : post
          );
          break;
        case 'changeCategory':
          updatedPosts = posts.map(post => 
            postIds.includes(post.id) && options?.categoryId
              ? { ...post, categoryId: options.categoryId, updatedAt: new Date() }
              : post
          );
          break;
      }
      
      setPosts(updatedPosts);
      setSelectedPosts([]);
      return { success: true, count: postIds.length };
    } catch (error) {
      return { success: false, count: 0, errors: ['Bulk action failed'] };
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (postIds: string[], format: 'json' | 'csv') => {
    try {
      const exportData = posts.filter(post => postIds.includes(post.id));
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `posts.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Success",
        description: `Exported ${postIds.length} posts as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export posts",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (_filters: any) => {
    fetchPosts();
  };

  const handlePostView = (post: Post) => {
    setSelectedPost(post);
    setViewMode('detail');
  };

  const handlePostEdit = (post: Post) => {
    setSelectedPost(post);
    setViewMode('create');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  // Render content based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedPost ? 'Edit Post' : 'Create New Post'}
                </h1>
                <p className="text-gray-600">
                  {selectedPost ? 'Edit existing post' : 'Create a new blog post'}
                </p>
              </div>
            </div>
            {selectedPost ? (
            <PostForm
              post={selectedPost}
              categories={mockCategories.map(cat => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))}
              tags={mockTags.map(tag => ({
                id: tag.id,
                tag: {
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              loading={loading}
              onSave={handlePostUpdate}
              onCancel={handleBack}
              mode="edit"
            />
          ) : (
            <PostForm
              categories={mockCategories.map(cat => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))}
              tags={mockTags.map(tag => ({
                id: tag.id,
                tag: {
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              loading={loading}
              onSave={handlePostCreate}
              onCancel={handleBack}
              mode="create"
            />
          )}
          </div>
        );

      case 'detail':
        return selectedPost ? (
          <PostDetail
            post={selectedPost}
            onEdit={handlePostEdit}
            onDelete={handlePostDelete}
            onBack={handleBack}
            loading={loading}
          />
        ) : null;

      case 'categories':
        return (
          <CategoryManager
            categories={mockCategories.map(cat => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))}
            loading={loading}
            onRefresh={() => fetchPosts()}
          />
        );

      case 'tags':
        return (
          <TagManager
            tags={mockTags.map(tag => ({ ...tag, createdAt: new Date(), updatedAt: new Date() }))}
            loading={loading}
            onRefresh={() => fetchPosts()}
          />
        );

      case 'status':
        return (
          <PostStatusManager
            posts={posts}
            onStatusChange={handlePostStatusChange}
            onBulkStatusChange={async (postIds: string[], newStatus: string) => {
              await handleBulkAction(newStatus === 'PUBLISHED' ? 'publish' : newStatus === 'DRAFT' ? 'unpublish' : 'archive', postIds);
            }}
            onRefresh={() => fetchPosts()}
            loading={loading}
          />
        );

      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Posts Management</h1>
                <p className="text-gray-600">Manage your blog posts</p>
              </div>
              <Button onClick={() => setViewMode('create')}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {posts.filter(p => p.status === 'PUBLISHED').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {posts.filter(p => p.status === 'DRAFT').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Archived</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {posts.filter(p => p.status === 'ARCHIVED').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <PostSearch
              categories={mockCategories}
              tags={mockTags}
              authors={mockAuthors}
              onSearch={handleSearch}
              loading={loading}
            />

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <PostActions
                selectedPosts={selectedPosts}
                posts={posts}
                categories={mockCategories}
                onBulkAction={handleBulkAction}
                onExport={(postIds: string[], format: 'json' | 'csv') => handleExport(postIds, format)}
                onClearSelection={() => setSelectedPosts([])}
                loading={loading}
              />
            )}

            {/* Posts List */}
            <PostList
              posts={posts}
              pagination={{
                page: 1,
                limit: 10,
                total: posts.length,
                pages: 1,
              }}
              categories={mockCategories.map(cat => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))}
              authors={mockAuthors}
              loading={loading}
              onRefresh={() => fetchPosts()}
              onSearch={handleSearch}
              onPostEdit={handlePostEdit}
              onPostDelete={handlePostDelete}
              onPostView={handlePostView}
              onPostStatusChange={handlePostStatusChange}
              onBulkAction={handleBulkAction}
              onExport={(format: 'json' | 'csv') => handleExport(selectedPosts, format)}
            />
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          {renderContent()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}