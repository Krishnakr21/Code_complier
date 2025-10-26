"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Trash2, Calendar, Code } from "lucide-react"

interface CodeFile {
  id: string
  name: string
  language: string
  code: string
  input: string
  createdAt: string
  updatedAt: string
}

interface FileManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: CodeFile[]
  onLoadFile: (file: CodeFile) => void
  onDeleteFile: (fileId: string) => void
}

const LANGUAGES = {
  javascript: { name: "JavaScript", color: "bg-yellow-100 text-yellow-800" },
  python: { name: "Python", color: "bg-blue-100 text-blue-800" },
  java: { name: "Java", color: "bg-red-100 text-red-800" },
  cpp: { name: "C++", color: "bg-purple-100 text-purple-800" },
}

export default function FileManager({ open, onOpenChange, files, onLoadFile, onDeleteFile }: FileManagerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            My Files ({files.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No files saved yet</p>
              <p className="text-sm">Create and save your first file to see it here</p>
            </div>
          ) : (
            files.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <Badge variant="outline" className={LANGUAGES[file.language as keyof typeof LANGUAGES]?.color}>
                          {LANGUAGES[file.language as keyof typeof LANGUAGES]?.name || file.language}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created: {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated: {new Date(file.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        {file.code.split("\n").length} lines • {file.code.length} characters
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button onClick={() => onLoadFile(file)} variant="outline" size="sm">
                        Load
                      </Button>
                      <Button
                        onClick={() => onDeleteFile(file.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
