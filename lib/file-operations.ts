interface CodeFile {
  id?: string
  name: string
  language: string
  code: string
  input: string
}

export async function saveFile(fileData: CodeFile) {
  const response = await fetch("/api/files", {
    method: fileData.id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileData),
  })

  if (!response.ok) {
    throw new Error("Failed to save file")
  }

  return response.json()
}

export async function loadFile(fileId: string) {
  const response = await fetch(`/api/files/${fileId}`)

  if (!response.ok) {
    throw new Error("Failed to load file")
  }

  return response.json()
}

export async function deleteFile(fileId: string) {
  const response = await fetch(`/api/files/${fileId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete file")
  }

  return response.json()
}

export async function getUserFiles() {
  const response = await fetch("/api/files")

  if (!response.ok) {
    throw new Error("Failed to get user files")
  }

  return response.json()
}
