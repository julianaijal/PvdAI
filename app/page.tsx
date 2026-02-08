import { readFileSync } from "fs";
import { join } from "path";
import MainLayout from "./components/MainLayout/MainLayout";

function getToc() {
  const data = readFileSync(
    join(process.cwd(), "data", "toc.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export default function Home() {
  const toc = getToc();

  return <MainLayout toc={toc} />;
}
