import { LauncherWindow } from "./components/LauncherWindow";
import "./styles.css";

function LauncherApp() {
  return (
    <div 
      className="h-screen w-screen" 
      style={{ 
        backgroundColor: 'transparent', 
        margin: 0, 
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <LauncherWindow />
    </div>
  );
}

export default LauncherApp;

