import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "../lib/config";

export function useUploadFinancialFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Read file content as text
      const content = await file.text();
      
      console.log("Uploading to:", apiUrl("/api/parse-finances"));
      
      const response = await fetch(apiUrl("/api/parse-finances"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        mode: "cors",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        throw new Error(`Failed to upload file: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-reports"] });
    },
  });
}

export function useFinancialData() {
  return useQuery({
    queryKey: ["/api/financial-reports"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/financial-reports"), { mode: "cors" });
      if (!res.ok) throw new Error("Failed to fetch financial reports");
      return res.json();
    },
  });
}
