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
import { trpc } from '@/lib/trpc/client';


type ViewMode = 'list' | 'create' | 'detail' | 'categories' | 'tags' | 'status';

export default function PostsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<any>({});

  // tRPC queries
  const postsQuery = trpc.posts.getAll.useQuery(searchFilters);
  const categoriesQuery = trpc.categories.getAll.useQuery({ type: 'POST' });
  const tagsQuery = trpc.tags.getAll.useQuery({});
  
  // tRPC mutations
  const createPostMutation = trpc.posts.create.useMutation();
  const updatePostMutation = trpc.posts.update.useMutation();
  const deletePostMutation = trpc.posts.delete.useMutation();
  const bulkActionMutation = trpc.posts.bulk.useMutation();

  const posts = postsQuery.data?.posts || [];
  const pagination = postsQuery.data?.pagination;
  const categories = categoriesQuery.data || [];
  const tags = tagsQuery.data || [];
  const loading = postsQuery.isLoading || categoriesQuery.isLoading || tagsQuery.isLoading;

  const fetchPosts = () => {
    postsQuery.refetch();
  };

  // Post operations
  const handlePostCreate = async (data: any) => {
    try {
      await createPostMutation.mutateAsync(data);
      setViewMode('list');
      fetchPosts();
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
    }
  };

  const handlePostUpdate = async (data: any) => {
    if (!selectedPost) return;
    
    try {
      await updatePostMutation.mutateAsync({ id: selectedPost.id, ...data });
      setViewMode('list');
      fetchPosts();
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
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync({ id: postId });
      fetchPosts();
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
    }
  };

  const handlePostStatusChange = async (postId: string, status: string) => {
    try {
      await updatePostMutation.mutateAsync({
        id: postId,
        status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        title: '',
        content: ''
      });
      fetchPosts();
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
    }
  };

  const handleBulkAction = async (action: string, postIds: string[]) => {
    try {
      await bulkActionMutation.mutateAsync({ action: action as 'delete' | 'publish' | 'unpublish' | 'archive', postIds });
      setSelectedPosts([]);
      fetchPosts();
      return { success: true, count: postIds.length };
    } catch (error) {
      return { success: false, count: 0, errors: ['Bulk action failed'] };
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

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
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
              categories={categories.map(cat => ({
                ...cat,
                description: cat.description || '',
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              tags={tags.map(tag => ({
                id: tag.id,
                tag: {
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              loading={createPostMutation.isPending || updatePostMutation.isPending}
              onSave={handlePostUpdate}
              onCancel={handleBack}
              mode="edit"
            />
          ) : (
            <PostForm
              categories={categories.map(cat => ({
                ...cat,
                description: cat.description || '',
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              tags={tags.map(tag => ({
                id: tag.id,
                tag: {
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              loading={createPostMutation.isPending}
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
            categories={categories.map(cat => ({
              ...cat,
              description: cat.description || '',
              createdAt: new Date(),
              updatedAt: new Date()
            }))}
            loading={categoriesQuery.isLoading}
            onRefresh={() => categoriesQuery.refetch()}
          />
        );

      case 'tags':
        return (
          <TagManager
            tags={tags.map(tag => ({
              id: tag.id,
              name: tag.name,
              slug: tag.slug,
              createdAt: new Date(),
              updatedAt: new Date()
            }))}
            loading={tagsQuery.isLoading}
            onRefresh={() => tagsQuery.refetch()}
          />
        );

      case 'status':
        return (
          <PostStatusManager
            posts={posts.map(post => ({
              ...post,
              publishedAt: post.publishedAt || new Date(),
              categoryId: post.categoryId || '',
              content: post.content || ''
            }))}
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
              categories={categories}
              tags={tags}
              authors={[]} // TODO: Add authors query
              onSearch={handleSearch}
              loading={loading}
            />

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <PostActions
                selectedPosts={selectedPosts}
                posts={posts.map(post => ({
                  ...post,
                  publishedAt: post.publishedAt || new Date(),
                  categoryId: post.categoryId || '',
                  content: post.content || ''
                }))}
                categories={categories.map(cat => ({
                  ...cat,
                  description: cat.description || '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }))}
                onBulkAction={handleBulkAction}
                onExport={(postIds: string[], format: 'json' | 'csv') => handleExport(postIds, format)}
                onClearSelection={() => setSelectedPosts([])}
                loading={bulkActionMutation.isPending}
              />
            )}

            {/* Posts List */}
            <PostList
              posts={posts as any}
              pagination={pagination || {
                page: 1,
                limit: 10,
                total: 0,
                pages: 1,
              }}
              categories={categories.map(cat => ({
                ...cat,
                description: cat.description || '',
                createdAt: new Date(),
                updatedAt: new Date()
              }))}
              authors={[]} // TODO: Add authors query
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