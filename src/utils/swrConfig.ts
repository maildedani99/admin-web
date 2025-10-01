import { fetcher } from "./fetcher";

const swrConfig = {
  fetcher,
  onError: (error: any) => {
    console.error("SWR error:", error?.status, error?.message || error);
  },
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 30000,
  keepPreviousData: true,
};

export default swrConfig;
