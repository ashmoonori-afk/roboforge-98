import { Window } from './ui/Window'
import { PromptBar } from './ui/PromptBar'
import { PartsBin } from './ui/PartsBin'
import { LogWindow } from './ui/LogWindow'
import { Viewport3D } from './ui/Viewport3D'
import { McuPanel } from './ui/McuPanel'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { PartsSuggestion } from './ui/PartsSuggestion'
import { Tooltip } from './ui/Tooltip'
import { Taskbar } from './ui/Taskbar'

export default function App() {
  return (
    <div className="rf-desktop">
      <Window title="Design Prompt" x={12} y={10} width={300} height={150}>
        <PromptBar />
      </Window>
      <Window title="Parts Bin" x={12} y={196} width={300} height={168}>
        <PartsBin />
      </Window>
      <Window title="Activity Log" x={12} y={400} width={300} height={150}>
        <LogWindow />
      </Window>

      <Window title="Robot Viewport — Mobility Demo" x={326} y={10} width={552} height={360}>
        <Viewport3D />
      </Window>
      <Window title="Microprocessor System" x={326} y={406} width={552} height={300}>
        <McuPanel />
      </Window>

      <Window title="Properties" x={892} y={10} width={316} height={280}>
        <PropertiesPanel />
      </Window>
      <Window title="Parts Suggestion" x={892} y={304} width={316} height={296}>
        <PartsSuggestion />
      </Window>

      <Tooltip />
      <Taskbar />
    </div>
  )
}
