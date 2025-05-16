import { useRef, useState, useEffect } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Heading, Heading1, Heading2, Heading3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorId: string;
}

export default function RichTextEditor({ value, onChange, editorId }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editedContent, setEditedContent] = useState(value || '');
  
  // Inicijalizacija editora
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);
  
  // Ažuriranje sadržaja kada se promijeni vanjski value
  useEffect(() => {
    if (editorRef.current && value !== editedContent) {
      editorRef.current.innerHTML = value || '';
      setEditedContent(value || '');
    }
  }, [value]);
  
  // Funkcije za formatiranje teksta
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditedContent(editorRef.current.innerHTML);
      onChange(editorRef.current.innerHTML);
    }
  };
  
  const handleContentChange = () => {
    if (editorRef.current) {
      setEditedContent(editorRef.current.innerHTML);
      onChange(editorRef.current.innerHTML);
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-secondary p-2 border-b flex flex-wrap items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('bold')}
          type="button"
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('italic')}
          type="button"
        >
          <Italic size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('underline')}
          type="button"
        >
          <Underline size={16} />
        </Button>
        
        <div className="w-px h-6 mx-1 bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('formatBlock', '<h1>')}
          type="button"
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('formatBlock', '<h2>')}
          type="button"
        >
          <Heading2 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('formatBlock', '<h3>')}
          type="button"
        >
          <Heading3 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('formatBlock', '<p>')}
          type="button"
        >
          <Heading size={16} />
        </Button>
        
        <div className="w-px h-6 mx-1 bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('justifyLeft')}
          type="button"
        >
          <AlignLeft size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('justifyCenter')}
          type="button"
        >
          <AlignCenter size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('justifyRight')}
          type="button"
        >
          <AlignRight size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('justifyFull')}
          type="button"
        >
          <AlignJustify size={16} />
        </Button>
        
        <div className="w-px h-6 mx-1 bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('insertUnorderedList')}
          type="button"
        >
          <List size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 flex items-center" 
          onClick={() => formatText('insertOrderedList')}
          type="button"
        >
          <ListOrdered size={16} />
        </Button>
      </div>
      
      {/* Editor područje */}
      <div
        id={editorId}
        ref={editorRef}
        contentEditable={true}
        className="min-h-[400px] p-4 focus:outline-none"
        onInput={handleContentChange}
        onBlur={handleContentChange}
      />
    </div>
  );
}