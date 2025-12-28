import { useEffect } from "react";
import RunwayDNA from "@/components/RunwayDNA";

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <RunwayDNA />;
};

export default Index;
