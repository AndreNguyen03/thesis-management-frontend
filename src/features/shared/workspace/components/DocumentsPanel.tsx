import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, File, Trash2, Download, Eye, FolderOpen, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

const initialDocuments: Document[] = [
  { id: '1', name: 'Tài liệu Yêu cầu Dự án.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Nguyễn Văn A', uploadedAt: '2025-10-10' },
  { id: '2', name: 'Wireframe_Homepage.png', type: 'image', size: '1.8 MB', uploadedBy: 'Trần Thị B', uploadedAt: '2025-10-12' },
  { id: '3', name: 'API_Documentation.docx', type: 'doc', size: '520 KB', uploadedBy: 'Lê Văn C', uploadedAt: '2025-10-15' },
  { id: '4', name: 'Database_Schema.pdf', type: 'pdf', size: '890 KB', uploadedBy: 'Nguyễn Văn A', uploadedAt: '2025-10-18' },
];

const getFileIcon = (type: Document['type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-destructive" />;
    case 'doc':
      return <FileText className="w-5 h-5 text-info" />;
    case 'image':
      return <Image className="w-5 h-5 text-success" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

const getFileTypeLabel = (type: Document['type']) => {
  switch (type) {
    case 'pdf': return 'PDF';
    case 'doc': return 'DOC';
    case 'image': return 'Hình ảnh';
    default: return 'Khác';
  }
};

export const DocumentsPanel = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | Document['type']>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = selectedFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedFilter);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newDocs: Document[] = files.map(file => {
      let type: Document['type'] = 'other';
      if (file.type.includes('pdf')) type = 'pdf';
      else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) type = 'doc';
      else if (file.type.includes('image')) type = 'image';

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        size: formatFileSize(file.size),
        uploadedBy: 'Bạn',
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
    });

    setDocuments(prev => [...newDocs, ...prev]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const filters = [
    { key: 'all' as const, label: 'Tất cả', count: documents.length },
    { key: 'pdf' as const, label: 'PDF', count: documents.filter(d => d.type === 'pdf').length },
    { key: 'doc' as const, label: 'DOC', count: documents.filter(d => d.type === 'doc').length },
    { key: 'image' as const, label: 'Hình ảnh', count: documents.filter(d => d.type === 'image').length },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-work space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.xlsx,.pptx"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'p-4 rounded-full transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-secondary'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Kéo thả file vào đây hoặc{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                chọn file
              </button>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Hỗ trợ: PDF, DOC, DOCX, PNG, JPG, XLSX, PPTX (tối đa 20MB)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedFilter === filter.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            Tài liệu tham khảo
          </h4>
          <span className="text-sm text-muted-foreground">
            {filteredDocuments.length} tài liệu
          </span>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có tài liệu nào</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="p-3 rounded-lg bg-secondary shrink-0">
                  {getFileIcon(doc.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.uploadedBy}</span>
                    <span>•</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
