import { readFileSync } from "fs";
import { join } from "path";
import MainLayout from "./components/MainLayout/MainLayout";

function getStructure() {
  const data = readFileSync(
    join(process.cwd(), "data", "structure.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export default function Home() {
  const structure = getStructure();

  return <MainLayout structure={structure} />;
}
