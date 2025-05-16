import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Upload, File, FileText, FileImage, FileSpreadsheet, FileArchive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CompanyDocument } from "@shared/schema";

export default function DocumentManager() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const { toast } = useToast();
  
  // Dohvati sve dokumente tvrtke
  const { data: documents, isLoading, error } = useQuery<CompanyDocument[]>({
    queryKey: ["/api/company-documents"],
  });
  
  // Mutacija za upload dokumenta
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Datoteka nije odabrana");
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }
      
      const response = await fetch('/api/company-documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Greška prilikom uploada dokumenta");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-documents"] });
      setUploadDialogOpen(false);
      resetForm();
      toast({
        title: "Dokument uspješno dodan",
        description: "Dokument je uspješno pohranjen u bazu podataka.",
      });
    },
    onError: (error: Error) => {
      setUploadError(error.message);
      toast({
        title: "Greška prilikom uploada",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutacija za brisanje dokumenta
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/company-documents/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Greška prilikom brisanja dokumenta");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-documents"] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      toast({
        title: "Dokument uspješno obrisan",
        description: "Dokument je uspješno obrisan iz baze podataka.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška prilikom brisanja",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Resetiraj formu nakon uploada
  const resetForm = () => {
    setFile(null);
    setName("");
    setDescription("");
    setUploadError("");
  };
  
  // Pretvori veličinu datoteke u čitljiv format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };
  
  // Upravljaj promjenom datoteke
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Automatski postavi naziv ako nije već postavljen
    if (selectedFile && !name) {
      // Ukloni ekstenziju
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }
  };
  
  // Upravljaj slanjem forme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Molimo odaberite datoteku");
      return;
    }
    if (!name) {
      setUploadError("Molimo unesite naziv dokumenta");
      return;
    }
    uploadMutation.mutate();
  };
  
  // Otvori dijalog za brisanje
  const openDeleteDialog = (id: number) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Prikaži odgovarajuću ikonu za tip datoteke
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={20} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet size={20} className="text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <FileImage size={20} className="text-purple-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive size={20} className="text-amber-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Učitavanje dokumenata...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-8">Greška prilikom dohvata dokumenata</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dokumenti tvrtke</h2>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <Upload size={18} />
              Dodaj dokument
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novi dokument</DialogTitle>
              <DialogDescription>
                Odaberite datoteku koju želite dodati i unesite detalje o dokumentu.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Datoteka</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Veličina: {formatFileSize(file.size)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Naziv dokumenta*</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis dokumenta</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Unesite kratki opis dokumenta (opcionalno)"
                  rows={3}
                />
              </div>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Odustani
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Učitavanje..." : "Spremi dokument"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {documents && documents.length === 0 ? (
        <div className="text-center p-10 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">Nema dostupnih dokumenata</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kliknite na "Dodaj dokument" za dodavanje novog dokumenta tvrtke.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Tip</TableHead>
              <TableHead>Naziv</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Veličina</TableHead>
              <TableHead>Datum uploada</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{getFileIcon(document.fileType)}</TableCell>
                <TableCell>{document.name}</TableCell>
                <TableCell>{document.description || "-"}</TableCell>
                <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                <TableCell>
                  {new Date(document.uploadedAt).toLocaleDateString('hr-HR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a href={document.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => openDeleteDialog(document.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ovaj dokument će biti trajno izbrisan. Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Odustani
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => documentToDelete && deleteMutation.mutate(documentToDelete)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Brisanje..." : "Izbriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}