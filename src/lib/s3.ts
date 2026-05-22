export async function uploadFileToS3(file: File, createUploadUrl: (fileName: string, fileType: string) => Promise<string>) {
  const uploadUrl = await createUploadUrl(file.name, file.type);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: file
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar arquivo para S3");
  }

  return uploadUrl.split("?")[0];
}
