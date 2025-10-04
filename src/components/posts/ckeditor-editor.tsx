'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link,
  Image,
  Table,
  Quote,
  Code,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CKEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number;
}

export function CKEditorComponent({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  disabled = false,
  height = 400
}: CKEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [value]);

  // Custom configuration for Word-like experience
  const editorConfiguration = {
    toolbar: {
      items: [
        'undo', 'redo', '|',
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'alignment', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'link', 'blockquote', 'imageUpload', 'insertTable', 'mediaEmbed', '|',
        'code', 'codeBlock', '|',
        'sourceEditing'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
      ]
    } as any,
    image: {
      toolbar: [
        'imageTextAlternative', 'imageStyle:full', 'imageStyle:side', 'linkImage'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells'
      ]
    },
    link: {
      defaultProtocol: 'https://',
      decorators: {
        addTargetToExternalLinks: {
          mode: 'manual' as const,
          label: 'Open in a new tab',
          defaultValue: true,
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }
    } as any,
    placeholder: placeholder,
    language: 'en',
    ui: {
      viewportOffset: {
        top: 50
      }
    }
  };

  const handleEditorReady = (editor: any) => {
    // Add custom styles for Word-like appearance
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .ck-editor__editable {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 11pt;
        line-height: 1.15;
        color: #2c3e50;
      }
      
      .ck-editor__editable h1 {
        font-size: 16pt;
        font-weight: bold;
        color: #2c3e50;
        margin: 24pt 0;
      }
      
      .ck-editor__editable h2 {
        font-size: 13pt;
        font-weight: bold;
        color: #2c3e50;
        margin: 18pt 0;
      }
      
      .ck-editor__editable h3 {
        font-size: 12pt;
        font-weight: bold;
        color: #2c3e50;
        margin: 14pt 0;
      }
      
      .ck-editor__editable p {
        margin: 0 0 10pt 0;
      }
      
      .ck-editor__editable blockquote {
        border-left: 4px solid #ccc;
        padding-left: 10pt;
        margin: 10pt 0;
        font-style: italic;
        color: #555;
      }
      
      .ck-editor__editable ul, .ck-editor__editable ol {
        margin: 10pt 0;
        padding-left: 20pt;
      }
      
      .ck-editor__editable li {
        margin: 2pt 0;
      }
      
      .ck-editor__editable code {
        background-color: #f5f5f5;
        padding: 2pt 4pt;
        border-radius: 3pt;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 10pt;
      }
      
      .ck-editor__editable pre {
        background-color: #f5f5f5;
        padding: 10pt;
        border-radius: 4pt;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 10pt;
        overflow-x: auto;
      }
      
      .ck-editor__editable table {
        border-collapse: collapse;
        margin: 10pt 0;
      }
      
      .ck-editor__editable th, .ck-editor__editable td {
        border: 1pt solid #ddd;
        padding: 6pt 8pt;
      }
      
      .ck-editor__editable th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      
      .ck.ck-editor__main {
        border: 1pt solid #ccc;
        border-radius: 4pt;
      }
      
      .ck-toolbar {
        border-bottom: 1pt solid #ccc;
        background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
      }
      
      .ck-toolbar__separator {
        background: #ccc;
        width: 1pt;
      }
      
      .ck-button {
        border-radius: 2pt;
        margin: 1pt;
      }
      
      .ck-button:hover {
        background-color: #e9ecef;
      }
      
      .ck-button.ck-on {
        background-color: #007bff;
        color: white;
      }
      
      /* Fullscreen styles */
      .ck-editor-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 9999 !important;
        background: white !important;
      }
      
      .ck-editor-fullscreen .ck-editor__main {
        height: calc(100vh - 60px) !important;
      }
      
      .ck-editor-fullscreen .ck-editor__editable {
        height: calc(100vh - 120px) !important;
        max-height: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Store reference to editor for fullscreen toggle
    (editor as any).fullscreenElement = styleElement;
  };

  const toggleFullscreen = () => {
    const editorElement = document.querySelector('.ck-editor');
    if (editorElement) {
      if (isFullscreen) {
        editorElement.classList.remove('ck-editor-fullscreen');
        document.body.style.overflow = '';
      } else {
        editorElement.classList.add('ck-editor-fullscreen');
        document.body.style.overflow = 'hidden';
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Document Preview</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11pt;
              line-height: 1.15;
              color: #2c3e50;
              max-width: 800px;
              margin: 0 auto;
              padding: 20pt;
            }
            h1 { font-size: 16pt; font-weight: bold; margin: 24pt 0; }
            h2 { font-size: 13pt; font-weight: bold; margin: 18pt 0; }
            h3 { font-size: 12pt; font-weight: bold; margin: 14pt 0; }
            p { margin: 0 0 10pt 0; }
            blockquote { 
              border-left: 4px solid #ccc; 
              padding-left: 10pt; 
              margin: 10pt 0; 
              font-style: italic; 
              color: #555; 
            }
            table { border-collapse: collapse; margin: 10pt 0; }
            th, td { border: 1pt solid #ddd; padding: 6pt 8pt; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          ${value}
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (!isClient) {
    return (
      <div className={`border rounded-lg`} style={{ height }}>
        <div className="border-b bg-gray-50 p-4 text-center">
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Custom toolbar for Word-like experience */}
      <div className="border-b bg-gray-50 p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Quick formatting buttons */}
          <div className="flex items-center border rounded bg-white mr-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment buttons */}
          <div className="flex items-center border rounded bg-white mr-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* List buttons */}
          <div className="flex items-center border rounded bg-white mr-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Indent buttons */}
          <div className="flex items-center border rounded bg-white mr-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Outdent className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Indent className="h-4 w-4" />
            </Button>
          </div>

          {/* Other tools */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Quote className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2">
          {/* Word count */}
          <div className="text-sm text-gray-600 mr-2">
            {wordCount} words, {charCount} characters
          </div>

          {/* Action buttons */}
          <Button variant="ghost" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* CKEditor Instance */}
      <div style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}>
        <CKEditorWrapper
          config={editorConfiguration}
          data={value}
          onReady={handleEditorReady}
          onChange={(_event: any, editor: any) => {
            const data = editor.getData();
            onChange(data);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Dynamic import wrapper for CKEditor
const CKEditorWrapper = dynamic(
  async () => {
    const { CKEditor } = await import('@ckeditor/ckeditor5-react');
    const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');
    
    return function CKEditorWrapperComponent({ config, data, onChange, disabled, onReady }: any) {
      return (
        <CKEditor
          editor={(ClassicEditor.default || ClassicEditor) as any}
          config={config}
          data={data}
          onChange={onChange}
          disabled={disabled}
          onReady={onReady}
        />
      );
    };
  },
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64">Loading editor...</div>
  }
);

export default CKEditorComponent;