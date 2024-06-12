import { Component, computed, input, signal } from "@angular/core";
import { Program } from "bcpl/program";

interface Frame {
    functionName: string;
    entries: string[];
}

@Component({
    selector: "stack-view",
    standalone: true,
    template: `
        <h4>Stack</h4>
        {{ program().environment.currentOffset }}
        <div class="frames">
        @for (frame of stackFrames(); track $index) {
            <div class="frame">
                <div>{{ frame.functionName }}</div>
                <div>
                @for (entry of frame.entries; track $index) {
                    <div>{{ entry }}</div>
                }
                </div>
            </div>
        }
        </div>
    `,
    styleUrl: './stack-view.component.css',
})
export class StackViewComponent {
    program = input.required<Program>();
    stackFrames = computed(() => this.transformFrames(this.program()));

    transformFrames(program: Program): Frame[] {
        const framePointer = program.environment.framePointer;
        const frameEnd = program.environment.currentOffset;
        return this.frames(framePointer, frameEnd, program);
    }

    private frames(framePointer: number, frameEnd: number, program: Program): Frame[] {
        type numbersWithOptCount = (number | [number, number])[];
        const entries = program.environment.stack.slice(framePointer, framePointer + frameEnd)
            .reduce<numbersWithOptCount>((acc, x) => {
                const last = acc.at(-1);
                if (last && Array.isArray(last) && last[0] === x) {
                    return [...acc.slice(0, -1), [last[0], last[1] + 1]];
                } else if (last === x && x === 0) {
                    return [...acc.slice(0, -1), [x, 2]];
                }
                return [...acc, x];
            }, [])
            .map(x => Array.isArray(x) ? x[0] + " x " + x[1] : x.toString());
        const functionName = this.findFunctionName(framePointer, program);
        const frame = { functionName, entries };
        if (framePointer !== 0) {
            return [...this.frames(program.environment.stack[framePointer], framePointer, program), frame];
        }
        return [frame];
    }

    private findFunctionName(framePointer: number, program: Program) {
        if (framePointer === 0) {
            return "root";
        }
        const entryInstruction = program.environment.stack[framePointer + 2];
        const nameChars = program.commands[entryInstruction].arguments.slice(2);
        return String.fromCharCode(...nameChars);
    }
}
