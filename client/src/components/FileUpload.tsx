import { useState } from "react";
import { FileSpreadsheet, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  dealId: number;
  fileType: 't12' | 'rentRoll';
  title: string;
  description: string;
  onUploadComplete?: (extractedData: any) => void;
}

export default function FileUpload({ dealId, fileType, title, description, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await fetch(`/api/deals/${dealId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const result = await response.json();

      if (result.success) {
        setUploaded(true);
        toast({
          title: "File uploaded successfully",
          description: `${title} processed and data extracted.`,
        });
        
        if (onUploadComplete) {
          onUploadComplete(result.extractedData);
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const IconComponent = fileType === 't12' ? FileSpreadsheet : FileText;
  const bgColor = fileType === 't12' ? "bg-primary/10" : "bg-secondary/10";
  const iconColor = fileType === 't12' ? "text-primary" : "text-secondary";
  const buttonColor = fileType === 't12' ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90";

  return (
    <div className={`border-2 border-dashed ${uploaded ? 'border-secondary' : 'border-neutral-300'} rounded-lg p-8 text-center hover:border-primary transition-colors`}>
      <div className={`w-12 h-12 mx-auto ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
        {uploaded ? (
          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        ) : (
          <IconComponent className={`${iconColor} text-xl`} />
        )}
      </div>
      
      <h4 className="text-sm font-medium text-neutral-900 mb-2">{title}</h4>
      <p className="text-xs text-neutral-600 mb-4">{description}</p>
      
      {uploaded ? (
        <div className="text-sm text-secondary font-medium">✓ File uploaded and processed</div>
      ) : (
        <>
          <Button 
            className={`${buttonColor} text-white text-sm`}
            onClick={() => document.getElementById(`file-input-${fileType}`)?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Choose File"
            )}
          </Button>
          
          <input 
            id={`file-input-${fileType}`}
            type="file" 
            className="hidden" 
            accept=".pdf,.xlsx,.xls" 
            onChange={handleFileUpload}
          />
        </>
      )}
    </div>
  );
}
