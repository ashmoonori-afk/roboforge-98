import { Panel } from './ui/Panel'
import { PromptBar } from './ui/PromptBar'
import { PartsBin } from './ui/PartsBin'
import { LogWindow } from './ui/LogWindow'
import { Viewport3D } from './ui/Viewport3D'
import { McuPanel } from './ui/McuPanel'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { PartsSuggestion } from './ui/PartsSuggestion'
import { AiDesign } from './ui/AiDesign'
import { Tooltip } from './ui/Tooltip'
import { Taskbar } from './ui/Taskbar'

// Responsive Windows-98 desktop: panels flow in a fluid grid (auto-fit columns),
// so the UI fills the screen and never clips, at any viewport size / zoom.
export default function App() {
  return (
    <div className="rf-desktop">
      <div className="rf-grid">
        <Panel title="Robot Viewport — Mobility Demo" span={2} tall>
          <Viewport3D />
        </Panel>
        <Panel title="Design Prompt">
          <PromptBar />
        </Panel>

        <Panel title="AI Design Assistant" tall>
          <AiDesign />
        </Panel>
        <Panel title="Microprocessor System" span={2}>
          <McuPanel />
        </Panel>

        <Panel title="Parts Suggestion">
          <PartsSuggestion />
        </Panel>
        <Panel title="Properties">
          <PropertiesPanel />
        </Panel>
        <Panel title="Parts Bin">
          <PartsBin />
        </Panel>
        <Panel title="Activity Log">
          <LogWindow />
        </Panel>
      </div>

      <Tooltip />
      <Taskbar />
    </div>
  )
}
