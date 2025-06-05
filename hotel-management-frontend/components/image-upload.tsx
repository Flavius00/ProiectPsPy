"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { uploadFile } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface ImageUploadProps {
  endpoint: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
}

export function ImageUpload({
  endpoint,
  onSuccess,
  onError,
  maxSize = 2, // Default 2MB
  allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `Please select a valid image file (${allowedTypes.join(", ")})`,
          variant: "destructive",
        })
        return
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `File size should not exceed ${maxSize}MB`,
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await uploadFile(endpoint, selectedFile)
      toast({
        title: "Upload successful",
        description: "Image has been uploaded successfully",
      })

      if (onSuccess) {
        onSuccess(result)
      }

      // Clear the selection after successful upload
      setSelectedFile(null)
      setPreview(null)
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })

      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="image-upload"
            type="file"
            accept={allowedTypes.join(",")}
            onChange={handleFileChange}
            className="flex-1"
          />
          {selectedFile && (
            <Button type="button" variant="outline" size="icon" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Allowed types: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}. Max size: {maxSize}MB
        </p>
      </div>

      {preview && (
        <div className="relative aspect-video rounded-md overflow-hidden border">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {selectedFile && (
        <Button type="button" onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      )}
    </div>
  )
}
