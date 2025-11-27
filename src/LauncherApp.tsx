import { LauncherWindow } from "./components/LauncherWindow";
import "./styles.css";

function LauncherApp() {
  return (
    <div className="h-screen w-screen p-4 bg-transparent">
      <LauncherWindow />
    </div>
  );
}

export default LauncherApp;

