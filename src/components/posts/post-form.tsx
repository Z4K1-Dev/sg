'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Save,
  Eye,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Post, PostCategory, PostTag } from './post-card';
import CKEditorComponent from './ckeditor-editor';

// Form schema
const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  type: z.enum(['POST', 'PAGE']).default('POST'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface PostFormProps {
  post?: Post;
  categories?: PostCategory[];
  tags?: PostTag[];
  loading?: boolean;
  onSave?: (data: PostFormData) => Promise<void>;
  onSaveDraft?: (data: PostFormData) => Promise<void>;
  onPreview?: (data: PostFormData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}


export function PostForm({
  post,
  categories = [],
  tags = [],
  onSave,
  onSaveDraft,
  onPreview,
  onCancel,
  mode = 'create',
}: PostFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags.map(pt => pt.tag.id) || []);
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema) as any,
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      categoryId: post?.category?.id || '',
      status: post?.status || 'DRAFT',
      type: post?.type || 'POST',
      metaTitle: post?.metaTitle || '',
      metaDescription: post?.metaDescription || '',
      featuredImage: post?.featuredImage || '',
      tagIds: post?.tags.map(pt => pt.tag.id) || [],
    },
  });

  const { watch, setValue } = form;
  const titleValue = watch('title');
  const contentValue = watch('content');

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateSlug && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [titleValue, autoGenerateSlug, setValue]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (titleValue && !form.getValues('metaTitle')) {
      setValue('metaTitle', titleValue);
    }
  }, [titleValue, setValue]);

  // Auto-generate meta description from content
  useEffect(() => {
    if (contentValue && !form.getValues('metaDescription')) {
      const description = contentValue.replace(/<[^>]*>/g, '').substring(0, 160);
      setValue('metaDescription', description);
    }
  }, [contentValue, setValue]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      const currentData = form.getValues();
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify({
        title: post?.title || '',
        slug: post?.slug || '',
        content: post?.content || '',
        excerpt: post?.excerpt || '',
        categoryId: post?.category?.id || '',
        status: post?.status || 'DRAFT',
        type: post?.type || 'POST',
        metaTitle: post?.metaTitle || '',
        metaDescription: post?.metaDescription || '',
        featuredImage: post?.featuredImage || '',
        tagIds: post?.tags.map(pt => pt.tag.id) || [],
      });

      if (hasChanges && !isSaving && !isAutoSaving) {
        setIsAutoSaving(true);
        try {
          const formData = {
            ...currentData,
            status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
            tagIds: selectedTags,
            featuredImage,
          };
          
          if (onSaveDraft) {
            await onSaveDraft(formData);
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [form, selectedTags, featuredImage, isSaving, isAutoSaving, onSaveDraft, post]);

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    setIsSaving(true);
    try {
      const formData = {
        ...form.getValues(),
        status,
        tagIds: selectedTags,
        featuredImage,
      };
      
      if (status === 'DRAFT' && onSaveDraft) {
        await onSaveDraft(formData);
      } else if (onSave) {
        await onSave(formData);
      }
      
      toast({
        title: "Success",
        description: `Post ${status === 'PUBLISHED' ? 'published' : 'saved'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const formData = {
      ...form.getValues(),
      tagIds: selectedTags,
      featuredImage,
    };
    onPreview?.(formData);
  };

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    toast({
      title: "Coming Soon",
      description: "Image upload will be available in the media management system",
    });
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Post' : 'Edit Post'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' ? 'Create a new blog post' : 'Edit existing blog post'}
          </p>
          {(lastSaved || isAutoSaving) && (
            <p className="text-sm text-gray-500 mt-1">
              {isAutoSaving ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Auto-saving...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Last saved: {lastSaved?.toLocaleTimeString()}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving || isAutoSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving || isAutoSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Title and Slug */}
              <Card>
                <CardHeader>
                  <CardTitle>Title & URL</CardTitle>
                  <CardDescription>
                    Set your post title and URL slug
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter post title..." 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>URL Slug</FormLabel>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={autoGenerateSlug}
                              onCheckedChange={setAutoGenerateSlug}
                            />
                            <span className="text-sm text-gray-600">Auto-generate</span>
                          </div>
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="url-slug" 
                            {...field}
                            disabled={autoGenerateSlug}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be part of the URL: /blog/{field.value}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Write your post content using the rich text editor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CKEditorComponent
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Start writing your post..."
                            height={400}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card>
                <CardHeader>
                  <CardTitle>Excerpt</CardTitle>
                  <CardDescription>
                    A short summary of your post (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write a brief excerpt..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed in post previews and social media
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                  <CardDescription>
                    Add a featured image to your post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredImage ? (
                    <div className="relative">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFeaturedImage('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        No featured image selected
                      </p>
                      <Button variant="outline" onClick={handleImageUpload}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Optimize your post for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="SEO title..." 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended: 50-60 characters. Current: {field.value?.length || 0}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO description..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended: 150-160 characters. Current: {field.value?.length || 0}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Post Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Settings</CardTitle>
                  <CardDescription>
                    Configure your post settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select post type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="POST">Blog Post</SelectItem>
                            <SelectItem value="PAGE">Page</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"} defaultValue={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Add tags to categorize your post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.tag.name}
                        </Badge>
                      ))}
                    </div>
                    {selectedTags.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Click on tags above to add them to your post
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}