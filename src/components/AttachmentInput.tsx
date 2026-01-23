import { useState, useRef } from 'react';
import { Image, Video, Link as LinkIcon, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string;
  name?: string;
  description?: string;
  preview?: string;
}

interface AttachmentInputProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export function AttachmentInput({ attachments, onChange }: AttachmentInputProps) {
  const { t } = useLanguage();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newAttachments.push({
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        url,
        name: file.name,
        preview: url,
      });
    });

    onChange([...attachments, ...newAttachments]);
    e.target.value = '';
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const newAttachment: Attachment = {
      id: `link-${Date.now()}`,
      type: 'link',
      url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
      description: linkDescription || undefined,
    };

    onChange([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkDescription('');
    setLinkDialogOpen(false);
  };

  const handleRemove = (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{t('form.attachments')}</Label>
      <p className="hint">{t('form.attachments.hint')}</p>

      {/* Attachment buttons */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          className="gap-2"
        >
          <Image className="h-4 w-4" />
          {t('form.addPhoto')}
        </Button>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'video')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          {t('form.addVideo')}
        </Button>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              {t('form.addLink')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('form.addLink')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('form.linkUrl')}</Label>
                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('form.linkDescription')}</Label>
                <Input
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t('form.addLink')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group bg-secondary/50 rounded-lg overflow-hidden border"
            >
              {attachment.type === 'image' && attachment.preview && (
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className="w-20 h-20 object-cover"
                />
              )}
              {attachment.type === 'video' && (
                <div className="w-20 h-20 flex items-center justify-center bg-secondary">
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              {attachment.type === 'link' && (
                <div className="w-20 h-20 flex flex-col items-center justify-center bg-secondary p-2">
                  <LinkIcon className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {attachment.description || 'Link'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(attachment.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
